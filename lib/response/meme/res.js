import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { Pictures } from "../../image/index.js";
import { groupStore } from "../store/groupStore.js";
import "../store/index.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Image, Text, useSend } from "alemonjs";

//#region src/response/meme/res.ts
/**
* 看图识梗
*/
const memeDataDir = join(pluginInfo.DATA_PATH, "meme_rank");
if (!existsSync(memeDataDir)) mkdirSync(memeDataDir, { recursive: true });
let gengList = JSON.parse(readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "geng", "geng.json"), "utf8")) || [];
let cache = {};
let page = 1;
let timeoutCache = {};
let intervalCache = {};
let questionTs = {};
let sliceNum = 25;
const qsDegree = (degree) => {
	switch (degree) {
		case 4: return "简单";
		case 6: return "一般";
		case 8: return "困难";
		case 12: return "地狱";
		default: return "一般";
	}
};
var res_default = OnResponse(async (event, next) => {
	if (!event.GuildId) {
		sendAtText("仅支持群聊~");
		next();
		return;
	}
	const cfg = config_default.getConfig("meme");
	const memeDataPath = join(memeDataDir, event.GuildId + ".json");
	if (!cache[event.GuildId]) {
		if (existsSync(memeDataPath)) {
			const raw = JSON.parse(readFileSync(memeDataPath, "utf8"));
			if (raw.status === void 0) {
				raw.status = raw.replyed ? "answered" : "idle";
				delete raw.replyed;
			}
			if (raw.status === "questioning" || raw.status === "answered") raw.status = "idle";
			cache[event.GuildId] = raw;
		} else cache[event.GuildId] = {
			id: 0,
			ans: 0,
			degree: 6,
			cd: cfg.timeout,
			status: "idle",
			players: {}
		};
	}
	const inGame = cache[event.GuildId].status === "questioning" || cache[event.GuildId].status === "answered";
	if (/看图识梗|结束|懂王排行|识梗难度设置(.*)/.test(event.MessageText) || inGame) {
		const Send = useSend(event);
		const groupData = () => {
			return cache[event.GuildId];
		};
		const userData = () => {
			return cache[event.GuildId].players[event.UserId];
		};
		/**
		* 设置群对象属性
		* @param protoName 属性名
		* @param data 值
		*/
		const setGroupData = (protoName, data) => {
			cache[event.GuildId][protoName] = data;
		};
		const setScore = (scoreChange) => {
			if (scoreChange > 0) cache[event.GuildId].players[event.UserId].score += scoreChange;
			else if (scoreChange < 0) {
				if (userData().score < scoreChange) cache[event.GuildId].players[event.UserId].score = 0;
				else cache[event.GuildId].players[event.UserId].score -= scoreChange;
			} else cache[event.GuildId].players[event.UserId].score = 0;
		};
		const getQs = () => {
			let randomIndex = Math.floor(Math.random() * 510);
			let QsPic = join(pluginInfo.PUBLIC_PATH, "apps", "geng", "question", randomIndex + ".png");
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
			switch (cache[event.GuildId].degree) {
				case 4: return 1;
				case 6: return 2;
				case 8: return 3;
				case 12: return 4;
				default: return 2;
			}
		};
		const clearTimers = () => {
			if (timeoutCache[event.GuildId]) {
				clearTimeout(timeoutCache[event.GuildId]);
				delete timeoutCache[event.GuildId];
			}
			if (intervalCache[event.GuildId]) {
				clearTimeout(intervalCache[event.GuildId]);
				delete intervalCache[event.GuildId];
			}
		};
		const sendQs = async () => {
			setGroupData("status", "questioning");
			questionTs[event.GuildId] = Date.now();
			let question = getQs();
			const data = {
				url: question.QsPic,
				choices: question.mixedAns,
				tip: `你认为这个梗是（回答序号）`
			};
			if (event.Platform == "qq-bot") sendAtImage(readFileSync(data.url), { md: (fmd) => {
				fmd.addBold(data.tip).addNewline();
				data.choices.forEach((item, index) => {
					fmd.addBold(`【${index}】`).addButton(item.title, { data: `${index}` }).addNewline();
				});
				fmd.addDivider().addText(`${groupData().cd} 秒后自动超时结束...`);
				return fmd;
			} });
			else {
				let img = await Pictures("memeQs", { data });
				if (typeof img != "boolean") sendAtImage(img);
				else sendAtText("图片加载失败");
			}
			clearTimers();
			timeoutCache[event.GuildId] = setTimeout(() => {
				delete timeoutCache[event.GuildId];
				if (cache[event.GuildId]?.status !== "questioning") return;
				setGroupData("status", "idle");
				writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
				sendAtText(`已超时结束，请重新发起【看图识梗】！\n`, {
					md: (fmd) => fmd.addText(`当前难度等级${qsDegree(cache[event.GuildId].degree)}\n`).addButton("简单", { data: "识梗难度设置简单" }).addText(" | ").addButton("一般", { data: "识梗难度设置一般" }).addText(" | ").addButton("困难", { data: "识梗难度设置困难" }).addText(" | ").addButton("地狱", { data: "识梗难度设置地狱" }).addNewline().addText(`(答对分别加 1 | 2 | 3 | 4 分)`),
					btns: (fbg) => fbg.addRow().addButton("看图识梗", "看图识梗").addButton("懂王排行", "懂王排行")
				});
			}, groupData().cd * 1e3);
		};
		if (/看图识梗/.test(event.MessageText)) {
			sendQs();
			return;
		}
		if (/懂王排行/.test(event.MessageText)) {
			let pageSum = 0;
			const group = (await groupStore.getGroup(event.GuildId, event.Platform))?.group_map || {};
			let rankList = scoreRank(Object.entries(groupData().players).map((player) => {
				return {
					avatar: group[player[0]]?.avatar,
					playerId: player[0],
					score: player[1]?.score,
					nick: group[player[0]]?.nickname
				};
			}));
			pageSum = Math.ceil(rankList.length / sliceNum);
			page = 0;
			const pageMatch = event.MessageText.match(/懂王排行\s*(\d+)/);
			if (pageMatch) {
				page = Number(pageMatch[1] || 0);
				if (page > pageSum) {
					await Send(Text(`超过页数啦，当前共 ${pageSum} 页哦~`));
					return;
				}
			}
			let currentUserId = -1;
			if (page == 0) {
				currentUserId = rankList.findIndex((item) => item.playerId == event.UserId);
				if (currentUserId != -1) {
					page = Math.ceil(currentUserId / sliceNum) || 1;
					currentUserId = currentUserId - (page - 1) * sliceNum;
				}
			}
			let data1 = {
				list: rankList.slice((page - 1) * sliceNum, page * sliceNum),
				currentUserId,
				currentPage: page,
				sliceNum,
				playerSum: rankList.length
			};
			let img = await Pictures("memeRank", { data: data1 });
			if (typeof img != "boolean") await Send(Image(img));
			else sendAtText("图片加载失败");
			return;
		}
		if (/识梗难度设置(简单|一般|困难|地狱)/.test(event.MessageText)) {
			let level = event.MessageText.replace(/.*识梗难度设置/, "");
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
			writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
			sendAtText("已将识梗难度设置为 " + level);
			return;
		}
		if (inGame) {
			if (/结束/.test(event.MessageText)) {
				clearTimers();
				setGroupData("status", "idle");
				writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
				sendAtText("已结束本次竞答！");
				return;
			}
			if (!userData()) cache[event.GuildId].players[event.UserId] = { score: 0 };
			let playerAns = event.MessageText;
			let ansCount = groupData().degree;
			let match = playerAns.match(/^\d+$/);
			let answerNumber = -1;
			let validAnswer = false;
			if (match) {
				answerNumber = parseInt(match[0], 10);
				if (answerNumber >= 0 && answerNumber < ansCount) validAnswer = true;
			}
			if (!validAnswer) {
				if (groupData().status === "questioning") {
					const now = Date.now();
					const illegalTip = `回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在 ${Math.ceil(groupData().cd - (now - questionTs[event.GuildId]) / 1e3)} 秒后自动结束！`;
					sendAtText(illegalTip);
				} else sendAtText("已经被抢答了哦，请等待下一题生成~");
				return;
			}
			if (groupData().status === "answered") {
				sendAtText("已经被抢答了哦，请等待下一题生成~");
				return;
			}
			setGroupData("status", "answered");
			if (timeoutCache[event.GuildId]) {
				clearTimeout(timeoutCache[event.GuildId]);
				delete timeoutCache[event.GuildId];
			}
			if (String(groupData().ans) == String(answerNumber)) {
				setScore(difScore());
				const rightTip = `恭喜答对！获得【${difScore()}】分奖励！\n您当前分数为：${userData().score} !\n`;
				if (event.Platform == "qq-bot") sendAtText(rightTip, { md: (fmd) => fmd.addText(cfg.interval + " 秒后将自动发送下一题...") });
				else Pictures("memeQs", { data: {
					avatar: event.UserAvatar || "",
					url: gengList[groupData().id].pic,
					tip: rightTip
				} }).then((img) => {
					if (typeof img != "boolean") Send(Image(img));
					else sendAtText("图片加载失败");
				});
			} else {
				const errorTip = `不对呢~正确答案是\n【${groupData().ans}】(${gengList[groupData().id]?.title})!\n恭喜错失 ${difScore()} 分奖励！\n嘤嘤嘤~您当前分数为：${userData().score} \n`;
				if (event.Platform == "qq-bot") sendAtText(errorTip, { md: (fmd) => fmd.addText(cfg.interval + " 秒后将自动发送下一题...") });
				else Pictures("memeQs", { data: {
					avatar: event.UserAvatar || "",
					url: gengList[groupData().id].pic,
					tip: errorTip
				} }).then((img) => {
					if (typeof img != "boolean") Send(Image(img));
					else sendAtText("图片加载失败");
				});
			}
			writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
			if (intervalCache[event.GuildId]) clearTimeout(intervalCache[event.GuildId]);
			intervalCache[event.GuildId] = setTimeout(() => {
				delete intervalCache[event.GuildId];
				if (cache[event.GuildId]?.status !== "answered") return;
				sendQs();
			}, cfg.interval * 1e3);
			return;
		}
	}
	next();
}, "message.create");
function scoreRank(arr) {
	return arr.slice().sort((a, b) => b.score - a.score);
}
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