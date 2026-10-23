import { DataMarkDown, Format } from 'alemonjs';

/** 无原生 Markdown 渲染器的平台使用的可读文本降级，递归保留引用内容。 */
export const markdownToPlain = (
  fmt: Format,
  items: DataMarkDown['value'],
  hideUnsupported?: boolean | number
) => {
  if (Number(hideUnsupported) >= 4) {
    return fmt;
  }

  items.forEach(item => {
    switch (item.type) {
      case 'MD.newline':
        return fmt.addText('\n');
      case 'MD.divider':
        return fmt.addText(hideUnsupported ? '' : '\n---\n');
      case 'MD.link':
        if (Number(hideUnsupported) >= 3) {
          return fmt.addText('');
        }
        if (Number(hideUnsupported) >= 2) {
          return fmt.addText(item.value.url ?? item.value.text);
        }
        return fmt.addText(
          item.value.url ? `${item.value.text} (${item.value.url})` : item.value.text
        );
      case 'MD.list':
        return fmt.addText(
          '\n' +
            item.value
              .map(li =>
                typeof li.value === 'string'
                  ? `- ${li.value}`
                  : `${li.value.index}. ${li.value.text ?? ''}`
              )
              .join('\n') +
            '\n'
        );
      case 'MD.image':
        return fmt.addText(hideUnsupported ? '' : '[图片]');
      case 'MD.mention':
        if (item.value === 'everyone') {
          return fmt.addText('@所有人');
        } else {
          return fmt.addMention(item.value);
        }
      case 'MD.button':
        if (Number(hideUnsupported) >= 3) {
          return fmt.addText('');
        }
        return fmt.addText(
          Number(hideUnsupported) >= 2 ? item.options?.data || item.value : item.value
        );
      default:
        return fmt.addText(item.value.toString() as string);
    }
  });
};
