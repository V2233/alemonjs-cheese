import router_default from "./router.js";
import { name } from "./package2.js";
import router from "./server/router.js";
import { getConfig } from "alemonjs";

//#region src/index.ts
var src_default = defineChildren({
	register() {
		return {
			response: router_default,
			koaRouter: router
		};
	},
	onCreated() {
		const APP_NAME = name;
		const botConfig = getConfig();
		logger.info(`[${APP_NAME}]在线管理地址：http://127.0.0.1:${botConfig.value?.serverPort || 17187}/apps/${APP_NAME}`);
		if (!botConfig.value?.serverPort) logger.warn(`[${APP_NAME}]未在 alemon.config.yaml中配置 serverPort ，网页可能无法访问！`);
		logger.info(`[${APP_NAME}] Loaded successfully!`);
	}
});

//#endregion
export { src_default as default };