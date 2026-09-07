import config_default from "../../utils/config.js";
import { sleep } from "../../utils/index.js";
import { Pictures } from "../../image/index.js";
import { Image, Text, useSend } from "alemonjs";

//#region src/response/setting/res.ts
var res_default = OnResponse(async (event, next) => {
	if (!/奶酪设置/.test(event.MessageText)) {
		next();
		return;
	}
	const Send = useSend(event);
	if (!event.MessageText.replace(/.*奶酪设置/, "")) {
		const img = await Pictures("setting", { data: config_default.description });
		if (typeof img != "boolean") Send(Image(img));
		else Send(Text("图片加载失败"));
		next();
		return;
	}
	if (!event.IsMaster) {
		Send(Text("请找主人进行设置~"));
		next();
		return;
	}
	const cfgs = config_default.description;
	const regArr = [];
	const cfgParents = [];
	const cfgKeys = [];
	const cfgTypes = [];
	cfgs.forEach((cfg) => {
		cfg.value.forEach((prop) => {
			regArr.push(prop.title);
			cfgParents.push(cfg.key);
			cfgKeys.push(prop.prop);
			cfgTypes.push(typeof prop.value);
		});
	});
	const reg = new RegExp(`奶酪设置(${regArr.join("|")})(.*)`);
	let match = event.MessageText.match(reg);
	if (match) {
		let i = regArr.findIndex((item) => item === match[1]);
		if (match[2] != "") switch (cfgTypes[i]) {
			case "string":
				config_default.setConfig(match[2], [cfgKeys[i]], cfgParents[i]);
				break;
			case "number":
				config_default.setConfig(Number(match[2]), [cfgKeys[i]], cfgParents[i]);
				break;
			case "boolean": config_default.setConfig(Boolean(match[2]), [cfgKeys[i]], cfgParents[i]);
		}
	} else Send(Text(`未找到关键字，请重新设置!`));
	await sleep(500);
	const img = await Pictures("setting", { data: config_default.description });
	if (typeof img != "boolean") Send(Image(img));
	else Send(Text("图片加载失败"));
}, "message.create");

//#endregion
export { res_default as default };