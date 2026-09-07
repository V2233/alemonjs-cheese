import { pluginInfo } from "../package.js";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import hljs from "highlight.js";
import { marked } from "marked";
import { run } from "@mermaid-js/mermaid-cli";

//#region src/utils/marked.ts
async function toMarkdown(text) {
	const renderer = new marked.Renderer();
	marked.setOptions({
		renderer,
		gfm: true,
		pedantic: false,
		tables: true,
		breaks: true,
		smartLists: true,
		smartpants: false,
		sanitize: false,
		xhtml: false,
		highlight: (code) => hljs.highlightAuto(code).value
	});
	return await marked(text);
}
async function toMermaid(text, outFormat) {
	if (!/```mermaid/.test(text)) text = mermaid2Md(text);
	const inputPath = join(pluginInfo.DATA_PATH, "mermaid.md");
	const outputPath = join(pluginInfo.DATA_PATH, `mermaid.${outFormat ? outFormat : "svg"}`);
	const realPath = join(pluginInfo.DATA_PATH, `mermaid-1.${outFormat ? outFormat : "svg"}`);
	writeFileSync(inputPath, text, "utf-8");
	await run(inputPath, outputPath, { puppeteerConfig: {
		timeout: 0,
		headless: true,
		args: [
			"--disable-dev-shm-usage",
			"--disable-setuid-sandbox",
			"--no-first-run",
			"--no-sandbox",
			"--no-zygote",
			"--single-process",
			"--disable-background-networking",
			"--disable-background-timer-throttling",
			"--disable-backgrounding-occluded-windows",
			"--disable-breakpad",
			"--disable-client-side-phishing-detection",
			"--disable-component-update",
			"--disable-default-apps",
			"--disable-domain-reliability",
			"--disable-extensions",
			"--disable-features=AudioServiceOutOfProcess",
			"--disable-hang-monitor",
			"--disable-ipc-flooding-protection",
			"--disable-popup-blocking",
			"--disable-print-preview",
			"--disable-prompt-on-repost",
			"--disable-renderer-backgrounding",
			"--disable-sync",
			"--force-color-profile=srgb",
			"--metrics-recording-only",
			"--safebrowsing-disable-auto-update",
			"--enable-automation",
			"--password-store=basic",
			"--use-mock-keychain"
		]
	} });
	let buffer;
	if (outFormat == "svg") buffer = readFileSync(realPath, "utf-8");
	else buffer = readFileSync(realPath);
	unlinkSync(realPath);
	return buffer;
}
function mermaid2Md(text) {
	return `\`\`\`mermaid\n${text}\n\`\`\``;
}

//#endregion
export { mermaid2Md, toMarkdown, toMermaid };