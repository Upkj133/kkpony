// js/renderer.js
class PonyRenderer {
    static getGradientDefs() {
        return `
        <defs>
            <linearGradient id="galaxyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#0B0B2A;stop-opacity:1" /><stop offset="50%" style="stop-color:#4B0082;stop-opacity:1" /><stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="lavaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#FF4500;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF8C00;stop-opacity:1" /><stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:red;stop-opacity:1" /><stop offset="33%" style="stop-color:yellow;stop-opacity:1" /><stop offset="66%" style="stop-color:blue;stop-opacity:1" /><stop offset="100%" style="stop-color:violet;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="sunBurstGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFFACD;stop-opacity:1" /><stop offset="50%" style="stop-color:#FFD700;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="jadeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#98FF98;stop-opacity:1" /><stop offset="100%" style="stop-color:#00A86B;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#E6E6FA;stop-opacity:0.8" /><stop offset="100%" style="stop-color:#F8F8FF;stop-opacity:0.4" />
            </linearGradient>
            
            <!-- V5 MYTHIC GRADIENTS -->
            <linearGradient id="abyssGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#110022;stop-opacity:1" /><stop offset="50%" style="stop-color:#000000;stop-opacity:1" /><stop offset="100%" style="stop-color:#003300;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="novaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00FFFF;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF00FF;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="chronoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFD700;stop-opacity:1" />
            </linearGradient>

            <!-- TRANSCENDENT PURE FUSION GRADIENTS -->
            <linearGradient id="pureLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" /><stop offset="100%" style="stop-color:#F0F8FF;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="pureDarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#050505;stop-opacity:1" /><stop offset="100%" style="stop-color:#161616;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="pureGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" /><stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="pureCrimsonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#FF0000;stop-opacity:1" /><stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="purePrismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00FFFF;stop-opacity:1" /><stop offset="50%" style="stop-color:#FF00FF;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFFF00;stop-opacity:1" />
            </linearGradient>
            
            <filter id="mythicGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        `;
    }

    static renderPonySVG(dna) {
        if(!dna) return '<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ccc" /></svg>';
        
        // Ensure values exist to prevent breaking on older saves
        const safeWings = dna.wings || 'none';
        const safeHorn = dna.horn || 'none';
        
        let colorFill = dna.color;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">`;
        svg += this.getGradientDefs();
        
        let isMythicGlobal = (dna.mythicCount && dna.mythicCount > 0);
        
        // Wings (behind body)
        if(safeWings !== 'none') {
            let wingColor = '#FFF';
            let wingClass = "pony-wing-anim";
            let opacity = 1.0;
            if(safeWings === 'pegasus_feather') wingColor = '#F0F8FF';
            if(safeWings === 'dragon_bone' || safeWings === 'mechWings') wingColor = '#8B0000';
            if(safeWings === 'fairy_dust') wingColor = 'url(#rainbowGradient)';
            if(safeWings === 'butterfly') wingColor = 'url(#novaGradient)';
            if(safeWings === 'angelic' || safeWings === 'seraph_six_wings') wingColor = 'url(#sunBurstGradient)';
            if(safeWings === 'abyss_void_wings') { wingColor = 'url(#abyssGradient)'; opacity = 0.8; }
            if(safeWings === 'galactic_nebula') { wingColor = 'url(#galaxyGradient)'; opacity = 0.9; }

            if(dna.isTranscendent) { wingColor = dna.transColor; opacity = 1.0; }

            svg += `<g class="${wingClass}">`;
            svg += `<path d="M 80 80 Q 50 20 120 30 Q 110 70 80 80 Z" fill="${wingColor}" stroke="#333" stroke-width="2" opacity="${opacity}"/>`;
            svg += `<path d="M 85 85 Q 60 30 130 40 Q 115 80 85 85 Z" fill="${wingColor}" stroke="#333" stroke-width="2" opacity="${opacity-0.2}"/>`;
            if(safeWings === 'seraph_six_wings') {
                svg += `<path d="M 75 75 Q 40 10 110 20 Q 100 60 75 75 Z" fill="${wingColor}" stroke="#FFD700" stroke-width="2"/>`;
            }
            svg += `</g>`;
        }
        
        // Body
        let bodyFilter = isMythicGlobal ? `filter="url(#mythicGlow)"` : '';
        svg += `<g class="pony-body-anim" ${bodyFilter}>`;
        svg += `<path d="M 60 150 L 60 100 Q 70 70 120 70 L 140 100 L 140 150 L 120 150 L 120 120 L 80 120 L 80 150 Z" fill="${colorFill}" stroke="#333" stroke-width="3"/>`;
        svg += `<path d="M 120 70 L 140 30 Q 160 30 160 50 L 140 70 Z" fill="${colorFill}" stroke="#333" stroke-width="3"/>`;
        svg += `<circle cx="150" cy="45" r="5" fill="#333"/>`; 
        
        // Hair
        let maneColor = dna.hair; // Can just default it if plain colors were used
        let maneClass = "";
        if(dna.hair === 'fire' || dna.hair === 'underworldFlames') {
            maneColor = dna.hair === 'fire' ? 'url(#lavaGradient)' : 'url(#abyssGradient)';
            maneClass="pony-horn-anim"; 
        } 
        else if (dna.hair === 'rainbowFlow' || dna.hair === 'timeRift') maneColor = dna.hair === 'timeRift' ? 'url(#chronoGradient)' : 'url(#rainbowGradient)';
        else if (dna.hair === 'frostSpikes' || dna.hair === 'crystalLocks') maneColor = '#00FFFF';
        else if (dna.hair === 'voidMatter') maneColor = '#000';
        else if (dna.hair === 'mohawk' || dna.hair === 'dreadlocks' || dna.hair === 'braids') maneColor = '#8B4513';
        else maneColor = '#D2B48C';
        
        if(dna.isTranscendent) maneColor = dna.transColor;

        svg += `<path class="${maneClass}" d="M 120 70 Q 110 40 140 20 Q 130 50 120 70 Z" fill="${maneColor}"/>`;
        
        // Eyes
        let eyeColor = '#FFF';
        if(dna.eyes === 'glow') eyeColor = '#00FF00';
        if(dna.eyes === 'void' || dna.eyes === 'demonEye') eyeColor = dna.eyes === 'void' ? '#000000' : '#8B0000';
        if(dna.eyes === 'heterochromia') eyeColor = '#FF00FF';
        if(dna.eyes === 'ruby') eyeColor = '#DC143C';
        if(dna.eyes === 'blackGold') eyeColor = '#FFD700';

        if(dna.isTranscendent) eyeColor = dna.transColor;

        svg += `<circle cx="150" cy="45" r="3" fill="${eyeColor}"/>`;
        if(dna.eyes === 'blackGold') svg += `<circle cx="150" cy="45" r="1.5" fill="#000"/>`;
        
        // Markings
        if(dna.markings !== 'none') {
            let markColor = 'rgba(255,255,255,0.5)';
            if(dna.markings === 'flames' || dna.markings === 'runes' || dna.markings === 'glowingRunes') markColor = '#FFD700';
            if(dna.markings === 'astralAura' || dna.markings === 'abyssalSigil') markColor = '#FF00FF';

            if(dna.isTranscendent) markColor = dna.transColor;

            let mClass = (dna.markings.includes('glow') || dna.markings === 'astralAura' || dna.isTranscendent) ? 'pony-horn-anim' : '';
            svg += `<circle class="${mClass}" cx="100" cy="90" r="10" fill="${markColor}"/>`;
            if(dna.markings === 'dragonScale') svg += `<circle cx="110" cy="85" r="5" fill="#444"/>`;
        }

        // Horn
        if(safeHorn !== 'none') {
            let hornColor = '#FFF';
            let strokeStyle = `stroke="#333" stroke-width="1"`;
            if(safeHorn === 'dark_blade' || safeHorn === 'voidBlade') { hornColor = '#444'; strokeStyle = `stroke="#ff0000" stroke-width="2"`; }
            if(safeHorn === 'crystal') { hornColor = '#00FFFF'; strokeStyle = `stroke="#fff" stroke-width="2"`; }
            if(safeHorn === 'unicorn_spiral' || safeHorn === 'crownOfThorns') { hornColor = 'url(#rainbowGradient)'; strokeStyle = `stroke="#fff" stroke-width="1"`; }
            if(safeHorn === 'eyeOfGod') { hornColor = 'url(#novaGradient)'; strokeStyle = `stroke="#FFD700" stroke-width="3"`; }
            
            if(dna.isTranscendent) { hornColor = dna.transColor; strokeStyle = `stroke="#fff" stroke-width="1"`; }

            svg += `<g class="pony-horn-anim">`;
            svg += `<polygon points="145,35 155,35 150,5" fill="${hornColor}" ${strokeStyle}/>`;
            svg += `</g>`;
        }
        
        svg += `</g>`; // body
        svg += `</svg>`;
        return svg;
    }

    static renderEggSVG() {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
            <defs>
                <radialGradient id="eggShine" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stop-color="#fff" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#FFE4B5" stop-opacity="1"/>
                </radialGradient>
            </defs>
            <g class="pony-body-anim">
                <ellipse cx="100" cy="120" rx="40" ry="60" fill="url(#eggShine)" stroke="#FFA07A" stroke-width="4"/>
                <path d="M 60 120 Q 100 80 140 120" fill="none" stroke="#FF7F50" stroke-width="4" stroke-dasharray="10 5"/>
            </g>
        </svg>
        `;
    }
}
