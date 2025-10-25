import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import fileUrl$1 from '../../asstes/emotion/emotion.css.js';
import { Template, Container, HeaderBox, DataBox, TabLable, Item, PageLable } from '../common.js';
import Cfg from '../../utils/config.js';

/**
 * 宽高
 * @param param0
 * @returns
 */
function MakeEmo({ data, theme }) {
    return (React.createElement(Template, { styleSheet: [fileUrl, fileUrl$1], theme: theme },
        React.createElement("div", { style: { height: '530px', width: '100%' } },
            React.createElement("div", { className: "mask1", style: { backgroundImage: `url(${encodeURI(data.originUrl)})`, maskImage: `url(${data.maskUrl})`, WebkitMaskImage: `url(${data.maskUrl})` } }),
            React.createElement("img", { className: "mask2", src: data.maskUrl, style: { mixBlendMode: data.mixBlendMode } }))));
}
function EmoList({ data, theme }) {
    const themeCfg = Cfg.getConfig('theme');
    return (React.createElement(Template, { styleSheet: [fileUrl], theme: theme },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: '\u4E07\u80FD\u5934\u50CF\u8868\u60C5', description: '@\u7FA4\u53CB\u53EF\u5408\u6210\u7FA4\u53CB\u5934\u50CF' }),
            React.createElement(DataBox, null,
                React.createElement(TabLable, { text: '\u8BF7\u53D1\u9001\u3010\u5408\u6210\u56FE\u7247[id]\u3011\u5408\u6210' }),
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "item", style: { alignItems: 'start', flexWrap: 'wrap', justifyContent: 'space-around' } }, data.list.map(pic => (React.createElement("div", { className: 'm-1 h-auto rounded border-2 w-20', key: pic.id, style: { borderColor: '#' + themeCfg.mask_color, backgroundSize: 'auto 100%', flexShrink: 0 } },
                        React.createElement("div", { className: 'w-full h-4 flex justify-center items-center text-xs', style: { background: '#' + themeCfg.mask_color } }, `ID:${pic.id}`),
                        React.createElement("img", { className: 'w-full h-auto', src: pic.url })))))),
                React.createElement(PageLable, { text: `当前第 ${data.pageNo} 页` })))));
}

export { EmoList, MakeEmo };
