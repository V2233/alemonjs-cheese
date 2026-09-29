import { useErrorContext } from '@src/hooks/error';
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import { pluginInfo } from '@src/package';
import Cfg from '@src/utils/config';
import { sleep } from '@src/utils/index';
import { useEvent } from 'alemonjs';
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export default async () => {
  const [event, next] = useEvent();

  await useErrorContext(async () => {
    const help = Cfg.getConfig('help');
    const custom_reg = new RegExp(help?.custom?.reg || '^我的帮助');

    if (custom_reg.test(event.current.MessageText)) {
      let logoImg = help?.custom?.logo_img as string;
      if (logoImg)
        logoImg = logoImg.startsWith('http') ? logoImg : resolve(pluginInfo.DATA_PATH, logoImg);
      const img = await Pictures('help', {
        data: {
          title: help?.custom?.title,
          desc: help?.custom?.desc,
          list: help?.custom?.list,
          width: help?.custom?.width,
          logo: help?.custom?.logo,
          logo_img: logoImg,
        },
      });
      // send
      if (typeof img != 'boolean') {
        await sendAtImage(img);
      } else {
        await sendAtText('图片加载失败');
      }
      return;
    }

    if (/^(\/|#)?奶酪帮助$/.test(event.current.MessageText)) {
      const img = await Pictures('help', {
        data: {
          title: '奶酪帮助',
          desc: 'Cheese Menu',
          list: help.default,
          logo_img: resolve(pluginInfo.PUBLIC_PATH, 'cheese.png'),
        },
      });
      // send
      if (typeof img != 'boolean') {
        await sendAtImage(img);
      } else {
        await sendAtText('图片加载失败');
      }

      return;
    }

    if (/奶酪(查看|更改)帮助配置(.*)/.test(event.current.MessageText)) {
      const yamlPath = join(pluginInfo.ROOT_PATH, 'config', 'config', 'help.yaml');
      if (event.current.MessageText.includes('更改')) {
        writeFileSync(
          yamlPath,
          event.current.MessageText.replace(/.*奶酪更改帮助配置(\+)?/, ''),
          'utf-8'
        );
        await sendAtText('修改成功！');
      } else {
        await sendAtText(readFileSync(yamlPath, 'utf-8'));
        await sleep(2000);
        await sendAtText('请发送 奶酪更改帮助配置+以上配置 进行修改~');
      }
      return;
    }

    next();
  });
};
