import { pluginInfo } from "../../../package.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

//#region src/response/meme/utils/db.ts
const dbDir = join(pluginInfo.DATA_PATH, "meme-data");
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
const dbPath = join(dbDir, "memeDB.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
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
const stmtGetGroup = db.prepare("SELECT * FROM meme_groups WHERE guild_id = ?");
const stmtGetPlayers = db.prepare("SELECT user_id, score FROM meme_players WHERE guild_id = ?");
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
const stmtDeletePlayer = db.prepare("DELETE FROM meme_players WHERE guild_id = ? AND user_id = ?");
const stmtGetPlayer = db.prepare("SELECT user_id, score FROM meme_players WHERE guild_id = ? AND user_id = ?");
/** 读取整个群对象（含 players），不存在返回 null */
function getGroup(guildId) {
	const row = stmtGetGroup.get(guildId);
	if (!row) return null;
	const playerRows = stmtGetPlayers.all(guildId);
	const players = {};
	playerRows.forEach((p) => {
		players[p.user_id] = {
			score: p.score,
			playerId: p.user_id
		};
	});
	return {
		id: row.qs_id,
		ans: row.ans,
		degree: row.degree,
		cd: row.cd,
		status: row.status,
		players
	};
}
/** 确保群存在（不存在则按 cfg 默认值创建） */
function ensureGroup(guildId, defaults = {}) {
	let group = getGroup(guildId);
	if (!group) {
		group = {
			id: 0,
			ans: 0,
			degree: defaults.degree ?? 6,
			cd: defaults.cd ?? 60,
			status: "idle",
			players: {}
		};
		saveGroup(guildId, group);
	}
	return group;
}
/** 保存群配置（不含 players） */
function saveGroup(guildId, group) {
	stmtUpsertGroup.run({
		guild_id: guildId,
		qs_id: group.id,
		ans: group.ans,
		degree: group.degree,
		cd: group.cd,
		status: group.status,
		updated_at: Date.now()
	});
}
/** 保存单条群配置字段（轻量写，避免整表 upsert） */
function updateGroupField(guildId, field, value) {
	const col = {
		id: "qs_id",
		ans: "ans",
		degree: "degree",
		cd: "cd",
		status: "status"
	}[field];
	db.prepare(`UPDATE meme_groups SET ${col} = ?, updated_at = ? WHERE guild_id = ?`).run(value, Date.now(), guildId);
}
/** 读取单个玩家 */
function getPlayer(guildId, userId) {
	const row = stmtGetPlayer.get(guildId, userId);
	return row ? {
		score: row.score,
		playerId: row.user_id
	} : null;
}
/** 写入/更新玩家分数 */
function savePlayer(guildId, userId, score) {
	stmtUpsertPlayer.run(guildId, userId, score, Date.now());
}
/** 删除玩家 */
function deletePlayer(guildId, userId) {
	stmtDeletePlayer.run(guildId, userId);
}
/** 获取群内排行榜（按分数降序） */
function getGroupScoreRank(guildId) {
	return db.prepare("SELECT user_id as userId, score FROM meme_players WHERE guild_id = ? ORDER BY score DESC").all(guildId);
}
/** 兼容旧 JSON 迁移：按 IGroup 批量写入 */
function importGroup(guildId, group) {
	db.transaction(() => {
		saveGroup(guildId, group);
		for (const [userId, p] of Object.entries(group.players || {})) savePlayer(guildId, userId, p.score ?? 0);
	})();
}

//#endregion
export { db, deletePlayer, ensureGroup, getGroup, getGroupScoreRank, getPlayer, importGroup, saveGroup, savePlayer, updateGroupField };