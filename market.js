// js/market.js
class MarketManager {
    constructor(gameState, uiCallback) {
        this.gameState = gameState;
        this.uiCallback = uiCallback;
        if(!this.gameState.market) this.gameState.market = { lastRefreshMs: 0, stock: [] };
        this.checkRestock();
    }

    checkRestock(force = false) {
        const now = Date.now();
        const REFRESH_MS = 8 * 3600 * 1000; 
        
        if (force || now - this.gameState.market.lastRefreshMs > REFRESH_MS) {
            this.gameState.market.lastRefreshMs = now;
            this.generateStock();
            SaveManager.save(this.gameState);
            if(this.uiCallback) this.uiCallback();
            return { success: true };
        }
        return { success: false, remainingMs: REFRESH_MS - (now - this.gameState.market.lastRefreshMs) };
    }

    generateStock() {
        this.gameState.market.stock = [];
        for(let i=0; i<5; i++) {
            // Generate random ponies
            // 80% Adult, 20% Foal
            const isAdult = Math.random() < 0.8;
            const gen = Math.floor(Math.random() * 5) + 1; // Gen 1 to 5 in market
            const p = new Pony(null, `黑市引援体-${Date.now().toString().slice(-4)}`, 3, null, null, null, gen);
            p.dna = GeneticsManager.generatePonyTraits(isAdult ? 8 : 4, gen, null, null); 
            p.generateStatsBounds();
            if(isAdult) {
                p.advanceTime(20 * 3600 * 1000); // Push to adult
            } else {
                 p.advanceTime(5 * 3600 * 1000); // push to foal
            }
            
            // Inflate price by 30% for buying
            const baseVal = this.evaluatePony(p);
            const cost = Math.floor(baseVal * 1.3);
            
            this.gameState.market.stock.push({ pony: p, cost: cost });
        }
    }

    buyPony(index) {
        const item = this.gameState.market.stock[index];
        if(item) {
            if(this.gameState.coins >= item.cost) {
                this.gameState.coins -= item.cost;
                // Add to stable
                const p = Pony.fromJSON(item.pony.toJSON()); // Deep clone bypass
                p.id = "bought_pony_" + Date.now();
                this.gameState.ponies.push(p);
                // Remove from stock
                this.gameState.market.stock.splice(index, 1);
                SaveManager.save(this.gameState);
                if(this.uiCallback) this.uiCallback();
                return { success: true, pony: p };
            }
            return { success: false, reason: "金币不足！" };
        }
        return { success: false, reason: "商品已售罄" };
    }

    evaluatePony(pony) {
        let value = 150 + (pony.generation * 100); 
        if(!pony.dna) return 50; 

        value += pony.dna.epicCount * 1200;
        value += (pony.dna.mythicCount || 0) * 8000;
        
        if(pony.dna.wings !== 'none') value += 4500;
        if(pony.dna.horn !== 'none') value += 4500;

        if(pony.state === PONY_STATES.RETIRED) value = Math.floor(value * 0.4); 
        else if (pony.state === PONY_STATES.FOAL) value = Math.floor(value * 0.8);

        return Math.min(50000, value);
    }

    sellPony(ponyId) {
        const idx = this.gameState.ponies.findIndex(p => p.id === ponyId);
        if(idx !== -1) {
            const pony = this.gameState.ponies[idx];
            const price = this.evaluatePony(pony);
            this.gameState.coins += price;
            this.gameState.ponies.splice(idx, 1);
            SaveManager.save(this.gameState);
            if(this.uiCallback) this.uiCallback();
            return { success: true, price: price };
        }
        return { success: false, reason: "交易行未找到此马" };
    }
}
