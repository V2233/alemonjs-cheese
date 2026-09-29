import { getTime } from "../../utils/index.js";
import { Container, DataBox, HeaderBox, Item, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import React from "react";

//#region src/image/conponent/qrcode.tsx
/**
* 二维码生成
* @param param0
* @returns
*/
function App({ data, theme }) {
	const currentTime = getTime();
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl],
		theme
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: data.title,
		description: data.desc,
		avatar: data.avatar
	}), /* @__PURE__ */ React.createElement(DataBox, null, /* @__PURE__ */ React.createElement(TabLable, { text: currentTime }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, { classname: "itemOne" }, /* @__PURE__ */ React.createElement("img", {
		className: "w-auto rounded-s",
		src: data.url
	}))))));
}

//#endregion
export { App as default };