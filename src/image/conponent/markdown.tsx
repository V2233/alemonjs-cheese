import React from 'react'

import Cfg from '@src/utils/config';

import css_github from '@src/asstes/markdown/github-markdown.css'
import css_github_var from '@src/asstes/markdown/github-var.css'
import css_output from '@src/asstes/main.css'
import css_highlight from '@src/asstes/markdown/highlight.css'

import { Template, HeaderBox, Container, TabLable, Item } from '../common'
import { getTime } from '@src/utils/index';
import { hexToRgb } from '@src/utils';
import { LinkStyleSheet } from 'jsxp'


interface IData {
    title?: string,
    description?: string
    html: string,
    avatar?: string,
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

    const themeCfg = Cfg.getConfig('theme')

    const maskColor = hexToRgb(themeCfg.mask_color, themeCfg.mask_opacity < 0.5 ? 0.3 : themeCfg.mask_opacity - 0.2)

    const outerCss = `
        <style>       
        .markdown-body[data-theme="custom"] {
            --bgColor-muted: ${maskColor};
            --bgColor-attention-muted: ${maskColor};
            --bgColor-neutral-muted: ${maskColor};
        }
        </style>
    `

    return (
        <Template theme={theme}
            styleSheet={[css_output, css_highlight]}
            globalStyle={(
                <>
                    <LinkStyleSheet src={css_github_var} />
                    <div dangerouslySetInnerHTML={{ __html: outerCss }} />
                    <LinkStyleSheet src={css_github} />
                </>
            )}
        >
            <Container>
                <HeaderBox title={data.title || 'Markdown'} description={data.description} />
                <div className="data_box">
                    <TabLable text={currentTime} />
                    <div className="list">
                        <Item classname="itemOne" style={{ width: 'calc(100% - 10px)' }}>
                            <div className='markdown-body w-full'
                                data-theme={themeCfg.model}
                            >
                                <div dangerouslySetInnerHTML={{ __html: data.html }} />
                            </div>
                        </Item>
                    </div>
                </div>
            </Container>
        </Template>
    )
}


