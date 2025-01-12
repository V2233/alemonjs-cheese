import React from 'react'
import css_output from '@src/asstes/main.css'
import { Template, HeaderBox, Container, DataBox, TabLable, Item } from '../common'

import Cfg from '@src/utils/config'

interface IData {
  title: string,
  desc: string,
  list: any[],
  width?: string,
  logo?: string,
  logo_img?: string
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
  const themeCfg = Cfg.getConfig('theme')

  return (
    <Template styleSheet={[css_output]} theme={theme} bodyStyle={{width: data.width}}>
      <Container copyright={data.logo}>
        <HeaderBox title={data.title} description={data.desc} >
          <img className="header_logo" 
            src={data.logo_img}
            style={{
              position: 'absolute',
              bottom: '-20px',
              right: '20px',
              width: '100px',
            }}
          />
        </HeaderBox>
        {data.list.map((cfg) => (
            <DataBox key={cfg.title}>
              <TabLable text={cfg.title} />
              <div className="list">
                {cfg.list.map(prop => (
                  <Item classname="itemOne" key={prop.label} style={{ width: '230px',borderRadius: '6px',margin: '0 10px 10px 10px'}}>
                    <div className='ml-1 font-semibold' style={{ color: '#' + themeCfg.mask_color }}>{prop.label}</div>
                    <div className='ml-1' style={{ color: 'gray' }}>{prop.desc}</div>
                  </Item>
                ))}
              </div>
            </DataBox>
          ))}
      </Container>
    </Template>
  )
}
