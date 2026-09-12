import { pluginInfo } from "../../package.js";
import { existsSync, promises } from "fs";
import { join } from "path";

//#region src/response/store/groupStore.ts
var GroupStore = class {
	_map = {};
	saveIntervalId;
	/** 当前平台 */
	currentPlatform = "";
	/** 群表数据目录 */
	groupDataPath = join(pluginInfo.DATA_PATH, "group_data");
	constructor() {
		this.saveIntervalId = setInterval(() => {
			this.saveMap();
		}, 6e5);
	}
	get map() {
		if (!this._map) this._map = {};
		return this._map;
	}
	async ensurePlatformDir(platform) {
		if (platform) this.currentPlatform = platform;
		/** 检查群表数据目录 */
		if (!existsSync(this.groupDataPath)) await promises.mkdir(this.groupDataPath);
		const platformDir = join(this.groupDataPath, this.currentPlatform);
		if (!existsSync(platformDir)) await promises.mkdir(platformDir);
		return platformDir;
	}
	getGroupDataPath(group_id) {
		return join(this.groupDataPath, this.currentPlatform, group_id + ".json");
	}
	async getGroup(group_id, platform) {
		if (this._map[group_id]) return this._map[group_id];
		const groupDataFile = join(await this.ensurePlatformDir(platform), group_id + ".json");
		if (existsSync(groupDataFile)) {
			this._map[group_id] = JSON.parse(await promises.readFile(groupDataFile, "utf8"));
			return this._map[group_id];
		} else return null;
	}
	setGroup(group_id, value) {
		this.map[group_id] = value;
	}
	setGroupMember(group_id, user_id, member) {
		this._map[group_id].group_map[user_id] = member;
	}
	async saveMap() {
		await this.ensurePlatformDir();
		return await Promise.allSettled([Object.keys(this._map).map((group_id) => {
			const dataPath = this.getGroupDataPath(group_id);
			return promises.writeFile(dataPath, JSON.stringify(this.map[group_id]), "utf8");
		})]);
	}
};
const groupStore = new GroupStore();
process.on("beforeExit", () => {
	return groupStore.saveMap();
});

//#endregion
export { groupStore };