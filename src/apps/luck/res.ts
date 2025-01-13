/**
 * 今日运势改命版
 */

import { join } from 'path'
import { existsSync, writeFileSync, readFileSync } from 'fs'
import { Pictures } from '@src/image/index'
import { Image, Text, useSend, useMention } from 'alemonjs'

import { pluginInfo } from '../../package'
import { fortuneList, lots } from './utils/fortune'

import LuckHandler from './utils/handler'

import type { ILuckRecord, IUserLuckHistory } from '@src/types/luck'
import { sleep, scheduleTask } from '@src/utils'

const luckDataPath = join(pluginInfo.DATA_PATH, 'luckDB.json');
if (!existsSync(luckDataPath)) writeFileSync(luckDataPath, JSON.stringify({}), 'utf-8');

let luckRecord:ILuckRecord = JSON.parse(readFileSync(luckDataPath, 'utf8')) || {}

// 刷新每日运势状态
scheduleTask(()=>{
  Object.keys(luckRecord).forEach(key => {
    luckRecord[key].isTested = false
  })
  writeFileSync(luckDataPath, JSON.stringify(luckRecord), 'utf-8')
  console.warn(`[奶酪刷新运势状态]：如定时刷新失败管理员可发送【刷新运势】进行刷新！`)
},{
  hour: 0,
  minute: 0,
  second: 0
})

export default OnResponse(async (event, next) => {
  const Send = useSend(event)

  // 手动刷新运势定时任务（应对每日定时刷新失败问题）
  if (/^(\/|#)?刷新运势$/.test(event.MessageText) && event.IsMaster) {
    Object.keys(luckRecord).forEach(key => {
      luckRecord[key].isTested = false
    })
    writeFileSync(luckDataPath, JSON.stringify(luckRecord), 'utf-8')
    Send(Text('刷新成功！'))
    next()
    return
  }

  const Mentions = await useMention(event)

  // 被At的人
  const atUser = Mentions.find(item => !item.IsBot)

  const strUser = String(atUser?.UserId || event.UserId)

  let bgUrl = `https://api.suyanw.cn/api/comic2`

  function playerObj() {
    return luckRecord[strUser]
  }

  function getTodayLuck(user = strUser) {
    return luckRecord[user].list[luckRecord[user].list.length - 1]
  }

  function setTodayLuck<T extends keyof IUserLuckHistory>(user = strUser, key:T, value:IUserLuckHistory[T]) {
    luckRecord[user].list[luckRecord[user].list.length - 1] = {
      ...luckRecord[user].list[luckRecord[user].list.length - 1],
      [key]:value
    }
  }

  let luckHandler = new LuckHandler(strUser)

  // 今日运势
  if (/^(\/|#)?(今日运势|运气|祝福|诅咒|逆天改命)$/.test(event.MessageText)) {
    //初始化
    if (!luckRecord[strUser]) {
      luckRecord[strUser] = {
        list: [],
        debris: 0,
        isTested: false,
      }
    }

    let luckList = fortuneList

    // 处理逆天改命
    if (/逆天改命/.test(event.MessageText)) {
      if (!playerObj() || playerObj().list.length == 0) {
        Send(Text('你还没看今天的运势呢，改什么命啊o(≧▽≦o)'))
        return
      }
      if (atUser) {
        Send(Text('哼~你还想帮别人改命？'))
        return
      }
      if (fortuneList[getTodayLuck().id].stars >= 7) {
        if (playerObj().isKing) {
          Send(Text('不用改命啦，至尊无敌运气王，发起【诅咒@群友】或【祝福@群友】展示您的运势权能吧！'))
        } else {
          Send(Text('不用改命啦，至尊无敌运气王，您已经施展了足以威慑众生的运势权能！'))
        }
        return
      }
      if (luckRecord[strUser].debris < 7) {
        Send(Text(`你现在只有${playerObj().debris}个碎片哦~集满7个碎片再来吧！`))
        return
      }
      luckList = fortuneList.filter(item => item.stars > (fortuneList[getTodayLuck().id].stars < 5 ? fortuneList[getTodayLuck().id].stars : 6))

      luckRecord[strUser].debris -= 7
    }


    //获取运势
    let luckId = 0
    let addDebris = 0

    if (/诅咒/.test(event.MessageText)) {
      if (!luckRecord[event.UserId].isKing) {
        Send(Text('您没有干扰别人运势的权能或者您已经改变过别人的命运了，成为至尊无敌运气王才可以获得一次干涉他人命运的权利哦~'))
        return
      }
      if (!atUser) {
        Send(Text('你要诅咒谁啊笨蛋！'))
        return
      }
      if (atUser.UserId == event.UserId) {
        Send(Text('您确定要诅咒自己吗？'))
        return
      }
      if (!luckRecord[atUser.UserId] || !luckRecord[atUser.UserId].isTested) {
        Send(Text('对方今天没测过运势，您诅咒不了捏~'))
        return
      }

      luckList = fortuneList.filter(item => item.stars == 0)
      luckId = Math.floor(Math.random() * luckList.length)

      // luckRecord[atUser.UserId].luckId = luckList[luckId].id
      setTodayLuck(atUser.UserId,'id',luckList[luckId].id)
      luckId = luckList[luckId].id
      delete luckRecord[event.UserId].isKing
    }

    if (/祝福/.test(event.MessageText)) {
      if (!luckRecord[event.UserId].isKing) {
        Send(Text('您没有干扰别人运势的权能或者您已经改变过别人的命运了，成为至尊无敌运气王才可以获得一次干涉他人命运的权利哦~'))
        return
      }
      if (!atUser) {
        Send(Text('你要祝福谁啊笨蛋！'))
        return
      }
      if (atUser.UserId == event.UserId) {
        Send(Text('不用祝福自己哦~你已经是运气王了！'))
        return
      }
      if (!luckRecord[atUser.UserId] || !luckRecord[atUser.UserId].isTested) {
        Send(Text('对方今天没测过运势，您祝福不了捏~'))
        return
      }

      luckList = fortuneList.filter(item => item.stars == 7)
      luckId = Math.floor(Math.random() * luckList.length)
      // luckRecord[atUser.UserId].luckId = luckList[luckId].id
      setTodayLuck(atUser.UserId,'id',luckList[luckId].id)
      luckId = luckList[luckId].id
      delete luckRecord[atUser.UserId].isKing
    }

    if (!playerObj().isTested || /逆天改命/.test(event.MessageText)) {

      luckId = Math.floor(Math.random() * luckList.length)
      if (luckList[luckId].stars == 0) {
        addDebris = 0
      } else if (luckList[luckId].stars == 7) {
        addDebris = 0
        luckRecord[strUser].isKing = true
      } else {
        addDebris = 7 - luckList[luckId].stars
      }
      luckRecord[strUser].debris += addDebris

      luckId = luckList[luckId].id
      // luckRecord[strUser].luckId = luckId
      setTodayLuck(strUser,'id',luckId)

    } else {
      // luckId = luckRecord[strUser].luckId
      luckId = getTodayLuck(strUser).id
    }


    let luck = fortuneList[luckId]

    let fortuneSummary = luck.summary
    let starCount = luck.stars
    let signText = luck.sign
    let unSignText = luck.unsign

    let tempLuck = {
      id: luckId,
      ts: Date.now()
    }

    if (luckRecord[strUser].isTested) {
      luckRecord[strUser].list[luckRecord[strUser].list.length - 1] = tempLuck
    } else {
      if (luckRecord[strUser].list.length >= 7) {
        luckRecord[strUser].list.shift()
        luckRecord[strUser].list.push(tempLuck)
      } else {
        luckRecord[strUser].list.push(tempLuck)
      }
    }


    let luckyData = luckHandler.luckySummary(starCount, lots)
    let starcolor = luckHandler.starsColor(starCount)
    let avator = (atUser ? (await atUser.UserAvatar?.toURL()) : (await event.UserAvatar?.toURL())) || ''

    let fortuneData = {
      fortuneSummary,
      luckyStar: luckHandler.luckyStar(starCount),
      signText,
      unSignText,
      starcolor,
      starCount,
      avator,
      bgUrl
    }



    let mixText = ``
    // let nick = atUser ? (await atUser.UserAvatar?.toURL()) : (await event.UserAvatar?.toURL())
    if (starCount == 7) {
      if (playerObj().isKing) {
        mixText = `恭喜你成为了至尊无敌运气王！将笼罩在命运之神欢愉的曙光下！你有一次决定别人命途的权利，请使用【诅咒@群友】或【祝福@群友】施展您的运势权能吧！`
      } else {
        mixText = `恭喜你成为了至尊无敌运气王，您已经施展了足以威慑众生的运势权能！`
      }
    } else if (starCount == 0) {
      mixText = `嘤嘤嘤~你是大凶捏，命运之神没有眷顾你，但还是给了你一次诅咒别人的机会，发送【诅咒@群友】寻找甘愿共苦之人吧~`
      luckRecord[strUser].isKing = true
    } else {
      if (playerObj().isTested) {
        if (/逆天改命/.test(event.MessageText)) {
          mixText = `恭喜改命成功，消耗了7个命运碎片，并获得了${addDebris}个碎片！注意: 改命仅能保证比上一次的运势高，如果上一次运势为吉则改命后必成运气王！据说运气王拥有操纵他人运势的能力...`
          // 猜惊喜
          await Send(Image(readFileSync(join(pluginInfo.PUBLIC_PATH,'apps','luck','luckySign', luckyData.luckyCharm + '.gif'))))
          await sleep(15000)
        } else {
          mixText = `你已经获得了命运碎片~集满7个就可以逆天改命啦！`
        }
      } else {
        mixText = `恭喜你获得了${addDebris}个命运碎片哦~集满7个就可以逆天改命啦！`
      }
    }

    if (/诅咒/.test(event.MessageText)) {
      mixText = `您成功诅咒了他，他将被您的非凡运势所震慑！`
    }
    if (/祝福/.test(event.MessageText)) {
      mixText = `您成功祝福了他，他将继承您博大的胸襟！`
    }

    if (!playerObj().isTested || /逆天改命/.test(event.MessageText)) {
      luckRecord[strUser].isTested = true
    }

    const img = await Pictures('todayLuck', {
      data: {
        ...fortuneData,
        luckData: luckyData,
        tip: `${mixText}当前剩余：${luckRecord[strUser].debris}个命运碎片`
      }
    })
    // send
    if (typeof img != 'boolean') {
      Send(Image(img))
    } else {
      Send(Text('图片加载失败'))
    }

    writeFileSync(luckDataPath, JSON.stringify(luckRecord), 'utf-8')

  }

  if (/历史运势/.test(event.MessageText)) {

    //计算平均值
    let hisStars = 0
    luckRecord[strUser].list.forEach(item => {
      if(item.id) {
        hisStars += fortuneList[item.id]?.stars
      } 
    })
    let starCount = Math.round(hisStars / luckRecord[strUser].list.length)
    let starcolor = luckHandler.starsColor(starCount)
    let fortuneSummary = '平均等级：' + luckHandler.luckySummary(starCount, lots).fortuneSummary

    let fortuneData = {
      fortuneSummary,
      luckyStar: luckHandler.luckyStar(starCount),
      starCount,
      starcolor,
      avator: (atUser ? (await atUser.UserAvatar?.toURL()) : (await event.UserAvatar?.toURL())) || '',
      bgUrl
    }


    const img = await Pictures('luckHistory', {
      data: {
        ...fortuneData,
        playerData: luckRecord[strUser].list,
        fortuneList
      }
    })
    // send
    if (typeof img != 'boolean') {
      Send(Image(img))
    } else {
      Send(Text('图片加载失败'))
    }
    return
  }
  next()
}, 'message.create')
