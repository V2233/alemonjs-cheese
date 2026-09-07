//#region \0lvy-css:4
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/github-markdown.css-tF-z08Qx.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };