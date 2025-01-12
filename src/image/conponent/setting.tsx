import React from 'react'
import css_output from '@src/asstes/main.css'
import css_setting from '@src/asstes/setting/setting.css'
import Cfg from '@src/utils/config'
import { Template, HeaderBox, Container, DataBox, TabLable, Item } from '../common'

type Props = {
    data: typeof Cfg.description
    theme?: string
}


/**
 * @param param0
 * @returns
 */
export default function App({ data, theme }: Props) {
    const themeCfg = Cfg.getConfig('theme')
    return (
        <Template styleSheet={[css_output,css_setting]} theme={theme}>
            <Container>
                <HeaderBox title='奶酪设置[key][value]' description='示例：奶酪设置背景图片https://xxx.com/1.png'/>
                {data.map((cfg) => (
                    <DataBox key={cfg.key}>
                        <TabLable text={cfg.title} />
                        <div className="list">
                            {cfg.value.map(prop=>(
                                <Item classname="item" key={prop.prop} style={{ padding: '4px 3px 4px 3px' }}>
                                    <div className='ml-1 font-semibold' style={{color: '#' + themeCfg.mask_color}}>{prop.title}</div>
                                    <div className='ml-1 text-xs' style={{color: themeCfg.model == 'dark'?'white':'#515151'}}>{prop.desc}</div>
                                    {typeof prop.value === 'boolean'?(<Switch open={prop.value} color={'#' + themeCfg.mask_color}/>):(<div className='numframe'>{prop.value}</div>)}
                                </Item>
                            ))}
                        </div>
                    </DataBox>
                ))}
            </Container>
        </Template>
    )
}

function Switch({color,open}:{color:string,open:boolean}) {
    if(open) {
        return (
            <svg className='switch' viewBox="0 0 1693 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2348" width="330.6640625" height="200"><path d="M1693.03 512.067A511.221 511.221 0 0 0 1182.521 0.134H511.933a511.933 511.933 0 0 0 0 1023.866h670.588a511.221 511.221 0 0 0 510.51-511.933z m-46.608 1.068a463.277 463.277 0 1 1-463.277-464.613 463.945 463.945 0 0 1 463.277 464.48z" fill={color?color:"#00cc00"} p-id="2349"></path></svg>
        )
    } else {
        return (
            <svg className='switch' viewBox="0 0 1694 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3549" width="330.859375" height="200" ><path d="M511.889 1024h670.53a511.889 511.889 0 0 0 0-1023.777h-670.53a511.889 511.889 0 0 0 0 1023.777z m-0.579-975.348A464.572 464.572 0 1 1 48.03 512.957 463.905 463.905 0 0 1 511.31 48.429z" fill="#515151" p-id="3550"></path></svg>
        )
    }
    
}
