/** 生成婚姻 ID，保证 (A,B) 与 (B,A) 结果相同 */
export function makeMarriageId(a: string, b: string): string {
  const [x, y] = a < b ? [a, b] : [b, a];
  return `${x}::${y}`;
}

/** 返回 [spouseA, spouseB]，满足 a < b */
export function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** 给定 userId 和一段婚姻，返回配偶 id */
export function getPartner(marriage: { spouseA: string; spouseB: string }, userId: string): string {
  return marriage.spouseA === userId ? marriage.spouseB : marriage.spouseA;
}
