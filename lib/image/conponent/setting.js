import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import fileUrl$1 from '../../asstes/setting/setting.css.js';
import Cfg from '../../utils/config.js';
import { Template, Container, HeaderBox, DataBox, TabLable, Item } from '../common.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const themeCfg = Cfg.getConfig('theme');
    return (React.createElement(Template, { styleSheet: [fileUrl, fileUrl$1], theme: theme },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: '\u5976\u916A\u8BBE\u7F6E[key][value]', description: '\u793A\u4F8B\uFF1A\u5976\u916A\u8BBE\u7F6E\u80CC\u666F\u56FE\u7247https://xxx.com/1.png' }),
            data.map((cfg) => (React.createElement(DataBox, { key: cfg.key },
                React.createElement(TabLable, { text: cfg.title }),
                React.createElement("div", { className: "list" }, cfg.value.map(prop => (React.createElement(Item, { classname: "item", key: prop.prop, style: { padding: '4px 3px 4px 3px' } },
                    React.createElement("div", { className: 'ml-1 font-semibold', style: { color: '#' + themeCfg.mask_color } }, prop.title),
                    React.createElement("div", { className: 'ml-1 text-xs', style: { color: themeCfg.model == 'dark' ? 'white' : '#515151' } }, prop.desc),
                    typeof prop.value === 'boolean' ? (React.createElement(Switch, { open: prop.value, color: '#' + themeCfg.mask_color })) : (React.createElement("div", { className: 'numframe' }, prop.value))))))))))));
}
function Switch({ color, open }) {
    if (open) {
        return (React.createElement("svg", { className: 'switch', viewBox: "0 0 1693 1024", version: "1.1", xmlns: "http://www.w3.org/2000/svg", "p-id": "2348", width: "330.6640625", height: "200" },
            React.createElement("path", { d: "M1693.03 512.067A511.221 511.221 0 0 0 1182.521 0.134H511.933a511.933 511.933 0 0 0 0 1023.866h670.588a511.221 511.221 0 0 0 510.51-511.933z m-46.608 1.068a463.277 463.277 0 1 1-463.277-464.613 463.945 463.945 0 0 1 463.277 464.48z", fill: color ? color : "#00cc00", "p-id": "2349" })));
    }
    else {
        return (React.createElement("svg", { className: 'switch', viewBox: "0 0 1694 1024", version: "1.1", xmlns: "http://www.w3.org/2000/svg", "p-id": "3549", width: "330.859375", height: "200" },
            React.createElement("path", { d: "M511.889 1024h670.53a511.889 511.889 0 0 0 0-1023.777h-670.53a511.889 511.889 0 0 0 0 1023.777z m-0.579-975.348A464.572 464.572 0 1 1 48.03 512.957 463.905 463.905 0 0 1 511.31 48.429z", fill: "#515151", "p-id": "3550" })));
    }
}

export { App as default };
