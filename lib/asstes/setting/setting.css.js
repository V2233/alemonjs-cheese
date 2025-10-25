const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/setting.css-CgfG2Ip6.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
