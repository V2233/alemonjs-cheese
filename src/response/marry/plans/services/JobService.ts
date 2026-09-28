// services/JobService.ts
import { db, professions } from '../marry';
import { EconomyService } from './EconomyService';

export class JobService {
  /**
   * 玩家工作
   */
  static work(uid: string, professionName: string): string {
    const player = db.getPlayer(uid, '', 'male');
    const profession = professions.find(p => p.name === professionName);

    if (!profession) return '没有这个职业！';

    // 1. 检查是否已就职
    if (player.profession !== professionName) {
      return `你还没有成为【${profession.zh}】，请先购买所需的生产资料！`;
    }

    // 2. 检查每日工作次数
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
    if (player.lastWorkDate !== today) {
      player.lastWorkDate = today;
      player.workCountToday = 0; // 重置计数
    }
    if (player.workCountToday >= profession.daylimit) {
      return '今天已经工作够多次了，休息一下吧！';
    }

    // 3. 检查生产资料 (简化版：只检查是否拥有)
    const hasMeans = profession.means.every(meansName => {
      return player.inventory[meansName] && player.inventory[meansName] > 0;
    });
    if (!hasMeans) {
      return '你的生产资料不足，无法工作！';
    }

    // 4. 发放工资
    const success = EconomyService.changeFund(uid, profession.wage, `工作收入：${profession.zh}`);
    if (!success) return '发工资时发生未知错误！'; // 理论上不会发生

    // 5. 更新状态
    player.workCountToday++;
    db.save();

    return `你作为【${profession.zh}】辛苦工作了一次，获得了 ¥${profession.wage}！今日已工作 ${player.workCountToday}/${profession.daylimit} 次。`;
  }

  /**
   * 就职 (购买生产资料后自动就职)
   */
  static hire(uid: string, professionName: string): string {
    const player = db.getPlayer(uid, '', 'male');
    const profession = professions.find(p => p.name === professionName);
    if (!profession) return '没有这个职业！';

    // 检查是否已就职
    if (player.profession === professionName) {
      return `你已经是【${profession.zh}】了！`;
    }

    // 检查生产资料
    const hasMeans = profession.means.every(meansName => {
      return player.inventory[meansName] && player.inventory[meansName] > 0;
    });

    if (hasMeans) {
      player.profession = professionName;
      db.save();
      return `恭喜你，成功就职为【${profession.zh}】！现在可以去工作了。`;
    } else {
      return `就职【${profession.zh}】需要以下生产资料：${profession.means.map(m => products.find(p => p.name === m)?.zh).join('、')}。`;
    }
  }
}
