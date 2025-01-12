import React from 'react'
import css_output from '@src/asstes/main.css'
import Cfg from '@src/utils/config'
import { getTime } from '@src/utils/index'
import { Template, HeaderBox, Container, DataBox, TabLable, Item } from '../common'
import type { IGengItem } from '@src/types/meme'


interface IData {
    url: string,
    tip: string,
    choices?: IGengItem[],
    avatar?: string
}

type Props = {
    data: IData
    theme?: string
}


/**
 * @param param0
 * @returns
 */
export default function App({ data, theme }: Props) {
    const currentTime = getTime()
    const cfg = Cfg.getConfig('theme')
    return (
        <Template styleSheet={[css_output]}>
            <Container>
                <HeaderBox title='看图识梗' description='加入群战展示你的懂王实力吧~' avatar={data.avatar}/>
                <DataBox>
                    <TabLable text={currentTime} />
                    <div className="list">
                        <Item classname="itemOne">
                            <img className='w-auto rounded-s' src={data.url}/>
                        </Item>
                        <Item classname="itemOne">
                            <div className='text-3xl font-bold text-wrap mb-2'>{data.tip}</div>
                            {data.choices && data.choices.map((choice,index:number)=>(<div className='text-2xl font-semibold text-wrap' key={choice.id}><span style={{color: '#' + cfg.mask_color}}>【{index}】</span>{choice.title}</div>))}
                        </Item>
                    </div>
                </DataBox>
            </Container>
        </Template>
    )
}