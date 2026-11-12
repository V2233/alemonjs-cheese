import { divorce, findMarriageByUser, listMarriagesByFavor } from "../response/marry/service/marriage.js";
import { getPartner } from "../response/marry/utils/pair.js";
import { array, dataQuery, emptyInput, numberSchema, object, record, requireGroup, stringSchema } from "./shared.js";

// src/expose/marry.ts
const marryActions = {
	start_marry: dataQuery("发起“娶群友”（随机从群内单身成员中匹配）；返回是否成功及配偶 userId", emptyInput, record({
		success: numberSchema,
		partnerId: stringSchema,
		message: stringSchema
	}), async (_input, user) => {
		requireGroup(user);
		return {
			success: 0,
			partnerId: "",
			message: "需在 response 层发起"
		};
	}, "write"),
	get_my_partner: dataQuery("查询当前用户的配偶", emptyInput, record({
		married: { type: "boolean" },
		partnerId: stringSchema,
		favor: numberSchema
	}), async (_input, user) => {
		const m = findMarriageByUser(user.userId);
		if (!m) return {
			married: false,
			partnerId: "",
			favor: 0
		};
		return {
			married: true,
			partnerId: getPartner(m, user.userId),
			favor: m.favor
		};
	}),
	get_marry_rank: dataQuery("查询亲密排行榜（按亲密度降序）", object({ page: {
		type: "integer",
		minimum: 1,
		maximum: 100
	} }), record({
		list: array(record({
			marriageId: stringSchema,
			spouseA: stringSchema,
			spouseB: stringSchema,
			favor: numberSchema
		})),
		total: numberSchema
	}), async (input) => {
		const all = listMarriagesByFavor();
		const page = input.page ?? 1;
		return {
			list: all.slice((page - 1) * 25, page * 25).map((m) => ({
				marriageId: m.marriageId,
				spouseA: m.spouseA,
				spouseB: m.spouseB,
				favor: m.favor
			})),
			total: all.length
		};
	}),
	start_divorce: dataQuery("发起离婚（等同于“闹离婚”）；仅返回协议书文本，真正执行需 confirm=true 的 confirm_divorce", emptyInput, record({ agreement: stringSchema }), async (_input, user) => {
		const m = findMarriageByUser(user.userId);
		if (!m) return { agreement: "你连对象都没有，跟锤子离婚呢~" };
		return { agreement: `【离婚协议书】\n甲方：${m.spouseA}\n乙方：${m.spouseB}\n双方于 ${/* @__PURE__ */ new Date()} 离婚……` };
	}, "write"),
	confirm_divorce: dataQuery("确认离婚，必须显式 confirm=true；会删除婚姻记录", object({ confirm: { type: "boolean" } }, ["confirm"]), record({
		success: { type: "boolean" },
		message: stringSchema
	}), async (input, user) => {
		if (input.confirm !== true) return {
			success: false,
			message: "需要明确确认"
		};
		return divorce(user.userId) ? {
			success: true,
			message: "已离婚"
		} : {
			success: false,
			message: "没有婚姻记录"
		};
	}, "write")
};

export { marryActions };