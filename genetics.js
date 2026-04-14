// js/genetics.js
const RARITY = { NORMAL: 'Normal', RARE: 'Rare', EPIC: 'Epic', MYTHIC: 'Mythic' };

const DNA_POOL = {
    color: {
        [RARITY.NORMAL]: ['#FFFFFF', '#333333', '#8B4513', '#D2B48C', '#A9A9A9', '#F5DEB3'],
        [RARITY.RARE]: ['#87CEEB', '#FFB6C1', '#98FB98', '#DDA0DD', '#F0E68C', '#20B2AA'],
        [RARITY.EPIC]: ['url(#galaxyGradient)', 'url(#lavaGradient)', 'url(#rainbowGradient)', '#000000', 'url(#jadeGradient)', 'url(#ghostGradient)', 'url(#sunBurstGradient)'],
        [RARITY.MYTHIC]: ['url(#abyssGradient)', 'url(#novaGradient)', 'url(#chronoGradient)', '#111']
    },
    hair: {
        [RARITY.NORMAL]: ['smooth', 'curly', 'short', 'messy'],
        [RARITY.RARE]: ['mohawk', 'dreadlocks', 'braids', 'wavy'],
        [RARITY.EPIC]: ['fire', 'frostSpikes', 'rainbowFlow', 'starDust', 'featherMane', 'crystalLocks'],
        [RARITY.MYTHIC]: ['underworldFlames', 'timeRift', 'voidMatter']
    },
    eyes: {
        [RARITY.NORMAL]: ['smile', 'blank', 'calm', 'sleepy'],
        [RARITY.RARE]: ['teary', 'angry', 'cute', 'focused'],
        [RARITY.EPIC]: ['glow', 'heterochromia', 'void', 'ruby', 'emerald'],
        [RARITY.MYTHIC]: ['blackGold', 'demonEye', 'ethereal']
    },
    markings: {
        [RARITY.NORMAL]: ['none', 'none'],
        [RARITY.RARE]: ['heart', 'lightning', 'stars', 'zebra', 'tigerStripes', 'spots'],
        [RARITY.EPIC]: ['runes', 'skull', 'wings', 'flames', 'glowingRunes', 'celticKnot'],
        [RARITY.MYTHIC]: ['abyssalSigil', 'astralAura', 'dragonScale']
    },
    special: {
        wings: {
            normal: ['none', 'pegasus_feather'],
            rare: ['dragon_bone', 'fairy_dust'],
            epic: ['angelic', 'butterfly', 'mechWings'],
            mythic: ['seraph_six_wings', 'abyss_void_wings', 'galactic_nebula']
        },
        horn: {
            normal: ['none'],
            rare: ['unicorn_spiral'],
            epic: ['crystal', 'dark_blade', 'twisted_root', 'halo'],
            mythic: ['crownOfThorns', 'voidBlade', 'eyeOfGod']
        }
    }
};

class GeneticsManager {
    static calculateMutationRate(incubationHours, generation = 1) {
        const hours = Math.max(3, Math.min(12, incubationHours));
        const genLog = Math.max(0, Math.min(3, Math.log10(generation) * 1.8)); 
        
        let baseMythicRate = 0.001 + (genLog * 0.015); // Gen 1: 0.1%, Gen 20+: ~3% base
        let baseEpicRate = 0.02 + (genLog * 0.05);
        let baseRareRate = 0.12 + (genLog * 0.08);

        const bonusHours = hours - 3;
        const multiplier = Math.pow(bonusHours / 9, 2); 
        
        const currentMythicRate = baseMythicRate + (multiplier * 0.05); // cap +5%
        const currentEpicRate = baseEpicRate + (multiplier * 0.20); 
        const currentRareRate = baseRareRate + (multiplier * 0.30); 
        
        return { mythic: currentMythicRate, epic: currentEpicRate, rare: currentRareRate };
    }

    static rollRarity(rates) {
        const roll = Math.random();
        if (roll <= rates.mythic) return RARITY.MYTHIC;
        if (roll <= rates.mythic + rates.epic) return RARITY.EPIC;
        if (roll <= rates.mythic + rates.epic + rates.rare) return RARITY.RARE;
        return RARITY.NORMAL;
    }

    static getRandomTrait(pool, rarity) {
        const array = pool[rarity];
        return array[Math.floor(Math.random() * array.length)];
    }

    static generatePonyTraits(incubationHours, generation, sireDNA, damDNA) {
        const rates = this.calculateMutationRate(incubationHours, generation);
        
        let ponyDNA = {
            color: null, hair: null, eyes: null, markings: null, wings: 'none', horn: 'none', epicCount: 0, mythicCount: 0
        };

        const ATTR = ['color', 'hair', 'eyes', 'markings'];
        
        for(let key of ATTR) {
            const hasParents = sireDNA != null && damDNA != null;
            const inherits = hasParents && (Math.random() < 0.6); 
            
            if(inherits) {
                ponyDNA[key] = Math.random() < 0.5 ? sireDNA[key] : damDNA[key];
            } else {
                ponyDNA[key] = this.getRandomTrait(DNA_POOL[key], this.rollRarity(rates));
            }
            if(DNA_POOL[key][RARITY.EPIC].includes(ponyDNA[key])) ponyDNA.epicCount++;
            if(DNA_POOL[key][RARITY.MYTHIC].includes(ponyDNA[key])) ponyDNA.mythicCount++;
        }

        let inheritedWings = (sireDNA && sireDNA.wings !== 'none') || (damDNA && damDNA.wings !== 'none');
        let inheritedHorn = (sireDNA && sireDNA.horn !== 'none') || (damDNA && damDNA.horn !== 'none');

        // Wings resolve
        if(inheritedWings && Math.random() < 0.4) {
            ponyDNA.wings = (sireDNA && sireDNA.wings !== 'none') ? sireDNA.wings : damDNA.wings;
        } else {
            const r = Math.random();
            if(r < rates.mythic || ponyDNA.mythicCount > 0) {
                ponyDNA.wings = DNA_POOL.special.wings.mythic[Math.floor(Math.random() * DNA_POOL.special.wings.mythic.length)];
            } else if (r < rates.epic + rates.mythic || ponyDNA.epicCount > 1) {
                ponyDNA.wings = DNA_POOL.special.wings.epic[Math.floor(Math.random() * DNA_POOL.special.wings.epic.length)];
            } else if (r < rates.epic + rates.mythic + rates.rare) {
                 ponyDNA.wings = DNA_POOL.special.wings.rare[Math.floor(Math.random() * DNA_POOL.special.wings.rare.length)];
            }
            // else none, or inherit from default pool layout logic
        }

        // Horn resolve
        if(inheritedHorn && Math.random() < 0.5) {
            ponyDNA.horn = (sireDNA && sireDNA.horn !== 'none') ? sireDNA.horn : damDNA.horn;
        } else {
             const r = Math.random();
             if(r < rates.mythic || ponyDNA.mythicCount > 0) {
                 ponyDNA.horn = DNA_POOL.special.horn.mythic[Math.floor(Math.random() * DNA_POOL.special.horn.mythic.length)];
             } else if (r < rates.epic + rates.mythic || ponyDNA.epicCount > 0) {
                 ponyDNA.horn = DNA_POOL.special.horn.epic[Math.floor(Math.random() * DNA_POOL.special.horn.epic.length)];
             } else if (r < rates.epic + rates.mythic + rates.rare) {
                 ponyDNA.horn = DNA_POOL.special.horn.rare[Math.floor(Math.random() * DNA_POOL.special.horn.rare.length)];
             }
        }

        // Force Wings and Horn if none logic chose None, giving them higher base chance for cool geometry
        if(!inheritedWings && ponyDNA.wings === 'none' && Math.random() < 0.2) ponyDNA.wings = 'pegasus_feather';
        if(!inheritedHorn && ponyDNA.horn === 'none' && Math.random() < 0.2) ponyDNA.horn = 'unicorn_spiral';

        // 👑 Transcendent Check (The ultimate monochrome fusion)
        // 0.5% base chance + scales heavily with mythic rate.
        if (Math.random() < 0.005 + (rates.mythic * 0.1) || (sireDNA && sireDNA.isTranscendent && damDNA && damDNA.isTranscendent && Math.random() < 0.5)) {
            ponyDNA.isTranscendent = true;
            const tColors = ['url(#pureLightGradient)', 'url(#pureDarkGradient)', 'url(#pureGoldGradient)', 'url(#pureCrimsonGradient)', 'url(#purePrismGradient)'];
            ponyDNA.transColor = tColors[Math.floor(Math.random() * tColors.length)];
            ponyDNA.mythicCount = 8; // Force massive stats multiplier
            ponyDNA.epicCount = 8;
            
            // Re-roll to ultimate parts explicitly to ensure they look absolutely insane
            ponyDNA.wings = ['seraph_six_wings', 'galactic_nebula', 'angelic'][Math.floor(Math.random() * 3)];
            ponyDNA.horn = ['crownOfThorns', 'eyeOfGod', 'crystal'][Math.floor(Math.random() * 3)];
            ponyDNA.color = ponyDNA.transColor;
            ponyDNA.hair = ponyDNA.transColor;
            ponyDNA.eyes = 'glow';
            ponyDNA.markings = 'glowingRunes';
        }

        return ponyDNA;
    }
}
