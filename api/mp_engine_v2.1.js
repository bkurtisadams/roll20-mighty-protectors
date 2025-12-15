/* Mighty Protectors - MP Engine v2.2 (Roll20 API)
 * Fixed critical hit handling per MP rules
 * 
 * Works with sheet's mpattack rolltemplate:
 *  {{mpapi=1}} {{atk=<character_id>}} {{def=<target token_id>}} {{row=<rowid>}}
 *  {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[...]]}} {{damage=[[...]]}} {{type=...}}
 */
log("MP ENGINE v2.2 FILE STARTING");

var MP = MP || {};
MP.Engine = (function () {

  const CFG = {
    // Token bars (value only, max untouched)
    POWER_BAR: "bar1_value",
    HITS_BAR: "bar2_value",
    DEF_MOD_BAR: "bar3_value",  // Defense modifier (stances, off balance, etc.)

    // Auto-roll damage display (toggle with !mp config autoroll on/off)
    AUTO_ROLL_DAMAGE: true,

    // Character sheet attribute names
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

  // Critical hit types
  const CRIT_TYPES = {
    GEAR_SHOT: "gear_shot",
    FREE_ACTION: "free_action",
    LEG_SHOT: "leg_shot",
    AVOID_LIGHT_ARMOR: "avoid_light_armor",
    AVOID_HEAVY_ARMOR: "avoid_heavy_armor",
    MUSCLE_STRAIN_TARGET: "muscle_strain_target",
    ARM_SHOT: "arm_shot",
    PRECISE_HIT: "precise_hit",
    SOLID_HIT: "solid_hit",
    OFF_BALANCE: "off_balance",
    HEAD_SHOT: "head_shot",
    OTHER: "other"
  };

  // Fumble types
  const FUMBLE_TYPES = {
    WRONG_TARGET: "wrong_target",
    OFF_BALANCE_ATK: "off_balance_atk",
    LEG_STRAIN: "leg_strain",
    LEFT_OPENING: "left_opening",
    MUSCLE_STRAIN_ATK: "muscle_strain_atk",
    ARM_STRAIN: "arm_strain",
    WEAPON_STUCK: "weapon_stuck",
    LOST_OPPORTUNITY: "lost_opportunity",
    GEAR_DAMAGE: "gear_damage",
    OTHER_FUMBLE: "other_fumble"
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

  function typeToProtKey(typeStr) {
    const t = String(typeStr || "").toLowerCase();
    if (t.includes("kinetic") || t === "kin") return "kinetic";
    if (t.includes("energy") || t === "eng") return "energy";
    if (t.includes("entropy") || t === "ent") return "entropy";
    if (t.includes("psychic") || t === "psy") return "psychic";
    if (t.includes("bio") || t.includes("biochem")) return "bio";
    return "other";
  }

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
    const searchName = `repeating_attacks_${rowId}_${shortName}`.toLowerCase();
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const found = attrs.find(a => a.get("name").toLowerCase() === searchName);
    return found ? found.get("current") : "";
  }

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

  function cleanupPending() {
    const now = Date.now();
    const pending = state.MP_Engine.pending;
    Object.keys(pending).forEach(k => {
      if (now - pending[k].created > CFG.PENDING_EXPIRE_MS) {
        delete pending[k];
      }
    });
  }

  function getSelectedToken(msg) {
    if (!msg.selected || !msg.selected.length) return null;
    return getObj("graphic", msg.selected[0]._id);
  }

  // -------------------------
  // CRITICAL/FUMBLE TABLES (4.7.6)
  // -------------------------

  function rollCriticalTable() {
    const r = randomInteger(20);
    let type, desc;
    
    if (r <= 2) {
      type = CRIT_TYPES.GEAR_SHOT;
      desc = `(${r}) Gear Shot - damage vs target's gear break point`;
    } else if (r <= 4) {
      type = CRIT_TYPES.FREE_ACTION;
      desc = `(${r}) Free Action - attacker gets a free action`;
    } else if (r <= 6) {
      type = CRIT_TYPES.LEG_SHOT;
      desc = `(${r}) Leg Shot - EN+7 save at -1/Hit or lose leg; AG save or fall`;
    } else if (r === 7) {
      type = CRIT_TYPES.AVOID_LIGHT_ARMOR;
      desc = `(${r}) Avoid Light Armor - bypasses partial armor coverage`;
    } else if (r === 8) {
      type = CRIT_TYPES.AVOID_HEAVY_ARMOR;
      desc = `(${r}) Avoid Heavy Armor - bypasses partial armor coverage`;
    } else if (r === 9) {
      type = CRIT_TYPES.MUSCLE_STRAIN_TARGET;
      desc = `(${r}) Muscle Strain - target takes 1 Hit to torso`;
    } else if (r <= 11) {
      type = CRIT_TYPES.ARM_SHOT;
      desc = `(${r}) Arm Shot - EN+7 save at -1/Hit or lose arm; AG save or drop`;
    } else if (r <= 13) {
      type = CRIT_TYPES.PRECISE_HIT;
      desc = `(${r}) Precise Hit - target's roll-with capacity halved`;
    } else if (r <= 15) {
      type = CRIT_TYPES.SOLID_HIT;
      desc = `(${r}) Solid Hit - +3 damage (standard) or -3 to save TN (save attack)`;
    } else if (r <= 17) {
      type = CRIT_TYPES.OFF_BALANCE;
      desc = `(${r}) Off Balance - target at -3 defense next phase`;
    } else if (r === 18) {
      type = CRIT_TYPES.HEAD_SHOT;
      desc = `(${r}) Head Shot - DOUBLE Hits after protection & roll-with`;
    } else {
      type = CRIT_TYPES.OTHER;
      desc = `(${r}) Other - GM determines effect`;
    }
    
    return { roll: r, type, desc };
  }

  function rollFumbleTable() {
    const r = randomInteger(20);
    let type, desc;
    
    if (r <= 2) {
      type = FUMBLE_TYPES.WRONG_TARGET;
      desc = `(${r}) Wrong Target - GM determines who/what was hit`;
    } else if (r <= 4) {
      type = FUMBLE_TYPES.OFF_BALANCE_ATK;
      desc = `(${r}) Off Balance - attacker at -3 defense next phase`;
    } else if (r <= 6) {
      type = FUMBLE_TYPES.LEG_STRAIN;
      desc = `(${r}) Leg Strain - attacker takes 1 Hit to leg`;
    } else if (r <= 8) {
      type = FUMBLE_TYPES.LEFT_OPENING;
      desc = `(${r}) Left Opening - target gets a free action`;
    } else if (r <= 10) {
      type = FUMBLE_TYPES.MUSCLE_STRAIN_ATK;
      desc = `(${r}) Muscle Strain - attacker takes 1 Hit to torso`;
    } else if (r <= 12) {
      type = FUMBLE_TYPES.ARM_STRAIN;
      desc = `(${r}) Arm Strain - attacker takes 1 Hit to arm`;
    } else if (r <= 14) {
      type = FUMBLE_TYPES.WEAPON_STUCK;
      desc = `(${r}) Weapon Stuck - lose action to free it`;
    } else if (r <= 16) {
      type = FUMBLE_TYPES.LOST_OPPORTUNITY;
      desc = `(${r}) Lost Opportunity - lose next action`;
    } else if (r <= 18) {
      type = FUMBLE_TYPES.GEAR_DAMAGE;
      desc = `(${r}) Gear Damage - attacker's gear vs break point`;
    } else {
      type = FUMBLE_TYPES.OTHER_FUMBLE;
      desc = `(${r}) Other - GM determines effect`;
    }
    
    return { roll: r, type, desc };
  }

  // -------------------------
  // CORE: HANDLE MPATTACK TEMPLATE
  // -------------------------

  function handleMpAttack(msg) {
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

    const getAtkAttr = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    const rawAtkType = getAtkAttr("attack_atk");
    const atkName = atkChar.get("name") + " - " + (getAtkAttr("attack_name") || fields.name || "Attack");
    const defName = defChar.get("name");

    const atkTypeCode = rawAtkType || "P";
    const atkMod = num(getAtkAttr("attack_mod"), 0);
    const dmgTypeShort = getAtkAttr("attack_dmgtype") || "Kin";
    const dmgTypeStr = {Kin:"Kinetic", Eng:"Energy", Bio:"Biochemical", Ent:"Entropy", Psy:"Psychic", Oth:"Other"}[dmgTypeShort] || fields.type || "Other";
    const protKey = typeToProtKey(dmgTypeStr);
    const range = getAtkAttr("attack_range") || fields.range || "-";
    const kbChecked = getAtkAttr("attack_kb");
    const causesKB = (kbChecked === "1") || (fields.kb && fields.kb.toLowerCase() === "yes");

    const atkType = getAtkAttr("attack_type") || "std";
    const atkAPRaw = getAtkAttr("attack_ap") || fields.ap || "";
    const atkAP = (atkAPRaw === "ALL" || atkAPRaw === "all") ? Infinity : num(atkAPRaw, 0);
    const saveBC = getAtkAttr("attack_save_bc") || "";
    const saveMod = num(getAtkAttr("attack_save_mod"), 0);
    const recMod = num(getAtkAttr("attack_recovery"), 0);
    const snBP = num(getAtkAttr("attack_bp"), 0);
    const snMaxBP = num(getAtkAttr("attack_max_bp"), 0);
    const snType = getAtkAttr("attack_snare_type") || "";

    let atkSaveAttr;
    if (atkTypeCode === "M") atkSaveAttr = "intelligence_save";
    else if (atkTypeCode === "E") atkSaveAttr = "cool_save";
    else atkSaveAttr = "agility_save";

    const atkSave = getAttrNum(atkCharId, atkSaveAttr, 10);
    
    // Check if attacker is in Defensive stance (bar3 = 3) - they take -3 to hit
    const atkTok = findObjs({ _type: "graphic", represents: atkCharId })[0];
    const atkDefMod = atkTok ? num(atkTok.get(CFG.DEF_MOD_BAR), 0) : 0;
    const atkStancePenalty = (atkDefMod === 3) ? -3 : 0;  // Defensive stance only
    
    const baseToHit = atkSave + 3 + atkMod + atkStancePenalty;

    const defAttr = (atkTypeCode === "M" || atkTypeCode === "E") ? "mental_def" : "physical_def";
    const defBase = getAttrNum(defChar.id, defAttr, 0);
    
    // Read defense modifier from bar3 (stances, off balance, etc.)
    const defMod = num(defTok.get(CFG.DEF_MOD_BAR), 0);
    const defValue = defBase + defMod;

    const targetTotal = baseToHit - defValue;

    // Deduct push cost from attacker
    if (isPushing) {
      const atkTok = findObjs({ _type: "graphic", represents: atkCharId })[0];
      if (atkTok) {
        const atkPow0 = getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
        setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, atkPow0 - 2));
      }
    }

    // Determine outcome
    let outcome = "MISS";
    let isCrit = false;
    let isFumble = false;
    let critResult = null;
    let fumbleResult = null;

    if (nat === 20) {
      if (confirm > targetTotal) {
        isFumble = true;
        outcome = "FUMBLE";
        fumbleResult = rollFumbleTable();
      } else {
        outcome = "MISS";
      }
    } else if (nat === 1) {
      if (confirm <= targetTotal) {
        isCrit = true;
        outcome = "CRIT";
        critResult = rollCriticalTable();
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
      outcome, isCrit, isFumble, critResult, fumbleResult,
      damageTotal, dmgTypeStr, protKey, atkType,
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
    const defModLabel = defMod !== 0 ? `${defBase}${defMod >= 0 ? '+' : ''}${defMod}` : `${defBase}`;
    const atkPenaltyNote = atkStancePenalty !== 0 ? ` [Def Stance ${atkStancePenalty}]` : "";
    html += `<span style="color:#333; font-size:10px;" title="Attack type: ${atkTypeLabel}&#10;Roll: ${roll}&#10;Target Number: ${targetTotal}-&#10;${defTypeLabel}: ${defValue}">[${atkTypeLabel}] ${roll} vs ${targetTotal}- (${defTypeLabel}:${defModLabel})${atkPenaltyNote}</span>`;

    if (isCrit && critResult) {
      html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Critical hit effect">⚡ ${esc(critResult.desc)}</span>`;
      
      // Auto-apply Off Balance to target
      if (critResult.type === CRIT_TYPES.OFF_BALANCE) {
        html += applyOffBalance(defTok, defName);
      }
      // Auto-apply Muscle Strain (1 Hit to target)
      if (critResult.type === CRIT_TYPES.MUSCLE_STRAIN_TARGET) {
        const hits0 = getResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR);
        setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, Math.max(0, hits0 - 1));
        html += `<br/><span style="color:#e94560;"><b>${esc(defName)}</b> takes 1 Hit (muscle strain)! Hits: ${hits0}→${hits0-1}</span>`;
      }
    }
    if (isFumble && fumbleResult) {
      html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Fumble effect">💥 ${esc(fumbleResult.desc)}</span>`;
      
      // Auto-apply Off Balance to attacker
      if (fumbleResult.type === FUMBLE_TYPES.OFF_BALANCE_ATK) {
        const atkTok = findObjs({ _type: "graphic", represents: atkCharId })[0];
        if (atkTok) {
          html += applyOffBalance(atkTok, atkChar.get("name"));
        }
      }
      // Auto-apply strain damage to attacker
      if (fumbleResult.type === FUMBLE_TYPES.MUSCLE_STRAIN_ATK || 
          fumbleResult.type === FUMBLE_TYPES.LEG_STRAIN ||
          fumbleResult.type === FUMBLE_TYPES.ARM_STRAIN) {
        const atkTok = findObjs({ _type: "graphic", represents: atkCharId })[0];
        if (atkTok) {
          const atkHits0 = getResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
          setResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR, Math.max(0, atkHits0 - 1));
          html += `<br/><span style="color:#e94560;"><b>${esc(atkChar.get("name"))}</b> takes 1 Hit (strain)! Hits: ${atkHits0}→${atkHits0-1}</span>`;
        }
      }
    }
    if (isPushing) {
      html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Pushing: +2 damage, costs 2 Power">⚡ PUSH!</span>`;
    }

    html += `</div>`;

    let buttons = "";
    if (outcome === "HIT" || outcome === "CRIT") {
      if (atkType === "std") {
        buttons = buildStandardAttackButtons(rollId, critResult, causesKB);
      } else if (atkType === "sav") {
        buttons = buildSaveAttackButtons(rollId, critResult, isPushing);
      } else if (atkType === "snr") {
        buttons = buildSnareAttackButtons(rollId, critResult, isPushing);
      }
    }

    ch("MP", whisper + html + buttons);
  }

  // -------------------------
  // BUTTON BUILDERS
  // -------------------------

  function buildStandardAttackButtons(rollId, critResult, causesKB) {
    const critType = critResult ? critResult.type : null;
    let buttons = "";
    
    // Determine which apply mode to use based on crit type
    if (critType === CRIT_TYPES.HEAD_SHOT) {
      // Head shot: apply damage then double after prot/roll-with
      buttons = `[Apply (Head Shot)](!mp apply --id ${rollId} --mode headshot) `;
      buttons += `[RW + Head Shot](!mp apply --id ${rollId} --mode headshot_rw --amt ?{Divert to Power|0})`;
    } else if (critType === CRIT_TYPES.SOLID_HIT) {
      // Solid hit: +3 damage
      buttons = `[Apply (+3 Solid)](!mp apply --id ${rollId} --mode solid) `;
      buttons += `[RW Max (+3)](!mp apply --id ${rollId} --mode solid_rwmax) `;
      buttons += `[RW Custom (+3)](!mp apply --id ${rollId} --mode solid_rw --amt ?{Divert to Power|0})`;
    } else if (critType === CRIT_TYPES.PRECISE_HIT) {
      // Precise hit: halved roll-with
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[RW Max (½)](!mp apply --id ${rollId} --mode precise_rwmax) `;
      buttons += `[RW Custom (½)](!mp apply --id ${rollId} --mode precise_rw --amt ?{Divert to Power|0})`;
    } else if (critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
      // Avoid armor: ignore protection
      buttons = `[Apply (No Prot)](!mp apply --id ${rollId} --mode noprot) `;
      buttons += `[RW Max (No Prot)](!mp apply --id ${rollId} --mode noprot_rwmax) `;
      buttons += `[RW Custom (No Prot)](!mp apply --id ${rollId} --mode noprot_rw --amt ?{Divert to Power|0})`;
    } else {
      // Normal hit or other crit types
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax) `;
      buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0})`;
    }
    
    if (causesKB) {
      buttons += ` [KB](!mp kb --id ${rollId})`;
    }
    
    // Add limb shot saves if applicable
    if (critType === CRIT_TYPES.LEG_SHOT) {
      buttons += `<br/>[Leg Shot Saves](!mp limbsave --id ${rollId} --limb leg)`;
    } else if (critType === CRIT_TYPES.ARM_SHOT) {
      buttons += `<br/>[Arm Shot Saves](!mp limbsave --id ${rollId} --limb arm)`;
    } else if (critType === CRIT_TYPES.MUSCLE_STRAIN_TARGET) {
      buttons += `<br/><i>(+1 Hit to target's torso)</i>`;
    }
    
    return buttons;
  }

  function buildSaveAttackButtons(rollId, critResult, isPushing) {
    const critType = critResult ? critResult.type : null;
    let critMod = 0;
    
    // Solid Hit gives -3 to save TN for save attacks
    if (critType === CRIT_TYPES.SOLID_HIT) {
      critMod = -3;
    }
    
    const pushMod = isPushing ? -2 : 0;
    const totalMod = critMod + pushMod;
    
    let modLabel = "";
    if (totalMod !== 0) {
      modLabel = ` (${totalMod > 0 ? '+' : ''}${totalMod})`;
    }
    
    let buttons = `[Make Save${modLabel}](!mp save --id ${rollId} --critmod ${totalMod}) `;
    buttons += `[Save + Roll-With${modLabel}](!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod ${totalMod})`;
    
    return buttons;
  }

  function buildSnareAttackButtons(rollId, critResult, isPushing) {
    const critType = critResult ? critResult.type : null;
    let snCritBonus = 0;
    
    // Solid Hit gives +2 BP for snare attacks (equivalent benefit)
    if (critType === CRIT_TYPES.SOLID_HIT) {
      snCritBonus = 2;
    }
    
    const pushBonus = isPushing ? 2 : 0;
    const totalBonus = snCritBonus + pushBonus;
    
    let bonusLabel = "";
    if (totalBonus > 0) {
      bonusLabel = ` (+${totalBonus} BP)`;
    }
    
    return `[Apply Snare${bonusLabel}](!mp snare --id ${rollId} --bonus ${totalBonus})`;
  }

  // -------------------------
  // APPLY DAMAGE (4.8, 4.8.2, 4.8.3)
  // -------------------------

  function cmdApply(msg, args) {
    const rollId = args.id;
    const mode = args.mode || "noroll";
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    // Base raw damage
    let raw = num(rec.damageTotal, 0);
    
    // Add +3 for Solid Hit on standard attacks
    if (mode.includes("solid")) {
      raw += 3;
    }
    
    const protKey = rec.protKey;
    
    // Sum protection
    let prot = sumProtection(defChar.id, protKey);
    
    // Avoid Armor crits bypass protection
    if (mode.includes("noprot")) {
      prot = 0;
    }
    
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

    // Roll-with capacity: max divert = floor(current Power / 10)
    let maxDivert = Math.floor(pow0 / 10);
    
    // Precise Hit halves roll-with capacity
    if (mode.includes("precise")) {
      maxDivert = Math.floor(maxDivert / 2);
    }

    let divert = 0;
    if (mode.includes("rwmax") || mode === "rollwithmax") {
      divert = Math.min(maxDivert, penetrating);
    } else if (mode.includes("rw") || mode === "rollwithcustom") {
      const want = num(args.amt, 0);
      divert = Math.min(maxDivert, penetrating, Math.max(0, want));
    }

    // Damage to Hits after roll-with
    let toHits = Math.max(0, penetrating - divert);
    
    // Head Shot: DOUBLE Hits after protection and roll-with
    const isHeadShot = mode.includes("headshot");
    if (isHeadShot) {
      toHits = toHits * 2;
    }

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

    let effectNotes = "";
    if (isHeadShot) {
      effectNotes = ` <span style="color:#e94560;">[HEAD SHOT x2]</span>`;
    }
    if (mode.includes("solid")) {
      effectNotes += ` <span style="color:#8b4513;">[+3 Solid Hit]</span>`;
    }
    if (mode.includes("precise")) {
      effectNotes += ` <span style="color:#8be9fd;">[½ Roll-With]</span>`;
    }
    if (mode.includes("noprot")) {
      effectNotes += ` <span style="color:#ff79c6;">[No Protection]</span>`;
    }

    const msgLine =
      `<div style="background:#fff200; border:3px solid #000; padding:4px 8px;">` +
      `<span style="color:#000; font-weight:bold;" title="Target">${esc(rec.defName)}</span>:${effectNotes}` +
      `<br/><span title="Raw damage">${raw}</span>` +
      ` - <span title="Protection vs ${protKey}">${Math.floor(prot)}</span> prot` +
      ` = <span title="Penetrating damage">${penetrating}</span> pen` +
      (divert > 0 ? `, <span title="Roll-with (max ${maxDivert})">RW ${divert}</span>` : "") +
      (isHeadShot ? ` → ${penetrating - divert} x2` : "") +
      ` → <b title="Hits damage">${toHits}</b> to Hits` +
      (overflow > 0 ? ` <span title="Overflow to Power">(+${overflow} ovf)</span>` : "") +
      `<br/><span title="Hits">Hits: <b>${hits0}→${hits1}</b></span>` +
      ` | <span title="Power">Pwr: <b>${pow0}→${pow1}</b></span>` +
      statusLine +
      `</div>`;

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msgLine);
    
    // Store hits taken for limb shot saves
    state.MP_Engine.pending[rollId].hitsTaken = toHits;
  }

  // -------------------------
  // LIMB SHOT SAVES (4.14.2.2, 4.14.2.3)
  // -------------------------

  function cmdLimbSave(msg, args) {
    const rollId = args.id;
    const limb = args.limb; // "leg" or "arm"
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const hitsTaken = rec.hitsTaken || 0;
    
    // EN+7 save at -1 per Hit taken
    const enSave = getAttrNum(defChar.id, "endurance_save", 10);
    const enTN = enSave + 7 - hitsTaken;
    const enRoll = randomInteger(20);
    const enPass = (enRoll !== 20) && (enRoll <= enTN);
    
    // AG save at -1 per Hit taken
    const agSave = getAttrNum(defChar.id, "agility_save", 10);
    const agTN = agSave - hitsTaken;
    const agRoll = randomInteger(20);
    const agPass = (agRoll !== 20) && (agRoll <= agTN);
    
    const limbName = limb === "leg" ? "Leg" : "Arm";
    const loseEffect = limb === "leg" ? "loses use of leg" : "loses use of arm";
    const secondEffect = limb === "leg" ? "falls prone" : "drops held item";
    
    let msg_out = `<div style="background:#1a1a2e; border:2px solid #8be9fd; padding:8px; color:#eaeaea;">`;
    msg_out += `<b>${limbName} Shot Saves</b> (${esc(rec.defName)})<br/>`;
    msg_out += `Hits Taken: <b>${hitsTaken}</b><br/><br/>`;
    
    msg_out += `<b>EN+7 Save</b> (or ${loseEffect}):<br/>`;
    msg_out += `TN: ${enSave}+7-${hitsTaken} = <b>${enTN}-</b> | Roll: <b>${enRoll}</b> → `;
    msg_out += enPass ? `<span style="color:#50fa7b;">SAVED</span>` : `<span style="color:#e94560;">FAILED - ${loseEffect.toUpperCase()}</span>`;
    
    msg_out += `<br/><br/><b>AG Save</b> (or ${secondEffect}):<br/>`;
    msg_out += `TN: ${agSave}-${hitsTaken} = <b>${agTN}-</b> | Roll: <b>${agRoll}</b> → `;
    msg_out += agPass ? `<span style="color:#50fa7b;">SAVED</span>` : `<span style="color:#e94560;">FAILED - ${secondEffect.toUpperCase()}</span>`;
    
    msg_out += `</div>`;
    
    // Apply status markers
    if (!enPass) {
      if (limb === "leg") {
        defTok.set("status_broken-leg", true);
      } else {
        defTok.set("status_broken-shield", true);
      }
    }
    if (!agPass && limb === "leg") {
      defTok.set("status_prone", true);
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
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

    const massExpr = getAttr(defChar.id, "mass") || "1d4";
    const massRoll = rollExpr(massExpr);

    // Use stored hits taken if available
    const hitsTaken = rec.hitsTaken || 0;

    const kb = Math.max(0, hitsTaken - massRoll);

    let msg_out = `<b>Knockback vs ${esc(rec.defName)}</b><br/>` +
      `Hits Taken: <b>${hitsTaken}</b> - Mass(${esc(massExpr)}): <b>${massRoll}</b> = <b>${kb}"</b> KB`;

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

    // Critical mod (Solid Hit = -3 to save TN for save attacks)
    const critMod = num(args.critmod, 0);

    // Final save TN = base + attack mod + protection + roll-with + crit mod
    const tn = baseSave + num(rec.saveMod, 0) + Math.floor(prot) + rwPaid + critMod;

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
    const bonusBP = num(args.bonus, 0);
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Unknown roll id.`);

    const defTok = getObj("graphic", rec.defTokenId);
    if (!defTok) return ch("MP", `/w gm <b>MP:</b> Target token missing.`);

    let bp = Math.max(0, num(rec.snBP, 0)) + bonusBP;
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
      msg_out += `<br/>[Try Again](!mp break --target ${tokId}) [Push (+2)](!mp break --target ${tokId} --push 1)`;
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
  // STANCE & COMBAT MODIFIERS
  // -------------------------

  const STANCE = {
    NORMAL: { mod: 0, marker: "", name: "Normal" },
    DEFENSIVE: { mod: 3, marker: "blue", name: "Defensive (+3 def, -3 to hit)" },
    FULL_DEFENSE: { mod: 6, marker: "white-tower", name: "Full Defense (+6 def, ½ move, no attacks)" },
    OFF_BALANCE: { mod: -3, marker: "broken-heart", name: "Off Balance" }
  };

  function cmdStance(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a token first.`);
    }
    
    const char = getCharFromToken(tok);
    const charName = char ? char.get("name") : "Token";
    
    const stanceArg = (args.stance || "").toLowerCase();
    let stance;
    
    switch (stanceArg) {
      case "def":
      case "defensive":
        stance = STANCE.DEFENSIVE;
        break;
      case "full":
      case "fulldef":
      case "fulldefense":
        stance = STANCE.FULL_DEFENSE;
        break;
      case "offbal":
      case "offbalance":
        stance = STANCE.OFF_BALANCE;
        break;
      case "normal":
      case "clear":
      case "none":
      case "":
        stance = STANCE.NORMAL;
        break;
      default:
        // Check if it's a number for custom modifier
        const customMod = parseInt(stanceArg, 10);
        if (!isNaN(customMod)) {
          tok.set(CFG.DEF_MOD_BAR, customMod);
          ch("MP", `/w gm <b>${esc(charName)}</b>: Defense modifier set to <b>${customMod >= 0 ? '+' : ''}${customMod}</b>`);
          return;
        }
        return ch("MP", `/w gm <b>Stance Options:</b><br/>
          <code>!mp stance normal</code> - Clear modifiers<br/>
          <code>!mp stance def</code> - Defensive (+3 def, -3 to hit)<br/>
          <code>!mp stance full</code> - Full Defense (+6 def, ½ move)<br/>
          <code>!mp stance offbal</code> - Off Balance (-3 def)<br/>
          <code>!mp stance N</code> - Custom defense modifier`);
    }
    
    // Set bar3 value
    tok.set(CFG.DEF_MOD_BAR, stance.mod);
    
    // Clear previous stance markers
    tok.set("status_blue", false);
    tok.set("status_white-tower", false);
    tok.set("status_broken-heart", false);
    
    // Set new marker if any
    if (stance.marker) {
      tok.set("status_" + stance.marker, true);
    }
    
    const modStr = stance.mod >= 0 ? `+${stance.mod}` : `${stance.mod}`;
    ch("MP", `/w gm <b>${esc(charName)}</b>: ${stance.name} (Def ${modStr})`);
  }

  function cmdClearStances(msg, args) {
    // Clear stances for all selected tokens, or all tokens on page
    const selected = msg.selected || [];
    
    if (selected.length > 0) {
      selected.forEach(s => {
        const tok = getObj("graphic", s._id);
        if (tok) {
          tok.set(CFG.DEF_MOD_BAR, 0);
          tok.set("status_blue", false);
          tok.set("status_white-tower", false);
          tok.set("status_broken-heart", false);
        }
      });
      ch("MP", `/w gm Cleared stances for ${selected.length} selected token(s).`);
    } else {
      // Clear all tokens on the current page
      const pageId = Campaign().get("playerpageid");
      const tokens = findObjs({ _type: "graphic", _pageid: pageId, layer: "objects" });
      let count = 0;
      tokens.forEach(tok => {
        const bar3 = tok.get(CFG.DEF_MOD_BAR);
        if (bar3 && bar3 !== "0" && bar3 !== 0) {
          tok.set(CFG.DEF_MOD_BAR, 0);
          tok.set("status_blue", false);
          tok.set("status_white-tower", false);
          tok.set("status_broken-heart", false);
          count++;
        }
      });
      ch("MP", `/w gm Cleared stances for ${count} token(s) on page.`);
    }
  }

  function applyOffBalance(tok, charName) {
    tok.set(CFG.DEF_MOD_BAR, -3);
    tok.set("status_broken-heart", true);
    return `<br/><span style="color:#e94560;"><b>${esc(charName)}</b> is Off Balance! (-3 Def)</span>`;
  }

  // -------------------------
  // TEST/DEBUG COMMANDS (GM only)
  // -------------------------

  function cmdTest(msg, args) {
    if (!playerIsGM(msg.playerid)) {
      return ch("MP", "/w " + msg.who + " Only GM can use test commands.");
    }

    const subCmd = args.subcmd || "";
    
    switch (subCmd) {
      case "crit":
        return testForceCrit(msg, args);
      case "fumble":
        return testForceFumble(msg, args);
      case "damage":
        return testDamage(msg, args);
      case "save":
        return testSaveAttack(msg, args);
      case "snare":
        return testSnare(msg, args);
      case "status":
        return testStatus(msg, args);
      case "heal":
        return testHeal(msg, args);
      case "reset":
        return testReset(msg, args);
      default:
        return ch("MP", `/w gm <b>Test Commands:</b><br/>
          <code>!mp test crit [type]</code> - Force crit (types: headshot, solid, precise, armor, leg, arm, gear, free, muscle, offbal, other)<br/>
          <code>!mp test fumble [type]</code> - Force fumble<br/>
          <code>!mp test damage N</code> - Apply N raw damage to selected token<br/>
          <code>!mp test save BC MOD</code> - Test save attack (BC=EN/AG/IN/CL)<br/>
          <code>!mp test snare BP [MAX]</code> - Apply snare to selected token<br/>
          <code>!mp test heal N</code> - Heal N hits to selected token<br/>
          <code>!mp test reset</code> - Reset selected token to full Hits/Power<br/>
          <code>!mp test status</code> - Show selected token's full status`);
    }
  }

  function testForceCrit(msg, args) {
    const critTypeArg = (args.type || "").toLowerCase();
    const tok = getSelectedToken(msg);
    
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    // Map shorthand to crit type
    const typeMap = {
      "headshot": CRIT_TYPES.HEAD_SHOT,
      "head": CRIT_TYPES.HEAD_SHOT,
      "solid": CRIT_TYPES.SOLID_HIT,
      "precise": CRIT_TYPES.PRECISE_HIT,
      "armor": CRIT_TYPES.AVOID_HEAVY_ARMOR,
      "lightarmor": CRIT_TYPES.AVOID_LIGHT_ARMOR,
      "heavyarmor": CRIT_TYPES.AVOID_HEAVY_ARMOR,
      "leg": CRIT_TYPES.LEG_SHOT,
      "arm": CRIT_TYPES.ARM_SHOT,
      "gear": CRIT_TYPES.GEAR_SHOT,
      "free": CRIT_TYPES.FREE_ACTION,
      "muscle": CRIT_TYPES.MUSCLE_STRAIN_TARGET,
      "offbal": CRIT_TYPES.OFF_BALANCE,
      "offbalance": CRIT_TYPES.OFF_BALANCE,
      "other": CRIT_TYPES.OTHER
    };

    let critResult;
    if (critTypeArg && typeMap[critTypeArg]) {
      // Force specific crit type
      const forcedType = typeMap[critTypeArg];
      critResult = {
        roll: 0,
        type: forcedType,
        desc: `[FORCED] ${forcedType}`
      };
    } else {
      // Roll random crit
      critResult = rollCriticalTable();
    }

    // Create a fake pending record for testing
    const rollId = "test_" + String(Date.now()) + "_" + randomInteger(999999);
    const testDamage = num(args.damage, 10);
    
    state.MP_Engine.pending[rollId] = {
      rollId,
      playerid: msg.playerid,
      atkCharId: null,
      atkName: "TEST ATTACK",
      defTokenId: tok.id,
      defCharId: char.id,
      defName: char.get("name"),
      rowId: null,
      nat: 1,
      roll: 1,
      confirm: 1,
      targetTotal: 15,
      outcome: "CRIT",
      isCrit: true,
      isFumble: false,
      critResult: critResult,
      fumbleResult: null,
      damageTotal: testDamage,
      dmgTypeStr: "Kinetic",
      protKey: "kinetic",
      atkType: "std",
      atkAP: 0,
      saveBC: "",
      saveMod: 0,
      recMod: 0,
      snBP: 0,
      snMaxBP: 0,
      snType: "",
      causesKB: true,
      isPushing: false,
      created: Date.now()
    };

    let html = `<div style="background:#90ee90; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST CRIT!</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;">⚡ ${esc(critResult.desc)}</span>`;
    html += `<br/><span style="color:#333; font-size:10px;">Base Damage: ${testDamage} (use --damage N to change)</span>`;
    html += `</div>`;

    const buttons = buildStandardAttackButtons(rollId, critResult, true);

    ch("MP", "/w gm " + html + buttons);
  }

  function testForceFumble(msg, args) {
    const fumbleTypeArg = (args.type || "").toLowerCase();
    
    // Map shorthand to fumble type
    const typeMap = {
      "wrong": FUMBLE_TYPES.WRONG_TARGET,
      "wrongtarget": FUMBLE_TYPES.WRONG_TARGET,
      "offbal": FUMBLE_TYPES.OFF_BALANCE_ATK,
      "offbalance": FUMBLE_TYPES.OFF_BALANCE_ATK,
      "leg": FUMBLE_TYPES.LEG_STRAIN,
      "opening": FUMBLE_TYPES.LEFT_OPENING,
      "muscle": FUMBLE_TYPES.MUSCLE_STRAIN_ATK,
      "arm": FUMBLE_TYPES.ARM_STRAIN,
      "stuck": FUMBLE_TYPES.WEAPON_STUCK,
      "lost": FUMBLE_TYPES.LOST_OPPORTUNITY,
      "gear": FUMBLE_TYPES.GEAR_DAMAGE,
      "other": FUMBLE_TYPES.OTHER_FUMBLE
    };

    let fumbleResult;
    if (fumbleTypeArg && typeMap[fumbleTypeArg]) {
      const forcedType = typeMap[fumbleTypeArg];
      fumbleResult = {
        roll: 0,
        type: forcedType,
        desc: `[FORCED] ${forcedType}`
      };
    } else {
      fumbleResult = rollFumbleTable();
    }

    let html = `<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST FUMBLE!</span>`;
    html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;">💥 ${esc(fumbleResult.desc)}</span>`;
    html += `</div>`;

    ch("MP", "/w gm " + html);
  }

  function testDamage(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const rawDamage = num(args.amount, 10);
    const dmgType = (args.dtype || "kinetic").toLowerCase();
    const protKey = typeToProtKey(dmgType);
    const ignoreProt = (args.noprot === "1");
    const isHeadshot = (args.headshot === "1");

    // Create test pending record
    const rollId = "test_" + String(Date.now()) + "_" + randomInteger(999999);
    
    state.MP_Engine.pending[rollId] = {
      rollId,
      playerid: msg.playerid,
      atkCharId: null,
      atkName: "TEST DAMAGE",
      defTokenId: tok.id,
      defCharId: char.id,
      defName: char.get("name"),
      rowId: null,
      nat: 5,
      roll: 5,
      confirm: 10,
      targetTotal: 15,
      outcome: "HIT",
      isCrit: false,
      isFumble: false,
      critResult: null,
      fumbleResult: null,
      damageTotal: rawDamage,
      dmgTypeStr: dmgType.charAt(0).toUpperCase() + dmgType.slice(1),
      protKey: protKey,
      atkType: "std",
      atkAP: ignoreProt ? Infinity : 0,
      saveBC: "",
      saveMod: 0,
      recMod: 0,
      snBP: 0,
      snMaxBP: 0,
      snType: "",
      causesKB: true,
      isPushing: false,
      created: Date.now()
    };

    let html = `<div style="background:#8be9fd; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST DAMAGE</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#333; font-size:11px;">Raw: ${rawDamage} | Type: ${dmgType}${ignoreProt ? " | NO PROT" : ""}${isHeadshot ? " | HEADSHOT x2" : ""}</span>`;
    html += `</div>`;

    let mode = ignoreProt ? "noprot" : "noroll";
    if (isHeadshot) mode = "headshot";

    const buttons = `[Apply](!mp apply --id ${rollId} --mode ${mode}) ` +
      `[RW Max](!mp apply --id ${rollId} --mode ${mode === "noprot" ? "noprot_rwmax" : (isHeadshot ? "headshot_rw" : "rollwithmax")}) ` +
      `[RW Custom](!mp apply --id ${rollId} --mode ${mode === "noprot" ? "noprot_rw" : (isHeadshot ? "headshot_rw" : "rollwithcustom")} --amt ?{Divert to Power|0}) ` +
      `[KB](!mp kb --id ${rollId})`;

    ch("MP", "/w gm " + html + buttons);
  }

  function testSaveAttack(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const bc = (args.bc || "EN").toUpperCase();
    const saveMod = num(args.mod, 0);
    const recMod = num(args.rec, -14);
    const dmgType = (args.dtype || "psychic").toLowerCase();
    const protKey = typeToProtKey(dmgType);

    const rollId = "test_" + String(Date.now()) + "_" + randomInteger(999999);
    
    state.MP_Engine.pending[rollId] = {
      rollId,
      playerid: msg.playerid,
      atkCharId: null,
      atkName: "TEST SAVE ATTACK",
      defTokenId: tok.id,
      defCharId: char.id,
      defName: char.get("name"),
      rowId: null,
      nat: 5,
      roll: 5,
      confirm: 10,
      targetTotal: 15,
      outcome: "HIT",
      isCrit: false,
      isFumble: false,
      critResult: null,
      fumbleResult: null,
      damageTotal: 0,
      dmgTypeStr: dmgType.charAt(0).toUpperCase() + dmgType.slice(1),
      protKey: protKey,
      atkType: "sav",
      atkAP: 0,
      saveBC: bc,
      saveMod: saveMod,
      recMod: recMod,
      snBP: 0,
      snMaxBP: 0,
      snType: "",
      causesKB: false,
      isPushing: false,
      created: Date.now()
    };

    let html = `<div style="background:#ff79c6; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST SAVE ATTACK</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#333; font-size:11px;">Save BC: ${bc} | Mod: ${saveMod} | Recovery: ${recMod}</span>`;
    html += `</div>`;

    const buttons = `[Make Save](!mp save --id ${rollId} --critmod 0) ` +
      `[Save + Roll-With](!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod 0)`;

    ch("MP", "/w gm " + html + buttons);
  }

  function testSnare(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const bp = num(args.bp, 12);
    const maxBp = num(args.max, bp + 6);
    const snType = args.type || "Ice";

    const rollId = "test_" + String(Date.now()) + "_" + randomInteger(999999);
    
    state.MP_Engine.pending[rollId] = {
      rollId,
      playerid: msg.playerid,
      atkCharId: null,
      atkName: "TEST SNARE",
      defTokenId: tok.id,
      defCharId: char.id,
      defName: char.get("name"),
      rowId: null,
      nat: 5,
      roll: 5,
      confirm: 10,
      targetTotal: 15,
      outcome: "HIT",
      isCrit: false,
      isFumble: false,
      critResult: null,
      fumbleResult: null,
      damageTotal: 0,
      dmgTypeStr: "Entropy",
      protKey: "entropy",
      atkType: "snr",
      atkAP: 0,
      saveBC: "",
      saveMod: 0,
      recMod: 0,
      snBP: bp,
      snMaxBP: maxBp,
      snType: snType,
      causesKB: false,
      isPushing: false,
      created: Date.now()
    };

    let html = `<div style="background:#50fa7b; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST SNARE</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#333; font-size:11px;">Type: ${snType} | BP: ${bp} | Max: ${maxBp}</span>`;
    html += `</div>`;

    const buttons = `[Apply Snare](!mp snare --id ${rollId} --bonus 0)`;

    ch("MP", "/w gm " + html + buttons);
  }

  function testHeal(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const healAmount = num(args.amount, 10);
    const healPower = num(args.power, 0);

    const hits0 = getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow0 = getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);

    const hits1 = Math.min(hitsMax, hits0 + healAmount);
    const pow1 = Math.min(powMax, pow0 + healPower);

    setResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
    if (healPower > 0) {
      setResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }

    // Clear status markers if healed above thresholds
    if (hits1 > 0) {
      tok.set("status_dead", false);
    }
    if (hits1 > Math.floor(hitsMax / 2)) {
      tok.set("status_sleepy", false);
    }

    let msg_out = `<b>🧪 TEST HEAL</b> (${esc(char.get("name"))})<br/>` +
      `Hits: <b>${hits0} → ${hits1}</b> / ${hitsMax}`;
    if (healPower > 0) {
      msg_out += `<br/>Power: <b>${pow0} → ${pow1}</b> / ${powMax}`;
    }

    ch("MP", "/w gm " + msg_out);
  }

  function testReset(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const hitsMax = getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const powMax = getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);

    setResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR, hitsMax);
    setResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR, powMax);
    tok.set(CFG.DEF_MOD_BAR, 0);

    // Clear all status markers
    tok.set("status_dead", false);
    tok.set("status_sleepy", false);
    tok.set("status_prone", false);
    tok.set("status_cobweb", false);
    tok.set("status_grab", false);
    tok.set("status_broken-leg", false);
    tok.set("status_broken-shield", false);
    tok.set("status_blue", false);
    tok.set("status_white-tower", false);
    tok.set("status_broken-heart", false);

    // Clear snares
    delete state.MP_Engine.snares[tok.id];

    ch("MP", `/w gm <b>🧪 RESET</b> ${esc(char.get("name"))}: Hits ${hitsMax}, Power ${powMax}, defense mod 0, all status cleared.`);
  }

  function testStatus(msg, args) {
    const tok = getSelectedToken(msg);
    if (!tok) {
      return ch("MP", `/w gm Select a target token first.`);
    }
    
    const char = getCharFromToken(tok);
    if (!char) {
      return ch("MP", `/w gm Token not linked to a character.`);
    }

    const hits = getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow = getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);
    const defMod = num(tok.get(CFG.DEF_MOD_BAR), 0);

    const enSave = getAttrNum(char.id, "endurance_save", 10);
    const agSave = getAttrNum(char.id, "agility_save", 10);
    const inSave = getAttrNum(char.id, "intelligence_save", 10);
    const clSave = getAttrNum(char.id, "cool_save", 10);

    const physDef = getAttrNum(char.id, "physical_def", 0);
    const mentDef = getAttrNum(char.id, "mental_def", 0);

    const kinProt = sumProtection(char.id, "kinetic");
    const engProt = sumProtection(char.id, "energy");
    const entProt = sumProtection(char.id, "entropy");
    const psyProt = sumProtection(char.id, "psychic");
    const bioProt = sumProtection(char.id, "bio");
    const othProt = sumProtection(char.id, "other");

    const hth = getAttr(char.id, "hth_damage") || "?";
    const mass = getAttr(char.id, "mass") || "?";

    const snare = state.MP_Engine.snares[tok.id];

    let msg_out = `<div style="background:#1a1a2e; border:2px solid #8be9fd; padding:8px; color:#eaeaea;">`;
    msg_out += `<b style="color:#f4d03f;">${esc(char.get("name"))}</b><br/>`;
    msg_out += `<b>Hits:</b> ${hits}/${hitsMax} | <b>Power:</b> ${pow}/${powMax}<br/>`;
    msg_out += `<b>Saves:</b> EN ${enSave}- | AG ${agSave}- | IN ${inSave}- | CL ${clSave}-<br/>`;
    
    // Show defense with modifier
    const physTotal = physDef + defMod;
    const mentTotal = mentDef + defMod;
    const defModStr = defMod !== 0 ? ` (${defMod >= 0 ? '+' : ''}${defMod})` : "";
    msg_out += `<b>Defense:</b> Phys ${physDef}${defModStr}=${physTotal} | Ment ${mentDef}${defModStr}=${mentTotal}<br/>`;
    
    // Stance indicator
    if (defMod === 3) {
      msg_out += `<span style="color:#8be9fd;"><b>Stance:</b> Defensive (+3 def, -3 to hit)</span><br/>`;
    } else if (defMod === 6) {
      msg_out += `<span style="color:#50fa7b;"><b>Stance:</b> Full Defense (+6 def, ½ move)</span><br/>`;
    } else if (defMod === -3) {
      msg_out += `<span style="color:#e94560;"><b>Status:</b> Off Balance</span><br/>`;
    } else if (defMod !== 0) {
      msg_out += `<span style="color:#f4d03f;"><b>Def Mod:</b> ${defMod >= 0 ? '+' : ''}${defMod}</span><br/>`;
    }
    
    msg_out += `<b>Protection:</b> Kin ${kinProt} | Eng ${engProt} | Ent ${entProt} | Psy ${psyProt} | Bio ${bioProt} | Oth ${othProt}<br/>`;
    msg_out += `<b>HTH:</b> ${hth} | <b>Mass:</b> ${mass}<br/>`;
    msg_out += `<b>Roll-With Cap:</b> ${Math.floor(pow / 10)}`;
    
    if (snare) {
      msg_out += `<br/><span style="color:#e94560;"><b>Snared:</b> ${snare.type} (BP ${snare.bp || "N/A"}) by ${snare.source}</span>`;
    }

    msg_out += `</div>`;

    ch("MP", "/w gm " + msg_out);
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
    // Handle rolltemplate FIRST
    if (msg.rolltemplate === "mpattack") {
      return handleMpAttack(msg);
    }

    // Handle commands
    if (!msg.content || msg.content.indexOf("!mp") !== 0) return;

    const parsed = parseArgs(msg.content);
    const cmd = parsed.cmd;
    const args = parsed.args;

    switch (cmd) {
      case "test":
        // Parse test subcommand and args
        const testParts = msg.content.split(/\s+/);
        const testArgs = { subcmd: testParts[2] || "" };
        // Parse remaining args based on subcommand
        if (testArgs.subcmd === "crit") {
          testArgs.type = testParts[3] || "";
          testArgs.damage = testParts[4] || "10";
        } else if (testArgs.subcmd === "fumble") {
          testArgs.type = testParts[3] || "";
        } else if (testArgs.subcmd === "damage") {
          testArgs.amount = testParts[3] || "10";
          testArgs.dtype = testParts[4] || "kinetic";
          // Check for flags
          for (let i = 3; i < testParts.length; i++) {
            if (testParts[i] === "--noprot") testArgs.noprot = "1";
            if (testParts[i] === "--headshot") testArgs.headshot = "1";
          }
        } else if (testArgs.subcmd === "save") {
          testArgs.bc = testParts[3] || "EN";
          testArgs.mod = testParts[4] || "0";
          testArgs.rec = testParts[5] || "-14";
        } else if (testArgs.subcmd === "snare") {
          testArgs.bp = testParts[3] || "12";
          testArgs.max = testParts[4] || "";
          testArgs.type = testParts[5] || "Ice";
        } else if (testArgs.subcmd === "heal") {
          testArgs.amount = testParts[3] || "10";
          testArgs.power = testParts[4] || "0";
        }
        return cmdTest(msg, testArgs);
      case "stance":
        const stanceParts = msg.content.split(/\s+/);
        return cmdStance(msg, { stance: stanceParts[2] || "" });
      case "clearstances":
      case "clearstance":
        return cmdClearStances(msg, args);
      case "offbal":
      case "offbalance":
        const offbalTok = getSelectedToken(msg);
        if (!offbalTok) return ch("MP", `/w gm Select a token first.`);
        const offbalChar = getCharFromToken(offbalTok);
        const offbalName = offbalChar ? offbalChar.get("name") : "Token";
        ch("MP", "/w gm " + applyOffBalance(offbalTok, offbalName));
        return;
      case "config": 
        const configParts = msg.content.split(/\s+/);
        return cmdConfig(msg, { setting: args.setting || configParts[2], value: args.value || configParts[3] });
      case "apply": return cmdApply(msg, args);
      case "limbsave": return cmdLimbSave(msg, args);
      case "save": return cmdSave(msg, args);
      case "recover": return cmdRecover(msg, args);
      case "snare": return cmdSnare(msg, args);
      case "break": return cmdBreak(msg, args);
      case "kb": return cmdKnockback(msg, args);
      case "kbsave": return cmdKBSave(msg, args);
      case "grapple": return cmdGrapple(msg, args);
      case "squeeze": return cmdSqueeze(msg, args);
      case "grapplebreak": return cmdGrappleBreak(msg, args);
      case "escape": return cmdGrappleBreak(msg, args);
      case "wakeup": return cmdWakeup(msg, args);
      case "status": return cmdStatus(msg, args);
      case "help":
      default:
        return ch("MP", `/w gm <b>MP Engine v2.2</b> Commands:<br/>
          <b>Combat:</b><br/>
          <code>!mp apply --id ID --mode MODE --amt N</code><br/>
          <code>!mp limbsave --id ID --limb leg|arm</code><br/>
          <code>!mp save --id ID --rollwith N --critmod N</code><br/>
          <code>!mp recover --target TOKID --bc BC --tn N</code><br/>
          <code>!mp snare --id ID --bonus N</code><br/>
          <code>!mp break --target TOKID --push 0|1</code><br/>
          <code>!mp kb --id ID</code><br/>
          <code>!mp kbsave --target TOKID --penalty N</code><br/>
          <code>!mp grapple --atk TOKID --def TOKID</code><br/>
          <code>!mp wakeup --target TOKID</code><br/>
          <code>!mp status --target TOKID</code><br/>
          <b>Stances (Bar3):</b><br/>
          <code>!mp stance normal|def|full|offbal|N</code><br/>
          <code>!mp clearstances</code> - Clear all on page<br/>
          <code>!mp offbal</code> - Apply Off Balance to selected<br/>
          <b>Test Commands:</b><br/>
          <code>!mp test</code> - Show all test commands`);
    }
  }

  // -------------------------
  // INIT
  // -------------------------
  on("chat:message", onChat);

  ch("MP", `/w gm <b>MP Engine v2.2:</b> Loaded. Type <code>!mp test</code> for debug commands.`);

  return { CFG, CRIT_TYPES, FUMBLE_TYPES, rollExpr };
})();

on("ready", function() {
  log("MP ENGINE v2.2 READY");
});
