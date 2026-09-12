import { compressImageFromBuffer } from "../utils/imageProcessor.js";
import { EmoList, MakeEmo } from "./conponent/emotion.js";
import App from "./conponent/help.js";
import App$1 from "./conponent/html_template.js";
import App$2 from "./conponent/lover_rank.js";
import App$3 from "./conponent/luck_history.js";
import App$4 from "./conponent/markdown.js";
import App$5 from "./conponent/meme_qs.js";
import App$6 from "./conponent/meme_rank.js";
import App$7 from "./conponent/qrcode.js";
import App$8 from "./conponent/setting.js";
import App$9 from "./conponent/today_luck.js";
import { renderComponentIsHtmlToBuffer } from "jsxp";

//#region src/image/index.tsx
const components = {
	help: App,
	setting: App$8,
	todayLuck: App$9,
	luckHistory: App$3,
	loverRank: App$2,
	memeRank: App$6,
	memeQs: App$5,
	markdown: App$4,
	qrcode: App$7,
	emoList: EmoList,
	makeEmo: MakeEmo,
	htmlTemplate: App$1
};
const Pictures = (key, options, name) => {
	return new Promise((resolve, reject) => {
		renderComponentIsHtmlToBuffer(components[key], options, name).then((res) => {
			if (typeof res == "boolean") reject(false);
			else compressImageFromBuffer(res).then((buf) => {
				resolve(buf);
			}).catch(() => {
				reject(false);
			});
		}).catch((err) => {
			logger.warn(`[cheese]图片渲染错误：`, err);
		});
	});
};

//#endregion
export { Pictures };