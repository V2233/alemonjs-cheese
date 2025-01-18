import { readFileSync } from 'fs';
import { join } from 'path';
import { pluginInfo } from './package.js';
import Cfg from './utils/config.js';

// 被激活的时候。
const activate = context => {
    // 创建一个 webview。
    const webView = context.createSidebarWebView(context);
    // 当命令被触发的时候。
    context.onCommand('open.cheese', () => {
        const dir = join(pluginInfo.PUBLIC_PATH, 'static');
        const htmlPath = join(dir, 'index.html');
        // 确保路径存在
        let html = readFileSync(htmlPath, 'utf-8');
        const scriptReg = /<script.*?src="(.+?)".*?>/;
        const styleReg = /<link.*?href="(.+?)".*?>/;
        // 创建 webview 路径
        const styleUri = context.createExtensionDir(join(dir, 'assets', 'index-Ac5Ba6rJ.css'));
        const scriptUri = context.createExtensionDir(join(dir, 'assets', 'index-pbmhOlsh.js'));
        html = html
            .replace(scriptReg, `<script type="module" crossorigin src="${scriptUri}"></script>`)
            .replace(styleReg, `<link rel="stylesheet" crossorigin href="${styleUri}">`);
        webView.loadWebView(html);
    });
    // 监听 webview 的消息。
    webView.onMessage(data => {
        console.log(data)
        try {
            if (data.type === 'cheese.config.save') {
                const cfg = {};
                const d = JSON.parse(data.data)
                d.value.forEach(el => {
                    cfg[el.prop] = el.value;
                });
                Cfg.setYamlAll(d.key, cfg);
                context.notification('配置保存～');
            }
            else if (data.type === 'cheese.init') {
                const cfgs = Cfg.description;
                // 发送消息
                webView.postMessage({
                    type: 'cheese.config',
                    data: cfgs
                });
            }
        }
        catch (e) {
            console.error(e);
        }
    });
};

export { activate };
