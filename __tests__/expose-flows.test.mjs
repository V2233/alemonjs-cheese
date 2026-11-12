import { Expose } from 'alemonjs';
import { createTestApp } from 'alemonjs/testing';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { cheeseExpose } from '../src/expose';

test('今日运势 Expose 能跑通', async () => {
  const originalCwd = process.cwd();
  const dir = await mkdtemp(join(tmpdir(), 'cheese-luck-'));
  process.chdir(dir);
  process.env.ALEMONJS_RUNTIME_STORE_DRIVER = 'file';

  const app = createTestApp({
    config: {
      'alemonjs-cheese': {
        expose: { enabled: true, allowed_callers: ['test-caller'] }
      }
    }
  });

  try {
    await app.mount({ expose: cheeseExpose }, {}, 'alemonjs-cheese');

    const client = Expose.create();
    const event = app.events.groupMessage({
      platform: 'qq-bot',
      userId: 'alice',
      groupId: 'group-1',
      botId: 'bot-a'
    });

    const result = await app.invoke(
      event,
      () => client.call('cheese', 'alemonjs-cheese', 'start_luck', {}),
      'test-caller'
    );

    // Expose 不能顺手发平台消息
    assert.equal(result.actions.length, 0);

    const value = result.value;
    console.log('start_luck 返回：', JSON.stringify(value, null, 2));

    assert.equal(value.ok, true, JSON.stringify(value));
    assert.equal(value.data.status, 'success');

    const luck = value.data.data;
    assert.equal(typeof luck.stars, 'number');
    assert.ok(luck.stars >= 0 && luck.stars <= 7);
    assert.equal(typeof luck.summary, 'string');
    assert.equal(typeof luck.debris, 'number');

    // 再查历史，确认写库生效
    const history = await app.invoke(
      event,
      () => client.call('cheese', 'alemonjs-cheese', 'get_luck_history', {}),
      'test-caller'
    );
    assert.equal(history.value.ok, true);
    assert.ok(history.value.data.data.list.length >= 1);
  } finally {
    await app.dispose();
    process.chdir(originalCwd);
    await rm(dir, { recursive: true, force: true });
  }
});