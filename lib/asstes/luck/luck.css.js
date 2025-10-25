const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/luck.css-D1T6axiy.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
