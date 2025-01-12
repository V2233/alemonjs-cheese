import React from 'react'
import css_output from '@src/asstes/main.css'
import css_emotion from '@src/asstes/emotion/emotion.css'
import { Template, HeaderBox, Container, DataBox, TabLable, PageLable, Item } from '../common'
import type { IEmoDetail } from '@src/types/emotion'

import Cfg from '@src/utils/config'


type ListProps = {
    data: {
        list: IEmoDetail[],
        pageNo: number
    }
    theme?: string
}

type EmoProps = {
    data: {
        originUrl: string,
        maskUrl: string,
        mixBlendMode: any
    }
    theme?: string
}


/**
 * 宽高
 * @param param0
 * @returns
 */
export function MakeEmo({ data, theme }: EmoProps) {

    return (
        <Template styleSheet={[css_output, css_emotion]} theme={theme}>
            <div style={{ height: '530px', width:'100%' }}>
                <div className="mask1" style={{ backgroundImage: `url(${encodeURI(data.originUrl)})`, maskImage: `url(${data.maskUrl})`,WebkitMaskImage: `url(${data.maskUrl})`}}></div>
                <img className="mask2" src={data.maskUrl} style={{ mixBlendMode: data.mixBlendMode }} />
            </div>
            
        </Template>
    )
}


export function EmoList({ data, theme }: ListProps) {
    const themeCfg = Cfg.getConfig('theme')
    return (
        <Template styleSheet={[css_output]} theme={theme}>
            <Container>
                <HeaderBox title='万能头像表情' description='@群友可合成群友头像' />
                <DataBox>
                    <TabLable text='请发送【合成图片[id]】合成' />
                    <div className="list">
                        <Item classname="item" style={{ alignItems: 'start', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                            {data.list.map(pic => (
                                <div className='m-1 h-auto rounded border-2 w-20' key={pic.id} style={{ borderColor: '#' + themeCfg.mask_color, backgroundSize: 'auto 100%', flexShrink: 0 }}>
                                    <div className='w-full h-4 flex justify-center items-center text-xs' style={{ background: '#' + themeCfg.mask_color }}>{`ID:${pic.id}`}</div>
                                    <img className='w-full h-auto' src={pic.url} />
                                </div>
                            ))}
                        </Item>
                    </div>
                    <PageLable text={`当前第 ${data.pageNo} 页`} />
                </DataBox>
            </Container>
        </Template>
    )
}