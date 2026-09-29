import { req, reqJson } from './request';

// ---------- 类型 ----------

export interface Value {
  prop: string;
  title: string;
  desc: string;
  value: any;
  component: string;
  children?: string[];
}

export interface IConfig {
  key: string;
  title: string;
  value: Value[];
}

// 后端统一返回 { data: ... }
interface Resp<T> {
  data: T;
}

export const api = {
  /** 拉取全部配置块：GET /config → { data: IConfig[] } */
  config: () => req<Resp<IConfig[]>>('/config').then(r => r.data),

  /** 保存某个配置块：POST /config/set，body 直接传 IConfig 对象 */
  saveConfig: (cfg: IConfig) =>
    reqJson<Resp<IConfig[]>>('/config/set', 'POST', cfg).then(r => r.data),
};
