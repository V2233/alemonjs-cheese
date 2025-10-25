import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import { getTime } from '../../utils/index.js';
import { Template, Container, HeaderBox, DataBox, TabLable, Item } from '../common.js';

/**
 * 二维码生成
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const currentTime = getTime();
    return (React.createElement(Template, { styleSheet: [fileUrl], theme: theme },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: data.title, description: data.desc, avatar: data.avatar }),
            React.createElement(DataBox, null,
                React.createElement(TabLable, { text: currentTime }),
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "itemOne" },
                        React.createElement("img", { className: 'w-auto rounded-s', src: data.url })))))));
}

export { App as default };
