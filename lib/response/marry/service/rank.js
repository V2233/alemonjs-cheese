import { listMarriagesByFavor } from "./marriage.js";

//#region src/response/marry/service/rank.ts
/**
* 分页取亲密排行榜
* @param page          请求的页码，传 0 表示「定位到当前用户所在页」
* @param sliceNum      每页条数
* @param memberMap     userId -> { username, avatar }
* @param viewerUserId  发起请求的用户（用于定位/高亮），可选
*/
function getRankPage(page, sliceNum, memberMap, viewerUserId) {
	const display = listMarriagesByFavor().map((m, index) => {
		const a = memberMap[m.spouseA] || {};
		const b = memberMap[m.spouseB] || {};
		return {
			...m,
			rowIndex: index,
			nickA: a.username,
			nickB: b.username,
			avatarA: a.avatar,
			avatarB: b.avatar
		};
	});
	const pageSum = Math.max(1, Math.ceil(display.length / sliceNum));
	const myGlobalIndex = viewerUserId !== void 0 ? display.findIndex((d) => d.spouseA === viewerUserId || d.spouseB === viewerUserId) : -1;
	let realPage = page;
	if (realPage <= 0) realPage = myGlobalIndex >= 0 ? Math.floor(myGlobalIndex / sliceNum) + 1 : 1;
	if (realPage > pageSum) realPage = pageSum;
	if (realPage < 1) realPage = 1;
	const start = (realPage - 1) * sliceNum;
	const end = start + sliceNum;
	let rowIndexInPage = -1;
	if (myGlobalIndex >= start && myGlobalIndex < end) rowIndexInPage = myGlobalIndex - start;
	return {
		list: display.slice(start, end),
		rowIndexInPage,
		currentPage: realPage,
		pageSum
	};
}

//#endregion
export { getRankPage };