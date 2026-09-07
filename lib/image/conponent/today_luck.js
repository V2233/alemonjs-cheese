import { pluginInfo } from "../../package.js";
import { Container, DataBox, HeaderBox, Item, Template } from "../common.js";
import fileUrl from "../../_virtual/_lvy-css_1.js";
import fileUrl$1 from "../../_virtual/_lvy-css_6.js";
import { join } from "path";
import React from "react";

//#region src/image/conponent/today_luck.tsx
/**
* @param param0
* @returns
*/
function App({ data, theme }) {
	const publicPath = join(pluginInfo.PUBLIC_PATH, "apps", "luck");
	return /* @__PURE__ */ React.createElement(Template, {
		styleSheet: [fileUrl, fileUrl$1],
		theme
	}, /* @__PURE__ */ React.createElement(Container, null, /* @__PURE__ */ React.createElement(HeaderBox, {
		title: "今日运势",
		description: "Good Luck！"
	}, /* @__PURE__ */ React.createElement("img", {
		className: "sv_logo",
		src: join(publicPath, `${data.starcolor}.png`)
	})), /* @__PURE__ */ React.createElement(DataBox, null, /* @__PURE__ */ React.createElement("div", { className: "list" }, /* @__PURE__ */ React.createElement(Item, { classname: "itemOne" }, /* @__PURE__ */ React.createElement("div", { className: "title" }, /* @__PURE__ */ React.createElement("div", { className: "fortuneSummaryBox" }, /* @__PURE__ */ React.createElement(FortuneFrame, { starcolor: data.starcolor })), /* @__PURE__ */ React.createElement("div", { className: "text fortuneSummary" }, data.fortuneSummary)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "avatar_box" }, /* @__PURE__ */ React.createElement("img", {
		className: "user_avator",
		src: data.avator
	})), /* @__PURE__ */ React.createElement("div", {
		className: "title text-3xl",
		style: { margin: "20px 0 20px 65px" }
	}, /* @__PURE__ */ React.createElement("span", {
		className: "star text-3xl",
		style: { color: data.starcolor }
	}, data.luckyStar))), /* @__PURE__ */ React.createElement("fieldset", {
		className: "mb-2.5",
		style: { border: `2px dashed ${data.starcolor}` }
	}, /* @__PURE__ */ React.createElement("legend", { className: "ml-2.5 align-top" }, /* @__PURE__ */ React.createElement("div", {
		className: "title text-center flex",
		style: { margin: "5px 0 0 5px" }
	}, /* @__PURE__ */ React.createElement("img", {
		className: "luckyBag",
		src: join(publicPath, "御神像.png")
	}), /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-lg mb-1 align-top" }, /* @__PURE__ */ React.createElement("em", null, "鸣神签——此身命运既定，不可更改")))), /* @__PURE__ */ React.createElement("div", {
		className: "title mt-3",
		style: { margin: "10px 0 5px 5px" }
	}, /* @__PURE__ */ React.createElement("div", { style: { textIndent: "2em" } }, data.signText), /* @__PURE__ */ React.createElement("div", { style: { textIndent: "2em" } }, data.unSignText), /* @__PURE__ */ React.createElement("div", {
		className: "mr-3",
		style: {
			textIndent: "2em",
			textDecoration: "underline",
			textDecorationColor: data.starcolor
		}
	}, data.tip))), /* @__PURE__ */ React.createElement("fieldset", { style: { border: `2px dashed ${data.starcolor}` } }, /* @__PURE__ */ React.createElement("legend", { className: "ml-2.5 align-top" }, /* @__PURE__ */ React.createElement("div", {
		className: "title text-center flex",
		style: { margin: "5px 0 0 5px" }
	}, /* @__PURE__ */ React.createElement("img", {
		className: "luckyBag",
		src: join(publicPath, `御守.png`)
	}), /* @__PURE__ */ React.createElement("span", { className: "ml-1 text-lg mb-1 align-top" }, /* @__PURE__ */ React.createElement("em", null, "御神签——或许出现小转机，但命运导向也许？")))), /* @__PURE__ */ React.createElement("div", { className: "luckyBox" }, /* @__PURE__ */ React.createElement("div", {
		className: "title mb-3 mr-3",
		style: { textIndent: "2em" }
	}, data.luckData.signText), /* @__PURE__ */ React.createElement("div", {
		className: "luckySignBox",
		style: { backgroundImage: `url(${join(publicPath, "luckySignName", data.luckData.luckyCharm + ".png")})` }
	}, /* @__PURE__ */ React.createElement("span", {
		className: "title mr-3",
		style: {
			textIndent: "2em",
			textDecoration: "underline",
			textDecorationColor: data.starcolor
		}
	}, data.luckData.unSignText), /* @__PURE__ */ React.createElement("img", {
		className: "ying",
		src: `${publicPath}/荧.png`
	}), /* @__PURE__ */ React.createElement("div", {
		className: "qian",
		style: { color: data.starcolor }
	}, data.luckData.fortuneSummary)))))))));
}
function FortuneFrame({ starcolor }) {
	return /* @__PURE__ */ React.createElement("svg", {
		viewBox: "0 0 3756 1024",
		version: "1.1",
		xmlns: "http://www.w3.org/2000/svg",
		"p-id": "2904",
		width: "200",
		height: "180"
	}, /* @__PURE__ */ React.createElement("path", {
		d: "M3620.625931 0H154.134128C144.977645 172.447094 86.986587 322.766021 0 419.672131v173.973175c94.61699 96.14307 161.00149 251.040238 176.262295 430.354694h3422.99851c13.734724-167.105812 72.488823-313.609538 157.186289-410.515648V397.543964C3679.38003 300.637854 3629.019374 159.47541 3620.625931 0z",
		fill: starcolor,
		"p-id": "2905"
	}), /* @__PURE__ */ React.createElement("path", {
		d: "M3507.695976 96.14307c12.208644 127.42772 57.228018 242.646796 126.66468 327.344262v165.579732c-77.830104 86.223547-129.716841 205.257824-146.503726 339.552906H289.955291c-18.312966-144.214605-77.067064-272.405365-164.053652-358.628912V443.326379c79.356185-85.460507 130.479881-209.836066 144.214605-347.946349h3237.579732m28.232489-29.758569H242.646796c-9.156483 150.318927-64.09538 281.561848-146.503726 366.259314v151.845007c90.038748 83.934426 153.371088 218.992548 167.105812 375.415798h3252.840537c12.971684-145.740686 68.673621-273.931446 149.555887-357.865872V412.041729c-73.251863-83.934426-121.323398-207.546945-129.716841-346.420268z",
		fill: "white",
		"p-id": "2906"
	}));
}

//#endregion
export { App as default };