/**
 * 看图识梗
 */
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import { groupStore } from '@src/response/store';
import type { ICache, IGengItem, IGroup } from '@src/types/meme';
import Cfg from '@src/utils/config';
import { Image, Text, useSend } from 'alemonjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { pluginInfo } from '../../package';

const memeDataDir = join(pluginInfo.DATA_PATH, 'meme_rank');
if (!existsSync(memeDataDir)) mkdirSync(memeDataDir, { recursive: true });

let gengList: IGengItem[] =
  JSON.parse(readFileSync(join(pluginInfo.PUBLIC_PATH, 'apps', 'geng', 'geng.json'), 'utf8')) || [];
let cache: ICache = {};
let page = 1;

// 超时计时器（题目发出后 cd 秒内无人抢答则超时）
let timeoutCache: { [key: string]: NodeJS.Timeout } = {};
// 冷却计时器（抢答后 interval 秒发下一题）
let intervalCache: { [key: string]: NodeJS.Timeout } = {};
// 本题发出时间戳，用于计算剩余秒数
let questionTs: { [key: string]: number } = {};

let sliceNum = 25;

//当前群难度等级
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

export default OnResponse(async (event, next) => {
  // 是否在群
  if (!event.GuildId) {
    sendAtText('仅支持群聊~');
    next();
    return;
  }

  const cfg = Cfg.getConfig('meme');
  const memeDataPath = join(memeDataDir, event.GuildId + '.json');

  //初始化群对象
  if (!cache[event.GuildId]) {
    if (existsSync(memeDataPath)) {
      const raw = JSON.parse(readFileSync(memeDataPath, 'utf8'));
      // 兼容旧存档：replyed -> status
      if (raw.status === undefined) {
        raw.status = raw.replyed ? 'answered' : 'idle';
        delete raw.replyed;
      }
      // 进程重启后旧题已失效，重置为 idle
      if (raw.status === 'questioning' || raw.status === 'answered') {
        raw.status = 'idle';
      }
      cache[event.GuildId] = raw;
    } else {
      cache[event.GuildId] = {
        id: 0,
        ans: 0,
        degree: 6,
        cd: cfg.timeout,
        status: 'idle',
        players: {},
      };
    }
  }

  const inGame =
    cache[event.GuildId].status === 'questioning' || cache[event.GuildId].status === 'answered';

  // 处理
  if (/看图识梗|结束|懂王排行|识梗难度设置(.*)/.test(event.MessageText) || inGame) {
    const Send = useSend(event);

    //获取群对象
    const groupData = () => {
      return cache[event.GuildId];
    };
    //获取玩家对象
    const userData = () => {
      return cache[event.GuildId].players[event.UserId];
    };

    /**
     * 设置群对象属性
     * @param protoName 属性名
     * @param data 值
     */
    const setGroupData = <T extends keyof IGroup>(protoName: T, data: IGroup[T]) => {
      cache[event.GuildId][protoName] = data;
    };
    //修改分数
    const setScore = scoreChange => {
      if (scoreChange > 0) {
        cache[event.GuildId].players[event.UserId].score += scoreChange;
      } else if (scoreChange < 0) {
        if (userData().score < scoreChange) {
          cache[event.GuildId].players[event.UserId].score = 0;
        } else {
          cache[event.GuildId].players[event.UserId].score -= scoreChange;
        }
      } else {
        cache[event.GuildId].players[event.UserId].score = 0;
      }
    };
    // 随机抽题
    const getQs = () => {
      let randomIndex = Math.floor(Math.random() * 510);
      let QsPic = join(pluginInfo.PUBLIC_PATH, 'apps', 'geng', 'question', randomIndex + '.png');

      setGroupData('id', randomIndex);

      let mixedAns = getRandomElements(gengList, groupData().degree - 1);
      mixedAns = shuffle([...mixedAns, gengList[randomIndex]]);
      mixedAns.forEach((item, index: number) => {
        if (item.title == gengList[randomIndex].title) {
          setGroupData('ans', index);
        }
      });
      return {
        mixedAns,
        QsPic,
      };
    };

    //难度等级对应分数
    const difScore = () => {
      switch (cache[event.GuildId].degree) {
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
      if (timeoutCache[event.GuildId]) {
        clearTimeout(timeoutCache[event.GuildId]);
        delete timeoutCache[event.GuildId];
      }
      if (intervalCache[event.GuildId]) {
        clearTimeout(intervalCache[event.GuildId]);
        delete intervalCache[event.GuildId];
      }
    };

    // 发起看图识梗
    const sendQs = async () => {
      setGroupData('status', 'questioning');
      questionTs[event.GuildId] = Date.now();

      let question = getQs();

      const data = {
        url: question.QsPic,
        choices: question.mixedAns,
        tip: `你认为这个梗是（回答序号）`,
      };

      if (event.Platform == 'qq-bot') {
        sendAtImage(readFileSync(data.url), {
          md: fmd => {
            fmd.addBold(data.tip).addNewline();
            data.choices.forEach((item, index) => {
              fmd
                .addBold(`【${index}】`)
                .addButton(item.title, {
                  data: `${index}`,
                })
                .addNewline();
            });
            fmd.addDivider().addText(`${groupData().cd} 秒后自动超时结束...`);
            return fmd;
          },
        });
      } else {
        let img = await Pictures('memeQs', {
          data,
        });
        if (typeof img != 'boolean') {
          sendAtImage(img);
        } else {
          sendAtText('图片加载失败');
        }
      }

      // 清理旧计时器
      clearTimers();

      // 启动超时计时器
      timeoutCache[event.GuildId] = setTimeout(() => {
        delete timeoutCache[event.GuildId];
        // 只有还在等待作答才算超时
        if (cache[event.GuildId]?.status !== 'questioning') return;

        setGroupData('status', 'idle');
        writeFileSync(memeDataPath, JSON.stringify(groupData()), 'utf-8');

        // 直接发超时提示
        sendAtText(`已超时结束，请重新发起【看图识梗】！\n`, {
          md: fmd =>
            fmd
              .addText(`当前难度等级${qsDegree(cache[event.GuildId].degree)}\n`)
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
        });
      }, groupData().cd * 1000);
    };

    if (/看图识梗/.test(event.MessageText)) {
      sendQs();
      return;
    }

    if (/懂王排行/.test(event.MessageText)) {
      let pageSum = 0;
      const group = (await groupStore.getGroup(event.GuildId, event.Platform))?.group_map || {};

      let rankList = scoreRank(
        Object.entries(groupData().players).map(player => {
          return {
            avatar: group[player[0]]?.avatar,
            playerId: player[0],
            score: player[1]?.score,
            nick: group[player[0]]?.nickname,
          };
        })
      );

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
        currentUserId = rankList.findIndex(item => item.playerId == event.UserId);
        if (currentUserId != -1) {
          page = Math.ceil(currentUserId / sliceNum) || 1;
          currentUserId = currentUserId - (page - 1) * sliceNum;
        }
      }

      let data1 = {
        list: rankList.slice((page - 1) * sliceNum, page * sliceNum),
        currentUserId: currentUserId,
        currentPage: page,
        sliceNum: sliceNum,
        playerSum: rankList.length,
      };

      let img = await Pictures('memeRank', {
        data: data1,
      });

      if (typeof img != 'boolean') {
        await Send(Image(img));
      } else {
        sendAtText('图片加载失败');
      }

      return;
    }

    if (/识梗难度设置(简单|一般|困难|地狱)/.test(event.MessageText)) {
      let level = event.MessageText.replace(/.*识梗难度设置/, '');
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

      writeFileSync(memeDataPath, JSON.stringify(groupData()), 'utf-8');
      sendAtText('已将识梗难度设置为 ' + level);
      return;
    }

    //回答优先级最低
    if (inGame) {
      // 结束
      if (/结束/.test(event.MessageText)) {
        clearTimers();
        setGroupData('status', 'idle');
        writeFileSync(memeDataPath, JSON.stringify(groupData()), 'utf-8');
        sendAtText('已结束本次竞答！');
        return;
      }

      //初始化玩家对象
      if (!userData()) {
        cache[event.GuildId].players[event.UserId] = {
          score: 0,
        };
      }
      let playerAns = event.MessageText;
      let ansCount = groupData().degree;

      // 检测回答是否有效
      let match = playerAns.match(/^\d+$/);
      let answerNumber = -1;
      let validAnswer = false;
      if (match) {
        answerNumber = parseInt(match[0], 10);
        if (answerNumber >= 0 && answerNumber < ansCount) {
          validAnswer = true;
        }
      }

      // 非法答案：如果在 questioning 阶段提示格式/超时，否则统一提示被抢答
      if (!validAnswer) {
        if (groupData().status === 'questioning') {
          const now = Date.now();
          const leftCD = Math.ceil(groupData().cd - (now - questionTs[event.GuildId]) / 1000);
          const illegalTip = `回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在 ${leftCD} 秒后自动结束！`;
          sendAtText(illegalTip);
        } else {
          sendAtText('已经被抢答了哦，请等待下一题生成~');
        }
        return;
      }

      // 合法答案，但已经被抢答
      if (groupData().status === 'answered') {
        sendAtText('已经被抢答了哦，请等待下一题生成~');
        return;
      }

      // 到这里说明是第一个合法答案，开始抢答
      setGroupData('status', 'answered');

      // 立刻清掉超时计时器
      if (timeoutCache[event.GuildId]) {
        clearTimeout(timeoutCache[event.GuildId]);
        delete timeoutCache[event.GuildId];
      }

      // 判定对错
      if (String(groupData().ans) == String(answerNumber)) {
        setScore(difScore());

        const rightTip = `恭喜答对！获得【${difScore()}】分奖励！\n您当前分数为：${userData().score} !\n`;

        if (event.Platform == 'qq-bot') {
          sendAtText(rightTip, {
            md: fmd => fmd.addText(cfg.interval + ' 秒后将自动发送下一题...'),
          });
        } else {
          Pictures('memeQs', {
            data: {
              avatar: event.UserAvatar || '',
              url: gengList[groupData().id].pic,
              tip: rightTip,
            },
          }).then(img => {
            if (typeof img != 'boolean') {
              Send(Image(img));
            } else {
              sendAtText('图片加载失败');
            }
          });
        }
      } else {
        const errorTip = `不对呢~正确答案是\n【${groupData().ans}】(${gengList[groupData().id]?.title})!\n恭喜错失 ${difScore()} 分奖励！\n嘤嘤嘤~您当前分数为：${userData().score} \n`;
        if (event.Platform == 'qq-bot') {
          sendAtText(errorTip, {
            md: fmd => fmd.addText(cfg.interval + ' 秒后将自动发送下一题...'),
          });
        } else {
          Pictures('memeQs', {
            data: {
              avatar: event.UserAvatar || '',
              url: gengList[groupData().id].pic,
              tip: errorTip,
            },
          }).then(img => {
            if (typeof img != 'boolean') {
              Send(Image(img));
            } else {
              sendAtText('图片加载失败');
            }
          });
        }
      }

      writeFileSync(memeDataPath, JSON.stringify(groupData()), 'utf-8');

      // 启动冷却计时器，interval 后发下一题
      if (intervalCache[event.GuildId]) {
        clearTimeout(intervalCache[event.GuildId]);
      }
      intervalCache[event.GuildId] = setTimeout(() => {
        delete intervalCache[event.GuildId];
        // 如果已经被手动结束，就不发下一题
        if (cache[event.GuildId]?.status !== 'answered') return;
        sendQs();
      }, cfg.interval * 1000);

      return;
    }
  }
  next();
}, 'message.create');

// 懂王值排行
function scoreRank<T>(arr: Array<T>): Array<T> {
  return arr.slice().sort((a: any, b: any) => b.score - a.score);
}

//洗牌算法
function shuffle<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//截取洗牌后的随机数组
function getRandomElements<T>(array: Array<T>, num: number): Array<T> {
  const shuffledArray = shuffle(array.slice()); // 使用数组的副本进行洗牌，以免影响原始数组
  return shuffledArray.slice(0, num); // 返回前num个元素作为随机选取的结果
}
