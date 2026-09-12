import { groupStore } from './groupStore';

/**
 * 更新缓存列表
 * 仅存储已使用缓存列表的群
 */
export default OnResponse(async (event, next) => {
  groupStore.currentPlatform = event.Platform;

  if (!(await groupStore.getGroup(event.GuildId))) {
    groupStore.setGroup(event.GuildId, {
      group_id: event.GuildId,
      group_map: {},
    });
  }
  groupStore.setGroupMember(event.GuildId, event.UserId, {
    user_id: event.UserId,
    nickname: event.UserName as string,
    avatar: event.UserAvatar as string,
    sex: event.value?.sender?.sex || 'female',
  });

  next();
}, 'message.create');
// },['member.add','member.remove', 'channal.create','channal.delete','guild.join','guild.exit'])
