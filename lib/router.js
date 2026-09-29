import { defineRouter, lazy } from "alemonjs";

//#region src/router.ts
var router_default = defineRouter([
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/help/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/luck/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/uni_emotions/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/markdown/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/marry/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/meme/res.js"))
	},
	{
		selects: ["message.create", "private.message.create"],
		handler: lazy(() => import("./response/setting/res.js"))
	}
]);

//#endregion
export { router_default as default };