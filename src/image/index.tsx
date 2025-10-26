import { renders } from "jsxp";
import { compressImageFromBuffer } from "@src/utils/imageProcessor";

import Help from "@src/image/conponent/help";
import Setting from "@src/image/conponent/setting";
import TodayLuck from "@src/image/conponent/today_luck";
import LuckHistory from "@src/image/conponent/luck_history";
import LoverRank from "@src/image/conponent/lover_rank";
import MemeQs from "@src/image/conponent/meme_qs";
import MemeRank from "@src/image/conponent/meme_rank";
import Markdown from "@src/image/conponent/markdown";
import HtmlTemplate from "@src/image/conponent/html_template";
import QRCode from "@src/image/conponent/qrcode";
import { EmoList, MakeEmo } from "@src/image/conponent/emotion";

const renderComponents = renders({
  help: Help,
  setting: Setting,
  todayLuck: TodayLuck,
  luckHistory: LuckHistory,
  loverRank: LoverRank,
  memeRank: MemeRank,
  memeQs: MemeQs,
  markdown: Markdown,
  qrcode: QRCode,
  emoList: EmoList,
  makeEmo: MakeEmo,
  htmlTemplate: HtmlTemplate,
});

export const Pictures: typeof renderComponents = (key, options, name) => {
  return new Promise((resolve, reject) => {
    renderComponents(key, options, name).then((res) => {
      if (typeof res == "boolean") {
        reject(false);
      } else {
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
