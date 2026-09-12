//#region \0lvy-css:0
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/main.css-Dle1Sg7S.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };