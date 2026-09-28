import { sendAtText } from "../../../hooks/send.js";
import { db, products } from "./marry.js";
import { JobService } from "./services/JobService.js";
import { ShopService } from "./services/ShopService.js";
import { OnResponse, useMention } from "alemonjs";

//#region src/response/marry/plans/res2.ts
async function handleMarry(event, targetUid) {}
async function handleWork(event, professionName) {
	const uid = event.UserId;
	const msg = JobService.work(uid, professionName);
	return sendAtText(msg);
}
async function handleBuy(event, productName) {
	const uid = event.UserId;
	const msg = ShopService.buy(uid, productName);
	return sendAtText(msg);
}
async function handleProfile(event) {
	const uid = event.UserId;
	const player = db.getPlayer(uid, "", "male");
	const marriage = db.getMarriageByUid(uid);
	let text = `【个人资料】\n`;
	text += `ID: ${uid}\n`;
	text += `金钱: ¥${player.personalFund}\n`;
	text += `职业: ${player.profession || "无"}\n`;
	text += `背包: ${Object.keys(player.inventory).length === 0 ? "空" : Object.entries(player.inventory).map(([k, v]) => `${products.find((p) => p.name === k)?.zh}x${v}`).join(", ")}\n`;
	text += `婚姻状态: ${marriage ? "已婚" : "未婚"}`;
	return sendAtText(text);
}
var res2_default = OnResponse(async (event, next) => {
	const text = event.MessageText.trim();
	const [mention] = useMention(event);
	mention?.data?.UserId;
	if (/^(\/|#)?娶群友/.test(text)) await handleMarry(event, null);
	else if (/^去工作$/.test(text)) {
		const player = db.getPlayer(event.UserId, "", "male");
		if (player.profession) await handleWork(event, player.profession);
		else sendAtText("你还没有职业，请先购买生产资料！");
	} else if (/^我要当(.*)/.test(text)) {
		const professionZh = text.match(/我要当(.*)/)[1];
		const profession = professions.find((p) => p.zh === professionZh);
		if (profession) {
			const msg = JobService.hire(event.UserId, profession.name);
			sendAtText(msg);
		}
	} else if (/^老婆买买(.*)/.test(text)) {
		const productName = text.match(/老婆买买(.*)/)[1];
		const product = products.find((p) => p.zh === productName || p.name === productName);
		if (product) await handleBuy(event, product.name);
		else sendAtText("没有这个商品哦。");
	} else if (/^个人资料/.test(text)) await handleProfile(event);
	else next();
}, "message.create");

//#endregion
export { res2_default as default };