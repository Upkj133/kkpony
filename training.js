// js/training.js
class TrainingManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback;
    }
    
    // Train a certian stat: 'speed', 'endurance', 'spirit'
    trainStat(ponyId, statName) {
        const pony = this.gameState.ponies.find(p => p.id === ponyId);
        if(!pony || pony.state !== PONY_STATES.ADULT) return { success: false, reason: "只有身健力壮的实战期成年马可以承受特训压力！" };
        
        let currentVal = pony.stats[statName] || 10;
        let maxVal = pony.statsMax[statName] || 50;
        
        if(currentVal >= maxVal) return { success: false, reason: "该能力值已达到基因极限，无法通过训练突破天花板。" };
        
        // Base cost: 100g, scales quadratically up to 2500g at near caps for late game scaling
        const ratio = currentVal / maxVal;
        const cost = Math.floor(100 + (ratio * ratio * 2400)); 
        
        if(this.gameState.coins >= cost) {
            this.gameState.coins -= cost;
            // Provide 2 to 5 stat bump
            const gain = Math.floor(2 + Math.random() * 4);
            pony.stats[statName] += gain;
            
            if(pony.stats[statName] > maxVal) pony.stats[statName] = maxVal; // Cap enforce
            
            SaveManager.save(this.gameState);
            if(this.uiCallback) this.uiCallback();
            return { success: true, statName, newValue: pony.stats[statName], cost, gain };
        }
        return { success: false, reason: `金币不足！此项进阶特训经费需要 ${cost} 金币。` };
    }

    getTrainingCost(ponyId, statName) {
        const pony = this.gameState.ponies.find(p => p.id === ponyId);
        if(!pony || !pony.stats || !pony.statsMax) return 0;
        const currentVal = pony.stats[statName] || 10;
        const maxVal = pony.statsMax[statName] || 50;
        if(currentVal >= maxVal) return -1; // Maxed
        const ratio = currentVal / maxVal;
        return Math.floor(100 + (ratio * ratio * 2400));
    }
}
