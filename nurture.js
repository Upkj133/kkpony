// js/nurture.js
class NurtureManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback; 
    }

    startBreeding(sireId, damId, hours) {
        const sire = this.gameState.ponies.find(p => p.id === sireId && p.state === PONY_STATES.ADULT && p.gender === 'male');
        const dam = this.gameState.ponies.find(p => p.id === damId && p.state === PONY_STATES.ADULT && p.gender === 'female');
        
        if(!sire || !dam) return { success: false, reason: "无效的父母选择！必须是一公一母成年马。" };
        if(sire.stamina < 50 || dam.stamina < 50) return { success: false, reason: "双亲体力不足50点！" };

        sire.stamina -= 50;
        dam.stamina -= 50;

        const clampedHours = Math.max(3, Math.min(12, hours));
        
        // V4: Generation logic (Max of parents + 1)
        const offspringGen = Math.max(sire.generation || 1, dam.generation || 1) + 1;
        
        const newPony = new Pony(null, "神秘马蛋", clampedHours, null, sireId, damId, offspringGen);
        
        newPony.dna = GeneticsManager.generatePonyTraits(clampedHours, offspringGen, sire.dna, dam.dna);
        newPony.generateStatsBounds(); // Setup absolute stat blocks based on gen and rarity!

        this.gameState.ponies.push(newPony);
        this.gameState.stats.totalBred++;
        
        SaveManager.save(this.gameState);
        if(this.uiCallback) this.uiCallback();
        return { success: true, pony: newPony };
    }

    speedUpBreeding(ponyId) {
        const pony = this.gameState.ponies.find(p => p.id === ponyId);
        if(pony && pony.state === PONY_STATES.INCUBATING) {
            const remainingHours = Math.max(0.1, (pony.incubationTotalMs - pony.incubationElapsedMs) / 3600000);
            const cost = Math.ceil(remainingHours * 120);
            
            if(this.gameState.coins >= cost) {
                this.gameState.coins -= cost;
                pony.speedUpIncubation(cost);
                SaveManager.save(this.gameState);
                if(this.uiCallback) this.uiCallback();
                return { success: true, pony: pony, cost: cost };
            } else {
                return { success: false, reason: '金币不足以加速繁殖' };
            }
        }
        return { success: false, reason: '目标不在繁育期' };
    }

    feedPony(ponyId) {
        const pony = this.gameState.ponies.find(p => p.id === ponyId);
        if(pony && (pony.state === PONY_STATES.FOAL || pony.state === PONY_STATES.ADULT)) {
            if(this.gameState.carrots >= 1) {
                if(pony.stamina < pony.maxStamina) {
                    this.gameState.carrots -= 1;
                    pony.feed('carrot');
                    SaveManager.save(this.gameState);
                    if(this.uiCallback) this.uiCallback();
                    return { success: true };
                } else {
                    return { success: false, reason: '该马匹体力充沛，无需投喂' };
                }
            } else {
                return { success: false, reason: '你的仓库中无胡萝卜存货，快去庄园种植吧' };
            }
        }
        return { success: false, reason: '无效目标或无法进食' };
    }
}
