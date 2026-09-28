// services/ShopService.ts
import { db, products } from '../marry';
import { EconomyService } from './EconomyService';
import { JobService } from './JobService'; // 用于购买后自动检测就职

export class ShopService {
  /**
   * 购买物品
   */
  static buy(uid: string, productName: string): string {
    const player = db.getPlayer(uid, '', 'male');
    const product = products.find(p => p.name === productName);

    if (!product) return '没有这个商品！';

    // 1. 检查限购
    const currentCount = player.inventory[productName] || 0;
    if (currentCount >= product.limit) {
      return `【${product.zh}】已达到购买上限（${product.limit}个）！`;
    }

    // 2. 扣款
    const success = EconomyService.changeFund(uid, -product.price, `购买商品：${product.zh}`);
    if (!success) {
      return `余额不足！购买【${product.zh}】需要 ¥${product.price}，而你只有 ¥${player.personalFund}。`;
    }

    // 3. 添加到背包
    player.inventory[productName] = currentCount + 1;
    db.save();

    let msg = `成功购买【${product.zh}】，花费 ¥${product.price}！`;

    // 4. 尝试自动就职
    const professionsThatUseThisItem = professions.filter(p => p.means.includes(productName));
    if (professionsThatUseThisItem.length > 0) {
      msg += `\n检测到你可能想就职，正在尝试...`;
      // 尝试就职每一个可能用到该物品的职业
      for (const prof of professionsThatUseThisItem) {
        const hireMsg = JobService.hire(uid, prof.name);
        if (hireMsg.includes('成功就职')) {
          msg += `\n${hireMsg}`;
          break;
        }
      }
    }

    return msg;
  }
}
