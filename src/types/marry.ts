export interface ICouple {
  man: string;
  woman: string;
  favor: number;
  id?: number;
}

export interface ICoupleDisplay extends ICouple {
  maleNick?: string;
  femaleNick?: string;
  maleAvatar?: string;
  femaleAvatar?: string;
}

export interface ICoupleNick {
  man: string;
  woman: string;
}

export interface ICouplesData {
  ren: ICouple[];
  renmin: ICoupleNick[];
}
