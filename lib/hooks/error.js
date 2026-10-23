import { Format, useMessage } from "alemonjs";

// src/hooks/error.ts
function useErrorHandler(error) {
	const [message] = useMessage();
	const format = Format.create().addText(error instanceof Error ? error.stack || error.message : error);
	return message.send({ format });
}
async function useErrorContext(callback) {
	try {
		await callback();
	} catch (error) {
		logger?.error?.("[cheese]", error);
		const [message] = useMessage();
		const format = Format.create().addText(error.stack || error.message);
		return message.send({ format });
	}
}

export { useErrorContext, useErrorHandler };