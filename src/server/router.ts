import { bodyParser } from '@koa/bodyparser';
import Router from '@koa/router';

const router = new Router({ prefix: '/api' });

router.use(bodyParser());

import Cfg from '../utils/config';

router.get('/config', async (ctx, next) => {
  const cfgs = Cfg.description;
  ctx.body = { data: cfgs };
});

router.post('/config/set', async (ctx, next) => {
  const data = ctx.request.body as { key: string; value: { prop: string; value: any }[] };
  const cfg = {};
  data.value.forEach(el => {
    cfg[el.prop] = el.value;
  });
  Cfg.setYamlAll(data.key, cfg);

  const cfgs = Cfg.description;
  ctx.body = { data: cfgs };
});

export default router;
