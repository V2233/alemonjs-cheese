import { groupStore } from "./groupStore.js";

//#region src/response/store/res.ts
/**
* 更新缓存列表
* 仅存储已使用缓存列表的群
*/
var res_default = OnResponse(async (event, next) => {
	groupStore.currentPlatform = event.Platform;
	if (!await groupStore.getGroup(event.GuildId)) groupStore.setGroup(event.GuildId, {
		group_id: event.GuildId,
		group_map: {}
	});
	groupStore.setGroupMember(event.GuildId, event.UserId, {
		user_id: event.UserId,
		nickname: event.UserName,
		avatar: event.UserAvatar,
		sex: event.value?.sender?.sex || "female"
	});
	next();
}, "message.create");

//#endregion
export { res_default as default };