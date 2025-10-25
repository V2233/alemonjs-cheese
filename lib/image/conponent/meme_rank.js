import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import fileUrl$1 from '../../asstes/meme/meme.css.js';
import { Template, Container, HeaderBox, DataBox } from '../common.js';
import { pluginInfo } from '../../package.js';

function App({ data, theme }) {
    return (React.createElement(Template, { styleSheet: [fileUrl, fileUrl$1], theme: theme },
        React.createElement(Container, { style: { color: 'white', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' } },
            React.createElement(HeaderBox, { title: '\u61C2\u738B\u6392\u884C', description: `Nobody knows more than me！（仅统计本群内排行）`, style: { background: 'rgba(0, 0, 0, 0)', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }, titleStyle: { fontFamily: 'NZBZ', fontSize: '40px', fontWeight: 500 } }),
            React.createElement(DataBox, { style: { paddingTop: '5px', boxShadow: '1px 1px 3px 1px rgb(245 246 251 / 80%)' } },
                React.createElement("div", { className: 'list flex-col pl-2.5' },
                    React.createElement(Medal, { list: data.list }),
                    data.list.map((l, i) => {
                        const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1;
                        return (React.createElement("div", { className: "lb", key: l.playerId, style: data.currentUserId == i ? { backgroundColor: 'rgba(67, 243, 249, 0.3)' } : {} },
                            curUserId == 1 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png` }),
                            curUserId == 2 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png` }),
                            curUserId == 3 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png` }),
                            curUserId > 3 ? `${curUserId}.${l.nick}` : l.nick,
                            React.createElement("img", { className: 'ml-1', src: l.avatar ? l.avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=${l.playerId}` }),
                            React.createElement("span", { className: "favor" },
                                "\u5206\u6570\uFF1A",
                                l.score)));
                    }))))));
}
function Medal({ list }) {
    return (React.createElement("div", { className: "topdiv" },
        React.createElement("div", null,
            React.createElement("img", { style: { width: '40px', height: '40px' }, src: list.length >= 2 ? list[1].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}` }),
            React.createElement("img", { src: `${pluginInfo.PUBLIC_PATH}/apps/geng/表情帝.png`, className: "wl bqd" }),
            React.createElement("span", { style: { zIndex: 10 } }, "\u5148\u77E5"),
            React.createElement("span", { style: { zIndex: 10 } }, list.length >= 2 ? list[1].nick : '?')),
        React.createElement("div", null,
            React.createElement("img", { src: list.length >= 1 ? list[0].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}` }),
            React.createElement("img", { src: `${pluginInfo.PUBLIC_PATH}/apps/geng/大水王.png`, className: "wl dsw" }),
            React.createElement("span", { style: { zIndex: 10 } }, "\u61C2\u738B"),
            React.createElement("span", { style: { zIndex: 10 } }, list.length >= 1 ? list[0].nick : '?')),
        React.createElement("div", null,
            React.createElement("img", { style: { width: '23px', height: '23px' }, src: list.length >= 3 ? list[2].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}` }),
            React.createElement("img", { src: `${pluginInfo.PUBLIC_PATH}/apps/geng/深海乌贼.png`, className: "wl shwz" }),
            React.createElement("span", { style: { zIndex: 10 } }, "\u5927\u667A\u82E5\u611A"),
            React.createElement("span", { style: { zIndex: 10 } }, list.length >= 3 ? list[2].nick : '?'))));
}

export { App as default };
