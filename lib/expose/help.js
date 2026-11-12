import config_default from "../utils/config.js";
import { emptyInput, query } from "./shared.js";

// src/expose/help.ts
const helpActions = { get_help: query("查询奶酪插件功能入口与帮助（等同于“奶酪帮助”）", emptyInput, () => {
	return `奶酪功能：运势、看图识梗、结婚、设置。\n入口指令：/奶酪帮助\n默认条目：${(config_default.getConfig("help").default ?? []).length} 条`;
}) };

export { helpActions };