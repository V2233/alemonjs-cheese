import { pluginInfo } from "../../package.js";
import { Container, DataBox, HeaderBox, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import React from "react";

//#region src/image/conponent/lover_rank.tsx
function App({ data, theme }) {
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl],
		theme
	}, /* @__PURE__ */ React.createElement(Container, { style: {
		color: "white",
		boxShadow: "0 5px 10px 0 rgb(255 255 255 / 20%)"
	} }, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "恩爱排行榜",
		description: `Gay, you're so appealing！ 当前共${data.loverSum}对情侣脱单~`,
		style: {
			background: "rgba(0, 0, 0, 0)",
			boxShadow: "0 5px 10px 0 rgb(255 255 255 / 20%)"
		},
		titleStyle: {
			fontFamily: "NZBZ",
			fontSize: "40px",
			fontWeight: 500
		}
	}), /* @__PURE__ */ React.createElement(DataBox, { style: {
		paddingTop: "5px",
		boxShadow: "1px 1px 3px 1px rgb(245 246 251 / 80%)"
	} }, /* @__PURE__ */ React.createElement("div", { className: "list flex-col pl-2.5" }, data.ren.map((l, i) => {
		const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1;
		return /* @__PURE__ */ React.createElement("div", {
			className: "lb",
			key: l.man,
			style: data.currentUserId == i ? { backgroundColor: "rgba(67, 243, 249, 0.3)" } : {}
		}, curUserId == 1 && /* @__PURE__ */ React.createElement("img", {
			className: "medal",
			src: `${pluginInfo.PUBLIC_PATH}/apps/medal/金牌.png`
		}), curUserId == 2 && /* @__PURE__ */ React.createElement("img", {
			className: "medal",
			src: `${pluginInfo.PUBLIC_PATH}/apps/medal/银牌.png`
		}), curUserId == 3 && /* @__PURE__ */ React.createElement("img", {
			className: "medal",
			src: `${pluginInfo.PUBLIC_PATH}/apps/medal/铜牌.png`
		}), curUserId > 3 ? `${curUserId}.` : "", l.man || "？", /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "♡("), /* @__PURE__ */ React.createElement("img", { src: `http://q2.qlogo.cn/headimg_dl?dst_uin=${l.man}&spec=5` }), /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, ")人("), /* @__PURE__ */ React.createElement("img", { src: `http://q2.qlogo.cn/headimg_dl?dst_uin=${l.woman}&spec=5` }), /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, ")♡"), l.woman || "？");
	})))));
}

//#endregion
export { App as default };