//#region \0lvy-css:0
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/emotion.css-BAx8GjqS.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };