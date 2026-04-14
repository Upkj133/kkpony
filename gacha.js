// js/gacha.js
class GachaManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback;
    }

    roll() {
        if(this.gameState.tokens < 1) return { success: false, reason: "祈愿代币(Tokens)不足！" };
        
        this.gameState.tokens -= 1;
        if(this.gameState.stats.totalGacha === undefined) this.gameState.stats.totalGacha = 0;
        this.gameState.stats.totalGacha++;
        
        const r = Math.random();
        let rewardType = ''; // 'mythic_egg', 'epic_adult', 'coins', 'carrots'
        let payload = null;
        let message = '';
        
        if(r < 0.05) {
            // 5% Mythic Egg
            rewardType = 'mythic_egg';
            const egg = new Pony(null, "神话祈愿蛋", 12, null, null, null, 10);
            egg.dna = GeneticsManager.generatePonyTraits(12, 10, null, null);
            // hard force mythic
            egg.dna.wings = DNA_POOL.special.wings.mythic[Math.floor(Math.random() * DNA_POOL.special.wings.mythic.length)];
            egg.dna.horn = DNA_POOL.special.horn.mythic[Math.floor(Math.random() * DNA_POOL.special.horn.mythic.length)];
            egg.dna.mythicCount = 2;
            egg.generateStatsBounds();
            this.gameState.ponies.push(egg);
            payload = egg;
            message = "✨ 奇迹降临！获得极品 Gen 10 神话彩蛋！";
        } else if (r < 0.20) {
            // 15% Epic Adult
            rewardType = 'epic_adult';
            const pony = new Pony(null, "天降救兵", 8, null, null, null, 5);
            pony.dna = GeneticsManager.generatePonyTraits(8, 5, null, null);
            pony.generateStatsBounds();
            pony.advanceTime(20 * 3600 * 1000); 
            this.gameState.ponies.push(pony);
            payload = pony;
            message = "🌟 强援抵达！获得 Gen 5 的实战期成年赛马！";
        } else if (r < 0.60) {
            // 40% Coins
            rewardType = 'coins';
            const amt = Math.floor(3000 + Math.random() * 5000);
            this.gameState.coins += amt;
            payload = amt;
            message = `💰 获得资金赞助：${amt} 金币！`;
        } else {
            // 40% Carrots
            rewardType = 'carrots';
            const amt = Math.floor(10 + Math.random() * 20);
            this.gameState.carrots += amt;
            payload = amt;
            message = `🥕 获得物资补给：${amt} 根顶级胡萝卜！`;
        }
        
        SaveManager.save(this.gameState);
        if(this.uiCallback) this.uiCallback();
        return { success: true, rewardType, payload, message };
    }
}
