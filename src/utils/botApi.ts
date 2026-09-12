import { getConfigValue } from 'alemonjs';

export function getBotAvatar(useId: string) {
  const cfg = getConfigValue();
  return `https://q.qlogo.cn/qqapp/${cfg.bot_id}/${useId}/640`;
}
