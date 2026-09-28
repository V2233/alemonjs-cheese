import { db } from "../marry.js";

//#region src/response/marry/plans/services/EconomyService.ts
var EconomyService = class {
	/**
	* 变更玩家资金
	* @param uid 玩家ID
	* @param amount 变动金额（正为收入，负为支出）
	* @param reason 变动原因（用于日志或提示）
	* @returns 是否成功
	*/
	static changeFund(uid, amount, reason) {
		const player = db.getPlayer(uid, "", "male");
		if (amount < 0 && player.personalFund + amount < 0) return false;
		player.personalFund += amount;
		db.save();
		return true;
	}
};

//#endregion
export { EconomyService };