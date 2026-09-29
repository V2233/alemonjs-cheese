import { useErrorContext, useErrorHandler } from '@src/hooks/error';
/**
 * 看图识梗（SQLite 版）
 */
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import { useEventStore } from '@src/store';
import type { IGengItem, IGroup, IPlayer } from '@src/types/meme';
import Cfg from '@src/utils/config';
import { useEvent } from 'alemonjs';
import { readFileSync } from 'fs';
import { join } from 'path';

import { pluginInfo } from '../../package';
import {
  ensureGroup,
  getGroup,
  getGroupScoreRank,
  getPlayer,
  savePlayer,
  updateGroupField,
} from './utils/db';

let gengList: IGengItem[] =
  JSON.parse(readFileSync(join(pluginInfo.PUBLIC_PATH, 'apps', 'geng', 'geng.json'), 'utf8')) || [];

let page = 1;
let sliceNum = 25;

// 超时计时器（题目发出后 cd 秒内无人抢答则超时）
let timeoutCache: { [key: string]: NodeJS.Timeout } = {};
// 冷却计时器（抢答后 interval 秒发下一题）
let intervalCache: { [key: string]: NodeJS.Timeout } = {};
// 本题发出时间戳，用于计算剩余秒数
let questionTs: { [key: string]: number } = {};

// 当前群难度等级
const qsDegree = (degree: number) => {
  switch (degree) {
    case 4:
      return '简单';
    case 6:
      return '一般';
    case 8:
      return '困难';
    case 12:
      return '地狱';
    default:
      return '一般';
  }
};

// 判断群内是否处于游戏进行中（questioning / answered）
const isInGame = (guildId: string) => {
  const g = getGroup(guildId);
  return !!g && (g.status === 'questioning' || g.status === 'answered');
};

export default async () => {
  const [event, next] = useEvent({
    regular: /看图识梗|结束|懂王排行|识梗难度设置(.*)/,
    selects: ['message.create', 'private.message.create'],
  });

  if (!event.match.regular || !event.match.selects) {
    next();
    return;
  }

  await useErrorContext(async () => {
    if (!event.current.IsPrivate) {
      await sendAtText('仅支持群聊~');
      next();
      return;
    }

    const inGame = isInGame(event.current.GuildId);
    const cfg = Cfg.getConfig('meme');

    // 确保群对象存在（首次按默认值创建）
    ensureGroup(event.current.GuildId, { degree: 6, cd: cfg.timeout });

    // 拿最新的群对象（每次从 DB 读，保证状态一致）
    const groupData = (): IGroup => getGroup(event.current.GuildId)!;

    // 读取玩家对象（惰性创建）
    const userData = (): IPlayer | null => getPlayer(event.current.GuildId, event.current.UserId);

    // 写群字段（轻量单列更新）
    const setGroupData = <T extends keyof IGroup>(protoName: T, data: IGroup[T]) => {
      // players 不走这里
      if (protoName === 'players') return;
      const fieldMap: Record<string, string> = {
        id: 'id',
        ans: 'ans',
        degree: 'degree',
        cd: 'cd',
        status: 'status',
      };
      const f = fieldMap[protoName as string];
      if (!f) return;
      // 复用 db.ts 里的 updateGroupField
      // （避免 import 太多，直接内联也行，这里用 db 对象）
      // 为了简洁，调用我们导出的方法
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      updateGroupField(event.current.GuildId, protoName as any, data);
    };

    // 修改分数
    const setScore = (scoreChange: number) => {
      const player = userData();
      if (!player) return;
      let newScore = player.score;
      if (scoreChange > 0) {
        newScore += scoreChange;
      } else if (scoreChange < 0) {
        newScore = player.score < -scoreChange ? 0 : player.score + scoreChange;
      } else {
        newScore = 0;
      }
      savePlayer(event.current.GuildId, event.current.UserId, newScore);
    };

    // 随机抽题
    const getQs = () => {
      const randomIndex = Math.floor(Math.random() * 510);
      const QsPic = join(pluginInfo.PUBLIC_PATH, 'apps', 'geng', 'question', randomIndex + '.png');

      setGroupData('id', randomIndex);

      let mixedAns = getRandomElements(gengList, groupData().degree - 1);
      mixedAns = shuffle([...mixedAns, gengList[randomIndex]]);
      mixedAns.forEach((item, index: number) => {
        if (item.title == gengList[randomIndex].title) {
          setGroupData('ans', index);
        }
      });
      return { mixedAns, QsPic };
    };

    // 难度等级对应分数
    const difScore = () => {
      switch (groupData().degree) {
        case 4:
          return 1;
        case 6:
          return 2;
        case 8:
          return 3;
        case 12:
          return 4;
        default:
          return 2;
      }
    };

    // 清理该群所有计时器
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

    // 发起看图识梗
    const sendQs = async () => {
      setGroupData('status', 'questioning');
      questionTs[event.current.GuildId] = Date.now();

      const question = getQs();

      const data = {
        url: question.QsPic,
        choices: question.mixedAns,
        tip: `你认为这个梗是（回答序号）`,
      };

      if (event.current.Platform == 'qq-bot') {
        await sendAtImage(readFileSync(data.url), {
          md: fmd => {
            fmd.addBold(data.tip).addNewline();
            data.choices.forEach((item, index) => {
              fmd
                .addBold(`【${index}】`)
                .addButton(item.title, { data: `${index}` })
                .addNewline();
            });
            fmd.addDivider().addText(`${groupData().cd} 秒后自动超时结束...`);
            return fmd;
          },
        });
      } else {
        const img = await Pictures('memeQs', { data });
        if (typeof img != 'boolean') {
          await sendAtImage(img);
        } else {
          await sendAtText('图片加载失败');
        }
      }

      // 清理旧计时器
      clearTimers();

      // 启动超时计时器
      timeoutCache[event.current.GuildId] = setTimeout(() => {
        delete timeoutCache[event.current.GuildId];
        if (getGroup(event.current.GuildId)?.status !== 'questioning') return;

        setGroupData('status', 'idle');

        sendAtText(`已超时结束，请重新发起【看图识梗】！\n`, {
          md: fmd =>
            fmd
              .addText(`当前难度等级${qsDegree(groupData().degree)}\n`)
              .addButton('简单', { data: '识梗难度设置简单' })
              .addText(' | ')
              .addButton('一般', { data: '识梗难度设置一般' })
              .addText(' | ')
              .addButton('困难', { data: '识梗难度设置困难' })
              .addText(' | ')
              .addButton('地狱', { data: '识梗难度设置地狱' })
              .addNewline()
              .addText(`(答对分别加 1 | 2 | 3 | 4 分)`),
          btns: fbg =>
            fbg.addRow().addButton('看图识梗', '看图识梗').addButton('懂王排行', '懂王排行'),
        }).catch?.(useErrorHandler);
      }, groupData().cd * 1000);
    };

    if (/看图识梗/.test(event.current.MessageText)) {
      sendQs();
      return;
    }

    // ============ 懂王排行 ============
    if (/懂王排行/.test(event.current.MessageText)) {
      let pageSum = 0;
      const store = useEventStore();
      const group = await store.getGroup();
      const members = group?.members || {};

      const rankRows = getGroupScoreRank(event.current.GuildId);

      const rankList = rankRows.map(row => ({
        avatar: members[row.userId]?.avatar,
        playerId: row.userId,
        score: row.score,
        nick: members[row.userId]?.username,
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
        currentUserId = rankList.findIndex(item => item.playerId == event.current.UserId);
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
        playerSum: rankList.length,
      };

      const img = await Pictures('memeRank', { data: data1 });
      if (typeof img != 'boolean') await sendAtImage(img);
      else await sendAtText('图片加载失败');
      return;
    }

    // ============ 难度设置 ============
    if (/识梗难度设置(简单|一般|困难|地狱)/.test(event.current.MessageText)) {
      let level = event.current.MessageText.replace(/.*识梗难度设置/, '');
      switch (level) {
        case '简单':
          setGroupData('degree', 4);
          break;
        case '一般':
          setGroupData('degree', 6);
          break;
        case '困难':
          setGroupData('degree', 8);
          break;
        case '地狱':
          setGroupData('degree', 12);
          break;
        default:
          level = '一般';
          setGroupData('degree', 6);
      }
      await sendAtText('已将识梗难度设置为 ' + level);
      return;
    }

    // ============ 答题（优先级最低） ============
    if (inGame) {
      // 结束
      if (/结束/.test(event.current.MessageText)) {
        clearTimers();
        setGroupData('status', 'idle');
        await sendAtText('已结束本次竞答！');
        return;
      }

      // 初始化玩家对象
      if (!userData()) {
        savePlayer(event.current.GuildId, event.current.UserId, 0);
      }

      const playerAns = event.current.MessageText;
      const ansCount = groupData().degree;

      // 检测回答是否有效
      const match = playerAns.match(/^\d+$/);
      let answerNumber = -1;
      let validAnswer = false;
      if (match) {
        answerNumber = parseInt(match[0], 10);
        if (answerNumber >= 0 && answerNumber < ansCount) validAnswer = true;
      }

      if (!validAnswer) {
        if (groupData().status === 'questioning') {
          const now = Date.now();
          const leftCD = Math.ceil(
            groupData().cd - (now - questionTs[event.current.GuildId]) / 1000
          );
          await sendAtText(
            `回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在 ${leftCD} 秒后自动结束！`
          );
        } else {
          await sendAtText('已经被抢答了哦，请等待下一题生成~');
        }
        return;
      }

      // 合法答案，但已经被抢答
      if (groupData().status === 'answered') {
        await sendAtText('已经被抢答了哦，请等待下一题生成~');
        return;
      }

      // 抢答成功，锁定
      setGroupData('status', 'answered');

      // 立刻清掉超时计时器
      if (timeoutCache[event.current.GuildId]) {
        clearTimeout(timeoutCache[event.current.GuildId]);
        delete timeoutCache[event.current.GuildId];
      }

      // 判定对错
      if (String(groupData().ans) == String(answerNumber)) {
        setScore(difScore());
        const rightTip = `恭喜答对！获得【${difScore()}】分奖励！\n您当前分数为：${userData()!.score} !\n`;

        if (event.current.Platform == 'qq-bot') {
          await sendAtText(rightTip, {
            md: fmd => fmd.addText(cfg.interval + ' 秒后将自动发送下一题...'),
          });
        } else {
          const img = await Pictures('memeQs', {
            data: {
              avatar: event.current.UserAvatar || '',
              url: gengList[groupData().id].pic,
              tip: rightTip,
            },
          });
          if (typeof img != 'boolean') await sendAtImage(img);
          else await sendAtText('图片加载失败');
        }
      } else {
        const errorTip = `不对呢~正确答案是\n【${groupData().ans}】(${gengList[groupData().id]?.title})!\n恭喜错失 ${difScore()} 分奖励！\n嘤嘤嘤~您当前分数为：${userData()!.score} \n`;
        if (event.current.Platform == 'qq-bot') {
          await sendAtText(errorTip, {
            md: fmd => fmd.addText(cfg.interval + ' 秒后将自动发送下一题...'),
          });
        } else {
          const img = await Pictures('memeQs', {
            data: {
              avatar: event.current.UserAvatar || '',
              url: gengList[groupData().id].pic,
              tip: errorTip,
            },
          });
          if (typeof img != 'boolean') await sendAtImage(img);
          else await sendAtText('图片加载失败');
        }
      }

      // 启动冷却计时器
      if (intervalCache[event.current.GuildId]) {
        clearTimeout(intervalCache[event.current.GuildId]);
      }
      intervalCache[event.current.GuildId] = setTimeout(() => {
        delete intervalCache[event.current.GuildId];
        if (getGroup(event.current.GuildId)?.status !== 'answered') return;
        sendQs();
      }, cfg.interval * 1000);

      return;
    }
  });
};

// 洗牌算法
function shuffle<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 截取洗牌后的随机数组
function getRandomElements<T>(array: Array<T>, num: number): Array<T> {
  const shuffledArray = shuffle(array.slice());
  return shuffledArray.slice(0, num);
}
