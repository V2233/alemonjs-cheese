import React from 'react';
import Cfg from '../utils/config.js';
import { LinkStyleSheet } from 'jsxp';
import { botInfo, pluginInfo } from '../package.js';
import { hexToRgb } from '../utils/index.js';

function Container({ children, style, copyright }) {
    const cfg = Cfg.getConfig('theme');
    const stl = {
        // backgroundImage: cfg.model === 'custom' ? `url(${cfg.bgurl})` : undefined,
        color: cfg.model === 'dark' ? 'white' : 'black',
        backgroundColor: cfg.model === 'custom' ? undefined : (cfg.model === 'dark' ? 'black' : 'white'),
        ...style
    };
    Object.keys(stl).forEach(k => {
        if (stl[k] == undefined)
            delete stl[k];
    });
    return (React.createElement("div", { className: "container", id: "container", style: stl },
        children,
        React.createElement(Copyright, { text: copyright })));
}
function HeaderBox(data) {
    const cfg = Cfg.getConfig('theme');
    const style = {
        borderRadius: data.avatar ? '15px 35px 35px 15px' : undefined,
        background: cfg.model == 'dark' ? 'rgba(0, 0, 0, 0.2)' : `rgba(255, 255, 255, ${cfg.mask_opacity})`,
        boxShadow: cfg.model == 'dark' ? '1px 1px 3px 1px rgba(245, 246, 251, 1)' : '0 5px 10px 0 rgba(0, 0, 0, 0.3)',
        ...data.style
    };
    Object.keys(style).forEach(k => {
        if (style[k] == undefined)
            delete style[k];
    });
    return (cfg.header_visible &&
        React.createElement("div", { className: 'head_box', style: style },
            React.createElement("div", { className: "id_text", style: data.titleStyle }, data.title),
            data.description && React.createElement("div", { className: "day_text" }, data.description),
            data.avatar &&
                React.createElement("div", { className: 'avator_box' },
                    React.createElement("img", { className: "user_avator", src: data.avatar })),
            data.children && data.children));
}
function DataBox({ children, style }) {
    const cfg = Cfg.getConfig('theme');
    return (React.createElement("div", { className: 'data_box', style: {
            boxShadow: cfg.model == 'dark' ? '1px 1px 3px 1px rgb(245 246 251 / 100%)' : undefined,
            ...style
        } }, children));
}
function Item({ children, color, classname, style }) {
    const cfg = Cfg.getConfig('theme');
    const graColor = cfg.model == 'dark' ? 'black' : 'white';
    return (React.createElement("div", { className: classname, style: {
            backgroundImage: cfg.model == 'custom' ? `linear-gradient(${cfg.mask_degree || 90}deg, rgba(255, 255, 255, ${cfg.mask_opacity}), rgba(255, 255, 255, ${cfg.mask_opacity})), linear-gradient(${cfg.mask_degree || 90}deg, ${hexToRgb(color ? color : cfg.mask_color, cfg.mask_opacity)}, rgba(194, 194, 194, ${cfg.mask_opacity}))` :
                `linear-gradient(${cfg.mask_degree || 90}deg, ${graColor}, ${graColor}), linear-gradient(${cfg.mask_degree || 90}deg, ${hexToRgb(color ? color : cfg.mask_color, 1)}, rgba(194, 194, 194, 1))`,
            ...style
        } }, children));
}
function TabLable({ text }) {
    const cfg = Cfg.getConfig('theme');
    return (React.createElement("div", { className: "tab_lable", style: {
            background: cfg.model == 'dark' ? 'transparent' : `linear-gradient(90deg, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)}, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)})`,
            color: cfg.model == 'dark' ? 'white' : 'black',
            boxShadow: cfg.model == 'dark' ? `-1px -1px 1.5px 1.5px ${hexToRgb(cfg.mask_color)}` : undefined,
        } }, text));
}
function PageLable({ text }) {
    const cfg = Cfg.getConfig('theme');
    return (React.createElement("div", { className: "page_lable", style: { background: `linear-gradient(90deg, ${hexToRgb(cfg.mask_color, cfg.mask_opacity)}, rgba(194, 194, 194, ${cfg.mask_opacity}))` } }, text));
}
function Copyright({ text }) {
    const cfg = Cfg.getConfig('theme');
    return (React.createElement("div", { className: "logo", style: { color: '#' + cfg.mask_color } }, text ? text : `${botInfo.BOT_NAME} ${botInfo.BOT_VERSION} & ${pluginInfo.PLUGIN_NAME} ${pluginInfo.PLUGIN_VERSION}`));
}
function Template(data) {
    const cfg = Cfg.getConfig('theme');
    return (React.createElement("html", { lang: "zh-CN" },
        React.createElement("head", null,
            React.createElement("meta", { charSet: "UTF-8" }),
            React.createElement("meta", { httpEquiv: "content-type", content: "text/html;charset=utf-8" }),
            React.createElement("meta", { name: "referrer", content: "no-referrer" }),
            data.styleSheet.map(style => (React.createElement(LinkStyleSheet, { src: style, key: style }))),
            data.globalStyle),
        React.createElement("body", { style: { width: cfg.width, transform: `scale(${cfg.ratio})`, ...data.bodyStyle } },
            cfg.model === 'custom' && React.createElement("img", { className: 'w-full h-full absolute', src: cfg.bgurl, style: { zIndex: '-10' } }),
            data.children)));
}

export { Container, Copyright, DataBox, HeaderBox, Item, PageLable, TabLable, Template };
