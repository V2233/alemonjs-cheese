import { db, products } from "../marry.js";
import { EconomyService } from "./EconomyService.js";
import { JobService } from "./JobService.js";

//#region src/response/marry/plans/services/ShopService.ts
var ShopService = class {
	/**
	* 购买物品
	*/
	static buy(uid, productName) {
		const player = db.getPlayer(uid, "", "male");
		const product = products.find((p) => p.name === productName);
		if (!product) return "没有这个商品！";
		const currentCount = player.inventory[productName] || 0;
		if (currentCount >= product.limit) return `【${product.zh}】已达到购买上限（${product.limit}个）！`;
		if (!EconomyService.changeFund(uid, -product.price, `购买商品：${product.zh}`)) return `余额不足！购买【${product.zh}】需要 ¥${product.price}，而你只有 ¥${player.personalFund}。`;
		player.inventory[productName] = currentCount + 1;
		db.save();
		let msg = `成功购买【${product.zh}】，花费 ¥${product.price}！`;
		const professionsThatUseThisItem = professions.filter((p) => p.means.includes(productName));
		if (professionsThatUseThisItem.length > 0) {
			msg += `\n检测到你可能想就职，正在尝试...`;
			for (const prof of professionsThatUseThisItem) {
				const hireMsg = JobService.hire(uid, prof.name);
				if (hireMsg.includes("成功就职")) {
					msg += `\n${hireMsg}`;
					break;
				}
			}
		}
		return msg;
	}
};

//#endregion
export { ShopService };