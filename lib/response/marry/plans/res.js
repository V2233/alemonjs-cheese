import { pluginInfo } from "../../../package.js";
import { requestBuffer } from "../../../utils/index.js";
import { Pictures } from "../../../image/index.js";
import { useEventStore } from "../../../store/eventStore.js";
import "../../../store/index.js";
import { useUserAvatar } from "../../../hooks/bot.js";
import { useErrorContext } from "../../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../../hooks/send.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ResultCode, useMention } from "alemonjs";

//#region src/response/marry/plans/res.ts
/**
* 娶群员升级版(源Earth-K-Plugin)
*/
const marryDataPath = join(pluginInfo.DATA_PATH, "marryDB.json");
if (!existsSync(marryDataPath)) writeFileSync(marryDataPath, JSON.stringify({ marriages: [] }), "utf-8");
let marryDB = JSON.parse(readFileSync(marryDataPath, "utf8"));
let marriages = marryDB.marriages || marryDB.ren;
marriages.forEach((marriage) => {
	if (marriage.favor === null || marriage.favor === void 0) marriage.favor = 0;
});
let user_id2 = "";
let page = 1;
let sliceNum = 25;
let favorCd = {};
let platformTip = false;
var res_default = OnResponse(async (event, next) => {
	if (!/^(\/|#)?(娶|嫁)群友|闹离婚|确认离婚|强(娶|嫁)(.*)|我对象呢|抢群友(.*)|亲密排行(.*)|(老婆|老公)(亲亲|羞羞|打你|做饭|买买(.*))/.test(event.MessageText)) {
		next();
		return;
	}
	await useErrorContext(async () => {
		if (!event.GuildId) {
			await sendAtText("仅在群聊可用！");
			return;
		}
		if (event.Platform !== "qq-bot" && !platformTip) {
			await sendAtText("本功能仅推荐在qq-bot平台获得最佳体验！");
			platformTip = true;
		}
		const [mention] = useMention(event);
		const botSelf = await mention.findOne({ IsBot: false });
		const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
		const store = useEventStore();
		const group = await store.getGroup();
		const getAvatarUrl = async (user_id) => {
			return (await store.findMember({
				GuildId: event.GuildId,
				UserId: user_id
			}))?.avatar || useUserAvatar(user_id);
		};
		let withBaseMdTip = (fmd) => {
			return fmd.addDivider().addButton("娶群友", { data: "娶群友" }).addText(" | ").addButton("抢群友@ ", { data: "抢群友" }).addText(" | ").addButton("强娶@", { data: "强娶" }).addNewline().addButton("我对象呢", { data: "我对象呢" }).addText(" | ").addButton("闹离婚", { data: "闹离婚" }).addText(" | ").addButton("亲密排行", { data: "亲密排行" }).addNewline().addButton("老婆亲亲", { data: "老婆亲亲" });
		};
		if (/亲密排行(.*)/.test(event.MessageText)) {
			let pageSum = Math.ceil(marriages.length / sliceNum);
			const pageMatch = event.MessageText.match(/.*亲密排行\s*(\d+)/);
			if (pageMatch) {
				page = Number(pageMatch[1] || 1);
				if (page > pageSum) {
					await sendAtText(`超过页数啦，当前共 ${pageSum} 页哦~`, { md: withBaseMdTip });
					return;
				}
			}
			const allGroupUsers = await store.getUsers();
			let idList = marriages.map((item) => ({ ...item })).reverse();
			idList.forEach((obj, index) => {
				const man = group?.members[obj.man] || allGroupUsers[obj.man] || {};
				const woman = group?.members[obj.woman] || allGroupUsers[obj.woman] || {};
				obj.id = index;
				obj.maleNick = man.username;
				obj.maleAvatar = man.avatar;
				obj.femaleNick = woman.username;
				obj.femaleAvatar = woman.avatar;
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
				loverSum: marriages.length
			};
			let img = await Pictures("loverRank", { data: data1 });
			if (typeof img != "boolean") await sendAtImage(img, pageSum > 1 ? { md: (fmd) => fmd.addText(`您还可以发送【`).addButton("亲密排行2", { data: "亲密排行2" }).addText("】查看其他情侣~") } : void 0);
			else await sendAtText("图片加载失败");
			next();
			return;
		}
		if (/^(\/|#)?抢群友(.*)/.test(event.MessageText)) {
			let user_id2 = atUser?.UserId;
			if (user_id2 == void 0) {
				await sendAtText(`\n你想抢空气吗？要@群友再发送哦~`, { md: withBaseMdTip });
				return;
			}
			if (!store.findMember({ UserId: user_id2 })) {
				await sendAtText(`\n对方未使用本机器人，不能抢捏~`, { md: withBaseMdTip });
				return;
			}
			let i1 = 0;
			let i2 = 0;
			marriages.forEach((marriage, i) => {
				if (marriage.man == event.UserId) i1 = i + 1;
				if (marriage.woman === event.UserId) i2 = i + 1;
				if (marriage.man === user_id2) i2 = 1;
				if (marriage.woman === user_id2) i2 = 1;
			});
			if (i1 > 0 || i2 > 0) {
				await sendAtText(`你都已经有对象了，还想抢呢？搞啥呢这是，三妻四妾是吧？爬！`, { md: withBaseMdTip });
				return;
			}
			await sendAtText(`\n她还没有对象呢，你直接强娶就好了呀~`, { md: withBaseMdTip });
			return;
		}
		if (/我对象呢/.test(event.MessageText)) {
			const marriage = marriages.find((item) => item.man == event.UserId || item.woman == event.UserId);
			if (!marriage) {
				await sendAtText(`\n醒醒吧，你还没对象呢！`, { md: withBaseMdTip });
				return;
			}
			if (marriage.man == event.UserId) {
				if (!group?.members[marriage.woman]) {
					await sendAtText(`\n你老婆不在本群哦，可发送【闹离婚】后重新绑定！\n注意：离婚后你和她将分走一半共同财产`, { md: withBaseMdTip });
					return;
				}
				let a = await getAvatarUrl(marriage.woman);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老婆是 `).addMention(`${marriage.woman}`).addText(`\n看好她哦，别让ta被抢走了~`)) });
			} else {
				if (!group?.members[marriage.woman]) {
					await sendAtText(`\n你老公不在本群哦，可发送【闹离婚】后重新绑定！`, { md: withBaseMdTip });
					return;
				}
				let a = await getAvatarUrl(marriage.man);
				await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老公是 `).addMention(`${marriage.man}`).addText(`\n看好ta哦，别让ta被抢走了~`)) });
			}
			return;
		}
		if (/闹离婚/.test(event.MessageText)) {
			const marriageIndex = marriages.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
			if (marriageIndex == -1) {
				await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
				return;
			}
			const maleInfo = await store.findMember({ UserId: marriages[marriageIndex].man });
			const femaleInfo = await store.findMember({ UserId: marriages[marriageIndex].woman });
			let divorceAgreement = `【离婚协议书】\n男方：${maleInfo?.username}\n女方：${femaleInfo?.username}\n男女双方于 ${/* @__PURE__ */ new Date()} 离婚：\n一、男女双方自愿离婚。\n二、男女双方在婚姻存续期间无共同财产，婚前双方各自财产归各自所有。\n三、双方确认在婚姻关系存续期间没有发生任何共同债务，任何一方如对外负有债务的，由负债方自行承担。\n四、男女双方在婚姻存续期间的共同财产将在【确认离婚】时各自分得一半。\n五、男女双方在婚姻存续期间的亲密值将在【确认离婚】时【清零】`;
			await sendAtText(divorceAgreement, {
				md: withBaseMdTip,
				btns: (fbg) => fbg.addRow().addButton("确认离婚", "确认离婚")
			});
			return;
		}
		if (/确认离婚/.test(event.MessageText)) {
			const marriageIndex = marriages.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
			if (marriageIndex == -1) {
				await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
				return;
			}
			marriages.splice(marriageIndex, 1);
			await sendAtText(`\n没想到你们走到了这一步，那就将来再会吧~`, { md: withBaseMdTip });
			return;
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
			if (!store.findMember({ UserId: user_id2 })) {
				await sendAtText(`\n对方未使用本机器人，不能强娶捏~`, { md: withBaseMdTip });
				return;
			}
			let i1 = 0;
			let i2 = 0;
			marriages.forEach((couple, i) => {
				if (couple.man == event.UserId) i1 = i + 1;
				if (couple.woman === event.UserId) i2 = i + 1;
				if (couple.man === user_id2) i2 = 1;
				if (couple.woman === user_id2) i2 = 1;
			});
			if (i1 + i2 != 0) {
				if (i1 != 0) {
					let a = await getAvatarUrl(marriages[i1 - 1].woman);
					await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经有老婆啦 `).addMention(`${marriages[i1 - 1].woman}`).addText(`\n别三心二意了！好好珍惜她！`)) });
					return;
				}
				if (i2 != 0) {
					let a = await getAvatarUrl(marriages[i2 - 1].man);
					await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经被他娶走啦 `).addMention(`${marriages[i2 - 1].man}`).addText(`\n别三心二意了！好好珍惜他~ `)) });
					return;
				}
			}
			let dx = {
				man: event.UserId,
				woman: user_id2,
				favor: 0
			};
			marriages.push(dx);
			let a = await getAvatarUrl(user_id2);
			await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天的老婆是 `).addMention(`${user_id2}`).addText(`\n看好她哦，别让她被抢走了。`)) });
			return;
		}
		let messageMatchRes;
		if (messageMatchRes = event.MessageText.match(/(娶|嫁)群友/)) {
			let i1 = 0;
			let i2 = 0;
			i1 = marriages.findIndex((item) => item.man == event.UserId) + 1;
			i2 = marriages.findIndex((item) => item.woman == event.UserId) + 1;
			if (i1 + i2 != 0) {
				if (i1 != 0) {
					let a = await getAvatarUrl(marriages[i1 - 1].woman);
					await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经有老婆啦 `).addMention(marriages[i1 - 1].woman).addText(`\n别三心二意了！好好珍惜她！`)) });
				}
				if (i2 != 0) {
					let a = await getAvatarUrl(marriages[i2 - 1].man);
					await sendAtImage(await requestBuffer(a), { md: (fmd) => withBaseMdTip(fmd.addText(`\n你今天已经被他娶走啦 `).addMention(marriages[i2 - 1].man).addText(`\n别三心二意了！好好珍惜他！`)) });
				}
				return;
			}
			let arrMember = Array.from(Object.values(group?.members || {}));
			let n = Math.floor(Math.random() * arrMember.length);
			i1 = marriages.findIndex((item) => item.man == arrMember[n].user_id) + 1;
			i2 = marriages.findIndex((item) => item.woman == arrMember[n].user_id) + 1;
			if (i1 + i2 != 0) {
				await sendAtText(`\n你娶到的人是 ${group?.members[arrMember[n].user_id].nickname} \n但是她已经被娶走了!`, { md: withBaseMdTip });
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
			if (messageMatchRes[1] == "嫁") {
				dx.woman = event.UserId;
				dx.man = arrMember[n].user_id;
			}
			marriages.push(dx);
			await sendAtText(`\n你今天的老婆是 `, { md: (fmd) => withBaseMdTip(fmd.addMention(`${arrMember[n].user_id}`).addText(`\n看好她哦，别让她被抢走了~`)) });
		}
		if (/(老婆|老公)(亲亲|羞羞|打你|做饭|买买(.*))/.test(event.MessageText)) {
			let currentId = marriages.findIndex((item) => item.man == event.UserId || item.woman == event.UserId);
			if (currentId == -1) {
				await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
				return;
			} else {
				if (favorCd[event.UserId]) {
					let currentTime = Date.now() - favorCd[event.UserId].start;
					await sendAtText(`你还有${favorCd[event.UserId].cd - Math.floor(currentTime / 1e3)}秒cd来提升好感,基础cd为20s，最长为2分钟，好感度越高，cd越长哦~\npass: 🚫禁止恶意重复刷指令，一经发现拉黑处理!`);
					return;
				}
				if (!marriages[currentId].favor) marriages[currentId].favor;
				let partner = marriages[currentId].woman == event.UserId ? marriages[currentId].man : marriages[currentId].woman;
				let withTip = (fmd) => {
					return fmd.addNewline().addText(`当前亲密值为 ${marriages[currentId].favor} \n`).addText(`你还可以通过以下方式来提升和伴侣亲密度：`).addDivider().addButton("【老婆亲亲】", { data: "老婆亲亲" }).addText(`  0.2~0.5 ↑ \n`).addButton("【老婆羞羞】", { data: "老婆羞羞" }).addText(`  0.4~0.7 ↑ \n`).addButton("【老婆买买】", { data: "老婆买买" }).addText(`  0.6~0.9 ↑ \n`).addButton("【老婆做饭】", { data: "老婆做饭" }).addText(`  0.6~0.5 ↓ \n`).addButton("【老婆打你】", { data: "老婆打你" }).addText(`  -> 0 👊\n`).addDivider().addButton("娶群友 ", { data: "娶群友" }).addText(" | ").addButton("抢群友@ ", { data: "抢群友" }).addText(" | ").addButton("强娶@", { data: "强娶" }).addNewline().addButton("我对象呢 ", { data: "我对象呢" }).addText(" | ").addButton("闹离婚 ", { data: "闹离婚" }).addText(" | ").addButton("亲密排行", { data: "亲密排行" });
				};
				let randomFavor = 0;
				if (/(老婆|老公)亲亲/.test(event.MessageText)) {
					randomFavor = Number((Math.random() * .3 + .2).toFixed(2));
					marriages[currentId].favor = Number((randomFavor + marriages[currentId].favor).toFixed(2));
					await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
				} else if (/(老婆|老公)羞羞/.test(event.MessageText)) {
					randomFavor = Number((Math.random() * .3 + .4).toFixed(2));
					marriages[currentId].favor = Number((randomFavor + marriages[currentId].favor).toFixed(2));
					if (Math.random() > .5) marriages[currentId].childs;
					await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
				} else if (/(老婆|老公)打你/.test(event.MessageText)) {
					marriages[currentId].favor = 0;
					await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n坏蛋！你和 `).addMention(partner).addText(` 的恩爱值变鸭蛋了！！！`)) });
				} else if (/(老婆|老公)做饭/.test(event.MessageText)) {
					randomFavor = Number((Math.random() * .5).toFixed(2));
					if (marriages[currentId].favor < randomFavor) marriages[currentId].favor = 0;
					else marriages[currentId].favor = Number((marriages[currentId].favor - randomFavor).toFixed(2));
					await sendAtText("", { md: (fmd) => withTip(fmd.addText(`哼！竟然让对象做饭，你和 `).addMention(partner).addText(` 的恩爱值减少了${randomFavor} !!!`)) });
				} else if (/(老婆|老公)买买/.test(event.MessageText)) {
					randomFavor = Number((Math.random() * .3 + .6).toFixed(2));
					marriages[currentId].favor = Number((randomFavor + marriages[currentId].favor).toFixed(2));
					await sendAtText("", { md: (fmd) => withTip(fmd.addText(`\n恭喜！你和 `).addMention(partner).addText(` 的恩爱值增加了${randomFavor}捏~`)) });
				}
				favorCd[event.UserId] = {};
				favorCd[event.UserId].cd = 20 + Math.floor(Math.random() * marriages[currentId].favor);
				if (favorCd[event.UserId].cd > 120) favorCd[event.UserId].cd = 120;
				console.log(favorCd[event.UserId].cd);
				favorCd[event.UserId].start = Date.now();
				setTimeout(async () => {
					delete favorCd[event.UserId];
				}, favorCd[event.UserId].cd * 1e3);
			}
		}
		writeFileSync(marryDataPath, JSON.stringify({ marriages }), "utf-8");
	});
}, "message.create");
function favorRank(arr) {
	return arr.slice().sort((a, b) => b.favor - a.favor);
}

//#endregion
export { res_default as default };