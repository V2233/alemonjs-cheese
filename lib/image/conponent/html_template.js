import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import { Template, Container, HeaderBox, TabLable, Item } from '../common.js';
import { getTime } from '../../utils/index.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const currentTime = getTime();
    return (React.createElement(Template, { theme: theme, styleSheet: [fileUrl] },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: data.title || 'HTML', description: data.description }),
            React.createElement("div", { className: "data_box" },
                React.createElement(TabLable, { text: currentTime }),
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "itemOne", style: { width: 'calc(100% - 10px)', ...data.style } },
                        React.createElement("div", { dangerouslySetInnerHTML: { __html: data.html } })))))));
}

export { App as default };
