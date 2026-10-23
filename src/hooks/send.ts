import { Format, FormatButtonGroup, FormatMarkDown, useEvent, useMessage } from 'alemonjs';

import { markdownToPlain } from './utils';

type SendCallback = (fmt: Format, e: ReturnType<typeof useEvent>[0]) => Format;

type MessageSendResult = ReturnType<ReturnType<typeof useMessage>[0]['send']>;

export function SendOnce(callback: SendCallback) {
  const [event] = useEvent();
  const [message] = useMessage();
  const format = Format.create();
  return message.send({ format: callback(format, event) });
}

export function Send(
  callback: (
    Fmt: typeof Format,
    e: ReturnType<typeof useEvent>[0],
    msg: ReturnType<typeof useMessage>[0]
  ) => Format | Promise<void>
) {
  const [event] = useEvent();
  const [message] = useMessage();
  const f = callback(Format, event, message);
  if (f instanceof Promise) {
    return f;
  } else {
    return message.send({ format: f });
  }
}

export const sendAtText = (
  text: string,
  options?: {
    md?: (fmd: FormatMarkDown) => FormatMarkDown;
    btns?: (fbg: FormatButtonGroup) => FormatButtonGroup;
    tips?: string;
  }
) => {
  return SendOnce((fmt, e) => {
    if (e.current.Platform == 'qq-bot') {
      const md = Format.createMarkdown().addMention(e.current.UserId).addNewline().addText(text);
      if (options && options.md) {
        options.md(md);
      }
      fmt.addMarkdown(md);
      if (options && options.btns) {
        const btns = Format.createButtonGroup();
        fmt.addButtonGroup(options.btns(btns));
      }
      return fmt;
    } else {
      fmt.addMention(e.current.UserId).addText('\n' + text);
      if (options && options.md) {
        const md = Format.createMarkdown();
        options.md(md);
        markdownToPlain(fmt, md.value.value, 0);
      }
      if (options && options.btns) {
        fmt.addText('\n------其它指令-------');
        const btns = Format.createButtonGroup();
        options.btns(btns);
        if (btns.value.type == 'BT.group') {
          btns.value.value.forEach(item => {
            fmt.addText('\n');
            fmt.addText(item.value.map(button => button.options?.data || button.value).join(' | '));
          });
        }
      }
      options?.tips && fmt.addText('');
      return fmt;
    }
  });
};

export const sendAtImage = (
  img: Buffer,
  options?: {
    md?: (fmd: FormatMarkDown) => FormatMarkDown;
    btns?: (fbg: FormatButtonGroup) => FormatButtonGroup;
  }
) => {
  return Send((Fmt, e, msg) => {
    if (e.current.Platform == 'qq-bot') {
      return (async () => {
        await msg.send({ format: Fmt.create().addImage(img) });
        if (options) {
          const format = Fmt.create();
          // 确保有md
          const md = Fmt.createMarkdown().addMention(e.current.UserId).addNewline();
          if (options.md) {
            options.md(md);
          }
          format.addMarkdown(md);
          if (options.btns) {
            const btns = Format.createButtonGroup();
            format.addButtonGroup(options.btns(btns));
          }
          if (format.value.length > 0) {
            await msg.send({ format });
          }
        }
      })();
    } else {
      const fmt = Fmt.create().addMention(e.current.UserId).addImage(img);
      if (options && options.md) {
        const md = Format.createMarkdown();
        options.md(md);
        markdownToPlain(fmt, md.value.value, 0);
      }
      if (options && options.btns) {
        fmt.addText('\n------其它指令-------');
        const btns = Format.createButtonGroup();
        options.btns(btns);
        if (btns.value.type == 'BT.group') {
          btns.value.value.forEach(item => {
            fmt.addText('\n');
            fmt.addText(item.value.map(button => button.options?.data || button.value).join(' | '));
          });
        }
      }
      return fmt;
    }
  });
};
