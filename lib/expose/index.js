import { helpActions } from "./help.js";
import { luckActions } from "./luck.js";
import { marryActions } from "./marry.js";
import { memeActions } from "./meme.js";
import { settingActions } from "./setting.js";
import { Expose } from "alemonjs";
import pkgJson from "alemonjs-cheese/package" with { type: "json" };

// src/expose/index.ts
const cheeseExpose = Expose.create().provide({
	name: "cheese",
	displayName: "奶酪插件",
	entryCommand: "/奶酪帮助",
	version: pkgJson.version,
	description: "奶酪插件功能入口：运势、看图识梗、结婚、帮助。本 Expose 只提供“发起功能/查询入口”，发起后的细化交互（答题、亲密度操作、翻页等）仍由用户按提示发送指令完成。",
	actions: {
		...luckActions,
		...memeActions,
		...marryActions,
		...helpActions,
		...settingActions
	}
});

export { cheeseExpose };