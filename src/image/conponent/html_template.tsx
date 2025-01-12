import React from 'react'
import css_output from '@src/asstes/main.css'

import { Template, HeaderBox, Container, TabLable, Item } from '../common'
import { getTime } from '@src/utils/index';



interface IData {
    title?: string,
    description?: string
    html: string,
    avatar?: string,
    style?: React.CSSProperties
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

    return (
        <Template theme={theme}
            styleSheet={[css_output]}
        >
            <Container>
                <HeaderBox title={data.title || 'HTML'} description={data.description} />
                <div className="data_box">
                    <TabLable text={currentTime} />
                    <div className="list">
                        <Item classname="itemOne" style={{ width: 'calc(100% - 10px)', ...data.style }}>
                            <div dangerouslySetInnerHTML={{ __html: data.html }} />
                        </Item>
                    </div>
                </div>
            </Container>
        </Template>
    )
}