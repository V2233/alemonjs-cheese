import { client as client$1 } from '@alemonjs/qq';
import { client } from '@alemonjs/onebot';

class BotApi {
    e = {};
    gml = new Map();
    init(e) {
        this.e = e;
    }
    setGroupMap(value, group_id = this.e.GuildId) {
        this.gml.set(group_id, value);
    }
    async getGroupMap() {
        if (this.gml.has(this.e.GuildId)) {
            return this.gml.get(this.e.GuildId);
        }
        switch (this.e.Platform) {
            case 'qq':
                this.setGroupMap(await client$1.pickGroup(Number(this.e.GuildId)).getMemberMap());
            case 'onebot':
            case 'qq-group-bot':
                client.
                    this.setGroupMap();
        }
    }
}

export { BotApi as default };
