import { useMention, ResultCode, useSend, Image, Text } from 'alemonjs';
import { Pictures } from '../../image/index.js';
import { mixMode } from './utils/mixMode.js';
import { join } from 'path';
import { pluginInfo } from '../../package.js';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { port, assetsPath } from '../../utils/server.js';
import { createMD5 } from '../../utils/index.js';
import { toMarkdown } from '../../utils/marked.js';

const cachePath = join(assetsPath, "cache");
if (!existsSync(cachePath))
    mkdirSync(cachePath, { recursive: true });
const maskDataPath = join(pluginInfo.DATA_PATH, "maskDB.json");
if (!existsSync(maskDataPath))
    writeFileSync(maskDataPath, JSON.stringify([]), "utf-8");
let pageNo = 0;
let curKeyword = "星星";
let pageSize = 15;
let mixBlendMode = "overlay";
let pngsList = JSON.parse(readFileSync(maskDataPath, "utf8"));
// let cd: NodeJS.Timeout | null = null
/**
 * 获取png列表
 */
const reqPngList = async (keyword = "星星", pageNo = 0, pageSize = 10) => {
    const url = "https://api.soutushenqi.com/api/v1/avoid_cut/list";
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    };
    const params = new URLSearchParams({
        product_id: "53",
        version_code: "1353",
        loose: "false",
        page: "" + pageNo,
        page_size: "" + pageSize,
        search_word: keyword,
        scene_type: "13",
        sort_type: "-1",
        is_large_scale: "-1",
        sign: "C2BF293219CCE23A63E24CBFC4BCEF40",
    });
    const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: params.toString(),
    });
    const result = await res.json();
    return result.code == 200 ? result.data : [];
};
const getHybridTip = () => {
    return mixMode
        .map((item, index) => `${index + 1}. **${item.desc}**\`\`\`${item.name}\`\`\`：${item.detail}`)
        .join("\n");
};
var res = OnResponse(async (event, next) => {
    if (!/^(\/|#)?头像合成帮助|搜索图片|获取图片(.*)|混合模式(.*)|^第(\d+)页$|合成头像(.*)|/.test(event.MessageText)) {
        next();
        return;
    }
    // 被At的人
    const [mention] = useMention(event);
    const botSelf = await mention.findOne({ IsBot: false });
    const user = botSelf.code == ResultCode.Ok ? botSelf.data : null;
    // 创建一个send
    const Send = useSend(event);
    if (/混合模式(.*)/.test(event.MessageText)) {
        if (/混合模式$/.test(event.MessageText)) {
            const img = await Pictures("markdown", {
                data: {
                    title: "图片合成混合模式设置",
                    html: await toMarkdown(`## 发送\`\`\`混合模式+序号\`\`\`更改混合模式\n>当前模式：${mixBlendMode}\n` +
                        getHybridTip()),
                },
            });
            if (typeof img != "boolean") {
                Send(Image(img));
            }
            else {
                Send(Text("图片加载失败"));
            }
        }
        else {
            const id = Number(event.MessageText.replace(/.*混合模式/, ""));
            if (id < 1 || id > mixMode.length) {
                Send(Text("序号不对呢~"));
                return;
            }
            else {
                mixBlendMode = mixMode[id - 1].name;
                Send(Text(`混合模式已更改为【${mixMode[id - 1].desc}】`));
                return;
            }
        }
    }
    if (/头像合成帮助/.test(event.MessageText)) {
        Send(Text(`--------万能头像合成--------\n\n` +
            `【(头像合成指令)】触发头像合成，默认【国庆】，加数字则合成指定背景头像\n\n` +
            `【切换关键词(关键词)】搜索并切换头像背景列表，头像合成触发指令会自动更新为该关键词,旧指令作废\n\n` +
            `【设置头像合成指令(正则指令)】用于显式设置触发头像合成的正则指令以满足复杂正则\n\n` +
            `【第2页】切换当前头像背景列表页码，默认每次发10条\n\n` +
            `【混合模式(序号)】不加序号则发送混合模式介绍\n\n` +
            `【(开启|关闭)背景预览】关闭切换关键词时的预览图片，可显著加快切换速度`));
    }
    if (/搜索图片(.*)/.test(event.MessageText)) {
        curKeyword = event.MessageText.replace(/.*搜索图片/, "") ?? curKeyword;
        pngsList = await reqPngList(curKeyword, pageNo, pageSize);
        writeFileSync(maskDataPath, JSON.stringify(pngsList), "utf-8");
        const pics = [];
        let index = 0;
        for (const info of pngsList) {
            pics.push({
                url: info.largeUrl,
                id: index,
                tag: info.tagList,
                detail: info.detailInfo,
            });
            index++;
        }
        const img = await Pictures("emoList", {
            data: {
                list: pics,
                pageNo: pageNo,
            },
        });
        if (typeof img != "boolean") {
            Send(Image(img));
        }
        else {
            Send(Text("图片加载失败"));
        }
        // cd = setTimeout(()=>{
        //     cd && clearTimeout(cd)
        //     cd = null
        // },30 * 1000)
    }
    let match = null;
    if ((match = event.MessageText.match(/获取图片(\d+)/))) {
        const id = Number(match[1]);
        if (id < 0 || id >= pageSize) {
            Send(Text(`发送0~${pageSize - 1}`));
        }
        let url = pngsList[id].largeUrl;
        const res = await fetch(url);
        const maskBuffer = Buffer.from(await res.arrayBuffer());
        Send(Image(maskBuffer));
    }
    if ((match = event.MessageText.match(/合成头像(\d+)/))) {
        const id = Number(match[1]);
        if (id < 0 || id >= pageSize) {
            Send(Text(`发送0~${pageSize - 1}`));
        }
        let url = pngsList[id].largeUrl;
        const res = await fetch(url);
        const maskBuffer = Buffer.from(await res.arrayBuffer());
        const maskMd5 = await createMD5(maskBuffer);
        const maskPngPath = join(cachePath, maskMd5 + ".png");
        if (!existsSync(maskPngPath)) {
            writeFileSync(maskPngPath, maskBuffer, "utf-8");
        }
        url = `http://127.0.0.1:${port}/cache/${maskMd5}.png`;
        const img = await Pictures("makeEmo", {
            data: {
                originUrl: (user ? user : event).UserAvatar ||
                    `https://q1.qlogo.cn/g?b=qq&s=0&nk=${event.UserId}`,
                maskUrl: url,
                mixBlendMode,
            },
        });
        // send
        if (typeof img != "boolean") {
            Send(Image(img));
        }
        else {
            Send(Text("图片加载失败"));
        }
    }
    if (/^第(\d+)页$/.test(event.MessageText)) {
        pageNo = (Number((/第(\d+)页/.exec(event.MessageText) || [])[1]) || 1) - 1;
    }
}, "message.create");

export { res as default };
