const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/meme.css-BgEZnKgY.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
