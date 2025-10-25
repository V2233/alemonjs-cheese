import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import Cfg from '../../utils/config.js';
import { getTime } from '../../utils/index.js';
import { Template, Container, HeaderBox, DataBox, TabLable, Item } from '../common.js';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const currentTime = getTime();
    const cfg = Cfg.getConfig('theme');
    return (React.createElement(Template, { styleSheet: [fileUrl] },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: '\u770B\u56FE\u8BC6\u6897', description: '\u52A0\u5165\u7FA4\u6218\u5C55\u793A\u4F60\u7684\u61C2\u738B\u5B9E\u529B\u5427~', avatar: data.avatar }),
            React.createElement(DataBox, null,
                React.createElement(TabLable, { text: currentTime }),
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "itemOne" },
                        React.createElement("img", { className: 'w-auto rounded-s', src: data.url })),
                    React.createElement(Item, { classname: "itemOne" },
                        React.createElement("div", { className: 'text-3xl font-bold text-wrap mb-2' }, data.tip),
                        data.choices && data.choices.map((choice, index) => (React.createElement("div", { className: 'text-2xl font-semibold text-wrap', key: choice.id },
                            React.createElement("span", { style: { color: '#' + cfg.mask_color } },
                                "\u3010",
                                index,
                                "\u3011"),
                            choice.title)))))))));
}

export { App as default };
