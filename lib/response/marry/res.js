import { pluginInfo } from "../../package.js";
import { requestBuffer } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { groupStore } from "../store/res.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Image, Mention, ResultCode, Text, useMention, useSend } from "alemonjs";

//#region src/response/marry/res.ts
/**
* 娶群员升级版(源Earth-K-Plugin)
*/
const marryDataPath = join(pluginInfo.DATA_PATH, "marryDB.json");
if (!existsSync(marryDataPath)) writeFileSync(marryDataPath, JSON.stringify({
	ren: [],
	renmin: []
}), "utf-8");
let marryDB = JSON.parse(readFileSync(marryDataPath, "utf8"));
let ren = marryDB.ren;
let renmin = marryDB.renmin;
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
	const Send = useSend(event);
	const [mention] = useMention(event);
	const botSelf = await mention.findOne({ IsBot: false });
	const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
	let tips = `\n-------------------------\n您还可以发送【娶群友】【抢群友@】【强娶@】【我对象呢】【闹离婚】【亲密排行】【老婆亲亲】【老婆羞羞】【老婆做饭】【老婆打你】【老婆逛街】`;
	if (/亲密排行(.*)/.test(event.MessageText)) {
		let pageSum = 0;
		if (ren.length > sliceNum) {
			pageSum = Math.ceil(ren.length / sliceNum);
			page = Number(event.MessageText.replace(/.*亲密排行/, "")) || 1;
			if (page > pageSum) {
				Send(Text(`超过页数啦，当前共${ren.length}对情侣哦~`));
				return;
			}
		}
		let idList = ren.slice().reverse();
		idList.forEach((obj, index) => obj.id = index);
		idList = favorRank(idList);
		let nickList = idList.map((item) => renmin.slice().reverse()[item.id]);
		let currentUserId = -1;
		if (event.MessageText == "亲密排行") {
			currentUserId = idList.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
			if (currentUserId != -1) {
				page = Math.ceil(currentUserId / sliceNum) || 1;
				currentUserId = currentUserId - (page - 1) * sliceNum;
			}
		}
		let data1 = {
			renmin: nickList.slice((page - 1) * sliceNum, page * sliceNum),
			ren: idList.slice((page - 1) * sliceNum, page * sliceNum),
			currentUserId,
			currentPage: page,
			sliceNum,
			loverSum: ren.length
		};
		let img = await Pictures("loverRank", { data: data1 });
		if (typeof img != "boolean") await Send(Mention(event.UserId), Image(img), Text(`您还可以发送【亲密排行2】查看其他情侣~`));
		else Send(Text("图片加载失败"));
		next();
		return;
	}
	if (/^(\/|#)?抢群友(.*)/.test(event.MessageText)) {
		let user_id2 = atUser?.UserId;
		let name = atUser?.UserName || "";
		if (user_id2 == void 0) {
			await Send(Mention(event.UserId), Text(`\n你想抢空气吗？要@群友再发送哦~${tips}`));
			return;
		}
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		let i3 = ren.findIndex((item) => item.man == user_id2) + 1;
		let i4 = ren.findIndex((item) => item.woman == user_id2) + 1;
		if (i1 > 0 || i2 > 0) {
			await Send(Mention(event.UserId), Text(`你都已经有对象了，还想抢呢？搞啥呢这是，三妻四妾是吧？爬！${tips}`));
			return;
		}
		if (i3 + i4 == 0) {
			await Send(Mention(event.UserId), Text(`\n她还没有对象呢，你直接强娶就好了呀~${tips}`));
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
			await Send(Mention(event.UserId), Text(`\n没抢到哦，你要抢的对象当前亲密值为${ren[currentRen].favor}，抢到成功概率为50 - ${ren[currentRen].favor} / 2 = ${(50 - ren[currentRen].favor * .5).toFixed(2)}%！${tips}`));
			return;
		}
		if (i3 > 0) {
			ren.splice(i3 - 1, 1);
			renmin.splice(i3 - 1, 1);
		}
		if (i4 > 0) {
			ren.splice(i4 - 1, 1);
			renmin.splice(i4 - 1, 1);
		}
		let dx = {
			man: event.UserId,
			woman: user_id2,
			favor: 0
		};
		let lm = {
			man: event.UserName,
			woman: name
		};
		ren.push(dx);
		renmin.push(lm);
		let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + user_id2 + "&spec=5";
		await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你成功的抢到了她！${name}\n运气不错嘛${tips}`));
		return;
	}
	if (/我对象呢|今日老婆/.test(event.MessageText)) {
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 == 0 && i2 == 0) {
			await Send(Mention(event.UserId), Text(`\n醒醒吧，你还没对象呢！${tips}`));
			return;
		}
		if (i1 > 0) {
			let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i1 - 1].woman + "&spec=5";
			await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天的老婆是${renmin[i1 - 1].woman}【${String(ren[i1 - 1].woman)}】\n看好她哦，别让她被抢走了~${tips}`));
			return;
		}
		if (i2 > 0) {
			let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i2 - 1].man + "&spec=5";
			await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天的老公是${renmin[i2 - 1].man}【${String(ren[i2 - 1].man)}】\n看好她哦，别让她被抢走了~${tips}`));
			return;
		}
		return;
	}
	if (/闹离婚/.test(event.MessageText)) {
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 == 0 && i2 == 0) {
			await Send(Mention(event.UserId), Text(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~${tips}`));
			return;
		}
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				ren.splice(i1 - 1, 1);
				renmin.splice(i1 - 1, 1);
				await Send(Mention(event.UserId), Text(`\n没想到你们走到了这一步，那就将来再会吧~${tips}`));
			}
			if (i2 != 0) {
				ren.splice(i2 - 1, 1);
				renmin.splice(i2 - 1, 1);
				await Send(Mention(event.UserId), Text(`\n没想到你们走到了这一步，那就将来再会吧~${tips}`));
			}
			return;
		}
	}
	if (/强娶/.test(event.MessageText)) {
		user_id2 = atUser?.UserId;
		if (user_id2 == void 0) {
			await Send(Mention(event.UserId), Text(`\n真可惜，娶老婆失败了，嘤嘤嘤，要@群友再发送哦~${tips}`));
			return;
		}
		if (event.UserId == user_id2) {
			await Send(Mention(event.UserId), Text(`\n你个自恋狂，是想自己和自己结婚吗？真够离谱的~${tips}`));
			return;
		}
		let name = atUser?.UserName || "";
		let i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		let i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (ren.findIndex((item) => item.man == user_id2) + 1 + (ren.findIndex((item) => item.woman == user_id2) + 1) != 0) {
			await Send(Mention(event.UserId), Text(`\n她今天已经被娶走了，你想干嘛呢~${tips}`));
			return;
		}
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i1 - 1].woman + "&spec=5";
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天已经有老婆啦${renmin[i1 - 1].woman}【${String(ren[i1 - 1].woman)}】\n别三心二意了！好好珍惜她！${tips}`));
				return;
			}
			if (i2 != 0) {
				let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i2 - 1].man + "&spec=5";
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天已经被他娶走啦${renmin[i2 - 1].man}【${String(ren[i2 - 1].man)}】\n别三心二意了！好好珍惜他~${tips}`));
				return;
			}
		}
		let dx = {
			man: event.UserId,
			woman: user_id2,
			favor: 0
		};
		let lm = {
			man: event.UserName,
			woman: name
		};
		ren.push(dx);
		renmin.push(lm);
		let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + user_id2 + "&spec=5";
		await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天的老婆是${name}【${String(user_id2)}】\n看好她哦，别让她被抢走了。${tips}`));
		return;
	}
	if (/娶群友/.test(event.MessageText)) {
		let i1 = 0;
		let i2 = 0;
		if (Math.floor(Math.random() * 100) < 20) {
			await Send(Mention(event.UserId), Text(`\n真可惜，娶老婆失败了，嘤嘤嘤~${tips}`));
			return;
		}
		i1 = ren.findIndex((item) => item.man == event.UserId) + 1;
		i2 = ren.findIndex((item) => item.woman == event.UserId) + 1;
		if (i1 + i2 != 0) {
			if (i1 != 0) {
				let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i1 - 1].woman + "&spec=5";
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天已经有老婆啦${renmin[i1 - 1].woman}【${String(ren[i1 - 1].woman)}】\n别三心二意了！好好珍惜她！${tips}`));
			}
			if (i2 != 0) {
				let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + ren[i2 - 1].man + "&spec=5";
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(`\n你今天已经被他娶走啦${renmin[i2 - 1].man}【${String(ren[i2 - 1].man)}】\n别三心二意了！好好珍惜他~${tips}`));
			}
			return;
		}
		let mmap = (await groupStore.getGroup(event.GuildId, event.Platform)).group_map;
		let arrMember = Array.from(Object.values(mmap));
		let n = Math.floor(Math.random() * arrMember.length);
		i1 = ren.findIndex((item) => item.man == arrMember[n].user_id) + 1;
		i2 = ren.findIndex((item) => item.woman == arrMember[n].user_id) + 1;
		if (i1 + i2 != 0) {
			let tempWife = { sender: { card: arrMember[n].user_id } };
			await Send(Mention(event.UserId), Text(`\n你娶到的人是${tempWife}\n但是她已经被娶走了!${tips}`));
			return;
		}
		if (event.UserId == arrMember[n].user_id) {
			await Send(Mention(event.UserId), Text(`\n你今天是单身贵族哦~${tips}`));
			return;
		}
		let dx = {
			man: event.UserId,
			woman: arrMember[n].user_id,
			favor: 0
		};
		let lm = {
			man: event.UserName,
			woman: arrMember[n].nickname
		};
		ren.push(dx);
		renmin.push(lm);
		await Send(Mention(event.UserId), Text(`\n你今天的老婆是${arrMember[n].nickname}【${String(arrMember[n].user_id)}】\n看好她哦，别让她被抢走了~${tips}`));
	}
	if (/老婆亲亲|老婆羞羞|老婆打你|老婆逛街|老婆做饭|亲密排行(.*)/.test(event.MessageText)) {
		let currentId = ren.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
		if (currentId == -1) {
			await Send(Mention(event.UserId), Text(`\n你还没对象呢，提升个锤子好感！${tips}`));
			return;
		} else {
			if (favorCd[event.UserId]) {
				let currentTime = Date.now() - favorCd[event.UserId].start;
				Send(Mention(event.UserId), Text(`你还有${favorCd[event.UserId].cd - Math.floor(currentTime / 1e3)}秒cd来提升好感,基础cd为20s，最长为2分钟，好感度越高，cd越长哦~\npass: 🚫禁止恶意重复刷指令，一经发现拉黑处理!`));
				return;
			}
			if (!ren[currentId].favor) ren[currentId].favor;
			let favorList = `\n【老婆亲亲】  亲密度：0.2~0.5 ↑ \n【老婆羞羞】  亲密度：0.4~0.7 ↑ \n【老婆逛街】  亲密度：0.6~0.9 ↑ \n【老婆做饭】  亲密度：0~0.5 ↓ \n【老婆打你】  亲密度：清0`;
			let partner = ren[currentId].woman == event.UserId ? ren[currentId].man : ren[currentId].woman;
			let a = "http://q2.qlogo.cn/headimg_dl?dst_uin=" + partner + "&spec=5";
			let sendFavor = (favorChange) => {
				return `${favorChange}\n当前亲密值为${ren[currentId].favor}，你还可以通过以下方式来提升和伴侣亲密度：\n${favorList}\n${tips}`;
			};
			let randomFavor = 0;
			if (/老婆亲亲/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .2).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(sendFavor(`恭喜！你和@${partner}的恩爱值增加了${randomFavor}捏~`)));
			} else if (/老婆羞羞/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .4).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(sendFavor(`恭喜！你和@${partner}的恩爱值增加了${randomFavor}捏~`)));
			} else if (/老婆打你/.test(event.MessageText)) {
				ren[currentId].favor = 0;
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(sendFavor(`坏蛋！你和@${partner}的恩爱值变鸭蛋了！！！`)));
			} else if (/老婆做饭/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .5).toFixed(2));
				if (ren[currentId].favor < randomFavor) ren[currentId].favor = 0;
				else ren[currentId].favor = Number((ren[currentId].favor - randomFavor).toFixed(2));
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(sendFavor(`哼！竟然让对象做饭，你和@${partner}的恩爱值减少了${randomFavor} !!!`)));
			} else if (/老婆逛街/.test(event.MessageText)) {
				randomFavor = Number((Math.random() * .3 + .6).toFixed(2));
				ren[currentId].favor = Number((randomFavor + ren[currentId].favor).toFixed(2));
				await Send(Mention(event.UserId), Image(await requestBuffer(a)), Text(sendFavor(`恭喜！你和@${partner}的恩爱值增加了${randomFavor}捏~`)));
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
	writeFileSync(marryDataPath, JSON.stringify({
		ren,
		renmin
	}), "utf-8");
}, "message.create");
function favorRank(arr) {
	return arr.slice().sort((a, b) => b.favor - a.favor);
}

//#endregion
export { res_default as default };