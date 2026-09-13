export interface IPlayer {
  score: number;
  playerId?: string;
}

export interface IGroupPlayers {
  [key: string]: IPlayer;
}

export interface IGroup {
  id: number;
  ans: number;
  degree: number;
  cd: number;
  /**
   * - `idle`: 没有进行中的题目（初始、超时结束、手动结束后）
   * - `questioning`: 题目已发出，等待玩家作答
   * - `answered`: 本题已被抢答，正在等待 interval 后发下一题
   */
  status: 'idle' | 'questioning' | 'answered';
  players: IGroupPlayers;
}

export interface ICache {
  [key: string]: IGroup;
}

export interface IGengItem {
  pic: string;
  title: string;
  id: number;
}
