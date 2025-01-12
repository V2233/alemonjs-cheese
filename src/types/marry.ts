export interface ICouple {
    man: string;
	woman: string;
	favor: number;
	id?: number;
}

export interface ICoupleNick {
    man: string;
	woman: string;
}

export interface ICouplesData {
    ren: ICouple[],
    renmin: ICoupleNick[]
}