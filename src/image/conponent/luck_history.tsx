import React from 'react'
import css_output from '@src/asstes/main.css'
import css_luck from '@src/asstes/luck/luck.css'

import { Template, Container, HeaderBox, Item, DataBox } from '../common'
import { pluginInfo } from '@src/package'
import { getTime } from '@src/utils/index';
import type { IUserData,IFortuneItem } from '@src/types/luck'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

interface IFortuneData {
    fortuneSummary: string;
    luckyStar: string;
    signText?: string;
    unSignText?: string;
    starcolor: string;
    starCount: number;
    avator: string;
    bgUrl: string;
}

interface IData extends IFortuneData {
    playerData: IUserData['list'],
    fortuneList: IFortuneItem[]
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
    const publicPath = `${pluginInfo.PUBLIC_PATH}/apps/luck`
    const { playerData,fortuneList } = data
    const xArr = playerData.map(item => getTime(new Date(item.ts), 'MM/DD'))
    const yArr = playerData.map(item => fortuneList[item.id].stars)
    const luckSum = playerData.map(item => fortuneList[item.id].summary)

    const colorMap = {
        'green': '00FF00',
        'orange': 'FFA500',
        'red': 'FF0000'
    }

    // 指定图表的配置项和数据
    const option = {
        tooltip: {},
        grid: {
            top: 80,
            bottom: 30,
            borderColor: 'rgb(175, 175, 175)'
        },
        xAxis: {
            type: 'category',
            data: xArr
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                type: 'line',
                data: yArr,
                label: {
                    show: true, // 显示标签  
                    rotate: 90,
                    color: 'black',
                    backgroundColor: 'transparent',
                    fontFamily: 'Microsoft YaHei',
                    fontWeight: 600,
                    position: 'top', // 标签的位置，可以是 'top'、'bottom'、'left'、'right'、'inside'、'insideTop'、'insideBottom'、'insideLeft'、'insideRight'  
                    formatter: function (params) {
                        return luckSum[params.dataIndex]; // 根据数据索引返回对应的标签  
                    }
                },
                markLine: {
                    data: [
                        { 
                            type: 'average', 
                            name: 'Avg', 
                            lineStyle:{
                                color: '#' + colorMap[data.starcolor]
                            } 
                        },
                    ]
                }
            }
        ]
    };

    const echarts = require('echarts')

    // 在 SSR 模式下第一个参数不需要再传入 DOM 对象
    let chart = echarts.init(null, null, {
        renderer: 'svg', // 必须使用 SVG 模式
        ssr: true, // 开启 SSR
        width: 460, // 需要指明高和宽
        height: 300
    });

    chart.setOption(option);

    const chartHtml = chart.renderToSVGString()

    return (
        <Template styleSheet={[css_output, css_luck]} theme={theme}>
            <Container>
                <HeaderBox title='今日运势' description='Good Luck！'>
                    <img className="sv_logo" src={`${publicPath}/${data.starcolor}.png`} />
                </HeaderBox>

                <DataBox>
                    <div className="list">
                        {/* <Item classname="itemOne" color={colorMap[data.starcolor]}> */}
                        <Item classname="itemOne">
                            <div className="title">
                                <div className='fortuneSummaryBox'><FortuneFrame starcolor={data.starcolor} /></div>
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

                            <fieldset style={{ border: `2px dashed ${data.starcolor}` }}>
                                <legend className='ml-2.5 align-top'>
                                    <div className="title text-center flex" style={{ margin: '5px 0 0 5px' }}>
                                        <img className="luckyBag" src={`${publicPath}/御神像.png`} />
                                        <span className='ml-1 text-lg mb-1 align-top'>
                                            <em>近七日运势纪录</em>
                                        </span>
                                    </div>
                                </legend>
                                <div className="chart relative" style={{ margin: '10px 0 5px 5px' }}>
                                    <div id="chart-main" className='relative' style={{ width: '450px', height: '300px', zIndex: '20', }}>
                                        <div dangerouslySetInnerHTML={{ __html: chartHtml }} />;
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

function FortuneFrame({ starcolor }: { starcolor: string }) {
    return (
        <svg viewBox="0 0 3756 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2904" width="200" height="180">
            <path d="M3620.625931 0H154.134128C144.977645 172.447094 86.986587 322.766021 0 419.672131v173.973175c94.61699 96.14307 161.00149 251.040238 176.262295 430.354694h3422.99851c13.734724-167.105812 72.488823-313.609538 157.186289-410.515648V397.543964C3679.38003 300.637854 3629.019374 159.47541 3620.625931 0z" fill={starcolor} p-id="2905"></path><path d="M3507.695976 96.14307c12.208644 127.42772 57.228018 242.646796 126.66468 327.344262v165.579732c-77.830104 86.223547-129.716841 205.257824-146.503726 339.552906H289.955291c-18.312966-144.214605-77.067064-272.405365-164.053652-358.628912V443.326379c79.356185-85.460507 130.479881-209.836066 144.214605-347.946349h3237.579732m28.232489-29.758569H242.646796c-9.156483 150.318927-64.09538 281.561848-146.503726 366.259314v151.845007c90.038748 83.934426 153.371088 218.992548 167.105812 375.415798h3252.840537c12.971684-145.740686 68.673621-273.931446 149.555887-357.865872V412.041729c-73.251863-83.934426-121.323398-207.546945-129.716841-346.420268z" fill={'white'} p-id="2906">
            </path>
        </svg>
    )
}
