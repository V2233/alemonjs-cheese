// services/EconomyService.ts
import { db } from '../marry';

export class EconomyService {
  /**
   * 变更玩家资金
   * @param uid 玩家ID
   * @param amount 变动金额（正为收入，负为支出）
   * @param reason 变动原因（用于日志或提示）
   * @returns 是否成功
   */
  static changeFund(uid: string, amount: number, reason: string): boolean {
    const player = db.getPlayer(uid, '', 'male'); // 这里获取player只是为了操作，name和gender不重要

    // 1. 检查余额是否足够
    if (amount < 0 && player.personalFund + amount < 0) {
      return false; // 余额不足
    }

    // 2. 执行变更
    player.personalFund += amount;

    // 3. 这里可以加入记账功能，将 {uid, amount, reason, time} 写入一个日志数组
    // logTransaction(uid, amount, reason);

    db.save(); // 保存数据
    return true;
  }
}
