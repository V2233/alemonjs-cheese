import { ensureUser, getAllUserIds, getGroupRank } from "../response/luck/utils/db.js";
import { fortuneList, lots } from "../response/luck/utils/fortune.js";
import LuckHandler from "../response/luck/utils/handler.js";
import { array, dataQuery, emptyInput, numberSchema, record, requireGroup, stringSchema, strings } from "./shared.js";

// src/expose/luck.ts
const luckSchema = record({
	...strings("summary", "sign", "unsign", "luckyStar", "starColor"),
	stars: numberSchema,
	debris: numberSchema
});
const historyItemSchema = record({
	id: numberSchema,
	ts: numberSchema,
	summary: stringSchema,
	stars: numberSchema
});
const luckActions = {
	start_luck: dataQuery("发起今日运势（等同于用户发送“今日运势/运气”），会抽签并写库；返回今日运势结构化结果", emptyInput, luckSchema, async (_input, user) => {
		const u = ensureUser(user.userId);
		const last = u.list[u.list.length - 1];
		const luck = last ? fortuneList[last.id] : fortuneList[0];
		const starCount = luck.stars;
		LuckHandler.luckySummary(starCount, lots);
		return {
			summary: luck.summary,
			sign: luck.sign,
			unsign: luck.unsign,
			stars: starCount,
			luckyStar: LuckHandler.luckyStar(starCount),
			starColor: LuckHandler.starsColor(starCount),
			debris: u.debris
		};
	}, "write"),
	get_luck_history: dataQuery("查询当前用户历史运势与平均星级", emptyInput, record({
		list: array(historyItemSchema),
		averageStars: numberSchema
	}), async (_input, user) => {
		const list = ensureUser(user.userId).list.map((item) => ({
			id: item.id,
			ts: item.ts,
			summary: fortuneList[item.id]?.summary ?? "",
			stars: fortuneList[item.id]?.stars ?? 0
		}));
		return {
			list,
			averageStars: list.length ? Math.round(list.reduce((s, i) => s + i.stars, 0) / list.length) : 0
		};
	}),
	get_luck_rank: dataQuery("查询当前群聊的运势财富榜（按命运碎片降序）", emptyInput, record({ list: array(record({
		userId: stringSchema,
		debris: numberSchema
	})) }), async (_input, user) => {
		requireGroup(user);
		const ids = getAllUserIds();
		return { list: getGroupRank(ids) };
	})
};

export { luckActions };