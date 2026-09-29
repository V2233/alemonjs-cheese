import config_default from "../utils/config.js";
import { bodyParser } from "@koa/bodyparser";
import Router from "@koa/router";

//#region src/server/router.ts
const router = new Router({ prefix: "/api" });
router.use(bodyParser());
router.get("/config", async (ctx, next) => {
	ctx.body = { data: config_default.description };
});
router.post("/config/set", async (ctx, next) => {
	const data = ctx.request.body;
	const cfg = {};
	data.value.forEach((el) => {
		cfg[el.prop] = el.value;
	});
	config_default.setYamlAll(data.key, cfg);
	ctx.body = { data: config_default.description };
});

//#endregion
export { router as default };