import type { IMarriageDisplay } from '../types';
import { listMarriagesByFavor } from './marriage';

interface MemberInfo {
  username?: string;
  avatar?: string;
}

export interface RankPageResult {
  list: IMarriageDisplay[];
  /** 当前用户在本页列表中的行号（从 0 开始），-1 表示不在本页或未指定 */
  rowIndexInPage: number;
  /** 实际渲染的页码（1 起） */
  currentPage: number;
  /** 总页数 */
  pageSum: number;
}

/**
 * 分页取亲密排行榜
 * @param page          请求的页码，传 0 表示「定位到当前用户所在页」
 * @param sliceNum      每页条数
 * @param memberMap     userId -> { username, avatar }
 * @param viewerUserId  发起请求的用户（用于定位/高亮），可选
 */
export function getRankPage(
  page: number,
  sliceNum: number,
  memberMap: Record<string, MemberInfo>,
  viewerUserId?: string
): RankPageResult {
  const all = listMarriagesByFavor();

  const display: IMarriageDisplay[] = all.map((m, index) => {
    const a = memberMap[m.spouseA] || {};
    const b = memberMap[m.spouseB] || {};
    return {
      ...m,
      rowIndex: index, // 全量列表里的下标（模板可能也要用）
      nickA: a.username,
      nickB: b.username,
      avatarA: a.avatar,
      avatarB: b.avatar,
    };
  });

  const pageSum = Math.max(1, Math.ceil(display.length / sliceNum));

  // 找到当前用户在全量列表中的下标（-1 表示没找到/没指定）
  const myGlobalIndex =
    viewerUserId !== undefined
      ? display.findIndex(d => d.spouseA === viewerUserId || d.spouseB === viewerUserId)
      : -1;

  // 决定实际页码
  let realPage = page;
  if (realPage <= 0) {
    // page = 0 表示「定位到我的那一页」
    realPage =
      myGlobalIndex >= 0
        ? Math.floor(myGlobalIndex / sliceNum) + 1 // 从 1 开始
        : 1;
  }
  // 越界夹紧
  if (realPage > pageSum) realPage = pageSum;
  if (realPage < 1) realPage = 1;

  // 当前用户在本页里的行号
  const start = (realPage - 1) * sliceNum;
  const end = start + sliceNum;

  let rowIndexInPage = -1;
  if (myGlobalIndex >= start && myGlobalIndex < end) {
    rowIndexInPage = myGlobalIndex - start; // 页内从 0 开始
  }

  const list = display.slice(start, end);

  return {
    list,
    rowIndexInPage,
    currentPage: realPage,
    pageSum,
  };
}
