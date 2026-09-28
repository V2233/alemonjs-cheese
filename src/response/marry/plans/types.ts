export enum Gender {
  Female = 0,
  Male = 1,
  Other = 2,
}

export interface IMarriageChild {
  gender: Gender;
  name: string;
}

export interface IMarriage {
  /** 男方id，TODO: 未来移除 */
  man: string;
  /** 女方id, TODO: 未来移除 */
  woman: string;
  /** 亲密值或恩爱值，可通过一定渠道间接兑换为共同财产*/
  favor: number;
  /** 孩子 */
  childs?: IMarriageChild[];
}

/** 用于亲密排行图展示 */
export interface IMarriageDisplay extends IMarriage {
  id?: number;
  maleNick?: string;
  femaleNick?: string;
  maleAvatar?: string;
  femaleAvatar?: string;
}

export interface IPlayerPropertyAsset {
  /** 名称 */
  name: string;
  /** 数量 */
  count: number;
  /** 价格 */
  price: number;
}

export interface IPlayerProperty {
  /** 个人存款 */
  deposit: number;
  /** 可估值的个人物品 */
  assets: IPlayerPropertyAsset[];
}

export interface IPlayerMaritalHistory {
  /** 结婚时间戳 */
  marriedAt: number;
  /** 离婚时间 */
  divorceAt: number;
  /** 净得财产价值（可正可负）*/
  netting: number;
}

export interface IPlayer {
  /** 登记编号，使用男女UserId拼接，未定义则单身 */
  marriageId?: string;
  /** 财产 */
  property: IPlayerProperty;
  /** 婚前财产总价值 */
  premaritalWealth: number;
  /** 性别（虚拟） */
  gender: Gender;
  /** 婚姻史 */
  maritalHistory: IPlayerMaritalHistory;
}

export interface IPlayersData {
  /** 夫妻共同数据 */
  marriages: IMarriage[];
  /** 玩家数据 uid -> player */
  players: Record<string, IPlayer>;
}
