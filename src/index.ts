import response from '@src/router';
import { getConfig } from 'alemonjs';

import pkgJson from '../package.json';
import koaRouter from './server/router';

export default defineChildren({
  register() {
    return {
      response,
      koaRouter,
    };
  },
  onCreated() {
    const APP_NAME = pkgJson.name;
    const botConfig = getConfig();
    logger.info(
      `[${APP_NAME}]在线管理地址：http://${'127.0.0.1'}:${botConfig.value?.serverPort || 17187}/apps/${APP_NAME}`
    );
    if (!botConfig.value?.serverPort)
      logger.warn(`[${APP_NAME}]未在 alemon.config.yaml中配置 serverPort ，网页可能无法访问！`);

    logger.info(`[${APP_NAME}] Loaded successfully!`);
  },
});
