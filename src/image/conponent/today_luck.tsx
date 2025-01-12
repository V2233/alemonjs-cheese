import React from 'react'
import css_output from '@src/asstes/main.css'
import css_luck from '@src/asstes/luck/luck.css'
import { Template, Container, HeaderBox, DataBox, Item } from '../common'
import { pluginInfo } from '@src/package'
import { join } from 'path'


interface IFortuneData {
    fortuneSummary: string;
    luckyStar: string;
    signText: string;
    unSignText: string;
    starcolor: string;
    starCount: number;
    avator: string;
    bgUrl: string;
}

interface ILuckData {
    fortuneSummary: string;
    signText: string;
    unSignText: string;
    luckyCharm: string;
}
interface IData extends IFortuneData {
    luckData: ILuckData,
    tip: string
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
    const publicPath = join(pluginInfo.PUBLIC_PATH,'apps','luck')

    const colorMap = {
        'green': '00FF00',
        'orange': 'FFA500',
        'red': 'FF0000'
    }

    return (
        <Template styleSheet={[css_output, css_luck]} theme={theme}>
            <Container>
                <HeaderBox title='今日运势' description='Good Luck！'>
                    <img className="sv_logo" src={join(publicPath,`${data.starcolor}.png`)} />
                </HeaderBox>

                <DataBox>
                    <div className="list">
                        {/* <Item classname="itemOne" color={colorMap[data.starcolor]}> */}
                        <Item classname="itemOne">
                            <div className="title">
                                <div className='fortuneSummaryBox'><FortuneFrame starcolor={data.starcolor}/></div>
                                <div className="text fortuneSummary">{data.fortuneSummary}</div>
                            </div>

                            <div>
                                <div className='avatar_box'>
                                    <img className="user_avator" src={data.avator} />
                                </div>

                                <div className="title text-3xl" style={{ margin: '20px 0 20px 65px' }}>
                                    <span className="star text-3xl" style={{ color: data.starcolor }}>{data.luckyStar}</span>
                                </div>
                            </div>

                            <fieldset className='mb-2.5' style={{ border: `2px dashed ${data.starcolor}` }}>
                                <legend className='ml-2.5 align-top'>
                                    <div className="title text-center flex" style={{ margin: '5px 0 0 5px' }}>
                                        <img className="luckyBag" src={join(publicPath,'御神像.png')} />
                                        <span className='ml-1 text-lg mb-1 align-top'>
                                            <em>鸣神签——此身命运既定，不可更改</em>
                                        </span>
                                    </div>
                                </legend>
                                <div className="title mt-3" style={{ margin: '10px 0 5px 5px' }}>
                                    <div style={{ textIndent: '2em' }}>{data.signText}</div>
                                    <div style={{ textIndent: '2em' }}>{data.unSignText}</div>
                                    <div className='mr-3' style={{
                                        textIndent: '2em',
                                        textDecoration: 'underline',
                                        textDecorationColor: data.starcolor
                                    }}>{data.tip}</div>
                                </div>
                            </fieldset>

                            <fieldset style={{ border: `2px dashed ${data.starcolor}` }}>
                                <legend className='ml-2.5 align-top'>
                                    <div className="title text-center flex" style={{ margin: '5px 0 0 5px' }}>
                                        <img className="luckyBag" src={join(publicPath,`御守.png`)} />
                                        <span className='ml-1 text-lg mb-1 align-top'>
                                            <em>御神签——或许出现小转机，但命运导向也许？</em>
                                        </span>
                                    </div>
                                </legend>
                                <div className="luckyBox">
                                    <div className="title mb-3 mr-3" style={{ textIndent: '2em' }}>{data.luckData.signText}</div>
                                    <div className="luckySignBox" style={{ backgroundImage: `url(${join(publicPath,'luckySignName', data.luckData.luckyCharm + '.png')})` }}>
                                        {/* <span className="title mr-3" style={{ */}
                                        <span className="title mr-3" style={{
                                            textIndent: '2em',
                                            textDecoration: 'underline',
                                            textDecorationColor: data.starcolor
                                        }}>{data.luckData.unSignText}</span>
                                        <img className="ying" src={`${publicPath}/荧.png`} />
                                        <div className="qian" style={{ color: data.starcolor }}>{data.luckData.fortuneSummary}</div>
                                    </div>
                                </div>
                            </fieldset>
                        </Item>
                    </div>
                </DataBox>
            </Container>
        </Template>
    )
}

function FortuneFrame({starcolor}: {starcolor:string}) {
    return (
        <svg viewBox="0 0 3756 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2904" width="200" height="180">
            <path d="M3620.625931 0H154.134128C144.977645 172.447094 86.986587 322.766021 0 419.672131v173.973175c94.61699 96.14307 161.00149 251.040238 176.262295 430.354694h3422.99851c13.734724-167.105812 72.488823-313.609538 157.186289-410.515648V397.543964C3679.38003 300.637854 3629.019374 159.47541 3620.625931 0z" fill={starcolor} p-id="2905"></path><path d="M3507.695976 96.14307c12.208644 127.42772 57.228018 242.646796 126.66468 327.344262v165.579732c-77.830104 86.223547-129.716841 205.257824-146.503726 339.552906H289.955291c-18.312966-144.214605-77.067064-272.405365-164.053652-358.628912V443.326379c79.356185-85.460507 130.479881-209.836066 144.214605-347.946349h3237.579732m28.232489-29.758569H242.646796c-9.156483 150.318927-64.09538 281.561848-146.503726 366.259314v151.845007c90.038748 83.934426 153.371088 218.992548 167.105812 375.415798h3252.840537c12.971684-145.740686 68.673621-273.931446 149.555887-357.865872V412.041729c-73.251863-83.934426-121.323398-207.546945-129.716841-346.420268z" fill={'white'} p-id="2906">
            </path>
        </svg>
    )
}

