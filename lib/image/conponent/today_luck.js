import React from 'react';
import fileUrl from '../../asstes/main.css.js';
import fileUrl$1 from '../../asstes/luck/luck.css.js';
import { Template, Container, HeaderBox, DataBox, Item } from '../common.js';
import { pluginInfo } from '../../package.js';
import { join } from 'path';

/**
 * @param param0
 * @returns
 */
function App({ data, theme }) {
    const publicPath = join(pluginInfo.PUBLIC_PATH, 'apps', 'luck');
    return (React.createElement(Template, { styleSheet: [fileUrl, fileUrl$1], theme: theme },
        React.createElement(Container, null,
            React.createElement(HeaderBox, { title: '\u4ECA\u65E5\u8FD0\u52BF', description: 'Good Luck\uFF01' },
                React.createElement("img", { className: "sv_logo", src: join(publicPath, `${data.starcolor}.png`) })),
            React.createElement(DataBox, null,
                React.createElement("div", { className: "list" },
                    React.createElement(Item, { classname: "itemOne" },
                        React.createElement("div", { className: "title" },
                            React.createElement("div", { className: 'fortuneSummaryBox' },
                                React.createElement(FortuneFrame, { starcolor: data.starcolor })),
                            React.createElement("div", { className: "text fortuneSummary" }, data.fortuneSummary)),
                        React.createElement("div", null,
                            React.createElement("div", { className: 'avatar_box' },
                                React.createElement("img", { className: "user_avator", src: data.avator })),
                            React.createElement("div", { className: "title text-3xl", style: { margin: '20px 0 20px 65px' } },
                                React.createElement("span", { className: "star text-3xl", style: { color: data.starcolor } }, data.luckyStar))),
                        React.createElement("fieldset", { className: 'mb-2.5', style: { border: `2px dashed ${data.starcolor}` } },
                            React.createElement("legend", { className: 'ml-2.5 align-top' },
                                React.createElement("div", { className: "title text-center flex", style: { margin: '5px 0 0 5px' } },
                                    React.createElement("img", { className: "luckyBag", src: join(publicPath, '御神像.png') }),
                                    React.createElement("span", { className: 'ml-1 text-lg mb-1 align-top' },
                                        React.createElement("em", null, "\u9E23\u795E\u7B7E\u2014\u2014\u6B64\u8EAB\u547D\u8FD0\u65E2\u5B9A\uFF0C\u4E0D\u53EF\u66F4\u6539")))),
                            React.createElement("div", { className: "title mt-3", style: { margin: '10px 0 5px 5px' } },
                                React.createElement("div", { style: { textIndent: '2em' } }, data.signText),
                                React.createElement("div", { style: { textIndent: '2em' } }, data.unSignText),
                                React.createElement("div", { className: 'mr-3', style: {
                                        textIndent: '2em',
                                        textDecoration: 'underline',
                                        textDecorationColor: data.starcolor
                                    } }, data.tip))),
                        React.createElement("fieldset", { style: { border: `2px dashed ${data.starcolor}` } },
                            React.createElement("legend", { className: 'ml-2.5 align-top' },
                                React.createElement("div", { className: "title text-center flex", style: { margin: '5px 0 0 5px' } },
                                    React.createElement("img", { className: "luckyBag", src: join(publicPath, `御守.png`) }),
                                    React.createElement("span", { className: 'ml-1 text-lg mb-1 align-top' },
                                        React.createElement("em", null, "\u5FA1\u795E\u7B7E\u2014\u2014\u6216\u8BB8\u51FA\u73B0\u5C0F\u8F6C\u673A\uFF0C\u4F46\u547D\u8FD0\u5BFC\u5411\u4E5F\u8BB8\uFF1F")))),
                            React.createElement("div", { className: "luckyBox" },
                                React.createElement("div", { className: "title mb-3 mr-3", style: { textIndent: '2em' } }, data.luckData.signText),
                                React.createElement("div", { className: "luckySignBox", style: { backgroundImage: `url(${join(publicPath, 'luckySignName', data.luckData.luckyCharm + '.png')})` } },
                                    React.createElement("span", { className: "title mr-3", style: {
                                            textIndent: '2em',
                                            textDecoration: 'underline',
                                            textDecorationColor: data.starcolor
                                        } }, data.luckData.unSignText),
                                    React.createElement("img", { className: "ying", src: `${publicPath}/荧.png` }),
                                    React.createElement("div", { className: "qian", style: { color: data.starcolor } }, data.luckData.fortuneSummary))))))))));
}
function FortuneFrame({ starcolor }) {
    return (React.createElement("svg", { viewBox: "0 0 3756 1024", version: "1.1", xmlns: "http://www.w3.org/2000/svg", "p-id": "2904", width: "200", height: "180" },
        React.createElement("path", { d: "M3620.625931 0H154.134128C144.977645 172.447094 86.986587 322.766021 0 419.672131v173.973175c94.61699 96.14307 161.00149 251.040238 176.262295 430.354694h3422.99851c13.734724-167.105812 72.488823-313.609538 157.186289-410.515648V397.543964C3679.38003 300.637854 3629.019374 159.47541 3620.625931 0z", fill: starcolor, "p-id": "2905" }),
        React.createElement("path", { d: "M3507.695976 96.14307c12.208644 127.42772 57.228018 242.646796 126.66468 327.344262v165.579732c-77.830104 86.223547-129.716841 205.257824-146.503726 339.552906H289.955291c-18.312966-144.214605-77.067064-272.405365-164.053652-358.628912V443.326379c79.356185-85.460507 130.479881-209.836066 144.214605-347.946349h3237.579732m28.232489-29.758569H242.646796c-9.156483 150.318927-64.09538 281.561848-146.503726 366.259314v151.845007c90.038748 83.934426 153.371088 218.992548 167.105812 375.415798h3252.840537c12.971684-145.740686 68.673621-273.931446 149.555887-357.865872V412.041729c-73.251863-83.934426-121.323398-207.546945-129.716841-346.420268z", fill: 'white', "p-id": "2906" })));
}

export { App as default };
