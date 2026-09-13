import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { scheduleTask, sleep } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { fortuneList, lots } from "./utils/fortune.js";
import LuckHandler from "./utils/handler.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ResultCode, useMention } from "alemonjs";

//#region src/response/luck/res.ts
/**
* 今日运势改命版
*/
const luckDataPath = join(pluginInfo.DATA_PATH, "luckDB.json");
if (!existsSync(luckDataPath)) writeFileSync(luckDataPath, JSON.stringify({}), "utf-8");
let luckRecord = JSON.parse(readFileSync(luckDataPath, "utf8")) || {};
scheduleTask(() => {
	Object.keys(luckRecord).forEach((key) => {
		luckRecord[key].isTested = false;
	});
	writeFileSync(luckDataPath, JSON.stringify(luckRecord), "utf-8");
	console.warn(`[奶酪刷新运势状态]：如定时刷新失败管理员可发送【刷新运势】进行刷新！`);
}, {
	hour: 0,
	minute: 0,
	second: 0
});
var res_default = OnResponse(async (event, next) => {
	if (!/^(\/|#)?(今日运势|运气|祝福|诅咒|逆天改命|刷新运势|历史运势)$/.test(event.MessageText)) {
		next();
		return;
	}
	if (/^(\/|#)?刷新运势$/.test(event.MessageText) && event.IsMaster) {
		Object.keys(luckRecord).forEach((key) => {
			luckRecord[key].isTested = false;
		});
		writeFileSync(luckDataPath, JSON.stringify(luckRecord), "utf-8");
		sendAtText("刷新成功！");
		next();
		return;
	}
	const [mention] = useMention(event);
	const botSelf = await mention.findOne({ IsBot: false });
	const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
	const strUser = atUser?.UserId || event.UserId;
	let bgUrl = config_default.getConfig("theme").bgurl;
	function playerObj() {
		return luckRecord[strUser];
	}
	function getTodayLuck(user = strUser) {
		return luckRecord[user].list[luckRecord[user].list.length - 1];
	}
	function setTodayLuck(user = strUser, key, value) {
		luckRecord[user].list[luckRecord[user].list.length - 1] = {
			...luckRecord[user].list[luckRecord[user].list.length - 1],
			[key]: value
		};
	}
	let luckHandler = new LuckHandler(strUser);
	if (/^(\/|#)?(今日运势|运气|祝福|诅咒|逆天改命)$/.test(event.MessageText)) {
		if (!luckRecord[strUser]) luckRecord[strUser] = {
			list: [],
			debris: 0,
			isTested: false
		};
		let luckList = fortuneList;
		if (/逆天改命/.test(event.MessageText)) {
			if (!playerObj() || playerObj().list.length == 0) {
				sendAtText("你还没看今天的运势呢，改什么命啊o(≧▽≦o)", { btns: (fbg) => fbg.addRow().addButton("今日运势", "今日运势") });
				return;
			}
			if (atUser) {
				sendAtText("哼~你还想帮别人改命？", { btns: (fbg) => fbg.addRow().addButton("逆天改命", "逆天改命") });
				return;
			}
			if (fortuneList[getTodayLuck().id].stars >= 7) {
				sendAtText("不用改命啦，至尊无敌运气王，发起【祝福@群友】或【诅咒@群友】展示您的运势权能吧！\n", { btns: (fbg) => fbg.addRow().addButton("祝福@", "祝福").addButton("诅咒@", "诅咒") });
				return;
			}
			if (luckRecord[strUser].debris < 7) {
				sendAtText(`你现在只有${playerObj().debris}个碎片哦~集满7个碎片再来吧！`);
				return;
			}
			luckList = fortuneList.filter((item) => item.stars > (fortuneList[getTodayLuck().id].stars < 5 ? fortuneList[getTodayLuck().id].stars : 6));
			luckRecord[strUser].debris -= 7;
		}
		let luckId = 0;
		let addDebris = 0;
		if (/诅咒/.test(event.MessageText)) {
			if (!luckRecord[event.UserId].curseNums) {
				sendAtText("你还剩余诅咒次数 0 ，成为 至尊无敌非酋王 才可以获得诅咒他人的机会哦~");
				return;
			}
			if (!atUser) {
				sendAtText("你要诅咒谁啊笨蛋！", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			if (atUser.UserId == event.UserId) {
				sendAtText("您确定要诅咒自己吗？", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			if (!luckRecord[atUser.UserId] || !luckRecord[atUser.UserId].isTested) {
				sendAtText("对方今天没测过运势，您诅咒不了捏~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			luckList = fortuneList.filter((item) => item.stars == 0);
			luckId = Math.floor(Math.random() * luckList.length);
			setTodayLuck(atUser.UserId, "id", luckList[luckId].id);
			luckId = luckList[luckId].id;
			luckRecord[atUser.UserId].curseNums > 0 && luckRecord[atUser.UserId].curseNums--;
		}
		if (/祝福/.test(event.MessageText)) {
			if (!luckRecord[event.UserId].blessNums) {
				sendAtText("你还剩余祝福次数 0 ，成为 至尊无敌运气王 才可以获得祝福他人的机会哦~");
				return;
			}
			if (!atUser) {
				sendAtText("你要祝福谁啊笨蛋！", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			if (atUser.UserId == event.UserId) {
				sendAtText("不能祝福自己哦~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			if (!luckRecord[atUser.UserId] || !luckRecord[atUser.UserId].isTested) {
				sendAtText("对方今天没测过运势，您祝福不了捏~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福") });
				return;
			}
			luckList = fortuneList.filter((item) => item.stars == 7);
			luckId = Math.floor(Math.random() * luckList.length);
			setTodayLuck(atUser.UserId, "id", luckList[luckId].id);
			luckId = luckList[luckId].id;
			luckRecord[atUser.UserId].blessNums > 0 && luckRecord[atUser.UserId].blessNums--;
		}
		if (!playerObj().isTested || /逆天改命/.test(event.MessageText)) {
			luckId = Math.floor(Math.random() * luckList.length);
			if (luckList[luckId].stars == 0) {
				addDebris = 0;
				luckRecord[strUser].curseNums = 1;
			} else if (luckList[luckId].stars == 7) {
				addDebris = 0;
				luckRecord[strUser].blessNums = 1;
				luckRecord[strUser].curseNums = 1;
			} else addDebris = 7 - luckList[luckId].stars;
			luckRecord[strUser].debris += addDebris;
			luckId = luckList[luckId].id;
			setTodayLuck(strUser, "id", luckId);
		} else luckId = getTodayLuck(strUser).id;
		let luck = fortuneList[luckId];
		let fortuneSummary = luck.summary;
		let starCount = luck.stars;
		let signText = luck.sign;
		let unSignText = luck.unsign;
		let tempLuck = {
			id: luckId,
			ts: Date.now()
		};
		if (luckRecord[strUser].isTested) luckRecord[strUser].list[luckRecord[strUser].list.length - 1] = tempLuck;
		else if (luckRecord[strUser].list.length >= 7) {
			luckRecord[strUser].list.shift();
			luckRecord[strUser].list.push(tempLuck);
		} else luckRecord[strUser].list.push(tempLuck);
		let luckyData = luckHandler.luckySummary(starCount, lots);
		let starcolor = luckHandler.starsColor(starCount);
		let avator = (atUser ? atUser.UserAvatar : event.UserAvatar) || "";
		let fortuneData = {
			fortuneSummary,
			luckyStar: luckHandler.luckyStar(starCount),
			signText,
			unSignText,
			starcolor,
			starCount,
			avator,
			bgUrl
		};
		let mixText = ``;
		if (starCount == 7) {
			const { blessNums, curseNums } = playerObj();
			if (blessNums && blessNums > 0 || curseNums && curseNums > 0) mixText = `恭喜你成为了至尊无敌运气王！将笼罩在命运之神欢愉的曙光下！\n你有 ${blessNums || 0} 次祝福别人和 ${curseNums || 0} 次诅咒别人命途的权利，请使用【祝福@群友】或【诅咒@群友】施展您的运势权能吧！`;
			else mixText = `恭喜你成为了至尊无敌运气王，您已经施展了足以威慑众生的运势权能！`;
		} else if (starCount == 0) {
			const curseNums = playerObj().curseNums;
			if (curseNums && curseNums > 0) mixText = `嘤嘤嘤~你是大凶捏，命运之神没有眷顾你，但是这种好运气怎么能独享！\n你有 ${curseNums} 次诅咒别人的机会，发送【诅咒@群友】照顾你的好友吧~`;
		} else if (playerObj().isTested) {
			if (/逆天改命/.test(event.MessageText)) {
				mixText = `恭喜改命成功，消耗了7个命运碎片，并获得了 ${addDebris} 个补充碎片！\n注意: 改命仅能保证比上一次的运势高，如果上一次运势为吉则改命后必成运气王！\n据说运气王拥有操纵他人运势的能力...`;
				await sendAtImage(readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "luck", "luckySign", luckyData.luckyCharm + ".gif")));
				await sleep(15e3);
			} else mixText = `你已经获得了命运碎片~集满7个就可以逆天改命啦！`;
		} else mixText = `恭喜你获得了${addDebris}个命运碎片哦~集满7个就可以逆天改命啦！`;
		if (/诅咒/.test(event.MessageText)) mixText = `您成功诅咒了他，他将被您的非凡运势所震慑！`;
		if (/祝福/.test(event.MessageText)) mixText = `您成功祝福了他，他将继承您博大的胸襟！`;
		if (!playerObj().isTested || /逆天改命/.test(event.MessageText)) luckRecord[strUser].isTested = true;
		const data = {
			...fortuneData,
			luckData: luckyData,
			tip: `${mixText}当前剩余：${luckRecord[strUser].debris} 个命运碎片`
		};
		const img = await Pictures("todayLuck", { data });
		if (typeof img != "boolean") await sendAtImage(img, {
			md: (fmd) => fmd.addText(data.tip),
			btns: (fbg) => fbg.addRow().addButton("历史运势", "历史运势").addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福")
		});
		else sendAtText("图片加载失败");
		writeFileSync(luckDataPath, JSON.stringify(luckRecord), "utf-8");
	}
	if (/历史运势/.test(event.MessageText)) {
		let hisStars = 0;
		luckRecord[strUser].list.forEach((item) => {
			if (item.id) hisStars += fortuneList[item.id]?.stars;
		});
		let starCount = Math.round(hisStars / luckRecord[strUser].list.length);
		let starcolor = luckHandler.starsColor(starCount);
		let fortuneData = {
			fortuneSummary: "平均等级：" + luckHandler.luckySummary(starCount, lots).fortuneSummary,
			luckyStar: luckHandler.luckyStar(starCount),
			starCount,
			starcolor,
			avator: (atUser ? atUser.UserAvatar : event.UserAvatar) || "",
			bgUrl
		};
		const img = await Pictures("luckHistory", { data: {
			...fortuneData,
			playerData: luckRecord[strUser].list,
			fortuneList
		} });
		if (typeof img != "boolean") sendAtImage(img);
		else sendAtText("图片加载失败");
		return;
	}
	next();
}, "message.create");

//#endregion
export { res_default as default };