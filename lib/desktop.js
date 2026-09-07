import { pluginInfo } from "./package.js";
import config_default from "./utils/config.js";
import { readFileSync } from "fs";
import { join } from "path";

//#region src/desktop.ts
const activate = (context) => {
	const webView = context.createSidebarWebView(context);
	context.onCommand("open.cheese", () => {
		const dir = join(pluginInfo.PUBLIC_PATH, "static");
		const htmlPath = join(dir, "index.html");
		let html = readFileSync(htmlPath, "utf-8");
		const scriptReg = /<script.*?src="(.+?)".*?>/;
		const styleReg = /<link.*?href="(.+?)".*?>/;
		const styleUri = context.createExtensionDir(join(dir, "assets", "index.css"));
		const scriptUri = context.createExtensionDir(join(dir, "assets", "index.js"));
		html = html.replace(scriptReg, `<script type="module" crossorigin src="${scriptUri}"><\/script>`).replace(styleReg, `<link rel="stylesheet" crossorigin href="${styleUri}">`);
		webView.loadWebView(html);
	});
	webView.onMessage((data) => {
		try {
			if (data.type === "cheese.config.save") {
				const cfg = {};
				const d = JSON.parse(data.data);
				d.value.forEach((el) => {
					cfg[el.prop] = el.value;
				});
				config_default.setYamlAll(d.key, cfg);
				context.notification("配置保存～");
			} else if (data.type === "cheese.init") {
				const cfgs = config_default.description;
				webView.postMessage({
					type: "cheese.config",
					data: cfgs
				});
			}
		} catch (e) {
			console.error(e);
		}
	});
};

//#endregion
export { activate };