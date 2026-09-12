import { pluginInfo } from "../../package.js";
import { requestBuffer } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { useUserAvatar } from "../../hooks/bot.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { groupStore } from "../store/groupStore.js";
import "../store/index.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ResultCode, useMention } from "alemonjs";

//#region src/response/marry/res.ts
/**
* 娶群员升级版(源Earth-K-Plugin)
*/
const marryDataPath = join(pluginInfo.DATA_PATH, "marryDB.json");
if (!existsSync(marryDataPath)) writeFileSync(marryDataPath, JSON.stringify({ ren: [] }), "utf-8");
let ren = JSON.parse(readFileSync(marryDataPath, "utf8")).ren;
ren.forEach((item) => {
	if (item.favor === null || item.favor === void 0) item.favor = 0;
});
let user_id2 = "";
let page = 1;
let sliceNum = 25;
let favorCd = {};
var res_default = OnResponse(async (event, next) => {
	if (!/^(\/|#)?娶群友|闹离婚|强娶(.*)|我对象呢|今日老婆|抢群友(.*)|老婆亲亲|老婆羞羞|老婆打你|老婆逛街|老婆做饭|亲密排行(.*)/.test(event.MessageText)) {
		next();
		return;
	}
	const [mention] = useMention(event);
	const botSelf = await mention.findOne({ IsBot: false });
	const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
	const group = await groupStore.getGroup(event.GuildId, event.Platform);
	const getAvatarUrl = (user_id) => {
		return group?.group_map[user_id].avatar || useUserAvatar(user_id);
	};
	let withBaseMdTip = (fmd) => {
		return fmd.addDivider().addButton("娶群友 ", { data: "娶群友" }).addButton("抢群友@ ", { data: "抢群友" }).addButton("强娶@", { data: "强娶" }).addNewline().addButton("我对象呢 ", { data: "我对象呢" }).addButton("闹离婚 ", { data: "闹离婚" }).addButton("亲密排行", { data: "亲密排行" }).addNewline().addButton("老婆亲亲", { data: "老婆亲亲" });
	};
	if (/亲密排行(.*)/.test(event.MessageText)) {
		let pageSum = 0;
		if (ren.length > sliceNum) {
			pageSum = Math.ceil(ren.length / sliceNum);
			page = Number(event.MessageText.replace(/.*亲密排行/, "")) || 1;
			if (page > pageSum) {
				sendAtText(`超过页数啦，当前共${ren.length}对情侣哦~`, { md: withBaseMdTip });
				return;
			}
		}
		let idList = ren.map((item) => ({ ...item })).reverse();
		idList.forEach((obj, index) => {
			obj.id = index;
			obj.maleNick = group?.group_map[obj.man].nickname;
			obj.maleAvatar = group?.group_map[obj.man].avatar;
			obj.femaleNick = group?.group_map[obj.woman].nickname;
			obj.femaleAvatar = group?.group_map[obj.woman].avatar;
		});
		idList = favorRank(idList);
		let currentUserId = -1;
		if (event.MessageText == "亲密排行") {
			currentUserId = idList.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
			if (currentUserId != -1) {
				page = Math.ceil(currentUserId / sliceNum) || 1;
				currentUserId = currentUserId - (page - 1) * sliceNum;
			}
		}
		let data1 = {
			list: idList.slice((page - 1) * sliceNum, page * sliceNum),
			currentUserId,
			currentPage: page,
			sliceNum,
			loverSum: ren.length
		};
		let img = await Pictures("loverRank", { data: data1 });
		if (typeof img != "boolean") await sendAtImage(img, pageSum > 1 ? { md: (fmd) => fmd.addText(`您还可以发送【`).addButton("亲密排行2", { data: "亲密排行2" }).addText("】查看其他情侣~") } : void 0);
		else sendAtText("图片加载失败");
		next();
		return;
	}
	if (/^(\/|#)?抢群友(.*)/.test(event.MessageText)) {
		let user_id2 = atUser?.UserId;
		if (user_id2 == void 0) {
			sendAtText(`\n你想抢空气吗？要@群友再发送哦~`, { md: withBaseMdTip });
			return;
		}
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		let i3 = ren.findIndex((item) => item.man == user_id2) + 1;
		let i4 = ren.findIndex((item) => item.woman == user_id2) + 1;
		if (i1 > 0 || i2 > 0) {
			await sendAtText(`你都已经有对象了，还想抢呢？搞啥呢这是，三妻四妾是吧？爬！`, { md: withBaseMdTip });
			return;
		}
		if (i3 + i4 == 0) {
			await sendAtText(`\n她还没有对象呢，你直接强娶就好了呀~`, { md: withBaseMdTip });
			return;
		}
		let gailv = Math.floor(Math.random() * 100);
		let zuiLevel = 50;
		let currentRen = i3 > 0 ? i3 : i4 - 1;
		if (currentRen > -1) {
			if (ren[currentRen].favor >= 100) zuiLevel = 100;
			else zuiLevel += Math.ceil(.5 * ren[currentRen].favor);
		}
		if (gailv < zuiLevel) {
			await sendAtText(`\n没抢到哦，你要抢的对象当前亲密值为${ren[currentRen].favor}，抢到成功概率为 50 - ${ren[currentRen].favor} / 2 = ${(50 - ren[currentRen].favor * .5).toFixed(2)}%！`, { md: withBaseMdTip });
			return;
		}
		if (i3 > 0) ren.splice(i3 - 1, 1);
		if (i4 > 0) ren.splice(i4 - 1, 1);
		let dx = {
			man: event.UserId,
			woman: user_id2,
			favor: 0
		};
		ren.push(dx);
		let a = getAvatarUrl(user_id2);
		await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你成功的抢到了她 `).addMention(user_id2).addText(` 运气不错嘛~`)) });
		return;
	}
	if (/我对象呢|今日老婆/.test(event.MessageText)) {
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 == 0 && i2 == 0) {
			await sendAtText(`\n醒醒吧，你还没对象呢！`, { md: withBaseMdTip });
			return;
		}
		if (i1 > 0) {
			let a = getAvatarUrl(ren[i1 - 1].woman);
			await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老婆是 `).addMention(`${ren[i1 - 1].woman}`).addText(`\n看好她哦，别让她被抢走了~`)) });
			return;
		}
		if (i2 > 0) {
			let a = getAvatarUrl(ren[i2 - 1].man);
			await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老公是 `).addMention(`${ren[i2 - 1].man}`).addText(`\n看好ta哦，别让ta被抢走了~`)) });
			return;
		}
		return;
	}
	if (/闹离婚/.test(event.MessageText)) {
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 == 0 && i2 == 0) {
			sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
			return;
		}
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				ren.splice(i1 - 1, 1);
				await sendAtText(`\n没想到你们走到了这一步，那就将来再会吧~`, { md: withBaseMdTip });
			}
			if (i2 != 0) {
				ren.splice(i2 - 1, 1);
				await sendAtText(`\n没想到你们走到了这一步，那就将来再会吧~`, { md: withBaseMdTip });
			}
			return;
		}
	}
	if (/强娶/.test(event.MessageText)) {
		user_id2 = atUser?.UserId;
		if (user_id2 == void 0) {
			await sendAtText(`\n真可惜，娶老婆失败了，嘤嘤嘤，要@群友再发送哦~`, { md: withBaseMdTip });
			return;
		}
		if (event.UserId == user_id2) {
			await sendAtText(`\n你个自恋狂，是想自己和自己结婚吗？真够离谱的~`, { md: withBaseMdTip });
			return;
		}
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (ren.findIndex((item) => item.man == user_id2) + 1 + (ren.findIndex((item) => item.woman == user_id2) + 1) != 0) {
			await sendAtText(`\n她今天已经被娶走了，你想干嘛呢~`, { md: withBaseMdTip });
			return;
		}
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				let a = getAvatarUrl(ren[i1 - 1].woman);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经有老婆啦 `).addMention(`${ren[i1 - 1].woman}`).addText(`\n别三心二意了！好好珍惜她！`)) });
				return;
			}
			if (i2 != 0) {
				let a = getAvatarUrl(ren[i2 - 1].man);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经被他娶走啦 `).addMention(`${ren[i2 - 1].man}`).addText(`\n别三心二意了！好好珍惜他~ `)) });
				return;
			}
		}
		let dx = {
			man: event.UserId,
			woman: user_id2,
			favor: 0
		};
		ren.push(dx);
		let a = getAvatarUrl(user_id2);
		await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老婆是 `).addMention(`${user_id2}`).addText(`\n看好她哦，别让她被抢走了。`)) });
		return;
	}
	if (/娶群友/.test(event.MessageText)) {
		let i1 = 0;
		let i2 = 0;
		if (Math.floor(Math.random() * 100) < 20) {
			await sendAtText(`\n真可惜，娶老婆失败了，嘤嘤嘤~ `, { md: withBaseMdTip });
			return;
		}
		i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				let a = getAvatarUrl(ren[i1 - 1].woman);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经有老婆啦 `).addMention(ren[i1 - 1].woman).addText(`\n别三心二意了！好好珍惜她！`)) });
			}
			if (i2 != 0) {
				let a = getAvatarUrl(ren[i2 - 1].man);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经被他娶走啦 `).addMention(ren[i2 - 1].man).addText(`\n别三心二意了！好好珍惜他！`)) });
			}
			return;
		}
		let mmap = (await groupStore.getGroup(event.GuildId, event.Platform))?.group_map;
		let arrMember = Array.from(Object.values(mmap || {}));
		let n = Math.floor(Math.random() * arrMember.length);
		i1 = ren.findIndex((item) => item.man == arrMember[n].user_id) + 1;
		i2 = ren.findIndex((item) => item.woman == arrMember[n].user_id) + 1;
		if (i1 + i2 != 0) {
			arrMember[n].user_id;
			await sendAtText(`\n你娶到的人是 ${group?.group_map[arrMember[n].user_id].nickname} \n但是她已经被娶走了!`, { md: withBaseMdTip });
			return;
		}
		if (event.UserId == arrMember[n].user_id) {
			await sendAtText(`\n你今天是单身贵族哦~`, { md: withBaseMdTip });
			return;
		}
		let dx = {
			man: event.UserId,
			woman: arrMember[n].user_id,
			favor: 0
		};
		ren.push(dx);
		await sendAtText(`\n你今天的老婆是 `, { md: (fmd) => withBaseMdTip(fmd.addMention(`${arrMember[n].user_id}`).addText(`\n看好她哦，别让她被抢走了~`)) });
	}
	if (/老婆亲亲|老婆羞羞|老婆打你|老婆逛街|老婆做饭|亲密排行(.*)/.test(event.MessageText)) {
		let currentId = ren.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
		if (currentId == -1) {
			await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
			return;
		} else {
			if (favorCd[event.UserId]) {
				let currentTime = Date.now() - favorCd[event.UserId].start;
				sendAtText(`你还有${favorCd[event.UserId].cd - Math.floor(currentTime / 1e3)}秒cd来提升好感,基础cd为20s，最长为2分钟，好感度越高，cd越长哦~\npass: 🚫禁止恶意重复刷指令，一经发现拉黑处理!`);
				return;
			}
			if (!ren[currentId].favor) ren[currentId].favor;
			let partner = ren[currentId].woman == event.UserId ? ren[currentId].man : ren[currentId].woman;
			getAvatarUrl(partner);
			let withTip = (fmd) => {
				return fmd.addNewline().addText(`当前亲密值为 ${ren[currentId].favor} \n`).addText(`你还可以通过以下方式来提升和伴侣亲密度：`).addDivider().addButton("【老婆亲亲】", { data: "老婆亲亲" }).addText(`  0.2~0.5 ↑ \n`).addButton("【老婆羞羞】", { data: "老婆羞羞" }).addText(`  0.4~0.7 ↑ \n`).addButton("【老婆逛街】", { data: "老婆逛街" }).addText(`  0.6~0.9 ↑ \n`).addButton("【老婆做饭】", { data: "老婆做饭" }).addText(`  0.6~0.5 ↓ \n`).addButton("【老婆打你】", { data: "老婆打你" }).addText(`  -> 0 👊\n`).addDivider().addButton("娶群友 ", { data: "娶群友" }).addButton("抢群友@ ", { data: "抢群友" }).addButton("强娶@", { data: "强娶" }).addNewline().addButton("我对象呢 ", { data: "我对象呢" }).addButton("闹离婚 ", { data: "闹离婚" }).addButton("亲密排行", { data: "亲密排行" });
			};
			let randomFavor = 0;
			if (/老婆亲亲/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .2).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
			} else if (/老婆羞羞/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .4).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
			} else if (/老婆打你/.test(event.MessageText)) {
				ren[currentId].favor = 0;
				await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n坏蛋！你和 `).addMention(partner).addText(` 的恩爱值变鸭蛋了！！！`)) });
			} else if (/老婆做饭/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .5).toFixed(2));
				if (ren[currentId].favor < randomFavor) ren[currentId].favor = 0;
				else ren[currentId].favor = Number((ren[currentId].favor - randomFavor).toFixed(2));
				await sendAtText("", { md: (fmd) => withTip(fmd.addText(`哼！竟然让对象做饭，你和 `).addMention(partner).addText(` 的恩爱值减少了${randomFavor} !!!`)) });
			} else if (/老婆逛街/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .6).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
			}
			favorCd[event.UserId] = {};
			favorCd[event.UserId].cd = 20 + Math.floor(Math.random() * ren[currentId].favor);
			if (favorCd[event.UserId].cd > 120) favorCd[event.UserId].cd = 120;
			console.log(favorCd[event.UserId].cd);
			favorCd[event.UserId].start = Date.now();
			setTimeout(async () => {
				delete favorCd[event.UserId];
			}, favorCd[event.UserId].cd * 1e3);
		}
	}
	writeFileSync(marryDataPath, JSON.stringify({ ren }), "utf-8");
}, "message.create");
function favorRank(arr) {
	return arr.slice().sort((a, b) => b.favor - a.favor);
}

//#endregion
export { res_default as default };