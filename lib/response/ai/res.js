import { useMention, ResultCode, useSend, Text, Image } from 'alemonjs';
import { Pictures } from '../../image/index.js';
import { getQRCode } from '../../utils/qrcode.js';
import 'node-fetch';
import 'node:fs/promises';
import 'node:crypto';
import 'url';
import '../store/res.js';
import 'highlight.js';
import 'marked';
import '@mermaid-js/mermaid-cli';
import 'fs';
import '../../package.js';
import 'path';
import Cfg from '../../utils/config.js';
import 'openai';

const groupMsgs = {};
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
const pushGroupMsgs = (group_id, msg, limit = 10) => {
    groupMsgs[group_id]?.msgs?.push(msg);
    while (groupMsgs[group_id]?.msgs?.lenth > limit) {
        groupMsgs[group_id]?.msgs.shift();
    }
};
const res = OnResponse(async (event, next) => {
    const cfg = Cfg.getConfig("ai");
    if (!cfg.is_open)
        return;
    if (!groupMsgs[event.GuildId]) {
        groupMsgs[event.GuildId] = {
            msgs: [],
        };
    }
    const [mention] = useMention(event);
    const botSelf = await mention.findOne({ IsBot: true });
    const prefixReg = new RegExp(cfg.prefix);
    console.log("-------------" + cfg.prefix);
    if ((cfg.prefix && prefixReg.test(event.MessageText)) ||
        botSelf.code === ResultCode.Ok) {
        const Send = useSend(event);
        Send(Text("该功能已暂停维护"));
        next();
        return;
    }
    if (/奶酪获取openaikey$/.test(event.MessageText)) {
        const img = await Pictures("qrcode", {
            data: {
                url: await getQRCode("https://free.v36.cm/github"),
                title: "扫码获取免费OpenaiKey",
                desc: "需要github账户验证",
            },
        });
        const Send = useSend(event);
        if (typeof img != "boolean") {
            Send(Image(img));
        }
        else {
            Send(Text("图片加载失败"));
        }
        next();
        return;
    }
    pushGroupMsgs(event.GuildId, {
        个人账号: event.UserId,
        昵称: event.UserName,
        发送消息: event.MessageText,
    }, cfg.ctx_num);
    next();
}, "message.create");
var res$1 = OnResponse([res.current], "message.create");

export { res$1 as default };
