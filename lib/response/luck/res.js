import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { useEventStore } from "../../store/eventStore.js";
import "../../store/index.js";
import { sleep } from "../../utils/index.js";
import { scheduleTask } from "../../utils/task.js";
import { Pictures } from "../../image/index.js";
import { addHistory, ensureUser, getAllUserIds, getGroupRank, getUser, replaceLastHistory, resetAllTested, saveUser } from "./utils/db.js";
import { fortuneList, lots } from "./utils/fortune.js";
import LuckHandler from "./utils/handler.js";
import { readFileSync } from "fs";
import { join } from "path";
import { ResultCode, useEvent, useMention } from "alemonjs";

//#region src/response/luck/res.ts
/**
* 今日运势改命版（SQLite 版）
*/
scheduleTask("reset-luck-tested", () => {
	resetAllTested();
	console.warn(`[奶酪刷新运势状态]：如定时刷新失败管理员可发送【刷新运势】进行刷新！`);
}, {
	hour: 0,
	minute: 0,
	second: 0
});
let sliceNum = 25;
let page = 1;
var res_default = async () => {
	const [event, next] = useEvent({
		regular: /^(\/|#)?(今日运势|运气|祝福|诅咒|逆天改命|刷新运势|历史运势|运势财富榜(.*))$/,
		selects: ["message.create", "private.message.create"]
	});
	if (!event.match.regular || !event.match.selects) {
		next();
		return;
	}
	await useErrorContext(async () => {
		if (event.current.IsPrivate) {
			await sendAtText("请在群聊发送！");
			return;
		}
		if (/^(\/|#)?刷新运势$/.test(event.current.MessageText) && event.current.IsMaster) {
			resetAllTested();
			await sendAtText("刷新成功！");
			next();
			return;
		}
		if (/^(\/|#)?运势财富榜(.*)/.test(event.current.MessageText)) {
			if (!event.current.GuildId) {
				await sendAtText("仅在群聊可用！");
				return;
			}
			const members = (await useEventStore().getGroup())?.members || {};
			const groupMemberMap = new Set(Object.keys(members));
			const groupUserIds = getAllUserIds().filter((id) => groupMemberMap.has(id));
			const rankRows = getGroupRank(groupUserIds);
			let pageSum = 0;
			const groupPlayers = rankRows.map((row) => {
				const user = getUser(row.userId);
				let starCount = 0;
				if (user.isTested) starCount = fortuneList[user.list.at(-1)?.id ?? -1]?.stars || 0;
				else {
					const hisStars = user.list.reduce((prev, cur) => prev + (cur.id ? fortuneList[cur.id]?.stars || 0 : 0), 0);
					starCount = user.list.length ? Math.round(hisStars / user.list.length) : 0;
				}
				return {
					avatar: members[row.userId]?.avatar,
					playerId: row.userId,
					debris: user.debris,
					nick: members[row.userId]?.username,
					isTested: user.isTested,
					luckyStar: LuckHandler.luckyStar(starCount),
					luckColor: LuckHandler.starsColor(starCount)
				};
			});
			pageSum = Math.ceil(groupPlayers.length / sliceNum);
			page = 0;
			const pageMatch = event.current.MessageText.match(/运势财富榜\s*(\d+)/);
			if (pageMatch) {
				page = Number(pageMatch[1] || 0);
				if (page > pageSum) {
					await sendAtText(`超过页数啦，当前共 ${pageSum} 页哦~`);
					return;
				}
			}
			let currentUserId = -1;
			if (page == 0) {
				currentUserId = groupPlayers.findIndex((item) => item.playerId == event.current.UserId);
				if (currentUserId != -1) {
					page = Math.ceil(currentUserId / sliceNum) || 1;
					currentUserId = currentUserId - (page - 1) * sliceNum;
				}
			}
			const data1 = {
				list: groupPlayers.slice((page - 1) * sliceNum, page * sliceNum),
				currentUserId,
				currentPage: page,
				sliceNum,
				playerSum: groupPlayers.length
			};
			const img = await Pictures("luckRank", { data: data1 });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
		const [mention] = useMention(event.current);
		const botSelf = await mention.findOne({ IsBot: false });
		const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
		const strUser = atUser?.UserId || event.current.UserId;
		const bgUrl = config_default.getConfig("theme").bgurl;
		const user = ensureUser(strUser);
		const getTodayLuck = (u = user) => u.list[u.list.length - 1];
		const setTodayLuck = (u, key, value) => {
			u.list[u.list.length - 1] = {
				...u.list[u.list.length - 1],
				[key]: value
			};
		};
		const luckHandler = new LuckHandler(strUser);
		if (/^(\/|#)?(今日运势|运气|祝福|诅咒|逆天改命)$/.test(event.current.MessageText)) {
			let luckList = fortuneList;
			if (/逆天改命/.test(event.current.MessageText)) {
				if (!user.list.length) {
					await sendAtText("你还没看今天的运势呢，改什么命啊o(≧▽≦o)", { btns: (fbg) => fbg.addRow().addButton("今日运势", "今日运势").addButton("运势财富榜", "运势财富榜") });
					return;
				}
				if (atUser) {
					await sendAtText("哼~你还想帮别人改命？", { btns: (fbg) => fbg.addRow().addButton("逆天改命", "逆天改命") });
					return;
				}
				if (fortuneList[getTodayLuck().id].stars >= 7) {
					await sendAtText("不用改命啦，至尊无敌运气王，发起【祝福@群友】或【诅咒@群友】展示您的运势权能吧！\n", { btns: (fbg) => fbg.addRow().addButton("祝福@", "祝福").addButton("诅咒@", "诅咒") });
					return;
				}
				if (user.debris < 7) {
					await sendAtText(`你现在只有${user.debris}个碎片哦~集满7个碎片再来吧！`);
					return;
				}
				luckList = fortuneList.filter((item) => item.stars > (fortuneList[getTodayLuck().id].stars < 5 ? fortuneList[getTodayLuck().id].stars : 6));
				user.debris -= 7;
			}
			let luckId = 0;
			let addDebris = 0;
			if (/诅咒/.test(event.current.MessageText)) {
				if (!ensureUser(event.current.UserId).curseNums) {
					await sendAtText("你还剩余诅咒次数 0 ，成为 至尊无敌非酋王 才可以获得诅咒他人的机会哦~");
					return;
				}
				if (!atUser) {
					await sendAtText("你要诅咒谁啊笨蛋！", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				if (atUser.UserId == event.current.UserId) {
					await sendAtText("您确定要诅咒自己吗？", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				const target = getUser(atUser.UserId);
				if (!target || !target.isTested) {
					await sendAtText("对方今天没测过运势，您诅咒不了捏~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				luckList = fortuneList.filter((item) => item.stars == 0);
				luckId = Math.floor(Math.random() * luckList.length);
				setTodayLuck(target, "id", luckList[luckId].id);
				luckId = luckList[luckId].id;
				if (target.curseNums > 0) target.curseNums--;
				saveUser(target);
				replaceLastHistory(target.userId, luckId, Date.now());
			}
			if (/祝福/.test(event.current.MessageText)) {
				if (!ensureUser(event.current.UserId).blessNums) {
					await sendAtText("你还剩余祝福次数 0 ，成为 至尊无敌运气王 才可以获得祝福他人的机会哦~");
					return;
				}
				if (!atUser) {
					await sendAtText("你要祝福谁啊笨蛋！", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				if (atUser.UserId == event.current.UserId) {
					await sendAtText("不能祝福自己哦~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				const target = getUser(atUser.UserId);
				if (!target || !target.isTested) {
					await sendAtText("对方今天没测过运势，您祝福不了捏~", { btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("运势财富榜", "运势财富榜") });
					return;
				}
				luckList = fortuneList.filter((item) => item.stars == 7);
				luckId = Math.floor(Math.random() * luckList.length);
				setTodayLuck(target, "id", luckList[luckId].id);
				luckId = luckList[luckId].id;
				if (target.blessNums > 0) target.blessNums--;
				saveUser(target);
				replaceLastHistory(target.userId, luckId, Date.now());
			}
			if (!user.isTested || /逆天改命/.test(event.current.MessageText)) {
				luckId = Math.floor(Math.random() * luckList.length);
				if (luckList[luckId].stars == 0) {
					addDebris = 0;
					user.curseNums = 1;
				} else if (luckList[luckId].stars == 7) {
					addDebris = 0;
					user.blessNums = 1;
					user.curseNums = 1;
				} else addDebris = 7 - luckList[luckId].stars;
				user.debris += addDebris;
				luckId = luckList[luckId].id;
				setTodayLuck(user, "id", luckId);
			} else luckId = getTodayLuck(user).id;
			const luck = fortuneList[luckId];
			const fortuneSummary = luck.summary;
			const starCount = luck.stars;
			const signText = luck.sign;
			const unSignText = luck.unsign;
			const tempLuck = {
				id: luckId,
				ts: Date.now()
			};
			if (user.isTested) {
				user.list[user.list.length - 1] = tempLuck;
				replaceLastHistory(user.userId, tempLuck.id, tempLuck.ts);
			} else {
				user.list.push(tempLuck);
				addHistory(user.userId, tempLuck.id, tempLuck.ts, 7);
			}
			const luckyData = luckHandler.luckySummary(starCount, lots);
			const starcolor = luckHandler.starsColor(starCount);
			const avator = (atUser ? atUser.UserAvatar : event.current.UserAvatar) || "";
			const fortuneData = {
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
				const { blessNums, curseNums } = user;
				if (blessNums && blessNums > 0 || curseNums && curseNums > 0) mixText = `恭喜你成为了至尊无敌运气王！将笼罩在命运之神欢愉的曙光下！\n你有 ${blessNums || 0} 次祝福别人和 ${curseNums || 0} 次诅咒别人命途的权利，请使用【祝福@群友】或【诅咒@群友】施展您的运势权能吧！`;
				else mixText = `恭喜你成为了至尊无敌运气王，您已经施展了足以威慑众生的运势权能！`;
			} else if (starCount == 0) {
				const curseNums = user.curseNums;
				if (curseNums && curseNums > 0) mixText = `嘤嘤嘤~你是大凶捏，命运之神没有眷顾你，但是这种好运气怎么能独享！\n你有 ${curseNums} 次诅咒别人的机会，发送【诅咒@群友】照顾你的好友吧~`;
				else mixText = `嘤嘤嘤~你是大凶捏，命运之神没有眷顾你~`;
			} else if (user.isTested) {
				if (/逆天改命/.test(event.current.MessageText)) {
					mixText = `恭喜改命成功，消耗了7个命运碎片，并获得了 ${addDebris} 个补充碎片！\n注意: 改命仅能保证比上一次的运势高，如果上一次运势为吉则改命后必成运气王！\n据说运气王拥有操纵他人运势的能力...`;
					await sendAtImage(readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "luck", "luckySign", luckyData.luckyCharm + ".gif")));
					await sleep(15e3);
				} else mixText = `你已经获得了命运碎片~集满7个就可以逆天改命啦！`;
			} else mixText = `恭喜你获得了${addDebris}个命运碎片哦~集满7个就可以逆天改命啦！`;
			if (/诅咒/.test(event.current.MessageText)) mixText = `您成功诅咒了他，他将被您的非凡运势所震慑！`;
			if (/祝福/.test(event.current.MessageText)) mixText = `您成功祝福了他，他将继承您博大的胸襟！`;
			if (!user.isTested || /逆天改命/.test(event.current.MessageText)) user.isTested = true;
			saveUser(user);
			const data = {
				...fortuneData,
				luckData: luckyData,
				tip: `${mixText}当前剩余：${user.debris} 个命运碎片`
			};
			const img = await Pictures("todayLuck", { data });
			if (typeof img != "boolean") await sendAtImage(img, {
				md: (fmd) => fmd.addText(data.tip),
				btns: (fbg) => fbg.addRow().addButton("诅咒@", "诅咒").addButton("祝福@", "祝福").addRow().addButton("历史运势", "历史运势").addButton("运势财富榜", "运势财富榜").addRow().addButton("逆天改命", "逆天改命").addButton("今日运势", "今日运势")
			});
			else await sendAtText("图片加载失败");
		}
		if (/历史运势/.test(event.current.MessageText)) {
			if (!user.list.length) {
				await sendAtText("你还没有运势记录哦~发送【今日运势】试试吧！");
				return;
			}
			const hisStars = user.list.reduce((acc, item) => acc + (item.id ? fortuneList[item.id]?.stars || 0 : 0), 0);
			const starCount = Math.round(hisStars / user.list.length);
			const starcolor = luckHandler.starsColor(starCount);
			const fortuneData = {
				fortuneSummary: "平均等级：" + luckHandler.luckySummary(starCount, lots).fortuneSummary,
				luckyStar: luckHandler.luckyStar(starCount),
				starCount,
				starcolor,
				avator: (atUser ? atUser.UserAvatar : event.current.UserAvatar) || "",
				bgUrl
			};
			const img = await Pictures("luckHistory", { data: {
				...fortuneData,
				playerData: user.list,
				fortuneList
			} });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
	});
};

//#endregion
export { res_default as default };