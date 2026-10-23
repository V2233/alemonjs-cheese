import { getTime } from "../../utils/index.js";
import { Container, HeaderBox, Item, TabLable, Template } from "../common.js";
import _lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default from "../../_virtual/_lvy-tailwindcss_b82c0885f4bb992586d8b6f9.js";
import React from "react";

// src/image/conponent/html_template.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const currentTime = getTime();
	return /* @__PURE__ */ React.createElement(Template, {
		theme,
		styleSheet: [_lvy_tailwindcss_b82c0885f4bb992586d8b6f9_default]
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: data.title || "HTML",
		description: data.description
	}), /* @__PURE__ */ React.createElement("div", { className: "data_box" }, /* @__PURE__ */ React.createElement(TabLable, { text: currentTime }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, {
		classname: "itemOne",
		style: {
			width: "calc(100% - 10px)",
			...data.style
		}
	}, /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: data.html } }))))));
}

export { App as default };