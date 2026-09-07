import config_default from "../../utils/config.js";
import { getTime } from "../../utils/index.js";
import { Container, DataBox, HeaderBox, Item, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import React from "react";

//#region src/image/conponent/meme_qs.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const currentTime = getTime();
	const cfg = config_default.getConfig("theme");
	return /* @__PURE__ */ React.createElement(Template, { styleSheet: [fileUrl] }, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "看图识梗",
		description: "加入群战展示你的懂王实力吧~",
		avatar: data.avatar
	}), /* @__PURE__ */ React.createElement(DataBox, null, /* @__PURE__ */ React.createElement(TabLable, { text: currentTime }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, { classname: "itemOne" }, /* @__PURE__ */ React.createElement("img", {
		className: "w-auto rounded-s",
		src: data.url
	})), /* @__PURE__ */ React.createElement(Item, { classname: "itemOne" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-bold text-wrap mb-2" }, data.tip), data.choices && data.choices.map((choice, index) => /* @__PURE__ */ React.createElement("div", {
		className: "text-2xl font-semibold text-wrap",
		key: choice.id
	}, /* @__PURE__ */ React.createElement("span", { style: { color: "#" + cfg.mask_color } }, "【", index, "】"), choice.title)))))));
}

//#endregion
export { App as default };