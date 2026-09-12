//#region \0lvy-css:1
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/marry.css-x0phGxKZ.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };