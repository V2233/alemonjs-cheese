import { pluginInfo } from "../../package.js";
import config_default from "../../utils/config.js";
import { sleep } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { Image, Text, useSend } from "alemonjs";

//#region src/response/help/res.ts
var res_default = OnResponse(async (event, next) => {
	const help = config_default.getConfig("help");
	const custom_reg = new RegExp(help?.custom?.reg || "^我的帮助");
	if (/^(\/|#)?奶酪帮助$/.test(event.MessageText)) {
		const Send = useSend(event);
		const img = await Pictures("help", { data: {
			title: "奶酪帮助",
			desc: "Cheese Menu",
			list: help.default,
			logo_img: resolve(pluginInfo.PUBLIC_PATH, "cheese.png")
		} });
		if (typeof img != "boolean") Send(Image(img));
		else Send(Text("图片加载失败"));
	}
	if (custom_reg.test(event.MessageText)) {
		const Send = useSend(event);
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
		if (typeof img != "boolean") Send(Image(img));
		else Send(Text("图片加载失败"));
	}
	if (/奶酪(查看|更改)帮助配置(.*)/.test(event.MessageText)) {
		const Send = useSend(event);
		const yamlPath = join(pluginInfo.ROOT_PATH, "config", "config", "help.yaml");
		if (event.MessageText.includes("更改")) {
			writeFileSync(yamlPath, event.MessageText.replace(/.*奶酪更改帮助配置(\+)?/, ""), "utf-8");
			Send(Text("修改成功！"));
		} else {
			Send(Text(readFileSync(yamlPath, "utf-8")));
			await sleep(2e3);
			Send(Text("请发送 奶酪更改帮助配置+以上配置 进行修改~"));
		}
	}
	next();
}, "message.create");

//#endregion
export { res_default as default };