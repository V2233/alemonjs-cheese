import config_default from "../../utils/config.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { Pictures } from "../../image/index.js";
import { getQRCode } from "../../utils/qrcode.js";
import "./utils/tool.js";
import { ResultCode, useMention } from "alemonjs";
import OpenAI from "openai";

//#region src/response/ai/res.ts
const groupMsgs = {};
/**
* 入队
* @param group_id
* @param msg
* @param limit
*/
const pushGroupMsgs = (group_id, msg, limit = 10) => {
	groupMsgs[group_id]?.msgs?.push(msg);
	while (groupMsgs[group_id]?.msgs?.lenth > limit) groupMsgs[group_id]?.msgs.shift();
};
OnResponse(async (event, next) => {
	await useErrorContext(async () => {
		const cfg = config_default.getConfig("ai");
		if (!cfg.is_open) return;
		if (!groupMsgs[event.GuildId]) groupMsgs[event.GuildId] = { msgs: [] };
		const [mention] = useMention(event);
		const botSelf = await mention.findOne({ IsBot: true });
		const prefixReg = new RegExp(cfg.prefix);
		console.log("-------------" + cfg.prefix);
		if (cfg.prefix && prefixReg.test(event.MessageText) || botSelf.code === ResultCode.Ok) {
			await sendAtText("该功能已暂停维护");
			next();
			return;
		}
		if (/奶酪获取openaikey$/.test(event.MessageText)) {
			const img = await Pictures("qrcode", { data: {
				url: await getQRCode("https://free.v36.cm/github"),
				title: "扫码获取免费OpenaiKey",
				desc: "需要github账户验证"
			} });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
		pushGroupMsgs(event.GuildId, {
			个人账号: event.UserId,
			昵称: event.UserName,
			发送消息: event.MessageText
		}, cfg.ctx_num);
		next();
	});
}, "message.create");

//#endregion
export {  };