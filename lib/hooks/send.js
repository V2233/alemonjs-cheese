import { Format, useEvent, useMessage } from "alemonjs";

//#region src/hooks/send.ts
function SendOnce(callback) {
	const [event] = useEvent();
	const [message] = useMessage();
	const format = Format.create();
	return message.send({ format: callback(format, event) });
}
function Send(callback) {
	const [event] = useEvent();
	const [message] = useMessage();
	const f = callback(Format, event, message);
	if (f instanceof Promise) return f;
	else return message.send({ format: f });
}
const sendAtText = (text, options) => {
	return SendOnce((fmt, e) => {
		if (e.current.Platform == "qq-bot") {
			const md = Format.createMarkdown().addMention(e.current.UserId).addNewline().addText(text);
			if (options) {
				if (options.md) {
					options.md(md);
					fmt.addMarkdown(md);
				}
				if (options.btns) {
					const btns = Format.createButtonGroup();
					fmt.addButtonGroup(options.btns(btns));
				}
			}
			if (fmt.value.length == 0) fmt.addMarkdown(md);
			return fmt;
		} else return fmt.addMention(e.current.UserId).addText(text).addText(options?.tips ?? "");
	});
};
const sendAtImage = (img, options) => {
	return Send((Fmt, e, msg) => {
		if (e.current.Platform == "qq-bot") return (async () => {
			await msg.send({ format: Fmt.create().addImage(img) });
			if (options) {
				const format = Fmt.create();
				if (options.md) {
					const md = Fmt.createMarkdown().addMention(e.current.UserId).addNewline();
					format.addMarkdown(options.md(md));
				}
				if (options.btns) {
					const btns = Format.createButtonGroup();
					format.addButtonGroup(options.btns(btns));
				}
				if (format.value.length > 0) await msg.send({ format });
			}
		})();
		else return Fmt.create().addMention(e.current.UserId).addImage(img);
	});
};

//#endregion
export { Send, SendOnce, sendAtImage, sendAtText };