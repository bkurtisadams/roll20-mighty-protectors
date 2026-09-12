# Mighty Protectors Roll20 API Engine - Changelog

Version-by-version history, extracted from the mp_engine.js header comment
on 2026-09-09. Order matches the original header: most entries are newest-
first (each new version was prepended over time), but the oldest run at the
bottom (v2.37 through v2.42.1) predates that practice and reads oldest-first.
Entries are verbatim from the header; nothing was reworded or reordered.

v2.167.2: MOOK TOKEN NAMES ON ONGOING-EFFECT CARDS. An area attack labelled
  its save/damage cards by token name ("Mutant (1)") via areaRec.tokens[].name,
  but every follow-up card for the condition it applied fell back to
  char.get("name") - so a group of unlinked mook tokens all reported as the
  shared character ("Pinky"), making round-by-round poison/paralysis prompts
  impossible to tell apart. All of these now route through displayName(tok,
  char): the round-advance "recovery saves due" list, the Recovery Roll card
  and the pending damage record it creates (so the apply card matches too),
  duration-tick damage/expiry lines, !mp conditions, !mp clearcond (single and
  --all), the status card, !mp restore, and the bleed tick / list / stop
  messages. Linked (PC) tokens are unaffected - displayName only prefers the
  token name for mook tokens (represents the character, bar1 unlinked).

v2.167.1: RW MAX ALL FOR NPC AREA DAMAGE. A large-group area hit (a 5"
  grenade blast, say) offered three roll-with buttons per NPC target,
  which doesn't scale. 4.8.3 lets any conscious, aware target roll with a
  hit - PC or NPC alike - so there's no rule distinction here, just a GM
  speed shortcut for the common case: new GM button "RW Max All (NPCs)"
  (shown once 2+ NPC targets are pending) resolves every pending NPC at
  Roll-With Max in one click via new !mp arearwmaxall. Player-controlled
  targets and any NPC already flagged sleepy/dead (no roll-with offered
  at all, per 4.8.3's conscious-and-aware requirement) are unaffected.

v2.167.0: CHANGELOG SPLIT OUT. The header changelog had grown to 1,707
  lines / ~115KB / 214 entries (12% of the file). All entries moved
  verbatim, in original order, to CHANGELOG.md in the repo root; header
  keeps only the current version and the last 3 entries plus a pointer.
  No entry text changed or was reordered - this is a pure relocation.

v2.166.3: AREA ESCAPE STANCE CHOICE FOR NPC BATCHES. Auto-Roll NPCs and
  Force All Escapes were always standing (never applied the Dive Prone +6),
  with no way to choose for a batch of mooks without rolling them one at a
  time. Each now has a matching (Dive Prone) button; !mp arearollnpcs/
  areaforceall take an optional --prone flag applied to every NPC rolled in
  that call. Individual areaescape --prone on one token is unaffected.

v2.166.2: The attack card's cost line showed "PR:-1" for a PR-1 spend -
  a debit indicator (same convention as Chg:-1c), not the raw sheet field,
  but easily misread as the field being negative. Reworded to "PR: 1 spent".

v2.166.1: !mp help SPLIT INTO SECTIONS. The help whisper had grown to ~8.9KB
  of single-message HTML across the night's additions, which some clients
  render as an unreadable wall of text. !mp help now whispers a short list
  of section names; !mp help <section> shows one category; !mp help ALL
  reproduces the old single-message dump for anyone who wants it.

v2.166.0: SIPHON ABILITY CAP FROM CPs. When the siphon row's Cap field is
  blank, the ceiling is derived per 2.1.16.5 as floor(total CPs / 5), with
  total CPs = starting_eps + ep_earned (spent total_eps as fallback). An
  explicit Cap still overrides. The over-cap note names the derivation.

v2.165.2: FIX GHOST ATTACK ROWS. setAttr/getAttr looked up repeating
  attributes case-sensitively; the sheet Roll button passes a lowercased
  attack_rowid, so the first siphon-pool write missed the real row and
  created attributes under the lowercase id, which Roll20 renders as a
  duplicate row. Repeating names now resolve case-insensitively and new
  attributes adopt the row's existing case. New GM !mp fixrows [--all]
  merges existing ghost rows (most-populated spelling wins).

v2.165.1: Area sweep labels mook tokens by token name (getTokensInRadius
  now uses displayName), so area, escape and apply-all cards match the
  single-target cards.

v2.165.0: GROUND POINT TARGET. A character named "Ground" (or with attribute
  point_target = 1) is a movement space: area attacks aimed at its token use
  the existing point-target path (no defenses, +6 immobile, scatter), it is
  never swept by an area, and single-target attacks against it are refused.
  Because it is a real character, the sheet Roll button's @{target|...}
  lookups resolve, so both the sheet and !mp atk can aim at the ground. New
  player command !mp ground places the page's Ground token beside the
  selected token (spawning it from Ground's default token if absent, with
  Bar 3 = 0); !mp ground --off removes it.

v2.164.1: FIX areaOffset read isAreaAttack before its declaration (TDZ
  error on every attack). Flag now computed after the area fields.

v2.164.0: AREA EFFECT OFFSET. Attack Notes code "offset" marks an Area
  Effect with the Offset Modifier (+2.5): after the hit/scatter point is
  fixed, the area's center moves one radius directly away from the attacker
  so its edge sits on the point of creation. A self-centered origin (touch
  on the attacker's own space) uses the attacker token's rotation as the
  direction. The area card states the shift; the marker and token sweep use
  the shifted center. Pending records now carry atkTokenId. Listed in
  !mp attackcodes. Engine-only: no sheet field.

v2.163.0: !mp mookcheck [--fix] [--all]. GM audit of the current page (or the
  selected token's page): every character with 2+ tokens is listed with each
  token's bar1/bar2 link state, and linked bars on a multi-token character
  are flagged as sharing the sheet's Hits/Power pool. --fix unlinks bar1/bar2
  on flagged tokens and copies the sheet current/max into the token bars.
  --all lists single-token characters too.

v2.162.1: MOOK TOKEN NAMES ON CARDS. Attack, apply, knockback and limb-save
  cards label a mook token (unlinked, represents the character) by its token
  name ("Mutant #1") instead of the shared character name ("Pinky"), for both
  attacker and defender. Linked tokens still show the character name. The
  autofire announce line does the same.

v2.162.0: PER-TOKEN CHARGES FOR MOOKS. A token that represents a character
  but has no bar1 link (the same signal getResource uses for Hits/Power) now
  carries its own charge magazine in state.MP_Engine.tokenCharges, seeded
  from the sheet row's attack_charges the first time that token fires.
  Linked (PC) tokens keep using the sheet row. Attack, autofire, the
  no-charges gate, the last-charge whisper (now names the token), the card
  readout ("(N tok)") and undo refunds all route through getCharges /
  setCharges. Magazines are pruned on token destroy. New !mp charges (ammo
  readout for selected tokens) and GM !mp reload [--all] (reset to sheet).
  Vehicle systems unchanged. On a mook sheet the Ch field now means
  magazine size rather than current count.

v2.161.1: MOOK ATTACKER FALLBACK + DIAGNOSTIC. When a character has 2+
  tokens and no attacker token was identified, the candidate whose turn is
  at the top of the Turn Tracker is used. The duplicate-token refusal now
  reports what arrived in {{atktok=...}} so a sheet that is not passing the
  selected token id can be told apart from a token on the wrong page.

v2.161.0: HEAD AVOID HELMET BYPASSES HELMETS ONLY. Head Avoid Helmet (-9,
  4.14.2.1) previously used the "partial" tier and stripped every Light or
  Heavy partial-coverage row, body armor included. New "helmet" tier skips
  only partial-coverage rows (armor or force field) whose prot_name reads as
  head gear (helm, mask, hood, visor, cowl, headgear, face plate, head).
  Full-coverage rows and unnamed partial body armor keep protecting. With no
  matching row the apply card shows [no helmet to avoid] and the attack
  resolves as a plain head shot with the -9 already paid. Sheet: new
  "Multi-token" checkbox makes the Roll buttons pass {{atktok=@{selected|token_id}}}
  so mook (unlinked multi-token) characters can attack from the sheet.

v2.160.0: DAMAGING RADIATION / ENVIRONMENT SAVE CONDITIONS. Save attacks that
  deal recurring non-poison damage (Change Environment: Damaging with the Hard
  Radiation modifier, or any attack with damage subtype "radiation") no longer
  fall through inferConditionType's EN+Entropy heuristic and land as PARALYZED
  with no damage. New condition types damaging_radiation and
  damaging_environment are recognized before that heuristic, join
  damaging_poison in conditionDealsDamage, and follow the Damaging Poison rule
  that protection applies to the damage rather than the save TN. Condition
  records now carry dmgSubtype so recovery-tick protection honors subtype-
  specific rows (e.g. Adaptation: Energy radiation). Recurring-damage labels
  say "(Poison)" only for actual poison conditions. Single-target and area
  save paths both updated. inferConditionType gains an optional dmgSubtype arg.

v2.159.1: SUPER SPEED CHECKBOX FIDELITY. Initiative automation now treats only
  the sheet checkbox value "1" as enabled. Legacy values such as on/true/yes
  can display unchecked in Roll20 when the checkbox value is 1, so accepting
  them caused unwanted Super Speed rolls from an apparently unchecked sheet.
  Both !mp initselected and the normal Initiative watcher share the same strict
  checkbox helper.

v2.159.0: BULK INITIATIVE SORTING. !mp initselected now sorts the completed
  Turn Tracker descending by default, matching the normal highest-first MP
  initiative workflow. Optional --sort asc, --sort desc, and --sort none
  select ascending, descending, or unsorted behavior. Super Speed custom turns
  are re-sorted into the same order after their asynchronous extra rolls finish.

v2.158.0: INITIATIVE CHAT + TURN ORDER CLEAR. !mp initselected now posts a
  visible normal Initiative chat card for every successfully rolled selected
  token after the callback-only inline roll is resolved. New GM-only
  !mp clearturnorder empties the entire Roll20 Turn Tracker, clears recorded
  Super Speed custom-turn state, and resets the round-wrap anchor without
  changing the current MP round or closing the tracker.

v2.157.0: SELECTED-TOKEN INITIATIVE. New player-accessible !mp initselected
  command rolls initiative publicly for every selected represented token,
  replaces those selected tokens' existing real Turn Tracker entries while
  preserving unrelated entries, and then reuses the existing Super Speed
  extra-turn machinery. Ordinary turns remain token-linked; AG/100 remains
  the hidden tracker tie breaker exactly as on the sheet Initiative button.
  API-generated bulk initiative rolls are ignored by the normal sheet-roll
  Super Speed watcher so extras cannot be created twice.

v2.156.1: ATTACK NOTES HELP CARD READABILITY. Replace Roll20-styled <code>
  elements with explicit dark high-contrast span chips so Notes codes and aliases
  remain legible in chat. No attack parsing or resolution behavior changes.

v2.156.0: ATTACK NOTES HELP CARD. New player-accessible !mp attackcodes command
  prints a private chat reference for every supported Attack Notes tag and alias.
  Sheet v44.89 adds a ? button beside the Notes header that calls this command.
  Also corrects MP_VERSION, which was accidentally left at 2.153.0 in v2.155.0.

v2.155.0: ATTACK NOTES RUNTIME RESOLUTION. !mp atk and !mp atkinfo now parse
  the supported Attack Notes tags at resolution time and overlay them on the same
  repeating attack fields used by the cog panel. This removes the dependency on a
  sheet-worker sync firing before an attack is rolled. A bare grapple tag therefore
  resolves as a real Grapple even if attack_is_grapple was not yet populated. The
  resolver also masks the legacy v44.87-era false AP ALL residue caused when the
  letters "ap" inside "grapple" were previously misread as a bare AP tag; an
  explicitly written ap/ap:ALL tag still wins.

v2.154.0: ATTACK NOTES CONFIGURATION FOLLOW-UP. The attack resolver remains
  attribute-driven: sheet v44.87 Notes tags populate the same repeating attack
  fields as the cog panel, so !mp atk needs no parallel Notes-only rules path.
  !mp atkinfo now also reads those populated fields instead of reparsing the old
  sav:/snr: Notes dialect, keeping readable aliases and new advanced tags in sync.

v2.153.0: SUPER SPEED CHAT CLARITY. After the existing normal Initiative roll,
  extra Super Speed initiative rolls remain public in chat, then a summary card
  shows the individual roll sequence and the cumulative initiative phases (for
  example rolls 5 + 6 + 2 => phases 5 / 11 / 13). Hidden AG/100 tracker
  tie-break fractions are excluded from the displayed RAW initiative phases.

v2.152.0: SUPER SPEED UI FOLLOW-UP. The Super Speed checkbox is now persistent
  between rounds; initiative processing no longer clears the character attribute.
  The custom Turn Tracker automation and ordinary Initiative path are unchanged.

v2.151.0: SUPER SPEED INITIATIVE via custom Turn Tracker items. The existing
  sheet Initiative roll and &{tracker} path remain untouched. The engine watches
  the normal public Initiative roll-template message; an armed character's
  Super Speed checkbox causes the engine to roll only the configured extra
  initiatives, display those rolls in chat, add each cumulative result as an
  id:-1 custom tracker item using the character's name. No PR is spent or tracked.
  Prior engine-created Super Speed custom
  items are removed on that character's next normal initiative roll. Custom
  tracker items are ignored by the round-wrap anchor so extra turns cannot be
  mistaken for a new combat round.

v2.148.1: STARTUP / CHAT HARDENING. Register add:attribute only after
  Roll20 ready so existing campaign attributes do not replay through the add
  handler at startup. Wrap chat dispatch so attack/command exceptions are
  logged and whispered to the GM instead of failing silently. Startup logs
  now distinguish chat registration and ready initialization.

v2.148.0: PARTY REST / POWER RECOVERY. New GM-only !mp rest N unit
  command advances the shared campaign clock once while all selected character
  tokens rest simultaneously. Each selected character restores 1 Power per
  full minute elapsed, capped at that token/character's maximum Power. Rest
  never spills into Hits and vehicle-mode tokens are skipped. Fixed time units
  share the game-clock aliases (sec/min/hour/day/week); durations under one full
  minute are rejected because they cannot restore Power. Ordinary !mp time
  advancement remains recovery-neutral.

v2.147.0: PLAYER-FACING SHEET MAINTENANCE. New !mp maintenance command
  scans a controlled character for known obsolete sheet data and reports a
  compact private health card instead of requiring F12-console diagnostics or
  raw repeating-row IDs. The first recognized cleanup target is the retired
  repeating_veh_systems section (current section: repeating_vehsystems), plus
  the old cleanup_orphan_id helper attribute. Cleanup requires a second
  confirmation click and re-scans immediately before deletion. Current attacks,
  protection, abilities, careers, vehicle systems/protection/key rows are never
  auto-deleted; unknown repeating data is reported and left untouched.

v2.146.0: SAVE/SNARE ATTACK CARD REDESIGN. Non-damage attacks (Flash,
  Mind Control, Emotional Control, Paralysis Ray, Transmutation, Grapnel,
  Ice Blast...) no longer show a meaningless "0 DAMAGE":
  - 4th grid cell: no-damage save attacks show the RESOLVED save TN
    ("EN 4-", hover = full math); snare attacks show the Snare BP;
    damaging save hybrids keep the Damage cell. Grip cell unchanged.
  - New effect strip under the number grid (color keyed by effect
    family): save spec with the TN assembly spelled out, recovery mod +
    interval, duration, recurring damage for damaging saves; snare
    strips restate the v2.145 restraint rulings and fumble-only line
    hits, with BP/max and snare type.
  - Type line reads "Effect: Non-damage" for these attacks.
  - Make Save / Save + Roll-With button labels carry the resolved TN.
  - saveTNPreview(rec) mirrors cmdSave's TN assembly (base save,
    protection/invuln/adaptation with the poison/sense-loss/transmutation
    gates, attack save mod, Solid Hit, push, vulnerability) minus
    roll-with and GM overrides; the save resolution card stays
    authoritative.
-- v2.145.0 - 2026-08-12

v2.145.0: SNARE/RESTRAINT RULINGS + MENTAL AREA ESCAPES.
  (1) Grapnel intercept (author ruling, supersedes 4.14.2.9): a standard
  attack on a snared target only hits the snare on a FUMBLE, and taking
  that hit is a GM option (button; replaces the fumble-table result if
  used). The "Avoid Snare" called shot is removed from the engine maps
  and the sheet query - no called shot is needed to shoot past a snare.
  (2) 4.7.2 status bonuses retiered per 3.0.2.6 and made additive:
  snared/grappled +3, fully restrained (locked hold / limbs bound) +6,
  prone +3, unconscious/paralyzed +6 no-def - and they STACK (grappled +
  paralyzed = +9, no def). Calc row shows "Tgt status" when stacked.
  (3) 4.7.5.2 leap clear now keys off mental_def when the area attack is
  Mental/Emotional (atkTypeCode carried through pending -> pendingArea);
  shield block is suppressed and refused vs M/E areas. Applies to the
  escape buttons, areaescape, arearollnpcs, and areaforceall.
  (4) Wakeup vs unlinked tokens: the sheet Wake button now routes through
  !mp wakeup --charid instead of a local roll vs @{hits_score}, and
  cmdWakeup resolves the token from --charid/selection, so mook tokens
  wake against their own bar hits rather than the shared sheet value.
  (5) 3.1.5 OBVIOUSNESS GATE on target acquisition. A visible target
  that isn't sneaking/invisible/blurred, within sense reach, with no
  negative perception-range mod (attacker not inside a Darkness field)
  is auto-acquired without a 4.6 roll: Full+ vision auto-IDs; effective
  Basic vision (dim light, Nearsighted, Dazzled-to-Basic) auto-acquires
  at "-3" crude - a flat targeting penalty, deterministic, no free-check
  consumed, nothing cached. Fixes "attacking blind (-6)" against a
  plainly visible adjacent target on one bad IN save in dim light.
  Symmetric on the defender side: obvious attacker crudely perceived =
  flat -3 defense, no roll. The 4.6 table still rolls for genuinely
  contested perception (stealth, invisibility, Darkness fields, range,
  reach checks, non-visual fallback senses). Scan reports auto-crude
  contacts as "[-3] crude targeting" instead of "clearly visible";
  Locate and !mp perceive (an explicit check) are unchanged.
  (6) TELESCOPIC EXTENDS REACH. Telescopic magnification (x4 per rank)
  now multiplies a ranged sense's IN/2" reach cap in senseReach - both
  the non-radiating usability cap and the radiating automatic zone
  before the IN+6 check route. Previously sense_tele on a non-radiating
  ranged sense (e.g. Motion) was dead CP: the bonus was returned but
  the cap ignored it, so a low-IN creature's motion sense was unusable
  past 1" regardless of Telescopic ranks.
  (7) !mp test vision - GM self-test for the acquisition/vision pipeline.
  Select observer then target. Part A: forced-roll checks of the 4.6
  table rows, sneak gate, tier effects, defense penalties, senseReach
  caps (incl. Telescopic x4/rank) and range-mod clamping. Part B: live
  observationLevel scenarios on the real map - illumination report with
  a legacy-light-fields warning, obviousness gate (auto-ID / auto "-3"
  under Dazzled 1), Darkness-field disqualification, sneaking (Full
  silent vs Basic crit-gated), invisible fallback, and blur. Snapshots
  and restores both tokens' conditions; writes no acquisition cache.

v2.144.0: PERCEPTION AUDIT FIXES. !mp perceive now routes the visible
  sense through visionLossInfo, so Blinded/Dazzled/Darkness/Glare
  conditions cap both the default best-sense pick and the rolled sense
  level (previously the command used the raw sheet level). Amplified
  Sense ranks are now a shared pool: ranks spent negating a Darkness
  condition are no longer reused against environmental dim light or
  darkness in observationLevel.

v2.143.0: DYNAMIC-LIGHTING-LAYER LIGHT SOURCES. roll20Illumination now
  counts light emitted by tokens on the Dynamic Lighting ("walls") layer,
  the standard placement for fixed room lighting. Previously such sources
  were skipped, so a visibly lit room evaluated as total darkness and
  dropped the observer to crude acquisition (-3 to hit).

v2.142.0: FLASH FUMBLE AND CONDITION CLEANUP. A fumbled initial Flash
  save now creates the existing permanent Blinded condition instead of
  freezing the attack's ordinary 1-3 level dazzle. Blinded explicitly
  reduces visible-light sense to None, while Protected Sense continues to
  mitigate ordinary Flash loss. Flash cards, status output, and the
  deterministic Flash self-test now distinguish dazzle from blindness and
  report the actual number of levels lost. Removed unused facing,
  controller/whisper, and protection wrapper helpers; removed the orphaned
  Feared condition remnants; cleaned stale call arguments; and removed
  unconditional recovery-debug console noise.

v2.141.0: PASSIVE SCAN CLOSED-BARRIER FIX. !mp scan no longer treats every
  character token behind a closed door or sight-blocking wall as an
  automatically available sound/odor stimulus. During the page-wide passive
  sweep, a non-Penetrating sense cannot discover a contact through a blocking
  barrier; vision was already blocked, and ordinary hearing/scent now remain
  silent instead of turning the map into token radar. Opening the door makes
  the contact eligible on the next Scan. Penetrating senses still cross the
  barrier, subject to their listed blocking material and GM adjudication.
  Targeted !mp perceive checks now use the same Roll20 barrier/environment
  resolver: vision cannot pass a closed door, while an explicitly adjudicated
  audible stimulus may be heard through it at the existing -3 dampening
  modifier. Environment loss, Amplified Sense, and the applied modifier are
  shown on the Perception card.

v2.140.0: !mp test damage --sub:SUBTYPE. The test damage command now
  accepts a damage sub-type flag (e.g. !mp test damage 10 energy
  --sub:radiation) and sets dmgSubtype on the pending record, so
  subtype-specific protection and Adaptation rows match exactly as they
  do on real attack cards. The test card shows the subtype on the type
  line, passes it to the protection preview, and now flags Adapt 1/2
  alongside Invuln 1/4. Help text updated.

v2.139.0: FIX AP BYPASS VS ADAPTATION WHEN INVULNERABILITY PRESENT.
  Per 2.9, unused Armor Piercing after Armor immunizes that many damage
  points from Invulnerability's reduction. The adaptation step subtracted
  (afterArmor - leftoverAP) from the bypass when Invulnerability was also
  active, wrongly halving AP-immunized points (10 dmg, 2 armor, AP 6,
  invuln+adapt resolved to 2 instead of 4). Bypass now carries through
  both fractions unchanged, matching the adapt-only path.

v2.138.0: AMERICAN-STYLE GAME CLOCK DISPLAY. Game-time cards, notices,
  timer expirations, and the persistent clock handout now display the
  weekday and 12-hour time first, followed by the month-first date in
  parentheses: Winds Day 2:30 PM (Jan-You-Ary 1, 2526). Seconds appear
  only when the campaign timestamp is between exact minutes, preserving
  ten-second combat-round precision without cluttering narrative time.
  The handout uses the same layout and removes its duplicate ISO date.
  Gamma World weekday labels now use spaces rather than hyphens.

v2.137.0: TIMED ABILITY CHARGES. Repeating ability rows now connect their
  On/Held/Off state, Charges, and Duration fields to the campaign clock.
  Turning a finite-charge ability On spends one activation charge and arms
  its paid interval. Every forward !mp time / round advance processes all
  crossed renewal boundaries in one sweep; each boundary spends another
  charge while the ability remains On. If no charge is available, the API
  switches the ability Off at the exact game-time boundary where its last
  paid interval ended. Large jumps are calculated directly for fixed units
  rather than simulated round by round. Hours, minutes, days, weeks, rounds,
  calendar months, and calendar years are supported. Blank Charges remain
  manual; -1 remains unlimited. Active timers persist in state, survive API
  restarts, can be inspected/resynced with !mp abilitytime, and are cancelled
  when an ability is Held, Off, broken, or removed. Existing On abilities are
  adopted on startup without spending a migration charge. Also fixes repeat
  hits with non-round Duration: fixed and calendar expirations now extend
  cumulatively instead of incorrectly reporting 0 rounds and retaining the
  original expiry.

v2.136.0: GAME-TIME CONTROL PANEL + CALENDAR-AWARE ADVANCE. !mp time now
  opens a GM control card with one-click round/minute/hour/day/week/month/
  year buttons, a custom amount+unit query, and a set-date/time query. The
  typed command still accepts the old syntax, now adding month(s), year(s),
  mo, and yr aliases. Calendar months/years use clamped UTC date arithmetic
  (Jan 31 + 1 month becomes Feb 28/29 rather than spilling into March).
  FIX: !mp time advance N rounds now routes through advanceRound(N), keeping
  currentRound, recoveries, round durations, acquisition pruning, and active
  per-round costs synchronized with the ten-second clock. Date/time setting
  now rejects impossible dates and invalid hours instead of letting the JS
  Date constructor silently normalize them. The handout and chat clock use
  a configurable twelve-name calendar; set display aliases persistently with
  !mp time calendar months Name1|Name2|...|Name12, inspect them with
  !mp time calendar, or restore Gregorian labels with calendar reset. Month
  aliases change display names only; the underlying month lengths remain the
  normal Gregorian lengths used by the existing timestamp clock. Month/year
  duration expiries now use the same clamped calendar arithmetic instead of
  fixed 30-day/365-day approximations.

v2.135.0: PROFILE-AWARE PERCEPTION RANGE (3.0.2.5 / 4.7.3.1). Every
  perception/acquisition path with a specific subject now uses actual range
  × observer Profile ÷ subject Profile before looking up the range
  difficulty. The attack, scan, locate, reverse defender-acquisition, and
  sight-diagnostic paths already supplied both character IDs; !mp perceive
  did not, silently treating every subject as Profile 1. That path now uses
  the subject's character Profile too. Profile parsing also accepts numeric,
  xN, /N, and N/D forms defensively. Perception, Scan, attack-acquisition,
  and !mp sight cards now expose actual range, both Profiles, effective
  range, and the resulting range modifier so the rule can be audited live.
  A negative effective range modifier now makes even a Full or Analytical
  sense roll for a distant target under 3.1.5. Radiating Ranged senses also
  explicitly require the alternate IN+6 check once actual distance exceeds
  IN/2; previously Full vision stayed automatic, so the Profile-adjusted
  modifier was calculated but often never entered a perception roll.
  Added !mp test profile for deterministic 4.7.3.1 regression checks.

v2.134.0: NORMAL-SENSE AND TARGET-ACQUISITION CORRECTIONS. Characters now
  always begin with MP's six free human senses; active default-sense rows
  can improve or modify that baseline but cannot silently downgrade it. A
  Level=None row remains the explicit Diminished Sense removal. Roll20 token
  Vision, Night Vision, light-sensitivity, Limit Field of Vision, and token
  rotation no longer define MP senses or character facing. Map illumination
  and barriers still describe the environment. Dim and total darkness reduce
  visible-light sense level per 4.6.1 instead of merely forcing a roll or
  bypassing the sheet model. observationLevel now compares every applicable
  sense, including vision, and selects the best effective sense. Walls damp
  sound/odor rather than universally erasing them. Sneaking opposition now
  uses the full 3.0.2.4 formula (10 - opposing save). Critical-confirmation
  rolls honor natural 1/20. Defender perception is resolved through the same
  acquisition pipeline instead of a flat vision-loss flag.

v2.133.0: APPLY INERTIA TO KNOCKBACK. cmdKnockback rolled bare Mass, so the
  Inertia Physical Ability (C) never reduced knockback. Inertia is Continual
  at PR 0 per round and adds +1 per purchase to the Mass roll vs Knockback,
  so it always applies; the sheet already derives kb_resistance by summing
  ability_kbres_mod across ability rows, and cmdHTHMass was the only command
  reading it. A character with Inertia therefore got a different Mass total
  from the tug-of-war command and the sheet's own Mass button than from the
  knockback that actually resolved.
  Card itemizes the dice and the Inertia bonus separately when non-zero.
  Vehicles get 0: Inertia is a character Ability and vehicle knockback rolls
  vehicle_mass.
  NOT folded in, both being conditional on holding on and left to the table:
  Extra Limbs (Physical Ability B) adds +1 only while holding on, and 4.8.5
  lets a braced or hanging character substitute Base HTH for Mass when the
  HTH dice are better, or deduct Base HTH in addition to Mass when the
  knockback direction is down.

v2.132.0: SHOW MACRO --mod IN THE TO-HIT BREAKDOWN. A modifier passed to
  !mp atk --mod was applied to the roll but appeared nowhere on the card,
  and the hover subtotal silently excluded it, so the breakdown did not add
  up to the To-Hit number printed beside it.
  Cause: the sheet sends hitmod as aim+multi+other+called_mod AND sends
  those four again as separate display fields, so the subtotal itemizes the
  display fields rather than macroMod - correct there, and macroMod was
  added back only for vehicles, whose hitmod carries wpnmod+targbonus
  instead. !mp atk sends its --mod in hitmod with none of the display
  fields, so it fell through both paths.
  Fix itemizes the residual - macroMod minus whatever the display fields
  already account for - so sheet attacks are unchanged (residual 0),
  vehicles are unchanged, and a macro modifier now shows as its own line in
  the hover and on the Modifiers row. A stale sheet with called_mod baked
  into hitmod still nets to zero residual because calledNumeric is included
  in the itemized total.
  Reconciliation checked across sheet, stale-sheet, vehicle and macro paths.

v2.131.0: DEFAULT COLUMN FOR CRIT ROWS 7-8 (4.7.6). Both rows are
  conditional on their face - they strike an unprotected spot only "if the
  target has Armor ... and that Ability offers only [Light] Partial
  Coverage" - so a roll of 7 or 8 against a target with nothing matching to
  avoid is exactly what 4.7.6 means by an inappropriate result. Both carry
  Default 15, Solid Hit, so RAW turns the dud into +3 damage. Previously it
  silently did nothing.
  This was listed as a GM judgment call because partial coverage was not
  mechanically detectable. v2.130.0 made it detectable.
  hasAvoidableProtection() reuses sumProtectionWithHardened with the same
  avoidTier cmdApply uses, so the substitution test and the damage
  resolution cannot disagree about what counts as avoidable - same row
  filters, same subtype matching. Force fields are checked too, since rows
  7-8 say "any similar protective Ability".
  Vehicles are excluded: their rows carry no coverage field and cmdApply
  still gives them the flat bypass, so an avoid result is not inappropriate
  against them. Revisit together if vehicle armor ever gets coverage.
  Attacks with no damage type (protKey null) never substitute - the engine
  cannot tell what would be avoided, so it leaves the call to the GM.
  Reachable from the harness: !mp test crit armor / light against a target
  whose Coverage rows you control.

v2.130.0: MODEL PARTIAL COVERAGE (4.14.2.4). Avoid Armor crits, the -3/-6
  avoid-armor called shots and Head Avoid Helmet all bypassed ALL protection.
  RAW is narrower: crit row 7 avoids armor offering only LIGHT Partial
  Coverage, row 8 avoids LIGHT OR HEAVY, and armor without the Partial
  Coverage Modifier cannot be avoided at all. Full-coverage armor now keeps
  protecting through an avoid result.
  No new data model was needed. The sheet already has a per-row
  prot_coverage select (full / heavy / light) and the engine already read it
  for area-effect penetration; it simply never reached the avoid path.
  sumProtectionWithHardened takes an avoidTier and skips only the rows that
  tier beats, returning what it skipped so the card can report it.
  Because avoided rows are now excluded from the total rather than the total
  being zeroed, AP and Hardened work normally against whatever armor is left
  standing. bypassProt survives as the flat legacy bypass for vehicles (no
  coverage field), the --noprot test flag, and pre-coverage cards, which
  resolve to tier "all".
  A Force Field is "a similar protective Ability" under rows 7-8, so it is
  avoided only when its own row carries the modifier. Defaulting to full
  coverage means fields stop being bypassed for free.
  Apply-mode strings are UNCHANGED - noprot still means noprot, so old cards
  still resolve and damageApplyProfile / applyModeName / allowedApplyModes
  stay in sync. Only the meaning at application time narrowed.
  Remaining approximation: Head Avoid Helmet (-9) resolves as partial
  coverage rather than avoiding the helmet specifically, because there is no
  per-piece armor model. It no longer strips full-coverage body armor.

v2.129.0: Comment out the called-shot DEBUG whisper. It printed
  raw / input / resolved to the GM on EVERY attack, not just called shots.
  Uncomment it in the called-shot parser if a shot ever resolves to the
  wrong type again.
  DESIGN DECISION, not a gap: limb loss consequences (4.14.2.2 movement
  halving, 4.14.2.3 carrying capacity) are deliberately NOT automated. A
  failed EN+7 save sets the broken-leg or broken-shield marker and stops
  there; the token icon says the limb is unusable and the GM adjudicates
  movement and carrying at the table. This was implemented once (good-limb
  counting via limb_lost condition records, per-character limb totals, a
  !mp limbs command) and backed out as too much automation. Do not
  re-implement it without asking.

v2.128.0: IMPLEMENT 4.14.2.9 AVOID SNARE. 4.7.2 grants +6 to hit a completely
  immobile target and names snared explicitly, so the bonus was correct, but
  the offsetting half of the trade was missing: a standard attack on a snared
  target must be a called shot to avoid the snare or it hits the snare
  instead. Attacking a snared target was therefore pure upside. New "Avoid
  Snare" called shot at -3, the book's baseline for every called shot that
  isn't head-sized or heavy armor; 4.14.2.9 states no number of its own.
  +6 (4.7.2) minus -3 nets +3, the same band 4.7.2 gives a prone target.
  Without the called shot the damage roll is compared to the snare's break
  point (4.10): meeting or exceeding it frees the target, otherwise the snare
  holds. No accumulation - 4.10 requires the break point on a single roll, so
  a hit either breaks it or does nothing. The target takes no damage, no
  knockback and no limb saves, and target-side crit effects (Off Balance,
  Muscle Strain) are suppressed because the target was not hit. The damage
  phase is marked resolved so a hand-typed !mp apply is rejected.
  Gated on an engine snare record carrying a break point, NOT on
  defRestrained: 4.11 has no grapple equivalent of 4.14.2.9, and a
  hand-badged cobweb has no break point to roll against. The +6 itself still
  keys on defRestrained and is unchanged.
  Snare coverage is not modelled, so the penalty is flat rather than scaled
  by snare type. That is the same gap as the armor Partial Coverage Modifier
  (4.14.2.4); one flag would close both.
  A stale sheet sending -3 still degrades to generic "Called", which does not
  count as Avoid Snare and so hits the snare. The stale-sheet warning fires.

v2.127.0: PUBLIC CARD BODIES, PRIVATE BUTTONS. With GM_ONLY_BUTTONS the card
  itself was whispered only to the attacker's and defender's controllers, so
  the rest of the table could not see what was happening. New PUBLIC_CARDS
  flag sends every card body to everyone while the button groups stay
  whispered to the controlling player and the GM, so players follow the whole
  fight but can only act for their own characters. New chCardBody() decides
  body routing in one place; chCombat, chPendingCard and the six area /
  reflection sites all route through it. Set PUBLIC_CARDS false to restore
  the old behaviour.
  cmdAreaDamageAll had NPC roll-with buttons and the GM's "Apply Rest (No RW)"
  button built into the card body, so making that body public would have
  handed every player control of the GM's tokens. They are now collected
  separately and whispered.
  Hiding a button is presentation, not the security boundary: every command
  already runs requireControl / requirePendingRole, so a player who retypes
  the API call for someone else's character is still rejected.

v2.126.0: MAKE THE STRAIN ROWS TESTABLE. Muscle Strain needs a natural 1 that
  confirms and then rolls exactly 9, or a natural 20 that fails confirm and
  rolls 9-10 -- roughly 1 in 300-400 attacks each, so v2.125.0 shipped
  unverifiable at the table. testForceCrit now posts the strain child card
  for crit row 9, and testForceFumble applies its result instead of only
  printing a label: Off Balance via applyOffBalance, Muscle Strain via the
  child record, Leg/Arm Strain as the flat 1 Hit with the footnote. It reads
  the SELECTED token as the fumbler and takes --push N so the pushing bonus
  can be checked landing inside the halving rather than after it. With no
  token selected it prints and applies nothing, as before.
  testForceFumble applying nothing is why the bundled 1-Hit strain bug
  survived as long as it did; every fumble row was unverifiable.
  The strain child record is extracted into postStrainCard() and shared by
  the attack handler and both test commands, so the three paths cannot drift.

v2.125.0: MUSCLE STRAIN PER RAW. Crit row 9 and fumble rows 9-10 were both
  implemented as a flat 1 Hit deduction with no protection and no roll-with.
  RAW is the strainer's OWN Base HTH damage, plus the pushing bonus if they
  were pushing (fumble only), halved and rounded UP, with protection applying
  and roll-with allowed. New rollMuscleStrain() rolls it; the result is
  emitted as a child pending record routed through the normal damage pipeline
  so the Apply / RW Max / RW Custom buttons behave exactly as they do for any
  other damage. Crit strain rolls the TARGET's HTH, fumble strain rolls the
  ATTACKER's.
  Fumble Leg Strain and Arm Strain were bundled into the same branch and are
  now split out. Those two ARE a flat 1 Hit, and the table's footnote denies
  protection and roll-with, which the old code got right only by accident of
  sharing the muscle strain path. They keep the direct deduction and now say
  so on the card.
  Vehicles are excluded from both strains; applyCritDefault already
  substitutes Muscle Strain away for vehicle targets, this is belt and braces.

v2.124.0: !mp test crit takes --called TYPE. The 4.7.6 Default column was
  otherwise unreachable from the test harness: substitution happens in the
  attack handler, and testForceCrit built its own pending record with no
  called-shot context, so forcing a type bypassed it. Exercising it for real
  needed a natural 1 that also confirmed, on a called shot -- roughly 1 in 40
  attacks. --called now sets the called shot flags on the test record, runs
  applyCritDefault over the forced or rolled result, and reports both the
  rolled result and the substitution reason on the card.
  Also fixes testForceCrit calling buildStandardAttackButtons with three
  arguments: rec was undefined, so composite apply modes and limb-save
  buttons never appeared on a test crit card even before --called existed.
  --damage N now works as a flag as well as positionally.

v2.123.0: FIX CALLED SHOT TYPE NEVER REACHING THE ENGINE. Roll20 asks a roll
  query once per prompt LABEL and substitutes that one answer everywhere the
  label appears. called_mod_query and called_type_query both prompted
  "Called Shot", and the mod query comes first in the roll button, so
  calledtype received the NUMBER instead of the name. Head shots appeared to
  work only because -6 reverse-mapped to Head; -3 is ambiguous across Arm,
  Leg, Avoid Light Armor and Gear and degraded to generic "Called", so limb
  shots never produced their saves. Worse, an Avoid Heavy Armor called shot
  sent -6 and was silently resolved as a HEAD SHOT, doubling Hits.
  initQuerySettings now keeps exactly one of the two queries live: with the
  API on, only the type query, and the engine applies the penalty; with it
  off, only the mod query, and the sheet applies it as before. Non-API play
  is unchanged -- same prompt, same math, no engine involvement.
  targetTotal adds calledShotPenalty only when the sheet did not already bake
  it into hitmod, so sheets whose query attributes have not refreshed yet
  cannot double-count. Opening a character sheet refreshes them.
  Side effect: !mp atk --called never applied the penalty at all (it sends
  the raw attack_tohit_num and no called field). It does now.

v2.122.0: IMPLEMENT 4.7.6 DEFAULT COLUMN. The critical and fumble tables each
  carry a Default column the engine never read: "If the result is
  inappropriate, switch to the Critical listed in the Default column." This
  replaces v2.121.0's supersede-and-discard behaviour, which was a house rule
  invented to fill a gap the rules already cover. A called head shot that
  crits into Arm Shot no longer drops the crit -- Arm Shot is inappropriate,
  so it becomes its default, Solid Hit (+3 damage). Crit 18 on a declared
  head shot likewise becomes Solid Hit rather than doubling twice or doing
  nothing. Gear Shot defaults to Precise Hit; everything else defaults to
  Solid Hit. Substitution chains (max 4 hops) and is reported on the card.
  Auto-substitutes only where the conflict is mechanically detectable: a
  declared called shot vs a crit naming a different location (or the same
  one, which grants nothing new), and biological results against vehicle
  targets. Cases needing GM judgement -- no breakable gear, no partial
  coverage, target already prone -- are left alone. Fumbles substitute for
  vehicle attackers only (no legs, arms or muscles to strain).
  Limb saves: natural 1 now always succeeds per 3.0.1. Previously enough Hits
  drove the AG target number to zero or below and the defender could not
  succeed at all, since only the natural 20 auto-fail was implemented.
  Called shot desync guard: the sheet asks for the called shot twice
  (called_mod_query for the to-hit math, called_type_query for the parser)
  as two prompts with the same label, so setting one and not the other
  applied the penalty with no called shot attached and no limb saves. The
  engine now whispers the GM when a nonzero penalty arrives with type None or
  generic Called. Adds -9 to the penalty reverse map for the helmet shot.
  Crit row 8 relabelled "Avoid Armor" (Light OR Heavy partial coverage) and
  row 7 "Avoid Light Armor"; both also avoid cover, which is still unmodelled.

v2.121.0: COMPOSITE APPLY MODES + AVOID HELMET CALLED SHOT. 4.14.2.1 doubles
  Hits as the LAST step ("after determining the number of Hits which get past
  the target's protection, rolling with damage"), so a head shot never
  competes with a crit-table result -- Solid Hit's +3 lands on the damage
  roll, Avoid Armor changes what protection applies, Precise Hit halves
  roll-with capacity, and the doubling happens after all of it. cmdApply
  already read every modifier as an independent substring flag in exactly
  that order, but the button builders picked ONE branch from an exclusive
  else-if chain and so never emitted a composite mode: a called head shot
  silently ate Solid Hit, Avoid Armor and Precise Hit. New damageApplyProfile()
  derives the flag set once and applyModeName() composes the mode string from
  it; allowedApplyModes() and both builders now share that single source, so
  the whitelist can no longer drift from the buttons. Legacy mode strings are
  unchanged for every single-modifier case; head shot gains the RW Max button
  it was missing.
  Head shot supersedes a crit-table LOCATION result (rows 1-2 Gear, 5-6 Leg,
  10-11 Arm) -- one blow lands in one place, and the declared called shot is
  what the attacker paid -6 for. Those rows are purely a location assignment,
  so they are discarded rather than layered; the card says so. Crit 18 on a
  declared head shot grants an effect already in play and does not double
  twice. limbsave rejects saves superseded this way.
  New called shot "Head Avoid Helmet" (-9) per 4.14.2.1: sets the head shot
  and avoid-armor flags, composing to headshot+noprot. NOTE: inherits the
  existing Avoid Armor simplification -- protection is not modelled per piece,
  so this bypasses ALL armor, not just partial coverage (4.14.2.4).

v2.120.0: !mp restore left condition badges on the token. Both restore
  branches and the reset path each cleared a hand-maintained list of marker
  names, and that list never contained skull (paralysed/poisoned),
  chained-heart (mind control), chemical-bolt (transmuted) or padlock
  (generic) — so those badges have always survived a restore. v2.110.0 made
  it visible by moving damaging poison onto three-leaves, which was not on
  the list either. New clearEngineMarkers() derives the set from
  CONDITION_MARKERS plus ENGINE_OWNED_MARKERS (KO, grapple/snare, stance,
  limb, prone), so adding a condition can no longer leave a badge that no
  restore path knows about. Replaces all three hardcoded lists.

v2.119.0: REMOVE DEAD BADGE-DIAGNOSIS SCAFFOLDING (~330 lines). The
  "condition badges never appear" hunt turned out to be an opaque token
  tint painted over the marker icons — invisible to the API, which is why
  every write reported success. The theories built along the way are gone:
  the token-marker-set catalog audit (campaignMarkerTags, markerTagAvailable,
  markerCatalogIsTrustworthy, missingConditionMarkerTags,
  auditConditionMarkerSet, ALWAYS_AVAILABLE_MARKERS, DEFAULT_SET_PROBE_TAGS,
  !mp markers), the id-qualified tag resolution (resolveMarkerTag,
  markerBase, the tag-upgrade path in setMarker), the write-method probe
  (!mp test badge / badgeclear) and the badge repair command
  (!mp fixbadges). parseMarkers and setMarker are back to their simple
  forms; testing confirmed either write view renders on its own.
  Kept: tokenTintHidesBadges plus the tint/opacity and geometry dump in
  !mp mk, which is the diagnostic that would actually have found this.
v2.118.0 - v2.109.0 (this session), retained work:
  Area-effect save attacks resolve per target for any save attack, not just
  sense loss (resolveAreaSave); Damaging Poison in an area now takes an EN
  save, applies a condition and badge, and recurs, instead of landing as a
  flat blast. Conditions carry stable ids so recovery buttons cannot address
  the wrong condition after an earlier one is spliced out. All status marker
  writes route through setMarker, including cmdRecover's (which used a
  variable status key and was missed by the first sweep). getResourceMax
  reads a bar-backed maximum from the token before the sheet attribute,
  fixing the status card and, more importantly, heal/rest/reset capping at
  the hardcoded 20/40 defaults on unlinked tokens. Target acquisition
  reports why vision was unusable, honours CFG.REQUIRE_TOKEN_VISION, and
  folds the vision gate into the cache signature so a lighting change
  invalidates a held fallback acquisition. !mp sight diagnoses the vision
  gates. !mp version, and all five version surfaces driven by MP_VERSION.

v2.108.0: GRAPPLE ATTACKS USE THE STANDARD ATTACK CARD. A grapple-flagged
  attack row no longer forks out of the attack pipeline into a plain-text
  result block; it renders the normal dark card with header, outcome
  banner, Roll/Confirm/To-Hit grid, Type/KB/Rng row, and Modifiers line.
  The Damage cell shows the grip dice under a GRIP label (4.11: grapple
  deals no damage). Grapples now resolve criticals and fumbles, register a
  pending record, and get the GM Undo button like every other attack.
  Squeeze/Lock/Release and Break Free/Escape/Counter move into the card's
  attacker/defender button groups. Fixes the defender's Defense being
  subtracted twice on attack-row grapples (the to-hit total was already
  net of Defense before being passed on as a base chance). !mp grapple and
  !mp test grapple keep the manual path unchanged. Known gaps: Undo
  refunds PR but does not clear the snare record, and a confirmed nat 1
  still rolls the standard crit table.

v2.107.1: SNARE/GRAPPLE STATUS BADGE FIXES. Stacked snares re-assert the
  cobweb marker and no longer write NaN BP into grapple records; snaring an
  already-grappled token is refused; a row flagged both Grapple and Snare
  resolves as Snare (4.10) with a GM warning instead of dropping the snare
  silently; Break Free / Release / Escape keep the grappler's fist marker if
  he still holds another victim; !mp test reset clears the fist marker.

v2.107.0: DISINTEGRATION DEFENSE (p.36). Disintegration damage now ignores
  ordinary Other protection, subtype-specific numeric protection, Hardened,
  Adaptation, Force Fields, Absorption, Reflection, and vehicle armor. Only
  an active protection row explicitly tagged Disintegration and carrying
  Invulnerability reduces the damage. The rule is shared by standard, area,
  reflected, save, vehicle, and Ability Field counter-damage paths. PR,
  range, damage dice, Knockback, object effects, and Counterblast remain
  manually entered/adjudicated. Vehicle attack/protection subtype plumbing
  is supported by sheet v44.76.

v2.106.0: SURPRISED & IMMOBILE TARGETS (4.7.2). Standard attacks now
  auto-detect the defender's status: prone (back-pain marker, e.g. from a
  failed knockdown save) grants the attacker +3; snared or grappled
  (engine snare records / cobweb / grab markers) grants +6; unconscious,
  incapacitated, or paralyzed grants +6 AND negates defenses entirely
  (no effort to defend). Physical attacks only — mental/emotional defense
  is not hindered by posture or restraint. Area attacks unchanged (already
  +6/no-def at the blast point). Attack card shows the bonus as a Tgt badge
  in the Modifiers row and itemizes it in the to-hit hover; when defenses
  are negated the PDef display shows 0 (was N). States the engine cannot
  see (unaware, off balance, oblivious, willing) remain GM-applied via
  --mod / Other, matching the existing surprise-bonus pattern.

v2.105.2: KB IMPACT CARD READABILITY. Impact card now wrapped in the
  engine's standard dark container (was light-on-light in Roll20 chat).
  Hole depth shows the book's fractional notation (1/10080") instead of
  scientific notation; "1 hits" pluralization fixed; defender button label
  contrast fixed. No mechanics changes — Protonx test math verified correct.

v2.105.1: KB IMPACT BOUNCE FIX. A negative post-impact remainder (SR exceeds
  remaining KB) is now a dead stop with zero secondary knockback. Previously
  bounced the absolute value, so 2" KB into an SR 6 wall wrongly produced a
  4" bounce that grew with wall hardness and exceeded the incoming KB.
  Secondary KB now only occurs on a positive remainder that fails to breach
  (Hierophant example: 14" vs SR 6 still bounces 8").

v2.105.0: KNOCKBACK IMPACTS (4.8.5.4 + 5.1). New Impact button on the KB
  card: prompts for obstacle SR and thickness, then resolves a collision.
  Target takes Blunt Kinetic damage = min(remaining KB, SR), presented as
  a child pending attack so the defender resolves it through the normal
  Apply / Roll-With pipeline (protection, unconscious, bleed all apply).
  Obstacle takes remaining KB minus SR; the 5.1 Hits table reports the
  hole's width/depth. If the hole breaches (depth >= thickness, man-sized
  width at 7+ hits) and KB remains positive, the target carries onward;
  otherwise it bounces for the leftover inches as secondary knockback.
  Each impact updates remaining KB and offers a Next Impact button for
  chained collisions. Repulsion Blast KB flows through this unchanged —
  it's how Repulsion deals its indirect damage.

v2.104.0: REPULSION BLAST (p.71). New attack_is_repulsion flag: the attack's
  'damage' causes Knockback only. Protection reduces the KB amount, the
  target may roll with (divert still costs Power per standard 4.8.2), and
  the Mass roll applies in the KB step as usual — but Hits/Power take no
  direct damage, and unconscious/incapacitated/bleed checks are skipped.
  KB is forced on regardless of the KB checkbox. Result card shows X" KB
  damage instead of Hits applied. Area-effect Repulsion reports per-target
  KB damage (Mass roll left to the GM, matching existing area-KB handling).
  Sheet: new Repulsion checkbox in the attack settings panel (Row 6);
  'repulsion' or 'kb:only' in attack notes auto-sets the flag.
  Counterblast use remains GM-adjudicated (declare as a defensive action).

v2.103.1: ORDINARY VISION ARC FIX. Visible-light vision now defaults to a
  full 360-degree field instead of silently imposing the MP 90-degree sense
  arc. When Roll20 Limit Field of Vision is enabled on the observer token,
  the engine honors that configured cone and center offset exactly. Other
  non-Global senses retain their normal 90-degree forward arc.

v2.103.0: CHAT BUTTON AUTHORIZATION. Attack-resolution and combat-control callbacks
  now verify the clicking player controls the character whose decision it
  represents; the GM always passes. Pending attacks track per-phase
  resolution so stale/repeated buttons cannot apply damage, saves, snares,
  knockback, limb effects, Ability Field choices, Absorption, or Reflection
  more than once. Save/knockback/snare callbacks derive consequential values
  from the pending record instead of trusting editable chat arguments.

v2.102.0: SCAN LOCATE UX. Scan results now number located contacts and put
  a Locate button before Attack. !mp locate revalidates current visibility
  or the acquire-once signature before issuing a Roll20 sendPing restricted
  to the requesting player, centering only that player's view without
  revealing the token itself. "?" results still receive no name, bearing,
  Locate, or direct Attack button. Exact numeric distance is shown only for
  a "++" result; lower tiers use broad distance bands.

v2.101.0: SCAN ENVIRONMENT FIX. Scan and attack acquisition now evaluate
  Roll20 Dynamic Lighting illumination, MP 90-degree sense arcs/Global,
  classic Path and Jumpgate PathV2 barriers, and closed Door objects.
  Visible Light requires illumination; dim light forces a perception check;
  natural darkness falls back to the best usable non-visual sense. Ordinary
  senses are conservatively blocked by walls/closed doors; Penetrating senses
  may ignore them (their specified blocking material remains GM-adjudicated).
  Sense rows now pass Penetrating + blocked-by data into the engine, and
  acquisition cache signatures include observer position/rotation and the
  environmental result so movement, facing, doors, and lighting invalidate
  stale target acquisition.

v2.100.0: SCAN (3.1.5 targeting console). New !mp scan [--mod N]: one IN
  perception check (3.0.1 confirm on nat 1/20) evaluated at a per-target
  TN against every character token on the observer's page, for acquiring
  targets the player can't see or click (lightless rooms, invisibles).
  Per RAW 3.1.5 the free check uses the best sense available - each
  candidate goes through observationLevel(), exactly as the attack
  pipeline would. Results by 4.6 tier: "-" omitted; "?" collapsed to one
  anonymous presence line (no names/count/bearing; -3 defense noted,
  blind-fire at blindpen is GM-adjudicated); "-3"/ID/+/++ named with
  distance, compass bearing, and an Attack button carrying --target so
  no map click is ever needed. Clearly visible targets (no roll) listed
  for completeness. Located results SEED the v2.91.1 acquire-once cache
  via the new shared acqSignature() helper, so the following attack
  honors the scanned tier without re-rolling, and auto re-acquires when
  the target moves/conceals ("-" and "?" clear any cached acquisition).
  Free-check tracking: first scan per token per round is the 3.1.5 free
  save; repeats banner "costs an Action" (GM enforces; out of combat the
  round doesn't advance, so treat the banner advisorily). Sheet v44.64
  adds a Scan button beside the Query row.

v2.99.0: GM CHAT VISIBILITY FIX. API-sent whispers to players are NOT
  visible to the GM in Roll20, so any card routed only to player
  controllers (attack cards, hthmass, stance, area results, apply
  results) never reached the GM. chToChar/chToChars/chBoth/chBothId/
  chPlayers now always send an explicit /w gm copy in addition to the
  player whispers. GM-controller ids are skipped in the player loops so
  the GM never receives duplicates.

v2.98.0: HTH + MASS GROUP ROLL. New !mp hthmass command rolls a combined
  HTH + Mass total for every selected token. Optional --push 1 spends 2 PR
  per token for +2 to that token's combined total; tokens without 2 PR roll
  normally and are marked Push denied. Supports characters, vehicles, linked
  and unlinked token Power bars, and player control permissions. Alias: !mp might.

v2.97.0: DEATH TOUCH (p.53). New attack_is_deathtouch flag. Penetrating
  damage cannot be rolled with (buttons omitted AND divert forced to 0 in
  cmdApply if a roll-with mode is retyped). No Knockback. When Death Touch
  damage reduces the target to 0 Hits, the damage card offers an EN save;
  new !mp dtsave command kills instantly on failure (zeroes Power, stops
  bleeding, sets dead) and leaves the normal dying state on success.

v2.96.0: TRANSMUTATION (p.77). Transmutation-subtype save attacks now bypass
  blanket Other protection and Adaptation entirely; only a protection row
  whose subtype explicitly names "transmutation" and carries the Invuln flag
  grants the +8. sumProtectionWithHardened() gains a dedicatedOnly mode.
  cmdSave gains --weight <lbs> (Alternate Targets: objects resist by physical
  weight via WEIGHT_SAVE_TABLE, 2.1.7.2) and --basesave <n> as a direct
  override. Table populated from the Basic Characteristic Table; lookup is
  closest-match on the Carry (Pounds) column.

v2.93.3: HELP COMMAND AUDIT. Reorganized !mp help so every manually useful
  command is documented, including Siphon, sense-field powers, grapple
  Squeeze/Release, Restore, token-bar controls, config, GW spawning, and
  aliases. Flash is explicitly documented as attack-row automation rather
  than a nonexistent standalone !mp flash command; !mp test flash is shown.
  Generated chat-button callbacks are listed separately so the dispatcher
  can be audited without presenting them as normal macros.

v2.93.2: Can't Feel Pain reminder wrapped in its own dark container -
  it was appended after the damage card's closing div, so the yellow
  text rendered on Roll20's light chat bubble (same class of bug as
  the v2.91.2 card contrast fixes).

v2.93.1: SUBTYPE-AWARE VULNERABILITY/ATTRACT + compact grammar.
  getVulnerabilityMods takes the attack's subtype: a form-specific
  weakness line (RAW half-cost, e.g. "electrical Energy") applies only
  when the incoming attack's subtype matches; type-only lines apply
  type-wide as before. NEW compact notes grammar matching the sheet
  placeholder (which previously parsed to NOTHING - word grammar was
  required): vuln:Energy/electricity:+4, vuln:electricity:+4 (bare
  subtype implies parent), vuln:Kinetic:+2, attract:Entropy/cold:-2.
  Word grammar also gains subtype detection ("Vulnerable to
  electricity +4", "electrical", "fire/flame" -> heat). Rows named
  "Attract..." without "vulner" now scanned too. Both call sites
  (damage apply + save TN) pass rec.dmgSubtype.

v2.93.0: WEAKNESS AUTOMATION (Unliving, Can't Feel Pain, Compulsion/
  Phobia, Special Requirement). Trait tags on ability-row notes:
  unliving:PCT and nopain (read via getWeaknessFlags, no new sheet UI).
  UNLIVING healing gate in !mp dailyheal: 0% never self-heals ("must
  be repaired by others" - !mp medical stays open per RAW); 50% heals
  only below half max Hits. CAN'T FEEL PAIN: damage cards for flagged
  defenders append an IN-save reminder/button for surprise attacks.
  NEW !mp willcheck --mod -N [--present] [--phobia] [--stimulus "x"]
  (GM): CL save vs compulsion/phobia/psychosis; failure = succumbed
  condition (screaming marker) with per-round recovery at the initial
  difficulty, -4 while the stimulus is present, riding !mp recover;
  phobia successes still note "cannot directly confront" per RAW.
  NEW !mp discomfort | --off: Special Requirement unmet = -3 on ALL
  rolls to hit and saves - wired into the to-hit assembly, cmdSave
  TN + recovery TN, acquisition modifier, and !mp perceive (drink-me
  marker, environmental, cleared by --off). NEW !mp require (GM):
  game-clock requirement registry - --interval 12h/3d/1w, --consequence,
  --name; --met stamps the clock; overdue check runs on round advance
  and !mp time advance, nagging ONCE per starvation period with Apply
  Discomfort / Met buttons; !mp require list shows due times.
  !mp restore clears drink-me/screaming markers.

v2.92.1: RANGED-SENSE REACH RULES (RAW, Heightened Senses). A Ranged
  sense whose stimulus RADIATES works at any range with +6 vs range
  penalties (IN+6); a Ranged NON-radiating sense (radar, motion) is
  hard-capped at IN/2 inches (intelligence_score/2) and is skipped as
  an acquisition fallback beyond that; a non-Ranged sense (touch,
  taste) only reaches contact range (1"). getCharacterSenses reads the
  sheet's Radiates flag (derives from type for older rows); senseReach()
  centralizes the rules for observationLevel and !mp perceive. The
  acquisition range offset is now tele + (radiates ? 6 : 0), capped at
  the penalty. Labels note the IN/2 cap when a non-radiating sense is
  used; "no sense reaches this range" replaces "no usable sense" when
  reach is the blocker. Acquire-once sig range-buckets whenever the
  resolved sense is range-sensitive. !mp perceive with a subject token
  applies the range penalty/bonus and refuses out-of-reach checks.

v2.92.0: CHARACTER SENSE ROWS (phase 2 of sheet v44.60/61).
  getCharacterSenses(charId): six-default baseline + repeating_abilities
  sense rows - overrides replace, Level=none removals are always-on,
  Off/Held/Gear+Broken rows are skipped (default stands). visionLossInfo
  now takes charId: base level from the character's visible sense
  (Analytical possible), Amplified negates Darkness dampening, Protected
  negates Glare+Flash overload (Darkness/Glare still cancel first).
  observationLevel: vision-blocked fallback = the character's BEST
  remaining Ranged/Global sense (blinded radar user keeps Full-row
  acquisition; no usable sense = None row). Range-conditional Diminished
  Senses automate off attack range: Nearsighted caps vision at Basic
  beyond 4", Farsighted within 5", No Depth Perception adds a flat -2
  to hit by sight beyond 1". Acquisition modifier now includes the
  sense's Chk mod (Acute/Imperceptive) and its range penalty offset by
  Telescopic (3.1.5/4.7.3); breakdown shown in the roll text. Acquire-
  once sig adds chkMod and a range bucket (only when a range weakness
  is live). NEW !mp perceive [--sense KEY] [--mod N]: 3.1.5 perception
  check with the sense's mods, sneaking opposition + 3.1.5.1 gate for
  a selected subject, tier detail text, crit = one level higher.
  Status card gains a Senses line (deviations from baseline only).
  !mp test senses reports the resolved map + fallback pick.

v2.91.4: SENSES PANEL. !mp sensepanel (GM) posts one whispered control
  card for the whole subsystem: Darkness/Glare rank buttons (1/2/3,
  one-click) + Off + ring draw/clear (diameter prompts once),
  Invis / Invis+Sneak / Blur / Invis Off, Sneak on/off, Glow on/off,
  Status, and a Refresh Panel button. Every button acts on the tokens
  selected at click time. Suggested use: a GM macro-bar entry or
  token action containing just "!mp sensepanel".

v2.91.3: STEALTH 3.1.5.1 (RAW-corrected). NEW !mp sneak | --off:
  standalone sneaking condition (tread marker, no PR, 1/2-move
  reminder). Correct scope: sneaking does NOT conceal from a Full
  sense with the sneaker in its vision arc - bare sneaking forces no
  acquisition roll for a Full-vision attacker. The 3.1.5.1 crit-only
  gate applies when the resolved sense is BASIC (hearing fallback vs
  an invisible sneaker, or vision degraded to Basic by darkness):
  rollAcquisition's new sneakGate drops all non-crit-success outcomes
  to "-" (undetected, cannot attack), noted in the roll text. AG
  opposition (3.0.2.4) now sourced from either the standalone sneak
  condition or Invisibility's --sneaking flag. Out-of-arc/"from
  behind" is GM adjudication: a SNEAKING ATTACKER gets a reminder
  card (crit-only Basic detection + Surprise bonus). Acquire-once
  signature includes sneaking state; !mp status Sneaking row with
  Stop button; !mp restore clears tread; recover refuses (points at
  !mp sneak --off).

v2.91.2: SENSE CARD CONTRAST + STOPWATCH RESTORE FIX. The Invisibility,
  Darkness/Glare apply-remove, and Glow chat cards emitted bare text
  with #aab gray annotations - unreadable on Roll20's light chat
  bubbles. All three now use the standard dark card container
  (#1a1a2e, color #eee, muted notes #8a84a8) like the status/area
  cards, which control their own contrast. !mp restore now also clears
  the status_stopwatch duration badge in both branches (records were
  already wiped via the conditions map; the marker lingered - same bug
  class as the v2.89.2 sense markers).

v2.91.1: ACQUIRE-ONCE PERSISTENCE + IMPORTER TAGS (chunk 6).
  Acquisition results now persist per attacker/defender pair (RAW 4.6:
  re-roll only when the target "has moved, started sneaking, become
  invisible, etc."). A signature covering defender position, defender
  concealment (invisible/blur/sneaking), the attacker's own vision
  impairment, and the sense level/opposition invalidates automatically
  when any of it changes - no manual re-arm needed. Held acquisitions
  show a green "Already acquired [tier], held from round N" card;
  blocked ("-") results are never cached so the attacker may retry.
  Cache pruned on round advance (>50 rounds old); !mp restore forgets
  acquisitions involving restored tokens.
  Sheet v44.59 importer tags (match-only, never resets manual entries):
  attack notes flash:LEVELS[:SAVEMOD] -> Flash save row (is_save,
  no_damage, EN, sense_loss); dazzle:SAVEMOD -> Laser dazzle save
  fields; ability notes field:darkness|glare:RANKS:SENSES:DIAM and
  field:glow:DIAM -> Sense Field row.

v2.91.0: INVISIBILITY (chunk 5). !mp invis [--blur] [--sneaking] |
  --off on selected tokens (or --target): half-haze marker, condition
  {type:"invisible", blur, sneaking}, voluntary (no recovery roll -
  drop with --off, free per RAW). PR 1/round auto-drains on Turn
  Tracker round advance (tickInvisibility in advanceRound); at 0 Power
  invisibility DROPS with a report line. TARGETING: observationLevel()
  combines attacker vision impairment with defender concealment - full
  Invisibility blocks vision entirely (acquisition falls back to Basic
  hearing, per RAW "Basic senses still detect... unless sneaking");
  Blur reduces the observer's effective vision one level; a sneaking
  invisible target opposes the perception check at -(AG save - 10)
  per 3.0.2.4, shown in the roll text. rollAcquisition gained a
  modifier param (nat 1/20 confirms roll vs the modified TN). An
  INVISIBLE ATTACKER gets a Surprise-bonus reminder card (4.6) - GM
  applies via --mod. !mp status shows an Invisibility row with Drop
  button; !mp restore clears the marker; !mp recover refuses (points
  at !mp invis --off). !mp test invis: 6-check self-test (2 tokens).

v2.90.2: GLOW + ABILITIES-PANEL FIELD UI (chunk 4). !mp glow --diameter
  N sets the selected/target token's aura1 to the field radius (light
  yellow, player-visible); --off clears it. PR 1 + 1/hour is a card
  reminder (GM-managed). Not GM-gated - players can light their own
  torch. Sheet v44.58 adds a Sense Field row to the abilities cog panel
  (Field type Darkness/Glare/Glow, Ranks, Senses=PR, Diameter) with a
  "Field Card" button posting !mp fieldcard - a GM control card whose
  buttons wrap the existing commands (Apply/Remove on selected, Draw/
  Remove ring, Glow on/off) using the row's stored values, acting on
  whatever is selected at click time.

v2.90.1: DAZZLE CALLED SHOT (chunk 3) + FIELD RINGS.
  Dazzle called shot (Light Control A, Laser): "Dazzle" in the called
  shot maps (engine + !mp atk + sheet v44.57 query) at -6 to hit. On a
  hit: no damage (saveDamage forced 0), no knockback, protection ignored
  (goggles block entirely - GM adjudicated); the victim rolls the row's
  EN save (Save BC defaults to EN if blank) at the row's Init mod - set
  Init from the Laser CP table's Dazzle column. Failure = dazzled 2
  levels via the standard sense-loss condition; recovery each between-
  rounds phase at the row's Rec (blank = 0, NOT Flash's -12 default);
  fumbled saves are NOT permanent (that rule is Flash-only). Works on
  any attack row, so improvised dazzle attacks are possible.
  Field rings: !mp darkness/glare --circle N draws a persistent dashed
  ring of diameter N" centered on the selected token or --target (a
  generic point token works); --circle off removes all rings of that
  kind. Darkness rings near-black, Glare rings yellow. Visual only - no
  membership tracking; toggle victims with --ranks/--on/--off as they
  move. drawAreaMarker gained optional color/width params.

v2.90.0: TARGET ACQUISITION (4.6) replaces flat vision penalties. An
  attacker with impaired vision now rolls a perception check (IN save,
  3.0.1 confirm rolls for nat 1/20) mapped through the 4.6 sense-level
  table: "-" cannot attack (refusal card), "?" unlocated (attack at
  blindpen, default -6), "-3" crude targeting, ID/+/++ clean. Vision at
  Basic uses the Basic row; vision at None falls back to default human
  HEARING (Basic row, labeled) - a blind attacker who succeeds is only
  -3, per RAW, not the old flat -6. Full vision unimpaired: no roll
  (a Full sense IDs even on a failed check). Acquisition roll + tier
  posted as a card line and itemized in the hover breakdown.
  NEW defender-side 4.6 penalty: a vision-impaired DEFENDER takes -3 to
  Physical defense ("-" tier's -3/-6 per 4.7.2 left to GM); mental/
  emotional attacks unaffected. Status card notes acquisition + defense
  effects. visionAtkPenalty() retained for status summary only.
  !mp test acquire: 9-check table self-test with forced rolls.
  RAW note (GM-managed): re-roll acquisition when the target moves,
  starts sneaking, or turns invisible; 4.6.1 interference = existing
  darkness ranks 1/2/3.

v2.89.4: MOOK ATTACKERS - token-aware attacker resolution. Previously
  handleMpAttack found the attacker token by unique represents-lookup
  and refused when a character had 2+ tokens on the map ("Delete
  duplicates before attacking"), which made mooks (unlinked multi-token
  characters) unable to attack at all. New priority: (1) explicit
  {{atktok=...}} - now passed by !mp atk and !mp autofire, which always
  knew the token id but dropped it; (2) a selected token representing
  the attacker (sheet-button rolls with the token selected); (3) unique
  lookup as before. Error only when 2+ candidates remain unidentified,
  with guidance to select the token or use !mp atk. PR deduction was
  already token-bar aware (getResource prefers bar values), so mook
  Power drains from the attacking token, not the shared sheet.
  KNOWN LIMIT: attack CHARGES live on the shared sheet row, so mooks
  share a charge pool.

v2.89.3: AREA attacks vs generic/unlinked tokens. An area attack (Flash,
  blasts) may now target a token with no character sheet - it's just the
  blast center point (area attacks apply no target defense; +6 immobile).
  handleMpAttack substitutes a null-id stub character when the target has
  no sheet AND the attack row has Area > 0; all downstream attr lookups
  fall through to defaults (getAttr/chToChars/getTokensInRadius already
  skip null charIds). cmdQuickAttack (!mp atk N) reordered to find the
  row before the target-character guard and allows the same. Non-area
  attacks vs generic tokens still refuse, with a clearer message.
  NOTE: the SHEET Roll button still cannot target generic tokens - its
  macro reads @{target|...|physical_def} which Roll20 hard-fails on
  sheetless tokens ("No character was found for 'target|Target'"). Use
  the !mp atk quick macro for point-targeted area attacks.

v2.89.2: !mp restore now clears sense-loss state. Player branch clears
  the four sense markers (bleeding-eye dazzle, interdiction blind,
  ninja-mask darkness, aura glare); condition records were already
  wiped but markers lingered. Vehicle branch previously returned early
  without touching the conditions map at all - it now clears the same
  markers AND deletes conditions for the token, so a vehicle left in a
  Darkness/Glare field restores clean.

v2.89.1: FLASH AS SAVE ATTACK (chunk 2). Sheet v44.55 adds a Sense Loss
  select (attack_sense_loss, 0-3 levels) to the save-attack row. Engine
  reads it at attack time; when > 0 on a save attack: (1) single-target
  saves force a dazzled condition carrying senseLevels from the row,
  protection/invuln/adapt do NOT add to the save TN (Flash has no Damage
  Type - only Protected Sense mitigates, GM adjudicated), fumbled initial
  save = PERMANENT regardless of attack name; (2) area attacks route
  per-target through resolveAreaSave: EN (or row BC) save per target
  that failed/skipped escape, failure = dazzled + senseLevels + recovery
  at recMod (defaults to -12 when the Rec field is blank, per Flash
  rules), refresh-in-place (no stacking), Recovery button per victim,
  roll-20 fumble = permanent blindness. Area cards relabel for Flash
  (FLASH header, "Resolve All Saves"). !mp test flash [LEVELS] harness
  with forced rolls (pass/fail/refresh/fumble; non-destructive).

v2.89.0: SENSE-LOSS CORE (chunk 1 of Light Control/Darkness rollout).
  Vision-loss model: conditions may carry senseLevels (levels of visible
  light sense lost; normal human vision is Full = 2 levels). Effective
  vision = Full - total levels lost: 1 lost = Basic, 2+ = blind.
  NEW !mp darkness --ranks N --on/--off and !mp glare --ranks N --on/--off:
  GM applies/removes an environmental sense-loss condition on selected
  tokens (or --target). No zone geometry - GM toggles tokens as they
  enter/leave the field. Darkness and Glare ranks CANCEL each other
  (rules: "Levels of Glare and Darkness cancel each other out").
  Environmental conditions have no recovery roll; !mp recover refuses
  them and points at --off. Markers: ninja-mask (darkness), aura (glare).
  NEW attacker vision penalty in attack pipeline: vision at Basic = -3
  to-hit, blind = config penalty (default -6, !mp config blindpen N).
  Itemized in hover breakdown; warning banner when firing blind.
  Save-flow dazzled conditions now record senseLevels: 2 (Flash default)
  and feed the same model. !mp status shows a Vision row with cause
  breakdown and clear/recovery buttons. !mp test senseloss self-test.

v2.88.0: HEALING (4.13) + MEDICAL task check (4.13.1). Shared applyHealing
  restores Power first then Hits (4.13), capped at max. rollHealingRate
  reads healing_rate and rolls the d10 fractional-bonus. !mp dailyheal
  (select token) applies a day's rest healing to the BARS — the companion
  to the sheet Heal button, which only rolls/displays. !mp medical
  success|crit|fumble (select patient) applies the outcome of a GM-rolled
  Medical check: success heals Healing Rate + stops bleeding, crit doubles,
  fumble deals d8+1; one successful benefit per patient per game-DAY (any
  medic, gated via state.medicalDays + game clock). Modifiers/TN are GM
  adjudication per 3.0.2, so the engine applies results, not the roll.
  Status card gains a Healing row (Daily Rest / Medical / Crit / Fumble)
  when the token is below full, hidden once Medical is used that day.

v2.87.3: label negative protection as "(vulnerable)". A protection row
  with negative values (Azu: Kin/Ent -2) means the target takes extra
  damage; cards now show e.g. "7 +2 (vulnerable) = 9 pen" instead of a
  bare/again-confusing number. Applied to the main apply card (which
  previously hid the armor line entirely when prot <= 0), plus the area,
  reflected, and AF counter cards. Engine has no damage-type name for a
  bare negative prot, so the label is the generic mechanical effect.
  Math unchanged.

v2.87.2: fix negative-protection display. When effective protection is
  below zero (target vulnerable / Attract), the area damage, reflected
  damage, and AF counter cards showed a jammed double-dash ("7--2 prot").
  Now rendered as an addition ("7+2 prot" / "Raw: 7 + 2 prot"). Math was
  always correct; display only. Main apply card unaffected (it omits the
  armor line when prot <= 0).

v2.87.1: !mp snareclear (GM) force-clears any snare or grapple on the
  target with no roll — clears both sides of a grapple and only drops the
  grappler's "fist" marker if they aren't still holding someone else.
  Works on --target or selected token(s). Added as a red Clear button on
  the snare row of the !mp status control card, and to !mp help.

v2.87.0: !mp status reworked into a live, self-regenerating token CONTROL
  card (set it as a Token Action for a persistent per-token button). Reads
  current state so it can never be stale like the original chat cards.
  Shows Hits/Power with status flags and contextual action buttons:
  Grappled-by (Break Free / Counter / Release), Grappling-someone
  (Squeeze / Lock / Release — the release Kurt couldn't find after a card
  scrolled off), snare (Break Free / +push), Bleeding (Stop Bleeding),
  Conditions (Details), and Siphon pool (Clear), plus a Refresh button.
  Works on selected token(s) or legacy --target. All buttons call existing
  handlers; no new grapple/snare state.

v2.86.1: handout time now shows seconds (HH:MM:SS, seconds in smaller
  muted text) so per-round 10s clock ticks are visible on the panel.

v2.86.0: FIX Turn Tracker round advance. The v2.83-85 custom "Round" (+1)
  entry never advanced because Roll20 only runs a custom entry's formula
  when you click next-turn ON that entry, not each cycle — so the clock
  never moved during combat. Replaced with Option A wrap detection: the
  round anchor is the combatant on top when the round starts; Roll20
  rotates the finished combatant to the bottom each next-turn, so the
  anchor returns to top only after everyone has acted = one round, at
  which point the clock advances 10s. leftAnchor guards against firing
  before the anchor has rotated off. No custom tracker entry is inserted
  anymore. Undo snapshots the wrap fields; combat end clears them.

v2.85.0: Game clock UI + undo integration. (1) Persistent player-visible
  HANDOUT ("⏱ Game Time", shared to all): rewritten on every clock move
  (tracker round, !mp round, !mp time, combat start/end, undo) with big
  24h time, full date, phase-of-day badge, and an in-combat round/elapsed
  block that collapses to "Narrative time" out of combat. (2) PHASE OF DAY
  on fixed hours (CFG.DAY_PHASES: dawn 5-7, day 7-18, dusk 18-20, night
  20-5); day-boundary and phase crossings announce once in chat on advance
  (suppressed on multi-day jumps). (3) UNDO now snapshots the clock
  (ms/currentRound/lastTrackerRound) and the bleed key set, so reversing an
  attack rewinds its time effects and removes any bleed it registered.
  New CFG: CLOCK_HANDOUT, CLOCK_HANDOUT_NAME, DAY_PHASES.

v2.84.0: ALL EFFECTS ON GAME TIME (Kurt ruling 2026-07-05). ABSORPTION
  effect expiry also migrated to game time (5 GAME minutes; the 5-minute
  value itself is an engine convention pending verification vs Absorption
  RAW) with display, expiry check, sweep hook, and ready rebase of old
  wall-clock entries. Clock default
  now 2519-07-14 08:00 (GW campaign start; v2.83.0 placeholder migrated).
  advanceClock runs runGameTimeSweep (siphon expiry + bleeding + duration
  expiry) whenever the clock moves — by tracker round, !mp round, or
  !mp time advance. SIPHON dissipation is now 1 GAME hour: expiries stored
  as game timestamps, list shows game minutes left, the 60s wall-clock
  interval is removed, and pre-v2.84 wall-clock entries are rebased on
  ready. BLEEDING (4.8.4.2): incapacitation in cmdApply/resolveAreaTarget
  auto-registers a bleed (characters only); each game minute drains 1
  Power (collapses over big time jumps), Hits>0 auto-stops, Power 0 =
  DEAD (Hits AND Power 0) with bled-out summary; !mp bleed list/start/
  stop (Medical task check). DURATIONS: non-round duration effects
  (minute/hour/day/week/month/year) now stamp a game-time expiresMs and
  auto-expire with a GM whisper + marker cleanup; perm never expires.

v2.83.0: GAME CLOCK + TURN TRACKER integration. state.gameClock holds a
  campaign timestamp (default 2519-01-01 08:00); CFG.SECONDS_PER_ROUND=10
  per RAW 4.1. New advanceRound(n) funnels rounds, clock, duration ticks,
  and recovery prompts through one path: !mp round forward advances use it
  (backward/absolute sets move the counter but never the clock), and the
  Turn Tracker drives it automatically — opening the tracker starts combat
  at Round 1 and injects a custom "Round" (+1) entry that Roll20 cycles;
  turnorder changes mirror its value into currentRound and advance the
  clock; closing the tracker whispers rounds + elapsed game time. Deleted
  Round entries are re-inserted; on(ready) resyncs after sandbox restarts;
  tracker resets resync without rewinding. New GM command !mp time
  [show | advance N sec/min/hour/day/week/round | set YYYY-MM-DD HH:MM].
  Effect migrations to game time (siphon 1-hour dissipation, bleeding,
  long recovery times) are the next slice, pending rulings.

v2.82.0: !mp buttondemo (GM) posts one inert sample decision card per
  button-color candidate (A steel blue, B bright blue, C graphite, D teal,
  E1/E2 green ghosts, F/G V&V oranges, H orange ghost) in real chat so the
  color choice can be made in-theme at the table. Samples are styled spans
  matching live btn()/btnDanger() output exactly; danger red constant.

v2.81.0: ROLL-WITH vs AREA EFFECTS (4.8.3 audit vs rules text). Area
  targets who fail to escape may now roll with the damage: cmdAreaDamageAll
  computes per-target coverage-adjusted penetration (computeAreaPen), and
  conscious characters with capacity (floor(current Power/10), Fortitude
  x2; vehicles and sleepy/dead-marked tokens excluded) are deferred with
  Take Full / Roll-With Max / RW Custom buttons (players whispered via
  chToChar; NPC buttons on the GM card) plus a GM Apply Rest (No RW)
  fallback (!mp arearwrest). New !mp arearw resolves one target through
  resolveAreaTarget: divert to Power first, then siphon/standard routing,
  pool consumption, incremental siphon gain per resolution, status
  markers. Ring + record now persist until every target resolves
  (finalizeAreaIfDone); pendingArea expiry raised 5->10 min. Rolled-with
  points are never siphoned, matching the single-target path.

v2.80.0: Siphon test harness + forced dissipation. !mp test siphon [PTS]
  (select attacker then target) drains PTS points through the real drain/
  mode routing using the attacker's actual Siphon row config, applies the
  transfer/cap/overload path via applySiphonGain, and reports a purple
  test card. !mp siphon expire --target TOKID zeroes registry timers and
  runs the dissipation sweep immediately (tests the 1-hour path without
  waiting). Added to !mp help and !mp test help.

v2.79.0: chat button recolor. All 124 [label](!cmd) markdown API buttons
  converted to styled anchors via new btn()/btnDanger() helpers: neutral
  steel blue (#3d5a80) for ordinary actions, card red (#c0392b) for
  consequential ones (29: labels starting with "Apply", "Apply Damage",
  "Take Full Damage"). Replaces Roll20's default pink button chrome to
  match the dark card theme. White text, #2a2a4a border, 3px radius.

v2.78.0: Immunity modifier (+2.5) for Area Effects: new attack_immunity
  flag read at attack time; handleAreaAttack excludes the attacker's own
  character from tokensInArea (RAW: ignore negative effects of own
  Ability). Enables touch-range area siphons (Sham) without self-drain.
  Immunity-counters-Reflection is backlog. Area card label fixed:
  "Area: N\"" (diameter, MP convention) replaces "Radius: N\"".

v2.77.0: SIPHON automation (MP Voluntary Ability, p.66-67). New attack row
  fields (attack_is_siphon, siphon_drain/mode/bc/cat/replenish/split/
  overload/cap/pool) read at attack time; siphon attacks never cause KB.
  cmdApply routes drain by type: Hits 1/pt capped at pool (no 4.8.4
  overflow, unconscious check still applies per Kurt ruling), Power 2/pt
  from Power only, Ability CPs / BC pts reported for manual Siphoned-row
  ledger. Head shot doubling exempted. Modes: Normal, Suppress (no gain),
  Mimicry (no drain). Transfer: attacker bar += gain (over max allowed),
  row pool tracks total, Ability Cap enforced with Overload effects
  (excess lost / all lost / 1 dmg per pt / explode d=pool/5 odd);
  Replenish writes real healing capped at max, no pool. Damage consumes
  siphoned points first (consumeSiphonPool in cmdApply + area). 1-hour
  dissipation via state registry + 60s sweep (restart-safe); GM whispered.
  Area siphon supported (Ark: Siphon Hits Area Effect) with pooled gain.
  New GM command: !mp siphon list | clear | adjust. Split spec is
  informational this slice.

v2.76.0: area effect map marker. handleAreaAttack now draws a dashed circle
  path at the blast center (scatter-adjusted on a miss) sized to areaRadius,
  on the map layer so players can't move it. Single path object built from
  M/L tick segments (16-48 ticks by radius). Marker id stored in pendingArea
  and removed on Apply All Damage and in cleanupPendingArea. New CFG:
  AREA_MARKER (on/off), AREA_MARKER_COLOR, AREA_MARKER_WIDTH.

v2.75.0: area effect chat cards restyled to the dark attack-card theme for
  readability. AREA HIT/MISS card, escape/shield-block results, AREA DAMAGE
  RESULTS, and the all-escapes-resolved message now use dark backgrounds
  (#1a1a2e/#16213e) with light text and colored header strips/borders,
  replacing black-on-red/orange flat cards.

v2.74.1: range calculation now converts Roll20 page scale units correctly.
  Supports MP-inch pages (1 in/sq) and feet pages (5 ft/sq), and fixes
  fractional Cell Width/snapping_increment by applying it to scale distance
  instead of double-counting it in pixel conversion.

v2.74.0: vehicle ABSORPTION and REFLECTION now resolve. getAbsorptionReflection
  reads the vehprotection section for vehicle defenders; the absorb/reflect action
  buttons are now offered to vehicles (were excluded); cmdAbsorb/cmdReflect already
  apply to vehicle Hits/Power, and the BC-stat absorb target maps to vehicle_* attrs.

v2.73.0: vehicle Force Fields now honor the Mode selector and read Hardened
  values (vprot_hard_*); getVehicleProtection skips FF/Absorption/Reflection rows
  by mode. (Absorption/Reflection resolution is the next slice.)

v2.72.0: VEHICLE FORCE FIELDS now work. A repeating_vehprotection row named
  "Force Field" is read as an active FF (getVehicleForceFieldData) and routed
  through the same damage FF step as characters: per-hit deflection wall, pool
  capacity = vehicle Power, accum in vprot_ff_accum, collapse sets vprot_broken,
  AP reduces it. setFFAccum/deactivateFF are now section-aware.

v2.71.3: Armor Piercing now reduces Force Field protection too (RAW: AP ignores
  points of protection vs its damage type; a force field IS protection). AP is
  spent FF -> Armor -> Invulnerability (outermost first; preserves the rule's
  explicit Armor-then-Invuln order). Applies to all attackers, not just vehicles.

v2.71.2: attack card properties footer now shows declared AP (Armor Piercing:
  "AP: N" or "AP: ALL") alongside KB/Rng for all attackers. AP was read and
  applied (vs armor, not force fields) but never displayed on the card.

v2.71.1: vehicle attack card now itemizes the weapon +To-Hit and Targeting
  bonus in the to-hit hover breakdown (was in the Final calc but not shown);
  subtotal includes macroMod for vehicle attackers so it reconciles with Final.

v2.71.0: vehicle attacks now support the full single-shot automation set.
  handleMpAttack defines a vehicle-aware getAtk that maps attack_* reads to
  the mpattack template fields (pr, ch, range, ap, kb, area, is_save, save mods,
  no_damage, dmgexpr), so save attacks, charges, range, PR, AP, KB and area all resolve for
  vehicle weapons. Charge writeback uses new setVehSystemAttr (repeating_vehsystems).

v2.70.0: handleMpAttack supports VEHICLE attackers (repeating_vehsystems
  weapons via the mpattack template): attack type taken from the template
  {{atype}} field and to-hit base read from vehicle_ag/in/cl_save instead of
  the character save attrs. Damage/type/name come from template fields; the
  hit is roll-under vs the sheet-computed target. Routes through the normal
  FF/armor/KB damage pipeline.

v2.69.2: vehicle import now seeds per-system vsys_type (P/M/E weapon basis or
         none, derived from damage type), vsys_dmgtype, and vsys_tohit on each
         repeating_vehsystems row, feeding the new sheet dropdown and the
         upcoming !mp vatk to-hit. repeating_attacks writes unchanged for now.

v2.69.1: !mp import refuses to overwrite a pre-existing non-vehicle character
         (name collision would otherwise wipe its attacks/abilities/protection).

v2.69.0: vehicle force fields now run the per-hit deflection/collapse mechanic.
         cmdApply no longer disables FF for vehicle defenders (getForceFieldData
         already uses vehicle Power as the collapse threshold). Per-hit logic now
         honors the MP rule that a completely-blocked hit (fully stopped within
         remaining capacity) is ignored and not added to the deflection total.
         Vehicle import now writes an active forcefield protection row (mode/
         state/accum/pr + per-type stopping power) in addition to the Additional
         Protection display row; getVehicleProtection skips "Force Field" display
         rows so they aren't double-counted as passive armor.

v2.68.1: vehicle import defaults vsys_dmg to "0" for non-weapon systems so the
         new per-system damage roll button on the sheet always rolls cleanly.

v2.68.0: vehicle import now populates the actual vehicle sheet model. Sets
         vehicle_base_cp (vehicleSizeTable key) + vehicle_ag/in/cl + hilotech/
         maneuver so calcVehicle derives spaces/st/en/hits/power/profile on
         sheet:open; fills repeating_vehsystems (one row per system: spaces, dmg,
         description) and repeating_vehprotection (force field, per-type). Still
         writes repeating_attacks for the !mp atk pipeline. buildVehicleFromMPData
         now emits bcAg/bcIn/bcCl. Replaces the v2.67.0 attempt that wrote engine-
         only attrs the vehicle tab doesn't display.

v2.67.2: !mp import now extracts the first balanced {...} object from handout
         notes, so trailing markup or a duplicated paste no longer breaks
         JSON.parse ("Unexpected non-whitespace character after JSON").

v2.67.1: !mp import handout lookup is now forgiving — strips surrounding quotes,
         matches case-insensitively, and suggests near matches on a miss.

v2.67.0: !mp import now handles vehicles. A type:"mp-vehicle" handout (builder/
         gwspawn JSON) builds a vehicle-mode character via
         buildVehicleCharacterFromMPData: sets vehicle_mode/hits/power/armor, a
         forcefield protection row (all MP types — GW single damage type), and a
         repeating_attacks row per weapon (attack_damage/dmgtype from the new
         atkDmg/atkType emit fields, suffixed names from the layout labels).
         vehMkSystem now also emits atkDmg/atkType (authored inflicted dice/type),
         kept separate from the damage-taken `dmg` field.

v2.66.5: layout suffix base shortened to 2 chars (PB1, PB2 …) for grid legibility.

v2.66.4: layout emit now suffixes duplicate-ability system labels (PBl1, PBl2 …)
         via per-cell `label`, so visually identical systems are distinguishable
         on the grid. Singletons keep the canvas auto-abbr.

v2.66.3: vehMkSystem no longer copies the bestiary's inflicted-damage value into
         the system `dmg` field — that field records damage TAKEN by the system and
         must start empty. Inflicted damage already lives in the system desc.

v2.66.2: gwspawn vehicle emit now auto-paints a grid LAYOUT. Each functional
         system (abId, non-integral) is tiled into a cols-wide rectangle (1 cell
         = 1 system space) and a hull wall border is traced; cell color is derived
         by the builder from the system desc (MP.sysColor) so blocks match the
         system-row swatches. cols per vehicle via vdef.layout.cols.

v2.66.1: gwspawn vehicle emit — fix modifier-index economy. vehDefaultAbility
         wrote timereq=0 ("No Time", +5 CP) and left charges=0 ("Unlimited");
         for a base-PR-16 Force Field that inflated the screen 50 -> 75 CP
         (illegal). Now timereq=2 ("1 Phase", 0 CP), charges = the ability's
         base PR index (0 CP), and data `pr` is converted from a PR VALUE to its
         scale index (FF PR 16 -> index 8) instead of being copied raw. Confirmed
         vs FLYER.json (FF pr=8/charges=8). System 9 EMP re-pointed to Negation.

v2.66.0: gwspawn now spawns VEHICLES. Death Machine and Defense/Attack Borg are
         modeled as MP Vehicles (not characters) in MP_GW_VEHICLES (sibling data
         script). gwspawn checks that list first and, on a match, emits a builder-
         format JSON (FLYER.json schema, version 10) via buildVehicleFromMPData()
         to the API console + a whispered preview, for import into the MP Vehicle
         builder. Weapons are capped Power Blast / Disintegration; Force Field is
         per-hit protection; armor 8/5/4/3. Shadows the dormant character entries
         of the same names. (Also bumped stale runtime version banners 2.64.2.)

v2.65.0: gwspawn now imports structured ability modifiers. Ability rows
         carrying mod data (ab.mods: st_mod/en_mod/ag_mod/in_mod/cl_mod,
         hits_mod, move_mod, power_mod, profile_mod, weight_mod, init_mod)
         set the matching per-row ability_*_mod fields and are flagged
         Active so recalcAbilityBonuses rolls them up. BCs are now imported
         as BASE characteristics; data.aggmods pre-seeds the rolled-up
         modifier fields so derived scores (BCs/Hits/Power/Move) are correct
         before the sheet is first opened. Pairs with the sheet's new
         per-row Move mod field (Speed).

v2.64.2: buildCharacterFromMPData also sets current/max Hits (hits_score) and
         Power (power_score) from data.hitPts/hitPtsSrc/power/powerSrc. The sheet
         copies current<-max only on sheet:opened, so API-built characters read
         0 Hits in combat until set. gwspawn blocks now carry these + MP species.

v2.64.1: buildCharacterFromMPData now sets initiative_score from data.initiative.
         The sheet only computes the init die on sheet:opened, so API-built
         characters (import + gwspawn) previously had a blank Initiative roll
         that never reached the turn tracker. Bestiary blocks now carry the die.

v2.64.0: !mp gwspawn --name NAME [--form FORM] builds a Gamma World creature
         NPC from embedded MP_GW_BESTIARY (sibling script mp_gw_bestiary.js).
         MP Builder import build-logic extracted to buildCharacterFromMPData(),
         now shared by both !mp import and !mp gwspawn.

v2.63.6: Match duration-tick damage buttons to the standard set. The
         !mp round ongoing-damage prompt now offers Apply / Roll-With
         Max / Roll-With Custom (modes noroll / rollwithmax /
         rollwithcustom) like a normal damage card, instead of the
         non-matching "Apply Damage" / "Roll-With" pair.

v2.63.5: Stop duplicate recovery-roll prompts. Save conditions now
         refresh in place instead of stacking a same-type duplicate
         (cmdSave), and !mp round emits at most one recovery prompt
         per condition type per token.

v2.63.4: !mp round now surfaces due recovery saves. Active save-attack
         conditions (paralyzed, mind control, poison, etc.) get a
         [Recovery Roll] prompt when their recovery interval comes due,
         gated per-condition (1-round effects prompt every round; an
         N-round/Duration effect prompts every N). Conditions stamp the
         round they were applied (startRound) to anchor the schedule.

v2.63.3: Fix crash on save attacks ("Assignment to constant variable"
         in cmdSave). The v2.63.0 undo button appended to msg_out, which
         was declared const; changed to let. Affected every save attack.

v2.63.2: Save attacks with Duration now recover on the durational
         schedule. Per MP Modifiers ("Duration"), on a save attack the
         Duration is the interval between recovery saves (first save
         still immediate); recTime is set from the duration span instead
         of defaulting to 1/round. Save card tags it "(Duration)".

v2.63.1: Fix Undo not clearing status-effect badges. Restore now
         toggles markers via the per-marker status_<name> API (diffing
         current vs. snapshot) instead of setting the aggregate
         "statusmarkers" string, which did not reliably remove a badge
         that was turned on with status_<name>.

v2.63.0: Add Undo to combat chat cards.
         - New undo store + snapshot/restore of a token's bars, status
           markers, FF aura, and conditions; pruned to last 40 entries.
         - Damage result card (!mp apply) and save card (!mp save) show
           [↩ Undo] restoring the target's full pre-resolution state.
         - Attack to-hit card shows [↩ Undo] to cancel a misfired attack:
           refunds attacker PR/charges and voids the pending so its
           apply/save buttons stop working.
         - New command/router case: !mp undo --id ID (GM only).
         - Area attacks are not yet undoable (specialized path).

v2.62.0: Implement Duration modifier (MP Modifiers, "Duration").
         - Attack build now reads attack_duration_num/unit/active/escape.
         - On a confirmed hit, a durational attack sets an ongoing-effect
           badge (status_stopwatch) on the target token and tracks it as a
           "duration" condition. Re-hits from the same source are cumulative
           in duration (not damage), per the rules.
         - !mp round (forward) ticks each effect: rolls per-round damage,
           routes it through !mp apply so protection/Roll-With apply, then
           decrements; clears the badge when no duration effects remain.
         - !mp conditions shows duration effects with rounds left + escape.

v2.61.4: Define generateRowID/generateUUID (was undefined) so
         !mp import can build its repeating rows — abilities,
         attacks, careers, protection. Import previously threw
         ReferenceError after BCs, leaving only basic characteristics.

v2.61.3: Fix Stance display on attack chat card *        - Previously showed only defender's bar3 (defMod), so an attacker in
         Defensive Stance saw "Stance: 0" even though their -3 to-hit was
         being applied. Now shows both: "Stance: A:-3 D:+3" with A=attacker's
         stance penalty and D=defender's stance bonus. Sign prefix on D so
         +3/+6 bonuses are obvious. Title tooltip lists the stance commands.

v2.61.2: Add !mp showbars for toggling player bar visibility
       - cmdShowBars sets showplayers_bar1/2/3 on selected tokens
       - GM-only, supports --bars 1,2,3 and --off
       - Use case: testing, quickly seeing Hits/Power on every token

v2.61.1: Fix area-effect escape buttons not rendering for players
       - handleAreaAttack: per-token escape buttons were whispered using
         t.controller (a player ID) as the /w target, so /w "${playerId}"
         silently delivered to no one. Route through chToChar(t.charId)
         so the character's controllers are resolved by name.

v2.61.0: MP Builder import/export
       - !mp export: select token, exports character to handout JSON for MP Builder
       - !mp import --name HandoutName: imports MP Builder JSON from handout
       - Maps identity, BCs, abilities, attacks, careers, protection
       - Creates/updates character, rebuilds repeating sections

v2.60.0: Vehicle combat integration
       - isVehicleMode() detects vehicle_mode checkbox on defender/attacker
       - Vehicle targets use vehicle_hits/vehicle_power instead of character hits/power
       - Vehicle base armor from vehicle_armor_kinetic/energy/biochem/entropy/psychic
       - Additional vehicle protection from repeating_vehprotection rows (invuln/adapt/hardened)
       - FF/Absorption/Reflection from character repeating_protection rows (shared)
       - Vehicles cannot roll-with (buttons suppressed, divert always 0)
       - No overflow to Power, no unconsciousness, no head/limb shots on vehicles
       - VEHICLE INCAPACITATED at 0 Hits, explosion warning when below 0
       - Vehicle-aware: cmdApply, cmdAreaDamageAll, cmdAbsorb, cmdReflect, cmdReflectHit
       - Vehicle-aware: cmdAFCounter, cmdSave, cmdStatus, cmdRestore, cmdWakeup
       - Vehicle-aware: cmdKnockback (vehicle mass), cmdKBSave (vehicle AG save)
       - Vehicle-aware: FF toggle/reset/reinforce (vehicle Power for PR costs)
       - Vehicle-aware: attacker PR/push Power deduction, testHeal, squeeze buttons
       - buildStandardAttackButtons/AfterAF: Apply-only for vehicles, skip limb shots
       - buildSaveAttackButtons: skip roll-with option for vehicle defenders

v2.59.0: Force Field support (protection mode = forcefield)
       - getForceFieldData() reads FF protection row: per-type values, accum, threshold
       - sumProtectionWithHardened/Coverage skip forcefield rows (not passive)
       - cmdApply: FF deflection pool tracking, collapse + overflow, Gas block, Gravity bypass
       - cmdFFReset: renew FF (zero accum, PR cost, re-activate)
       - cmdFFReinforce: saved action at collapse, overflow goes onto new field
       - cmdFFToggle: !mp ff to activate/deactivate FF with PR cost and aura
       - Aura2 visual: blue (>50%), yellow (25-50%), red (<25%), cleared on collapse/off
       - FF indicator on damage chat card with pool status

v2.58.9: Subtype-to-parent mapping in resolveDmgType
       - DMG_TYPE_MAP includes all subtypes mapped to parent types
         (e.g. sharp→Kinetic, heat→Energy, cold→Entropy, poison→Biochemical)
       - Fixes corrupted attack_dmgtype attrs storing subtype instead of parent

v2.58.8: Attack buttons (Roll-With, Apply, KB) whispered to defender only
       - Attacker sees attack card but not action buttons
       - Defender (target) sees card + buttons (their roll-with choice)
       - GM sees everything via whisper visibility

v2.58.7: Attack buttons (Roll-With, Apply, KB) whispered to defender only
       - Fix: damage type falling through to "Other" for valid types
       - New resolveDmgType() helper with substring fallback (e.g. "sharp kinetic" → Kinetic)
       - Damage result card sent to GM + defender only (attacker no longer sees target stats)

v2.58.6: Fix whisper visibility for GM + player sessions
       - Characters with only "ALL" controller don't receive whispers
       - chToChar/chToChars now always send /w gm, additionally whisper
         characters that have specific (non-ALL) player controllers
       - New hasPlayerController() helper checks controlledby field
       - chCombat 4th arg is atkCharId for attacker visibility
       - Attack output uses chToChars([atkCharId, defCharId])
       - Area records now store atkCharId for whisper targeting

v2.58.0: Add hit/miss SFX support via Roll20 Jukebox
       - playSFX() helper triggers named Jukebox tracks
       - Plays "SFX-Hit" on HIT/CRIT, "SFX-Miss" on MISS/FUMBLE

v2.57.6: Add damage roll breakdown hover tooltip on attack card
       - Damage number now shows dice formula and individual results on hover
       - New inlineRollBreakdown() extracts expression from Roll20 inline rolls

v2.57.5: Fix area effect attacks missing normal card and player visibility
       - Area attacks now show the standard attack card before the AE card
       - AE card, damage results, and escape-resolved message sent to attacker's player
       - Store playerid in pendingArea record for follow-up command targeting

v2.57.4: Fix attack buttons not visible to attacking player when defender is NPC
       - When GM_ONLY_BUTTONS=true, buttons now also whisper to attacker's player
         if they are not GM and not already the defender's controller
       - Fixes: GM joining as player sees attack card but no Roll-With/KB/Save buttons

v2.57.3: Fix attack card not visible when using !mp atk / !mp autofire macros
       - cmdQuickAttack/cmdAutofire pass original playerid through roll template
       - handleMpAttack uses fields.playerid (fallback msg.playerid) for card targeting
       - Fixes: sendChat("character|ID") sets msg.playerid to API, not original player

v2.57.2: Fix double chat card when wtId() falls back to /w gm
       - chBoth, chBothId, chCombat now guard against duplicate /w gm sends
       - cmdApply deduplicates attacker send when same player controls both chars

v2.57.1: Combat buttons (Roll-With, KB, Save, etc.) now visible to defender's player
       - New chCombat() sends button outputs to GM + defender's controlling player
       - getControllingPlayerId() resolves character → player for whisper targeting
       - All 30+ combat resolution outputs converted from GM-only to chCombat
       - Attack card: html → attacker+GM, buttons → defender+GM
       - Apply/KB/Save/Recover/Grapple/Snare/Absorb/Reflect/AF results → defender+GM

v2.57.0: Player permission and whisper targeting overhaul
       - Players now see attack cards, damage results, saves in chat
       - Action buttons (Apply, KB, etc.) remain GM-only when GM_ONLY_BUTTONS=true
       - Error messages whisper to command sender, not always GM
       - Permission helpers: wt(), wtId(), chBoth(), chBothId(), gmOnly(), canControl()
       - cmdQuickAttack/cmdAutofire: canControl() check (players can only attack with own chars)
       - cmdStance: canControl() check, results visible to both GM and player
       - cmdStatus/cmdConditions/cmdRange: results whisper to requester
       - cmdQuickSave: results visible to both GM and player
       - GM-only gates added: debug, round, clearstances, restore, offbal,
         arearollnpcs, areaforceall, areadamageall
       - Player-reactive commands (escape, countergrapple, areaescape, areashield)
         now whisper errors to player

v2.56.3: Additional hover text and uniform number sizing
       - All 4 core numbers now 28px uniform size
       - Confirm hover: explains crit/fumble confirmation purpose
       - Chg hover: shows remaining charges after deduction
       - Damage Type hover: shows subtype (e.g., heat, sonics) when set

v2.56.2: Aligned chat card colors with character sheet palette
       - To-Hit number now gold (#f0c040) matching sheet stat labels
       - Positive modifiers green (#5dde5d) matching sheet buttons
       - Modifier labels warmer tone, MODIFIERS header gold-tinted
       - Cost display (PR/Chg) uses sheet gold

v2.56.1: Chat card fixes
       - Roll border now red on miss/fumble, green on hit/crit
       - Fixed flexbox layouts (not supported in Roll20 chat) to inline/table
       - Apply card: larger Hits/Power numbers (16px), better contrast
       - Fixed prone marker: status_prone -> status_back-pain (valid Roll20 marker)

v2.56: Redesigned attack chat card and apply result card
       - Dark theme with improved visual hierarchy
       - Single-line header: "Attacker attacks Target with Weapon"
       - 4-column core grid: Roll, Confirm, To-Hit, Damage
       - Separated props row (Type, KB, Rng, PR/Chg)
       - Separated modifiers section with color-coded values
       - Redesigned apply result card with cleaner math breakdown

v2.55: Improved attack card readability
       - Added prominent "vs Target Name" subheader below attacker name
       - Added large color-coded outcome banner: HIT (green), CRIT (gold), MISS (gray), FUMBLE (red)
       - Removed redundant defender name from info footer (already in subheader)

v2.54: Ability Field protection mechanics implemented (2.2.4)
       - AF rows excluded from summed protection (they're reactive, not passive)
       - When attack hits target with active AF, shows attack type buttons
       - Projectile: AF damage subtracts from attack (destroys if reduced to 0)
       - Non-Projectile: AF has no effect, normal damage
       - Melee Weapon: AF damages weapon (may negate attack if destroyed)
       - Unarmed: AF counter-damages attacker (may abort attack if KO'd)

v2.53: Hardened values now use separate fields per damage type
       - New sheet fields: prot_hard_kinetic, prot_hard_energy, etc.
       - Allows different hardened values per damage type (e.g., 5 prot / 3 hardened)
       - Removed 'h' notation parsing (legacy values still strip 'h' for compatibility)

v2.52: Fixed called shot penalty double-counting and miss display
       - Removed duplicate calledShotPenalty from targetTotal (already in macroMod)
       - Called shot effects (doubled damage, protected brain) now only show on hits
       - Missed called shots show "Called shot attempted" instead of effect text

v2.51: Fixed called shot penalty not showing in hover breakdown
       - Sheet sends numeric penalty (e.g. "-6") not type name
       - Added reverse-mapping: -6 -> Head, -3 -> Called (ambiguous)
       - Penalty now displays correctly in tooltip and footer

v2.50: Overhauled handleMpAttack output to match HTML sheet layout
       - Improved Range/Profile formatting to remove excessive decimals

v2.48: Fixed save attack recovery TN and push display
       - Recovery TN now includes initial save modifier (saveMod)
         Per 4.9: "same target number as initial save + additional difficulty modifier"
       - Push modifier now passed and displayed separately from Crit
         Shows "Push: -N" in orange in save breakdown

v2.47: More robust mpapi checkbox check
       - Explicitly converts to string, trims whitespace
       - Only processes when exactly "1"

v2.46: Block attack when no charges remaining
       - Attack is blocked with visible public message instead of proceeding
       - Check occurs before power deduction (no wasted resources)
       - "Last charge used" warning still whispered to GM on final use

v2.45: Unlimited charges support

v2.44: Unlimited charges (-1) support
       - Enter -1 in Charges field for unlimited uses
       - Skips charge decrement, displays ∞ in autofire announcement

v2.43: Profile range correction per rulebook 4.7.3.1
       - Both attacker AND target profiles now affect range penalty
       - Formula: adjustedRange = actualRange × atkProfile / defProfile
       - Example: Profile 1 firing at Profile 3.2 at 24" = 24×1/3.2 = 7.5" = -1 penalty
       - Sheet query modifiers (aim/multi/other) now passed to API via hitmod field
       - API reads hitmod from inline roll result (supports computed values)
Handles all dmgtype variations: K/Kin/Kinetic, E/Eng/Energy, etc.
Separate PR/Charges columns, Armor Piercing rules
Protection notation: 5=prot, 5/4=invuln, 5/2=adapt, 5/4/2=all
Hardened: Now uses separate prot_hard_* fields per damage type
Range uses edge-to-edge distance (minimum range = 1" per MP rules)

v2.11: Fixed range calculation to account for page snapping_increment

v2.12: Warns and stops attack if duplicate tokens exist on map
       Added damage field validation (rejects non-dice text)
       Added !mp debug tokens/deltoken commands

v2.13: Enhanced save attack processing
       - Condition tracking on tokens (paralyzed, mind control, etc.)
       - Status markers for active conditions
       - Recovery timing support (1 phase, 1 round, etc.)
       - Commands: !mp conditions, !mp clearcondition

v2.14: Save attack refinements
       - Init and Rec modifiers are now SEPARATE values (not additive)
       - Damaging Poison: Bio prot applies to DAMAGE only, NOT to EN save TN
       - Paralytic Poison: Bio prot applies to EN save TN (no damage)
       - Poison detected by damage value (doesn't require "Damaging" in name)
       - Poison damage has Roll-With buttons
       - Save Roll-With: 1 Power per +1 to save TN, max bonus = floor(Power/10)
       - Improved text readability (darker green for success messages)

v2.15: Snare BP dice formula support (e.g., "2d8" instead of fixed number)

v2.16: Range penalty extends beyond -12 for extreme distances (x2 = -1 more)

v2.17: Adaptation support (/2 suffix)
       - Takes ½ damage (rounded down) vs active attacks
       - +5 bonus to saves vs adapted damage type
       - 'Other' damage type: 100% immunity
       - Stacks with Invulnerability (apply invuln first, then adapt)

v2.18: Area Effect support
       - Area attacks get +6 (immobile) and 0 defense (per 4.7.2)
       - Auto-detect tokens in radius, escape buttons for players
       - Shield block option (damage vs shield BP)
       - Coverage reduction: Light=25%, Heavy=50%, Full=100%
       - Scatter on miss: ceil((range/20) * failMargin)
       - Commands: areaescape, areashield, arearollnpcs, areaforceall, areadamageall

v2.19: Damage Sub-Type matching
       - Attack and protection rows have sub-type fields (Heat, Sonics, Poison, etc.)
       - Protection with blank sub-type covers full damage type
       - Protection with specific sub-type only matches that sub-type
       - Supports comma-separated sub-types (Heat,Radiation)

v2.20: Absorption and Reflection support
       - Protection Mode: Normal (auto-apply), Absorption, or Reflection
       - Absorption/Reflection require saved action, give 1/4 damage
       - Reflection redirects damage as immediate counter-attack
       - Commands: absorb, reflect, reflecthit

v2.21: Absorption simplified
       - Absorbed points go directly to Hits, Power, or Split 50/50

v2.22: Absorption expanded
       - Can absorb to BC stats (ST/EN/AG/IN/CL) - temporary boost
       - Can absorb to "Other" powers - tracked as status effect
       - Status effects have 5-minute expiry with countdown
       - BC stat boosts automatically restore on expiry/clear
       - Purple status marker shows active absorption effects
       - Commands: checkexpiry (manual expiry check)

v2.23: (superseded by v2.43 - profile now uses both attacker and target)

v2.24: Minimum range enforcement
       - Adjacent tokens are at 1" range (not 0") per MP rules
       - Profile adjustments now work correctly at melee range
       - Example: fly at 1/420 profile in melee = 1" / (1/420) = 420" = -7 penalty

v2.25: Grapple attack support
       - Attack rows can be flagged as grapple attacks
       - Remote grapple flag (TK, Magnetism) blocks counter-grapple
       - Grip type: HTH (uses Base HTH Damage) or Power (custom dice)
       - Fixed counter-grapple TN: AG save (+3 if wrestling), not AG+3+wrestling
       - Squeeze/Break Free use grip dice when specified

v2.26: Grapple command enhancement
       - !mp grapple works with selected tokens (attacker first, target second)
       - !mp test grapple supports remote and gripdice args

v2.27: Grapple rules compliance (4.11)
       - !mp grapple now requires to-hit roll (per 4.11)
       - Considers target defense modifier
       - Lock attempt integrated (-3 penalty per 4.11.1)
       - Added !mp grapplerelease command
       - Test harness bypasses roll for testing
       - Restraint penalty reminder in output

v2.28: Token selection fix
       - Fixed reversed token order (Roll20 returns most recent first)
       - Updated all version strings throughout file

v2.29: Grapple refinements
       - Hover text on all grapple rolls showing dice/TN breakdown
       - Attacker gets "fist" status marker (restraint tracking per 3.0.2.6)
       - Correct restraint penalties: -3 normal, -9 if locked
       - Remote grapples still mark the grappler (restraint applies per 3.0.2.6 & 4.11)
       - All grapple end conditions clear attacker status marker
       - Counter-grapple sets fist marker on successful counter

v2.30: Restraint penalty enforcement (3.0.2.6)
       - Attacks now automatically apply restraint penalty
       - -3 if grappling someone or being grappled
       - -9 if fully restrained (locked)
       - Penalty shown in attack output and hover breakdown
       - Checks both grapple record and fist status marker

v2.31: Grapple attack corrections (4.11)
       - Grapple attacks do NOT deal damage (only establish hold)
       - Squeeze command now uses full damage pipeline (protection, roll-with)
       - Squeeze creates pending record with damage buttons

v2.32: Restore clears all effects

v2.33: Ability to-hit bonus fix
       - API now includes ability_tohit_bonus (global) and ability_tohit_targeted (per-row)
       - Heightened Expertise bonuses now properly applied to combat rolls
       - Improved hover breakdown: shows BC+3, Atk Mod, Ht.Exp, subtotal, then penalties

v2.34: Willpower abilities support
       - Fortitude: doubles roll-with capacity (checkbox in ability panel)
       - Pain Resistance: no knockout at half Hits, only at 0 (checkbox in ability panel)
       - !mp stat shows Fortitude/Pain Resistance indicators
       - !mp restore now clears all status markers (not just dead/sleepy)
       - Clears grapple/snare state and releases held targets
       - Clears conditions (paralyzed, mind control, etc.)
       - Resets defense modifier (bar3) to 0

v2.35: Protected Brain ability
       - Checkbox in ability panel, negates Head Shot critical effects

v2.36: Protected Brain notification
       - Shows notification in attack output when Head Shot is negated

v2.37: Called shot handling (4.14.2)
       - Roll template now passes called shot type to API
       - Head Shot (-6): Doubles Hits after protection/roll-with, Protected Brain negates
       - Leg Shot (-3): Shows EN+7 and AG save buttons
       - Arm Shot (-3): Shows EN+7 and AG save buttons
       - Avoid Armor (-3/-6): Bypasses partial armor coverage
       - Gear Shot (-3): Shows breakpoint comparison note
       - Called shot penalty shown in hover breakdown

v2.38: Protected Brain visibility fix
       - Changed text color from green (#50fa7b) to dark blue (#1a5276)
       - Now visible on green HIT background

v2.39: targetTotal calculation fix
       - API now always calculates to-hit from scratch using actual token defense
       - Hover breakdown math now matches displayed Final value

v2.40: Push/Hold Back fix
       - Fixed !mp atk command to support Hold Back (negative values)
       - Restored target field in roll template for TO-HIT display
       - Added Hold Back display message in attack output

v2.41: Absorption debug command
       - Added !mp debug absorb to check protection row setup
       - Shows State, Mode, and damage type values for each row

v2.42.1: Head shot knockback fix (MP 4.14.2.1)
       - Knockback is NOT doubled on head shots (damage to Hits is doubled, KB is not)
       - Added hitsForKB field to track pre-doubled value for KB calculation
