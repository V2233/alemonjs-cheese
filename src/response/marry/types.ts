// types.ts
export enum Gender {
  Female = 0,
  Male = 1,
  Other = 2,
}

export interface IMarriage {
  /** 婚姻ID，spouseA 与 spouseB 字典序拼接 */
  marriageId: string;
  /** 配偶A（userId 字典序较小） */
  spouseA: string;
  /** 配偶B（userId 字典序较大） */
  spouseB: string;
  /** 亲密度 */
  favor: number;
  /** 结婚时间戳 */
  createdAt: number;
  /** 更新时间戳 */
  updatedAt: number;
}

export interface IMarriageChild {
  id: number;
  marriageId: string;
  gender: Gender;
  name: string;
  createdAt: number;
}

/** 排行榜展示用 */
export interface IMarriageDisplay extends IMarriage {
  /** 当前用户在列表中的位置（用于分页定位） */
  rowIndex?: number;
  nickA?: string;
  nickB?: string;
  avatarA?: string;
  avatarB?: string;
}

/** 玩家档案 */
export interface IPlayerProfile {
  userId: string;
  gender: Gender;
}

/** 亲密度变更结果 */
export interface IFavorChangeResult {
  favor: number;
  delta: number;
}
