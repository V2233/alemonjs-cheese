const reg = ['win32'].includes(process.platform) ? /^file:\/\/\// : /^file:\/\// ;
const fileUrl = new URL('../../assets/github-markdown.css-DnxR6TT6.css', import.meta.url).href.replace(reg, '');

export { fileUrl as default };
