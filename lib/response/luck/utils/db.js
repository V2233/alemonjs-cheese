import { pluginInfo } from "../../../package.js";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import Database from "better-sqlite3";

//#region src/response/luck/utils/db.ts
const dbDir = join(pluginInfo.DATA_PATH, "luck-data");
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
const dbPath = join(dbDir, "luckDB.sqlite");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");
db.exec(`--sql
  CREATE TABLE IF NOT EXISTS luck_users (
    user_id     TEXT PRIMARY KEY,
    debris      INTEGER NOT NULL DEFAULT 0,
    is_tested   INTEGER NOT NULL DEFAULT 0,
    curse_nums  INTEGER DEFAULT 0,
    bless_nums  INTEGER DEFAULT 0,
    updated_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS luck_history (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   TEXT NOT NULL,
    luck_id   INTEGER NOT NULL,
    ts        INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES luck_users(user_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_luck_history_user ON luck_history(user_id, ts);
  CREATE INDEX IF NOT EXISTS idx_luck_users_debris ON luck_users(debris DESC);
`);
const stmtGetUser = db.prepare(`--sql 
  SELECT * FROM luck_users WHERE user_id = ?
`);
const stmtGetHistory = db.prepare(`--sql 
  SELECT luck_id as id, ts FROM luck_history WHERE user_id = ? ORDER BY ts ASC  
`);
const stmtUpsertUser = db.prepare(`--sql
  INSERT INTO luck_users (user_id, debris, is_tested, curse_nums, bless_nums, updated_at)
  VALUES (@user_id, @debris, @is_tested, @curse_nums, @bless_nums, @updated_at)
  ON CONFLICT(user_id) DO UPDATE SET
    debris = @debris,
    is_tested = @is_tested,
    curse_nums = @curse_nums,
    bless_nums = @bless_nums,
    updated_at = @updated_at
`);
const stmtInsertHistory = db.prepare(`--sql
  INSERT INTO luck_history (user_id, luck_id, ts) VALUES (?, ?, ?)
`);
const stmtDeleteHistoryBefore = db.prepare(`--sql
  DELETE FROM luck_history
  WHERE user_id = ? AND id NOT IN (
    SELECT id FROM luck_history WHERE user_id = ? ORDER BY ts DESC LIMIT ?
  )
`);
const stmtResetAllTested = db.prepare(`--sql
  UPDATE luck_users SET is_tested = 0, updated_at = ?  
`);
const stmtGetAllUserIds = db.prepare(`--sql
  SELECT user_id FROM luck_users
`);
const stmtGetRankInGroup = db.prepare(`--sql
  SELECT user_id as userId, debris
  FROM luck_users
  WHERE user_id IN (SELECT value FROM json_each(?))
  ORDER BY debris DESC
`);
/** 读取单个用户完整数据 */
function getUser(userId) {
	const row = stmtGetUser.get(userId);
	if (!row) return null;
	const history = stmtGetHistory.all(userId);
	return {
		userId: row.user_id,
		debris: row.debris,
		isTested: !!row.is_tested,
		curseNums: row.curse_nums ?? 0,
		blessNums: row.bless_nums ?? 0,
		list: history
	};
}
/** 确保用户存在（不存在则创建空记录） */
function ensureUser(userId) {
	let user = getUser(userId);
	if (!user) {
		stmtUpsertUser.run({
			user_id: userId,
			debris: 0,
			is_tested: 0,
			curse_nums: 0,
			bless_nums: 0,
			updated_at: Date.now()
		});
		user = {
			userId,
			debris: 0,
			isTested: false,
			curseNums: 0,
			blessNums: 0,
			list: []
		};
	}
	return user;
}
/** 保存用户状态（不包含历史 list） */
function saveUser(user) {
	stmtUpsertUser.run({
		user_id: user.userId,
		debris: user.debris,
		is_tested: user.isTested ? 1 : 0,
		curse_nums: user.curseNums,
		bless_nums: user.blessNums,
		updated_at: Date.now()
	});
}
/** 添加一条历史记录，并裁剪至最多 keep 条 */
function addHistory(userId, luckId, ts, keep = 7) {
	db.transaction(() => {
		stmtInsertHistory.run(userId, luckId, ts);
		stmtDeleteHistoryBefore.run(userId, userId, keep);
	})();
}
/** 替换最后一条历史记录 */
function replaceLastHistory(userId, luckId, ts) {
	const last = db.prepare("SELECT id FROM luck_history WHERE user_id = ? ORDER BY ts DESC LIMIT 1").get(userId);
	if (last) db.prepare("UPDATE luck_history SET luck_id = ?, ts = ? WHERE id = ?").run(luckId, ts, last.id);
	else stmtInsertHistory.run(userId, luckId, ts);
}
/** 每日刷新：重置所有用户的 isTested */
function resetAllTested() {
	stmtResetAllTested.run(Date.now());
}
/** 获取全部用户 ID */
function getAllUserIds() {
	return stmtGetAllUserIds.all().map((r) => r.user_id);
}
/** 获取群内用户排行榜 */
function getGroupRank(userIds) {
	if (userIds.length === 0) return [];
	return stmtGetRankInGroup.all(JSON.stringify(userIds));
}

//#endregion
export { addHistory, db, ensureUser, getAllUserIds, getGroupRank, getUser, replaceLastHistory, resetAllTested, saveUser };