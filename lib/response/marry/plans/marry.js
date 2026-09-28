import { pluginInfo } from "../../../package.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

//#region src/response/marry/plans/marry.ts
const DB_PATH = join(pluginInfo.DATA_PATH, "marryDB.json");
var MarriageDB = class {
	marriages = /* @__PURE__ */ new Map();
	players = /* @__PURE__ */ new Map();
	uidToMarriageId = /* @__PURE__ */ new Map();
	constructor() {
		this.load();
	}
	/** 初始化加载 */
	load() {
		if (!existsSync(DB_PATH)) {
			this.save();
			return;
		}
		try {
			const raw = readFileSync(DB_PATH, "utf-8");
			const json = JSON.parse(raw);
			json.marriages.forEach((m) => {
				this.marriages.set(m.id, m);
				this.uidToMarriageId.set(m.husband, m.id);
				this.uidToMarriageId.set(m.wife, m.id);
			});
			Object.values(json.players).forEach((p) => this.players.set(p.uid, p));
		} catch (e) {
			console.error("加载婚姻数据库失败", e);
		}
	}
	/** 持久化保存 */
	save() {
		const data = {
			marriages: Array.from(this.marriages.values()),
			players: Object.fromEntries(this.players)
		};
		writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
	}
	/** 获取玩家婚姻状态 (O(1)) */
	getMarriageByUid(uid) {
		const mid = this.uidToMarriageId.get(uid);
		return mid ? this.marriages.get(mid) || null : null;
	}
	/** 获取配偶ID */
	getSpouseUid(uid) {
		const m = this.getMarriageByUid(uid);
		if (!m) return null;
		return m.husband === uid ? m.wife : m.husband;
	}
	/** 获取所有婚姻列表 (用于排行) */
	getAllMarriages() {
		return Array.from(this.marriages.values()).filter((m) => m.status === "married");
	}
	/** 更新或创建婚姻 */
	setMarriage(marriage) {
		this.marriages.set(marriage.id, marriage);
		this.uidToMarriageId.set(marriage.husband, marriage.id);
		this.uidToMarriageId.set(marriage.wife, marriage.id);
		this.save();
	}
	/** 删除婚姻 (离婚) */
	removeMarriage(mid) {
		const m = this.marriages.get(mid);
		if (m) {
			this.marriages.delete(mid);
			this.uidToMarriageId.delete(m.husband);
			this.uidToMarriageId.delete(m.wife);
			this.save();
		}
	}
	/** 获取或创建玩家 */
	getPlayer(uid, name, gender) {
		if (!this.players.has(uid)) {
			const p = {
				uid,
				name,
				gender,
				personalFund: 0
			};
			this.players.set(uid, p);
			this.save();
		}
		return this.players.get(uid);
	}
};
const db = new MarriageDB();
const products = [
	{
		name: "stock",
		zh: "股票",
		icon: "💰",
		limit: 100,
		price: 33
	},
	{
		name: "house",
		zh: "房产",
		icon: "🏠",
		limit: 2,
		price: 2e6
	},
	{
		name: "sportsCar",
		zh: "跑车",
		icon: "🏎️",
		limit: 2,
		price: 1e6
	},
	{
		name: "car",
		zh: "汽车",
		icon: "🚕",
		limit: 2,
		price: 15e4
	},
	{
		name: "bicycle",
		zh: "小电驴",
		icon: "🛵",
		limit: 5,
		price: 2e3
	},
	{
		name: "eBike",
		zh: "自行车",
		icon: "🚲",
		limit: 5,
		price: 500
	},
	{
		name: "notebook",
		zh: "笔记本",
		icon: "💻",
		limit: 5,
		price: 6e3
	},
	{
		name: "docterCertificate",
		zh: "从医资格证",
		icon: "🏥",
		limit: 1,
		price: 1e4
	},
	{
		name: "takeOut",
		zh: "点外卖",
		icon: "🍟",
		limit: 4,
		price: 10
	},
	{
		name: "parenting",
		zh: "育儿",
		icon: "👼🏻",
		limit: 1,
		price: 10
	}
];
const professions = [
	{
		name: "delivery",
		zh: "外卖骑手",
		wage: 5,
		daylimit: 60,
		means: ["eBike", "bicycle"]
	},
	{
		name: "driver",
		zh: "出租车司机",
		wage: 15,
		daylimit: 30,
		means: ["car", "sportsCar"]
	},
	{
		name: "programmer",
		zh: "程序员",
		wage: 250,
		daylimit: 2,
		means: ["notebook"]
	},
	{
		name: "docter",
		zh: "医生",
		wage: 30,
		daylimit: 20,
		means: ["docterCertificate"]
	}
];

//#endregion
export { MarriageDB, db, products, professions };