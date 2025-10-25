/**
 * 看图识梗
 */
import { pluginInfo } from "../../package";
import { join } from "path";
import { existsSync, writeFileSync, readFileSync, mkdirSync } from "fs";
import { Image, Text, useSend } from "alemonjs";
import { Pictures } from "@src/image/index";
import { sleep } from "@src/utils";
import { groupStore } from "@src/response/store/res";
import type {
  ICache,
  IGroup,
  IGengItem,
  ICdCache,
  ICdTip,
} from "@src/types/meme";

import Cfg from "@src/utils/config";

const memeDataDir = join(pluginInfo.DATA_PATH, "meme_rank");
if (!existsSync(memeDataDir)) mkdirSync(memeDataDir, { recursive: true });

let gengList: IGengItem[] =
  JSON.parse(
    readFileSync(
      join(pluginInfo.PUBLIC_PATH, "apps", "geng", "geng.json"),
      "utf8"
    )
  ) || [];
let cache: ICache = {};
let page = 1;

// 超时计时器缓存
let cdCache: ICdCache = {};

// 是否需要提示超时
let cdTip: ICdTip = {};

let sliceNum = 25;

export default OnResponse(async (event, next) => {
  // 是否在群
  if (!event.GuildId) {
    const Send = useSend(event); //减小调用开销
    Send(Text("仅支持群聊~"));
    next();
    return;
  }

  // 是否提示过cd超时
  if (cdTip[event.GuildId] && !cdCache[event.GuildId]) {
    delete cdTip[event.GuildId];
    const Send = useSend(event); //减小调用开销
    Send(
      Text(
        `已超时结束，请重新发起【看图识梗】！\npass: 当前设置为${cache[event.GuildId].cd}秒超时结束！`
      )
    );
    next();
    return;
  }
  const cfg = Cfg.getConfig("meme");

  // 处理
  if (
    /看图识梗|结束|懂王排行|识梗难度设置(.*)/.test(event.MessageText) ||
    cdCache[event.GuildId]
  ) {
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
    const setGroupData = <T extends keyof IGroup>(
      protoName: T,
      data: IGroup[T]
    ) => {
      cache[event.GuildId][protoName] = data;
    };
    //修改分数
    const setScore = (scoreChange) => {
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
      let QsPic = join(
        pluginInfo.PUBLIC_PATH,
        "apps",
        "geng",
        "question",
        randomIndex + ".png"
      );

      setGroupData("id", randomIndex);

      let mixedAns = getRandomElements(gengList, groupData().degree - 1);
      mixedAns = shuffle([...mixedAns, gengList[randomIndex]]);
      // let mixedText = ''
      mixedAns.forEach((item, index: number) => {
        if (item.title == gengList[randomIndex].title) {
          setGroupData("ans", index);
        }
        // mixedText += `【${index}】${item.title}\n`
      });
      return {
        mixedAns,
        QsPic,
      };
    };
    //当前群难度等级
    const qsDegree = () => {
      switch (cache[event.GuildId].degree) {
        case 4:
          return "简单";
        case 6:
          return "一般";
        case 8:
          return "困难";
        case 12:
          return "地狱";
        default:
          return "一般";
      }
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

    const memeDataPath = join(memeDataDir, event.GuildId + ".json");

    //初始化群对象
    if (!cache[event.GuildId]) {
      if (existsSync(memeDataPath))
        cache[event.GuildId] = JSON.parse(readFileSync(memeDataPath, "utf8"));
      else
        cache[event.GuildId] = {
          id: 0,
          ans: 0,
          degree: 6,
          cd: cfg.timeout,
          replyed: false,
          players: {},
        };
    }

    // 发起看图识梗
    const sendQs = async () => {
      setGroupData("replyed", false);
      let question = getQs();

      let img = await Pictures("memeQs", {
        data: {
          url: question.QsPic,
          choices: question.mixedAns,
          tip: `你认为这个梗是（回答序号）`,
        },
      });

      if (typeof img != "boolean") {
        Send(Image(img));
      } else {
        Send(Text("图片加载失败"));
      }

      // 清理旧计时器
      if (cdCache[event.GuildId]) clearTimeout(cdCache[event.GuildId].id);
      if (cdTip[event.GuildId]) {
        clearTimeout(cdTip[event.GuildId]);
        delete cdTip[event.GuildId];
      }
      cdCache[event.GuildId] = {
        ts: new Date().getTime(),
        id: setTimeout(() => {
          delete cdCache[event.GuildId]; //此群不在回复时间内
          cdTip[event.GuildId] = setTimeout(() => {
            if (cdTip[event.GuildId]) delete cdTip[event.GuildId];
          }, 30 * 1000);
        }, groupData().cd * 1000),
      };
    };

    if (/看图识梗/.test(event.MessageText)) {
      sendQs();
      return;
    }

    if (/懂王排行/.test(event.MessageText)) {
      let pageSum = 0;
      const group = (await groupStore.getGroup(event.GuildId, event.Platform))
        .group_map;

      let rankList = scoreRank(
        Object.entries(groupData().players).map((player) => {
          return {
            avatar: group[event.UserId]?.avatar,
            playerId: player[0],
            score: player[1]?.score,
            nick: group[event.UserId]?.nickname,
          };
        })
      );
      page = Number(event.MessageText.replace(/.*懂王排行/, "") || "0");
      if (rankList.length > sliceNum) {
        pageSum = Math.ceil(rankList.length / sliceNum);
        if (page > pageSum) {
          await Send(
            Text(`超过页数啦，当前共${groupData().players.length}个玩家哦~`)
          );
          return;
        }
      }

      let currentUserId = -1;
      if (page == 0) {
        currentUserId = rankList.findIndex(
          (item) => item.playerId == event.UserId
        );
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

      let img = await Pictures("memeRank", {
        data: data1,
      });

      if (typeof img != "boolean") {
        await Send(Image(img));
      } else {
        Send(Text("图片加载失败"));
      }

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

    //回答优先级最低
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

      //初始化玩家对象
      if (!userData()) {
        cache[event.GuildId].players[event.UserId] = {
          score: 0,
        };
      }
      let playerAns = event.MessageText;

      let ansCount = groupData().degree;

      // 检测回答是否有效
      let match = playerAns.match(/\d+/);
      const now = new Date().getTime();
      const leftCD = Math.ceil(
        groupData().cd - (now - cdCache[event.GuildId]?.ts) / 1000
      );
      const illegalTip = `回答无效哦~请回复答案对应序号！\n发送【结束】可取消本次答题~\npass: 将在${leftCD}秒后自动结束！`;
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

        Pictures("memeQs", {
          data: {
            avatar: event.UserAvatar || "",
            url: gengList[groupData().id].pic,
            tip: `恭喜答对！获得${difScore()}分奖励！\n您当前分数为：${userData().score}!\n${levelTip}`,
          },
        }).then((img) => {
          if (typeof img != "boolean") {
            Send(Image(img));
          } else {
            Send(Text("图片加载失败"));
          }
        });
      } else {
        Pictures("memeQs", {
          data: {
            avatar: event.UserAvatar || "",
            url: gengList[groupData().id].pic,
            tip: `不对呢~正确答案是${groupData().ans}!\n恭喜错失${difScore()}分奖励嘤嘤嘤~您当前分数为：${userData().score}\n${levelTip}`,
          },
        }).then((img) => {
          if (typeof img != "boolean") {
            Send(Image(img));
          } else {
            Send(Text("图片加载失败"));
          }
        });
      }
      setGroupData("replyed", true); // 下一题

      writeFileSync(memeDataPath, JSON.stringify(groupData()), "utf-8");
      await sleep(cfg.interval * 1000);
      sendQs();

      return;
    }
  }
  next();
}, "message.create");

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
