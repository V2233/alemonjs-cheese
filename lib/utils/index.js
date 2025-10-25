import fetch from 'node-fetch';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { URL } from 'url';

/**
 * 格式化时间
 * @param timeStamp 时间戳
 * @param format 'YYYY/MM/DD hh:mm:ss'
 * @returns 'YYYY/MM/DD hh:mm:ss'
 */
function getTime(timeStamp = new Date(), format = 'YYYY/MM/DD hh:mm:ss') {
    const padZero = (num) => num.toString().padStart(2, '0');
    const options = {
        // 'YY': () => timeStamp.getFullYear().toString().slice(-2),  // 两位年份
        'YYYY': () => timeStamp.getFullYear().toString(), // 四位年份
        'MM': () => padZero(timeStamp.getMonth() + 1), // 两位月份
        'DD': () => padZero(timeStamp.getDate()), // 两位日期
        'hh': () => padZero(timeStamp.getHours() % 12 || 12), // 12小时制小时（带前导零）
        'HH': () => padZero(timeStamp.getHours()), // 24小时制小时（带前导零）
        'mm': () => padZero(timeStamp.getMinutes()), // 两位分钟
        'ss': () => padZero(timeStamp.getSeconds()), // 两位秒
        'a': () => timeStamp.getHours() < 12 ? 'am' : 'pm', // 上下午标识
        'A': () => timeStamp.getHours() < 12 ? 'AM' : 'PM' // 上下午标识（大写）
    };
    let formattedDate = format;
    for (let key in options) {
        if (format.includes(key)) {
            formattedDate = formattedDate.replace(new RegExp(key, 'g'), options[key]());
        }
    }
    return formattedDate;
}
/**
 * 每天定时任务
 * @param executeTask 任务
 * @returns
 */
function scheduleTask(executeTask, time = {}) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(time.hour || 0, time.minute || 0, time.second || 0); // 设置到今天的指定时间
    // 如果今天的指定时间已经过了，则设置为明天的指定时间
    if (target < now) {
        target.setDate(target.getDate() + 1);
    }
    const msUntilExecution = target.getTime() - now.getTime();
    // 设置定时器，在每天0点执行任务
    return setTimeout(() => {
        executeTask();
        // 重新调度任务，以确保每天都能执行
        scheduleTask(executeTask, time);
    }, msUntilExecution);
}
/**
 * 获取文件buffer
 * @param url
 * @returns
 */
function requestBuffer(url) {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(url);
            if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
                // 使用 fetch 获取远程资源
                fetch(url)
                    .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.arrayBuffer();
                })
                    .then(data => resolve(Buffer.from(data)))
                    .catch(error => reject(error));
            }
            else {
                // 使用 fs 读取本地文件
                readFile(url)
                    .then(data => resolve(data))
                    .catch(error => reject(error));
            }
        }
        catch (error) {
            reject(new Error(`Invalid URL or unsupported protocol: ${url}`));
        }
    });
}
/**
 * 休眠
 * @param ms
 * @returns
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * 十六进制转RGB
 * @param hex
 * @param opacity
 * @returns
 */
function hexToRgb(hex, opacity = 0.5) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    let color = hex.match(/.{2}/g)?.map(x => parseInt(x, 16)) || [];
    // 返回rgb
    if (color.length == 3) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`;
    }
    if (color.length == 4) {
        return `rgba(${color[1]}, ${color[2]}, ${color[2]}, ${(color[0] / 255).toFixed(2)})`;
    }
    return '#' + hex;
}
/**
 * 获取md5
 * @param buffer
 * @returns
 */
async function createMD5(buffer) {
    const hash = createHash('md5');
    hash.update(buffer);
    return hash.digest('hex');
}

export { createMD5, getTime, hexToRgb, requestBuffer, scheduleTask, sleep };
