import type { PublicEventMessageCreate } from 'alemonjs'
import { client as QQClient } from '@alemonjs/qq'
// import { client as QQBotClient } from '@alemonjs/qq-bot'
import { client as QQGroupBotClient } from '@alemonjs/qq-group-bot'
import { client as OneBotClient } from '@alemonjs/onebot'
import {promises} from 'fs'
export default class BotApi {

    e:Partial<PublicEventMessageCreate> = {} 
    gml = new Map()

    init(e:PublicEventMessageCreate) {
        this.e = e
    }

    setGroupMap(value:any,group_id = this.e.GuildId) {
        this.gml.set(group_id,value)
    }

    async getGroupMap() {
        if(this.gml.has(this.e.GuildId)) {
            return this.gml.get(this.e.GuildId)
        }

        switch(this.e.Platform) {
            case 'qq':
                this.setGroupMap(await QQClient.pickGroup(Number(this.e.GuildId)).getMemberMap())
            case 'onebot':
            case 'qq-group-bot':
                OneBotClient.
                this.setGroupMap()
        }

    }
}