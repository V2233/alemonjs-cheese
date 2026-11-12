import { ensureGroup, getGroup, getGroupScoreRank } from "../response/meme/utils/db.js";
import { array, dataQuery, emptyInput, numberSchema, object, query, record, requireGroup, stringSchema } from "./shared.js";

// src/expose/meme.ts
const memeActions = {
	start_meme: dataQuery("发起看图识梗（等同于用户发送“看图识梗”）；返回当前题目、选项与超时秒数，后续答题仍由用户发送序号完成", emptyInput, record({
		questionId: numberSchema,
		imageUrl: stringSchema,
		choices: array(stringSchema),
		answerIndex: numberSchema,
		timeoutSeconds: numberSchema,
		difficulty: stringSchema
	}), async (_input, user) => {
		requireGroup(user);
		ensureGroup(user.guildId, {
			degree: 6,
			cd: 60
		});
		const group = getGroup(user.guildId);
		return {
			questionId: group.id,
			imageUrl: `apps/geng/question/${group.id}.png`,
			choices: [],
			answerIndex: group.ans,
			timeoutSeconds: group.cd,
			difficulty: String(group.degree)
		};
	}, "write"),
	get_meme_rank: dataQuery("查询当前群聊的懂王排行（按分数降序）", emptyInput, record({ list: array(record({
		userId: stringSchema,
		score: numberSchema
	})) }), async (_input, user) => {
		requireGroup(user);
		return { list: getGroupScoreRank(user.guildId) };
	}),
	set_meme_degree: query("设置当前群聊的识梗难度（简单/一般/困难/地狱）", object({ degree: {
		type: "string",
		enum: [
			"简单",
			"一般",
			"困难",
			"地狱"
		]
	} }, ["degree"]), async (input, user) => {
		requireGroup(user);
		return `已将识梗难度设置为 ${input.degree}`;
	}, "write")
};

export { memeActions };