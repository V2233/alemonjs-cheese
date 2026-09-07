import config_default from "../../utils/config.js";
import { Container, DataBox, HeaderBox, Item, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import fileUrl$1 from "../../_virtual/_lvy-css_5.js";
import React from "react";

//#region src/image/conponent/setting.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const themeCfg = config_default.getConfig("theme");
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl, fileUrl$1],
		theme
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "奶酪设置[key][value]",
		description: "示例：奶酪设置背景图片https://xxx.com/1.png"
	}), data.map((cfg) => /* @__PURE__ */ React.createElement(DataBox, { key: cfg.key }, /* @__PURE__ */ React.createElement(TabLable, { text: cfg.title }), /* @__PURE__ */ React.createElement("div", { className: "list" }, cfg.value.map((prop) => /* @__PURE__ */ React.createElement(Item, {
		classname: "item",
		key: prop.prop,
		style: { padding: "4px 3px 4px 3px" }
	}, /* @__PURE__ */ React.createElement("div", {
		className: "ml-1 font-semibold",
		style: { color: "#" + themeCfg.mask_color }
	}, prop.title), /* @__PURE__ */ React.createElement("div", {
		className: "ml-1 text-xs",
		style: { color: themeCfg.model == "dark" ? "white" : "#515151" }
	}, prop.desc), typeof prop.value === "boolean" ? /* @__PURE__ */ React.createElement(Switch, {
		open: prop.value,
		color: "#" + themeCfg.mask_color
	}) : /* @__PURE__ */ React.createElement("div", { className: "numframe" }, prop.value))))))));
}
function Switch({ color, open }) {
	if (open) return /* @__PURE__ */ React.createElement("svg", {
		className: "switch",
		viewBox: "0 0 1693 1024",
		version: "1.1",
		xmlns: "http://www.w3.org/2000/svg",
		"p-id": "2348",
		width: "330.6640625",
		height: "200"
	}, /* @__PURE__ */ React.createElement("path", {
		d: "M1693.03 512.067A511.221 511.221 0 0 0 1182.521 0.134H511.933a511.933 511.933 0 0 0 0 1023.866h670.588a511.221 511.221 0 0 0 510.51-511.933z m-46.608 1.068a463.277 463.277 0 1 1-463.277-464.613 463.945 463.945 0 0 1 463.277 464.48z",
		fill: color ? color : "#00cc00",
		"p-id": "2349"
	}));
	else return /* @__PURE__ */ React.createElement("svg", {
		className: "switch",
		viewBox: "0 0 1694 1024",
		version: "1.1",
		xmlns: "http://www.w3.org/2000/svg",
		"p-id": "3549",
		width: "330.859375",
		height: "200"
	}, /* @__PURE__ */ React.createElement("path", {
		d: "M511.889 1024h670.53a511.889 511.889 0 0 0 0-1023.777h-670.53a511.889 511.889 0 0 0 0 1023.777z m-0.579-975.348A464.572 464.572 0 1 1 48.03 512.957 463.905 463.905 0 0 1 511.31 48.429z",
		fill: "#515151",
		"p-id": "3550"
	}));
}

//#endregion
export { App as default };