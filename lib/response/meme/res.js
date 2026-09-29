import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { useErrorContext, useErrorHandler } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { Pictures } from "../../image/index.js";
import { useEventStore } from "../../store/eventStore.js";
import "../../store/index.js";
import { ensureGroup, getGroup, getGroupScoreRank, getPlayer, savePlayer, updateGroupField } from "./utils/db.js";
import { readFileSync } from "fs";
import { join } from "path";
import { useEvent } from "alemonjs";

//#region src/response/meme/res.ts
/**
* 看图识梗（SQLite 版）
*/
let gengList = JSON.parse(readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "geng", "geng.json"), "utf8")) || [];
let page = 1;
let sliceNum = 25;
let timeoutCache = {};
let intervalCache = {};
let questionTs = {};
const qsDegree = (degree) => {
	switch (degree) {
		case 4: return "简单";
		case 6: return "一般";
		case 8: return "困难";
		case 12: return "地狱";
		default: return "一般";
	}
};
const isInGame = (guildId) => {
	const g = getGroup(guildId);
	return !!g && (g.status === "questioning" || g.status === "answered");
};
var res_default = async () => {
	const [event, next] = useEvent({
		regular: /看图识梗|结束|懂王排行|识梗难度设置(.*)/,
		selects: ["message.create", "private.message.create"]
	});
	if (!event.match.regular || !event.match.selects) {
		next();
		return;
	}
	await useErrorContext(async () => {
		if (!event.current.IsPrivate) {
			await sendAtText("仅支持群聊~");
			next();
			return;
		}
		const inGame = isInGame(event.current.GuildId);
		const cfg = config_default.getConfig("meme");
		ensureGroup(event.current.GuildId, {
			degree: 6,
			cd: cfg.timeout
		});
		const groupData = () => getGroup(event.current.GuildId);
		const userData = () => getPlayer(event.current.GuildId, event.current.UserId);
		const setGroupData = (protoName, data) => {
			if (protoName === "players") return;
			if (!{
				id: "id",
				ans: "ans",
				degree: "degree",
				cd: "cd",
				status: "status"
			}[protoName]) return;
			updateGroupField(event.current.GuildId, protoName, data);
		};
		const setScore = (scoreChange) => {
			const player = userData();
			if (!player) return;
			let newScore = player.score;
			if (scoreChange > 0) newScore += scoreChange;
			else if (scoreChange < 0) newScore = player.score < -scoreChange ? 0 : player.score + scoreChange;
			else newScore = 0;
			savePlayer(event.current.GuildId, event.current.UserId, newScore);
		};
		const getQs = () => {
			const randomIndex = Math.floor(Math.random() * 510);
			const QsPic = join(pluginInfo.PUBLIC_PATH, "apps", "geng", "question", randomIndex + ".png");
			setGroupData("id", randomIndex);
			let mixedAns = getRandomElements(gengList, groupData().degree - 1);
			mixedAns = shuffle([...mixedAns, gengList[randomIndex]]);
			mixedAns.forEach((item, index) => {
				if (item.title == gengList[randomIndex].title) setGroupData("ans", index);
			});
			return {
				mixedAns,
				QsPic
			};
		};
		const difScore = () => {
			switch (groupData().degree) {
				case 4: return 1;
				case 6: return 2;
				case 8: return 3;
				case 12: return 4;
				default: return 2;
			}
		};
		const clearTimers = () => {
			if (timeoutCache[event.current.GuildId]) {
				clearTimeout(timeoutCache[event.current.GuildId]);
				delete timeoutCache[event.current.GuildId];
			}
			if (intervalCache[event.current.GuildId]) {
				clearTimeout(intervalCache[event.current.GuildId]);
				delete intervalCache[event.current.GuildId];
			}
		};
		const sendQs = async () => {
			setGroupData("status", "questioning");
			questionTs[event.current.GuildId] = Date.now();
			const question = getQs();
			const data = {
				url: question.QsPic,
				choices: question.mixedAns,
				tip: `你认为这个梗是（回答序号）`
			};
			if (event.current.Platform == "qq-bot") await sendAtImage(readFileSync(data.url), { md: (fmd) => {
				fmd.addBold(data.tip).addNewline();
				data.choices.forEach((item, index) => {
					fmd.addBold(`【${index}】`).addButton(item.title, { data: `${index}` }).addNewline();
				});
				fmd.addDivider().addText(`${groupData().cd} 秒后自动超时结束...`);
				return fmd;
			} });
			else {
				const img = await Pictures("memeQs", { data });
				if (typeof img != "boolean") await sendAtImage(img);
				else await sendAtText("图片加载失败");
			}
			clearTimers();
			timeoutCache[event.current.GuildId] = setTimeout(() => {
				delete timeoutCache[event.current.GuildId];
				if (getGroup(event.current.GuildId)?.status !== "questioning") return;
				setGroupData("status", "idle");
				sendAtText(`已超时结束，请重新发起【看图识梗】！\n`, {
					md: (fmd) => fmd.addText(`当前难度等级${qsDegree(groupData().degree)}\n`).addButton("简单", { data: "识梗难度设置简单" }).addText(" | ").addButton("一般", { data: "识梗难度设置一般" }).addText(" | ").addButton("困难", { data: "识梗难度设置困难" }).addText(" | ").addButton("地狱", { data: "识梗难度设置地狱" }).addNewline().addText(`(答对分别加 1 | 2 | 3 | 4 分)`),
					btns: (fbg) => fbg.addRow().addButton("看图识梗", "看图识梗").addButton("懂王排行", "懂王排行")
				}).catch?.(useErrorHandler);
			}, groupData().cd * 1e3);
		};
		if (/看图识梗/.test(event.current.MessageText)) {
			sendQs();
			return;
		}
		if (/懂王排行/.test(event.current.MessageText)) {
			let pageSum = 0;
			const members = (await useEventStore().getGroup())?.members || {};
			const rankList = getGroupScoreRank(event.current.GuildId).map((row) => ({
				avatar: members[row.userId]?.avatar,
				playerId: row.userId,
				score: row.score,
				nick: members[row.userId]?.username
			}));
			pageSum = Math.ceil(rankList.length / sliceNum);
			page = 0;
			const pageMatch = event.current.MessageText.match(/懂王排行\s*(\d+)/);
			if (pageMatch) {
				page = Number(pageMatch[1] || 0);
				if (page > pageSum) {
					await sendAtText(`超过页数啦，当前共 ${pageSum} 页哦~`);
					return;
				}
			}
			let currentUserId = -1;
			if (page == 0) {
				currentUserId = rankList.findIndex((item) => item.playerId == event.current.UserId);
				if (currentUserId != -1) {
					page = Math.ceil(currentUserId / sliceNum) || 1;
					currentUserId = currentUserId - (page - 1) * sliceNum;
				}
			}
			const data1 = {
				list: rankList.slice((page - 1) * sliceNum, page * sliceNum),
				currentUserId,
				currentPage: page,
				sliceNum,
				playerSum: rankList.length
			};
			const img = await Pictures("memeRank", { data: data1 });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
		if (/识梗难度设置(简单|一般|困难|地狱)/.test(event.current.MessageText)) {
			let level = event.current.MessageText.replace(/.*识梗难度设置/, "");
			switch (level) {
				case "简单":
					setGroupData("degree", 4);
					break;
				case "一般":
					setGroupData("degree", 6);
					break;
				case "困难":
					setGroupData("degree", 8);
					break;
				case "地狱":
					setGroupData("degree", 12);
					break;
				default:
					level = "一般";
					setGroupData("degree", 6);
			}
			await sendAtText("已将识梗难度设置为 " + level);
			return;
		}
		if (inGame) {
			if (/结束/.test(event.current.MessageText)) {
				clearTimers();
				setGroupData("status", "idle");
				await sendAtText("已结束本次竞答！");
				return;
			}
			if (!userData()) savePlayer(event.current.GuildId, event.current.UserId, 0);
			const playerAns = event.current.MessageText;
			const ansCount = groupData().degree;
			const match = playerAns.match(/^\d+$/);
			let answerNumber = -1;
			let validAnswer = false;
			if (match) {
				answerNumber = parseInt(match[0], 10);
				if (answerNumber >= 0 && answerNumber < ansCount) validAnswer = true;
			}
			if (!validAnswer) {
				if (groupData().status === "questioning") {
					const now = Date.now();
					const leftCD = Math.ceil(groupData().cd - (now - questionTs[event.current.GuildId]) / 1e3);
					await sendAtText(`回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在 ${leftCD} 秒后自动结束！`);
				} else await sendAtText("已经被抢答了哦，请等待下一题生成~");
				return;
			}
			if (groupData().status === "answered") {
				await sendAtText("已经被抢答了哦，请等待下一题生成~");
				return;
			}
			setGroupData("status", "answered");
			if (timeoutCache[event.current.GuildId]) {
				clearTimeout(timeoutCache[event.current.GuildId]);
				delete timeoutCache[event.current.GuildId];
			}
			if (String(groupData().ans) == String(answerNumber)) {
				setScore(difScore());
				const rightTip = `恭喜答对！获得【${difScore()}】分奖励！\n您当前分数为：${userData().score} !\n`;
				if (event.current.Platform == "qq-bot") await sendAtText(rightTip, { md: (fmd) => fmd.addText(cfg.interval + " 秒后将自动发送下一题...") });
				else {
					const img = await Pictures("memeQs", { data: {
						avatar: event.current.UserAvatar || "",
						url: gengList[groupData().id].pic,
						tip: rightTip
					} });
					if (typeof img != "boolean") await sendAtImage(img);
					else await sendAtText("图片加载失败");
				}
			} else {
				const errorTip = `不对呢~正确答案是\n【${groupData().ans}】(${gengList[groupData().id]?.title})!\n恭喜错失 ${difScore()} 分奖励！\n嘤嘤嘤~您当前分数为：${userData().score} \n`;
				if (event.current.Platform == "qq-bot") await sendAtText(errorTip, { md: (fmd) => fmd.addText(cfg.interval + " 秒后将自动发送下一题...") });
				else {
					const img = await Pictures("memeQs", { data: {
						avatar: event.current.UserAvatar || "",
						url: gengList[groupData().id].pic,
						tip: errorTip
					} });
					if (typeof img != "boolean") await sendAtImage(img);
					else await sendAtText("图片加载失败");
				}
			}
			if (intervalCache[event.current.GuildId]) clearTimeout(intervalCache[event.current.GuildId]);
			intervalCache[event.current.GuildId] = setTimeout(() => {
				delete intervalCache[event.current.GuildId];
				if (getGroup(event.current.GuildId)?.status !== "answered") return;
				sendQs();
			}, cfg.interval * 1e3);
			return;
		}
	});
};
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
function getRandomElements(array, num) {
	return shuffle(array.slice()).slice(0, num);
}

//#endregion
export { res_default as default };