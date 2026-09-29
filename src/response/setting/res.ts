import { useErrorContext } from '@src/hooks/error';
import { sendAtImage, sendAtText } from '@src/hooks/send';
import { Pictures } from '@src/image/index';
import Cfg from '@src/utils/config';
import { sleep } from '@src/utils/index';
import { useEvent } from 'alemonjs';

export default async () => {
  const [event, next] = useEvent({
    regular: /奶酪设置/,
    selects: ['message.create', 'private.message.create'],
  });

  if (!event.match.regular || !event.match.selects) {
    next();
    return;
  }

  await useErrorContext(async () => {
    let txt = event.current.MessageText.replace(/.*奶酪设置/, '');
    if (!txt) {
      const img = await Pictures('setting', {
        data: Cfg.description,
      });
      if (typeof img != 'boolean') {
        await sendAtImage(img);
      } else {
        await sendAtText('图片加载失败');
      }
      next();
      return;
    }

    if (!event.current.IsMaster) {
      await sendAtText('请找主人进行设置~');
      next();
      return;
    }

    const cfgs = Cfg.description;

    const regArr: string[] = [];
    const cfgParents: string[] = [];
    const cfgKeys: string[] = [];
    const cfgTypes: string[] = [];

    cfgs.forEach(cfg => {
      cfg.value.forEach(prop => {
        regArr.push(prop.title);
        cfgParents.push(cfg.key);
        cfgKeys.push(prop.prop);
        cfgTypes.push(typeof prop.value);
      });
    });

    const reg = new RegExp(`奶酪设置(${regArr.join('|')})(.*)`);
    let match = event.current.MessageText.match(reg);
    if (match) {
      let i = regArr.findIndex(item => item === match[1]);
      if (match[2] != '') {
        switch (cfgTypes[i]) {
          case 'string':
            Cfg.setConfig(match[2], [cfgKeys[i]], cfgParents[i]);
            break;
          case 'number':
            Cfg.setConfig(Number(match[2]), [cfgKeys[i]], cfgParents[i]);
            break;
          case 'boolean':
            Cfg.setConfig(match[2] == 'true' ? true : false, [cfgKeys[i]], cfgParents[i]);
            break;
          default:
        }
      }
    } else {
      await sendAtText(`未找到关键字，请重新设置!`);
    }

    await sleep(500);

    // pic
    const img = await Pictures('setting', {
      data: Cfg.description,
    });

    // send
    if (typeof img != 'boolean') {
      await sendAtImage(img);
    } else {
      await sendAtText('图片加载失败');
    }
  });
};
