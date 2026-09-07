import { client } from "@alemonjs/qq";
import { client as client$1 } from "@alemonjs/onebot";

//#region src/utils/botApi.ts
var BotApi = class {
	e = {};
	gml = /* @__PURE__ */ new Map();
	init(e) {
		this.e = e;
	}
	setGroupMap(value, group_id = this.e.GuildId) {
		this.gml.set(group_id, value);
	}
	async getGroupMap() {
		if (this.gml.has(this.e.GuildId)) return this.gml.get(this.e.GuildId);
		switch (this.e.Platform) {
			case "qq": this.setGroupMap(await client.pickGroup(Number(this.e.GuildId)).getMemberMap());
			case "onebot":
			case "qq-group-bot": client$1.this.setGroupMap();
		}
	}
};

//#endregion
export { BotApi as default };