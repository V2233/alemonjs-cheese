/**
 * 娶群友（SQLite 重构版）
 */
import { useUserAvatar } from '@src/hooks/bot';
import { useErrorContext } from '@src/hooks/error';
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import { useEventStore } from '@src/store';
import { requestBuffer } from '@src/utils';
import { ResultCode, useEvent, useMention } from 'alemonjs';

import { applyFavor, FavorResult } from './service/favor';
import {
  createMarriage,
  divorce,
  findMarriageByUser,
  hasMarriage,
  stealMarriage,
} from './service/marriage';
import { getRankPage } from './service/rank';
import { withBaseMdTip, withFavorTip } from './ui/tips';
import { getPartner } from './utils/pair';

const sliceNum = 25;

export default async () => {
  const [event, next] = useEvent({
    regular:
      /^(\/|#)?((娶|嫁)群友|闹离婚|确认离婚|强(娶|嫁)|我对象呢|抢群友|亲密排行|(老婆|老公)(亲亲|羞羞|打你|做饭|买买))/,
    selects: ['message.create', 'private.message.create'],
  });
  if (!event.match.regular || !event.match.selects) {
    next();
    return;
  }

  await useErrorContext(async () => {
    if (event.current.IsPrivate) {
      await sendAtText('请在群聊发送！');
      return;
    }
    if (!event.current.GuildId) {
      await sendAtText('仅在群聊可用！');
      return;
    }

    const store = useEventStore();
    const group = await store.getGroup();

    const getAvatarUrl = async (userId: string) => {
      const user = await store.findMember({ GuildId: event.current.GuildId, UserId: userId });
      return user?.avatar || useUserAvatar(userId);
    };

    // ============ 通用回复：@某人并附头像 ============
    const replyWithPartnerAvatar = async (
      partnerId: string,
      buildFmd: (fmd: ReturnType<typeof withBaseMdTip>) => any
    ) => {
      const avatar = await getAvatarUrl(partnerId);
      await sendAtImage(await requestBuffer(avatar), {
        md: fmd => buildFmd(withBaseMdTip(fmd)),
      });
    };

    // ============ @ 人解析 ============
    const [mention] = useMention(event.current);
    const botSelf = await mention.findOne({ IsBot: false });
    const atUser = botSelf.code == ResultCode.Ok ? botSelf.data : null;
    const atId = atUser?.UserId;

    // ============ 亲密排行 ============
    if (/亲密排行/.test(event.current.MessageText)) {
      const memberMap = group?.members || {};
      const allUsers = await store.getUsers();
      const mergedMap = { ...allUsers, ...memberMap };

      // 计算页码：显式给了数字就用数字，否则传 0 表示「定位到我」
      const pageMatch = event.current.MessageText.match(/亲密排行\s*(\d+)/);
      const requestPage = pageMatch ? Number(pageMatch[1]) || 1 : 0;

      const { list, rowIndexInPage, currentPage, pageSum } = getRankPage(
        requestPage,
        sliceNum,
        mergedMap,
        event.current.UserId
      );

      // 越界提示
      if (pageMatch && Number(pageMatch[1]) > pageSum) {
        await sendAtText(`超过页数啦，当前共 ${pageSum} 页哦~`, { md: withBaseMdTip });
        return;
      }

      const data1 = {
        list,
        currentUserId: rowIndexInPage, // ← 传给模板的仍然是这个名字（兼容旧模板）
        currentPage,
        sliceNum,
        loverSum: list.length,
      };

      const img = await Pictures('loverRank', { data: data1 });
      if (typeof img !== 'boolean') {
        await sendAtImage(
          img,
          pageSum > 1
            ? {
                md: fmd =>
                  fmd
                    .addText(`您还可以发送【`)
                    .addButton('亲密排行2', { data: '亲密排行2' })
                    .addText('】查看其他情侣~'),
              }
            : undefined
        );
      } else {
        await sendAtText('图片加载失败');
      }
      return;
    }

    // ============ 我对象呢 ============
    if (/我对象呢/.test(event.current.MessageText)) {
      const marriage = findMarriageByUser(event.current.UserId);
      if (!marriage) {
        await sendAtText(`\n醒醒吧，你还没对象呢！`, { md: withBaseMdTip });
        return;
      }
      const partner = getPartner(marriage, event.current.UserId);
      if (!group?.members[partner]) {
        await sendAtText(
          `\n你的对象不在本群哦，可发送【闹离婚】后重新绑定！\n注意：离婚后你和她将分走一半共同财产`,
          { md: withBaseMdTip }
        );
        return;
      }
      await replyWithPartnerAvatar(partner, fmd =>
        fmd
          .addText(`\n你今天的老婆/老公是 `)
          .addMention(partner)
          .addText(`\n看好ta哦，别让ta被抢走了~`)
      );
      return;
    }

    // ============ 强娶 ============
    if (/强(娶|嫁)/.test(event.current.MessageText)) {
      if (!atId) {
        await sendAtText(`\n真可惜，娶老婆失败了，嘤嘤嘤，要@群友再发送哦~`, { md: withBaseMdTip });
        return;
      }
      if (event.current.UserId === atId) {
        await sendAtText(`\n你个自恋狂，是想自己和自己结婚吗？真够离谱的~`, { md: withBaseMdTip });
        return;
      }
      if (!store.findMember({ UserId: atId })) {
        await sendAtText(`\n对方未使用本机器人，不能强娶捏~`, { md: withBaseMdTip });
        return;
      }

      const myMarriage = findMarriageByUser(event.current.UserId);
      if (myMarriage) {
        const partner = getPartner(myMarriage, event.current.UserId);
        await replyWithPartnerAvatar(partner, fmd =>
          fmd.addText(`\n你今天已经有对象啦 `).addMention(partner).addText(`\n别三心二意了！`)
        );
        return;
      }

      if (hasMarriage(atId)) {
        await sendAtText(`\n她今天已经被娶走了，你想干嘛呢~`, { md: withBaseMdTip });
        return;
      }

      createMarriage(event.current.UserId, atId);
      await replyWithPartnerAvatar(atId, fmd =>
        fmd.addText(`\n你今天的老婆是 `).addMention(atId).addText(`\n看好她哦，别让她被抢走了。`)
      );
      return;
    }

    // ============ 抢群友 ============
    if (/抢群友/.test(event.current.MessageText)) {
      if (!atId) {
        await sendAtText(`\n你想抢空气吗？要@群友再发送哦~`, { md: withBaseMdTip });
        return;
      }
      if (!store.findMember({ UserId: atId })) {
        await sendAtText(`\n对方未使用本机器人，不能抢捏~`, { md: withBaseMdTip });
        return;
      }

      if (hasMarriage(event.current.UserId)) {
        await sendAtText(`你都已经有对象了，还想抢呢？搞啥呢这是，三妻四妾是吧？爬！`, {
          md: withBaseMdTip,
        });
        return;
      }

      const targetMarriage = findMarriageByUser(atId);
      if (!targetMarriage) {
        await sendAtText(`\n她还没有对象呢，你直接强娶就好了呀~`, { md: withBaseMdTip });
        return;
      }

      // 抢婚成功概率：50 - favor/2，favor>=100 时固定 0%
      const successRate =
        targetMarriage.favor >= 100 ? 0 : Math.max(0, 50 - targetMarriage.favor * 0.5);

      const roll = Math.random() * 100;
      if (roll >= successRate) {
        await sendAtText(
          `\n没抢到哦，你要抢的对象当前亲密值为${targetMarriage.favor?.toFixed(2)}，抢到成功概率为 ${successRate.toFixed(2)}%！`,
          { md: withBaseMdTip }
        );
        return;
      }

      stealMarriage(event.current.UserId, atId, targetMarriage.marriageId);
      await replyWithPartnerAvatar(atId, fmd =>
        fmd.addText(`\n你成功的抢到了她 `).addMention(atId).addText(` 运气不错嘛~`)
      );
      return;
    }

    // ============ 闹离婚 / 确认离婚 ============
    if (/闹离婚/.test(event.current.MessageText)) {
      const marriage = findMarriageByUser(event.current.UserId);
      if (!marriage) {
        await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
        return;
      }
      const a = group?.members[marriage.spouseA];
      const b = group?.members[marriage.spouseB];
      const agreement =
        `【离婚协议书】\n` +
        `甲方：${a?.username}\n` +
        `乙方：${b?.username}\n` +
        `双方于 ${new Date()} 离婚：\n` +
        `一、双方自愿离婚。\n` +
        `二、婚姻存续期间无共同财产，婚前财产归各自所有。\n` +
        `三、无共同债务，任何一方对外负债，由负债方承担。\n` +
        `四、共同财产在【确认离婚】时各自分得一半。\n` +
        `五、亲密值将在【确认离婚】时【清零】`;

      await sendAtText(agreement, {
        md: withBaseMdTip,
        btns: fbg => fbg.addRow().addButton('确认离婚', '确认离婚'),
      });
      return;
    }

    if (/确认离婚/.test(event.current.MessageText)) {
      const result = divorce(event.current.UserId);
      if (!result) {
        await sendAtText(`\n醒醒吧，你连对象都没有，跟锤子离婚呢~`, { md: withBaseMdTip });
        return;
      }
      await sendAtText(`\n没想到你们走到了这一步，那就将来再会吧~`, { md: withBaseMdTip });
      return;
    }

    // ============ 娶群友 / 嫁群友 ============
    if (/(娶|嫁)群友/.test(event.current.MessageText)) {
      const myMarriage = findMarriageByUser(event.current.UserId);
      if (myMarriage) {
        const partner = getPartner(myMarriage, event.current.UserId);
        await replyWithPartnerAvatar(partner, fmd =>
          fmd.addText(`\n你今天已经有对象啦 `).addMention(partner).addText(`\n别三心二意了！`)
        );
        return;
      }

      const members = group?.members || {};
      // 只从「单身」的群成员里抽
      const singles = Object.keys(members).filter(
        id => id !== event.current.UserId && !hasMarriage(id)
      );

      if (singles.length === 0) {
        await sendAtText(`\n群里已经没有单身的人啦，你今天是单身贵族哦~`, {
          md: withBaseMdTip,
        });
        return;
      }

      const picked = singles[Math.floor(Math.random() * singles.length)];
      const isMarry = /娶群友/.test(event.current.MessageText);
      const [userA, userB] = isMarry
        ? [event.current.UserId, picked]
        : [picked, event.current.UserId];

      createMarriage(userA, userB);

      await sendAtText(`\n你今天的老婆是 `, {
        md: fmd => withBaseMdTip(fmd.addMention(picked).addText(`\n看好ta哦，别让ta被抢走了~`)),
      });
      return;
    }

    // ============ 亲密度操作 ============
    const favorMatch = event.current.MessageText.match(/(老婆|老公)(亲亲|羞羞|打你|做饭|买买)/);
    if (favorMatch) {
      const actionMap: Record<string, 'kiss' | 'shy' | 'shopping' | 'cook' | 'hit'> = {
        亲亲: 'kiss',
        羞羞: 'shy',
        买买: 'shopping',
        做饭: 'cook',
        打你: 'hit',
      };
      const action = actionMap[favorMatch[2]];

      const marriage = findMarriageByUser(event.current.UserId);
      if (!marriage) {
        await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
        return;
      }
      const partner = getPartner(marriage, event.current.UserId);

      let result: FavorResult | null;
      try {
        result = applyFavor(event.current.UserId, action);
      } catch (e: any) {
        if (e.message === 'IN_CD') {
          await sendAtText(
            `你还有${e.left}秒cd来提升好感,基础cd为20s，最长为2分钟，好感度越高，cd越长哦~\npass: 🚫禁止恶意重复刷指令，一经发现拉黑处理!`
          );
          return;
        }
        throw e;
      }

      if (!result) {
        await sendAtText(`\n你还没对象呢，提升个锤子好感！`, { md: withBaseMdTip });
        return;
      }

      const tipMap: Record<string, string> = {
        kiss: `\n恭喜！你和 `,
        shy: `\n恭喜！你和 `,
        shopping: `\n恭喜！你和 `,
        cook: `哼！竟然让对象做饭，你和 `,
        hit: `\n坏蛋！你和 `,
      };
      const suffixMap: Record<string, string> = {
        kiss: ` 的恩爱值增加了${result.delta}捏~`,
        shy: ` 的恩爱值增加了${result.delta}捏~`,
        shopping: ` 的恩爱值增加了${result.delta}捏~`,
        cook: ` 的恩爱值减少了${Math.abs(result.delta)} !!!`,
        hit: ` 的恩爱值变鸭蛋了！！！`,
      };

      await sendAtText('', {
        md: fmd =>
          withFavorTip(
            fmd.addText(tipMap[action]).addMention(partner).addText(suffixMap[action]),
            result.favor,
            partner
          ),
      });
      return;
    }
  });
};
