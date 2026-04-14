// js/save.js
class SaveManager {
    static SAVE_KEY = 'antigravity_pony_save_v5';

    static getInitialState() {
        const adam = new Pony("pony_adam", "纯血公马-亚当", 3, "male", null, null, 1);
        adam.state = PONY_STATES.ADULT;
        adam.dna = { color: '#FFFFFF', hair: 'smooth', eyes: 'smile', markings: 'none', wings: 'none', horn: 'none', epicCount: 0, mythicCount: 0 };
        adam.statsMax = { speed: 80, endurance: 80, spirit: 80 };
        adam.stats = { speed: 40, endurance: 40, spirit: 40 };

        const eve = new Pony("pony_eve", "纯血母马-夏娃", 3, "female", null, null, 1);
        eve.state = PONY_STATES.ADULT;
        eve.dna = { color: '#8B4513', hair: 'short', eyes: 'calm', markings: 'none', wings: 'none', horn: 'none', epicCount: 0, mythicCount: 0 };
        eve.statsMax = { speed: 80, endurance: 80, spirit: 80 };
        eve.stats = { speed: 40, endurance: 40, spirit: 40 };

        const lucky = new Pony("pony_lucky", "起始之星-幸运儿", 3, "male", null, null, 1);
        lucky.state = PONY_STATES.FOAL; // Start as a foal
        lucky.dna = GeneticsManager.generatePonyTraits(4, 1, null, null);
        lucky.dna.epicCount = Math.max(lucky.dna.epicCount, 1); // Ensure at least one epic trait
        lucky.generateStatsBounds();

        return {
            lastSaveTime: Date.now(),
            coins: 2000, 
            carrots: 50,
            tokens: 10, 
            ponies: [adam, eve, lucky],
            stats: { totalBred: 0, racesWon: 0, totalGacha: 0 },
            farm: null,
            market: { lastRefreshMs: 0, stock: [] } 
        };
    }

    static load() {
        const raw = localStorage.getItem(SaveManager.SAVE_KEY);
        if(!raw) return SaveManager.getInitialState();
        
        try {
            const data = JSON.parse(raw);
            const now = Date.now();
            const offlineMs = now - (data.lastSaveTime || now);
            
            if(data.ponies) {
                data.ponies = data.ponies.map(p => {
                    const pony = Pony.fromJSON(p);
                    pony.advanceTime(offlineMs);
                    return pony;
                });
            }
            if(data.tokens === undefined) data.tokens = 10;
            if(!data.market) data.market = { lastRefreshMs: 0, stock: [] };
            else if(data.market.stock) {
                data.market.stock.forEach(item => {
                    item.pony = Pony.fromJSON(item.pony);
                });
            }
            
            data.lastSaveTime = now;
            return data;
        } catch(e) {
            console.error("Save data corrupted. Resetting.");
            return SaveManager.getInitialState();
        }
    }

    static save(gameState) {
        if(!gameState) return;
        gameState.lastSaveTime = Date.now();
        localStorage.setItem(SaveManager.SAVE_KEY, JSON.stringify({
            ...gameState,
            ponies: gameState.ponies.map(p => p.toJSON())
        }));
    }

    static exportSave() {
        const data = localStorage.getItem(SaveManager.SAVE_KEY);
        if (!data) return null;
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (e) {
            console.error("Export failed", e);
            return null;
        }
    }

    static importSave(b64String) {
        try {
            const jsonStr = decodeURIComponent(escape(atob(b64String)));
            const data = JSON.parse(jsonStr);
            if (data && data.ponies) {
                localStorage.setItem(SaveManager.SAVE_KEY, jsonStr);
                return true;
            }
        } catch (e) {
            console.error("Import failed", e);
        }
        return false;
    }

    static clear() { localStorage.removeItem(SaveManager.SAVE_KEY); }
}
