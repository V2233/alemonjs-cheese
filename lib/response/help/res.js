import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { sleep } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtImage, sendAtText } from "../../hooks/send.js";
import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { useEvent } from "alemonjs";

//#region src/response/help/res.ts
var res_default = async () => {
	const [event, next] = useEvent();
	await useErrorContext(async () => {
		const help = config_default.getConfig("help");
		if (new RegExp(help?.custom?.reg || "^我的帮助").test(event.current.MessageText)) {
			let logoImg = help?.custom?.logo_img;
			if (logoImg) logoImg = logoImg.startsWith("http") ? logoImg : resolve(pluginInfo.DATA_PATH, logoImg);
			const img = await Pictures("help", { data: {
				title: help?.custom?.title,
				desc: help?.custom?.desc,
				list: help?.custom?.list,
				width: help?.custom?.width,
				logo: help?.custom?.logo,
				logo_img: logoImg
			} });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
		if (/^(\/|#)?奶酪帮助$/.test(event.current.MessageText)) {
			const img = await Pictures("help", { data: {
				title: "奶酪帮助",
				desc: "Cheese Menu",
				list: help.default,
				logo_img: resolve(pluginInfo.PUBLIC_PATH, "cheese.png")
			} });
			if (typeof img != "boolean") await sendAtImage(img);
			else await sendAtText("图片加载失败");
			return;
		}
		if (/奶酪(查看|更改)帮助配置(.*)/.test(event.current.MessageText)) {
			const yamlPath = join(pluginInfo.ROOT_PATH, "config", "config", "help.yaml");
			if (event.current.MessageText.includes("更改")) {
				writeFileSync(yamlPath, event.current.MessageText.replace(/.*奶酪更改帮助配置(\+)?/, ""), "utf-8");
				await sendAtText("修改成功！");
			} else {
				await sendAtText(readFileSync(yamlPath, "utf-8"));
				await sleep(2e3);
				await sendAtText("请发送 奶酪更改帮助配置+以上配置 进行修改~");
			}
			return;
		}
		next();
	});
};

//#endregion
export { res_default as default };