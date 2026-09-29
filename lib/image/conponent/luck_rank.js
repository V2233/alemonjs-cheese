import { pluginInfo } from "../../package.js";
import { Container, DataBox, HeaderBox, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_0.js";
import fileUrl$1 from "../../_virtual/_lvy-css_1.js";
import React from "react";

//#region src/image/conponent/luck_rank.tsx
function App({ data, theme }) {
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl, fileUrl$1],
		theme
	}, /* @__PURE__ */ React.createElement(Container, { style: {
		color: "white",
		boxShadow: "0 5px 10px 0 rgb(255 255 255 / 20%)"
	} }, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "运势财富榜",
		description: `Fortune ranking！（仅统计本群内排行）`,
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
	} }, /* @__PURE__ */ React.createElement("div", { className: "list flex-col pl-2.5" }, data.list.map((l, i) => {
		const curUserId = (data.currentPage - 1) * data.sliceNum + i + 1;
		return /* @__PURE__ */ React.createElement("div", {
			className: "lb",
			key: l.playerId,
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
		}), curUserId > 3 ? `${curUserId}.${l.nick}` : l.nick, /* @__PURE__ */ React.createElement("img", {
			className: "ml-1",
			src: l.avatar ? l.avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=${l.playerId}`
		}), l.isTested && /* @__PURE__ */ React.createElement("span", {
			className: "text-2xl",
			style: { color: l.luckColor }
		}, l.luckyStar), /* @__PURE__ */ React.createElement("span", { className: "favor ml-auto" }, "碎片：", l.debris));
	})))));
}

//#endregion
export { App as default };