import { FormatMarkDown } from 'alemonjs';

/** 底部通用按钮组 */
export function withBaseMdTip(fmd: FormatMarkDown) {
  return fmd
    .addDivider()
    .addButton('娶群友', { data: '娶群友' })
    .addText(' | ')
    .addButton('抢群友@ ', { data: '抢群友' })
    .addText(' | ')
    .addButton('强娶@', { data: '强娶' })
    .addNewline()
    .addButton('我对象呢', { data: '我对象呢' })
    .addText(' | ')
    .addButton('闹离婚', { data: '闹离婚' })
    .addText(' | ')
    .addButton('亲密排行', { data: '亲密排行' })
    .addNewline()
    .addButton('老婆亲亲', { data: '老婆亲亲' });
}

/** 亲密度操作后的提示面板 */
export function withFavorTip(fmd: FormatMarkDown, favor: number, partner: string) {
  return fmd
    .addNewline()
    .addText(`当前亲密值为 ${favor?.toFixed(2)} \n`)
    .addText(`你还可以通过以下方式来提升和伴侣亲密度：`)
    .addDivider()
    .addButton('【老婆亲亲】', { data: '老婆亲亲' })
    .addText(`  0.2~0.5 ↑ \n`)
    .addButton('【老婆羞羞】', { data: '老婆羞羞' })
    .addText(`  0.4~0.7 ↑ \n`)
    .addButton('【老婆买买】', { data: '老婆买买' })
    .addText(`  0.6~0.9 ↑ \n`)
    .addButton('【老婆做饭】', { data: '老婆做饭' })
    .addText(`  0.6~0.5 ↓ \n`)
    .addButton('【老婆打你】', { data: '老婆打你' })
    .addText(`  -> 0 👊\n`)
    .addDivider()
    .addButton('娶群友 ', { data: '娶群友' })
    .addText(' | ')
    .addButton('抢群友@ ', { data: '抢群友' })
    .addText(' | ')
    .addButton('强娶@', { data: '强娶' })
    .addNewline()
    .addButton('我对象呢 ', { data: '我对象呢' })
    .addText(' | ')
    .addButton('闹离婚 ', { data: '闹离婚' })
    .addText(' | ')
    .addButton('亲密排行', { data: '亲密排行' });
}
