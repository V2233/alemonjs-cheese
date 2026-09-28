import { Format, useMessage } from 'alemonjs';

export function useErrorHandler(error: Error | string) {
  const [message] = useMessage();
  const format = Format.create().addText(
    error instanceof Error ? error.stack || error.message : error
  );
  return message.send({ format });
}

export async function useErrorContext(callback: () => any) {
  try {
    await callback();
  } catch (error: any) {
    logger?.error?.('[cheese]', error);
    const [message] = useMessage();
    const format = Format.create().addText(error.stack || error.message);
    return message.send({ format });
  }
}
