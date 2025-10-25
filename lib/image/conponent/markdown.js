import React from 'react';
import Cfg from '../../utils/config.js';
import fileUrl$3 from '../../asstes/markdown/github-markdown.css.js';
import fileUrl$2 from '../../asstes/markdown/github-var.css.js';
import fileUrl from '../../asstes/main.css.js';
import fileUrl$1 from '../../asstes/markdown/highlight.css.js';
import { Template, Container, HeaderBox, TabLable, Item } from '../common.js';
import { getTime, hexToRgb } from '../../utils/index.js';
import { LinkStyleSheet } from 'jsxp';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const currentTime = getTime();
    const themeCfg = Cfg.getConfig('theme');
    const maskColor = hexToRgb(themeCfg.mask_color, themeCfg.mask_opacity < 0.5 ? 0.3 : themeCfg.mask_opacity - 0.2);
    const outerCss = `
        <style>       
        .markdown-body[data-theme="custom"] {
            --bgColor-muted: ${maskColor};
            --bgColor-attention-muted: ${maskColor};
            --bgColor-neutral-muted: ${maskColor};
        }
        </style>
    `;
    return (React.createElement(Template, { theme: theme, styleSheet: [fileUrl, fileUrl$1], globalStyle: (React.createElement(React.Fragment, null,
            React.createElement(LinkStyleSheet, { src: fileUrl$2 }),
            React.createElement("div", { dangerouslySetInnerHTML: { __html: outerCss } }),
            React.createElement(LinkStyleSheet, { src: fileUrl$3 }))) },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: data.title || 'Markdown', description: data.description }),
            React.createElement("div", { className: "data_box" },
                React.createElement(TabLable, { text: currentTime }),
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "itemOne", style: { width: 'calc(100% - 10px)' } },
                        React.createElement("div", { className: 'markdown-body w-full', "data-theme": themeCfg.model },
                            React.createElement("div", { dangerouslySetInnerHTML: { __html: data.html } }))))))));
}

export { App as default };
