import router_default from "./router.js";

//#region src/index.ts
var src_default = defineChildren({
	register() {
		return { response: router_default };
	},
	onCreated() {
		logger.info("[cheese]Start OpenAI APP");
	}
});

//#endregion
export { src_default as default };