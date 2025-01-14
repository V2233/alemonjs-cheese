import { Image, Text, useSend } from 'alemonjs'
import { Pictures } from '@src/image/index'
import Cfg from '@src/utils/config'
import {sleep} from '@src/utils/index'


export default OnResponse(async (event, next) => {
    if (!/奶酪设置/.test(event.MessageText)) {
        next()
        return
    }

    // 创建一个send
    const Send = useSend(event)

    let txt = event.MessageText.replace(/.*奶酪设置/,'')
    if(!txt) {
        const img = await Pictures('setting', {
            data: Cfg.description,
        })
        if (typeof img != 'boolean') {
            Send(Image(img))
        } else {
            Send(Text('图片加载失败'))
        }
        next()
        return
    }

    if(!event.IsMaster) {
        Send(Text('请找主人进行设置~'))
        next()
        return
    }
    

    const cfgs = Cfg.description

    const regArr:string[] = []
    const cfgParents:string[] = []
    const cfgKeys:string[] = []
    const cfgTypes:string[] = []

    cfgs.forEach(cfg=>{
        cfg.value.forEach(prop=>{
            regArr.push(prop.title)
            cfgParents.push(cfg.key)
            cfgKeys.push(prop.prop)
            cfgTypes.push(typeof prop.value)
        })
    })


    const reg = new RegExp(`奶酪设置(${regArr.join('|')})(.*)`)
    let match = event.MessageText.match(reg)
    if(match) {
        let i = regArr.findIndex(item => item === match[1]) 
        if(match[2] != '') {
            switch(cfgTypes[i]) {
                case 'string':
                    Cfg.setConfig(match[2],[cfgKeys[i]],cfgParents[i])
                    break
                case 'number':
                    Cfg.setConfig(Number(match[2]),[cfgKeys[i]],(cfgParents[i]))
                    break
                case 'boolean':
                    Cfg.setConfig(Boolean(match[2]),[cfgKeys[i]],(cfgParents[i]))
                    break
                default:
                    
            }
        }   
    } else {
        Send(Text(`未找到关键字，请重新设置!`))
    }

    await sleep(500)

    // pic
    const img = await Pictures('setting', {
        data: Cfg.description,
    })


    // send
    if (typeof img != 'boolean') {
        Send(Image(img))
    } else {
        Send(Text('图片加载失败'))
    }
}, 'message.create')
