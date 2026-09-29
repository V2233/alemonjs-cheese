import { pluginInfo } from "../../package.js";
import { useErrorContext } from "../../hooks/error.js";
import { sendAtText } from "../../hooks/send.js";
import "../../utils/index.js";
import "../../utils/marked.js";
import { assetsPath } from "../../utils/server.js";
import "../../image/index.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ResultCode, useEvent, useMention } from "alemonjs";

//#region src/response/uni_emotions/res.ts
const cachePath = join(assetsPath, "cache");
if (!existsSync(cachePath)) mkdirSync(cachePath, { recursive: true });
const maskDataPath = join(pluginInfo.DATA_PATH, "maskDB.json");
if (!existsSync(maskDataPath)) writeFileSync(maskDataPath, JSON.stringify([]), "utf-8");
JSON.parse(readFileSync(maskDataPath, "utf8"));
var res_default = async () => {
	const [event, next] = useEvent({
		regular: /头像合成帮助|搜索图片|获取图片(.*)|混合模式(.*)|合成头像(.*)/,
		selects: ["message.create", "private.message.create"]
	});
	if (!event.match.regular || !event.match.selects) {
		next();
		return;
	}
	await useErrorContext(async () => {
		await sendAtText("暂不可用~");
		next();
	});
};

//#endregion
export { res_default as default };