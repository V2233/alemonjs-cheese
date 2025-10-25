import hljs from 'highlight.js';
import { marked } from 'marked';
import { run } from '@mermaid-js/mermaid-cli';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { pluginInfo } from '../package.js';
import { join } from 'path';

// import { JSDOM } from 'jsdom'
// import mermaid from 'mermaid'
async function toMarkdown(text) {
    const renderer = new marked.Renderer();
    // renderer.code = function (code, language) {
    //     if (language === 'mermaid') {
    //         // 使用 jsdom 创建一个临时的 DOM 环境
    //         const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
    //         const { window } = dom;
    //         const { document } = window;
    //         global.window = window
    //         global.document = document
    //         // 初始化 mermaid，并设置渲染目标（这里不需要实际的DOM元素，因为我们会直接获取SVG代码）
    //         mermaid.initialize({ startOnLoad: false, securityLevel: 'strict'  });
    //         // mermaid.setConfig({ document: document });
    //         return new Promise((resolve, reject) => {
    //             mermaid.render('chart', code, (svgCode, error) => {
    //                 if (error) {
    //                     reject(error);
    //                 } else {
    //                     // 返回渲染后的图表字符串
    //                     resolve(`<div class="mermaid">${svgCode}</div>`);
    //                 }
    //             });
    //         });
    //     } else {
    //         // 对于非 Mermaid 代码块，使用默认的 code 渲染器
    //         return `<pre><code class="lang-${language}">${hljs.highlightAuto(code).value}</code></pre>`;
    //     }
    // };
    marked.setOptions({
        renderer: renderer,
        gfm: true, // 启动类似于Github样式的Markdown语法
        pedantic: false, // 只解析符合Markdwon定义的，不修正Markdown的错误
        tables: true,
        breaks: true,
        smartLists: true,
        smartpants: false,
        sanitize: false,
        xhtml: false,
        highlight: (code) => hljs.highlightAuto(code).value,
    });
    return await marked(text);
}
async function toMermaid(text, outFormat) {
    if (!/```mermaid/.test(text))
        text = mermaid2Md(text);
    const inputPath = join(pluginInfo.DATA_PATH, 'mermaid.md');
    const outputPath = join(pluginInfo.DATA_PATH, `mermaid.${outFormat ? outFormat : 'svg'}`);
    const realPath = join(pluginInfo.DATA_PATH, `mermaid-1.${outFormat ? outFormat : 'svg'}`);
    writeFileSync(inputPath, text, 'utf-8');
    await run(inputPath, outputPath, {
        puppeteerConfig: {
            timeout: 0, //otocolTimeout: 0,
            headless: true,
            args: [
                '--disable-dev-shm-usage', // 禁用 /dev/shm 的使用，防止共享内存不足的问题
                '--disable-setuid-sandbox', // 禁用 setuid 沙盒
                '--no-first-run', // 跳过首次运行的设置
                '--no-sandbox', // 禁用沙盒模式
                '--no-zygote', // 禁用 zygote 进程
                '--single-process', // 使浏览器在单个进程中运行
                '--disable-background-networking', // 禁用后台网络请求
                '--disable-background-timer-throttling', // 禁用后台计时器节流
                '--disable-backgrounding-occluded-windows', // 禁用后台窗口
                '--disable-breakpad', // 禁用崩溃报告
                '--disable-client-side-phishing-detection', // 禁用客户端钓鱼检测
                '--disable-component-update', // 禁用组件更新
                '--disable-default-apps', // 禁用默认应用
                '--disable-domain-reliability', // 禁用域名可靠性
                '--disable-extensions', // 禁用扩展
                '--disable-features=AudioServiceOutOfProcess', // 禁用音频服务进程外处理
                '--disable-hang-monitor', // 禁用挂起监视器
                '--disable-ipc-flooding-protection', // 禁用 IPC 洪水保护
                '--disable-popup-blocking', // 禁用弹出窗口阻止
                '--disable-print-preview', // 禁用打印预览
                '--disable-prompt-on-repost', // 禁用重新发布提示
                '--disable-renderer-backgrounding', // 禁用渲染器后台处理
                '--disable-sync', // 禁用同步
                '--force-color-profile=srgb', // 强制使用 sRGB 颜色配置文件
                '--metrics-recording-only', // 仅记录指标
                '--safebrowsing-disable-auto-update', // 禁用安全浏览自动更新
                '--enable-automation', // 启用自动化
                '--password-store=basic', // 使用基本密码存储
                '--use-mock-keychain' // 使用模拟密钥链
            ]
        }
    });
    let buffer;
    if (outFormat == 'svg') {
        //@ts-ignore
        buffer = readFileSync(realPath, 'utf-8');
    }
    else {
        //@ts-ignore
        buffer = readFileSync(realPath);
    }
    unlinkSync(realPath);
    return buffer;
}
function mermaid2Md(text) {
    return `\`\`\`mermaid\n${text}\n\`\`\``;
}

export { mermaid2Md, toMarkdown, toMermaid };
