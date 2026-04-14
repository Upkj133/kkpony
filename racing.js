// js/racing.js
class RacingManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback;
    }

    racePony(ponyId, trackId) {
        const pony = this.gameState.ponies.find(p => p.id === ponyId);
        if(!pony || pony.state !== PONY_STATES.ADULT) return { success: false, reason: '只有状态完好的实战期赛马可以出战' };

        // 赛道配置表 (全新 RPG 属性检测机制)
        const TRACKS = {
            'plains': { cost: 30, reqScore: 60, baseReward: 100, envBuff: null }, 
            'volcano': { cost: 50, reqScore: 160, baseReward: 400, envBuff: p => p.dna.hair === 'fire' || p.dna.epicCount > 0 },
            'sky': { cost: 80, reqScore: 350, baseReward: 1200, envBuff: p => p.dna.wings !== 'none' }
        };

        const trackInfo = TRACKS[trackId];
        if(!trackInfo) return { success: false, reason: '无效的赛道' };

        if(pony.stamina < trackInfo.cost) {
            return { success: false, reason: `体力不足！需 ${trackInfo.cost} 点体力 (Current: ${pony.stamina})` };
        }
        pony.stamina -= trackInfo.cost;

        // 计算基础火力值 (速度+身躯强韧+羁绊)
        let ponyScore = (pony.stats?.speed || 10) + (pony.stats?.endurance || 10) + (pony.stats?.spirit || 10);
        
        // 场地专武加成
        if(trackInfo.envBuff && trackInfo.envBuff(pony)) {
            ponyScore = Math.floor(ponyScore * 1.5); 
        } else if (trackId !== 'plains') {
            ponyScore = Math.floor(ponyScore * 0.8); // 跨界惩罚
        }

        // 胜负判决
        let isWin = false;
        let diffRatio = ponyScore / trackInfo.reqScore;

        if(diffRatio >= 1.0) {
            isWin = true; // 属性碾压，必定胜利
        } else if (diffRatio >= 0.7) {
            isWin = Math.random() < ((diffRatio - 0.7) / 0.3) * 0.5; // 极限反杀区间 (0-50%胜率)
        } // 小于 0.7 直接败北

        let coinsWon = 0;
        if(isWin) {
             // Roll profit
            coinsWon = trackInfo.baseReward + Math.floor(Math.random() * (trackInfo.baseReward * 0.5));
            this.gameState.stats.racesWon++;
            
            // Item drops chance
            const dropChance = trackId === 'plains' ? 0.3 : (trackId === 'volcano' ? 0.6 : 0.9);
            if(Math.random() < dropChance) {
                this.gameState.carrots += (trackId === 'sky' ? 3 : 1);
            }
        }
        
        this.gameState.coins += coinsWon;
        SaveManager.save(this.gameState);
        if(this.uiCallback) this.uiCallback();
        
        return { success: true, isWin, coinsWon, trackId, ponyScore, reqScore: trackInfo.reqScore };
    }
}
