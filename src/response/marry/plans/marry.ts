// marry.ts

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { pluginInfo } from '../../../package'; // 假设这是你的插件信息路径

// --- 1. 数据类型定义 ---

/** 婚姻状态 */
export type MarriageStatus = 'married' | 'divorced';

/** 婚姻/情侣关系实体 */
export interface IMarriage {
  /** 唯一ID，可以用 man-woman 拼接 */
  id: string;
  husband: string;
  wife: string;
  status: MarriageStatus;
  favor: number; // 亲密值
  sharedFund: number; // 共同财产（离婚时分割这个）
  groupId: number; // 结婚所在群
  marriedAt: number; // 结婚时间戳
  divorcedAt?: number;
  childs?: [];
}

/** 玩家个人数据 */
export interface IPlayer {
  uid: string;
  name: string; // 缓存昵称，防止退群后查不到
  personalFund: number; // 个人私房钱
  gender: 'male' | 'female';

  inventory: Record<string, number>; // 背包：物品ID -> 数量
  profession?: string; // 当前职业名，对应 IProfession.name
  lastWorkDate?: string; // 上次工作日期，用于计算每日工作次数，格式 'YYYY-MM-DD'
  workCountToday: number; // 今日已工作次数
}

/** 数据库存储结构 */
interface DBSchema {
  marriages: IMarriage[];
  players: Record<string, IPlayer>; // uid -> IPlayer
}

// --- 2. 数据库管理类 (核心优化) ---

const DB_PATH = join(pluginInfo.DATA_PATH, 'marryDB.json');

export class MarriageDB {
  private marriages: Map<string, IMarriage> = new Map(); // id -> Marriage
  private players: Map<string, IPlayer> = new Map(); // uid -> IPlayer
  private uidToMarriageId: Map<string, string> = new Map(); // uid -> marriageId (O(1) 查询核心)

  constructor() {
    this.load();
  }

  /** 初始化加载 */
  private load() {
    if (!existsSync(DB_PATH)) {
      this.save(); // 创建空文件
      return;
    }
    try {
      const raw = readFileSync(DB_PATH, 'utf-8');
      const json: DBSchema = JSON.parse(raw);

      // 重建索引
      json.marriages.forEach(m => {
        this.marriages.set(m.id, m);
        this.uidToMarriageId.set(m.husband, m.id);
        this.uidToMarriageId.set(m.wife, m.id);
      });
      Object.values(json.players).forEach(p => this.players.set(p.uid, p));
    } catch (e) {
      console.error('加载婚姻数据库失败', e);
    }
  }

  /** 持久化保存 */
  save() {
    const data: DBSchema = {
      marriages: Array.from(this.marriages.values()),
      players: Object.fromEntries(this.players),
    };
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  }

  // --- 查询接口 (性能优化点) ---

  /** 获取玩家婚姻状态 (O(1)) */
  getMarriageByUid(uid: string): IMarriage | null {
    const mid = this.uidToMarriageId.get(uid);
    return mid ? this.marriages.get(mid) || null : null;
  }

  /** 获取配偶ID */
  getSpouseUid(uid: string): string | null {
    const m = this.getMarriageByUid(uid);
    if (!m) return null;
    return m.husband === uid ? m.wife : m.husband;
  }

  /** 获取所有婚姻列表 (用于排行) */
  getAllMarriages(): IMarriage[] {
    return Array.from(this.marriages.values()).filter(m => m.status === 'married');
  }

  /** 更新或创建婚姻 */
  setMarriage(marriage: IMarriage) {
    this.marriages.set(marriage.id, marriage);
    this.uidToMarriageId.set(marriage.husband, marriage.id);
    this.uidToMarriageId.set(marriage.wife, marriage.id);
    this.save();
  }

  /** 删除婚姻 (离婚) */
  removeMarriage(mid: string) {
    const m = this.marriages.get(mid);
    if (m) {
      this.marriages.delete(mid);
      this.uidToMarriageId.delete(m.husband);
      this.uidToMarriageId.delete(m.wife);
      this.save();
    }
  }

  /** 获取或创建玩家 */
  getPlayer(uid: string, name: string, gender: 'male' | 'female'): IPlayer {
    if (!this.players.has(uid)) {
      //@ts-ignore
      const p: IPlayer = { uid, name, gender, personalFund: 0 };
      this.players.set(uid, p);
      this.save();
    }
    return this.players.get(uid)!;
  }
}

// 导出单例
export const db = new MarriageDB();

export interface IMarriageData {
  /** 夫妻共同数据 */
  marriages: IMarriage[];
  /** 玩家数据 uid -> player */
  players: Record<string, IPlayer>;
  store: {
    products: IMarriageDataStoreProduct[];
  };
}

export interface IMarriageDataStoreProduct {
  /** 名称 */
  name: string;
  /** 中文名 */
  zh: string;
  /** 图标 */
  icon: string;
  /** 限购量 */
  limit: number;
  /** 价格 */
  price: number;
  /** 是否可变动 */
  movable?: boolean;
  /** 每次使用折旧率，剩余价值 = 购买时价格 - 已使用次数 × 折旧率 */
  depreciationRate?: number;
}

export type PlayersDataStoreGoods = [];

const reg = /我要赚钱|去工作|老婆买买|老婆羞羞(概率生娃一次)|个人资料(.*)/;

const products = [
  {
    name: 'stock',
    zh: '股票',
    icon: '💰',
    limit: 100,
    price: 33,
  },
  {
    name: 'house',
    zh: '房产',
    icon: '🏠',
    limit: 2,
    price: 2000000,
  },
  {
    name: 'sportsCar',
    zh: '跑车',
    icon: '🏎️',
    limit: 2,
    price: 1000000,
  },
  {
    name: 'car',
    zh: '汽车',
    icon: '🚕',
    limit: 2,
    price: 150000,
  },
  {
    name: 'bicycle',
    zh: '小电驴',
    icon: '🛵',
    limit: 5,
    price: 2000,
  },
  {
    name: 'eBike',
    zh: '自行车',
    icon: '🚲',
    limit: 5,
    price: 500,
  },
  {
    name: 'notebook',
    zh: '笔记本',
    icon: '💻',
    limit: 5,
    price: 6000,
  },
  {
    name: 'docterCertificate',
    zh: '从医资格证',
    icon: '🏥',
    limit: 1,
    price: 10000,
  },
  {
    name: 'takeOut',
    zh: '点外卖',
    icon: '🍟',
    limit: 4,
    price: 10,
  },
  // 需要childs.length > 0，可提升亲密值加成
  {
    name: 'parenting',
    zh: '育儿',
    icon: '👼🏻',
    limit: 1,
    price: 10,
  },
] as const satisfies IMarriageDataStoreProduct[];

interface IProfession {
  /** 职业名 */
  name: string;
  zh: string;
  /**
   * 每次工作报酬 \
   * 为了减少计时器状态泛滥，发送1次`去工作`指令则可获得 wage 薪酬
   */
  wage: number;
  /** 该岗位对应的每日可出勤次数，即单日最多可获得报酬的次数 */
  daylimit: number;
  /** 已累计出勤的次数 TODO: 应计入玩家数据 */
  attendances?: number;
  /** 必须的生产资料 */
  means: (typeof products)[number]['name'][];
}

const professions = [
  {
    name: 'delivery',
    zh: '外卖骑手',
    wage: 5,
    daylimit: 60,
    means: ['eBike', 'bicycle'],
  },
  {
    name: 'driver',
    zh: '出租车司机',
    wage: 15,
    daylimit: 30,
    means: ['car', 'sportsCar'],
  },
  {
    name: 'programmer',
    zh: '程序员',
    wage: 250,
    daylimit: 2,
    means: ['notebook'],
  },
  {
    name: 'docter',
    zh: '医生',
    wage: 30,
    daylimit: 20,
    means: ['docterCertificate'],
  },
] satisfies IProfession[];

export { products, professions };
