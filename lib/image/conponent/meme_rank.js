import { pluginInfo } from "../../package.js";
import { Container, DataBox, HeaderBox, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import fileUrl$1 from "../../_virtual/_lvy-css_7.js";
import React from "react";

//#region src/image/conponent/meme_rank.tsx
function App({ data, theme }) {
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl, fileUrl$1],
		theme
	}, /* @__PURE__ */ React.createElement(Container, { style: {
		color: "white",
		boxShadow: "0 5px 10px 0 rgb(255 255 255 / 20%)"
	} }, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "懂王排行",
		description: `Nobody knows more than me！（仅统计本群内排行）`,
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
	} }, /* @__PURE__ */ React.createElement("div", { className: "list flex-col pl-2.5" }, /* @__PURE__ */ React.createElement(Medal, { list: data.list }), data.list.map((l, i) => {
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
		}), /* @__PURE__ */ React.createElement("span", { className: "favor" }, "分数：", l.score));
	})))));
}
function Medal({ list }) {
	return /* @__PURE__ */ React.createElement("div", { className: "topdiv" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", {
		style: {
			width: "40px",
			height: "40px"
		},
		src: list.length >= 2 ? list[1].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}`
	}), /* @__PURE__ */ React.createElement("img", {
		src: `${pluginInfo.PUBLIC_PATH}/apps/geng/表情帝.png`,
		className: "wl bqd"
	}), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, "先知"), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, list.length >= 2 ? list[1].nick : "?")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", { src: list.length >= 1 ? list[0].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}` }), /* @__PURE__ */ React.createElement("img", {
		src: `${pluginInfo.PUBLIC_PATH}/apps/geng/大水王.png`,
		className: "wl dsw"
	}), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, "懂王"), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, list.length >= 1 ? list[0].nick : "?")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", {
		style: {
			width: "23px",
			height: "23px"
		},
		src: list.length >= 3 ? list[2].avatar : `https://q1.qlogo.cn/g?b=qq&s=0&nk=11451451451884}`
	}), /* @__PURE__ */ React.createElement("img", {
		src: `${pluginInfo.PUBLIC_PATH}/apps/geng/深海乌贼.png`,
		className: "wl shwz"
	}), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, "大智若愚"), /* @__PURE__ */ React.createElement("span", { style: { zIndex: 10 } }, list.length >= 3 ? list[2].nick : "?")));
}

//#endregion
export { App as default };