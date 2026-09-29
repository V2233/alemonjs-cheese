import { getTime } from "../../utils/index.js";
import { Container, HeaderBox, Item, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import React from "react";

//#region src/image/conponent/html_template.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const currentTime = getTime();
	return /* @__PURE__ */ React.createElement(Template, {
		theme,
		styleSheet: [fileUrl]
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

//#endregion
export { App as default };