import config_default from "../../utils/config.js";
import { Container, DataBox, HeaderBox, Item, TabLable, Template } from "../common.js";
import _lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default from "../../_virtual/_lvy-tailwindcss_b82c0885f4bb992586d8b6f9.js";
import React from "react";

// src/image/conponent/help.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const themeCfg = config_default.getConfig("theme");
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [_lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default],
		theme,
		bodyStyle: { width: data.width }
	}, /* @__PURE__ */ React.createElement(Container, { copyright: data.logo }, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: data.title,
		description: data.desc
	}, /* @__PURE__ */ React.createElement("img", {
		className: "header_logo",
		src: data.logo_img,
		style: {
			position: "absolute",
			bottom: "-20px",
			right: "20px",
			width: "100px"
		}
	})), data.list.map((cfg) => /* @__PURE__ */ React.createElement(DataBox, { key: cfg.title }, /* @__PURE__ */ React.createElement(TabLable, { text: cfg.title }), /* @__PURE__ */ React.createElement("div", { className: "list" }, cfg.list.map((prop) => /* @__PURE__ */ React.createElement(Item, {
		classname: "itemOne",
		key: prop.label,
		style: {
			width: "230px",
			borderRadius: "6px",
			margin: "0 10px 10px 10px"
		}
	}, /* @__PURE__ */ React.createElement("div", {
		className: "ml-1 font-semibold",
		style: { color: "#" + themeCfg.mask_color }
	}, prop.label), /* @__PURE__ */ React.createElement("div", {
		className: "ml-1",
		style: { color: "gray" }
	}, prop.desc))))))));
}

export { App as default };