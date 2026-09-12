import hljs from "highlight.js";
import { marked } from "marked";
import { render, renderPng } from "sebastianjs";

//#region src/utils/marked.ts
async function toMarkdown(text) {
	const renderer = new marked.Renderer();
	marked.setOptions({
		renderer,
		gfm: true,
		pedantic: false,
		breaks: true,
		highlight: (code) => hljs.highlightAuto(code).value
	});
	return await marked(text);
}
async function toMermaid(text, outFormat) {
	if (outFormat == "svg") return await render(text, {
		theme: "white",
		themeVariables: { primaryColor: "#3366ff" },
		themeCSS: ".node rect{ rx:4; ry:4 }",
		width: 800,
		height: 600
	});
	else {
		const { data, width, height } = await renderPng(text, {
			scale: 2,
			background: "white"
		});
		return data;
	}
}
function mermaid2Md(text) {
	return `\`\`\`mermaid\n${text}\n\`\`\``;
}

//#endregion
export { mermaid2Md, toMarkdown, toMermaid };