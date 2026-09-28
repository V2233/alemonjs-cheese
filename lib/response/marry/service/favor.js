import { db } from "../db/index.js";
import { findMarriageByUser, setFavor } from "./marriage.js";

//#region src/response/marry/service/favor.ts
/** 各动作的数值范围 [min, max]，负数为减 */
const FAVOR_RANGE = {
	kiss: [.2, .5],
	shy: [.4, .7],
	shopping: [.6, .9],
	cook: [-.5, 0],
	hit: [0, 0]
};
const CD_BASE = 20;
const CD_MAX = 120;
/**
* 执行一次亲密度操作
* @returns null 表示无婚姻
* @throws 'IN_CD' | 携带剩余秒数
*/
function applyFavor(userId, action) {
	const marriage = findMarriageByUser(userId);
	if (!marriage) return null;
	const now = Date.now();
	const cdRow = db.prepare("SELECT cd_until FROM marry_favor_cd WHERE user_id = ?").get(userId);
	if (cdRow && cdRow.cd_until > now) {
		const left = Math.ceil((cdRow.cd_until - now) / 1e3);
		throw Object.assign(/* @__PURE__ */ new Error("IN_CD"), { left });
	}
	let newFavor = marriage.favor;
	let delta = 0;
	if (action === "hit") {
		newFavor = 0;
		delta = -marriage.favor;
	} else {
		const [min, max] = FAVOR_RANGE[action];
		const rand = Number((Math.random() * (max - min) + min).toFixed(2));
		if (action === "cook") {
			delta = rand;
			newFavor = Math.max(0, marriage.favor + rand);
			delta = newFavor - marriage.favor;
		} else {
			delta = rand;
			newFavor = Number((marriage.favor + rand).toFixed(2));
		}
	}
	setFavor(marriage.marriageId, newFavor);
	let cdSeconds = CD_BASE + Math.floor(Math.random() * newFavor);
	if (cdSeconds > CD_MAX) cdSeconds = CD_MAX;
	db.prepare(`
    INSERT INTO marry_favor_cd (user_id, cd_until) VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET cd_until = excluded.cd_until
  `).run(userId, now + cdSeconds * 1e3);
	return {
		favor: newFavor,
		delta: Number(delta.toFixed(2)),
		action,
		cdSeconds
	};
}

//#endregion
export { applyFavor };