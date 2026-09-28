import { db, professions } from "../marry.js";
import { EconomyService } from "./EconomyService.js";

//#region src/response/marry/plans/services/JobService.ts
var JobService = class {
	/**
	* 玩家工作
	*/
	static work(uid, professionName) {
		const player = db.getPlayer(uid, "", "male");
		const profession = professions.find((p) => p.name === professionName);
		if (!profession) return "没有这个职业！";
		if (player.profession !== professionName) return `你还没有成为【${profession.zh}】，请先购买所需的生产资料！`;
		const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		if (player.lastWorkDate !== today) {
			player.lastWorkDate = today;
			player.workCountToday = 0;
		}
		if (player.workCountToday >= profession.daylimit) return "今天已经工作够多次了，休息一下吧！";
		if (!profession.means.every((meansName) => {
			return player.inventory[meansName] && player.inventory[meansName] > 0;
		})) return "你的生产资料不足，无法工作！";
		if (!EconomyService.changeFund(uid, profession.wage, `工作收入：${profession.zh}`)) return "发工资时发生未知错误！";
		player.workCountToday++;
		db.save();
		return `你作为【${profession.zh}】辛苦工作了一次，获得了 ¥${profession.wage}！今日已工作 ${player.workCountToday}/${profession.daylimit} 次。`;
	}
	/**
	* 就职 (购买生产资料后自动就职)
	*/
	static hire(uid, professionName) {
		const player = db.getPlayer(uid, "", "male");
		const profession = professions.find((p) => p.name === professionName);
		if (!profession) return "没有这个职业！";
		if (player.profession === professionName) return `你已经是【${profession.zh}】了！`;
		if (profession.means.every((meansName) => {
			return player.inventory[meansName] && player.inventory[meansName] > 0;
		})) {
			player.profession = professionName;
			db.save();
			return `恭喜你，成功就职为【${profession.zh}】！现在可以去工作了。`;
		} else return `就职【${profession.zh}】需要以下生产资料：${profession.means.map((m) => products.find((p) => p.name === m)?.zh).join("、")}。`;
	}
};

//#endregion
export { JobService };