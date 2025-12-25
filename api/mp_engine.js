/* Mighty Protectors Roll20 API Engine v2.10 (Autofire command)
 * Handles all dmgtype variations: K/Kin/Kinetic, E/Eng/Energy, etc.
 * Separate PR/Charges columns, Armor Piercing rules
 * Protection notation: 5=prot, 5h=hardened, 5/4=invuln, 5h/4=both
 * Range uses edge-to-edge distance (adjacent tokens = 0")
 * 
 * Works with sheet's mpattack rolltemplate:
 *  {{mpapi=1}} {{atk=<character_id>}} {{def=<target token_id>}} {{row=<rowid>}}
 *  {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[...]]}} {{damage=[[...]]}} {{type=...}}
 */
log("MP ENGINE v2.10 FILE STARTING");

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
    const raw = String(typeStr || "").trim();
    const t = raw.toLowerCase();
    // Some save attacks (e.g., Flash) explicitly have *no damage type*.
    // In those cases, the rules say normal protection doesn't apply.
    // Represent "no type" as null so callers can bypass protection.
    if (!t || t === "none" || t === "no" || t === "n/a" || t === "no damage type" || t === "no dmg type" || t === "notype") {
      return null;
    }
    if (t.includes("kinetic") || t === "kin" || t === "k") return "kinetic";
    if (t.includes("energy") || t === "eng" || t === "e") return "energy";
    if (t.includes("entropy") || t === "ent") return "entropy";
    if (t.includes("psychic") || t === "psy" || t === "p") return "psychic";
    if (t.includes("bio") || t.includes("biochem") || t === "b") return "bio";
    if (t === "o" || t === "oth" || t.includes("other")) return "other";
    return "other";
  }

  // Heuristic: allow save attacks to opt into "no damage type" behavior via notes.
  // Examples that will trigger this:
  //   "dtype:none" / "dmgtype:none" / "no damage type" / "notype"
  // Also includes a light fallback for common naming ("Flash") since that power explicitly has no type.
  function notesIndicateNoDamageType(notes, attackLabel) {
    const s = String(notes || "").toLowerCase();
    const n = String(attackLabel || "").toLowerCase();

    if (s.includes("dtype:none") || s.includes("dmgtype:none") || s.includes("no damage type") || s.includes("no dmg type") || s.includes("notype") || s.includes("no-type")) {
      return true;
    }
    // Optional safety net for Flash-style saves when the GM hasn't added a flag yet.
    if (n.includes("flash") && (s.includes("sav:") || s.includes("save"))) {
      return true;
    }
    return false;
  }

  // Parse protection value - supports:
  // "5" = 5 prot
  // "5h" = 5 hardened prot
  // "1/4" = invuln only (0 prot)
  // "5/4" = 5 prot + invuln
  // "5h/4" = 5 hardened + invuln
  // Returns { prot: number, hardened: number, invuln: boolean }
  function parseProtValue(val) {
    const s = String(val || "").toLowerCase().trim();
    if (!s || s === "0") return { prot: 0, hardened: 0, invuln: false };

    // IMPORTANT: treat "1/4" as invulnerability only (no numeric protection)
    if (s === "1/4") return { prot: 0, hardened: 0, invuln: true };

    const hasInvuln = s.includes("/4");
    const withoutInvuln = hasInvuln ? s.replace("/4", "") : s;

    const isHardened = withoutInvuln.endsWith("h");
    const numStr = isHardened ? withoutInvuln.slice(0, -1) : withoutInvuln;
    const prot = parseFloat(numStr) || 0;

    return {
      prot: prot,
      hardened: isHardened ? prot : 0,
      invuln: hasInvuln
    };
  }


  // Sum protection, hardened, and invuln for a specific damage type
  // Returns { prot: total protection, hardened: total hardened, invuln: boolean }
  function sumProtectionWithHardened(charId, protKey) {
    if (!protKey) return { prot: 0, hardened: 0, invuln: false };
    const re = new RegExp("^repeating_protection_.*_prot_" + protKey + "$");
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    let totalProt = 0;
    let totalHardened = 0;
    let hasInvuln = false;
    
    attrs.forEach(a => {
      const n = a.get("name");
      if (re.test(n)) {
        const parsed = parseProtValue(a.get("current"));
        totalProt += parsed.prot;
        totalHardened += parsed.hardened;
        if (parsed.invuln) hasInvuln = true;
      }
    });
    
    return { prot: totalProt, hardened: totalHardened, invuln: hasInvuln };
  }

  // Legacy function for compatibility - just returns protection total
  function sumProtection(charId, protKey) {
    return sumProtectionWithHardened(charId, protKey).prot;
  }

  // Get total hardened for a specific damage type
  function sumHardened(charId, protKey) {
    return sumProtectionWithHardened(charId, protKey).hardened;
  }
  
  // Check if character has invulnerability for a damage type (from protection rows)
  function hasInvulnerability(charId, protKey) {
    return sumProtectionWithHardened(charId, protKey).invuln;
  }

  
  // --- Vulnerability automation (Weakness: Vulnerability) -----------------
  // Minimal, opt-in parsing: define your vulnerability in an "Ability" row
  // named "Vulnerability" (or similar) and put one or more of these lines in Notes:
  //   Attract: Energy -2
  //   Vulnerable: Kinetic +2
  // You can list multiple types on separate lines; numbers are in points.
  //
  // Attract  => reduces protection against that damage type
  // Vulnerable => increases penetrating damage after protection
  const MP_DAMAGE_TYPES = ["Kinetic","Energy","Biochemical","Entropy","Psychic","Other"];

  function _normKey(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[_\-]+/g, " ")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function _extractDamageTypes(line) {
    const found = [];
    const low = String(line || "").toLowerCase();
    MP_DAMAGE_TYPES.forEach(dt => {
      const dlow = dt.toLowerCase();
      // allow "bio" for biochemical
      if (dlow === "biochemical") {
        if (/\bbio\b|\bbiochem\b|\bbiochemical\b/.test(low)) found.push("Biochemical");
      } else if (new RegExp("\\b" + dlow + "\\b").test(low)) {
        found.push(dt);
      }
    });
    return found;
  }

  function _extractSignedNumber(line) {
    // Ignore fractions like "1/4" (we only want plain integers for Vulnerability rules)
    const m = String(line || "").match(/([+\-]?\d+)(?!\s*\/)\s*(?:pts?|points?|prot|def|damage|dmg)?\b/i);

    if (!m) return null;
    return parseInt(m[1], 10);
  }

  function getRepeatingAbilityRows(charId) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    const byRow = {};
    attrs.forEach(a => {
      const n = a.get("name");
      const m = n.match(/^repeating_abilities_([^_]+)_(ability_name|ability_notes|ability_type|ability_cp)$/);
      if (!m) return;
      const rowId = m[1];
      const field = m[2];
      byRow[rowId] = byRow[rowId] || {};
      byRow[rowId][field] = a.get("current");
    });
    return Object.values(byRow);
  }

  function getVulnerabilityMods(charId, damageType) {
    const dt = (damageType || "").trim();
    if (!dt) return { protMod: 0, dmgMod: 0, notes: [] };

    let protMod = 0; // negative reduces protection
    let dmgMod = 0;  // positive adds to penetrating damage
    const notes = [];

    const rows = getRepeatingAbilityRows(charId);
    rows.forEach(r => {
      const nm = _normKey(r.ability_name);

      // Don't misread "Invulnerability" as "Vulnerability"
      if (nm.includes("invulner")) return;
      if (!nm.includes("vulner")) return;


      const rawNotes = String(r.ability_notes || "");
      const lines = rawNotes.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);

      // If notes are empty, try to glean from the name itself.
      const scanLines = lines.length ? lines : [String(r.ability_name || "")];

      scanLines.forEach(line => {
        const low = line.toLowerCase();
        const kinds = [];
        if (/\battract\b/.test(low)) kinds.push("attract");

        // Require the actual word "vulnerable" and avoid matching "invulnerable"
        if (/\binvulner/.test(low)) return;
        if (/\bvulnerable\b/.test(low)) kinds.push("vulnerable");

        if (!kinds.length) return;

        const dts = _extractDamageTypes(line);
        if (!dts.length) return;

        const numRaw = _extractSignedNumber(line);
        if (numRaw === null) return;

        // Apply only if this line mentions the current damage type
        if (!dts.some(x => x.toLowerCase() === dt.toLowerCase())) return;

        if (kinds.includes("attract")) {
          const delta = -Math.abs(numRaw);
          protMod += delta;
          notes.push(`Attract: ${dt} ${delta}`);
        }
        if (kinds.includes("vulnerable")) {
          const delta = Math.abs(numRaw);
          dmgMod += delta;
          notes.push(`Vulnerable: ${dt} +${delta}`);
        }
      });
    });

    return { protMod, dmgMod, notes };
  }
  // ------------------------------------------------------------------------

function getRepeatingAttackAttr(charId, rowId, shortName) {
    const searchName = `repeating_attacks_${rowId}_${shortName}`.toLowerCase();
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const found = attrs.find(a => a.get("name").toLowerCase() === searchName);
    return found ? found.get("current") : "";
  }

  function setRepeatingAttackAttr(charId, rowId, shortName, value) {
    const searchName = `repeating_attacks_${rowId}_${shortName}`.toLowerCase();
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const found = attrs.find(a => a.get("name").toLowerCase() === searchName);
    if (found) {
      found.set("current", value);
      return true;
    }
    return false;
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
  // RANGE CALCULATION (4.7.3)
  // -------------------------

  // Range penalty table: [maxInches, penalty]
  const RANGE_TABLE = [
    [4, 0],
    [9, -1],
    [19, -2],
    [39, -3],
    [79, -4],
    [159, -5],
    [319, -6],
    [639, -7],
    [1279, -8],
    [2559, -9],
    [5119, -10],
    [10239, -11],
    [Infinity, -12]
  ];

  function getRangePenalty(inches) {
    for (let i = 0; i < RANGE_TABLE.length; i++) {
      if (inches <= RANGE_TABLE[i][0]) {
        return RANGE_TABLE[i][1];
      }
    }
    return -12;
  }

  function calculateRange(atkTok, defTok) {
    if (!atkTok || !defTok) return { inches: 0, penalty: 0 };

    const pageId = atkTok.get("_pageid");
    const page = getObj("page", pageId);

    // Roll20 grid is always 70px per cell
    const gridPx = 70;

    // Get center positions and token sizes
    const ax = atkTok.get("left");
    const ay = atkTok.get("top");
    const aw = atkTok.get("width") || 70;
    const ah = atkTok.get("height") || 70;
    
    const bx = defTok.get("left");
    const by = defTok.get("top");
    const bw = defTok.get("width") || 70;
    const bh = defTok.get("height") || 70;

    // Calculate edge-to-edge distance (gap between bounding boxes)
    // Negative gap means overlap = 0 distance
    const gapX = Math.abs(bx - ax) - (aw / 2) - (bw / 2);
    const gapY = Math.abs(by - ay) - (ah / 2) - (bh / 2);
    
    const dxPx = Math.max(0, gapX);
    const dyPx = Math.max(0, gapY);
    
    // Convert to grid squares
    const dx = dxPx / gridPx;
    const dy = dyPx / gridPx;

    // Match Roll20 ruler diagonal setting
    const diag = page ? (page.get("diagonaltype") || "foure") : "foure";

    let distSquares;
    switch (diag) {
      case "foure": // 5E/4E: diagonals count as 1
        distSquares = Math.max(dx, dy);
        break;
      case "threefive": { // 3.5E: every 2nd diagonal counts extra
        const min = Math.min(dx, dy);
        const max = Math.max(dx, dy);
        distSquares = max + Math.floor(min / 2);
        break;
      }
      case "manhattan":
        distSquares = dx + dy;
        break;
      case "pythagorean":
        distSquares = Math.sqrt(dx * dx + dy * dy);
        break;
      default:
        distSquares = Math.max(dx, dy);
        break;
    }

    // MP scale: 1" = 5 ft. If page scale is 5 ft/square, then 1 square = 1"
    const scaleNumber = page ? (parseFloat(page.get("scale_number")) || 5) : 5;
    const inchesPerSquare = scaleNumber / 5;

    const distInches = distSquares * inchesPerSquare;

    return {
      inches: Math.round(distInches * 10) / 10,
      penalty: getRangePenalty(distInches)
    };
  }


  function calculateRangeWithProfile(atkTok, defTok, atkCharId, defCharId) {
    const baseRange = calculateRange(atkTok, defTok);
    if (baseRange.inches === 0) return baseRange;
    
    // Get profiles (default 1)
    const atkProfile = getAttrNum(atkCharId, "profile", 1) || 1;
    const defProfile = getAttrNum(defCharId, "profile", 1) || 1;
    
    // Adjusted range = actual range * attacker profile / target profile
    const adjustedInches = (baseRange.inches * atkProfile) / defProfile;
    
    return {
      inches: Math.round(baseRange.inches * 10) / 10,
      adjustedInches: Math.round(adjustedInches * 10) / 10,
      penalty: getRangePenalty(adjustedInches),
      atkProfile,
      defProfile,
      profileAdjusted: (atkProfile !== 1 || defProfile !== 1)
    };
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
    const pushAmount = num(fields.push, 0);  // 0=no push, 2=normal, 4+=special ability
    const isPushing = pushAmount > 0;

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
    const atkType = getAtkAttr("attack_type") || "std";
    const atkMod = num(getAtkAttr("attack_mod"), 0);
    const macroMod = num(fields.hitmod, 0);  // Extra modifier from macro
    const dmgTypeRaw = (getAtkAttr("attack_dmgtype") || "Kin").toLowerCase();
    const dmgTypeMap = {k:"Kinetic", kin:"Kinetic", kinetic:"Kinetic", e:"Energy", eng:"Energy", energy:"Energy", b:"Biochemical", bio:"Biochemical", biochemical:"Biochemical", ent:"Entropy", entropy:"Entropy", p:"Psychic", psy:"Psychic", psychic:"Psychic", o:"Other", oth:"Other", other:"Other"};
    const dmgTypeStr = dmgTypeMap[dmgTypeRaw] || fields.type || "Other";
    // Allow save attacks to declare they have no damage type (e.g., Flash) so protection does not apply.
    const atkNotes = getAtkAttr("attack_notes") || "";
    const noDamageType = (atkType === "sav") && notesIndicateNoDamageType(atkNotes, atkName);
    const protKey = noDamageType ? null : typeToProtKey(dmgTypeStr);
    const range = getAtkAttr("attack_range") || fields.range || "-";
    const kbChecked = getAtkAttr("attack_kb");
    const causesKB = (kbChecked === "1") || (fields.kb && fields.kb.toLowerCase() === "yes");

    const atkAPRaw = getAtkAttr("attack_ap") || fields.ap || "";
    const atkAP = (atkAPRaw === "ALL" || atkAPRaw === "all") ? Infinity : num(atkAPRaw, 0);
    const saveBC = getAtkAttr("attack_save_bc") || "";
    const saveMod = num(getAtkAttr("attack_save_mod"), 0);
    const recMod = num(getAtkAttr("attack_recovery"), 0);
    const snBP = num(getAtkAttr("attack_bp"), 0);
    const snMaxBP = num(getAtkAttr("attack_max_bp"), 0);
    const snType = getAtkAttr("attack_snare_type") || "";
    
    // PR cost from dedicated attack_cost column (simple number)
    // Skip if nopr flag is set (autofire handles costs upfront)
    const skipCosts = (fields.nopr === "1");
    const atkPR = skipCosts ? 0 : num(getAtkAttr("attack_cost") || fields.cost || "", 0);
    // Charges: if attack_charges field has a value, deduct 1 per attack
    const atkChgRaw = getAtkAttr("attack_charges");
    const hasCharges = !skipCosts && (atkChgRaw !== undefined && atkChgRaw !== null && String(atkChgRaw).trim() !== "");
    const atkChgCost = hasCharges ? 1 : 0;


    let atkSaveAttr;
    if (atkTypeCode === "M") atkSaveAttr = "intelligence_save";
    else if (atkTypeCode === "E") atkSaveAttr = "cool_save";
    else atkSaveAttr = "agility_save";

    const atkSave = getAttrNum(atkCharId, atkSaveAttr, 10);
    
    // Check if attacker is in Defensive stance (bar3 = 3) - they take -3 to hit
    // Check if attacker is in Full Defense (bar3 = 6) - they cannot attack
    // Find attacker token on same page as defender to avoid cross-page distance issues
    const defPageId = defTok.get("_pageid");
    const atkTok = findObjs({ _type: "graphic", represents: atkCharId, _pageid: defPageId })[0];
    const atkDefMod = atkTok ? num(atkTok.get(CFG.DEF_MOD_BAR), 0) : 0;
    
    // Block attacks in Full Defense
    if (atkDefMod === 6) {
      ch("MP", `/w gm <div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px;"><b>${esc(atkChar.get("name"))}</b> is in <b>Full Defense</b> and cannot attack!</div>`);
      return;
    }
    
    const atkStancePenalty = (atkDefMod === 3) ? -3 : 0;  // Defensive stance only
    
    // Calculate range from token positions (4.7.3)
    const rangeData = calculateRangeWithProfile(atkTok, defTok, atkCharId, defChar.id);
    const rangePenalty = rangeData.penalty;
    
    const baseToHit = atkSave + 3 + atkMod + macroMod + atkStancePenalty + rangePenalty;

    const defAttr = (atkTypeCode === "M" || atkTypeCode === "E") ? "mental_def" : "physical_def";
    const defBase = getAttrNum(defChar.id, defAttr, 0);
    
    // Read defense modifier from bar3 (stances, off balance, etc.)
    const defMod = num(defTok.get(CFG.DEF_MOD_BAR), 0);
    const defValue = defBase + defMod;

    const targetTotal = baseToHit - defValue;

    // Deduct push cost from attacker
    if (isPushing && atkTok) {
      const atkPow0 = getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
      setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, atkPow0 - pushAmount));
    }
    
    // Deduct attack PR cost from attacker
    let prDeducted = 0;
    if (atkPR > 0 && atkTok) {
      const atkPow0 = getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
      prDeducted = Math.min(atkPR, atkPow0);
      setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, atkPow0 - atkPR));
    }

    // Deduct 1 charge per attack if Charges column has a value
    let chgDeducted = 0;
    if (atkChgCost > 0 && atkCharId && rowId) {
      const chg0 = num(atkChgRaw, 0);
      if (chg0 <= 0) {
        sendChat("MP", `/w gm ⚠️ ${esc(atkName)}: No charges remaining!`);
      } else {
        chgDeducted = 1;
        const chg1 = chg0 - 1;
        setRepeatingAttackAttr(atkCharId, rowId, "attack_charges", chg1);
        if (chg1 === 0) {
          sendChat("MP", `/w gm ⚠️ ${esc(atkName)}: Last charge used!`);
        }
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
      isPushing, pushAmount, rangeData, created: Date.now(),
      noDamageType
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
    const atkPenaltyNote = atkStancePenalty !== 0 ? ` Stance:${atkStancePenalty}` : "";
    const rangePenaltyNote = rangePenalty !== 0 ? ` Rng:${rangePenalty}` : "";
    const macroModNote = macroMod !== 0 ? ` Mod:${macroMod > 0 ? '+' : ''}${macroMod}` : "";
    const distNote = (rangeData && typeof rangeData.inches === "number") ? ` Dist:${rangeData.inches}"` : "";

    const baseToHitPreMods = atkSave + 3 + atkMod;  // Before stance, range, and defense
    let hoverBreakdown = `Base: ${baseToHitPreMods}-`;
    if (defValue !== 0) hoverBreakdown += `&#10;${defTypeLabel}: -${defValue}`;
    if (atkStancePenalty !== 0) hoverBreakdown += `&#10;Stance: ${atkStancePenalty}`;
    if (macroMod !== 0) hoverBreakdown += `&#10;Mod: ${macroMod > 0 ? '+' : ''}${macroMod}`;
    // MP scale: 1" = 5 ft.
    // Always show range penalty in hover (format: Range: -1 (9"))
    if (rangeData && typeof rangeData.inches === "number") {
      const usedInches =
        (rangeData.profileAdjusted && typeof rangeData.adjustedInches === "number")
          ? rangeData.adjustedInches
          : rangeData.inches;

      // Show target profile only if it isn't 1
      const profNote =
        (rangeData.defProfile && rangeData.defProfile !== 1)
          ? `, TgtProf:${rangeData.defProfile}`
          : "";

      // IMPORTANT: use &quot; so the title="" attribute doesn't get truncated by a raw quote
      hoverBreakdown += `&#10;Range: ${rangePenalty} (${usedInches}&quot;${profNote})`;
    }


    hoverBreakdown += `&#10;Final: ${targetTotal}-`;
    html += `<br/><span style="color:#000; font-size:12px;" title="${hoverBreakdown}"><b>To-Hit: ${targetTotal}-</b></span> `;
    html += `<span style="color:#333; font-size:10px;" title="${hoverBreakdown}">[${atkTypeLabel}] Roll:${roll} | ${defTypeLabel}:${defModLabel}${atkPenaltyNote}${rangePenaltyNote}${macroModNote}${distNote}</span>`;

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
        if (atkTok) {
          html += applyOffBalance(atkTok, atkChar.get("name"));
        }
      }
      // Auto-apply strain damage to attacker
      if (fumbleResult.type === FUMBLE_TYPES.MUSCLE_STRAIN_ATK || 
          fumbleResult.type === FUMBLE_TYPES.LEG_STRAIN ||
          fumbleResult.type === FUMBLE_TYPES.ARM_STRAIN) {
        if (atkTok) {
          const atkHits0 = getResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
          setResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR, Math.max(0, atkHits0 - 1));
          html += `<br/><span style="color:#e94560;"><b>${esc(atkChar.get("name"))}</b> takes 1 Hit (strain)! Hits: ${atkHits0}→${atkHits0-1}</span>`;
        }
      }
    }
    if (isPushing) {
      html += `<br/><span style="color:#000; font-size:11px; font-weight:bold;" title="Pushing: +${pushAmount} damage, costs ${pushAmount} Power">⚡ PUSH +${pushAmount}!</span>`;
    }
    if (prDeducted > 0) {
      html += `<br/><span style="color:#333; font-size:10px;">PR: -${prDeducted}</span>`;
    }
    if (chgDeducted > 0) {
      html += `<br/><span style="color:#333; font-size:10px;">Chg: -${chgDeducted}c</span>`;
    }

    html += `</div>`;

    let buttons = "";
    if (outcome === "HIT" || outcome === "CRIT") {
      if (atkType === "std") {
        buttons = buildStandardAttackButtons(rollId, critResult, causesKB);
      } else if (atkType === "sav") {
        buttons = buildSaveAttackButtons(rollId, critResult, pushAmount);
      } else if (atkType === "snr") {
        buttons = buildSnareAttackButtons(rollId, critResult, pushAmount);
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

  function buildSaveAttackButtons(rollId, critResult, pushAmount) {
    const critType = critResult ? critResult.type : null;
    let critMod = 0;
    
    // Solid Hit gives -3 to save TN for save attacks
    if (critType === CRIT_TYPES.SOLID_HIT) {
      critMod = -3;
    }
    
    const pushMod = pushAmount > 0 ? -pushAmount : 0;
    const totalMod = critMod + pushMod;
    
    let modLabel = "";
    if (totalMod !== 0) {
      modLabel = ` (${totalMod > 0 ? '+' : ''}${totalMod})`;
    }
    
    let buttons = `[Make Save${modLabel}](!mp save --id ${rollId} --critmod ${totalMod}) `;
    buttons += `[Save + Roll-With${modLabel}](!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod ${totalMod})`;
    
    return buttons;
  }

  function buildSnareAttackButtons(rollId, critResult, pushAmount) {
    const critType = critResult ? critResult.type : null;
    let snCritBonus = 0;
    
    // Solid Hit gives +2 BP for snare attacks (equivalent benefit)
    if (critType === CRIT_TYPES.SOLID_HIT) {
      snCritBonus = 2;
    }
    
    const pushBonus = pushAmount > 0 ? pushAmount : 0;
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
    const damageType = rec.dmgTypeStr || "Kinetic";
    
    // Get protection, hardened, and invuln for this damage type
    const protData = sumProtectionWithHardened(defChar.id, protKey);
    let baseProt = protData.prot;
    const hardened = protData.hardened;
    const hasInvuln = protData.invuln;
    
    // Avoid Armor crits bypass protection entirely
    const bypassProt = mode.includes("noprot");
    
    // Get attack's Armor Piercing
    const rawAP = rec.atkAP;
    
    // Calculate effective AP after Hardened reduces it
    // Hardened negates AP on a 1:1 basis
    let effectiveAP = 0;
    let apUsedVsHardened = 0;
    if (rawAP === Infinity) {
      effectiveAP = Infinity;
    } else if (rawAP > 0) {
      apUsedVsHardened = Math.min(rawAP, hardened);
      effectiveAP = Math.max(0, rawAP - hardened);
    }
    
    // Calculate effective protection after AP
    let effectiveProt = baseProt;
    let apUsedVsProt = 0;
    if (bypassProt) {
      effectiveProt = 0;
    } else if (effectiveAP === Infinity) {
      effectiveProt = 0;
      apUsedVsProt = baseProt;
    } else if (effectiveAP > 0) {
      apUsedVsProt = Math.min(effectiveAP, baseProt);
      effectiveProt = Math.max(0, baseProt - effectiveAP);
    }
    
    // Calculate leftover AP (AP that exceeded protection)
    // Leftover AP immunizes that many damage points from Invulnerability
    let leftoverAP = 0;
    if (effectiveAP === Infinity) {
      leftoverAP = Infinity;
    } else if (effectiveAP > baseProt) {
      leftoverAP = effectiveAP - baseProt;
    }

    // Vulnerability (opt-in via repeating abilities notes)
    const vuln = getVulnerabilityMods(defChar.id, damageType);
    if (vuln.protMod) effectiveProt = Math.max(0, effectiveProt + vuln.protMod);
    
    // Calculate damage after protection
    let afterProt = Math.max(0, raw - effectiveProt);
    
    // Apply Invulnerability: 1/4 damage (rounded down)
    // But leftover AP immunizes that many points from the reduction
    let penetrating = afterProt;
    let invulnReduction = 0;
    if (hasInvuln && afterProt > 0) {
      if (leftoverAP === Infinity) {
        // All AP - Invulnerability completely bypassed
        penetrating = afterProt;
      } else if (leftoverAP >= afterProt) {
        // Leftover AP exceeds damage - all damage bypasses Invuln
        penetrating = afterProt;
      } else {
        // Split: leftoverAP points bypass, rest takes 1/4
        const bypassedDmg = leftoverAP;
        const reducedDmg = afterProt - leftoverAP;
        const afterInvuln = Math.floor(reducedDmg / 4);
        penetrating = bypassedDmg + afterInvuln;
        invulnReduction = reducedDmg - afterInvuln;
      }
    }
    
    // Add vulnerability damage bonus
    if (vuln.dmgMod) penetrating += vuln.dmgMod;

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

    // Build hover tooltip for protection breakdown
    let protHover = `Protection vs ${protKey}`;
    if (rawAP > 0 || hardened > 0 || hasInvuln) {
      protHover += `&#10;Base Prot: ${Math.floor(baseProt)}`;
      if (rawAP > 0) {
        protHover += `&#10;AP: ${rawAP === Infinity ? 'ALL' : rawAP}`;
        if (hardened > 0) {
          protHover += `&#10;Hardened: ${hardened} (negates ${apUsedVsHardened} AP)`;
          protHover += `&#10;Effective AP: ${effectiveAP === Infinity ? 'ALL' : effectiveAP}`;
        }
        if (apUsedVsProt > 0) protHover += `&#10;AP vs Prot: -${apUsedVsProt}`;
      }
      protHover += `&#10;Effective Prot: ${Math.floor(effectiveProt)}`;
      if (hasInvuln) {
        protHover += `&#10;Invulnerability: 1/4 dmg vs ${damageType}`;
        if (leftoverAP > 0) {
          protHover += `&#10;Leftover AP: ${leftoverAP === Infinity ? 'ALL' : leftoverAP} (bypasses Invuln)`;
        }
        if (invulnReduction > 0) {
          protHover += `&#10;Invuln reduced: ${afterProt - leftoverAP} → ${Math.floor((afterProt - leftoverAP) / 4)}`;
        }
      }
    }

    // Build protection display string
    let protDisplay = `${Math.floor(effectiveProt)}`;
    
    // Invulnerability indicator - dark orange for visibility on yellow
    let invulnIndicator = "";
    if (hasInvuln && invulnReduction > 0) {
      invulnIndicator = ` <span style="color:#d35400;" title="Invulnerability: 1/4 damage">[×¼]</span>`;
    } else if (hasInvuln && leftoverAP > 0) {
      invulnIndicator = ` <span style="color:#c0392b;" title="AP bypassed Invulnerability">[Invuln bypassed]</span>`;
    }
    
    // AP indicator
    let apIndicator = "";
    if (rawAP > 0 && !bypassProt) {
      if (rawAP === Infinity) {
        apIndicator = ` <span style="color:#bd93f9;" title="Armor Piercing: ALL">[AP:∞]</span>`;
      } else if (effectiveAP > 0) {
        apIndicator = ` <span style="color:#bd93f9;" title="Effective AP after Hardened">[AP:${effectiveAP}]</span>`;
      } else if (hardened >= rawAP) {
        apIndicator = ` <span style="color:#50fa7b;" title="Hardened negated all AP">[Hrd blocked AP]</span>`;
      }
    }

    const msgLine =
      `<div style="background:#fff200; border:3px solid #000; padding:4px 8px;">` +
      `<span style="color:#000; font-weight:bold;" title="Target">${esc(rec.defName)}</span>:${effectNotes}` +
      `<br/><span title="Raw damage">${raw}</span>` +
      ` - <span title="${protHover}">${protDisplay}</span> prot${apIndicator}` +
      (hasInvuln ? ` = ${afterProt}${invulnIndicator}` : "") +
      ` = <span title="Penetrating damage${(vuln && vuln.notes && vuln.notes.length) ? ('&#10;' + vuln.notes.join('&#10;')) : ''}">${penetrating}</span> pen` +
      ((vuln && vuln.notes && vuln.notes.length) ? ` <span title="${vuln.notes.join('&#10;')}">[vuln]</span>` : "") +
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
    // Also check for invulnerability (+8 bonus)
    const protData = sumProtectionWithHardened(defChar.id, rec.protKey);
    const prot = protData.prot;
    const invulnBonus = protData.invuln ? 8 : 0;

    // Roll-with for saves: spend Power to add to save TN (4.8.3.1)
    const rw = Math.max(0, num(args.rollwith, 0));
    const pow0 = getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const maxRW = Math.floor(pow0 / 10);
    const rwPaid = Math.min(rw, maxRW);
    const pow1 = pow0 - rwPaid;
    setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);

    // Critical mod (Solid Hit = -3 to save TN for save attacks)
    const critMod = num(args.critmod, 0);

    // Vulnerability: for save attacks, "Vulnerable to <Type>" applies as a penalty to the save TN vs that damage type.
    // We reuse getVulnerabilityMods() which encodes vulnerability as +N damage taken; for saves we apply -N.
    const vulnData = (!rec.noDamageType && rec.dmgTypeStr) ? getVulnerabilityMods(defChar.id, rec.dmgTypeStr) : { protMod: 0, dmgMod: 0, notes: [] };
    const vulnSaveMod = (vulnData && vulnData.dmgMod) ? -Math.abs(num(vulnData.dmgMod, 0)) : 0;


    // Final save TN = base + attack mod + protection + invuln + roll-with + crit mod + vulnerability
    const tn = baseSave + num(rec.saveMod, 0) + Math.floor(prot) + invulnBonus + rwPaid + critMod + vulnSaveMod;

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
      `Base: <b>${baseSave}</b> | Mod: <b>${rec.saveMod}</b> | Prot: <b>${rec.protKey ? ('+' + Math.floor(prot)) : '—'}</b>` +
      (invulnBonus > 0 ? ` | <span style="color:#d35400;">Invuln: <b>+${invulnBonus}</b></span>` : "") +
      (rwPaid > 0 ? ` | RW: <b>+${rwPaid}</b>` : "") +
      (critMod !== 0 ? ` | Crit: <b>${critMod}</b>` : "") +
      (vulnSaveMod !== 0 ? ` | <span style="color:#e63946;">Vuln: <b>${vulnSaveMod}</b></span>` : "") +
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

    const atkChance =
      num(args.tohit, 0) ||
      (num(getAttr(atkChar.id, "agility_save"), 6) + 3);

    state.MP_Engine.snares[defTokId] = {
      type: "Grapple",
      source: atkChar.get("name"),
      grapplerTokenId: atkTokId,
      chanceToHit: atkChance,
      locked: false,
      created: Date.now()
    };


    defTok.set("status_grab", true);

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
      `<b>${esc(atkChar.get("name"))} Grapples ${esc(defChar.get("name"))}</b><br/>` +
      `[Squeeze](!mp squeeze --target ${defTokId}) ` +
      `[Lock Attempt](!mp grapplelock --target ${defTokId}) ` +
      `[Break Free](!mp grapplebreak --target ${defTokId}) ` +
      `[Escape](!mp escape --target ${defTokId}) ` +
      `[Counter](!mp countergrapple --target ${defTokId})`);
    ;
  }

  function cmdSqueeze(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = args.atk || sn.grapplerTokenId;
    const atkChar = getCharFromToken(getObj("graphic", atkTokId));
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
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
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = args.atk || sn.grapplerTokenId;

    const pushDef = (args.pushdef === "1") || (args.push === "1"); // keep old --push working
    const pushAtk = (args.pushatk === "1");
    const locked = !!sn.locked;

    const atkChar = getCharFromToken(getObj("graphic", atkTokId));
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Missing characters.`);
    }

    const atkHTH = getAttr(atkChar.id, "hth_damage") || "1d4";
    const defHTH = getAttr(defChar.id, "hth_damage") || "1d4";

    const rawDef = rollExpr(defHTH);
    const rawAtk = rollExpr(atkHTH);

    let defRoll = rawDef + (pushDef ? 2 : 0) + (locked ? -2 : 0); // lock: -2 to break free
    let atkRoll = rawAtk + (pushAtk ? 2 : 0);

    const success = (defRoll > atkRoll);

    let msg_out =
      `<b>Break Free from Grapple</b>${locked ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: <b>${defRoll}</b>` +
      `${pushDef ? " (+2 push)" : ""}${locked ? " (-2 lock)" : ""}<br/>` +
      `${esc(atkChar.get("name"))}: <b>${atkRoll}</b>${pushAtk ? " (+2 push)" : ""}<br/>` +
      `Result: <b>${success ? "ESCAPES!" : "Still Grappled"}</b>`;

    // Push backlash: whoever pushed and lost takes 1 Hit
    if (pushDef && !success) {
      msg_out += `<br/><span style="color:#e94560">${esc(defChar.get("name"))} takes 1 Hit from failed push!</span>`;
    }
    if (pushAtk && success) {
      msg_out += `<br/><span style="color:#e94560">${esc(atkChar.get("name"))} takes 1 Hit from failed push!</span>`;
    }

    if (success) {
      // clear both sides if a counter-grapple record exists
      delete state.MP_Engine.snares[defTokId];
      defTok.set("status_grab", false);

      const atkTok = getObj("graphic", atkTokId);
      const maybeCounter = atkTok && state.MP_Engine.snares[atkTokId];
      if (maybeCounter && maybeCounter.type === "Grapple" && maybeCounter.grapplerTokenId === defTokId) {
        delete state.MP_Engine.snares[atkTokId];
        atkTok.set("status_grab", false);
      }
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

    function cmdGrappleLock(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    const baseChance = num(sn.chanceToHit, atkChar ? (num(getAttr(atkChar.id, "agility_save"), 6) + 3) : 10);
    const tn = baseChance - 3; // lock attempt is -3
    const roll = randomInteger(20);

    const ok = roll <= tn;
    sn.locked = !!ok;

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") +
      `<b>Grapple Lock Attempt</b><br/>` +
      `${esc(atkChar ? atkChar.get("name") : "Grappler")}: Roll <b>${roll}</b> vs <b>${tn}-</b><br/>` +
      `Result: <b>${ok ? "LOCKED" : "Failed"}</b> on ${esc(defChar ? defChar.get("name") : "target")}`);
  }

    function cmdEscape(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);

    const defChar = getCharFromToken(defTok);
    const atkChar = getCharFromToken(atkTok);

    if (!defChar) return ch("MP", `/w gm <b>MP:</b> Missing defender character.`);

    const defAg = num(getAttr(defChar.id, "agility_save"), 6);

    // Base chance = AG save +3
    let base = defAg + 3;

    // If locked: further -3 to escape
    if (sn.locked) base -= 3;

    // Penalty = grappler chance-to-hit - 10
    const grapplerChance = num(sn.chanceToHit, atkChar ? (num(getAttr(atkChar.id, "agility_save"), 6) + 3) : 10);
    const penalty = grapplerChance - 10;

    const tn = base - penalty;
    const roll = randomInteger(20);
    const ok = roll <= tn;

    let msg_out =
      `<b>Escape Attempt</b>${sn.locked ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: Roll <b>${roll}</b> vs <b>${tn}-</b><br/>` +
      `<span style="font-size:11px;">(Base ${defAg}+3${sn.locked ? " -3 lock" : ""} = ${base}; Penalty ${grapplerChance}-10 = ${penalty})</span><br/>` +
      `Result: <b>${ok ? "ESCAPES!" : "Still Grappled"}</b>`;

    if (ok) {
      delete state.MP_Engine.snares[defTokId];
      defTok.set("status_grab", false);

      // Clear counter-grapple record if present
      const maybeCounter = atkTok && state.MP_Engine.snares[atkTokId];
      if (maybeCounter && maybeCounter.type === "Grapple" && maybeCounter.grapplerTokenId === defTokId) {
        delete state.MP_Engine.snares[atkTokId];
        atkTok.set("status_grab", false);
      }
    }

    ch("MP", (CFG.GM_ONLY_BUTTONS ? "/w gm " : "") + msg_out);
  }

    function cmdCounterGrapple(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    if (sn.locked) {
      return ch("MP", `/w gm <b>MP:</b> Target is LOCKED and cannot counter-grapple (Escape/Break Free only).`);
    }

    const atkTokId = sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);

    const defChar = getCharFromToken(defTok);
    const atkChar = getCharFromToken(atkTok);

    if (!defChar || !atkTok) return ch("MP", `/w gm <b>MP:</b> Missing characters/tokens.`);

    const defAg = num(getAttr(defChar.id, "agility_save"), 6);
    const wrestle = (args.wrestle === "1") ? 3 : 0;
    const lockAttempt = (args.lock === "1") ? -3 : 0;

    const tn = defAg + 3 + wrestle + lockAttempt;
    const roll = randomInteger(20);
    const ok = roll <= tn;

    let msg_out =
      `<b>Counter-Grapple Attempt</b>${lockAttempt ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: Roll <b>${roll}</b> vs <b>${tn}-</b>` +
      `${wrestle ? " (+3 wrestling)" : ""}${lockAttempt ? " (-3 lock)" : ""}<br/>` +
      `Result: <b>${ok ? (lockAttempt ? "COUNTER-LOCKED!" : "SUCCESS") : "Failed"}</b>`;

    if (ok) {
      state.MP_Engine.snares[atkTokId] = {
        type: "Grapple",
        source: defChar.get("name"),
        grapplerTokenId: defTokId,
        chanceToHit: tn,
        locked: (lockAttempt !== 0),
        created: Date.now(),
        counter: true
      };
      atkTok.set("status_grab", true);
      msg_out += `<br/>${esc(defChar.get("name"))} now has ${esc(atkChar ? atkChar.get("name") : "the grappler")} grappled${lockAttempt ? " in a LOCK" : ""}.`;
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

  

  // --- Ability/Weakness info lookup --------------------------------------
  // This lets the sheet's per-row "Info" button show rules text by name.
  // Extend MP_INFO_DB over time (abilities, powers, weaknesses, etc.).
  const MP_INFO_DB = {
    "vulnerability": {
      title: "Vulnerability (Weakness)",
      body: [
        "The character is more easily harmed by certain damage types than usual.",
        "<b>Attract Damage Type(s)</b>: The character’s Defense against a Damage Type is reduced. " +
          "(-5 CPs per -2 Defense against the specified Damage Type; or (-2.5) CPs per -2 if only a specific damage form, e.g. electrical Energy.)",
        "<b>Vulnerable to Damage Type(s)</b>: The character takes extra damage from a Damage Type. " +
          "(-5 CPs per +2 damage taken (or -2 save modifier for save-based attacks); or (-2.5) CPs per +2 if only a specific damage form.)",
        "<b>Automation note</b>: If you want this automated in damage application, put notes like " +
          "<code>Attract: Energy -2</code> or <code>Vulnerable: Kinetic +2</code> in a repeating Ability row named “Vulnerability”."
      ]
    }
  };

  const MP_INFO_ALIASES = {
    "vulnerable": "vulnerability",
    "attract damage type": "vulnerability",
    "vulnerable to damage type": "vulnerability"
  };

  function lookupInfoEntry(name) {
    const key = _normKey(name);
    if (!key) return null;
    if (MP_INFO_DB[key]) return MP_INFO_DB[key];
    if (MP_INFO_ALIASES[key] && MP_INFO_DB[MP_INFO_ALIASES[key]]) return MP_INFO_DB[MP_INFO_ALIASES[key]];

    // loose match: "vulnerability (fire)" => vulnerability
    const keys = Object.keys(MP_INFO_DB);
    const hit = keys.find(k => key.includes(k) || k.includes(key));
    return hit ? MP_INFO_DB[hit] : null;
  }

  function cmdInfo(msg, args) {
    const name = args.name || args.n || "";
    if (!name) {
      return sendChat("MP", `/w "${msg.who}" Usage: !mp info --name <Ability/Weakness name>`);
    }

    const entry = lookupInfoEntry(name);
    if (!entry) {
      return sendChat("MP", `/w "${msg.who}" No rules text stored for: <b>${esc(name)}</b>. Add it to <code>MP_INFO_DB</code> in the API script.`);
    }

    const who = `/w "${msg.who}" `;
    const headerBits = [];
    if (args.atype) headerBits.push(`Type: ${esc(args.atype)}`);
    if (args.cp) headerBits.push(`CP: ${esc(args.cp)}`);
    if (args.ip) headerBits.push(`IP: ${esc(args.ip)}`);

    const headerLine = headerBits.length ? `<div style="opacity:0.85; font-size:11px; margin-top:2px;">${headerBits.join(" | ")}</div>` : "";

    const bodyHtml = (entry.body || [])
      .map(p => `<div style="margin:4px 0;">${p}</div>`)
      .join("");

    const html = `<div style="border:1px solid #333; border-radius:6px; padding:8px; background:#16213e; color:#eaeaea;">` +
      `<div style="font-weight:bold; font-size:14px; color:#f4d03f;">${esc(entry.title || name)}</div>` +
      headerLine +
      `<div style="margin-top:6px;">${bodyHtml}</div>` +
      `</div>`;

    return sendChat("MP", who + html);
  }

function cmdAttackInfo(msg, args) {
  // The row argument may have template junk appended - extract just the rowid
  const rowId = (args.row || "").split(/\s+/)[0].trim();
  
  if (!rowId || rowId === "") {
    return ch("MP", `/w gm <b>Debug:</b> No rowId received.`);
  }

  const tok = getSelectedToken(msg);
  if (!tok) return ch("MP", `/w gm Select your token first.`);
  
  const char = getCharFromToken(tok);
  if (!char) return ch("MP", `/w gm Token not linked to character.`);
  const charId = char.id;
  const charName = char.get("name");

  // Debug: show what rowId we got
  if (!rowId || rowId === "") {
    return ch("MP", `/w gm <b>Debug:</b> No rowId received. Button may not be passing @{attack_rowid}`);
  }

  const getAtk = (name) => getRepeatingAttackAttr(charId, rowId, name);
  
  const attackName = getAtk("attack_name") || "";
  const notes = getAtk("attack_notes") || "";
  const damage = getAtk("attack_damage") || "";
  const dmgTypeRaw = (getAtk("attack_dmgtype") || "Kin").toLowerCase();
  const dmgTypeMap = {k:"Kinetic", kin:"Kinetic", kinetic:"Kinetic", e:"Energy", eng:"Energy", energy:"Energy", b:"Biochemical", bio:"Biochemical", biochemical:"Biochemical", ent:"Entropy", entropy:"Entropy", p:"Psychic", psy:"Psychic", psychic:"Psychic", o:"Other", oth:"Other", other:"Other"};
  const dmgTypeFull = dmgTypeMap[dmgTypeRaw] || dmgTypeRaw;
  const range = getAtk("attack_range") || "";
  const prCost = getAtk("attack_cost") || "";
  const charges = getAtk("attack_charges") || "";
  const kb = getAtk("attack_kb") === "1" ? "Yes" : "No";
  const apRaw = getAtk("attack_ap") || "";
  const tohit = getAtk("attack_tohit") || "";
  const mod = getAtk("attack_mod") || "0";
  const atkType = getAtk("attack_atk") || "P";
  const atkTypeFull = {P:"Physical", M:"Mental", E:"Emotion"}[atkType] || "Physical";

  // Debug: if attack name is empty, something's wrong with row lookup
  if (!attackName) {
    return ch("MP", `/w gm <b>Debug:</b> rowId="${esc(rowId)}" but attack_name is empty. Check that attack_rowid is being set by sheet worker.`);
  }

  // Parse notes for special attacks
  const notesLower = notes.toLowerCase();
  let specialType = "std";
  let saveBC = "", saveMod = 0, recMod = 0;
  let snareType = "", bp = 0, maxBP = 0;

  const savMatch = notesLower.match(/sav:(\w+):([+-]?\d+):?([+-]?\d+)?/);
  if (savMatch) {
    specialType = "sav";
    saveBC = savMatch[1].toUpperCase();
    saveMod = parseInt(savMatch[2]) || 0;
    recMod = parseInt(savMatch[3]) || 0;
  }

  const snrMatch = notesLower.match(/snr:(grp|ice):(\d+)\/?(\d+)?/);
  if (snrMatch) {
    specialType = "snr";
    snareType = snrMatch[1];
    bp = parseInt(snrMatch[2]) || 0;
    maxBP = parseInt(snrMatch[3]) || bp;
  }

  // Build output
  let out = `<div style="background:#2b2b3d; border:2px solid #8be9fd; border-radius:6px; font-family:Arial,sans-serif; font-size:13px;">`;
  out += `<div style="background:#8be9fd; color:#000; font-weight:bold; padding:6px 10px;">${esc(charName)}: ${esc(attackName)}</div>`;
  out += `<div style="padding:8px 10px; color:#eaeaea;">`;

  // Basic info
  out += `<div><span style="color:#aaa;">Type:</span> ${esc(atkTypeFull)}</div>`;
  if (tohit) out += `<div><span style="color:#aaa;">To-Hit:</span> <span style="color:#8be9fd;">${esc(tohit)}</span></div>`;
  if (mod !== "0") out += `<div><span style="color:#aaa;">Modifier:</span> ${esc(mod)}</div>`;
  if (range) out += `<div><span style="color:#aaa;">Range:</span> ${esc(range)}"</div>`;
  if (prCost) out += `<div><span style="color:#aaa;">PR Cost:</span> ${esc(prCost)}</div>`;
  if (charges) out += `<div><span style="color:#aaa;">Charges:</span> ${esc(charges)}</div>`;
  if (apRaw) out += `<div><span style="color:#bd93f9; font-weight:bold;">Armor Piercing:</span> ${apRaw === "ALL" ? "Ignores ALL protection" : "Ignores " + apRaw + " protection"}</div>`;

  if (specialType === "sav") {
    out += `<div style="border-top:1px solid #444; margin-top:6px; padding-top:6px;">`;
    out += `<div style="color:#f4d03f; font-weight:bold;">💫 SAVE ATTACK</div>`;
    out += `<div><span style="color:#aaa;">Save BC:</span> <span style="color:#e94560; font-weight:bold;">${saveBC}</span></div>`;
    out += `<div><span style="color:#aaa;">Save Mod:</span> ${saveMod >= 0 ? "+" : ""}${saveMod}</div>`;
    if (recMod !== 0) out += `<div><span style="color:#aaa;">Recovery:</span> ${recMod}</div>`;
    out += `<div style="color:#666; font-size:11px; margin-top:4px;">• Target's protection adds to save TN</div>`;
    out += `<div style="color:#666; font-size:11px;">• Roll-with: Power/10 adds to save TN</div>`;
    out += `<div style="color:#666; font-size:11px;">• Recovery roll each between-rounds phase</div>`;
    out += `</div>`;
  } else if (specialType === "snr") {
    const snrLabel = snareType === "ice" ? "ICE SNARE" : "GRAPNEL SNARE";
    out += `<div style="border-top:1px solid #444; margin-top:6px; padding-top:6px;">`;
    out += `<div style="color:#f4d03f; font-weight:bold;">🔗 ${snrLabel}</div>`;
    out += `<div><span style="color:#aaa;">Break Point:</span> <span style="color:#e94560; font-weight:bold;">${bp}</span></div>`;
    out += `<div><span style="color:#aaa;">Max BP:</span> ${maxBP}</div>`;
    out += `<div style="color:#666; font-size:11px; margin-top:4px;">• Escape: HTH ≥ BP</div>`;
    out += `<div style="color:#666; font-size:11px;">• Exceed by 4+: move OR action only</div>`;
    out += `<div style="color:#666; font-size:11px;">• Push escape: +2 to HTH</div>`;
    out += `<div style="color:#666; font-size:11px;">• Next hit: +2 BP (max ${maxBP})</div>`;

    if (snareType === "ice") {
      out += `<div style="border-top:1px solid #444; margin-top:4px; padding-top:4px; color:#8be9fd;">`;
      out += `<div style="font-size:11px;">• 3 Entropy dmg/round while snared</div>`;
      out += `<div style="font-size:11px;">• BP melts -1/round (1 PR to hold)</div>`;
      out += `</div>`;
    } else {
      out += `<div style="border-top:1px solid #444; margin-top:4px; padding-top:4px; color:#aaa;">`;
      out += `<div style="font-size:11px;">• Lasts 1 hour or until broken</div>`;
      out += `</div>`;
    }
    out += `</div>`;
  } else {
    // Standard attack
    out += `<div style="border-top:1px solid #444; margin-top:6px; padding-top:6px;">`;
    out += `<div><span style="color:#aaa;">Damage:</span> <span style="color:#8be9fd;">${esc(damage) || "—"}</span></div>`;
    out += `<div><span style="color:#aaa;">Type:</span> ${esc(dmgTypeFull)}</div>`;
    out += `<div><span style="color:#aaa;">Knockback:</span> ${kb}</div>`;
    out += `</div>`;
  }

  if (notes && specialType === "std") {
    out += `<div style="border-top:1px solid #444; margin-top:6px; padding-top:6px;">`;
    out += `<div><span style="color:#aaa;">Notes:</span> ${esc(notes)}</div>`;
    out += `</div>`;
  }

  out += `</div></div>`;
  ch("MP", `/w ${msg.who} ` + out);
}
  
  // ------------------------------------------------------------------------

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

  function cmdRange(msg, args) {
    if (!msg.selected || msg.selected.length < 2) {
      return ch("MP", `/w gm Select two tokens to check range between them.`);
    }
    
    const tok1 = getObj("graphic", msg.selected[0]._id);
    const tok2 = getObj("graphic", msg.selected[1]._id);
    
    if (!tok1 || !tok2) {
      return ch("MP", `/w gm Could not find selected tokens.`);
    }
    
    const char1 = getCharFromToken(tok1);
    const char2 = getCharFromToken(tok2);
    const name1 = char1 ? char1.get("name") : "Token 1";
    const name2 = char2 ? char2.get("name") : "Token 2";
    const char1Id = char1 ? char1.id : null;
    const char2Id = char2 ? char2.id : null;
    
    const rangeData = calculateRangeWithProfile(tok1, tok2, char1Id, char2Id);
    
    // Debug info
    const page = getObj("page", tok1.get("_pageid"));
    const scaleNum = page ? page.get("scale_number") : "?";
    const scaleUnit = page ? page.get("scale_units") : "?";
    
    let msg_out = `<b>Range Check</b><br/>`;
    msg_out += `${esc(name1)} → ${esc(name2)}<br/>`;
    msg_out += `Distance: <b>${rangeData.inches}"</b><br/>`;
    msg_out += `<span style="font-size:10px; color:#888;">`;
    msg_out += `T1: ${Math.round(tok1.get("left"))}x${Math.round(tok1.get("top"))} (${tok1.get("width")}x${tok1.get("height")})<br/>`;
    msg_out += `T2: ${Math.round(tok2.get("left"))}x${Math.round(tok2.get("top"))} (${tok2.get("width")}x${tok2.get("height")})<br/>`;
    msg_out += `Page: ${scaleNum} ${scaleUnit}/sq</span><br/>`;
    
    if (rangeData.profileAdjusted) {
      msg_out += `Profiles: ${rangeData.atkProfile} / ${rangeData.defProfile}<br/>`;
      msg_out += `Adjusted: <b>${rangeData.adjustedInches}"</b><br/>`;
    }
    
    msg_out += `Penalty: <b>${rangeData.penalty}</b>`;
    
    ch("MP", "/w gm " + msg_out);
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
      case "grapple":
        return testGrapple(msg, args);
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
          <code>!mp test grapple [TOHIT] [lock]</code> - Grapple test harness (select 2 tokens: grappler, target)<br/>
          <code>!mp test damage N [type] [--ap:N] [--headshot]</code> - Apply N damage (AP tests vs target's Hardened)<br/>
          <code>!mp test save BC MOD REC [dtype]</code> - Test save attack (dtype tests target's Invuln +8)<br/>
          <code>!mp test snare BP [MAX]</code> - Apply snare to selected token<br/>
          <code>!mp test heal N</code> - Heal N hits to selected token<br/>
          <code>!mp test reset</code> - Reset selected token to full Hits/Power<br/>
          <code>!mp test status</code> - Show selected token's full status (shows Hardened/Invuln)`);
    }
  }

    function testGrapple(msg, args) {
    if (!playerIsGM(msg.playerid)) {
      return ch("MP", "/w " + msg.who + " Only GM can use test commands.");
    }

    if (!msg.selected || msg.selected.length < 2) {
      return ch("MP", `/w gm <b>MP:</b> Select <b>2</b> tokens (grappler first, target second), then run <code>!mp test grapple</code>.`);
    }

    const atkTok = getObj("graphic", msg.selected[0]._id);
    const defTok = getObj("graphic", msg.selected[1]._id);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkTok || !defTok || !atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Both selected tokens must be linked to characters.`);
    }

    // Optional TOHIT override (stores grappler chance-to-hit for Escape math)
    const tohitOverride = args.tohit ? num(args.tohit, 0) : 0;

    // Start grapple (no roll-to-hit here; this is just a harness)
    cmdGrapple(msg, {
      atk: atkTok.id,
      def: defTok.id,
      tohit: tohitOverride
    });

    // Optional: start in "locked" state for testing
    if ((args.lock || "") === "lock") {
      const sn = state.MP_Engine.snares[defTok.id];
      if (sn && sn.type === "Grapple") sn.locked = true;
    }

    const lockedNow = (state.MP_Engine.snares[defTok.id] && state.MP_Engine.snares[defTok.id].locked) ? " (LOCKED)" : "";

    const out =
      `<b>🧪 Grapple Test Harness</b><br/>` +
      `${esc(atkChar.get("name"))} → ${esc(defChar.get("name"))}${lockedNow}<br/>` +
      `[Squeeze](!mp squeeze --target ${defTok.id}) ` +
      `[Lock Attempt](!mp grapplelock --target ${defTok.id}) ` +
      `[Break Free](!mp grapplebreak --target ${defTok.id}) ` +
      `[Break Free (Push Def)](!mp grapplebreak --target ${defTok.id} --pushdef 1) ` +
      `[Break Free (Both Push)](!mp grapplebreak --target ${defTok.id} --pushdef 1 --pushatk 1)<br/>` +
      `[Escape](!mp escape --target ${defTok.id}) ` +
      `[Counter-Grapple](!mp countergrapple --target ${defTok.id} --wrestle ?{Wrestling background? (0/1)|0} --lock ?{Attempt Lock? (0/1)|0})`;

    ch("MP", "/w gm " + out);
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
      isPushing: false, pushAmount: 0,
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
    
    // Parse AP value
    let apValue = 0;
    if (args.ap) {
      if (args.ap === "all" || args.ap === "ALL") {
        apValue = Infinity;
      } else {
        apValue = num(args.ap, 0);
      }
    }
    if (ignoreProt) apValue = Infinity; // --noprot is same as ap:all

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
      atkAP: apValue,
      saveBC: "",
      saveMod: 0,
      recMod: 0,
      snBP: 0,
      snMaxBP: 0,
      snType: "",
      causesKB: true,
      isPushing: false, pushAmount: 0,
      created: Date.now()
    };

    // Build info display
    let apLabel = "";
    if (apValue === Infinity) {
      apLabel = " | AP: ALL";
    } else if (apValue > 0) {
      apLabel = ` | AP: ${apValue}`;
    }
    
    // Get target's protection info (includes invuln)
    const protData = sumProtectionWithHardened(char.id, protKey);
    
    let targetInfo = ` | Target Prot: ${protData.prot}`;
    if (protData.hardened > 0) {
      targetInfo += ` (<span style="color:#bd93f9;">${protData.hardened}h</span>)`;
    }
    if (protData.invuln) {
      targetInfo += ` | <span style="color:#d35400;">Invuln ¼</span>`;
    }

    let html = `<div style="background:#8be9fd; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST DAMAGE</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#333; font-size:11px;">Raw: ${rawDamage} | Type: ${dmgType}${apLabel}${isHeadshot ? " | HEADSHOT x2" : ""}${targetInfo}</span>`;
    html += `</div>`;

    let mode = "noroll";
    if (isHeadshot) mode = "headshot";

    const buttons = `[Apply](!mp apply --id ${rollId} --mode ${mode}) ` +
      `[RW Max](!mp apply --id ${rollId} --mode ${isHeadshot ? "headshot_rw" : "rollwithmax"}) ` +
      `[RW Custom](!mp apply --id ${rollId} --mode ${isHeadshot ? "headshot_rw" : "rollwithcustom"} --amt ?{Divert to Power|0}) ` +
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
    
    // Check for invulnerability from protection rows
    const protData = sumProtectionWithHardened(char.id, protKey);
    const invulnNote = protData.invuln ? " | <span style='color:#d35400;'>Invuln +8</span>" : "";

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
      isPushing: false, pushAmount: 0,
      created: Date.now()
    };

    let html = `<div style="background:#ff79c6; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#000; font-weight:bold; font-size:14px;">🧪 TEST SAVE ATTACK</span> `;
    html += `<span style="color:#000;">vs ${esc(char.get("name"))}</span>`;
    html += `<br/><span style="color:#333; font-size:11px;">Save BC: ${bc} | Mod: ${saveMod} | Recovery: ${recMod} | Type: ${dmgType}${invulnNote}</span>`;
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
      isPushing: false, pushAmount: 0,
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

    const kinData = sumProtectionWithHardened(char.id, "kinetic");
    const engData = sumProtectionWithHardened(char.id, "energy");
    const entData = sumProtectionWithHardened(char.id, "entropy");
    const psyData = sumProtectionWithHardened(char.id, "psychic");
    const bioData = sumProtectionWithHardened(char.id, "bio");
    const othData = sumProtectionWithHardened(char.id, "other");
    
    // Format protection value with hardened and invuln indicators
    function fmtProt(data) {
      let result = "";
      if (data.prot === 0 && !data.invuln) return "0";
      if (data.prot === 0 && data.invuln) return `<span style="color:#d35400;">¼</span>`;
      
      if (data.hardened === 0) {
        result = String(data.prot);
      } else if (data.hardened >= data.prot) {
        result = `<span style="color:#bd93f9;">${data.prot}h</span>`;
      } else {
        result = `${data.prot}(<span style="color:#bd93f9;">${data.hardened}h</span>)`;
      }
      
      if (data.invuln) {
        result += `<span style="color:#d35400;">¼</span>`;
      }
      return result;
    }

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
    
    msg_out += `<b>Protection:</b> Kin ${fmtProt(kinData)} | Eng ${fmtProt(engData)} | Ent ${fmtProt(entData)} | Psy ${fmtProt(psyData)} | Bio ${fmtProt(bioData)} | Oth ${fmtProt(othData)}<br/>`;
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

    // Supports multi-word values: --name Heightened Senses --cp -5
    let i = 2;
    while (i < parts.length) {
      const p = parts[i];
      if (p && p.startsWith("--")) {
        const key = p.slice(2).toLowerCase();
        const vals = [];
        let j = i + 1;
        while (j < parts.length && !parts[j].startsWith("--")) {
          vals.push(parts[j]);
          j++;
        }
        args[key] = vals.length ? vals.join(" ") : "1";
        i = j;
      } else {
        i++;
      }
    }
    return { cmd, args };
  }

  // -------------------------
  // QUICK ATTACK COMMAND
  // -------------------------
  // Usage: !mp atk N --atk TOKEN_ID --target TOKEN_ID [--mod N] [--push N]
  // Macro: !mp atk ?{Attack|1|2|3} --atk @{selected|token_id} --target @{target|token_id} --push ?{Push|0} --mod ?{Modifier|0}
  // Triggers existing mpattack roll template handler

  function findAttackRowByIndex(charId, atkIndex) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const numAttr = attrs.find(a => {
      const name = a.get("name").toLowerCase();
      if (!name.startsWith("repeating_attacks_") || !name.endsWith("_attack_num")) return false;
      return a.get("current") === String(atkIndex);
    });
    if (!numAttr) return null;
    const match = numAttr.get("name").match(/repeating_attacks_([^_]+)_attack_num/i);
    return match ? match[1] : null;
  }

  function cmdQuickAttack(msg, args) {
    const parts = msg.content.split(/\s+/);
    const atkIndex = parseInt(parts[2], 10);
    
    if (!atkIndex || atkIndex < 1) {
      return ch("MP", `/w gm Usage: <code>!mp atk N --atk &#64;{selected|token_id} --target &#64;{target|token_id}</code>`);
    }

    const atkTokenId = args.atk;
    if (!atkTokenId) return ch("MP", `/w gm No attacker specified. Use --atk &#64;{selected|token_id}`);

    const atkTok = getObj("graphic", atkTokenId);
    if (!atkTok) return ch("MP", `/w gm Attacker token not found.`);

    const atkChar = getCharFromToken(atkTok);
    if (!atkChar) return ch("MP", `/w gm Attacker token not linked to character.`);
    const atkCharId = atkChar.id;
    const atkName = atkChar.get("name");

    const defTokenId = args.target;
    if (!defTokenId) return ch("MP", `/w gm No target specified. Use --target &#64;{target|token_id}`);

    const defTok = getObj("graphic", defTokenId);
    if (!defTok) return ch("MP", `/w gm Target token not found.`);

    const defChar = getCharFromToken(defTok);
    if (!defChar) return ch("MP", `/w gm Target token not linked to character.`);

    // Find attack row
    const rowId = findAttackRowByIndex(atkCharId, atkIndex);
    if (!rowId) return ch("MP", `/w gm Attack #${atkIndex} not found for ${esc(atkName)}.`);

    const getAtk = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    // Get attack attributes
    const attackName = getAtk("attack_name") || `Attack ${atkIndex}`;
    const damage = getAtk("attack_damage") || "0";
    const tohitNum = num(getAtk("attack_tohit_num"), 10);
    const dmgTypeRaw = (getAtk("attack_dmgtype") || "Kin").toLowerCase();
    const dmgTypeMap = {k:"Kinetic", kin:"Kinetic", kinetic:"Kinetic", e:"Energy", eng:"Energy", energy:"Energy", b:"Biochemical", bio:"Biochemical", biochemical:"Biochemical", ent:"Entropy", entropy:"Entropy", p:"Psychic", psy:"Psychic", psychic:"Psychic", o:"Other", oth:"Other", other:"Other"};
    const dmgTypeFull = dmgTypeMap[dmgTypeRaw] || "Other";
    const range = getAtk("attack_range") || "0";
    const kbDisplay = getAtk("attack_kb_display") || "No";
    const ap = getAtk("attack_ap") || "";
    const pushAmount = num(args.push, 0);  // 0=no push, 2=normal, 4+=special
    const hitMod = num(args.mod, 0);

    // Build and send the roll template - this triggers handleMpAttack
    const pushDmg = pushAmount > 0 ? `+${pushAmount}` : "";
    
    const rollMsg = `&{template:mpattack} {{mpapi=1}} {{atk=${atkCharId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{name=${atkName} - ${attackName}}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;

    sendChat(`character|${atkCharId}`, rollMsg);
  }

  // -------------------------
  // QUICK SAVE COMMAND
  // -------------------------
  // Usage: !mp sv BC [mod]
  // Example: !mp sv EN, !mp sv AG +2

  function cmdQuickSave(msg, args) {
    const parts = msg.content.split(/\s+/);
    const bcRaw = (parts[2] || "").toUpperCase();
    const modRaw = parts[3] || "0";
    const mod = num(modRaw.replace("+", ""), 0);

    const validBC = ["EN", "AG", "IN", "CL"];
    if (!validBC.includes(bcRaw)) {
      return ch("MP", `/w gm Usage: <code>!mp sv BC [mod]</code> where BC = EN, AG, IN, or CL`);
    }

    const tok = getSelectedToken(msg);
    if (!tok) return ch("MP", `/w gm Select your token first.`);

    const char = getCharFromToken(tok);
    if (!char) return ch("MP", `/w gm Token not linked to character.`);
    const charId = char.id;
    const charName = char.get("name");

    const saveAttrMap = {
      EN: "endurance_save",
      AG: "agility_save",
      IN: "intelligence_save",
      CL: "cool_save"
    };
    const saveAttr = saveAttrMap[bcRaw];
    const saveVal = getAttrNum(charId, saveAttr, 10);
    const target = saveVal + mod;

    const nat = randomInteger(20);
    const success = (nat <= target);

    let html = `<div style="background:#2b2b3d; border:2px solid ${success ? '#50fa7b' : '#e94560'}; border-radius:6px; padding:6px; font-family:Arial,sans-serif; font-size:12px; color:#eaeaea;">`;
    html += `<div style="font-weight:bold; font-size:14px; color:#8be9fd; margin-bottom:4px;">${esc(charName)} - ${bcRaw} Save</div>`;
    
    html += `<div style="font-size:16px; font-weight:bold; color:${success ? '#50fa7b' : '#e94560'};">`;
    if (nat === 1) html += `💥 CRITICAL SUCCESS!`;
    else if (nat === 20) html += `💀 CRITICAL FAILURE!`;
    else if (success) html += `✓ SUCCESS`;
    else html += `✗ FAILURE`;
    html += `</div>`;

    html += `<div style="color:#aaa; font-size:11px;"><b>Target:</b> ${target}- (${saveVal}${mod !== 0 ? (mod > 0 ? '+' : '') + mod : ''}) | <b>Roll:</b> ${nat}</div>`;
    html += `</div>`;

    ch("MP", `/w gm ` + html);
  }

  // -------------------------
  // AUTOFIRE COMMAND
  // -------------------------
  // Usage: !mp autofire N --atk @{selected|token_id} --target @{target|token_id}
  // Rolls N separate attacks (or uses attack_autofire rate if N omitted)
  // Each attack is a separate to-hit roll, targets must be adjacent (GM enforces)
  // PR and charges multiplied by number of shots

  function cmdAutofire(msg, args) {
    const parts = msg.content.split(/\s+/);
    const atkIndexOrRate = parseInt(parts[2], 10);
    
    if (!atkIndexOrRate || atkIndexOrRate < 1) {
      return ch("MP", `/w gm Usage: <code>!mp autofire N --atk &#64;{selected|token_id} --target &#64;{target|token_id}</code><br/>N = attack row number. Uses attack_autofire rate (2-7) from that row.`);
    }

    const atkTokenId = args.atk;
    if (!atkTokenId) return ch("MP", `/w gm No attacker specified. Use --atk &#64;{selected|token_id}`);

    const atkTok = getObj("graphic", atkTokenId);
    if (!atkTok) return ch("MP", `/w gm Attacker token not found.`);

    const atkChar = getCharFromToken(atkTok);
    if (!atkChar) return ch("MP", `/w gm Attacker token not linked to character.`);
    const atkCharId = atkChar.id;
    const atkName = atkChar.get("name");

    const defTokenId = args.target;
    if (!defTokenId) return ch("MP", `/w gm No target specified. Use --target &#64;{target|token_id}`);

    const defTok = getObj("graphic", defTokenId);
    if (!defTok) return ch("MP", `/w gm Target token not found.`);

    const defChar = getCharFromToken(defTok);
    if (!defChar) return ch("MP", `/w gm Target token not linked to character.`);

    // Find attack row
    const rowId = findAttackRowByIndex(atkCharId, atkIndexOrRate);
    if (!rowId) return ch("MP", `/w gm Attack #${atkIndexOrRate} not found for ${esc(atkName)}.`);

    const getAtk = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    // Get autofire rate from attack row
    const autofireRate = num(getAtk("attack_autofire"), 0);
    if (autofireRate < 2 || autofireRate > 7) {
      return ch("MP", `/w gm Attack #${atkIndexOrRate} does not have Autofire (rate 2-7). Set attack_autofire on the Setup tab.`);
    }

    // Get attack attributes
    const attackName = getAtk("attack_name") || `Attack ${atkIndexOrRate}`;
    const damage = getAtk("attack_damage") || "0";
    const tohitNum = num(getAtk("attack_tohit_num"), 10);
    const dmgTypeRaw = (getAtk("attack_dmgtype") || "Kin").toLowerCase();
    const dmgTypeMap = {k:"Kinetic", kin:"Kinetic", kinetic:"Kinetic", e:"Energy", eng:"Energy", energy:"Energy", b:"Biochemical", bio:"Biochemical", biochemical:"Biochemical", ent:"Entropy", entropy:"Entropy", p:"Psychic", psy:"Psychic", psychic:"Psychic", o:"Other", oth:"Other", other:"Other"};
    const dmgTypeFull = dmgTypeMap[dmgTypeRaw] || "Other";
    const range = getAtk("attack_range") || "0";
    const kbDisplay = getAtk("attack_kb_display") || "No";
    const ap = getAtk("attack_ap") || "";
    const pushAmount = num(args.push, 0);
    const hitMod = num(args.mod, 0);

    // Check PR cost - multiply by autofire rate
    const basePR = num(getAtk("attack_cost"), 0);
    const totalPR = basePR * autofireRate;
    
    // Check charges - multiply by autofire rate
    const chargesRaw = getAtk("attack_charges");
    const hasCharges = (chargesRaw !== undefined && chargesRaw !== null && String(chargesRaw).trim() !== "");
    const currentCharges = hasCharges ? num(chargesRaw, 0) : Infinity;
    
    if (hasCharges && currentCharges < autofireRate) {
      return ch("MP", `/w gm ⚠️ ${esc(attackName)}: Not enough charges for Autofire ×${autofireRate}! (Have ${currentCharges})`);
    }

    // Check Power for PR cost
    const currentPower = getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    if (totalPR > 0 && currentPower < totalPR) {
      return ch("MP", `/w gm ⚠️ ${esc(attackName)}: Not enough Power for Autofire ×${autofireRate}! (Need ${totalPR}, have ${currentPower})`);
    }

    // Deduct PR upfront (all shots cost PR whether they hit or not)
    if (totalPR > 0) {
      setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, currentPower - totalPR));
    }

    // Deduct charges upfront
    if (hasCharges) {
      setRepeatingAttackAttr(atkCharId, rowId, "attack_charges", currentCharges - autofireRate);
      if (currentCharges - autofireRate <= 0) {
        ch("MP", `/w gm ⚠️ ${esc(attackName)}: Last charges used!`);
      }
    }

    // Announce autofire burst
    let announceHtml = `<div style="background:#2b2b3d; border:2px solid #f4d03f; border-radius:6px; padding:6px; font-family:Arial,sans-serif; font-size:12px; color:#eaeaea;">`;
    announceHtml += `<div style="font-weight:bold; font-size:14px; color:#f4d03f; margin-bottom:4px;">🔥 AUTOFIRE ×${autofireRate}</div>`;
    announceHtml += `<div><b>${esc(atkName)}</b> fires <b>${esc(attackName)}</b> at <b>${esc(defChar.get("name"))}</b></div>`;
    if (totalPR > 0) announceHtml += `<div style="color:#8be9fd; font-size:11px;">PR: -${totalPR} (${basePR}×${autofireRate})</div>`;
    if (hasCharges) announceHtml += `<div style="color:#8be9fd; font-size:11px;">Charges: -${autofireRate} (${currentCharges - autofireRate} remaining)</div>`;
    announceHtml += `<div style="color:#aaa; font-size:10px; margin-top:4px;">Note: Targets must be adjacent. Rolling ${autofireRate} separate attacks...</div>`;
    announceHtml += `</div>`;
    ch("MP", `/w gm ` + announceHtml);

    // Roll each attack separately with slight delay to avoid race conditions
    const pushDmg = pushAmount > 0 ? `+${pushAmount}` : "";
    
    for (let shot = 1; shot <= autofireRate; shot++) {
      setTimeout(() => {
        // Build roll message - pass nopr=1 since we already deducted PR/charges upfront
        const rollMsg = `&{template:mpattack} {{mpapi=1}} {{atk=${atkCharId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{nopr=1}} {{name=${atkName} - ${attackName} (Shot ${shot}/${autofireRate})}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;
        
        sendChat(`character|${atkCharId}`, rollMsg);
      }, (shot - 1) * 500); // 500ms delay between shots
    }
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
            if (testParts[i].startsWith("--ap")) {
              // --ap or --ap:N
              const apParts = testParts[i].split(":");
              testArgs.ap = apParts[1] || "all";
            }
          }
        } else if (testArgs.subcmd === "save") {
          testArgs.bc = testParts[3] || "EN";
          testArgs.mod = testParts[4] || "0";
          testArgs.rec = testParts[5] || "-14";
          testArgs.dtype = testParts[6] || "psychic";
        } else if (testArgs.subcmd === "snare") {
          testArgs.bp = testParts[3] || "12";
          testArgs.max = testParts[4] || "";
          testArgs.type = testParts[5] || "Ice";
        } else if (testArgs.subcmd === "heal") {
          testArgs.amount = testParts[3] || "10";
          testArgs.power = testParts[4] || "0";
        } else if (testArgs.subcmd === "grapple") {
          // Usage: !mp test grapple [TOHIT] [LOCK]
          // Select 2 tokens: grappler first, target second
          testArgs.tohit = testParts[3] || "";
          testArgs.lock = (testParts[4] || "").toLowerCase(); // "lock" optional
        }
        return cmdTest(msg, testArgs);
      case "stance":
        const stanceParts = msg.content.split(/\s+/);
        return cmdStance(msg, { stance: stanceParts[2] || "" });
      case "range":
        return cmdRange(msg, args);
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

      case "grapplelock": return cmdGrappleLock(msg, args);
      case "countergrapple": return cmdCounterGrapple(msg, args);

      case "escape": return cmdEscape(msg, args);
      case "wakeup": return cmdWakeup(msg, args);
      case "status": return cmdStatus(msg, args);
      case "info": return cmdInfo(msg, args);
      case "atkinfo": return cmdAttackInfo(msg, args);
      case "atk": return cmdQuickAttack(msg, args);
      case "autofire": return cmdAutofire(msg, args);
      case "sv": return cmdQuickSave(msg, args);
      case "help":
      default:
        return ch("MP", `/w gm <b>MP Engine v2.10</b> Commands:<br/>
          <b>Quick Macros:</b><br/>
          <code>!mp atk N --atk TOKID --target TOKID [--mod N] [--push N]</code><br/>
          <code>!mp autofire N --atk TOKID --target TOKID</code> - Autofire attack row N<br/>
          <code>!mp sv BC [mod]</code> - Save (EN/AG/IN/CL)<br/>
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
          <code>!mp grapplelock --target TOKID</code><br/>
          <code>!mp escape --target TOKID</code><br/>
          <code>!mp grapplebreak --target TOKID --pushdef 0|1 --pushatk 0|1</code><br/>
          <code>!mp countergrapple --target TOKID --wrestle 0|1</code><br/>

          <code>!mp wakeup --target TOKID</code><br/>
          <code>!mp status --target TOKID</code><br/>          <code>!mp info --name &lt;Ability/Weakness&gt;</code><br/>

          <b>Stances (Bar3):</b><br/>
          <code>!mp stance normal|def|full|offbal|N</code><br/>
          <code>!mp clearstances</code> - Clear all on page<br/>
          <code>!mp offbal</code> - Apply Off Balance to selected<br/>
          <b>Range:</b><br/>
          <code>!mp range</code> - Check range between 2 selected tokens<br/>
          <b>Test Commands:</b><br/>
          <code>!mp test</code> - Show all test commands<br/>
          <code>!mp test grapple [TOHIT] [lock]</code> - Grapple harness (select 2 tokens: grappler, target)
   `);
    }
  }

  // -------------------------
  // INIT
  // -------------------------
  on("chat:message", onChat);

  ch("MP", `/w gm <b>MP Engine v2.8:</b> Loaded. Type <code>!mp test</code> for debug commands.`);

  return { CFG, CRIT_TYPES, FUMBLE_TYPES, rollExpr };
})();

on("ready", function() {
  log("MP ENGINE v2.8 READY");
});