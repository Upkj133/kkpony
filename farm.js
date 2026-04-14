// js/farm.js
class FarmManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback;
        if(!this.gameState.farm) {
            this.gameState.farm = {
                plots: [
                    { unlocked: true,  state: 'empty', plantedAt: 0, growMs: 0 },
                    { unlocked: true,  state: 'empty', plantedAt: 0, growMs: 0 },
                    { unlocked: false, state: 'locked', costToUnlock: 500 },
                    { unlocked: false, state: 'locked', costToUnlock: 2000 }
                ]
            };
        }
    }

    plantSeed(plotIndex) {
        const plot = this.gameState.farm.plots[plotIndex];
        const seedCost = 50; 
        const growTimeHours = 1; // 1 hour to mature
        
        if(plot && plot.unlocked && plot.state === 'empty') {
            if(this.gameState.coins >= seedCost) {
                this.gameState.coins -= seedCost;
                plot.state = 'growing';
                plot.plantedAt = Date.now();
                plot.growMs = growTimeHours * 3600 * 1000;
                SaveManager.save(this.gameState);
                if(this.uiCallback) this.uiCallback();
                return { success: true };
            }
            return { success: false, reason: "金币不足以购买种子 (50金币)" };
        }
        return { success: false, reason: "地块不可用" };
    }

    harvest(plotIndex) {
        const plot = this.gameState.farm.plots[plotIndex];
        if(plot && plot.unlocked && plot.state === 'growing') {
            const now = Date.now();
            if(now >= plot.plantedAt + plot.growMs) {
                plot.state = 'empty';
                const yieldAmt = 5 + Math.floor(Math.random() * 5); // 5 to 9 carrots
                this.gameState.carrots += yieldAmt;
                SaveManager.save(this.gameState);
                if(this.uiCallback) this.uiCallback();
                return { success: true, yield: yieldAmt };
            } else {
                return { success: false, reason: "庄稼宝宝还没成熟呢！" };
            }
        }
        return { success: false, reason: "错误的地块" };
    }

    unlockPlot(plotIndex) {
        const plot = this.gameState.farm.plots[plotIndex];
        if(plot && !plot.unlocked) {
            if(this.gameState.coins >= plot.costToUnlock) {
                this.gameState.coins -= plot.costToUnlock;
                plot.unlocked = true;
                plot.state = 'empty';
                SaveManager.save(this.gameState);
                if(this.uiCallback) this.uiCallback();
                return { success: true };
            }
            return { success: false, reason: "金币不足" };
        }
    }

    getPlotStatus(plotIndex) {
        const plot = this.gameState.farm.plots[plotIndex];
        if(!plot.unlocked) return { status: 'locked', plot };
        if(plot.state === 'empty') return { status: 'empty', plot };
        
        const now = Date.now();
        const elapsed = now - plot.plantedAt;
        if(elapsed >= plot.growMs) return { status: 'ready', plot };
        return { status: 'growing', remainingMs: plot.growMs - elapsed, plot };
    }
}
