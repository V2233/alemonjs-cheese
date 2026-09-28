import { lazy } from "alemonjs";

//#region src/router.ts
var router_default = defineResponse([
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
	}
]);

//#endregion
export { router_default as default };