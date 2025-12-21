# Mighty Protectors Roll20 System

Custom character sheet and API for running Mighty Protectors RPG in Roll20.

## Components

- **mp_sheet.html** - Character sheet with automated BC calculations, attack rolls, protection tracking
- **mp_engine.js** - API script for combat automation (requires Roll20 Pro)

## Installation

### Sheet (all users)
1. Game Settings → Game Settings → Character Sheet Template
2. Select "Custom"
3. Paste contents of `sheet/mp_sheet.html` into HTML Layout
4. Save

### API (Pro subscribers)
1. Game Settings → API Scripts
2. Create new script, paste contents of `api/mp_engine.js`
3. Save (check the API console for: `MP ENGINE READY EVENT FIRED`)

## Sheet Features

- Auto-calculated BCs, saves, derived stats (HTH, Carry, Healing Rate, etc.)
- Repeating sections for Attacks, Protection, Abilities
- Attack rolls with configurable query prompts (range, defense, stance, aim, etc.)
- Roll + Confirm displayed for crit/fumble checking

## Attack Notes Shorthand (IMPORTANT)

The **Notes** field on each Attack can include shorthand tags. These tags change how the API interprets the attack.

General format:
- Tags are separated by spaces or semicolons.
- Most tags are `key:value` or `key:value:value`.
- Tags are case-insensitive.

### 1) Save Attacks
**Purpose:** A Save Attack forces targets to roll a save (EN/AG/IN/CL) instead of making a to-hit roll.

**Format:**
- `sav:<BC>:<mod>:<recovery>`
  - `BC` = Save type (EN, AG, IN, CL)
  - `mod` = Save modifier (e.g. `+5`, `-3`, `0`)
  - `recovery` = Recovery modifier applied on between-round recovery saves (optional)

**Examples:**
- `sav:EN:+5:-14`
- `sav:AG:0` (no recovery modifier)

**Rules notes (API behavior):**
- Normal save attacks: target protection/invulnerability can modify the save TN.
- Roll-with (Power/10 max) can also modify the save TN (as per MP rules).

#### Save Attacks with NO Damage Type (Flash-style)
Some save attacks explicitly have **no Damage Type** (e.g., Flash). These should not use normal protection buckets.

**Add one of these flags in Notes:**
- `dtype:none` (recommended canonical tag)
- `dmgtype:none`
- `notype`
- `no damage type`

**Example (Flash):**
- `sav:EN:+5:-14; dtype:none`

**Effect:**
- When `dtype:none` is present on a save attack, the API runs the save normally, but:
  - **does NOT** add protection
  - **does NOT** add invulnerability’s +8 vs saves

(Protected Sense is not tracked by the sheet yet, so there is no mitigation applied beyond the save.)

### 2) Snare Attacks
**Purpose:** A Snare attack creates a Break Point (BP) that targets must beat to escape.

**Format:**
- `snr:<type>:<bp>/<maxbp>`
  - `type` = `grp` (grapnel) or `ice` (or any label you use for your table)
  - `bp` = Break Point
  - `maxbp` = Maximum BP (optional)

**Examples:**
- `snr:ice:9/15`
- `snr:grp:8`

### 3) Armor Piercing (AP)
**Purpose:** Reduce or ignore protection.

**Formats:**
- `ap:<N>` reduces target protection by N (Hardened negates AP 1:1 first)
- `ap` ignores ALL protection & invulnerability (absolute AP)

**Examples:**
- `ap:5`
- `ap`

### 4) Other Notes Conventions (sheet/UI references)
These are not “tags” that the API parses, but are common Notes conventions shown in the sheet UI:
- Called shots, stance, aim, etc. are usually handled via roll queries on the sheet rather than Notes tags.

## Common Recipes (Copy/Paste)

These are “known-good” Notes patterns you can paste into an Attack row and then tweak numbers.

### Flash (blinding burst, no Damage Type)
Use when the power explicitly says “no damage type” (Flash-style).
- Notes:
  - `sav:EN:0:-12; dtype:none`
- Tips:
  - Put your per-attack PR cost (e.g. `2`) in the attack’s Cost field.
  - Because Protected Sense isn’t tracked yet, mitigation is currently “save or eat it”.

### Glare / Sensory Overload (normal typed save attack)
Use when the effect is a save attack *and* it should benefit from normal protection buckets.
- Notes:
  - `sav:EN:-2:-12`
- Example variants:
  - Harder to resist: `sav:EN:-5:-14`
  - Easier to resist: `sav:EN:+3:-10`

### Standard “Save or Suffer” (poison, stun gas, fear, etc.)
- Notes:
  - `sav:EN:0:-12`
- Typical mapping:
  - EN for toxins, body shock, stunning shock
  - CL for willpower/panic/terror
  - IN for mental intrusion / confusion-style effects
  - AG for reflex / dodge-the-cloud style effects (if your table uses AG saves that way)

### Save Attack that *does* have a Damage Type (e.g., “Save for half damage”)
If your table uses a save to reduce damage and it makes sense to use protection buckets:
- Notes:
  - `sav:EN:0:-12`
- Then set the Attack’s Damage Type field appropriately on the row (Kin/Eng/Psy/Bio/Ent/Other).

### Ice Snare (break point with a max)
- Notes:
  - `snr:ice:9/15`
- Tips:
  - Use `bp/maxbp` when the snare can “tighten” up to a cap.

### Grapnel Snare (simple BP, no cap)
- Notes:
  - `snr:grp:8`

### Armor Piercing bullets / blasts
- Partial AP:
  - `ap:5`
- Absolute AP (ignore all protection/invuln):
  - `ap`

### “Armor Piercing + Save” combo (rare, but supported)
If you have a save attack that also ignores protection (table-dependent):
- Notes:
  - `sav:EN:0:-12; ap:5`
  - or `sav:EN:0:-12; ap`
(Use carefully. In core MP, AP is usually discussed in the context of protection vs damage; if your power text doesn’t say it, don’t give it for free.)

## Color Scheme

The sheet uses a consistent color system based on the Mighty Protectors/V&V branding and Roll20 token bar defaults.

### Backgrounds
| Color | Hex | Usage |
|-------|-----|-------|
| Deep purple-black | `#1a1428` | Main sheet background |
| Dark blue-purple | `#1e1e38` | Panel backgrounds, calculated field backgrounds |
| Black | `#0d0d1a` | User-input field backgrounds |

### Borders
| Color | Hex | Usage |
|-------|-----|-------|
| Dark purple | `#2a2040` | Standard borders, dividers |
| Light purple | `#4a4070` | Calculated field borders (visible against dark blue) |
| Cyan | `#8be9fd` | Defense total borders (accent) |

### Title
| Color | Hex | Usage |
|-------|-----|-------|
| Gold | `#ffd700` | Title text |
| Orange | `#d35400` | Title stroke/border (V&V signature color) |

### Functional Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Red | `#e63946` | Clickable buttons, Hits, BC abbreviations (matches Roll20 Bar 2) |
| Yellow/Gold | `#f4d03f` | Power, BC scores, important labels (matches Roll20 Bar 1) |
| Green | `#50fa7b` | Spendable resources: Available CPs, Available IPs |
| Cyan | `#8be9fd` | Informational/defensive: Init, HTH, Mod columns |

### Text
| Color | Hex | Usage |
|-------|-----|-------|
| Light gray | `#eaeaea` | Standard text, user-input values |
| Medium gray | `#aaa` | Secondary labels |
| Dark gray | `#888` | Tertiary labels |
| Dim gray | `#666` | Disabled/n/a text, separators |

### Design Principles
- **Red = Action**: Anything clickable (roll buttons, attack buttons) uses red
- **Yellow = Power**: Matches Roll20 token Bar 1, used for Power and key values
- **Green = Spendable**: Resources the player can spend (CPs, IPs)
- **Cyan = Info**: Reference values, defensive stats, calculated info
- **Dark blue bg = Calculated**: Fields the sheet computes (readonly)
- **Black bg = User input**: Fields the player types in

## API Features

The API intercepts attack rolls and adds:
- Automatic hit/miss/crit/fumble determination
- Damage application with protection calculation
- Roll-with automation (diverts damage to Power)
- Knockback calculation and saves
- Token bar updates (bar1=Hits, bar2=Power)
- Status marker management

## API Commands
```
!mp config autoroll on|off    - Toggle auto-display of damage
!mp apply --id ID --mode noroll|rollwithmax|rollwithcustom --amt N
!mp kb --id ID                - Calculate knockback
!mp kbsave --target TOKID --penalty N
!mp save --id ID --rollwith N
!mp recover --target TOKID --bc BC --tn N
!mp snare --id ID
!mp break --target TOKID --push 0|1
!mp grapple --atk TOKID --def TOKID
!mp squeeze --atk TOKID --def TOKID
!mp grapplebreak --atk TOKID --def TOKID --push 0|1
!mp wakeup --target TOKID
!mp status --target TOKID
!mp help
```

## Token Setup

Link token bars for automatic tracking:
- Bar 1 → hits_score (current Hits)
- Bar 2 → power_score (current Power)

## Configuration

In API, type `!mp config autoroll off` to require clicking [Roll Damage] before seeing damage result.

Default is `autoroll on` (damage shown immediately on hit).

## Rules Reference

Based on Mighty Protectors RPG:
- Section 4.7: Combat rolls (roll-under, nat 1 = crit, nat 20 = fumble)
- Section 4.8: Damage, protection, roll-with, knockback
- Section 4.9: Save attacks
- Section 4.10: Snare attacks
- Section 4.11: Grappling

## Version History

- v2.1 - Config system, autoroll toggle, cleaned up chat output
- v2.0 - Full rewrite with accurate MP rules
- v1.0 - Initial version (buggy)
