import { lazy } from "alemonjs";

//#region src/router.ts
var router_default = defineResponse([
	{
		regular: /.*/,
		handler: lazy(() => import("./response/store/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/help/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/luck/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/markdown/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/marry/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/meme/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/setting/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/uni_emotions/res.js"))
	},
	{
		regular: /.*/,
		handler: lazy(() => import("./response/ai/res.js"))
	}
]);

//#endregion
export { router_default as default };