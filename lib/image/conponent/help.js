import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import { Template, Container, HeaderBox, DataBox, TabLable, Item } from '../common.js';
import Cfg from '../../utils/config.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const themeCfg = Cfg.getConfig('theme');
    return (React.createElement(Template, { styleSheet: [fileUrl], theme: theme, bodyStyle: { width: data.width } },
        React.createElement(Container, { copyright: data.logo },
            React.createElement(HeaderBox, { title: data.title, description: data.desc },
                React.createElement("img", { className: "header_logo", src: data.logo_img, style: {
                        position: 'absolute',
                        bottom: '-20px',
                        right: '20px',
                        width: '100px',
                    } })),
            data.list.map((cfg) => (React.createElement(DataBox, { key: cfg.title },
                React.createElement(TabLable, { text: cfg.title }),
                React.createElement("div", { className: "list" }, cfg.list.map(prop => (React.createElement(Item, { classname: "itemOne", key: prop.label, style: { width: '230px', borderRadius: '6px', margin: '0 10px 10px 10px' } },
                    React.createElement("div", { className: 'ml-1 font-semibold', style: { color: '#' + themeCfg.mask_color } }, prop.label),
                    React.createElement("div", { className: 'ml-1', style: { color: 'gray' } }, prop.desc)))))))))));
}

export { App as default };
