//#region \0lvy-css:7
const reg = ["win32"].includes(process.platform) ? /^file:\/\/\// : /^file:\/\//;
const fileUrl = new URL("../assets/meme.css-CU0sbyZ1.css", import.meta.url).href.replace(reg, "");

//#endregion
export { fileUrl as default };