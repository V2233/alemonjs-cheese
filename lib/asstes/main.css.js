const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../assets/main.css-CZ8uw7lp.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
