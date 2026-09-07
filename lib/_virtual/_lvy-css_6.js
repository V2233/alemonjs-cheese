//#region \0lvy-css:6
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/luck.css-BE3rm2TL.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };