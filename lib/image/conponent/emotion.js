import config_default from "../../utils/config.js";
import { Container, DataBox, HeaderBox, Item, PageLable, TabLable, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import fileUrl$1 from "../../_virtual/_lvy-css_0.js";
import React from "react";

//#region src/image/conponent/emotion.tsx
/**
* 宽高
* @param param0
* @returns
*/
function MakeEmo({ data, theme }) {
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl, fileUrl$1],
		theme
	}, /* @__PURE__ */ React.createElement("div", { style: {
		height: "530px",
		width: "100%"
	} }, /* @__PURE__ */ React.createElement("div", {
		className: "mask1",
		style: {
			backgroundImage: `url(${encodeURI(data.originUrl)})`,
			maskImage: `url(${data.maskUrl})`,
			WebkitMaskImage: `url(${data.maskUrl})`
		}
	}), /* @__PURE__ */ React.createElement("img", {
		className: "mask2",
		src: data.maskUrl,
		style: { mixBlendMode: data.mixBlendMode }
	})));
}
function EmoList({ data, theme }) {
	const themeCfg = config_default.getConfig("theme");
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl],
		theme
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "万能头像表情",
		description: "@群友可合成群友头像"
	}), /* @__PURE__ */ React.createElement(DataBox, null, /* @__PURE__ */ React.createElement(TabLable, { text: "请发送【合成图片[id]】合成" }), /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, {
		classname: "item",
		style: {
			alignItems: "start",
			flexWrap: "wrap",
			justifyContent: "space-around"
		}
	}, data.list.map((pic) => /* @__PURE__ */ React.createElement("div", {
		className: "m-1 h-auto rounded border-2 w-20",
		key: pic.id,
		style: {
			borderColor: "#" + themeCfg.mask_color,
			backgroundSize: "auto 100%",
			flexShrink: 0
		}
	}, /* @__PURE__ */ React.createElement("div", {
		className: "w-full h-4 flex justify-center items-center text-xs",
		style: { background: "#" + themeCfg.mask_color }
	}, `ID:${pic.id}`), /* @__PURE__ */ React.createElement("img", {
		className: "w-full h-auto",
		src: pic.url
	}))))), /* @__PURE__ */ React.createElement(PageLable, { text: `当前第 ${data.pageNo} 页` }))));
}

//#endregion
export { EmoList, MakeEmo };