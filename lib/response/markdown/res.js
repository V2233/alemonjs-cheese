import { useSend, Image, Text } from 'alemonjs';
import { Pictures } from '../../image/index.js';
import { readFileSync } from 'fs';
import { pluginInfo } from '../../package.js';
import { toMarkdown, toMermaid } from '../../utils/marked.js';
import { join } from 'path';
import Cfg from '../../utils/config.js';

var res = OnResponse(async (event, next) => {
    if (/^(\/|#)?md(.*)$/.test(event.MessageText)) {
        // 创建一个send
        const Send = useSend(event);
        let mdText = event.MessageText.replace(/md/, "");
        if (!mdText)
            mdText = readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "md", "test.md"), "utf-8");
        const img = await Pictures("markdown", {
            data: {
                html: await toMarkdown(mdText),
                avatar: event.UserAvatar || "",
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
    if (/^(\/|#)?mm(.*)$/.test(event.MessageText)) {
        // 创建一个send
        const Send = useSend(event);
        let mdText = event.MessageText.replace(/mm/, "");
        (mdText = mdText
            ? mdText
            : `graph\n   accTitle: My title here\n   accDescr: My description here\n   A-->B`);
        const cfg = Cfg.getConfig("mermaid");
        if (cfg.use_theme) {
            const img = await Pictures("htmlTemplate", {
                data: {
                    title: "流程图",
                    html: await toMermaid(mdText, "svg"),
                    avatar: event.UserAvatar || "",
                    style: { display: "flex", justifyContent: "center" },
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
        else {
            Send(Image(await toMermaid(mdText, "png")));
        }
    }
    next();
    return;
}, "message.create");

export { res as default };
