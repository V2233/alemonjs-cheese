import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { Pictures } from "../../image/index.js";
import { toMarkdown, toMermaid } from "../../utils/marked.js";
import { readFileSync } from "fs";
import { join } from "path";
import { useEvent } from "alemonjs";

//#region src/response/markdown/res.ts
var res_default = async () => {
	const [event, next] = useEvent({ selects: ["message.create", "private.message.create"] });
	if (!event.match.selects) {
		next();
		return;
	}
	await useErrorContext(async () => {
		if (/^(\/|#)?md(.*)$/.test(event.current.MessageText)) {
			let mdText = event.current.MessageText.replace(/md/, "");
			if (!mdText) mdText = readFileSync(join(pluginInfo.PUBLIC_PATH, "apps", "md", "test.md"), "utf-8");
			const img = await Pictures("markdown", { data: {
				html: await toMarkdown(mdText),
				avatar: event.current.UserAvatar || ""
			} });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
		}
		if (/^(\/|#)?mm(.*)$/.test(event.current.MessageText)) {
			let mdText = event.current.MessageText.replace(/mm/, "");
			mdText = mdText ? mdText : `graph\n   accTitle: My title here\n   accDescr: My description here\n   A-->B`;
			if (config_default.getConfig("mermaid").use_theme) {
				const img = await Pictures("htmlTemplate", { data: {
					title: "流程图",
					html: await toMermaid(mdText, "svg"),
					avatar: event.current.UserAvatar || "",
					style: {
						display: "flex",
						justifyContent: "center"
					}
				} });
				if (typeof img != "boolean") await sendAtImage(img);
				else await sendAtText("图片加载失败");
			} else await sendAtImage(await toMermaid(mdText, "png"));
		}
		next();
	});
};

//#endregion
export { res_default as default };