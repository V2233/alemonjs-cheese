import { renders } from 'jsxp';
import { compressImageFromBuffer } from '../utils/imageProcessor.js';
import App$9 from './conponent/help.js';
import App$8 from './conponent/setting.js';
import App$7 from './conponent/today_luck.js';
import App$6 from './conponent/luck_history.js';
import App$5 from './conponent/lover_rank.js';
import App$3 from './conponent/meme_qs.js';
import App$4 from './conponent/meme_rank.js';
import App$2 from './conponent/markdown.js';
import App from './conponent/html_template.js';
import App$1 from './conponent/qrcode.js';
import { MakeEmo, EmoList } from './conponent/emotion.js';

const renderComponents = renders({
    help: App$9,
    setting: App$8,
    todayLuck: App$7,
    luckHistory: App$6,
    loverRank: App$5,
    memeRank: App$4,
    memeQs: App$3,
    markdown: App$2,
    qrcode: App$1,
    emoList: EmoList,
    makeEmo: MakeEmo,
    htmlTemplate: App,
});
const Pictures = (key, options, name) => {
    return new Promise((resolve, reject) => {
        renderComponents(key, options, name).then((res) => {
            if (typeof res == "boolean") {
                reject(false);
            }
            else {
                compressImageFromBuffer(res)
                    .then((buf) => {
                    resolve(buf);
                })
                    .catch(() => {
                    reject(false);
                });
            }
        });
    });
};

export { Pictures };
