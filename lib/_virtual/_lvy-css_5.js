//#region \0lvy-css:5
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/setting.css-Ctgwmu3r.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };