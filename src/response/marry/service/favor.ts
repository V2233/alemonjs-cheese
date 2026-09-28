import { db } from '../db';
import { findMarriageByUser, setFavor } from './marriage';

export type FavorAction = 'kiss' | 'shy' | 'shopping' | 'cook' | 'hit';

/** 各动作的数值范围 [min, max]，负数为减 */
const FAVOR_RANGE: Record<FavorAction, [number, number]> = {
  kiss: [0.2, 0.5],
  shy: [0.4, 0.7],
  shopping: [0.6, 0.9],
  cook: [-0.5, 0], // 原代码是 0~0.5 减少
  hit: [0, 0], // 直接清 0
};

const CD_BASE = 20;
const CD_MAX = 120;

export interface FavorResult {
  favor: number;
  delta: number;
  action: FavorAction;
  cdSeconds: number;
}

/**
 * 执行一次亲密度操作
 * @returns null 表示无婚姻
 * @throws 'IN_CD' | 携带剩余秒数
 */
export function applyFavor(userId: string, action: FavorAction): FavorResult | null {
  const marriage = findMarriageByUser(userId);
  if (!marriage) return null;

  // CD 检查
  const now = Date.now();
  const cdRow = db.prepare('SELECT cd_until FROM marry_favor_cd WHERE user_id = ?').get(userId) as
    | { cd_until: number }
    | undefined;
  if (cdRow && cdRow.cd_until > now) {
    const left = Math.ceil((cdRow.cd_until - now) / 1000);
    throw Object.assign(new Error('IN_CD'), { left });
  }

  // 计算新亲密度
  let newFavor = marriage.favor;
  let delta = 0;

  if (action === 'hit') {
    newFavor = 0;
    delta = -marriage.favor;
  } else {
    const [min, max] = FAVOR_RANGE[action];
    const rand = Number((Math.random() * (max - min) + min).toFixed(2));
    if (action === 'cook') {
      // cook 是减少，rand 为负，直接叠加，但最小值 0
      delta = rand;
      newFavor = Math.max(0, marriage.favor + rand);
      delta = newFavor - marriage.favor;
    } else {
      delta = rand;
      newFavor = Number((marriage.favor + rand).toFixed(2));
    }
  }

  setFavor(marriage.marriageId, newFavor);

  // 写 CD
  let cdSeconds = CD_BASE + Math.floor(Math.random() * newFavor);
  if (cdSeconds > CD_MAX) cdSeconds = CD_MAX;

  db.prepare(`
    INSERT INTO marry_favor_cd (user_id, cd_until) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET cd_until = excluded.cd_until
  `).run(userId, now + cdSeconds * 1000);

  return {
    favor: newFavor,
    delta: Number(delta.toFixed(2)),
    action,
    cdSeconds,
  };
}
