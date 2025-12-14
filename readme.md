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