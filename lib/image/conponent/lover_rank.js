import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import { Template, Container, HeaderBox, DataBox } from '../common.js';
import { pluginInfo } from '../../package.js';

function App({ data, theme }) {
    return (React.createElement(Template, { styleSheet: [fileUrl], theme: theme },
        React.createElement(Container, { style: { color: 'white', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' } },
            React.createElement(HeaderBox, { title: '\u6069\u7231\u6392\u884C\u699C', description: `Gay, you're so appealing！ 当前共${data.loverSum}对情侣脱单~`, style: { background: 'rgba(0, 0, 0, 0)', boxShadow: '0 5px 10px 0 rgb(255 255 255 / 20%)' }, titleStyle: { fontFamily: 'NZBZ', fontSize: '40px', fontWeight: 500 } }),
            React.createElement(DataBox, { style: { paddingTop: '5px', boxShadow: '1px 1px 3px 1px rgb(245 246 251 / 80%)' } },
                React.createElement("div", { className: 'list flex-col pl-2.5' }, data.ren.map((l, i) => {
                    const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1;
                    return (React.createElement("div", { className: "lb", key: l.man, style: data.currentUserId == i ? { backgroundColor: 'rgba(67, 243, 249, 0.3)' } : {} },
                        curUserId == 1 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png` }),
                        curUserId == 2 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png` }),
                        curUserId == 3 && React.createElement("img", { className: "medal", src: `${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png` }),
                        curUserId > 3 ? `${curUserId}.` : '',
                        l.man || '？',
                        React.createElement("span", { className: 'text-lg' }, "\u2661("),
                        React.createElement("img", { src: `http://q2.qlogo.cn/headimg_dl?dst_uin=${l.man}&spec=5` }),
                        React.createElement("span", { className: 'text-lg' }, ")\u4EBA("),
                        React.createElement("img", { src: `http://q2.qlogo.cn/headimg_dl?dst_uin=${l.woman}&spec=5` }),
                        React.createElement("span", { className: 'text-lg' }, ")\u2661"),
                        l.woman || '？'));
                }))))));
}

export { App as default };
