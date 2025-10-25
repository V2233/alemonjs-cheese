import { pluginInfo } from "@src/package";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

let plat = "";
let isReaded = false;

class GroupStore {
  // map = new Map()
  map: {
    // 群号
    [key: string]: {
      group_id: string | number;
      group_map: {
        // 用户id
        [key: string]: {
          user_id: string | number;
          nickname: string;
          avatar: string;
        };
      };
    };
  } = {};
  async getGroup(group_id: string, platform: string) {
    let group_map = {};
    switch (platform) {
      case "qq": {
        const qqGroup = await (global.client as any).pickGroup(
          Number(group_id)
        );
        const qqGroupMap = await qqGroup.getMemberMap();
        for (const [user_id, user] of qqGroupMap) {
          group_map[user_id] = {
            user_id: user_id,
            nickname: user.nickname,
            avatar: `http://q2.qlogo.cn/headimg_dl?dst_uin=${user_id}&spec=5`,
          };
        }
        this.map[group_id] = {
          group_id: group_id,
          group_map,
        };
        return this.map[group_id];
      }
      case "one-bot": {
        const onebotGroup = (await (global.client as any).sendApi({
          action: "get_group_member_list",
          params: {
            group_id: Number(group_id),
          },
        })) as any;
        for (const member of onebotGroup.data) {
          group_map[member.user_id] = {
            user_id: member.user_id,
            nickname: member.nickname,
            avatar: member.avatar
              ? member.avatar
              : `http://q2.qlogo.cn/headimg_dl?dst_uin=${member.user_id}&spec=5`,
          };
        }
        this.map[group_id] = {
          group_id: group_id,
          group_map,
        };
        return this.map[group_id];
      }
      default:
        return (
          this.map[group_id] || {
            group_id: group_id,
            group_map,
          }
        );
    }
  }
  getGroupSync(group_id: string) {
    return this.map[group_id];
  }
  setGroup(group_id: string, value: any) {
    this.map[group_id] = value;
  }
}

const groupStore = new GroupStore();

export { groupStore };

/**
 * 更新缓存列表
 * 仅存储已使用缓存列表的群
 */
export default OnResponse(async (event, next) => {
  plat = event.Platform;
  if (event.Platform != "qq" && event.Platform != "onebot") {
    const groupDataPath = join(pluginInfo.DATA_PATH, plat + ".json");
    if (!isReaded) {
      if (existsSync(groupDataPath)) {
        groupStore.map = JSON.parse(readFileSync(groupDataPath, "utf-8"));
      }
      isReaded = true;
    }
    if (!groupStore.map[event.GuildId]) {
      groupStore.map[event.GuildId] = {
        group_id: event.GuildId,
        group_map: {},
      };
    }
    groupStore.map[event.GuildId].group_map[event.UserId] = {
      user_id: event.UserId,
      nickname: event.UserName as string,
      avatar: event.UserAvatar as string,
    };
  }
  next();
}, "message.create");
// },['member.add','member.remove', 'channal.create','channal.delete','guild.join','guild.exit'])

function saveMap() {
  if (plat && plat != "qq" && plat != "onebot") {
    const groupDataPath = join(pluginInfo.DATA_PATH, plat + ".json");
    writeFileSync(groupDataPath, JSON.stringify(groupStore.map), "utf-8");
  }
}

//每小时写入一次
setInterval(() => {
  saveMap();
}, 3600 * 1000);

process.on("beforeExit", () => {
  saveMap();
});
