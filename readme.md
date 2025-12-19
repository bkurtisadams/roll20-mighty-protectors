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
3. Save - look for "MP ENGINE READY EVENT FIRED" in console

## Sheet Features

- Auto-calculated BCs, saves, derived stats (HTH, Carry, Healing Rate, etc.)
- Repeating sections for Attacks, Protection, Abilities
- Attack rolls with configurable query prompts (range, defense, stance, aim, etc.)
- Roll + Confirm displayed for crit/fumble checking
- Special attack notation in Notes field:
  - `sav:EN:+5:-14` - Save attack (BC:mod:recovery)
  - `snr:ice:9/15` - Snare attack (type:bp/maxbp)
  - `ap:5` or `ap` - Armor piercing (amount or ALL)

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