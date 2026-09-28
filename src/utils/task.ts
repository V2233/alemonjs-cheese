interface ITime {
  hour?: number;
  minute?: number;
  second?: number;
}

interface ITask {
  id: string;
  executeTask: Function;
  hour: number;
  minute: number;
  second?: number;
  lastRunDay?: string; // 记录上次执行的日期，用于去重
}

const tasks = new Map<string, ITask>();
let heartbeat: NodeJS.Timeout | null = null;

const CHECK_INTERVAL = 10000; // 1 秒心跳，支持到秒

export function scheduleTask(id: string, executeTask: Function, time: ITime = {}): void {
  tasks.set(id, {
    id,
    executeTask,
    hour: time.hour ?? 0,
    minute: time.minute ?? 0,
    second: time.second ?? 0,
  });

  if (!heartbeat) {
    heartbeat = setInterval(tick, CHECK_INTERVAL);
  }
}

export function cancelTask(id: string): void {
  tasks.delete(id);
  if (tasks.size === 0 && heartbeat) {
    clearInterval(heartbeat);
    heartbeat = null;
  }
}

function tick() {
  const now = new Date();
  const day = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  for (const task of tasks.values()) {
    const target = new Date(now);
    target.setHours(task.hour, task.minute, task.second ?? 0, 0);

    const diff = now.getTime() - target.getTime();

    // 已过点，且在容差窗口内，且今天没跑过
    if (diff >= 0 && diff < CHECK_INTERVAL && task.lastRunDay !== day) {
      task.lastRunDay = day;
      try {
        task.executeTask();
      } catch (e) {
        console.error(`[scheduleTask] task ${task.id} error:`, e);
      }
    }
  }
}
