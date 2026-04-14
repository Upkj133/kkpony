// js/pony.js
const PONY_STATES = {
    INCUBATING: 'incubating',
    FOAL: 'foal',
    ADULT: 'adult',
    RETIRED: 'retired'
};

class Pony {
    constructor(id, name, incubationHours, gender, sireId, damId, generation) {
        this.id = id || Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.name = name || "Unnamed Pony";
        this.gender = gender || (Math.random() < 0.5 ? 'male' : 'female'); 
        this.sireId = sireId || null;
        this.damId = damId || null;
        this.generation = generation || 1;
        
        // Timing
        this.incubationHours = incubationHours || 3;
        this.incubationTotalMs = this.incubationHours * 3600 * 1000;
        this.incubationElapsedMs = 0;
        
        this.state = PONY_STATES.INCUBATING;
        this.dna = null;
        
        this.growthTotalMs = (12 + Math.random() * 12) * 3600 * 1000; 
        this.growthElapsedMs = 0;
        
        this.adultTotalMs = 48 * 3600 * 1000;
        this.adultElapsedMs = 0;
        
        this.stamina = 100;
        this.maxStamina = 100;
        this.affection = 0;

        // RPG Stats framework
        this.stats = { speed: 10, endurance: 10, spirit: 10 };
        this.statsMax = { speed: 50, endurance: 50, spirit: 50 };
    }

    generateStatsBounds() {
        if(!this.dna) return;
        let capBase = 50 + (this.generation * 5); // Gen factor
        let multi = 1 + (this.dna.epicCount * 1.5); 
        if(this.dna.wings !== 'none') multi += 2;
        if(this.dna.horn !== 'none') multi += 2;

        const maxCap = Math.floor(capBase * multi);
        
        // Assign limits 
        this.statsMax = {
            speed: Math.floor(maxCap * (0.8 + Math.random() * 0.4)),
            endurance: Math.floor(maxCap * (0.8 + Math.random() * 0.4)),
            spirit: Math.floor(maxCap * (0.8 + Math.random() * 0.4))
        };

        // Assign initial growth logic internally
        this.stats = {
            speed: Math.floor(this.statsMax.speed * (0.1 + Math.random() * 0.2)),
            endurance: Math.floor(this.statsMax.endurance * (0.1 + Math.random() * 0.2)),
            spirit: Math.floor(this.statsMax.spirit * (0.1 + Math.random() * 0.2))
        };
    }

    advanceTime(ms) {
        if (this.state === PONY_STATES.INCUBATING) {
            this.incubationElapsedMs += ms;
            if (this.incubationElapsedMs >= this.incubationTotalMs) {
                this.state = PONY_STATES.FOAL;
                const carryOver = this.incubationElapsedMs - this.incubationTotalMs;
                this.incubationElapsedMs = this.incubationTotalMs;
                if (carryOver > 0) this.advanceTime(carryOver);
            }
        } else if (this.state === PONY_STATES.FOAL) {
            this.growthElapsedMs += ms;
            if (this.growthElapsedMs >= this.growthTotalMs) {
                this.state = PONY_STATES.ADULT;
                const carryOver = this.growthElapsedMs - this.growthTotalMs;
                this.growthElapsedMs = this.growthTotalMs;
                if(carryOver > 0) this.advanceTime(carryOver);
            }
        } else if (this.state === PONY_STATES.ADULT) {
            this.adultElapsedMs += ms;
            if(this.adultElapsedMs >= this.adultTotalMs) {
                this.state = PONY_STATES.RETIRED;
            }
        }
    }

    speedUpIncubation(coinsSpent) {
        const coinsPerHour = 120;
        const msPerCoin = (3600 * 1000) / coinsPerHour;
        this.advanceTime(coinsSpent * msPerCoin);
    }

    feed(foodType) {
        if(this.state === PONY_STATES.ADULT || this.state === PONY_STATES.FOAL) {
            if(foodType === 'carrot') {
                this.stamina = Math.min(this.maxStamina, this.stamina + 20);
                this.affection += 5;
            }
        }
    }

    rename(newName) {
        if(newName && newName.trim().length > 0) {
            this.name = newName.trim().substring(0, 15);
        }
    }

    toJSON() {
        return {
            id: this.id, name: this.name, gender: this.gender, sireId: this.sireId, damId: this.damId, generation: this.generation,
            incubationHours: this.incubationHours, incubationTotalMs: this.incubationTotalMs, incubationElapsedMs: this.incubationElapsedMs,
            growthTotalMs: this.growthTotalMs, growthElapsedMs: this.growthElapsedMs,
            adultTotalMs: this.adultTotalMs, adultElapsedMs: this.adultElapsedMs,
            state: this.state, dna: this.dna, stamina: this.stamina, maxStamina: this.maxStamina, affection: this.affection,
            stats: this.stats, statsMax: this.statsMax
        };
    }
    
    static fromJSON(data) {
        const pony = new Pony(data.id, data.name, data.incubationHours, data.gender, data.sireId, data.damId, data.generation);
        pony.incubationTotalMs = data.incubationTotalMs; pony.incubationElapsedMs = data.incubationElapsedMs;
        pony.growthTotalMs = data.growthTotalMs; pony.growthElapsedMs = data.growthElapsedMs;
        pony.adultTotalMs = data.adultTotalMs || (48 * 3600 * 1000); pony.adultElapsedMs = data.adultElapsedMs || 0;
        pony.state = data.state; pony.dna = data.dna; pony.stamina = data.stamina; pony.maxStamina = data.maxStamina; pony.affection = data.affection;
        pony.stats = data.stats || { speed: 10, endurance: 10, spirit: 10 };
        pony.statsMax = data.statsMax || { speed: 50, endurance: 50, spirit: 50 };
        return pony;
    }
}
