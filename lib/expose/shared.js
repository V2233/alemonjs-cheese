import { Expose, ExposeError, getConfigValue, getCurrentEvent, isMaster } from "alemonjs";

// src/expose/shared.ts
/** 统一鉴权 + 构造当前调用上下文 */
function currentUser(context) {
	const config = getConfigValue()["alemonjs-cheese"]?.expose;
	const allowed = config?.allowed_callers;
	const event = getCurrentEvent();
	if (config !== void 0 && (!config || typeof config !== "object" || Array.isArray(config)) || config?.enabled !== true || allowed !== void 0 && (!Array.isArray(allowed) || !allowed.every((item) => typeof item === "string" && item.length > 0 && item.trim() === item)) || !context.callerApp || allowed !== void 0 && !allowed.includes(context.callerApp) || !event || !["message.create", "private.message.create"].includes(event.name) || ![
		event.Platform,
		event.BotId,
		event.UserId
	].every((value) => typeof value === "string" && value.trim().length > 0)) throw new ExposeError("FORBIDDEN", "当前调用方或消息身份未获奶酪插件授权");
	context.signal.throwIfAborted();
	const groupId = event.name === "message.create" ? String([
		event.GroupId,
		event.ChannelId,
		event.GuildId
	].find((value) => typeof value === "string" && value.trim()) ?? "") : "";
	return {
		userId: event.UserId,
		botId: event.BotId,
		platform: event.Platform,
		guildId: groupId,
		isGroup: Boolean(groupId),
		event
	};
}
function requireMaster(user) {
	if (!isMaster(user.userId, user.platform)) throw new ExposeError("FORBIDDEN", "此接口仅允许机器人管理员调用");
}
function requireGroup(user) {
	if (!user.isGroup) throw new ExposeError("FORBIDDEN", "此功能仅在群聊可用");
}
const emptyInput = {
	type: "object",
	properties: {},
	additionalProperties: false
};
function object(properties, required = []) {
	return {
		type: "object",
		properties,
		required,
		additionalProperties: false
	};
}
const text = {
	type: "string",
	minLength: 1,
	maxLength: 2e3
};
const stringSchema = { type: "string" };
const numberSchema = { type: "number" };
const booleanSchema = { type: "boolean" };
function array(items) {
	return {
		type: "array",
		items
	};
}
function record(properties) {
	return object(properties, Object.keys(properties));
}
function strings(...keys) {
	return Object.fromEntries(keys.map((key) => [key, stringSchema]));
}
/** 底层 action 封装：鉴权 + 注入 CheeseContext */
function action(description, inputSchema, outputSchema, handler, effect = "read") {
	return Expose.action({
		description,
		effect,
		inputSchema,
		outputSchema,
		authorize: (_input, context) => {
			currentUser(context);
			return true;
		},
		handler: (input, context) => handler(input, currentUser(context), context)
	});
}
/** 返回 { status:'success', text } */
function query(description, inputSchema, handler, effect = "read") {
	return action(description, inputSchema, object({
		status: {
			type: "string",
			enum: ["success"]
		},
		text: { type: "string" }
	}, ["status", "text"]), async (input, user) => ({
		status: "success",
		text: await handler(input, user)
	}), effect);
}
/** 返回 { status:'success', data } */
function dataQuery(description, inputSchema, dataSchema, handler, effect = "read") {
	return action(description, inputSchema, object({
		status: {
			type: "string",
			enum: ["success"]
		},
		data: dataSchema
	}, ["status", "data"]), async (input, user, context) => ({
		status: "success",
		data: await handler(input, user, context)
	}), effect);
}

export { action, array, booleanSchema, currentUser, dataQuery, emptyInput, numberSchema, object, query, record, requireGroup, requireMaster, stringSchema, strings, text };