/* Mighty Protectors Roll20 API Engine v2.66.2 - 2026-06-19
 * v2.66.2: gwspawn vehicle emit now auto-paints a grid LAYOUT. Each functional
 *          system (abId, non-integral) is tiled into a cols-wide rectangle (1 cell
 *          = 1 system space) and a hull wall border is traced; cell color is derived
 *          by the builder from the system desc (MP.sysColor) so blocks match the
 *          system-row swatches. cols per vehicle via vdef.layout.cols.
 * v2.66.1: gwspawn vehicle emit — fix modifier-index economy. vehDefaultAbility
 *          wrote timereq=0 ("No Time", +5 CP) and left charges=0 ("Unlimited");
 *          for a base-PR-16 Force Field that inflated the screen 50 -> 75 CP
 *          (illegal). Now timereq=2 ("1 Phase", 0 CP), charges = the ability's
 *          base PR index (0 CP), and data `pr` is converted from a PR VALUE to its
 *          scale index (FF PR 16 -> index 8) instead of being copied raw. Confirmed
 *          vs FLYER.json (FF pr=8/charges=8). System 9 EMP re-pointed to Negation.
 * v2.66.0: gwspawn now spawns VEHICLES. Death Machine and Defense/Attack Borg are
 *          modeled as MP Vehicles (not characters) in MP_GW_VEHICLES (sibling data
 *          script). gwspawn checks that list first and, on a match, emits a builder-
 *          format JSON (FLYER.json schema, version 10) via buildVehicleFromMPData()
 *          to the API console + a whispered preview, for import into the MP Vehicle
 *          builder. Weapons are capped Power Blast / Disintegration; Force Field is
 *          per-hit protection; armor 8/5/4/3. Shadows the dormant character entries
 *          of the same names. (Also bumped stale runtime version banners 2.64.2.)
 * v2.65.0: gwspawn now imports structured ability modifiers. Ability rows
 *          carrying mod data (ab.mods: st_mod/en_mod/ag_mod/in_mod/cl_mod,
 *          hits_mod, move_mod, power_mod, profile_mod, weight_mod, init_mod)
 *          set the matching per-row ability_*_mod fields and are flagged
 *          Active so recalcAbilityBonuses rolls them up. BCs are now imported
 *          as BASE characteristics; data.aggmods pre-seeds the rolled-up
 *          modifier fields so derived scores (BCs/Hits/Power/Move) are correct
 *          before the sheet is first opened. Pairs with the sheet's new
 *          per-row Move mod field (Speed).
 * v2.64.2: buildCharacterFromMPData also sets current/max Hits (hits_score) and
 *          Power (power_score) from data.hitPts/hitPtsSrc/power/powerSrc. The sheet
 *          copies current<-max only on sheet:opened, so API-built characters read
 *          0 Hits in combat until set. gwspawn blocks now carry these + MP species.
 * v2.64.1: buildCharacterFromMPData now sets initiative_score from data.initiative.
 *          The sheet only computes the init die on sheet:opened, so API-built
 *          characters (import + gwspawn) previously had a blank Initiative roll
 *          that never reached the turn tracker. Bestiary blocks now carry the die.
 * v2.64.0: !mp gwspawn --name NAME [--form FORM] builds a Gamma World creature
 *          NPC from embedded MP_GW_BESTIARY (sibling script mp_gw_bestiary.js).
 *          MP Builder import build-logic extracted to buildCharacterFromMPData(),
 *          now shared by both !mp import and !mp gwspawn.
 * v2.63.6: Match duration-tick damage buttons to the standard set. The
 *          !mp round ongoing-damage prompt now offers Apply / Roll-With
 *          Max / Roll-With Custom (modes noroll / rollwithmax /
 *          rollwithcustom) like a normal damage card, instead of the
 *          non-matching "Apply Damage" / "Roll-With" pair.
 * v2.63.5: Stop duplicate recovery-roll prompts. Save conditions now
 *          refresh in place instead of stacking a same-type duplicate
 *          (cmdSave), and !mp round emits at most one recovery prompt
 *          per condition type per token.
 * v2.63.4: !mp round now surfaces due recovery saves. Active save-attack
 *          conditions (paralyzed, mind control, poison, etc.) get a
 *          [Recovery Roll] prompt when their recovery interval comes due,
 *          gated per-condition (1-round effects prompt every round; an
 *          N-round/Duration effect prompts every N). Conditions stamp the
 *          round they were applied (startRound) to anchor the schedule.
 * v2.63.3: Fix crash on save attacks ("Assignment to constant variable"
 *          in cmdSave). The v2.63.0 undo button appended to msg_out, which
 *          was declared const; changed to let. Affected every save attack.
 * v2.63.2: Save attacks with Duration now recover on the durational
 *          schedule. Per MP Modifiers ("Duration"), on a save attack the
 *          Duration is the interval between recovery saves (first save
 *          still immediate); recTime is set from the duration span instead
 *          of defaulting to 1/round. Save card tags it "(Duration)".
 * v2.63.1: Fix Undo not clearing status-effect badges. Restore now
 *          toggles markers via the per-marker status_<name> API (diffing
 *          current vs. snapshot) instead of setting the aggregate
 *          "statusmarkers" string, which did not reliably remove a badge
 *          that was turned on with status_<name>.
 * v2.63.0: Add Undo to combat chat cards.
 *          - New undo store + snapshot/restore of a token's bars, status
 *            markers, FF aura, and conditions; pruned to last 40 entries.
 *          - Damage result card (!mp apply) and save card (!mp save) show
 *            [↩ Undo] restoring the target's full pre-resolution state.
 *          - Attack to-hit card shows [↩ Undo] to cancel a misfired attack:
 *            refunds attacker PR/charges and voids the pending so its
 *            apply/save buttons stop working.
 *          - New command/router case: !mp undo --id ID (GM only).
 *          - Area attacks are not yet undoable (specialized path).
 * v2.62.0: Implement Duration modifier (MP Modifiers, "Duration").
 *          - Attack build now reads attack_duration_num/unit/active/escape.
 *          - On a confirmed hit, a durational attack sets an ongoing-effect
 *            badge (status_stopwatch) on the target token and tracks it as a
 *            "duration" condition. Re-hits from the same source are cumulative
 *            in duration (not damage), per the rules.
 *          - !mp round (forward) ticks each effect: rolls per-round damage,
 *            routes it through !mp apply so protection/Roll-With apply, then
 *            decrements; clears the badge when no duration effects remain.
 *          - !mp conditions shows duration effects with rounds left + escape.
 * v2.61.4: Define generateRowID/generateUUID (was undefined) so
 *          !mp import can build its repeating rows — abilities,
 *          attacks, careers, protection. Import previously threw
 *          ReferenceError after BCs, leaving only basic characteristics.
 * v2.61.3: Fix Stance display on attack chat card *        - Previously showed only defender's bar3 (defMod), so an attacker in
 *          Defensive Stance saw "Stance: 0" even though their -3 to-hit was
 *          being applied. Now shows both: "Stance: A:-3 D:+3" with A=attacker's
 *          stance penalty and D=defender's stance bonus. Sign prefix on D so
 *          +3/+6 bonuses are obvious. Title tooltip lists the stance commands.
 * v2.61.2: Add !mp showbars for toggling player bar visibility
 *        - cmdShowBars sets showplayers_bar1/2/3 on selected tokens
 *        - GM-only, supports --bars 1,2,3 and --off
 *        - Use case: testing, quickly seeing Hits/Power on every token
 * v2.61.1: Fix area-effect escape buttons not rendering for players
 *        - handleAreaAttack: per-token escape buttons were whispered using
 *          t.controller (a player ID) as the /w target, so /w "${playerId}"
 *          silently delivered to no one. Route through chToChar(t.charId)
 *          so the character's controllers are resolved by name.
 * v2.61.0: MP Builder import/export
 *        - !mp export: select token, exports character to handout JSON for MP Builder
 *        - !mp import --name HandoutName: imports MP Builder JSON from handout
 *        - Maps identity, BCs, abilities, attacks, careers, protection
 *        - Creates/updates character, rebuilds repeating sections
 * v2.60.0: Vehicle combat integration
 *        - isVehicleMode() detects vehicle_mode checkbox on defender/attacker
 *        - Vehicle targets use vehicle_hits/vehicle_power instead of character hits/power
 *        - Vehicle base armor from vehicle_armor_kinetic/energy/biochem/entropy/psychic
 *        - Additional vehicle protection from repeating_vehprotection rows (invuln/adapt/hardened)
 *        - FF/Absorption/Reflection from character repeating_protection rows (shared)
 *        - Vehicles cannot roll-with (buttons suppressed, divert always 0)
 *        - No overflow to Power, no unconsciousness, no head/limb shots on vehicles
 *        - VEHICLE INCAPACITATED at 0 Hits, explosion warning when below 0
 *        - Vehicle-aware: cmdApply, cmdAreaDamageAll, cmdAbsorb, cmdReflect, cmdReflectHit
 *        - Vehicle-aware: cmdAFCounter, cmdSave, cmdStatus, cmdRestore, cmdWakeup
 *        - Vehicle-aware: cmdKnockback (vehicle mass), cmdKBSave (vehicle AG save)
 *        - Vehicle-aware: FF toggle/reset/reinforce (vehicle Power for PR costs)
 *        - Vehicle-aware: attacker PR/push Power deduction, testHeal, squeeze buttons
 *        - buildStandardAttackButtons/AfterAF: Apply-only for vehicles, skip limb shots
 *        - buildSaveAttackButtons: skip roll-with option for vehicle defenders
 * v2.59.0: Force Field support (protection mode = forcefield)
 *        - getForceFieldData() reads FF protection row: per-type values, accum, threshold
 *        - sumProtectionWithHardened/Coverage skip forcefield rows (not passive)
 *        - cmdApply: FF deflection pool tracking, collapse + overflow, Gas block, Gravity bypass
 *        - cmdFFReset: renew FF (zero accum, PR cost, re-activate)
 *        - cmdFFReinforce: saved action at collapse, overflow goes onto new field
 *        - cmdFFToggle: !mp ff to activate/deactivate FF with PR cost and aura
 *        - Aura2 visual: blue (>50%), yellow (25-50%), red (<25%), cleared on collapse/off
 *        - FF indicator on damage chat card with pool status
 * v2.58.9: Subtype-to-parent mapping in resolveDmgType
 *        - DMG_TYPE_MAP includes all subtypes mapped to parent types
 *          (e.g. sharp→Kinetic, heat→Energy, cold→Entropy, poison→Biochemical)
 *        - Fixes corrupted attack_dmgtype attrs storing subtype instead of parent
 * v2.58.8: Attack buttons (Roll-With, Apply, KB) whispered to defender only
 *        - Attacker sees attack card but not action buttons
 *        - Defender (target) sees card + buttons (their roll-with choice)
 *        - GM sees everything via whisper visibility
 * v2.58.7: Attack buttons (Roll-With, Apply, KB) whispered to defender only
 *        - Fix: damage type falling through to "Other" for valid types
 *        - New resolveDmgType() helper with substring fallback (e.g. "sharp kinetic" → Kinetic)
 *        - Damage result card sent to GM + defender only (attacker no longer sees target stats)
 * v2.58.6: Fix whisper visibility for GM + player sessions
 *        - Characters with only "ALL" controller don't receive whispers
 *        - chToChar/chToChars now always send /w gm, additionally whisper
 *          characters that have specific (non-ALL) player controllers
 *        - New hasPlayerController() helper checks controlledby field
 *        - chCombat 4th arg is atkCharId for attacker visibility
 *        - Attack output uses chToChars([atkCharId, defCharId])
 *        - Area records now store atkCharId for whisper targeting
 * v2.58.0: Add hit/miss SFX support via Roll20 Jukebox
 *        - playSFX() helper triggers named Jukebox tracks
 *        - Plays "SFX-Hit" on HIT/CRIT, "SFX-Miss" on MISS/FUMBLE
 * v2.57.6: Add damage roll breakdown hover tooltip on attack card
 *        - Damage number now shows dice formula and individual results on hover
 *        - New inlineRollBreakdown() extracts expression from Roll20 inline rolls
 * v2.57.5: Fix area effect attacks missing normal card and player visibility
 *        - Area attacks now show the standard attack card before the AE card
 *        - AE card, damage results, and escape-resolved message sent to attacker's player
 *        - Store playerid in pendingArea record for follow-up command targeting
 * v2.57.4: Fix attack buttons not visible to attacking player when defender is NPC
 *        - When GM_ONLY_BUTTONS=true, buttons now also whisper to attacker's player
 *          if they are not GM and not already the defender's controller
 *        - Fixes: GM joining as player sees attack card but no Roll-With/KB/Save buttons
 * v2.57.3: Fix attack card not visible when using !mp atk / !mp autofire macros
 *        - cmdQuickAttack/cmdAutofire pass original playerid through roll template
 *        - handleMpAttack uses fields.playerid (fallback msg.playerid) for card targeting
 *        - Fixes: sendChat("character|ID") sets msg.playerid to API, not original player
 * v2.57.2: Fix double chat card when wtId() falls back to /w gm
 *        - chBoth, chBothId, chCombat now guard against duplicate /w gm sends
 *        - cmdApply deduplicates attacker send when same player controls both chars
 * v2.57.1: Combat buttons (Roll-With, KB, Save, etc.) now visible to defender's player
 *        - New chCombat() sends button outputs to GM + defender's controlling player
 *        - getControllingPlayerId() resolves character → player for whisper targeting
 *        - All 30+ combat resolution outputs converted from GM-only to chCombat
 *        - Attack card: html → attacker+GM, buttons → defender+GM
 *        - Apply/KB/Save/Recover/Grapple/Snare/Absorb/Reflect/AF results → defender+GM
 * v2.57.0: Player permission and whisper targeting overhaul
 *        - Players now see attack cards, damage results, saves in chat
 *        - Action buttons (Apply, KB, etc.) remain GM-only when GM_ONLY_BUTTONS=true
 *        - Error messages whisper to command sender, not always GM
 *        - Permission helpers: wt(), wtId(), chBoth(), chBothId(), gmOnly(), canControl()
 *        - cmdQuickAttack/cmdAutofire: canControl() check (players can only attack with own chars)
 *        - cmdStance: canControl() check, results visible to both GM and player
 *        - cmdStatus/cmdConditions/cmdRange: results whisper to requester
 *        - cmdQuickSave: results visible to both GM and player
 *        - GM-only gates added: debug, round, clearstances, restore, offbal,
 *          arearollnpcs, areaforceall, areadamageall
 *        - Player-reactive commands (escape, countergrapple, areaescape, areashield)
 *          now whisper errors to player
 * v2.56.3: Additional hover text and uniform number sizing
 *        - All 4 core numbers now 28px uniform size
 *        - Confirm hover: explains crit/fumble confirmation purpose
 *        - Chg hover: shows remaining charges after deduction
 *        - Damage Type hover: shows subtype (e.g., heat, sonics) when set
 * v2.56.2: Aligned chat card colors with character sheet palette
 *        - To-Hit number now gold (#f0c040) matching sheet stat labels
 *        - Positive modifiers green (#5dde5d) matching sheet buttons
 *        - Modifier labels warmer tone, MODIFIERS header gold-tinted
 *        - Cost display (PR/Chg) uses sheet gold
 * v2.56.1: Chat card fixes
 *        - Roll border now red on miss/fumble, green on hit/crit
 *        - Fixed flexbox layouts (not supported in Roll20 chat) to inline/table
 *        - Apply card: larger Hits/Power numbers (16px), better contrast
 *        - Fixed prone marker: status_prone -> status_back-pain (valid Roll20 marker)
 * v2.56: Redesigned attack chat card and apply result card
 *        - Dark theme with improved visual hierarchy
 *        - Single-line header: "Attacker attacks Target with Weapon"
 *        - 4-column core grid: Roll, Confirm, To-Hit, Damage
 *        - Separated props row (Type, KB, Rng, PR/Chg)
 *        - Separated modifiers section with color-coded values
 *        - Redesigned apply result card with cleaner math breakdown
 * v2.55: Improved attack card readability
 *        - Added prominent "vs Target Name" subheader below attacker name
 *        - Added large color-coded outcome banner: HIT (green), CRIT (gold), MISS (gray), FUMBLE (red)
 *        - Removed redundant defender name from info footer (already in subheader)
 * v2.54: Ability Field protection mechanics implemented (2.2.4)
 *        - AF rows excluded from summed protection (they're reactive, not passive)
 *        - When attack hits target with active AF, shows attack type buttons
 *        - Projectile: AF damage subtracts from attack (destroys if reduced to 0)
 *        - Non-Projectile: AF has no effect, normal damage
 *        - Melee Weapon: AF damages weapon (may negate attack if destroyed)
 *        - Unarmed: AF counter-damages attacker (may abort attack if KO'd)
 * v2.53: Hardened values now use separate fields per damage type
 *        - New sheet fields: prot_hard_kinetic, prot_hard_energy, etc.
 *        - Allows different hardened values per damage type (e.g., 5 prot / 3 hardened)
 *        - Removed 'h' notation parsing (legacy values still strip 'h' for compatibility)
 * v2.52: Fixed called shot penalty double-counting and miss display
 *        - Removed duplicate calledShotPenalty from targetTotal (already in macroMod)
 *        - Called shot effects (doubled damage, protected brain) now only show on hits
 *        - Missed called shots show "Called shot attempted" instead of effect text
 * v2.51: Fixed called shot penalty not showing in hover breakdown
 *        - Sheet sends numeric penalty (e.g. "-6") not type name
 *        - Added reverse-mapping: -6 -> Head, -3 -> Called (ambiguous)
 *        - Penalty now displays correctly in tooltip and footer
 * v2.50: Overhauled handleMpAttack output to match HTML sheet layout
 *        - Improved Range/Profile formatting to remove excessive decimals
 * v2.48: Fixed save attack recovery TN and push display
 *        - Recovery TN now includes initial save modifier (saveMod)
 *          Per 4.9: "same target number as initial save + additional difficulty modifier"
 *        - Push modifier now passed and displayed separately from Crit
 *          Shows "Push: -N" in orange in save breakdown
 * v2.47: More robust mpapi checkbox check
 *        - Explicitly converts to string, trims whitespace
 *        - Only processes when exactly "1"
 * v2.46: Block attack when no charges remaining
 *        - Attack is blocked with visible public message instead of proceeding
 *        - Check occurs before power deduction (no wasted resources)
 *        - "Last charge used" warning still whispered to GM on final use
 * v2.45: Unlimited charges support
 * v2.44: Unlimited charges (-1) support
 *        - Enter -1 in Charges field for unlimited uses
 *        - Skips charge decrement, displays ∞ in autofire announcement
 * v2.43: Profile range correction per rulebook 4.7.3.1
 *        - Both attacker AND target profiles now affect range penalty
 *        - Formula: adjustedRange = actualRange × atkProfile / defProfile
 *        - Example: Profile 1 firing at Profile 3.2 at 24" = 24×1/3.2 = 7.5" = -1 penalty
 *        - Sheet query modifiers (aim/multi/other) now passed to API via hitmod field
 *        - API reads hitmod from inline roll result (supports computed values)
 * Handles all dmgtype variations: K/Kin/Kinetic, E/Eng/Energy, etc.
 * Separate PR/Charges columns, Armor Piercing rules
 * Protection notation: 5=prot, 5/4=invuln, 5/2=adapt, 5/4/2=all
 * Hardened: Now uses separate prot_hard_* fields per damage type
 * Range uses edge-to-edge distance (minimum range = 1" per MP rules)
 * v2.11: Fixed range calculation to account for page snapping_increment
 * v2.12: Warns and stops attack if duplicate tokens exist on map
 *        Added damage field validation (rejects non-dice text)
 *        Added !mp debug tokens/deltoken commands
 * v2.13: Enhanced save attack processing
 *        - Condition tracking on tokens (paralyzed, mind control, etc.)
 *        - Status markers for active conditions
 *        - Recovery timing support (1 phase, 1 round, etc.)
 *        - Commands: !mp conditions, !mp clearcondition
 * v2.14: Save attack refinements
 *        - Init and Rec modifiers are now SEPARATE values (not additive)
 *        - Damaging Poison: Bio prot applies to DAMAGE only, NOT to EN save TN
 *        - Paralytic Poison: Bio prot applies to EN save TN (no damage)
 *        - Poison detected by damage value (doesn't require "Damaging" in name)
 *        - Poison damage has Roll-With buttons
 *        - Save Roll-With: 1 Power per +1 to save TN, max bonus = floor(Power/10)
 *        - Improved text readability (darker green for success messages)
 * v2.15: Snare BP dice formula support (e.g., "2d8" instead of fixed number)
 * v2.16: Range penalty extends beyond -12 for extreme distances (x2 = -1 more)
 * v2.17: Adaptation support (/2 suffix)
 *        - Takes ½ damage (rounded down) vs active attacks
 *        - +5 bonus to saves vs adapted damage type
 *        - 'Other' damage type: 100% immunity
 *        - Stacks with Invulnerability (apply invuln first, then adapt)
 * v2.18: Area Effect support
 *        - Area attacks get +6 (immobile) and 0 defense (per 4.7.2)
 *        - Auto-detect tokens in radius, escape buttons for players
 *        - Shield block option (damage vs shield BP)
 *        - Coverage reduction: Light=25%, Heavy=50%, Full=100%
 *        - Scatter on miss: ceil((range/20) * failMargin)
 *        - Commands: areaescape, areashield, arearollnpcs, areaforceall, areadamageall
 * v2.19: Damage Sub-Type matching
 *        - Attack and protection rows have sub-type fields (Heat, Sonics, Poison, etc.)
 *        - Protection with blank sub-type covers full damage type
 *        - Protection with specific sub-type only matches that sub-type
 *        - Supports comma-separated sub-types (Heat,Radiation)
 * v2.20: Absorption and Reflection support
 *        - Protection Mode: Normal (auto-apply), Absorption, or Reflection
 *        - Absorption/Reflection require saved action, give 1/4 damage
 *        - Reflection redirects damage as immediate counter-attack
 *        - Commands: absorb, reflect, reflecthit
 * v2.21: Absorption simplified
 *        - Absorbed points go directly to Hits, Power, or Split 50/50
 * v2.22: Absorption expanded
 *        - Can absorb to BC stats (ST/EN/AG/IN/CL) - temporary boost
 *        - Can absorb to "Other" powers - tracked as status effect
 *        - Status effects have 5-minute expiry with countdown
 *        - BC stat boosts automatically restore on expiry/clear
 *        - Purple status marker shows active absorption effects
 *        - Commands: checkexpiry (manual expiry check)
 * v2.23: (superseded by v2.43 - profile now uses both attacker and target)
 * v2.24: Minimum range enforcement
 *        - Adjacent tokens are at 1" range (not 0") per MP rules
 *        - Profile adjustments now work correctly at melee range
 *        - Example: fly at 1/420 profile in melee = 1" / (1/420) = 420" = -7 penalty
 * v2.25: Grapple attack support
 *        - Attack rows can be flagged as grapple attacks
 *        - Remote grapple flag (TK, Magnetism) blocks counter-grapple
 *        - Grip type: HTH (uses Base HTH Damage) or Power (custom dice)
 *        - Fixed counter-grapple TN: AG save (+3 if wrestling), not AG+3+wrestling
 *        - Squeeze/Break Free use grip dice when specified
 * v2.26: Grapple command enhancement
 *        - !mp grapple works with selected tokens (attacker first, target second)
 *        - !mp test grapple supports remote and gripdice args
 * v2.27: Grapple rules compliance (4.11)
 *        - !mp grapple now requires to-hit roll (per 4.11)
 *        - Considers target defense modifier
 *        - Lock attempt integrated (-3 penalty per 4.11.1)
 *        - Added !mp grapplerelease command
 *        - Test harness bypasses roll for testing
 *        - Restraint penalty reminder in output
 * v2.28: Token selection fix
 *        - Fixed reversed token order (Roll20 returns most recent first)
 *        - Updated all version strings throughout file
 * v2.29: Grapple refinements
 *        - Hover text on all grapple rolls showing dice/TN breakdown
 *        - Attacker gets "fist" status marker (restraint tracking per 3.0.2.6)
 *        - Correct restraint penalties: -3 normal, -9 if locked
 *        - Remote grapples still mark the grappler (restraint applies per 3.0.2.6 & 4.11)
 *        - All grapple end conditions clear attacker status marker
 *        - Counter-grapple sets fist marker on successful counter
 * v2.30: Restraint penalty enforcement (3.0.2.6)
 *        - Attacks now automatically apply restraint penalty
 *        - -3 if grappling someone or being grappled
 *        - -9 if fully restrained (locked)
 *        - Penalty shown in attack output and hover breakdown
 *        - Checks both grapple record and fist status marker
 * v2.31: Grapple attack corrections (4.11)
 *        - Grapple attacks do NOT deal damage (only establish hold)
 *        - Squeeze command now uses full damage pipeline (protection, roll-with)
 *        - Squeeze creates pending record with damage buttons
 * v2.32: Restore clears all effects
 * v2.33: Ability to-hit bonus fix
 *        - API now includes ability_tohit_bonus (global) and ability_tohit_targeted (per-row)
 *        - Heightened Expertise bonuses now properly applied to combat rolls
 *        - Improved hover breakdown: shows BC+3, Atk Mod, Ht.Exp, subtotal, then penalties
 * v2.34: Willpower abilities support
 *        - Fortitude: doubles roll-with capacity (checkbox in ability panel)
 *        - Pain Resistance: no knockout at half Hits, only at 0 (checkbox in ability panel)
 *        - !mp stat shows Fortitude/Pain Resistance indicators
 *        - !mp restore now clears all status markers (not just dead/sleepy)
 *        - Clears grapple/snare state and releases held targets
 *        - Clears conditions (paralyzed, mind control, etc.)
 *        - Resets defense modifier (bar3) to 0
 * v2.35: Protected Brain ability
 *        - Checkbox in ability panel, negates Head Shot critical effects
 * v2.36: Protected Brain notification
 *        - Shows notification in attack output when Head Shot is negated
 * v2.37: Called shot handling (4.14.2)
 *        - Roll template now passes called shot type to API
 *        - Head Shot (-6): Doubles Hits after protection/roll-with, Protected Brain negates
 *        - Leg Shot (-3): Shows EN+7 and AG save buttons
 *        - Arm Shot (-3): Shows EN+7 and AG save buttons
 *        - Avoid Armor (-3/-6): Bypasses partial armor coverage
 *        - Gear Shot (-3): Shows breakpoint comparison note
 *        - Called shot penalty shown in hover breakdown
 * v2.38: Protected Brain visibility fix
 *        - Changed text color from green (#50fa7b) to dark blue (#1a5276)
 *        - Now visible on green HIT background
 * v2.39: targetTotal calculation fix
 *        - API now always calculates to-hit from scratch using actual token defense
 *        - Hover breakdown math now matches displayed Final value
 * v2.40: Push/Hold Back fix
 *        - Fixed !mp atk command to support Hold Back (negative values)
 *        - Restored target field in roll template for TO-HIT display
 *        - Added Hold Back display message in attack output
 * v2.41: Absorption debug command
 *        - Added !mp debug absorb to check protection row setup
 *        - Shows State, Mode, and damage type values for each row
 * v2.42.1: Head shot knockback fix (MP 4.14.2.1)
 *        - Knockback is NOT doubled on head shots (damage to Hits is doubled, KB is not)
 *        - Added hitsForKB field to track pre-doubled value for KB calculation
 * 
 * Works with sheet's mpattack rolltemplate:
 *  {{mpapi=1}} {{atk=<character_id>}} {{def=<target token_id>}} {{row=<rowid>}}
 *  {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[...]]}} {{damage=[[...]]}} {{type=...}} {{subtype=...}}
 */
log("MP ENGINE v2.60 FILE STARTING");

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

    // Whisper results to GM (can be overridden by game default setting)
    GM_ONLY_BUTTONS: true,

    // Auto-cleanup old pending rolls (ms)
    PENDING_EXPIRE_MS: 3600000, // 1 hour

    // Snare stacking bonus per additional hit
    SNARE_STACK_BONUS: 2
  };

  // Vehicle mode detection
  function isVehicleMode(charId) {
    const v = getAttr(charId, "vehicle_mode");
    return v === "on" || v === "1" || v === 1;
  }

  // Vehicle resource helpers
  // Dedicated vehicle tokens have bar2→vehicle_hits, bar1→vehicle_power
  // Uses same getResource/setResource pattern as characters
  function getVehicleHits(tok, charId) {
    return getResource(tok, charId, CFG.HITS_BAR, "vehicle_hits");
  }
  function setVehicleHits(tok, charId, val) {
    setResource(tok, charId, CFG.HITS_BAR, "vehicle_hits", val);
  }
  function getVehiclePower(tok, charId) {
    return getResource(tok, charId, CFG.POWER_BAR, "vehicle_power");
  }
  function setVehiclePower(tok, charId, val) {
    setResource(tok, charId, CFG.POWER_BAR, "vehicle_power", val);
  }

  // Vehicle base armor + repeating_vehprotection rows
  function getVehicleProtection(charId, protKey) {
    // Map protKey to vehicle armor attr
    const armorMap = {
      kinetic: "vehicle_armor_kinetic",
      energy: "vehicle_armor_energy",
      bio: "vehicle_armor_biochem",
      entropy: "vehicle_armor_entropy",
      psychic: "vehicle_armor_psychic",
      other: "vehicle_armor_kinetic"  // Default to kinetic for "other"
    };
    let totalProt = getAttrNum(charId, armorMap[protKey] || armorMap.kinetic, 3);
    let totalHardened = 0;
    let hasInvuln = false;
    let hasAdapt = false;

    // Read repeating_vehprotection rows
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    const rowIds = new Set();
    attrs.forEach(a => {
      const m = a.get("name").match(/^repeating_vehprotection_([^_]+)_/);
      if (m) rowIds.add(m[1]);
    });

    const hardKeyMap = {
      kinetic: "hard_kinetic", energy: "hard_energy", bio: "hard_bio",
      entropy: "hard_entropy", psychic: "hard_psychic", other: "hard_other"
    };
    const hardKey = hardKeyMap[protKey] || null;

    rowIds.forEach(rowId => {
      const protAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_${protKey}`);
      if (!protAttr) return;
      const protValue = protAttr.get("current");
      if (!protValue || protValue === "0" || protValue === "") return;
      const parsed = parseProtValue(protValue);
      totalProt += parsed.prot;
      if (parsed.invuln) hasInvuln = true;
      if (parsed.adapt) hasAdapt = true;
      if (hardKey) {
        const ha = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_${hardKey}`);
        if (ha) totalHardened += (parseInt(ha.get("current"), 10) || 0);
      }
    });

    return { prot: totalProt, hardened: totalHardened, invuln: hasInvuln, adapt: hasAdapt };
  }

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
    pendingArea: {},  // Pending area effects: { rollId: { damage, damageType, radius, centerX, centerY, pageId, tokens: {}, timestamp, timeout } }
    snares: {},
    conditions: {},  // Token conditions: { tokenId: [{ type, sourceAtk, saveTN, recTN, recTime, marker, created, effectDesc, atkCharId }] }
    currentRound: 1,  // Combat round counter
    undo: {},  // Reversible snapshots: { undoId: { label, ts, tokenSnaps[], extra } }
    autoroll: true,
    enabled: true
  };
  
  // Ensure conditions exists for existing state
  if (!state.MP_Engine.conditions) state.MP_Engine.conditions = {};
  // Ensure pendingArea exists for existing state
  if (!state.MP_Engine.pendingArea) state.MP_Engine.pendingArea = {};
  // Ensure currentRound exists for existing state
  if (!state.MP_Engine.currentRound) state.MP_Engine.currentRound = 1;
  // Ensure undo store exists for existing state
  if (!state.MP_Engine.undo) state.MP_Engine.undo = {};

  // Status markers for save attack conditions
  const CONDITION_MARKERS = {
    paralyzed: "skull",
    mind_control: "chained-heart",
    emotion_control: "broken-heart",
    dazzled: "bleeding-eye",
    blinded: "interdiction",
    transmuted: "chemical-bolt",
    poisoned: "skull",
    damaging_poison: "skull",
    feared: "screaming",
    duration: "stopwatch",
    generic: "padlock"
  };

  // Map attack names/types to condition types
  // For damaging poison, also pass the damage amount to distinguish from paralytic
  function inferConditionType(atkName, saveBC, dmgType, damageAmount) {
    const name = String(atkName || "").toLowerCase();
    const bc = String(saveBC || "").toUpperCase();
    const dtype = String(dmgType || "").toLowerCase();
    const hasDamage = (damageAmount || 0) > 0;
    
    if (name.includes("paralys") || name.includes("paralyz")) return "paralyzed";
    if (name.includes("paralytic")) return "paralyzed";  // Paralytic Poison/Venom
    if (name.includes("mind control")) return "mind_control";
    if (name.includes("emotion") || name.includes("fear")) return "emotion_control";
    if (name.includes("dazzle") || name.includes("flash") || name.includes("blind")) return "dazzled";
    if (name.includes("transmut")) return "transmuted";
    
    // Damaging Poison/Venom:
    // 1. Explicitly named "damaging poison/venom", OR
    // 2. Has poison/venom in name AND has a damage value (not paralytic)
    if (name.includes("damaging") && (name.includes("poison") || name.includes("venom"))) return "damaging_poison";
    if ((name.includes("poison") || name.includes("venom")) && hasDamage) return "damaging_poison";
    
    // Generic poison/venom without damage = paralytic effect
    if (name.includes("poison") || name.includes("venom")) return "poisoned";
    
    // Infer from BC if name didn't match
    if (bc === "IN" && dtype.includes("psych")) return "mind_control";
    if (bc === "EN" && dtype.includes("entrop")) return "paralyzed";
    
    return "generic";
  }
  
  // Check if condition deals damage on failed recovery
  function conditionDealsDamage(condType) {
    return condType === "damaging_poison";
  }

  // Apply / extend a durational attack effect on a target token (MP Modifiers, "Duration").
  // Sets the ongoing-effect badge and tracks repeating damage. When the same source hits
  // again, duration is cumulative (damage is not). Returns a chat-card status snippet.
  function applyDurationEffect(rec, defTok) {
    if (!rec || !rec.hasDuration || !defTok) return "";

    const marker = CONDITION_MARKERS.duration;
    const unitLabel = rec.durNum
      ? `${rec.durNum} ${rec.durUnit || "round"}${rec.durNum === 1 ? "" : "s"}`
      : (rec.durUnit || "ongoing");
    const ticks = num(rec.durRounds, 0); // rounds of auto-repeat (0 for non-round units)

    if (!state.MP_Engine.conditions[rec.defTokenId]) {
      state.MP_Engine.conditions[rec.defTokenId] = [];
    }
    const conds = state.MP_Engine.conditions[rec.defTokenId];

    // Cumulative: extend an existing duration effect from the same source.
    const existing = conds.find(c => c.type === "duration" && c.sourceAtk === rec.atkName);
    let snippet;
    if (existing) {
      existing.roundsRemaining = num(existing.roundsRemaining, 0) + ticks;
      defTok.set("status_" + marker, true);
      snippet = `<br/><span style="color:#f4d03f; font-weight:bold;">⏱ DURATION extended</span>` +
        `<br/><span style="font-size:11px;">${esc(rec.atkName)} — ${existing.roundsRemaining} round(s) of effect remain (cumulative)</span>`;
    } else {
      conds.push({
        type: "duration",
        sourceAtk: rec.atkName,
        atkCharId: rec.atkCharId,
        dmgType: rec.dmgTypeStr || null,
        protKey: rec.protKey || null,
        damageExpr: rec.durDamageExpr || "",
        roundsRemaining: ticks,
        unitLabel: unitLabel,
        escape: rec.durEscape || "",
        marker: marker,
        startRound: state.MP_Engine.currentRound,
        created: Date.now()
      });
      defTok.set("status_" + marker, true);
      snippet = `<br/><span style="color:#f4d03f; font-weight:bold;">⏱ ONGOING EFFECT (${esc(unitLabel)})</span>`;
      if (ticks > 0 && rec.durDamageExpr) {
        snippet += `<br/><span style="font-size:11px;">Repeats <b>${esc(rec.durDamageExpr)}</b> ${esc(rec.dmgTypeStr || "")} each round for ${ticks} round(s)</span>`;
      } else if (ticks > 0) {
        snippet += `<br/><span style="font-size:11px;">Effect persists ${ticks} more round(s)</span>`;
      } else {
        snippet += `<br/><span style="font-size:11px;">Effect persists for ${esc(unitLabel)} (track manually)</span>`;
      }
      if (rec.durEscape) {
        snippet += `<br/><span style="font-size:11px; color:#9ad;">Escape: ${esc(rec.durEscape)}</span>`;
      }
    }
    return snippet;
  }

  // ============ UNDO SYSTEM ============
  // Combat commands register a reversible snapshot keyed by an undo id; the chat
  // card shows an [↩ Undo] button. A token snapshot captures bars, all status
  // markers, FF aura, and the conditions array — enough to reverse a command's
  // effect on that token. "extra" optionally restores attacker resources.
  function pruneUndo() {
    const u = state.MP_Engine.undo || {};
    const ids = Object.keys(u);
    if (ids.length <= 40) return;
    ids.map(id => ({ id, ts: u[id].ts || 0 }))
       .sort((a, b) => a.ts - b.ts)
       .slice(0, ids.length - 40)
       .forEach(e => { delete u[e.id]; });
  }

  function snapshotToken(tokenId) {
    const tok = tokenId ? getObj("graphic", tokenId) : null;
    if (!tok) return null;
    return {
      tokenId: tokenId,
      bar1: tok.get("bar1_value"),
      bar2: tok.get("bar2_value"),
      bar3: tok.get("bar3_value"),
      statusmarkers: tok.get("statusmarkers"),
      aura2_radius: tok.get("aura2_radius"),
      aura2_color: tok.get("aura2_color"),
      showplayers_aura2: tok.get("showplayers_aura2"),
      conditions: JSON.parse(JSON.stringify(state.MP_Engine.conditions[tokenId] || []))
    };
  }

  // Parse a Roll20 statusmarkers string ("skull,stopwatch@3") into base marker names.
  function parseMarkers(s) {
    return String(s || "").split(",").map(m => m.trim().split("@")[0]).filter(Boolean);
  }

  function restoreTokenSnapshot(snap) {
    if (!snap) return;
    const tok = getObj("graphic", snap.tokenId);
    if (tok) {
      tok.set({
        bar1_value: snap.bar1,
        bar2_value: snap.bar2,
        bar3_value: snap.bar3,
        aura2_radius: snap.aura2_radius,
        aura2_color: snap.aura2_color,
        showplayers_aura2: snap.showplayers_aura2
      });
      // Restore status markers using the same per-marker status_<name> API the rest
      // of the engine uses to set them — setting the aggregate "statusmarkers" string
      // does not reliably clear a badge that was turned on via status_<name>.
      const target = parseMarkers(snap.statusmarkers);
      const current = parseMarkers(tok.get("statusmarkers"));
      const targetHas = {}; target.forEach(m => { targetHas[m] = true; });
      const currentHas = {}; current.forEach(m => { currentHas[m] = true; });
      current.forEach(m => { if (!targetHas[m]) tok.set("status_" + m, false); });
      target.forEach(m => { if (!currentHas[m]) tok.set("status_" + m, true); });
    }
    state.MP_Engine.conditions[snap.tokenId] = snap.conditions || [];
  }

  // tokenSnaps: array from snapshotToken(). extra: optional attacker-resource refund.
  function registerUndo(undoId, label, tokenSnaps, extra) {
    if (!state.MP_Engine.undo) state.MP_Engine.undo = {};
    state.MP_Engine.undo[undoId] = {
      label: label || "action",
      ts: Date.now(),
      tokenSnaps: (tokenSnaps || []).filter(Boolean),
      extra: extra || null
    };
    pruneUndo();
  }

  function undoButton(undoId) {
    return `<br/><span style="font-size:11px;">[↩ Undo](!mp undo --id ${undoId})</span>`;
  }

  function cmdUndo(msg, args) {
    const undoId = args.id;
    const rec = undoId ? state.MP_Engine.undo[undoId] : null;
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Nothing to undo (expired or already undone).`);

    (rec.tokenSnaps || []).forEach(restoreTokenSnapshot);

    const ex = rec.extra;
    if (ex) {
      // Refund attacker Power
      if (ex.atkTokenId && ex.powerBefore != null) {
        const atok = getObj("graphic", ex.atkTokenId);
        if (ex.isVeh) setVehiclePower(atok, ex.atkCharId, num(ex.powerBefore, 0));
        else setResource(atok, ex.atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, num(ex.powerBefore, 0));
      }
      // Refund a spent charge (repeating attack attr)
      if (ex.chgCharId && ex.chgRowId && ex.chgBefore !== undefined && ex.chgBefore !== "") {
        setRepeatingAttackAttr(ex.chgCharId, ex.chgRowId, "attack_charges", ex.chgBefore);
      }
      // Void the pending attack so its damage buttons can't be applied after undo
      if (ex.voidPending && state.MP_Engine.pending[ex.voidPending]) {
        delete state.MP_Engine.pending[ex.voidPending];
      }
    }

    delete state.MP_Engine.undo[undoId];
    return ch("MP", `/w gm <div style="background:#2c3e50; border:2px solid #95a5a6; border-radius:6px; padding:6px 10px; color:#ecf0f1; font-family:Arial,sans-serif;">↩ <b>Undone:</b> ${esc(rec.label)}</div>`);
  }

  // -------------------------
  // UTILITY FUNCTIONS
  // -------------------------  
  // --- Roll20 repeating-row id generator (standard implementation) ---
var generateUUID = (function () {
  "use strict";
  var a = 0, b = [];
  return function () {
    var c = (new Date()).getTime() + 0, d = c === a;
    a = c;
    var e = new Array(8), f;
    for (f = 7; f >= 0; f--) {
      e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
      c = Math.floor(c / 64);
    }
    c = e.join("");
    if (d) {
      for (f = 11; f >= 0 && b[f] === 63; f--) { b[f] = 0; }
      b[f]++;
    } else {
      for (f = 0; f < 12; f++) { b[f] = Math.floor(64 * Math.random()); }
    }
    for (f = 0; f < 12; f++) {
      c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
    }
    return c;
  };
}());

function generateRowID() {
  "use strict";
  return generateUUID().replace(/_/g, "Z");
}

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

  // --- PERMISSION & WHISPER HELPERS ---

  // Return whisper prefix for the message sender
  // GM gets "/w gm ", players get "/w PlayerName "
  function wt(msg) {
    if (playerIsGM(msg.playerid)) return "/w gm ";
    const player = getObj("player", msg.playerid);
    if (!player) return "/w gm ";
    const name = player.get("_displayname");
    // Roll20 whisper names with spaces need quotes
    return `/w "${name}" `;
  }

  // Return whisper prefix for a stored player ID (from pending records)
  function wtId(playerId) {
    if (!playerId || playerIsGM(playerId)) return "/w gm ";
    const player = getObj("player", playerId);
    if (!player) return "/w gm ";
    const name = player.get("_displayname");
    return `/w "${name}" `;
  }

  // Check if character has a specific (non-ALL) player controller
  function hasPlayerController(charId) {
    if (!charId) return false;
    const char = getObj("character", charId);
    if (!char) return false;
    const cb = (char.get("controlledby") || "").split(",");
    return cb.some(id => { const t = id.trim(); return t && t !== "all"; });
  }

  // Whisper to character if it has a real player controller, otherwise /w gm
  function chToChar(who, content, charId) {
    if (charId && hasPlayerController(charId)) {
      const char = getObj("character", charId);
      if (char) { ch(who, `/w "${char.get("name")}" ` + content); return; }
    }
    ch(who, "/w gm " + content);
  }

  // Whisper to unique player controllers across all given characters.
  // Deduplicates by player ID so each player gets one copy.
  // /w gm fallback only if no player controllers found.
  function chToChars(who, content, charIds) {
    const sentPlayers = new Set();
    for (const cid of charIds) {
      if (!cid) continue;
      const char = getObj("character", cid);
      if (!char) continue;
      const cb = (char.get("controlledby") || "").split(",");
      for (const id of cb) {
        const pid = id.trim();
        if (!pid || pid === "all" || sentPlayers.has(pid)) continue;
        const player = getObj("player", pid);
        if (player) {
          ch(who, `/w "${player.get("_displayname")}" ` + content);
          sentPlayers.add(pid);
        }
      }
    }
    if (sentPlayers.size === 0) ch(who, "/w gm " + content);
  }

  // Send to player if non-GM (GM sees whispers), otherwise /w gm
  function chBoth(who, content, msg) {
    if (msg && msg.playerid && !playerIsGM(msg.playerid)) {
      const target = wt(msg);
      if (target !== "/w gm ") { ch(who, target + content); return; }
    }
    ch(who, "/w gm " + content);
  }

  // Send to player if non-GM (GM sees whispers), otherwise /w gm
  function chBothId(who, content, playerId) {
    if (playerId && !playerIsGM(playerId)) {
      const target = wtId(playerId);
      if (target !== "/w gm ") { ch(who, target + content); return; }
    }
    ch(who, "/w gm " + content);
  }

  // Send to all unique non-GM players (GM sees whispers), /w gm fallback if none
  function chPlayers(who, content, playerIds) {
    const sent = new Set();
    for (const pid of playerIds) {
      if (!pid || playerIsGM(pid)) continue;
      const target = wtId(pid);
      if (target !== "/w gm " && !sent.has(target)) {
        ch(who, target + content);
        sent.add(target);
      }
    }
    if (sent.size === 0) ch(who, "/w gm " + content);
  }

  // GM-only gate - returns true if not GM (caller should return)
  function gmOnly(msg) {
    if (playerIsGM(msg.playerid)) return false;
    ch("MP", wt(msg) + "Only the GM can use that command.");
    return true;
  }

  // Check if player controls a character (GM always passes)
  function canControl(msg, charId) {
    if (playerIsGM(msg.playerid)) return true;
    const char = getObj("character", charId);
    if (!char) return false;
    const controlledBy = char.get("controlledby") || "";
    return controlledBy.includes(msg.playerid) || controlledBy.includes("all");
  }

  // Get the first controlling player ID for a character (or null)
  function getControllingPlayerId(charId) {
    if (!charId) return null;
    const char = getObj("character", charId);
    if (!char) return null;
    const controlledBy = (char.get("controlledby") || "").split(",");
    for (const id of controlledBy) {
      const trimmed = id.trim();
      if (trimmed && trimmed !== "all" && !playerIsGM(trimmed)) return trimmed;
    }
    return null;
  }

  // Send combat result to defender + attacker characters via whisper
  // defCharId: defender character ID, atkCharId: optional attacker character ID
  function chCombat(who, content, defCharId, atkCharId) {
    if (!CFG.GM_ONLY_BUTTONS) {
      ch(who, content);
      return;
    }
    chToChars(who, content, [defCharId, atkCharId]);
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

  // Build hover breakdown from inline roll: "2d6(4+5) + 3 = 12"
  function inlineRollBreakdown(msg, token) {
    try {
      const m = /\$\[\[(\d+)\]\]/.exec(token || "");
      if (!m) return null;
      const idx = parseInt(m[1], 10);
      const ir = msg.inlinerolls && msg.inlinerolls[idx];
      if (!ir || !ir.results) return null;
      const parts = [];
      const rolls = ir.results.rolls || [];
      for (const r of rolls) {
        if (r.type === "R" && r.results) {
          const dice = r.results.map(d => d.v);
          parts.push(`${r.dice || 1}d${r.sides}(${dice.join("+")})`);
        } else if (r.type === "M" && r.expr) {
          const val = r.expr.replace(/^\+/, "").trim();
          if (val !== "0" && val !== "") parts.push(r.expr.trim());
        }
      }
      const expr = parts.join(" ").replace(/^\+\s*/, "").trim();
      return expr ? `${expr} = ${ir.results.total}` : String(ir.results.total);
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
    const strVal = String(value);
    let a = findObjs({ _type: "attribute", _characterid: charId, name: name })[0];
    if (!a) {
      a = createObj("attribute", { _characterid: charId, name: name, current: strVal });
    } else {
      a.set("current", strVal);
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

  // Resolve damage type string from attribute value or template field.
  // Exact map match first, then subtype-to-parent, then substring scan.
  const DMG_TYPE_MAP = {
    k:"Kinetic", kin:"Kinetic", kinetic:"Kinetic",
    e:"Energy", eng:"Energy", energy:"Energy",
    b:"Biochemical", bio:"Biochemical", biochemical:"Biochemical",
    ent:"Entropy", entropy:"Entropy",
    p:"Psychic", psy:"Psychic", psychic:"Psychic",
    o:"Other", oth:"Other", other:"Other",
    // Subtypes → parent type (handles corrupted attack_dmgtype values)
    blunt:"Kinetic", sharp:"Kinetic", sonics:"Kinetic", vibration:"Kinetic",
    "high pressure":"Kinetic", "low pressure":"Kinetic",
    heat:"Energy", electricity:"Energy", radiation:"Energy",
    light:"Energy", electromagnetics:"Energy",
    disease:"Biochemical", poison:"Biochemical", venom:"Biochemical",
    cold:"Entropy",
    gas:"Other", gravity:"Other", disintegration:"Other", transmutation:"Other",
    healing:"Other", asphyxiation:"Other", drowning:"Other", time:"Other"
  };
  function resolveDmgType(raw, fallback) {
    const t = String(raw || "").trim().toLowerCase();
    if (DMG_TYPE_MAP[t]) return DMG_TYPE_MAP[t];
    // Substring scan: handles compound values like "sharp kinetic"
    if (t.includes("kinetic") || t.includes("kin")) return "Kinetic";
    if (t.includes("energy") || t.includes("eng")) return "Energy";
    if (t.includes("entropy") || t.includes("ent")) return "Entropy";
    if (t.includes("psychic") || t.includes("psy")) return "Psychic";
    if (t.includes("bio") || t.includes("biochem")) return "Biochemical";
    if (fallback) { const fb = resolveDmgType(fallback); if (fb !== "Other") return fb; }
    return "Other";
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
  // "1/4" = invuln only (0 prot)
  // "5/4" = 5 prot + invuln
  // "1/2" = adapt only (0 prot)
  // "5/2" = 5 prot + adapt
  // "5/4/2" = 5 prot + invuln + adapt
  // NOTE: Hardened is now read from separate prot_hard_* fields (not parsed here)
  // Returns { prot: number, hardened: 0, invuln: boolean, adapt: boolean }
  function parseProtValue(val) {
    const s = String(val || "").toLowerCase().trim();
    if (!s || s === "0") return { prot: 0, hardened: 0, invuln: false, adapt: false };

    // Check for adaptation /2 and invulnerability /4
    const hasAdapt = s.includes("/2");
    const hasInvuln = s.includes("/4");
    
    // IMPORTANT: treat "1/4" as invulnerability only (no numeric protection)
    if (s === "1/4") return { prot: 0, hardened: 0, invuln: true, adapt: false };
    // Treat "1/2" as adaptation only (no numeric protection)
    if (s === "1/2") return { prot: 0, hardened: 0, invuln: false, adapt: true };
    // Treat "1/4/2" or "1/2/4" as both (no numeric protection)
    if ((s === "1/4/2" || s === "1/2/4")) return { prot: 0, hardened: 0, invuln: true, adapt: true };

    // Strip suffixes to get numeric part
    let withoutSuffixes = s.replace("/4", "").replace("/2", "");

    // Legacy: strip 'h' suffix if present (backward compatibility)
    const numStr = withoutSuffixes.endsWith("h") ? withoutSuffixes.slice(0, -1) : withoutSuffixes;
    const prot = parseFloat(numStr) || 0;

    return {
      prot: prot,
      hardened: 0,  // Hardened now read from separate fields
      invuln: hasInvuln,
      adapt: hasAdapt
    };
  }


  // Sum protection, hardened, invuln, and adapt for a specific damage type and subtype
  // Returns { prot: total protection, hardened: total hardened, invuln: boolean, adapt: boolean }
  // atkSubtype: the attack's sub-type (e.g., "heat", "sonics") - blank means no specific subtype
  // Protection matches if:
  //   - Protection has no subtype (blank) = covers full damage type
  //   - Protection subtype matches attack subtype exactly
  //   - Protection has comma-separated subtypes and one matches
  // NOTE: Absorption, Reflection, and Ability Field rows are SKIPPED - not passive protection
  // NOTE: Force Field rows are SKIPPED - handled separately with deflection pool
  // NOTE: Hardened is read from separate prot_hard_* fields (not parsed from protection value)
  function sumProtectionWithHardened(charId, protKey, atkSubtype) {
    if (!protKey) return { prot: 0, hardened: 0, invuln: false, adapt: false };
    
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    let totalProt = 0;
    let totalHardened = 0;
    let hasInvuln = false;
    let hasAdapt = false;
    
    // Map protKey to hardened field name
    const hardKeyMap = {
      "kinetic": "hard_kinetic",
      "energy": "hard_energy",
      "bio": "hard_bio",
      "entropy": "hard_entropy",
      "psychic": "hard_psychic",
      "other": "hard_other"
    };
    const hardKey = hardKeyMap[protKey] || null;
    
    // Normalize attack subtype for matching
    const atkSub = (atkSubtype || "").trim().toLowerCase();
    
    // Get all protection row IDs
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    rowIds.forEach(rowId => {
      // Check if this row is broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") return;  // Skip broken rows
      
      // Check if this row is active (state = Active)
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") return;  // Skip inactive rows
      
      // Check mode - skip Absorption and Reflection (they require saved action)
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode === "absorption" || mode === "reflection" || mode === "forcefield") return;  // Skip - not passive
      
      // Check if this is an Ability Field - skip (reactive protection, not passive)
      const afieldAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_afield`);
      if (afieldAttr && afieldAttr.get("current") === "1") return;  // Skip - AF is reactive
      
      // Get protection value for this damage type
      const protAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${protKey}`);
      if (!protAttr) return;  // No protection for this damage type
      
      const protValue = protAttr.get("current");
      if (!protValue || protValue === "0" || protValue === "") return;  // No protection value
      
      // Check subtype matching
      const subtypeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_subtype`);
      const protSubtype = subtypeAttr ? (subtypeAttr.get("current") || "").trim().toLowerCase() : "";
      
      // Matching rules:
      // 1. If protection has no subtype (blank), it covers the full damage type - always matches
      // 2. If attack has no subtype, only full-type protection (blank subtype) applies
      // 3. If both have subtypes, they must match (protection can be comma-separated list)
      let subtypeMatches = false;
      if (protSubtype === "") {
        // Protection covers full type - always matches
        subtypeMatches = true;
      } else if (atkSub === "") {
        // Attack has no subtype, but protection is subtype-specific - no match
        subtypeMatches = false;
      } else {
        // Both have subtypes - check if attack subtype is in protection's list
        const protSubtypes = protSubtype.split(",").map(s => s.trim().toLowerCase());
        subtypeMatches = protSubtypes.includes(atkSub);
      }
      
      if (!subtypeMatches) return;  // Subtype doesn't match
      
      // Parse protection value (invuln/adapt flags)
      const parsed = parseProtValue(protValue);
      totalProt += parsed.prot;
      if (parsed.invuln) hasInvuln = true;
      if (parsed.adapt) hasAdapt = true;
      
      // Read hardened from separate field
      if (hardKey) {
        const hardAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${hardKey}`);
        if (hardAttr) {
          const hardVal = parseInt(hardAttr.get("current"), 10) || 0;
          totalHardened += hardVal;
        }
      }
    });
    
    return { prot: totalProt, hardened: totalHardened, invuln: hasInvuln, adapt: hasAdapt };
  }

  // Legacy function for compatibility - just returns protection total
  function sumProtection(charId, protKey, atkSubtype) {
    return sumProtectionWithHardened(charId, protKey, atkSubtype).prot;
  }

  // Get total hardened for a specific damage type
  function sumHardened(charId, protKey, atkSubtype) {
    return sumProtectionWithHardened(charId, protKey, atkSubtype).hardened;
  }
  
  // Check if character has invulnerability for a damage type (from protection rows)
  function hasInvulnerability(charId, protKey, atkSubtype) {
    return sumProtectionWithHardened(charId, protKey, atkSubtype).invuln;
  }

  // Get Absorption or Reflection data for a character and damage type
  // Returns { mode: "absorption"|"reflection"|null, limit, rowId, absorbsTo, current } or null
  function getAbsorptionReflection(charId, protKey, atkSubtype) {
    if (!protKey) return null;
    
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    const atkSub = (atkSubtype || "").trim().toLowerCase();
    
    // Get all protection row IDs
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    for (const rowId of rowIds) {
      // Check if this row is broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      
      // Check if this row is active
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") continue;
      
      // Check mode - only interested in Absorption or Reflection
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode !== "absorption" && mode !== "reflection") continue;
      
      // Check if this row has protection for this damage type
      const protAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${protKey}`);
      if (!protAttr) continue;
      const protValue = protAttr.get("current");
      if (!protValue || protValue === "0" || protValue === "") continue;
      
      // Check subtype matching
      const subtypeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_subtype`);
      const protSubtype = subtypeAttr ? (subtypeAttr.get("current") || "").trim().toLowerCase() : "";
      
      let subtypeMatches = false;
      if (protSubtype === "") {
        subtypeMatches = true;
      } else if (atkSub === "") {
        subtypeMatches = false;
      } else {
        const protSubtypes = protSubtype.split(",").map(s => s.trim().toLowerCase());
        subtypeMatches = protSubtypes.includes(atkSub);
      }
      
      if (!subtypeMatches) continue;
      
      // Found a matching Absorption/Reflection row
      const limitAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_limit`);
      const absorbsToAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_absorbs_to`);
      const absorbsPowerAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_absorbs_power`);
      const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
      
      return {
        mode: mode,
        rowId: rowId,
        name: nameAttr ? nameAttr.get("current") : mode,
        limit: num(limitAttr ? limitAttr.get("current") : "", 0),
        absorbsTo: absorbsToAttr ? (absorbsToAttr.get("current") || "hits").toLowerCase() : "hits",
        absorbsPower: absorbsPowerAttr ? absorbsPowerAttr.get("current") : ""
      };
    }
    
    return null;
  }

  // --- Area Effect Functions ---
  
  // Get all tokens within radius of a center point
  // Returns array of { token, distance, charId, name, controller }
  function getTokensInRadius(pageId, centerX, centerY, radiusInches) {
    const page = getObj("page", pageId);
    if (!page) return [];
    
    const snap = page.get("snapping_increment") || 1;
    const pixelsPerInch = 70 * snap;  // 70 pixels per grid square at snap=1
    const radiusPx = radiusInches * pixelsPerInch;
    
    const tokens = findObjs({ _type: "graphic", _pageid: pageId, _subtype: "token", layer: "objects" }) || [];
    const results = [];
    
    tokens.forEach(tok => {
      const charId = tok.get("represents");
      if (!charId) return;  // Skip tokens not linked to characters
      
      const char = getObj("character", charId);
      if (!char) return;
      
      const tx = tok.get("left");
      const ty = tok.get("top");
      const dx = tx - centerX;
      const dy = ty - centerY;
      const distPx = Math.sqrt(dx * dx + dy * dy);
      const distInches = distPx / pixelsPerInch;
      
      if (distInches <= radiusInches) {
        // Get controller for whisper targeting
        const controlledBy = char.get("controlledby") || "";
        const controller = controlledBy.includes("all") ? "all" : (controlledBy.split(",")[0] || "gm");
        
        results.push({
          token: tok,
          tokenId: tok.id,
          charId: charId,
          name: char.get("name"),
          distance: distInches,
          controller: controller
        });
      }
    });
    
    return results;
  }
  
  // Calculate distance to edge of area effect (for escape TN calculation)
  function calculateDistanceToEdge(distanceFromCenter, radius) {
    const distToEdge = radius - distanceFromCenter;
    return Math.max(1, Math.ceil(distToEdge));  // Minimum 1"
  }
  
  // Sum protection with coverage reduction for area effects
  // coverage: "full" (100%), "heavy" (50%), "light" (25%)
  // Returns { prot, hardened, invuln, adapt } with coverage-adjusted values
  // atkSubtype: the attack's sub-type for matching
  // NOTE: Absorption, Reflection, and Ability Field rows are SKIPPED - not passive protection
  // NOTE: Force Field rows are SKIPPED - handled separately with deflection pool
  // NOTE: Hardened is read from separate prot_hard_* fields (not parsed from protection value)
  function sumProtectionWithCoverage(charId, protKey, isAreaEffect, atkSubtype) {
    if (!protKey) return { prot: 0, hardened: 0, invuln: false, adapt: false };
    
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    let totalProt = 0;
    let totalHardened = 0;
    let hasInvuln = false;
    let hasAdapt = false;
    
    // Map protKey to hardened field name
    const hardKeyMap = {
      "kinetic": "hard_kinetic",
      "energy": "hard_energy",
      "bio": "hard_bio",
      "entropy": "hard_entropy",
      "psychic": "hard_psychic",
      "other": "hard_other"
    };
    const hardKey = hardKeyMap[protKey] || null;
    
    // Normalize attack subtype for matching
    const atkSub = (atkSubtype || "").trim().toLowerCase();
    
    // Get all protection row IDs
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    rowIds.forEach(rowId => {
      // Check if this row is broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") return;  // Skip broken rows
      
      // Check if this row is active (state = Active)
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") return;  // Skip inactive rows
      
      // Check mode - skip Absorption, Reflection, and Force Field (not passive)
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode === "absorption" || mode === "reflection" || mode === "forcefield") return;  // Skip - not passive
      
      // Check if this is an Ability Field - skip (reactive protection, not passive)
      const afieldAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_afield`);
      if (afieldAttr && afieldAttr.get("current") === "1") return;  // Skip - AF is reactive
      
      // Get protection value for this damage type
      const protAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${protKey}`);
      if (!protAttr) return;
      
      const protValue = protAttr.get("current");
      if (!protValue || protValue === "0" || protValue === "") return;
      
      // Check subtype matching
      const subtypeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_subtype`);
      const protSubtype = subtypeAttr ? (subtypeAttr.get("current") || "").trim().toLowerCase() : "";
      
      // Matching rules (same as sumProtectionWithHardened):
      let subtypeMatches = false;
      if (protSubtype === "") {
        subtypeMatches = true;  // Full type protection
      } else if (atkSub === "") {
        subtypeMatches = false;  // Attack has no subtype, protection is specific
      } else {
        const protSubtypes = protSubtype.split(",").map(s => s.trim().toLowerCase());
        subtypeMatches = protSubtypes.includes(atkSub);
      }
      
      if (!subtypeMatches) return;
      
      const parsed = parseProtValue(protValue);
      if (parsed.invuln) hasInvuln = true;
      if (parsed.adapt) hasAdapt = true;
      
      // Get coverage for area effect reduction
      let coverageMult = 1;
      if (isAreaEffect) {
        const coverageAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_coverage`);
        const coverage = coverageAttr ? coverageAttr.get("current") : "full";
        if (coverage === "light") {
          coverageMult = 0.25;
        } else if (coverage === "heavy") {
          coverageMult = 0.5;
        }
      }
      
      // Apply coverage and round up for protection
      const adjustedProt = Math.ceil(parsed.prot * coverageMult);
      totalProt += adjustedProt;
      
      // Read hardened from separate field and apply coverage
      if (hardKey) {
        const hardAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${hardKey}`);
        if (hardAttr) {
          const hardVal = parseInt(hardAttr.get("current"), 10) || 0;
          const adjustedHardened = Math.ceil(hardVal * coverageMult);
          totalHardened += adjustedHardened;
        }
      }
    });
    
    return { prot: totalProt, hardened: totalHardened, invuln: hasInvuln, adapt: hasAdapt };
  }
  
  // Get character's shield data (if they have one)
  // Returns { hasShield, defense, bp, rowId, name } or null
  function getShieldData(charId) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    
    // Get all protection row IDs
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    for (const rowId of rowIds) {
      // Check if this row is a shield
      const shieldAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_shield`);
      if (!shieldAttr || shieldAttr.get("current") !== "1") continue;
      
      // Check if broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      
      // Check if active
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") continue;
      
      // Get shield properties
      const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
      const defAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_shield_def`);
      const bpAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_shield_bp`);
      
      return {
        hasShield: true,
        rowId: rowId,
        name: nameAttr ? nameAttr.get("current") : "Shield",
        defense: num(defAttr ? defAttr.get("current") : "4", 4),
        bp: num(bpAttr ? bpAttr.get("current") : "10", 10)
      };
    }
    
    return null;
  }
  
  // Mark a shield as broken
  function breakShield(charId, rowId) {
    const attrName = `repeating_protection_${rowId}_prot_broken`;
    const existing = findObjs({ _type: "attribute", _characterid: charId, name: attrName })[0];
    if (existing) {
      existing.set("current", "1");
    } else {
      createObj("attribute", { _characterid: charId, name: attrName, current: "1" });
    }
  }
  
  // Get character's active Ability Field data (if they have one)
  // Returns { hasAF, rowId, name, damage, dmgType, pr, causesKB } or null
  // Ability Fields are protection rows with prot_afield checkbox checked
  function getAbilityFieldData(charId) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    
    // Get all protection row IDs
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    for (const rowId of rowIds) {
      // Check if this row is an Ability Field
      const afieldAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_afield`);
      if (!afieldAttr || afieldAttr.get("current") !== "1") continue;
      
      // Check if broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      
      // Check if active
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") continue;
      
      // Get Ability Field properties
      const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
      const damageAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_damage`);
      const dmgTypeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_dmgtype`);
      const prAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_pr`);
      const kbAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_kb`);
      
      const damageDice = damageAttr ? damageAttr.get("current") : "";
      if (!damageDice || damageDice === "0" || damageDice === "") continue;  // No damage = not a real AF
      
      return {
        hasAF: true,
        rowId: rowId,
        name: nameAttr ? nameAttr.get("current") : "Ability Field",
        damage: damageDice,
        dmgType: dmgTypeAttr ? dmgTypeAttr.get("current") : "Energy",
        pr: num(prAttr ? prAttr.get("current") : "1", 1),
        causesKB: kbAttr && kbAttr.get("current") === "1"
      };
    }
    
    return null;
  }
  
  // Get character's active Force Field data (if they have one)
  // Returns { hasFF, rowId, name, isGear, accum, threshold, protValues, pr } or null
  // Force Fields are protection rows with prot_mode = "forcefield"
  function getForceFieldData(charId, tokenId) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    for (const rowId of rowIds) {
      // Check mode
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode !== "forcefield") continue;
      
      // Check if broken
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      
      // Check if active
      const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
      if (stateAttr && stateAttr.get("current") === "Off") continue;
      
      const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
      const gearAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_gear`);
      const accumAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_ff_accum`);
      const prAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_pr`);
      
      const isGear = gearAttr && gearAttr.get("current") === "1";
      const accum = num(accumAttr ? accumAttr.get("current") : "0", 0);
      
      // Read per-type protection values
      const protValues = {};
      CFG.PROT_KEYS.forEach(k => {
        const pa = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${k}`);
        const parsed = parseProtValue(pa ? pa.get("current") : "0");
        protValues[k] = parsed.prot;
      });
      
      // Calculate threshold
      let threshold;
      if (isGear) {
        let totalProt = 0;
        CFG.PROT_KEYS.forEach(k => { totalProt += protValues[k]; });
        threshold = Math.floor(totalProt * 1.5);
      } else {
        // Use current Power (vehicle or character)
        const tok = tokenId ? getObj("graphic", tokenId) : null;
        if (isVehicleMode(charId)) {
          threshold = getVehiclePower(tok, charId);
        } else {
          threshold = tok ? getResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR) :
            num(getAttr(charId, CFG.POWER_ATTR), 0);
        }
      }
      
      // Read hardened values
      const hardValues = {};
      const hardKeyMap = { kinetic: "hard_kinetic", energy: "hard_energy", bio: "hard_bio",
        entropy: "hard_entropy", psychic: "hard_psychic", other: "hard_other" };
      CFG.PROT_KEYS.forEach(k => {
        const hk = hardKeyMap[k];
        if (!hk) { hardValues[k] = 0; return; }
        const ha = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${hk}`);
        hardValues[k] = num(ha ? ha.get("current") : "0", 0);
      });
      
      // Read subtype
      const subtypeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_subtype`);
      
      return {
        hasFF: true,
        rowId: rowId,
        name: nameAttr ? nameAttr.get("current") : "Force Field",
        isGear: isGear,
        accum: accum,
        threshold: threshold,
        remaining: Math.max(0, threshold - accum),
        protValues: protValues,
        hardValues: hardValues,
        subtype: subtypeAttr ? (subtypeAttr.get("current") || "").trim().toLowerCase() : "",
        pr: num(prAttr ? prAttr.get("current") : "16", 16)
      };
    }
    
    return null;
  }
  
  // Update Force Field accumulated deflection on the sheet
  function setFFAccum(charId, rowId, newAccum) {
    const attr = findObjs({ _type: "attribute", _characterid: charId,
      name: `repeating_protection_${rowId}_prot_ff_accum` })[0];
    if (attr) {
      attr.set("current", String(newAccum));
    } else {
      createObj("attribute", { characterid: charId,
        name: `repeating_protection_${rowId}_prot_ff_accum`, current: String(newAccum) });
    }
  }
  
  // Update Force Field aura on token (aura2)
  // percent: 0-1 remaining capacity ratio. null/undefined = turn off.
  function updateFFAura(tok, percent) {
    if (!tok) return;
    if (percent === null || percent === undefined || percent < 0) {
      // FF down - clear aura
      tok.set({ aura2_radius: "", showplayers_aura2: false });
      return;
    }
    // Color shifts: blue (>50%) → yellow (25-50%) → red (<25%)
    let color;
    if (percent > 0.5) color = "#3498db";       // blue - healthy
    else if (percent > 0.25) color = "#f1c40f";  // yellow - warning
    else color = "#e74c3c";                       // red - critical
    // Radius 0 = tight to token edge; use small value for snug fit
    tok.set({
      aura2_radius: 1,
      aura2_color: color,
      aura2_square: false,
      showplayers_aura2: true
    });
  }
  
  // Deactivate a Force Field (set state to Off) and clear aura
  function deactivateFF(charId, rowId, tok) {
    const attr = findObjs({ _type: "attribute", _characterid: charId,
      name: `repeating_protection_${rowId}_prot_state` })[0];
    if (attr) attr.set("current", "Off");
    const onAttr = findObjs({ _type: "attribute", _characterid: charId,
      name: `repeating_protection_${rowId}_prot_state_on` })[0];
    if (onAttr) onAttr.set("current", "0");
    updateFFAura(tok, null);
  }

  // Cleanup old pending area effects (older than 5 minutes)
  function cleanupPendingArea() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000;  // 5 minutes
    Object.keys(state.MP_Engine.pendingArea).forEach(k => {
      if (now - state.MP_Engine.pendingArea[k].timestamp > maxAge) {
        delete state.MP_Engine.pendingArea[k];
      }
    });
  }


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

// SFX helper - plays a Jukebox track by name
function playSFX(name) {
  const track = findObjs({ type: "jukeboxtrack", title: name })[0];
  if (!track) return;
  track.set({ playing: false, softstop: false });
  setTimeout(() => {
    track.set({ playing: true, softstop: false, loop: false });
  }, 50);
}

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
    [10239, -11]
  ];

  function getRangePenalty(inches) {
    for (let i = 0; i < RANGE_TABLE.length; i++) {
      if (inches <= RANGE_TABLE[i][0]) {
        return RANGE_TABLE[i][1];
      }
    }
    // Beyond 10239": starts at -12, each x2 adds -1 more
    // 10240-20479 = -12, 20480-40959 = -13, etc.
    let penalty = -12;
    let threshold = 20480;
    while (inches >= threshold) {
      penalty--;
      threshold *= 2;
    }
    return penalty;
  }

  function calculateRange(atkTok, defTok) {
    if (!atkTok || !defTok) return { inches: 0, penalty: 0 };

    const pageId = atkTok.get("_pageid");
    const page = getObj("page", pageId);

    // Roll20 base grid is 70px, scaled by snapping_increment
    const snapping = page ? (parseFloat(page.get("snapping_increment")) || 1) : 1;
    const gridPx = 70 * snapping;

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
    
    // MP minimum range is 1" (adjacent tokens are at 1" range, not 0")
    const finalInches = Math.max(1, distInches);

    return {
      inches: Math.round(finalInches * 10) / 10,
      penalty: getRangePenalty(finalInches)
    };
  }


  function calculateRangeWithProfile(atkTok, defTok, atkCharId, defCharId) {
    const baseRange = calculateRange(atkTok, defTok);
    
    // Early return for invalid tokens (calculateRange returns 0 for missing tokens)
    if (baseRange.inches === 0) return baseRange;
    
    // Get both profiles (default 1) - per rulebook 4.7.3.1:
    // "Multiply the actual range by the attacker's profile, then divide it by the target's profile"
    const atkProfile = getAttrNum(atkCharId, "profile", 1) || 1;
    const defProfile = getAttrNum(defCharId, "profile", 1) || 1;
    
    // Adjusted range = actual range × attacker profile / target profile
    // Small attacker profile: multiplying by fraction decreases range (easier to hide/aim)
    // Large attacker profile: multiplying by larger number increases range (harder to aim)
    // Small target profile: dividing by fraction increases range (harder to hit)
    // Large target profile: dividing by larger number decreases range (easier to hit)
    // Example from rulebook: Gauntlet (profile 1) at Cybernaut (profile 3.2) at 24" = 24×1/3.2 = 7.5"
    const adjustedInches = baseRange.inches * atkProfile / defProfile;
    
    // Check if either profile differs from 1
    const profileAdjusted = (atkProfile !== 1 || defProfile !== 1);
    
    return {
      inches: Math.round(baseRange.inches * 10) / 10,
      adjustedInches: Math.round(adjustedInches * 10) / 10,
      penalty: getRangePenalty(adjustedInches),
      atkProfile,
      defProfile,
      profileAdjusted
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
    // Only process if mpapi is explicitly "1" (checked checkbox)
    const mpapi = String(fields.mpapi || "").trim();
    if (mpapi !== "1") return;

    cleanupPending();

    const atkCharId = fields.atk;
    const defTokenId = fields.def;
    const rowId = fields.row;
    // Use playerid from roll template (set by cmdQuickAttack/cmdAutofire) or fall back to msg sender
    // If msg.playerid resolves to GM/API but character has a player controller, use that instead
    let originalPlayerId = fields.playerid || msg.playerid;
    if (playerIsGM(originalPlayerId)) {
      const controllerPid = getControllingPlayerId(atkCharId);
      if (controllerPid) originalPlayerId = controllerPid;
    }
    const pushAmount = num(fields.push, 0);  // 0=no push, 2=normal, 4+=special ability
    const isPushing = pushAmount > 0;

    const atkChar = getObj("character", atkCharId);
    const defTok = getObj("graphic", defTokenId);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defTok || !defChar) {
      ch("MP", `${wt(msg)}<b>MP:</b> Could not resolve attacker/defender. Select a target token.`);
      return;
    }

    const rollIR = inlineTotal(msg, fields.roll);
    const confIR = inlineTotal(msg, fields.confirm);
    const dmgIR = inlineTotal(msg, fields.damage);
    const targetIR = inlineTotal(msg, fields.target);

    if (!rollIR) {
      ch("MP", `${wt(msg)}<b>MP:</b> Could not parse roll.`);
      return;
    }

    const nat = inlineNatD20(rollIR);
    const roll = num(rollIR.total, 0);
    const confirm = confIR ? num(confIR.total, 0) : 10;
    const damageTotal = dmgIR ? num(dmgIR.total, 0) : 0;
    const damageBreakdown = inlineRollBreakdown(msg, fields.damage) || String(damageTotal);
    const templateTarget = targetIR ? num(targetIR.total, 0) : null;
    
    // Called shot parsing - handles both type names and numeric penalties
    const calledShotRaw = (fields.calledtype || "None").trim();
    const calledShotInput = calledShotRaw.split(" (")[0].trim();
    
    // Map for type name lookup (case-insensitive)
    const calledShotMap = {
      "none": "None", "head": "Head", "arm": "Arm", "leg": "Leg",
      "avoid light armor": "Avoid Light Armor", "light": "Avoid Light Armor",
      "avoid heavy armor": "Avoid Heavy Armor", "heavy": "Avoid Heavy Armor",
      "gear": "Gear"
    };
    
    // Reverse map: penalty number -> type (for when sheet sends numeric value)
    // Note: -3 is ambiguous (Arm/Leg/Light/Gear), default to generic "Called"
    const penaltyToType = { "0": "None", "-6": "Head", "-3": "Called" };
    
    // Try name lookup first, then penalty reverse-lookup, then use raw input
    let calledShotType = calledShotMap[calledShotInput.toLowerCase()];
    if (!calledShotType) {
      calledShotType = penaltyToType[calledShotInput] || (calledShotInput === "0" ? "None" : calledShotInput);
    }
    
    // Get penalty: if input was numeric, use it directly; otherwise lookup by type
    const calledShotPenalties = { "None": 0, "Head": -6, "Arm": -3, "Leg": -3, "Avoid Light Armor": -3, "Avoid Heavy Armor": -6, "Gear": -3, "Called": -3 };
    let calledShotPenalty = calledShotPenalties[calledShotType];
    if (calledShotPenalty === undefined) {
      // Input might be raw number like "-6" or "-3"
      const numVal = parseInt(calledShotInput, 10);
      calledShotPenalty = isNaN(numVal) ? 0 : numVal;
    }
    const isCalledShot = calledShotType !== "None" && calledShotType !== "";
    const isHeadShot = calledShotType === "Head";
    const isLegShot = calledShotType === "Leg";
    const isArmShot = calledShotType === "Arm";
    const isAvoidArmor = calledShotType === "Avoid Light Armor" || calledShotType === "Avoid Heavy Armor";
    const isGearShot = calledShotType === "Gear";

    const getAtk = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    const rawAtkType = getAtk("attack_atk");
    const weaponName = getAtk("attack_name") || fields.name || "Attack";
    const atkName = atkChar.get("name") + " - " + weaponName;
    const defIsVehName = isVehicleMode(defChar.id);
    const defName = defIsVehName
      ? ("Vehicle: " + (getAttr(defChar.id, "vehicle_name") || defChar.get("name")))
      : defChar.get("name");

    const atkTypeCode = rawAtkType || "P";
    
    // --- FIX: DEFINE LABELS EARLY FOR USE IN BREAKDOWN ---
    const atkTypeLabel = atkTypeCode === "M" ? "Mental" : (atkTypeCode === "E" ? "Emot" : "Phys");
    const defTypeLabel = (atkTypeCode === "M" || atkTypeCode === "E") ? "MDef" : "PDef";
    // -----------------------------------------------------

    const atkType = getAtk("attack_type") || "std";
    const atkMod = num(getAtk("attack_mod"), 0);
    
    const hitmodIR = inlineTotal(msg, fields.hitmod);
    const macroMod = hitmodIR ? hitmodIR.total : num(fields.hitmod, 0);
    
    const abilityTohitGlobal = getAttrNum(atkCharId, "ability_tohit_bonus", 0);
    const atkRowNum = num(getAtk("attack_num"), 1);
    let abilityTohitTargeted = 0;
    try {
      const targetedJson = getAttr(atkCharId, "ability_tohit_targeted") || "{}";
      const targetedObj = JSON.parse(targetedJson);
      abilityTohitTargeted = num(targetedObj[atkRowNum], 0);
    } catch (e) { }
    const abilityTohitBonus = abilityTohitGlobal + abilityTohitTargeted;
    const dmgTypeStr = resolveDmgType(getAtk("attack_dmgtype") || "Kin", fields.type);
    const dmgSubtype = (getAtk("attack_subtype") || fields.subtype || "").trim().toLowerCase();
    
    const isSaveAttack = (getAtk("attack_is_save") === "1") || (atkType === "sav");
    const saveBC = getAtk("attack_save_bc") || "";
    const saveMod = num(getAtk("attack_save_mod"), 0);
    const recMod = num(getAtk("attack_save_rec") || getAtk("attack_recovery"), 0);
    let recTime = getAtk("attack_save_rec_time") || "1 round";
    const noDamage = (getAtk("attack_no_damage") === "1");
    
    const atkDamageExpr = getAtk("attack_damage") || "";
    const saveDamage = isSaveAttack ? rollExpr(atkDamageExpr) : 0;
    
    const atkNotes = getAtk("attack_notes") || "";
    const noDamageType = isSaveAttack && notesIndicateNoDamageType(atkNotes, atkName);
    const protKey = noDamageType ? null : typeToProtKey(dmgTypeStr);
    const range = getAtk("attack_range") || fields.range || "-";
    const kbChecked = getAtk("attack_kb");
    const causesKB = (kbChecked === "1") || (fields.kb && fields.kb.toLowerCase() === "yes");

    // Duration modifier (MP Modifiers, "Duration"): a durational attack repeats its
    // effect on each subsequent Phase 0 until it expires. 1 Round = Instant (no badge).
    // Round-unit durations auto-tick each round; longer units are badged but GM-managed.
    const durNum = num(getAtk("attack_duration_num"), 0);
    const durUnit = (getAtk("attack_duration_unit") || "").trim().toLowerCase();
    const durActiveFlag = (getAtk("attack_duration_active") === "1");
    const durEscape = (getAtk("attack_duration_escape") || "").trim();
    const durUnitRounds = /round/.test(durUnit);
    const durRounds = durUnitRounds ? durNum : 0;
    const hasDuration = durActiveFlag || durRounds >= 2 || (!durUnitRounds && durUnit !== "" && durNum >= 1);

    // MP Modifiers, "Duration" on a save attack: the duration sets the interval between
    // recovery saves (the first save is still made immediately, in cmdSave). Override the
    // default recovery time so the condition recurs on the durational schedule, not 1/round.
    if (isSaveAttack && hasDuration && durNum > 0) {
      recTime = `${durNum} ${durUnit || "round"}${durNum === 1 ? "" : "s"}`;
    }

    const atkAPRaw = getAtk("attack_ap") || fields.ap || "";
    const atkAP = (atkAPRaw === "ALL" || atkAPRaw === "all") ? Infinity : num(atkAPRaw, 0);
    
    const snBP = String(getAtk("attack_bp") || "").trim();
    const snMaxBP = num(getAtk("attack_max_bp"), 0);
    const snType = getAtk("attack_snare_type") || "";
    const isSnareAttack = (getAtk("attack_is_snare") === "1") || (atkType === "snr");
    
    const areaRaw = getAtk("attack_area") || fields.area || "";
    const areaDiameter = num(areaRaw, 0);
    const isAreaAttack = areaDiameter > 0;
    const areaRadius = areaDiameter / 2;
    
    const skipCosts = (fields.nopr === "1");
    const atkPR = skipCosts ? 0 : num(getAtk("attack_cost") || fields.cost || "", 0);
    const atkChgRaw = getAtk("attack_charges");
    const hasCharges = !skipCosts && (atkChgRaw !== undefined && atkChgRaw !== null && String(atkChgRaw).trim() !== "");
    const atkChgNum = hasCharges ? num(atkChgRaw, 0) : 0;
    const isUnlimitedCharges = (atkChgNum === -1);
    const atkChgCost = (hasCharges && !isUnlimitedCharges) ? 1 : 0;

    let atkSaveAttr;
    if (atkTypeCode === "M") atkSaveAttr = "intelligence_save";
    else if (atkTypeCode === "E") atkSaveAttr = "cool_save";
    else atkSaveAttr = "agility_save";

    const atkSave = getAttrNum(atkCharId, atkSaveAttr, 10);
    
    const defPageId = defTok.get("_pageid");
    const atkTokCandidates = findObjs({ _type: "graphic", represents: atkCharId, _pageid: defPageId });
    if (atkTokCandidates.length > 1) {
      ch("MP", `${wt(msg)}<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px;">⚠️ <b>${esc(atkChar.get("name"))}</b> has ${atkTokCandidates.length} tokens on this map! Delete duplicates before attacking.</div>`);
      return;
    }
    const atkTok = atkTokCandidates[0];
    const atkDefMod = atkTok ? num(atkTok.get(CFG.DEF_MOD_BAR), 0) : 0;
    
    if (atkDefMod === 6) {
      ch("MP", `${wt(msg)}<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px;"><b>${esc(atkChar.get("name"))}</b> is in <b>Full Defense</b> and cannot attack!</div>`);
      return;
    }
    
    const atkStancePenalty = (atkDefMod === 3) ? -3 : 0;
    
    let atkRestraintPenalty = 0;
    let atkRestraintLabel = "";
    if (atkTok) {
      const atkTokId = atkTok.id;
      const grappleRecord = state.MP_Engine.snares[atkTokId];
      if (grappleRecord && grappleRecord.type === "Grapple") {
        if (grappleRecord.locked) {
          atkRestraintPenalty = -9;
          atkRestraintLabel = " (fully restrained)";
        } else {
          atkRestraintPenalty = -3;
          atkRestraintLabel = " (grappled)";
        }
      }
      else if (atkTok.get("status_fist")) {
        atkRestraintPenalty = -3;
        atkRestraintLabel = " (grappling)";
      }
    }
    
    const rangeData = calculateRangeWithProfile(atkTok, defTok, atkCharId, defChar.id);
    const rangePenalty = rangeData.penalty;
    
    const baseToHit = atkSave + 3 + atkMod + abilityTohitBonus + macroMod + atkStancePenalty + rangePenalty + atkRestraintPenalty;

    const defAttr = (atkTypeCode === "M" || atkTypeCode === "E") ? "mental_def" : "physical_def";
    const defBase = getAttrNum(defChar.id, defAttr, 0);
    const defMod = num(defTok.get(CFG.DEF_MOD_BAR), 0);
    const defValue = defBase + defMod;

    let targetTotal;
    if (isAreaAttack) {
      targetTotal = baseToHit + 6;
    } else {
      // Note: calledShotPenalty is already included in macroMod (from sheet's hitmod field)
      // Do NOT add it again here - it's extracted separately only for hover display
      targetTotal = baseToHit - defValue;
    }

    if (atkChgCost > 0 && num(atkChgRaw, 0) <= 0) {
      ch("MP", `<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px;">⚠️ <b>${esc(atkName)}</b>: No charges remaining!</div>`);
      return;
    }

    let prDeducted = 0;
    let totalPowerCost = 0;
    let undoAtkIsVeh = false;
    let undoAtkPowerBefore = null;
    if (atkTok) {
      const atkIsVeh = isVehicleMode(atkCharId);
      const atkPow0 = atkIsVeh ? getVehiclePower(atkTok, atkCharId) : getResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
      undoAtkIsVeh = atkIsVeh;
      undoAtkPowerBefore = atkPow0;
      if (isPushing) totalPowerCost += pushAmount;
      if (atkPR > 0) {
        prDeducted = Math.min(atkPR, Math.max(0, atkPow0 - (isPushing ? pushAmount : 0)));
        totalPowerCost += atkPR;
      }
      if (totalPowerCost > 0) {
        if (atkIsVeh) {
          setVehiclePower(atkTok, atkCharId, Math.max(0, atkPow0 - totalPowerCost));
        } else {
          setResource(atkTok, atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, Math.max(0, atkPow0 - totalPowerCost));
        }
      }
    }

    let chgDeducted = 0;
    let chgRemaining = -1; // -1 = no charges tracked
    if (atkChgCost > 0 && atkCharId && rowId) {
      const chg0 = num(atkChgRaw, 0);
      chgDeducted = 1;
      const chg1 = chg0 - 1;
      chgRemaining = chg1;
      setRepeatingAttackAttr(atkCharId, rowId, "attack_charges", chg1);
      if (chg1 === 0) {
        sendChat("MP", `/w gm ⚠️ ${esc(atkName)}: Last charge used!`);
      }
    }

    const isGrappleAttack = (getAtk("attack_is_grapple") === "1");
    if (isGrappleAttack) {
      if (!atkTok) {
        ch("MP", `${wt(msg)}<b>MP:</b> Could not find an attacker token on this page.`);
        return;
      }
      const remote = (getAtk("attack_grapple_remote") === "1");
      const gripType = (getAtk("attack_grip_type") || "hth");
      const gripDice = String(getAtk("attack_grip_dice") || "").trim();

      cmdGrapple(msg, {
        atk: atkTok.id,
        def: defTok.id,
        remote: remote ? "1" : "0",
        griptype: gripType,
        gripdice: gripDice,
        tohit: targetTotal,
        roll: roll
      });
      return;
    }

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

    const uniqueRollId = String(Date.now()) + "_" + randomInteger(999999);
    state.MP_Engine.pending[uniqueRollId] = {
      rollId: uniqueRollId, playerid: originalPlayerId, atkCharId, atkName, defTokenId, 
      defCharId: defChar.id, defName, rowId, nat, roll, confirm, targetTotal,
      outcome, isCrit, isFumble, critResult, fumbleResult,
      damageTotal, dmgTypeStr, dmgSubtype, protKey, atkType,
      atkAP, isSaveAttack, saveBC, saveMod, recMod, recTime, noDamage, saveDamage,
      snBP, snMaxBP, snType, causesKB,
      isPushing, pushAmount, rangeData, created: Date.now(),
      noDamageType,
      isAreaAttack, areaRadius, areaDiameter,
      calledShotType, isHeadShot, isLegShot, isArmShot, isAvoidArmor, isGearShot,
      hasDuration, durNum, durUnit, durRounds, durEscape, durDamageExpr: atkDamageExpr
    };

// --- HTML CONSTRUCTION & OUTPUT ---

    // Play hit/miss SFX
    if (outcome === "HIT" || outcome === "CRIT") playSFX("SFX-Hit");
    else playSFX("SFX-Miss");
    
    // Extract individual modifier components
    const aimVal = (inlineTotal(msg, fields.aim) ? inlineTotal(msg, fields.aim).total : num(fields.aim, 0)) || 0;
    const multiVal = (inlineTotal(msg, fields.multi) ? inlineTotal(msg, fields.multi).total : num(fields.multi, 0)) || 0;
    const otherVal = (inlineTotal(msg, fields.other) ? inlineTotal(msg, fields.other).total : num(fields.other, 0)) || 0;

    // Format Range Display for Footer
    let rangeFooter = "0";

    // Roll border: green on hit/crit, red on miss/fumble
    const rollBorderColor = (outcome === "HIT" || outcome === "CRIT") ? "#27ae60" : "#c0392b";
    const rollTextColor = (outcome === "HIT" || outcome === "CRIT") ? "#7bed9f" : "#ff6b6b";
    if (rangeData && typeof rangeData.inches === "number") {
        const baseR = rangeData.inches;
        const adjR = rangeData.profileAdjusted ? rangeData.adjustedInches : baseR;
        if (rangeData.profileAdjusted && baseR !== adjR) {
            const cleanAdj = adjR.toFixed(1).replace(/\.0$/, '');
            rangeFooter = `${baseR}" (${cleanAdj}")`;
        } else {
            rangeFooter = `${baseR}"`;
        }
    }

    // --- TOOLTIP BREAKDOWN GENERATION ---
    const bcLabel = atkTypeCode === "M" ? "IN" : (atkTypeCode === "E" ? "CL" : "AG");
    const baseChance = atkSave + 3;
    let hoverBreakdown = `${bcLabel} ${atkSave} + 3 = ${baseChance}-`;
    if (atkMod !== 0) hoverBreakdown += `&#10;Atk Mod: ${atkMod >= 0 ? '+' : ''}${atkMod}`;
    
    if (abilityTohitBonus !== 0) {
      if (abilityTohitTargeted > 0 && abilityTohitGlobal > 0) {
        hoverBreakdown += `&#10;Ht.Exp: +${abilityTohitBonus} (+${abilityTohitGlobal} all, +${abilityTohitTargeted} this)`;
      } else if (abilityTohitTargeted > 0) {
        hoverBreakdown += `&#10;Ht.Exp: +${abilityTohitTargeted} (this atk)`;
      } else {
        hoverBreakdown += `&#10;Ht.Exp: +${abilityTohitGlobal}`;
      }
    }
    
    if (aimVal !== 0) hoverBreakdown += `&#10;Aim: ${aimVal > 0 ? '+' : ''}${aimVal}`;
    if (multiVal !== 0) hoverBreakdown += `&#10;Multi-Action: ${multiVal}`;
    if (otherVal !== 0) hoverBreakdown += `&#10;Other: ${otherVal > 0 ? '+' : ''}${otherVal}`;
    
    const subtotal = baseChance + atkMod + abilityTohitBonus + aimVal + multiVal + otherVal;
    hoverBreakdown += `&#10;─────────`;
    hoverBreakdown += `&#10;Subtotal: ${subtotal}-`;
    
    if (defValue !== 0) hoverBreakdown += `&#10;${defTypeLabel}: -${defValue}`;
    if (atkStancePenalty !== 0) hoverBreakdown += `&#10;Stance: ${atkStancePenalty}`;
    if (atkRestraintPenalty !== 0) hoverBreakdown += `&#10;Restraint: ${atkRestraintPenalty}${atkRestraintLabel}`;
    
    // Range penalty tooltip
    if (rangeData && typeof rangeData.inches === "number") {
      const adjR = rangeData.profileAdjusted ? rangeData.adjustedInches : rangeData.inches;
      let profNote = "";
      if (rangeData.profileAdjusted) {
        const atkP = rangeData.atkProfile !== undefined ? rangeData.atkProfile : 1;
        const defP = rangeData.defProfile !== undefined ? rangeData.defProfile : 1;
        if (atkP !== 1 && defP !== 1) profNote = ` (AtkProf:${atkP}, TgtProf:${defP})`;
        else if (atkP !== 1) profNote = ` (AtkProf:${atkP})`;
        else if (defP !== 1) profNote = ` (TgtProf:${defP})`;
      }
      const cleanAdjHover = adjR.toFixed(1).replace(/\.0$/, '');
      hoverBreakdown += `&#10;Range: ${rangePenalty} (${cleanAdjHover}&quot;${profNote})`;
    }
    
    // Called Shot Penalty
    if (calledShotPenalty !== 0) {
        if (calledShotType === "Called") {
            hoverBreakdown += `&#10;Called: ${calledShotPenalty}`;
        } else {
            hoverBreakdown += `&#10;Called (${calledShotType}): ${calledShotPenalty}`;
        }
    }

    hoverBreakdown += `&#10;─────────`;
    hoverBreakdown += `&#10;Final: ${targetTotal}-`;

    // --- GENERATE HTML (Dark Theme Card) ---
    const outcomeLabels = {
      HIT:    { text: "HIT",    bg: "#27ae60", color: "#fff" },
      CRIT:   { text: "CRITICAL HIT", bg: "#f1c40f", color: "#000" },
      MISS:   { text: "MISS",   bg: "#555",    color: "#ccc" },
      FUMBLE: { text: "FUMBLE", bg: "#c0392b", color: "#fff" }
    };
    const outcomeStyle = outcomeLabels[outcome] || outcomeLabels.MISS;

    // Color helper for modifier values (matches sheet: red negative, green positive)
    const modColor = (v) => v < 0 ? "#ff6b6b" : (v > 0 ? "#5dde5d" : "#ddd");

    // --- Card container ---
    let html = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; max-width:280px; color:#eee; overflow:hidden;">`;

    // --- Header: "Attacker attacks Target with Weapon" ---
    html += `<div style="background:#c0392b; padding:7px 10px; font-size:14px; color:#fdd;">`;
    html += `<b style="color:#fff;">${esc(atkChar.get("name"))}</b> attacks <b style="color:#fff;">${esc(defName)}</b> with <b style="color:#fff;">${esc(weaponName)}</b>`;
    html += `</div>`;

    // --- Outcome Banner ---
    html += `<div style="background:${outcomeStyle.bg}; color:${outcomeStyle.color}; text-align:center; padding:3px; font-weight:bold; font-size:14px; letter-spacing:2px;">`;
    html += outcomeStyle.text;
    html += `</div>`;

    // --- Core Numbers: 4-column grid ---
    html += `<table style="width:100%; border-collapse:collapse; background:#16213e; border-top:1px solid #333; border-bottom:1px solid #333;"><tr>`;

    // Roll
    html += `<td style="width:25%; text-align:center; padding:8px 4px 6px; border-right:1px solid #2a2a4a;">`;
    html += `<div title="Natural: ${nat}" style="display:inline-block; font-size:28px; font-weight:bold; color:${rollTextColor}; border:2px solid ${rollBorderColor}; padding:0 4px; border-radius:3px; line-height:1.1;">${roll}</div>`;
    html += `<div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#889; margin-top:3px;">Roll</div>`;
    html += `</td>`;

    // Confirm
    html += `<td style="width:25%; text-align:center; padding:8px 4px 6px; border-right:1px solid #2a2a4a;">`;
    html += `<div title="Confirms Crits (nat 1) and Fumbles (nat 20).&#10;Must also hit/miss to confirm." style="font-size:28px; font-weight:bold; color:#ccc; line-height:1.1; padding:2px 0;">${confirm}</div>`;
    html += `<div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#889; margin-top:3px;">Confirm</div>`;
    html += `</td>`;

    // To-Hit
    html += `<td style="width:25%; text-align:center; padding:8px 4px 6px; border-right:1px solid #2a2a4a;">`;
    html += `<div title="${hoverBreakdown}" style="font-size:28px; font-weight:bold; color:#f0c040; line-height:1.1; padding:2px 0;">${targetTotal}-</div>`;
    html += `<div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#889; margin-top:3px;">To-Hit</div>`;
    html += `</td>`;

    // Damage
    html += `<td style="width:25%; text-align:center; padding:8px 4px 6px;">`;
    html += `<div title="${esc(damageBreakdown)}" style="font-size:28px; font-weight:bold; color:#ff6b6b; line-height:1.1; padding:2px 0;">${damageTotal}</div>`;
    html += `<div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#ff6b6b; margin-top:3px;">Damage</div>`;
    html += `</td>`;

    html += `</tr></table>`;

    // --- Attack Properties + Cost Row ---
    const prStr = atkPR > 0 ? ` PR:<span style="color:#ddd; font-weight:bold;">${atkPR}</span>` : "";
    let costStr = "";
    if (prDeducted > 0 || chgDeducted > 0) {
      let costParts = [];
      if (prDeducted > 0) costParts.push(`PR:-${prDeducted}`);
      if (chgDeducted > 0) {
        const chgHover = chgRemaining >= 0 ? ` title="${chgRemaining} charges remaining"` : "";
        costParts.push(`<span${chgHover}>Chg:-${chgDeducted}c</span>`);
      }
      costStr = ` · <span style="color:#f0c040;">${costParts.join(", ")}</span>`;
    }

    html += `<div style="padding:5px 10px; font-size:12px; color:#aab; background:#16213e; border-bottom:1px solid #2a2a4a; text-align:center;">`;
    const dmgTypeHover = dmgSubtype ? ` title="Subtype: ${esc(dmgSubtype)}"` : "";
    html += `Type: <span style="color:#ddd; font-weight:bold;"${dmgTypeHover}>${esc(dmgTypeStr)}</span>`;
    html += ` · KB: <span style="color:#ddd; font-weight:bold;">${causesKB ? "Yes" : "No"}</span>`;
    html += ` · Rng: <span style="color:#ddd; font-weight:bold;">${rangeFooter}</span>`;
    html += costStr;
    html += `</div>`;

    // --- Modifiers Section ---
    html += `<div style="padding:5px 10px; font-size:11px; color:#889; background:#1a1a2e;">`;
    html += `<div style="font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#997; margin-bottom:3px;">Modifiers</div>`;
    html += `<span style="color:#aaa;">${defTypeLabel}: <b style="color:#ddd;">${defValue}</b></span> `;
    html += `<span style="color:#aaa; cursor:help;" title="Change stance: !mp stance [def | full | offbal | normal]&#10;A = attacker's to-hit penalty, D = defender's bonus to defense">Stance: A:<b style="color:${modColor(atkStancePenalty)};">${atkStancePenalty}</b> D:<b style="color:${modColor(defMod)};">${defMod > 0 ? '+' : ''}${defMod}</b></span> `;
    html += `<span style="color:#aaa;">Rng: <b style="color:${modColor(rangePenalty)};">${rangePenalty}</b></span> `;
    html += `<span style="color:#aaa;">Aim: <b style="color:${modColor(aimVal)};">${aimVal}</b></span> `;
    html += `<span style="color:#aaa;">Multi: <b style="color:${modColor(multiVal)};">${multiVal}</b></span> `;
    html += `<span style="color:#aaa;">Other: <b style="color:${modColor(otherVal)};">${otherVal}</b></span> `;
    html += `<span style="color:#aaa;">Called: <b style="color:${modColor(calledShotPenalty)};">${calledShotPenalty}</b></span> `;
    html += `<span style="color:#aaa;">Push: <b style="color:${modColor(pushAmount)};">${pushAmount}</b></span>`;
    html += `</div>`;

    // --- Crit / Fumble / Called Shot Results ---
    if (isCrit && critResult) {
      html += `<div style="border-top:1px solid #333; padding:4px 10px; font-size:11px; font-weight:bold; color:#f1c40f;">CRIT: ${esc(critResult.desc)}</div>`;
      if (critResult.type === CRIT_TYPES.HEAD_SHOT) {
        const hasProtectedBrain = (num(getAttr(defChar.id, "willpower_protected_brain"), 0) === 1);
        if (hasProtectedBrain) html += `<div style="color:#8be9fd; font-size:11px; font-weight:bold; padding:0 10px;">PROTECTED BRAIN - Head Shot negated!</div>`;
      }
      if (critResult.type === CRIT_TYPES.OFF_BALANCE) html += applyOffBalance(defTok, defName);
      if (critResult.type === CRIT_TYPES.MUSCLE_STRAIN_TARGET) {
        const msDefIsVeh = isVehicleMode(defChar.id);
        const hits0 = msDefIsVeh ? getVehicleHits(defTok, defChar.id) : getResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR);
        if (msDefIsVeh) {
          setVehicleHits(defTok, defChar.id, Math.max(0, hits0 - 1));
        } else {
          setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, Math.max(0, hits0 - 1));
        }
        html += `<div style="color:#ff6b6b; font-size:11px; padding:0 10px;"><b>${esc(defName)}</b> takes 1 Hit (muscle strain)! Hits: ${hits0}→${hits0-1}</div>`;
      }
    }

    if (isFumble && fumbleResult) {
      html += `<div style="border-top:1px solid #333; padding:4px 10px; font-size:11px; font-weight:bold; color:#c0392b;">FUMBLE: ${esc(fumbleResult.desc)}</div>`;
      if (fumbleResult.type === FUMBLE_TYPES.OFF_BALANCE_ATK && atkTok) html += applyOffBalance(atkTok, atkChar.get("name"));
      if ([FUMBLE_TYPES.MUSCLE_STRAIN_ATK, FUMBLE_TYPES.LEG_STRAIN, FUMBLE_TYPES.ARM_STRAIN].includes(fumbleResult.type) && atkTok) {
        const atkHits0 = getResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
        setResource(atkTok, atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR, Math.max(0, atkHits0 - 1));
        html += `<div style="color:#ff6b6b; font-size:11px; padding:0 10px;"><b>${esc(atkChar.get("name"))}</b> takes 1 Hit (strain)! Hits: ${atkHits0}→${atkHits0-1}</div>`;
      }
    }

    if (isCalledShot) {
      if (outcome === "HIT" || outcome === "CRIT") {
        const labels = {
          "Head": "HEAD SHOT (-6) - Hits DOUBLED!", "Leg": "LEG SHOT (-3) - Saves required",
          "Arm": "ARM SHOT (-3) - Saves required", "Avoid Light Armor": "AVOID LIGHT ARMOR (-3)",
          "Avoid Heavy Armor": "AVOID HEAVY ARMOR (-6)", "Gear": "GEAR SHOT (-3)",
          "Called": "CALLED SHOT (-3)"
        };
        html += `<div style="border-top:1px solid #333; padding:4px 10px; font-size:11px; font-weight:bold; color:#e67e22;">${labels[calledShotType] || `CALLED SHOT: ${calledShotType}`}</div>`;
        if (isHeadShot) {
          const hasProtectedBrain = (num(getAttr(defChar.id, "willpower_protected_brain"), 0) === 1);
          if (hasProtectedBrain) html += `<div style="color:#8be9fd; font-size:11px; font-weight:bold; padding:0 10px;">PROTECTED BRAIN - Head Shot negated!</div>`;
        }
      } else {
        html += `<div style="border-top:1px solid #333; padding:4px 10px; font-size:11px; color:#889;">Called shot attempted (${calledShotType})</div>`;
      }
    }

    // --- Close card ---
    html += `</div>`;

    // --- Area attacks: send normal card then delegate to area handler ---
    if (isAreaAttack) {
      if (CFG.GM_ONLY_BUTTONS) {
        chToChar("MP", html, atkCharId);
      } else {
        ch("MP", html);
      }
      handleAreaAttack(msg, uniqueRollId, state.MP_Engine.pending[uniqueRollId], defTok, atkTok);
      return;
    }

    let buttons = "";
    if (outcome === "HIT" || outcome === "CRIT") {
      if (isSaveAttack) {
        buttons = buildSaveAttackButtons(uniqueRollId, critResult, pushAmount, noDamage);
      } else if (isSnareAttack) {
        buttons = buildSnareAttackButtons(uniqueRollId, critResult, pushAmount);
      } else {
        buttons = buildStandardAttackButtons(uniqueRollId, critResult, causesKB, state.MP_Engine.pending[uniqueRollId]);
      }
    }

    // Undo: cancel this attack — refund attacker PR/charges and void the pending,
    // so a misfired attack can be taken back before (or instead of) applying it.
    const atkUndoId = "atk_" + uniqueRollId;
    registerUndo(atkUndoId, esc(atkName) + " attack (cancel)", [], {
      atkTokenId: atkTok ? atkTok.id : null,
      atkCharId: atkCharId,
      isVeh: undoAtkIsVeh,
      powerBefore: undoAtkPowerBefore,
      chgCharId: chgDeducted ? atkCharId : null,
      chgRowId: chgDeducted ? rowId : null,
      chgBefore: chgDeducted ? atkChgRaw : undefined,
      voidPending: uniqueRollId
    });
    html += undoButton(atkUndoId);

    if (CFG.GM_ONLY_BUTTONS) {
      const charTargets = [atkCharId, defChar.id];
      chToChars("MP", html, charTargets);
      // Buttons only to defender (they decide roll-with); GM sees via whisper
      if (buttons) chToChar("MP", buttons, defChar.id);
    } else {
      ch("MP", html + buttons);
    }
  }

  // -------------------------
  // AREA EFFECT HANDLING
  // -------------------------

  function handleAreaAttack(msg, rollId, rec, targetTok, atkTok) {
    const outcome = rec.outcome;
    const pageId = targetTok.get("_pageid");
    const page = getObj("page", pageId);
    const snap = page ? page.get("snapping_increment") : 1;
    const pixelsPerInch = 70 * snap;
    
    let centerX, centerY;
    let scatterDist = 0;
    let scatterNote = "";
    
    if (outcome === "HIT" || outcome === "CRIT") {
      // Area centered on target location
      centerX = targetTok.get("left");
      centerY = targetTok.get("top");
    } else if (outcome === "MISS" || outcome === "FUMBLE") {
      // Calculate scatter per 4.7.5.1
      // Scatter = ceil((range / 20) * failure margin)
      const rangeInches = rec.rangeData ? rec.rangeData.inches : 0;
      const failMargin = rec.roll - rec.targetTotal;
      
      // Special case: if TN was 20+ but missed on nat 20, scatter is exactly 1"
      if (rec.targetTotal >= 20 && rec.nat === 20) {
        scatterDist = 1;
      } else {
        scatterDist = Math.ceil((rangeInches / 20) * failMargin);
      }
      
      // Random direction (8 directions)
      const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const dirIdx = randomInteger(8) - 1;
      const direction = directions[dirIdx];
      
      // Calculate scatter offset
      const angles = { N: -90, NE: -45, E: 0, SE: 45, S: 90, SW: 135, W: 180, NW: -135 };
      const angleRad = (angles[direction] * Math.PI) / 180;
      const scatterPx = scatterDist * pixelsPerInch;
      const offsetX = Math.cos(angleRad) * scatterPx;
      const offsetY = Math.sin(angleRad) * scatterPx;
      
      centerX = targetTok.get("left") + offsetX;
      centerY = targetTok.get("top") + offsetY;
      
      scatterNote = ` Scatter: ${scatterDist}" ${direction}`;
    }
    
    // Find all tokens in the area
    const tokensInArea = getTokensInRadius(pageId, centerX, centerY, rec.areaRadius);
    
    // Store area effect data
    cleanupPendingArea();
    const areaTokens = {};
    tokensInArea.forEach(t => {
      const distToEdge = calculateDistanceToEdge(t.distance, rec.areaRadius);
      areaTokens[t.tokenId] = {
        tokenId: t.tokenId,
        charId: t.charId,
        name: t.name,
        distance: t.distance,
        distToEdge: distToEdge,
        controller: t.controller,
        escaped: null,  // null = pending, true = escaped, false = failed
        shieldBlocked: false,
        prone: false
      };
    });
    
    state.MP_Engine.pendingArea[rollId] = {
      rollId: rollId,
      playerid: rec.playerid,
      atkCharId: rec.atkCharId,
      damage: rec.damageTotal,
      damageType: rec.dmgTypeStr,
      dmgSubtype: rec.dmgSubtype,
      protKey: rec.protKey,
      atkAP: rec.atkAP,
      radius: rec.areaRadius,
      diameter: rec.areaDiameter,
      centerX: centerX,
      centerY: centerY,
      pageId: pageId,
      tokens: areaTokens,
      timestamp: Date.now(),
      timeout: 60000,  // 60 second timeout
      atkName: rec.atkName,
      causesKB: rec.causesKB
    };
    
    // Build output
    let html;
    if (outcome === "HIT" || outcome === "CRIT") {
      html = `<div style="background:#f39c12; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
      html += `<span style="color:#000; font-weight:bold; font-size:14px;">💥 AREA ${outcome}!</span>`;
    } else {
      html = `<div style="background:#e74c3c; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
      html += `<span style="color:#000; font-weight:bold; font-size:14px;">💥 AREA ${outcome}!</span>`;
    }
    
    html += `<br/><span style="color:#000;">Radius: <b>${rec.areaRadius}"</b> | Damage: <b>${rec.damageTotal}</b> ${rec.dmgTypeStr}</span>`;
    html += `<br/><span style="color:#000;">To-Hit: <b>${rec.targetTotal}-</b> (+6 immobile, no def) | Roll: <b>${rec.roll}</b>${scatterNote}</span>`;
    
    if (tokensInArea.length === 0) {
      html += `<br/><span style="color:#333;">No tokens in area.</span>`;
    } else {
      html += `<br/><span style="color:#000; font-weight:bold;">Tokens in area: ${tokensInArea.length}</span>`;
      
      // List tokens with escape buttons
      tokensInArea.forEach(t => {
        const distToEdge = calculateDistanceToEdge(t.distance, rec.areaRadius);
        const baseDef = getAttrNum(t.charId, "physical_def", 0);
        const escapeTN = baseDef + 9 - (3 * distToEdge);
        const escapeTNProne = escapeTN + 6;
        
        // Check for shield
        const shield = getShieldData(t.charId);
        const shieldTN = shield ? (9 + baseDef + shield.defense) : 0;
        
        html += `<br/><span style="color:#333;">• <b>${esc(t.name)}</b> (${distToEdge}" to edge)</span>`;
        html += `<br/>  <span style="font-size:11px;">Escape TN: ${escapeTN}- | Prone: ${escapeTNProne}-</span>`;
        
        // Player/GM buttons
        if (t.controller !== "gm" && t.controller !== "all") {
          // Whisper buttons to player
          const playerButtons = `[Leap Clear (${escapeTN}-)](!mp areaescape --id ${rollId} --target ${t.tokenId}) ` +
            `[Dive Prone (${escapeTNProne}-)](!mp areaescape --id ${rollId} --target ${t.tokenId} --prone)` +
            (shield ? ` [Shield Block (${shieldTN}-)](!mp areashield --id ${rollId} --target ${t.tokenId})` : "");
          // chToChar resolves the character's controllers to display names;
          // t.controller is a player ID (not a display name) so /w "${t.controller}" silently fails.
          chToChar("MP", `<b>AREA EFFECT vs ${esc(t.name)}</b><br/>${playerButtons}`, t.charId);
        }
      });
      
      // GM buttons
      html += `<br/><br/>[Auto-Roll NPCs](!mp arearollnpcs --id ${rollId})`;
      html += ` [Force All Escapes](!mp areaforceall --id ${rollId})`;
      html += ` [Apply All Damage](!mp areadamageall --id ${rollId})`;
    }
    
    html += `</div>`;
    if (CFG.GM_ONLY_BUTTONS) {
      chToChar("MP", html, rec.atkCharId);
    } else {
      ch("MP", html);
    }
  }

  // Handle escape attempt for area effect
  function cmdAreaEscape(msg, args) {
    const rollId = args.id;
    const targetId = args.target;
    const isProne = (args.prone === "1" || args.prone === "true" || args.prone !== undefined && args.prone !== "");
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `${wt(msg)}<b>MP:</b> Area effect expired or not found.`);
    
    const tokData = areaRec.tokens[targetId];
    if (!tokData) return ch("MP", `/w gm <b>MP:</b> Token not in area effect.`);
    
    if (tokData.escaped !== null) {
      return ch("MP", `/w gm <b>MP:</b> ${esc(tokData.name)} already resolved escape.`);
    }
    
    const tok = getObj("graphic", targetId);
    const char = getObj("character", tokData.charId);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Token or character not found.`);
    
    // Calculate escape TN: Defense + 9 - (3 * distance to edge) + 6 if prone
    const baseDef = getAttrNum(tokData.charId, "physical_def", 0);
    const distToEdge = tokData.distToEdge;
    let escapeTN = baseDef + 9 - (3 * distToEdge);
    if (isProne) escapeTN += 6;
    
    const roll = (args.roll !== undefined && args.roll !== null && String(args.roll).trim() !== "") ? num(args.roll, 0) : randomInteger(20);
    const success = (roll !== 20) && (roll <= escapeTN);
    
    tokData.escaped = success;
    tokData.prone = isProne && success;
    
    let resultHtml;
    if (success) {
      resultHtml = `<div style="background:#27ae60; border:2px solid #000; padding:4px 8px;">`;
      resultHtml += `<b>${esc(tokData.name)}</b> ESCAPES area effect!`;
      resultHtml += `<br/>TN: ${escapeTN}- | Roll: ${roll}${isProne ? " (dove prone)" : ""}`;
      resultHtml += `</div>`;
    } else {
      // Failed - character ends up halfway to edge
      const halfwayDist = Math.ceil(distToEdge / 2);
      resultHtml = `<div style="background:#e74c3c; border:2px solid #000; padding:4px 8px;">`;
      resultHtml += `<b>${esc(tokData.name)}</b> FAILS to escape!`;
      resultHtml += `<br/>TN: ${escapeTN}- | Roll: ${roll}${roll === 20 ? " (fumble)" : ""}`;
      resultHtml += `<br/>Ends ${halfwayDist}" from edge (still in area)`;
      resultHtml += `</div>`;
    }
    
    chCombat("MP", resultHtml, char.id);
    
    // Check if all tokens resolved
    checkAreaResolved(rollId);
  }

  // Handle shield block for area effect
  function cmdAreaShield(msg, args) {
    const rollId = args.id;
    const targetId = args.target;
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `${wt(msg)}<b>MP:</b> Area effect expired or not found.`);
    
    const tokData = areaRec.tokens[targetId];
    if (!tokData) return ch("MP", `/w gm <b>MP:</b> Token not in area effect.`);
    
    if (tokData.escaped !== null) {
      return ch("MP", `/w gm <b>MP:</b> ${esc(tokData.name)} already resolved.`);
    }
    
    const char = getObj("character", tokData.charId);
    if (!char) return ch("MP", `/w gm <b>MP:</b> Character not found.`);
    
    const shield = getShieldData(tokData.charId);
    if (!shield) return ch("MP", `/w gm <b>MP:</b> ${esc(tokData.name)} has no active shield.`);
    
    // Shield block TN: 9 + Defense + shield defense bonus
    const baseDef = getAttrNum(tokData.charId, "physical_def", 0);
    const blockTN = 9 + baseDef + shield.defense;
    
    const roll = randomInteger(20);
    const success = (roll !== 20) && (roll <= blockTN);
    
    let resultHtml;
    if (success) {
      // Shield takes the damage - check if it breaks
      tokData.escaped = true;  // Blocked = escaped the direct damage
      tokData.shieldBlocked = true;
      
      const damage = areaRec.damage;
      const shieldBroken = damage >= shield.bp;
      
      resultHtml = `<div style="background:#3498db; border:2px solid #000; padding:4px 8px;">`;
      resultHtml += `<b>${esc(tokData.name)}</b> BLOCKS with ${esc(shield.name)}!`;
      resultHtml += `<br/>TN: ${blockTN}- | Roll: ${roll}`;
      resultHtml += `<br/>Damage: ${damage} vs Shield BP: ${shield.bp}`;
      
      if (shieldBroken) {
        breakShield(tokData.charId, shield.rowId);
        resultHtml += `<br/><span style="color:#c0392b; font-weight:bold;">SHIELD BROKEN!</span>`;
      } else {
        resultHtml += `<br/><span style="color:#27ae60;">Shield holds!</span>`;
      }
      resultHtml += `</div>`;
    } else {
      // Failed block - takes normal area damage
      tokData.escaped = false;
      
      resultHtml = `<div style="background:#e74c3c; border:2px solid #000; padding:4px 8px;">`;
      resultHtml += `<b>${esc(tokData.name)}</b> FAILS to block!`;
      resultHtml += `<br/>TN: ${blockTN}- | Roll: ${roll}${roll === 20 ? " (fumble)" : ""}`;
      resultHtml += `<br/>Takes full area damage.`;
      resultHtml += `</div>`;
    }
    
    chCombat("MP", resultHtml, char.id);
    
    checkAreaResolved(rollId);
  }

  // Auto-roll escapes for NPC tokens
  function cmdAreaRollNPCs(msg, args) {
    const rollId = args.id;
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `/w gm <b>MP:</b> Area effect expired or not found.`);
    
    Object.keys(areaRec.tokens).forEach(tokId => {
      const tokData = areaRec.tokens[tokId];
      if (tokData.escaped !== null) return;  // Already resolved
      if (tokData.controller !== "gm") return;  // Skip player-controlled
      
      // Auto-roll escape for NPC
      cmdAreaEscape(msg, { id: rollId, target: tokId });
    });
  }

  // Force all remaining escapes (GM override)
  function cmdAreaForceAll(msg, args) {
    const rollId = args.id;
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `/w gm <b>MP:</b> Area effect expired or not found.`);
    
    Object.keys(areaRec.tokens).forEach(tokId => {
      const tokData = areaRec.tokens[tokId];
      if (tokData.escaped !== null) return;  // Already resolved
      
      // Force-roll escape
      cmdAreaEscape(msg, { id: rollId, target: tokId });
    });
  }

  // Apply damage to all tokens that failed to escape
  function cmdAreaDamageAll(msg, args) {
    const rollId = args.id;
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `/w gm <b>MP:</b> Area effect expired or not found.`);
    
    let html = `<div style="background:#f39c12; border:3px solid #000; padding:4px 8px;">`;
    html += `<span style="color:#000; font-weight:bold;">AREA DAMAGE RESULTS</span>`;
    html += `<br/>${areaRec.damage} ${areaRec.damageType}`;
    
    Object.keys(areaRec.tokens).forEach(tokId => {
      const tokData = areaRec.tokens[tokId];
      
      if (tokData.escaped === true) {
        html += `<br/><span style="color:#27ae60;">✓ <b>${esc(tokData.name)}</b> escaped${tokData.shieldBlocked ? " (shield)" : ""}${tokData.prone ? " (prone)" : ""}</span>`;
        return;
      }
      
      if (tokData.escaped === null) {
        // Didn't respond - auto-fail
        tokData.escaped = false;
        html += `<br/><span style="color:#e67e22;">⚠ <b>${esc(tokData.name)}</b> no response - auto-fail</span>`;
      }
      
      // Apply damage with coverage-adjusted protection
      const tok = getObj("graphic", tokId);
      const char = getObj("character", tokData.charId);
      if (!tok || !char) {
        html += `<br/><span style="color:#e74c3c;">✗ <b>${esc(tokData.name)}</b> - token missing</span>`;
        return;
      }
      
      const raw = areaRec.damage;
      const tokIsVehicle = isVehicleMode(tokData.charId);
      const protData = tokIsVehicle
        ? getVehicleProtection(tokData.charId, areaRec.protKey)
        : sumProtectionWithCoverage(tokData.charId, areaRec.protKey, true, areaRec.dmgSubtype);
      const baseProt = protData.prot;
      const hardened = protData.hardened;
      const hasInvuln = protData.invuln;
      const hasAdapt = protData.adapt;
      const isOtherType = (areaRec.damageType === "Other");
      
      // Apply AP vs protection
      let effectiveProt = baseProt;
      const rawAP = areaRec.atkAP || 0;
      let effectiveAP = 0;
      if (rawAP === Infinity) {
        effectiveAP = Infinity;
        effectiveProt = 0;
      } else if (rawAP > 0) {
        const apUsedVsHardened = Math.min(rawAP, hardened);
        effectiveAP = Math.max(0, rawAP - hardened);
        effectiveProt = Math.max(0, baseProt - effectiveAP);
      }
      
      // Leftover AP for invuln/adapt bypass
      let leftoverAP = 0;
      if (effectiveAP === Infinity) {
        leftoverAP = Infinity;
      } else if (effectiveAP > baseProt) {
        leftoverAP = effectiveAP - baseProt;
      }
      
      // Damage after protection
      let afterProt = Math.max(0, raw - effectiveProt);
      
      // Apply Invulnerability (1/4 damage)
      let penetrating = afterProt;
      if (hasInvuln && afterProt > 0 && leftoverAP !== Infinity) {
        if (leftoverAP >= afterProt) {
          penetrating = afterProt;
        } else {
          const bypassedDmg = leftoverAP;
          const reducedDmg = afterProt - leftoverAP;
          const afterInvuln = Math.floor(reducedDmg / 4);
          penetrating = bypassedDmg + afterInvuln;
        }
      }
      
      // Apply Adaptation (1/2 damage, or 100% immunity for Other)
      if (hasAdapt && penetrating > 0) {
        if (isOtherType) {
          penetrating = 0;
        } else if (leftoverAP !== Infinity) {
          penetrating = Math.floor(penetrating / 2);
        }
      }
      
      // Apply damage to Hits
      const hits0 = tokIsVehicle ? getVehicleHits(tok, tokData.charId) : getResource(tok, tokData.charId, CFG.HITS_BAR, CFG.HITS_ATTR);
      const pow0 = tokIsVehicle ? getVehiclePower(tok, tokData.charId) : getResource(tok, tokData.charId, CFG.POWER_BAR, CFG.POWER_ATTR);
      
      const toHits = penetrating;
      const hitsAfterDmg = Math.max(0, hits0 - toHits);
      const overflow = tokIsVehicle ? 0 : Math.max(0, toHits - hits0);
      const pow1 = tokIsVehicle ? pow0 : Math.max(0, pow0 - overflow);
      const hits1 = hitsAfterDmg;
      
      if (tokIsVehicle) {
        setVehicleHits(tok, tokData.charId, hits1);
      } else {
        setResource(tok, tokData.charId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
        setResource(tok, tokData.charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
      }
      
      // Status effects
      // Vehicles: incapacitated at 0, no unconsciousness
      const hasPainResistance = tokIsVehicle ? true : (num(getAttr(tokData.charId, "willpower_pain_resistance"), 0) === 1);
      const unconscious = !tokIsVehicle && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
      const incapacitated = (hits1 === 0);
      
      let statusNote = "";
      if (incapacitated) {
        statusNote = " <b>INCAPACITATED!</b>";
        tok.set("status_dead", true);
      } else if (unconscious) {
        statusNote = " <b>UNCONSCIOUS!</b>";
        tok.set("status_sleepy", true);
      }
      
      html += `<br/><span style="color:#c0392b;">✗ <b>${esc(tokData.name)}</b>: ${raw}-${effectiveProt} prot`;
      if (hasInvuln) html += ` [×¼]`;
      if (hasAdapt) html += isOtherType ? ` [IMMUNE]` : ` [×½]`;
      html += ` = ${penetrating} pen → Hits: ${hits0}→${hits1}${statusNote}</span>`;
    });
    
    html += `</div>`;
    if (CFG.GM_ONLY_BUTTONS) {
      chToChar("MP", html, areaRec.atkCharId);
    } else {
      ch("MP", html);
    }
    
    // Clean up
    delete state.MP_Engine.pendingArea[rollId];
  }

  // Check if all tokens in area have resolved their escapes
  function checkAreaResolved(rollId) {
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return;
    
    const allResolved = Object.values(areaRec.tokens).every(t => t.escaped !== null);
    if (allResolved) {
      const resolvedHtml = `<div style="background:#3498db; padding:4px;">All escapes resolved. [Apply All Damage](!mp areadamageall --id ${rollId})</div>`;
      if (CFG.GM_ONLY_BUTTONS) {
        chToChar("MP", resolvedHtml, areaRec.atkCharId);
      } else {
        ch("MP", resolvedHtml);
      }
    }
  }

  // -------------------------
  // ABSORPTION / REFLECTION
  // -------------------------
  
  // Absorb incoming damage (1/4 damage, uses saved action, accumulates points)
  function cmdAbsorb(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired or not found.`);
    
    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defChar) return ch("MP", `/w gm <b>MP:</b> Defender not found.`);
    if (!defTok) return ch("MP", `/w gm <b>MP:</b> Defender token not found.`);
    
    // Verify character has Absorption for this damage type
    const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
    if (!absRef || absRef.mode !== "absorption") {
      return ch("MP", `/w gm <b>MP:</b> ${esc(rec.defName)} doesn't have Absorption for this damage type.`);
    }
    
    const rawDamage = rec.damageTotal;
    const quarterDamage = Math.floor(rawDamage / 4);  // 1/4 damage, rounded down
    
    // Calculate absorbed points (capped at limit)
    const absorbedPoints = absRef.limit > 0 ? Math.min(rawDamage, absRef.limit) : rawDamage;
    const excess = absRef.limit > 0 ? Math.max(0, rawDamage - absRef.limit) : 0;
    
    // Get current Hits and Power
    const absDefIsVeh = isVehicleMode(rec.defCharId);
    const hits0 = absDefIsVeh ? getVehicleHits(defTok, rec.defCharId) : getResource(defTok, rec.defCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = absDefIsVeh ? getVehiclePower(defTok, rec.defCharId) : getResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    
    // Apply 1/4 damage to Hits first
    const toHits = quarterDamage;
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = absDefIsVeh ? 0 : Math.max(0, toHits - hits0);
    const powAfterDmg = absDefIsVeh ? pow0 : Math.max(0, pow0 - overflow);
    
    // Determine absorption target
    const absorbsTo = absRef.absorbsTo;
    const bcStats = { st: "strength", en: "endurance", ag: "agility", "in": "intelligence", cl: "cool" };
    
    let absorptionDesc = "";
    let hits1 = hitsAfterDmg;
    let pow1 = powAfterDmg;
    let createEffect = false;
    let effectTarget = "";
    let statBoosted = null;
    let statOriginal = 0;
    let statNew = 0;
    
    if (absorbsTo === "hits") {
      hits1 = hitsAfterDmg + absorbedPoints;
      absorptionDesc = `+${absorbedPoints} Hits`;
    } else if (absorbsTo === "power") {
      pow1 = powAfterDmg + absorbedPoints;
      absorptionDesc = `+${absorbedPoints} Power`;
    } else if (absorbsTo === "split") {
      const toHitsGain = Math.floor(absorbedPoints / 2);
      const toPowerGain = absorbedPoints - toHitsGain;
      hits1 = hitsAfterDmg + toHitsGain;
      pow1 = powAfterDmg + toPowerGain;
      absorptionDesc = `+${toHitsGain} Hits, +${toPowerGain} Power`;
    } else if (bcStats[absorbsTo]) {
      // BC stat boost
      const statAttr = bcStats[absorbsTo];
      statBoosted = statAttr;
      statOriginal = getAttrNum(rec.defCharId, statAttr, 10);
      statNew = statOriginal + absorbedPoints;
      setAttr(rec.defCharId, statAttr, statNew);
      absorptionDesc = `+${absorbedPoints} ${absorbsTo.toUpperCase()} (${statOriginal}→${statNew})`;
      createEffect = true;
      effectTarget = absorbsTo.toUpperCase();
    } else if (absorbsTo === "other") {
      // Other power - just create status effect label
      const powerName = absRef.absorbsPower || "Power";
      absorptionDesc = `+${absorbedPoints} CPs to ${powerName}`;
      createEffect = true;
      effectTarget = powerName;
    }
    
    // Apply Hits/Power changes
    if (absDefIsVeh) {
      setVehicleHits(defTok, rec.defCharId, hits1);
      setVehiclePower(defTok, rec.defCharId, pow1);
    } else {
      setResource(defTok, rec.defCharId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }
    
    // Create absorption effect for BC stats and Other powers
    if (createEffect) {
      const expiryTime = Date.now() + (5 * 60 * 1000);  // 5 minutes from now
      
      const absEffect = {
        type: "absorption",
        target: effectTarget,
        amount: absorbedPoints,
        statAttr: statBoosted,  // For BC stats, the attribute name to restore
        originalValue: statOriginal,  // For BC stats, original value before boost
        created: Date.now(),
        expires: expiryTime,
        sourceAtk: rec.atkName,
        dmgType: rec.dmgTypeStr
      };
      
      if (!state.MP_Engine.conditions[rec.defTokenId]) {
        state.MP_Engine.conditions[rec.defTokenId] = [];
      }
      state.MP_Engine.conditions[rec.defTokenId].push(absEffect);
      
      // Set a purple aura marker to indicate active absorption
      defTok.set("status_purple", true);
    }
    
    // Status effects (only if net result is bad)
    // Pain Resistance (Willpower): only knocked out at Hits = 0, not at half
    const hasPainResistance = (num(getAttr(rec.defCharId, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0 && hits1 < hits0;
    const incapacitated = (hits1 === 0);
    
    if (incapacitated) defTok.set("status_dead", true);
    else if (unconscious) defTok.set("status_sleepy", true);
    
    // Build output
    let html = `<div style="background:#9b59b6; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#fff; font-weight:bold; font-size:14px;">🔮 ABSORPTION!</span>`;
    html += `<br/><span style="color:#fff;"><b>${esc(rec.defName)}</b> absorbs ${rawDamage} ${rec.dmgTypeStr}${rec.dmgSubtype ? ` (${rec.dmgSubtype})` : ""}</span>`;
    html += `<br/><span style="color:#fff;">Takes ¼ damage: ${quarterDamage}</span>`;
    html += `<br/><span style="color:#fff;">Absorbs ${absorbedPoints} → ${absorptionDesc}</span>`;
    
    // Show Hits/Power for hits/power/split modes
    if (absorbsTo === "hits" || absorbsTo === "power" || absorbsTo === "split") {
      html += `<br/><span style="color:#fff;">Hits: ${hits0}→${hits1} | Power: ${pow0}→${pow1}</span>`;
    } else {
      // For BC stats / Other, just show the damage result
      html += `<br/><span style="color:#fff;">Hits: ${hits0}→${hits1}</span>`;
    }
    
    if (excess > 0) {
      html += `<br/><span style="color:#f1c40f;">⚠ ${excess} points exceeded limit (ignored)</span>`;
    }
    
    if (createEffect) {
      html += `<br/><span style="color:#ddd; font-size:11px;"><i>Expires in 5 minutes.</i></span>`;
    }
    html += `<br/><span style="color:#ddd; font-size:11px;"><i>Used saved action.</i></span>`;
    
    if (incapacitated) html += `<br/><span style="color:#e74c3c; font-weight:bold;">INCAPACITATED!</span>`;
    else if (unconscious) html += `<br/><span style="color:#e74c3c; font-weight:bold;">UNCONSCIOUS!</span>`;
    
    html += `</div>`;
    
    chCombat("MP", html, rec.defCharId, rec.atkCharId);
    
    // Clean up pending record
    delete state.MP_Engine.pending[rollId];
  }
  
  // Reflect incoming damage (1/4 damage, immediate counter-attack)
  function cmdReflect(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired or not found.`);
    
    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defChar) return ch("MP", `/w gm <b>MP:</b> Defender not found.`);
    if (!defTok) return ch("MP", `/w gm <b>MP:</b> Defender token not found.`);
    
    // Verify character has Reflection for this damage type
    const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
    if (!absRef || absRef.mode !== "reflection") {
      return ch("MP", `/w gm <b>MP:</b> ${esc(rec.defName)} doesn't have Reflection for this damage type.`);
    }
    
    const rawDamage = rec.damageTotal;
    const quarterDamage = Math.floor(rawDamage / 4);  // 1/4 damage, rounded down
    
    // Calculate reflected points (capped at limit)
    const reflectedPoints = absRef.limit > 0 ? Math.min(rawDamage, absRef.limit) : rawDamage;
    const excess = absRef.limit > 0 ? Math.max(0, rawDamage - absRef.limit) : 0;
    
    // Apply 1/4 damage to Hits
    const refDefIsVeh = isVehicleMode(rec.defCharId);
    const hits0 = refDefIsVeh ? getVehicleHits(defTok, rec.defCharId) : getResource(defTok, rec.defCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = refDefIsVeh ? getVehiclePower(defTok, rec.defCharId) : getResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    
    const toHits = quarterDamage;
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = refDefIsVeh ? 0 : Math.max(0, toHits - hits0);
    const pow1 = refDefIsVeh ? pow0 : Math.max(0, pow0 - overflow);
    const hits1 = hitsAfterDmg;
    
    if (refDefIsVeh) {
      setVehicleHits(defTok, rec.defCharId, hits1);
    } else {
      setResource(defTok, rec.defCharId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }
    
    // Status effects
    const hasPainResistance = refDefIsVeh ? true : (num(getAttr(rec.defCharId, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !refDefIsVeh && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);
    
    if (incapacitated) defTok.set("status_dead", true);
    else if (unconscious) defTok.set("status_sleepy", true);
    
    // Store reflection data for counter-attack
    const reflectRollId = "reflect_" + String(Date.now()) + "_" + randomInteger(999999);
    state.MP_Engine.pending[reflectRollId] = {
      rollId: reflectRollId,
      atkCharId: rec.defCharId,  // Reflector is now the attacker
      atkName: rec.defName + " (Reflection)",
      defTokenId: null,  // Will be chosen by player
      defCharId: null,
      damageTotal: reflectedPoints,
      dmgTypeStr: rec.dmgTypeStr,
      dmgSubtype: rec.dmgSubtype,
      protKey: rec.protKey,
      atkAP: 0,
      causesKB: rec.causesKB,
      created: Date.now(),
      originalAtkCharId: rec.atkCharId  // Track original attacker for "back at attacker" option
    };
    
    // Build output
    let html = `<div style="background:#e67e22; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#fff; font-weight:bold; font-size:14px;">🔄 REFLECTION!</span>`;
    html += `<br/><span style="color:#fff;"><b>${esc(rec.defName)}</b> reflects ${rawDamage} ${rec.dmgTypeStr}${rec.dmgSubtype ? ` (${rec.dmgSubtype})` : ""}</span>`;
    html += `<br/><span style="color:#fff;">Takes ¼ damage: ${quarterDamage} → Hits: ${hits0}→${hits1}</span>`;
    html += `<br/><span style="color:#fff;">Reflects: <b>${reflectedPoints}</b> damage${absRef.limit > 0 ? ` (limit ${absRef.limit})` : ""}</span>`;
    if (excess > 0) {
      html += `<br/><span style="color:#f1c40f;">⚠ ${excess} points exceeded limit (not reflected)</span>`;
    }
    html += `<br/><span style="color:#ddd; font-size:11px;"><i>Used saved action.</i></span>`;
    
    if (incapacitated) html += `<br/><span style="color:#c0392b; font-weight:bold;">INCAPACITATED!</span>`;
    else if (unconscious) html += `<br/><span style="color:#c0392b; font-weight:bold;">UNCONSCIOUS!</span>`;
    
    html += `</div>`;
    
    // Add counter-attack buttons
    let buttons = `<br/>[Reflect at Original Attacker](!mp reflecthit --id ${reflectRollId} --target original)`;
    buttons += ` [Reflect at Target...](!mp reflecthit --id ${reflectRollId} --target &#64;{target|token_id})`;
    
    chCombat("MP", html + buttons, rec.defCharId, rec.atkCharId);
    
    // Clean up original pending record
    delete state.MP_Engine.pending[rollId];
  }
  
  // Apply reflected damage to a target
  function cmdReflectHit(msg, args) {
    const rollId = args.id;
    const targetArg = args.target;
    
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Reflection record expired or not found.`);
    
    // Determine target
    let targetTokId;
    if (targetArg === "original") {
      // Find the original attacker's token
      const atkChar = getObj("character", rec.originalAtkCharId);
      if (!atkChar) return ch("MP", `/w gm <b>MP:</b> Original attacker not found.`);
      
      const pageId = Campaign().get("playerpageid");
      const tokens = findObjs({ _type: "graphic", _pageid: pageId, _subtype: "token", represents: rec.originalAtkCharId });
      if (tokens.length === 0) return ch("MP", `/w gm <b>MP:</b> Original attacker has no token on this page.`);
      targetTokId = tokens[0].id;
    } else {
      targetTokId = targetArg;
    }
    
    const targetTok = getObj("graphic", targetTokId);
    if (!targetTok) return ch("MP", `/w gm <b>MP:</b> Target token not found.`);
    
    const targetCharId = targetTok.get("represents");
    if (!targetCharId) return ch("MP", `/w gm <b>MP:</b> Target token has no character.`);
    
    const targetChar = getObj("character", targetCharId);
    if (!targetChar) return ch("MP", `/w gm <b>MP:</b> Target character not found.`);
    
    const targetName = targetChar.get("name");
    
    // Get target's protection
    const rhTargetIsVeh = isVehicleMode(targetCharId);
    const protData = rhTargetIsVeh
      ? getVehicleProtection(targetCharId, rec.protKey)
      : sumProtectionWithHardened(targetCharId, rec.protKey, rec.dmgSubtype);
    const prot = protData.prot;
    const hasInvuln = protData.invuln;
    const hasAdapt = protData.adapt;
    const isOtherType = (rec.dmgTypeStr === "Other");
    
    // Calculate penetrating damage
    let penetrating = Math.max(0, rec.damageTotal - prot);
    
    // Invulnerability: 1/4 damage
    if (hasInvuln && penetrating > 0) {
      penetrating = Math.floor(penetrating / 4);
    }
    
    // Adaptation: 1/2 damage (or immune for Other type)
    if (hasAdapt && penetrating > 0) {
      if (isOtherType) {
        penetrating = 0;
      } else {
        penetrating = Math.floor(penetrating / 2);
      }
    }
    
    // Apply damage
    const hits0 = rhTargetIsVeh ? getVehicleHits(targetTok, targetCharId) : getResource(targetTok, targetCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = rhTargetIsVeh ? getVehiclePower(targetTok, targetCharId) : getResource(targetTok, targetCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    
    const toHits = penetrating;
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = rhTargetIsVeh ? 0 : Math.max(0, toHits - hits0);
    const pow1 = rhTargetIsVeh ? pow0 : Math.max(0, pow0 - overflow);
    const hits1 = hitsAfterDmg;
    
    if (rhTargetIsVeh) {
      setVehicleHits(targetTok, targetCharId, hits1);
    } else {
      setResource(targetTok, targetCharId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(targetTok, targetCharId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }
    
    // Status effects
    const hasPainResistance = rhTargetIsVeh ? true : (num(getAttr(targetCharId, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !rhTargetIsVeh && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);
    
    if (incapacitated) targetTok.set("status_dead", true);
    else if (unconscious) targetTok.set("status_sleepy", true);
    
    // Build output
    let html = `<div style="background:#e67e22; border:3px solid #000; padding:4px 8px; margin-top:4px;">`;
    html += `<span style="color:#fff; font-weight:bold; font-size:14px;">🔄 REFLECTED DAMAGE!</span>`;
    html += `<br/><span style="color:#fff;"><b>${esc(targetName)}</b> hit by reflected ${rec.dmgTypeStr}</span>`;
    html += `<br/><span style="color:#fff;">Raw: ${rec.damageTotal} - ${prot} prot`;
    if (hasInvuln) html += ` [×¼]`;
    if (hasAdapt) html += isOtherType ? ` [IMMUNE]` : ` [×½]`;
    html += ` = ${penetrating} penetrating</span>`;
    html += `<br/><span style="color:#fff;">Hits: ${hits0}→${hits1}</span>`;
    
    if (incapacitated) html += `<br/><span style="color:#c0392b; font-weight:bold;">INCAPACITATED!</span>`;
    else if (unconscious) html += `<br/><span style="color:#c0392b; font-weight:bold;">UNCONSCIOUS!</span>`;
    
    html += `</div>`;
    
    chCombat("MP", html, targetCharId);
    
    // Clean up
    delete state.MP_Engine.pending[rollId];
  }

  // -------------------------
  // FORCE FIELD COMMANDS
  // -------------------------
  
  // Reset/Renew Force Field: zeros accumulated deflection, costs action + PR
  // Usage: !mp ffreset --target <tokenId> --row <rowId>
  function cmdFFReset(msg, args) {
    let tok;
    if (args.target) {
      tok = getObj("graphic", args.target);
    } else {
      tok = getSelectedToken(msg);
    }
    if (!tok) return ch("MP", `/w gm <b>MP:</b> Select a token or use --target.`);
    
    const charId = tok.get("represents");
    if (!charId) return ch("MP", `/w gm <b>MP:</b> Token not linked to character.`);
    const defChar = getObj("character", charId);
    if (!defChar) return ch("MP", `/w gm <b>MP:</b> Character not found.`);
    
    // Find the FF row (use --row if provided, otherwise auto-find)
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    let rowId = args.row || null;
    
    if (!rowId) {
      const rowIds = new Set();
      attrs.forEach(a => {
        const n = a.get("name");
        const match = n.match(/^repeating_protection_([^_]+)_/);
        if (match) rowIds.add(match[1]);
      });
      for (const rid of rowIds) {
        const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rid}_prot_mode`);
        const mode = modeAttr ? (modeAttr.get("current") || "").toLowerCase() : "";
        if (mode !== "forcefield") continue;
        const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rid}_prot_broken`);
        if (brokenAttr && brokenAttr.get("current") === "1") continue;
        rowId = rid;
        break;
      }
    }
    if (!rowId) return ch("MP", `/w gm <b>MP:</b> No Force Field found on ${esc(defChar.get("name"))}.`);
    
    const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
    const mode = modeAttr ? (modeAttr.get("current") || "").toLowerCase() : "";
    if (mode !== "forcefield") return ch("MP", `/w gm <b>MP:</b> Not a Force Field row.`);
    
    const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
    const ffName = nameAttr ? nameAttr.get("current") : "Force Field";
    const prAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_pr`);
    const pr = num(prAttr ? prAttr.get("current") : "16", 16);
    
    // Spend PR from Power
    const ffResIsVeh = isVehicleMode(charId);
    const pow0 = ffResIsVeh ? getVehiclePower(tok, charId) : getResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR);
    if (pow0 < pr) {
      return ch("MP", `/w gm <b>MP:</b> ${esc(defChar.get("name"))} doesn't have enough Power (${pow0}/${pr}) to renew ${esc(ffName)}.`);
    }
    if (ffResIsVeh) {
      setVehiclePower(tok, charId, pow0 - pr);
    } else {
      setResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow0 - pr);
    }
    
    // Zero accumulated deflection
    setFFAccum(charId, rowId, 0);
    
    // Re-activate the field
    const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
    if (stateAttr) stateAttr.set("current", "Active");
    const onAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state_on`);
    if (onAttr) onAttr.set("current", "1");
    
    // Recalc threshold for display
    const gearAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_gear`);
    const isGear = gearAttr && gearAttr.get("current") === "1";
    let threshold;
    if (isGear) {
      let totalProt = 0;
      CFG.PROT_KEYS.forEach(k => {
        const pa = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_${k}`);
        totalProt += num(pa ? pa.get("current") : "0", 0);
      });
      threshold = Math.floor(totalProt * 1.5);
    } else {
      threshold = pow0 - pr;  // Power after spending PR
    }
    
    let html = `<div style="background:#16213e; border:2px solid #3498db; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    html += `<div style="font-weight:bold; font-size:15px; color:#3498db; margin-bottom:6px;">🛡️ ${esc(ffName)} RENEWED</div>`;
    html += `<div style="color:#ccc;">${esc(defChar.get("name"))} spends action + PR=${pr}</div>`;
    html += `<div style="color:#ccc;">Pool reset: 0/${threshold} (Power: ${pow0}→${pow0 - pr})</div>`;
    html += `</div>`;
    chToChar("MP", html, charId);
    
    // Turn on FF aura (full capacity = blue)
    updateFFAura(tok, 1.0);
  }
  
  // Reinforce Force Field with saved action at moment of collapse
  // Usage: !mp ffreinforce --id <rollId>
  function cmdFFReinforce(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired or not found.`);
    
    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Defender not found.`);
    
    // Get FF data (may be deactivated already from collapse)
    const attrs = findObjs({ _type: "attribute", _characterid: rec.defCharId }) || [];
    
    // Find the FF row (scan all protection rows for forcefield mode)
    let ffRowId = null;
    let ffName = "Force Field";
    let ffPR = 16;
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    for (const rowId of rowIds) {
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "").toLowerCase() : "";
      if (mode === "forcefield") {
        ffRowId = rowId;
        const na = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
        if (na) ffName = na.get("current");
        const pa = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_pr`);
        ffPR = num(pa ? pa.get("current") : "16", 16);
        break;
      }
    }
    if (!ffRowId) return ch("MP", `/w gm <b>MP:</b> No Force Field found on ${esc(defChar.get("name"))}.`);
    
    // Spend PR
    const ffReinIsVeh = isVehicleMode(rec.defCharId);
    const pow0 = ffReinIsVeh ? getVehiclePower(defTok, rec.defCharId) : getResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    if (pow0 < ffPR) {
      return ch("MP", `/w gm <b>MP:</b> Not enough Power (${pow0}/${ffPR}) to reinforce.`);
    }
    if (ffReinIsVeh) {
      setVehiclePower(defTok, rec.defCharId, pow0 - ffPR);
    } else {
      setResource(defTok, rec.defCharId, CFG.POWER_BAR, CFG.POWER_ATTR, pow0 - ffPR);
    }
    
    // Zero accum and re-activate
    setFFAccum(rec.defCharId, ffRowId, 0);
    const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_state`);
    if (stateAttr) stateAttr.set("current", "Active");
    const onAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_state_on`);
    if (onAttr) onAttr.set("current", "1");
    
    // The overflow damage from the collapse goes onto the new FF's deflection pool
    // (not to Hits — the reinforcement catches it)
    const overflowDmg = rec.ffOverflow || 0;
    if (overflowDmg > 0) {
      setFFAccum(rec.defCharId, ffRowId, overflowDmg);
    }
    
    const newThreshold = pow0 - ffPR;  // Power-based threshold after PR
    const remaining = Math.max(0, newThreshold - overflowDmg);
    
    let html = `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    html += `<div style="font-weight:bold; font-size:15px; color:#27ae60; margin-bottom:6px;">🛡️ ${esc(ffName)} REINFORCED!</div>`;
    html += `<div style="color:#ccc;">${esc(defChar.get("name"))} uses saved action + PR=${ffPR}</div>`;
    html += `<div style="color:#ccc;">Overflow ${overflowDmg} absorbed by new field</div>`;
    html += `<div style="color:#ccc;">Pool: ${overflowDmg}/${newThreshold} (${remaining} left)</div>`;
    html += `<div style="color:#ccc;">Power: ${pow0}→${pow0 - ffPR}</div>`;
    html += `</div>`;
    chToChar("MP", html, rec.defCharId);
    
    // Turn on FF aura (color based on remaining capacity)
    updateFFAura(defTok, newThreshold > 0 ? remaining / newThreshold : 0);
  }
  
  // Toggle Force Field on/off (activate or deactivate + aura)
  // Usage: !mp ff --target <tokenId>   or   !mp ff (with token selected)
  function cmdFFToggle(msg, args) {
    let tok;
    if (args.target) {
      tok = getObj("graphic", args.target);
    } else {
      tok = getSelectedToken(msg);
    }
    if (!tok) return ch("MP", `/w gm <b>MP:</b> Select a token or use --target.`);
    
    const charId = tok.get("represents");
    if (!charId) return ch("MP", `/w gm <b>MP:</b> Token not linked to character.`);
    const defChar = getObj("character", charId);
    if (!defChar) return ch("MP", `/w gm <b>MP:</b> Character not found.`);
    
    // Find the FF protection row
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    const rowIds = new Set();
    attrs.forEach(a => {
      const n = a.get("name");
      const match = n.match(/^repeating_protection_([^_]+)_/);
      if (match) rowIds.add(match[1]);
    });
    
    let ffRowId = null;
    for (const rowId of rowIds) {
      const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "").toLowerCase() : "";
      if (mode !== "forcefield") continue;
      const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      ffRowId = rowId;
      break;
    }
    if (!ffRowId) return ch("MP", `/w gm <b>MP:</b> No Force Field found on ${esc(defChar.get("name"))}.`);
    
    const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_name`);
    const ffName = nameAttr ? nameAttr.get("current") : "Force Field";
    const prAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_pr`);
    const pr = num(prAttr ? prAttr.get("current") : "16", 16);
    const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_state`);
    const currentState = stateAttr ? stateAttr.get("current") : "Off";
    
    if (currentState === "Active") {
      // Turn OFF
      deactivateFF(charId, ffRowId, tok);
      let html = `<div style="background:#16213e; border:2px solid #888; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      html += `<div style="font-weight:bold; font-size:15px; color:#888; margin-bottom:6px;">🛡️ ${esc(ffName)} OFF</div>`;
      html += `<div style="color:#ccc;">${esc(defChar.get("name"))} deactivates Force Field.</div>`;
      html += `</div>`;
      chToChar("MP", html, charId);
    } else {
      // Turn ON - spend PR
      const ffTogIsVeh = isVehicleMode(charId);
      const pow0 = ffTogIsVeh ? getVehiclePower(tok, charId) : getResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR);
      if (pow0 < pr) {
        return ch("MP", `/w gm <b>MP:</b> ${esc(defChar.get("name"))} doesn't have enough Power (${pow0}/${pr}) to activate ${esc(ffName)}.`);
      }
      if (ffTogIsVeh) {
        setVehiclePower(tok, charId, pow0 - pr);
      } else {
        setResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow0 - pr);
      }
      
      // Reset accum and activate
      setFFAccum(charId, ffRowId, 0);
      if (stateAttr) stateAttr.set("current", "Active");
      const onAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_state_on`);
      if (onAttr) onAttr.set("current", "1");
      
      // Calculate threshold
      const gearAttr = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_gear`);
      const isGear = gearAttr && gearAttr.get("current") === "1";
      let threshold;
      if (isGear) {
        let totalProt = 0;
        CFG.PROT_KEYS.forEach(k => {
          const pa = attrs.find(a => a.get("name") === `repeating_protection_${ffRowId}_prot_${k}`);
          totalProt += num(pa ? pa.get("current") : "0", 0);
        });
        threshold = Math.floor(totalProt * 1.5);
      } else {
        threshold = pow0 - pr;
      }
      
      let html = `<div style="background:#16213e; border:2px solid #3498db; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      html += `<div style="font-weight:bold; font-size:15px; color:#3498db; margin-bottom:6px;">🛡️ ${esc(ffName)} ACTIVATED</div>`;
      html += `<div style="color:#ccc;">${esc(defChar.get("name"))} spends action + PR=${pr}</div>`;
      html += `<div style="color:#ccc;">Pool: 0/${threshold}${isGear ? " [Gear]" : ""} (Power: ${pow0}→${pow0 - pr})</div>`;
      html += `</div>`;
      chToChar("MP", html, charId);
      
      updateFFAura(tok, 1.0);
    }
  }

  // -------------------------
  // ABILITY FIELD RESOLUTION
  // -------------------------
  
  // Handle Ability Field interaction when attack hits target with active AF
  // Per 2.2.4 Ability Field rules:
  // - Projectile: Roll AF dice, subtract from damage (destroys projectile if reduced to 0)
  // - Non-Projectile: AF has no effect, resolve damage normally
  // - Melee Weapon: Roll AF dice vs weapon (may destroy weapon, negating damage)
  // - Unarmed/HTH: Roll AF dice as counter-damage to attacker (may KO them, aborting attack)
  function cmdAbilityField(msg, args) {
    const rollId = args.id;
    const attackType = (args.type || "").toLowerCase();
    
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired or not found.`);
    
    const afData = rec.afData;
    if (!afData) return ch("MP", `/w gm <b>MP:</b> No Ability Field data in record.`);
    
    const defTok = getObj("graphic", rec.defTokenId);
    const defChar = getObj("character", rec.defCharId);
    if (!defTok || !defChar) return ch("MP", `/w gm <b>MP:</b> Defender not found.`);
    
    const defName = defChar.get("name");
    const afName = afData.name;
    const afDmgType = afData.dmgType;
    
    // Roll AF damage
    const afRollResult = rollExpr(afData.damage);
    const afDmg = afRollResult;
    
    let html = `<div style="background:#f39c12; border:3px solid #000; padding:6px 8px; margin-top:4px;">`;
    html += `<span style="color:#fff; font-weight:bold; font-size:14px;">🔥 ${esc(afName)} ACTIVATED!</span>`;
    html += `<br/><span style="color:#fff;">${esc(defName)}'s ${esc(afName)} rolls: <b>${afDmg}</b> ${esc(afDmgType)}</span>`;
    html += `</div>`;
    
    let buttons = "";
    
    switch (attackType) {
      case "projectile":
        // Projectile: AF damage subtracts from attack damage
        const remainingDmg = Math.max(0, rec.damageTotal - afDmg);
        html += `<div style="background:#27ae60; border:3px solid #000; padding:4px 8px; margin-top:2px;">`;
        if (remainingDmg === 0) {
          html += `<span style="color:#fff; font-weight:bold;">PROJECTILE DESTROYED!</span>`;
          html += `<br/><span style="color:#fff;">Attack: ${rec.damageTotal} - AF: ${afDmg} = 0 (blocked)</span>`;
          html += `</div>`;
          chCombat("MP", html, defChar.id, rec.atkCharId);
          delete state.MP_Engine.pending[rollId];
          return;
        } else {
          html += `<span style="color:#fff;">Attack reduced: ${rec.damageTotal} - ${afDmg} = <b>${remainingDmg}</b></span>`;
          html += `</div>`;
          // Update damage in pending record and show normal damage buttons
          rec.damageTotal = remainingDmg;
          rec.afResolved = true;
          buttons = buildStandardAttackButtonsAfterAF(rollId, rec.critResult, rec.causesKB, rec);
        }
        break;
        
      case "nonproject":
        // Non-projectile ranged: AF has no effect
        html += `<div style="background:#3498db; border:3px solid #000; padding:4px 8px; margin-top:2px;">`;
        html += `<span style="color:#fff;">Non-projectile attack - Ability Field has no effect</span>`;
        html += `</div>`;
        rec.afResolved = true;
        buttons = buildStandardAttackButtonsAfterAF(rollId, rec.critResult, rec.causesKB, rec);
        break;
        
      case "melee":
        // Melee Weapon: AF damage vs weapon breakpoint
        html += `<div style="background:#9b59b6; border:3px solid #000; padding:4px 8px; margin-top:2px;">`;
        html += `<span style="color:#fff; font-weight:bold;">AF vs Melee Weapon</span>`;
        html += `<br/><span style="color:#fff;">AF deals <b>${afDmg}</b> ${esc(afDmgType)} to weapon</span>`;
        html += `<br/><span style="color:#fff; font-size:11px;">Compare to weapon's Breakpoint. If weapon breaks, attack is negated.</span>`;
        html += `</div>`;
        rec.afResolved = true;
        buttons = `[Weapon Survives - Apply Damage](!mp afresume --id ${rollId}) `;
        buttons += `[Weapon Destroyed - No Damage](!mp afcancel --id ${rollId})`;
        break;
        
      case "unarmed":
        // Unarmed: AF counter-damages attacker
        html += `<div style="background:#e74c3c; border:3px solid #000; padding:4px 8px; margin-top:2px;">`;
        html += `<span style="color:#fff; font-weight:bold;">COUNTER-DAMAGE TO ATTACKER!</span>`;
        html += `<br/><span style="color:#fff;">${esc(afName)} deals <b>${afDmg}</b> ${esc(afDmgType)} to attacker</span>`;
        html += `</div>`;
        
        // Create pending record for AF counter-damage to attacker
        const afCounterId = String(Date.now()) + "_afcounter_" + randomInteger(999999);
        const afProtKey = typeToProtKey(afDmgType);
        
        state.MP_Engine.pending[afCounterId] = {
          rollId: afCounterId,
          playerid: msg.playerid,
          defTokenId: rec.defTokenId,  // Original defender (AF owner)
          defCharId: rec.defCharId,
          atkCharId: rec.atkCharId,     // Original attacker (takes counter-damage)
          atkName: rec.atkName,
          damageTotal: afDmg,
          dmgTypeStr: afDmgType,
          protKey: afProtKey,
          causesKB: afData.causesKB,
          isAFCounter: true,
          originalRollId: rollId,
          created: Date.now()
        };
        
        // Find attacker token
        const atkToks = findObjs({ _type: "graphic", _subtype: "token", represents: rec.atkCharId });
        const atkTok = atkToks.length > 0 ? atkToks[0] : null;
        const atkChar = getObj("character", rec.atkCharId);
        const atkName = atkChar ? atkChar.get("name") : "Attacker";
        
        if (atkTok) {
          state.MP_Engine.pending[afCounterId].atkTokenId = atkTok.id;
        }
        
        buttons = `<div style="margin-top:4px;"><b>Counter-damage to ${esc(atkName)}:</b></div>`;
        buttons += `[Apply Counter](!mp afcounter --id ${afCounterId}) `;
        buttons += `[Counter + RW](!mp afcounter --id ${afCounterId} --rw ?{Roll-With amount|0})`;
        buttons += `<br/><span style="font-size:10px; color:#666;">If attacker is KO'd, their attack is aborted.</span>`;
        break;
        
      default:
        html += `<div style="background:#c0392b; padding:4px 8px;">Unknown attack type: ${attackType}</div>`;
        rec.afResolved = true;
        buttons = buildStandardAttackButtonsAfterAF(rollId, rec.critResult, rec.causesKB, rec);
    }
    
    chCombat("MP", html + buttons, rec.defCharId, rec.atkCharId);
  }
  
  // Resume damage application after AF melee weapon check (weapon survived)
  function cmdAFResume(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired.`);
    
    const buttons = buildStandardAttackButtonsAfterAF(rollId, rec.critResult, rec.causesKB, rec);
    chCombat("MP", `<div style="background:#27ae60; border:2px solid #000; padding:4px 8px;">Weapon survived - proceeding with damage</div>` + buttons, rec.defCharId, rec.atkCharId);
  }
  
  // Cancel damage after AF (weapon destroyed or attacker KO'd)
  function cmdAFCancel(msg, args) {
    const rollId = args.id;
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Attack record expired.`);
    
    const defChar = getObj("character", rec.defCharId);
    const defName = defChar ? defChar.get("name") : "Target";
    
    chCombat("MP", `<div style="background:#9b59b6; border:2px solid #000; padding:4px 8px;"><span style="color:#fff; font-weight:bold;">Attack negated!</span><br/><span style="color:#fff;">${esc(defName)} takes no damage.</span></div>`, rec.defCharId, rec.atkCharId);
    delete state.MP_Engine.pending[rollId];
  }
  
  // Apply AF counter-damage to attacker (unarmed case)
  function cmdAFCounter(msg, args) {
    const rollId = args.id;
    const rwAmt = num(args.rw, 0);
    
    const rec = state.MP_Engine.pending[rollId];
    if (!rec) return ch("MP", `/w gm <b>MP:</b> Counter-damage record expired.`);
    
    // Find attacker token
    let atkTok = rec.atkTokenId ? getObj("graphic", rec.atkTokenId) : null;
    if (!atkTok) {
      const atkToks = findObjs({ _type: "graphic", _subtype: "token", represents: rec.atkCharId });
      atkTok = atkToks.length > 0 ? atkToks[0] : null;
    }
    const atkChar = getObj("character", rec.atkCharId);
    if (!atkTok || !atkChar) return ch("MP", `/w gm <b>MP:</b> Attacker token not found.`);
    
    const atkName = atkChar.get("name");
    
    // Get attacker's protection
    const afcAtkIsVeh = isVehicleMode(rec.atkCharId);
    const protData = afcAtkIsVeh
      ? getVehicleProtection(rec.atkCharId, rec.protKey)
      : sumProtectionWithHardened(rec.atkCharId, rec.protKey, "");
    const prot = protData.prot;
    const hasInvuln = protData.invuln;
    const hasAdapt = protData.adapt;
    const isOtherType = (rec.dmgTypeStr === "Other");
    
    // Calculate penetrating damage
    let afterProt = Math.max(0, rec.damageTotal - prot);
    
    if (hasInvuln && afterProt > 0) {
      afterProt = Math.floor(afterProt / 4);
    }
    if (hasAdapt && afterProt > 0) {
      if (isOtherType) afterProt = 0;
      else afterProt = Math.floor(afterProt / 2);
    }
    
    // Roll-with (vehicles cannot roll-with)
    const hits0 = afcAtkIsVeh ? getVehicleHits(atkTok, rec.atkCharId) : getResource(atkTok, rec.atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = afcAtkIsVeh ? getVehiclePower(atkTok, rec.atkCharId) : getResource(atkTok, rec.atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR);
    const maxRW = afcAtkIsVeh ? 0 : Math.floor(pow0 / 10);
    const actualRW = afcAtkIsVeh ? 0 : Math.min(rwAmt, maxRW, afterProt);
    
    const toHits = Math.max(0, afterProt - actualRW);
    const toPower = actualRW;
    
    const hits1 = Math.max(0, hits0 - toHits);
    const pow1 = afcAtkIsVeh ? pow0 : Math.max(0, pow0 - toPower);
    
    if (afcAtkIsVeh) {
      setVehicleHits(atkTok, rec.atkCharId, hits1);
    } else {
      setResource(atkTok, rec.atkCharId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(atkTok, rec.atkCharId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }
    
    // Check for KO
    const hasPainResistance = afcAtkIsVeh ? true : (num(getAttr(rec.atkCharId, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !afcAtkIsVeh && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);
    
    if (incapacitated) atkTok.set("status_dead", true);
    else if (unconscious) atkTok.set("status_sleepy", true);
    
    let html = `<div style="background:#e74c3c; border:3px solid #000; padding:4px 8px;">`;
    html += `<span style="color:#fff; font-weight:bold;">⚡ AF Counter-Damage to ${esc(atkName)}</span>`;
    html += `<br/><span style="color:#fff;">Raw: ${rec.damageTotal} - ${prot} prot`;
    if (hasInvuln) html += ` [×¼]`;
    if (hasAdapt) html += isOtherType ? ` [IMMUNE]` : ` [×½]`;
    html += ` = ${afterProt}</span>`;
    if (actualRW > 0) html += `<br/><span style="color:#fff;">Roll-With: ${actualRW} to Power</span>`;
    html += `<br/><span style="color:#fff;">Hits: ${hits0}→${hits1}, Power: ${pow0}→${pow1}</span>`;
    
    if (incapacitated || unconscious) {
      html += `<br/><span style="color:#fff; font-weight:bold; background:#000; padding:2px 4px;">ATTACKER KO'd - ATTACK ABORTED!</span>`;
      html += `</div>`;
      chCombat("MP", html, atkChar.id);
      // Clean up both records
      if (rec.originalRollId) delete state.MP_Engine.pending[rec.originalRollId];
      delete state.MP_Engine.pending[rollId];
      return;
    }
    
    html += `</div>`;
    
    // Attacker survived - proceed with original attack
    const origRec = state.MP_Engine.pending[rec.originalRollId];
    if (origRec) {
      html += `<div style="margin-top:4px;"><b>Attacker survives - resolve original attack:</b></div>`;
      const buttons = buildStandardAttackButtonsAfterAF(rec.originalRollId, origRec.critResult, origRec.causesKB, origRec);
      html += buttons;
    }
    
    chCombat("MP", html, atkChar.id);
    delete state.MP_Engine.pending[rollId];
  }
  
  // Build standard attack buttons after AF has been resolved
  // This is the same as buildStandardAttackButtons but skips the AF check
  function buildStandardAttackButtonsAfterAF(rollId, critResult, causesKB, rec) {
    const critType = critResult ? critResult.type : null;
    let buttons = "";
    
    // Vehicle targets: no roll-with, no head shot, no limb shots
    const defIsVeh = rec && rec.defCharId && isVehicleMode(rec.defCharId);
    
    // Check if defender has Protected Brain (negates head shots)
    const hasProtectedBrain = !defIsVeh && rec && rec.defCharId && 
      (num(getAttr(rec.defCharId, "willpower_protected_brain"), 0) === 1);
    
    const isHeadShot = rec && rec.isHeadShot;
    const isLegShot = rec && rec.isLegShot;
    const isArmShot = rec && rec.isArmShot;
    const isAvoidArmor = rec && rec.isAvoidArmor;
    const isGearShot = rec && rec.isGearShot;
    
    if (defIsVeh) {
      // Vehicles: Apply only, no roll-with options
      if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
        buttons = `[Apply (No Prot)](!mp apply --id ${rollId} --mode noprot)`;
      } else if (critType === CRIT_TYPES.SOLID_HIT) {
        buttons = `[Apply (+3 Solid)](!mp apply --id ${rollId} --mode solid)`;
      } else {
        buttons = `[Apply](!mp apply --id ${rollId} --mode noroll)`;
      }
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && !hasProtectedBrain) {
      buttons = `[Apply (Head Shot)](!mp apply --id ${rollId} --mode headshot) `;
      buttons += `[RW + Head Shot](!mp apply --id ${rollId} --mode headshot_rw --amt ?{Divert to Power|0})`;
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && hasProtectedBrain) {
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax) `;
      buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0})`;
    } else if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
      buttons = `[Apply (No Prot)](!mp apply --id ${rollId} --mode noprot) `;
      buttons += `[RW Max (No Prot)](!mp apply --id ${rollId} --mode noprot_rwmax) `;
      buttons += `[RW Custom (No Prot)](!mp apply --id ${rollId} --mode noprot_rw --amt ?{Divert to Power|0})`;
    } else if (critType === CRIT_TYPES.SOLID_HIT) {
      buttons = `[Apply (+3 Solid)](!mp apply --id ${rollId} --mode solid) `;
      buttons += `[RW Max (+3)](!mp apply --id ${rollId} --mode solid_rwmax) `;
      buttons += `[RW Custom (+3)](!mp apply --id ${rollId} --mode solid_rw --amt ?{Divert to Power|0})`;
    } else if (critType === CRIT_TYPES.PRECISE_HIT) {
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[RW Max (½)](!mp apply --id ${rollId} --mode precise_rwmax) `;
      buttons += `[RW Custom (½)](!mp apply --id ${rollId} --mode precise_rw --amt ?{Divert to Power|0})`;
    } else {
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax) `;
      buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0})`;
    }
    
    if (causesKB) {
      buttons += ` [KB](!mp kb --id ${rollId})`;
    }
    
    // Check for Absorption or Reflection (not for vehicles)
    if (!defIsVeh && rec && rec.defCharId && rec.protKey) {
      const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
      if (absRef) {
        if (absRef.mode === "absorption") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#9b59b6; font-weight:bold;">🔮 Absorption available${limitNote}</span>`;
          buttons += ` [Absorb (¼ dmg, saved action)](!mp absorb --id ${rollId})`;
        } else if (absRef.mode === "reflection") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#e67e22; font-weight:bold;">🔄 Reflection available${limitNote}</span>`;
          buttons += ` [Reflect (¼ dmg, saved action)](!mp reflect --id ${rollId})`;
        }
      }
    }
    
    if (!defIsVeh) {
      if (critType === CRIT_TYPES.LEG_SHOT || isLegShot) {
        buttons += `<br/>[Leg Shot Saves](!mp limbsave --id ${rollId} --limb leg)`;
      } else if (critType === CRIT_TYPES.ARM_SHOT || isArmShot) {
        buttons += `<br/>[Arm Shot Saves](!mp limbsave --id ${rollId} --limb arm)`;
      } else if (critType === CRIT_TYPES.MUSCLE_STRAIN_TARGET) {
        buttons += `<br/><i>(+1 Hit to target's torso)</i>`;
      }
    }
    
    if (isGearShot) {
      buttons += `<br/><i>(Compare damage to Gear breakpoint)</i>`;
    }
    
    return buttons;
  }

  // -------------------------
  // BUTTON BUILDERS
  // -------------------------

  function buildStandardAttackButtons(rollId, critResult, causesKB, rec) {
    const critType = critResult ? critResult.type : null;
    let buttons = "";
    
    // Vehicle target detection
    const defIsVeh = rec && rec.defCharId && isVehicleMode(rec.defCharId);
    
    // Check if defender has an active Ability Field (not for vehicles)
    if (!defIsVeh && rec && rec.defCharId) {
      const afData = getAbilityFieldData(rec.defCharId);
      if (afData) {
        // Target has an active Ability Field - show attack type selection buttons
        buttons = `<div style="color:#e67e22; font-weight:bold; margin-bottom:4px;">🔥 Target has ${esc(afData.name)} active! (${afData.damage} ${afData.dmgType})</div>`;
        buttons += `<div style="font-size:10px; color:#666; margin-bottom:4px;">Select attack type to resolve Ability Field:</div>`;
        buttons += `[Projectile](!mp afield --id ${rollId} --type projectile) `;
        buttons += `[Non-Projectile](!mp afield --id ${rollId} --type nonproject) `;
        buttons += `[Melee Weapon](!mp afield --id ${rollId} --type melee) `;
        buttons += `[Unarmed/HTH](!mp afield --id ${rollId} --type unarmed)`;
        
        // Store AF data in pending record for later resolution
        state.MP_Engine.pending[rollId].afData = afData;
        state.MP_Engine.pending[rollId].critResult = critResult;
        state.MP_Engine.pending[rollId].causesKB = causesKB;
        
        return buttons;
      }
    }
    
    // Check if defender has Protected Brain (negates head shots)
    const hasProtectedBrain = !defIsVeh && rec && rec.defCharId && 
      (num(getAttr(rec.defCharId, "willpower_protected_brain"), 0) === 1);
    
    // Called shot info from pending record
    const isHeadShot = rec && rec.isHeadShot;
    const isLegShot = rec && rec.isLegShot;
    const isArmShot = rec && rec.isArmShot;
    const isAvoidArmor = rec && rec.isAvoidArmor;
    const isGearShot = rec && rec.isGearShot;
    
    if (defIsVeh) {
      // Vehicles: Apply only, no roll-with options
      if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
        buttons = `[Apply (No Prot)](!mp apply --id ${rollId} --mode noprot)`;
      } else if (critType === CRIT_TYPES.SOLID_HIT) {
        buttons = `[Apply (+3 Solid)](!mp apply --id ${rollId} --mode solid)`;
      } else {
        buttons = `[Apply](!mp apply --id ${rollId} --mode noroll)`;
      }
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && !hasProtectedBrain) {
      // Head shot: apply damage then double after prot/roll-with
      buttons = `[Apply (Head Shot)](!mp apply --id ${rollId} --mode headshot) `;
      buttons += `[RW + Head Shot](!mp apply --id ${rollId} --mode headshot_rw --amt ?{Divert to Power|0})`;
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && hasProtectedBrain) {
      // Head shot negated by Protected Brain - show normal buttons
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax) `;
      buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0})`;
    } else if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
      // Avoid armor: ignore protection (crit OR deliberate called shot)
      buttons = `[Apply (No Prot)](!mp apply --id ${rollId} --mode noprot) `;
      buttons += `[RW Max (No Prot)](!mp apply --id ${rollId} --mode noprot_rwmax) `;
      buttons += `[RW Custom (No Prot)](!mp apply --id ${rollId} --mode noprot_rw --amt ?{Divert to Power|0})`;
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
    } else {
      // Normal hit or other crit types
      buttons = `[Apply](!mp apply --id ${rollId} --mode noroll) `;
      buttons += `[Roll-With Max](!mp apply --id ${rollId} --mode rollwithmax) `;
      buttons += `[Roll-With Custom](!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0})`;
    }
    
    if (causesKB) {
      buttons += ` [KB](!mp kb --id ${rollId})`;
    }
    
    // Check for Absorption or Reflection (requires saved action, not for vehicles)
    if (!defIsVeh && rec && rec.defCharId && rec.protKey) {
      const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
      if (absRef) {
        if (absRef.mode === "absorption") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#9b59b6; font-weight:bold;">🔮 Absorption available${limitNote}</span>`;
          buttons += ` [Absorb (¼ dmg, saved action)](!mp absorb --id ${rollId})`;
        } else if (absRef.mode === "reflection") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#e67e22; font-weight:bold;">🔄 Reflection available${limitNote}</span>`;
          buttons += ` [Reflect (¼ dmg, saved action)](!mp reflect --id ${rollId})`;
        }
      }
    }
    
    // Add limb shot saves if applicable (crit OR deliberate called shot) - not for vehicles
    if (!defIsVeh) {
      if (critType === CRIT_TYPES.LEG_SHOT || isLegShot) {
        buttons += `<br/>[Leg Shot Saves](!mp limbsave --id ${rollId} --limb leg)`;
      } else if (critType === CRIT_TYPES.ARM_SHOT || isArmShot) {
        buttons += `<br/>[Arm Shot Saves](!mp limbsave --id ${rollId} --limb arm)`;
      } else if (critType === CRIT_TYPES.MUSCLE_STRAIN_TARGET) {
        buttons += `<br/><i>(+1 Hit to target's torso)</i>`;
      }
    }
    
    // Gear shot info
    if (isGearShot) {
      buttons += `<br/><i>(Compare damage to Gear breakpoint)</i>`;
    }
    
    return buttons;
  }

  function buildSaveAttackButtons(rollId, critResult, pushAmount, noDamage) {
    const critType = critResult ? critResult.type : null;
    let critMod = 0;
    
    // Solid Hit gives -3 to save TN for save attacks
    if (critType === CRIT_TYPES.SOLID_HIT) {
      critMod = -3;
    }
    
    // Push penalty passed separately so it displays correctly
    const pushMod = pushAmount > 0 ? -pushAmount : 0;
    const totalMod = critMod + pushMod;
    
    let modLabel = "";
    if (totalMod !== 0) {
      modLabel = ` (${totalMod > 0 ? '+' : ''}${totalMod})`;
    }
    
    // Check if defender is a vehicle (no roll-with)
    const saveRec = state.MP_Engine.pending[rollId];
    const saveDefIsVeh = saveRec && saveRec.defCharId && isVehicleMode(saveRec.defCharId);
    
    let buttons = `[Make Save${modLabel}](!mp save --id ${rollId} --critmod ${critMod} --pushmod ${pushMod}) `;
    if (!saveDefIsVeh) {
      buttons += `[Save + Roll-With${modLabel}](!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod ${critMod} --pushmod ${pushMod})`;
    }
    
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

    // Undo: snapshot target state before any mutation (damage, markers, conditions).
    const undoSnap = snapshotToken(rec.defTokenId);

    const defIsVehicle = isVehicleMode(defChar.id);

    // Base raw damage
    let raw = num(rec.damageTotal, 0);
    
    // Add +3 for Solid Hit on standard attacks
    if (mode.includes("solid")) {
      raw += 3;
    }
    
    const protKey = rec.protKey;
    const damageType = rec.dmgTypeStr || "Kinetic";
    
    // Get armor protection (normal rows - NOT Force Field)
    const protData = defIsVehicle
      ? getVehicleProtection(defChar.id, protKey)
      : sumProtectionWithHardened(defChar.id, protKey, rec.dmgSubtype);
    let armorProt = protData.prot;
    let armorHardened = protData.hardened;
    const hasInvuln = protData.invuln;
    const hasAdapt = protData.adapt;
    
    // Avoid Armor crits bypass protection entirely
    const bypassProt = mode.includes("noprot");
    
    // ---- STEP 1: FORCE FIELD (applied first, before armor) ----
    // Vehicle mode: skip character's FF (vehicle protection is self-contained)
    const ffData = defIsVehicle ? null : getForceFieldData(defChar.id, rec.defTokenId);
    let ffActive = false;
    let ffProt = 0;
    let ffDeflected = 0;
    let ffCollapsed = false;
    let ffOverflow = 0;
    let ffGasBlocked = false;
    let ffGravityBypassed = false;
    let afterFF = raw;  // Damage after FF, before armor
    
    if (ffData && !bypassProt) {
      const atkSub = (rec.dmgSubtype || "").trim().toLowerCase();
      
      // Gravity attacks bypass FF entirely
      if (atkSub === "gravity" || damageType === "Gravity") {
        ffGravityBypassed = true;
      }
      // Gas attacks are completely blocked (no damage, no deflection cost)
      else if (atkSub === "gas") {
        ffGasBlocked = true;
      } else {
        ffActive = true;
        ffProt = ffData.protValues[protKey] || 0;
        
        // FF protection subtracts from raw damage
        const ffBlocked = Math.min(raw, ffProt);  // How much FF would block
        
        // Check deflection pool capacity
        const newAccum = ffData.accum + ffBlocked;
        
        if (newAccum > ffData.threshold) {
          // Field collapses! Only deflect up to remaining capacity
          ffCollapsed = true;
          const canDeflect = Math.max(0, ffData.threshold - ffData.accum);
          ffDeflected = canDeflect;
          ffOverflow = ffBlocked - canDeflect;
          // Damage after FF: raw minus what FF actually blocked
          afterFF = raw - canDeflect;
          
          setFFAccum(defChar.id, ffData.rowId, ffData.threshold);
          deactivateFF(defChar.id, ffData.rowId, defTok);
        } else {
          // Field holds
          ffDeflected = ffBlocked;
          afterFF = raw - ffBlocked;
          setFFAccum(defChar.id, ffData.rowId, newAccum);
          const remaining = Math.max(0, ffData.threshold - newAccum);
          updateFFAura(defTok, ffData.threshold > 0 ? remaining / ffData.threshold : 0);
        }
      }
    }
    
    // Handle Gas complete block by FF
    if (ffGasBlocked) {
      let html = `<div style="background:#16213e; border:2px solid #3498db; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      html += `<div style="font-weight:bold; font-size:15px; color:#3498db; margin-bottom:6px;">🛡️ ${esc(ffData.name)} - GAS BLOCKED</div>`;
      html += `<div style="color:#ccc;">Gas attack completely blocked by Force Field.</div>`;
      html += `<div style="color:#888; font-size:11px; margin-top:4px;">No damage, no deflection cost.</div>`;
      html += `</div>`;
      chToChar("MP", html, rec.defCharId);
      delete state.MP_Engine.pending[rollId];
      return;
    }
    
    // ---- STEP 2: ARMOR (applied to damage that got through FF) ----
    const isOtherType = (damageType === "Other");
    
    // Get attack's Armor Piercing (AP applies to armor, not FF)
    const rawAP = rec.atkAP;
    
    // Calculate effective AP after Hardened reduces it
    let effectiveAP = 0;
    let apUsedVsHardened = 0;
    if (rawAP === Infinity) {
      effectiveAP = Infinity;
    } else if (rawAP > 0) {
      apUsedVsHardened = Math.min(rawAP, armorHardened);
      effectiveAP = Math.max(0, rawAP - armorHardened);
    }
    
    // Calculate effective armor protection after AP
    let effectiveProt = armorProt;
    let apUsedVsProt = 0;
    if (bypassProt) {
      effectiveProt = 0;
    } else if (effectiveAP === Infinity) {
      effectiveProt = 0;
      apUsedVsProt = armorProt;
    } else if (effectiveAP > 0) {
      apUsedVsProt = Math.min(effectiveAP, armorProt);
      effectiveProt = Math.max(0, armorProt - effectiveAP);
    }
    
    // Calculate leftover AP (AP that exceeded armor protection)
    let leftoverAP = 0;
    if (effectiveAP === Infinity) {
      leftoverAP = Infinity;
    } else if (effectiveAP > armorProt) {
      leftoverAP = effectiveAP - armorProt;
    }

    // Vulnerability (opt-in via repeating abilities notes)
    const vuln = getVulnerabilityMods(defChar.id, damageType);
    if (vuln.protMod) effectiveProt = Math.max(0, effectiveProt + vuln.protMod);
    
    // Apply armor to damage after FF
    let afterArmor = Math.max(0, afterFF - effectiveProt);
    
    // ---- STEP 3: INVULNERABILITY / ADAPTATION (applied to remainder) ----
    let penetrating = afterArmor;
    let invulnReduction = 0;
    let afterInvuln = afterArmor;
    if (hasInvuln && afterArmor > 0) {
      if (leftoverAP === Infinity) {
        penetrating = afterArmor;
        afterInvuln = afterArmor;
      } else if (leftoverAP >= afterArmor) {
        penetrating = afterArmor;
        afterInvuln = afterArmor;
      } else {
        const bypassedDmg = leftoverAP;
        const reducedDmg = afterArmor - leftoverAP;
        afterInvuln = Math.floor(reducedDmg / 4);
        penetrating = bypassedDmg + afterInvuln;
        invulnReduction = reducedDmg - afterInvuln;
      }
    }
    
    let adaptReduction = 0;
    if (hasAdapt && penetrating > 0) {
      if (isOtherType) {
        adaptReduction = penetrating;
        penetrating = 0;
      } else if (leftoverAP === Infinity) {
        // penetrating unchanged
      } else {
        const leftoverAfterInvuln = Math.max(0, leftoverAP - (hasInvuln ? (afterArmor - leftoverAP) : 0));
        if (leftoverAfterInvuln >= penetrating) {
          // penetrating unchanged
        } else {
          const bypassedDmg = leftoverAfterInvuln;
          const reducedDmg = penetrating - leftoverAfterInvuln;
          const afterAdapt = Math.floor(reducedDmg / 2);
          penetrating = bypassedDmg + afterAdapt;
          adaptReduction = reducedDmg - afterAdapt;
        }
      }
    }
    
    // Add vulnerability damage bonus
    if (vuln.dmgMod) penetrating += vuln.dmgMod;

    // Current resources
    const hits0 = defIsVehicle ? getVehicleHits(defTok, defChar.id) : getResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = defIsVehicle ? getVehiclePower(defTok, defChar.id) : getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);

    // Roll-with capacity (vehicles cannot roll-with)
    let maxDivert = 0;
    if (!defIsVehicle) {
      maxDivert = Math.floor(pow0 / 10);
      const hasFortitude = (num(getAttr(defChar.id, "willpower_fortitude"), 0) === 1);
      if (hasFortitude) maxDivert = maxDivert * 2;
      if (mode.includes("precise")) maxDivert = Math.floor(maxDivert / 2);
    }

    let divert = 0;
    if (!defIsVehicle) {
      if (mode.includes("rwmax") || mode === "rollwithmax") {
        divert = Math.min(maxDivert, penetrating);
      } else if (mode.includes("rw") || mode === "rollwithcustom") {
        const want = num(args.amt, 0);
        divert = Math.min(maxDivert, penetrating, Math.max(0, want));
      }
    }

    // Damage to Hits after roll-with
    let toHits = Math.max(0, penetrating - divert);
    
    // Store pre-doubled value for knockback (MP 4.14.2.1: KB is NOT doubled on head shots)
    const hitsForKB = toHits;
    
    // Head Shot: DOUBLE Hits after protection and roll-with (not applicable to vehicles)
    const isHeadShot = mode.includes("headshot");
    const hasProtectedBrain = defIsVehicle ? false : (num(getAttr(defChar.id, "willpower_protected_brain"), 0) === 1);
    if (isHeadShot && !hasProtectedBrain && !defIsVehicle) {
      toHits = toHits * 2;
    }

    // Apply to Hits; overflow spills to Power for characters (4.8.4)
    // Vehicles: damage to Hits only, no overflow to Power
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = defIsVehicle ? 0 : Math.max(0, toHits - hits0);

    // Power reduction: diverted amount + overflow (vehicles: no change)
    const pow1 = defIsVehicle ? pow0 : Math.max(0, pow0 - divert - overflow);
    const hits1 = hitsAfterDmg;

    if (defIsVehicle) {
      setVehicleHits(defTok, defChar.id, hits1);
      // Vehicle Power not affected by incoming damage
    } else {
      setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }

    // Status checks
    // Vehicles: incapacitated at 0 Hits, no unconsciousness. Below 0 = explosion.
    // Characters: unconscious if > half hits in one blow, incapacitated at 0.
    const hasPainResistance = defIsVehicle ? true : (num(getAttr(defChar.id, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !defIsVehicle && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);
    const vehicleBelowZero = defIsVehicle && (hits0 - toHits) < 0;

    let statusLine = "";
    if (incapacitated) {
      if (defIsVehicle) {
        statusLine = `<div style="color:#ff6b6b; font-weight:bold; margin-top:4px;">VEHICLE INCAPACITATED!</div>`;
        if (vehicleBelowZero) {
          const vehName = getAttr(defChar.id, "vehicle_name") || "Vehicle";
          statusLine += `<div style="color:#ff5555; font-weight:bold;">⚠ EXPLOSION CHECK — Hits below 0!</div>`;
        }
      } else {
        statusLine = `<div style="color:#ff6b6b; font-weight:bold; margin-top:4px;">INCAPACITATED!</div>`;
      }
      defTok.set("status_dead", true);
    } else if (unconscious) {
      statusLine = `<div style="color:#e67e22; font-weight:bold; margin-top:4px;">UNCONSCIOUS!</div>`;
      defTok.set("status_sleepy", true);
    }

    let effectNotes = "";
    if (isHeadShot && !hasProtectedBrain && !defIsVehicle) {
      effectNotes = ` <span style="color:#ff6b6b;">[HEAD SHOT x2]</span>`;
    } else if (isHeadShot && hasProtectedBrain) {
      effectNotes = ` <span style="color:#8be9fd; font-weight:bold;">[HEAD SHOT NEGATED - Protected Brain]</span>`;
    }
    if (mode.includes("solid")) {
      effectNotes += ` <span style="color:#e67e22;">[+3 Solid Hit]</span>`;
    }
    if (mode.includes("precise") && !defIsVehicle) {
      effectNotes += ` <span style="color:#8be9fd;">[½ Roll-With]</span>`;
    }
    if (mode.includes("noprot")) {
      effectNotes += ` <span style="color:#ff79c6;">[No Protection]</span>`;
    }

    // Build hover tooltip for protection breakdown
    let protHover = `Protection vs ${protKey}`;
    if (ffActive && ffDeflected > 0) {
      protHover += `&#10;Force Field: ${ffProt} (deflected ${ffDeflected})`;
      if (ffCollapsed) protHover += ` [COLLAPSED, overflow ${ffOverflow}]`;
    }
    protHover += `&#10;Armor: ${Math.floor(armorProt)}`;
    if (rawAP > 0 || armorHardened > 0) {
      if (rawAP > 0) {
        protHover += `&#10;AP: ${rawAP === Infinity ? 'ALL' : rawAP}`;
        if (armorHardened > 0) {
          protHover += `&#10;Hardened: ${armorHardened} (negates ${apUsedVsHardened} AP)`;
          protHover += `&#10;Effective AP: ${effectiveAP === Infinity ? 'ALL' : effectiveAP}`;
        }
        if (apUsedVsProt > 0) protHover += `&#10;AP vs Armor: -${apUsedVsProt}`;
      }
      protHover += `&#10;Effective Armor: ${Math.floor(effectiveProt)}`;
    }
    if (hasInvuln) {
      protHover += `&#10;Invulnerability: 1/4 dmg vs ${damageType}`;
      if (leftoverAP > 0) {
        protHover += `&#10;Leftover AP: ${leftoverAP === Infinity ? 'ALL' : leftoverAP} (bypasses Invuln)`;
      }
      if (invulnReduction > 0) {
        protHover += `&#10;Invuln reduced: ${afterArmor - leftoverAP} → ${Math.floor((afterArmor - leftoverAP) / 4)}`;
      }
    }
    if (hasAdapt) {
      if (isOtherType) {
        protHover += `&#10;Adaptation: IMMUNE to ${damageType}`;
      } else {
        protHover += `&#10;Adaptation: 1/2 dmg vs ${damageType}`;
      }
      if (adaptReduction > 0) {
        protHover += `&#10;Adapt reduced: ${adaptReduction}`;
      }
    }

    // Invulnerability indicator
    let invulnIndicator = "";
    if (hasInvuln && invulnReduction > 0) {
      invulnIndicator = ` <span style="color:#e67e22;" title="Invulnerability: 1/4 damage">[×¼]</span>`;
    } else if (hasInvuln && leftoverAP > 0) {
      invulnIndicator = ` <span style="color:#ff6b6b;" title="AP bypassed Invulnerability">[Invuln bypassed]</span>`;
    }
    
    // Adaptation indicator
    let adaptIndicator = "";
    if (hasAdapt && isOtherType) {
      adaptIndicator = ` <span style="color:#1abc9c;" title="Adaptation: 100% Immunity to Other">[IMMUNE]</span>`;
    } else if (hasAdapt && adaptReduction > 0) {
      adaptIndicator = ` <span style="color:#1abc9c;" title="Adaptation: 1/2 damage">[×½]</span>`;
    } else if (hasAdapt && leftoverAP > 0) {
      adaptIndicator = ` <span style="color:#16a085;" title="AP bypassed Adaptation">[Adapt bypassed]</span>`;
    }
    
    // AP indicator
    let apIndicator = "";
    if (rawAP > 0 && !bypassProt) {
      if (rawAP === Infinity) {
        apIndicator = ` <span style="color:#bd93f9;" title="Armor Piercing: ALL">[AP:∞]</span>`;
      } else if (effectiveAP > 0) {
        apIndicator = ` <span style="color:#bd93f9;" title="Effective AP after Hardened">[AP:${effectiveAP}]</span>`;
      } else if (armorHardened >= rawAP) {
        apIndicator = ` <span style="color:#27ae60;" title="Hardened negated all AP">[Hrd blocked AP]</span>`;
      }
    }

    // Force Field indicator
    let ffIndicator = "";
    let ffLine = "";
    if (ffActive && ffData) {
      if (ffCollapsed) {
        ffIndicator = ` <span style="color:#e74c3c; font-weight:bold;" title="Force Field collapsed! Deflected ${ffDeflected}, overflow ${ffOverflow}">[FF DOWN]</span>`;
        ffLine = `<div style="color:#e74c3c; font-weight:bold; margin-top:2px; font-size:12px;">` +
          `🛡️ ${esc(ffData.name)} COLLAPSED! Deflected ${ffDeflected}, overflow ${ffOverflow} passes through` +
          `<br/><span style="font-weight:normal; color:#ccc;">Pool: ${ffData.accum}+${ffDeflected}=${ffData.accum + ffDeflected} / ${ffData.threshold}</span>` +
          `<br/>[Reinforce (saved action, PR=${ffData.pr})](!mp ffreinforce --id ${rollId})` +
          ` [Renew Later (PR=${ffData.pr})](!mp ffreset --target ${rec.defTokenId} --row ${ffData.rowId})` +
          `</div>`;
      } else if (ffDeflected > 0) {
        const newAccum = ffData.accum + ffDeflected;
        const remaining = Math.max(0, ffData.threshold - newAccum);
        ffIndicator = ` <span style="color:#3498db;" title="Force Field deflected ${ffDeflected}, pool ${newAccum}/${ffData.threshold}">[FF:${remaining}/${ffData.threshold}]</span>`;
        ffLine = `<div style="color:#3498db; font-size:11px; margin-top:2px;">` +
          `🛡️ ${esc(ffData.name)}: deflected ${ffDeflected} (pool ${newAccum}/${ffData.threshold}, ${remaining} left)</div>`;
      }
    } else if (ffGravityBypassed && ffData) {
      ffIndicator = ` <span style="color:#e67e22;" title="Gravity bypasses Force Field">[FF:no vs Gravity]</span>`;
    }

    // Build damage line for chat card
    // Format: raw [- FF = afterFF] - armor [invuln] [adapt] = pen
    let dmgLine = `<span title="Raw damage">${raw}</span>`;
    
    if (ffActive && ffDeflected > 0) {
      dmgLine += ` - <span style="color:#3498db;" title="Force Field: ${ffProt}">${ffDeflected} FF</span>`;
      dmgLine += ` = ${afterFF}`;
    }
    
    if (effectiveProt > 0 || bypassProt) {
      dmgLine += ` - <span title="${protHover}">${Math.floor(effectiveProt)}</span> armor${apIndicator}`;
    }
    
    if (hasInvuln && invulnReduction > 0) {
      dmgLine += ` = ${afterArmor}${invulnIndicator}`;
    } else if (hasInvuln && leftoverAP > 0) {
      dmgLine += `${invulnIndicator}`;
    }
    
    if (hasAdapt) {
      dmgLine += `${adaptIndicator}`;
    }
    
    dmgLine += ` = <span style="color:#ff6b6b; font-weight:bold;" title="Penetrating damage${(vuln && vuln.notes && vuln.notes.length) ? ('&#10;' + vuln.notes.join('&#10;')) : ''}">${penetrating} pen</span>`;
    if (vuln && vuln.notes && vuln.notes.length) {
      dmgLine += ` <span title="${vuln.notes.join('&#10;')}" style="color:#e67e22;">[vuln]</span>`;
    }

    // --- Durational attack (MP Modifiers, "Duration"): hit applies an ongoing effect ---
    if (rec.hasDuration) {
      statusLine += applyDurationEffect(rec, defTok);
    }

    // --- Full result card (GM + defender): includes Hits/Power stats ---
    const msgLine =
      `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">` +
      `<div style="font-weight:bold; font-size:15px; color:#fff; margin-bottom:6px;">${esc(rec.defName)}${effectNotes}</div>` +
      `<div style="color:#ccc; margin-bottom:4px; font-size:13px;">${dmgLine}</div>` +
      ffLine +
      (divert > 0 ? `<div style="color:#ccc; margin-bottom:6px; font-size:13px;">RW <span title="Roll-with (max ${maxDivert})">${divert}</span>` +
        (isHeadShot ? ` → ${penetrating - divert} x2` : "") +
        ` → <b style="color:#ff6b6b;">${toHits}</b> to Hits` +
        (overflow > 0 ? ` <span style="color:#e67e22;" title="Overflow to Power">(+${overflow} ovf)</span>` : "") +
        `</div>` :
        `<div style="color:#ccc; margin-bottom:6px; font-size:13px;">` +
        (isHeadShot ? `${penetrating} x2 = ` : "") +
        `<b style="color:#ff6b6b;">${toHits}</b> to Hits` +
        (overflow > 0 ? ` <span style="color:#e67e22;" title="Overflow to Power">(+${overflow} ovf)</span>` : "") +
        `</div>`) +
      `<table style="border-collapse:collapse; margin-top:2px;"><tr>` +
      `<td style="padding-right:20px;">` +
      `<div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#889; margin-bottom:2px;">Hits</div>` +
      `<span style="font-size:16px;"><span style="color:#999; text-decoration:line-through;">${hits0}</span> <span style="color:#667;">→</span> <b style="color:#ff6b6b;">${hits1}</b></span></td>` +
      `<td>` +
      `<div style="font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#889; margin-bottom:2px;">Power</div>` +
      `<span style="font-size:16px;"><span style="color:#999; text-decoration:line-through;">${pow0}</span> <span style="color:#667;">→</span> <b style="color:#ff6b6b;">${pow1}</b></span></td>` +
      `</tr></table>` +
      statusLine +
      (rec.condIdx !== undefined ? `<br/>[Try Again](!mp recover --target ${rec.defTokenId} --idx ${rec.condIdx})` : "") +
      `</div>`;

    // Undo: register the pre-mutation snapshot and append a button to the card.
    const applyUndoId = "apply_" + rollId + "_" + randomInteger(999999);
    registerUndo(applyUndoId, esc(rec.defName) + " — " + esc(rec.atkName || "attack") + " damage", [undoSnap], null);

    // Damage result to GM + defender only (attacker doesn't see target stats)
    chToChar("MP", msgLine + undoButton(applyUndoId), rec.defCharId);
    
    // Store hits taken for limb shot saves (uses actual damage including head shot doubling)
    state.MP_Engine.pending[rollId].hitsTaken = toHits;
    // Store pre-doubled hits for knockback (MP 4.14.2.1: KB is NOT doubled on head shots)
    state.MP_Engine.pending[rollId].hitsForKB = hitsForKB;
    // Store FF overflow for reinforce command
    if (ffCollapsed && ffOverflow > 0) {
      state.MP_Engine.pending[rollId].ffOverflow = ffOverflow;
    }
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
    msg_out += enPass ? `<span style="color:#27ae60;">SAVED</span>` : `<span style="color:#e94560;">FAILED - ${loseEffect.toUpperCase()}</span>`;
    
    msg_out += `<br/><br/><b>AG Save</b> (or ${secondEffect}):<br/>`;
    msg_out += `TN: ${agSave}-${hitsTaken} = <b>${agTN}-</b> | Roll: <b>${agRoll}</b> → `;
    msg_out += agPass ? `<span style="color:#27ae60;">SAVED</span>` : `<span style="color:#e94560;">FAILED - ${secondEffect.toUpperCase()}</span>`;
    
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
      defTok.set("status_back-pain", true);
    }

    chCombat("MP", msg_out, rec.defCharId, rec.atkCharId);
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

    const kbDefIsVeh = isVehicleMode(defChar.id);
    const massExpr = kbDefIsVeh
      ? (getAttr(defChar.id, "vehicle_mass") || getAttr(defChar.id, "vehicle_mass_roll") || "1d4")
      : (getAttr(defChar.id, "mass") || "1d4");
    const massRoll = rollExpr(massExpr);

    // Use hitsForKB (non-doubled for head shots per MP 4.14.2.1), fallback to hitsTaken
    const hitsForKB = rec.hitsForKB !== undefined ? rec.hitsForKB : (rec.hitsTaken || 0);

    const kb = Math.max(0, hitsForKB - massRoll);

    let msg_out = `<b>Knockback vs ${esc(rec.defName)}</b><br/>` +
      `Hits for KB: <b>${hitsForKB}</b> - Mass(${esc(massExpr)}): <b>${massRoll}</b> = <b>${kb}"</b> KB`;

    if (kb > 0) {
      msg_out += `<br/><i>Target pushed ${kb}" away from attacker. AG save at -${kb} or fall prone.</i>`;
      msg_out += `<br/>[AG Save vs Knockdown](!mp kbsave --target ${rec.defTokenId} --penalty ${kb})`;
    }

    chCombat("MP", msg_out, rec.defCharId, rec.atkCharId);
  }

  function cmdKBSave(msg, args) {
    const tokId = args.target;
    const penalty = num(args.penalty, 0);

    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    const kbsIsVeh = isVehicleMode(char.id);
    const agSave = kbsIsVeh
      ? getAttrNum(char.id, "vehicle_ag_save", 10)
      : getAttrNum(char.id, "agility_save", 10);
    const tn = Math.max(1, agSave - penalty);
    const roll = randomInteger(20);
    const pass = (roll !== 20) && (roll <= tn);

    const msg_out = `<b>Knockdown Save</b> (${esc(char.get("name"))})<br/>` +
      `AG Save: <b>${agSave}</b> - ${penalty} = TN <b>${tn}-</b><br/>` +
      `Roll: <b>${roll}</b> → <b>${pass ? "STAYS UP" : "PRONE!"}</b>`;

    if (!pass) {
      tok.set("status_back-pain", true);
    }

    chCombat("MP", msg_out, char.id);
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

    // Undo: snapshot target state before the save resolves (power, markers, conditions).
    const undoSnap = snapshotToken(rec.defTokenId);

    const saveAttr = bcToSaveAttr(rec.saveBC);
    if (!saveAttr) {
      return ch("MP", `/w gm <b>MP:</b> Save BC "${rec.saveBC || "(not set)"}" not valid. Set the Save BC field (EN/AG/IN/CL) on the attack.`);
    }

    const saveDefIsVeh = isVehicleMode(defChar.id);

    // For vehicles, use vehicle EN save attr if save BC is EN
    const baseSave = saveDefIsVeh
      ? getAttrNum(defChar.id, "vehicle_" + saveAttr, 10)
      : getAttrNum(defChar.id, saveAttr, 10);

    // Protection adds to save (makes it easier) per 4.9
    // EXCEPTION: Damaging Poison - protection only applies to damage, NOT to save TN
    // Also check for invulnerability (+8 bonus) and adaptation (+5 bonus)
    const protData = saveDefIsVeh
      ? getVehicleProtection(defChar.id, rec.protKey)
      : sumProtectionWithHardened(defChar.id, rec.protKey, rec.dmgSubtype);
    const prot = protData.prot;
    const invulnBonus = protData.invuln ? 8 : 0;
    const adaptBonus = protData.adapt ? 5 : 0;
    
    // Determine if this is Damaging Poison (protection applies to damage only, not save)
    // Check early so we know whether to apply protection to save TN
    const atkNameLower = String(rec.atkName || "").toLowerCase();
    const hasPoisonInName = atkNameLower.includes("poison") || atkNameLower.includes("venom");
    const rawCondDamage = rec.saveDamage || rec.damageTotal || 0;
    const isDamagingPoison = hasPoisonInName && rawCondDamage > 0 && !atkNameLower.includes("paralytic");
    
    // For Damaging Poison: protection does NOT apply to save TN
    // For Paralytic Poison/other saves: protection DOES apply to save TN
    const protForSave = isDamagingPoison ? 0 : Math.floor(prot);
    const invulnForSave = isDamagingPoison ? 0 : invulnBonus;
    const adaptForSave = isDamagingPoison ? 0 : adaptBonus;

    // Roll-with for saves: spend Power to add to save TN (4.8.3.1)
    // Cost is 1 Power per +1 bonus to save TN
    // Vehicles cannot roll-with
    const rwPowerRequested = saveDefIsVeh ? 0 : Math.max(0, num(args.rollwith, 0));
    const pow0 = saveDefIsVeh ? getVehiclePower(defTok, defChar.id) : getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const maxBonus = saveDefIsVeh ? 0 : Math.floor(pow0 / 10);
    const rwPaid = Math.min(rwPowerRequested, maxBonus);
    const rwCost = rwPaid;
    const pow1 = pow0 - rwCost;
    if (saveDefIsVeh) {
      // No power cost for vehicles (they can't roll-with)
    } else {
      setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }

    // Critical mod (Solid Hit = -3 to save TN for save attacks)
    const critMod = num(args.critmod, 0);
    
    // Push mod (makes save harder)
    const pushMod = num(args.pushmod, 0);

    // Vulnerability: for save attacks, "Vulnerable to <Type>" applies as a penalty to the save TN vs that damage type.
    // We reuse getVulnerabilityMods() which encodes vulnerability as +N damage taken; for saves we apply -N.
    const vulnData = (!rec.noDamageType && rec.dmgTypeStr) ? getVulnerabilityMods(defChar.id, rec.dmgTypeStr) : { protMod: 0, dmgMod: 0, notes: [] };
    const vulnSaveMod = (vulnData && vulnData.dmgMod) ? -Math.abs(num(vulnData.dmgMod, 0)) : 0;


    // Initial save TN = base + init mod + protection (if not damaging poison) + invuln + adapt + roll-with + crit mod + push mod + vulnerability
    const tn = baseSave + num(rec.saveMod, 0) + protForSave + invulnForSave + adaptForSave + rwPaid + critMod + pushMod + vulnSaveMod;

    const d20 = randomInteger(20);
    const isFumble = (d20 === CFG.FUMBLE_FAIL_NAT);
    const pass = !isFumble && (d20 <= tn);

    // Recovery TN per 4.9: "same target number as their initial save but with an additional difficulty modifier"
    // Base + saveMod + recMod + protection + invuln + adapt + vulnerability (no roll-with/crit/push - those were for initial only)
    const recTN = baseSave + num(rec.saveMod, 0) + num(rec.recMod, 0) + protForSave + invulnForSave + adaptForSave + vulnSaveMod;
    const recTime = rec.recTime || "1 round";

    let statusLine = "";
    let conditionApplied = false;
    let damageButtons = "";  // For Damaging Poison immediate damage
    
    if (!pass) {
      // Determine condition type and marker
      // We already calculated isDamagingPoison and rawCondDamage above
      const condType = isDamagingPoison ? "damaging_poison" : inferConditionType(rec.atkName, rec.saveBC, rec.dmgTypeStr, rawCondDamage);
      const marker = CONDITION_MARKERS[condType] || CONDITION_MARKERS.generic;
      
      // Check for fumble = permanent effect (Flash)
      const isPermanent = isFumble && atkNameLower.includes("flash");
      
      // For Damaging Poison, use the damage value
      const hasDamage = conditionDealsDamage(condType);
      const condDamage = hasDamage ? rawCondDamage : 0;
      
      // Create condition record
      const condition = {
        type: condType,
        sourceAtk: rec.atkName,
        atkCharId: rec.atkCharId,
        saveBC: rec.saveBC,
        saveTN: tn,
        recTN: recTN,
        recTime: recTime,
        startRound: state.MP_Engine.currentRound,
        marker: marker,
        created: Date.now(),
        permanent: isPermanent,
        effectDesc: getConditionDesc(condType, rec.atkName),
        // For damaging conditions (Damaging Poison)
        damage: condDamage,
        dmgType: hasDamage ? rec.dmgTypeStr : null,
        protKey: hasDamage ? rec.protKey : null
      };
      
      // Add to conditions tracking. Refresh a same-type condition in place instead of
      // stacking a duplicate, so re-applying the same effect doesn't create multiple
      // recovery prompts for one target.
      if (!state.MP_Engine.conditions[rec.defTokenId]) {
        state.MP_Engine.conditions[rec.defTokenId] = [];
      }
      const condList = state.MP_Engine.conditions[rec.defTokenId];
      let condIdx = condList.findIndex(c => c.type === condType);
      if (condIdx >= 0) {
        condList[condIdx] = condition;
      } else {
        condList.push(condition);
        condIdx = condList.length - 1;
      }
      conditionApplied = true;
      
      // Apply status marker
      log(`MP Save: Creating condition type="${condType}", marker="${marker}"`);
      defTok.set("status_" + marker, true);
      
      // Build status line
      const condLabel = condType.replace(/_/g, " ").toUpperCase();
      statusLine = `<br/><span style="color:#e94560; font-weight:bold;">⚠️ ${condLabel}!</span>`;
      
      // For Damaging Poison: apply damage immediately on failed save
      // Protection applies to DAMAGE (not save TN) for damaging poison
      if (hasDamage && condDamage > 0) {
        // Use full protection value (already calculated above)
        const dmgProt = Math.floor(prot);
        const penetrating = Math.max(0, condDamage - dmgProt);
        
        if (penetrating > 0) {
          // Create a pending record for Roll-With on this damage
          // NOTE: Don't set protKey - protection already applied above
          const poisonRollId = String(Date.now()) + "_poison_" + randomInteger(999999);
          state.MP_Engine.pending[poisonRollId] = {
            rollId: poisonRollId,
            defTokenId: rec.defTokenId,
            defCharId: defChar.id,
            defName: rec.defName,
            damageTotal: penetrating,
            dmgTypeStr: rec.dmgTypeStr || "Biochemical",
            protKey: null,  // Protection already applied
            atkName: rec.atkName + " (Poison)",
            condIdx: condIdx,  // For retry button
            created: Date.now()
          };
          
          statusLine += `<br/><span style="color:#e94560;">Takes <b>${penetrating}</b> ${rec.dmgTypeStr || "Biochemical"} damage!</span>`;
          statusLine += ` (${condDamage} raw - ${dmgProt} prot)`;
          damageButtons = `<br/>[Take Full Damage](!mp apply --id ${poisonRollId} --mode straight) `;
          damageButtons += `[Roll-With Max](!mp apply --id ${poisonRollId} --mode rollwithmax) `;
          damageButtons += `[Roll-With Custom](!mp apply --id ${poisonRollId} --mode rollwithcustom --amt ?{Power to divert|0})`;
        } else {
          statusLine += `<br/><span style="font-size:11px;">Poison damage blocked by ${dmgProt} ${rec.dmgTypeStr || "Biochemical"} protection</span>`;
        }
        statusLine += `<br/><span style="font-size:11px;">Takes <b>${condDamage}</b> ${rec.dmgTypeStr} dmg each failed recovery</span>`;
      }
      
      statusLine += `<br/><span style="font-size:11px;">Rec Save: ${rec.saveBC} at <b>${recTN}-</b> every <b>${recTime}</b>${rec.hasDuration ? ` <span style="color:#f4d03f;">(Duration)</span>` : ""}</span>`;
      
      if (isPermanent) {
        statusLine += `<br/><span style="color:#ff0000; font-weight:bold;">💀 FUMBLE - Effect is PERMANENT!</span>`;
      } else if (!damageButtons) {
        // Only show Recovery Roll button if no damage buttons (damage buttons include Try Again after applied)
        statusLine += `<br/>[Recovery Roll](!mp recover --target ${rec.defTokenId} --idx ${condIdx})`;
      }
    }

    let msg_out =
      `<b>Save Attack</b> (${esc(rec.saveBC)}) vs <b>${esc(rec.defName)}</b><br/>` +
      `Base: <b>${baseSave}</b> | Init: <b>${rec.saveMod}</b>` +
      // Show protection: for damaging poison it doesn't apply to save, for others it does
      (isDamagingPoison 
        ? (prot > 0 ? ` | <span style="color:#888;" title="Damaging Poison: prot applies to damage, not save">Prot: n/a</span>` : "")
        : (rec.protKey ? ` | Prot: <b>+${protForSave}</b>` : "")) +
      (invulnForSave > 0 ? ` | <span style="color:#d35400;">Invuln: <b>+${invulnForSave}</b></span>` : "") +
      (adaptForSave > 0 ? ` | <span style="color:#1abc9c;">Adapt: <b>+${adaptForSave}</b></span>` : "") +
      (rwPaid > 0 ? ` | RW: <b>+${rwPaid}</b>` : "") +
      (critMod !== 0 ? ` | Crit: <b>${critMod}</b>` : "") +
      (pushMod !== 0 ? ` | <span style="color:#f39c12;">Push: <b>${pushMod}</b></span>` : "") +
      (vulnSaveMod !== 0 ? ` | <span style="color:#e63946;">Vuln: <b>${vulnSaveMod}</b></span>` : "") +
      `<br/>Init Save TN: <b>${tn}-</b> | Roll: <b>${d20}</b>${isFumble ? " (FUMBLE)" : ""} → <b style="color:${pass ? '#27ae60' : '#e94560'}">${pass ? "SAVED" : "FAILED"}</b>` +
      (rwPaid > 0 ? `<br/>Power: ${pow0} → ${pow1}` : "") +
      statusLine +
      damageButtons;

    // Undo: register pre-save snapshot and append a button.
    const saveUndoId = "save_" + rollId + "_" + randomInteger(999999);
    registerUndo(saveUndoId, esc(rec.defName) + " — " + esc(rec.atkName || "save") + " save", [undoSnap], null);
    msg_out += undoButton(saveUndoId);

    chCombat("MP", msg_out, rec.defCharId, rec.atkCharId);
  }
  
  // Get human-readable condition description
  function getConditionDesc(condType, atkName) {
    switch (condType) {
      case "paralyzed": return "Paralyzed - immobile, cannot act";
      case "mind_control": return "Mind Controlled - must obey commands";
      case "emotion_control": return "Emotion Controlled - strong imposed emotion";
      case "dazzled": return "Dazzled - vision impaired (-2 levels)";
      case "blinded": return "Blinded - cannot see";
      case "transmuted": return "Transmuted - form altered";
      case "poisoned": return "Poisoned - paralytic effect";
      case "damaging_poison": return "Damaging Poison/Venom - takes damage each failed save";
      case "feared": return "Feared - strong fear imposed";
      default: return `Affected by ${atkName}`;
    }
  }

  function cmdRecover(msg, args) {
    const tokId = args.target;
    const condIdx = num(args.idx, -1);  // Index into conditions array
    
    log(`MP cmdRecover: tokId="${tokId}", condIdx=${condIdx}`);
    
    // Legacy support: allow --bc and --tn for manual recovery rolls
    const manualBC = args.bc;
    const manualTN = num(args.tn, 0);

    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);

    // Get condition if using indexed system
    const conditions = state.MP_Engine.conditions[tokId] || [];
    log(`MP cmdRecover: conditions.length=${conditions.length}`);
    
    let cond = null;
    let tn = manualTN;
    let bc = manualBC;
    let recTime = "1 round";
    
    if (condIdx >= 0 && condIdx < conditions.length) {
      cond = conditions[condIdx];
      log(`MP cmdRecover: Found cond type="${cond.type}", marker="${cond.marker}", recTN=${cond.recTN}`);
      if (cond.permanent) {
        return ch("MP", `/w gm <b>MP:</b> This condition is <b>PERMANENT</b> and cannot be recovered from naturally.`);
      }
      tn = cond.recTN;
      bc = cond.saveBC;
      recTime = cond.recTime;
    } else if (!manualBC || manualTN <= 0) {
      log(`MP cmdRecover: No condition found at index ${condIdx}`);
      return ch("MP", `/w gm <b>MP:</b> No condition found or invalid parameters.`);
    }

    const d20 = randomInteger(20);
    const isFumble = (d20 === 20);
    const pass = !isFumble && (d20 <= tn);

    let msg_out = `<b>Recovery Roll</b> (${esc(char.get("name"))})`;
    if (cond) {
      msg_out += `<br/><span style="font-size:11px;">${esc(cond.effectDesc)} from ${esc(cond.sourceAtk)}</span>`;
    }
    msg_out += `<br/>Rec TN: <b>${tn}-</b> (${bc}) | Roll: <b>${d20}</b> → <b style="color:${pass ? '#27ae60' : '#e94560'}">${pass ? "RECOVERED!" : "Still affected"}</b>`;

    if (pass && cond) {
      // Remove the condition
      log(`MP Recovery: PASSED! Removing condition at index ${condIdx}`);
      conditions.splice(condIdx, 1);
      state.MP_Engine.conditions[tokId] = conditions;
      log(`MP Recovery: After splice, conditions.length=${conditions.length}`);
      log(`MP Recovery: state.MP_Engine.conditions[tokId].length=${state.MP_Engine.conditions[tokId].length}`);
      
      // Remove marker if no other conditions use it
      const markerStillUsed = conditions.some(c => c.marker === cond.marker);
      log(`MP Recovery: Clearing condition. marker="${cond.marker}", markerStillUsed=${markerStillUsed}`);
      if (!markerStillUsed && cond.marker) {
        const statusKey = "status_" + cond.marker;
        log(`MP Recovery: Removing marker "${statusKey}" from token ${tokId}`);
        tok.set(statusKey, false);
        // Verify it was set
        log(`MP Recovery: After set, tok.get("${statusKey}")=${tok.get(statusKey)}`);
      }
      
      msg_out += `<br/><span style="color:#27ae60;">Condition cleared!</span>`;
    } else if (!pass) {
      // Handle damaging conditions (Damaging Poison)
      if (cond && cond.damage > 0) {
        // Get protection against damage type
        const prot = cond.protKey ? sumProtection(char.id, cond.protKey) : 0;
        const penetrating = Math.max(0, cond.damage - prot);
        
        if (penetrating > 0) {
          // Create a pending record for Roll-With on this damage
          // NOTE: Don't set protKey - protection already applied above
          const poisonRollId = String(Date.now()) + "_poison_" + randomInteger(999999);
          state.MP_Engine.pending[poisonRollId] = {
            rollId: poisonRollId,
            defTokenId: tokId,
            defCharId: char.id,
            defName: char.get("name"),
            damageTotal: penetrating,
            dmgTypeStr: cond.dmgType || "Biochemical",
            protKey: null,  // Protection already applied
            atkName: cond.sourceAtk + " (Poison)",
            condIdx: condIdx,  // For retry button
            created: Date.now()
          };
          
          msg_out += `<br/><span style="color:#e94560;">Takes <b>${penetrating}</b> ${cond.dmgType || "Biochemical"} damage!</span>`;
          msg_out += ` (${cond.damage} raw - ${prot} prot)`;
          msg_out += `<br/>[Take Full Damage](!mp apply --id ${poisonRollId} --mode straight) `;
          msg_out += `[Roll-With Max](!mp apply --id ${poisonRollId} --mode rollwithmax) `;
          msg_out += `[Roll-With Custom](!mp apply --id ${poisonRollId} --mode rollwithcustom --amt ?{Power to divert|0})`;
          msg_out += `<br/><span style="font-size:11px;">Next recovery attempt: ${recTime}</span>`;
        } else {
          msg_out += `<br/><span style="font-size:11px;">Damage blocked by ${prot} ${cond.dmgType || "Biochemical"} protection</span>`;
          // Still show retry button even if damage was blocked
          msg_out += `<br/><span style="font-size:11px;">Next attempt: ${recTime}</span>`;
          msg_out += `<br/>[Try Again](!mp recover --target ${tokId} --idx ${condIdx})`;
        }
      } else {
        // Non-damaging condition (paralysis, etc.) - just show retry
        msg_out += `<br/><span style="font-size:11px;">Next attempt: ${recTime}</span>`;
        if (cond) {
          msg_out += `<br/>[Try Again](!mp recover --target ${tokId} --idx ${condIdx})`;
        } else {
          msg_out += `<br/>[Try Again](!mp recover --target ${tokId} --bc ${bc} --tn ${tn})`;
        }
      }
    }

    chCombat("MP", msg_out, char.id);
  }

  // -------------------------
  // CONDITION MANAGEMENT
  // -------------------------
  
  function cmdConditions(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    
    if (!tok || !char) return ch("MP", `${wt(msg)}<b>MP:</b> Target missing.`);
    
    const conditions = state.MP_Engine.conditions[tokId] || [];
    
    if (conditions.length === 0) {
      return ch("MP", `${wt(msg)}<b>${esc(char.get("name"))}</b> has no active conditions.`);
    }
    
    let msg_out = `<b>Conditions on ${esc(char.get("name"))}</b>`;
    const now = Date.now();
    
    conditions.forEach((cond, idx) => {
      if (cond.type === "absorption") {
        // Absorption effect
        msg_out += `<br/><br/><b>${idx + 1}. ABSORPTION</b>`;
        msg_out += `<br/><span style="font-size:11px;">+${cond.amount} to ${esc(cond.target)}</span>`;
        msg_out += `<br/><span style="font-size:11px;">Source: ${esc(cond.sourceAtk)} (${cond.dmgType})</span>`;
        
        // Show time remaining
        const remaining = cond.expires - now;
        if (remaining > 0) {
          const mins = Math.floor(remaining / 60000);
          const secs = Math.floor((remaining % 60000) / 1000);
          msg_out += `<br/><span style="color:#9b59b6; font-size:11px;">⏱ ${mins}m ${secs}s remaining</span>`;
        } else {
          msg_out += `<br/><span style="color:#e74c3c; font-size:11px;">⚠️ EXPIRED</span>`;
        }
        msg_out += `<br/>[Clear Effect](!mp clearcondition --target ${tokId} --idx ${idx})`;
      } else if (cond.type === "duration") {
        // Durational ongoing effect
        msg_out += `<br/><br/><b>${idx + 1}. ⏱ DURATION</b>`;
        msg_out += `<br/><span style="font-size:11px;">Source: ${esc(cond.sourceAtk)}</span>`;
        const rem = num(cond.roundsRemaining, 0);
        if (rem > 0) {
          msg_out += `<br/><span style="color:#f4d03f; font-size:11px;">${rem} round(s) remaining`;
          if (cond.damageExpr) msg_out += ` — ${esc(cond.damageExpr)} ${esc(cond.dmgType || "")}/round`;
          msg_out += `</span>`;
        } else {
          msg_out += `<br/><span style="font-size:11px;">Persists for ${esc(cond.unitLabel || "ongoing")} (manual)</span>`;
        }
        if (cond.escape) msg_out += `<br/><span style="font-size:11px; color:#9ad;">Escape: ${esc(cond.escape)}</span>`;
        msg_out += `<br/>[End Effect](!mp clearcondition --target ${tokId} --idx ${idx})`;
      } else {
        // Standard condition
        const condLabel = cond.type.replace(/_/g, " ").toUpperCase();
        msg_out += `<br/><br/><b>${idx + 1}. ${condLabel}</b>`;
        msg_out += `<br/><span style="font-size:11px;">Source: ${esc(cond.sourceAtk)}</span>`;
        msg_out += `<br/><span style="font-size:11px;">Recovery: ${cond.saveBC} at ${cond.recTN}- every ${cond.recTime}</span>`;
        if (cond.permanent) {
          msg_out += `<br/><span style="color:#ff0000; font-size:11px;">⚠️ PERMANENT</span>`;
        } else {
          msg_out += `<br/>[Recovery Roll](!mp recover --target ${tokId} --idx ${idx}) `;
          msg_out += `[Remove](!mp clearcondition --target ${tokId} --idx ${idx})`;
        }
      }
    });
    
    ch("MP", wt(msg) + msg_out);
  }
  
  function cmdClearCondition(msg, args) {
    const tokId = args.target;
    const condIdx = num(args.idx, -1);
    const clearAll = (args.all === "1");
    
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Target missing.`);
    
    const conditions = state.MP_Engine.conditions[tokId] || [];
    
    if (clearAll) {
      // Remove all markers and restore BC stats for absorption effects
      conditions.forEach(cond => {
        if (cond.type === "absorption" && cond.statAttr) {
          // Restore BC stat to original value
          setAttr(char.id, cond.statAttr, cond.originalValue);
        }
        if (cond.marker) {
          tok.set("status_" + cond.marker, false);
        }
      });
      // Remove purple marker if any absorptions were cleared
      const hadAbsorption = conditions.some(c => c.type === "absorption");
      if (hadAbsorption) {
        tok.set("status_purple", false);
      }
      state.MP_Engine.conditions[tokId] = [];
      return ch("MP", `/w gm All conditions cleared from <b>${esc(char.get("name"))}</b>.`);
    }
    
    if (condIdx < 0 || condIdx >= conditions.length) {
      return ch("MP", `/w gm <b>MP:</b> Invalid condition index.`);
    }
    
    const cond = conditions[condIdx];
    let condLabel;
    let restoredNote = "";
    
    if (cond.type === "absorption") {
      condLabel = `Absorption (+${cond.amount} ${cond.target})`;
      // Restore BC stat if this was a stat boost
      if (cond.statAttr) {
        setAttr(char.id, cond.statAttr, cond.originalValue);
        const statName = cond.statAttr.toUpperCase().substring(0, 2);
        restoredNote = ` ${statName} restored to ${cond.originalValue}.`;
      }
    } else {
      condLabel = cond.type.replace(/_/g, " ");
    }
    
    // Remove the condition
    conditions.splice(condIdx, 1);
    state.MP_Engine.conditions[tokId] = conditions;
    
    // Remove marker if no other conditions use it
    if (cond.marker) {
      const markerStillUsed = conditions.some(c => c.marker === cond.marker);
      if (!markerStillUsed) {
        tok.set("status_" + cond.marker, false);
      }
    }
    
    // Remove purple marker if no more absorption effects
    if (cond.type === "absorption") {
      const hasOtherAbsorption = conditions.some(c => c.type === "absorption");
      if (!hasOtherAbsorption) {
        tok.set("status_purple", false);
      }
    }
    
    ch("MP", `/w gm <b>${esc(char.get("name"))}</b>: ${condLabel} removed.${restoredNote}`);
  }
  
  // Check for expired absorption effects (called periodically or on status check)
  function checkAbsorptionExpiry(tokId) {
    const tok = getObj("graphic", tokId);
    if (!tok) return;
    
    const char = getCharFromToken(tok);
    if (!char) return;
    
    const conditions = state.MP_Engine.conditions[tokId] || [];
    const now = Date.now();
    let changed = false;
    let report = [];
    
    // Check each condition for expiry
    for (let i = conditions.length - 1; i >= 0; i--) {
      const cond = conditions[i];
      if (cond.type === "absorption" && cond.expires && cond.expires <= now) {
        // Expired - restore stat if applicable
        if (cond.statAttr) {
          setAttr(char.id, cond.statAttr, cond.originalValue);
          const statName = cond.statAttr.toUpperCase().substring(0, 2);
          report.push(`${cond.target} restored to ${cond.originalValue}`);
        } else {
          report.push(`+${cond.amount} to ${cond.target} expired`);
        }
        conditions.splice(i, 1);
        changed = true;
      }
    }
    
    if (changed) {
      state.MP_Engine.conditions[tokId] = conditions;
      // Remove purple marker if no more absorption effects
      const hasAbsorption = conditions.some(c => c.type === "absorption");
      if (!hasAbsorption) {
        tok.set("status_purple", false);
      }
      
      if (report.length > 0) {
        chCombat("MP", `<span style="color:#9b59b6;"><b>${esc(char.get("name"))}</b>: Absorption expired - ${report.join(", ")}</span>`, char.id);
      }
    }
  }
  
  // Command to check all tokens for expired absorptions
  function cmdCheckExpiry(msg, args) {
    const tokId = args.target;
    
    if (tokId) {
      // Check specific token
      checkAbsorptionExpiry(tokId);
      return ch("MP", `/w gm Checked absorption expiry.`);
    }
    
    // Check all tokens with conditions
    const allTokenIds = Object.keys(state.MP_Engine.conditions || {});
    let checked = 0;
    
    allTokenIds.forEach(tId => {
      const conditions = state.MP_Engine.conditions[tId] || [];
      if (conditions.some(c => c.type === "absorption")) {
        checkAbsorptionExpiry(tId);
        checked++;
      }
    });
    
    ch("MP", `/w gm Checked ${checked} token(s) for absorption expiry.`);
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

    // snBP can be a dice formula (Ice: "2d8") or fixed number (Grapnel: "6")
    const bpFormula = String(rec.snBP || "0").trim();
    const maxBp = Math.max(1, num(rec.snMaxBP, 0));
    
    // Check for existing snare - stack bonus per 4.10
    const existing = state.MP_Engine.snares[defTok.id];
    if (existing) {
      const newBp = Math.min(existing.bp + CFG.SNARE_STACK_BONUS, existing.maxBp);
      const oldBp = existing.bp;
      state.MP_Engine.snares[defTok.id].bp = newBp;
      chCombat("MP", `<b>Snare Stacked on ${esc(rec.defName)}</b><br/>` +
        `BP increased: <b>${oldBp} → ${newBp}</b> (max ${existing.maxBp})`, rec.defCharId);
      return;
    }

    // Roll the BP formula (rollExpr handles both "6" and "2d8")
    let rolledBP = rollExpr(bpFormula) + bonusBP;
    // Cap at max
    const cappedBP = maxBp > 0 ? Math.min(rolledBP, maxBp) : rolledBP;
    
    // Show roll details
    const isFormula = /d/i.test(bpFormula);
    let bpDisplay = isFormula 
      ? `${bpFormula} = <b>${rolledBP - bonusBP}</b>${bonusBP > 0 ? ` +${bonusBP} = <b>${rolledBP}</b>` : ""}`
      : `<b>${rolledBP}</b>`;
    if (rolledBP > cappedBP) {
      bpDisplay += ` (capped to ${cappedBP})`;
    }

    state.MP_Engine.snares[defTok.id] = {
      bp: cappedBP,
      maxBp,
      type: rec.snType || "Snare",
      source: rec.atkName,
      created: Date.now()
    };

    defTok.set("status_cobweb", true);

    chCombat("MP", `<b>Snare Applied to ${esc(rec.defName)}</b><br/>` +
      `Type: <b>${esc(rec.snType || "Snare")}</b><br/>` +
      `BP: ${bpDisplay} | Max: <b>${maxBp}</b>` +
      `<br/>[Break Free](!mp break --target ${defTok.id})`, rec.defCharId);
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
        resultLine = `<b style="color:#27ae60">ESCAPES!</b> (by ${margin}, uses only move OR action)`;
      } else {
        resultLine = `<b style="color:#27ae60">ESCAPES!</b> (uses full turn)`;
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

    chCombat("MP", msg_out, char.id);
  }

  // -------------------------
  // GRAPPLE COMMANDS (4.11)
  // -------------------------

  function cmdGrapple(msg, args) {
    // Get attacker and defender tokens from args or selected tokens
    let atkTokId = args.atk;
    let defTokId = args.def;
    
    // Fallback to selected tokens if not provided
    // Note: Roll20 returns most recently selected token first, so we swap order
    // User selects attacker, then target = target at [0], attacker at [1]
    if (!atkTokId || !defTokId) {
      if (!msg.selected || msg.selected.length < 2) {
        return ch("MP", `/w gm <b>MP:</b> Select 2 tokens (attacker first, target second) or use --atk and --def flags.`);
      }
      atkTokId = atkTokId || msg.selected[1]._id;
      defTokId = defTokId || msg.selected[0]._id;
    }

    const atkTok = getObj("graphic", atkTokId);
    const defTok = getObj("graphic", defTokId);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Missing attacker or defender.`);
    }

    // Remote grapple (TK, Magnetism, etc.) - target can't counter-grapple
    const remote = (args.remote === "1");

    // Grip dice represent the grapple's "strength" (4.11). If gripdice is provided,
    // default to power-style grip unless explicitly overridden.
    const gripDice = String(args.gripdice || "").trim();
    const gripType = args.griptype || (gripDice ? "power" : "hth");


    // Calculate to-hit chance (4.11: grapple requires successful attack roll)
    const atkAg = num(getAttr(atkChar.id, "agility_save"), 6);
    const baseChance = num(args.tohit, 0) || (atkAg + 3);
    
    // Get defender's defense modifier
    const defDef = num(getAttr(defChar.id, "defense"), 0);
    
    // Apply lock penalty if attempting lock (-3 per 4.11.1)
    const lockAttempt = (args.lock === "1");
    const lockPenalty = lockAttempt ? -3 : 0;
    
    const finalTN = baseChance - defDef + lockPenalty;
    const roll = (args.roll !== undefined && args.roll !== null && String(args.roll).trim() !== "") ? num(args.roll, 0) : randomInteger(20);
    const hit = roll <= finalTN;

    // Build roll breakdown for hover text
    let tnBreakdown = `Base: AG ${atkAg} + 3 = ${atkAg + 3}`;
    if (defDef !== 0) tnBreakdown += ` | Def: -${defDef}`;
    if (lockPenalty) tnBreakdown += ` | Lock: ${lockPenalty}`;
    tnBreakdown += ` | Final TN: ${finalTN}`;

    let msg_out = `<b>Grapple Attack</b>${lockAttempt ? " (Lock Attempt)" : ""}<br/>`;
    msg_out += `${esc(atkChar.get("name"))} → ${esc(defChar.get("name"))}<br/>`;
    msg_out += `Roll: <span title="d20 roll""><b>${roll}</b></span> vs <span title="${tnBreakdown}"><b>${finalTN}-</b></span>`;
    if (defDef !== 0 || lockPenalty) {
      msg_out += ` <span style="font-size:10px;">(${baseChance}`;
      if (lockPenalty) msg_out += `${lockPenalty}`;
      if (defDef !== 0) msg_out += ` -${defDef} def`;
      msg_out += `)</span>`;
    }
    msg_out += `<br/>`;

    if (!hit) {
      msg_out += `Result: <b style="color:#e74c3c;">MISS</b>`;
      chCombat("MP", msg_out, defChar.id);
      return;
    }

    // Hit - establish grapple
    state.MP_Engine.snares[defTokId] = {
      type: "Grapple",
      source: atkChar.get("name"),
      grapplerTokenId: atkTokId,
      chanceToHit: baseChance,
      locked: lockAttempt,
      remote: remote,
      gripType: gripType,
      gripDice: gripDice,
      created: Date.now()
    };

    // Set status markers - defender gets "grab" (being grappled), attacker gets "fist" (grappling)
    defTok.set("status_grab", true);
    // Per 3.0.2.6 & 4.11: grappling somebody else still imposes restraint on physical tasks.
    // Remote grapples still count as an active grapple, so mark the grappler too.
    atkTok.set("status_fist", true);

    const remoteLabel = remote ? " <span style='color:#9b59b6;'>(Remote)</span>" : "";
    msg_out += `Result: <b style="color:#27ae60;">HIT - GRAPPLED${lockAttempt ? " & LOCKED" : ""}</b>${remoteLabel}<br/>`;
    
    // Show grip dice (what will be used for Squeeze/Break Free)
    const gripDisplay = (gripType === "power" && gripDice) ? gripDice : (getAttr(atkChar.id, "hth_damage") || "1d4");
    const gripSource = (gripType === "power" && gripDice) ? "Power" : "HTH";
    msg_out += `<i>Grip: <b>${gripDisplay}</b> (${gripSource})</i><br/>`;
    
    // Per 3.0.2.6: -3 restraint, -9 if fully restrained (locked)
    const restraintPenalty = lockAttempt ? -9 : -3;
    msg_out += `<i>Restraint: Both parties at <b>${restraintPenalty}</b> to physical tasks</i><br/>`;
    msg_out += `[Squeeze](!mp squeeze --target ${defTokId}) ` +
      (lockAttempt ? "" : `[Lock](!mp grapplelock --target ${defTokId}) `) +
      `[Release](!mp grapplerelease --target ${defTokId})<br/>`;
    msg_out += `<b>${esc(defChar.get("name"))}'s options:</b> `;
    msg_out += `[Break Free](!mp grapplebreak --target ${defTokId}) ` +
      `[Escape](!mp escape --target ${defTokId}) ` +
      (remote || lockAttempt ? "" : `[Counter](!mp countergrapple --target ${defTokId})`);

    chCombat("MP", msg_out, defChar.id);
  }

  function cmdSqueeze(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `/w gm <b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = args.atk || sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Missing characters.`);
    }

    // Use grip dice if specified, otherwise use Base HTH Damage
    let hthExpr;
    let gripLabel;
    if (sn.gripType === "power" && sn.gripDice) {
      hthExpr = sn.gripDice;
      gripLabel = ` (Power: ${sn.gripDice})`;
    } else {
      hthExpr = getAttr(atkChar.id, "hth_damage") || "1d4";
      gripLabel = "";
    }
    const damage = rollExpr(hthExpr);

    // Create pending record for damage processing
    // protKey should match what typeToProtKey() returns (e.g., "kinetic")
    const rollId = String(Date.now()) + "_" + randomInteger(999999);
    state.MP_Engine.pending[rollId] = {
      rollId,
      playerid: msg.playerid,
      atkCharId: atkChar.id,
      atkName: atkChar.get("name") + " - Squeeze",
      defTokenId: defTokId,
      defCharId: defChar.id,
      defName: defChar.get("name"),
      damageTotal: damage,
      dmgTypeStr: "Kinetic",
      dmgSubtype: "",
      protKey: "kinetic",  // Matches typeToProtKey("Kinetic") return value
      atkAP: 0,
      causesKB: false,  // Squeeze never causes KB per 4.11
      isSqueeze: true,
      created: Date.now()
    };

    // Build output with damage buttons
    const sqDefIsVeh = isVehicleMode(defChar.id);
    let html = `<div style="background:#e8daef; border:2px solid #9b59b6; padding:4px 8px;">`;
    html += `<b>${esc(atkChar.get("name"))} Squeezes ${esc(defChar.get("name"))}</b>${gripLabel}<br/>`;
    html += `Damage: <span title="${hthExpr}"><b>${damage}</b></span> (Kinetic, no KB)<br/>`;
    if (sqDefIsVeh) {
      html += `[Apply](!mp apply --id ${rollId} --mode noroll)`;
    } else {
      html += `[No Roll-With](!mp apply --id ${rollId} --mode noroll) `;
      html += `[Roll-With Max](!mp apply --id ${rollId} --mode rwmax) `;
      html += `[Roll-With...](!mp apply --id ${rollId} --mode rw --amt ?{Roll-With amount|0})`;
    }
    html += `</div>`;

    chCombat("MP", html, defChar.id);
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

    const atkTok = getObj("graphic", atkTokId);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Missing characters.`);
    }

    // Grappler uses grip dice if power type, otherwise HTH
    let atkHTH;
    let atkGripLabel = "";
    if (sn.gripType === "power" && sn.gripDice) {
      atkHTH = sn.gripDice;
      atkGripLabel = ` [${sn.gripDice}]`;
    } else {
      atkHTH = getAttr(atkChar.id, "hth_damage") || "1d4";
    }
    
    // Defender always uses their own HTH
    const defHTH = getAttr(defChar.id, "hth_damage") || "1d4";

    const rawDef = rollExpr(defHTH);
    const rawAtk = rollExpr(atkHTH);

    let defRoll = rawDef + (pushDef ? 2 : 0) + (locked ? -2 : 0); // lock: -2 to break free
    let atkRoll = rawAtk + (pushAtk ? 2 : 0);

    const success = (defRoll > atkRoll);

    // Build hover text for rolls
    let defBreakdown = `${defHTH} = ${rawDef}`;
    if (pushDef) defBreakdown += ` + 2 push`;
    if (locked) defBreakdown += ` - 2 lock`;
    let atkBreakdown = `${atkHTH} = ${rawAtk}`;
    if (pushAtk) atkBreakdown += ` + 2 push`;

    let msg_out =
      `<b>Break Free from Grapple</b>${locked ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: <span title="${defBreakdown}"><b>${defRoll}</b></span>` +
      `${pushDef ? " (+2 push)" : ""}${locked ? " (-2 lock)" : ""}<br/>` +
      `${esc(atkChar.get("name"))}${atkGripLabel}: <span title="${atkBreakdown}"><b>${atkRoll}</b></span>${pushAtk ? " (+2 push)" : ""}<br/>` +
      `Result: <b>${success ? "ESCAPES!" : "Still Grappled"}</b>`;

    // Push backlash: whoever pushed and lost takes 1 Hit
    if (pushDef && !success) {
      msg_out += `<br/><span style="color:#e94560">${esc(defChar.get("name"))} takes 1 Hit from failed push!</span>`;
    }
    if (pushAtk && success) {
      msg_out += `<br/><span style="color:#e94560">${esc(atkChar.get("name"))} takes 1 Hit from failed push!</span>`;
    }

    if (success) {
      // Clear defender's grappled status
      delete state.MP_Engine.snares[defTokId];
      defTok.set("status_grab", false);

      // Clear attacker's grappling status
      if (atkTok) {
        atkTok.set("status_fist", false);
      }

      // Also clear counter-grapple if present
      const maybeCounter = atkTok && state.MP_Engine.snares[atkTokId];
      if (maybeCounter && maybeCounter.type === "Grapple" && maybeCounter.grapplerTokenId === defTokId) {
        delete state.MP_Engine.snares[atkTokId];
        atkTok.set("status_grab", false);
        defTok.set("status_fist", false);
      }
    }

    chCombat("MP", msg_out, defChar.id);
  }

  function cmdGrappleRelease(msg, args) {
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

    // Clear the grapple
    delete state.MP_Engine.snares[defTokId];
    defTok.set("status_grab", false);
    
    // Clear attacker's grappling status
    if (atkTok) {
      atkTok.set("status_fist", false);
    }

    // Also clear counter-grapple if present
    if (atkTok) {
      const maybeCounter = state.MP_Engine.snares[atkTokId];
      if (maybeCounter && maybeCounter.type === "Grapple" && maybeCounter.grapplerTokenId === defTokId) {
        delete state.MP_Engine.snares[atkTokId];
        atkTok.set("status_grab", false);
        defTok.set("status_fist", false);
      }
    }

    chCombat("MP", `<b>${esc(atkChar ? atkChar.get("name") : "Grappler")} releases ${esc(defChar ? defChar.get("name") : "target")}</b>`, defChar ? defChar.id : null);
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

    // Build hover text
    const tnBreakdown = `Base chance: ${baseChance} | Lock penalty: -3 | Final TN: ${tn}`;

    let msg_out = `<b>Grapple Lock Attempt</b><br/>` +
      `${esc(atkChar ? atkChar.get("name") : "Grappler")}: Roll <span title="d20 roll"><b>${roll}</b></span> vs <span title="${tnBreakdown}"><b>${tn}-</b></span><br/>` +
      `Result: <b>${ok ? "LOCKED" : "Failed"}</b> on ${esc(defChar ? defChar.get("name") : "target")}`;
    
    if (ok) {
      msg_out += `<br/><i>Target now fully restrained (-9 to physical tasks, -3 to escape/break free)</i>`;
    }

    chCombat("MP", msg_out, defChar.id);
  }

    function cmdEscape(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `${wt(msg)}<b>MP:</b> Target is not grappled.`);
    }

    const atkTokId = sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);

    const defChar = getCharFromToken(defTok);
    const atkChar = getCharFromToken(atkTok);

    if (!defChar) return ch("MP", `${wt(msg)}<b>MP:</b> Missing defender character.`);

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

    // Build hover text
    let tnBreakdown = `Base: AG ${defAg} + 3 = ${defAg + 3}`;
    if (sn.locked) tnBreakdown += ` | Lock: -3`;
    tnBreakdown += ` | Grappler penalty: ${grapplerChance} - 10 = ${penalty > 0 ? "-" : ""}${Math.abs(penalty)}`;
    tnBreakdown += ` | Final TN: ${tn}`;

    let msg_out =
      `<b>Escape Attempt</b>${sn.locked ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: Roll <span title="d20 roll"><b>${roll}</b></span> vs <span title="${tnBreakdown}"><b>${tn}-</b></span><br/>` +
      `<span style="font-size:11px;">(Base ${defAg}+3${sn.locked ? " -3 lock" : ""} = ${base}; Penalty ${grapplerChance}-10 = ${penalty})</span><br/>` +
      `Result: <b>${ok ? "ESCAPES!" : "Still Grappled"}</b>`;

    if (ok) {
      delete state.MP_Engine.snares[defTokId];
      defTok.set("status_grab", false);

      // Clear attacker's grappling status
      if (atkTok) {
        atkTok.set("status_fist", false);
      }

      // Clear counter-grapple record if present
      const maybeCounter = atkTok && state.MP_Engine.snares[atkTokId];
      if (maybeCounter && maybeCounter.type === "Grapple" && maybeCounter.grapplerTokenId === defTokId) {
        delete state.MP_Engine.snares[atkTokId];
        atkTok.set("status_grab", false);
        defTok.set("status_fist", false);
      }
    }

    chCombat("MP", msg_out, defChar.id);
  }

    function cmdCounterGrapple(msg, args) {
    const defTokId = args.target || args.def;
    const defTok = getObj("graphic", defTokId);
    const sn = state.MP_Engine.snares[defTokId];

    if (!defTok || !sn || sn.type !== "Grapple") {
      return ch("MP", `${wt(msg)}<b>MP:</b> Target is not grappled.`);
    }

    if (sn.locked) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Target is LOCKED and cannot counter-grapple (Escape/Break Free only).`);
    }

    // Remote grapple blocks counter-grapple (4.11.6)
    if (sn.remote) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Target is held by <b>remote grapple</b> and cannot counter-grapple (requires ranged ability to reach opponent).`);
    }

    const atkTokId = sn.grapplerTokenId;
    const atkTok = getObj("graphic", atkTokId);

    const defChar = getCharFromToken(defTok);
    const atkChar = getCharFromToken(atkTok);

    if (!defChar || !atkTok) return ch("MP", `/w gm <b>MP:</b> Missing characters/tokens.`);

    const defAg = num(getAttr(defChar.id, "agility_save"), 6);
    // Wrestling: +3 bonus to base (4.11.4: "AG save (+3 if character has wrestling background)")
    const wrestle = (args.wrestle === "1") ? 3 : 0;
    const lockAttempt = (args.lock === "1") ? -3 : 0;

    // Base is AG save, +3 if wrestling, -3 if attempting lock
    const tn = defAg + wrestle + lockAttempt;
    const roll = randomInteger(20);
    const ok = roll <= tn;

    // Build hover text
    let tnBreakdown = `Base: AG ${defAg}`;
    if (wrestle) tnBreakdown += ` | Wrestling: +3`;
    if (lockAttempt) tnBreakdown += ` | Lock: -3`;
    tnBreakdown += ` | Final TN: ${tn}`;

    let msg_out =
      `<b>Counter-Grapple Attempt</b>${lockAttempt ? " (LOCK)" : ""}<br/>` +
      `${esc(defChar.get("name"))}: Roll <span title="d20 roll"><b>${roll}</b></span> vs <span title="${tnBreakdown}"><b>${tn}-</b></span>` +
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
      // Both are now grappling each other - both get status markers
      atkTok.set("status_grab", true);
      defTok.set("status_fist", true); // Defender is now also grappling
      msg_out += `<br/>${esc(defChar.get("name"))} now has ${esc(atkChar ? atkChar.get("name") : "the grappler")} grappled${lockAttempt ? " in a LOCK" : ""}.`;
      msg_out += `<br/><i>Both parties now grappling each other (-3 restraint each)</i>`;
    }

    chCombat("MP", msg_out, char.id);
  }

  // -------------------------
  // WAKEUP ROLL (4.8.4.1)
  // -------------------------

  function cmdWakeup(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);

    if (!tok || !char) return ch("MP", `${wt(msg)}<b>MP:</b> Target missing.`);

    if (isVehicleMode(char.id)) {
      return ch("MP", `/w gm <b>MP:</b> Vehicles don't go unconscious. Use Repair to restore Hits.`);
    }

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

    chCombat("MP", msg_out, char.id);
  }

  // -------------------------
  // STATUS COMMANDS
  // -------------------------

  function cmdStatus(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);

    if (!tok || !char) return ch("MP", `${wt(msg)}<b>MP:</b> Target missing.`);

    const statIsVeh = isVehicleMode(char.id);
    const hits = statIsVeh ? getVehicleHits(tok, char.id) : getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = statIsVeh ? getAttrNum(char.id, "vehicle_hits_max", 20) : getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow = statIsVeh ? getVehiclePower(tok, char.id) : getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = statIsVeh ? getAttrNum(char.id, "vehicle_power_max", 40) : getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);

    const snare = state.MP_Engine.snares[tokId];
    const conditions = state.MP_Engine.conditions[tokId] || [];

    const label = statIsVeh ? (getAttr(char.id, "vehicle_name") || char.get("name")) : char.get("name");
    let msg_out = `<b>${esc(label)} Status</b>${statIsVeh ? " 🚗" : ""}<br/>` +
      `Hits: <b>${hits}/${hitsMax}</b> | Power: <b>${pow}/${powMax}</b>`;

    if (snare) {
      msg_out += `<br/>Snared: <b>${snare.type}</b> (BP ${snare.bp || "N/A"}) by ${snare.source}`;
    }
    
    if (conditions.length > 0) {
      msg_out += `<br/><b>Conditions:</b>`;
      conditions.forEach((cond, idx) => {
        const condLabel = cond.type.replace(/_/g, " ");
        msg_out += `<br/>• ${condLabel}`;
        if (cond.permanent) msg_out += ` (PERMANENT)`;
        else msg_out += ` [Rec: ${cond.recTN}-]`;
      });
      msg_out += `<br/>[View Details](!mp conditions --target ${tokId})`;
    }

    if (hits <= 0) {
      msg_out += `<br/><span style="color:#e94560">INCAPACITATED</span>`;
    } else if (pow <= 0) {
      msg_out += `<br/><span style="color:#f4d03f">FATIGUED</span>`;
    }

    ch("MP", wt(msg) + msg_out);
  }
  
  // Restore selected tokens to full Hits and Power
  function cmdRestore(msg, args) {
    const selected = msg.selected || [];
    if (selected.length === 0) {
      return ch("MP", `/w gm <b>MP:</b> No tokens selected. Select one or more tokens first.`);
    }
    
    let restored = [];
    
    selected.forEach(sel => {
      if (sel._type !== "graphic") return;
      
      const tok = getObj("graphic", sel._id);
      if (!tok) return;
      
      const char = getCharFromToken(tok);
      if (!char) return;
      
      const tokId = tok.id;
      const restIsVeh = isVehicleMode(char.id);
      
      if (restIsVeh) {
        // Restore vehicle hits and power from vehicle max attrs
        const vHitsMax = getAttrNum(char.id, "vehicle_hits_max", 20);
        const vPowMax = getAttrNum(char.id, "vehicle_power_max", 40);
        setVehicleHits(tok, char.id, vHitsMax);
        setVehiclePower(tok, char.id, vPowMax);
        // Also sync token bars
        tok.set("bar2_max", vHitsMax);
        tok.set("bar1_max", vPowMax);
        
        // Clear status markers
        tok.set("status_dead", false);
        tok.set(CFG.DEF_MOD_BAR, 0);
        
        restored.push((getAttr(char.id, "vehicle_name") || char.get("name")) + ` 🚗 (H:${vHitsMax} P:${vPowMax})`);
        return;
      }
      
      // Get max from token bar max (same source as cmdStatus)
      const hitsMax = parseInt(tok.get("bar2_max"), 10) || 20;
      const powMax = parseInt(tok.get("bar1_max"), 10) || 40;
      
      // Set token bars (Power=bar1, Hits=bar2)
      tok.set("bar1_value", powMax);
      tok.set("bar2_value", hitsMax);
      
      // Clear all status markers
      tok.set("status_dead", false);
      tok.set("status_sleepy", false);
      tok.set("status_grab", false);        // Being grappled
      tok.set("status_fist", false);        // Grappling someone
      tok.set("status_cobweb", false);      // Snared
      tok.set("status_broken-heart", false); // Off balance
      tok.set("status_broken-leg", false);  // Leg disabled
      tok.set("status_broken-shield", false); // Arm disabled
      tok.set("status_back-pain", false);       // Prone (back-pain marker)
      tok.set("status_purple", false);      // Absorption effect active
      tok.set("status_blue", false);        // Defensive stance
      tok.set("status_white-tower", false); // Full defense
      
      // Reset defense modifier (bar3)
      tok.set(CFG.DEF_MOD_BAR, 0);
      
      // Clear snare/grapple state for this token
      if (state.MP_Engine.snares[tokId]) {
        // If this token was grappling someone, clear their grab status too
        const sn = state.MP_Engine.snares[tokId];
        if (sn.grapplerTokenId) {
          const grapplerTok = getObj("graphic", sn.grapplerTokenId);
          if (grapplerTok) grapplerTok.set("status_fist", false);
        }
        delete state.MP_Engine.snares[tokId];
      }
      
      // Check if this token is grappling someone else and release them
      Object.keys(state.MP_Engine.snares).forEach(victimId => {
        const sn = state.MP_Engine.snares[victimId];
        if (sn && sn.grapplerTokenId === tokId) {
          const victimTok = getObj("graphic", victimId);
          if (victimTok) victimTok.set("status_grab", false);
          delete state.MP_Engine.snares[victimId];
        }
      });
      
      // Clear conditions for this token
      if (state.MP_Engine.conditions && state.MP_Engine.conditions[tokId]) {
        delete state.MP_Engine.conditions[tokId];
      }
      
      restored.push(char.get("name") + ` (H:${hitsMax} P:${powMax})`);
    });
    
    if (restored.length > 0) {
      ch("MP", `/w gm <b>Restored:</b> ${restored.join(", ")} <i>(all status effects cleared)</i>`);
    } else {
      ch("MP", `/w gm <b>MP:</b> No valid tokens to restore.`);
    }
  }

  // -------------------------
  // TOKEN BAR VISIBILITY
  // -------------------------
  // Usage: !mp showbars [--bars 1,2,3] [--off]
  // Default: turn on player visibility for all three bars on selected tokens.
  // Useful for testing when you want to see Hits/Power at a glance across
  // every token on the page.

  function cmdShowBars(msg, args) {
    const toks = (msg.selected || [])
      .map(s => getObj("graphic", s._id))
      .filter(Boolean);
    if (!toks.length) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Select one or more tokens first.`);
    }
    const bars = args.bars
      ? String(args.bars).split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
      : ["1", "2", "3"];
    const on = args.off === undefined;
    toks.forEach(t => bars.forEach(b => t.set(`showplayers_bar${b}`, on)));
    ch("MP", `/w gm <b>MP:</b> ${on ? "Showed" : "Hid"} bar${bars.length > 1 ? "s" : ""} ${bars.join(",")} on ${toks.length} token${toks.length > 1 ? "s" : ""}.`);
  }

  // -------------------------
  // VEHICLE MODE TOGGLE
  // -------------------------

  function cmdVehicle(msg, args) {
    const selected = msg.selected || [];
    if (selected.length === 0) {
      return ch("MP", `/w gm <b>MP:</b> Select one or more tokens first.`);
    }

    selected.forEach(sel => {
      if (sel._type !== "graphic") return;
      const tok = getObj("graphic", sel._id);
      if (!tok) return;
      const char = getCharFromToken(tok);
      if (!char) return;

      const current = getAttr(char.id, "vehicle_mode");
      const wasVehicle = (current === "on" || current === "1" || current === 1);

      let goVehicle;
      if (args.on) goVehicle = true;
      else if (args.off) goVehicle = false;
      else goVehicle = !wasVehicle;

      setAttr(char.id, "vehicle_mode", goVehicle ? "on" : "0");

      if (goVehicle) {
        const vName = getAttr(char.id, "vehicle_name") || char.get("name");
        const vHits = getResource(tok, char.id, CFG.HITS_BAR, "vehicle_hits");
        const vHitsMax = getAttrNum(char.id, "vehicle_hits_max", 0) || vHits;
        const vPow = getResource(tok, char.id, CFG.POWER_BAR, "vehicle_power");
        const vPowMax = getAttrNum(char.id, "vehicle_power_max", 0) || vPow;
        ch("MP", `/w gm <b>🚗 VEHICLE MODE ON:</b> ${esc(vName)}<br/>Hits: ${vHits}/${vHitsMax} | Power: ${vPow}/${vPowMax}<br/><span style="font-size:11px; color:#888;">Set up token with bar2→vehicle_hits, bar1→vehicle_power</span>`);
      } else {
        ch("MP", `/w gm <b>👤 VEHICLE MODE OFF:</b> ${esc(char.get("name"))}`);
      }
    });
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
  const dmgTypeFull = resolveDmgType(getAtk("attack_dmgtype") || "Kin");
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
      return ch("MP", `${wt(msg)}Select a token first.`);
    }
    
    const char = getCharFromToken(tok);
    const charName = char ? char.get("name") : "Token";
    
    // Permission check: player must control the token's character
    if (char && !canControl(msg, char.id)) {
      return ch("MP", `${wt(msg)}You don't control ${esc(charName)}.`);
    }
    
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
          chBoth("MP", `<b>${esc(charName)}</b>: Defense modifier set to <b>${customMod >= 0 ? '+' : ''}${customMod}</b>`, msg);
          return;
        }
        return ch("MP", `${wt(msg)}<b>Stance Options:</b><br/>
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
    chBoth("MP", `<b>${esc(charName)}</b>: ${stance.name} (Def ${modStr})`, msg);
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
      return ch("MP", `${wt(msg)}Select two tokens to check range between them.`);
    }
    
    const tok1 = getObj("graphic", msg.selected[0]._id);
    const tok2 = getObj("graphic", msg.selected[1]._id);
    
    if (!tok1 || !tok2) {
      return ch("MP", `${wt(msg)}Could not find selected tokens.`);
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
    const snapIncr = page ? page.get("snapping_increment") : "?";
    
    let msg_out = `<b>Range Check</b><br/>`;
    msg_out += `${esc(name1)} → ${esc(name2)}<br/>`;
    msg_out += `Distance: <b>${rangeData.inches}"</b><br/>`;
    msg_out += `<span style="font-size:10px; color:#888;">`;
    msg_out += `T1: ${Math.round(tok1.get("left"))}x${Math.round(tok1.get("top"))} (${tok1.get("width")}x${tok1.get("height")})<br/>`;
    msg_out += `T2: ${Math.round(tok2.get("left"))}x${Math.round(tok2.get("top"))} (${tok2.get("width")}x${tok2.get("height")})<br/>`;
    msg_out += `Page: ${scaleNum} ${scaleUnit}/sq, snap:${snapIncr}</span><br/>`;
    
    if (rangeData.profileAdjusted) {
      const atkP = rangeData.atkProfile !== undefined ? rangeData.atkProfile : 1;
      const defP = rangeData.defProfile !== undefined ? rangeData.defProfile : 1;
      if (atkP !== 1) {
        msg_out += `Attacker Profile: ${atkP}<br/>`;
      }
      if (defP !== 1) {
        msg_out += `Target Profile: ${defP}<br/>`;
      }
      msg_out += `Adjusted: <b>${rangeData.adjustedInches}"</b><br/>`;
    }
    
    msg_out += `Penalty: <b>${rangeData.penalty}</b>`;
    
    ch("MP", wt(msg) + msg_out);
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
          <code>!mp test grapple [TOHIT] [lock] [remote] [gripdice]</code> - Grapple test harness (select 2 tokens: grappler, target)<br/>
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

    // Roll20 returns most recently selected token first, so we swap order
    const atkTok = getObj("graphic", msg.selected[1]._id);
    const defTok = getObj("graphic", msg.selected[0]._id);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);

    if (!atkTok || !defTok || !atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Both selected tokens must be linked to characters.`);
    }

    // Optional TOHIT override (stores grappler chance-to-hit for Escape math)
    const atkAg = num(getAttr(atkChar.id, "agility_save"), 6);
    const tohitOverride = args.tohit ? num(args.tohit, 0) : (atkAg + 3);
    
    // Remote grapple flag (TK, Magnetism)
    const remote = (args.remote === "1" || args.remote === "remote");
    
    // Grip dice override (e.g., "2d8" for TK)
    const gripDice = args.gripdice || "";
    const gripType = gripDice ? "power" : "hth";
    
    // Lock flag
    const locked = (args.lock === "lock");

    // Directly establish grapple (test harness bypasses roll)
    state.MP_Engine.snares[defTok.id] = {
      type: "Grapple",
      source: atkChar.get("name"),
      grapplerTokenId: atkTok.id,
      chanceToHit: tohitOverride,
      locked: locked,
      remote: remote,
      gripType: gripType,
      gripDice: gripDice,
      created: Date.now()
    };
    defTok.set("status_grab", true);
    // Per 3.0.2.6 & 4.11: grappling somebody else still imposes restraint on physical tasks.
    // Remote grapples still count as an active grapple, so mark the grappler too.
    atkTok.set("status_fist", true);

    const sn = state.MP_Engine.snares[defTok.id];
    const lockedNow = sn.locked ? " (LOCKED)" : "";
    const remoteNow = sn.remote ? " <span style='color:#9b59b6;'>(REMOTE)</span>" : "";
    const gripNow = (sn.gripType === "power" && sn.gripDice) ? ` [Grip: ${sn.gripDice}]` : "";

    const out =
      `<b>🧪 Grapple Test Harness</b> (roll bypassed)<br/>` +
      `${esc(atkChar.get("name"))} → ${esc(defChar.get("name"))}${lockedNow}${remoteNow}${gripNow}<br/>` +
      `<i>Stored chance-to-hit: ${tohitOverride}</i><br/>` +
      `[Squeeze](!mp squeeze --target ${defTok.id}) ` +
      (sn.locked ? "" : `[Lock Attempt](!mp grapplelock --target ${defTok.id}) `) +
      `[Release](!mp grapplerelease --target ${defTok.id})<br/>` +
      `<b>Target options:</b> ` +
      `[Break Free](!mp grapplebreak --target ${defTok.id}) ` +
      `[Break Free (Push)](!mp grapplebreak --target ${defTok.id} --pushdef 1) ` +
      `[Escape](!mp escape --target ${defTok.id}) ` +
      (sn.remote || sn.locked ? "" : `[Counter](!mp countergrapple --target ${defTok.id} --wrestle ?{Wrestling background? (0/1)|0} --lock ?{Attempt Lock? (0/1)|0})`);

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

    const healIsVeh = isVehicleMode(char.id);
    const hits0 = healIsVeh ? getVehicleHits(tok, char.id) : getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = healIsVeh ? getAttrNum(char.id, "vehicle_hits_max", 20) : getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow0 = healIsVeh ? getVehiclePower(tok, char.id) : getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = healIsVeh ? getAttrNum(char.id, "vehicle_power_max", 40) : getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);

    const hits1 = Math.min(hitsMax, hits0 + healAmount);
    const pow1 = Math.min(powMax, pow0 + healPower);

    if (healIsVeh) {
      setVehicleHits(tok, char.id, hits1);
      if (healPower > 0) setVehiclePower(tok, char.id, pow1);
    } else {
      setResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      if (healPower > 0) setResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
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
    tok.set("status_back-pain", false);
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
      msg_out += `<span style="color:#27ae60;"><b>Stance:</b> Full Defense (+6 def, ½ move)</span><br/>`;
    } else if (defMod === -3) {
      msg_out += `<span style="color:#e94560;"><b>Status:</b> Off Balance</span><br/>`;
    } else if (defMod !== 0) {
      msg_out += `<span style="color:#f4d03f;"><b>Def Mod:</b> ${defMod >= 0 ? '+' : ''}${defMod}</span><br/>`;
    }
    
    msg_out += `<b>Protection:</b> Kin ${fmtProt(kinData)} | Eng ${fmtProt(engData)} | Ent ${fmtProt(entData)} | Psy ${fmtProt(psyData)} | Bio ${fmtProt(bioData)} | Oth ${fmtProt(othData)}<br/>`;
    msg_out += `<b>HTH:</b> ${hth} | <b>Mass:</b> ${mass}<br/>`;
    
    // Roll-With Cap with Fortitude bonus
    const hasFortitude = (num(getAttr(char.id, "willpower_fortitude"), 0) === 1);
    const hasPainResistance = (num(getAttr(char.id, "willpower_pain_resistance"), 0) === 1);
    const baseRollWith = Math.floor(pow / 10);
    const rollWithCap = hasFortitude ? baseRollWith * 2 : baseRollWith;
    msg_out += `<b>Roll-With Cap:</b> ${rollWithCap}`;
    if (hasFortitude) msg_out += ` <span style="color:#8be9fd;">(Fortitude x2)</span>`;
    if (hasPainResistance) msg_out += ` <span style="color:#27ae60;">(Pain Res.)</span>`;
    
    if (snare) {
      msg_out += `<br/><span style="color:#e94560;"><b>Snared:</b> ${snare.type} (BP ${snare.bp || "N/A"}) by ${snare.source}</span>`;
    }

    // Force Field status
    const ffStatus = getForceFieldData(char.id, tok.id);
    if (ffStatus) {
      msg_out += `<br/><span style="color:#3498db;"><b>🛡️ ${esc(ffStatus.name)}:</b> ${ffStatus.remaining}/${ffStatus.threshold} remaining (deflected ${ffStatus.accum})</span>`;
      if (ffStatus.isGear) msg_out += ` <span style="color:#888;">[Gear]</span>`;
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
  // Usage: !mp atk N --atk TOKEN_ID --target TOKEN_ID [--mod N] [--push N] [--called TYPE]
  // Called types: None, Head, Arm, Leg, Light (Avoid Light Armor), Heavy (Avoid Heavy Armor), Gear
  // Macro: !mp atk ?{Attack|1|2|3} --atk @{selected|token_id} --target @{target|token_id} --push ?{Push|0} --mod ?{Modifier|0} --called ?{Called|None|Head|Arm|Leg|Light|Heavy|Gear}
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
      return ch("MP", `${wt(msg)}Usage: <code>!mp atk N --atk &#64;{selected|token_id} --target &#64;{target|token_id}</code>`);
    }

    const atkTokenId = args.atk;
    if (!atkTokenId) return ch("MP", `${wt(msg)}No attacker specified. Use --atk &#64;{selected|token_id}`);

    const atkTok = getObj("graphic", atkTokenId);
    if (!atkTok) return ch("MP", `${wt(msg)}Attacker token not found.`);

    const atkChar = getCharFromToken(atkTok);
    if (!atkChar) return ch("MP", `${wt(msg)}Attacker token not linked to character.`);
    const atkCharId = atkChar.id;
    const atkName = atkChar.get("name");

    // Permission check: player must control the attacking character
    if (!canControl(msg, atkCharId)) {
      return ch("MP", `${wt(msg)}You don't control ${esc(atkName)}.`);
    }

    const defTokenId = args.target;
    if (!defTokenId) return ch("MP", `${wt(msg)}No target specified. Use --target &#64;{target|token_id}`);

    const defTok = getObj("graphic", defTokenId);
    if (!defTok) return ch("MP", `${wt(msg)}Target token not found.`);

    const defChar = getCharFromToken(defTok);
    if (!defChar) return ch("MP", `${wt(msg)}Target token not linked to character.`);

    // Find attack row
    const rowId = findAttackRowByIndex(atkCharId, atkIndex);
    if (!rowId) return ch("MP", `/w gm Attack #${atkIndex} not found for ${esc(atkName)}.`);

    const getAtk = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    // Get attack attributes
    const attackName = getAtk("attack_name") || `Attack ${atkIndex}`;
    const damageRaw = getAtk("attack_damage") || "0";
    // Validate damage is a dice expression (numbers, d, +, -, spaces only)
    const damage = /^[\d\s+\-d*()]+$/i.test(damageRaw) ? damageRaw : "0";
    if (damage === "0" && damageRaw !== "0" && damageRaw !== "") {
      ch("MP", `${wt(msg)}⚠️ Invalid damage formula "${esc(damageRaw)}" - using 0`);
    }
    const tohitNum = num(getAtk("attack_tohit_num"), 10);
    const dmgTypeFull = resolveDmgType(getAtk("attack_dmgtype") || "Kin");
    const range = getAtk("attack_range") || "0";
    const kbDisplay = getAtk("attack_kb_display") || "No";
    const ap = getAtk("attack_ap") || "";
    const pushAmount = num(args.push, 0);  // 0=no push, 2=normal, 4+=special
    const hitMod = num(args.mod, 0);
    
    // Called shot support - accepts type name or abbreviation
    const calledRaw = (args.called || "None").trim();
    const calledMap = {
      "none": "None", "head": "Head", "arm": "Arm", "leg": "Leg",
      "avoidlight": "Avoid Light Armor", "light": "Avoid Light Armor",
      "avoidheavy": "Avoid Heavy Armor", "heavy": "Avoid Heavy Armor",
      "gear": "Gear"
    };
    const calledType = calledMap[calledRaw.toLowerCase()] || calledRaw;

    // Build and send the roll template - this triggers handleMpAttack
    // Push (positive) adds damage, Hold Back (negative) reduces damage
    const pushDmg = pushAmount !== 0 ? (pushAmount > 0 ? `+${pushAmount}` : `${pushAmount}`) : "";
    
    const rollMsg = `&{template:mpattack} {{mpapi=1}} {{playerid=${msg.playerid}}} {{atk=${atkCharId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{calledtype=${calledType}}} {{name=${atkName} - ${attackName}}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;

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
      return ch("MP", `${wt(msg)}Usage: <code>!mp sv BC [mod]</code> where BC = EN, AG, IN, or CL`);
    }

    const tok = getSelectedToken(msg);
    if (!tok) return ch("MP", `${wt(msg)}Select your token first.`);

    const char = getCharFromToken(tok);
    if (!char) return ch("MP", `${wt(msg)}Token not linked to character.`);
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
    
    html += `<div style="font-size:16px; font-weight:bold; color:${success ? '#27ae60' : '#e94560'};">`;
    if (nat === 1) html += `💥 CRITICAL SUCCESS!`;
    else if (nat === 20) html += `💀 CRITICAL FAILURE!`;
    else if (success) html += `✓ SUCCESS`;
    else html += `✗ FAILURE`;
    html += `</div>`;

    html += `<div style="color:#aaa; font-size:11px;"><b>Target:</b> ${target}- (${saveVal}${mod !== 0 ? (mod > 0 ? '+' : '') + mod : ''}) | <b>Roll:</b> ${nat}</div>`;
    html += `</div>`;

    chBoth("MP", html, msg);
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
      return ch("MP", `${wt(msg)}Usage: <code>!mp autofire N --atk &#64;{selected|token_id} --target &#64;{target|token_id}</code><br/>N = attack row number. Uses attack_autofire rate (2-7) from that row.`);
    }

    const atkTokenId = args.atk;
    if (!atkTokenId) return ch("MP", `${wt(msg)}No attacker specified. Use --atk &#64;{selected|token_id}`);

    const atkTok = getObj("graphic", atkTokenId);
    if (!atkTok) return ch("MP", `${wt(msg)}Attacker token not found.`);

    const atkChar = getCharFromToken(atkTok);
    if (!atkChar) return ch("MP", `${wt(msg)}Attacker token not linked to character.`);
    const atkCharId = atkChar.id;
    const atkName = atkChar.get("name");

    // Permission check: player must control the attacking character
    if (!canControl(msg, atkCharId)) {
      return ch("MP", `${wt(msg)}You don't control ${esc(atkName)}.`);
    }

    const defTokenId = args.target;
    if (!defTokenId) return ch("MP", `${wt(msg)}No target specified. Use --target &#64;{target|token_id}`);

    const defTok = getObj("graphic", defTokenId);
    if (!defTok) return ch("MP", `${wt(msg)}Target token not found.`);

    const defChar = getCharFromToken(defTok);
    if (!defChar) return ch("MP", `${wt(msg)}Target token not linked to character.`);

    // Find attack row
    const rowId = findAttackRowByIndex(atkCharId, atkIndexOrRate);
    if (!rowId) return ch("MP", `${wt(msg)}Attack #${atkIndexOrRate} not found for ${esc(atkName)}.`);

    const getAtk = (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

    // Get autofire rate from attack row
    const autofireRate = num(getAtk("attack_autofire"), 0);
    if (autofireRate < 2 || autofireRate > 7) {
      return ch("MP", `${wt(msg)}Attack #${atkIndexOrRate} does not have Autofire (rate 2-7). Set attack_autofire on the Setup tab.`);
    }

    // Get attack attributes
    const attackName = getAtk("attack_name") || `Attack ${atkIndexOrRate}`;
    const damageRaw = getAtk("attack_damage") || "0";
    // Validate damage is a dice expression (numbers, d, +, -, spaces only)
    const damage = /^[\d\s+\-d*()]+$/i.test(damageRaw) ? damageRaw : "0";
    if (damage === "0" && damageRaw !== "0" && damageRaw !== "") {
      ch("MP", `${wt(msg)}⚠️ Invalid damage formula "${esc(damageRaw)}" - using 0`);
    }
    const tohitNum = num(getAtk("attack_tohit_num"), 10);
    const dmgTypeFull = resolveDmgType(getAtk("attack_dmgtype") || "Kin");
    const range = getAtk("attack_range") || "0";
    const kbDisplay = getAtk("attack_kb_display") || "No";
    const ap = getAtk("attack_ap") || "";
    const pushAmount = num(args.push, 0);
    const hitMod = num(args.mod, 0);

    // Check PR cost - multiply by autofire rate
    const basePR = num(getAtk("attack_cost"), 0);
    const totalPR = basePR * autofireRate;
    
    // Check charges - multiply by autofire rate (-1 = unlimited)
    const chargesRaw = getAtk("attack_charges");
    const hasCharges = (chargesRaw !== undefined && chargesRaw !== null && String(chargesRaw).trim() !== "");
    const currentCharges = hasCharges ? num(chargesRaw, 0) : Infinity;
    const isUnlimitedCharges = (currentCharges === -1);
    
    if (hasCharges && !isUnlimitedCharges && currentCharges < autofireRate) {
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

    // Deduct charges upfront (skip if unlimited)
    if (hasCharges && !isUnlimitedCharges) {
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
    if (hasCharges) announceHtml += `<div style="color:#8be9fd; font-size:11px;">Charges: ${isUnlimitedCharges ? "∞" : `-${autofireRate} (${currentCharges - autofireRate} remaining)`}</div>`;
    announceHtml += `<div style="color:#aaa; font-size:10px; margin-top:4px;">Note: Targets must be adjacent. Rolling ${autofireRate} separate attacks...</div>`;
    announceHtml += `</div>`;
    ch("MP", `/w gm ` + announceHtml);

    // Roll each attack separately with slight delay to avoid race conditions
    // Push (positive) adds damage, Hold Back (negative) reduces damage
    const pushDmg = pushAmount !== 0 ? (pushAmount > 0 ? `+${pushAmount}` : `${pushAmount}`) : "";
    
    for (let shot = 1; shot <= autofireRate; shot++) {
      setTimeout(() => {
        // Build roll message - pass nopr=1 since we already deducted PR/charges upfront
        const rollMsg = `&{template:mpattack} {{mpapi=1}} {{playerid=${msg.playerid}}} {{atk=${atkCharId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{nopr=1}} {{name=${atkName} - ${attackName} (Shot ${shot}/${autofireRate})}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;
        
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
          // Usage: !mp test grapple [TOHIT] [lock] [remote] [gripdice]
          // Select 2 tokens: grappler first, target second
          testArgs.tohit = testParts[3] || "";
          testArgs.lock = "";
          testArgs.remote = "";
          testArgs.gripdice = "";
          // Parse remaining positional args
          for (let i = 4; i < testParts.length; i++) {
            const arg = testParts[i].toLowerCase();
            if (arg === "lock") testArgs.lock = "lock";
            else if (arg === "remote") testArgs.remote = "1";
            else if (/^\d*d\d+/i.test(testParts[i])) testArgs.gripdice = testParts[i];
          }
        }
        return cmdTest(msg, testArgs);
      case "stance":
        const stanceParts = msg.content.split(/\s+/);
        return cmdStance(msg, { stance: stanceParts[2] || "" });
      case "range":
        return cmdRange(msg, args);
      case "clearstances":
      case "clearstance":
        if (gmOnly(msg)) return;
        return cmdClearStances(msg, args);
      case "offbal":
      case "offbalance":
        if (gmOnly(msg)) return;
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
      case "conditions": 
        // Check for expired absorptions first
        if (args.target) checkAbsorptionExpiry(args.target);
        return cmdConditions(msg, args);
      case "checkexpiry": return cmdCheckExpiry(msg, args);
      case "clearcondition": return cmdClearCondition(msg, args);
      case "snare": return cmdSnare(msg, args);
      case "break": return cmdBreak(msg, args);
      case "kb": return cmdKnockback(msg, args);
      case "kbsave": return cmdKBSave(msg, args);
      case "grapple": return cmdGrapple(msg, args);
      case "squeeze": return cmdSqueeze(msg, args);
      case "grapplebreak": return cmdGrappleBreak(msg, args);
      case "grapplerelease": return cmdGrappleRelease(msg, args);

      case "grapplelock": return cmdGrappleLock(msg, args);
      case "countergrapple": return cmdCounterGrapple(msg, args);

      // Area effect commands
      case "areaescape": return cmdAreaEscape(msg, args);
      case "areashield": return cmdAreaShield(msg, args);
      case "arearollnpcs":
        if (gmOnly(msg)) return;
        return cmdAreaRollNPCs(msg, args);
      case "areaforceall":
        if (gmOnly(msg)) return;
        return cmdAreaForceAll(msg, args);
      case "areadamageall":
        if (gmOnly(msg)) return;
        return cmdAreaDamageAll(msg, args);

      // Absorption/Reflection commands
      case "absorb": return cmdAbsorb(msg, args);
      case "reflect": return cmdReflect(msg, args);
      case "reflecthit": return cmdReflectHit(msg, args);

      // Ability Field commands
      case "afield": return cmdAbilityField(msg, args);
      case "afresume": return cmdAFResume(msg, args);
      case "afcancel": return cmdAFCancel(msg, args);
      case "afcounter": return cmdAFCounter(msg, args);

      // Force Field commands
      case "ffreset": return cmdFFReset(msg, args);
      case "ffreinforce": return cmdFFReinforce(msg, args);
      case "ff": return cmdFFToggle(msg, args);

      // Round tracking
      case "round":
        if (gmOnly(msg)) return;
        return cmdRound(msg, args);

      // Undo
      case "undo":
        if (gmOnly(msg)) return;
        return cmdUndo(msg, args);

      case "escape": return cmdEscape(msg, args);
      case "wakeup": return cmdWakeup(msg, args);
      case "status": return cmdStatus(msg, args);
      case "stat": return testStatus(msg, args);  // Detailed status with protections, roll-with cap
      case "restore":
        if (gmOnly(msg)) return;
        return cmdRestore(msg, args);
      case "vehicle":
      case "veh":
        if (gmOnly(msg)) return;
        return cmdVehicle(msg, args);
      case "showbars":
        if (gmOnly(msg)) return;
        return cmdShowBars(msg, args);
      case "info": return cmdInfo(msg, args);
      case "atkinfo": return cmdAttackInfo(msg, args);
      case "atk": return cmdQuickAttack(msg, args);
      case "autofire": return cmdAutofire(msg, args);
      case "sv": return cmdQuickSave(msg, args);
      case "debug":
        if (gmOnly(msg)) return;
        const debugArg = msg.content.split(/\s+/)[2];
        if (debugArg === "tokens") {
          // Search current player page only
          const pageId = Campaign().get("playerpageid");
          const page = getObj("page", pageId);
          const pageName = page ? page.get("name") : "unknown";
          const tokens = findObjs({_type:"graphic", _pageid:pageId, _subtype:"token"});
          const byChar = {};
          tokens.forEach(t => {
            const r = t.get("represents");
            if (r) {
              byChar[r] = byChar[r] || [];
              byChar[r].push(t);
            }
          });
          let out = `<b>Token Report (${esc(pageName)}):</b><br/>`;
          Object.keys(byChar).forEach(k => {
            const c = getObj("character", k);
            const name = c ? c.get("name") : k;
            const toks = byChar[k];
            if (toks.length > 1) {
              out += `<span style="color:#ff6b6b;">⚠️ ${esc(name)} - ${toks.length} tokens:</span><br/>`;
            } else {
              out += `${esc(name)}:<br/>`;
            }
            toks.forEach(t => {
              out += `&nbsp;&nbsp;(${Math.round(t.get("left"))}, ${Math.round(t.get("top"))}) ${t.get("layer")}<br/>`;
            });
          });
          return ch("MP", "/w gm " + out);
        }
        if (debugArg === "deltoken") {
          const coords = msg.content.split(/\s+/)[3];
          if (!coords || !coords.includes(",")) {
            return ch("MP", "/w gm Usage: <code>!mp debug deltoken X,Y</code>");
          }
          const [xStr, yStr] = coords.split(",");
          const x = parseInt(xStr), y = parseInt(yStr);
          ch("MP", `/w gm Looking for token near (${x}, ${y})...`);
          // Search ALL pages, not just player page
          const tokens = findObjs({_type:"graphic", _subtype:"token"});
          const match = tokens.find(t => Math.abs(t.get("left") - x) < 50 && Math.abs(t.get("top") - y) < 50);
          if (match) {
            const c = getObj("character", match.get("represents"));
            const name = c ? c.get("name") : "Unknown";
            const pageid = match.get("_pageid");
            const page = getObj("page", pageid);
            const pageName = page ? page.get("name") : "unknown page";
            match.remove();
            return ch("MP", `/w gm ✅ Deleted ${esc(name)} token at (${x}, ${y}) on page "${esc(pageName)}"`);
          }
          return ch("MP", `/w gm ❌ No token found near (${x}, ${y}) on any page`);
        } else if (debugArg === "absorb") {
          // Debug absorption setup for selected token
          const tok = getSelectedToken(msg);
          if (!tok) return ch("MP", `/w gm Select a token to check absorption setup.`);
          const char = getCharFromToken(tok);
          if (!char) return ch("MP", `/w gm Token not linked to character.`);
          const charId = char.id;
          const charName = char.get("name");
          
          const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
          const rowIds = new Set();
          attrs.forEach(a => {
            const n = a.get("name");
            const match = n.match(/^repeating_protection_([^_]+)_/);
            if (match) rowIds.add(match[1]);
          });
          
          let out = `<b>${esc(charName)} Protection Rows:</b><br/>`;
          for (const rowId of rowIds) {
            const nameAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_name`);
            const stateAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_state`);
            const modeAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_mode`);
            const brokenAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_broken`);
            const kinAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_kinetic`);
            const engAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_energy`);
            const bioAttr = attrs.find(a => a.get("name") === `repeating_protection_${rowId}_prot_bio`);
            
            const name = nameAttr ? nameAttr.get("current") : "(unnamed)";
            const state = stateAttr ? stateAttr.get("current") : "?";
            const mode = modeAttr ? modeAttr.get("current") : "normal";
            const broken = brokenAttr && brokenAttr.get("current") === "1" ? "BROKEN" : "";
            const kin = kinAttr ? kinAttr.get("current") : "0";
            const eng = engAttr ? engAttr.get("current") : "0";
            const bio = bioAttr ? bioAttr.get("current") : "0";
            
            let rowColor = "#eee";
            if (mode === "absorption" || mode === "reflection") rowColor = "#d4edda";
            if (state === "Off") rowColor = "#f8d7da";
            if (broken) rowColor = "#f5c6cb";
            
            out += `<div style="background:${rowColor}; padding:2px; margin:1px;">`;
            out += `<b>${esc(name)}</b> [${mode}]<br/>`;
            out += `State: ${state}${broken ? " ⚠️" + broken : ""}<br/>`;
            out += `Kin:${kin} Eng:${eng} Bio:${bio}`;
            out += `</div>`;
          }
          if (rowIds.size === 0) out += `<i>No protection rows found.</i>`;
          return ch("MP", `/w gm ` + out);
        }
        return ch("MP", "/w gm Debug commands: <code>!mp debug tokens</code>, <code>!mp debug deltoken X,Y</code>, <code>!mp debug absorb</code>");
      // ── MP Builder Import/Export ──
      case "export":
        if (gmOnly(msg)) return;
        return cmdMPExport(msg);
      case "import":
        if (gmOnly(msg)) return;
        return cmdMPImport(msg, args);
      case "gwspawn":
        if (gmOnly(msg)) return;
        return cmdGWSpawn(msg, args);

      case "help":
      default:
        return ch("MP", `/w gm <b>MP Engine v2.66.1</b> Commands:<br/>
          <b>Quick Macros:</b><br/>
          <code>!mp atk N --atk TOKID --target TOKID [--mod N] [--push N] [--called TYPE]</code><br/>
          <code>!mp autofire N --atk TOKID --target TOKID</code> - Autofire attack row N<br/>
          <code>!mp sv BC [mod]</code> - Save (EN/AG/IN/CL)<br/>
          <b>Combat:</b><br/>
          <code>!mp apply --id ID --mode MODE --amt N</code><br/>
          <code>!mp limbsave --id ID --limb leg|arm</code><br/>
          <code>!mp save --id ID --rollwith N --critmod N</code><br/>
          <code>!mp recover --target TOKID --idx N</code> - Recovery for condition #N<br/>
          <code>!mp conditions --target TOKID</code> - List active conditions<br/>
          <code>!mp clearcondition --target TOKID --idx N</code> - Clear condition #N<br/>
          <code>!mp snare --id ID --bonus N</code><br/>
          <code>!mp break --target TOKID --push 0|1</code><br/>
          <code>!mp kb --id ID</code><br/>
          <code>!mp kbsave --target TOKID --penalty N</code><br/>
          <code>!mp grapple --atk TOKID --def TOKID</code><br/>
          <code>!mp grapplelock --target TOKID</code><br/>
          <code>!mp escape --target TOKID</code><br/>
          <code>!mp grapplebreak --target TOKID --pushdef 0|1 --pushatk 0|1</code><br/>
          <code>!mp countergrapple --target TOKID --wrestle 0|1</code><br/>
          <b>Force Field:</b><br/>
          <code>!mp ff --target TOKID</code> - Toggle FF on/off (spends PR on activate, toggles aura)<br/>
          <code>!mp ffreset --target TOKID</code> - Renew FF (zero accum, PR cost)<br/>
          <code>!mp ffreinforce --id ID</code> - Reinforce FF with saved action at collapse<br/>
          <code>!mp wakeup --target TOKID</code><br/>
          <code>!mp status --target TOKID</code><br/>          <code>!mp stat</code> (select token - detailed status with protections)<br/>          <code>!mp info --name &lt;Ability/Weakness&gt;</code><br/>
          <b>Vehicle:</b><br/>
          <code>!mp vehicle [--on|--off]</code> - Toggle vehicle mode on dedicated vehicle token<br/>

          <b>Stances (Bar3):</b><br/>
          <code>!mp stance normal|def|full|offbal|N</code><br/>
          <code>!mp clearstances</code> - Clear all on page<br/>
          <code>!mp offbal</code> - Apply Off Balance to selected<br/>
          <b>Range:</b><br/>
          <code>!mp range</code> - Check range between 2 selected tokens<br/>
          <b>Round Tracking:</b><br/>
          <code>!mp round</code> - Advance to next round<br/>
          <code>!mp round +N</code> - Advance N rounds<br/>
          <code>!mp round set N</code> - Set to round N<br/>
          <code>!mp round show</code> - Show current round<br/>
          <b>Undo:</b><br/>
          <code>!mp undo --id ID</code> - Undo a combat card (use the card's ↩ Undo button)<br/>
          <b>MP Builder Sync:</b><br/>
          <code>!mp export</code> - Export selected token to handout JSON (for MP Builder)<br/>
          <code>!mp import --name HandoutName</code> - Import MP Builder JSON from handout<br/>
          <b>Test Commands:</b><br/>
          <code>!mp test</code> - Show all test commands<br/>
          <code>!mp test grapple [TOHIT] [lock]</code> - Grapple harness (select 2 tokens: grappler, target)
   `);
    }
  }

  // -------------------------
  // MP BUILDER IMPORT/EXPORT
  // -------------------------

  // BC mapping: builder stats key → Roll20 prefix
  const MP_BC_MAP = { st:'strength', en:'endurance', ag:'agility', 'in':'intelligence', cl:'cool' };

  function cmdMPExport(msg) {
    const tok = getSelectedToken(msg);
    if (!tok) return ch("MP", "/w gm Select a token to export.");
    const char = getCharFromToken(tok);
    if (!char) return ch("MP", "/w gm Token not linked to character.");
    const charId = char.id;
    const allAttrs = findObjs({ type: 'attribute', characterid: charId });
    const a = {};
    allAttrs.forEach(attr => { a[attr.get('name')] = attr.get('current'); });

    const data = {};
    // Character name from the character object (not attr)
    data.name = char.get('name') || a['character_name'] || '';
    // Identity
    data.trueId = a['true_id'] || '';
    data.side = a['side'] || '';
    data.birthplace = a['birthplace'] || '';
    data.species = a['species'] || '';
    data.culture = a['culture'] || '';
    data.age = a['age'] || '';
    data.gender = a['gender'] || '';
    data.weight = a['weight'] || '';
    data.mass = a['mass'] || '';
    data.motivation = a['motivation'] || '';
    data.wealth = a['wealth'] || '';
    data.originType = a['origin'] || '';
    data.luck = a['luck'] || '';
    data.legalStatus = a['legal_status'] || '';
    data.player = a['player_name'] || '';
    data.inventing = a['base_ip'] || '';

    // XP: starting_eps is the base budget, total_eps is BC+Ability costs
    // xpBase on builder = starting_eps
    // xpEarned on builder = ep_earned
    // xpSpent on builder = total_eps - starting_eps (how much earned XP was consumed)
    // xpTotal on builder = total_eps (or starting_eps + ep_earned for cap purposes)
    const startingEps = parseInt(a['starting_eps']) || 0;
    const epEarned = parseInt(a['ep_earned']) || 0;
    const totalEps = parseInt(a['total_eps']) || 0;
    data.xpBase = String(startingEps);
    data.xpEarned = String(epEarned);
    data.xpSpent = String(Math.max(0, totalEps - startingEps));
    data.xpTotal = String(startingEps + epEarned);

    // Power level (inferred from starting_eps = base CP budget)
    const plMap = { 50: 'normal', 100: 'low', 150: 'standard', 200: 'high' };
    data.powerLevel = plMap[startingEps] || (startingEps > 150 ? 'high' : startingEps > 100 ? 'standard' : startingEps > 50 ? 'low' : 'normal');

    // Story/Bio from character bio field (not an attribute)
    char.get('bio', function(bio) {
      if (bio) {
        // Strip HTML
        data.story = bio.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
      } else {
        data.story = '';
      }

      finishExport(char, charId, allAttrs, a, data, msg);
    });
  }

  function finishExport(char, charId, allAttrs, a, data, msg) {

    // BCs
    data.stats = {};
    Object.keys(MP_BC_MAP).forEach(bk => {
      const p = MP_BC_MAP[bk];
      data.stats[bk] = { cp: a[p + '_cost'] || '0', score: a[p + '_score'] || '0', save: a[p + '_save'] || '' };
    });

    // Derived
    data.carry = a['carry_capacity'] || '';
    data.baseDmg = a['hth_damage'] || '';
    data.initiative = a['initiative_score'] || '';
    data.move = a['move'] || '';
    data.power = a['power_score'] || '';
    data.powerSrc = a['power_score_max'] || '';
    data.hitPts = a['hits_score'] || '';
    data.hitPtsSrc = a['hits_score_max'] || '';
    data.healing = a['healing_rate'] || '';
    data.defPhysical = a['physical_def'] || '';
    data.defMental = a['mental_def'] || '';

    // Abilities (repeating)
    data.abilities = [];
    const abilityIds = [];
    allAttrs.forEach(attr => {
      const m = attr.get('name').match(/^repeating_abilities_([^_]+)_ability_name$/);
      if (m) abilityIds.push(m[1]);
    });
    abilityIds.forEach(id => {
      data.abilities.push({
        cp: a['repeating_abilities_' + id + '_ability_cp'] || '',
        desc: a['repeating_abilities_' + id + '_ability_name'] || '',
        ip: a['repeating_abilities_' + id + '_ability_ip'] || '',
      });
    });
    while (data.abilities.length < 12) data.abilities.push({ cp: '', desc: '', ip: '' });

    // Attacks (repeating)
    data.attacks = [];
    const attackIds = [];
    allAttrs.forEach(attr => {
      const m = attr.get('name').match(/^repeating_attacks_([^_]+)_attack_name$/);
      if (m) attackIds.push(m[1]);
    });
    attackIds.forEach(id => {
      data.attacks.push({
        name: a['repeating_attacks_' + id + '_attack_name'] || '',
        toHit: a['repeating_attacks_' + id + '_attack_tohit'] || '',
        damage: a['repeating_attacks_' + id + '_attack_damage'] || '',
        dmgType: a['repeating_attacks_' + id + '_attack_dmgtype'] || '',
        kb: a['repeating_attacks_' + id + '_attack_kb'] || '',
      });
    });
    while (data.attacks.length < 3) data.attacks.push({ name: '', toHit: '', damage: '', dmgType: '', kb: '' });

    // Careers → background
    const careerIds = [];
    allAttrs.forEach(attr => {
      const m = attr.get('name').match(/^repeating_careers_([^_]+)_career_name$/);
      if (m) careerIds.push(m[1]);
    });
    data.background = careerIds.map(id => a['repeating_careers_' + id + '_career_name'] || '').filter(Boolean).join(', ');

    // Protection (repeating → protKinetic, protKinetic2, etc.)
    const protIds = [];
    allAttrs.forEach(attr => {
      const m = attr.get('name').match(/^repeating_protection_([^_]+)_prot_name$/);
      if (m) protIds.push(m[1]);
    });
    const protTypes = ['kinetic', 'energy', 'bio', 'entropy', 'psychic', 'other'];
    protIds.forEach((id, idx) => {
      const suffix = idx === 0 ? '' : String(idx + 1);
      protTypes.forEach(t => {
        const key = 'prot' + t.charAt(0).toUpperCase() + t.slice(1) + suffix;
        data[key] = a['repeating_protection_' + id + '_prot_' + t] || '';
      });
    });

    // Write to handout
    const charName = char.get('name') || 'export';
    const handoutName = 'MP Export: ' + charName;
    let handout = findObjs({ type: 'handout', name: handoutName })[0];
    if (!handout) handout = createObj('handout', { name: handoutName });
    handout.set('notes', '<pre>' + JSON.stringify(data, null, 2) + '</pre>');

    ch("MP", `/w gm Exported <b>${esc(charName)}</b> → handout <b>${esc(handoutName)}</b>. Copy the JSON to import into MP Builder.`);
  }

  function cmdMPImport(msg, args) {
    const handoutName = args.name || args.handout || '';
    if (!handoutName) return ch("MP", "/w gm Usage: <code>!mp import --name HandoutName</code>");

    const handout = findObjs({ type: 'handout', name: handoutName })[0];
    if (!handout) return ch("MP", `/w gm Handout "${esc(handoutName)}" not found.`);

    handout.get('gmnotes', function(gmnotes) {
      handout.get('notes', function(notes) {
        let raw = gmnotes || notes || '';
        raw = raw.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;|\u00a0/g, ' ').replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'").trim();

        let data;
        try { data = JSON.parse(raw); } catch(e) {
          return ch("MP", `/w gm Failed to parse JSON: ${esc(e.message)}`);
        }
        return buildCharacterFromMPData(data, `handout <b>${esc(handoutName)}</b>`);
      });
    });
  }

  // Build/refresh a character from an MP Builder data object. Shared by
  // !mp import (handout JSON) and !mp gwspawn (embedded bestiary block).
  // sourceLabel is shown in the confirmation whisper.
  function buildCharacterFromMPData(data, sourceLabel) {
        const charName = data.name || 'Imported Character';
        let char = findObjs({ type: 'character', name: charName })[0];
        if (!char) char = createObj('character', { name: charName });
        // Set name on the character object (Roll20 uses this, not the attribute)
        char.set('name', charName);
        const charId = char.id;

        // Set bio (character & bio tab) if story is present
        if (data.story) {
          char.set('bio', data.story);
        }

        function setAttr(name, val) {
          if (val === undefined || val === null || val === '') return;
          const existing = findObjs({ type: 'attribute', characterid: charId, name: name })[0];
          if (existing) existing.set('current', String(val));
          else createObj('attribute', { characterid: charId, name: name, current: String(val) });
        }

        // Identity
        setAttr('character_name', data.name);
        setAttr('true_id', data.trueId);
        setAttr('side', data.side);
        setAttr('birthplace', data.birthplace);
        setAttr('species', data.species);
        setAttr('culture', data.culture);
        setAttr('age', data.age);
        setAttr('gender', data.gender);
        setAttr('weight', data.weight);
        setAttr('mass', data.mass);
        setAttr('motivation', data.motivation);
        setAttr('wealth', data.wealth);
        setAttr('origin', data.originType);
        setAttr('luck', data.luck);
        setAttr('legal_status', data.legalStatus);
        setAttr('player_name', data.player);
        setAttr('base_ip', data.inventing);
        // Initiative die (e.g. "d6+1"). The sheet only computes this on
        // sheet:opened, so API-built characters need it set explicitly or the
        // sheet's Initiative roll button has no die and never posts to the
        // turn tracker. MP Builder exports carry it as `initiative`.
        setAttr('initiative_score', data.initiative);
        // Current/max Hits and Power. As with the init die, the sheet only copies
        // current <- max on sheet:opened, so an API-built character reads 0 Hits in
        // combat until its sheet is opened. setAttr skips empty values, so MP Builder
        // imports that omit these are unaffected (the sheet still computes on open).
        setAttr('hits_score', data.hitPts);
        setAttr('hits_score_max', data.hitPtsSrc);
        setAttr('power_score', data.power);
        setAttr('power_score_max', data.powerSrc);
        // XP: starting_eps = base budget, ep_earned = earned during play
        // total_eps on Roll20 is auto-calculated by sheet workers (BC+Ability costs)
        // So we only set starting_eps and ep_earned; the sheet recalculates total_eps
        setAttr('starting_eps', data.xpBase);
        setAttr('ep_earned', data.xpEarned);

        // BCs (cost = BASE characteristic; ability mods below raise it to effective)
        if (data.stats) {
          Object.keys(MP_BC_MAP).forEach(bk => {
            const p = MP_BC_MAP[bk];
            const s = data.stats[bk];
            if (s) setAttr(p + '_cost', s.cp);
          });
        }

        // Aggregate ability mods: pre-seed the rolled-up modifier fields so derived
        // scores (BCs, Hits, Power, Move) are correct before the sheet is first opened.
        // recalcAbilityBonuses recomputes these identically from the per-row mods.
        if (data.aggmods) {
          Object.keys(data.aggmods).forEach(ak => setAttr(ak, data.aggmods[ak]));
        }

        // Repeating: Abilities
        if (data.abilities) {
          findObjs({ type: 'attribute', characterid: charId })
            .filter(a => a.get('name').startsWith('repeating_abilities_'))
            .forEach(a => a.remove());
          data.abilities.forEach((ab, idx) => {
            if (!ab.desc && !ab.cp) return;
            const rowId = generateRowID();
            const p = 'repeating_abilities_' + rowId + '_';
            createObj('attribute', { characterid: charId, name: p + 'ability_name', current: ab.desc || '' });
            createObj('attribute', { characterid: charId, name: p + 'ability_cp', current: ab.cp || '' });
            createObj('attribute', { characterid: charId, name: p + 'ability_ip', current: ab.ip || '' });
            createObj('attribute', { characterid: charId, name: p + 'ability_num', current: String(idx + 1) });
            if (ab.mods) {
              Object.keys(ab.mods).forEach(mk => {
                createObj('attribute', { characterid: charId, name: p + 'ability_' + mk, current: String(ab.mods[mk]) });
              });
              createObj('attribute', { characterid: charId, name: p + 'ability_state', current: 'Active' });
            }
          });
        }

        // Repeating: Attacks
        if (data.attacks) {
          findObjs({ type: 'attribute', characterid: charId })
            .filter(a => a.get('name').startsWith('repeating_attacks_'))
            .forEach(a => a.remove());
          data.attacks.forEach((atk, idx) => {
            if (!atk.name && !atk.damage) return;
            const rowId = generateRowID();
            const p = 'repeating_attacks_' + rowId + '_';
            createObj('attribute', { characterid: charId, name: p + 'attack_name', current: atk.name || '' });
            createObj('attribute', { characterid: charId, name: p + 'attack_tohit', current: atk.toHit || '' });
            createObj('attribute', { characterid: charId, name: p + 'attack_damage', current: atk.damage || '' });
            createObj('attribute', { characterid: charId, name: p + 'attack_dmgtype', current: atk.dmgType || '' });
            createObj('attribute', { characterid: charId, name: p + 'attack_kb', current: atk.kb || '' });
            createObj('attribute', { characterid: charId, name: p + 'attack_num', current: String(idx + 1) });
          });
        }

        // Repeating: Careers
        if (data.background) {
          findObjs({ type: 'attribute', characterid: charId })
            .filter(a => a.get('name').startsWith('repeating_careers_'))
            .forEach(a => a.remove());
          data.background.split(',').map(s => s.trim()).filter(Boolean).forEach(career => {
            const rowId = generateRowID();
            createObj('attribute', { characterid: charId, name: 'repeating_careers_' + rowId + '_career_name', current: career });
          });
        }

        // Repeating: Protection
        const protTypes = ['kinetic', 'energy', 'bio', 'entropy', 'psychic', 'other'];
        findObjs({ type: 'attribute', characterid: charId })
          .filter(a => a.get('name').startsWith('repeating_protection_'))
          .forEach(a => a.remove());
        for (let row = 0; row < 3; row++) {
          const suffix = row === 0 ? '' : String(row + 1);
          const hasData = protTypes.some(t => {
            const key = 'prot' + t.charAt(0).toUpperCase() + t.slice(1) + suffix;
            return data[key] && data[key] !== '';
          });
          if (!hasData) continue;
          const rowId = generateRowID();
          const p = 'repeating_protection_' + rowId + '_';
          createObj('attribute', { characterid: charId, name: p + 'prot_name', current: 'Protection ' + (row + 1) });
          protTypes.forEach(t => {
            const key = 'prot' + t.charAt(0).toUpperCase() + t.slice(1) + suffix;
            if (data[key]) createObj('attribute', { characterid: charId, name: p + 'prot_' + t, current: data[key] });
          });
        }

        ch("MP", `/w gm Imported <b>${esc(charName)}</b> from ${sourceLabel}.`);
  }

  // -------------------------
  // GW BESTIARY SPAWN — !mp gwspawn --name NAME [--form FORM]
  // Builds an NPC from embedded MP_GW_BESTIARY (sibling API script
  // mp_gw_bestiary.js), reusing the buildCharacterFromMPData pipeline.
  // -------------------------
  function cmdGWSpawn(msg, args) {
    if (typeof MP_GW_BESTIARY === "undefined" || !MP_GW_BESTIARY) {
      return ch("MP", "/w gm GW bestiary data not loaded. Add <b>mp_gw_bestiary.js</b> as an API script in this campaign.");
    }
    const name = (args.name || "").trim();
    if (!name) return ch("MP", "/w gm Usage: <code>!mp gwspawn --name Blight</code> (multi-form creatures: add <code>--form Thinker</code>)");
    if (typeof MP_GW_VEHICLES !== "undefined" && MP_GW_VEHICLES && MP_GW_VEHICLES[name.toLowerCase()]) {
      return emitVehicleJSON(MP_GW_VEHICLES[name.toLowerCase()]);
    }
    const forms = MP_GW_BESTIARY[name.toLowerCase()];
    if (!forms || !forms.length) {
      const all = Object.keys(MP_GW_BESTIARY);
      const near = all.filter(k => k.indexOf(name.toLowerCase()) >= 0).slice(0, 8)
        .map(k => `[${esc(k)}](!mp gwspawn --name ${esc(k)})`).join(" ");
      return ch("MP", `/w gm No GW creature named <b>${esc(name)}</b>.` + (near ? `<br/>Did you mean: ${near}` : ` (${all.length} creatures loaded)`));
    }
    let block = forms[0];
    if (forms.length > 1) {
      const want = (args.form || "").trim().toLowerCase();
      block = want ? forms.find(f => String(f.form || "").toLowerCase().indexOf(want) >= 0) : null;
      if (!block) {
        const btns = forms.map(f => {
          const lbl = String(f.form || "").replace(/^.*[—:]\s*/, "").trim() || f.name;
          return `[${esc(lbl)}](!mp gwspawn --name ${esc(name)} --form ${esc(lbl)})`;
        }).join(" ");
        return ch("MP", `/w gm <b>${esc(name)}</b> has ${forms.length} forms — pick one: ${btns}`);
      }
    }
    return buildCharacterFromMPData(JSON.parse(JSON.stringify(block)), `GW bestiary (<b>${esc(block.name)}</b>)`);
  }

  // -------------------------
  // GW VEHICLE SPAWN — emits builder-format JSON (FLYER.json schema, version 10)
  // for the named MP_GW_VEHICLES entry, for import into the MP Vehicle builder.
  // Vehicles (Death Machine, Borg) are modeled as MP Vehicles, not characters; this
  // path shadows the dormant character bestiary entries of the same name.
  // -------------------------
  // NOTE on modifier fields: pr/charges/range/timereq are STEP INDICES the builder reads,
  // not raw values, and their CP cost is relative to the ability's base step (see vehMkSystem).
  // Neutral (0-CP) indices: timereq=2 ("1 Phase"); pr/charges = the ability's base PR index;
  // range = base-range index. Writing 0 selects the most expensive end (No Time / Unlimited).
  function vehDefaultAbility() {
    return { abId: null, abilityCp: 0, spaces: 0, area: 0, ap: 0, autofire: 0, duration: 0,
      hardened: 0, gear: false, bulky: 0, delicate: 0, pr: 0, charges: 0, range: 6, conc: 0,
      kb: 0, breakdown: 0, partial: 0, poorpen: 0, obvious: 0, carrier: 0, dmgtype: 0, indirect: 0,
      timereq: 2, activation: 0, loss: 0, canthold: 0, linked: false, multi: 0, usable: 0,
      reqsave: 0, other: 0, integral: false, open: false, indep: false, wontexplode: false,
      arc: 0, notes: "", abilityMods: {}, descMode: "compact" };
  }

  // Base PR per ability (for computing the neutral PR/charges step index). PR/charges cost is
  // (baseIdx - selectedIdx) * 2.5, so selecting baseIdx yields 0 CP. Confirmed vs FLYER.json:
  // a base-PR-16 Force Field stores pr=8/charges=8; base-PR-1 Power Blast stores pr=1/charges=1.
  const VEH_PR_VALUES = [0, 1, 2, 3, 4, 5, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192];
  function vehPrScaleIndex(basePR) {
    for (let i = 0; i < VEH_PR_VALUES.length; i++) if (VEH_PR_VALUES[i] >= basePR) return i;
    return VEH_PR_VALUES.length - 1;
  }
  const VEH_BASE_PR = { "power-blast": 1, "force-field": 16, "disintegration": 2,
    "negation": 1, "paralysis": 3, "change-environment": 1 };

  function vehMkSystem(e, id) {
    const sys = { id: id, spaces: e.sp || 0, extraCPs: e.extraCPs || 0, desc: e.desc || "",
      dmg: e.dmg || "", cells: [], integral: !!e.integral, bulky: e.bulky || 0, delicate: 0,
      open: false, adjST: e.adjST || 0, adjEN: e.adjEN || 0, adjAG: e.adjAG || 0,
      adjIN: e.adjIN || 0, adjCL: e.adjCL || 0, abilityData: null, hideLabels: false };
    if (e.abId) {
      const a = vehDefaultAbility();
      a.abId = e.abId; a.abilityCp = e.cp || 0; a.spaces = e.sp || 0; a.integral = !!e.integral;
      // PR/charges as scale INDICES. basePR sets the 0-CP step; data `pr` is the chosen PR VALUE.
      const basePR = (VEH_BASE_PR[e.abId] != null) ? VEH_BASE_PR[e.abId] : (e.pr != null ? e.pr : 0);
      const baseIdx = vehPrScaleIndex(basePR);
      a.pr = vehPrScaleIndex(e.pr != null ? e.pr : basePR); // PR value -> index (base => 0 CP)
      a.charges = baseIdx;                                   // neutral charges (0 CP); matches FLYER
      if (e.range != null) a.range = e.range;                // range-code index (0 LoS .. 10 Touch)
      if (e.autofire != null) a.autofire = e.autofire;       // autofire step index
      if (e.area != null) a.area = e.area;                   // area-effect step index
      sys.abilityData = a;
    }
    return sys;
  }

  // sizeKey -> [ST, EN, Hits] (MP vehicle size table) for currentHits/currentPower seeding
  const VEH_SIZE = {
    0:[15,15,13], 5:[18,18,16], 10:[21,21,20], 12.5:[22,23,23], 15:[24,24,25], 17.5:[25,26,27],
    20:[27,27,29], 22.5:[28,29,31], 25:[30,30,33], 27.5:[31,32,36], 30:[33,33,38], 32.5:[34,35,40],
    35:[36,36,41], 37.5:[37,38,44], 40:[39,39,46], 42.5:[40,41,48], 45:[42,42,50], 50:[45,45,54]
  };

  function buildVehicleFromMPData(vdef) {
    const arm = vdef.armor || [0, 0, 0, 0, 0];
    const sz = VEH_SIZE[vdef.sizeKey] || [0, 0, 0];
    const bc = vdef.bcs || {};
    const power = sz[0] + sz[1] + (bc.ag || 0) + (bc.in || 0);
    const systems = (vdef.systems || []).map((e, i) => vehMkSystem(e, i + 1));
    const layout = vehApplyLayout(systems, vdef.layout);
    return {
      version: 10, type: "mp-vehicle",
      name: vdef.name || "", model: vdef.model || "", operator: vdef.operator || "",
      basicCost: vdef.sizeKey, techMod: vdef.techMod || 0, maneuverMod: vdef.maneuverMod || 0,
      wontExplode: !!vdef.wontExplode, isBase: !!vdef.isBase,
      armorKin: arm[0] || 0, armorEng: arm[1] || 0, armorBio: arm[2] || 0,
      armorEnt: arm[3] || 0, armorPsy: arm[4] || 0,
      currentHits: sz[2], currentPower: power,
      systems: systems,
      keyEntries: [], pictureData: "", pictureHeight: 125,
      silhouette: { data: "", gx: 0, gy: 0, gw: 9, gh: 9, rot: 0, color: "#000000", alpha: 0.5 },
      remainingCells: layout.remainingCells, walls: layout.walls
    };
  }

  // Auto-tile each FUNCTIONAL system (has abId, not integral, spaces>0) into a cols-wide
  // rectangle so the emitted vehicle imports with a painted layout. 1 cell = 1 system space
  // (MP 2.5' layout square). Cell color is derived by the builder from each system's desc
  // (MP.sysColor), so blocks match the system-row swatches automatically. Structural rows
  // (abId null, e.g. the hull) and integral systems are not painted. cols comes from
  // vdef.layout.cols, else a near-square. A hull wall border is traced around the painted shape.
  function vehApplyLayout(systems, layoutDef) {
    let functional = 0;
    for (const s of systems) if (s.abilityData && !s.integral && s.spaces > 0) functional += s.spaces;
    if (!functional) return { remainingCells: [], walls: [] };
    const cols = (layoutDef && layoutDef.cols) || Math.max(1, Math.ceil(Math.sqrt(functional)));
    let pos = 0;
    for (const s of systems) {
      if (s.abilityData && !s.integral && s.spaces > 0) {
        const cells = [];
        for (let k = 0; k < s.spaces; k++) { cells.push({ gx: pos % cols, gy: Math.floor(pos / cols) }); pos++; }
        s.cells = cells;
      }
    }
    return { remainingCells: [], walls: vehTraceHull(systems) };
  }

  function vehTraceHull(systems) {
    const occ = new Set();
    systems.forEach(s => (s.cells || []).forEach(c => occ.add(c.gx + "," + c.gy)));
    const has = (x, y) => occ.has(x + "," + y);
    const norm = (gx, gy, e) => e === "b" ? { gx: gx, gy: gy + 1, edge: "t" }
      : e === "r" ? { gx: gx + 1, gy: gy, edge: "l" } : { gx: gx, gy: gy, edge: e };
    const seen = new Set(); const walls = [];
    const edges = [["t", 0, -1], ["b", 0, 1], ["l", -1, 0], ["r", 1, 0]];
    for (const key of occ) {
      const p = key.split(","); const gx = +p[0], gy = +p[1];
      for (const ed of edges) {
        if (!has(gx + ed[1], gy + ed[2])) {
          const n = norm(gx, gy, ed[0]); const k = n.gx + "," + n.gy + "," + n.edge;
          if (!seen.has(k)) { seen.add(k); walls.push({ gx: n.gx, gy: n.gy, edge: n.edge, type: "wall" }); }
        }
      }
    }
    return walls;
  }

  function emitVehicleJSON(vdef) {
    const obj = buildVehicleFromMPData(vdef);
    const json = JSON.stringify(obj);
    const spaces = (vdef.systems || []).reduce((a, s) => a + (s.sp || 0), 0);
    log("=== MP GW VEHICLE EXPORT (" + obj.name + ") — copy the line below into the MP Vehicle builder import ===");
    log(json);
    return ch("MP", "/w gm <b>🚗 " + esc(obj.name) + "</b> — builder JSON emitted to the <b>API script console</b> (copy from there to import).<br/>" +
      "<span style=\"font-size:11px;color:#888;\">size key " + obj.basicCost + " · techMod +" + obj.techMod + " · " + obj.systems.length + " systems · " + spaces + " spaces</span>" +
      "<br/><pre style=\"white-space:pre-wrap;word-break:break-all;font-size:9px;background:#111;color:#9f9;padding:4px;border:1px solid #333;max-height:200px;overflow:auto;\">" + json + "</pre>" +
      "<span style=\"font-size:10px;color:#888;\">If chat truncates the block, use the console copy.</span>");
  }

  // -------------------------
  // ROUND TRACKING (Minimal)
  // -------------------------
  // Simple round counter with reminder to check durations
  // Advance durational effects (MP Modifiers, "Duration"): on each Phase 0 the effect
  // repeats. Rolls per-round damage (routed through !mp apply so protection / Roll-With
  // apply normally), decrements remaining rounds, clears the badge when nothing remains.
  function tickDurationEffects(advancedRounds) {
    const steps = Math.max(1, num(advancedRounds, 1));
    let frag = "";
    const allTokenIds = Object.keys(state.MP_Engine.conditions || {});
    allTokenIds.forEach(tokId => {
      const conds = state.MP_Engine.conditions[tokId] || [];
      if (!conds.some(c => c.type === "duration")) return;
      const tok = getObj("graphic", tokId);
      const char = tok ? getCharFromToken(tok) : null;
      const name = char ? char.get("name") : "Target";
      const keep = [];
      conds.forEach(cond => {
        if (cond.type !== "duration") { keep.push(cond); return; }
        let rem = num(cond.roundsRemaining, 0);
        if (rem <= 0) { keep.push(cond); return; } // non-round / GM-managed effect
        const ticks = Math.min(steps, rem);
        for (let i = 0; i < ticks; i++) {
          if (cond.damageExpr && tok && char) {
            const rolled = rollExpr(cond.damageExpr);
            if (rolled > 0) {
              const rid = String(Date.now()) + "_dur_" + randomInteger(999999);
              state.MP_Engine.pending[rid] = {
                rollId: rid, defTokenId: tokId, defCharId: char.id, defName: name,
                damageTotal: rolled, dmgTypeStr: cond.dmgType || "Energy",
                protKey: cond.protKey || null, atkName: cond.sourceAtk + " (Duration)",
                created: Date.now()
              };
              frag += `<br/><span style="color:#f4d03f;">⏱ ${esc(name)}: ${esc(cond.sourceAtk)} — <b>${rolled}</b> ${esc(cond.dmgType || "")} this round</span>`;
              frag += `<br/>[Apply](!mp apply --id ${rid} --mode noroll) `;
              frag += `[Roll-With Max](!mp apply --id ${rid} --mode rollwithmax) `;
              frag += `[Roll-With Custom](!mp apply --id ${rid} --mode rollwithcustom --amt ?{Divert to Power|0})`;
            }
          }
        }
        rem -= ticks;
        cond.roundsRemaining = rem;
        if (rem > 0) {
          keep.push(cond);
        } else {
          frag += `<br/><span style="color:#9ad;">⏱ ${esc(name)}: ${esc(cond.sourceAtk)} duration expired`;
          if (cond.escape) frag += ` (escape: ${esc(cond.escape)})`;
          frag += `</span>`;
        }
      });
      state.MP_Engine.conditions[tokId] = keep;
      if (tok && !keep.some(c => c.type === "duration")) {
        tok.set("status_" + CONDITION_MARKERS.duration, false);
      }
    });
    return frag;
  }

  // Parse a recovery interval ("1 round", "3 rounds") into rounds. Non-round units
  // (minutes/hours/etc.) return 0 — those are GM-managed and not auto-prompted.
  function recTimeToRounds(recTime) {
    const s = String(recTime || "").toLowerCase().trim();
    const m = s.match(/(\d+)\s*round/);
    if (m) return Math.max(1, parseInt(m[1], 10));
    if (s === "" || s === "round") return 1;
    return 0;
  }

  // On round advance, surface recovery saves that have come due for active save-attack
  // conditions (paralyzed, mind control, poison, etc.), each with its [Recovery Roll]
  // button. Gated by the condition's recovery interval so multi-round effects only
  // prompt on schedule. Duration/absorption conditions are handled elsewhere.
  function promptDueRecoveries(newRound) {
    let frag = "";
    Object.keys(state.MP_Engine.conditions || {}).forEach(tokId => {
      const list = state.MP_Engine.conditions[tokId] || [];
      if (!list.length) return;
      const tok = getObj("graphic", tokId);
      const char = tok ? getCharFromToken(tok) : null;
      const name = char ? char.get("name") : (tok ? (tok.get("name") || "Target") : "Target");
      const seenTypes = {};
      list.forEach((cond, idx) => {
        if (cond.type === "duration" || cond.type === "absorption") return;
        if (cond.permanent) return;
        if (typeof cond.recTN !== "number") return; // not a recoverable save-condition
        if (seenTypes[cond.type]) return; // one prompt per condition type per token
        const interval = recTimeToRounds(cond.recTime);
        if (interval <= 0) return; // non-round recovery — GM-managed
        if (cond.nextRecRound == null) cond.nextRecRound = (cond.startRound || newRound) + interval;
        if (newRound >= cond.nextRecRound) {
          seenTypes[cond.type] = true;
          const label = String(cond.type).replace(/_/g, " ").toUpperCase();
          frag += `<br/><span style="color:#e94560; font-weight:bold;">${esc(name)}: ${label}</span> ` +
            `<span style="font-size:11px;">recovery due — ${esc(cond.saveBC)} at <b>${cond.recTN}-</b></span>` +
            `<br/>[Recovery Roll](!mp recover --target ${tokId} --idx ${idx})`;
          cond.nextRecRound = newRound + interval; // schedule next opportunity
        }
      });
    });
    return frag ? `<br/><b>Recovery saves due:</b>${frag}` : "";
  }

  function cmdRound(msg, args) {
    const parts = msg.content.split(/\s+/);
    const subCmd = parts[2] || "";
    const subArg = parts[3] || "";
    
    let newRound = state.MP_Engine.currentRound;
    const oldRound = state.MP_Engine.currentRound;
    
    if (subCmd === "" || subCmd === "next") {
      newRound++;
    } else if (subCmd === "show") {
      return ch("MP", `/w gm <div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;"><b>⚔️ Current Round: ${state.MP_Engine.currentRound}</b></div>`);
    } else if (subCmd.startsWith("+")) {
      newRound += parseInt(subCmd.slice(1), 10) || 1;
    } else if (subCmd.startsWith("-")) {
      newRound = Math.max(1, newRound + parseInt(subCmd, 10));
    } else if (subCmd === "set" && subArg) {
      newRound = Math.max(1, parseInt(subArg, 10) || 1);
    } else if (!isNaN(parseInt(subCmd, 10))) {
      newRound = Math.max(1, parseInt(subCmd, 10));
    }
    
    state.MP_Engine.currentRound = newRound;
    
    // Tick durational effects only when the clock moves forward.
    let durFrag = "";
    let recFrag = "";
    if (newRound > oldRound) {
      durFrag = tickDurationEffects(newRound - oldRound);
      recFrag = promptDueRecoveries(newRound);
    }
    
    let report = `<div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;">`;
    report += `<b>⚔️ Round ${newRound}</b><br/>`;
    report += `<span style="color:#f4d03f;">⏱️ Check active durations - deduct PR/charges as needed</span>`;
    report += durFrag;
    report += recFrag;
    report += `</div>`;
    
    return ch("MP", `/w gm ` + report);
  }

  // -------------------------
  // INIT
  // -------------------------
  on("chat:message", onChat);

  ch("MP", `/w gm <b>MP Engine v2.66.0:</b> Loaded. Type <code>!mp help</code> for commands.`);

  return { CFG, CRIT_TYPES, FUMBLE_TYPES, CONDITION_MARKERS, rollExpr };
})();

on("ready", function() {
  log("MP ENGINE v2.66.0 READY");
});