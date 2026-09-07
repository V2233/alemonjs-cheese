//#region \0lvy-css:2
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/github-var.css-zTIyk-PT.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };