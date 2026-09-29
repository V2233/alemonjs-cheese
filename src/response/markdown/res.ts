import { useErrorContext } from '@src/hooks/error';
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import { pluginInfo } from '@src/package';
import Cfg from '@src/utils/config';
import { toMarkdown, toMermaid } from '@src/utils/marked';
import { useEvent } from 'alemonjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// const mermaidScript = (text: string) => `
// <pre class="mermaid">
//   ${text}
// </pre>
// <script type="module">
//   import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs';
//   mermaid.initialize({ startOnLoad: true });
// </script>
// `;

export default async () => {
  const [event, next] = useEvent({
    selects: ['message.create', 'private.message.create'],
  });
  if (!event.match.selects) {
    next();
    return;
  }

  await useErrorContext(async () => {
    if (/^(\/|#)?md(.*)$/.test(event.current.MessageText)) {
      let mdText = event.current.MessageText.replace(/md/, '');
      if (!mdText)
        mdText = readFileSync(join(pluginInfo.PUBLIC_PATH, 'apps', 'md', 'test.md'), 'utf-8');

      const img = await Pictures('markdown', {
        data: {
          html: await toMarkdown(mdText),
          avatar: event.current.UserAvatar || '',
        },
      });
      // send
      if (typeof img != 'boolean') {
        await sendAtImage(img);
      } else {
        await sendAtText('图片加载失败');
      }
    }

    if (/^(\/|#)?mm(.*)$/.test(event.current.MessageText)) {
      let mdText = event.current.MessageText.replace(/mm/, '');
      ((mdText = mdText
        ? mdText
        : `graph\n   accTitle: My title here\n   accDescr: My description here\n   A-->B`),
        'svg');

      const cfg = Cfg.getConfig('mermaid');
      if (cfg.use_theme) {
        const img = await Pictures('htmlTemplate', {
          data: {
            title: '流程图',
            html: await toMermaid(mdText, 'svg'),
            // html: mermaidScript(mdText),
            avatar: event.current.UserAvatar || '',
            style: { display: 'flex', justifyContent: 'center' },
          },
        });
        // send
        if (typeof img != 'boolean') {
          await sendAtImage(img);
        } else {
          await sendAtText('图片加载失败');
        }
      } else {
        await sendAtImage(await toMermaid(mdText, 'png'));
      }
    }

    next();
  });
};
