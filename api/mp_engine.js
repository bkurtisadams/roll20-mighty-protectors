/* Mighty Protectors Roll20 API Engine v2.102.0 - 2026-07-15
 * v2.102.0: SCAN LOCATE UX. Scan results now number located contacts and put
 *   a Locate button before Attack. !mp locate revalidates current visibility
 *   or the acquire-once signature before issuing a Roll20 sendPing restricted
 *   to the requesting player, centering only that player's view without
 *   revealing the token itself. "?" results still receive no name, bearing,
 *   Locate, or direct Attack button. Exact numeric distance is shown only for
 *   a "++" result; lower tiers use broad distance bands.
 * v2.101.0: SCAN ENVIRONMENT FIX. Scan and attack acquisition now evaluate
 *   Roll20 Dynamic Lighting illumination, MP 90-degree sense arcs/Global,
 *   classic Path and Jumpgate PathV2 barriers, and closed Door objects.
 *   Visible Light requires illumination; dim light forces a perception check;
 *   natural darkness falls back to the best usable non-visual sense. Ordinary
 *   senses are conservatively blocked by walls/closed doors; Penetrating senses
 *   may ignore them (their specified blocking material remains GM-adjudicated).
 *   Sense rows now pass Penetrating + blocked-by data into the engine, and
 *   acquisition cache signatures include observer position/rotation and the
 *   environmental result so movement, facing, doors, and lighting invalidate
 *   stale target acquisition.
 * v2.100.0: SCAN (3.1.5 targeting console). New !mp scan [--mod N]: one IN
 *   perception check (3.0.1 confirm on nat 1/20) evaluated at a per-target
 *   TN against every character token on the observer's page, for acquiring
 *   targets the player can't see or click (lightless rooms, invisibles).
 *   Per RAW 3.1.5 the free check uses the best sense available - each
 *   candidate goes through observationLevel(), exactly as the attack
 *   pipeline would. Results by 4.6 tier: "-" omitted; "?" collapsed to one
 *   anonymous presence line (no names/count/bearing; -3 defense noted,
 *   blind-fire at blindpen is GM-adjudicated); "-3"/ID/+/++ named with
 *   distance, compass bearing, and an Attack button carrying --target so
 *   no map click is ever needed. Clearly visible targets (no roll) listed
 *   for completeness. Located results SEED the v2.91.1 acquire-once cache
 *   via the new shared acqSignature() helper, so the following attack
 *   honors the scanned tier without re-rolling, and auto re-acquires when
 *   the target moves/conceals ("-" and "?" clear any cached acquisition).
 *   Free-check tracking: first scan per token per round is the 3.1.5 free
 *   save; repeats banner "costs an Action" (GM enforces; out of combat the
 *   round doesn't advance, so treat the banner advisorily). Sheet v44.64
 *   adds a Scan button beside the Query row.
 * v2.99.0: GM CHAT VISIBILITY FIX. API-sent whispers to players are NOT
 *   visible to the GM in Roll20, so any card routed only to player
 *   controllers (attack cards, hthmass, stance, area results, apply
 *   results) never reached the GM. chToChar/chToChars/chBoth/chBothId/
 *   chPlayers now always send an explicit /w gm copy in addition to the
 *   player whispers. GM-controller ids are skipped in the player loops so
 *   the GM never receives duplicates.
 * v2.98.0: HTH + MASS GROUP ROLL. New !mp hthmass command rolls a combined
 *   HTH + Mass total for every selected token. Optional --push 1 spends 2 PR
 *   per token for +2 to that token's combined total; tokens without 2 PR roll
 *   normally and are marked Push denied. Supports characters, vehicles, linked
 *   and unlinked token Power bars, and player control permissions. Alias: !mp might.
 * v2.97.0: DEATH TOUCH (p.53). New attack_is_deathtouch flag. Penetrating
 *   damage cannot be rolled with (buttons omitted AND divert forced to 0 in
 *   cmdApply if a roll-with mode is retyped). No Knockback. When Death Touch
 *   damage reduces the target to 0 Hits, the damage card offers an EN save;
 *   new !mp dtsave command kills instantly on failure (zeroes Power, stops
 *   bleeding, sets dead) and leaves the normal dying state on success.
 * v2.96.0: TRANSMUTATION (p.77). Transmutation-subtype save attacks now bypass
 *   blanket Other protection and Adaptation entirely; only a protection row
 *   whose subtype explicitly names "transmutation" and carries the Invuln flag
 *   grants the +8. sumProtectionWithHardened() gains a dedicatedOnly mode.
 *   cmdSave gains --weight <lbs> (Alternate Targets: objects resist by physical
 *   weight via WEIGHT_SAVE_TABLE, 2.1.7.2) and --basesave <n> as a direct
 *   override. Table populated from the Basic Characteristic Table; lookup is
 *   closest-match on the Carry (Pounds) column.
 * v2.93.3: HELP COMMAND AUDIT. Reorganized !mp help so every manually useful
 *   command is documented, including Siphon, sense-field powers, grapple
 *   Squeeze/Release, Restore, token-bar controls, config, GW spawning, and
 *   aliases. Flash is explicitly documented as attack-row automation rather
 *   than a nonexistent standalone !mp flash command; !mp test flash is shown.
 *   Generated chat-button callbacks are listed separately so the dispatcher
 *   can be audited without presenting them as normal macros.
 * v2.93.2: Can't Feel Pain reminder wrapped in its own dark container -
 *   it was appended after the damage card's closing div, so the yellow
 *   text rendered on Roll20's light chat bubble (same class of bug as
 *   the v2.91.2 card contrast fixes).
 * v2.93.1: SUBTYPE-AWARE VULNERABILITY/ATTRACT + compact grammar.
 *   getVulnerabilityMods takes the attack's subtype: a form-specific
 *   weakness line (RAW half-cost, e.g. "electrical Energy") applies only
 *   when the incoming attack's subtype matches; type-only lines apply
 *   type-wide as before. NEW compact notes grammar matching the sheet
 *   placeholder (which previously parsed to NOTHING - word grammar was
 *   required): vuln:Energy/electricity:+4, vuln:electricity:+4 (bare
 *   subtype implies parent), vuln:Kinetic:+2, attract:Entropy/cold:-2.
 *   Word grammar also gains subtype detection ("Vulnerable to
 *   electricity +4", "electrical", "fire/flame" -> heat). Rows named
 *   "Attract..." without "vulner" now scanned too. Both call sites
 *   (damage apply + save TN) pass rec.dmgSubtype.
 * v2.93.0: WEAKNESS AUTOMATION (Unliving, Can't Feel Pain, Compulsion/
 *   Phobia, Special Requirement). Trait tags on ability-row notes:
 *   unliving:PCT and nopain (read via getWeaknessFlags, no new sheet UI).
 *   UNLIVING healing gate in !mp dailyheal: 0% never self-heals ("must
 *   be repaired by others" - !mp medical stays open per RAW); 50% heals
 *   only below half max Hits. CAN'T FEEL PAIN: damage cards for flagged
 *   defenders append an IN-save reminder/button for surprise attacks.
 *   NEW !mp willcheck --mod -N [--present] [--phobia] [--stimulus "x"]
 *   (GM): CL save vs compulsion/phobia/psychosis; failure = succumbed
 *   condition (screaming marker) with per-round recovery at the initial
 *   difficulty, -4 while the stimulus is present, riding !mp recover;
 *   phobia successes still note "cannot directly confront" per RAW.
 *   NEW !mp discomfort | --off: Special Requirement unmet = -3 on ALL
 *   rolls to hit and saves - wired into the to-hit assembly, cmdSave
 *   TN + recovery TN, acquisition modifier, and !mp perceive (drink-me
 *   marker, environmental, cleared by --off). NEW !mp require (GM):
 *   game-clock requirement registry - --interval 12h/3d/1w, --consequence,
 *   --name; --met stamps the clock; overdue check runs on round advance
 *   and !mp time advance, nagging ONCE per starvation period with Apply
 *   Discomfort / Met buttons; !mp require list shows due times.
 *   !mp restore clears drink-me/screaming markers.
 * v2.92.1: RANGED-SENSE REACH RULES (RAW, Heightened Senses). A Ranged
 *   sense whose stimulus RADIATES works at any range with +6 vs range
 *   penalties (IN+6); a Ranged NON-radiating sense (radar, motion) is
 *   hard-capped at IN/2 inches (intelligence_score/2) and is skipped as
 *   an acquisition fallback beyond that; a non-Ranged sense (touch,
 *   taste) only reaches contact range (1"). getCharacterSenses reads the
 *   sheet's Radiates flag (derives from type for older rows); senseReach()
 *   centralizes the rules for observationLevel and !mp perceive. The
 *   acquisition range offset is now tele + (radiates ? 6 : 0), capped at
 *   the penalty. Labels note the IN/2 cap when a non-radiating sense is
 *   used; "no sense reaches this range" replaces "no usable sense" when
 *   reach is the blocker. Acquire-once sig range-buckets whenever the
 *   resolved sense is range-sensitive. !mp perceive with a subject token
 *   applies the range penalty/bonus and refuses out-of-reach checks.
 * v2.92.0: CHARACTER SENSE ROWS (phase 2 of sheet v44.60/61).
 *   getCharacterSenses(charId): six-default baseline + repeating_abilities
 *   sense rows - overrides replace, Level=none removals are always-on,
 *   Off/Held/Gear+Broken rows are skipped (default stands). visionLossInfo
 *   now takes charId: base level from the character's visible sense
 *   (Analytical possible), Amplified negates Darkness dampening, Protected
 *   negates Glare+Flash overload (Darkness/Glare still cancel first).
 *   observationLevel: vision-blocked fallback = the character's BEST
 *   remaining Ranged/Global sense (blinded radar user keeps Full-row
 *   acquisition; no usable sense = None row). Range-conditional Diminished
 *   Senses automate off attack range: Nearsighted caps vision at Basic
 *   beyond 4", Farsighted within 5", No Depth Perception adds a flat -2
 *   to hit by sight beyond 1". Acquisition modifier now includes the
 *   sense's Chk mod (Acute/Imperceptive) and its range penalty offset by
 *   Telescopic (3.1.5/4.7.3); breakdown shown in the roll text. Acquire-
 *   once sig adds chkMod and a range bucket (only when a range weakness
 *   is live). NEW !mp perceive [--sense KEY] [--mod N]: 3.1.5 perception
 *   check with the sense's mods, sneaking opposition + 3.1.5.1 gate for
 *   a selected subject, tier detail text, crit = one level higher.
 *   Status card gains a Senses line (deviations from baseline only).
 *   !mp test senses reports the resolved map + fallback pick.
 * v2.91.4: SENSES PANEL. !mp sensepanel (GM) posts one whispered control
 *   card for the whole subsystem: Darkness/Glare rank buttons (1/2/3,
 *   one-click) + Off + ring draw/clear (diameter prompts once),
 *   Invis / Invis+Sneak / Blur / Invis Off, Sneak on/off, Glow on/off,
 *   Status, and a Refresh Panel button. Every button acts on the tokens
 *   selected at click time. Suggested use: a GM macro-bar entry or
 *   token action containing just "!mp sensepanel".
 * v2.91.3: STEALTH 3.1.5.1 (RAW-corrected). NEW !mp sneak | --off:
 *   standalone sneaking condition (tread marker, no PR, 1/2-move
 *   reminder). Correct scope: sneaking does NOT conceal from a Full
 *   sense with the sneaker in its vision arc - bare sneaking forces no
 *   acquisition roll for a Full-vision attacker. The 3.1.5.1 crit-only
 *   gate applies when the resolved sense is BASIC (hearing fallback vs
 *   an invisible sneaker, or vision degraded to Basic by darkness):
 *   rollAcquisition's new sneakGate drops all non-crit-success outcomes
 *   to "-" (undetected, cannot attack), noted in the roll text. AG
 *   opposition (3.0.2.4) now sourced from either the standalone sneak
 *   condition or Invisibility's --sneaking flag. Out-of-arc/"from
 *   behind" is GM adjudication: a SNEAKING ATTACKER gets a reminder
 *   card (crit-only Basic detection + Surprise bonus). Acquire-once
 *   signature includes sneaking state; !mp status Sneaking row with
 *   Stop button; !mp restore clears tread; recover refuses (points at
 *   !mp sneak --off).
 * v2.91.2: SENSE CARD CONTRAST + STOPWATCH RESTORE FIX. The Invisibility,
 *   Darkness/Glare apply-remove, and Glow chat cards emitted bare text
 *   with #aab gray annotations - unreadable on Roll20's light chat
 *   bubbles. All three now use the standard dark card container
 *   (#1a1a2e, color #eee, muted notes #8a84a8) like the status/area
 *   cards, which control their own contrast. !mp restore now also clears
 *   the status_stopwatch duration badge in both branches (records were
 *   already wiped via the conditions map; the marker lingered - same bug
 *   class as the v2.89.2 sense markers).
 * v2.91.1: ACQUIRE-ONCE PERSISTENCE + IMPORTER TAGS (chunk 6).
 *   Acquisition results now persist per attacker/defender pair (RAW 4.6:
 *   re-roll only when the target "has moved, started sneaking, become
 *   invisible, etc."). A signature covering defender position, defender
 *   concealment (invisible/blur/sneaking), the attacker's own vision
 *   impairment, and the sense level/opposition invalidates automatically
 *   when any of it changes - no manual re-arm needed. Held acquisitions
 *   show a green "Already acquired [tier], held from round N" card;
 *   blocked ("-") results are never cached so the attacker may retry.
 *   Cache pruned on round advance (>50 rounds old); !mp restore forgets
 *   acquisitions involving restored tokens.
 *   Sheet v44.59 importer tags (match-only, never resets manual entries):
 *   attack notes flash:LEVELS[:SAVEMOD] -> Flash save row (is_save,
 *   no_damage, EN, sense_loss); dazzle:SAVEMOD -> Laser dazzle save
 *   fields; ability notes field:darkness|glare:RANKS:SENSES:DIAM and
 *   field:glow:DIAM -> Sense Field row.
 * v2.91.0: INVISIBILITY (chunk 5). !mp invis [--blur] [--sneaking] |
 *   --off on selected tokens (or --target): half-haze marker, condition
 *   {type:"invisible", blur, sneaking}, voluntary (no recovery roll -
 *   drop with --off, free per RAW). PR 1/round auto-drains on Turn
 *   Tracker round advance (tickInvisibility in advanceRound); at 0 Power
 *   invisibility DROPS with a report line. TARGETING: observationLevel()
 *   combines attacker vision impairment with defender concealment - full
 *   Invisibility blocks vision entirely (acquisition falls back to Basic
 *   hearing, per RAW "Basic senses still detect... unless sneaking");
 *   Blur reduces the observer's effective vision one level; a sneaking
 *   invisible target opposes the perception check at -(AG save - 10)
 *   per 3.0.2.4, shown in the roll text. rollAcquisition gained a
 *   modifier param (nat 1/20 confirms roll vs the modified TN). An
 *   INVISIBLE ATTACKER gets a Surprise-bonus reminder card (4.6) - GM
 *   applies via --mod. !mp status shows an Invisibility row with Drop
 *   button; !mp restore clears the marker; !mp recover refuses (points
 *   at !mp invis --off). !mp test invis: 6-check self-test (2 tokens).
 * v2.90.2: GLOW + ABILITIES-PANEL FIELD UI (chunk 4). !mp glow --diameter
 *   N sets the selected/target token's aura1 to the field radius (light
 *   yellow, player-visible); --off clears it. PR 1 + 1/hour is a card
 *   reminder (GM-managed). Not GM-gated - players can light their own
 *   torch. Sheet v44.58 adds a Sense Field row to the abilities cog panel
 *   (Field type Darkness/Glare/Glow, Ranks, Senses=PR, Diameter) with a
 *   "Field Card" button posting !mp fieldcard - a GM control card whose
 *   buttons wrap the existing commands (Apply/Remove on selected, Draw/
 *   Remove ring, Glow on/off) using the row's stored values, acting on
 *   whatever is selected at click time.
 * v2.90.1: DAZZLE CALLED SHOT (chunk 3) + FIELD RINGS.
 *   Dazzle called shot (Light Control A, Laser): "Dazzle" in the called
 *   shot maps (engine + !mp atk + sheet v44.57 query) at -6 to hit. On a
 *   hit: no damage (saveDamage forced 0), no knockback, protection ignored
 *   (goggles block entirely - GM adjudicated); the victim rolls the row's
 *   EN save (Save BC defaults to EN if blank) at the row's Init mod - set
 *   Init from the Laser CP table's Dazzle column. Failure = dazzled 2
 *   levels via the standard sense-loss condition; recovery each between-
 *   rounds phase at the row's Rec (blank = 0, NOT Flash's -12 default);
 *   fumbled saves are NOT permanent (that rule is Flash-only). Works on
 *   any attack row, so improvised dazzle attacks are possible.
 *   Field rings: !mp darkness/glare --circle N draws a persistent dashed
 *   ring of diameter N" centered on the selected token or --target (a
 *   generic point token works); --circle off removes all rings of that
 *   kind. Darkness rings near-black, Glare rings yellow. Visual only - no
 *   membership tracking; toggle victims with --ranks/--on/--off as they
 *   move. drawAreaMarker gained optional color/width params.
 * v2.90.0: TARGET ACQUISITION (4.6) replaces flat vision penalties. An
 *   attacker with impaired vision now rolls a perception check (IN save,
 *   3.0.1 confirm rolls for nat 1/20) mapped through the 4.6 sense-level
 *   table: "-" cannot attack (refusal card), "?" unlocated (attack at
 *   blindpen, default -6), "-3" crude targeting, ID/+/++ clean. Vision at
 *   Basic uses the Basic row; vision at None falls back to default human
 *   HEARING (Basic row, labeled) - a blind attacker who succeeds is only
 *   -3, per RAW, not the old flat -6. Full vision unimpaired: no roll
 *   (a Full sense IDs even on a failed check). Acquisition roll + tier
 *   posted as a card line and itemized in the hover breakdown.
 *   NEW defender-side 4.6 penalty: a vision-impaired DEFENDER takes -3 to
 *   Physical defense ("-" tier's -3/-6 per 4.7.2 left to GM); mental/
 *   emotional attacks unaffected. Status card notes acquisition + defense
 *   effects. visionAtkPenalty() retained for status summary only.
 *   !mp test acquire: 9-check table self-test with forced rolls.
 *   RAW note (GM-managed): re-roll acquisition when the target moves,
 *   starts sneaking, or turns invisible; 4.6.1 interference = existing
 *   darkness ranks 1/2/3.
 * v2.89.4: MOOK ATTACKERS - token-aware attacker resolution. Previously
 *   handleMpAttack found the attacker token by unique represents-lookup
 *   and refused when a character had 2+ tokens on the map ("Delete
 *   duplicates before attacking"), which made mooks (unlinked multi-token
 *   characters) unable to attack at all. New priority: (1) explicit
 *   {{atktok=...}} - now passed by !mp atk and !mp autofire, which always
 *   knew the token id but dropped it; (2) a selected token representing
 *   the attacker (sheet-button rolls with the token selected); (3) unique
 *   lookup as before. Error only when 2+ candidates remain unidentified,
 *   with guidance to select the token or use !mp atk. PR deduction was
 *   already token-bar aware (getResource prefers bar values), so mook
 *   Power drains from the attacking token, not the shared sheet.
 *   KNOWN LIMIT: attack CHARGES live on the shared sheet row, so mooks
 *   share a charge pool.
 * v2.89.3: AREA attacks vs generic/unlinked tokens. An area attack (Flash,
 *   blasts) may now target a token with no character sheet - it's just the
 *   blast center point (area attacks apply no target defense; +6 immobile).
 *   handleMpAttack substitutes a null-id stub character when the target has
 *   no sheet AND the attack row has Area > 0; all downstream attr lookups
 *   fall through to defaults (getAttr/chToChars/getTokensInRadius already
 *   skip null charIds). cmdQuickAttack (!mp atk N) reordered to find the
 *   row before the target-character guard and allows the same. Non-area
 *   attacks vs generic tokens still refuse, with a clearer message.
 *   NOTE: the SHEET Roll button still cannot target generic tokens - its
 *   macro reads @{target|...|physical_def} which Roll20 hard-fails on
 *   sheetless tokens ("No character was found for 'target|Target'"). Use
 *   the !mp atk quick macro for point-targeted area attacks.
 * v2.89.2: !mp restore now clears sense-loss state. Player branch clears
 *   the four sense markers (bleeding-eye dazzle, interdiction blind,
 *   ninja-mask darkness, aura glare); condition records were already
 *   wiped but markers lingered. Vehicle branch previously returned early
 *   without touching the conditions map at all - it now clears the same
 *   markers AND deletes conditions for the token, so a vehicle left in a
 *   Darkness/Glare field restores clean.
 * v2.89.1: FLASH AS SAVE ATTACK (chunk 2). Sheet v44.55 adds a Sense Loss
 *   select (attack_sense_loss, 0-3 levels) to the save-attack row. Engine
 *   reads it at attack time; when > 0 on a save attack: (1) single-target
 *   saves force a dazzled condition carrying senseLevels from the row,
 *   protection/invuln/adapt do NOT add to the save TN (Flash has no Damage
 *   Type - only Protected Sense mitigates, GM adjudicated), fumbled initial
 *   save = PERMANENT regardless of attack name; (2) area attacks route
 *   per-target through resolveAreaSenseLoss: EN (or row BC) save per target
 *   that failed/skipped escape, failure = dazzled + senseLevels + recovery
 *   at recMod (defaults to -12 when the Rec field is blank, per Flash
 *   rules), refresh-in-place (no stacking), Recovery button per victim,
 *   roll-20 fumble = permanent blindness. Area cards relabel for Flash
 *   (FLASH header, "Resolve All Saves"). !mp test flash [LEVELS] harness
 *   with forced rolls (pass/fail/refresh/fumble; non-destructive).
 * v2.89.0: SENSE-LOSS CORE (chunk 1 of Light Control/Darkness rollout).
 *   Vision-loss model: conditions may carry senseLevels (levels of visible
 *   light sense lost; normal human vision is Full = 2 levels). Effective
 *   vision = Full - total levels lost: 1 lost = Basic, 2+ = blind.
 *   NEW !mp darkness --ranks N --on/--off and !mp glare --ranks N --on/--off:
 *   GM applies/removes an environmental sense-loss condition on selected
 *   tokens (or --target). No zone geometry - GM toggles tokens as they
 *   enter/leave the field. Darkness and Glare ranks CANCEL each other
 *   (rules: "Levels of Glare and Darkness cancel each other out").
 *   Environmental conditions have no recovery roll; !mp recover refuses
 *   them and points at --off. Markers: ninja-mask (darkness), aura (glare).
 *   NEW attacker vision penalty in attack pipeline: vision at Basic = -3
 *   to-hit, blind = config penalty (default -6, !mp config blindpen N).
 *   Itemized in hover breakdown; warning banner when firing blind.
 *   Save-flow dazzled conditions now record senseLevels: 2 (Flash default)
 *   and feed the same model. !mp status shows a Vision row with cause
 *   breakdown and clear/recovery buttons. !mp test senseloss self-test.
 * v2.88.0: HEALING (4.13) + MEDICAL task check (4.13.1). Shared applyHealing
 *   restores Power first then Hits (4.13), capped at max. rollHealingRate
 *   reads healing_rate and rolls the d10 fractional-bonus. !mp dailyheal
 *   (select token) applies a day's rest healing to the BARS — the companion
 *   to the sheet Heal button, which only rolls/displays. !mp medical
 *   success|crit|fumble (select patient) applies the outcome of a GM-rolled
 *   Medical check: success heals Healing Rate + stops bleeding, crit doubles,
 *   fumble deals d8+1; one successful benefit per patient per game-DAY (any
 *   medic, gated via state.medicalDays + game clock). Modifiers/TN are GM
 *   adjudication per 3.0.2, so the engine applies results, not the roll.
 *   Status card gains a Healing row (Daily Rest / Medical / Crit / Fumble)
 *   when the token is below full, hidden once Medical is used that day.
 * v2.87.3: label negative protection as "(vulnerable)". A protection row
 *   with negative values (Azu: Kin/Ent -2) means the target takes extra
 *   damage; cards now show e.g. "7 +2 (vulnerable) = 9 pen" instead of a
 *   bare/again-confusing number. Applied to the main apply card (which
 *   previously hid the armor line entirely when prot <= 0), plus the area,
 *   reflected, and AF counter cards. Engine has no damage-type name for a
 *   bare negative prot, so the label is the generic mechanical effect.
 *   Math unchanged.
 * v2.87.2: fix negative-protection display. When effective protection is
 *   below zero (target vulnerable / Attract), the area damage, reflected
 *   damage, and AF counter cards showed a jammed double-dash ("7--2 prot").
 *   Now rendered as an addition ("7+2 prot" / "Raw: 7 + 2 prot"). Math was
 *   always correct; display only. Main apply card unaffected (it omits the
 *   armor line when prot <= 0).
 * v2.87.1: !mp snareclear (GM) force-clears any snare or grapple on the
 *   target with no roll — clears both sides of a grapple and only drops the
 *   grappler's "fist" marker if they aren't still holding someone else.
 *   Works on --target or selected token(s). Added as a red Clear button on
 *   the snare row of the !mp status control card, and to !mp help.
 * v2.87.0: !mp status reworked into a live, self-regenerating token CONTROL
 *   card (set it as a Token Action for a persistent per-token button). Reads
 *   current state so it can never be stale like the original chat cards.
 *   Shows Hits/Power with status flags and contextual action buttons:
 *   Grappled-by (Break Free / Counter / Release), Grappling-someone
 *   (Squeeze / Lock / Release — the release Kurt couldn't find after a card
 *   scrolled off), snare (Break Free / +push), Bleeding (Stop Bleeding),
 *   Conditions (Details), and Siphon pool (Clear), plus a Refresh button.
 *   Works on selected token(s) or legacy --target. All buttons call existing
 *   handlers; no new grapple/snare state.
 * v2.86.1: handout time now shows seconds (HH:MM:SS, seconds in smaller
 *   muted text) so per-round 10s clock ticks are visible on the panel.
 * v2.86.0: FIX Turn Tracker round advance. The v2.83-85 custom "Round" (+1)
 *   entry never advanced because Roll20 only runs a custom entry's formula
 *   when you click next-turn ON that entry, not each cycle — so the clock
 *   never moved during combat. Replaced with Option A wrap detection: the
 *   round anchor is the combatant on top when the round starts; Roll20
 *   rotates the finished combatant to the bottom each next-turn, so the
 *   anchor returns to top only after everyone has acted = one round, at
 *   which point the clock advances 10s. leftAnchor guards against firing
 *   before the anchor has rotated off. No custom tracker entry is inserted
 *   anymore. Undo snapshots the wrap fields; combat end clears them.
 * v2.85.0: Game clock UI + undo integration. (1) Persistent player-visible
 *   HANDOUT ("⏱ Game Time", shared to all): rewritten on every clock move
 *   (tracker round, !mp round, !mp time, combat start/end, undo) with big
 *   24h time, full date, phase-of-day badge, and an in-combat round/elapsed
 *   block that collapses to "Narrative time" out of combat. (2) PHASE OF DAY
 *   on fixed hours (CFG.DAY_PHASES: dawn 5-7, day 7-18, dusk 18-20, night
 *   20-5); day-boundary and phase crossings announce once in chat on advance
 *   (suppressed on multi-day jumps). (3) UNDO now snapshots the clock
 *   (ms/currentRound/lastTrackerRound) and the bleed key set, so reversing an
 *   attack rewinds its time effects and removes any bleed it registered.
 *   New CFG: CLOCK_HANDOUT, CLOCK_HANDOUT_NAME, DAY_PHASES.
 * v2.84.0: ALL EFFECTS ON GAME TIME (Kurt ruling 2026-07-05). ABSORPTION
 *   effect expiry also migrated to game time (5 GAME minutes; the 5-minute
 *   value itself is an engine convention pending verification vs Absorption
 *   RAW) with display, expiry check, sweep hook, and ready rebase of old
 *   wall-clock entries. Clock default
 *   now 2519-07-14 08:00 (GW campaign start; v2.83.0 placeholder migrated).
 *   advanceClock runs runGameTimeSweep (siphon expiry + bleeding + duration
 *   expiry) whenever the clock moves — by tracker round, !mp round, or
 *   !mp time advance. SIPHON dissipation is now 1 GAME hour: expiries stored
 *   as game timestamps, list shows game minutes left, the 60s wall-clock
 *   interval is removed, and pre-v2.84 wall-clock entries are rebased on
 *   ready. BLEEDING (4.8.4.2): incapacitation in cmdApply/resolveAreaTarget
 *   auto-registers a bleed (characters only); each game minute drains 1
 *   Power (collapses over big time jumps), Hits>0 auto-stops, Power 0 =
 *   DEAD (Hits AND Power 0) with bled-out summary; !mp bleed list/start/
 *   stop (Medical task check). DURATIONS: non-round duration effects
 *   (minute/hour/day/week/month/year) now stamp a game-time expiresMs and
 *   auto-expire with a GM whisper + marker cleanup; perm never expires.
 * v2.83.0: GAME CLOCK + TURN TRACKER integration. state.gameClock holds a
 *   campaign timestamp (default 2519-01-01 08:00); CFG.SECONDS_PER_ROUND=10
 *   per RAW 4.1. New advanceRound(n) funnels rounds, clock, duration ticks,
 *   and recovery prompts through one path: !mp round forward advances use it
 *   (backward/absolute sets move the counter but never the clock), and the
 *   Turn Tracker drives it automatically — opening the tracker starts combat
 *   at Round 1 and injects a custom "Round" (+1) entry that Roll20 cycles;
 *   turnorder changes mirror its value into currentRound and advance the
 *   clock; closing the tracker whispers rounds + elapsed game time. Deleted
 *   Round entries are re-inserted; on(ready) resyncs after sandbox restarts;
 *   tracker resets resync without rewinding. New GM command !mp time
 *   [show | advance N sec/min/hour/day/week/round | set YYYY-MM-DD HH:MM].
 *   Effect migrations to game time (siphon 1-hour dissipation, bleeding,
 *   long recovery times) are the next slice, pending rulings.
 * v2.82.0: !mp buttondemo (GM) posts one inert sample decision card per
 *   button-color candidate (A steel blue, B bright blue, C graphite, D teal,
 *   E1/E2 green ghosts, F/G V&V oranges, H orange ghost) in real chat so the
 *   color choice can be made in-theme at the table. Samples are styled spans
 *   matching live btn()/btnDanger() output exactly; danger red constant.
 * v2.81.0: ROLL-WITH vs AREA EFFECTS (4.8.3 audit vs rules text). Area
 *   targets who fail to escape may now roll with the damage: cmdAreaDamageAll
 *   computes per-target coverage-adjusted penetration (computeAreaPen), and
 *   conscious characters with capacity (floor(current Power/10), Fortitude
 *   x2; vehicles and sleepy/dead-marked tokens excluded) are deferred with
 *   Take Full / Roll-With Max / RW Custom buttons (players whispered via
 *   chToChar; NPC buttons on the GM card) plus a GM Apply Rest (No RW)
 *   fallback (!mp arearwrest). New !mp arearw resolves one target through
 *   resolveAreaTarget: divert to Power first, then siphon/standard routing,
 *   pool consumption, incremental siphon gain per resolution, status
 *   markers. Ring + record now persist until every target resolves
 *   (finalizeAreaIfDone); pendingArea expiry raised 5->10 min. Rolled-with
 *   points are never siphoned, matching the single-target path.
 * v2.80.0: Siphon test harness + forced dissipation. !mp test siphon [PTS]
 *   (select attacker then target) drains PTS points through the real drain/
 *   mode routing using the attacker's actual Siphon row config, applies the
 *   transfer/cap/overload path via applySiphonGain, and reports a purple
 *   test card. !mp siphon expire --target TOKID zeroes registry timers and
 *   runs the dissipation sweep immediately (tests the 1-hour path without
 *   waiting). Added to !mp help and !mp test help.
 * v2.79.0: chat button recolor. All 124 [label](!cmd) markdown API buttons
 *   converted to styled anchors via new btn()/btnDanger() helpers: neutral
 *   steel blue (#3d5a80) for ordinary actions, card red (#c0392b) for
 *   consequential ones (29: labels starting with "Apply", "Apply Damage",
 *   "Take Full Damage"). Replaces Roll20's default pink button chrome to
 *   match the dark card theme. White text, #2a2a4a border, 3px radius.
 * v2.78.0: Immunity modifier (+2.5) for Area Effects: new attack_immunity
 *   flag read at attack time; handleAreaAttack excludes the attacker's own
 *   character from tokensInArea (RAW: ignore negative effects of own
 *   Ability). Enables touch-range area siphons (Sham) without self-drain.
 *   Immunity-counters-Reflection is backlog. Area card label fixed:
 *   "Area: N\"" (diameter, MP convention) replaces "Radius: N\"".
 * v2.77.0: SIPHON automation (MP Voluntary Ability, p.66-67). New attack row
 *   fields (attack_is_siphon, siphon_drain/mode/bc/cat/replenish/split/
 *   overload/cap/pool) read at attack time; siphon attacks never cause KB.
 *   cmdApply routes drain by type: Hits 1/pt capped at pool (no 4.8.4
 *   overflow, unconscious check still applies per Kurt ruling), Power 2/pt
 *   from Power only, Ability CPs / BC pts reported for manual Siphoned-row
 *   ledger. Head shot doubling exempted. Modes: Normal, Suppress (no gain),
 *   Mimicry (no drain). Transfer: attacker bar += gain (over max allowed),
 *   row pool tracks total, Ability Cap enforced with Overload effects
 *   (excess lost / all lost / 1 dmg per pt / explode d=pool/5 odd);
 *   Replenish writes real healing capped at max, no pool. Damage consumes
 *   siphoned points first (consumeSiphonPool in cmdApply + area). 1-hour
 *   dissipation via state registry + 60s sweep (restart-safe); GM whispered.
 *   Area siphon supported (Ark: Siphon Hits Area Effect) with pooled gain.
 *   New GM command: !mp siphon list | clear | adjust. Split spec is
 *   informational this slice.
 * v2.76.0: area effect map marker. handleAreaAttack now draws a dashed circle
 *   path at the blast center (scatter-adjusted on a miss) sized to areaRadius,
 *   on the map layer so players can't move it. Single path object built from
 *   M/L tick segments (16-48 ticks by radius). Marker id stored in pendingArea
 *   and removed on Apply All Damage and in cleanupPendingArea. New CFG:
 *   AREA_MARKER (on/off), AREA_MARKER_COLOR, AREA_MARKER_WIDTH.
 * v2.75.0: area effect chat cards restyled to the dark attack-card theme for
 *   readability. AREA HIT/MISS card, escape/shield-block results, AREA DAMAGE
 *   RESULTS, and the all-escapes-resolved message now use dark backgrounds
 *   (#1a1a2e/#16213e) with light text and colored header strips/borders,
 *   replacing black-on-red/orange flat cards.
 * v2.74.1: range calculation now converts Roll20 page scale units correctly.
 *   Supports MP-inch pages (1 in/sq) and feet pages (5 ft/sq), and fixes
 *   fractional Cell Width/snapping_increment by applying it to scale distance
 *   instead of double-counting it in pixel conversion.
 * v2.74.0: vehicle ABSORPTION and REFLECTION now resolve. getAbsorptionReflection
 *   reads the vehprotection section for vehicle defenders; the absorb/reflect action
 *   buttons are now offered to vehicles (were excluded); cmdAbsorb/cmdReflect already
 *   apply to vehicle Hits/Power, and the BC-stat absorb target maps to vehicle_* attrs.
 * v2.73.0: vehicle Force Fields now honor the Mode selector and read Hardened
 *   values (vprot_hard_*); getVehicleProtection skips FF/Absorption/Reflection rows
 *   by mode. (Absorption/Reflection resolution is the next slice.)
 * v2.72.0: VEHICLE FORCE FIELDS now work. A repeating_vehprotection row named
 *   "Force Field" is read as an active FF (getVehicleForceFieldData) and routed
 *   through the same damage FF step as characters: per-hit deflection wall, pool
 *   capacity = vehicle Power, accum in vprot_ff_accum, collapse sets vprot_broken,
 *   AP reduces it. setFFAccum/deactivateFF are now section-aware.
 * v2.71.3: Armor Piercing now reduces Force Field protection too (RAW: AP ignores
 *   points of protection vs its damage type; a force field IS protection). AP is
 *   spent FF -> Armor -> Invulnerability (outermost first; preserves the rule's
 *   explicit Armor-then-Invuln order). Applies to all attackers, not just vehicles.
 * v2.71.2: attack card properties footer now shows declared AP (Armor Piercing:
 *   "AP: N" or "AP: ALL") alongside KB/Rng for all attackers. AP was read and
 *   applied (vs armor, not force fields) but never displayed on the card.
 * v2.71.1: vehicle attack card now itemizes the weapon +To-Hit and Targeting
 *   bonus in the to-hit hover breakdown (was in the Final calc but not shown);
 *   subtotal includes macroMod for vehicle attackers so it reconciles with Final.
 * v2.71.0: vehicle attacks now support the full single-shot automation set.
 *   handleMpAttack defines a vehicle-aware getAtk that maps attack_* reads to
 *   the mpattack template fields (pr, ch, range, ap, kb, area, is_save, save mods,
 *   no_damage, dmgexpr), so save attacks, charges, range, PR, AP, KB and area all resolve for
 *   vehicle weapons. Charge writeback uses new setVehSystemAttr (repeating_vehsystems).
 * v2.70.0: handleMpAttack supports VEHICLE attackers (repeating_vehsystems
 *   weapons via the mpattack template): attack type taken from the template
 *   {{atype}} field and to-hit base read from vehicle_ag/in/cl_save instead of
 *   the character save attrs. Damage/type/name come from template fields; the
 *   hit is roll-under vs the sheet-computed target. Routes through the normal
 *   FF/armor/KB damage pipeline.
 * v2.69.2: vehicle import now seeds per-system vsys_type (P/M/E weapon basis or
 *          none, derived from damage type), vsys_dmgtype, and vsys_tohit on each
 *          repeating_vehsystems row, feeding the new sheet dropdown and the
 *          upcoming !mp vatk to-hit. repeating_attacks writes unchanged for now.
 * v2.69.1: !mp import refuses to overwrite a pre-existing non-vehicle character
 *          (name collision would otherwise wipe its attacks/abilities/protection).
 * v2.69.0: vehicle force fields now run the per-hit deflection/collapse mechanic.
 *          cmdApply no longer disables FF for vehicle defenders (getForceFieldData
 *          already uses vehicle Power as the collapse threshold). Per-hit logic now
 *          honors the MP rule that a completely-blocked hit (fully stopped within
 *          remaining capacity) is ignored and not added to the deflection total.
 *          Vehicle import now writes an active forcefield protection row (mode/
 *          state/accum/pr + per-type stopping power) in addition to the Additional
 *          Protection display row; getVehicleProtection skips "Force Field" display
 *          rows so they aren't double-counted as passive armor.
 * v2.68.1: vehicle import defaults vsys_dmg to "0" for non-weapon systems so the
 *          new per-system damage roll button on the sheet always rolls cleanly.
 * v2.68.0: vehicle import now populates the actual vehicle sheet model. Sets
 *          vehicle_base_cp (vehicleSizeTable key) + vehicle_ag/in/cl + hilotech/
 *          maneuver so calcVehicle derives spaces/st/en/hits/power/profile on
 *          sheet:open; fills repeating_vehsystems (one row per system: spaces, dmg,
 *          description) and repeating_vehprotection (force field, per-type). Still
 *          writes repeating_attacks for the !mp atk pipeline. buildVehicleFromMPData
 *          now emits bcAg/bcIn/bcCl. Replaces the v2.67.0 attempt that wrote engine-
 *          only attrs the vehicle tab doesn't display.
 * v2.67.2: !mp import now extracts the first balanced {...} object from handout
 *          notes, so trailing markup or a duplicated paste no longer breaks
 *          JSON.parse ("Unexpected non-whitespace character after JSON").
 * v2.67.1: !mp import handout lookup is now forgiving — strips surrounding quotes,
 *          matches case-insensitively, and suggests near matches on a miss.
 * v2.67.0: !mp import now handles vehicles. A type:"mp-vehicle" handout (builder/
 *          gwspawn JSON) builds a vehicle-mode character via
 *          buildVehicleCharacterFromMPData: sets vehicle_mode/hits/power/armor, a
 *          forcefield protection row (all MP types — GW single damage type), and a
 *          repeating_attacks row per weapon (attack_damage/dmgtype from the new
 *          atkDmg/atkType emit fields, suffixed names from the layout labels).
 *          vehMkSystem now also emits atkDmg/atkType (authored inflicted dice/type),
 *          kept separate from the damage-taken `dmg` field.
 * v2.66.5: layout suffix base shortened to 2 chars (PB1, PB2 …) for grid legibility.
 * v2.66.4: layout emit now suffixes duplicate-ability system labels (PBl1, PBl2 …)
 *          via per-cell `label`, so visually identical systems are distinguishable
 *          on the grid. Singletons keep the canvas auto-abbr.
 * v2.66.3: vehMkSystem no longer copies the bestiary's inflicted-damage value into
 *          the system `dmg` field — that field records damage TAKEN by the system and
 *          must start empty. Inflicted damage already lives in the system desc.
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
log("MP ENGINE v2.93.3 FILE STARTING");

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
    SNARE_STACK_BONUS: 2,

    // Area effect map marker (dashed circle drawn at blast center)
    AREA_MARKER: true,
    AREA_MARKER_COLOR: "#e74c3c",
    AREA_MARKER_WIDTH: 3,

    // Combat scale (4.1): one combat round represents ten seconds of real time
    SECONDS_PER_ROUND: 10,

    // Game clock handout (persistent player-visible panel)
    CLOCK_HANDOUT: true,
    CLOCK_HANDOUT_NAME: "⏱ Game Time",
    // Phase-of-day boundaries (fixed hours, 24h). [startHour, label, icon-hint]
    DAY_PHASES: [
      { start: 5, end: 7, label: "Dawn · first light", color: "#f5c99a" },
      { start: 7, end: 18, label: "Day", color: "#9ad" },
      { start: 18, end: 20, label: "Dusk · fading light", color: "#f5a15a" },
      { start: 20, end: 5, label: "Night", color: "#8a9bd6" }
    ]
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
      // Skip non-passive rows: Force Field / Absorption / Reflection (by mode or legacy name).
      const nameAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_name`);
      const nm = nameAttr ? (nameAttr.get("current") || "").trim().toLowerCase() : "";
      const modeAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode === "forcefield" || mode === "absorption" || mode === "reflection" || nm === "force field") return;
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
  // Ensure siphon pool registry exists for existing state
  // { key: { charId, rowId, resource, expiry } } — points authoritative in row attr
  if (!state.MP_Engine.siphonPools) state.MP_Engine.siphonPools = {};
  // Ensure game clock exists for existing state (default: 2519-07-14 08:00, GW campaign start)
  if (!state.MP_Engine.gameClock) state.MP_Engine.gameClock = { ms: Date.UTC(2519, 6, 14, 8, 0, 0), combatStartMs: null, combatStartRound: 0, roundAnchor: null, topId: null, leftAnchor: false };
  // One-time migration from the v2.83.0 placeholder default
  if (state.MP_Engine.gameClock.ms === Date.UTC(2519, 0, 1, 8, 0, 0)) state.MP_Engine.gameClock.ms = Date.UTC(2519, 6, 14, 8, 0, 0);
  // Ensure bleeding registry exists (4.8.4.2): { tokenId: { charId, lastMs } }
  if (!state.MP_Engine.bleeds) state.MP_Engine.bleeds = {};
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
    darkness: "ninja-mask",
    glare: "aura",
    invisible: "half-haze",
    sneaking: "tread",
    discomfort: "drink-me",
    succumbed: "screaming",
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

  // -------------------------
  // SENSE LOSS CORE (v2.89.0)
  // -------------------------
  // Model: normal human vision is a Full sense (2 levels). Conditions may
  // carry senseLevels = levels of visible-light sense lost. Effective
  // vision = 2 - total lost: 0 lost = Full, 1 = Basic, 2+ = blind (None).
  // Sources:
  //   - dazzled/blinded conditions (Flash, Laser dazzle) - senseLevels,
  //     recoverable via the normal !mp recover flow.
  //   - darkness / glare conditions (environmental, GM-toggled) - no
  //     recovery roll; cleared with !mp darkness/glare --off. Darkness
  //     and Glare ranks cancel each other out (rules, Darkness Control).

  const SENSE_ENV_TYPES = ["darkness", "glare"];

  // -------------------------
  // CHARACTER SENSES (v2.92.0) - sheet v44.60 sense rows
  // -------------------------
  // Baseline: the six default human senses. Rows on repeating_abilities
  // (ability_sense_detects != "") override, add, or remove senses.
  // Level=none removal rows are ALWAYS-ON (blindness doesn't toggle off);
  // other rows are skipped when State is Off/Held or Gear+Broken.
  const SENSE_LEVEL_NUM = { none: 0, minimum: 1, basic: 1, full: 2, analytical: 3 };
  const SENSE_TYPE_RADIATES = { visible: 1, infrared: 1, ultraviolet: 1, audible: 1, subsonic: 1,
    ultrasonic: 1, odors: 1, radio: 1, mental: 1, mood: 1, life: 1, magic: 1, magnetism: 1,
    radiation: 1, danger: 1, xrays: 1 };

  function defaultSenses() {
    const base = {
      pen: 0,
      penBlock: ""
    };
    return {
      visible: Object.assign({}, base, { lvl: 2, rng: 1, glob: 0, rad: 1, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "vision" }),
      audible: Object.assign({}, base, { lvl: 1, rng: 1, glob: 1, rad: 1, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "hearing" }),
      odors:   Object.assign({}, base, { lvl: 1, rng: 1, glob: 1, rad: 1, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "scent" }),
      shapes:  Object.assign({}, base, { lvl: 1, rng: 0, glob: 1, rad: 0, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "touch" }),
      flavors: Object.assign({}, base, { lvl: 1, rng: 0, glob: 0, rad: 0, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "taste" }),
      time:    Object.assign({}, base, { lvl: 1, rng: 0, glob: 0, rad: 0, chk: 0, tele: 0, amp: 0, prot: 0, weak: "", label: "time" })
    };
  }

  function getCharacterSenses(charId) {
    const senses = defaultSenses();
    if (!charId) return senses;
    const attrs = findObjs({ _type: "attribute", _characterid: charId });

    // Gather rows by suffix match. Penetrating and its "blocked by"
    // material were present on the sheet but were not previously read.
    const rows = {};
    attrs.forEach(a => {
      const n = a.get("name");
      const m = n.match(/^repeating_abilities_(.+)_ability_(sense_detects|sense_level|sense_weakness|sense_ranged|sense_global|sense_radiates|sense_chkmod|sense_tele|sense_amp|sense_prot|sense_pen|sense_pen_block|state|gear|broken)$/);
      if (!m) return;
      if (!rows[m[1]]) rows[m[1]] = {};
      rows[m[1]][m[2]] = a.get("current");
    });

    Object.keys(rows).forEach(rid => {
      const r = rows[rid];
      const detects = (r.sense_detects || "").toLowerCase();
      if (!detects) return;
      const level = (r.sense_level || "basic").toLowerCase();

      if (level === "none") {
        // Removal weakness: always on regardless of State/Broken.
        senses[detects] = {
          lvl: 0, rng: 0, glob: 0, rad: 0, chk: 0, tele: 0,
          amp: 0, prot: 0, pen: 0, penBlock: "", weak: "",
          removed: true, label: detects
        };
        return;
      }

      const state = r.state || "Off";
      const inactive =
        (state === "Off" || state === "Held") ||
        (r.gear === "1" && r.broken === "1");
      if (inactive) return;

      senses[detects] = {
        lvl: SENSE_LEVEL_NUM[level] != null ? SENSE_LEVEL_NUM[level] : 1,
        rng: r.sense_ranged === "1" ? 1 : 0,
        // Both Global builds cover all directions on a flat Roll20 map.
        glob: (r.sense_global === "full" || r.sense_global === "circle") ? 1 : 0,
        rad: (r.sense_radiates != null)
          ? (r.sense_radiates === "1" ? 1 : 0)
          : (SENSE_TYPE_RADIATES[detects] ? 1 : 0),
        chk: num(r.sense_chkmod, 0),
        tele: num(r.sense_tele, 0),
        amp: num(r.sense_amp, 0),
        prot: num(r.sense_prot, 0),
        pen: r.sense_pen === "1" ? 1 : 0,
        penBlock: (r.sense_pen_block || "").trim(),
        weak: (r.sense_weakness || "").toLowerCase(),
        label: (senses[detects] && senses[detects].label) || detects
      };
    });
    return senses;
  }

  function visionLossInfo(tokId, charId) {
    const conds = (state.MP_Engine.conditions && state.MP_Engine.conditions[tokId]) || [];
    let dazzle = 0, darkness = 0, glare = 0;
    conds.forEach(c => {
      if (c.type === "darkness") darkness += num(c.senseLevels, 0);
      else if (c.type === "glare") glare += num(c.senseLevels, 0);
      else if (c.type === "dazzled" || c.type === "blinded") {
        // Legacy dazzled conditions (pre-2.89) had no senseLevels; treat as 2.
        dazzle += (c.senseLevels != null) ? num(c.senseLevels, 0) : 2;
      }
    });
    // v2.92.0: sense rows supply the base level and Amplified/Protected
    // ranks. Amp negates dampening (Darkness); Prot negates overload
    // (Glare, Flash dazzle). Darkness & Glare still cancel first.
    const vis = charId ? getCharacterSenses(charId).visible : defaultSenses().visible;
    const base = vis.lvl;
    const net = darkness - glare;
    const dampening = Math.max(0, Math.max(0, net) - num(vis.amp, 0));
    const overload = Math.max(0, Math.max(0, -net) + dazzle - num(vis.prot, 0));
    const lost = dampening + overload;
    const env = Math.abs(net); // for cause display
    const effective = Math.max(0, base - lost);
    const effLabel = effective >= 3 ? "Analytical" : (effective === 2 ? "Full" : (effective === 1 ? "Basic" : "BLIND"));
    const causes = [];
    if (dazzle) causes.push(`Dazzle ${dazzle}`);
    if (darkness) causes.push(`Darkness ${darkness}`);
    if (glare) causes.push(`Glare ${glare}`);
    if (darkness && glare) causes.push(`net ${env} (cancel)`);
    if (charId && vis.amp) causes.push(`Amp ${vis.amp}`);
    if (charId && vis.prot) causes.push(`Prot ${vis.prot}`);
    if (charId && vis.removed) causes.push(`BLIND (Diminished Sense)`);
    return { dazzle, darkness, glare, env, lost, base, effective, effLabel, causes, vis };
  }

  // To-hit penalty for a vision-impaired attacker. Basic vision: -3
  // (locating/distinguishing targets needs a perception check with a Basic
  // sense - abstracted as a flat -3). Blind: config penalty, default -6
  // (target by hearing/rough location; normal Basic hearing prevents a
  // total inability to attack).
  // v2.90.0: retained for the status-card summary; the attack pipeline now
  // rolls full 4.6 target acquisition via rollAcquisition() instead.
  function visionAtkPenalty(lossInfo) {
    if (!lossInfo || lossInfo.lost <= 0) return 0;
    if (lossInfo.effective <= 0) return num(state.MP_Engine.blindPenalty, -6);
    if (lossInfo.effective === 1) return -3;
    return 0;
  }

  // -------------------------
  // TARGET ACQUISITION (4.6) - v2.90.0
  // -------------------------
  // Acquiring a target is a perception check (IN save, 3.1.5) mapped
  // through the sense-level table. Tiers:
  //   "-"  perceives nothing: CANNOT attack; -3/-6 defense (4.7.2, GM)
  //   "?"  senses something's around, can't locate/ID: may attack the
  //        unlocated target at -6 (configurable via blindpen); -3 defense
  //   "-3" crude perception: target at -3 to hit; -3 defense
  //   "ID" clear: no penalties. "+"/"++" add detail (gear, dimensions).
  // Rows indexed by sense level: 0 None, 1 Basic, 2 Full, 3 Analytical.
  // Columns: critFumble, fail, succeed, critSuccess (3.0.1 confirm rolls).
  const ACQ_TABLE = {
    0: { critFumble: "-",  fail: "-",  succeed: "-",  critSuccess: "?"  },
    1: { critFumble: "-",  fail: "?",  succeed: "-3", critSuccess: "ID" },
    2: { critFumble: "-3", fail: "ID", succeed: "+",  critSuccess: "++" },
    3: { critFumble: "ID", fail: "+",  succeed: "++", critSuccess: "++" }
  };

  function acqTierEffect(tier) {
    switch (tier) {
      case "-":  return { blocked: true,  toHitMod: 0,  label: "perceives nothing - cannot attack" };
      case "?":  return { blocked: false, toHitMod: num(state.MP_Engine.blindPenalty, -6), label: "unlocated - attacking blind" };
      case "-3": return { blocked: false, toHitMod: -3, label: "crude perception" };
      case "ID": return { blocked: false, toHitMod: 0,  label: "identified" };
      case "+":  return { blocked: false, toHitMod: 0,  label: "identified (+gear/systems)" };
      case "++": return { blocked: false, toHitMod: 0,  label: "identified (++full detail)" };
      default:   return { blocked: false, toHitMod: 0,  label: tier };
    }
  }

  // Roll 4.6 target acquisition for an impaired attacker. senseLevel is the
  // effective level of the best sense used (0-3). When vision is None, the
  // caller falls back to default human hearing (Basic). forcedRolls =
  // [first, confirm] for the test harness.
  // v2.91.0: optional modifier adjusts the perception TN (e.g. opposition
  // from a sneaking target per 3.0.2.4: -(target AG save - 10)).
  // v2.91.3: sneakGate applies 3.1.5.1 - vs a sneaking target, BASIC sense
  // checks only detect on a critical success; all other outcomes drop to
  // "-" (undetected, cannot attack). Full/Analytical senses are unaffected
  // by the gate (only by the AG opposition modifier).
  function rollAcquisition(charId, senseLevel, forcedRolls, modifier, sneakGate) {
    const inSave = getAttrNum(charId, "intelligence_save", 10);
    const mod = num(modifier, 0);
    const tn = inSave + mod;
    const d1 = (forcedRolls && forcedRolls[0] !== undefined) ? forcedRolls[0] : randomInteger(20);
    let outcome, d2 = null;
    if (d1 === 1) {
      d2 = (forcedRolls && forcedRolls[1] !== undefined) ? forcedRolls[1] : randomInteger(20);
      outcome = (d2 <= tn) ? "critSuccess" : "succeed"; // a 1 always succeeds (3.0.1)
    } else if (d1 === 20) {
      d2 = (forcedRolls && forcedRolls[1] !== undefined) ? forcedRolls[1] : randomInteger(20);
      outcome = (d2 > tn) ? "critFumble" : "fail"; // a 20 always fails
    } else {
      outcome = (d1 <= tn) ? "succeed" : "fail";
    }
    const row = ACQ_TABLE[Math.max(0, Math.min(3, senseLevel))] || ACQ_TABLE[1];
    let tier = row[outcome];
    let gated = false;
    if (sneakGate && senseLevel === 1 && outcome !== "critSuccess") {
      tier = "-"; // 3.1.5.1: Basic senses detect a sneaking target only on a crit
      gated = true;
    }
    const eff = acqTierEffect(tier);
    return {
      tier, outcome, blocked: eff.blocked, toHitMod: eff.toHitMod, label: eff.label,
      inSave, mod, tn, d1, d2, gated
    };
  }

  // v2.100.0: shared acquire-once cache signature (attack pipeline + !mp
  // scan). Invalidates on defender movement, concealment change, attacker
  // vision change, or (for range-sensitive senses) range-band change.
  function acqSignature(defTok, obs, rangeInches) {
    const av = obs.atkVision || {
      lost: 0,
      causes: []
    };
    const atkTok = obs.atkTokId
      ? getObj("graphic", obs.atkTokId)
      : null;

    return [
      Math.round(num(defTok.get("left"), 0)),
      Math.round(num(defTok.get("top"), 0)),
      obs.inv
        ? `inv:${obs.inv.blur ? 1 : 0}`
        : "vis",
      `snk:${obs.sneaking ? 1 : 0}`,
      `atk:${av.lost}:${(av.causes || []).join("|")}`,
      `lvl:${obs.level}:${obs.oppMod}:${obs.chkMod || 0}`,
      atkTok
        ? `observer:${Math.round(num(atkTok.get("left"), 0))},` +
          `${Math.round(num(atkTok.get("top"), 0))},` +
          `${Math.round(num(atkTok.get("rotation"), 0))}`
        : "observer:-",
      `env:${obs.envSig || "-"}`,
      (obs.extraToHit || obs.rangeSensitive)
        ? `rb:${Math.round(num(rangeInches, 0))}`
        : "rb:-"
    ].join(";");
  }

  // -------------------------
  // INVISIBILITY (v2.91.0)
  // -------------------------
  // How well can this attacker observe this defender? Combines the
  // attacker's own vision impairment (darkness/dazzle) with the defender's
  // Invisibility/Blur condition:
  //   - full Invisibility blocks vision entirely -> fall back to default
  //     human hearing (Basic). RAW: Basic senses still detect an invisible
  //     character easily unless they're ALSO sneaking - a sneaking target
  //     opposes the check at -(AG save - 10) per 3.0.2.4.
  //   - Blur reduces the observer's effective vision by one level.
  // v2.92.1: can this sense reach a target at this range, and what bonus
  // does it get vs range penalties? RAW (Ranged Senses): a Ranged sense
  // works to IN/2", OR at ANY range with IN+6 vs range penalties if the
  // stimulus radiates. Non-Ranged senses only work in contact range (1").

  // -------------------------
  // ROLL20 SENSORY ENVIRONMENT (v2.101.0)
  // -------------------------
  // Roll20 does not expose a "can token A see token B" API call. Scan must
  // therefore reproduce the parts of Dynamic Lighting needed by MP:
  // illumination, facing arcs, and blocking barriers.
  //
  // Conservative ruling: a Roll20 wall/closed door blocks every ordinary
  // ranged sense. A Penetrating sense may ignore it; the sense's specified
  // "blocked by" material remains GM adjudication because Roll20 barriers
  // do not expose material data. Windows are transparent to sight and are
  // not included as blocking segments.

  function mpBool(v) {
    return v === true || v === 1 || v === "1" || v === "true";
  }

  function normDeg(v) {
    let n = num(v, 0) % 360;
    if (n < 0) n += 360;
    return n;
  }

  function angleDelta(a, b) {
    let d = Math.abs(normDeg(a) - normDeg(b));
    return d > 180 ? 360 - d : d;
  }

  function tokenCenter(tok) {
    return {
      x: num(tok && tok.get("left"), 0),
      y: num(tok && tok.get("top"), 0)
    };
  }

  // Roll20 rotation 0 points toward the top of the page and increases
  // clockwise. This returns the same convention.
  function tokenBearingDeg(fromTok, toTok) {
    const a = tokenCenter(fromTok);
    const b = tokenCenter(toTok);
    return normDeg(Math.atan2(b.x - a.x, a.y - b.y) * 180 / Math.PI);
  }

  function pointInArc(sourceTok, targetTok, total, centerOffset) {
    const width = Math.max(0, Math.min(360, num(total, 360)));
    if (width >= 359.999) return true;
    const facing = normDeg(num(sourceTok.get("rotation"), 0) + num(centerOffset, 0));
    return angleDelta(facing, tokenBearingDeg(sourceTok, targetTok)) <= width / 2;
  }

  function senseFacesTarget(sourceTok, targetTok, senseKey, senseObj) {
    if (!sourceTok || !targetTok) return false;
    if (senseObj && senseObj.glob) return true;

    // MP senses normally cover a 90-degree forward arc. If Roll20 has a
    // narrower directional-vision cone configured, honor the narrower cone.
    let total = 90;
    let center = 0;
    if (
      senseKey === "visible" &&
      mpBool(sourceTok.get("has_limit_field_of_vision"))
    ) {
      total = Math.min(
        total,
        Math.max(0, num(sourceTok.get("limit_field_of_vision_total"), 90))
      );
      center = num(sourceTok.get("limit_field_of_vision_center"), 0);
    }
    return pointInArc(sourceTok, targetTok, total, center);
  }

  function rotateLocalPoint(x, y, degrees) {
    const rad = normDeg(degrees) * Math.PI / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return { x: x * c - y * s, y: x * s + y * c };
  }

  function classicPathWorldPoint(pathObj, x, y) {
    const width = Math.max(1, num(pathObj.get("width"), 1));
    const height = Math.max(1, num(pathObj.get("height"), 1));
    const sx = num(pathObj.get("scaleX"), 1);
    const sy = num(pathObj.get("scaleY"), 1);
    const local = rotateLocalPoint(
      (num(x, 0) - width / 2) * sx,
      (num(y, 0) - height / 2) * sy,
      num(pathObj.get("rotation"), 0)
    );
    return {
      x: num(pathObj.get("left"), 0) + local.x,
      y: num(pathObj.get("top"), 0) + local.y
    };
  }

  function classicPathSegments(pathObj) {
    let commands;
    try {
      commands = JSON.parse(pathObj.get("_path") || "[]");
    } catch (e) {
      return [];
    }

    const segments = [];
    let current = null;
    let start = null;

    const addLine = p => {
      if (current) segments.push([current, p]);
      current = p;
    };

    commands.forEach(cmd => {
      if (!cmd || !cmd.length) return;
      const op = String(cmd[0]).toUpperCase();

      if (op === "M") {
        current = classicPathWorldPoint(pathObj, cmd[1], cmd[2]);
        start = current;
        return;
      }

      if (op === "L") {
        addLine(classicPathWorldPoint(pathObj, cmd[1], cmd[2]));
        return;
      }

      if (op === "Q" && current) {
        // Quadratic curve: flatten into short line segments.
        const p0 = current;
        const c = classicPathWorldPoint(pathObj, cmd[1], cmd[2]);
        const p1 = classicPathWorldPoint(pathObj, cmd[3], cmd[4]);
        for (let i = 1; i <= 8; i++) {
          const t = i / 8;
          const mt = 1 - t;
          addLine({
            x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
            y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y
          });
        }
        return;
      }

      if (op === "C" && current) {
        // Cubic curve: flatten into short line segments.
        const p0 = current;
        const c1 = classicPathWorldPoint(pathObj, cmd[1], cmd[2]);
        const c2 = classicPathWorldPoint(pathObj, cmd[3], cmd[4]);
        const p1 = classicPathWorldPoint(pathObj, cmd[5], cmd[6]);
        for (let i = 1; i <= 10; i++) {
          const t = i / 10;
          const mt = 1 - t;
          addLine({
            x: mt * mt * mt * p0.x +
               3 * mt * mt * t * c1.x +
               3 * mt * t * t * c2.x +
               t * t * t * p1.x,
            y: mt * mt * mt * p0.y +
               3 * mt * mt * t * c1.y +
               3 * mt * t * t * c2.y +
               t * t * t * p1.y
          });
        }
        return;
      }

      if ((op === "Z" || op === "CLOSE") && current && start) {
        segments.push([current, start]);
        current = start;
      }
    });
    return segments;
  }

  function pathV2Segments(pathObj) {
    let pts;
    try {
      pts = JSON.parse(pathObj.get("points") || "[]");
    } catch (e) {
      return [];
    }
    if (!Array.isArray(pts) || pts.length < 2) return [];

    const shape = String(pathObj.get("shape") || "pol").toLowerCase();
    let raw = pts.map(p => ({ x: num(p[0], 0), y: num(p[1], 0) }));

    if (shape === "rec") {
      const a = raw[0], b = raw[1];
      raw = [
        { x: a.x, y: a.y },
        { x: b.x, y: a.y },
        { x: b.x, y: b.y },
        { x: a.x, y: b.y },
        { x: a.x, y: a.y }
      ];
    } else if (shape === "eli") {
      const a = raw[0], b = raw[1];
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const rx = Math.abs(b.x - a.x) / 2;
      const ry = Math.abs(b.y - a.y) / 2;
      raw = [];
      for (let i = 0; i <= 24; i++) {
        const ang = i * Math.PI * 2 / 24;
        raw.push({ x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry });
      }
    }

    const xs = raw.map(p => p.x);
    const ys = raw.map(p => p.y);
    const localCx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    const localCy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    const worldCx = num(pathObj.get("x"), 0);
    const worldCy = num(pathObj.get("y"), 0);
    const rot = num(pathObj.get("rotation"), 0);

    const world = raw.map(p => {
      const q = rotateLocalPoint(p.x - localCx, p.y - localCy, rot);
      return { x: worldCx + q.x, y: worldCy + q.y };
    });

    const segments = [];
    for (let i = 1; i < world.length; i++) {
      segments.push([world[i - 1], world[i]]);
    }
    return segments;
  }

  function doorWorldSegment(doorObj) {
    let path = doorObj.get("path");
    try {
      if (typeof path === "string") path = JSON.parse(path);
    } catch (e) {
      return null;
    }
    if (!path || !path.handle0 || !path.handle1) return null;

    // Door/window objects use an inverted Y axis in Roll20's API.
    const cx = num(doorObj.get("x"), 0);
    const cy = -num(doorObj.get("y"), 0);
    const a = {
      x: cx + num(path.handle0.x, 0),
      y: cy - num(path.handle0.y, 0)
    };
    const b = {
      x: cx + num(path.handle1.x, 0),
      y: cy - num(path.handle1.y, 0)
    };
    return [a, b];
  }

  function objectPageId(obj) {
    return obj && (obj.get("_pageid") || obj.get("pageid") || obj.get("_pageId"));
  }

  function roll20BarrierSegments(pageId) {
    const out = [];

    // Classic and Jumpgate paths. Transparent barriers do not block sight.
    ["path", "pathv2"].forEach(type => {
      findObjs({ _type: type, _pageid: pageId, layer: "walls" }).forEach(p => {
        const barrierType = String(p.get("barrierType") || "wall");
        if (barrierType === "transparent") return;
        const segs = type === "pathv2" ? pathV2Segments(p) : classicPathSegments(p);
        segs.forEach(seg => out.push(seg));
      });
    });

    // Closed doors block. Windows are intentionally omitted because they
    // are transparent to sight in Dynamic Lighting.
    findObjs({ _type: "door" }).forEach(d => {
      if (objectPageId(d) !== pageId || mpBool(d.get("isOpen"))) return;
      const seg = doorWorldSegment(d);
      if (seg) out.push(seg);
    });

    return out;
  }

  function segmentHit(a, b, c, d) {
    const rx = b.x - a.x;
    const ry = b.y - a.y;
    const sx = d.x - c.x;
    const sy = d.y - c.y;
    const denom = rx * sy - ry * sx;
    if (Math.abs(denom) < 0.000001) return null;

    const qpx = c.x - a.x;
    const qpy = c.y - a.y;
    const t = (qpx * sy - qpy * sx) / denom;
    const u = (qpx * ry - qpy * rx) / denom;

    // Ignore intersections at the exact token centers.
    if (t <= 0.002 || t >= 0.998 || u < 0 || u > 1) return null;
    return { t, u };
  }

  function lineBlockedBySegments(fromPoint, toPoint, segments) {
    return (segments || []).some(seg =>
      segmentHit(fromPoint, toPoint, seg[0], seg[1])
    );
  }

  function pagePixelsPerScaleUnit(page) {
    const scale = Math.max(0.0001, num(page && page.get("scale_number"), 5));
    return 70 / scale;
  }

  function centerDistancePx(aTok, bTok) {
    const a = tokenCenter(aTok);
    const b = tokenCenter(bTok);
    return Math.sqrt(
      Math.pow(b.x - a.x, 2) +
      Math.pow(b.y - a.y, 2)
    );
  }

  function directionalLightCovers(source, target, kind) {
    const isBright = kind === "bright";
    const enabled = isBright
      ? mpBool(source.get("has_directional_bright_light"))
      : mpBool(source.get("has_directional_dim_light"));
    if (!enabled) return true;

    const center = isBright
      ? num(source.get("directional_bright_light_center"), 0)
      : num(source.get("directional_dim_light_center"), 0);
    const total = isBright
      ? num(source.get("directional_bright_light_total"), 360)
      : num(source.get("directional_dim_light_total"), 360);
    return pointInArc(source, target, total, center);
  }

  function nightVisionCovers(observer, target, page, barriers) {
    if (!mpBool(observer.get("has_night_vision"))) return false;
    const dist = Math.max(0, num(observer.get("night_vision_distance"), 0));
    if (dist <= 0) return false;

    const px = dist * pagePixelsPerScaleUnit(page);
    if (centerDistancePx(observer, target) > px) return false;

    if (
      mpBool(observer.get("has_limit_field_of_night_vision")) &&
      !pointInArc(
        observer,
        target,
        num(observer.get("limit_field_of_night_vision_total"), 360),
        num(observer.get("limit_field_of_night_vision_center"), 0)
      )
    ) {
      return false;
    }

    return !lineBlockedBySegments(
      tokenCenter(observer),
      tokenCenter(target),
      barriers
    );
  }

  function roll20Illumination(observer, target, page, barriers) {
    if (!page || !mpBool(page.get("dynamic_lighting_enabled"))) {
      return { level: "unknown", source: "Dynamic Lighting off" };
    }

    if (
      mpBool(page.get("daylight_mode_enabled")) ||
      mpBool(page.get("lightglobalillum"))
    ) {
      return { level: "bright", source: "page daylight" };
    }

    if (nightVisionCovers(observer, target, page, barriers)) {
      return { level: "night", source: "night vision" };
    }

    const sensitivity = Math.max(
      0,
      num(observer.get("light_sensitivity_multiplier"), 100)
    ) / 100;
    let best = "dark";
    let sourceName = "";

    findObjs({ _type: "graphic", _pageid: objectPageId(target) }).forEach(src => {
      if (best === "bright") return;
      const layer = src.get("layer");
      if (layer !== "objects" && layer !== "map" && layer !== "foreground") return;

      const emitsBright = mpBool(src.get("emits_bright_light"));
      const emitsLow = mpBool(src.get("emits_low_light"));
      if (!emitsBright && !emitsLow) return;

      if (lineBlockedBySegments(tokenCenter(src), tokenCenter(target), barriers)) return;

      const pxPerUnit = pagePixelsPerScaleUnit(page);
      const distPx = centerDistancePx(src, target);
      const brightPx =
        Math.max(0, num(src.get("bright_light_distance"), 0)) *
        pxPerUnit *
        sensitivity;
      const lowPx =
        Math.max(0, num(src.get("low_light_distance"), 0)) *
        pxPerUnit *
        sensitivity;

      if (
        emitsBright &&
        distPx <= brightPx &&
        directionalLightCovers(src, target, "bright")
      ) {
        best = "bright";
        sourceName = src.get("name") || "light source";
        return;
      }

      if (
        emitsLow &&
        distPx <= lowPx &&
        directionalLightCovers(src, target, "dim")
      ) {
        best = "dim";
        sourceName = src.get("name") || "light source";
      }
    });

    return { level: best, source: sourceName };
  }

  function roll20SenseEnvironment(atkTokId, defTokId, senseKey, senseObj) {
    const atkTok = getObj("graphic", atkTokId);
    const defTok = getObj("graphic", defTokId);
    if (!atkTok || !defTok) {
      return {
        usable: false,
        obscured: false,
        reason: "missing token",
        sig: "missing"
      };
    }

    const pageId = atkTok.get("_pageid");
    const page = getObj("page", pageId);
    const barriers = roll20BarrierSegments(pageId);
    const inArc = senseFacesTarget(atkTok, defTok, senseKey, senseObj);
    const blocked = lineBlockedBySegments(
      tokenCenter(atkTok),
      tokenCenter(defTok),
      barriers
    );

    if (!inArc) {
      return {
        usable: false,
        obscured: false,
        reason: "outside sense arc",
        sig: "arc:0"
      };
    }

    if (blocked && !(senseObj && senseObj.pen)) {
      return {
        usable: false,
        obscured: false,
        reason: "blocked by barrier",
        sig: "arc:1;wall:1"
      };
    }

    if (senseKey === "visible") {
      const dynamic = page && mpBool(page.get("dynamic_lighting_enabled"));

      if (
        dynamic &&
        !mpBool(atkTok.get("has_bright_light_vision"))
      ) {
        return {
          usable: false,
          obscured: false,
          reason: "Roll20 token vision disabled",
          sig: `arc:1;wall:${blocked ? 1 : 0};vision:0`
        };
      }

      const light = roll20Illumination(atkTok, defTok, page, barriers);
      if (light.level === "dark") {
        return {
          usable: false,
          obscured: false,
          reason: "natural darkness",
          sig: `arc:1;wall:${blocked ? 1 : 0};light:dark`
        };
      }

      const penNote =
        blocked && senseObj && senseObj.pen
          ? `; Penetrating${senseObj.penBlock ? ` (blocked by ${senseObj.penBlock}, GM)` : ""}`
          : "";

      return {
        usable: true,
        obscured: light.level === "dim",
        reason:
          (light.level === "dim" ? "dim light" :
           light.level === "night" ? "night vision" :
           light.level === "unknown" ? "" : "illuminated") +
          penNote,
        sig:
          `arc:1;wall:${blocked ? 1 : 0};light:${light.level};` +
          `obs:${Math.round(num(atkTok.get("left"), 0))},` +
          `${Math.round(num(atkTok.get("top"), 0))},` +
          `${Math.round(num(atkTok.get("rotation"), 0))}`
      };
    }

    const penNote =
      blocked && senseObj && senseObj.pen
        ? `Penetrating${senseObj.penBlock ? `; blocked by ${senseObj.penBlock} is GM-adjudicated` : ""}`
        : "";

    return {
      usable: true,
      obscured: false,
      reason: penNote,
      sig:
        `arc:1;wall:${blocked ? 1 : 0};sense:${senseKey};` +
        `obs:${Math.round(num(atkTok.get("left"), 0))},` +
        `${Math.round(num(atkTok.get("top"), 0))},` +
        `${Math.round(num(atkTok.get("rotation"), 0))}`
    };
  }

  function senseReach(s, rangeInches, inScore) {
    if (rangeInches == null) return { usable: true, bonus: num(s.tele, 0), capped: false };
    if (!s.rng) return { usable: rangeInches <= 1, bonus: 0, capped: rangeInches > 1 };
    if (s.rad) return { usable: true, bonus: 6 + num(s.tele, 0), capped: false };
    const cap = Math.max(1, Math.floor(num(inScore, 10) / 2));
    return { usable: rangeInches <= cap, bonus: num(s.tele, 0), capped: rangeInches > cap, cap };
  }

  function observationLevel(atkTokId, defTokId, defCharId, atkCharId, rangeInches, rangePenalty) {
    const atkVision = visionLossInfo(atkTokId, atkCharId);
    const senses = atkCharId ? getCharacterSenses(atkCharId) : defaultSenses();
    const defConds =
      (state.MP_Engine.conditions &&
       state.MP_Engine.conditions[defTokId]) || [];
    const inv = defConds.find(c => c.type === "invisible");
    const sneaking =
      !!defConds.find(c => c.type === "sneaking") ||
      !!(inv && inv.sneaking);

    let visLevel = atkVision.effective;
    if (inv) {
      visLevel = inv.blur
        ? Math.max(0, visLevel - 1)
        : 0;
    }

    // Range-conditional Diminished Senses.
    const vis = senses.visible || defaultSenses().visible;
    let weakNote = "";
    let extraToHit = 0;
    let rangeWeak = false;

    if (visLevel > 0 && rangeInches != null) {
      if (
        vis.weak === "nearsighted" &&
        rangeInches > 4 &&
        visLevel > 1
      ) {
        visLevel = 1;
        weakNote = `Nearsighted >4"`;
        rangeWeak = true;
      } else if (
        vis.weak === "farsighted" &&
        rangeInches < 5 &&
        visLevel > 1
      ) {
        visLevel = 1;
        weakNote = `Farsighted <5"`;
        rangeWeak = true;
      }

      if (
        vis.weak === "nodepth" &&
        rangeInches > 1
      ) {
        extraToHit = -2;
        weakNote =
          (weakNote ? weakNote + "; " : "") +
          `No Depth >1" (-2)`;
        rangeWeak = true;
      }
    }

    const oppMod = sneaking
      ? -Math.max(
          0,
          getAttrNum(defCharId, "agility_save", 10) - 10
        )
      : 0;

    const inScore = getAttrNum(
      atkCharId,
      "intelligence_score",
      10
    );

    const acqRangeMod = (senseObj, reach) =>
      Math.min(
        0,
        num(rangePenalty, 0) + num(reach.bonus, 0)
      );

    /*
     * VISION
     *
     * Visible Light requires illumination. It must also be in the sense's
     * arc and not blocked by a barrier the sense cannot penetrate.
     */
    const visReach = senseReach(
      vis,
      rangeInches,
      inScore
    );
    const visEnv = roll20SenseEnvironment(
      atkTokId,
      defTokId,
      "visible",
      vis
    );

    if (
      visLevel > 0 &&
      visReach.usable &&
      visEnv.usable
    ) {
      const lvlLabel =
        visLevel >= 3
          ? "Analytical"
          : (visLevel === 2 ? "Full" : "Basic");

      const envNote = visEnv.reason
        ? `, ${visEnv.reason}`
        : "";

      const needsRoll =
        visLevel <= 1 ||
        atkVision.lost > 0 ||
        !!inv ||
        visEnv.obscured ||
        (rangeWeak && visLevel <= 1);

      return {
        level: visLevel,
        label:
          `vision (${lvlLabel}` +
          `${inv && inv.blur ? ", blurred" : ""}` +
          `${weakNote ? ", " + weakNote : ""}` +
          `${envNote})`,
        oppMod,
        chkMod: num(vis.chk, 0),
        rngMod: acqRangeMod(vis, visReach),
        extraToHit,
        needsRoll,
        inv,
        sneaking,
        sneakGate: sneaking && visLevel === 1,
        atkVision,
        atkTokId,
        senseKey: "visible",
        envSig: visEnv.sig,
        rangeSensitive: rangeWeak || !vis.rad
      };
    }

    /*
     * FALLBACK SENSE
     *
     * Use the highest-level remaining sense that reaches the target, covers
     * its direction, and is not blocked by a Roll20 barrier. A Penetrating
     * sense may ignore the barrier; its specified blocking material remains
     * a GM call because Roll20 walls do not identify their material.
     */
    let bestKey = null;
    let best = null;
    let bestReach = null;
    let bestEnv = null;

    Object.keys(senses).forEach(k => {
      if (k === "visible") return;

      const s = senses[k];
      if (s.removed || s.lvl <= 0) return;

      const reach = senseReach(
        s,
        rangeInches,
        inScore
      );
      if (!reach.usable) return;

      const env = roll20SenseEnvironment(
        atkTokId,
        defTokId,
        k,
        s
      );
      if (!env.usable) return;

      if (
        !best ||
        s.lvl > best.lvl ||
        (
          s.lvl === best.lvl &&
          num(s.chk, 0) > num(best.chk, 0)
        )
      ) {
        best = s;
        bestKey = k;
        bestReach = reach;
        bestEnv = env;
      }
    });

    if (!best) {
      const blockedWhy =
        !visReach.usable
          ? "vision out of range"
          : (!visEnv.usable
              ? visEnv.reason
              : "no usable sense");

      return {
        level: 0,
        label: `no usable sense (${blockedWhy})`,
        oppMod,
        chkMod: 0,
        rngMod: 0,
        extraToHit: 0,
        needsRoll: true,
        inv,
        sneaking,
        sneakGate: sneaking,
        atkVision,
        atkTokId,
        senseKey: null,
        envSig:
          (visEnv && visEnv.sig) ||
          `none:${blockedWhy}`,
        rangeSensitive: true
      };
    }

    const bLabel =
      best.lvl >= 3
        ? "Analytical"
        : (best.lvl === 2 ? "Full" : "Basic");

    const capNote =
      (!best.rad &&
       best.rng &&
       bestReach.cap != null)
        ? `, IN/2=${bestReach.cap}"`
        : "";

    const envNote =
      bestEnv && bestEnv.reason
        ? `, ${bestEnv.reason}`
        : "";

    return {
      level: best.lvl,
      label:
        `${best.label} (${bLabel}` +
        `${inv && !inv.blur ? " - target invisible" : ""}` +
        `${capNote}${envNote})`,
      oppMod,
      chkMod: num(best.chk, 0),
      rngMod: acqRangeMod(best, bestReach),
      extraToHit: 0,
      needsRoll: true,
      inv,
      sneaking,
      sneakGate:
        sneaking &&
        best.lvl === 1,
      atkVision,
      atkTokId,
      senseKey: bestKey,
      envSig: bestEnv ? bestEnv.sig : "",
      rangeSensitive: !best.rad
    };
  }

  // !mp invis --on [--blur] [--sneaking] | --off  (selected tokens or --target)
  // Voluntary: an action to activate, PR 1/round (auto-drained on round
  // advance; drops at 0 Power). Free to drop. Not GM-gated - players may
  // toggle their own ability, like Glow.
  function cmdInvis(msg, args) {
    const turnOff = ("off" in args);
    const isBlur = ("blur" in args);
    const isSneaking = ("sneaking" in args) || ("sneak" in args);
    const marker = CONDITION_MARKERS.invisible;

    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) {
      msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    }
    if (!ids.length) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Select token(s) or use --target. Usage: <code>!mp invis [--blur] [--sneaking] | --off</code>`);
    }

    const lines = [];
    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      if (!tok) return;
      const tokChar = getCharFromToken(tok);
      const tokName = tokChar ? tokChar.get("name") : (tok.get("name") || "token");
      if (!state.MP_Engine.conditions[tokId]) state.MP_Engine.conditions[tokId] = [];
      const conds = state.MP_Engine.conditions[tokId];
      const idx = conds.findIndex(c => c.type === "invisible");

      if (turnOff) {
        if (idx >= 0) {
          conds.splice(idx, 1);
          if (!conds.some(c => c.marker === marker)) tok.set("status_" + marker, false);
          lines.push(`<b>${esc(tokName)}</b> — visible again (no action or Power to drop).`);
        } else {
          lines.push(`<b>${esc(tokName)}</b> — wasn't invisible.`);
        }
        return;
      }

      const condition = {
        type: "invisible",
        sourceAtk: isBlur ? "Blur" : "Invisibility",
        blur: isBlur,
        sneaking: isSneaking,
        marker: marker,
        permanent: false,
        environmental: true, // voluntary - no recovery roll
        effectDesc: getConditionDesc("invisible", "Invisibility"),
        startRound: state.MP_Engine.currentRound,
        created: Date.now()
      };
      if (idx >= 0) conds[idx] = condition; else conds.push(condition);
      tok.set("status_" + marker, true);
      lines.push(`<b>${esc(tokName)}</b> — ${isBlur ? "BLURRED (observers -1 sense level)" : "INVISIBLE (vision blocked)"}${isSneaking ? ", sneaking (opposed AG)" : ""}. <span style="font-size:11px; color:#8a84a8;">Takes an action; PR 1/round auto-drains on round advance. Gear carried turns invisible too; drops become visible.</span>`);
    });

    let out = `<div style="background:#1a1a2e; border:2px solid #5a4fcf; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b style="color:#c8b8ff;">🫥 Invisibility</b>`;
    lines.forEach(l => out += `<br/>` + l);
    if (!turnOff) out += `<br/><span style="font-size:11px; color:#8a84a8;">Undetected characters get the Surprise bonus (4.6). Basic senses (hearing) still detect a non-sneaking invisible character.</span>`;
    out += `</div>`;
    ch("MP", `${wt(msg)}` + out);
  }

  // !mp sneak [--off] (selected tokens or --target). 3.1.5.1: move at 1/2
  // rate; observers' BASIC-sense checks detect only on a critical success,
  // opposed by the sneaker's AG. Sneaking does NOT conceal from a Full
  // sense with the sneaker in its vision arc - it matters from behind /
  // out of arc (GM adjudicated), in darkness, or combined with
  // Invisibility. No PR cost.
  function cmdSneak(msg, args) {
    const turnOff = ("off" in args);
    const marker = CONDITION_MARKERS.sneaking;
    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) {
      msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    }
    if (!ids.length) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Select token(s) or use --target. Usage: <code>!mp sneak | --off</code>`);
    }
    const lines = [];
    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      if (!tok) return;
      const tokChar = getCharFromToken(tok);
      const tokName = tokChar ? tokChar.get("name") : (tok.get("name") || "token");
      if (!state.MP_Engine.conditions[tokId]) state.MP_Engine.conditions[tokId] = [];
      const conds = state.MP_Engine.conditions[tokId];
      const idx = conds.findIndex(c => c.type === "sneaking");
      if (turnOff) {
        if (idx >= 0) {
          conds.splice(idx, 1);
          if (!conds.some(c => c.marker === marker)) tok.set("status_" + marker, false);
          lines.push(`<b>${esc(tokName)}</b> — stops sneaking.`);
        } else lines.push(`<b>${esc(tokName)}</b> — wasn't sneaking.`);
        return;
      }
      const condition = {
        type: "sneaking", sourceAtk: "Stealth", marker: marker,
        permanent: false, environmental: true,
        effectDesc: getConditionDesc("sneaking", "Stealth"),
        startRound: state.MP_Engine.currentRound, created: Date.now()
      };
      if (idx >= 0) conds[idx] = condition; else conds.push(condition);
      tok.set("status_" + marker, true);
      lines.push(`<b>${esc(tokName)}</b> — SNEAKING (1/2 move rate).`);
    });
    let out = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b>👣 Stealth (3.1.5.1)</b>`;
    lines.forEach(l => out += `<br/>` + l);
    if (!turnOff) out += `<br/><span style="font-size:11px; color:#8a84a8;">Still visible to Full senses (e.g. vision) with the sneaker in their arc. BASIC-sense checks (hearing/scent, or vision degraded to Basic) detect only on a CRITICAL success, opposed by the sneaker's AG — e.g. approaching from behind. Undetected = Surprise bonus (4.6).</span>`;
    out += `</div>`;
    ch("MP", `${wt(msg)}` + out);
  }

  // !mp perceive [--sense KEY] [--mod N] (select observer token; optional
  // second selected token or --target = subject, for sneaking opposition).
  // 3.1.5: IN check + the sense's Chk mod + situational --mod; crit success
  // perceives at one higher sense level. Sheet button passes --charid.
  function cmdPerceive(msg, args) {
    // resolve observer: selected token, or --charid via unique/selected token
    let obsTok = null;
    const sel = (msg.selected || []).filter(s => s._type === "graphic").map(s => getObj("graphic", s._id)).filter(Boolean);
    if (args.charid) {
      obsTok = sel.find(t => t.get("represents") === args.charid) || null;
      if (!obsTok) {
        const cands = findObjs({ _type: "graphic", represents: args.charid }).filter(t => t.get("_pageid") === (sel[0] ? sel[0].get("_pageid") : t.get("_pageid")));
        if (cands.length === 1) obsTok = cands[0];
      }
    }
    if (!obsTok && sel.length) obsTok = sel[0];
    const obsChar = obsTok ? getCharFromToken(obsTok) : (args.charid ? getObj("character", args.charid) : null);
    if (!obsChar) return ch("MP", `${wt(msg)}<b>MP:</b> Select the observer's token (linked), then <code>!mp perceive [--sense visible|audible|radar|...] [--mod N]</code>`);
    const obsName = obsChar.get("name");

    const senses = getCharacterSenses(obsChar.id);
    let key = (args.sense || args.detects || "").toLowerCase();
    if (!key || !senses[key] || senses[key].removed || senses[key].lvl <= 0) {
      // default: best available sense overall (vision first if usable)
      key = null;
      Object.keys(senses).forEach(k => {
        const s = senses[k];
        if (s.removed || s.lvl <= 0) return;
        if (!key || s.lvl > senses[key].lvl || (k === "visible" && s.lvl === senses[key].lvl)) key = k;
      });
      if (!key) return ch("MP", `${wt(msg)}<b>MP:</b> <b>${esc(obsName)}</b> has no usable senses.`);
    }
    const s = senses[key];
    const lvlLabel = s.lvl >= 3 ? "Analytical" : (s.lvl === 2 ? "Full" : "Basic");

    // optional subject: --target or 2nd selected token (sneaking opposition)
    let subjTok = args.target ? getObj("graphic", args.target) : (sel.length > 1 && sel[1] !== obsTok ? sel[1] : null);
    let oppMod = 0, oppNote = "";
    if (subjTok) {
      const sConds = (state.MP_Engine.conditions && state.MP_Engine.conditions[subjTok.id]) || [];
      const inv = sConds.find(c => c.type === "invisible");
      const snk = !!sConds.find(c => c.type === "sneaking") || !!(inv && inv.sneaking);
      if (snk) {
        const sc = getCharFromToken(subjTok);
        oppMod = -Math.max(0, getAttrNum(sc ? sc.id : null, "agility_save", 10) - 10);
        oppNote = ` opp ${oppMod} (sneaking)`;
      }
    }

    // v2.92.1: subject range - penalty from the range table, offset by
    // Telescopic and the RAW +6 for a radiating Ranged sense; hard reach
    // limits (IN/2" non-radiating, 1" non-Ranged) refuse the check.
    let rngNote = "", rngMod = 0;
    if (subjTok && obsTok) {
      const rd = calculateRangeWithProfile(obsTok, subjTok, obsChar.id, null);
      const inScore = getAttrNum(obsChar.id, "intelligence_score", 10);
      const reach = senseReach(s, rd.inches, inScore);
      if (!reach.usable) {
        const why = !s.rng ? "no range (contact only, 1\")" : `beyond IN/2 = ${reach.cap}\"`;
        return ch("MP", `${wt(msg)}<div style="background:#1a1a2e; border:2px solid #3d5a80; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b style="color:#7fb3d5;">🔎 Perception</b> — <b>${esc(obsName)}</b>'s ${esc(s.label || key)} can't reach the subject at ${Math.round(rd.inches)}\" (${why}).</div>`);
      }
      rngMod = Math.min(0, num(rd.penalty, 0) + num(reach.bonus, 0));
      if (num(rd.penalty, 0) !== 0) rngNote = ` ${rngMod} range${reach.bonus ? ` (pen ${rd.penalty}, +${reach.bonus} ${s.rad ? "radiates" : ""}${s.tele ? "/tele" : ""})` : ""}`;
    }
    const discMod = (obsTok && hasDiscomfort(obsTok.id)) ? -3 : 0;
    const mod = num(args.mod, 0) + num(s.chk, 0) + oppMod + rngMod + discMod;
    const sneakGate = !!oppNote && s.lvl === 1;
    const acq = rollAcquisition(obsChar.id, s.lvl, undefined, mod, sneakGate);

    const detail = {
      "-": "perceives nothing",
      "?": "senses something is around, but can't locate or identify it",
      "-3": "crude perception - located and identified, details need another check",
      "ID": "clearly perceives and identifies",
      "+": "clearly perceives; notices gear / internal systems",
      "++": "full detail - dimensions, distance, velocity, etc."
    }[acq.tier] || acq.tier;
    const critNote = (acq.outcome === "critSuccess") ? " <span style=\"color:#2ecc71;\">(critical: one sense level higher detail)</span>" : "";
    const modBits = [];
    if (num(args.mod, 0)) modBits.push(`${num(args.mod, 0)} situational`);
    if (num(s.chk, 0)) modBits.push(`${s.chk > 0 ? "+" : ""}${s.chk} chk`);
    if (oppNote) modBits.push(oppNote.trim());
    if (rngNote) modBits.push(rngNote.trim());
    if (discMod) modBits.push(`${discMod} discomfort`);

    let out = `<div style="background:#1a1a2e; border:2px solid #3d5a80; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b style="color:#7fb3d5;">🔎 Perception</b> — <b>${esc(obsName)}</b> by ${esc(s.label || key)} (${lvlLabel})<br/>`;
    out += `IN ${acq.inSave}-${acq.mod !== 0 ? ` ${acq.mod} (${modBits.join(", ")}) = ${acq.tn}-` : ""} · rolled <b>${acq.d1}${acq.d2 != null ? `/${acq.d2}` : ""}</b>${acq.gated ? " — needed a CRIT (3.1.5.1)" : ""}<br/>`;
    out += `<b>[${acq.tier}]</b> ${esc(detail)}${critNote}`;
    out += `</div>`;
    ch("MP", `${wt(msg)}` + out);
  }

  // 8-way compass bearing from one token to another (Roll20 screen coords:
  // +x = East, +y = South).
  function compassBearing(fromTok, toTok) {
    const dx = num(toTok.get("left"), 0) - num(fromTok.get("left"), 0);
    const dy = num(toTok.get("top"), 0) - num(fromTok.get("top"), 0);
    if (!dx && !dy) return "";
    const dirs = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
    const ang = Math.atan2(dy, dx);
    return dirs[Math.round(((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4)) % 8];
  }


  // Broad range wording keeps ordinary Scan results within the information
  // granted by their acquisition tier. Only ++ grants exact distance (4.6).
  function scanDistanceLabel(inches, tier) {
    const d = Math.max(0, num(inches, 0));
    if (tier === "++") {
      const rounded = Math.round(d * 10) / 10;
      return `${rounded}"`;
    }
    if (d <= 1) return "at contact range";
    if (d <= 5) return "nearby";
    if (d <= 15) return "across the room";
    if (d <= 30) return "far away";
    return "distant";
  }

  function scanBearingLabel(code) {
    return ({
      N: "north", NE: "northeast", E: "east", SE: "southeast",
      S: "south", SW: "southwest", W: "west", NW: "northwest"
    })[code] || "at your position";
  }

  // !mp locate --atk TOKEN_ID --target TOKEN_ID
  // Generated by Scan cards. Revalidates the current MP acquisition before
  // placing a Roll20 ping visible only to the requesting player. This is a
  // tabletop visualization of information the character already possesses;
  // it does not reveal or move the target token and costs no action.
  function cmdLocate(msg, args) {
    const atkTok = args.atk ? getObj("graphic", args.atk) : null;
    const defTok = args.target ? getObj("graphic", args.target) : null;

    if (!atkTok || !defTok) {
      return ch("MP", `${wt(msg)}<b>MP:</b> That Locate button is no longer valid.`);
    }

    if (
      atkTok.get("_pageid") !== defTok.get("_pageid") ||
      defTok.get("layer") !== "objects"
    ) {
      return ch("MP", `${wt(msg)}<b>MP:</b> The contact is no longer on your page.`);
    }

    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);
    if (!atkChar || !defChar) {
      return ch("MP", `${wt(msg)}<b>MP:</b> The observer or contact is no longer linked to a character.`);
    }

    if (!canControl(msg, atkChar.id)) {
      return ch("MP", `${wt(msg)}You don't control ${esc(atkChar.get("name"))}.`);
    }

    const rangeData = calculateRangeWithProfile(
      atkTok,
      defTok,
      atkChar.id,
      defChar.id
    );
    const obs = observationLevel(
      atkTok.id,
      defTok.id,
      defChar.id,
      atkChar.id,
      rangeData.inches,
      rangeData.penalty
    );

    const acqKey = atkTok.id + "|" + defTok.id;
    const held = state.MP_Engine.acquired && state.MP_Engine.acquired[acqKey];
    const locatableTiers = { "-3": true, ID: true, "+": true, "++": true };
    const stillObvious = !obs.needsRoll;
    const heldValid = !!(
      held &&
      locatableTiers[held.tier] &&
      held.sig === acqSignature(defTok, obs, rangeData.inches)
    );

    if (!stillObvious && !heldValid) {
      if (state.MP_Engine.acquired) delete state.MP_Engine.acquired[acqKey];
      return ch(
        "MP",
        `${wt(msg)}` +
        `<div style="background:#1a1a2e; border:2px solid #c0392b; border-radius:6px; padding:6px 10px; color:#eee; font-family:Arial,sans-serif; max-width:320px;">` +
        `<b style="color:#ff8a8a;">Contact lost</b><br/>` +
        `The target moved or its concealment, lighting, facing, range, or barriers changed. Scan again to reacquire it.` +
        `</div>`
      );
    }

    // visibleTo restricts both the ping and view movement to this player.
    sendPing(
      num(defTok.get("left"), 0),
      num(defTok.get("top"), 0),
      defTok.get("_pageid"),
      msg.playerid,
      true,
      msg.playerid
    );

    const targetName = defTok.get("name") || defChar.get("name") || "contact";
    return ch(
      "MP",
      `${wt(msg)}` +
      `<span style="color:#7fb3d5;"><b>Locate:</b></span> ` +
      `Centered your view on <b>${esc(targetName)}</b>.`
    );
  }

  // -------------------------
  // SCAN (v2.100.0) - 3.1.5 perception sweep / targeting console
  // -------------------------
  // !mp scan [--mod N] [--charid ID]  (select your token; sheet button
  // passes --charid). For acquiring targets the player can't see or click
  // (lightless rooms, invisibles): ONE IN check (3.0.1 confirm pre-rolled
  // and shared) evaluated at a per-target TN against every character token
  // on the page. Per RAW 3.1.5 the free check uses the best sense
  // available: observationLevel() auto-picks per target, exactly as the
  // attack pipeline would, so located results seed the v2.91.1
  // acquire-once cache (shared acqSignature) and the following !mp atk
  // honors the scanned tier without re-rolling - until the target moves or
  // changes concealment, when the sig invalidates and RAW re-acquire
  // kicks in. "-" and "?" results clear any cached acquisition for that
  // pair: the scan IS the character's current perception state.
  // Card: "-" omitted; "?" collapsed to one anonymous presence line;
  // "-3"/ID/+/++ named with distance, bearing, tier, and an Attack button
  // carrying --target. Clearly visible targets (no roll needed) listed
  // for completeness. First scan per token per round = the 3.1.5 free
  // save; repeats banner "costs an Action" (advisory - GM enforces, and
  // out of combat the round counter doesn't advance).
  function cmdScan(msg, args) {
    // resolve observer: --charid via selected/unique token, else 1st selected
    let obsTok = null;
    const sel = (msg.selected || []).filter(s => s._type === "graphic").map(s => getObj("graphic", s._id)).filter(Boolean);
    if (args.charid) {
      obsTok = sel.find(t => t.get("represents") === args.charid) || null;
      if (!obsTok) {
        const cands = findObjs({ _type: "graphic", represents: args.charid }).filter(t => t.get("_pageid") === (sel[0] ? sel[0].get("_pageid") : t.get("_pageid")));
        if (cands.length === 1) obsTok = cands[0];
      }
    }
    if (!obsTok && sel.length) obsTok = sel[0];
    const obsChar = obsTok ? getCharFromToken(obsTok) : null;
    if (!obsTok || !obsChar) return ch("MP", `${wt(msg)}<b>MP:</b> Select your token (linked), then <code>!mp scan [--mod N]</code>`);
    if (!canControl(msg, obsChar.id)) return ch("MP", `${wt(msg)}You don't control ${esc(obsChar.get("name"))}.`);
    const obsName = obsChar.get("name");

    // 3.1.5: one free save per turn; additional checks cost an action
    if (!state.MP_Engine.scanUsed) state.MP_Engine.scanUsed = {};
    const round = state.MP_Engine.currentRound;
    const isFree = state.MP_Engine.scanUsed[obsTok.id] !== round;
    state.MP_Engine.scanUsed[obsTok.id] = round;

    // one d20 for the whole sweep; confirm pre-rolled so nat 1/20 is
    // shared, only the per-target TN varies
    const d1 = randomInteger(20);
    const d2 = (d1 === 1 || d1 === 20) ? randomInteger(20) : undefined;

    const disc = hasDiscomfort(obsTok.id) ? -3 : 0;
    const situational = num(args.mod, 0);
    if (!state.MP_Engine.acquired) state.MP_Engine.acquired = {};

    const toks = findObjs({ _type: "graphic", _pageid: obsTok.get("_pageid"), layer: "objects" });
    const contacts = [];
    let anyUnlocated = false, candidates = 0;

    toks.forEach(tok => {
      if (tok.id === obsTok.id) return;
      const tokChar = getCharFromToken(tok);
      if (!tokChar || tokChar.id === obsChar.id) return;
      candidates++;

      const tokName = tok.get("name") || tokChar.get("name") || "Unknown";
      const rangeData = calculateRangeWithProfile(obsTok, tok, obsChar.id, tokChar.id);
      const obs = observationLevel(obsTok.id, tok.id, tokChar.id, obsChar.id, rangeData.inches, rangeData.penalty);
      const bearing = scanBearingLabel(compassBearing(obsTok, tok));
      const locateBtn = btn("Locate", `!mp locate --atk ${obsTok.id} --target ${tok.id}`);
      const atkBtn = btn("Attack", `!mp atk ?{Attack row|1} --atk ${obsTok.id} --target ${tok.id}`);

      if (!obs.needsRoll) {
        contacts.push({
          distance: num(rangeData.inches, 0),
          html:
            `<b>${esc(tokName)}</b> — ${esc(scanDistanceLabel(rangeData.inches, "ID"))}, ${esc(bearing)} ` +
            `· clearly visible ${locateBtn}${atkBtn}`
        });
        return;
      }

      const acqKey = obsTok.id + "|" + tok.id;
      const acqMod = num(obs.oppMod, 0) + num(obs.chkMod, 0) + num(obs.rngMod, 0) + disc + situational;
      const acq = rollAcquisition(obsChar.id, obs.level, [d1, d2], acqMod, obs.sneakGate);

      if (acq.blocked) {
        delete state.MP_Engine.acquired[acqKey];
        return;
      }
      if (acq.tier === "?") {
        anyUnlocated = true;
        delete state.MP_Engine.acquired[acqKey];
        return;
      }

      // -3 or better: located - seed the acquire-once cache so Locate and
      // the following Attack honor this tier until the environment changes.
      state.MP_Engine.acquired[acqKey] = {
        sig: acqSignature(tok, obs, rangeData.inches), tier: acq.tier,
        toHitMod: acq.toHitMod, label: acq.label, round: round
      };

      const tierColor = acq.tier === "-3" ? "#f4d03f" : "#2ecc71";
      contacts.push({
        distance: num(rangeData.inches, 0),
        html:
          `<b>${esc(tokName)}</b> — ${esc(scanDistanceLabel(rangeData.inches, acq.tier))}, ${esc(bearing)} ` +
          `· <b style="color:${tierColor};">[${acq.tier}]</b> ${esc(acq.label)}` +
          `${acq.toHitMod !== 0 ? ` (${acq.toHitMod} to hit)` : ""} ` +
          `<span style="color:#8a84a8; font-size:10px;">by ${esc(obs.label)}, TN ${acq.tn}-</span> ` +
          `${locateBtn}${atkBtn}`
      });
    });

    // Nearest contacts first makes the numbered list easier to use when the
    // player's tabletop is completely dark.
    contacts.sort((a, b) => a.distance - b.distance);

    let out = `<div style="background:#1a1a2e; border:2px solid #3d5a80; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:360px;">`;
    out += `<b style="color:#7fb3d5;">🔎 Scan</b> — <b>${esc(obsName)}</b> · d20: <b>${d1}${d2 != null ? `/${d2}` : ""}</b>`;
    out += isFree
      ? ` <span style="color:#2ecc71; font-size:10px;">FREE CHECK (1/turn, 3.1.5)</span>`
      : ` <span style="color:#f39c12; font-size:10px;">⚠ ADDITIONAL CHECK — costs an Action (3.1.5)</span>`;
    if (situational || disc) {
      const bits = [];
      if (situational) bits.push(`${situational} situational`);
      if (disc) bits.push(`${disc} discomfort`);
      out += `<div style="color:#8a84a8; font-size:10px;">${bits.join(", ")} applied to all TNs</div>`;
    }

    if (!candidates) {
      out += `<div style="margin-top:4px; color:#aaa;">No other character tokens on this page.</div>`;
    } else {
      if (contacts.length) {
        out += `<div style="margin-top:5px;">` +
          contacts.map((contact, index) =>
            `<div style="margin:0 0 5px 0;"><b style="color:#7fb3d5;">${index + 1}.</b> ${contact.html}</div>`
          ).join("") +
          `</div>`;
      }
      if (anyUnlocated) {
        out += `<div style="margin-top:4px; color:#ff6b6b;">❓ You sense someone or something is around — you can't locate, identify, or target it (-3 to defend against it). You may blind-fire into a spot at ${num(state.MP_Engine.blindPenalty, -6)} (GM adjudicates where).</div>`;
      }
      if (!contacts.length && !anyUnlocated) {
        out += `<div style="margin-top:4px; color:#aaa;">You perceive nothing you could target.</div>`;
      }
    }

    out += `<div style="color:#8a84a8; font-size:10px; margin-top:4px;">Locate centers only your view and pings the acquired position. Contacts stay acquired until they move or their concealment, lighting, facing, range, or barriers change (4.6).</div>`;
    out += `</div>`;
    chBoth("MP", out, msg);
  }

  // Report: !mp test senses - dump the selected token's resolved sense map
  // (baseline + sheet rows) and which sense acquisition would fall back to.
  function testSenses(msg, args) {
    const sel = (msg.selected || []).filter(s => s._type === "graphic");
    if (!sel.length) return ch("MP", `/w gm <b>MP:</b> Select 1 token, then run <code>!mp test senses</code>.`);
    const tok = getObj("graphic", sel[0]._id);
    const char = getCharFromToken(tok);
    if (!char) return ch("MP", `/w gm <b>MP:</b> Token must be linked to a character.`);
    const sm = getCharacterSenses(char.id);
    const vinfo = visionLossInfo(tok.id, char.id);
    let out = `<b style="color:#c88fff;">SENSES</b> — ${esc(char.get("name"))}<br/>`;
    Object.keys(sm).forEach(k => {
      const s = sm[k];
      const L = s.removed || s.lvl <= 0 ? "NONE" : (s.lvl >= 3 ? "Analytical" : (s.lvl === 2 ? "Full" : "Basic"));
      const bits = [];
      if (s.rng) bits.push("Rng"); if (s.glob) bits.push("Glob");
      if (s.chk) bits.push(`chk${s.chk > 0 ? "+" : ""}${s.chk}`);
      if (s.tele) bits.push(`tele+${s.tele}`);
      if (s.amp) bits.push(`amp${s.amp}`); if (s.prot) bits.push(`prot${s.prot}`);
      if (s.weak) bits.push(s.weak);
      out += `&nbsp;&nbsp;${esc(s.label || k)}: <b>${L}</b>${bits.length ? ` (${bits.join(", ")})` : ""}<br/>`;
    });
    out += `Vision now: <b>${vinfo.effLabel}</b>${vinfo.causes.length ? ` (${esc(vinfo.causes.join(", "))})` : ""}<br/>`;
    // simulate the vision-blocked fallback pick
    let bestKey = null;
    Object.keys(sm).forEach(k => {
      if (k === "visible") return;
      const s = sm[k];
      if (s.removed || s.lvl <= 0 || (!s.rng && !s.glob)) return;
      if (!bestKey || s.lvl > sm[bestKey].lvl || (s.lvl === sm[bestKey].lvl && num(s.chk, 0) > num(sm[bestKey].chk, 0))) bestKey = k;
    });
    out += `If vision blocked, acquires by: <b>${bestKey ? esc(sm[bestKey].label || bestKey) : "NO USABLE SENSE"}</b>`;
    ch("MP", `/w gm ` + out);
  }

  // -------------------------
  // WEAKNESSES (v2.93.0)
  // -------------------------
  // Static trait tags on ability-row notes: unliving:PCT (self-repair %),
  // nopain (Can't Feel Pain). Read like the sense rows - no new sheet UI.
  function getWeaknessFlags(charId) {
    const flags = { unliving: null, nopain: false };
    if (!charId) return flags;
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    attrs.forEach(a => {
      const n = a.get("name");
      if (!/^repeating_abilities_.+_ability_notes$/.test(n)) return;
      const notes = String(a.get("current") || "").toLowerCase();
      const um = notes.match(/unliving:(\d+)/);
      if (um) flags.unliving = num(um[1], 0);
      if (/\bnopain\b/.test(notes)) flags.nopain = true;
    });
    return flags;
  }

  // Unliving healing gate (RAW): 50% self-repair heals only below half Hits;
  // 0% never self-heals. External care (!mp medical) is always allowed.
  function unlivingHealBlock(charId, tok) {
    const flags = getWeaknessFlags(charId);
    if (flags.unliving === null) return null;
    if (flags.unliving <= 0) {
      return `Unliving (0% self-repair) — cannot heal naturally; must be repaired by others (<code>!mp medical</code>).`;
    }
    if (flags.unliving <= 50) {
      const hits0 = getResource(tok, charId, CFG.HITS_BAR, CFG.HITS_ATTR);
      const hitsMax = getAttrNum(charId, CFG.HITS_MAX_ATTR, 0);
      const half = Math.ceil(hitsMax / 2);
      if (hitsMax > 0 && hits0 >= half) {
        return `Unliving (50% self-repair) — only heals below half Hits (${half}); currently at ${hits0}/${hitsMax}.`;
      }
    }
    return null;
  }

  function hasDiscomfort(tokId) {
    const conds = (state.MP_Engine.conditions && state.MP_Engine.conditions[tokId]) || [];
    return conds.some(c => c.type === "discomfort");
  }

  // !mp willcheck --mod -N [--present] [--phobia] [--stimulus "text"]
  // (selected token or --target). Compulsion/Phobia/Psychosis: CL save vs
  // acting on it; failure = succumbed condition with per-round recovery at
  // the initial difficulty, -4 more while the stimulus is present. Phobia:
  // even a SUCCESSFUL save can't directly confront the object (RAW).
  function cmdWillCheck(msg, args) {
    let tok = args.target ? getObj("graphic", args.target) : null;
    if (!tok && msg.selected && msg.selected.length) {
      const s = msg.selected.find(x => x._type === "graphic");
      if (s) tok = getObj("graphic", s._id);
    }
    const char = tok ? getCharFromToken(tok) : null;
    if (!tok || !char) return ch("MP", `${wt(msg)}<b>MP:</b> Select a linked token. Usage: <code>!mp willcheck --mod -5 [--present] [--phobia] [--stimulus "spiders"]</code>`);
    const name = char.get("name");
    const mod = num(args.mod, 0);
    const present = ("present" in args);
    const isPhobia = ("phobia" in args);
    const stim = args.stimulus || (isPhobia ? "the object of fear" : "the stimulus");
    const clSave = getAttrNum(char.id, "cool_save", 10);
    const tn = clSave + mod;
    const d20 = randomInteger(20);
    const pass = (d20 === 1) || (d20 !== 20 && d20 <= tn);

    let out = `<div style="background:#1a1a2e; border:2px solid ${isPhobia ? "#e67e22" : "#8e44ad"}; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b style="color:${isPhobia ? "#f0a35e" : "#c39bd3"};">${isPhobia ? "😱 Phobia" : "🌀 Will Check"}</b> — <b>${esc(name)}</b> vs ${esc(stim)}<br/>`;
    out += `CL ${clSave}-${mod !== 0 ? ` ${mod} = ${tn}-` : ""} · rolled <b>${d20}</b> — `;
    if (pass) {
      out += `<b style="color:#2ecc71;">holds firm</b>`;
      if (isPhobia) out += `<br/><span style="font-size:11px; color:#f4d03f;">Keeps composure, but still CANNOT directly confront ${esc(stim)} (RAW).</span>`;
      out += `</div>`;
      return chCombat("MP", `${wt(msg)}` + out, char.id);
    }
    // failure: succumbed condition, recovery per round at initial
    // difficulty, -4 more if the stimulus is still present
    if (!state.MP_Engine.conditions[tok.id]) state.MP_Engine.conditions[tok.id] = [];
    const condList = state.MP_Engine.conditions[tok.id];
    const recTN = clSave + mod + (present ? -4 : 0);
    const marker = "screaming";
    const condition = {
      type: "succumbed", sourceAtk: isPhobia ? `Phobia (${stim})` : `Compulsion (${stim})`,
      saveBC: "CL", saveTN: tn, recTN: recTN, recTime: "1 round",
      startRound: state.MP_Engine.currentRound, marker: marker, created: Date.now(),
      permanent: false, senseLevels: 0,
      effectDesc: isPhobia ? `Panicked by ${stim} - must flee / cannot act against it` : `Acting on compulsion: ${stim}`
    };
    let idx = condList.findIndex(c => c.type === "succumbed");
    if (idx >= 0) condList[idx] = condition; else { condList.push(condition); idx = condList.length - 1; }
    tok.set("status_" + marker, true);
    out += `<b style="color:#e94560;">SUCCUMBS</b> — ${esc(condition.effectDesc)}<br/>`;
    out += `<span style="font-size:11px;">Recovery: CL <b>${recTN}-</b> each round${present ? " (-4: stimulus present)" : ""}</span> ${btn(`Recovery`, `!mp recover --target ${tok.id} --idx ${idx}`)}`;
    out += `</div>`;
    chCombat("MP", `${wt(msg)}` + out, char.id);
  }

  // !mp discomfort [--off] (selected tokens or --target). Special
  // Requirement unmet: -3 on ALL saves and rolls to hit (attacks, saves,
  // perception/acquisition) until the requirement is met.
  function cmdDiscomfort(msg, args) {
    const turnOff = ("off" in args);
    const marker = CONDITION_MARKERS.discomfort;
    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    if (!ids.length) return ch("MP", `${wt(msg)}<b>MP:</b> Select token(s) or use --target. Usage: <code>!mp discomfort | --off</code>`);
    const lines = [];
    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      if (!tok) return;
      const tokChar = getCharFromToken(tok);
      const tokName = tokChar ? tokChar.get("name") : (tok.get("name") || "token");
      if (!state.MP_Engine.conditions[tokId]) state.MP_Engine.conditions[tokId] = [];
      const conds = state.MP_Engine.conditions[tokId];
      const idx = conds.findIndex(c => c.type === "discomfort");
      if (turnOff) {
        if (idx >= 0) {
          conds.splice(idx, 1);
          if (!conds.some(c => c.marker === marker)) tok.set("status_" + marker, false);
          lines.push(`<b>${esc(tokName)}</b> — requirement met, discomfort ends.`);
        } else lines.push(`<b>${esc(tokName)}</b> — wasn't in discomfort.`);
        return;
      }
      const condition = {
        type: "discomfort", sourceAtk: "Special Requirement unmet", marker: marker,
        permanent: false, environmental: true,
        effectDesc: "Discomfort: -3 on all saves and rolls to hit until the requirement is met",
        startRound: state.MP_Engine.currentRound, created: Date.now()
      };
      if (idx >= 0) conds[idx] = condition; else conds.push(condition);
      tok.set("status_" + marker, true);
      lines.push(`<b>${esc(tokName)}</b> — DISCOMFORT (-3 attacks, saves, perception).`);
    });
    let out = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b>🥀 Special Requirement</b>`;
    lines.forEach(l => out += `<br/>` + l);
    out += `</div>`;
    ch("MP", `${wt(msg)}` + out);
  }

  // Requirement clock (Special Requirement frequency, game-clock enforced).
  // !mp require --interval 7d --consequence discomfort [--name "Life Leech"]
  //   (select the character's token once to register)
  // !mp require --met | --off | list
  function parseIntervalSec(s) {
    const m = /^(\d+(?:\.\d+)?)([hdw])$/.exec(String(s || "").trim());
    if (!m) return null;
    const n = parseFloat(m[1]);
    return Math.round(n * ({ h: 3600, d: 86400, w: 604800 })[m[2]]);
  }

  function cmdRequire(msg, args) {
    if (!state.MP_Engine.requirements) state.MP_Engine.requirements = {};
    const reqs = state.MP_Engine.requirements;
    const sub = (msg.content.split(/\s+/)[2] || "").toLowerCase();
    if (sub === "list") {
      const keys = Object.keys(reqs);
      if (!keys.length) return ch("MP", `/w gm <b>MP:</b> No requirements registered.`);
      let out = `<b>Special Requirements</b>`;
      keys.forEach(cid => {
        const r = reqs[cid];
        const dueIn = (r.lastMetMs + r.intervalSec * 1000) - state.MP_Engine.gameClock.ms;
        out += `<br/><b>${esc(r.charName)}</b>: ${esc(r.name)} every ${esc(r.intervalLabel)} — ${dueIn >= 0 ? `due in ${Math.ceil(dueIn / 86400000)}d` : `<span style="color:#ff6b6b;">OVERDUE ${Math.ceil(-dueIn / 86400000)}d</span>`}`;
      });
      return ch("MP", `/w gm ` + out);
    }
    // resolve character
    let char = null, tok = null;
    if (args.charid) char = getObj("character", args.charid);
    if (!char && msg.selected && msg.selected.length) {
      const s = msg.selected.find(x => x._type === "graphic");
      tok = s ? getObj("graphic", s._id) : null;
      char = tok ? getCharFromToken(tok) : null;
    }
    if (!char) return ch("MP", `/w gm <b>MP:</b> Select the character's token (or --charid). Usage: <code>!mp require --interval 7d --consequence discomfort --name "Life Leech"</code> | <code>--met</code> | <code>--off</code> | <code>list</code>`);

    if ("off" in args) {
      delete reqs[char.id];
      return ch("MP", `/w gm <b>MP:</b> Requirement cleared for <b>${esc(char.get("name"))}</b>.`);
    }
    if ("met" in args) {
      const r = reqs[char.id];
      if (!r) return ch("MP", `/w gm <b>MP:</b> No requirement registered for <b>${esc(char.get("name"))}</b>.`);
      r.lastMetMs = state.MP_Engine.gameClock.ms;
      r.nagged = false;
      return ch("MP", `/w gm <b>MP:</b> ✔ <b>${esc(char.get("name"))}</b> — ${esc(r.name)} met at ${fmtGameClock()}. ${hasDiscomfort(r.tokId) ? btn(`Clear Discomfort`, `!mp discomfort --off --target ${r.tokId}`) : ""}`);
    }
    const intervalSec = parseIntervalSec(args.interval);
    if (!intervalSec) return ch("MP", `/w gm <b>MP:</b> --interval must be like 12h, 3d, 1w.`);
    reqs[char.id] = {
      charName: char.get("name"),
      tokId: tok ? tok.id : (args.target || null),
      name: args.name || "Special Requirement",
      intervalSec, intervalLabel: args.interval,
      consequence: (args.consequence || "discomfort").toLowerCase(),
      lastMetMs: state.MP_Engine.gameClock.ms,
      nagged: false
    };
    return ch("MP", `/w gm <b>MP:</b> Registered: <b>${esc(char.get("name"))}</b> needs <b>${esc(reqs[char.id].name)}</b> every ${esc(args.interval)} (consequence: ${esc(reqs[char.id].consequence)}). Clock starts now (${fmtGameClock()}).`);
  }

  // Called after game-clock advances: nag once per starvation period.
  function checkRequirementsDue() {
    const reqs = state.MP_Engine.requirements || {};
    Object.keys(reqs).forEach(cid => {
      const r = reqs[cid];
      const overdueMs = state.MP_Engine.gameClock.ms - (r.lastMetMs + r.intervalSec * 1000);
      if (overdueMs <= 0 || r.nagged) return;
      r.nagged = true;
      const days = Math.max(1, Math.ceil(overdueMs / 86400000));
      let card = `<div style="background:#1a1a2e; border:2px solid #b03a2e; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      card += `<b style="color:#f1948a;">⏳ ${esc(r.charName)}</b> — <b>${esc(r.name)}</b> is ~${days} day(s) overdue.<br/>`;
      if (r.consequence === "discomfort" && r.tokId) card += `${btn(`Apply Discomfort`, `!mp discomfort --target ${r.tokId}`)} `;
      else card += `<span style="font-size:11px; color:#aab;">Consequence: ${esc(r.consequence)} (GM applies). </span>`;
      card += `${btn(`Met — reset clock`, `!mp require --met --charid ${cid}`)}`;
      card += `</div>`;
      ch("MP", `/w gm ` + card);
    });
  }

  // Round-advance upkeep: PR 1/round per invisible token; drops at 0 Power.
  function tickInvisibility(n) {
    let frag = "";
    const condMap = state.MP_Engine.conditions || {};
    Object.keys(condMap).forEach(tokId => {
      const conds = condMap[tokId];
      const idx = (conds || []).findIndex(c => c.type === "invisible");
      if (idx < 0) return;
      const tok = getObj("graphic", tokId);
      if (!tok) { conds.splice(idx, 1); return; } // token gone - clean up
      const char = getCharFromToken(tok);
      const name = char ? char.get("name") : (tok.get("name") || "token");
      const pow0 = getResource(tok, char ? char.id : null, CFG.POWER_BAR, CFG.POWER_ATTR);
      const cost = Math.min(n, pow0);
      const pow1 = Math.max(0, pow0 - n);
      setResource(tok, char ? char.id : null, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
      if (pow1 <= 0) {
        conds.splice(idx, 1);
        if (!conds.some(c => c.marker === CONDITION_MARKERS.invisible)) tok.set("status_" + CONDITION_MARKERS.invisible, false);
        frag += `<br/><span style="color:#ff6b6b;">🫥 <b>${esc(name)}</b> can't pay PR (Power ${pow0}→${pow1}) — <b>invisibility DROPS</b></span>`;
      } else {
        frag += `<br/><span style="color:#8a84a8; font-size:11px;">🫥 ${esc(name)} invisible: -${cost} Power (${pow0}→${pow1})</span>`;
      }
    });
    return frag;
  }

  // Shared handler for !mp darkness / !mp glare (GM).
  // Usage: !mp darkness --ranks N --on   (selected tokens or --target ID)
  //        !mp darkness --off
  function cmdSenseField(msg, args, kind) {
    const marker = CONDITION_MARKERS[kind];
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);

    // v2.90.1: --circle N draws a persistent dashed field ring of diameter
    // N inches centered on the selected token (or --target); --circle off
    // removes all rings of this kind. Visual only - no membership tracking;
    // toggle victims with --on/--off as they enter/leave. A generic point
    // token works as the center.
    if (args.circle !== undefined) {
      if (!state.MP_Engine.senseRings) state.MP_Engine.senseRings = { darkness: [], glare: [] };
      if (!state.MP_Engine.senseRings[kind]) state.MP_Engine.senseRings[kind] = [];
      const rings = state.MP_Engine.senseRings[kind];

      if (String(args.circle).toLowerCase() === "off") {
        let removed = 0;
        rings.forEach(rec => { const p = getObj("path", rec.markerId); if (p) { p.remove(); removed++; } });
        state.MP_Engine.senseRings[kind] = [];
        return ch("MP", `/w gm <b>${label} Field:</b> removed ${removed} ring(s).`);
      }

      const diameter = num(args.circle, 0);
      if (diameter <= 0) return ch("MP", `/w gm <b>MP:</b> Usage: <code>!mp ${kind} --circle DIAMETER</code> (inches) or <code>--circle off</code>.`);
      let centerTok = args.target ? getObj("graphic", args.target) : null;
      if (!centerTok && msg.selected && msg.selected.length) {
        const s = msg.selected.find(x => x._type === "graphic");
        if (s) centerTok = getObj("graphic", s._id);
      }
      if (!centerTok) return ch("MP", `/w gm <b>MP:</b> Select a token (or --target) as the field center.`);

      const pageId = centerTok.get("_pageid");
      const page = getObj("page", pageId);
      const ppi = 70 * ((page && page.get("snapping_increment")) || 1);
      const ringColor = (kind === "darkness") ? "#111111" : "#f4d03f";
      const markerId = drawAreaMarker(pageId, centerTok.get("left"), centerTok.get("top"), diameter / 2, ppi, ringColor, 4);
      if (!markerId) return ch("MP", `/w gm <b>MP:</b> Could not draw ring (AREA_MARKER disabled?).`);
      rings.push({ markerId, pageId, created: Date.now() });
      return ch("MP", `/w gm <b>${label} Field:</b> ${diameter}" ring drawn at <b>${esc(centerTok.get("name") || "point")}</b>. Toggle affected tokens with <code>!mp ${kind} --ranks N --on/--off</code>. <code>!mp ${kind} --circle off</code> removes ring(s).`);
    }

    const ranks = Math.max(1, Math.min(3, num(args.ranks, 2)));
    const turnOff = ("off" in args); // bare --off parses as args.off = "1"
    const turnOn = !turnOff;         // default is ON (--on optional)

    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) {
      msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    }
    if (!ids.length) {
      return ch("MP", `/w gm <b>MP:</b> Select token(s) or use --target. Usage: <code>!mp ${kind} --ranks 1-3 --on|--off</code>`);
    }

    const applied = [], removed = [];

    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      if (!tok) return;
      const tokChar = getCharFromToken(tok);
      const tokName = tokChar ? tokChar.get("name") : (tok.get("name") || "token");

      if (!state.MP_Engine.conditions[tokId]) state.MP_Engine.conditions[tokId] = [];
      const conds = state.MP_Engine.conditions[tokId];
      const idx = conds.findIndex(c => c.type === kind);

      if (turnOn) {
        const condition = {
          type: kind,
          sourceAtk: `${label} field`,
          senseLevels: ranks,
          marker: marker,
          permanent: false,
          environmental: true, // no recovery roll; cleared by --off
          effectDesc: getConditionDesc(kind, label),
          startRound: state.MP_Engine.currentRound,
          created: Date.now()
        };
        if (idx >= 0) conds[idx] = condition; // refresh in place, no stacking
        else conds.push(condition);
        tok.set("status_" + marker, true);
        const info = visionLossInfo(tokId, tokChar ? tokChar.id : null);
        applied.push(`<b>${esc(tokName)}</b> — ${label} ${ranks} (vision now <b>${info.effLabel}</b>)`);
      } else {
        if (idx >= 0) {
          conds.splice(idx, 1);
          const markerStillUsed = conds.some(c => c.marker === marker);
          if (!markerStillUsed) tok.set("status_" + marker, false);
          const info = visionLossInfo(tokId, tokChar ? tokChar.id : null);
          removed.push(`<b>${esc(tokName)}</b> — ${label} cleared (vision now <b>${info.effLabel}</b>)`);
        } else {
          removed.push(`<b>${esc(tokName)}</b> — no ${label} to clear`);
        }
      }
    });

    let out = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b>${kind === "darkness" ? "🌑" : "☀️"} ${label} Field</b>`;
    applied.forEach(l => out += `<br/>${l}`);
    removed.forEach(l => out += `<br/>${l}`);
    if (turnOn) {
      out += `<br/><span style="font-size:11px; color:#8a84a8;">GM: pay caster PR per round manually (PR = senses affected); toggle tokens as they enter/leave. Darkness &amp; Glare ranks cancel.</span>`;
    }
    out += `</div>`;
    ch("MP", `/w gm ` + out);
  }

  // v2.90.2: GLOW (Light Control D) - illuminate an area around the caster.
  // Sets the token's aura1 to the field radius. PR 1 to activate, 1/hour
  // to maintain (GM-managed). !mp glow --diameter N [--off] [--target ID]
  function cmdGlow(msg, args) {
    let tok = args.target ? getObj("graphic", args.target) : null;
    if (!tok && msg.selected && msg.selected.length) {
      const s = msg.selected.find(x => x._type === "graphic");
      if (s) tok = getObj("graphic", s._id);
    }
    if (!tok) return ch("MP", `${wt(msg)}<b>MP:</b> Select a token (or --target). Usage: <code>!mp glow --diameter N | --off</code>`);
    const char = getCharFromToken(tok);
    const name = char ? char.get("name") : (tok.get("name") || "token");

    if ("off" in args) {
      tok.set("aura1_radius", "");
      return ch("MP", `${wt(msg)}<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b>☀️ Glow</b> — <b>${esc(name)}</b> light out.</div>`);
    }
    const diameter = num(args.diameter, 0);
    if (diameter <= 0) return ch("MP", `${wt(msg)}<b>MP:</b> Usage: <code>!mp glow --diameter N</code> (inches, from the Glow CP table) or <code>--off</code>.`);
    tok.set("aura1_radius", diameter / 2);
    tok.set("aura1_color", "#f7e463");
    tok.set("showplayers_aura1", true);
    return ch("MP", `${wt(msg)}<div style="background:#1a1a2e; border:2px solid #f7e463; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b style="color:#f7e463;">☀️ Glow</b> — <b>${esc(name)}</b> lights a <b>${diameter}"</b> area.<br/><span style="font-size:11px; color:#8a84a8;">PR 1 to activate, 1/hour to maintain (GM).</span><br/>${btn(`Glow Off`, `!mp glow --off --target ${tok.id}`)}</div>`);
  }

  // v2.90.2: GM control card for a Darkness/Glare/Glow field, posted by the
  // abilities-panel "Field Card" button. Buttons wrap the existing commands
  // and act on whatever tokens the GM has selected at click time.
  function cmdFieldCard(msg, args) {
    const kind = String(args.kind || "").toLowerCase();
    if (kind !== "darkness" && kind !== "glare" && kind !== "glow") {
      return ch("MP", `/w gm <b>MP:</b> Set the ability's Field type (Darkness/Glare/Glow) first.`);
    }
    const ranks = Math.max(1, Math.min(3, num(args.ranks, 2)));
    const senses = Math.max(1, num(args.senses, 1));
    const diameter = num(args.diameter, 0);
    const abilityName = args.name || (kind.charAt(0).toUpperCase() + kind.slice(1));
    const label = kind.charAt(0).toUpperCase() + kind.slice(1);
    const icon = kind === "darkness" ? "🌑" : "☀️";

    let html = `<div style="background:#1a1a2e; border:2px solid #5a4fcf; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px; overflow:hidden;">`;
    html += `<div style="background:#5a4fcf; padding:6px 10px; font-weight:bold; color:#fff;">${icon} ${esc(abilityName)} — ${label}</div>`;
    html += `<div style="padding:6px 10px;">`;
    if (kind === "glow") {
      html += `Diameter: <b>${diameter || "?"}"</b> &middot; <span style="color:#aab; font-size:11px;">PR 1 + 1/hour</span><br/>`;
      html += `<div style="margin-top:6px;">${btn(`Glow On (select caster)`, `!mp glow --diameter ${diameter}`)} ${btnDanger(`Glow Off`, `!mp glow --off`)}</div>`;
    } else {
      html += `Ranks: <b>${ranks}</b> &middot; Diameter: <b>${diameter || "?"}"</b> &middot; PR: <b>${senses}/round</b> (${senses} sense${senses === 1 ? "" : "s"})<br/>`;
      html += `<div style="margin-top:6px;">${btn(`Apply to selected`, `!mp ${kind} --ranks ${ranks}`)} ${btnDanger(`Remove from selected`, `!mp ${kind} --off`)}</div>`;
      if (diameter > 0) {
        html += `<div style="margin-top:4px;">${btn(`Draw ${diameter}" ring (select center)`, `!mp ${kind} --circle ${diameter}`)} ${btnDanger(`Remove rings`, `!mp ${kind} --circle off`)}</div>`;
      }
      html += `<div style="margin-top:4px; font-size:10px; color:#aab;">Caster is immune to their own field. Darkness &amp; Glare ranks cancel. Toggle tokens as they enter/leave.</div>`;
    }
    html += `</div></div>`;
    ch("MP", `/w gm ` + html);
  }

  // v2.91.4: !mp sensepanel - one persistent GM card with the whole senses
  // subsystem as buttons. Every button acts on whatever tokens are selected
  // at click time. Rank buttons are one-click; diameters prompt once.
  function cmdSensePanel(msg, args) {
    const row = (label, buttons) =>
      `<div style="margin-top:5px; padding-top:5px; border-top:1px solid #2a2a4a;"><span style="color:#8a84a8; font-size:10px;">${label}</span><br/>${buttons}</div>`;

    let html = `<div style="background:#1a1a2e; border:2px solid #5a4fcf; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px; overflow:hidden;">`;
    html += `<div style="background:#5a4fcf; padding:6px 10px; font-weight:bold; color:#fff;">🎛 Senses Panel</div>`;
    html += `<div style="padding:4px 10px 8px 10px;">`;
    html += `<span style="color:#8a84a8; font-size:10px;">All buttons act on the tokens selected when clicked.</span>`;

    html += row(`🌑 DARKNESS (ranks)`,
      `${btn(`1`, `!mp darkness --ranks 1`)} ${btn(`2`, `!mp darkness --ranks 2`)} ${btn(`3`, `!mp darkness --ranks 3`)} ${btnDanger(`Off`, `!mp darkness --off`)}<br/>` +
      `${btn(`Ring`, `!mp darkness --circle ?{Diameter in inches|9}`)} ${btnDanger(`Clear Rings`, `!mp darkness --circle off`)}`);

    html += row(`☀️ GLARE (ranks)`,
      `${btn(`1`, `!mp glare --ranks 1`)} ${btn(`2`, `!mp glare --ranks 2`)} ${btn(`3`, `!mp glare --ranks 3`)} ${btnDanger(`Off`, `!mp glare --off`)}<br/>` +
      `${btn(`Ring`, `!mp glare --circle ?{Diameter in inches|15}`)} ${btnDanger(`Clear Rings`, `!mp glare --circle off`)}`);

    html += row(`🫥 CONCEALMENT`,
      `${btn(`Invis`, `!mp invis`)} ${btn(`Invis+Sneak`, `!mp invis --sneaking`)} ${btn(`Blur`, `!mp invis --blur`)} ${btnDanger(`Invis Off`, `!mp invis --off`)}<br/>` +
      `${btn(`Sneak`, `!mp sneak`)} ${btnDanger(`Sneak Off`, `!mp sneak --off`)}`);

    html += row(`💡 LIGHT`,
      `${btn(`Glow`, `!mp glow --diameter ?{Diameter in inches|15}`)} ${btnDanger(`Glow Off`, `!mp glow --off`)}`);

    html += row(`🔎 INFO`,
      `${btn(`Status`, `!mp status`)} ${btn(`Refresh Panel`, `!mp sensepanel`)}`);

    html += `</div></div>`;
    ch("MP", `/w gm ` + html);
  }

  // Self-test: !mp test senseloss (GM, 1 selected token). Non-destructive:
  // snapshots the token's condition list and restores it afterward.
  function testSenseLoss(msg, args) {
    const sel = (msg.selected || []).filter(s => s._type === "graphic");
    if (!sel.length) return ch("MP", `/w gm <b>MP:</b> Select 1 token, then run <code>!mp test senseloss</code>.`);
    const tokId = sel[0]._id;
    const tok = getObj("graphic", tokId);
    if (!tok) return ch("MP", `/w gm <b>MP:</b> Token missing.`);

    const snapshot = JSON.parse(JSON.stringify(state.MP_Engine.conditions[tokId] || []));
    const results = [];
    const check = (name, cond) => results.push(`${cond ? "✅" : "❌"} ${name}`);

    // Fresh slate for the test
    state.MP_Engine.conditions[tokId] = [];

    // 1. Baseline: full vision, no penalty
    let info = visionLossInfo(tokId);
    check(`baseline Full, no penalty (eff=${info.effective}, pen=${visionAtkPenalty(info)})`,
      info.effective === 2 && visionAtkPenalty(info) === 0);

    // 2. Darkness 1 => Basic, -3
    state.MP_Engine.conditions[tokId].push({ type: "darkness", senseLevels: 1, marker: "ninja-mask", environmental: true });
    info = visionLossInfo(tokId);
    check(`darkness 1 => Basic, -3 (eff=${info.effective}, pen=${visionAtkPenalty(info)})`,
      info.effective === 1 && visionAtkPenalty(info) === -3);

    // 3. Darkness 2 (refresh to 2) => blind, blind penalty
    state.MP_Engine.conditions[tokId][0].senseLevels = 2;
    info = visionLossInfo(tokId);
    const blindPen = num(state.MP_Engine.blindPenalty, -6);
    check(`darkness 2 => BLIND, ${blindPen} (eff=${info.effective}, pen=${visionAtkPenalty(info)})`,
      info.effective === 0 && visionAtkPenalty(info) === blindPen);

    // 4. Glare 2 cancels Darkness 2 => Full
    state.MP_Engine.conditions[tokId].push({ type: "glare", senseLevels: 2, marker: "aura", environmental: true });
    info = visionLossInfo(tokId);
    check(`glare 2 cancels darkness 2 => Full (eff=${info.effective})`, info.effective === 2);

    // 5. Dazzle 2 on top => blind (dazzle unaffected by cancel)
    state.MP_Engine.conditions[tokId].push({ type: "dazzled", senseLevels: 2, marker: "bleeding-eye" });
    info = visionLossInfo(tokId);
    check(`dazzle 2 stacks => BLIND (eff=${info.effective}, lost=${info.lost})`, info.effective === 0 && info.dazzle === 2);

    // 6. Legacy dazzled condition (no senseLevels) counts as 2
    state.MP_Engine.conditions[tokId] = [{ type: "dazzled", marker: "bleeding-eye" }];
    info = visionLossInfo(tokId);
    check(`legacy dazzled (no senseLevels) => 2 lost (lost=${info.lost})`, info.lost === 2);

    // 7. Clear all => Full again
    state.MP_Engine.conditions[tokId] = [];
    info = visionLossInfo(tokId);
    check(`cleared => Full (eff=${info.effective})`, info.effective === 2);

    // Restore snapshot
    state.MP_Engine.conditions[tokId] = snapshot;

    const passCount = results.filter(r => r.startsWith("✅")).length;
    ch("MP", `/w gm <b style="color:#c88fff;">TEST SENSELOSS</b> — ${passCount}/${results.length} passed<br/>` + results.join("<br/>"));
  }

  // Self-test: !mp test flash [LEVELS] (GM, 1 selected token). Exercises
  // resolveAreaSenseLoss with forced rolls: guaranteed pass, guaranteed
  // fail, and fumble (permanent). Non-destructive (snapshot/restore).
  function testFlash(msg, args) {
    const sel = (msg.selected || []).filter(s => s._type === "graphic");
    if (!sel.length) return ch("MP", `/w gm <b>MP:</b> Select 1 token, then run <code>!mp test flash [LEVELS]</code>.`);
    const tokId = sel[0]._id;
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Token missing or unlinked.`);

    const parts = msg.content.split(/\s+/);
    const levels = Math.max(1, Math.min(3, num(parts[3], 2)));

    const snapshot = JSON.parse(JSON.stringify(state.MP_Engine.conditions[tokId] || []));
    const markerBefore = tok.get("status_" + CONDITION_MARKERS.dazzled);
    const results = [];
    const check = (name, cond) => results.push(`${cond ? "✅" : "❌"} ${name}`);

    const fakeArea = {
      atkName: "Test Flash",
      atkCharIdForCond: char.id,
      saveBC: "EN",
      saveMod: 0,
      recMod: -12,
      recTime: "1 round",
      senseLoss: levels,
      isSaveAttack: true,
      tokens: {}
    };
    fakeArea.tokens[tokId] = { charId: char.id, name: char.get("name"), escaped: false };

    const baseSave = getAttrNum(char.id, "endurance_save", 10);

    // 1. Forced pass (roll 1): no condition
    state.MP_Engine.conditions[tokId] = [];
    resolveAreaSenseLoss(fakeArea, tokId, 1);
    check(`forced pass (roll 1 vs ${baseSave}-) => no condition`, (state.MP_Engine.conditions[tokId] || []).length === 0);

    // 2. Forced fail (roll 19 w/ -30 mod): dazzled condition with senseLevels
    state.MP_Engine.conditions[tokId] = [];
    fakeArea.saveMod = -30;
    resolveAreaSenseLoss(fakeArea, tokId, 19);
    let conds = state.MP_Engine.conditions[tokId] || [];
    let c0 = conds.find(c => c.type === "dazzled");
    check(`forced fail => dazzled, senseLevels ${levels}`, !!c0 && c0.senseLevels === levels && !c0.permanent);
    check(`recTN = base ${baseSave} - 30 - 12 = ${baseSave - 42}`, !!c0 && c0.recTN === baseSave - 42);
    let vis = visionLossInfo(tokId);
    check(`vision reflects loss (eff=${vis.effective})`, vis.effective === Math.max(0, 2 - levels));

    // 3. Refresh in place: second fail doesn't stack a duplicate
    resolveAreaSenseLoss(fakeArea, tokId, 19);
    conds = state.MP_Engine.conditions[tokId] || [];
    check(`re-apply refreshes, no duplicate (count=${conds.filter(c => c.type === "dazzled").length})`,
      conds.filter(c => c.type === "dazzled").length === 1);

    // 4. Fumble (roll 20): permanent
    state.MP_Engine.conditions[tokId] = [];
    fakeArea.saveMod = 0;
    resolveAreaSenseLoss(fakeArea, tokId, 20);
    conds = state.MP_Engine.conditions[tokId] || [];
    c0 = conds.find(c => c.type === "dazzled");
    check(`fumble (roll 20) => PERMANENT`, !!c0 && c0.permanent === true);

    // Restore
    state.MP_Engine.conditions[tokId] = snapshot;
    tok.set("status_" + CONDITION_MARKERS.dazzled, markerBefore === true);

    const passCount = results.filter(r => r.startsWith("✅")).length;
    ch("MP", `/w gm <b style="color:#c88fff;">TEST FLASH</b> (${levels} level(s)) — ${passCount}/${results.length} passed<br/>` + results.join("<br/>"));
  }

  // Self-test: !mp test acquire (GM, 1 selected token). Exercises the 4.6
  // acquisition table with forced rolls (deterministic: nat 1/20 + forced
  // confirms). Assumes the token's IN save is between 2 and 19.
  function testAcquire(msg, args) {
    const sel = (msg.selected || []).filter(s => s._type === "graphic");
    if (!sel.length) return ch("MP", `/w gm <b>MP:</b> Select 1 token, then run <code>!mp test acquire</code>.`);
    const tok = getObj("graphic", sel[0]._id);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Token missing or unlinked.`);
    const inSave = getAttrNum(char.id, "intelligence_save", 10);
    if (inSave < 2 || inSave > 19) {
      return ch("MP", `/w gm <b>MP:</b> Test needs an IN save between 2 and 19 (token has ${inSave}).`);
    }

    const blindPen = num(state.MP_Engine.blindPenalty, -6);
    const results = [];
    const check = (name, cond) => results.push(`${cond ? "✅" : "❌"} ${name}`);
    const acq = (lvl, r) => rollAcquisition(char.id, lvl, r);

    let a = acq(1, [20, 20]); check(`Basic crit-fumble => "-" blocked`, a.tier === "-" && a.blocked);
    a = acq(1, [20, 1]);  check(`Basic fail => "?" at ${blindPen}`, a.tier === "?" && a.toHitMod === blindPen && !a.blocked);
    a = acq(1, [1, 20]);  check(`Basic success => "-3"`, a.tier === "-3" && a.toHitMod === -3);
    a = acq(1, [1, 1]);   check(`Basic crit-success => ID`, a.tier === "ID" && a.toHitMod === 0);
    a = acq(0, [1, 20]);  check(`None success => "-" blocked`, a.tier === "-" && a.blocked);
    a = acq(0, [1, 1]);   check(`None crit-success => "?"`, a.tier === "?" && !a.blocked);
    a = acq(2, [20, 1]);  check(`Full fail => still ID`, a.tier === "ID" && a.toHitMod === 0);
    a = acq(2, [20, 20]); check(`Full crit-fumble => "-3"`, a.tier === "-3" && a.toHitMod === -3);
    a = acq(3, [20, 20]); check(`Analytical crit-fumble => ID`, a.tier === "ID");

    const passCount = results.filter(r => r.startsWith("✅")).length;
    ch("MP", `/w gm <b style="color:#c88fff;">TEST ACQUIRE</b> (IN ${inSave}-) — ${passCount}/${results.length} passed<br/>` + results.join("<br/>"));
  }

  // Self-test: !mp test invis (GM, select 2 tokens: observer first, target
  // second). Exercises observationLevel + opposed acquisition with stubbed
  // conditions. Non-destructive (snapshots/restores both tokens).
  function testInvis(msg, args) {
    const sel = (msg.selected || []).filter(s => s._type === "graphic");
    if (sel.length < 2) return ch("MP", `/w gm <b>MP:</b> Select <b>2</b> tokens (observer, target), then run <code>!mp test invis</code>.`);
    const obsTokId = sel[0]._id, tgtTokId = sel[1]._id;
    const tgtTok = getObj("graphic", tgtTokId);
    const tgtChar = getCharFromToken(tgtTok);
    if (!tgtChar) return ch("MP", `/w gm <b>MP:</b> Target token must be linked to a character (needs an AG save).`);
    const agSave = getAttrNum(tgtChar.id, "agility_save", 10);

    const snapObs = JSON.parse(JSON.stringify(state.MP_Engine.conditions[obsTokId] || []));
    const snapTgt = JSON.parse(JSON.stringify(state.MP_Engine.conditions[tgtTokId] || []));
    const results = [];
    const check = (name, cond) => results.push(`${cond ? "✅" : "❌"} ${name}`);

    // 1. baseline: no roll needed
    state.MP_Engine.conditions[obsTokId] = [];
    state.MP_Engine.conditions[tgtTokId] = [];
    let o = observationLevel(obsTokId, tgtTokId, tgtChar.id);
    check(`baseline: no roll, vision Full`, !o.needsRoll && o.level === 2);

    // 2. target invisible: roll needed, fallback hearing Basic, no opposition
    state.MP_Engine.conditions[tgtTokId] = [{ type: "invisible", blur: false, sneaking: false }];
    o = observationLevel(obsTokId, tgtTokId, tgtChar.id);
    check(`invisible target => hearing Basic, no opp (lvl=${o.level}, opp=${o.oppMod})`, o.needsRoll && o.level === 1 && o.oppMod === 0 && o.label.indexOf("hearing") === 0);

    // 3. invisible + sneaking: opposition -(AG-10)
    state.MP_Engine.conditions[tgtTokId] = [{ type: "invisible", blur: false, sneaking: true }];
    o = observationLevel(obsTokId, tgtTokId, tgtChar.id);
    check(`sneaking opposes at ${-Math.max(0, agSave - 10)} (AG ${agSave})`, o.oppMod === -Math.max(0, agSave - 10));

    // 4. blur vs Full observer: vision Basic
    state.MP_Engine.conditions[tgtTokId] = [{ type: "invisible", blur: true, sneaking: false }];
    o = observationLevel(obsTokId, tgtTokId, tgtChar.id);
    check(`blur vs Full => vision Basic (lvl=${o.level})`, o.needsRoll && o.level === 1 && o.label.indexOf("vision") === 0);

    // 5. blur + observer darkness 1: vision gone => hearing fallback
    state.MP_Engine.conditions[obsTokId] = [{ type: "darkness", senseLevels: 1 }];
    o = observationLevel(obsTokId, tgtTokId, tgtChar.id);
    check(`blur + darkness 1 => hearing fallback`, o.level === 1 && o.label.indexOf("hearing") === 0);

    // 6. opposed acquisition math: forced mid-roll vs modified TN
    state.MP_Engine.conditions[obsTokId] = [];
    const obsChar = getCharFromToken(getObj("graphic", obsTokId));
    if (obsChar) {
      const inSave = getAttrNum(obsChar.id, "intelligence_save", 10);
      const a = rollAcquisition(obsChar.id, 1, [inSave], -Math.max(0, agSave - 10));
      const expectFail = inSave > inSave - Math.max(0, agSave - 10);
      check(`opposed TN = ${inSave}${-Math.max(0, agSave - 10)} => roll ${inSave} ${expectFail && agSave > 10 ? "fails" : "passes"}`,
        agSave > 10 ? (a.outcome === "fail") : (a.outcome === "succeed"));
    }

    state.MP_Engine.conditions[obsTokId] = snapObs;
    state.MP_Engine.conditions[tgtTokId] = snapTgt;
    const passCount = results.filter(r => r.startsWith("✅")).length;
    ch("MP", `/w gm <b style="color:#c88fff;">TEST INVIS</b> — ${passCount}/${results.length} passed<br/>` + results.join("<br/>"));
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
        expiresMs: (ticks === 0 && rec.durNum > 0 && rec.durUnit && rec.durUnit !== "perm" && TIME_UNITS[rec.durUnit + (rec.durNum === 1 ? "" : "s")] !== undefined)
          ? state.MP_Engine.gameClock.ms + rec.durNum * (TIME_UNITS[rec.durUnit + (rec.durNum === 1 ? "" : "s")] || 60) * 1000
          : ((ticks === 0 && rec.durNum > 0 && rec.durUnit === "month") ? state.MP_Engine.gameClock.ms + rec.durNum * 2592000000
          : ((ticks === 0 && rec.durNum > 0 && rec.durUnit === "year") ? state.MP_Engine.gameClock.ms + rec.durNum * 31536000000 : null)),
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
        const auto = conds[conds.length - 1].expiresMs;
        snippet += `<br/><span style="font-size:11px;">Effect persists for ${esc(unitLabel)}${auto ? " (auto-expires on the game clock)" : " (track manually)"}</span>`;
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
    const gc = state.MP_Engine.gameClock;
    state.MP_Engine.undo[undoId] = {
      label: label || "action",
      ts: Date.now(),
      tokenSnaps: (tokenSnaps || []).filter(Boolean),
      extra: extra || null,
      // Clock snapshot: reversing an attack also reverses its time effects
      // (bleed registrations, tracker round advances, clock movement).
      clock: { ms: gc.ms, currentRound: state.MP_Engine.currentRound, roundAnchor: gc.roundAnchor, topId: gc.topId, leftAnchor: gc.leftAnchor },
      bleedKeys: Object.keys(state.MP_Engine.bleeds || {})
    };
    pruneUndo();
  }

  // Styled API command buttons (replaces Roll20's default pink [label](!cmd) chrome)
  // Neutral steel blue for ordinary actions; card red for consequential ones (Apply Damage)
  const BTN_STYLE = "color:#fff; border:1px solid #2a2a4a; border-radius:3px; padding:1px 8px; font-size:12px; font-weight:bold; text-decoration:none; display:inline-block; margin:2px 2px 0 0;";
  function btn(label, cmd) {
    return `<a href="${cmd}" style="background:#3d5a80; ${BTN_STYLE}">${label}</a>`;
  }
  function btnDanger(label, cmd) {
    return `<a href="${cmd}" style="background:#c0392b; ${BTN_STYLE}">${label}</a>`;
  }

  function undoButton(undoId) {
    return `<br/><span style="font-size:11px;">${btn(`↩ Undo`, `!mp undo --id ${undoId}`)}</span>`;
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

    // Reverse time effects: restore the clock/round and drop any bleed that
    // this action newly registered (a bleed present now but not at snapshot).
    if (rec.clock) {
      const gc = state.MP_Engine.gameClock;
      gc.ms = rec.clock.ms;
      state.MP_Engine.currentRound = rec.clock.currentRound;
      if ("roundAnchor" in rec.clock) {
        gc.roundAnchor = rec.clock.roundAnchor;
        gc.topId = rec.clock.topId;
        gc.leftAnchor = rec.clock.leftAnchor;
      }
      const prevBleeds = rec.bleedKeys || [];
      Object.keys(state.MP_Engine.bleeds || {}).forEach(k => {
        if (prevBleeds.indexOf(k) === -1) delete state.MP_Engine.bleeds[k];
      });
      updateClockHandout();
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

  // Whisper to character's non-GM player controllers, then /w gm copy.
  // API whispers to players are invisible to the GM, so the GM copy is
  // always sent explicitly. GM controllers are skipped to avoid duplicates.
  function chToChar(who, content, charId) {
    if (charId) {
      const char = getObj("character", charId);
      if (char) {
        const cb = (char.get("controlledby") || "").split(",");
        const sent = new Set();
        for (const id of cb) {
          const pid = id.trim();
          if (!pid || pid === "all" || playerIsGM(pid) || sent.has(pid)) continue;
          const player = getObj("player", pid);
          if (player) {
            ch(who, `/w "${player.get("_displayname")}" ` + content);
            sent.add(pid);
          }
        }
      }
    }
    ch(who, "/w gm " + content);
  }

  // Whisper to unique non-GM player controllers across all given characters,
  // then always send a /w gm copy (API whispers to players are invisible to
  // the GM). Deduplicates by player ID; GM controllers skipped (they get
  // the /w gm copy instead).
  function chToChars(who, content, charIds) {
    const sentPlayers = new Set();
    for (const cid of charIds) {
      if (!cid) continue;
      const char = getObj("character", cid);
      if (!char) continue;
      const cb = (char.get("controlledby") || "").split(",");
      for (const id of cb) {
        const pid = id.trim();
        if (!pid || pid === "all" || playerIsGM(pid) || sentPlayers.has(pid)) continue;
        const player = getObj("player", pid);
        if (player) {
          ch(who, `/w "${player.get("_displayname")}" ` + content);
          sentPlayers.add(pid);
        }
      }
    }
    ch(who, "/w gm " + content);
  }

  // Send to player if non-GM, plus a /w gm copy (API whispers to players
  // are invisible to the GM)
  function chBoth(who, content, msg) {
    if (msg && msg.playerid && !playerIsGM(msg.playerid)) {
      const target = wt(msg);
      if (target !== "/w gm ") ch(who, target + content);
    }
    ch(who, "/w gm " + content);
  }

  // Send to player if non-GM, plus a /w gm copy (API whispers to players
  // are invisible to the GM)
  function chBothId(who, content, playerId) {
    if (playerId && !playerIsGM(playerId)) {
      const target = wtId(playerId);
      if (target !== "/w gm ") ch(who, target + content);
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
    ch(who, "/w gm " + content);
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
  // dedicatedOnly: a protection row only counts if its prot_subtype EXPLICITLY
  // lists the attack subtype. Used by Transmutation (p.77): "only dedicated
  // Invulnerability vs. Transmutation works against it" — blanket Other
  // protection does not cover it.
  function sumProtectionWithHardened(charId, protKey, atkSubtype, dedicatedOnly) {
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
        // Protection covers full type - matches unless the attack demands a
        // dedicated (subtype-named) defense.
        subtypeMatches = !dedicatedOnly;
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
    const veh = isVehicleMode(charId);
    const sec = veh ? "repeating_vehprotection" : "repeating_protection";
    const pre = veh ? "vprot" : "prot";
    
    // Get all protection row IDs
    const rowIds = new Set();
    const rowRe = new RegExp("^" + sec + "_([^_]+)_");
    attrs.forEach(a => {
      const match = a.get("name").match(rowRe);
      if (match) rowIds.add(match[1]);
    });
    
    for (const rowId of rowIds) {
      // Check if this row is broken
      const brokenAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;
      
      // Check if this row is active
      const stateAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_state`);
      if (stateAttr && stateAttr.get("current") === "Off") continue;
      
      // Check mode - only interested in Absorption or Reflection
      const modeAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      if (mode !== "absorption" && mode !== "reflection") continue;
      
      // Check if this row has protection for this damage type
      const protAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_${protKey}`);
      if (!protAttr) continue;
      const protValue = protAttr.get("current");
      if (!protValue || protValue === "0" || protValue === "") continue;
      
      // Check subtype matching
      const subtypeAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_subtype`);
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
      const limitAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_limit`);
      const absorbsToAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_absorbs_to`);
      const absorbsPowerAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_absorbs_power`);
      const nameAttr = attrs.find(a => a.get("name") === `${sec}_${rowId}_${pre}_name`);
      
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
  
  // Draw a dashed circle path marking the area effect (map layer, unmovable by players)
  function drawAreaMarker(pageId, centerX, centerY, radiusInches, pixelsPerInch, color, width) {
    if (!CFG.AREA_MARKER) return null;
    const r = radiusInches * pixelsPerInch;
    if (!(r > 0)) return null;
    const ticks = Math.max(16, Math.min(48, Math.round(r / 8)));
    const duty = 0.55;
    const step = (2 * Math.PI) / ticks;
    const pts = [];
    for (let i = 0; i < ticks; i++) {
      const a1 = i * step;
      const a2 = a1 + step * duty;
      pts.push(["M", r + r * Math.cos(a1), r + r * Math.sin(a1)]);
      pts.push(["L", r + r * Math.cos(a2), r + r * Math.sin(a2)]);
    }
    const path = createObj("path", {
      _pageid: pageId,
      layer: "map",
      stroke: color || CFG.AREA_MARKER_COLOR,
      stroke_width: width || CFG.AREA_MARKER_WIDTH,
      fill: "transparent",
      left: centerX,
      top: centerY,
      width: r * 2,
      height: r * 2,
      path: JSON.stringify(pts)
    });
    return path ? path.id : null;
  }
  
  function removeAreaMarker(rec) {
    if (!rec || !rec.markerId) return;
    const p = getObj("path", rec.markerId);
    if (p) p.remove();
    rec.markerId = null;
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

  // Vehicle Force Field: a repeating_vehprotection row named "Force Field".
  // Mirrors the character FF mechanic (per-hit deflection wall + Power-based pool).
  function getVehicleForceFieldData(charId, tokenId) {
    const attrs = findObjs({ _type: "attribute", _characterid: charId }) || [];
    const rowIds = new Set();
    attrs.forEach(a => {
      const m = a.get("name").match(/^repeating_vehprotection_([^_]+)_/);
      if (m) rowIds.add(m[1]);
    });
    for (const rowId of rowIds) {
      const nameAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_name`);
      const nm = nameAttr ? (nameAttr.get("current") || "").trim().toLowerCase() : "";
      const modeAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_mode`);
      const mode = modeAttr ? (modeAttr.get("current") || "normal").toLowerCase() : "normal";
      // Treat as a force field if mode says so, or (legacy) the row is named "Force Field"
      if (mode !== "forcefield" && nm !== "force field") continue;

      const brokenAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_broken`);
      if (brokenAttr && brokenAttr.get("current") === "1") continue;

      const accumAttr = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_ff_accum`);
      const accum = num(accumAttr ? accumAttr.get("current") : "0", 0);

      const hardKeyMap = { kinetic: "hard_kinetic", energy: "hard_energy", bio: "hard_bio",
        entropy: "hard_entropy", psychic: "hard_psychic", other: "hard_other" };
      const protValues = {};
      const hardValues = {};
      CFG.PROT_KEYS.forEach(k => {
        const pa = attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_${k}`);
        protValues[k] = parseProtValue(pa ? pa.get("current") : "0").prot;
        const hk = hardKeyMap[k];
        const ha = hk ? attrs.find(a => a.get("name") === `repeating_vehprotection_${rowId}_vprot_${hk}`) : null;
        hardValues[k] = ha ? (parseInt(ha.get("current"), 10) || 0) : 0;
      });

      const tok = tokenId ? getObj("graphic", tokenId) : null;
      const threshold = getVehiclePower(tok, charId);

      return {
        hasFF: true,
        isVehicle: true,
        rowId: rowId,
        name: nameAttr ? nameAttr.get("current") : "Force Field",
        isGear: false,
        accum: accum,
        threshold: threshold,
        remaining: Math.max(0, threshold - accum),
        protValues: protValues,
        hardValues: hardValues,
        subtype: "",
        pr: 0
      };
    }
    return null;
  }

  // Update Force Field accumulated deflection on the sheet (character or vehicle section)
  function setFFAccum(charId, rowId, newAccum) {
    const veh = isVehicleMode(charId);
    const nm = veh ? `repeating_vehprotection_${rowId}_vprot_ff_accum` : `repeating_protection_${rowId}_prot_ff_accum`;
    const attr = findObjs({ _type: "attribute", _characterid: charId, name: nm })[0];
    if (attr) {
      attr.set("current", String(newAccum));
    } else {
      createObj("attribute", { characterid: charId, name: nm, current: String(newAccum) });
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
    if (isVehicleMode(charId)) {
      const ba = findObjs({ _type: "attribute", _characterid: charId,
        name: `repeating_vehprotection_${rowId}_vprot_broken` })[0];
      if (ba) ba.set("current", "1");
      else createObj("attribute", { characterid: charId,
        name: `repeating_vehprotection_${rowId}_vprot_broken`, current: "1" });
      updateFFAura(tok, null);
      return;
    }
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
    const maxAge = 10 * 60 * 1000;  // 10 minutes (roll-with decisions can pend)
    Object.keys(state.MP_Engine.pendingArea).forEach(k => {
      if (now - state.MP_Engine.pendingArea[k].timestamp > maxAge) {
        removeAreaMarker(state.MP_Engine.pendingArea[k]);
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

  // v2.93.1: subtype-aware. atkSubtype = the incoming attack's form (e.g.
  // "electricity"); a form-specific weakness line applies ONLY when the
  // attack's subtype matches (RAW half-cost specific-form Vulnerability /
  // Attract, e.g. "electrical Energy"). Type-only lines apply to the whole
  // type as before. Grammars accepted per line:
  //   word style:    "Vulnerable to Energy +4", "Attract cold Entropy -2",
  //                  "Vulnerable to electricity +4" (bare subtype implies type)
  //   compact style: "vuln:Energy/electricity:+4", "vuln:Energy:+2",
  //                  "attract:Entropy/cold:-2"  (matches the sheet placeholder)
  const _DT_ABBREVS = { k:1, kin:1, kinetic:1, e:1, eng:1, energy:1, b:1, bio:1,
    biochemical:1, ent:1, entropy:1, p:1, psy:1, psychic:1, o:1, oth:1, other:1 };

  function _subtypeToParent(sub) {
    const s = String(sub || "").toLowerCase().trim();
    if (!s) return null;
    if (_DT_ABBREVS[s]) return null; // parent/abbrev, not a subtype
    return DMG_TYPE_MAP[s] || null;
  }

  function getVulnerabilityMods(charId, damageType, atkSubtype) {
    const dt = (damageType || "").trim();
    if (!dt) return { protMod: 0, dmgMod: 0, notes: [] };
    const atkSub = String(atkSubtype || "").trim().toLowerCase();

    let protMod = 0; // negative reduces protection
    let dmgMod = 0;  // positive adds to penetrating damage
    const notes = [];

    // does this line's subtype requirement (if any) match the attack?
    const subMatches = (lineSub) => {
      if (!lineSub) return true;             // type-wide line
      if (!atkSub) return false;             // form-specific line, generic attack
      return atkSub === lineSub || atkSub.indexOf(lineSub) >= 0 || lineSub.indexOf(atkSub) >= 0;
    };
    const applyLine = (kind, lineDt, lineSub, numRaw) => {
      if (String(lineDt || "").toLowerCase() !== dt.toLowerCase()) return;
      if (!subMatches(lineSub)) return;
      const formTag = lineSub ? `/${lineSub}` : "";
      if (kind === "attract") {
        const delta = -Math.abs(numRaw);
        protMod += delta;
        notes.push(`Attract: ${dt}${formTag} ${delta}`);
      } else {
        const delta = Math.abs(numRaw);
        dmgMod += delta;
        notes.push(`Vulnerable: ${dt}${formTag} +${delta}`);
      }
    };

    const rows = getRepeatingAbilityRows(charId);
    rows.forEach(r => {
      const nm = _normKey(r.ability_name);

      // Don't misread "Invulnerability" as "Vulnerability"
      if (nm.includes("invulner")) return;
      if (!nm.includes("vulner") && !nm.includes("attract")) return;

      const rawNotes = String(r.ability_notes || "");
      const lines = rawNotes.split(/\r?\n|;/).map(s => s.trim()).filter(Boolean);

      // If notes are empty, try to glean from the name itself.
      const scanLines = lines.length ? lines : [String(r.ability_name || "")];

      scanLines.forEach(line => {
        const low = line.toLowerCase();

        // compact grammar: vuln:TYPE[/SUBTYPE]:+N | attract:TYPE[/SUBTYPE]:-N
        // (also accepts a bare subtype in the TYPE slot: vuln:electricity:+4)
        const cm = low.match(/\b(vuln|attract):([a-z][a-z ]*?)(?:\/([a-z][a-z ]*?))?:([+-]?\d+)/);
        if (cm) {
          const t2 = cm[2].trim();
          const parentFromSub = _subtypeToParent(t2);
          const lineDt = parentFromSub || (DMG_TYPE_MAP[t2] || t2);
          const lineSub = cm[3] ? cm[3].trim() : (parentFromSub ? t2 : "");
          applyLine(cm[1] === "attract" ? "attract" : "vulnerable", lineDt, lineSub, num(cm[4], 0));
          return;
        }

        // word grammar
        const kinds = [];
        if (/\battract\b/.test(low)) kinds.push("attract");
        if (/\binvulner/.test(low)) return;
        if (/\bvulnerable\b/.test(low)) kinds.push("vulnerable");
        if (!kinds.length) return;

        const numRaw = _extractSignedNumber(line);
        if (numRaw === null) return;

        // known subtype word in the line? (skip parent/abbrev map keys)
        let lineSub = "";
        Object.keys(DMG_TYPE_MAP).forEach(k => {
          if (_DT_ABBREVS[k] || lineSub) return;
          if (new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(low)) lineSub = k;
        });
        // common adjectival forms
        if (!lineSub && /\belectric(al)?\b/.test(low)) lineSub = "electricity";
        if (!lineSub && /\b(fire|flame)\b/.test(low)) lineSub = "heat";

        let dts = _extractDamageTypes(line);
        if (!dts.length && lineSub) dts = [_subtypeToParent(lineSub)].filter(Boolean);
        if (!dts.length) return;

        kinds.forEach(kind => dts.forEach(lineDt => applyLine(kind, lineDt, lineSub, numRaw)));
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

  function setVehSystemAttr(charId, rowId, shortName, value) {
    const searchName = `repeating_vehsystems_${rowId}_${shortName}`.toLowerCase();
    const attrs = findObjs({ _type: "attribute", _characterid: charId });
    const found = attrs.find(a => a.get("name").toLowerCase() === searchName);
    if (found) { found.set("current", value); return true; }
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

  function getPageScaleInMpInches(page) {
    if (!page) return 1;

    const scaleNumber = parseFloat(page.get("scale_number"));
    const n = Number.isFinite(scaleNumber) && scaleNumber > 0 ? scaleNumber : 5;
    const units = String(page.get("scale_units") || "ft").trim().toLowerCase();

    // Roll20 stores page scale as: one Roll20 unit = N units of scale_units.
    // MP attack ranges are in inches where 1 MP inch = 5 feet.
    if (/^(ft|foot|feet)$/.test(units)) return n / 5;
    if (/^(in|inch|inches|")$/.test(units)) return n;
    if (/^(yd|yard|yards)$/.test(units)) return (n * 3) / 5;
    if (/^(mi|mile|miles)$/.test(units)) return (n * 5280) / 5;
    if (/^(m|meter|meters|metre|metres)$/.test(units)) return (n * 3.28084) / 5;
    if (/^(km|kilometer|kilometers|kilometre|kilometres)$/.test(units)) return (n * 3280.84) / 5;

    // Preserve the legacy assumption for custom/blank labels: N feet per unit.
    return n / 5;
  }

  function calculateRange(atkTok, defTok) {
    if (!atkTok || !defTok) return { inches: 0, penalty: 0 };

    const pageId = atkTok.get("_pageid");
    const page = getObj("page", pageId);

    // Roll20 coordinates are in pixels; 70px is one full Roll20 page unit.
    // snapping_increment / Cell Width changes the drawn grid cell size, so apply
    // it to the scale distance rather than treating it as a second pixel scale.
    const snappingRaw = page ? parseFloat(page.get("snapping_increment")) : 1;
    const snapping = Number.isFinite(snappingRaw) && snappingRaw > 0 ? snappingRaw : 1;
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
    
    // Convert to drawn grid cells. One cell may be fractional Roll20 units
    // when page Cell Width/snapping_increment is not 1.
    const dx = dxPx / gridPx;
    const dy = dyPx / gridPx;

    // Match Roll20 ruler diagonal setting
    const diag = page ? (page.get("diagonaltype") || "foure") : "foure";

    let distCells;
    switch (diag) {
      case "foure": // 5E/4E: diagonals count as 1
        distCells = Math.max(dx, dy);
        break;
      case "threefive": { // 3.5E: every 2nd diagonal counts extra
        const min = Math.min(dx, dy);
        const max = Math.max(dx, dy);
        distCells = max + Math.floor(min / 2);
        break;
      }
      case "manhattan":
        distCells = dx + dy;
        break;
      case "pythagorean":
        distCells = Math.sqrt(dx * dx + dy * dy);
        break;
      default:
        distCells = Math.max(dx, dy);
        break;
    }

    const inchesPerRoll20Unit = getPageScaleInMpInches(page);
    const inchesPerGridCell = inchesPerRoll20Unit * snapping;

    const distInches = distCells * inchesPerGridCell;
    
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
    let defChar = getCharFromToken(defTok);

    // v2.89.3: AREA attacks may target a generic/unlinked token - it's just
    // the blast center point (area attacks apply no defense; +6 immobile).
    // Substitute a stub character so downstream attr lookups fall through to
    // defaults (getAttr/chToChars/getTokensInRadius all skip null charIds).
    let defIsPointTarget = false;
    if (atkChar && defTok && !defChar) {
      const rowAreaPeek = isVehicleMode(atkCharId)
        ? num(fields.area, 0)
        : num(getRepeatingAttackAttr(atkCharId, rowId, "attack_area"), num(fields.area, 0));
      if (rowAreaPeek > 0) {
        defIsPointTarget = true;
        defChar = {
          id: null,
          get: (k) => (k === "name" ? (defTok.get("name") || "Target Point") : "")
        };
      }
    }

    if (!atkChar || !defTok || !defChar) {
      const hint = (atkChar && defTok && !defChar)
        ? " Target token has no character sheet - only AREA attacks can target a generic point token."
        : "";
      ch("MP", `${wt(msg)}<b>MP:</b> Could not resolve attacker/defender. Select a target token.${hint}`);
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
      "gear": "Gear", "dazzle": "Dazzle"
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
    const calledShotPenalties = { "None": 0, "Head": -6, "Arm": -3, "Leg": -3, "Avoid Light Armor": -3, "Avoid Heavy Armor": -6, "Gear": -3, "Called": -3, "Dazzle": -6 };
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
    // v2.90.1: Laser dazzle called shot (Light Control A) - -6 to hit, no
    // damage, ignores protection (goggles block entirely, GM-adjudicated).
    // On hit the victim rolls the row's EN save vs the Laser CP table's
    // Dazzle mod; recovery each between-rounds phase (no extra penalty).
    const isDazzleShot = calledShotType === "Dazzle";

    const atkIsVehicle = isVehicleMode(atkCharId);
    // Vehicle weapons live in repeating_vehsystems, not repeating_attacks. Map the
    // engine's attack_* reads to the mpattack template fields the vehicle button supplies,
    // so save attacks / charges / range / PR / AP / KB / area all flow through unchanged.
    const vehAtkMap = {
      attack_atk: fields.atype || "P",
      attack_name: fields.name || "Attack",
      attack_damage: fields.dmgexpr || "",
      attack_dmgtype: fields.type || "Kin",
      attack_subtype: fields.subtype || "",
      attack_type: "std",
      attack_num: "1",
      attack_mod: "0",
      attack_cost: fields.pr || "",
      attack_charges: fields.ch || "",
      attack_range: fields.range || "",
      attack_ap: fields.ap || "",
      attack_kb: fields.kb || "",
      attack_area: fields.area || "",
      attack_is_save: fields.is_save || "",
      attack_save_bc: fields.savebc || "",
      attack_save_mod: fields.savemod || "",
      attack_save_rec: fields.recovery || "",
      attack_recovery: fields.recovery || "",
      attack_save_rec_time: fields.rectime || "",
      attack_no_damage: fields.no_damage || "",
      attack_autofire: fields.autofire || ""
    };
    const getAtk = atkIsVehicle
      ? (name) => (vehAtkMap[name] !== undefined ? String(vehAtkMap[name]) : "")
      : (name) => getRepeatingAttackAttr(atkCharId, rowId, name);

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
    
    const isSaveAttack = (getAtk("attack_is_save") === "1") || (atkType === "sav") || isDazzleShot;
    const saveBC = getAtk("attack_save_bc") || (isDazzleShot ? "EN" : "");
    const saveMod = num(getAtk("attack_save_mod"), 0);
    // v2.89.1: Sense Loss (Flash) — levels of visible-light sense lost on a
    // failed save (1 Mild / 2 Flash / 3 Strong). Recovery each between-rounds
    // phase at -12 per the rules; used as the default when Rec is blank.
    // v2.90.1: a Dazzle called shot forces senseLoss 2 (temporary blindness);
    // its recovery has NO extra penalty (blank Rec = 0, not Flash's -12).
    const senseLoss = isDazzleShot
      ? Math.max(2, Math.min(3, num(getAtk("attack_sense_loss"), 0)))
      : (isSaveAttack ? Math.max(0, Math.min(3, num(getAtk("attack_sense_loss"), 0))) : 0);
    const recRaw = getAtk("attack_save_rec") || getAtk("attack_recovery");
    const recMod = (!isDazzleShot && senseLoss > 0 && String(recRaw || "").trim() === "") ? -12 : num(recRaw, 0);
    let recTime = getAtk("attack_save_rec_time") || "1 round";
    const noDamage = (getAtk("attack_no_damage") === "1") || isDazzleShot;
    
    const atkDamageExpr = getAtk("attack_damage") || "";
    const saveDamage = (isSaveAttack && !isDazzleShot) ? rollExpr(atkDamageExpr) : 0;
    
    const atkNotes = getAtk("attack_notes") || "";
    const noDamageType = isSaveAttack && notesIndicateNoDamageType(atkNotes, atkName);
    const protKey = noDamageType ? null : typeToProtKey(dmgTypeStr);
    const range = getAtk("attack_range") || fields.range || "-";
    const kbChecked = getAtk("attack_kb");
    const causesKB = !isDazzleShot && (getAtk("attack_is_siphon") !== "1") && (getAtk("attack_is_deathtouch") !== "1") && ((kbChecked === "1") || (fields.kb && fields.kb.toLowerCase() === "yes"));

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
    
    const isSiphonAttack = (getAtk("attack_is_siphon") === "1");
    const isDeathTouch = (getAtk("attack_is_deathtouch") === "1");
    const siphonDrain = getAtk("attack_siphon_drain") || "hits";
    const siphonMode = getAtk("attack_siphon_mode") || "normal";
    const siphonBC = getAtk("attack_siphon_bc") || "";
    const siphonCat = getAtk("attack_siphon_cat") || "";
    
    const areaRaw = getAtk("attack_area") || fields.area || "";
    const areaDiameter = num(areaRaw, 0);
    const isAreaAttack = areaDiameter > 0;
    const areaRadius = areaDiameter / 2;
    const hasImmunity = (getAtk("attack_immunity") === "1");
    
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

    const atkSave = atkIsVehicle
      ? getAttrNum(atkCharId, atkTypeCode === "M" ? "vehicle_in_save" : (atkTypeCode === "E" ? "vehicle_cl_save" : "vehicle_ag_save"), 10)
      : getAttrNum(atkCharId, atkSaveAttr, 10);
    
    const defPageId = defTok.get("_pageid");
    // v2.89.4: token-aware attacker resolution (mook attackers). Priority:
    //   1. Explicit {{atktok=...}} from the quick macros (!mp atk/autofire)
    //   2. A selected token representing the attacker (sheet-button rolls)
    //   3. Unique represents-lookup on the map (the original behavior)
    // Only error when multiple candidates remain and none is identified.
    let atkTok = null;
    const atkTokCandidates = findObjs({ _type: "graphic", represents: atkCharId, _pageid: defPageId });
    const explicitAtkTok = fields.atktok ? getObj("graphic", fields.atktok) : null;
    if (explicitAtkTok && explicitAtkTok.get("represents") === atkCharId && explicitAtkTok.get("_pageid") === defPageId) {
      atkTok = explicitAtkTok;
    } else if (msg.selected && msg.selected.length) {
      const selMatch = msg.selected
        .map(s => (s._type === "graphic" ? getObj("graphic", s._id) : null))
        .find(t => t && t.get("represents") === atkCharId && t.get("_pageid") === defPageId);
      if (selMatch) atkTok = selMatch;
    }
    if (!atkTok) {
      if (atkTokCandidates.length > 1) {
        ch("MP", `${wt(msg)}<div style="background:#ff6b6b; border:3px solid #000; padding:4px 8px;">⚠️ <b>${esc(atkChar.get("name"))}</b> has ${atkTokCandidates.length} tokens on this map. Select the attacking token before rolling, or use the <code>!mp atk</code> token action (which passes the token id).</div>`);
        return;
      }
      atkTok = atkTokCandidates[0];
    }
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

    // v2.90.0: 4.6 TARGET ACQUISITION. An attacker with impaired vision
    // rolls a perception check (IN save) mapped through the sense-level
    // table. Vision at Basic rolls the Basic row; vision at None falls back
    // to default human hearing (Basic row, labeled). Full vision needs no
    // roll for ordinary targets (a Full sense IDs even on a failed check).
    // v2.91.0: the defender's Invisibility/Blur also forces the roll -
    // observationLevel() combines attacker impairment with defender
    // concealment, and a sneaking invisible target opposes at -(AG-10).
    // RAW: re-roll acquisition if the target moves/sneaks/turns invisible.
    const atkVision = atkTok ? visionLossInfo(atkTok.id, atkCharId) : { lost: 0, effective: 2, effLabel: "Full", causes: [] };
    const obs = atkTok ? observationLevel(atkTok.id, defTokenId, defChar.id, atkCharId, rangeData.inches, rangeData.penalty)
      : { level: 2, label: "vision (Full)", oppMod: 0, chkMod: 0, rngMod: 0, extraToHit: 0, needsRoll: false, inv: null, atkVision };
    let atkVisionPenalty = 0;
    let acqNote = "";
    let acqHover = "";
    if (obs.needsRoll && atkTok) {
      // v2.91.1: ACQUIRE ONCE (4.6 RAW: "re-roll to acquire any target which
      // has moved, started sneaking, become invisible, etc."). A successful
      // acquisition persists for this attacker/defender pair until the
      // signature changes: defender position, defender concealment state
      // (invisible/blur/sneaking), or the attacker's own vision impairment.
      // Blocked ("-") results are never cached - the attacker may retry.
      if (!state.MP_Engine.acquired) state.MP_Engine.acquired = {};
      const acqKey = atkTok.id + "|" + defTokenId;
      // v2.100.0: signature built by the shared helper so !mp scan seeds
      // entries the attack pipeline recognizes.
      const acqSig = acqSignature(defTok, obs, rangeData.inches);
      const cached = state.MP_Engine.acquired[acqKey];

      if (cached && cached.sig === acqSig) {
        atkVisionPenalty = cached.toHitMod + num(obs.extraToHit, 0);
        acqHover = `&#10;Acquired [${cached.tier}]: ${cached.toHitMod} (${obs.label}, held from round ${cached.round})`;
        acqNote = `<div style="background:#1e3a2f; border:1px solid #2e6b4a; padding:3px 8px; font-size:11px; color:#eee;">🎯 Already acquired by ${obs.label}: <b style="color:#2ecc71;">[${cached.tier}] ${esc(cached.label)}</b>${cached.toHitMod !== 0 ? ` (${cached.toHitMod} to hit)` : ""} — held from round ${cached.round} (re-rolls when the target moves or concealment changes)</div>`;
        ch("MP", `${wt(msg)}` + acqNote);
      } else {
        const acqDisc = atkDiscomfortPenalty; // -3 on all checks incl. perception
        const acqMod = num(obs.oppMod, 0) + num(obs.chkMod, 0) + num(obs.rngMod, 0) + acqDisc;
        const acq = rollAcquisition(atkCharId, obs.level, undefined, acqMod, obs.sneakGate);
        atkVisionPenalty = acq.toHitMod + num(obs.extraToHit, 0);
        const modParts = [];
        if (obs.oppMod) modParts.push(`${obs.oppMod} sneak`);
        if (obs.chkMod) modParts.push(`${obs.chkMod > 0 ? "+" : ""}${obs.chkMod} chk`);
        if (obs.rngMod) modParts.push(`${obs.rngMod} range`);
        if (acqDisc) modParts.push(`${acqDisc} discomfort`);
        const rollTxt = `IN ${acq.inSave}-${acq.mod !== 0 ? ` ${acq.mod} (${modParts.join(", ")}) = ${acq.tn}-` : ""}, rolled ${acq.d1}${acq.d2 != null ? `/${acq.d2}` : ""}${acq.gated ? " — needed a CRIT (3.1.5.1)" : ""}`;
        const causeTxt = [
          atkVision.causes.length ? atkVision.causes.join(", ") : null,
          obs.inv ? (obs.inv.blur ? "target Blurred" : "target Invisible") : null,
          obs.sneaking ? "target sneaking" : null
        ].filter(Boolean).join("; ");
        acqHover = `&#10;Acquire [${acq.tier}]: ${acq.toHitMod} (${obs.label}, ${rollTxt})`;
        if (acq.blocked) {
          delete state.MP_Engine.acquired[acqKey];
          ch("MP", `${wt(msg)}<div style="background:#8e2b2b; border:2px solid #000; padding:4px 8px; color:#fff;">🕶 <b>${esc(atkChar.get("name"))}</b> fails to acquire <b>${esc(defTok.get("name") || "the target")}</b> by ${obs.label} (${rollTxt} — ${esc(acq.outcome)}) — <b>cannot attack</b> (4.6 tier "-"). ${esc(causeTxt)}</div>`);
          return;
        }
        state.MP_Engine.acquired[acqKey] = { sig: acqSig, tier: acq.tier, toHitMod: acq.toHitMod, label: acq.label, round: state.MP_Engine.currentRound };
        const tierColor = acq.tier === "?" ? "#ff6b6b" : (acq.tier === "-3" ? "#f4d03f" : "#2ecc71");
        acqNote = `<div style="background:#3a2f14; border:1px solid #6b5a1e; padding:3px 8px; font-size:11px; color:#eee;">🎯 Acquire by ${obs.label}: <b style="color:${tierColor};">[${acq.tier}] ${esc(acq.label)}</b>${acq.toHitMod !== 0 ? ` (${acq.toHitMod} to hit)` : ""} — ${rollTxt} (${esc(causeTxt)})</div>`;
        ch("MP", `${wt(msg)}` + acqNote);
      }
    }

    // v2.91.0: an INVISIBLE attacker may qualify for the Surprise bonus
    // (4.6) if the defender hasn't detected them - GM applies via --mod.
    if (atkTok) {
      const atkConds = (state.MP_Engine.conditions && state.MP_Engine.conditions[atkTok.id]) || [];
      const atkInv = atkConds.find(c => c.type === "invisible");
      if (atkInv) {
        ch("MP", `${wt(msg)}<div style="background:#2a2a4a; border:1px solid #5a4fcf; padding:3px 8px; font-size:11px; color:#eee;">🫥 <b>${esc(atkChar.get("name"))}</b> is ${atkInv.blur ? "Blurred" : "INVISIBLE"} — if undetected by the target, the <b>Surprise bonus (4.6)</b> applies (GM: add via --mod / Other).</div>`);
      }
      const atkSneak = atkConds.find(c => c.type === "sneaking");
      if (atkSneak && !atkInv) {
        ch("MP", `${wt(msg)}<div style="background:#2a2a4a; border:1px solid #6b5a1e; padding:3px 8px; font-size:11px; color:#eee;">👣 <b>${esc(atkChar.get("name"))}</b> is SNEAKING — if outside the target's vision arc (e.g. from behind), the target detects only on a CRITICAL Basic-sense check opposed by AG (3.1.5.1); undetected = <b>Surprise bonus (4.6)</b> (GM: add via --mod).</div>`);
      }
    }

    // v2.93.0: Discomfort (Special Requirement unmet): -3 to all rolls to hit
    const atkDiscomfortPenalty = (atkTok && hasDiscomfort(atkTok.id)) ? -3 : 0;

    const baseToHit = atkSave + 3 + atkMod + abilityTohitBonus + macroMod + atkStancePenalty + rangePenalty + atkRestraintPenalty + atkVisionPenalty + atkDiscomfortPenalty;

    const defAttr = (atkTypeCode === "M" || atkTypeCode === "E") ? "mental_def" : "physical_def";
    const defBase = getAttrNum(defChar.id, defAttr, 0);
    const defMod = num(defTok.get(CFG.DEF_MOD_BAR), 0);
    // v2.90.0: 4.6 - a vision-impaired DEFENDER suffers -3 to defend against
    // attacks they perceive poorly ("?" and "-3" tiers; "-" is -3/-6 per
    // 4.7.2, GM-adjusted). Applied only to Physical defense - mental/
    // emotional attacks aren't dodged by sight.
    const defVision = visionLossInfo(defTokenId);
    const defVisionPenalty = (atkTypeCode !== "M" && atkTypeCode !== "E" && defVision.lost > 0) ? -3 : 0;
    const defValue = defBase + defMod + defVisionPenalty;

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
      if (atkIsVehicle) setVehSystemAttr(atkCharId, rowId, "vsys_charges", chg1);
      else setRepeatingAttackAttr(atkCharId, rowId, "attack_charges", chg1);
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
      senseLoss, isDazzleShot,
      snBP, snMaxBP, snType, causesKB,
      isSiphon: isSiphonAttack, siphonDrain, siphonMode, siphonBC, siphonCat,
      isDeathTouch,
      isPushing, pushAmount, rangeData, created: Date.now(),
      noDamageType,
      isAreaAttack, areaRadius, areaDiameter, hasImmunity,
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

    // Vehicle weapons carry their to-hit bonus in macroMod (hitmod); itemize it for the card.
    if (atkIsVehicle) {
      const vWpnMod = num(fields.wpnmod, 0);
      const vTargBonus = num(fields.targbonus, 0);
      if (vWpnMod !== 0) hoverBreakdown += `&#10;Wpn +To-Hit: ${vWpnMod >= 0 ? '+' : ''}${vWpnMod}`;
      if (vTargBonus !== 0) hoverBreakdown += `&#10;Targeting: ${vTargBonus >= 0 ? '+' : ''}${vTargBonus}`;
    }

    const subtotal = baseChance + atkMod + abilityTohitBonus + aimVal + multiVal + otherVal + (atkIsVehicle ? macroMod : 0);
    hoverBreakdown += `&#10;─────────`;
    hoverBreakdown += `&#10;Subtotal: ${subtotal}-`;
    
    if (defValue !== 0) hoverBreakdown += `&#10;${defTypeLabel}: -${defValue}`;
    if (atkStancePenalty !== 0) hoverBreakdown += `&#10;Stance: ${atkStancePenalty}`;
    if (atkRestraintPenalty !== 0) hoverBreakdown += `&#10;Restraint: ${atkRestraintPenalty}${atkRestraintLabel}`;
    if (acqHover) hoverBreakdown += acqHover;
    if (obs.extraToHit) hoverBreakdown += `&#10;Depth/weakness: ${obs.extraToHit}`;
    if (atkDiscomfortPenalty) hoverBreakdown += `&#10;Discomfort: ${atkDiscomfortPenalty}`;
    if (defVisionPenalty !== 0) hoverBreakdown += `&#10;Tgt vision impaired: +3 (def ${defBase + defMod} → ${defValue})`;
    
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
    if (isSiphonAttack) {
      const sipLabel = siphonDrain === "power" ? "Power" : (siphonDrain === "ability" ? `${esc(siphonCat || "Ability")} CPs` : (siphonDrain === "bc" ? `${esc(siphonBC || "BC")}` : "Hits"));
      html += ` · <span style="color:#c88fff; font-weight:bold;" title="Siphon Attack: drains ${sipLabel}${siphonMode !== "normal" ? " (" + siphonMode + ")" : ""}">SIPHON: ${sipLabel}</span>`;
    }
    if (atkAP === Infinity) html += ` · AP: <span style="color:#bd93f9; font-weight:bold;" title="Armor Piercing: ignores all armor (not force fields)">ALL</span>`;
    else if (atkAP > 0) html += ` · AP: <span style="color:#bd93f9; font-weight:bold;" title="Armor Piercing: ignores this many points of armor (not force fields)">${atkAP}</span>`;
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
          "Called": "CALLED SHOT (-3)",
          "Dazzle": "DAZZLE SHOT (-6) - no damage, ignores protection, EN save vs blind (goggles block)"
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
      // Buttons only to defender player (they decide roll-with); helpers CC /w gm
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
    
    // Find all tokens in the area; Immunity (+2.5) excludes the attacker
    // from their own Area Effect (RAW: ignore negative effects of own Ability)
    let tokensInArea = getTokensInRadius(pageId, centerX, centerY, rec.areaRadius);
    if (rec.hasImmunity) {
      tokensInArea = tokensInArea.filter(t => t.charId !== rec.atkCharId);
    }
    
    // Store area effect data
    cleanupPendingArea();
    const markerId = drawAreaMarker(pageId, centerX, centerY, rec.areaRadius, pixelsPerInch);
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
      markerId: markerId,
      tokens: areaTokens,
      timestamp: Date.now(),
      timeout: 60000,  // 60 second timeout
      atkName: rec.atkName,
      causesKB: rec.causesKB,
      rowId: rec.rowId,
      isSiphon: !!rec.isSiphon,
      siphonDrain: rec.siphonDrain,
      siphonMode: rec.siphonMode,
      siphonBC: rec.siphonBC,
      siphonCat: rec.siphonCat,
      // v2.89.1: sense-loss save attacks (Flash) resolve per-target saves
      isSaveAttack: !!rec.isSaveAttack,
      saveBC: rec.saveBC || "",
      saveMod: num(rec.saveMod, 0),
      recMod: num(rec.recMod, 0),
      recTime: rec.recTime || "1 round",
      senseLoss: num(rec.senseLoss, 0),
      atkCharIdForCond: rec.atkCharId
    };
    
    // Build output
    const hdrBg = (outcome === "HIT" || outcome === "CRIT") ? "#e67e22" : "#c0392b";
    let html = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; max-width:280px; color:#eee; overflow:hidden; margin-top:4px;">`;
    html += `<div style="background:${hdrBg}; padding:6px 10px; font-size:14px; font-weight:bold; color:#fff;">💥 AREA ${outcome}</div>`;
    html += `<div style="padding:6px 10px; background:#16213e; border-bottom:1px solid #2a2a4a;">`;
    if (num(rec.senseLoss, 0) > 0) {
      html += `Area: <b style="color:#fff;">${rec.areaDiameter}"</b> &middot; <b style="color:#f4d03f;">FLASH</b> — ${esc(rec.saveBC || "EN")} save or lose <b style="color:#fff;">${rec.senseLoss}</b> vision level(s)`;
    } else {
      html += `Area: <b style="color:#fff;">${rec.areaDiameter}"</b> &middot; Damage: <b style="color:#fff;">${rec.damageTotal}</b> ${esc(rec.dmgTypeStr)}`;
    }
    html += `<br/>To-Hit: <b style="color:#fff;">${rec.targetTotal}-</b> <span style="color:#aab; font-size:11px;">(+6 immobile, no def)</span> &middot; Roll: <b style="color:#fff;">${rec.roll}</b>`;
    if (scatterNote) html += `<br/><span style="color:#f1c40f; font-weight:bold;">${scatterNote.trim()}</span>`;
    html += `</div>`;
    
    if (tokensInArea.length === 0) {
      html += `<div style="padding:6px 10px; color:#aab;">No tokens in area.</div>`;
    } else {
      html += `<div style="padding:6px 10px;">`;
      html += `<span style="color:#f1c40f; font-weight:bold;">Tokens in area: ${tokensInArea.length}</span>`;
      
      // List tokens with escape buttons
      tokensInArea.forEach(t => {
        const distToEdge = calculateDistanceToEdge(t.distance, rec.areaRadius);
        const baseDef = getAttrNum(t.charId, "physical_def", 0);
        const escapeTN = baseDef + 9 - (3 * distToEdge);
        const escapeTNProne = escapeTN + 6;
        
        // Check for shield
        const shield = getShieldData(t.charId);
        const shieldTN = shield ? (9 + baseDef + shield.defense) : 0;
        
        html += `<br/><b style="color:#fff;">${esc(t.name)}</b> <span style="color:#aab;">(${distToEdge}" to edge)</span>`;
        html += `<br/><span style="color:#aab; font-size:11px;">Escape TN: <b style="color:#eee;">${escapeTN}-</b> &middot; Prone: <b style="color:#eee;">${escapeTNProne}-</b></span>`;
        
        // Player/GM buttons
        if (t.controller !== "gm" && t.controller !== "all") {
          // Whisper buttons to player
          const playerButtons = `${btn(`Leap Clear (${escapeTN}-)`, `!mp areaescape --id ${rollId} --target ${t.tokenId}`)} ` +
            `${btn(`Dive Prone (${escapeTNProne}-)`, `!mp areaescape --id ${rollId} --target ${t.tokenId} --prone`)}` +
            (shield ? ` ${btn(`Shield Block (${shieldTN}-)`, `!mp areashield --id ${rollId} --target ${t.tokenId}`)}` : "");
          // chToChar resolves the character's controllers to display names;
          // t.controller is a player ID (not a display name) so /w "${t.controller}" silently fails.
          chToChar("MP", `<b>AREA EFFECT vs ${esc(t.name)}</b><br/>${playerButtons}`, t.charId);
        }
      });
      
      // GM buttons
      const applyLabel = (num(rec.senseLoss, 0) > 0) ? "Resolve All Saves" : "Apply All Damage";
      html += `<div style="margin-top:6px;">${btn(`Auto-Roll NPCs`, `!mp arearollnpcs --id ${rollId}`)}`;
      html += ` ${btn(`Force All Escapes`, `!mp areaforceall --id ${rollId}`)}`;
      html += ` ${btnDanger(applyLabel, `!mp areadamageall --id ${rollId}`)}</div>`;
      html += `</div>`;
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
      resultHtml = `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      resultHtml += `<b style="color:#2ecc71;">${esc(tokData.name)}</b> ESCAPES area effect!`;
      resultHtml += `<br/><span style="color:#aab;">TN: <b style="color:#eee;">${escapeTN}-</b> &middot; Roll: <b style="color:#eee;">${roll}</b>${isProne ? " (dove prone)" : ""}</span>`;
      resultHtml += `</div>`;
    } else {
      // Failed - character ends up halfway to edge
      const halfwayDist = Math.ceil(distToEdge / 2);
      resultHtml = `<div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      resultHtml += `<b style="color:#ff6b6b;">${esc(tokData.name)}</b> FAILS to escape!`;
      resultHtml += `<br/><span style="color:#aab;">TN: <b style="color:#eee;">${escapeTN}-</b> &middot; Roll: <b style="color:#eee;">${roll}</b>${roll === 20 ? " (fumble)" : ""}</span>`;
      resultHtml += `<br/><span style="color:#aab;">Ends ${halfwayDist}" from edge (still in area)</span>`;
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
      
      resultHtml = `<div style="background:#16213e; border:2px solid #3498db; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      resultHtml += `<b style="color:#5dade2;">${esc(tokData.name)}</b> BLOCKS with ${esc(shield.name)}!`;
      resultHtml += `<br/><span style="color:#aab;">TN: <b style="color:#eee;">${blockTN}-</b> &middot; Roll: <b style="color:#eee;">${roll}</b></span>`;
      resultHtml += `<br/><span style="color:#aab;">Damage: <b style="color:#eee;">${damage}</b> vs Shield BP: <b style="color:#eee;">${shield.bp}</b></span>`;
      
      if (shieldBroken) {
        breakShield(tokData.charId, shield.rowId);
        resultHtml += `<br/><span style="color:#ff6b6b; font-weight:bold;">SHIELD BROKEN!</span>`;
      } else {
        resultHtml += `<br/><span style="color:#2ecc71;">Shield holds!</span>`;
      }
      resultHtml += `</div>`;
    } else {
      // Failed block - takes normal area damage
      tokData.escaped = false;
      
      resultHtml = `<div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
      resultHtml += `<b style="color:#ff6b6b;">${esc(tokData.name)}</b> FAILS to block!`;
      resultHtml += `<br/><span style="color:#aab;">TN: <b style="color:#eee;">${blockTN}-</b> &middot; Roll: <b style="color:#eee;">${roll}</b>${roll === 20 ? " (fumble)" : ""}</span>`;
      resultHtml += `<br/><span style="color:#aab;">Takes full area damage.</span>`;
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

  // Coverage-adjusted penetrating damage for one area target (4.7.5.3)
  function computeAreaPen(areaRec, tokData) {
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
    let effectiveProt = baseProt;
    const rawAP = areaRec.atkAP || 0;
    let effectiveAP = 0;
    if (rawAP === Infinity) {
      effectiveAP = Infinity;
      effectiveProt = 0;
    } else if (rawAP > 0) {
      effectiveAP = Math.max(0, rawAP - hardened);
      effectiveProt = Math.max(0, baseProt - effectiveAP);
    }
    let leftoverAP = 0;
    if (effectiveAP === Infinity) {
      leftoverAP = Infinity;
    } else if (effectiveAP > baseProt) {
      leftoverAP = effectiveAP - baseProt;
    }
    const afterProt = Math.max(0, raw - effectiveProt);
    let penetrating = afterProt;
    if (hasInvuln && afterProt > 0 && leftoverAP !== Infinity) {
      if (leftoverAP >= afterProt) {
        penetrating = afterProt;
      } else {
        penetrating = leftoverAP + Math.floor((afterProt - leftoverAP) / 4);
      }
    }
    if (hasAdapt && penetrating > 0) {
      if (isOtherType) penetrating = 0;
      else if (leftoverAP !== Infinity) penetrating = Math.floor(penetrating / 2);
    }
    return { raw, penetrating, effectiveProt, hasInvuln, hasAdapt, isOtherType, tokIsVehicle };
  }

  // Roll-with capacity for an area target (4.8.3: floor(current Power / 10), Fortitude x2)
  function areaMaxDivert(tokData, tok) {
    if (isVehicleMode(tokData.charId)) return 0;
    const pow0 = getResource(tok, tokData.charId, CFG.POWER_BAR, CFG.POWER_ATTR);
    let maxDivert = Math.floor(pow0 / 10);
    if (num(getAttr(tokData.charId, "willpower_fortitude"), 0) === 1) maxDivert *= 2;
    return maxDivert;
  }

  // Resolve one area target with a chosen roll-with divert. Returns an html result line.
  // v2.89.1: per-target save for a sense-loss area attack (Flash, Light
  // Control B). Failed save: dazzled condition, senseLevels from the attack
  // row, recovery each between-rounds phase at recMod (default -12).
  // Fumbled INITIAL save: permanently blinded (rules). Optional forcedRoll
  // for the test harness.
  function resolveAreaSenseLoss(areaRec, tokId, forcedRoll) {
    const tokData = areaRec.tokens[tokId];
    const tok = getObj("graphic", tokId);
    const char = getObj("character", tokData.charId);
    if (!tok || !char) {
      return `<br/><span style="color:#ff6b6b;">\u2717 <b>${esc(tokData.name)}</b> - token missing</span>`;
    }

    const saveAttr = bcToSaveAttr(areaRec.saveBC || "EN") || "endurance_save";
    const baseSave = getAttrNum(tokData.charId, saveAttr, 10);
    const tn = baseSave + num(areaRec.saveMod, 0);
    const d20 = (forcedRoll !== undefined) ? forcedRoll : randomInteger(20);
    const isFumble = (d20 === CFG.FUMBLE_FAIL_NAT);
    const pass = !isFumble && (d20 <= tn);

    if (pass) {
      return `<br/><span style="color:#27ae60;">\u2713 <b>${esc(tokData.name)}</b> saves (${tn}-, rolled ${d20}) — vision unaffected</span>`;
    }

    const levels = Math.max(1, Math.min(3, num(areaRec.senseLoss, 2)));
    const recTN = baseSave + num(areaRec.saveMod, 0) + num(areaRec.recMod, -12);
    const marker = CONDITION_MARKERS.dazzled;

    if (!state.MP_Engine.conditions[tokId]) state.MP_Engine.conditions[tokId] = [];
    const condList = state.MP_Engine.conditions[tokId];
    const condition = {
      type: "dazzled",
      sourceAtk: areaRec.atkName,
      atkCharId: areaRec.atkCharIdForCond,
      saveBC: areaRec.saveBC || "EN",
      saveTN: tn,
      recTN: recTN,
      recTime: areaRec.recTime || "1 round",
      startRound: state.MP_Engine.currentRound,
      marker: marker,
      created: Date.now(),
      permanent: isFumble,
      senseLevels: levels,
      effectDesc: getConditionDesc("dazzled", areaRec.atkName),
      damage: 0, dmgType: null, protKey: null
    };
    let condIdx = condList.findIndex(c => c.type === "dazzled");
    if (condIdx >= 0) condList[condIdx] = condition; // refresh in place
    else { condList.push(condition); condIdx = condList.length - 1; }
    tok.set("status_" + marker, true);

    const visNow = visionLossInfo(tokId, tokData.charId);
    let out = `<br/><span style="color:#e94560;">\u2717 <b>${esc(tokData.name)}</b> FAILS (${tn}-, rolled ${d20}${isFumble ? " FUMBLE" : ""}) — loses ${levels} vision level(s), now <b style="color:${visNow.effective === 0 ? '#ff6b6b' : '#f4d03f'};">${visNow.effLabel}</b></span>`;
    if (isFumble) {
      out += `<br/><span style="color:#ff0000; font-weight:bold; font-size:11px;">\ud83d\udc80 FUMBLE — blindness is PERMANENT!</span>`;
    } else {
      out += `<br/><span style="font-size:11px;">Rec: ${esc(areaRec.saveBC || "EN")} at <b>${recTN}-</b> every ${esc(areaRec.recTime || "1 round")}</span> ${btn(`Recovery`, `!mp recover --target ${tokId} --idx ${condIdx}`)}`;
    }
    return out;
  }

  function resolveAreaTarget(areaRec, tokId, divertWanted) {
    const tokData = areaRec.tokens[tokId];
    const tok = getObj("graphic", tokId);
    const char = getObj("character", tokData.charId);
    tokData.applied = true;
    if (!tok || !char) {
      return `<br/><span style="color:#ff6b6b;">\u2717 <b>${esc(tokData.name)}</b> - token missing</span>`;
    }
    // v2.89.1: sense-loss area attacks (Flash) roll a per-target save
    // instead of applying damage. No protection to the save (no Damage
    // Type; only the Protected Sense Modifier mitigates - GM adjudicated).
    if (areaRec.isSaveAttack && num(areaRec.senseLoss, 0) > 0) {
      return resolveAreaSenseLoss(areaRec, tokId);
    }
    const c = computeAreaPen(areaRec, tokData);
    const tokIsVehicle = c.tokIsVehicle;
    const hits0 = tokIsVehicle ? getVehicleHits(tok, tokData.charId) : getResource(tok, tokData.charId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = tokIsVehicle ? getVehiclePower(tok, tokData.charId) : getResource(tok, tokData.charId, CFG.POWER_BAR, CFG.POWER_ATTR);

    let divert = 0;
    if (!tokIsVehicle && divertWanted > 0 && c.penetrating > 0) {
      divert = Math.min(areaMaxDivert(tokData, tok), c.penetrating, divertWanted);
    }
    let toHits = Math.max(0, c.penetrating - divert);
    let sipDrained = 0, sipPowerDrain = 0, sipGain = 0;
    if (areaRec.isSiphon && toHits > 0) {
      const sMode = areaRec.siphonMode || "normal";
      const powAvail = tokIsVehicle ? pow0 : Math.max(0, pow0 - divert);
      if (areaRec.siphonDrain === "power") {
        sipDrained = (sMode === "mimicry") ? 0 : Math.min(toHits * 2, powAvail);
        sipGain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? toHits * 2 : sipDrained);
        sipPowerDrain = sipDrained;
        toHits = 0;
      } else if (areaRec.siphonDrain === "hits") {
        sipDrained = (sMode === "mimicry") ? 0 : Math.min(toHits, hits0);
        sipGain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? toHits : sipDrained);
        toHits = sipDrained;
      } else {
        sipDrained = (sMode === "mimicry") ? 0 : toHits;
        sipGain = (sMode === "suppress") ? 0 : toHits;
        toHits = 0;
      }
    }
    const hits1 = Math.max(0, hits0 - toHits);
    const overflow = (tokIsVehicle || areaRec.isSiphon) ? 0 : Math.max(0, toHits - hits0);
    const pow1 = tokIsVehicle
      ? Math.max(0, pow0 - sipPowerDrain)
      : Math.max(0, pow0 - divert - overflow - sipPowerDrain);

    if (tokIsVehicle) {
      setVehicleHits(tok, tokData.charId, hits1);
      if (sipPowerDrain > 0) setVehiclePower(tok, tokData.charId, pow1);
    } else {
      setResource(tok, tokData.charId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(tok, tokData.charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
      if (hits0 - hits1 > 0) consumeSiphonPool(tokData.charId, "hits", hits0 - hits1);
      if (pow0 - pow1 > 0) consumeSiphonPool(tokData.charId, "power", pow0 - pow1);
    }

    const hasPainResistance = tokIsVehicle ? true : (num(getAttr(tokData.charId, "willpower_pain_resistance"), 0) === 1);
    const unconscious = !tokIsVehicle && !hasPainResistance && (toHits > Math.floor(hits0 / 2)) && hits0 > 0;
    const incapacitated = (hits1 === 0);
    let statusNote = "";
    if (incapacitated) {
      statusNote = " <b>INCAPACITATED!</b>";
      tok.set("status_dead", true);
      if (!tokIsVehicle) statusNote += startBleed(tokId, tokData.charId);
    } else if (unconscious) {
      statusNote = " <b>UNCONSCIOUS!</b>";
      tok.set("status_sleepy", true);
    }

    if (sipGain > 0 && areaRec.rowId) {
      const gainHtml = applySiphonGain(areaRec.atkCharId, areaRec.rowId, areaRec.siphonDrain, areaRec.siphonBC, areaRec.siphonCat, sipGain, areaRec.pageId);
      if (gainHtml) {
        const atkChar = getObj("character", areaRec.atkCharId);
        chToChar("MP", `<div style="background:#16213e; border:2px solid #8040c0; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b style="color:#c88fff;">${esc(atkChar ? atkChar.get("name") : "Attacker")}</b> \u2014 ${esc(areaRec.atkName || "Siphon")}${gainHtml}</div>`, areaRec.atkCharId);
      }
    }

    const negProt = c.effectiveProt < 0;
    const protStr = negProt ? `+${-c.effectiveProt} <span style="color:#e67e22;">(vulnerable)</span>` : `-${c.effectiveProt} prot`;
    let line = `<br/><span style="color:#ff6b6b;">\u2717 <b>${esc(tokData.name)}</b>: ${c.raw}${protStr}`;
    if (c.hasInvuln) line += ` [\u00d7\u00bc]`;
    if (c.hasAdapt) line += c.isOtherType ? ` [IMMUNE]` : ` [\u00d7\u00bd]`;
    if (divert > 0) line += ` [RW ${divert}]`;
    if (areaRec.isSiphon) {
      const sU = areaRec.siphonDrain === "power" ? "Power" : (areaRec.siphonDrain === "hits" ? "Hits" : "CPs");
      line += ` = <span style="color:#c88fff;">siphons ${sipDrained} ${sU}</span>`;
      if (areaRec.siphonDrain === "hits") line += ` \u2192 Hits: ${hits0}\u2192${hits1}${statusNote}`;
      else if (areaRec.siphonDrain === "power") line += ` \u2192 Pow: ${pow0}\u2192${pow1}`;
      line += `</span>`;
    } else {
      line += ` = ${c.penetrating} pen${divert > 0 ? ` (RW\u2192${toHits})` : ""} \u2192 Hits: ${hits0}\u2192${hits1}${statusNote}</span>`;
    }
    return line;
  }

  // Remove marker and record when every target is resolved
  function finalizeAreaIfDone(rollId) {
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return;
    const done = Object.values(areaRec.tokens).every(t => t.applied || t.escaped === true);
    if (done) {
      removeAreaMarker(areaRec);
      delete state.MP_Engine.pendingArea[rollId];
      ch("MP", `/w gm <b>MP:</b> Area effect fully resolved.`);
    }
  }

  // Apply damage to all tokens that failed to escape.
  // Conscious characters with roll-with capacity (4.8.3) get a per-target
  // choice first; everyone else resolves immediately.
  function cmdAreaDamageAll(msg, args) {
    const rollId = args.id;
    
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `/w gm <b>MP:</b> Area effect expired or not found.`);
    
    let html = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; max-width:280px; color:#eee; overflow:hidden;">`;
    const isSenseArea = num(areaRec.senseLoss, 0) > 0;
    html += `<div style="background:#e67e22; padding:6px 10px; font-size:14px; font-weight:bold; color:#fff;">${isSenseArea ? "AREA FLASH RESULTS" : "AREA DAMAGE RESULTS"}</div>`;
    html += `<div style="padding:6px 10px;">`;
    if (isSenseArea) {
      html += `${esc(areaRec.saveBC || "EN")} save or lose <b style="color:#fff;">${areaRec.senseLoss}</b> vision level(s)`;
    } else {
      html += `<b style="color:#fff;">${areaRec.damage}</b> ${esc(areaRec.damageType)}`;
    }
    
    let deferred = 0;
    Object.keys(areaRec.tokens).forEach(tokId => {
      const tokData = areaRec.tokens[tokId];
      if (tokData.applied) return;
      
      if (tokData.escaped === true) {
        tokData.applied = true;
        html += `<br/><span style="color:#27ae60;">\u2713 <b>${esc(tokData.name)}</b> escaped${tokData.shieldBlocked ? " (shield)" : ""}${tokData.prone ? " (prone)" : ""}</span>`;
        return;
      }
      
      if (tokData.escaped === null) {
        tokData.escaped = false;
        html += `<br/><span style="color:#e67e22;">\u26a0 <b>${esc(tokData.name)}</b> no response - auto-fail</span>`;
      }
      
      const tok = getObj("graphic", tokId);
      const char = getObj("character", tokData.charId);
      if (!tok || !char) {
        tokData.applied = true;
        html += `<br/><span style="color:#ff6b6b;">\u2717 <b>${esc(tokData.name)}</b> - token missing</span>`;
        return;
      }
      
      // 4.8.3: conscious, aware characters may roll with area damage
      const c = computeAreaPen(areaRec, tokData);
      const maxDivert = areaMaxDivert(tokData, tok);
      const koFlag = tok.get("status_sleepy") === true || tok.get("status_dead") === true;
      if (c.penetrating > 0 && maxDivert > 0 && !koFlag) {
        tokData.rwPending = true;
        deferred++;
        const rwBtns = `${btn(`Take Full (${c.penetrating})`, `!mp arearw --id ${rollId} --target ${tokId} --amt 0`)} ` +
          `${btn(`Roll-With Max (${Math.min(maxDivert, c.penetrating)})`, `!mp arearw --id ${rollId} --target ${tokId} --amt ${maxDivert}`)} ` +
          `${btn(`RW Custom`, `!mp arearw --id ${rollId} --target ${tokId} --amt ?{Divert to Power|0}`)}`;
        if (tokData.controller !== "gm" && tokData.controller !== "all") {
          chToChar("MP", `<b>AREA DAMAGE vs ${esc(tokData.name)}</b> \u2014 ${c.penetrating} penetrating (roll-with up to ${maxDivert})<br/>${rwBtns}`, tokData.charId);
          html += `<br/><span style="color:#f1c40f;">\u23f3 <b>${esc(tokData.name)}</b>: ${c.penetrating} pen \u2014 roll-with offered to player</span>`;
        } else {
          html += `<br/><span style="color:#f1c40f;">\u23f3 <b>${esc(tokData.name)}</b> (NPC): ${c.penetrating} pen</span><br/>${rwBtns}`;
        }
        return;
      }
      
      html += resolveAreaTarget(areaRec, tokId, 0);
    });
    
    if (deferred > 0) {
      html += `<br/><br/>${btnDanger(`Apply Rest (No RW)`, `!mp arearwrest --id ${rollId}`)}`;
      html += `</div></div>`;
      areaRec.timestamp = Date.now();
      if (CFG.GM_ONLY_BUTTONS) {
        chToChar("MP", html, areaRec.atkCharId);
      } else {
        ch("MP", html);
      }
      return;
    }
    
    html += `</div></div>`;
    if (CFG.GM_ONLY_BUTTONS) {
      chToChar("MP", html, areaRec.atkCharId);
    } else {
      ch("MP", html);
    }
    
    // Clean up
    removeAreaMarker(areaRec);
    delete state.MP_Engine.pendingArea[rollId];
  }

  // Resolve one deferred area target with the chosen roll-with amount
  function cmdAreaRW(msg, args) {
    const rollId = args.id;
    const tokId = args.target;
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `${wt(msg)}<b>MP:</b> Area effect expired or not found.`);
    const tokData = areaRec.tokens[tokId];
    if (!tokData) return ch("MP", `/w gm <b>MP:</b> Token not in area effect.`);
    if (tokData.applied) return ch("MP", `/w gm <b>MP:</b> ${esc(tokData.name)} already resolved.`);
    
    const line = resolveAreaTarget(areaRec, tokId, Math.max(0, num(args.amt, 0)));
    const resultHtml = `<div style="background:#16213e; border:2px solid #e67e22; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b>AREA DAMAGE</b>${line}</div>`;
    chCombat("MP", resultHtml, tokData.charId);
    finalizeAreaIfDone(rollId);
  }

  // GM: resolve all remaining deferred targets with no roll-with
  function cmdAreaRWRest(msg, args) {
    const rollId = args.id;
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return ch("MP", `/w gm <b>MP:</b> Area effect expired or not found.`);
    
    let html = `<div style="background:#16213e; border:2px solid #e67e22; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b>AREA DAMAGE</b> (no roll-with)`;
    let any = 0;
    Object.keys(areaRec.tokens).forEach(tokId => {
      const tokData = areaRec.tokens[tokId];
      if (tokData.applied || tokData.escaped === true) { tokData.applied = true; return; }
      html += resolveAreaTarget(areaRec, tokId, 0);
      any++;
    });
    html += `</div>`;
    if (!any) return ch("MP", `/w gm <b>MP:</b> Nothing left to resolve.`);
    if (CFG.GM_ONLY_BUTTONS) {
      chToChar("MP", html, areaRec.atkCharId);
    } else {
      ch("MP", html);
    }
    finalizeAreaIfDone(rollId);
  }

  // Check if all tokens in area have resolved their escapes
  function checkAreaResolved(rollId) {
    const areaRec = state.MP_Engine.pendingArea[rollId];
    if (!areaRec) return;
    
    const allResolved = Object.values(areaRec.tokens).every(t => t.escaped !== null);
    if (allResolved) {
      const doneLabel = (num(areaRec.senseLoss, 0) > 0) ? "Resolve All Saves" : "Apply All Damage";
      const resolvedHtml = `<div style="background:#16213e; border:2px solid #3498db; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">All escapes resolved. ${btnDanger(doneLabel, `!mp areadamageall --id ${rollId}`)}</div>`;
      if (CFG.GM_ONLY_BUTTONS) {
        chToChar("MP", resolvedHtml, areaRec.atkCharId);
      } else {
        ch("MP", resolvedHtml);
      }
    }
  }

  // -------------------------
  // SIPHON (drain / transfer / dissipation)
  // -------------------------

  // Apply siphoned points to the attacker. Returns HTML for the attacker whisper.
  // gain is in drained-pool units (Hits, Power, or CPs/BC pts for ledger types).
  function applySiphonGain(atkCharId, rowId, siphonDrain, siphonBC, siphonCat, gain, pageId) {
    if (gain <= 0) return "";
    const pfx = `repeating_attacks_${rowId}_`;
    const pool0 = getAttrNum(atkCharId, pfx + "attack_siphon_pool", 0);
    const cap = getAttrNum(atkCharId, pfx + "attack_siphon_cap", 0);
    const replenish = (getAttr(atkCharId, pfx + "attack_siphon_replenish") === "1");
    const overload = getAttr(atkCharId, pfx + "attack_siphon_overload") || "";
    const unitLabel = siphonDrain === "power" ? "Power" : (siphonDrain === "hits" ? "Hits" : (siphonDrain === "bc" ? `${siphonBC || "BC"} pts` : `${siphonCat || "Ability"} CPs`));

    const allowed = cap > 0 ? Math.max(0, cap - pool0) : gain;
    const kept = Math.min(gain, allowed);
    const excess = gain - kept;

    let html = "";
    const isLedger = (siphonDrain === "ability" || siphonDrain === "bc");
    const atkIsVeh = isVehicleMode(atkCharId);
    const atkTok = findObjs({ _type: "graphic", represents: atkCharId, _pageid: pageId })[0]
      || findObjs({ _type: "graphic", represents: atkCharId })[0];

    if (isLedger || atkIsVeh) {
      const pool1 = pool0 + kept;
      setAttr(atkCharId, pfx + "attack_siphon_pool", pool1);
      registerSiphonPool(atkCharId, rowId, siphonDrain, state.MP_Engine.gameClock.ms + 3600000);
      html += `<br/><span style="color:#c88fff;">Siphons <b>${kept}</b> ${esc(unitLabel)} (pool ${pool1}${cap > 0 ? `/${cap}` : ""}) — apply to a Siphoned (S) row. Dissipates in 1 game hour.</span>`;
    } else {
      const barProp = siphonDrain === "power" ? CFG.POWER_BAR : CFG.HITS_BAR;
      const attrName = siphonDrain === "power" ? CFG.POWER_ATTR : CFG.HITS_ATTR;
      const maxAttr = siphonDrain === "power" ? CFG.POWER_MAX_ATTR : CFG.HITS_MAX_ATTR;
      const cur = getResource(atkTok, atkCharId, barProp, attrName);
      if (replenish) {
        const maxVal = getAttrNum(atkCharId, maxAttr, 0);
        const newVal = maxVal > 0 ? Math.min(maxVal, cur + kept) : cur + kept;
        setResource(atkTok, atkCharId, barProp, attrName, newVal);
        html += `<br/><span style="color:#2ecc71;">Replenishes <b>${newVal - cur}</b> ${esc(unitLabel)} (${cur}→${newVal}). No dissipation.</span>`;
        return html;
      }
      setResource(atkTok, atkCharId, barProp, attrName, cur + kept);
      const pool1 = pool0 + kept;
      setAttr(atkCharId, pfx + "attack_siphon_pool", pool1);
      registerSiphonPool(atkCharId, rowId, siphonDrain, state.MP_Engine.gameClock.ms + 3600000);
      html += `<br/><span style="color:#c88fff;">Gains <b>${kept}</b> ${esc(unitLabel)} (${cur}→${cur + kept}, pool ${pool1}${cap > 0 ? `/${cap}` : ""}). Dissipates in 1 game hour.</span>`;
    }

    if (excess > 0) {
      if (!overload) {
        html += `<br/><span style="color:#e67e22;">+${excess} over cap — lost.</span>`;
      } else {
        const wiped = wipeSiphonPool(atkCharId, rowId, siphonDrain);
        if (overload === "lose") {
          html += `<br/><span style="color:#ff6b6b; font-weight:bold;">OVERLOAD! All ${wiped} siphoned points lost.</span>`;
        } else if (overload === "damage") {
          html += `<br/><span style="color:#ff6b6b; font-weight:bold;">OVERLOAD! Takes ${wiped} damage (may roll with); all siphoned points lost.</span>`;
        } else if (overload === "explode") {
          let dia = Math.ceil(wiped / 5);
          if (dia % 2 === 0) dia += 1;
          html += `<br/><span style="color:#ff6b6b; font-weight:bold;">OVERLOAD! EXPLODES — ${wiped} damage to all within ${dia}" diameter (attacker may NOT roll with; others may). All siphoned points lost.</span>`;
        }
      }
    }
    return html;
  }

  function siphonKey(charId, rowId, resource) {
    return `${charId}_${rowId}_${resource}`;
  }

  function registerSiphonPool(charId, rowId, resource, expiry) {
    state.MP_Engine.siphonPools[siphonKey(charId, rowId, resource)] = {
      charId: charId, rowId: rowId, resource: resource, expiry: expiry
    };
  }

  // Remove all points of one pool from the bar (hits/power) and zero the ledger.
  // Returns the number of points wiped.
  function wipeSiphonPool(charId, rowId, resource) {
    const pfx = `repeating_attacks_${rowId}_`;
    const pool = getAttrNum(charId, pfx + "attack_siphon_pool", 0);
    if (pool > 0 && (resource === "hits" || resource === "power") && !isVehicleMode(charId)) {
      const barProp = resource === "power" ? CFG.POWER_BAR : CFG.HITS_BAR;
      const attrName = resource === "power" ? CFG.POWER_ATTR : CFG.HITS_ATTR;
      const tok = findObjs({ _type: "graphic", represents: charId })[0];
      const cur = getResource(tok, charId, barProp, attrName);
      setResource(tok, charId, barProp, attrName, Math.max(0, cur - pool));
    }
    setAttr(charId, pfx + "attack_siphon_pool", 0);
    delete state.MP_Engine.siphonPools[siphonKey(charId, rowId, resource)];
    return pool;
  }

  // Damage consumes siphoned points first: decrement this character's active
  // pools of the given resource by amount (bookkeeping only — the bar already
  // took the loss). Dissipation then removes only what remains.
  function consumeSiphonPool(charId, resource, amount) {
    if (amount <= 0) return;
    let remaining = amount;
    Object.keys(state.MP_Engine.siphonPools).forEach(k => {
      if (remaining <= 0) return;
      const rec = state.MP_Engine.siphonPools[k];
      if (rec.charId !== charId || rec.resource !== resource) return;
      const pfx = `repeating_attacks_${rec.rowId}_`;
      const pool = getAttrNum(charId, pfx + "attack_siphon_pool", 0);
      if (pool <= 0) { delete state.MP_Engine.siphonPools[k]; return; }
      const eat = Math.min(pool, remaining);
      remaining -= eat;
      const pool1 = pool - eat;
      setAttr(charId, pfx + "attack_siphon_pool", pool1);
      if (pool1 <= 0) delete state.MP_Engine.siphonPools[k];
    });
  }

  // Dissipation sweep (1 game hour after taken) — runs whenever the game clock moves
  function checkSiphonExpiry() {
    const now = state.MP_Engine.gameClock.ms;
    Object.keys(state.MP_Engine.siphonPools).forEach(k => {
      const rec = state.MP_Engine.siphonPools[k];
      if (rec.expiry > now) return;
      const char = getObj("character", rec.charId);
      const pfx = `repeating_attacks_${rec.rowId}_`;
      const pool = getAttrNum(rec.charId, pfx + "attack_siphon_pool", 0);
      const name = char ? char.get("name") : "Unknown";
      if (pool > 0 && (rec.resource === "hits" || rec.resource === "power") && !isVehicleMode(rec.charId)) {
        const barProp = rec.resource === "power" ? CFG.POWER_BAR : CFG.HITS_BAR;
        const attrName = rec.resource === "power" ? CFG.POWER_ATTR : CFG.HITS_ATTR;
        const tok = findObjs({ _type: "graphic", represents: rec.charId })[0];
        const cur = getResource(tok, rec.charId, barProp, attrName);
        const newVal = Math.max(0, cur - pool);
        setResource(tok, rec.charId, barProp, attrName, newVal);
        ch("MP", `/w gm <div style="background:#16213e; border:2px solid #8040c0; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b style="color:#c88fff;">${esc(name)}</b>: ${pool} siphoned ${rec.resource === "power" ? "Power" : "Hits"} dissipate (${cur}→${newVal}).</div>`);
      } else if (pool > 0) {
        ch("MP", `/w gm <div style="background:#16213e; border:2px solid #8040c0; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b style="color:#c88fff;">${esc(name)}</b>: ${pool} siphoned points dissipate — remove the Siphoned (S) row.</div>`);
      }
      setAttr(rec.charId, pfx + "attack_siphon_pool", 0);
      delete state.MP_Engine.siphonPools[k];
    });
  }

  // GM: post one sample decision card per button-color candidate, in real chat.
  // Buttons are inert spans styled identically to live btn()/btnDanger() output.
  function cmdButtonDemo(msg, args) {
    const variants = [
      ["A", "Steel blue (current)", "#3d5a80", "#fff", false],
      ["B", "Bright blue", "#3498db", "#fff", false],
      ["C", "Graphite", "#44475a", "#f8f8f2", false],
      ["D", "Teal", "#16a085", "#fff", false],
      ["E1", "Ghost bright green", "#50fa7b", "#50fa7b", true],
      ["E2", "Ghost soft mint", "#7bed9f", "#7bed9f", true],
      ["F", "V&V orange, dark text", "#f47b20", "#2c1500", false],
      ["G", "Burnt orange", "#b35c12", "#fff", false],
      ["H", "Ghost soft orange", "#f5a15a", "#f5a15a", true]
    ];
    const fake = (label, bg, fg, ghost) =>
      `<span style="background:${ghost ? "transparent" : bg}; color:${fg}; border:1px solid ${ghost ? bg : "#2a2a4a"}; border-radius:3px; padding:1px 8px; font-size:12px; font-weight:bold; display:inline-block; margin:2px 2px 0 0;">${label}</span>`;
    const danger = `<span style="background:#c0392b; color:#fff; border:1px solid #2a2a4a; border-radius:3px; padding:1px 8px; font-size:12px; font-weight:bold; display:inline-block; margin:2px 2px 0 0;">Apply</span>`;
    let out = "";
    variants.forEach(v => {
      out += `<div style="background:#16213e; border:2px solid #e67e22; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px; margin-top:6px;">`;
      out += `<b style="color:#f1c40f;">${v[0]}</b> <span style="color:#aab;">${esc(v[1])} ${esc(v[2])}</span><br/>`;
      out += fake("Roll-With Max", v[2], v[3], v[4]);
      out += fake("RW Custom", v[2], v[3], v[4]);
      out += fake("KB", v[2], v[3], v[4]);
      out += danger;
      out += `</div>`;
    });
    ch("MP", `/w gm <b>Button color candidates</b> (inert samples; reply with a letter):${out}`);
  }

  // GM command: !mp siphon list | clear --target <tokenId> | adjust --target <tokenId> --amt -N
  function cmdSiphon(msg, args) {
    const parts = msg.content.split(/\s+/);
    const action = (parts[2] || "list").toLowerCase();
    if (action === "list") {
      const keys = Object.keys(state.MP_Engine.siphonPools);
      if (keys.length === 0) return ch("MP", `/w gm <b>MP:</b> No active siphon pools.`);
      let out = `<b>Active siphon pools:</b>`;
      keys.forEach(k => {
        const rec = state.MP_Engine.siphonPools[k];
        const char = getObj("character", rec.charId);
        const pool = getAttrNum(rec.charId, `repeating_attacks_${rec.rowId}_attack_siphon_pool`, 0);
        const mins = Math.max(0, Math.ceil((rec.expiry - state.MP_Engine.gameClock.ms) / 60000));
        out += `<br/>• <b>${esc(char ? char.get("name") : rec.charId)}</b>: ${pool} ${esc(rec.resource)} (${mins} game min left)`;
      });
      return ch("MP", `/w gm ${out}`);
    }
    const tok = args.target ? getObj("graphic", args.target) : null;
    const charId = tok ? tok.get("represents") : (args.char || "");
    if (!charId) return ch("MP", `/w gm <b>MP:</b> !mp siphon ${action} needs --target <tokenId>.`);
    if (action === "clear") {
      let total = 0;
      Object.keys(state.MP_Engine.siphonPools).forEach(k => {
        const rec = state.MP_Engine.siphonPools[k];
        if (rec.charId !== charId) return;
        total += wipeSiphonPool(rec.charId, rec.rowId, rec.resource);
      });
      return ch("MP", `/w gm <b>MP:</b> Cleared ${total} siphoned points.`);
    }
    if (action === "expire") {
      let found = 0;
      Object.keys(state.MP_Engine.siphonPools).forEach(k => {
        const rec = state.MP_Engine.siphonPools[k];
        if (rec.charId !== charId) return;
        rec.expiry = 0;
        found++;
      });
      if (!found) return ch("MP", `/w gm <b>MP:</b> No active pools for that character.`);
      checkSiphonExpiry();
      return ch("MP", `/w gm <b>MP:</b> Forced dissipation on ${found} pool(s).`);
    }
    if (action === "adjust") {
      const amt = num(args.amt, 0);
      if (amt >= 0) return ch("MP", `/w gm <b>MP:</b> --amt must be negative (points spent outside the engine).`);
      consumeSiphonPool(charId, "hits", -amt);
      consumeSiphonPool(charId, "power", -amt);
      return ch("MP", `/w gm <b>MP:</b> Consumed ${-amt} points from active pools.`);
    }
    return ch("MP", `/w gm <b>MP:</b> Usage: !mp siphon list | clear --target &lt;tokenId&gt; | expire --target &lt;tokenId&gt; | adjust --target &lt;tokenId&gt; --amt -N`);
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
    const bcStats = absDefIsVeh
      ? { st: "vehicle_st", en: "vehicle_en", ag: "vehicle_ag", "in": "vehicle_in", cl: "vehicle_cl" }
      : { st: "strength", en: "endurance", ag: "agility", "in": "intelligence", cl: "cool" };
    
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
      const expiryTime = state.MP_Engine.gameClock.ms + (5 * 60 * 1000);  // 5 GAME minutes (verify vs Absorption RAW)
      
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
    let buttons = `<br/>${btn(`Reflect at Original Attacker`, `!mp reflecthit --id ${reflectRollId} --target original`)}`;
    buttons += ` ${btn(`Reflect at Target...`, `!mp reflecthit --id ${reflectRollId} --target &#64;{target|token_id}`)}`;
    
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
    html += `<br/><span style="color:#fff;">Raw: ${rec.damageTotal} ${prot < 0 ? `+ ${-prot} <span style="color:#e67e22;">(vulnerable)</span>` : `- ${prot} prot`}`;
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
        buttons = `${btnDanger(`Weapon Survives - Apply Damage`, `!mp afresume --id ${rollId}`)} `;
        buttons += `${btn(`Weapon Destroyed - No Damage`, `!mp afcancel --id ${rollId}`)}`;
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
        buttons += `${btnDanger(`Apply Counter`, `!mp afcounter --id ${afCounterId}`)} `;
        buttons += `${btn(`Counter + RW`, `!mp afcounter --id ${afCounterId} --rw ?{Roll-With amount|0}`)}`;
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
    html += `<br/><span style="color:#fff;">Raw: ${rec.damageTotal} ${prot < 0 ? `+ ${-prot} <span style="color:#e67e22;">(vulnerable)</span>` : `- ${prot} prot`}`;
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
    
    // Death Touch (p.53): penetrating damage may NOT be rolled with. Apply only.
    if (rec && rec.isDeathTouch && !defIsVeh) {
      buttons = `${btnDanger(`Apply (Death Touch)`, `!mp apply --id ${rollId} --mode noroll`)}`;
      return buttons;
    }
    
    if (defIsVeh) {
      // Vehicles: Apply only, no roll-with options
      if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
        buttons = `${btnDanger(`Apply (No Prot)`, `!mp apply --id ${rollId} --mode noprot`)}`;
      } else if (critType === CRIT_TYPES.SOLID_HIT) {
        buttons = `${btnDanger(`Apply (+3 Solid)`, `!mp apply --id ${rollId} --mode solid`)}`;
      } else {
        buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)}`;
      }
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && !hasProtectedBrain) {
      buttons = `${btnDanger(`Apply (Head Shot)`, `!mp apply --id ${rollId} --mode headshot`)} `;
      buttons += `${btn(`RW + Head Shot`, `!mp apply --id ${rollId} --mode headshot_rw --amt ?{Divert to Power|0}`)}`;
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && hasProtectedBrain) {
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`Roll-With Max`, `!mp apply --id ${rollId} --mode rollwithmax`)} `;
      buttons += `${btn(`Roll-With Custom`, `!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0}`)}`;
    } else if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
      buttons = `${btnDanger(`Apply (No Prot)`, `!mp apply --id ${rollId} --mode noprot`)} `;
      buttons += `${btn(`RW Max (No Prot)`, `!mp apply --id ${rollId} --mode noprot_rwmax`)} `;
      buttons += `${btn(`RW Custom (No Prot)`, `!mp apply --id ${rollId} --mode noprot_rw --amt ?{Divert to Power|0}`)}`;
    } else if (critType === CRIT_TYPES.SOLID_HIT) {
      buttons = `${btnDanger(`Apply (+3 Solid)`, `!mp apply --id ${rollId} --mode solid`)} `;
      buttons += `${btn(`RW Max (+3)`, `!mp apply --id ${rollId} --mode solid_rwmax`)} `;
      buttons += `${btn(`RW Custom (+3)`, `!mp apply --id ${rollId} --mode solid_rw --amt ?{Divert to Power|0}`)}`;
    } else if (critType === CRIT_TYPES.PRECISE_HIT) {
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`RW Max (½)`, `!mp apply --id ${rollId} --mode precise_rwmax`)} `;
      buttons += `${btn(`RW Custom (½)`, `!mp apply --id ${rollId} --mode precise_rw --amt ?{Divert to Power|0}`)}`;
    } else {
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`Roll-With Max`, `!mp apply --id ${rollId} --mode rollwithmax`)} `;
      buttons += `${btn(`Roll-With Custom`, `!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0}`)}`;
    }
    
    if (causesKB) {
      buttons += ` ${btn(`KB`, `!mp kb --id ${rollId}`)}`;
    }
    
    // Check for Absorption or Reflection
    if (rec && rec.defCharId && rec.protKey) {
      const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
      if (absRef) {
        if (absRef.mode === "absorption") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#9b59b6; font-weight:bold;">🔮 Absorption available${limitNote}</span>`;
          buttons += ` ${btn(`Absorb (¼ dmg, saved action)`, `!mp absorb --id ${rollId}`)}`;
        } else if (absRef.mode === "reflection") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#e67e22; font-weight:bold;">🔄 Reflection available${limitNote}</span>`;
          buttons += ` ${btn(`Reflect (¼ dmg, saved action)`, `!mp reflect --id ${rollId}`)}`;
        }
      }
    }
    
    if (!defIsVeh) {
      if (critType === CRIT_TYPES.LEG_SHOT || isLegShot) {
        buttons += `<br/>${btn(`Leg Shot Saves`, `!mp limbsave --id ${rollId} --limb leg`)}`;
      } else if (critType === CRIT_TYPES.ARM_SHOT || isArmShot) {
        buttons += `<br/>${btn(`Arm Shot Saves`, `!mp limbsave --id ${rollId} --limb arm`)}`;
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
        buttons += `${btn(`Projectile`, `!mp afield --id ${rollId} --type projectile`)} `;
        buttons += `${btn(`Non-Projectile`, `!mp afield --id ${rollId} --type nonproject`)} `;
        buttons += `${btn(`Melee Weapon`, `!mp afield --id ${rollId} --type melee`)} `;
        buttons += `${btn(`Unarmed/HTH`, `!mp afield --id ${rollId} --type unarmed`)}`;
        
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
    
    // Death Touch (p.53): penetrating damage may NOT be rolled with. Apply only.
    if (rec && rec.isDeathTouch && !defIsVeh) {
      buttons = `${btnDanger(`Apply (Death Touch)`, `!mp apply --id ${rollId} --mode noroll`)}`;
      return buttons;
    }
    
    if (defIsVeh) {
      // Vehicles: Apply only, no roll-with options
      if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
        buttons = `${btnDanger(`Apply (No Prot)`, `!mp apply --id ${rollId} --mode noprot`)}`;
      } else if (critType === CRIT_TYPES.SOLID_HIT) {
        buttons = `${btnDanger(`Apply (+3 Solid)`, `!mp apply --id ${rollId} --mode solid`)}`;
      } else {
        buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)}`;
      }
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && !hasProtectedBrain) {
      // Head shot: apply damage then double after prot/roll-with
      buttons = `${btnDanger(`Apply (Head Shot)`, `!mp apply --id ${rollId} --mode headshot`)} `;
      buttons += `${btn(`RW + Head Shot`, `!mp apply --id ${rollId} --mode headshot_rw --amt ?{Divert to Power|0}`)}`;
    } else if ((critType === CRIT_TYPES.HEAD_SHOT || isHeadShot) && hasProtectedBrain) {
      // Head shot negated by Protected Brain - show normal buttons
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`Roll-With Max`, `!mp apply --id ${rollId} --mode rollwithmax`)} `;
      buttons += `${btn(`Roll-With Custom`, `!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0}`)}`;
    } else if (isAvoidArmor || critType === CRIT_TYPES.AVOID_LIGHT_ARMOR || critType === CRIT_TYPES.AVOID_HEAVY_ARMOR) {
      // Avoid armor: ignore protection (crit OR deliberate called shot)
      buttons = `${btnDanger(`Apply (No Prot)`, `!mp apply --id ${rollId} --mode noprot`)} `;
      buttons += `${btn(`RW Max (No Prot)`, `!mp apply --id ${rollId} --mode noprot_rwmax`)} `;
      buttons += `${btn(`RW Custom (No Prot)`, `!mp apply --id ${rollId} --mode noprot_rw --amt ?{Divert to Power|0}`)}`;
    } else if (critType === CRIT_TYPES.SOLID_HIT) {
      // Solid hit: +3 damage
      buttons = `${btnDanger(`Apply (+3 Solid)`, `!mp apply --id ${rollId} --mode solid`)} `;
      buttons += `${btn(`RW Max (+3)`, `!mp apply --id ${rollId} --mode solid_rwmax`)} `;
      buttons += `${btn(`RW Custom (+3)`, `!mp apply --id ${rollId} --mode solid_rw --amt ?{Divert to Power|0}`)}`;
    } else if (critType === CRIT_TYPES.PRECISE_HIT) {
      // Precise hit: halved roll-with
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`RW Max (½)`, `!mp apply --id ${rollId} --mode precise_rwmax`)} `;
      buttons += `${btn(`RW Custom (½)`, `!mp apply --id ${rollId} --mode precise_rw --amt ?{Divert to Power|0}`)}`;
    } else {
      // Normal hit or other crit types
      buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)} `;
      buttons += `${btn(`Roll-With Max`, `!mp apply --id ${rollId} --mode rollwithmax`)} `;
      buttons += `${btn(`Roll-With Custom`, `!mp apply --id ${rollId} --mode rollwithcustom --amt ?{Divert to Power|0}`)}`;
    }
    
    if (causesKB) {
      buttons += ` ${btn(`KB`, `!mp kb --id ${rollId}`)}`;
    }
    
    // Check for Absorption or Reflection (requires saved action)
    if (rec && rec.defCharId && rec.protKey) {
      const absRef = getAbsorptionReflection(rec.defCharId, rec.protKey, rec.dmgSubtype);
      if (absRef) {
        if (absRef.mode === "absorption") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#9b59b6; font-weight:bold;">🔮 Absorption available${limitNote}</span>`;
          buttons += ` ${btn(`Absorb (¼ dmg, saved action)`, `!mp absorb --id ${rollId}`)}`;
        } else if (absRef.mode === "reflection") {
          const limitNote = absRef.limit > 0 ? ` (limit ${absRef.limit})` : "";
          buttons += `<br/><span style="color:#e67e22; font-weight:bold;">🔄 Reflection available${limitNote}</span>`;
          buttons += ` ${btn(`Reflect (¼ dmg, saved action)`, `!mp reflect --id ${rollId}`)}`;
        }
      }
    }
    
    // Add limb shot saves if applicable (crit OR deliberate called shot) - not for vehicles
    if (!defIsVeh) {
      if (critType === CRIT_TYPES.LEG_SHOT || isLegShot) {
        buttons += `<br/>${btn(`Leg Shot Saves`, `!mp limbsave --id ${rollId} --limb leg`)}`;
      } else if (critType === CRIT_TYPES.ARM_SHOT || isArmShot) {
        buttons += `<br/>${btn(`Arm Shot Saves`, `!mp limbsave --id ${rollId} --limb arm`)}`;
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
    
    let buttons = `${btn(`Make Save${modLabel}`, `!mp save --id ${rollId} --critmod ${critMod} --pushmod ${pushMod}`)} `;
    if (!saveDefIsVeh) {
      buttons += `${btn(`Save + Roll-With${modLabel}`, `!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod ${critMod} --pushmod ${pushMod}`)}`;
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
    
    return `${btnDanger(`Apply Snare${bonusLabel}`, `!mp snare --id ${rollId} --bonus ${totalBonus}`)}`;
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
    // Vehicle defenders store their FF as a repeating_vehprotection row named "Force Field".
    const ffData = defIsVehicle
      ? getVehicleForceFieldData(defChar.id, rec.defTokenId)
      : getForceFieldData(defChar.id, rec.defTokenId);
    let ffActive = false;
    let ffProt = 0;
    let ffDeflected = 0;
    let ffCollapsed = false;
    let ffOverflow = 0;
    let ffGasBlocked = false;
    let ffGravityBypassed = false;
    let afterFF = raw;  // Damage after FF, before armor
    // Armor Piercing: original declared value, amount spent on FF, and leftover for armor.
    // RAW: AP ignores N points of protection vs its damage type -- a Force Field IS protection.
    const origAP = rec.atkAP;
    let apVsFF = 0;
    let apAfterFF = origAP;
    
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

        // Armor Piercing reduces the Force Field's protection too, leftover carries to armor.
        let effFFProt = ffProt;
        if (origAP === Infinity) { apVsFF = ffProt; effFFProt = 0; apAfterFF = Infinity; }
        else if (origAP > 0) { apVsFF = Math.min(origAP, ffProt); effFFProt = Math.max(0, ffProt - origAP); apAfterFF = origAP - apVsFF; }

        // FF protection (after AP) subtracts from raw damage
        const ffBlocked = Math.min(raw, effFFProt);  // How much FF would block
        const capacity = Math.max(0, ffData.threshold - ffData.accum);
        // MP rule: a hit the field completely stops (within remaining capacity) is
        // ignored and does NOT count toward the deflection total.
        const completelyBlocked = (ffBlocked >= raw) && (raw <= capacity);

        if (completelyBlocked) {
          ffDeflected = raw;
          afterFF = 0;
          updateFFAura(defTok, ffData.threshold > 0 ? capacity / ffData.threshold : 0);
        } else {
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
    
    // Attack's Armor Piercing: original declared value (display) and amount remaining after FF (armor calc)
    const rawAP = rec.atkAP;
    const apForArmor = apAfterFF;
    
    // Calculate effective AP after Hardened reduces it
    let effectiveAP = 0;
    let apUsedVsHardened = 0;
    if (apForArmor === Infinity) {
      effectiveAP = Infinity;
    } else if (apForArmor > 0) {
      apUsedVsHardened = Math.min(apForArmor, armorHardened);
      effectiveAP = Math.max(0, apForArmor - armorHardened);
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
    const vuln = getVulnerabilityMods(defChar.id, damageType, rec.dmgSubtype);
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

    // Death Touch (p.53): victims may NOT roll with any penetrating damage,
    // even if a roll-with mode is retyped manually.
    const isDeathTouch = !!rec.isDeathTouch;

    let divert = 0;
    if (!defIsVehicle && !isDeathTouch) {
      if (mode.includes("rwmax") || mode === "rollwithmax") {
        divert = Math.min(maxDivert, penetrating);
      } else if (mode.includes("rw") || mode === "rollwithcustom") {
        const want = num(args.amt, 0);
        divert = Math.min(maxDivert, penetrating, Math.max(0, want));
      }
    }

    // Damage to Hits after roll-with
    let toHits = Math.max(0, penetrating - divert);
    
    // --- SIPHON ROUTING (4.7: drain capped at what the pool holds, no 4.8.4 overflow) ---
    let siphonDrained = 0;      // points removed from the drained pool (in that pool's units)
    let siphonGain = 0;         // points the attacker stands to gain (same units)
    let siphonPowerDrain = 0;   // Power drained by a power-type siphon
    const isSiphon = !!rec.isSiphon;
    if (isSiphon && toHits > 0) {
      const pts = toHits;
      const sMode = rec.siphonMode || "normal";
      if (rec.siphonDrain === "power") {
        const powAvail = defIsVehicle ? pow0 : Math.max(0, pow0 - divert);
        siphonDrained = (sMode === "mimicry") ? 0 : Math.min(pts * 2, powAvail);
        siphonGain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? pts * 2 : siphonDrained);
        siphonPowerDrain = siphonDrained;
        toHits = 0;
      } else if (rec.siphonDrain === "hits") {
        siphonDrained = (sMode === "mimicry") ? 0 : Math.min(pts, hits0);
        siphonGain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? pts : siphonDrained);
        toHits = siphonDrained;
      } else {
        siphonDrained = (sMode === "mimicry") ? 0 : pts;
        siphonGain = (sMode === "suppress") ? 0 : pts;
        toHits = 0;
      }
    }
    
    // Store pre-doubled value for knockback (MP 4.14.2.1: KB is NOT doubled on head shots)
    const hitsForKB = toHits;
    
    // Head Shot: DOUBLE Hits after protection and roll-with (not applicable to vehicles or siphon drain)
    const isHeadShot = mode.includes("headshot");
    const hasProtectedBrain = defIsVehicle ? false : (num(getAttr(defChar.id, "willpower_protected_brain"), 0) === 1);
    if (isHeadShot && !hasProtectedBrain && !defIsVehicle && !isSiphon) {
      toHits = toHits * 2;
    }

    // Apply to Hits; overflow spills to Power for characters (4.8.4)
    // Vehicles: damage to Hits only, no overflow to Power
    // Siphon: no overflow (hits drain is pre-capped at hits0; power drain routed directly)
    const hitsAfterDmg = Math.max(0, hits0 - toHits);
    const overflow = (defIsVehicle || isSiphon) ? 0 : Math.max(0, toHits - hits0);

    // Power reduction: diverted amount + overflow + power siphon drain (vehicles: divert/overflow do not apply)
    const pow1 = defIsVehicle
      ? Math.max(0, pow0 - siphonPowerDrain)
      : Math.max(0, pow0 - divert - overflow - siphonPowerDrain);
    const hits1 = hitsAfterDmg;

    if (defIsVehicle) {
      setVehicleHits(defTok, defChar.id, hits1);
      if (siphonPowerDrain > 0) setVehiclePower(defTok, defChar.id, pow1);
    } else {
      setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    }

    // Damage consumes siphoned points first (Kurt ruling 2026-07-05): decrement the
    // defender's own active siphon pools so dissipation removes only what remains.
    if (!defIsVehicle) {
      if (hits0 - hits1 > 0) consumeSiphonPool(defChar.id, "hits", hits0 - hits1);
      if (pow0 - pow1 > 0) consumeSiphonPool(defChar.id, "power", pow0 - pow1);
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
        statusLine += startBleed(rec.defTokenId, defChar.id);
        // Death Touch (p.53): reduced to 0 Hits → EN save or die instantly.
        // A pass leaves the normal 0-Hits dying/bleeding state (already set above).
        if (rec.isDeathTouch) {
          statusLine += `<div style="background:#2a0a0a; border:1px solid #8b0000; border-radius:6px; padding:4px 8px; margin-top:3px; font-family:Arial,sans-serif; font-size:11px; color:#ff9999; max-width:280px;">💀 <b>Death Touch</b> — reduced to 0 Hits. Make an EN save or die instantly: ${btn(`EN Save vs Death`, `!mp dtsave --target ${rec.defTokenId}`)}</div>`;
        }
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
    if (ffActive && (ffDeflected > 0 || apVsFF > 0)) {
      protHover += `&#10;Force Field: ${ffProt} (deflected ${ffDeflected})`;
      if (apVsFF > 0) protHover += `&#10;AP vs FF: -${apVsFF === Infinity ? 'ALL' : apVsFF}`;
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
          `<br/>${btn(`Reinforce (saved action, PR=${ffData.pr})`, `!mp ffreinforce --id ${rollId}`)}` +
          ` ${btn(`Renew Later (PR=${ffData.pr})`, `!mp ffreset --target ${rec.defTokenId} --row ${ffData.rowId}`)}` +
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
    } else if (effectiveProt < 0) {
      dmgLine += ` + <span style="color:#e67e22;" title="Negative protection: target is vulnerable to this damage type">${-Math.floor(effectiveProt)} (vulnerable)</span>`;
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

    // --- Siphon result line + attacker transfer ---
    let siphonLine = "";
    if (isSiphon) {
      const sUnit = rec.siphonDrain === "power" ? "Power" : (rec.siphonDrain === "hits" ? "Hits" : (rec.siphonDrain === "bc" ? `${rec.siphonBC || "BC"} pts` : `${rec.siphonCat || "Ability"} CPs`));
      if (rec.siphonMode === "mimicry") {
        siphonLine = `<div style="color:#c88fff; font-size:12px; margin-top:2px;">SIPHON (Mimicry): no drain — attacker copies ${siphonGain} ${esc(sUnit)}</div>`;
      } else if (rec.siphonDrain === "ability" || rec.siphonDrain === "bc") {
        siphonLine = `<div style="color:#c88fff; font-size:12px; margin-top:2px;">SIPHON: drains <b>${siphonDrained}</b> ${esc(sUnit)} — mark on victim's sheet${rec.siphonMode === "suppress" ? " (Suppress: no gain)" : ""}</div>`;
      } else {
        siphonLine = `<div style="color:#c88fff; font-size:12px; margin-top:2px;">SIPHON: drains <b>${siphonDrained}</b> ${esc(sUnit)}${rec.siphonMode === "suppress" ? " (Suppress: no gain)" : ""}</div>`;
      }
      if (siphonGain > 0) {
        const gainHtml = applySiphonGain(rec.atkCharId, rec.rowId, rec.siphonDrain, rec.siphonBC, rec.siphonCat, siphonGain, defTok.get("_pageid"));
        if (gainHtml) {
          const atkChar = getObj("character", rec.atkCharId);
          chToChar("MP", `<div style="background:#16213e; border:2px solid #8040c0; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b style="color:#c88fff;">${esc(atkChar ? atkChar.get("name") : "Attacker")}</b> — ${esc(rec.atkName || "Siphon")}${gainHtml}</div>`, rec.atkCharId);
        }
      }
    }

    // --- Full result card (GM + defender): includes Hits/Power stats ---
    const msgLine =
      `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:8px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">` +
      `<div style="font-weight:bold; font-size:15px; color:#fff; margin-bottom:6px;">${esc(rec.defName)}${effectNotes}</div>` +
      `<div style="color:#ccc; margin-bottom:4px; font-size:13px;">${dmgLine}</div>` +
      ffLine +
      siphonLine +
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
      (rec.condIdx !== undefined ? `<br/>${btn(`Try Again`, `!mp recover --target ${rec.defTokenId} --idx ${rec.condIdx}`)}` : "") +
      `</div>`;

    // Undo: register the pre-mutation snapshot and append a button to the card.
    const applyUndoId = "apply_" + rollId + "_" + randomInteger(999999);
    registerUndo(applyUndoId, esc(rec.defName) + " — " + esc(rec.atkName || "attack") + " damage", [undoSnap], null);

    // Damage result to GM + defender only (attacker doesn't see target stats)
    // v2.93.0: Can't Feel Pain - IN save to notice damage from a surprise attack
    let painNote = "";
    if (toHits > 0 && getWeaknessFlags(rec.defCharId).nopain) {
      painNote = `<div style="background:#1a1a2e; border:1px solid #6b5a1e; border-radius:6px; padding:4px 8px; margin-top:3px; font-family:Arial,sans-serif; font-size:11px; color:#f4d03f; max-width:280px;">🩹 Can't Feel Pain — if this was a SURPRISE attack, roll IN to notice the damage: ${btn(`IN Save`, `!mp sv IN`)}</div>`;
    }
    chToChar("MP", msgLine + painNote + undoButton(applyUndoId), rec.defCharId);
    
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
      msg_out += `<br/>${btn(`AG Save vs Knockdown`, `!mp kbsave --target ${rec.defTokenId} --penalty ${kb}`)}`;
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

  // Transmutation (p.77): non-character targets resist with physical weight.
  // Fill from the basic characteristics table (2.1.7.2): Carry (Pounds) column
  // read across to the Saves column. Ascending by maxPounds; last entry wins.
  // [carryPounds, saveNumber] from the Basic Characteristic Table (2.1.7.2).
  // Objects find the CLOSEST match for their weight in the Carry column and
  // read across to Saves.
  const WEIGHT_SAVE_TABLE = [
    [8, 6], [10, 7], [12, 7], [15, 8], [30, 9], [60, 10],
    [120, 11], [240, 11], [480, 12], [960, 12],
    [1920, 13], [3840, 13], [7680, 14], [15360, 14],
    [30720, 15], [61440, 15], [122880, 16], [245760, 16],
    [491520, 17], [983040, 17], [1966080, 18], [3932160, 18],
    [7864320, 19], [15728640, 19], [31457280, 20], [62914560, 20],
    [125829120, 21], [251658240, 21], [503316480, 22], [1006632960, 22],
    [2013265920, 23], [4026531840, 23], [8053063680, 24], [16106127360, 24],
    [32212254720, 25]
  ];
  function weightToBaseSave(lbs) {
    const w = num(lbs, 0);
    if (w <= 0 || !WEIGHT_SAVE_TABLE.length) return null;
    let best = WEIGHT_SAVE_TABLE[0];
    let bestDist = Math.abs(w - best[0]);
    for (let i = 1; i < WEIGHT_SAVE_TABLE.length; i++) {
      const d = Math.abs(w - WEIGHT_SAVE_TABLE[i][0]);
      if (d < bestDist) { best = WEIGHT_SAVE_TABLE[i]; bestDist = d; }
    }
    return best[1];
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

    // Object/non-character targets (Transmutation Alternate Targets): resist by
    // physical weight. --weight <lbs> maps through WEIGHT_SAVE_TABLE; --basesave
    // <n> overrides directly.
    const weightSave = weightToBaseSave(args.weight);
    const manualBase = num(args.basesave, 0);
    let baseSaveNote = "";

    // For vehicles, use vehicle EN save attr if save BC is EN
    let baseSave = saveDefIsVeh
      ? getAttrNum(defChar.id, "vehicle_" + saveAttr, 10)
      : getAttrNum(defChar.id, saveAttr, 10);
    if (manualBase > 0) {
      baseSave = manualBase;
      baseSaveNote = ` <span style="font-size:11px;color:#aaa;">(manual base)</span>`;
    } else if (weightSave !== null) {
      baseSave = weightSave;
      baseSaveNote = ` <span style="font-size:11px;color:#aaa;">(by weight: ${esc(String(args.weight))} lb)</span>`;
    }

    // Protection adds to save (makes it easier) per 4.9
    // EXCEPTION: Damaging Poison - protection only applies to damage, NOT to save TN
    // Also check for invulnerability (+8 bonus) and adaptation (+5 bonus)
    // Transmutation: Other damage type, but ONLY dedicated Invulnerability vs.
    // Transmutation defends. Blanket Other protection/Adaptation do nothing.
    const isTransmutation = String(rec.dmgSubtype || "").trim().toLowerCase() === "transmutation";

    const protData = saveDefIsVeh
      ? getVehicleProtection(defChar.id, rec.protKey)
      : sumProtectionWithHardened(defChar.id, rec.protKey, rec.dmgSubtype, isTransmutation);
    const prot = isTransmutation ? 0 : protData.prot;
    const invulnBonus = protData.invuln ? 8 : 0;
    const adaptBonus = (!isTransmutation && protData.adapt) ? 5 : 0;
    
    // Determine if this is Damaging Poison (protection applies to damage only, not save)
    // Check early so we know whether to apply protection to save TN
    const atkNameLower = String(rec.atkName || "").toLowerCase();
    const hasPoisonInName = atkNameLower.includes("poison") || atkNameLower.includes("venom");
    const rawCondDamage = rec.saveDamage || rec.damageTotal || 0;
    const isDamagingPoison = hasPoisonInName && rawCondDamage > 0 && !atkNameLower.includes("paralytic");
    
    // For Damaging Poison: protection does NOT apply to save TN
    // For Paralytic Poison/other saves: protection DOES apply to save TN
    // v2.89.1: Sense-loss (Flash) attacks have no Damage Type and "can only
    // be mitigated by the Protected Sense Modifier" — no protection to save.
    const isSenseLossAttack = num(rec.senseLoss, 0) > 0;
    const protForSave = (isDamagingPoison || isSenseLossAttack || isTransmutation) ? 0 : Math.floor(prot);
    const invulnForSave = (isDamagingPoison || isSenseLossAttack) ? 0 : invulnBonus;
    const adaptForSave = (isDamagingPoison || isSenseLossAttack || isTransmutation) ? 0 : adaptBonus;

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
    const vulnData = (!rec.noDamageType && rec.dmgTypeStr) ? getVulnerabilityMods(defChar.id, rec.dmgTypeStr, rec.dmgSubtype) : { protMod: 0, dmgMod: 0, notes: [] };
    const vulnSaveMod = (vulnData && vulnData.dmgMod) ? -Math.abs(num(vulnData.dmgMod, 0)) : 0;


    // Initial save TN = base + init mod + protection (if not damaging poison) + invuln + adapt + roll-with + crit mod + push mod + vulnerability
    // v2.93.0: Discomfort - -3 on all saves
    const saveDiscomfort = hasDiscomfort(rec.defTokenId) ? -3 : 0;
    const tn = baseSave + num(rec.saveMod, 0) + protForSave + invulnForSave + adaptForSave + rwPaid + critMod + pushMod + vulnSaveMod + saveDiscomfort;

    const d20 = randomInteger(20);
    const isFumble = (d20 === CFG.FUMBLE_FAIL_NAT);
    const pass = !isFumble && (d20 <= tn);

    // Recovery TN per 4.9: "same target number as their initial save but with an additional difficulty modifier"
    // Base + saveMod + recMod + protection + invuln + adapt + vulnerability (no roll-with/crit/push - those were for initial only)
    const recTN = baseSave + num(rec.saveMod, 0) + num(rec.recMod, 0) + protForSave + invulnForSave + adaptForSave + vulnSaveMod + saveDiscomfort;
    const recTime = rec.recTime || "1 round";

    let statusLine = "";
    let conditionApplied = false;
    let damageButtons = "";  // For Damaging Poison immediate damage
    
    if (!pass) {
      // Determine condition type and marker
      // We already calculated isDamagingPoison and rawCondDamage above
      // v2.89.1: sense-loss attacks (Flash) always produce a dazzled condition
      const condType = isSenseLossAttack ? "dazzled"
        : (isDamagingPoison ? "damaging_poison" : inferConditionType(rec.atkName, rec.saveBC, rec.dmgTypeStr, rawCondDamage));
      const marker = CONDITION_MARKERS[condType] || CONDITION_MARKERS.generic;
      
      // Check for fumble = permanent effect (Flash: fumbled initial save =
      // permanently blinded). Laser DAZZLE shots have no permanence rule.
      const isPermanent = isFumble && !rec.isDazzleShot && (isSenseLossAttack || atkNameLower.includes("flash"));
      
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
        // v2.89.1: levels of visible-light sense lost — from the attack row's
        // Sense Loss field (Flash 1/2/3); legacy save attacks default to 2.
        senseLevels: isSenseLossAttack ? num(rec.senseLoss, 0)
          : ((condType === "dazzled" || condType === "blinded") ? 2 : 0),
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
      if (isSenseLossAttack) {
        const visNow = visionLossInfo(rec.defTokenId, rec.defCharId);
        statusLine += `<br/><span style="font-size:11px;">Loses <b>${num(rec.senseLoss, 0)}</b> level(s) of vision — now <b style="color:${visNow.effective === 0 ? '#ff6b6b' : '#f4d03f'};">${visNow.effLabel}</b></span>`;
      }
      
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
          damageButtons = `<br/>${btnDanger(`Take Full Damage`, `!mp apply --id ${poisonRollId} --mode straight`)} `;
          damageButtons += `${btn(`Roll-With Max`, `!mp apply --id ${poisonRollId} --mode rollwithmax`)} `;
          damageButtons += `${btn(`Roll-With Custom`, `!mp apply --id ${poisonRollId} --mode rollwithcustom --amt ?{Power to divert|0}`)}`;
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
        statusLine += `<br/>${btn(`Recovery Roll`, `!mp recover --target ${rec.defTokenId} --idx ${condIdx}`)}`;
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
      case "darkness": return "In Darkness field - vision dampened";
      case "glare": return "In Glare field - vision overloaded";
      case "invisible": return "Invisible - undetectable by sight (PR 1/round)";
      case "sneaking": return "Sneaking - 1/2 move; Basic senses detect only on crit (3.1.5.1)";
      case "discomfort": return "Discomfort - Special Requirement unmet: -3 all saves & to-hit";
      case "succumbed": return "Succumbed to compulsion/phobia";
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
      if (cond.environmental || SENSE_ENV_TYPES.indexOf(cond.type) >= 0 || cond.type === "invisible" || cond.type === "sneaking") {
        const offCmd = (cond.type === "invisible") ? "invis" : (cond.type === "sneaking" ? "sneak" : cond.type);
        return ch("MP", `/w gm <b>MP:</b> <b>${esc(cond.type)}</b> has no recovery roll. Clear it with <code>!mp ${offCmd} --off --target ${tokId}</code>.`);
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
          msg_out += `<br/>${btnDanger(`Take Full Damage`, `!mp apply --id ${poisonRollId} --mode straight`)} `;
          msg_out += `${btn(`Roll-With Max`, `!mp apply --id ${poisonRollId} --mode rollwithmax`)} `;
          msg_out += `${btn(`Roll-With Custom`, `!mp apply --id ${poisonRollId} --mode rollwithcustom --amt ?{Power to divert|0}`)}`;
          msg_out += `<br/><span style="font-size:11px;">Next recovery attempt: ${recTime}</span>`;
        } else {
          msg_out += `<br/><span style="font-size:11px;">Damage blocked by ${prot} ${cond.dmgType || "Biochemical"} protection</span>`;
          // Still show retry button even if damage was blocked
          msg_out += `<br/><span style="font-size:11px;">Next attempt: ${recTime}</span>`;
          msg_out += `<br/>${btn(`Try Again`, `!mp recover --target ${tokId} --idx ${condIdx}`)}`;
        }
      } else {
        // Non-damaging condition (paralysis, etc.) - just show retry
        msg_out += `<br/><span style="font-size:11px;">Next attempt: ${recTime}</span>`;
        if (cond) {
          msg_out += `<br/>${btn(`Try Again`, `!mp recover --target ${tokId} --idx ${condIdx}`)}`;
        } else {
          msg_out += `<br/>${btn(`Try Again`, `!mp recover --target ${tokId} --bc ${bc} --tn ${tn}`)}`;
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
    const now = state.MP_Engine.gameClock.ms;
    
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
        msg_out += `<br/>${btn(`Clear Effect`, `!mp clearcondition --target ${tokId} --idx ${idx}`)}`;
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
        msg_out += `<br/>${btn(`End Effect`, `!mp clearcondition --target ${tokId} --idx ${idx}`)}`;
      } else {
        // Standard condition
        const condLabel = cond.type.replace(/_/g, " ").toUpperCase();
        msg_out += `<br/><br/><b>${idx + 1}. ${condLabel}</b>`;
        msg_out += `<br/><span style="font-size:11px;">Source: ${esc(cond.sourceAtk)}</span>`;
        msg_out += `<br/><span style="font-size:11px;">Recovery: ${cond.saveBC} at ${cond.recTN}- every ${cond.recTime}</span>`;
        if (cond.permanent) {
          msg_out += `<br/><span style="color:#ff0000; font-size:11px;">⚠️ PERMANENT</span>`;
        } else {
          msg_out += `<br/>${btn(`Recovery Roll`, `!mp recover --target ${tokId} --idx ${idx}`)} `;
          msg_out += `${btn(`Remove`, `!mp clearcondition --target ${tokId} --idx ${idx}`)}`;
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
    const now = state.MP_Engine.gameClock.ms;
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
      `<br/>${btn(`Break Free`, `!mp break --target ${defTok.id}`)}`, rec.defCharId);
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
      msg_out += `<br/>${btn(`Try Again`, `!mp break --target ${tokId}`)} ${btn(`Push (+2)`, `!mp break --target ${tokId} --push 1`)}`;
    }

    chCombat("MP", msg_out, char.id);
  }

  // GM: force-clear any snare or grapple on the target with no roll (cleanup).
  // Works on --target or selected token(s); clears both sides of a grapple.
  function cmdSnareClear(msg, args) {
    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    if (!ids.length) return ch("MP", `/w gm <b>MP:</b> Select a token or pass --target.`);

    let cleared = 0;
    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      if (!tok) return;
      const sn = state.MP_Engine.snares[tokId];
      // This token is held: clear it and the grappler's "fist" if applicable
      if (sn) {
        if (sn.grapplerTokenId) {
          const gTok = getObj("graphic", sn.grapplerTokenId);
          if (gTok && !isGrapplingAnyoneElse(sn.grapplerTokenId, tokId)) gTok.set("status_fist", false);
        }
        delete state.MP_Engine.snares[tokId];
        tok.set("status_grab", false);
        tok.set("status_cobweb", false);
        cleared++;
      }
      // This token is grappling others: release each held target
      Object.keys(state.MP_Engine.snares).forEach(heldId => {
        const s = state.MP_Engine.snares[heldId];
        if (s.type === "Grapple" && s.grapplerTokenId === tokId) {
          const hTok = getObj("graphic", heldId);
          if (hTok) hTok.set("status_grab", false);
          delete state.MP_Engine.snares[heldId];
          cleared++;
        }
      });
      tok.set("status_fist", false);
    });
    return ch("MP", `/w gm <b>MP:</b> Cleared ${cleared} snare/grapple link(s).`);
  }

  // True if grapplerTokenId is still grappling someone other than exceptId
  function isGrapplingAnyoneElse(grapplerTokenId, exceptId) {
    return Object.keys(state.MP_Engine.snares).some(k => {
      if (k === exceptId) return false;
      const s = state.MP_Engine.snares[k];
      return s.type === "Grapple" && s.grapplerTokenId === grapplerTokenId;
    });
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
    msg_out += `${btn(`Squeeze`, `!mp squeeze --target ${defTokId}`)} ` +
      (lockAttempt ? "" : `${btn(`Lock`, `!mp grapplelock --target ${defTokId}`)} `) +
      `${btn(`Release`, `!mp grapplerelease --target ${defTokId}`)}<br/>`;
    msg_out += `<b>${esc(defChar.get("name"))}'s options:</b> `;
    msg_out += `${btn(`Break Free`, `!mp grapplebreak --target ${defTokId}`)} ` +
      `${btn(`Escape`, `!mp escape --target ${defTokId}`)} ` +
      (remote || lockAttempt ? "" : `${btn(`Counter`, `!mp countergrapple --target ${defTokId}`)}`);

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
      html += `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode noroll`)}`;
    } else {
      html += `${btn(`No Roll-With`, `!mp apply --id ${rollId} --mode noroll`)} `;
      html += `${btn(`Roll-With Max`, `!mp apply --id ${rollId} --mode rwmax`)} `;
      html += `${btn(`Roll-With...`, `!mp apply --id ${rollId} --mode rw --amt ?{Roll-With amount|0}`)}`;
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
      msg_out += `<br/>${btn(`Try Again`, `!mp wakeup --target ${tokId}`)}`;
    }

    chCombat("MP", msg_out, char.id);
  }

  // -------------------------
  // STATUS COMMANDS
  // -------------------------

  function cmdStatus(msg, args) {
    // Prefer selected tokens (works as a persistent Token Action); fall back to
    // an explicit --target for legacy card buttons.
    const ids = [];
    if (msg.selected && msg.selected.length) {
      msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    } else if (args.target) {
      ids.push(args.target);
    }
    if (!ids.length) return ch("MP", `/w gm <b>MP:</b> Select a token first (or use --target).`);

    ids.forEach(tokId => ch("MP", `/w gm ` + buildStatusCard(tokId)));
  }

  // Live, self-regenerating control card for one token — reads current state
  // so it is never stale, unlike the original chat cards.
  function buildStatusCard(tokId) {
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return `<div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b>MP:</b> Token missing.</div>`;

    const isVeh = isVehicleMode(char.id);
    const hits = isVeh ? getVehicleHits(tok, char.id) : getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = isVeh ? getAttrNum(char.id, "vehicle_hits_max", 20) : getAttrNum(char.id, CFG.HITS_MAX_ATTR, 20);
    const pow = isVeh ? getVehiclePower(tok, char.id) : getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = isVeh ? getAttrNum(char.id, "vehicle_power_max", 40) : getAttrNum(char.id, CFG.POWER_MAX_ATTR, 40);
    const label = isVeh ? (getAttr(char.id, "vehicle_name") || char.get("name")) : char.get("name");

    const hitsColor = hits <= 0 ? "#ff6b6b" : (hits <= hitsMax / 2 ? "#f4d03f" : "#2ecc71");
    let html = `<div style="background:#1a1a2e; border:2px solid #444; border-radius:6px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px; overflow:hidden;">`;
    html += `<div style="background:#2c3e50; padding:6px 10px; font-weight:bold; color:#fff;">${esc(label)}${isVeh ? " 🚗" : ""} — Status</div>`;
    html += `<div style="padding:6px 10px;">`;
    html += `Hits: <b style="color:${hitsColor};">${hits}/${hitsMax}</b> &middot; Power: <b style="color:#5dade2;">${pow}/${powMax}</b>`;
    if (hits <= 0) html += ` <span style="color:#ff6b6b; font-weight:bold;">INCAPACITATED</span>`;
    else if (pow <= 0) html += ` <span style="color:#f4d03f; font-weight:bold;">FATIGUED</span>`;

    // --- Grapple / Snare (this token is the one held) ---
    const heldHere = state.MP_Engine.snares[tokId];
    if (heldHere) {
      const grappler = heldHere.grapplerTokenId ? getObj("graphic", heldHere.grapplerTokenId) : null;
      const grapplerChar = grappler ? getCharFromToken(grappler) : null;
      const byName = grapplerChar ? grapplerChar.get("name") : (heldHere.source || "?");
      if (heldHere.type === "Grapple") {
        html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
        html += `<span style="color:#e67e22;">✊ Grappled by <b>${esc(byName)}</b>${heldHere.locked ? " (LOCKED)" : ""}${heldHere.remote ? " (Remote)" : ""}</span><br/>`;
        html += `${btn(`Break Free`, `!mp grapplebreak --target ${tokId}`)} `;
        if (!heldHere.locked) html += `${btn(`Counter`, `!mp countergrapple --target ${tokId}`)} `;
        html += `${btnDanger(`Release`, `!mp grapplerelease --target ${tokId}`)}`;
        html += `</div>`;
      } else {
        html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
        html += `<span style="color:#e67e22;">🕸 ${esc(heldHere.type)}${heldHere.bp != null ? ` (BP ${heldHere.bp})` : ""} by <b>${esc(byName)}</b></span><br/>`;
        html += `${btn(`Break Free`, `!mp break --target ${tokId}`)} ${btn(`Break (+push)`, `!mp break --target ${tokId} --push 1`)} ${btnDanger(`Clear`, `!mp snareclear --target ${tokId}`)}`;
        html += `</div>`;
      }
    }

    // --- This token is grappling someone else ---
    const holdingIds = Object.keys(state.MP_Engine.snares).filter(k => {
      const s = state.MP_Engine.snares[k];
      return s.type === "Grapple" && s.grapplerTokenId === tokId;
    });
    holdingIds.forEach(heldId => {
      const heldTok = getObj("graphic", heldId);
      const heldChar = heldTok ? getCharFromToken(heldTok) : null;
      const heldName = heldChar ? heldChar.get("name") : "target";
      const s = state.MP_Engine.snares[heldId];
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:#c88fff;">✊ Grappling <b>${esc(heldName)}</b>${s.locked ? " (LOCKED)" : ""}</span><br/>`;
      html += `${btn(`Squeeze`, `!mp squeeze --target ${heldId}`)} `;
      if (!s.locked) html += `${btn(`Lock`, `!mp grapplelock --target ${heldId}`)} `;
      html += `${btnDanger(`Release`, `!mp grapplerelease --target ${heldId}`)}`;
      html += `</div>`;
    });

    // --- Vision (v2.89.0: dazzle/darkness/glare sense loss) ---
    const vis = visionLossInfo(tokId, char ? char.id : null);
    if (vis.lost > 0 || (vis.vis && vis.vis.removed)) {
      const visColor = vis.effective === 0 ? "#ff6b6b" : "#f4d03f";
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:${visColor};">👁 Vision: <b>${vis.effLabel}</b></span> <span style="color:#aab; font-size:11px;">(${esc(vis.causes.join(", "))})</span><br/>`;
      html += `<span style="color:#aab; font-size:10px;">Attacks roll 4.6 acquisition (${vis.effective <= 0 ? "by hearing, Basic row" : "Basic row"}); -3 defense vs physical</span><br/>`;
      const tokConds = state.MP_Engine.conditions[tokId] || [];
      const dazIdx = tokConds.findIndex(c => (c.type === "dazzled" || c.type === "blinded") && !c.permanent);
      if (dazIdx >= 0) html += `${btn(`Recovery Roll`, `!mp recover --target ${tokId} --idx ${dazIdx}`)} `;
      if (tokConds.some(c => c.type === "dazzled" && c.permanent)) html += `<span style="color:#ff6b6b; font-size:11px;">PERMANENT dazzle </span>`;
      if (vis.darkness > 0) html += `${btnDanger(`Clear Darkness`, `!mp darkness --off --target ${tokId}`)} `;
      if (vis.glare > 0) html += `${btnDanger(`Clear Glare`, `!mp glare --off --target ${tokId}`)}`;
      html += `</div>`;
    }

    // --- Senses summary (v2.92.0: only when sheet rows deviate from baseline) ---
    if (char) {
      const sm = getCharacterSenses(char.id);
      const dv = defaultSenses();
      const devs = [];
      Object.keys(sm).forEach(k => {
        const s = sm[k], d = dv[k];
        const changed = !d || s.removed || s.lvl !== d.lvl || s.chk || s.tele || s.amp || s.prot || s.weak;
        if (!changed) return;
        const L = s.removed || s.lvl <= 0 ? "NONE" : (s.lvl >= 3 ? "A" : (s.lvl === 2 ? "F" : "B"));
        const bits = [];
        if (s.chk) bits.push(`chk${s.chk > 0 ? "+" : ""}${s.chk}`);
        if (s.tele) bits.push(`tele+${s.tele}`);
        if (s.amp) bits.push(`amp${s.amp}`);
        if (s.prot) bits.push(`prot${s.prot}`);
        if (s.weak) bits.push(s.weak);
        devs.push(`${esc(s.label || k)} <b>${L}</b>${bits.length ? ` <span style="color:#aab;">(${bits.join(",")})</span>` : ""}`);
      });
      if (devs.length) {
        html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
        html += `<span style="color:#d8c690;">👂 Senses:</span> <span style="font-size:11px;">${devs.join(" · ")}</span>`;
        html += `</div>`;
      }
    }

    // --- Invisibility (v2.91.0) ---
    const invCond = (state.MP_Engine.conditions[tokId] || []).find(c => c.type === "invisible");
    if (invCond) {
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:#c8b8ff;">🫥 ${invCond.blur ? "Blurred" : "Invisible"}${invCond.sneaking ? " (sneaking)" : ""}</span> <span style="color:#aab; font-size:11px;">PR 1/round auto-drains</span><br/>`;
      html += `${btnDanger(`Drop Invisibility`, `!mp invis --off --target ${tokId}`)}`;
      html += `</div>`;
    }

    // --- Sneaking (v2.91.3) ---
    const snkCond = (state.MP_Engine.conditions[tokId] || []).find(c => c.type === "sneaking");
    if (snkCond) {
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:#d8c690;">👣 Sneaking</span> <span style="color:#aab; font-size:11px;">1/2 move; Basic senses detect on crit only</span><br/>`;
      html += `${btnDanger(`Stop Sneaking`, `!mp sneak --off --target ${tokId}`)}`;
      html += `</div>`;
    }

    // --- Bleeding ---
    if (state.MP_Engine.bleeds && state.MP_Engine.bleeds[tokId]) {
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:#ff6b6b;">🩸 Bleeding — ${pow} min to death</span><br/>`;
      html += `${btn(`Stop Bleeding`, `!mp bleed stop --target ${tokId}`)}`;
      html += `</div>`;
    }

    // --- Healing / Medical (shown when below full Hits or Power) ---
    if (!isVeh && (hits < hitsMax || pow < powMax)) {
      const today = gameDayStamp();
      const medDone = state.MP_Engine.medicalDays && state.MP_Engine.medicalDays[char.id] === today;
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<span style="color:#2ecc71;">✚ Healing</span> <span style="color:#aab; font-size:11px;">(rate ${esc(getAttr(char.id, "healing_rate") || "0")})</span><br/>`;
      html += `${btn(`Daily Rest`, `!mp dailyheal --target ${tokId}`)} `;
      if (medDone) {
        html += `<span style="color:#8a8498; font-size:11px;">Medical used today</span>`;
      } else {
        html += `${btn(`Medical ✓`, `!mp medical success --target ${tokId}`)} `;
        html += `${btn(`Crit`, `!mp medical crit --target ${tokId}`)} `;
        html += `${btnDanger(`Fumble`, `!mp medical fumble --target ${tokId}`)}`;
      }
      html += `</div>`;
    }

    // --- Conditions ---
    const conditions = state.MP_Engine.conditions[tokId] || [];
    if (conditions.length) {
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      html += `<b>Conditions:</b>`;
      conditions.forEach(cond => {
        const condLabel = String(cond.type || "effect").replace(/_/g, " ");
        html += `<br/>• ${esc(condLabel)}`;
        if (cond.permanent) html += ` <span style="color:#aab;">(permanent)</span>`;
        else if (cond.recTN != null) html += ` <span style="color:#aab;">[Rec ${cond.recTN}-]</span>`;
        else if (cond.unitLabel) html += ` <span style="color:#aab;">(${esc(cond.unitLabel)})</span>`;
      });
      html += `<br/>${btn(`Details`, `!mp conditions --target ${tokId}`)}`;
      html += `</div>`;
    }

    // --- Siphon pools held by this character ---
    const sipKeys = Object.keys(state.MP_Engine.siphonPools || {}).filter(k => state.MP_Engine.siphonPools[k].charId === char.id);
    if (sipKeys.length) {
      html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a;">`;
      sipKeys.forEach(k => {
        const rec = state.MP_Engine.siphonPools[k];
        const p = getAttrNum(char.id, `repeating_attacks_${rec.rowId}_attack_siphon_pool`, 0);
        const mins = Math.max(0, Math.ceil((rec.expiry - state.MP_Engine.gameClock.ms) / 60000));
        html += `<span style="color:#c88fff;">Siphon pool: ${p} ${esc(rec.resource)} (${mins} min left)</span><br/>`;
      });
      html += `${btnDanger(`Clear Siphon`, `!mp siphon clear --target ${tokId}`)}`;
      html += `</div>`;
    }

    html += `<div style="margin-top:6px; padding-top:6px; border-top:1px solid #2a2a4a; font-size:11px;">`;
    html += `${btn(`↻ Refresh`, `!mp status --target ${tokId}`)}`;
    html += `</div>`;

    html += `</div></div>`;
    return html;
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
        // v2.89.2: vehicles can sit in Darkness/Glare fields too
        tok.set("status_bleeding-eye", false);
        tok.set("status_interdiction", false);
        tok.set("status_ninja-mask", false);
        tok.set("status_aura", false);
        tok.set("status_half-haze", false);
        tok.set("status_stopwatch", false);
        tok.set("status_tread", false);
        tok.set("status_drink-me", false);
        tok.set("status_screaming", false);
        tok.set(CFG.DEF_MOD_BAR, 0);
        
        // v2.89.2: clear conditions (darkness/glare etc.) - previously the
        // vehicle branch returned early without touching the conditions map
        if (state.MP_Engine.conditions && state.MP_Engine.conditions[tok.id]) {
          delete state.MP_Engine.conditions[tok.id];
        }
        
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
      // v2.89.2: sense-loss markers (Flash dazzle, blindness, Darkness, Glare)
      tok.set("status_bleeding-eye", false); // Dazzled (Flash / Laser dazzle)
      tok.set("status_interdiction", false); // Blinded
      tok.set("status_ninja-mask", false);   // Darkness field
      tok.set("status_aura", false);         // Glare field
      tok.set("status_half-haze", false);    // Invisible (v2.91.0)
      tok.set("status_stopwatch", false);    // Duration effect badge (v2.91.2)
      tok.set("status_tread", false);        // Sneaking (v2.91.3)
      tok.set("status_drink-me", false);     // Discomfort (v2.93.0)
      tok.set("status_screaming", false);    // Succumbed/Feared (v2.93.0)
      // v2.91.1: forget acquisitions involving this token
      if (state.MP_Engine.acquired) {
        Object.keys(state.MP_Engine.acquired).forEach(k => {
          if (k.indexOf(tok.id) >= 0) delete state.MP_Engine.acquired[k];
        });
      }
      
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
      case "siphon":
        return testSiphon(msg, args);
      case "damage":
        return testDamage(msg, args);
      case "save":
        return testSaveAttack(msg, args);
      case "snare":
        return testSnare(msg, args);
      case "status":
        return testStatus(msg, args);
      case "senseloss":
        return testSenseLoss(msg, args);
      case "flash":
        return testFlash(msg, args);
      case "acquire":
        return testAcquire(msg, args);
      case "invis":
        return testInvis(msg, args);
      case "senses":
        return testSenses(msg, args);
      case "heal":
        return testHeal(msg, args);
      case "reset":
        return testReset(msg, args);
      default:
        return ch("MP", `/w gm <b>Test Commands:</b><br/>
          <code>!mp test crit [type]</code> - Force crit (types: headshot, solid, precise, armor, leg, arm, gear, free, muscle, offbal, other)<br/>
          <code>!mp test fumble [type]</code> - Force fumble<br/>
          <code>!mp test grapple [TOHIT] [lock] [remote] [gripdice]</code> - Grapple test harness (select 2 tokens: grappler, target)<br/>
          <code>!mp test siphon [PTS]</code> - Siphon PTS points using attacker's Siphon row config (select 2 tokens: attacker, target)<br/>
          <code>!mp test damage N [type] [--ap:N] [--headshot]</code> - Apply N damage (AP tests vs target's Hardened)<br/>
          <code>!mp test save BC MOD REC [dtype]</code> - Test save attack (dtype tests target's Invuln +8)<br/>
          <code>!mp test snare BP [MAX]</code> - Apply snare to selected token<br/>
          <code>!mp test senseloss</code> - Vision-loss model self-test (select 1 token; non-destructive)<br/>
          <code>!mp test flash [LEVELS]</code> - Flash save/condition self-test (select 1 token; non-destructive)<br/>
          <code>!mp test acquire</code> - 4.6 target-acquisition table self-test (select 1 token)<br/>
          <code>!mp test invis</code> - Invisibility/observation self-test (select 2 tokens: observer, target)<br/>
          <code>!mp test senses</code> - Report the selected token's resolved sense map + acquisition fallback<br/>
          <code>!mp test heal N</code> - Heal N hits to selected token<br/>
          <code>!mp test reset</code> - Reset selected token to full Hits/Power<br/>
          <code>!mp test status</code> - Show selected token's full status (shows Hardened/Invuln)`);
    }
  }

    function testSiphon(msg, args) {
    if (!playerIsGM(msg.playerid)) {
      return ch("MP", "/w " + msg.who + " Only GM can use test commands.");
    }
    if (!msg.selected || msg.selected.length < 2) {
      return ch("MP", `/w gm <b>MP:</b> Select <b>2</b> tokens (attacker first, target second), then run <code>!mp test siphon [PTS]</code>.`);
    }
    const atkTok = getObj("graphic", msg.selected[1]._id);
    const defTok = getObj("graphic", msg.selected[0]._id);
    const atkChar = getCharFromToken(atkTok);
    const defChar = getCharFromToken(defTok);
    if (!atkTok || !defTok || !atkChar || !defChar) {
      return ch("MP", `/w gm <b>MP:</b> Both selected tokens must be linked to characters.`);
    }
    // Reads the attacker's real Siphon row config (drain/mode/cap/replenish/overload)
    const sipAttr = findObjs({ _type: "attribute", _characterid: atkChar.id })
      .find(a => /^repeating_attacks_.+_attack_is_siphon$/.test(a.get("name")) && a.get("current") === "1");
    if (!sipAttr) {
      return ch("MP", `/w gm <b>MP:</b> ${esc(atkChar.get("name"))} has no attack row with Siphon Attack checked.`);
    }
    const rowId = sipAttr.get("name").replace(/^repeating_attacks_/, "").replace(/_attack_is_siphon$/, "");
    const pfx = `repeating_attacks_${rowId}_`;
    const drain = getAttr(atkChar.id, pfx + "attack_siphon_drain") || "hits";
    const sMode = getAttr(atkChar.id, pfx + "attack_siphon_mode") || "normal";
    const sBC = getAttr(atkChar.id, pfx + "attack_siphon_bc") || "";
    const sCat = getAttr(atkChar.id, pfx + "attack_siphon_cat") || "";
    const pts = Math.max(1, num(args.pts, 5));

    const hits0 = getResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR);
    const pow0 = getResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR);
    let drained = 0, gain = 0, powerDrain = 0, toHits = 0;
    if (drain === "power") {
      drained = (sMode === "mimicry") ? 0 : Math.min(pts * 2, pow0);
      gain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? pts * 2 : drained);
      powerDrain = drained;
    } else if (drain === "hits") {
      drained = (sMode === "mimicry") ? 0 : Math.min(pts, hits0);
      gain = (sMode === "suppress") ? 0 : ((sMode === "mimicry") ? pts : drained);
      toHits = drained;
    } else {
      drained = (sMode === "mimicry") ? 0 : pts;
      gain = (sMode === "suppress") ? 0 : pts;
    }
    const hits1 = Math.max(0, hits0 - toHits);
    const pow1 = Math.max(0, pow0 - powerDrain);
    setResource(defTok, defChar.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
    setResource(defTok, defChar.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
    if (hits0 - hits1 > 0) consumeSiphonPool(defChar.id, "hits", hits0 - hits1);
    if (pow0 - pow1 > 0) consumeSiphonPool(defChar.id, "power", pow0 - pow1);

    let statusNote = "";
    const hasPainResistance = (num(getAttr(defChar.id, "willpower_pain_resistance"), 0) === 1);
    if (hits1 === 0 && toHits > 0) {
      statusNote = ` <b style="color:#ff6b6b;">INCAPACITATED!</b>`;
      defTok.set("status_dead", true);
    } else if (drain === "hits" && !hasPainResistance && toHits > Math.floor(hits0 / 2) && hits0 > 0) {
      statusNote = ` <b style="color:#e67e22;">UNCONSCIOUS!</b>`;
      defTok.set("status_sleepy", true);
    }

    const unit = drain === "power" ? "Power" : (drain === "hits" ? "Hits" : (drain === "bc" ? `${sBC || "BC"} pts` : `${sCat || "Ability"} CPs`));
    let out = `<div style="background:#16213e; border:2px solid #8040c0; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    out += `<b style="color:#c88fff;">TEST SIPHON</b> — ${pts} pts, ${esc(drain)} (${esc(sMode)})`;
    out += `<br/><b>${esc(defChar.get("name"))}</b> drained <b>${drained}</b> ${esc(unit)}`;
    if (drain === "hits") out += ` (Hits ${hits0}→${hits1})${statusNote}`;
    else if (drain === "power") out += ` (Pow ${pow0}→${pow1})`;
    else out += ` — mark on victim's sheet`;
    const gainHtml = gain > 0 ? applySiphonGain(atkChar.id, rowId, drain, sBC, sCat, gain, defTok.get("_pageid")) : "";
    out += gainHtml || `<br/><span style="color:#aab;">No transfer.</span>`;
    out += `</div>`;
    ch("MP", `/w gm ${out}`);
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
      `${btn(`Squeeze`, `!mp squeeze --target ${defTok.id}`)} ` +
      (sn.locked ? "" : `${btn(`Lock Attempt`, `!mp grapplelock --target ${defTok.id}`)} `) +
      `${btn(`Release`, `!mp grapplerelease --target ${defTok.id}`)}<br/>` +
      `<b>Target options:</b> ` +
      `${btn(`Break Free`, `!mp grapplebreak --target ${defTok.id}`)} ` +
      `${btn(`Break Free (Push)`, `!mp grapplebreak --target ${defTok.id} --pushdef 1`)} ` +
      `${btn(`Escape`, `!mp escape --target ${defTok.id}`)} ` +
      (sn.remote || sn.locked ? "" : `${btn(`Counter`, `!mp countergrapple --target ${defTok.id} --wrestle ?{Wrestling background? (0/1)|0} --lock ?{Attempt Lock? (0/1)|0}`)}`);

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

    const dmgIsVeh = isVehicleMode(char.id);
    const buttons = `${btnDanger(`Apply`, `!mp apply --id ${rollId} --mode ${mode}`)} ` +
      (dmgIsVeh ? "" :
        `${btn(`RW Max`, `!mp apply --id ${rollId} --mode ${isHeadshot ? "headshot_rw" : "rollwithmax"}`)} ` +
        `${btn(`RW Custom`, `!mp apply --id ${rollId} --mode ${isHeadshot ? "headshot_rw" : "rollwithcustom"} --amt ?{Divert to Power|0}`)} `) +
      `${btn(`KB`, `!mp kb --id ${rollId}`)}`;

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

    const buttons = `${btn(`Make Save`, `!mp save --id ${rollId} --critmod 0`)} ` +
      (isVehicleMode(char.id) ? "" :
        `${btn(`Save + Roll-With`, `!mp save --id ${rollId} --rollwith ?{Power to spend|0} --critmod 0`)}`);

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

    const buttons = `${btnDanger(`Apply Snare`, `!mp snare --id ${rollId} --bonus 0`)}`;

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
    
    // Roll-With Cap with Fortitude bonus (vehicles can't roll-with)
    if (isVehicleMode(char.id)) {
      msg_out += `<b>Roll-With Cap:</b> &mdash; <span style="color:#888;">(vehicle)</span>`;
    } else {
      const hasFortitude = (num(getAttr(char.id, "willpower_fortitude"), 0) === 1);
      const hasPainResistance = (num(getAttr(char.id, "willpower_pain_resistance"), 0) === 1);
      const baseRollWith = Math.floor(pow / 10);
      const rollWithCap = hasFortitude ? baseRollWith * 2 : baseRollWith;
      msg_out += `<b>Roll-With Cap:</b> ${rollWithCap}`;
      if (hasFortitude) msg_out += ` <span style="color:#8be9fd;">(Fortitude x2)</span>`;
      if (hasPainResistance) msg_out += ` <span style="color:#27ae60;">(Pain Res.)</span>`;
    }
    
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
  // HTH + MASS GROUP ROLL
  // -------------------------
  // Usage: !mp hthmass [--push 1]
  // Macro: !mp hthmass --push ?{Push 2 PR for +2?|No,0|Yes,1}
  // Rolls one combined contest total per selected token:
  // HTH roll + Mass roll (+ KBR for characters) + optional +2 push.
  function cmdHTHMass(msg, args) {
    const pushRaw = String(args.push || "0").trim().toLowerCase();
    const pushRequested = ["1", "2", "yes", "true", "on"].includes(pushRaw);
    const selected = (msg.selected || []).filter(s => s._type === "graphic");

    if (!selected.length) {
      return ch("MP", `${wt(msg)}<b>MP:</b> Select one or more tokens first.`);
    }

    const seen = new Set();
    const rows = [];
    let rolled = 0;

    selected.forEach(sel => {
      if (seen.has(sel._id)) return;
      seen.add(sel._id);

      const tok = getObj("graphic", sel._id);
      if (!tok) return;

      const char = getCharFromToken(tok);
      const tokenName = tok.get("name") || "Unnamed Token";
      if (!char) {
        rows.push(`<tr style="background:#2a1b23;">` +
          `<td style="padding:4px 6px; border-top:1px solid #3b304f;"><b>${esc(tokenName)}</b></td>` +
          `<td colspan="5" style="padding:4px 6px; border-top:1px solid #3b304f; color:#ff8a8a;">No represented character</td></tr>`);
        return;
      }

      const name = char.get("name") || tokenName;
      if (!canControl(msg, char.id)) {
        rows.push(`<tr style="background:#2a1b23;">` +
          `<td style="padding:4px 6px; border-top:1px solid #3b304f;"><b>${esc(name)}</b></td>` +
          `<td colspan="5" style="padding:4px 6px; border-top:1px solid #3b304f; color:#ff8a8a;">Not controlled by you</td></tr>`);
        return;
      }

      const isVeh = isVehicleMode(char.id);
      const hthExpr = String(isVeh
        ? (getAttr(char.id, "vehicle_hth_roll") || getAttr(char.id, "vehicle_hth") || "1d4")
        : (getAttr(char.id, "hth_damage") || "1d4")).trim();
      const massExpr = String(isVeh
        ? (getAttr(char.id, "vehicle_mass_roll") || getAttr(char.id, "vehicle_mass") || "1d4")
        : (getAttr(char.id, "mass") || "1d4")).trim();
      const kbr = isVeh ? 0 : getAttrNum(char.id, "kb_resistance", 0);

      const hthRoll = rollExpr(hthExpr);
      const massDiceRoll = rollExpr(massExpr);
      const massRoll = massDiceRoll + kbr;

      const pow0 = isVeh
        ? getVehiclePower(tok, char.id)
        : getResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR);
      let pow1 = pow0;
      let pushBonus = 0;
      let pushText = `<span style="color:#777;">—</span>`;

      if (pushRequested) {
        if (pow0 >= 2) {
          pow1 = pow0 - 2;
          pushBonus = 2;
          if (isVeh) setVehiclePower(tok, char.id, pow1);
          else setResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
          pushText = `<span style="color:#f0c040;"><b>+2</b><br/><span style="font-size:10px;">-2 PR</span></span>`;
        } else {
          pushText = `<span style="color:#ff8a8a;"><b>Denied</b><br/><span style="font-size:10px;">${pow0} PR</span></span>`;
        }
      }

      const total = hthRoll + massRoll + pushBonus;
      const massBreakdown = `${massExpr}${kbr ? ` + ${kbr} KBR` : ""}`;
      const powDisplay = pushRequested && pushBonus ? `${pow0}→${pow1}` : `${pow0}`;

      rows.push(`<tr>` +
        `<td style="padding:4px 6px; border-top:1px solid #3b304f;"><b style="color:#eee;">${esc(name)}</b>${isVeh ? ` <span style="color:#8be9fd; font-size:10px;">VEH</span>` : ""}</td>` +
        `<td title="${esc(hthExpr)}" style="padding:4px 5px; text-align:center; border-top:1px solid #3b304f; color:#f39c12;"><b>${hthRoll}</b></td>` +
        `<td title="${esc(massBreakdown)}" style="padding:4px 5px; text-align:center; border-top:1px solid #3b304f; color:#8be9fd;"><b>${massRoll}</b></td>` +
        `<td style="padding:4px 5px; text-align:center; border-top:1px solid #3b304f;">${pushText}</td>` +
        `<td style="padding:4px 6px; text-align:center; border-top:1px solid #3b304f; color:#5dde5d; font-size:17px;"><b>${total}</b></td>` +
        `<td style="padding:4px 5px; text-align:center; border-top:1px solid #3b304f; color:#aaa;">${powDisplay}</td>` +
        `</tr>`);
      rolled++;
    });

    const title = pushRequested ? "HTH + MASS • PUSH" : "HTH + MASS";
    const note = pushRequested
      ? `Push costs <b>2 PR</b> and adds <b>+2 once</b> to the combined total.`
      : `Combined total = HTH + Mass${rows.length ? " (Mass includes KBR)" : ""}.`;

    const html = `<div style="background:#1a1a2e; border:2px solid #4a4070; border-radius:6px; color:#eee; max-width:430px; overflow:hidden;">` +
      `<div style="background:#16213e; padding:6px 8px; border-bottom:2px solid #4a4070; color:#f0c040; font-size:14px;"><b>${title}</b></div>` +
      `<table style="width:100%; border-collapse:collapse; font-size:12px;">` +
      `<tr style="color:#aaa; background:#20203a;"><th style="padding:3px 6px; text-align:left;">Token</th><th>HTH</th><th>Mass</th><th>Push</th><th>Total</th><th>PR</th></tr>` +
      rows.join("") + `</table>` +
      `<div style="padding:5px 8px; border-top:1px solid #3b304f; color:#aaa; font-size:10px;">${note}${rolled ? "" : " No valid tokens were rolled."}</div>` +
      `</div>`;

    return ch("MP", html);
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

    // Find attack row (before the target-character check: area attacks may
    // target a generic/unlinked token as the blast center point - v2.89.3)
    const rowId = findAttackRowByIndex(atkCharId, atkIndex);
    if (!rowId) return ch("MP", `/w gm Attack #${atkIndex} not found for ${esc(atkName)}.`);

    const defChar = getCharFromToken(defTok);
    if (!defChar) {
      const rowArea = num(getRepeatingAttackAttr(atkCharId, rowId, "attack_area"), 0);
      if (rowArea <= 0) {
        return ch("MP", `${wt(msg)}Target token not linked to character. Only AREA attacks can target a generic point token.`);
      }
      // else: fall through - handleMpAttack substitutes a point-target stub
    }

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
      "gear": "Gear", "dazzle": "Dazzle"
    };
    const calledType = calledMap[calledRaw.toLowerCase()] || calledRaw;

    // Build and send the roll template - this triggers handleMpAttack
    // Push (positive) adds damage, Hold Back (negative) reduces damage
    const pushDmg = pushAmount !== 0 ? (pushAmount > 0 ? `+${pushAmount}` : `${pushAmount}`) : "";
    
    const rollMsg = `&{template:mpattack} {{mpapi=1}} {{playerid=${msg.playerid}}} {{atk=${atkCharId}}} {{atktok=${atkTokenId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{calledtype=${calledType}}} {{name=${atkName} - ${attackName}}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;

    sendChat(`character|${atkCharId}`, rollMsg);
  }

  // -------------------------
  // QUICK SAVE COMMAND
  // -------------------------
  // Death Touch (p.53): a target reduced to 0 Hits by Death Touch makes an EN
  // save. Fail = dies instantly (hard kill, no dying state, no Restore). Pass =
  // remains in the normal 0-Hits dying/bleeding state.
  // Usage: !mp dtsave --target <tokenId>
  function cmdDeathTouchSave(msg, args) {
    const tokId = args.target;
    const tok = getObj("graphic", tokId);
    if (!tok) return ch("MP", `/w gm <b>MP:</b> Target token missing.`);
    const char = getCharFromToken(tok);
    if (!char) return ch("MP", `/w gm <b>MP:</b> Token not linked to a character.`);

    const enSave = getAttrNum(char.id, "endurance_save", 10);
    const d20 = randomInteger(20);
    const pass = (d20 !== 20) && (d20 <= enSave);

    let html = `<div style="background:#2a0a0a; border:2px solid #8b0000; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;">`;
    html += `<div style="font-weight:bold; font-size:14px; color:#ff9999; margin-bottom:4px;">${esc(char.get("name"))} — Death Touch EN Save</div>`;
    html += `<div style="color:#aaa; font-size:11px;">TN: <b>${enSave}-</b> | Roll: <b>${d20}</b></div>`;

    if (pass) {
      html += `<div style="font-size:15px; font-weight:bold; color:#27ae60; margin-top:3px;">✓ SURVIVES</div>`;
      html += `<div style="color:#ccc; font-size:11px;">At 0 Hits — remains dying (bleeding 1 Power/min).</div>`;
    } else {
      // Hard kill: zero Power, stop the bleed, mark dead permanently.
      setResource(tok, char.id, CFG.POWER_BAR, CFG.POWER_ATTR, 0);
      if (state.MP_Engine.bleeds[tokId]) delete state.MP_Engine.bleeds[tokId];
      tok.set("status_dead", true);
      html += `<div style="font-size:15px; font-weight:bold; color:#e94560; margin-top:3px;">💀 DIES INSTANTLY</div>`;
    }
    html += `</div>`;
    chCombat("MP", html, char.id);
  }

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
        const rollMsg = `&{template:mpattack} {{mpapi=1}} {{playerid=${msg.playerid}}} {{atk=${atkCharId}}} {{atktok=${atkTokenId}}} {{def=${defTokenId}}} {{row=${rowId}}} {{push=${pushAmount}}} {{hitmod=${hitMod}}} {{nopr=1}} {{name=${atkName} - ${attackName} (Shot ${shot}/${autofireRate})}} {{roll=[[1d20]]}} {{confirm=[[1d20]]}} {{target=[[${tohitNum}]]}} {{damage=[[${damage}${pushDmg}]]}} {{type=${dmgTypeFull}}} {{range=${range}}} {{kb=${kbDisplay}}} {{ap=${ap}}}`;
        
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
    } else if (setting === "blindpen") {
      // Blind-attack to-hit penalty (v2.89.0). Stored negative; accepts "6" or "-6".
      const p = -Math.abs(num(value, 6));
      state.MP_Engine.blindPenalty = p;
      ch("MP", "/w gm Blind attack penalty: " + p);
    } else {
      ch("MP", "/w gm Config options: enabled (on/off), autoroll (on/off), blindpen (N, default 6)");
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
        } else if (testArgs.subcmd === "siphon") {
          testArgs.pts = testParts[3] || "5";
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
      case "snareclear":
        if (gmOnly(msg)) return;
        return cmdSnareClear(msg, args);
      // Sense-loss fields (v2.89.0)
      case "darkness":
        if (gmOnly(msg)) return;
        return cmdSenseField(msg, args, "darkness");
      case "glare":
        if (gmOnly(msg)) return;
        return cmdSenseField(msg, args, "glare");
      case "glow": return cmdGlow(msg, args);
      case "fieldcard": return cmdFieldCard(msg, args);
      case "invis":
      case "invisible": return cmdInvis(msg, args);
      case "sneak":
      case "sneaking": return cmdSneak(msg, args);
      case "sensepanel":
        if (gmOnly(msg)) return;
        return cmdSensePanel(msg, args);
      case "perceive": return cmdPerceive(msg, args);
      case "scan": return cmdScan(msg, args);
      case "locate": return cmdLocate(msg, args);
      case "willcheck":
        if (gmOnly(msg)) return;
        return cmdWillCheck(msg, args);
      case "discomfort": return cmdDiscomfort(msg, args);
      case "require":
        if (gmOnly(msg)) return;
        return cmdRequire(msg, args);

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
      case "arearw": return cmdAreaRW(msg, args);
      case "arearwrest":
        if (gmOnly(msg)) return;
        return cmdAreaRWRest(msg, args);

      // Siphon pool management
      case "siphon":
        if (gmOnly(msg)) return;
        return cmdSiphon(msg, args);

      // Button color preview
      case "buttondemo":
        if (gmOnly(msg)) return;
        return cmdButtonDemo(msg, args);

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
      case "time":
        if (gmOnly(msg)) return;
        return cmdTime(msg, args);
      case "bleed":
        if (gmOnly(msg)) return;
        return cmdBleed(msg, args);
      case "medical":
        if (gmOnly(msg)) return;
        return cmdMedical(msg, args);
      case "dailyheal":
        if (gmOnly(msg)) return;
        return cmdDailyHeal(msg, args);

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
      case "hthmass":
      case "might": return cmdHTHMass(msg, args);
      case "atk": return cmdQuickAttack(msg, args);
      case "autofire": return cmdAutofire(msg, args);
      case "sv": return cmdQuickSave(msg, args);
      case "dtsave": return cmdDeathTouchSave(msg, args);
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
        return ch("MP", `/w gm <b>MP Engine v2.102.0</b> Commands:<br/>
          <span style="color:#aab;">Commands marked <b>GM</b> are GM-only. Select tokens when the command says to.</span><br/>
          <b>Attacks and Saves:</b><br/>
          <code>!mp atk N --atk TOKID --target TOKID [--mod N] [--push N] [--called TYPE]</code> - Attack row N<br/>
          <code>!mp autofire N --atk TOKID --target TOKID</code> - Autofire attack row N<br/>
          <code>!mp sv BC [mod]</code> - Save using EN, AG, IN, or CL<br/>
          <code>!mp hthmass [--push 1]</code> - Combined HTH + Mass roll for every selected token; push costs 2 PR for +2<br/>
          <code>!mp atkinfo --row ROWID</code> - Show a selected character's attack-row details<br/>
          <b>Powers and Senses:</b><br/>
          <code>!mp siphon list | clear | expire | adjust --target TOKID [--amt N]</code> - Siphon pools (<b>GM</b>)<br/>
          <code>!mp darkness --ranks 1-3 [--off] [--target TOKID]</code> - Apply/remove Darkness (<b>GM</b>)<br/>
          <code>!mp glare --ranks 1-3 [--off] [--target TOKID]</code> - Apply/remove Glare (<b>GM</b>)<br/>
          <code>!mp darkness|glare --circle N | --circle off</code> - Draw/remove a field ring (<b>GM</b>)<br/>
          <code>!mp glow --diameter N | --off</code> - Apply/remove Glow<br/>
          <code>!mp fieldcard --kind darkness|glare|glow ...</code> - Build the sheet's field control card<br/>
          <code>!mp invis [--blur] [--sneaking] | --off</code> - Invisibility on selected tokens<br/>
          <code>!mp sneak | --off</code> - Sneaking on selected tokens<br/>
          <code>!mp sensepanel</code> - Senses control panel (<b>GM</b>)<br/>
          <code>!mp perceive [--sense KEY] [--mod N]</code> - Perception check; second selected token is the subject<br/>
          <code>!mp scan [--mod N]</code> - 3.1.5 sweep of the whole page (best sense per target); located contacts get player-only Locate and Attack buttons. First scan/round is the free check. GM tip: add a token action macro named Scan with body <code>!mp scan</code> (visible whenever a token is selected)<br/>
          <code>!mp willcheck --mod N [--present] [--phobia] [--stimulus "x"]</code> - Compulsion/Phobia save (<b>GM</b>)<br/>
          <code>!mp discomfort | --off</code> - Special Requirement penalty<br/>
          <code>!mp require --interval 7d --consequence discomfort --name "x" | --met | --off | list</code> - Requirement clock (<b>GM</b>)<br/>
          <b>Flash:</b> Flash is not a standalone command. Configure the attack row as a save attack with Sense Loss, then use <code>!mp atk</code>. Test it with <code>!mp test flash [LEVELS]</code>.<br/>
          <b>Conditions, Damage, and Healing:</b><br/>
          <code>!mp conditions --target TOKID</code> - List active conditions<br/>
          <code>!mp clearcondition --target TOKID --idx N</code> - Clear condition N<br/>
          <code>!mp recover --target TOKID --idx N</code> - Roll recovery for condition N<br/>
          <code>!mp checkexpiry [--target TOKID]</code> - Check Absorption expiry<br/>
          <code>!mp bleed list | start | stop --target TOKID</code> - Bleeding controls (<b>GM</b>)<br/>
          <code>!mp medical success|crit|fumble</code> - Apply Medical result to selected patient (<b>GM</b>)<br/>
          <code>!mp dailyheal</code> - Apply daily rest healing to selected token (<b>GM</b>)<br/>
          <code>!mp wakeup --target TOKID</code> - Attempt to wake an unconscious target<br/>
          <code>!mp restore</code> - Restore selected token(s) and clear conditions (<b>GM</b>)<br/>
          <b>Snare and Grapple:</b><br/>
          <code>!mp grapple --atk TOKID --def TOKID</code><br/>
          <code>!mp squeeze --target TOKID</code> - Damage a grappled target<br/>
          <code>!mp grapplelock --target TOKID</code> - Lock the grapple<br/>
          <code>!mp grapplerelease --target TOKID</code> - Release the grapple<br/>
          <code>!mp grapplebreak --target TOKID [--pushdef 0|1] [--pushatk 0|1]</code><br/>
          <code>!mp countergrapple --target TOKID [--wrestle 0|1]</code><br/>
          <code>!mp escape --target TOKID</code> - Escape a lock/counter-grapple<br/>
          <code>!mp snareclear</code> - Force-clear snare or grapple on selected token (<b>GM</b>)<br/>
          <b>Force Fields:</b><br/>
          <code>!mp ff --target TOKID</code> - Toggle Force Field<br/>
          <code>!mp ffreset --target TOKID</code> - Renew Force Field<br/>
          <code>!mp ffreinforce --id ID</code> - Reinforce a collapsing Force Field<br/>
          <b>Stances, Range, and Time:</b><br/>
          <code>!mp stance normal|def|full|offbal|N</code><br/>
          <code>!mp clearstances</code> - Clear page stances (<b>GM</b>)<br/>
          <code>!mp offbal</code> - Apply Off Balance to selected token (<b>GM</b>)<br/>
          <code>!mp range</code> - Check range between two selected tokens<br/>
          <code>!mp round | +N | set N | show</code> - Round controls (<b>GM</b>)<br/>
          <code>!mp time show | advance N sec|min|hour|day|week|round | set YYYY-MM-DD HH:MM</code> - Game clock (<b>GM</b>)<br/>
          <b>Status and Setup:</b><br/>
          <code>!mp status</code> - Live selected-token control card<br/>
          <code>!mp stat</code> - Detailed selected-token status<br/>
          <code>!mp showbars [--bars 1,2,3] [--off]</code> - Show/hide selected token bars (<b>GM</b>)<br/>
          <code>!mp vehicle [--on|--off]</code> - Toggle selected sheet/token vehicle mode (<b>GM</b>)<br/>
          <code>!mp config enabled|autoroll|blindpen VALUE</code> - Engine settings<br/>
          <code>!mp info --name &lt;Ability/Weakness&gt;</code> - Stored rules text<br/>
          <code>!mp undo --id ID</code> - Undo a combat card (<b>GM</b>)<br/>
          <b>Import, Export, and Gamma World:</b><br/>
          <code>!mp export</code> - Export selected token to handout JSON (<b>GM</b>)<br/>
          <code>!mp import --name HandoutName</code> - Import MP Builder JSON (<b>GM</b>)<br/>
          <code>!mp gwspawn --name NAME [--form FORM]</code> - Spawn embedded GW bestiary entry (<b>GM</b>)<br/>
          <b>Tests and Diagnostics:</b><br/>
          <code>!mp test</code> - Show all test commands (<b>GM</b>)<br/>
          <code>!mp debug tokens|deltoken X,Y|absorb</code> - Diagnostics (<b>GM</b>)<br/>
          <code>!mp buttondemo</code> - Inert button-color samples (<b>GM</b>)<br/>
          <b>Aliases:</b> <code>might</code>=<code>hthmass</code>, <code>invisible</code>=<code>invis</code>, <code>sneaking</code>=<code>sneak</code>, <code>veh</code>=<code>vehicle</code>, <code>clearstance</code>=<code>clearstances</code>, <code>offbalance</code>=<code>offbal</code>.<br/>
          <b>Generated Button Callbacks:</b> These are implemented commands, but normally come from engine-generated chat buttons rather than typed macros:<br/>
          <code>locate apply limbsave save snare break kb kbsave areaescape areashield arearollnpcs areaforceall areadamageall arearw arearwrest absorb reflect reflecthit afield afresume afcancel afcounter</code><br/>
          <code>!mp help</code> - Show this list.
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

  // Pull the first balanced {...} object out of handout notes, ignoring any
  // leading/trailing markup or a duplicate paste (Roll20's rich-text editor
  // commonly appends or duplicates content). String-aware so braces inside
  // quoted values don't fool the depth count.
  function extractFirstJSONObject(s) {
    if (!s) return null;
    const start = s.indexOf("{");
    if (start < 0) return null;
    let depth = 0, inStr = false, escNext = false;
    for (let i = start; i < s.length; i++) {
      const c = s[i];
      if (inStr) {
        if (escNext) escNext = false;
        else if (c === "\\") escNext = true;
        else if (c === '"') inStr = false;
      } else if (c === '"') inStr = true;
      else if (c === "{") depth++;
      else if (c === "}") { depth--; if (depth === 0) return s.slice(start, i + 1); }
    }
    return null;
  }

  function cmdMPImport(msg, args) {
    let handoutName = (args.name || args.handout || '').replace(/^["']+|["']+$/g, '').trim();
    if (!handoutName) return ch("MP", "/w gm Usage: <code>!mp import --name HandoutName</code>");

    let handout = findObjs({ type: 'handout', name: handoutName })[0];
    if (!handout) {
      const lc = handoutName.toLowerCase();
      handout = findObjs({ type: 'handout' }).find(h => (h.get('name') || '').trim().toLowerCase() === lc);
    }
    if (!handout) {
      const names = findObjs({ type: 'handout' }).map(h => h.get('name')).filter(Boolean);
      const near = names.filter(n => n.toLowerCase().indexOf(handoutName.toLowerCase()) !== -1).slice(0, 5);
      return ch("MP", `/w gm Handout "${esc(handoutName)}" not found.` + (near.length ? `<br/>Did you mean: ${near.map(esc).join(", ")}?` : ` (${names.length} handouts on the board)`));
    }

    handout.get('gmnotes', function(gmnotes) {
      handout.get('notes', function(notes) {
        let raw = gmnotes || notes || '';
        raw = raw.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;|\u00a0/g, ' ').replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'").trim();

        let data;
        try { data = JSON.parse(extractFirstJSONObject(raw) || raw); } catch(e) {
          return ch("MP", `/w gm Failed to parse JSON: ${esc(e.message)}`);
        }
        if (data && (data.type === "mp-vehicle" || (data.version === 10 && Array.isArray(data.systems)))) {
          return buildVehicleCharacterFromMPData(data, `handout <b>${esc(handoutName)}</b>`);
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
  // MP BUILDER VEHICLE IMPORT  (type:"mp-vehicle" — FLYER schema, version 10)
  // Builds a vehicle-mode character: vehicle_hits/power/armor, a forcefield
  // protection row, and a repeating_attacks row per weapon system. Mirrors the
  // attribute names read by isVehicleMode / getVehicleProtection / the !mp atk
  // reader. GW uses a single damage type, so the FF covers all MP types.
  // -------------------------
  const VEH_OFFENSIVE_AB = { "power-blast": 1, "disintegration": 1, "paralysis": 1, "negation": 1, "telekinesis": 1, "change-environment": 1 };
  const VEH_DMGTYPE_MAP = { energy: "energy", kinetic: "kinetic", biochem: "bio", bio: "bio", entropy: "entropy", psychic: "psychic", disintegration: "other", other: "other" };

  function vehWeaponName(desc) {
    if (!desc) return "Weapon";
    return desc.split(/\s+[\u2014\u2013-]\s+/)[0].trim() || "Weapon";
  }
  function vehDmgType(atkType, desc) {
    const t = (atkType || "").toLowerCase();
    if (VEH_DMGTYPE_MAP[t]) return VEH_DMGTYPE_MAP[t];
    const d = (desc || "").toLowerCase();
    if (/disintegrat/.test(d)) return "other";
    if (/kinetic/.test(d)) return "kinetic";
    if (/energy/.test(d)) return "energy";
    return "";
  }
  function vehParseDice(desc) {
    const m = (desc || "").match(/\d+d\d+(?:[+-]\d+)?/);
    return m ? m[0] : "";
  }
  function vehFFPerType(desc) {
    // "Force Field: 48 pts (12/12/12/12) (50) ..." → per-type value 12
    const grp = (desc || "").match(/\((\d+(?:\/\d+)+)\)/);
    if (grp) { const n = parseInt(grp[1].split("/")[0], 10); if (n) return n; }
    const pts = (desc || "").match(/(\d+)\s*pts?/i);
    return pts ? parseInt(pts[1], 10) : 0;
  }

  function buildVehicleCharacterFromMPData(data, sourceLabel) {
    const charName = data.name || "Imported Vehicle";
    let char = findObjs({ type: "character", name: charName })[0];
    if (char) {
      // Guard: never overwrite a pre-existing non-vehicle character. The import
      // clears repeating_attacks/abilities/protection, which would destroy a real
      // character's data if its name happened to collide with the vehicle's.
      const vm = findObjs({ type: "attribute", characterid: char.id, name: "vehicle_mode" })[0];
      const isVehicle = vm && (vm.get("current") || "").toLowerCase() === "on";
      if (!isVehicle) {
        return ch("MP", `/w gm <b>MP import aborted.</b> A character named "${esc(charName)}" already exists and is not a vehicle — importing would overwrite its attacks, abilities, and protection. Rename the existing character (or the vehicle) and re-run, or delete it first.`);
      }
    }
    if (!char) char = createObj("character", { name: charName });
    char.set("name", charName);
    const charId = char.id;
    const bio = [data.model ? "Model: " + data.model : "", data.operator ? "Operator: " + data.operator : ""].filter(Boolean).join("<br/>");
    if (bio) char.set("bio", bio);

    function setAttr(name, val) {
      if (val === undefined || val === null || val === "") return;
      const existing = findObjs({ type: "attribute", characterid: charId, name: name })[0];
      if (existing) existing.set("current", String(val));
      else createObj("attribute", { characterid: charId, name: name, current: String(val) });
    }
    function setRes(name, cur, max) {
      let a = findObjs({ type: "attribute", characterid: charId, name: name })[0];
      if (!a) a = createObj("attribute", { characterid: charId, name: name, current: String(cur), max: String(max) });
      else { a.set("current", String(cur)); a.set("max", String(max)); }
    }

    setAttr("vehicle_mode", "on");
    setAttr("vehicle_name", charName);
    setAttr("vehicle_model", data.model);
    setAttr("vehicle_owner", data.operator);
    // Sheet inputs — calcVehicle() derives spaces/st/en/hits/power/profile/etc. from
    // these on sheet:opened (base_cp must be a vehicleSizeTable key, e.g. "37.5").
    setAttr("vehicle_base_cp", String(data.basicCost));
    setAttr("vehicle_ag", data.bcAg);
    setAttr("vehicle_in", data.bcIn);
    setAttr("vehicle_cl", data.bcCl);
    setAttr("vehicle_hilotech", data.techMod || 0);
    setAttr("vehicle_maneuver", data.maneuverMod || 0);
    setAttr("vehicle_wontexplode", data.wontExplode ? "1" : "0");
    setAttr("vehicle_base_mode", data.isBase ? "1" : "0");
    setAttr("vehicle_armor_kinetic", data.armorKin);
    setAttr("vehicle_armor_energy", data.armorEng);
    setAttr("vehicle_armor_biochem", data.armorBio);
    setAttr("vehicle_armor_entropy", data.armorEnt);
    setAttr("vehicle_armor_psychic", data.armorPsy);
    // Pre-set the derived hits/power so the token is combat-ready before the sheet is
    // first opened; calcVehicle recomputes identically from base_cp on open.
    setRes("vehicle_hits", data.currentHits, data.currentHits);
    setAttr("vehicle_hits_max", data.currentHits);
    setRes("vehicle_power", data.currentPower, data.currentPower);
    setAttr("vehicle_power_max", data.currentPower);

    ["repeating_vehsystems_", "repeating_vehprotection_", "repeating_attacks_", "repeating_protection_", "repeating_abilities_"].forEach(pre => {
      findObjs({ type: "attribute", characterid: charId }).filter(a => a.get("name").indexOf(pre) === 0).forEach(a => a.remove());
    });

    let atkNum = 0, ffRows = 0;
    (data.systems || []).forEach(sys => {
      const ab = sys.abilityData;
      const lbl = (sys.cells && sys.cells[0] && sys.cells[0].label) ? sys.cells[0].label + " " : "";

      // Force field -> Additional Protection row (vehprotection) for DISPLAY only,
      // plus an active forcefield protection row that drives the per-hit deflection/
      // collapse mechanic (threshold = vehicle Power). getVehicleProtection skips the
      // display row so it isn't double-counted as passive armor.
      if (ab && ab.abId === "force-field") {
        const per = vehFFPerType(sys.desc);
        const rid = generateRowID(), p = "repeating_vehprotection_" + rid + "_";
        createObj("attribute", { characterid: charId, name: p + "vprot_name", current: "Force Field" });
        ["kinetic", "energy", "bio", "entropy", "psychic"].forEach(t => { createObj("attribute", { characterid: charId, name: p + "vprot_" + t, current: String(per || 0) }); });
        createObj("attribute", { characterid: charId, name: p + "vprot_other", current: "0" });
        createObj("attribute", { characterid: charId, name: p + "vprot_notes", current: "Active field — see !mp ff" });
        const fid = generateRowID(), fp = "repeating_protection_" + fid + "_";
        createObj("attribute", { characterid: charId, name: fp + "prot_name", current: "Force Field" });
        createObj("attribute", { characterid: charId, name: fp + "prot_mode", current: "forcefield" });
        createObj("attribute", { characterid: charId, name: fp + "prot_state", current: "On" });
        createObj("attribute", { characterid: charId, name: fp + "prot_ff_accum", current: "0" });
        createObj("attribute", { characterid: charId, name: fp + "prot_pr", current: "16" });
        ["kinetic", "energy", "bio", "entropy", "psychic"].forEach(t => { createObj("attribute", { characterid: charId, name: fp + "prot_" + t, current: String(per || 0) }); });
        ffRows++;
      }

      // Every system -> a Vehicle Systems row (drives spaces/cost; sheet auto-fills cp/hits/profile).
      const sid = generateRowID(), sp = "repeating_vehsystems_" + sid + "_";
      createObj("attribute", { characterid: charId, name: sp + "vsys_cost", current: String(sys.extraCPs || 0) });
      createObj("attribute", { characterid: charId, name: sp + "vsys_spaces", current: String(sys.spaces || 0) });
      createObj("attribute", { characterid: charId, name: sp + "vsys_dmg", current: sys.atkDmg || "0" });
      createObj("attribute", { characterid: charId, name: sp + "vsys_notes", current: (lbl + (sys.desc || "")).trim() });
      const _vdt = vehDmgType(sys.atkType, sys.desc);
      const _vtype = (ab && VEH_OFFENSIVE_AB[ab.abId]) ? (_vdt === "psychic" ? "M" : "P") : "none";
      createObj("attribute", { characterid: charId, name: sp + "vsys_dmgtype", current: _vdt });
      createObj("attribute", { characterid: charId, name: sp + "vsys_type", current: _vtype });
      createObj("attribute", { characterid: charId, name: sp + "vsys_tohit", current: "0" });

      // Offensive systems also get a rollable attack row for !mp atk (engine pipeline).
      if (ab && VEH_OFFENSIVE_AB[ab.abId]) {
        atkNum++;
        const aid = generateRowID(), ap = "repeating_attacks_" + aid + "_";
        createObj("attribute", { characterid: charId, name: ap + "attack_name", current: lbl + vehWeaponName(sys.desc) });
        createObj("attribute", { characterid: charId, name: ap + "attack_tohit", current: "" });
        createObj("attribute", { characterid: charId, name: ap + "attack_damage", current: sys.atkDmg || vehParseDice(sys.desc) || "" });
        createObj("attribute", { characterid: charId, name: ap + "attack_dmgtype", current: vehDmgType(sys.atkType, sys.desc) });
        createObj("attribute", { characterid: charId, name: ap + "attack_kb", current: "" });
        createObj("attribute", { characterid: charId, name: ap + "attack_num", current: String(atkNum) });
      }
    });

    ch("MP", `/w gm <b>🚗 Imported vehicle ${esc(charName)}</b> from ${sourceLabel}.<br/>Base CP ${esc(String(data.basicCost))} · ${(data.systems || []).length} system row(s) · ${atkNum} weapon attack(s)${ffRows ? " · force field" : ""}.<br/><span style="font-size:11px;color:#888;">Open the sheet once to let it compute hits/power/profile/stats, then on the token set bar2→vehicle_hits, bar1→vehicle_power.</span>`);
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
        .map(k => `${btn(`${esc(k)}`, `!mp gwspawn --name ${esc(k)}`)}`).join(" ");
      return ch("MP", `/w gm No GW creature named <b>${esc(name)}</b>.` + (near ? `<br/>Did you mean: ${near}` : ` (${all.length} creatures loaded)`));
    }
    let block = forms[0];
    if (forms.length > 1) {
      const want = (args.form || "").trim().toLowerCase();
      block = want ? forms.find(f => String(f.form || "").toLowerCase().indexOf(want) >= 0) : null;
      if (!block) {
        const btns = forms.map(f => {
          const lbl = String(f.form || "").replace(/^.*[—:]\s*/, "").trim() || f.name;
          return `${btn(`${esc(lbl)}`, `!mp gwspawn --name ${esc(name)} --form ${esc(lbl)}`)}`;
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
      dmg: "", atkDmg: e.dmg || "", atkType: e.dmgtype || "", cells: [], integral: !!e.integral, bulky: e.bulky || 0, delicate: 0,
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
      bcAg: bc.ag || 0, bcIn: bc.in || 0, bcCl: bc.cl || 0,
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
    vehSuffixLabels(systems);
    return { remainingCells: [], walls: vehTraceHull(systems) };
  }

  const VEH_ABBR = { "power-blast": "PB", "disintegration": "Di", "force-field": "FF",
    "robot-brain": "RB", "negation": "Ne", "paralysis": "Pa", "telekinesis": "TK",
    "change-environment": "CE" };

  // Disambiguate visually identical systems on the layout grid: when 2+ functional
  // systems share an ability, stamp every cell with a numbered abbr (PB1, PB2, ...).
  // Singletons are left unlabeled so the canvas draws its own MP.sysLabel abbr.
  function vehSuffixLabels(systems) {
    const groups = {};
    for (const s of systems) {
      if (!s.abilityData || s.integral || !s.cells.length) continue;
      const ab = s.abilityData.abId;
      (groups[ab] = groups[ab] || []).push(s);
    }
    for (const ab in groups) {
      const grp = groups[ab];
      if (grp.length < 2) continue;
      const base = VEH_ABBR[ab] || ab.slice(0, 2).toUpperCase();
      grp.forEach((s, i) => { const lbl = base + (i + 1); s.cells.forEach(c => { c.label = lbl; }); });
    }
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
              frag += `<br/>${btnDanger(`Apply`, `!mp apply --id ${rid} --mode noroll`)} `;
              if (!isVehicleMode(char.id)) {
                frag += `${btn(`Roll-With Max`, `!mp apply --id ${rid} --mode rollwithmax`)} `;
                frag += `${btn(`Roll-With Custom`, `!mp apply --id ${rid} --mode rollwithcustom --amt ?{Divert to Power|0}`)}`;
              }
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
            `<br/>${btn(`Recovery Roll`, `!mp recover --target ${tokId} --idx ${idx}`)}`;
          cond.nextRecRound = newRound + interval; // schedule next opportunity
        }
      });
    });
    return frag ? `<br/><b>Recovery saves due:</b>${frag}` : "";
  }

  // -------------------------
  // GAME CLOCK & TURN TRACKER (4.1: one round = 10 seconds)
  // -------------------------

  const TIME_UNITS = {
    s: 1, sec: 1, second: 1, seconds: 1,
    min: 60, minute: 60, minutes: 60,
    h: 3600, hour: 3600, hours: 3600,
    d: 86400, day: 86400, days: 86400,
    w: 604800, week: 604800, weeks: 604800,
    r: 0, round: 0, rounds: 0
  };

  function advanceClock(seconds) {
    const before = state.MP_Engine.gameClock.ms;
    state.MP_Engine.gameClock.ms += seconds * 1000;
    runGameTimeSweep();
    announcePhaseCrossings(before, state.MP_Engine.gameClock.ms);
    updateClockHandout();
  }

  // Phase of day for a given hour (fixed boundaries, CFG.DAY_PHASES)
  function phaseForHour(h) {
    for (const p of CFG.DAY_PHASES) {
      if (p.start <= p.end) { if (h >= p.start && h < p.end) return p; }
      else { if (h >= p.start || h < p.end) return p; }  // wraps midnight
    }
    return CFG.DAY_PHASES[CFG.DAY_PHASES.length - 1];
  }

  // Announce day-boundary and phase crossings in chat (not every round)
  function announcePhaseCrossings(beforeMs, afterMs) {
    if (afterMs <= beforeMs) return;
    const bH = new Date(beforeMs).getUTCHours();
    const aH = new Date(afterMs).getUTCHours();
    const bDay = Math.floor(beforeMs / 86400000);
    const aDay = Math.floor(afterMs / 86400000);
    // Only announce if we didn't leap more than a day (avoid spam on big jumps)
    if (aDay - bDay > 1) return;
    if (aDay !== bDay) {
      ch("MP", `/w gm <div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;">🌅 <b>A new day dawns</b> — ${fmtGameClock()}</div>`);
    }
    const bp = phaseForHour(bH), ap = phaseForHour(aH);
    if (bp.label !== ap.label && aDay === bDay) {
      ch("MP", `/w gm <div style="background:#1e1e38; color:${ap.color}; padding:6px; border:2px solid #4a4070;">🕒 <b>${esc(ap.label)}</b> — ${fmtGameClock()}</div>`);
    }
  }

  // Persistent player-visible handout, rewritten on every clock movement
  function getClockHandout() {
    let h = findObjs({ _type: "handout", name: CFG.CLOCK_HANDOUT_NAME })[0];
    if (!h && CFG.CLOCK_HANDOUT) {
      h = createObj("handout", { name: CFG.CLOCK_HANDOUT_NAME, inplayerjournals: "all" });
    }
    return h || null;
  }

  function updateClockHandout() {
    if (!CFG.CLOCK_HANDOUT) return;
    const h = getClockHandout();
    if (!h) return;
    const d = new Date(state.MP_Engine.gameClock.ms);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const p2 = x => String(x).padStart(2, "0");
    const phase = phaseForHour(d.getUTCHours());
    const gc = state.MP_Engine.gameClock;
    const inCombat = gc.combatStartMs !== null;

    let combatBlock;
    if (inCombat) {
      const elapsed = Math.round((gc.ms - gc.combatStartMs) / 1000);
      combatBlock = `<div style="margin-top:14px; padding-top:12px; border-top:1px solid #4a4070;">` +
        `<span style="color:#e24b4a;">●</span> <b>In combat</b> &nbsp; Round <b>${state.MP_Engine.currentRound}</b>` +
        `<br/><span style="color:#8a84a8; font-size:11px;">Elapsed this combat: ${fmtElapsed(elapsed)}</span></div>`;
    } else {
      combatBlock = `<div style="margin-top:14px; padding-top:12px; border-top:1px solid #4a4070;">` +
        `<span style="color:#6c8;">●</span> Narrative time</div>`;
    }

    const body = `<div style="font-family:Arial,sans-serif; color:#eaeaea; background:#1e1e38; padding:12px; border-radius:6px;">` +
      `<div style="font-size:13px; color:#c8b8ff; letter-spacing:0.03em; margin-bottom:6px;">🕐 GAME TIME</div>` +
      `<div style="font-size:26px; font-weight:bold; color:#fff;">${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}<span style="font-size:18px; color:#b9b3d6;">:${p2(d.getUTCSeconds())}</span></div>` +
      `<div style="font-size:14px; color:#b9b3d6; margin-top:2px;">${days[d.getUTCDay()]}, ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}</div>` +
      `<div style="margin-top:10px; color:${phase.color}; font-size:13px;">☀ ${esc(phase.label)}</div>` +
      combatBlock + `</div>`;
    h.set("notes", body);
  }

  // Everything scheduled on game time fires whenever the clock moves
  function runGameTimeSweep() {
    checkSiphonExpiry();
    tickBleeds();
    expireDurations();
    Object.keys(state.MP_Engine.conditions).forEach(tokId => checkAbsorptionExpiry(tokId));
  }

  // 4.8.4.2: incapacitated characters lose 1 Power per game minute until a
  // Medical task check stops the bleeding. Dead when Hits AND Power reach 0.
  function startBleed(tokenId, charId) {
    if (isVehicleMode(charId)) return "";
    if (state.MP_Engine.bleeds[tokenId]) return "";
    state.MP_Engine.bleeds[tokenId] = { charId: charId, lastMs: state.MP_Engine.gameClock.ms };
    return `<div style="color:#ff6b6b; font-size:11px; margin-top:2px;">🩸 Bleeding (4.8.4.2): 1 Power/min until a Medical task check — ${btn(`Stop Bleeding`, `!mp bleed stop --target ${tokenId}`)}</div>`;
  }

  function tickBleeds() {
    const gc = state.MP_Engine.gameClock;
    Object.keys(state.MP_Engine.bleeds).forEach(tokenId => {
      const rec = state.MP_Engine.bleeds[tokenId];
      const tok = getObj("graphic", tokenId);
      const char = getObj("character", rec.charId);
      if (!tok || !char) { delete state.MP_Engine.bleeds[tokenId]; return; }
      const name = char.get("name");
      const hits = getResource(tok, rec.charId, CFG.HITS_BAR, CFG.HITS_ATTR);
      if (hits > 0) {
        delete state.MP_Engine.bleeds[tokenId];
        ch("MP", `/w gm <b>MP:</b> ${esc(name)} has Hits again — bleeding stops.`);
        return;
      }
      const minutes = Math.floor((gc.ms - rec.lastMs) / 60000);
      if (minutes <= 0) return;
      const pow0 = getResource(tok, rec.charId, CFG.POWER_BAR, CFG.POWER_ATTR);
      const loss = Math.min(pow0, minutes);
      const pow1 = pow0 - loss;
      setResource(tok, rec.charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
      if (pow0 - pow1 > 0) consumeSiphonPool(rec.charId, "power", pow0 - pow1);
      rec.lastMs += minutes * 60000;
      if (pow1 === 0) {
        delete state.MP_Engine.bleeds[tokenId];
        ch("MP", `/w gm <div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b style="color:#ff6b6b;">☠ ${esc(name)} IS DEAD</b> — Hits and Power both 0 (4.8.4.2). Bled out after ${pow0} minute(s).</div>`);
      } else {
        ch("MP", `/w gm <div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;">🩸 <b>${esc(name)}</b> bleeds: -${loss} Power (${pow0}→${pow1}). Dead in ${pow1} minute(s) without Medical aid.</div>`);
      }
    });
  }

  // GM: !mp bleed list | start --target TOKID | stop --target TOKID
  // -------------------------
  // HEALING (4.13) — daily rest heal + Medical task check (4.13.1)
  // -------------------------

  // Apply N points of healing to a token, Power first then Hits (4.13). Returns
  // { powHealed, hitsHealed, pow0, pow1, hits0, hits1 } for reporting.
  function applyHealing(tok, charId, amount) {
    const isVeh = isVehicleMode(charId);
    const pow0 = isVeh ? getVehiclePower(tok, charId) : getResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR);
    const powMax = isVeh ? getAttrNum(charId, "vehicle_power_max", 0) : getAttrNum(charId, CFG.POWER_MAX_ATTR, 0);
    const hits0 = isVeh ? getVehicleHits(tok, charId) : getResource(tok, charId, CFG.HITS_BAR, CFG.HITS_ATTR);
    const hitsMax = isVeh ? getAttrNum(charId, "vehicle_hits_max", 0) : getAttrNum(charId, CFG.HITS_MAX_ATTR, 0);

    let remaining = amount;
    const powRoom = powMax > 0 ? Math.max(0, powMax - pow0) : remaining;
    const powHealed = Math.min(remaining, powRoom);
    const pow1 = pow0 + powHealed;
    remaining -= powHealed;
    const hitsRoom = hitsMax > 0 ? Math.max(0, hitsMax - hits0) : remaining;
    const hitsHealed = Math.min(remaining, hitsRoom);
    const hits1 = hits0 + hitsHealed;

    if (isVeh) {
      if (powHealed > 0) setVehiclePower(tok, charId, pow1);
      if (hitsHealed > 0) setVehicleHits(tok, charId, hits1);
    } else {
      if (powHealed > 0) setResource(tok, charId, CFG.POWER_BAR, CFG.POWER_ATTR, pow1);
      if (hitsHealed > 0) setResource(tok, charId, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
    }
    return { powHealed, hitsHealed, pow0, pow1, hits0, hits1 };
  }

  // Healing Rate as a base + decimal-chance (4.13). Rolls the d10 for the
  // fractional bonus point. Returns { amount, base, bonus, rate }.
  function rollHealingRate(charId) {
    const rate = parseFloat(getAttr(charId, "healing_rate")) || 0;
    const base = Math.floor(rate);
    const decimal = Math.round((rate % 1) * 10);
    const d10 = randomInteger(10);
    const bonus = (decimal > 0 && d10 <= decimal) ? 1 : 0;
    return { amount: base + bonus, base, bonus, rate, d10, decimal };
  }

  function healResultLine(name, r, prefix) {
    let parts = [];
    if (r.powHealed > 0) parts.push(`Power ${r.pow0}→${r.pow1}`);
    if (r.hitsHealed > 0) parts.push(`Hits ${r.hits0}→${r.hits1}`);
    const body = parts.length ? parts.join(" · ") : "already at full";
    return `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:6px 10px; font-family:Arial,sans-serif; font-size:13px; color:#eee; max-width:280px;"><b style="color:#2ecc71;">${esc(name)}</b> ${prefix}<br/><span style="color:#aab;">${body}</span></div>`;
  }

  function gameDayStamp() {
    return Math.floor(state.MP_Engine.gameClock.ms / 86400000);
  }

  // !mp dailyheal — apply a full day's rest healing (Healing Rate, Power first
  // then Hits) to selected token(s). This is the bar-applying companion to the
  // sheet's Heal button (which only rolls/displays the number).
  function cmdDailyHeal(msg, args) {
    const ids = [];
    if (args.target) ids.push(args.target);
    else if (msg.selected && msg.selected.length) msg.selected.forEach(s => { if (s._type === "graphic") ids.push(s._id); });
    if (!ids.length) return ch("MP", `/w gm <b>MP:</b> Select a token or pass --target.`);

    ids.forEach(tokId => {
      const tok = getObj("graphic", tokId);
      const char = getCharFromToken(tok);
      if (!tok || !char) return;
      const gateMsg = unlivingHealBlock(char.id, tok);
      if (gateMsg) {
        return ch("MP", `/w gm <b>${esc(char.get("name"))}</b>: ${gateMsg}`);
      }
      const roll = rollHealingRate(char.id);
      if (roll.amount <= 0) {
        return ch("MP", `/w gm <b>${esc(char.get("name"))}</b>: Healing Rate 0 — no daily healing.`);
      }
      const r = applyHealing(tok, char.id, roll.amount);
      const bonusNote = roll.bonus > 0 ? ` (+1 bonus, rolled ${roll.d10} vs ${roll.decimal})` : (roll.decimal > 0 ? ` (no bonus, rolled ${roll.d10} vs ${roll.decimal})` : "");
      chCombat("MP", healResultLine(char.get("name"), r, `rests — heals ${roll.amount}${bonusNote}`), char.id);
    });
  }

  // !mp medical <success|crit|fumble> — apply the OUTCOME of a Medical task
  // check (4.13.1). GM rolls the check (IN-based, modifiers are GM adjudication
  // per 3.0.2); this applies the mechanical result: success heals Healing Rate
  // and stops bleeding, crit doubles, fumble deals d8+1. One successful benefit
  // per patient per game-day (any medic).
  function cmdMedical(msg, args) {
    const parts = msg.content.split(/\s+/);
    const outcome = (parts[2] || "").toLowerCase();
    const tokId = args.target || (msg.selected && msg.selected[0] && msg.selected[0]._type === "graphic" ? msg.selected[0]._id : null);
    if (!tokId) return ch("MP", `/w gm <b>MP:</b> Select the patient (or --target).`);
    const tok = getObj("graphic", tokId);
    const char = getCharFromToken(tok);
    if (!tok || !char) return ch("MP", `/w gm <b>MP:</b> Patient token missing.`);
    const name = char.get("name");

    if (outcome === "fumble") {
      const dmg = randomInteger(8) + 1;
      const isVeh = isVehicleMode(char.id);
      const hits0 = isVeh ? getVehicleHits(tok, char.id) : getResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR);
      const hits1 = Math.max(0, hits0 - dmg);
      if (isVeh) setVehicleHits(tok, char.id, hits1); else setResource(tok, char.id, CFG.HITS_BAR, CFG.HITS_ATTR, hits1);
      return chCombat("MP", `<div style="background:#16213e; border:2px solid #e74c3c; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b style="color:#ff6b6b;">Medical FUMBLE on ${esc(name)}</b><br/><span style="color:#aab;">d8+1 = ${dmg} damage (Hits ${hits0}→${hits1})</span></div>`, char.id);
    }

    if (outcome !== "success" && outcome !== "crit") {
      return ch("MP", `/w gm <b>MP:</b> Usage: <code>!mp medical success|crit|fumble</code> (select patient).`);
    }

    // Once-per-day gate (any medic)
    if (!state.MP_Engine.medicalDays) state.MP_Engine.medicalDays = {};
    const today = gameDayStamp();
    if (state.MP_Engine.medicalDays[char.id] === today) {
      return ch("MP", `/w gm <b>MP:</b> ${esc(name)} already received Medical care today (one benefit per patient per day, 4.13.1).`);
    }

    const roll = rollHealingRate(char.id);
    let amount = roll.amount;
    if (outcome === "crit") amount *= 2;
    const r = applyHealing(tok, char.id, amount);

    // Success stops bleeding (4.13.1 / 4.8.4.2)
    let bleedNote = "";
    if (state.MP_Engine.bleeds && state.MP_Engine.bleeds[tokId]) {
      delete state.MP_Engine.bleeds[tokId];
      bleedNote = `<br/><span style="color:#2ecc71;">Bleeding stopped.</span>`;
    }
    state.MP_Engine.medicalDays[char.id] = today;

    const critNote = outcome === "crit" ? " (CRIT ×2)" : "";
    let parts2 = [];
    if (r.powHealed > 0) parts2.push(`Power ${r.pow0}→${r.pow1}`);
    if (r.hitsHealed > 0) parts2.push(`Hits ${r.hits0}→${r.hits1}`);
    const body = parts2.length ? parts2.join(" · ") : "already at full";
    chCombat("MP", `<div style="background:#16213e; border:2px solid #27ae60; border-radius:6px; padding:6px 10px; font-size:13px; color:#eee; max-width:280px;"><b style="color:#2ecc71;">Medical care${critNote} for ${esc(name)}</b><br/><span style="color:#aab;">Heals ${amount} — ${body}</span>${bleedNote}</div>`, char.id);
  }

  function cmdBleed(msg, args) {
    const parts = msg.content.split(/\s+/);
    const action = (parts[2] || "list").toLowerCase();
    if (action === "list") {
      const keys = Object.keys(state.MP_Engine.bleeds);
      if (keys.length === 0) return ch("MP", `/w gm <b>MP:</b> No one is bleeding.`);
      let out = `<b>Bleeding (4.8.4.2):</b>`;
      keys.forEach(tokenId => {
        const rec = state.MP_Engine.bleeds[tokenId];
        const char = getObj("character", rec.charId);
        const tok = getObj("graphic", tokenId);
        const pow = tok ? getResource(tok, rec.charId, CFG.POWER_BAR, CFG.POWER_ATTR) : 0;
        out += `<br/>• <b>${esc(char ? char.get("name") : rec.charId)}</b> — ${pow} Power (${pow} min to death)`;
      });
      return ch("MP", `/w gm ${out}`);
    }
    const tok = args.target ? getObj("graphic", args.target) : null;
    if (!tok) return ch("MP", `/w gm <b>MP:</b> !mp bleed ${action} needs --target &lt;tokenId&gt;.`);
    if (action === "stop") {
      if (!state.MP_Engine.bleeds[tok.id]) return ch("MP", `/w gm <b>MP:</b> Not bleeding.`);
      delete state.MP_Engine.bleeds[tok.id];
      const char = getObj("character", tok.get("represents"));
      return ch("MP", `<b>MP:</b> Bleeding stopped for <b>${esc(char ? char.get("name") : "target")}</b> (Medical task check).`);
    }
    if (action === "start") {
      const charId = tok.get("represents");
      if (!charId) return ch("MP", `/w gm <b>MP:</b> Token not linked to a character.`);
      const frag = startBleed(tok.id, charId);
      return ch("MP", `/w gm ${frag || "<b>MP:</b> Already bleeding (or a vehicle)."}`);
    }
    return ch("MP", `/w gm <b>MP:</b> Usage: !mp bleed list | start --target TOKID | stop --target TOKID`);
  }

  // Auto-expire non-round duration effects when the game clock crosses them
  function expireDurations() {
    const gc = state.MP_Engine.gameClock;
    Object.keys(state.MP_Engine.conditions).forEach(tokenId => {
      const conds = state.MP_Engine.conditions[tokenId];
      if (!conds || !conds.length) return;
      const tok = getObj("graphic", tokenId);
      for (let i = conds.length - 1; i >= 0; i--) {
        const c = conds[i];
        if (c.type !== "duration" || !c.expiresMs || c.expiresMs > gc.ms) continue;
        conds.splice(i, 1);
        if (tok && c.marker && !conds.some(o => o.marker === c.marker)) {
          tok.set("status_" + c.marker, false);
        }
        const name = tok ? tok.get("name") : "target";
        ch("MP", `/w gm <b>MP:</b> ⏱ <b>${esc(name)}</b>: <b>${esc(c.sourceAtk || "duration effect")}</b> (${esc(c.unitLabel || "")}) has expired.`);
      }
      if (!conds.length) delete state.MP_Engine.conditions[tokenId];
    });
  }

  function fmtGameClock() {
    const d = new Date(state.MP_Engine.gameClock.ms);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const p2 = x => String(x).padStart(2, "0");
    return `${days[d.getUTCDay()]} ${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
  }

  function fmtElapsed(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  function clockCard(title, extra) {
    return `<div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;">` +
      `<b>\ud83d\udd50 ${title}</b><br/>${fmtGameClock()}${extra || ""}</div>`;
  }

  // Shared round advance: rounds, clock, duration ticks, recovery prompts.
  // Both !mp round and the Turn Tracker funnel through here.
  function advanceRound(n) {
    const newRound = state.MP_Engine.currentRound + n;
    state.MP_Engine.currentRound = newRound;
    advanceClock(n * CFG.SECONDS_PER_ROUND);
    const durFrag = tickDurationEffects(n);
    const recFrag = promptDueRecoveries(newRound);
    const invFrag = tickInvisibility(n);
    checkRequirementsDue();
    // v2.91.1: prune stale acquisition cache entries
    if (state.MP_Engine.acquired) {
      Object.keys(state.MP_Engine.acquired).forEach(k => {
        if (num(state.MP_Engine.acquired[k].round, 0) < newRound - 50) delete state.MP_Engine.acquired[k];
      });
    }
    let report = `<div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;">`;
    report += `<b>\u2694\ufe0f Round ${newRound}</b> <span style="color:#8a84a8; font-size:11px;">${fmtGameClock()}</span><br/>`;
    report += `<span style="color:#f4d03f;">\u23f1\ufe0f Check active durations - deduct PR/charges as needed</span>`;
    report += durFrag;
    report += recFrag;
    report += invFrag;
    report += `</div>`;
    return report;
  }

  // GM: !mp time | advance N unit | set YYYY-MM-DD [HH:MM]
  function cmdTime(msg, args) {
    const parts = msg.content.split(/\s+/);
    const sub = (parts[2] || "show").toLowerCase();
    if (sub === "show") {
      return ch("MP", `/w gm ${clockCard("Game Time")}`);
    }
    if (sub === "advance" || sub === "adv") {
      const n = parseFloat(parts[3]);
      const unitKey = (parts[4] || "min").toLowerCase();
      if (isNaN(n) || n <= 0 || !(unitKey in TIME_UNITS)) {
        return ch("MP", `/w gm <b>MP:</b> Usage: <code>!mp time advance N sec|min|hour|day|week|round</code>`);
      }
      const mult = TIME_UNITS[unitKey] || CFG.SECONDS_PER_ROUND;
      advanceClock(Math.round(n * mult));
      checkRequirementsDue();
      return ch("MP", `/w gm ${clockCard("Game Time", `<br/><span style="color:#8a84a8;">Advanced ${n} ${esc(unitKey)}</span>`)}`);
    }
    if (sub === "set") {
      const dm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(parts[3] || "");
      const tm = /^(\d{1,2}):(\d{2})$/.exec(parts[4] || "");
      if (!dm) return ch("MP", `/w gm <b>MP:</b> Usage: <code>!mp time set YYYY-MM-DD [HH:MM]</code>`);
      const hh = tm ? parseInt(tm[1], 10) : 8;
      const mm = tm ? parseInt(tm[2], 10) : 0;
      state.MP_Engine.gameClock.ms = Date.UTC(parseInt(dm[1], 10), parseInt(dm[2], 10) - 1, parseInt(dm[3], 10), hh, mm, 0);
      updateClockHandout();
      return ch("MP", `/w gm ${clockCard("Game Time Set")}`);
    }
    return ch("MP", `/w gm <b>MP:</b> Usage: <code>!mp time</code> | <code>!mp time advance N unit</code> | <code>!mp time set YYYY-MM-DD [HH:MM]</code>`);
  }

  // --- Turn Tracker integration ---
  // A custom "Round" entry (formula +1) is inserted when the tracker opens;
  // Roll20 increments it each full cycle and the engine mirrors it into
  // currentRound + the game clock via advanceRound.

  function readTurnorder() {
    try {
      const raw = Campaign().get("turnorder");
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  // Signature of the turn order: the sequence of entry ids. Used to detect a
  // wrap (top combatant coming back around = a new 10-second round).
  function turnorderTopId(to) {
    return to.length ? String(to[0].id) : "";
  }

  function onTrackerPageChange(obj, prev) {
    const nowOpen = !!obj.get("initiativepage");
    const wasOpen = !!(prev && prev.initiativepage);
    const gc = state.MP_Engine.gameClock;
    if (nowOpen && !wasOpen) {
      state.MP_Engine.currentRound = 1;
      gc.combatStartMs = gc.ms;
      gc.combatStartRound = 1;
      gc.roundAnchor = turnorderTopId(readTurnorder());
      gc.topId = gc.roundAnchor;
      gc.leftAnchor = false;
      updateClockHandout();
      ch("MP", `/w gm ${clockCard("Combat Started", `<br/><span style="color:#f4d03f;">\u2694\ufe0f Round 1</span>`)}`);
    } else if (!nowOpen && wasOpen && gc.combatStartMs !== null) {
      const elapsed = Math.round((gc.ms - gc.combatStartMs) / 1000);
      const rounds = state.MP_Engine.currentRound - gc.combatStartRound + 1;
      gc.combatStartMs = null;
      gc.roundAnchor = null;
      gc.topId = null;
      gc.leftAnchor = false;
      updateClockHandout();
      ch("MP", `/w gm ${clockCard("Combat Ended", `<br/><span style="color:#8a84a8;">${rounds} round(s), ${fmtElapsed(elapsed)} game time</span>`)}`);
    }
  }

  // Option A: count wraps. The round anchor is the combatant on top when the
  // round begins. Roll20 moves the finished combatant to the bottom on each
  // "next turn", so the anchor returns to the top only after everyone has
  // acted = one full round. Advance one round per return; manual !mp round
  // remains the authoritative fallback.
  function onTurnorderChange() {
    if (!Campaign().get("initiativepage")) return;
    const to = readTurnorder();
    if (to.length === 0) return;
    const gc = state.MP_Engine.gameClock;
    const newTop = turnorderTopId(to);
    if (!gc.roundAnchor) { gc.roundAnchor = newTop; gc.topId = newTop; return; }
    if (newTop === gc.topId) return;  // no turn change (re-sort, edit, HP tweak)
    gc.topId = newTop;
    // Anchor back on top after having left it => the party cycled once.
    if (newTop === gc.roundAnchor && gc.leftAnchor) {
      gc.leftAnchor = false;
      ch("MP", `/w gm ` + advanceRound(1));
    } else if (newTop !== gc.roundAnchor) {
      gc.leftAnchor = true;  // anchor has rotated off the top; a wrap is now possible
    }
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
    
    // Forward advances funnel through advanceRound (clock + ticks); jumps
    // backward or absolute sets move the counter without moving the clock.
    if (newRound > oldRound) {
      state.MP_Engine.currentRound = oldRound;
      return ch("MP", `/w gm ` + advanceRound(newRound - oldRound));
    }
    
    let report = `<div style="background:#1e1e38; color:#eaeaea; padding:6px; border:2px solid #4a4070;">`;
    report += `<b>⚔️ Round ${newRound}</b> <span style="color:#8a84a8; font-size:11px;">clock unchanged</span><br/>`;
    report += `<span style="color:#f4d03f;">⏱️ Check active durations - deduct PR/charges as needed</span>`;
    report += `</div>`;
    
    return ch("MP", `/w gm ` + report);
  }

  // -------------------------
  // INIT
  // -------------------------
  on("chat:message", onChat);
  on("change:campaign:initiativepage", onTrackerPageChange);
  on("change:campaign:turnorder", onTurnorderChange);

  // On ready: migrate any wall-clock siphon expiries (pre-v2.84.0) to game
  // time, run one game-time sweep, and resync the tracker Round entry.
  on("ready", function() {
    const gc = state.MP_Engine.gameClock;
    Object.keys(state.MP_Engine.siphonPools).forEach(k => {
      const rec = state.MP_Engine.siphonPools[k];
      if (rec.expiry > 0 && rec.expiry < Date.UTC(2100, 0, 1)) rec.expiry = gc.ms + 3600000;
    });
    Object.keys(state.MP_Engine.conditions).forEach(tokId => {
      (state.MP_Engine.conditions[tokId] || []).forEach(c => {
        if (c.type === "absorption" && c.expires && c.expires < Date.UTC(2100, 0, 1)) c.expires = gc.ms + 300000;
      });
    });
    runGameTimeSweep();
    updateClockHandout();
    if (Campaign().get("initiativepage")) {
      const top = turnorderTopId(readTurnorder());
      if (!gc.topId) gc.topId = top;
      if (!gc.roundAnchor) gc.roundAnchor = top;
    }
  });

  ch("MP", `/w gm <b>MP Engine v2.101.0:</b> Loaded. Type <code>!mp help</code> for commands.`);

  return { CFG, CRIT_TYPES, FUMBLE_TYPES, CONDITION_MARKERS, rollExpr, visionLossInfo, visionAtkPenalty, rollAcquisition, observationLevel, getCharacterSenses, senseReach, getWeaknessFlags, parseIntervalSec, hasDiscomfort };
})();

on("ready", function() {
  log("MP ENGINE v2.101.0 READY");
});