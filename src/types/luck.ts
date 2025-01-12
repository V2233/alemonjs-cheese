export interface IUserLuckHistory {
    id: number,
    ts: number
}

export interface IUserData {
    list: IUserLuckHistory[],
    debris: number,
    isTested?: boolean,
    isKing?: boolean,
}

export interface ILuckRecord {
    [key: string]: IUserData
}

export interface IFortuneItem {
    summary: string,
    stars: number,
    sign: string,
    unsign: string,
    id: number
}