//#region \0lvy-css:3
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/highlight.css-AVBcEQp1.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };