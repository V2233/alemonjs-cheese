import React from 'react'
import css_output from '@src/asstes/main.css'
// import css_marry from '@src/asstes/marry/marry.css'
import { Template, Container, HeaderBox, DataBox } from '../common'
import type { ICouple, ICoupleNick } from '@src/types/marry'
import { pluginInfo } from '@src/package'

interface IData {
    ren: ICouple[],
    renmin: ICoupleNick[],
    loverSum: number,
    currentUserId: number,
    currentPage: number,
    sliceNum: number
}

interface Props {
    data: IData
    theme?: string
}

export default function App({ data, theme }: Props) {

    return (
        <Template styleSheet={[css_output]} theme={theme}>
            <Container style={{ color: 'white', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }}>
                <HeaderBox title='恩爱排行榜'
                    description={`Gay, you're so appealing！ 当前共${data.loverSum}对情侣脱单~`}
                    style={{ background: 'rgba(0, 0, 0, 0)', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }}
                    titleStyle={{ fontFamily: 'NZBZ', fontSize: '40px', fontWeight: 500 }}
                />

                <DataBox style={{ paddingTop: '5px', boxShadow: '1px 1px 3px 1px rgb(245 246 251 / 80%)' }}>
                    <div className='list flex-col pl-2.5'>
                        {data.ren.map((l, i: number) => {
                            const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1
                            return (
                                <div className="lb" key={l.man} style={data.currentUserId == i ? { backgroundColor: 'rgba(67, 243, 249, 0.3)' } : {}}>
                                    {curUserId == 1 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png`} />}
                                    {curUserId == 2 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png`} />}
                                    {curUserId == 3 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png`} />}

                                    {curUserId > 3 ? `${curUserId}.` : ''}
                                    {l.man || '？'}
                                    <span className='text-lg'>♡(</span>
                                    <img src={`http://q2.qlogo.cn/headimg_dl?dst_uin=${l.man}&spec=5`} />
                                    <span className='text-lg'>)人(</span>
                                    <img src={`http://q2.qlogo.cn/headimg_dl?dst_uin=${l.woman}&spec=5`} />
                                    <span className='text-lg'>)♡</span>
                                    {l.woman || '？'}
                                </div>
                            )
                        })}
                    </div>
                </DataBox>
            </Container>
        </Template>
    )
}