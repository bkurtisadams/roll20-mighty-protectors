/* Mighty Protectors - MP Engine v2.1 (Roll20 API)
 * Fixed version with accurate MP rules implementation
 * 
 * Works with sheet's mpattack rolltemplate:
 *  {{mpapi=1}} {{atk=<character_id>}} {{def=<target token_id>}} {{attackid=<rowid>}}
 *  {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[...]]}} {{damage=[[...]]}} {{type=...}}
 */
log("MP ENGINE v2.1 FILE STARTING");

var MP = MP || {};
MP.Engine = (function () {

  const CFG = {
    // Token bars (value only, max untouched)
    POWER_BAR: "bar1_value",
    HITS_BAR: "bar2_value",

    // Auto-roll damage display (toggle with !mp config autoroll on/off)
    AUTO_ROLL_DAMAGE: true,

    // Character sheet attribute names (FIXED)
    HITS_ATTR: "hits_score",
    POWER_ATTR: "power_score",
    HITS_MAX_ATTR: "hits_score_max",
    POWER_MAX_ATTR: "power_score_max",

    // Roll-under conventions
    CRIT_SUCCESS_NAT: 1,
    FUMBLE_FAIL_NAT: 20,

    // Protection columns in repeating_protection
    PROT_KEYS: ["kinetic", "energy", "entropy", "psychic", "bio", "other"],

    // Save attacks: protection adds to save target (easier to save)
    SAVE_PROT_ADDS: true,

    // Whisper results to GM
    GM_ONLY_BUTTONS: true,

    // Auto-cleanup old pending rolls (ms)
    PENDING_EXPIRE_MS: 3600000, // 1 hour

    // Snare stacking bonus per additional hit
    SNARE_STACK_BONUS: 2

    
  };

  // State
  state.MP_Engine = state.MP_Engine || {
    pending: {},
    snares: {},
    autoroll: true,
    enabled: true
  };

  // -------------------------
  // UTILITY FUNCTIONS
  // -------------------------  

  function ch(who, msg) {
    sendChat(who, msg, null, { noarchive: true });
  }

  function num(x, dflt) {
    if (x === "ALL" || x === "all") return Infinity;
    const n = parseFloat(x);
    return isFinite(n) ? n : (dflt || 0);
  }

  function esc(s) {
    return String(s || "").replace(/[<>"'&]/g, c => ({
      "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;"
    }[c]));
  }

  function parseTemplateFields(content) {
    const out = {};
    const re = /\{\{\s*([^=]+?)\s*=\s*([^}]*?)\s*\}\}/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      out[m[1].trim()] = (m[2] || "").trim();
    }
    return out;
  }

  function inlineTotal(msg, token) {
    const m = /\$\[\[(\d+)\]\]/.exec(token || "");
    if (!m) return null;
    const idx = parseInt(m[1], 10);
    const ir = msg.inlinerolls && msg.inlinerolls[idx];
    if (!ir || !ir.results) return null;
    return {
      idx,
      total: ir.results.total,
      results: ir.results
    };
  }

  function inlineNatD20(inlineObj) {
    try {
      const rolls = inlineObj && inlineObj.results && inlineObj.results.rolls;
      if (!rolls || !rolls.length) return null;
      const r0 = rolls.find(r => r.type === "R");
      if (!r0 || !r0.results || r0.results.length !== 1) return null;
      const die = r0.results[0];
      if (!die || typeof die.v !== "number") return null;
      if (r0.sides === 20 && (r0.dice === 1 || r0.dice == null)) return die.v;
      return null;
    } catch (e) {
      return null;
    }
  }

  function getCharFromToken(tok) {
    if (!tok) return null;
    const cid = tok.get("represents");
    if (!cid) return null;
    return getObj("character", cid);
  }

  function getAttr(charId, name) {
    const a = findObjs({ _type: "attribute", _characterid: charId, name: name })[0];
    return a ? a.get("current") : "";
  }

  function getAttrNum(charId, name, dflt) {
    return num(getAttr(charId, name), dflt);
  }

  function setAttr(charId, name, value) {
    let a = findObjs({ _type: "attribute", _characterid: charId, name: name })[0];
    if (!a) {
      a = createObj("attribute", { _characterid: charId, name: name, current: value });
    } else {
      a.set("current", value);
    }
  }

  // Get resource from token bar or character attribute
  function getResource(token, charId, barProp, attrName) {
    if (token) {
      const v = token.get(barProp);
      if (v !== "" && v != null && !isNaN(parseFloat(v))) {
        return num(v, 0);
      }
    }
    return getAttrNum(charId, attrName, 0);
  }

  function setResource(token, charId, barProp, attrName, value) {
    if (token) {
      const v = token.get(barProp);
      if (v !== "" && v != null && !isNaN(parseFloat(v))) {
        token.set(barProp, value);
        return;
      }
    }
    setAttr(charId, attrName, value);
  }

  // Map damage type string to protection column key
  function typeToProtKey(typeStr) {
    const t = String(typeStr || "").toLowerCase();
    if (t.includes("kinetic") || t === "kin") return "kinetic";
    if (t.includes("energy") || t === "eng") return "energy";
    if (t.includes("entropy") || t === "ent") return "entropy";
    if (t.includes("psychic") || t === "psy") return "psychic";
    if (t.includes("bio") || t.includes("biochem")) return "bio";
    return "other";
  }

  // Sum all repeating protection rows for a given column key
  // Handles fractional values (0.5, 0.25)
  function sumProtection(charId, protKey) {
    const re = new RegExp("^repeating_protection_.*_prot_" + protKey + "$");
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    return attrs.reduce((acc, a) => {
      const n = a.get("name");
      if (re.test(n)) {
        acc += parseFloat(a.get("current")) || 0;
      }
      return acc;
    }, 0);
  }

  function getRepeatingAttackAttr(charId, rowId, shortName) {
    // Case-insensitive lookup since Roll20 rowIDs can have mixed case
    const searchName = `repeating_attacks_${rowId}_${shortName}`.toLowerCase();
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const found = attrs.find(a => a.get("name").toLowerCase() === searchName);
    return found ? found.get("current") : "";
  }

  // Roll dice expression (NdM+K format)
  function rollExpr(s) {
    let str = String(s || "").replace(/\s+/g, "");
    if (!str) return 0;
    const terms = str.match(/[+\-]?[^+\-]+/g) || [];
    let total = 0;
    terms.forEach(term => {
      let sign = 1;
      if (term[0] === "+") term = term.slice(1);
      else if (term[0] === "-") { sign = -1; term = term.slice(1); }
      if (term.includes("d")) {
        const parts = term.split("d");
        const n = parts[0] ? parseInt(parts[0], 10) : 1;
        const sides = parseInt(parts[1], 10);
        if (isFinite(n) && isFinite(sides) && n > 0 && sides > 0) {
          let sub = 0;
          for (let i = 0; i < n; i++) sub += randomInteger(sides);
          total += sign * sub;
        }
      } else {
        const k = parseInt(term, 10);
        if (isFinite(k)) total += sign * k;
      }
    });
    return total;
  }

  // Cleanup old pending rolls
  function cleanupPending() {
    const now = Date.now();
    const pending = state.MP_Engine.pending;
    Object.keys(pending).forEach(k => {
      if (now - pending[k].created > CFG.PENDING_EXPIRE_MS) {
        delete pending[k];
      }
    });
  }

  // -------------------------
  // CRITICAL/FUMBLE TABLES (4.7.6)
  // -------------------------

  function rollCritical(isSuccess) {
    const r = randomInteger(20);
    if (isSuccess) {
      if (r <= 2) return `(${r}) Gear Shot - damage vs break point`;
      if (r <= 4) return `(${r}) Free Action - attacker gets free action`;
      if (r <= 6) return `(${r}) Leg Shot - EN+7 save at -1/Hit or lose leg; AG save or fall`;
      if (r === 7) return `(${r}) Avoid Light Armor - bypasses partial coverage`;
      if (r === 8) return `(${r}) Avoid Heavy Armor - bypasses partial coverage`;
      if (r === 9) return `(${r}) Muscle Strain (target) - 1 Hit to torso`;
      if (r <= 11) return `(${r}) Arm Shot - EN+7 save at -1/Hit or lose arm; AG save or drop`;
      if (r <= 13) return `(${r}) Precise Hit - target's roll-with halved`;
      if (r <= 15) return `(${r}) Solid Hit - +3 dmg or -3 to save TN`;
      if (r <= 17) return `(${r}) Off Balance - target at -3 def next phase`;
      if (r === 18) return `(${r}) Head Shot - DOUBLE Hits after protection/roll-with`;
      return `(${r}) Other - GM choice`;
    } else {
      if (r <= 2) return `(${r}) Wrong Target - GM determines`;
      if (r <= 4) return `(${r}) Off Balance - attacker at -3 def next phase`;
      if (r <= 6) return `(${r}) Leg Strain - 1 Hit to attacker's leg`;
      if (r <= 8) return `(${r}) Left Opening - target gets free action`;
      if (r <= 10) return `(${r}) Muscle Strain - 1 Hit to attacker's torso`;
      if (r <= 12) return `(${r}) Arm Strain - 1 Hit to attacker's arm`;
      if (r <= 14) return `(${r}) Weapon Stuck - lose action to free it`;
      if (r <= 16) return `(${r}) Lost Opportunity - lose next action`;
      if (r <= 18) return `(${r}) Gear Damage - attacker's gear vs break point`;
      return `(${r}) Other - GM choice`;
    }
  }

  // -------------------------
  // CORE: HANDLE MPATTACK TEMPLATE
  // -------------------------

  function handleMpAttack(msg) {
    // Check if API processing is enabled
    if (state.MP_Engine.enabled === false) return;
    
    const fields = parseTemplateFields(msg.content);
    if (!fields.mpapi || fields.mpapi !== "1") return;

    cleanupPending();

    const atkCharId = fields.atk;
    const defTokenId = fields.def;
    const rowId = fields.row;
    const isPushing = (fields.push === "1");

    const atkChar = getObj("character", atkCharId);
    const defTok = getObj("graphic", defTokenId);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defTok || !defChar) {
      ch("MP", `/w gm <b>MP:</b> Could not resolve attacker/defender. Select a target token.`);
      return;
    }

    // Get inline roll results from sheet
    const rollIR = inlineTotal(msg, fields.roll);
    const confIR = inlineTotal(msg, fields.confirm);
    const dmgIR = inlineTotal(msg, fields.damage);

    if (!rollIR) {
      ch("MP", `/w gm <b>MP:</b> Could not parse roll.`);
      return;
    }

    const nat = inlineNatD20(rollIR);
    const roll = num(rollIR.total, 0);
    const confirm = confIR ? num(confIR.total, 0) : 10;
    const damageTotal = dmgIR ? num(dmgIR.total, 0) : 0;

    // Get attack row attributes
    const getAtkAttr = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    // Debug logging
    const rawAtkType = getAtkAttr("attack_atk");
    log("MP: rowId=" + rowId);
    log("MP: looking for: repeating_attacks_" + rowId + "_attack_atk");
    // Debug: list all attributes matching this rowId
    const allAttrs = findObjs({ _type: "attribute", _characterid: atkCharId });
    const matchingAttrs = allAttrs.filter(a => a.get("name").toLowerCase().includes(rowId.toLowerCase()));
    log("MP: All attrs for row: " + JSON.stringify(matchingAttrs.map(a => a.get("name") + "=" + a.get("current"))));
    log("MP: rawAtkType=" + rawAtkType + " (type: " + typeof rawAtkType + ")");

    const atkName = atkChar.get("name") + " - " + (getAtkAttr("attack_name") || fields.name || "Attack");
    const defName = defChar.get("name");

    const atkTypeCode = rawAtkType || "P";
    log("MP: atkTypeCode=" + atkTypeCode);

    const atkMod = num(getAtkAttr("attack_mod"), 0);
    const dmgTypeShort = getAtkAttr("attack_dmgtype") || "Kin";
    const dmgTypeStr = {Kin:"Kinetic", Eng:"Energy", Bio:"Biochemical", Ent:"Entropy", Psy:"Psychic", Oth:"Other"}[dmgTypeShort] || fields.type || "Other";
    const protKey = typeToProtKey(dmgTypeStr);
    const range = getAtkAttr("attack_range") || fields.range || "-";
    const kbChecked = getAtkAttr("attack_kb");
    const causesKB = (kbChecked === "1") || (fields.kb && fields.kb.toLowerCase() === "yes");

    // Special attack attributes
    const atkType = getAtkAttr("attack_type") || "std";
    const atkAPRaw = getAtkAttr("attack_ap") || fields.ap || "";
    const atkAP = (atkAPRaw === "ALL" || atkAPRaw === "all") ? Infinity : num(atkAPRaw, 0);
    const saveBC = getAtkAttr("attack_save_bc") || "";
    const saveMod = num(getAtkAttr("attack_save_mod"), 0);
    const recMod = num(getAtkAttr("attack_recovery"), 0);
    const snBP = num(getAtkAttr("attack_bp"), 0);
    const snMaxBP = num(getAtkAttr("attack_max_bp"), 0);
    const snType = getAtkAttr("attack_snare_type") || "";

    // Calculate TN using ACTUAL defender defense
    let atkSaveAttr;
    if (atkTypeCode === "M") atkSaveAttr = "intelligence_save";
    else if (atkTypeCode === "E") atkSaveAttr = "cool_save";
    else atkSaveAttr = "agility_save";

    const atkSave = getAttrNum(atkCharId, atkSaveAttr, 10);
    const baseToHit = atkSave + 3 + atkMod;

    const defAttr = (atkTypeCode === "M" || atkTypeCode === "E") ? "mental_def" : "physical_def";
    const defValue = getAttrNum(defChar.id, defAttr, 0);
    log("MP: atkTypeCode=" + atkTypeCode + " defAttr=" + defAttr + " defValue=" + defValue);

    const targetTotal = baseToHit - defValue;

    // Deduct push cost from attacker
    if (isPushing) {
      const atkTok = findObjs({ _type: "graphic", represents: atkCharId })[0];
      if (atkTok) {
        const atkPow0 = getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
        setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, atkPow0 - 2));
      }
    }

    // Determine outcome using API-calculated TN
    let outcome = "MISS";
    let isCrit = false;
    let isFumble = false;

    if (nat === 20) {
      if (confirm > targetTotal) {
        isFumble = true;
        outcome = "FUMBLE";
      } else {
        outcome = "MISS";
      }
    } else if (nat === 1) {
      if (confirm <= targetTotal) {
        isCrit = true;
        outcome = "CRIT";
      } else {
        outcome = "HIT";
      }
    } else if (roll <= targetTotal) {
      outcome = "HIT";
    }

    // Store pending
    const rollId = String(Date.now()) + "_" + randomInteger(999999);
    state.MP_Engine.pending[rollId] = {
      rollId, playerid: msg.playerid, atkCharId, atkName, defTokenId, 
      defCharId: defChar.id, defName, rowId, nat, roll, confirm, targetTotal,
      outcome, isCrit, isFumble, damageTotal, dmgTypeStr, protKey, atkType,
      atkAP, saveBC, saveMod, recMod, snBP, snMaxBP, snType, causesKB,
      isPushing, created: Date.now()
    };

    // Build output
    const whisper = CFG.GM_ONLY_BUTTONS ? "/w gm " : "";

    const atkTypeLabel = atkTypeCode === "M" ? "Mental" : (atkTypeCode === "E" ? "Emot" : "Phys");
    const defTypeLabel = (atkTypeCode === "M" || atkTypeCode === "E") ? "MDef" : "PDef";

    let html;
    if (outcome === "HIT" || outcome === "CRIT") {
      html = `<div style="background:#90ee90; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
      html += `<span style="color:#000; font-weight:bold; font-size:14px;">💥 ${outcome}!</span> `;
    } else {
      html = `<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
      html += `<span style="color:#000; font-weight:bold; font-size:14px;">${outcome}!</span> `;
    }
    html += `<span style="color:#000;" title="Target">vs ${esc(defName)}</span> `;
    html += `<span style="color:#333; font-size:10px;" title="Attack type: ${atkTypeLabel}&#10;Roll: ${roll}&#10;Target Number: ${targetTotal}-&#10;${defTypeLabel}: ${defValue}">[${atkTypeLabel}] ${roll} vs ${targetTotal}- (${defTypeLabel}:${defValue})</span>`;

    if (isCrit) html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Critical hit effect">⚡ ${rollCritical(true)}</span>`;
    if (isFumble) html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Fumble effect">💥 ${rollCritical(false)}</span>`;
    if (isPushing) html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Pushing: +2 damage, costs 2 Power">⚡ PUSH!</span>`;

    html += `</div>`;

    let buttons = "";
    if (outcome === "HIT" || outcome === "CRIT") {
      const critBonus = isCrit ? 3 : 0;

      if (atkType === "std") {
        buttons = `[Apply](!mp apply --id ${rollId} --mode noroll --crit ${critBonus}) `;
        buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax --crit ${critBonus}) `;
        buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0} --crit ${critBonus})`;
        if (causesKB) buttons += ` [KB](!mp kb --id ${rollId})`;
      } else if (atkType === "sav") {
        const critMod = isCrit ? -3 : 0;
        const pushMod = isPushing ? -2 : 0;
        buttons = `[Make Save](!mp save --id ${rollId} --critmod ${critMod + pushMod}) `;
        buttons += `[Save + Roll-With](!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod ${critMod + pushMod})`;
      } else if (atkType === "snr") {
        const snCritBonus = isCrit ? 2 : 0;
        const pushBonus = isPushing ? 2 : 0;
        buttons = `[Apply Snare](!mp snare --id ${rollId} --crit ${snCritBonus + pushBonus})`;
      }
    }

    ch("MP", whisper + html + buttons);
  }

  // -------------------------
  // APPLY DAMAGE (4.8, 4.8.2, 4.8.3)
  // -------------------------

  function cmdApply(msg, args) {
    const rollId = args.id;
    const mode = args.mode || "noroll";
    const critBonus = num(args.crit, 0);
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    // Raw damage + critical bonus
    const raw = num(rec.damageTotal, 0) + critBonus;
    const protKey = rec.protKey;

    // Sum protection (handles fractional values)
    let prot = sumProtection(defChar.id, protKey);

    // Armor Piercing reduces protection
    const ap = rec.atkAP;
    if (ap === Infinity) {
      prot = 0;
    } else if (ap > 0) {
      prot = Math.max(0, prot - ap);
    }

    const penetrating = Math.max(0, raw - prot);

    // Current resources
    const hits0 = getResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);

    // Roll-with: max divert = floor(current Power / 10) per 4.8.3
    // For Precise Hit critical, halve the roll-with cap
    const preciseCrit = rec.isCrit && (args.precise === "1");
    let maxDivert = Math.floor(pow0 / 10);
    if (preciseCrit) maxDivert = Math.floor(maxDivert / 2);

    let divert = 0;
    if (mode === "rollwithmax") {
      divert = Math.min(maxDivert, penetrating);
    } else if (mode === "rollwithcustom") {
      const want = num(args.amt, 0);
      divert = Math.min(maxDivert, penetrating, Math.max(0, want));
    }

    // Damage to Hits after roll-with
    const toHits = Math.max(0, penetrating - divert);

    // Apply to Hits; overflow spills to Power (4.8.4)
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = Math.max(0, toHits - hits0);

    // Power reduction: diverted amount + overflow
    const pow1 = Math.max(0, pow0 - divert - overflow);
    const hits1 = hitsAfterDmg;

    setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
    setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);

    // Check for unconsciousness (over half remaining hits in one attack)
    const unconscious = (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);

    let statusLine = "";
    if (incapacitated) {
      statusLine = `<br/><span style="color:#000; font-weight:bold;">💀 INCAPACITATED!</span>`;
      defTok.set("status_dead", true);
    } else if (unconscious) {
      statusLine = `<br/><span style="color:#000; font-weight:bold;">😵 UNCONSCIOUS!</span>`;
      defTok.set("status_sleepy", true);
    }

    const msgLine =
      `<div style="background:#fff200; border:3px solid #000; padding:4px 8px;">` +
      `<span style="color:#000; font-weight:bold;" title="Target">${esc(rec.defName)}</span>: ` +
      `<span title="Raw damage${critBonus ? ' (+' + critBonus + ' crit bonus)' : ''}">${raw}</span>` +
      ` - <span title="Protection vs ${protKey}">${Math.floor(prot)}</span> prot` +
      ` = <span title="Penetrating damage">${penetrating}</span> pen` +
      (divert > 0 ? `, <span title="Roll-with (max ${maxDivert})">RW ${divert}</span>` : "") +
      ` → <b title="Hits damage">${toHits}</b> to Hits` +
      (overflow > 0 ? ` <span title="Overflow to Power">(+${overflow} ovf)</span>` : "") +
      `<br/><span title="Hits">Hits: <b>${hits0}→${hits1}</b></span>` +
      ` | <span title="Power">Pwr: <b>${pow0}→${pow1}</b></span>` +
      statusLine +
      `</div>`;

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msgLine);
  }

  // -------------------------
  // KNOCKBACK (4.8.5)
  // -------------------------

  function cmdKnockback(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    // Get target's mass dice expression
    const massExpr = getAttr(defChar.id, "mass") || "1d4";
    const massRoll = rollExpr(massExpr);

    // KB = Hits taken this phase - Mass roll
    // We need the actual hits taken (stored or recalculated)
    // For now, use penetrating damage as approximation
    const raw = num(rec.damageTotal, 0);
    const prot = sumProtection(defChar.id, rec.protKey);
    const ap = rec.atkAP;
    const effectiveProt = (ap === Infinity) ? 0 : Math.max(0, prot - (ap > 0 ? ap : 0));
    const penetrating = Math.max(0, raw - effectiveProt);

    const kb = Math.max(0, penetrating - massRoll);

    let msg_out = `<b>Knockback vs ${esc(rec.defName)}</b><br/>` +
      `Damage: <b>${penetrating}</b> - Mass(${esc(massExpr)}): <b>${massRoll}</b> = <b>${kb}"</b> KB`;

    if (kb > 0) {
      msg_out += `<br/><i>Target pushed ${kb}" away from attacker. AG save at -${kb} or fall prone.</i>`;
      msg_out += `<br/>[AG Save vs Knockdown](!mp kbsave --target ${rec.defTokenId} --penalty ${kb})`;
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  function cmdKBSave(msg, args) {
    const tokId = args.target;
    const penalty = num(args.penalty, 0);

    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const agSave = getAttrNum(char.id, "agility_save", 10);
    const tn = Math.max(1, agSave - penalty);
    const roll = randomInteger(20);
    const pass = (roll !== 20) && (roll <= tn);

    const msg_out = `<b>Knockdown Save</b> (${esc(char.get("name"))})<br/>` +
      `AG Save: <b>${agSave}</b> - ${penalty} = TN <b>${tn}-</b><br/>` +
      `Roll: <b>${roll}</b> → <b>${pass ? "STAYS UP" : "PRONE!"}</b>`;

    if (!pass) {
      tok.set("status_prone", true);
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // SAVE ATTACKS (4.9)
  // -------------------------

  function bcToSaveAttr(bc) {
    switch (String(bc || "").toUpperCase()) {
      case "AG": return "agility_save";
      case "EN": return "endurance_save";
      case "IN": return "intelligence_save";
      case "CL": return "cool_save";
      default: return null;
    }
  }

  function cmdSave(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const saveAttr = bcToSaveAttr(rec.saveBC);
    if (!saveAttr) return ch("MP", `/w gm <b>MP:</b> Save BC "${rec.saveBC}" not valid.`);

    const baseSave = getAttrNum(defChar.id, saveAttr, 10);

    // Protection adds to save (makes it easier) per 4.9
    const prot = sumProtection(defChar.id, rec.protKey);

    // Roll-with for saves: spend Power to add to save TN (4.8.3.1)
    const rw = Math.max(0, num(args.rollwith, 0));
    const pow0 = getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const maxRW = Math.floor(pow0 / 10);
    const rwPaid = Math.min(rw, maxRW);
    const pow1 = pow0 - rwPaid;
    setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);

    // Critical mod (Solid Hit = -3 to save TN)
    const critMod = num(args.critmod, 0);

    const pushMod = rec.isPushing ? -2 : 0;

    // Final save TN = base + attack mod + protection + roll-with + crit mod
    const tn = baseSave + num(rec.saveMod, 0) + Math.floor(prot) + rwPaid + critMod + pushMod;

    const d20 = randomInteger(20);
    const pass = (d20 !== CFG.FUMBLE_FAIL_NAT) && (d20 <= tn);

    // Recovery TN (4.9)
    const recTN = tn + num(rec.recMod, 0);

    let statusLine = "";
    if (!pass) {
      statusLine = `<br/><span style="color:#e94560">Effect applies! Recovery TN: <b>${recTN}-</b></span>`;
      statusLine += `<br/>[Recovery Roll](!mp recover --target ${rec.defTokenId} --bc ${rec.saveBC} --tn ${recTN})`;
    }

    const msg_out =
      `<b>Save Attack</b> (${esc(rec.saveBC)}) vs <b>${esc(rec.defName)}</b><br/>` +
      `Base: <b>${baseSave}</b> | Mod: <b>${rec.saveMod}</b> | Prot: <b>+${Math.floor(prot)}</b>` +
      (rwPaid > 0 ? ` | RW: <b>+${rwPaid}</b>` : "") +
      (critMod !== 0 ? ` | Crit: <b>${critMod}</b>` : "") +
      `<br/>Save TN: <b>${tn}-</b> | Roll: <b>${d20}</b> → <b style="color:${pass ? '#50fa7b' : '#e94560'}">${pass ? "SAVED" : "FAILED"}</b>` +
      (rwPaid > 0 ? `<br/>Power: ${pow0} → ${pow1}` : "") +
      statusLine;

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  function cmdRecover(msg, args) {
    const tokId = args.target;
    const bc = args.bc;
    const tn = num(args.tn, 10);

    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const d20 = randomInteger(20);
    const pass = (d20 !== 20) && (d20 <= tn);

    let msg_out = `<b>Recovery Roll</b> (${esc(char.get("name"))})<br/>` +
      `TN: <b>${tn}-</b> | Roll: <b>${d20}</b> → <b>${pass ? "RECOVERED" : "Still affected"}</b>`;

    if (!pass) {
      msg_out += `<br/>[Try Again](!mp recover --target ${tokId} --bc ${bc} --tn ${tn})`;
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // SNARE ATTACKS (4.10)
  // -------------------------

  function cmdSnare(msg, args) {
    const rollId = args.id;
    const critBonus = num(args.crit, 0);
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    if (!defTok) return ch("MP", `/w gm <b>MP:</b> Target token missing.`);

    const pushBonus = rec.isPushing ? 2 : 0;
    let bp = Math.max(0, num(rec.snBP, 0)) + critBonus + pushBonus;
    const maxBp = Math.max(bp, num(rec.snMaxBP, 0));

    // Check for existing snare - stack bonus per 4.10
    const existing = state.MP_Engine.snares[defTok.id];
    if (existing) {
      bp = Math.min(existing.bp + CFG.SNARE_STACK_BONUS, existing.maxBp);
      state.MP_Engine.snares[defTok.id].bp = bp;
      ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
        `<b>Snare Stacked on ${esc(rec.defName)}</b><br/>` +
        `BP increased: <b>${existing.bp - CFG.SNARE_STACK_BONUS} → ${bp}</b> (max ${existing.maxBp})`);
      return;
    }

    state.MP_Engine.snares[defTok.id] = {
      bp,
      maxBp,
      type: rec.snType || "Snare",
      source: rec.atkName,
      created: Date.now()
    };

    defTok.set("status_cobweb", true);

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
      `<b>Snare Applied to ${esc(rec.defName)}</b><br/>` +
      `Type: <b>${esc(rec.snType || "Snare")}</b> | BP: <b>${bp}</b> / Max: <b>${maxBp}</b>` +
      `<br/>[Break Free](!mp break --target ${defTok.id})`);
  }

  function cmdBreak(msg, args) {
    const tokId = args.target;
    const push = args.push === "1";

    const tok = getObj("graphic", tokId);
    if (!tok) return ch("MP", `/w gm <b>MP:</b> Target token missing.`);

    const sn = state.MP_Engine.snares[tokId];
    if (!sn) return ch("MP", `/w gm <b>MP:</b> No snare on that token.`);

    const char = getCharFromToken(tok);
    if (!char) return ch("MP", `/w gm <b>MP:</b> Token not linked to character.`);

    const hthExpr = String(getAttr(char.id, "hth_damage") || "1d4").trim();
    let roll = rollExpr(hthExpr);
    if (push) roll += 2;

    const success = (roll >= sn.bp);
    const margin = roll - sn.bp;

    let resultLine = "";
    if (success) {
      if (margin >= 4) {
        resultLine = `<b style="color:#50fa7b">ESCAPES!</b> (by ${margin}, uses only move OR action)`;
      } else {
        resultLine = `<b style="color:#50fa7b">ESCAPES!</b> (uses full turn)`;
      }
      delete state.MP_Engine.snares[tokId];
      tok.set("status_cobweb", false);
    } else {
      resultLine = `<b style="color:#e94560">STILL SNARED</b>`;
    }

    let msg_out = `<b>Break Free Attempt</b> (${esc(char.get("name"))})<br/>` +
      `HTH(${esc(hthExpr)}): <b>${roll}</b>${push ? " (+2 push)" : ""} vs BP <b>${sn.bp}</b><br/>` +
      resultLine;

    if (!success) {
      msg_out += `<br/>[Try Again](!mp break --target ${tokId}) [Push (+2, risk 1 Hit)](!mp break --target ${tokId} --push 1)`;
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // GRAPPLE COMMANDS (4.11)
  // -------------------------

  function cmdGrapple(msg, args) {
    const atkTokId = args.atk;
    const defTokId = args.def;

    const atkTok = getObj("graphic", atkTokId);
    const defTok = getObj("graphic", defTokId);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Missing attacker or defender.`);
    }

    // Store grapple state
    state.MP_Engine.snares[defTokId] = {
      type: "Grapple",
      source: atkChar.get("name"),
      grapplerTokenId: atkTokId,
      created: Date.now()
    };

    defTok.set("status_grab", true);

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
      `<b>${esc(atkChar.get("name"))} Grapples ${esc(defChar.get("name"))}</b><br/>` +
      `[Squeeze](!mp squeeze --atk ${atkTokId} --def ${defTokId}) ` +
      `[Break Free](!mp grapplebreak --atk ${atkTokId} --def ${defTokId}) ` +
      `[Escape](!mp escape --atk ${atkTokId} --def ${defTokId})`);
  }

  function cmdSqueeze(msg, args) {
    const atkTokId = args.atk;
    const defTokId = args.def;

    const atkChar = getCharFromToken(getObj("graphic", atkTokId));
    const defChar = getCharFromToken(getObj("graphic", defTokId));
    const defTok = getObj("graphic", defTokId);

    if (!atkChar || !defChar || !defTok) {
      return ch("MP", `/w gm <b>MP:</b> Missing characters.`);
    }

    const hthExpr = getAttr(atkChar.id, "hth_damage") || "1d4";
    const damage = rollExpr(hthExpr);

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
      `<b>${esc(atkChar.get("name"))} Squeezes ${esc(defChar.get("name"))}</b><br/>` +
      `HTH Damage: <b>${damage}</b> (Kinetic, no KB)<br/>` +
      `<i>Apply protection and roll-with normally.</i>`);
  }

  function cmdGrappleBreak(msg, args) {
    const atkTokId = args.atk;
    const defTokId = args.def;
    const push = args.push === "1";

    const atkChar = getCharFromToken(getObj("graphic", atkTokId));
    const defChar = getCharFromToken(getObj("graphic", defTokId));
    const defTok = getObj("graphic", defTokId);

    if (!atkChar || !defChar || !defTok) {
      return ch("MP", `/w gm <b>MP:</b> Missing characters.`);
    }

    const atkHTH = getAttr(atkChar.id, "hth_damage") || "1d4";
    const defHTH = getAttr(defChar.id, "hth_damage") || "1d4";

    let defRoll = rollExpr(defHTH);
    let atkRoll = rollExpr(atkHTH);

    if (push) defRoll += 2;

    const success = (defRoll > atkRoll);

    let msg_out = `<b>Break Free from Grapple</b><br/>` +
      `${esc(defChar.get("name"))}: <b>${defRoll}</b>${push ? " (+2 push)" : ""}<br/>` +
      `${esc(atkChar.get("name"))}: <b>${atkRoll}</b><br/>` +
      `Result: <b>${success ? "ESCAPES!" : "Still Grappled"}</b>`;

    if (push && !success) {
      msg_out += `<br/><span style="color:#e94560">${esc(defChar.get("name"))} takes 1 Hit from failed push!</span>`;
    }

    if (success) {
      delete state.MP_Engine.snares[defTokId];
      defTok.set("status_grab", false);
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // WAKEUP ROLL (4.8.4.1)
  // -------------------------

  function cmdWakeup(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);

    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const hits = getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);

    if (hits <= 0) {
      return ch("MP", `/w gm <b>MP:</b> Character is incapacitated (0 Hits). Cannot wake until healed.`);
    }

    const roll = randomInteger(20);
    const success = (roll <= hits);

    let msg_out = `<b>Wakeup Roll</b> (${esc(char.get("name"))})<br/>` +
      `Remaining Hits: <b>${hits}</b> | Roll: <b>${roll}</b> → <b>${success ? "WAKES UP!" : "Still unconscious"}</b>`;

    if (success) {
      tok.set("status_sleepy", false);
    } else {
      msg_out += `<br/>[Try Again](!mp wakeup --target ${tokId})`;
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // STATUS COMMANDS
  // -------------------------

  function cmdStatus(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);

    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const hits = getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow = getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);

    const snare = state.MP_Engine.snares[tokId];

    let msg_out = `<b>${esc(char.get("name"))} Status</b><br/>` +
      `Hits: <b>${hits}/${hitsMax}</b> | Power: <b>${pow}/${powMax}</b>`;

    if (snare) {
      msg_out += `<br/>Snared: <b>${snare.type}</b> (BP ${snare.bp || "N/A"}) by ${snare.source}`;
    }

    if (hits <= 0) {
      msg_out += `<br/><span style="color:#e94560">INCAPACITATED</span>`;
    } else if (pow <= 0) {
      msg_out += `<br/><span style="color:#f4d03f">FATIGUED</span>`;
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

  // -------------------------
  // COMMAND PARSING
  // -------------------------

  function parseArgs(content) {
    const parts = content.split(/\s+/);
    const cmd = (parts[1] || "").toLowerCase();
    const args = {};

    let i = 2;
    while (i < parts.length) {
      const p = parts[i];
      if (p && p.startsWith("--")) {
        const key = p.slice(2);
        const val = (i + 1 < parts.length && !parts[i + 1].startsWith("--")) ? parts[i + 1] : "1";
        args[key] = val;
        i += (val === "1" && (i + 1 >= parts.length || parts[i + 1].startsWith("--"))) ? 1 : 2;
      } else {
        i++;
      }
    }
    return { cmd, args };
  }

  function cmdConfig(msg, args) {
    if (!playerIsGM(msg.playerid)) {
      return ch("MP", "/w " + msg.who + " Only GM can change config.");
    }
    
    const setting = args.setting;
    const value = args.value;
    
    if (setting === "enabled") {
      state.MP_Engine.enabled = (value === "on" || value === "true" || value === "1");
      ch("MP", "/w gm API processing: " + (state.MP_Engine.enabled ? "ON" : "OFF"));
    } else if (setting === "autoroll") {
      state.MP_Engine.autoroll = (value === "on" || value === "true" || value === "1");
      ch("MP", "/w gm Auto-roll damage: " + (state.MP_Engine.autoroll ? "ON" : "OFF"));
    } else {
      ch("MP", "/w gm Config options: enabled (on/off), autoroll (on/off)");
    }
  }

  function onChat(msg) {
    // Handle rolltemplate FIRST (doesn't start with !mp)
    if (msg.rolltemplate === "mpattack") {
      return handleMpAttack(msg);
    }

    // Handle commands
    if (!msg.content || msg.content.indexOf("!mp") !== 0) return;

    const parsed = parseArgs(msg.content);
    const cmd = parsed.cmd;
    const args = parsed.args;

    switch (cmd) {
      case "attack": return cmdAttack(msg, args);
      case "config": 
        const configParts = msg.content.split(/\s+/);
        return cmdConfig(msg, { setting: args.setting || configParts[2], value: args.value || configParts[3] });
      case "rolldamage": return cmdRollDamage(msg, args);
      case "apply": return cmdApply(msg, args);
      case "save": return cmdSave(msg, args);
      case "recover": return cmdRecover(msg, args);
      case "snare": return cmdSnare(msg, args);
      case "break": return cmdBreak(msg, args);
      case "kb": return cmdKnockback(msg, args);
      case "kbsave": return cmdKBSave(msg, args);
      case "grapple": return cmdGrapple(msg, args);
      case "squeeze": return cmdSqueeze(msg, args);
      case "grapplebreak": return cmdGrappleBreak(msg, args);
      case "escape": return cmdGrappleBreak(msg, args); // same mechanic
      case "wakeup": return cmdWakeup(msg, args);
      case "status": return cmdStatus(msg, args);
      case "help":
      default:
        return ch("MP", `/w gm <b>MP Engine v2.0</b> Commands:<br/>
          <code>!mp apply --id ID --mode noroll|rollwithmax|rollwithcustom --amt N</code><br/>
          <code>!mp save --id ID --rollwith N</code><br/>
          <code>!mp recover --target TOKID --bc BC --tn N</code><br/>
          <code>!mp snare --id ID</code><br/>
          <code>!mp break --target TOKID --push 0|1</code><br/>
          <code>!mp kb --id ID</code><br/>
          <code>!mp kbsave --target TOKID --penalty N</code><br/>
          <code>!mp grapple --atk TOKID --def TOKID</code><br/>
          <code>!mp squeeze --atk TOKID --def TOKID</code><br/>
          <code>!mp grapplebreak --atk TOKID --def TOKID --push 0|1</code><br/>
          <code>!mp wakeup --target TOKID</code><br/>
          <code>!mp status --target TOKID</code>`);
    }
  }

  function cmdRollDamage(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm Unknown roll id.`);
    
    const critBonus = rec.isCrit ? 3 : 0;
    const whisper = CFG.GM_ONLY_BUTTONS ? "/w gm " : "";
    
    let html = `<div style="background:#1a1a2e; border:2px solid #8be9fd; border-radius:6px; padding:8px; margin:4px 0;">`;
    html += `<div style="color:#eaeaea;">Damage: <b>${rec.damageTotal}</b> (${esc(rec.dmgTypeStr)})</div>`;
    html += `</div>`;
    
    let buttons = `[Apply Damage](!mp apply --id ${rollId} --mode noroll --crit ${critBonus}) `;
    buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax --crit ${critBonus}) `;
    buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0} --crit ${critBonus})`;
    
    if (rec.causesKB) {
      buttons += ` [Knockback](!mp kb --id ${rollId})`;
    }
    
    ch("MP", whisper + html + buttons);
  }

  // -------------------------
  // INIT
  // -------------------------
  on("chat:message", onChat);

  ch("MP", `/w gm <b>MP Engine v2.0:</b> Loaded. Listening for <code>&{template:mpattack}</code> with <code>{{mpapi=1}}</code>.`);

  return { CFG, rollExpr };
})();

// test: log chat messages
on("chat:message", function(msg) {
  log("RAW: " + msg.type + " | " + msg.rolltemplate + " | " + msg.content.substring(0,100));
});

on("ready", function() {
  log("MP ENGINE READY EVENT FIRED");
});