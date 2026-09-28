//#region src/response/marry/utils/pair.ts
/** 生成婚姻 ID，保证 (A,B) 与 (B,A) 结果相同 */
function makeMarriageId(a, b) {
	const [x, y] = a < b ? [a, b] : [b, a];
	return `${x}::${y}`;
}
/** 返回 [spouseA, spouseB]，满足 a < b */
function orderPair(a, b) {
	return a < b ? [a, b] : [b, a];
}
/** 给定 userId 和一段婚姻，返回配偶 id */
function getPartner(marriage, userId) {
	return marriage.spouseA === userId ? marriage.spouseB : marriage.spouseA;
}

//#endregion
export { getPartner, makeMarriageId, orderPair };