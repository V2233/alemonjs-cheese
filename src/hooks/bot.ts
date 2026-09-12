import { getConfigValue, useEvent } from 'alemonjs';

export function useUserAvatar(useId: string) {
  const cfg = getConfigValue();
  const [event] = useEvent();
  if (event.current.Platform == 'qq-bot') {
    return `https://q.qlogo.cn/qqapp/${cfg.bot_id}/${useId}/640`;
  }
  return `http://q2.qlogo.cn/headimg_dl?dst_uin=${useId}&spec=5`;
}
