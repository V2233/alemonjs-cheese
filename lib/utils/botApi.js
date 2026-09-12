import { getConfigValue } from "alemonjs";

//#region src/utils/botApi.ts
function getBotAvatar(useId) {
	return `https://q.qlogo.cn/qqapp/${getConfigValue().bot_id}/${useId}/640`;
}

//#endregion
export { getBotAvatar };