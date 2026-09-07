import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { sleep } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { groupStore } from "../store/res.js";
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
let cdCache = {};
let cdTip = {};
let sliceNum = 25;
var res_default = OnResponse(async (event, next) => {
	if (!event.GuildId) {
		useSend(event)(Text("仅支持群聊~"));
		next();
		return;
	}
	if (cdTip[event.GuildId] && !cdCache[event.GuildId]) {
		delete cdTip[event.GuildId];
		useSend(event)(Text(`已超时结束，请重新发起【看图识梗】！\npass: 当前设置为${cache[event.GuildId].cd}秒超时结束！`));
		next();
		return;
	}
	const cfg = config_default.getConfig("meme");
	if (/看图识梗|结束|懂王排行|识梗难度设置(.*)/.test(event.MessageText) || cdCache[event.GuildId]) {
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
		const qsDegree = () => {
			switch (cache[event.GuildId].degree) {
				case 4: return "简单";
				case 6: return "一般";
				case 8: return "困难";
				case 12: return "地狱";
				default: return "一般";
			}
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
		const memeDataPath = join(memeDataDir, event.GuildId + ".json");
		if (!cache[event.GuildId]) {
			if (existsSync(memeDataPath)) cache[event.GuildId] = JSON.parse(readFileSync(memeDataPath, "utf8"));
			else cache[event.GuildId] = {
				id: 0,
				ans: 0,
				degree: 6,
				cd: cfg.timeout,
				replyed: false,
				players: {}
			};
		}
		const sendQs = async () => {
			setGroupData("replyed", false);
			let question = getQs();
			let img = await Pictures("memeQs", { data: {
				url: question.QsPic,
				choices: question.mixedAns,
				tip: `你认为这个梗是（回答序号）`
			} });
			if (typeof img != "boolean") Send(Image(img));
			else Send(Text("图片加载失败"));
			if (cdCache[event.GuildId]) clearTimeout(cdCache[event.GuildId].id);
			if (cdTip[event.GuildId]) {
				clearTimeout(cdTip[event.GuildId]);
				delete cdTip[event.GuildId];
			}
			cdCache[event.GuildId] = {
				ts: (/* @__PURE__ */ new Date()).getTime(),
				id: setTimeout(() => {
					delete cdCache[event.GuildId];
					cdTip[event.GuildId] = setTimeout(() => {
						if (cdTip[event.GuildId]) delete cdTip[event.GuildId];
					}, 3e4);
				}, groupData().cd * 1e3)
			};
		};
		if (/看图识梗/.test(event.MessageText)) {
			sendQs();
			return;
		}
		if (/懂王排行/.test(event.MessageText)) {
			let pageSum = 0;
			const group = (await groupStore.getGroup(event.GuildId, event.Platform)).group_map;
			let rankList = scoreRank(Object.entries(groupData().players).map((player) => {
				return {
					avatar: group[event.UserId]?.avatar,
					playerId: player[0],
					score: player[1]?.score,
					nick: group[event.UserId]?.nickname
				};
			}));
			page = Number(event.MessageText.replace(/.*懂王排行/, "") || "0");
			if (rankList.length > sliceNum) {
				pageSum = Math.ceil(rankList.length / sliceNum);
				if (page > pageSum) {
					await Send(Text(`超过页数啦，当前共${groupData().players.length}个玩家哦~`));
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
			else Send(Text("图片加载失败"));
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
			writeFileSync(memeDataPath, JSON.stringify(groupData), "utf-8");
			Send(Text("已将识梗难度设置为 " + level));
			return;
		}
		if (cdCache[event.GuildId]) {
			if (/结束/.test(event.MessageText)) {
				clearTimeout(cdCache[event.GuildId]?.id);
				delete cdCache[event.GuildId];
				Send(Text("已结束本次竞答！"));
				return;
			}
			if (groupData().replyed) {
				Send(Text("已经被抢答了哦，请等待下一题生成~"));
				return;
			}
			if (!userData()) cache[event.GuildId].players[event.UserId] = { score: 0 };
			let playerAns = event.MessageText;
			let ansCount = groupData().degree;
			let match = playerAns.match(/\d+/);
			const now = (/* @__PURE__ */ new Date()).getTime();
			const illegalTip = `回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在${Math.ceil(groupData().cd - (now - cdCache[event.GuildId]?.ts) / 1e3)}秒后自动结束！`;
			if (match) {
				let answerNumber = parseInt(match[0], 10);
				if (answerNumber < 0 || answerNumber >= ansCount) {
					Send(Text(illegalTip));
					return;
				}
			} else {
				Send(Text(illegalTip));
				return;
			}
			const levelTip = `当前难度等级${qsDegree()}，发送【识梗难度设置简单|一般|困难|地狱】(答对分别加1|2|3|4分)`;
			if (String(groupData().ans) == playerAns) {
				setScore(difScore());
				Pictures("memeQs", { data: {
					avatar: event.UserAvatar || "",
					url: gengList[groupData().id].pic,
					tip: `恭喜答对！获得${difScore()}分奖励！\n您当前分数为：${userData().score}!\n${levelTip}`
				} }).then((img) => {
					if (typeof img != "boolean") Send(Image(img));
					else Send(Text("图片加载失败"));
				});
			} else Pictures("memeQs", { data: {
				avatar: event.UserAvatar || "",
				url: gengList[groupData().id].pic,
				tip: `不对呢~正确答案是${groupData().ans}!\n恭喜错失${difScore()}分奖励嘤嘤嘤~您当前分数为：${userData().score}\n${levelTip}`
			} }).then((img) => {
				if (typeof img != "boolean") Send(Image(img));
				else Send(Text("图片加载失败"));
			});
			setGroupData("replyed", true);
			writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
			await sleep(cfg.interval * 1e3);
			sendQs();
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