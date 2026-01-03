// Mighty Protectors PR/Charges Auto-Deduct API v1.0
// Companion script for MP character sheet v38.28+
// Intercepts mpattack template rolls and auto-deducts PR from Power and decrements Charges

var MPCosts = MPCosts || (function() {
    'use strict';
    
    const VERSION = '1.0';
    const TEMPLATE_NAME = 'mpattack';
    
    // Parse charges string "4/6" into {current, max}
    const parseCharges = (str) => {
        if (!str || str.trim() === '') return null;
        const match = str.trim().match(/^(\d+)(?:\/(\d+))?$/);
        if (!match) return null;
        const current = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : current;
        return { current, max };
    };
    
    // Format charges for display
    const formatCharges = (current, max) => `${current}/${max}`;
    
    // Get attribute value, creating if needed
    const getAttrValue = (charId, attrName, defaultVal = '') => {
        const attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: attrName
        })[0];
        return attr ? attr.get('current') : defaultVal;
    };
    
    // Set attribute value, creating if needed
    const setAttrValue = (charId, attrName, value) => {
        let attr = findObjs({
            type: 'attribute',
            characterid: charId,
            name: attrName
        })[0];
        
        if (attr) {
            attr.set('current', value);
        } else {
            createObj('attribute', {
                characterid: charId,
                name: attrName,
                current: value
            });
        }
    };
    
    // Find repeating row attribute (case-insensitive search for row ID)
    const getRepeatingAttr = (charId, rowId, fieldName) => {
        // Try exact match first
        let attrName = `repeating_attacks_${rowId}_${fieldName}`;
        let value = getAttrValue(charId, attrName, null);
        if (value !== null) return value;
        
        // Search all repeating_attacks for matching row
        const attrs = findObjs({
            type: 'attribute',
            characterid: charId
        }).filter(a => a.get('name').toLowerCase().includes(rowId.toLowerCase()) && 
                       a.get('name').includes(fieldName));
        
        if (attrs.length > 0) {
            return attrs[0].get('current');
        }
        return '';
    };
    
    // Set repeating row attribute
    const setRepeatingAttr = (charId, rowId, fieldName, value) => {
        const attrName = `repeating_attacks_${rowId}_${fieldName}`;
        setAttrValue(charId, attrName, value);
    };
    
    // Parse roll template from message content
    const parseTemplate = (content) => {
        const result = {};
        
        // Check for template type
        const templateMatch = content.match(/&{template:(\w+)}/);
        if (!templateMatch) return null;
        result._template = templateMatch[1];
        
        // Extract all {{key=value}} pairs
        const regex = /\{\{(\w+)=([^}]*)\}\}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            result[match[1]] = match[2];
        }
        
        return result;
    };
    
    // Handle chat message
    const handleChat = (msg) => {
        if (msg.type !== 'general' && msg.type !== 'rollresult') return;
        if (!msg.content.includes(`&{template:${TEMPLATE_NAME}}`)) return;
        
        const parsed = parseTemplate(msg.content);
        if (!parsed || parsed._template !== TEMPLATE_NAME) return;
        
        // Need character ID and row ID
        const charId = parsed.atk;
        const rowId = parsed.row;
        
        if (!charId || !rowId) {
            // Missing required data, skip silently
            return;
        }
        
        // Verify character exists
        const character = getObj('character', charId);
        if (!character) return;
        
        const charName = character.get('name');
        const attackName = parsed.name ? parsed.name.replace(`${charName} - `, '') : 'Attack';
        
        // Get PR and charges from template (passed from roll) or from sheet
        let prCost = parseInt(parsed.pr, 10) || 0;
        let chargesStr = parsed.charges || '';
        
        // If not in template, fetch from sheet
        if (!parsed.pr) {
            prCost = parseInt(getRepeatingAttr(charId, rowId, 'attack_pr'), 10) || 0;
        }
        if (!parsed.charges) {
            chargesStr = getRepeatingAttr(charId, rowId, 'attack_charges') || '';
        }
        
        const charges = parseCharges(chargesStr);
        
        // Skip if no costs
        if (prCost <= 0 && charges === null) return;
        
        let messages = [];
        let warnings = [];
        
        // Deduct PR
        if (prCost > 0) {
            const currentPower = parseInt(getAttrValue(charId, 'power_score', '0'), 10);
            const newPower = currentPower - prCost;
            setAttrValue(charId, 'power_score', newPower.toString());
            
            messages.push(`PR: -${prCost} (${currentPower}→${newPower})`);
            
            if (newPower < 0) {
                warnings.push(`⚠ Power is now ${newPower}!`);
            }
        }
        
        // Deduct charge
        if (charges !== null) {
            const newCurrent = charges.current - 1;
            const newChargesStr = formatCharges(newCurrent, charges.max);
            setRepeatingAttr(charId, rowId, 'attack_charges', newChargesStr);
            
            messages.push(`Charges: ${newChargesStr}`);
            
            if (newCurrent <= 0) {
                warnings.push(`⚠ Out of charges!`);
            }
        }
        
        // Send confirmation whisper to player
        if (messages.length > 0 || warnings.length > 0) {
            let output = `/w "${msg.who.replace(' (GM)', '')}" `;
            output += `<div style="background:#2b2b3d; border:1px solid #50fa7b; border-radius:4px; padding:4px 8px; font-size:11px; color:#eaeaea;">`;
            output += `<b style="color:#50fa7b;">${attackName}</b><br>`;
            output += messages.join(' · ');
            
            if (warnings.length > 0) {
                output += `<br><span style="color:#ff6b6b;">${warnings.join('<br>')}</span>`;
            }
            
            output += `</div>`;
            
            sendChat('MP', output, null, {noarchive: true});
        }
    };
    
    // Register event handlers
    const registerEventHandlers = () => {
        on('chat:message', handleChat);
    };
    
    // Initialize
    on('ready', () => {
        registerEventHandlers();
        log(`MPCosts v${VERSION} loaded - PR/Charges auto-deduction active`);
    });
    
    return {
        version: VERSION
    };
    
})();