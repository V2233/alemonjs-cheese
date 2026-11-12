import config_default from "../utils/config.js";
import { dataQuery, emptyInput, object, query, record, requireMaster, stringSchema } from "./shared.js";

// src/expose/setting.ts
const settingActions = {
	get_settings: dataQuery("管理员查询奶酪配置项（只读）", emptyInput, record({ items: {
		type: "array",
		items: record({
			parent: stringSchema,
			key: stringSchema,
			title: stringSchema,
			type: stringSchema
		})
	} }), (_input, user) => {
		requireMaster(user);
		return { items: config_default.description.flatMap((cfg) => cfg.value.map((prop) => ({
			parent: cfg.key,
			key: prop.prop,
			title: prop.title,
			type: typeof prop.value
		}))) };
	}),
	update_setting: query("管理员修改奶酪配置；key 为设置项 prop，value 为字符串，内部按原类型转换", object({
		key: {
			...stringSchema,
			minLength: 1
		},
		value: {
			...stringSchema,
			maxLength: 2e3
		}
	}, ["key", "value"]), (input, user) => {
		requireMaster(user);
		const cfg = config_default.description.find((c) => c.value.some((p) => p.prop === input.key));
		const prop = cfg?.value.find((p) => p.prop === input.key);
		if (!cfg || !prop) throw new Error("未找到该配置项");
		const raw = prop.value;
		const value = typeof raw === "number" ? Number(input.value) : typeof raw === "boolean" ? input.value === "true" : input.value;
		config_default.setConfig(value, [prop.prop], cfg.key);
		return `已更新 ${cfg.key}.${prop.prop} = ${String(value)}`;
	}, "write")
};

export { settingActions };