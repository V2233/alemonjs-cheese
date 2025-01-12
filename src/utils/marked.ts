// import { JSDOM } from 'jsdom'
// import mermaid from 'mermaid'
import hljs from 'highlight.js';
import { marked } from 'marked'
import { run } from "@mermaid-js/mermaid-cli"
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { pluginInfo } from '@src/package';
import { join } from 'path';

export async function toMarkdown(text:string) {
    const renderer = new marked.Renderer()
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
        gfm: true,	// 启动类似于Github样式的Markdown语法
        pedantic: false, // 只解析符合Markdwon定义的，不修正Markdown的错误
        tables: true,
        breaks: true,
        smartLists: true,
        smartpants: false,
        sanitize: false,
        xhtml: false,
        highlight: (code) => hljs.highlightAuto(code).value,
    })
    return await marked(text)
}

interface IMermaidFormat {
    'png': Buffer,
    'svg': string,
    'pdf': Buffer
}


export async function toMermaid<T extends keyof IMermaidFormat>(text:string,outFormat?:T): Promise<IMermaidFormat[T]> {
    if(!/```mermaid/.test(text)) text = mermaid2Md(text)

    const inputPath = join(pluginInfo.DATA_PATH,'mermaid.md')
    const outputPath = join(pluginInfo.DATA_PATH,`mermaid.${outFormat?outFormat:'svg'}`) as `${string}.png` | `${string}.svg` | `${string}.pdf` | `${string}.md` | `${string}.markdown` | "/dev/stdout"
    const realPath = join(pluginInfo.DATA_PATH,`mermaid-1.${outFormat?outFormat:'svg'}`) 
    writeFileSync(inputPath,text,'utf-8')
    await run(
        inputPath, outputPath, // {optional options},
    )
    let buffer: IMermaidFormat[T]

    if(outFormat == 'svg') {
        //@ts-ignore
        buffer = readFileSync(realPath,'utf-8')
    } else {
        //@ts-ignore
        buffer = readFileSync(realPath)
    }
    unlinkSync(realPath)
    return buffer
}

export function mermaid2Md(text:string) {
    return `\`\`\`mermaid\n${text}\n\`\`\``
}