import Cfg from '../utils/config';
import {
  dataQuery,
  emptyInput,
  object,
  query,
  record,
  requireMaster,
  stringSchema,
} from './shared';

export const settingActions = {
  get_settings: dataQuery(
    '管理员查询奶酪配置项（只读）',
    emptyInput,
    record({
      items: {
        type: 'array',
        items: record({
          parent: stringSchema,
          key: stringSchema,
          title: stringSchema,
          type: stringSchema,
        }),
      },
    }),
    (_input, user) => {
      requireMaster(user);
      const items = Cfg.description.flatMap(cfg =>
        cfg.value.map(prop => ({
          parent: cfg.key,
          key: prop.prop,
          title: prop.title,
          type: typeof prop.value,
        }))
      );
      return { items };
    }
  ),
  update_setting: query(
    '管理员修改奶酪配置；key 为设置项 prop，value 为字符串，内部按原类型转换',
    object(
      { key: { ...stringSchema, minLength: 1 }, value: { ...stringSchema, maxLength: 2000 } },
      ['key', 'value']
    ),
    (input: any, user) => {
      requireMaster(user);
      const cfg = Cfg.description.find(c => c.value.some(p => p.prop === input.key));
      const prop = cfg?.value.find(p => p.prop === input.key);
      if (!cfg || !prop) throw new Error('未找到该配置项');
      const raw = prop.value;
      const value =
        typeof raw === 'number'
          ? Number(input.value)
          : typeof raw === 'boolean'
            ? input.value === 'true'
            : input.value;
      Cfg.setConfig(value, [prop.prop], cfg.key);
      return `已更新 ${cfg.key}.${prop.prop} = ${String(value)}`;
    },
    'write'
  ),
};
