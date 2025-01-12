import React from 'react'
import css_output from '@src/asstes/main.css'
import css_meme from '@src/asstes/meme/meme.css'

import { Container, HeaderBox, Template, DataBox } from '../common'
import { pluginInfo } from '@src/package'

interface IPlayerData {
    avatar: string,
    playerId: string,
    score: number,
    nick: string
}

interface IData {
    list: IPlayerData[],
    currentUserId: number,
    currentPage: number,
    sliceNum: number,
    playerSum: number
}

interface Props {
    data: IData
    theme?: string
}

export default function App({ data, theme }: Props) {

    return (
        <Template styleSheet={[css_output, css_meme]} theme={theme}>
            <Container style={{ color: 'white', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }}>
                <HeaderBox title='懂王排行'
                    description={`Nobody knows more than me！（仅统计本群内排行）`}
                    style={{ background: 'rgba(0, 0, 0, 0)', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }}
                    titleStyle={{ fontFamily: 'NZBZ', fontSize: '40px', fontWeight: 500 }}
                />

                <DataBox style={{ paddingTop: '5px', boxShadow: '1px 1px 3px 1px rgb(245 246 251 / 80%)' }}>
                    <div className='list flex-col pl-2.5'>
                        <Medal list={data.list} />
                        {data.list.map((l, i: number) => {
                            const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1
                            return (
                                <div className="lb" key={l.playerId} style={data.currentUserId == i ? { backgroundColor: 'rgba(67, 243, 249, 0.3)' } : {}}>
                                    {curUserId == 1 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png`} />}
                                    {curUserId == 2 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png`} />}
                                    {curUserId == 3 && <img className="medal" src={`${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png`} />}

                                    {curUserId > 3 ? `${curUserId}.${l.nick}` : l.nick}
                                    <img className='ml-1' src={l.avatar?l.avatar:`https://q1.qlogo.cn/g?b=qq&s=0&nk=${l.playerId}`} />
                                    <span className="favor">分数：{l.score}</span>
                                </div>
                            )
                        })}
                    </div>
                </DataBox>
            </Container>
        </Template>
    )
}

function Medal({ list }:{list: IPlayerData[]}) {
    return (
        <div className="topdiv">
            <div>
                <img style={{ width: '40px', height: '40px' }} src={list.length >= 2 ? list[1].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}`} />
                <img src={`${pluginInfo.PUBLIC_PATH}/apps/geng/表情帝.png`} className="wl bqd" />
                <span style={{ zIndex: 10 }}>先知</span>
                <span style={{ zIndex: 10 }}>{list.length >= 2 ? list[1].nick : '?'}</span>
            </div>
            <div>
                <img src={ list.length >= 1 ? list[0].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}`} />
                <img src={`${pluginInfo.PUBLIC_PATH}/apps/geng/大水王.png`} className="wl dsw" />
                <span style={{ zIndex: 10 }}>懂王</span>
                <span style={{ zIndex: 10 }}>{list.length >= 1 ? list[0].nick : '?'}</span>
            </div>
            <div>
                <img style={{ width: '23px', height: '23px' }} src={list.length >= 3 ? list[2].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}`} />
                <img src={`${pluginInfo.PUBLIC_PATH}/apps/geng/深海乌贼.png`} className="wl shwz" />
                <span style={{ zIndex: 10 }}>大智若愚</span>
                <span style={{ zIndex: 10 }}>{list.length >= 3 ? list[2].nick : '?'}</span>
            </div>
        </div>
    )
}