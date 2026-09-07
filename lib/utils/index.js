import { URL } from "url";
import fetch from "node-fetch";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

//#region src/utils/index.ts
/**
* 格式化时间
* @param timeStamp 时间戳
* @param format 'YYYY/MM/DD hh:mm:ss'
* @returns 'YYYY/MM/DD hh:mm:ss'
*/
function getTime(timeStamp = /* @__PURE__ */ new Date(), format = "YYYY/MM/DD hh:mm:ss") {
	const padZero = (num) => num.toString().padStart(2, "0");
	const options = {
		"YYYY": () => timeStamp.getFullYear().toString(),
		"MM": () => padZero(timeStamp.getMonth() + 1),
		"DD": () => padZero(timeStamp.getDate()),
		"hh": () => padZero(timeStamp.getHours() % 12 || 12),
		"HH": () => padZero(timeStamp.getHours()),
		"mm": () => padZero(timeStamp.getMinutes()),
		"ss": () => padZero(timeStamp.getSeconds()),
		"a": () => timeStamp.getHours() < 12 ? "am" : "pm",
		"A": () => timeStamp.getHours() < 12 ? "AM" : "PM"
	};
	let formattedDate = format;
	for (let key in options) if (format.includes(key)) formattedDate = formattedDate.replace(new RegExp(key, "g"), options[key]());
	return formattedDate;
}
/**
* 每天定时任务
* @param executeTask 任务
* @returns 
*/
function scheduleTask(executeTask, time = {}) {
	const now = /* @__PURE__ */ new Date();
	const target = new Date(now);
	target.setHours(time.hour || 0, time.minute || 0, time.second || 0);
	if (target < now) target.setDate(target.getDate() + 1);
	const msUntilExecution = target.getTime() - now.getTime();
	return setTimeout(() => {
		executeTask();
		scheduleTask(executeTask, time);
	}, msUntilExecution);
}
/**
* 获取文件buffer
* @param url 
* @returns 
*/
function requestBuffer(url) {
	return new Promise((resolve, reject) => {
		try {
			const parsedUrl = new URL(url);
			if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") fetch(url).then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.arrayBuffer();
			}).then((data) => resolve(Buffer.from(data))).catch((error) => reject(error));
			else readFile(url).then((data) => resolve(data)).catch((error) => reject(error));
		} catch (error) {
			reject(/* @__PURE__ */ new Error(`Invalid URL or unsupported protocol: ${url}`));
		}
	});
}
/**
* 休眠
* @param ms 
* @returns 
*/
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
* 十六进制转RGB
* @param hex 
* @param opacity
* @returns 
*/
function hexToRgb(hex, opacity = .5) {
	hex = hex.replace(/^#/, "");
	if (hex.length === 3) hex = hex.split("").map((x) => x + x).join("");
	let color = hex.match(/.{2}/g)?.map((x) => parseInt(x, 16)) || [];
	if (color.length == 3) return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
	if (color.length == 4) return `rgba(${color[1]}, ${color[2]}, ${color[2]}, ${(color[0] / 255).toFixed(2)})`;
	return "#" + hex;
}
/**
* 获取md5
* @param buffer 
* @returns 
*/
async function createMD5(buffer) {
	const hash = createHash("md5");
	hash.update(buffer);
	return hash.digest("hex");
}

//#endregion
export { createMD5, getTime, hexToRgb, requestBuffer, scheduleTask, sleep };