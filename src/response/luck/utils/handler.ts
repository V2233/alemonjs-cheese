
export default class LuckHandler {
    private starCount: number = 0
    constructor(private strUser: string) {
        this.starCount = 0
        this.strUser = strUser
    }

    playerObj(luckRecord) {
        return luckRecord[this.strUser]
    }

    getTodayLuck(luckRecord) {
        return luckRecord[this.strUser].list[luckRecord[this.strUser].list.length - 1]
    }

    luckySummary(starCount:number, lots) {
        if (starCount <= 1) {
            let xiong = lots.filter((item) => item.fortuneSummary == '凶')
            let randomNum = Math.floor(Math.random() * xiong.length);
            return xiong[randomNum]
        } else if (starCount <= 3) {
            let mo = lots.filter((item) => item.fortuneSummary == '末吉')
            let randomNum = Math.floor(Math.random() * mo.length);
            return mo[randomNum]
        } else if (starCount <= 4) {
            let ji = lots.filter((item) => item.fortuneSummary == '吉')
            let randomNum = Math.floor(Math.random() * ji.length);
            return ji[randomNum]
        } else if (starCount <= 5) {
            let zhong = lots.filter((item) => item.fortuneSummary == '中吉')
            let randomNum = Math.floor(Math.random() * zhong.length);
            return zhong[randomNum]
        } else {
            let daji = lots.filter((item) => item.fortuneSummary == '大吉')
            let randomNum = Math.floor(Math.random() * daji.length);
            return daji[randomNum]
        }
    }

    starsColor(starCount:number) {
        if (starCount <= 1) {
            return 'red'
        } else if (starCount <= 4) {
            return 'orange'
        } else {
            return 'green'
        }
    }

    luckyStar(starCount:number) {
        let luckyStr = ''
        for (let i = 1; i <= 7; i++) {
            if (i <= starCount) {
                luckyStr += '★'
            } else {
                luckyStr += '✰'
            }
        }
        return luckyStr
    };


}