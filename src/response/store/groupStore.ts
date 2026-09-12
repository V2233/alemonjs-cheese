import { pluginInfo } from '@src/package';
import { existsSync, promises as fsp } from 'fs';
import { join } from 'path';

interface IStoreGroupMember {
  user_id: string | number;
  nickname: string;
  avatar: string;
  sex?: 'male' | 'female';
}

interface IStoreGroup {
  group_id: string | number;
  group_map: {
    // 用户id
    [key: string]: IStoreGroupMember;
  };
}

class GroupStore {
  private _map: {
    // 群号
    [key: string]: IStoreGroup;
  } = {};

  saveIntervalId: NodeJS.Timeout;

  /** 当前平台 */
  currentPlatform = '';

  /** 群表数据目录 */
  groupDataPath = join(pluginInfo.DATA_PATH, 'group_data');

  constructor() {
    this.saveIntervalId = setInterval(() => {
      this.saveMap();
    }, 600 * 1000);
  }

  get map() {
    if (!this._map) this._map = {};
    return this._map;
  }

  async ensurePlatformDir(platform?: string) {
    if (platform) this.currentPlatform = platform;
    /** 检查群表数据目录 */
    if (!existsSync(this.groupDataPath)) {
      await fsp.mkdir(this.groupDataPath);
    }
    const platformDir = join(this.groupDataPath, this.currentPlatform);
    if (!existsSync(platformDir)) {
      await fsp.mkdir(platformDir);
    }
    return platformDir;
  }

  getGroupDataPath(group_id: string) {
    return join(this.groupDataPath, this.currentPlatform, group_id + '.json');
  }

  async getGroup(group_id: string, platform?: string): Promise<IStoreGroup | null> {
    if (this._map[group_id]) return this._map[group_id];

    const groupDataFile = join(await this.ensurePlatformDir(platform), group_id + '.json');
    if (existsSync(groupDataFile)) {
      this._map[group_id] = JSON.parse(await fsp.readFile(groupDataFile, 'utf8'));
      return this._map[group_id];
    } else {
      return null;
    }
  }

  setGroup(group_id: string, value: IStoreGroup) {
    this.map[group_id] = value;
  }

  setGroupMember(group_id: string, user_id: string, member: IStoreGroupMember) {
    this._map[group_id].group_map[user_id] = member;
  }

  async saveMap() {
    await this.ensurePlatformDir();

    return await Promise.allSettled([
      Object.keys(this._map).map(group_id => {
        const dataPath = this.getGroupDataPath(group_id);
        return fsp.writeFile(dataPath, JSON.stringify(this.map[group_id]), 'utf8');
      }),
    ]);
  }
}

const groupStore = new GroupStore();

export { groupStore };

process.on('beforeExit', () => {
  return groupStore.saveMap();
});
