export interface IPlayer {
    score: number,
    playerId?: string
}

export interface IGroupPlayers {
    [key: string]: IPlayer
}

export interface IGroup {
    id: number
    ans: number,
    degree: number,
    cd: number,
    replyed: boolean,
    players: IGroupPlayers
}

export interface ICache {
    [key:string]: IGroup
}

export interface IGengItem {
    pic: string;
	title: string;
	id: number;
}

interface ITimeout {
    id: NodeJS.Timeout,
    ts: number
}

export interface ICdCache {
    [key:string]: ITimeout
}
export interface ICdTip {
    [key:string]: NodeJS.Timeout
}
