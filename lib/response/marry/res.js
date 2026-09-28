import { useUserAvatar } from "../../hooks/bot.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { requestBuffer } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { useEventStore } from "../../store/eventStore.js";
import "../../store/index.js";
import { getPartner } from "./utils/pair.js";
import { createMarriage, divorce, findMarriageByUser, hasMarriage, stealMarriage } from "./service/marriage.js";
import { applyFavor } from "./service/favor.js";
import { getRankPage } from "./service/rank.js";
import { withBaseMdTip, withFavorTip } from "./ui/tips.js";
import { ResultCode, useMention } from "alemonjs";

//#region src/response/marry/res.ts
/**
* 娶群友（SQLite 重构版）
*/
const sliceNum = 25;
var res_default = OnResponse(async (event, next) => {
	if (!/^(\/|#)?((娶|嫁)群友|闹离婚|确认离婚|强(娶|嫁)|我对象呢|抢群友|亲密排行|(老婆|老公)(亲亲|羞羞|打你|做饭|买买))/.test(event.MessageText)) {
		next();
		return;
	}
	await useErrorContext(async () => {
		if (!event.GuildId) {
			await sendAtText("仅在群聊可用！");
			return;
		}
		const store = useEventStore();
		const group = await store.getGroup();
		const getAvatarUrl = async (userId) => {
			return (await store.findMember({
				GuildId: event.GuildId,
				UserId: userId
			}))?.avatar || useUserAvatar(userId);
		};
		const replyWithPartnerAvatar = async (partnerId, buildFmd) => {
			const avatar = await getAvatarUrl(partnerId);
			await sendAtImage(await requestBuffer(avatar), { md: (fmd) => buildFmd(withBaseMdTip(fmd)) });
		};
		const [mention] = useMention(event);
		const botSelf = await mention.findOne({ IsBot: false });
		const atId = (botSelf.code == ResultCode.Ok ? botSelf.data : null)?.UserId;
		if (/亲密排行/.test(event.MessageText)) {
			const memberMap = group?.members || {};
			const mergedMap = {
				...await store.getUsers(),
				...memberMap
			};
			const pageMatch = event.MessageText.match(/亲密排行\s*(\d+)/);
			const requestPage = pageMatch ? Number(pageMatch[1]) || 1 : 0;
			const { list, rowIndexInPage, currentPage, pageSum } = getRankPage(requestPage, sliceNum, mergedMap, event.UserId);
			if (pageMatch && Number(pageMatch[1]) > pageSum) {
				await sendAtText(`超过页数啦，当前共 ${pageSum} 页哦~`, { md: withBaseMdTip });
				return;
			}
			const data1 = {
				list,
				currentUserId: rowIndexInPage,
				currentPage,
				sliceNum,
				loverSum: list.length
			};
			const img = await Pictures("loverRank", { data: data1 });
			if (typeof img !== "boolean") await sendAtImage(img, pageSum > 1 ? { md: (fmd) => fmd.addText(`您还可以发送【`).addButton("亲密排行2", { data: "亲密排行2" }).addText("】查看其他情侣~") } : void 0);
			else await sendAtText("图片加载失败");
			return;
		}
		if (/我对象呢/.test(event.MessageText)) {
			const marriage = findMarriageByUser(event.UserId);
			if (!marriage) {
				await sendAtText(`\n醒醒吧，你还没对象呢！`, { md: withBaseMdTip });
				return;
			}
			const partner = getPartner(marriage, event.UserId);
			if (!group?.members[partner]) {
				await sendAtText(`\n你的对象不在本群哦，可发送【闹离婚】后重新绑定！\n注意：离婚后你和她将分走一半共同财产`, { md: withBaseMdTip });
				return;
			}
			await replyWithPartnerAvatar(partner, (fmd) => fmd.addText(`\n你今天的老婆/老公是 `).addMention(partner).addText(`\n看好ta哦，别让ta被抢走了~`));
			return;
		}
		if (/强(娶|嫁)/.test(event.MessageText)) {
			if (!atId) {
				await sendAtText(`\n真可惜，娶老婆失败了，嘤嘤嘤，要@群友再发送哦~`, { md: withBaseMdTip });
				return;
			}
			if (event.UserId === atId) {
				await sendAtText(`\n你个自恋狂，是想自己和自己结婚吗？真够离谱的~`, { md: withBaseMdTip });
				return;
			}
			if (!store.findMember({ UserId: atId })) {
				await sendAtText(`\n对方未使用本机器人，不能强娶捏~`, { md: withBaseMdTip });
				return;
			}
			const myMarriage = findMarriageByUser(event.UserId);
			if (myMarriage) {
				const partner = getPartner(myMarriage, event.UserId);
				await replyWithPartnerAvatar(partner, (fmd) => fmd.addText(`\n你今天已经有对象啦 `).addMention(partner).addText(`\n别三心二意了！`));
				return;
			}
			if (hasMarriage(atId)) {
				await sendAtText(`\n她今天已经被娶走了，你想干嘛呢~`, { md: withBaseMdTip });
				return;
			}
			createMarriage(event.UserId, atId);
			await replyWithPartnerAvatar(atId, (fmd) => fmd.addText(`\n你今天的老婆是 `).addMention(atId).addText(`\n看好她哦，别让她被抢走了。`));
			return;
		}
		if (/抢群友/.test(event.MessageText)) {
			if (!atId) {
				await sendAtText(`\n你想抢空气吗？要@群友再发送哦~`, { md: withBaseMdTip });
				return;
			}
			if (!store.findMember({ UserId: atId })) {
				await sendAtText(`\n对方未使用本机器人，不能抢捏~`, { md: withBaseMdTip });
				return;
			}
			if (hasMarriage(event.UserId)) {
				await sendAtText(`你都已经有对象了，还想抢呢？搞啥呢这是，三妻四妾是吧？爬！`, { md: withBaseMdTip });
				return;
			}
			const targetMarriage = findMarriageByUser(atId);
			if (!targetMarriage) {
				await sendAtText(`\n她还没有对象呢，你直接强娶就好了呀~`, { md: withBaseMdTip });
				return;
			}
			const successRate = targetMarriage.favor >= 100 ? 0 : Math.max(0, 50 - targetMarriage.favor * .5);
			if (Math.random() * 100 >= successRate) {
				await sendAtText(`\n没抢到哦，你要抢的对象当前亲密值为${targetMarriage.favor?.toFixed(2)}，抢到成功概率为 ${successRate.toFixed(2)}%！`, { md: withBaseMdTip });
				return;
			}
			stealMarriage(event.UserId, atId, targetMarriage.marriageId);
			await replyWithPartnerAvatar(atId, (fmd) => fmd.addText(`\n你成功的抢到了她 `).addMention(atId).addText(` 运气不错嘛~`));
			return;
		}
		if (/闹离婚/.test(event.MessageText)) {
			const marriage = findMarriageByUser(event.UserId);
			if (!marriage) {
				await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
				return;
			}
			const a = group?.members[marriage.spouseA];
			const b = group?.members[marriage.spouseB];
			const agreement = `【离婚协议书】\n甲方：${a?.username}\n乙方：${b?.username}\n双方于 ${/* @__PURE__ */ new Date()} 离婚：\n一、双方自愿离婚。\n二、婚姻存续期间无共同财产，婚前财产归各自所有。\n三、无共同债务，任何一方对外负债，由负债方承担。\n四、共同财产在【确认离婚】时各自分得一半。\n五、亲密值将在【确认离婚】时【清零】`;
			await sendAtText(agreement, {
				md: withBaseMdTip,
				btns: (fbg) => fbg.addRow().addButton("确认离婚", "确认离婚")
			});
			return;
		}
		if (/确认离婚/.test(event.MessageText)) {
			if (!divorce(event.UserId)) {
				await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
				return;
			}
			await sendAtText(`\n没想到你们走到了这一步，那就将来再会吧~`, { md: withBaseMdTip });
			return;
		}
		if (/(娶|嫁)群友/.test(event.MessageText)) {
			const myMarriage = findMarriageByUser(event.UserId);
			if (myMarriage) {
				const partner = getPartner(myMarriage, event.UserId);
				await replyWithPartnerAvatar(partner, (fmd) => fmd.addText(`\n你今天已经有对象啦 `).addMention(partner).addText(`\n别三心二意了！`));
				return;
			}
			const members = group?.members || {};
			const singles = Object.keys(members).filter((id) => id !== event.UserId && !hasMarriage(id));
			if (singles.length === 0) {
				await sendAtText(`\n群里已经没有单身的人啦，你今天是单身贵族哦~`, { md: withBaseMdTip });
				return;
			}
			const picked = singles[Math.floor(Math.random() * singles.length)];
			const [userA, userB] = /娶群友/.test(event.MessageText) ? [event.UserId, picked] : [picked, event.UserId];
			createMarriage(userA, userB);
			await sendAtText(`\n你今天的老婆是 `, { md: (fmd) => withBaseMdTip(fmd.addMention(picked).addText(`\n看好ta哦，别让ta被抢走了~`)) });
			return;
		}
		const favorMatch = event.MessageText.match(/(老婆|老公)(亲亲|羞羞|打你|做饭|买买)/);
		if (favorMatch) {
			const action = {
				亲亲: "kiss",
				羞羞: "shy",
				买买: "shopping",
				做饭: "cook",
				打你: "hit"
			}[favorMatch[2]];
			const marriage = findMarriageByUser(event.UserId);
			if (!marriage) {
				await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
				return;
			}
			const partner = getPartner(marriage, event.UserId);
			let result;
			try {
				result = applyFavor(event.UserId, action);
			} catch (e) {
				if (e.message === "IN_CD") {
					await sendAtText(`你还有${e.left}秒cd来提升好感,基础cd为20s，最长为2分钟，好感度越高，cd越长哦~\npass: 🚫禁止恶意重复刷指令，一经发现拉黑处理!`);
					return;
				}
				throw e;
			}
			if (!result) {
				await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
				return;
			}
			const tipMap = {
				kiss: `\n恭喜！你和 `,
				shy: `\n恭喜！你和 `,
				shopping: `\n恭喜！你和 `,
				cook: `哼！竟然让对象做饭，你和 `,
				hit: `\n坏蛋！你和 `
			};
			const suffixMap = {
				kiss: ` 的恩爱值增加了${result.delta}捏~`,
				shy: ` 的恩爱值增加了${result.delta}捏~`,
				shopping: ` 的恩爱值增加了${result.delta}捏~`,
				cook: ` 的恩爱值减少了${Math.abs(result.delta)} !!!`,
				hit: ` 的恩爱值变鸭蛋了！！！`
			};
			await sendAtText("", { md: (fmd) => withFavorTip(fmd.addText(tipMap[action]).addMention(partner).addText(suffixMap[action]), result.favor, partner) });
			return;
		}
	});
}, "message.create");

//#endregion
export { res_default as default };