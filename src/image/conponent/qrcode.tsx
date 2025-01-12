import React from 'react'
import css_output from '@src/asstes/main.css'
import { getTime } from '@src/utils/index'
import { Template, HeaderBox, Container, DataBox, TabLable, Item } from '../common'

interface IData {
    url: string,
    title: string,
    desc?: string,
    avatar?: string
}

type Props = {
    data: IData
    theme?: string
}


/**
 * 二维码生成
 * @param param0
 * @returns
 */
export default function App({ data, theme }: Props) {
    const currentTime = getTime()

    return (
        <Template styleSheet={[css_output]} theme={theme}>
            <Container>
                <HeaderBox title={data.title} description={data.desc} avatar={data.avatar}/>
                <DataBox>
                    <TabLable text={currentTime} />
                    <div className="list">
                        <Item classname="itemOne">
                            <img className='w-auto rounded-s' src={data.url}/>
                        </Item>
                    </div>
                </DataBox>
            </Container>
        </Template>
    )
}