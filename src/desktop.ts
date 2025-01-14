import { readFileSync } from 'fs'
import { join } from 'path'
import { pluginInfo } from './package'
import Cfg from '@src/utils/config'

// 被激活的时候。
const activate = context => {
    // 创建一个 webview。
    const webView = context.createSidebarWebView(context)
    // 当命令被触发的时候。
    context.onCommand('open.cheese', () => {
        const dir = join(pluginInfo.PUBLIC_PATH, 'index.html')
        // 确保路径存在
        const html = readFileSync(dir, 'utf-8')
        webView.loadWebView(html)
    })
    // 监听 webview 的消息。
    webView.onMessage(data => {
        try {
            if (data.type === 'cheese.form.save') {
                context.notification('配置保存～')
            } else if (data.type === 'cheese.init') {
                const cfgs = Cfg.description
                // 发送消息
                webView.postMessage({
                    type: 'cheese.init',
                    data: cfgs
                })
            }
        } catch (e) {
            console.error(e)
        }
    })
}

export { activate }