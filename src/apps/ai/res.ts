import { Image, Text, useSend, useMention } from 'alemonjs'
import { Pictures } from '@src/image/index'
import { getQRCode } from '@src/utils/qrcode'
// import { groupStore } from '@src/apps/store/res'
import AiTool from './utils/tool';
import OpenAI from 'openai'
import Cfg from '@src/utils/config'

const groupMsgs = {}

// const groupRole = {
//   'owner': '群主',
//   'admin': '管理员',
//   'member': '普通群员'
// }

/**
 * 入队
 * @param group_id 
 * @param msg 
 * @param limit 
 */
const pushGroupMsgs = (group_id: string, msg, limit = 10) => {
  groupMsgs[group_id]?.msgs?.push(msg)
  while (groupMsgs[group_id]?.msgs?.lenth > limit) {
    groupMsgs[group_id]?.msgs.shift()
  }
}

const res = OnResponse(async (event, next) => {

  const cfg = Cfg.getConfig('ai')
  if (!cfg.is_open) return

  if (!groupMsgs[event.GuildId]) {
    groupMsgs[event.GuildId] = {
      msgs: []
    }
  }

  const Mentions = await useMention(event)
  const botSelf = Mentions.find(item => item.IsBot)

  const prefixReg = new RegExp(cfg.prefix)

  if ((cfg.prefix && prefixReg.test(event.MessageText)) || botSelf) {

    let aiTool = new AiTool(event)
    // let roleText = await aiTool.getRoleText(e.msg, groupMsgs[e.group_id].msgs)
    const openAI = new OpenAI({
      apiKey: Cfg.getConfig('ai').api_key,
      baseURL: "https://free.v36.cm/v1"
    });

    let roleText = await aiTool.getRoleText(event.MessageText.replace(prefixReg,''), groupMsgs[event.GuildId].msgs)

    const chatCompletion = await openAI.chat.completions.create({
      messages: [{ role: 'user', content: roleText }],
      model: cfg.model || 'gpt-4o-mini', // gpt-3.5-turbo
    });

    let text = chatCompletion.choices[0].message.content || ''

    let context = aiTool.parse(text)
    await context.send()

    pushGroupMsgs(event.GuildId, {
      '个人账号': event.UserId,
      '昵称': event.UserName,
      '发送消息': event.MessageText,
    },cfg.ctx_num)

    // 机器人
    // pushGroupMsgs(event.GuildId, {
    //   '个人账号': event.UserId,
    //   '昵称': event.UserName,
    //   '发送消息': context.msg,
    // })
    next()
    return
  }

  if (/奶酪获取openaikey$/.test(event.MessageText)) {
    const img = await Pictures('qrcode', {
      data: {
        url: await getQRCode('https://free.v36.cm/github'),
        title: '扫码获取免费OpenaiKey',
        desc: '需要github账户验证'
      }
    })
    const Send = useSend(event)

    if (typeof img != 'boolean') {
      Send(Image(img))
    } else {
      Send(Text('图片加载失败'))
    }
    next()
    return
  }

  pushGroupMsgs(event.GuildId, {
    '个人账号': event.UserId,
    '昵称': event.UserName,
    '发送消息': event.MessageText,
  },cfg.ctx_num)
  next()

}, 'message.create')


export default OnResponse([res.current], 'message.create')