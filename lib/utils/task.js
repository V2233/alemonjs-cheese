//#region src/utils/task.ts
const tasks = /* @__PURE__ */ new Map();
let heartbeat = null;
const CHECK_INTERVAL = 1e4;
function scheduleTask(id, executeTask, time = {}) {
	tasks.set(id, {
		id,
		executeTask,
		hour: time.hour ?? 0,
		minute: time.minute ?? 0,
		second: time.second ?? 0
	});
	if (!heartbeat) heartbeat = setInterval(tick, CHECK_INTERVAL);
}
function cancelTask(id) {
	tasks.delete(id);
	if (tasks.size === 0 && heartbeat) {
		clearInterval(heartbeat);
		heartbeat = null;
	}
}
function tick() {
	const now = /* @__PURE__ */ new Date();
	const day = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
	for (const task of tasks.values()) {
		const target = new Date(now);
		target.setHours(task.hour, task.minute, task.second ?? 0, 0);
		const diff = now.getTime() - target.getTime();
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

//#endregion
export { cancelTask, scheduleTask };