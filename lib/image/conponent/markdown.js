import config_default from "../../utils/config.js";
import { getTime, hexToRgb } from "../../utils/index.js";
import { Container, HeaderBox, Item, TabLable, Template } from "../common.js";
import _lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default from "../../_virtual/_lvy-tailwindcss_b82c0885f4bb992586d8b6f9.js";
import _lvy_tailwindcss_d803be9bcbeb51f7d3df613c_default from "../../_virtual/_lvy-tailwindcss_d803be9bcbeb51f7d3df613c.js";
import _lvy_tailwindcss_cfa5ec8ce832d412bc78e2a7_default from "../../_virtual/_lvy-tailwindcss_cfa5ec8ce832d412bc78e2a7.js";
import _lvy_tailwindcss_35a627565d48266982cee021_default from "../../_virtual/_lvy-tailwindcss_35a627565d48266982cee021.js";
import { LinkStyleSheet } from "jsxp";
import React from "react";

// src/image/conponent/markdown.tsx
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
		styleSheet: [_lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default, _lvy_tailwindcss_35a627565d48266982cee021_default],
		globalStyle: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LinkStyleSheet, { src: _lvy_tailwindcss_cfa5ec8ce832d412bc78e2a7_default }), /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: outerCss } }), /* @__PURE__ */ React.createElement(LinkStyleSheet, { src: _lvy_tailwindcss_d803be9bcbeb51f7d3df613c_default }))
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: data.title || "Markdown",
		description: data.description
	}), /* @__PURE__ */ React.createElement("div", { className: "data_box" }, /* @__PURE__ */ React.createElement(TabLable, { text: currentTime }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, {
		classname: "itemOne",
		style: { width: "calc(100% - 10px)" }
	}, /* @__PURE__ */ React.createElement("div", {
		className: "markdown-body w-full",
		"data-theme": themeCfg.model
	}, /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: data.html } }), /* @__PURE__ */ React.createElement("script", { type: "module" }, "` import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs'; mermaid.initialize(", "); `")))))));
}

export { App as default };