import {
  Expose,
  ExposeError,
  getConfigValue,
  getCurrentEvent,
  isMaster,
  type ExposeCallContext,
  type ExposeValueSchema,
} from 'alemonjs';

export interface CheeseContext {
  userId: string;
  botId: string;
  platform: string;
  guildId: string; // 群聊时有值，私聊为空
  isGroup: boolean;
  event: ReturnType<typeof getCurrentEvent>;
}

/** 统一鉴权 + 构造当前调用上下文 */
export function currentUser(context: ExposeCallContext): CheeseContext {
  const root =
    getConfigValue<
      Record<string, { expose?: { enabled?: boolean; allowed_callers?: string[] } }>
    >();
  const config = root['alemonjs-cheese']?.expose;
  const allowed = config?.allowed_callers;
  const event = getCurrentEvent();

  if (
    (config !== undefined && (!config || typeof config !== 'object' || Array.isArray(config))) ||
    config?.enabled !== true ||
    (allowed !== undefined &&
      (!Array.isArray(allowed) ||
        !allowed.every(
          item => typeof item === 'string' && item.length > 0 && item.trim() === item
        ))) ||
    !context.callerApp ||
    (allowed !== undefined && !allowed.includes(context.callerApp)) ||
    !event ||
    !['message.create', 'private.message.create'].includes(event.name) ||
    ![event.Platform, event.BotId, event.UserId].every(
      value => typeof value === 'string' && value.trim().length > 0
    )
  ) {
    throw new ExposeError('FORBIDDEN', '当前调用方或消息身份未获奶酪插件授权');
  }
  context.signal.throwIfAborted();

  const groupId =
    event.name === 'message.create'
      ? String(
          [event.GroupId, event.ChannelId, event.GuildId].find(
            value => typeof value === 'string' && value.trim()
          ) ?? ''
        )
      : '';

  return {
    userId: event.UserId,
    botId: event.BotId,
    platform: event.Platform,
    guildId: groupId,
    isGroup: Boolean(groupId),
    event,
  };
}

export function requireMaster(user: CheeseContext): void {
  if (!isMaster(user.userId, user.platform)) {
    throw new ExposeError('FORBIDDEN', '此接口仅允许机器人管理员调用');
  }
}

export function requireGroup(user: CheeseContext): void {
  if (!user.isGroup) {
    throw new ExposeError('FORBIDDEN', '此功能仅在群聊可用');
  }
}

export const emptyInput = { type: 'object', properties: {}, additionalProperties: false } as const;

export function object(
  properties: Record<string, ExposeValueSchema>,
  required: string[] = []
): ExposeValueSchema {
  return { type: 'object', properties, required, additionalProperties: false };
}

export const text = { type: 'string', minLength: 1, maxLength: 2000 } as const;
export const stringSchema = { type: 'string' } as const;
export const numberSchema = { type: 'number' } as const;
export const booleanSchema = { type: 'boolean' } as const;

export function array(items: ExposeValueSchema): ExposeValueSchema {
  return { type: 'array', items };
}

export function record(properties: Record<string, ExposeValueSchema>): ExposeValueSchema {
  return object(properties, Object.keys(properties));
}

export function strings(...keys: string[]): Record<string, ExposeValueSchema> {
  return Object.fromEntries(keys.map(key => [key, stringSchema]));
}

/** 底层 action 封装：鉴权 + 注入 CheeseContext */
export function action<Input, Output>(
  description: string,
  inputSchema: ExposeValueSchema,
  outputSchema: ExposeValueSchema,
  handler: (
    input: Input,
    user: CheeseContext,
    context: ExposeCallContext
  ) => Promise<Output> | Output,
  effect: 'read' | 'write' = 'read'
) {
  return Expose.action<Input, Output>({
    description,
    effect,
    inputSchema,
    outputSchema,
    authorize: (_input, context) => {
      currentUser(context);
      return true;
    },
    handler: (input, context) => handler(input, currentUser(context), context),
  });
}

/** 返回 { status:'success', text } */
export function query<Input>(
  description: string,
  inputSchema: ExposeValueSchema,
  handler: (input: Input, user: CheeseContext) => Promise<string> | string,
  effect: 'read' | 'write' = 'read'
) {
  return action(
    description,
    inputSchema,
    object({ status: { type: 'string', enum: ['success'] }, text: { type: 'string' } }, [
      'status',
      'text',
    ]),
    async (input: Input, user) => ({
      status: 'success' as const,
      text: await handler(input, user),
    }),
    effect
  );
}

/** 返回 { status:'success', data } */
export function dataQuery<Input, Output>(
  description: string,
  inputSchema: ExposeValueSchema,
  dataSchema: ExposeValueSchema,
  handler: (
    input: Input,
    user: CheeseContext,
    context: ExposeCallContext
  ) => Promise<Output> | Output,
  effect: 'read' | 'write' = 'read'
) {
  return action(
    description,
    inputSchema,
    object({ status: { type: 'string', enum: ['success'] }, data: dataSchema }, ['status', 'data']),
    async (input: Input, user, context) => ({
      status: 'success' as const,
      data: await handler(input, user, context),
    }),
    effect
  );
}
