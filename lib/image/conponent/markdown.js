import config_default from "../../utils/config.js";
import { getTime, hexToRgb } from "../../utils/index.js";
import { Container, HeaderBox, Item, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import fileUrl$1 from "../../_virtual/_lvy-css_4.js";
import fileUrl$2 from "../../_virtual/_lvy-css_2.js";
import fileUrl$3 from "../../_virtual/_lvy-css_3.js";
import React from "react";
import { LinkStyleSheet } from "jsxp";

//#region src/image/conponent/markdown.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const currentTime = getTime();
	const themeCfg = config_default.getConfig("theme");
	const maskColor = hexToRgb(themeCfg.mask_color, themeCfg.mask_opacity < .5 ? .3 : themeCfg.mask_opacity - .2);
	const outerCss = `
        <style>       
        .markdown-body[data-theme="custom"] {
            --bgColor-muted: ${maskColor};
            --bgColor-attention-muted: ${maskColor};
            --bgColor-neutral-muted: ${maskColor};
        }
        </style>
    `;
	return /* @__PURE__ */ React.createElement(Template, {
		theme,
		styleSheet: [fileUrl, fileUrl$3],
		globalStyle: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LinkStyleSheet, { src: fileUrl$2 }), /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: outerCss } }), /* @__PURE__ */ React.createElement(LinkStyleSheet, { src: fileUrl$1 }))
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: data.title || "Markdown",
		description: data.description
	}), /* @__PURE__ */ React.createElement("div", { className: "data_box" }, /* @__PURE__ */ React.createElement(TabLable, { text: currentTime }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, {
		classname: "itemOne",
		style: { width: "calc(100% - 10px)" }
	}, /* @__PURE__ */ React.createElement("div", {
		className: "markdown-body w-full",
		"data-theme": themeCfg.model
	}, /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: data.html } })))))));
}

//#endregion
export { App as default };