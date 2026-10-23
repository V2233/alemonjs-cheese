import { getConfigValue } from "alemonjs";

// src/utils/botApi.ts
function getBotAvatar(useId) {
	return `https://q.qlogo.cn/qqapp/${getConfigValue().bot_id}/${useId}/640`;
}

export { getBotAvatar };