import type { IGroup, IGroupPlayers, IPlayer } from '@src/types/meme';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

import { pluginInfo } from '../../../package';

const dbDir = join(pluginInfo.DATA_PATH, 'meme-data');
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

const dbPath = join(dbDir, 'memeDB.sqlite');
export const db = new Database(dbPath);

// 开启 WAL 模式提升并发性能
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`--sql
  CREATE TABLE IF NOT EXISTS meme_groups (
    guild_id    TEXT PRIMARY KEY,
    qs_id       INTEGER NOT NULL DEFAULT 0,
    ans         INTEGER NOT NULL DEFAULT 0,
    degree      INTEGER NOT NULL DEFAULT 6,
    cd          INTEGER NOT NULL DEFAULT 60,
    status      TEXT    NOT NULL DEFAULT 'idle',
    updated_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meme_players (
    guild_id    TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    score       INTEGER NOT NULL DEFAULT 0,
    updated_at  INTEGER NOT NULL,
    PRIMARY KEY (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES meme_groups(guild_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_meme_players_guild_score
    ON meme_players(guild_id, score DESC);
`);

// ============ 类型定义 ============
interface GroupRow {
  guild_id: string;
  qs_id: number;
  ans: number;
  degree: number;
  cd: number;
  status: string;
  updated_at: number;
}

interface PlayerRow {
  guild_id: string;
  user_id: string;
  score: number;
}

// ============ 预处理语句 ============
const stmtGetGroup = db.prepare<[string]>('SELECT * FROM meme_groups WHERE guild_id = ?');
const stmtGetPlayers = db.prepare<[string]>(
  'SELECT user_id, score FROM meme_players WHERE guild_id = ?'
);
const stmtUpsertGroup = db.prepare(`--sql
  INSERT INTO meme_groups (guild_id, qs_id, ans, degree, cd, status, updated_at)
  VALUES (@guild_id, @qs_id, @ans, @degree, @cd, @status, @updated_at)
  ON CONFLICT(guild_id) DO UPDATE SET
    qs_id = @qs_id,
    ans = @ans,
    degree = @degree,
    cd = @cd,
    status = @status,
    updated_at = @updated_at
`);
const stmtUpsertPlayer = db.prepare(`--sql
  INSERT INTO meme_players (guild_id, user_id, score, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(guild_id, user_id) DO UPDATE SET
    score = excluded.score,
    updated_at = excluded.updated_at
`);
const stmtDeletePlayer = db.prepare('DELETE FROM meme_players WHERE guild_id = ? AND user_id = ?');
const stmtGetPlayer = db.prepare<[string, string]>(
  'SELECT user_id, score FROM meme_players WHERE guild_id = ? AND user_id = ?'
);

// ============ 业务方法 ============

/** 读取整个群对象（含 players），不存在返回 null */
export function getGroup(guildId: string): IGroup | null {
  const row = stmtGetGroup.get(guildId) as GroupRow | undefined;
  if (!row) return null;

  const playerRows = stmtGetPlayers.all(guildId) as PlayerRow[];
  const players: IGroupPlayers = {};
  playerRows.forEach(p => {
    players[p.user_id] = { score: p.score, playerId: p.user_id };
  });

  return {
    id: row.qs_id,
    ans: row.ans,
    degree: row.degree,
    cd: row.cd,
    status: row.status as IGroup['status'],
    players,
  };
}

/** 确保群存在（不存在则按 cfg 默认值创建） */
export function ensureGroup(
  guildId: string,
  defaults: { degree?: number; cd?: number } = {}
): IGroup {
  let group = getGroup(guildId);
  if (!group) {
    group = {
      id: 0,
      ans: 0,
      degree: defaults.degree ?? 6,
      cd: defaults.cd ?? 60,
      status: 'idle',
      players: {},
    };
    saveGroup(guildId, group);
  }
  return group;
}

/** 保存群配置（不含 players） */
export function saveGroup(guildId: string, group: IGroup): void {
  stmtUpsertGroup.run({
    guild_id: guildId,
    qs_id: group.id,
    ans: group.ans,
    degree: group.degree,
    cd: group.cd,
    status: group.status,
    updated_at: Date.now(),
  });
}

/** 保存单条群配置字段（轻量写，避免整表 upsert） */
export function updateGroupField<T extends 'id' | 'ans' | 'degree' | 'cd' | 'status'>(
  guildId: string,
  field: T,
  value: IGroup[T]
): void {
  const colMap: Record<string, string> = {
    id: 'qs_id',
    ans: 'ans',
    degree: 'degree',
    cd: 'cd',
    status: 'status',
  };
  const col = colMap[field];
  db.prepare(`UPDATE meme_groups SET ${col} = ?, updated_at = ? WHERE guild_id = ?`).run(
    value as any,
    Date.now(),
    guildId
  );
}

/** 读取单个玩家 */
export function getPlayer(guildId: string, userId: string): IPlayer | null {
  const row = stmtGetPlayer.get(guildId, userId) as PlayerRow | undefined;
  return row ? { score: row.score, playerId: row.user_id } : null;
}

/** 写入/更新玩家分数 */
export function savePlayer(guildId: string, userId: string, score: number): void {
  stmtUpsertPlayer.run(guildId, userId, score, Date.now());
}

/** 删除玩家 */
export function deletePlayer(guildId: string, userId: string): void {
  stmtDeletePlayer.run(guildId, userId);
}

/** 获取群内排行榜（按分数降序） */
export function getGroupScoreRank(guildId: string): { userId: string; score: number }[] {
  return db
    .prepare(
      'SELECT user_id as userId, score FROM meme_players WHERE guild_id = ? ORDER BY score DESC'
    )
    .all(guildId) as { userId: string; score: number }[];
}

/** 兼容旧 JSON 迁移：按 IGroup 批量写入 */
export function importGroup(guildId: string, group: IGroup): void {
  const tx = db.transaction(() => {
    saveGroup(guildId, group);
    for (const [userId, p] of Object.entries(group.players || {})) {
      savePlayer(guildId, userId, p.score ?? 0);
    }
  });
  tx();
}
