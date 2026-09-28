import { db } from '../db';
import type { IMarriage } from '../types';
import { makeMarriageId, orderPair } from '../utils/pair';

interface MarriageRow {
  marriage_id: string;
  spouse_a: string;
  spouse_b: string;
  favor: number;
  created_at: number;
  updated_at: number;
}

function rowToMarriage(row: MarriageRow): IMarriage {
  return {
    marriageId: row.marriage_id,
    spouseA: row.spouse_a,
    spouseB: row.spouse_b,
    favor: row.favor,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const stmtFindByUser = db.prepare<[string, string]>(`
  SELECT * FROM marry_marriages
  WHERE spouse_a = ? OR spouse_b = ?
  LIMIT 1
`);
const stmtFindById = db.prepare<[string]>('SELECT * FROM marry_marriages WHERE marriage_id = ?');
const stmtInsert = db.prepare(`
  INSERT INTO marry_marriages
    (marriage_id, spouse_a, spouse_b, favor, created_at, updated_at)
  VALUES (@marriage_id, @spouse_a, @spouse_b, 0, @now, @now)
`);
const stmtDelete = db.prepare('DELETE FROM marry_marriages WHERE marriage_id = ?');
const stmtUpdateFavor = db.prepare(
  'UPDATE marry_marriages SET favor = ?, updated_at = ? WHERE marriage_id = ?'
);
const stmtListAll = db.prepare('SELECT * FROM marry_marriages ORDER BY favor DESC');
const stmtCount = db.prepare('SELECT COUNT(*) as c FROM marry_marriages');

/** 查询某人的婚姻（最多一段），无则 null */
export function findMarriageByUser(userId: string): IMarriage | null {
  const row = stmtFindByUser.get(userId, userId) as MarriageRow | undefined;
  return row ? rowToMarriage(row) : null;
}

export function findMarriageById(marriageId: string): IMarriage | null {
  const row = stmtFindById.get(marriageId) as MarriageRow | undefined;
  return row ? rowToMarriage(row) : null;
}

/** 两人是否已有婚姻（防止重婚） */
export function hasMarriage(userId: string): boolean {
  return findMarriageByUser(userId) !== null;
}

/**
 * 结婚：两人必须都无配偶，否则抛错
 * @throws 'ALREADY_MARRIED_A' | 'ALREADY_MARRIED_B' | 'SAME_USER'
 */
export function createMarriage(userA: string, userB: string): IMarriage {
  if (userA === userB) throw new Error('SAME_USER');
  if (hasMarriage(userA)) throw new Error('ALREADY_MARRIED_A');
  if (hasMarriage(userB)) throw new Error('ALREADY_MARRIED_B');

  const [a, b] = orderPair(userA, userB);
  const now = Date.now();
  const marriageId = makeMarriageId(a, b);

  const tx = db.transaction(() => {
    stmtInsert.run({
      marriage_id: marriageId,
      spouse_a: a,
      spouse_b: b,
      now,
    });
  });
  tx();

  return findMarriageById(marriageId)!;
}

/** 离婚：删除婚姻，返回被删的那段（便于后续结算财产） */
export function divorce(userId: string): IMarriage | null {
  const marriage = findMarriageByUser(userId);
  if (!marriage) return null;

  const tx = db.transaction(() => {
    stmtDelete.run(marriage.marriageId);
  });
  tx();
  return marriage;
}

/** 抢婚：删掉原配，建立新婚姻（调用方负责概率判断） */
export function stealMarriage(
  newUser: string,
  targetUser: string,
  oldMarriageId: string
): IMarriage {
  const [a, b] = orderPair(newUser, targetUser);
  const now = Date.now();
  const marriageId = makeMarriageId(a, b);

  const tx = db.transaction(() => {
    stmtDelete.run(oldMarriageId);
    stmtInsert.run({ marriage_id: marriageId, spouse_a: a, spouse_b: b, now });
  });
  tx();

  return findMarriageById(marriageId)!;
}

/** 直接更新亲密度（内部用） */
export function setFavor(marriageId: string, favor: number): void {
  stmtUpdateFavor.run(Math.max(0, favor), Date.now(), marriageId);
}

/** 按亲密度降序全量列表（用于排行榜分页） */
export function listMarriagesByFavor(): IMarriage[] {
  return (stmtListAll.all() as MarriageRow[]).map(rowToMarriage);
}

export function countMarriages(): number {
  return (stmtCount.get() as { c: number }).c;
}
