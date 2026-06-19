/* Gamma World 1e -> Mighty Protectors Bestiary data for Roll20
 * Companion data script for mp_engine.js (>= v2.66.0). Load BOTH as API scripts.
 * Consumed by: !mp gwspawn --name NAME [--form FORM]
 * Generated from gw-mp-bestiary.md v0.9.2. 48 creatures / 54 forms.
 * v0.4.0: MP_GW_VEHICLES added (Death Machine, Defense/Attack Borg) — modeled as
 *   MP Vehicles, not characters. gwspawn shadows the dormant character entries for
 *   these two and emits builder-format JSON (FLYER.json schema) to import. Force Field
 *   is per-hit protection (<=12/type) + Power capacity, NOT a point buffer; weapons are
 *   capped Power Blast / Disintegration (<=4d10); armor 8/5/4/3; black-ray = Disintegration
 *   (ignores FF/Armor/SR). Death Machine 384-space class (key 37.5), techMod 25.
 * v0.3.2: Speed reworked to honor GW intent. move_mod now = max(0, targetMove -
 *   calculated Move), where targetMove is the GW tabletop MV (or, for anti-grav
 *   robots given only kph, the MP Speed-table Acceleration matching that kph).
 *   Swim/overland "turn" Speeds and immobile (MV N/A) creatures get no ground mod.
 * v0.3.1: Heightened Defense wired -> physdef_mod/mentdef_mod (+1 per 5 CP
 *   both, or +1 per 2.5 CP Only-Physical/Only-Mental); aggregates into
 *   physical_def_bonus/mental_def_bonus. Orlen bundled case assumes 5 CP share.
 * v0.3.0: BCs now imported as BASE characteristics. Modifier abilities carry
 *   structured per-row mods (mods{}): Heightened Characteristic -> st/en/ag/in/cl_mod,
 *   Size Change -> st/en_mod + profile_mod, Speed -> move_mod, Durability -> hits_mod.
 *   aggmods{} pre-seeds the rolled-up modifier fields so derived scores resolve before
 *   the sheet is opened. Requires the sheet's per-row Move mod field. Heightened Defense
 *   not yet wired (awaiting CP->defense-value rule). Date: 2026-06-18
 */
var MP_GW_BESTIARY = {
 "android": [
  {
   "name": "Android — Thinker",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d4",
   "weight": "150",
   "inventing": "9",
   "initiative": "d8+1",
   "hitPts": "8",
   "hitPtsSrc": "8",
   "power": "50",
   "powerSrc": "50",
   "story": "GW source: Three sub-types — Thinker (HP 50, AC 6, MV 12), Worker (HP 40, AC 5, MV 12), Warrior (HP 75, AC 4, MV 15). Look indistinguishable from PSH. Specific 18s required by sub-type; remaining BCs rolled per MP 2.1.7.1 Normal Power Level. Consider humans existential threat; travel heavily armed; always fight to the death.\nMP build: Humanoid (synthetic). GM picks sub-type per encounter or rolls 1d3.\nAbilities: Heightened Intelligence ~+8 (8 CP), Heightened Cool ~+8 (8 CP), Heightened Defense Mental (5 CP), Armor 6 = 4/1/0/1 K/E/B/Ent (10 CP)\nEquipment: GM choice — pistol (5 CP) or short blade (5 CP)\nWeaknesses: Compulsion: fight to the death vs. humans -5 CP, Phobia / Hostility: humans treated as existential threat -5 CP\nCP estimate: ~31 + equipment\nEncounter: Android — Thinker (No. appearing 1d6 each type). HTH d4, Init d8+1.",
   "abilities": [
    {
     "desc": "Heightened Intelligence ~+8 (8 CP)",
     "cp": "8",
     "ip": "",
     "mods": {
      "in_mod": 8
     }
    },
    {
     "desc": "Heightened Cool ~+8 (8 CP)",
     "cp": "8",
     "ip": "",
     "mods": {
      "cl_mod": 8
     }
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Armor 6 = 4/1/0/1 K/E/B/Ent (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Gear: GM choice — pistol (5 CP) or short blade (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Compulsion: fight to the death vs. humans -5 CP",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia / Hostility: humans treated as existential threat -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d4",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "form": "Android — Thinker",
   "aggmods": {
    "intelligence_mod": 8,
    "cool_mod": 8,
    "mental_def_bonus": 2
   }
  },
  {
   "name": "Android — Worker",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d6",
   "weight": "250",
   "inventing": "5",
   "initiative": "d4",
   "hitPts": "16",
   "hitPtsSrc": "16",
   "power": "56",
   "powerSrc": "56",
   "story": "GW source: Three sub-types — Thinker (HP 50, AC 6, MV 12), Worker (HP 40, AC 5, MV 12), Warrior (HP 75, AC 4, MV 15). Look indistinguishable from PSH. Specific 18s required by sub-type; remaining BCs rolled per MP 2.1.7.1 Normal Power Level. Consider humans existential threat; travel heavily armed; always fight to the death.\nMP build: Humanoid (synthetic). GM picks sub-type per encounter or rolls 1d3.\nAbilities: Heightened Strength/Endurance ~+8 each (16 CP), Armor 8 = 6/1/0/1 (12.5 CP)\nEquipment: GM choice — large club (15 CP) or heavy blade (15 CP)\nWeaknesses: Compulsion: fight to the death vs. humans -5 CP, Phobia / Hostility: humans treated as existential threat -5 CP\nCP estimate: ~33.5 + equipment\nEncounter: Android — Worker (No. appearing 1d6 each type). HTH d8+1, Init d4.",
   "abilities": [
    {
     "desc": "Heightened Strength/Endurance ~+8 each (16 CP)",
     "cp": "16",
     "ip": "",
     "mods": {
      "st_mod": 8,
      "en_mod": 8
     }
    },
    {
     "desc": "Armor 8 = 6/1/0/1 (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Gear: GM choice — large club (15 CP) or heavy blade (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Compulsion: fight to the death vs. humans -5 CP",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia / Hostility: humans treated as existential threat -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "6",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "form": "Android — Worker",
   "aggmods": {
    "strength_mod": 8,
    "endurance_mod": 8
   }
  },
  {
   "name": "Android — Warrior",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d6",
   "weight": "250",
   "inventing": "9",
   "initiative": "d4",
   "hitPts": "20",
   "hitPtsSrc": "20",
   "power": "72",
   "powerSrc": "72",
   "story": "GW source: Three sub-types — Thinker (HP 50, AC 6, MV 12), Worker (HP 40, AC 5, MV 12), Warrior (HP 75, AC 4, MV 15). Look indistinguishable from PSH. Specific 18s required by sub-type; remaining BCs rolled per MP 2.1.7.1 Normal Power Level. Consider humans existential threat; travel heavily armed; always fight to the death.\nMP build: Humanoid (synthetic). GM picks sub-type per encounter or rolls 1d3.\nAbilities: Heightened Strength/Endurance/Agility/Intelligence ~+8 each (32 CP), Armor 9 = 7/1/0/1 (15 CP)\nEquipment: GM choice — auto rifle (15 CP) or blast rifle (15 CP) + large blade (10 CP)\nWeaknesses: Compulsion: fight to the death vs. humans -5 CP, Phobia / Hostility: humans treated as existential threat -5 CP\nCP estimate: ~57 + equipment\nEncounter: Android — Warrior (No. appearing 1d6 each type). HTH d8+1, Init d4.",
   "abilities": [
    {
     "desc": "Heightened Strength/Endurance/Agility/Intelligence ~+8 each (32 CP)",
     "cp": "32",
     "ip": "",
     "mods": {
      "st_mod": 8,
      "en_mod": 8,
      "ag_mod": 8,
      "in_mod": 8
     }
    },
    {
     "desc": "Armor 9 = 7/1/0/1 (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Gear: GM choice — auto rifle (15 CP) or blast rifle (15 CP) + large blade (10 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Compulsion: fight to the death vs. humans -5 CP",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia / Hostility: humans treated as existential threat -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "7",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "form": "Android — Warrior",
   "aggmods": {
    "strength_mod": 8,
    "endurance_mod": 8,
    "agility_mod": 8,
    "intelligence_mod": 8
   }
  }
 ],
 "ark": [
  {
   "name": "Ark",
   "stats": {
    "st": {
     "cp": "11"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "13"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "",
   "inventing": "7",
   "initiative": "d4",
   "hitPts": "11",
   "hitPtsSrc": "11",
   "power": "53",
   "powerSrc": "53",
   "story": "GW source: AC 4, HD 8, MV 15, MS 10, Rad Res 10. 3m intelligent dog-man, mutations Telekinesis + Weather Manipulation + Life Leech, phobia of large winged creatures, wields wicker shield + large club. Considers human hands a delicacy.\nMP build: Humanoid (anthropomorphic intelligent — no A/P)\nAbilities: Size Change Larger 9' (7.5 CP), Telekinesis A 7.5 CP (300 lbs/d6+1, range 12\"), Weather Control A+B (25 CP), Siphon (Hits, Area Effect) 12.5 CP, Armor 6 = 1/3/1/1 K/E/B/Ent (10 CP, rad-leaning), Adaptation Radiation 5 CP\nEquipment: Large Club (15 CP), wicker shield in Armor\nWeaknesses: Phobia (large winged creatures) -5 CP\nCP estimate: ~85\nEncounter: Ark (No. appearing 1d4). HTH d6+1, Init d4.",
   "abilities": [
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Telekinesis A 7.5 CP (300 lbs/d6+1, range 12\")",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Weather Control A+B (25 CP)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Siphon (Hits, Area Effect) 12.5 CP",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 1/3/1/1 K/E/B/Ent (10 CP, rad-leaning)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Adaptation Radiation 5 CP",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Gear: Large Club (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Gear: wicker shield in Armor",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Phobia (large winged creatures) -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "3",
   "protBio": "1",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "arn": [
  {
   "name": "Arn",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d2",
   "weight": "40",
   "inventing": "2",
   "initiative": "d3",
   "hitPts": "2",
   "hitPtsSrc": "2",
   "power": "33",
   "powerSrc": "33",
   "story": "GW source: AC 9, HD 8, MV 3/16 (ground/fly), bite 2d6, carries ≤2kg in flight. 1.3m mutated flying insect, beast of burden.\nMP build: A/P Insect, Low power level\nAbilities: A/P Insect Low (10 CP — Flight 16m/turn ≤2kg cargo, Natural Weaponry mandibles +4/+6 sharp), Size Change Smaller 4.5' (2.5 CP), Armor 2 = 1/0/0/1 (2.5 CP, chitin)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~15\nEncounter: Arn (No. appearing 1d4). HTH d3, Init d3.",
   "abilities": [
    {
     "desc": "A/P Insect Low (10 CP — Flight 16m/turn ≤2kg cargo, Natural Weaponry mandibles +4/+6 sharp)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Armor 2 = 1/0/0/1 (2.5 CP, chitin)",
     "cp": "2.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "0",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": -1,
    "profile": 0.6666666666666666
   }
  }
 ],
 "badder": [
  {
   "name": "Badder",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "6"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "100",
   "inventing": "7",
   "initiative": "d6+1",
   "hitPts": "9",
   "hitPtsSrc": "9",
   "power": "49",
   "powerSrc": "49",
   "story": "GW source: AC 4, HD 6, MV 12, Dex 18, MS 16, bite 1d6, mutation Empathy, hard of hearing, keen sense of smell. 1.5m intelligent mutated badger, medieval society. 10% chance of 1 random artifact weapon.\nMP build: Humanoid (\"Short\" descriptor free at 1.5m)\nAbilities: Heightened Agility ~+8 (8 CP), Heightened Cool ~+6 (6 CP), Heightened Intelligence ~+3 (3 CP), Heightened Senses Odors Full+Acute (10 CP), Telepathy visual+verbal+Mood Reading (10 CP — Empathy), Armor 3 = 1/1/0/1 (5 CP)\nEquipment: Spear (15 CP), wooden shield in Armor, 10% random artifact weapon\nWeaknesses: Diminished Senses hearing -5 CP\nCP estimate: ~57\nEncounter: Badder (No. appearing 1d6). HTH d6, Init d6+1.",
   "abilities": [
    {
     "desc": "Heightened Agility ~+8 (8 CP)",
     "cp": "8",
     "ip": "",
     "mods": {
      "ag_mod": 8
     }
    },
    {
     "desc": "Heightened Cool ~+6 (6 CP)",
     "cp": "6",
     "ip": "",
     "mods": {
      "cl_mod": 6
     }
    },
    {
     "desc": "Heightened Intelligence ~+3 (3 CP)",
     "cp": "3",
     "ip": "",
     "mods": {
      "in_mod": 3
     }
    },
    {
     "desc": "Heightened Senses Odors Full+Acute (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Telepathy visual+verbal+Mood Reading (10 CP — Empathy)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Armor 3 = 1/1/0/1 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Gear: Spear (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Gear: wooden shield in Armor",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Gear: 10% random artifact weapon",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Diminished Senses hearing -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "agility_mod": 8,
    "intelligence_mod": 3,
    "cool_mod": 6
   }
  }
 ],
 "barl nep": [
  {
   "name": "Barl Nep",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "80",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "12",
   "hitPtsSrc": "12",
   "power": "47",
   "powerSrc": "47",
   "story": "GW source: AC 3, HD 20, MV 20. 1m totally black fish. If attacked: secretes radioactive oil intensity 18 covering 10m diameter area, lasts 10 min in calm water. Killed: extracts intensity 12 oil for 10-min slick.\nMP build: A/P Fish, High power level (HD 20 boss)\nAbilities: A/P Fish High (30 CP — Adaptation Aquatic, Heightened Senses, Speed swim, Natural Weaponry bite), Size Change Smaller 4.5' (2.5 CP), Heightened Endurance +6 (6 CP), Speed +6 swim (5 CP — for MV 20), Change Environment Damaging Hard Radiation 11\" diameter (12.5 CP — supplement, defensive trigger when attacked, 10m oil slick area, 5 Devit Entropy/round in calm water for 10 min), Adaptation Energy radiation (5 CP), Armor 12 = 6/3/1/2 (20 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (totally black fish) -5\nCP estimate: ~83\nEncounter: Barl Nep (No. appearing 1d3). HTH d4, Init d4.",
   "abilities": [
    {
     "desc": "A/P Fish High (30 CP — Adaptation Aquatic, Heightened Senses, Speed swim, Natural Weaponry bite)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Heightened Endurance +6 (6 CP)",
     "cp": "6",
     "ip": "",
     "mods": {
      "en_mod": 6
     }
    },
    {
     "desc": "Speed +6 swim (5 CP — for MV 20)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Change Environment Damaging Hard Radiation 11\" diameter (12.5 CP — supplement, defensive trigger when attacked, 10m oil slick area, 5 Devit Entropy/round in calm water for 10 min)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy radiation (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 6/3/1/2 (20 CP)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (totally black fish) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d4",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "6",
   "protEnergy": "3",
   "protBio": "1",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": -1,
    "endurance_mod": 6,
    "profile": 0.6666666666666666
   }
  }
 ],
 "ber lep": [
  {
   "name": "Ber Lep",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "15"
    },
    "ag": {
     "cp": "4"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "600",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "6",
   "hitPtsSrc": "6",
   "power": "30",
   "powerSrc": "30",
   "story": "GW source: AC 6, HD 15, MV N/A. Free-floating aquatic plant 2m across, grows as enormous lily-pad-like sheet on water surface. Sweet-smelling acid attracts/kills/dissolves small animals and insects landing on it. Thick enough to support human weight; acid is relatively slow-acting. If injured, teleports 5-30m distant.\nMP build: A/P Plant, Standard power level\nAbilities: A/P Plant Standard (20 CP — Mobility (none/floating only), Heightened Endurance, Adaptation Aquatic), Power Blast Bio sweet acid contact-passive (slow-acting digestive juice, ~1-2/round on stationary creatures, supplement Change Environment alternative possible) (10 CP), Emotion Control Pheromones (sweet-smelling lure for small creatures) (7.5 CP), Teleportation 30m (12.5 CP) with Restriction \"only when injured\" (-5 CP) = 7.5 CP net, Armor 6 = 4/1/0/1 K/E/B/Ent (10 CP — thick plant fiber, raft-like)\nWeaknesses: Lowered Intelligence -5, Distinctive (large floating leaf-sheet) -5\nCP estimate: ~55\nEncounter: Ber Lep (No. appearing 1d3). HTH d3, Init d3.",
   "abilities": [
    {
     "desc": "A/P Plant Standard (20 CP — Mobility (none/floating only), Heightened Endurance, Adaptation Aquatic)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Power Blast Bio sweet acid contact-passive (slow-acting digestive juice, ~1-2/round on stationary creatures, supplement Change Environment alternative possible) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Emotion Control Pheromones (sweet-smelling lure for small creatures) (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Teleportation 30m (12.5 CP) with Restriction \"only when injured\" (-5 CP) = 7.5 CP net",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 4/1/0/1 K/E/B/Ent (10 CP — thick plant fiber, raft-like)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (large floating leaf-sheet) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1"
  }
 ],
 "blaash": [
  {
   "name": "Blaash",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "15"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "50",
   "inventing": "2",
   "initiative": "d6",
   "hitPts": "11",
   "hitPtsSrc": "11",
   "power": "42",
   "powerSrc": "42",
   "story": "GW source: AC 8, HD 15, MV 6/15 (ground/fly). ~1m mutated moth, 2m wingspan, fearless and carnivorous. Glows brightly when attacking; emits intensity 18 radiation in 5m radius continuous. Self+kin immune. Post-kill feeding phase.\nMP build: A/P Insect, Standard power level\nAbilities: A/P Insect Standard (20 CP — Flight 15m, Heightened Senses, Natural Weaponry +d3 sharp), Size Change Smaller 4.5' (2.5 CP), Change Environment Damaging Hard Radiation 11\" diameter (12.5 CP — 5 Devitalization Entropy/round, supplement), Adaptation Energy/radiation complete (5 CP), Light Control C Glare (5 CP), Armor 3 = 1/2/0/0 (5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~50\nEncounter: Blaash (No. appearing 1d3). HTH d4, Init d6.",
   "abilities": [
    {
     "desc": "A/P Insect Standard (20 CP — Flight 15m, Heightened Senses, Natural Weaponry +d3 sharp)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Change Environment Damaging Hard Radiation 11\" diameter (12.5 CP — 5 Devitalization Entropy/round, supplement)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy/radiation complete (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Light Control C Glare (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 3 = 1/2/0/0 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d4",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "0",
   "aggmods": {
    "strength_mod": -1,
    "profile": 0.6666666666666666
   }
  }
 ],
 "blight": [
  {
   "name": "Blight",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "600",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "11",
   "hitPtsSrc": "11",
   "power": "43",
   "powerSrc": "43",
   "story": "GW source: AC 9, HD 12, MV 2/10 (ground/fly). 3m carnivorous winged worm, up to 10m wingspan. Invisibility at will. First attack from invisibility: blinding flash 1d4 turns. Bite 3d6, preferred constriction 5d6/turn. Resistant to radiation, heat, sonic.\nMP build: A/P Reptile, Standard power level (snake-like worm)\nAbilities: A/P Reptile Standard (20 CP — Flight 10m, Natural Weaponry bite +d8 sharp, Heightened Senses), Size Change Larger 9' (7.5 CP), Invisibility Visible Light (10 CP — at-will), Light Control B Flash (5 CP — first-strike blind 1d4 turns), Grapnel constriction 5d6/turn (15 CP), Adaptation Energy radiation+heat (5 CP), Adaptation Kinetic sonic (5 CP), Armor 0\nWeaknesses: Lowered Intelligence -5, Distinctive (giant worm) -5\nCP estimate: ~67.5\nEncounter: Blight (No. appearing 1d6). HTH d6+1, Init d4.",
   "abilities": [
    {
     "desc": "A/P Reptile Standard (20 CP — Flight 10m, Natural Weaponry bite +d8 sharp, Heightened Senses)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Invisibility Visible Light (10 CP — at-will)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Light Control B Flash (5 CP — first-strike blind 1d4 turns)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Grapnel constriction 5d6/turn (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy radiation+heat (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Kinetic sonic (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 0",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (giant worm) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "brutorz": [
  {
   "name": "Brutorz",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "8"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "2200",
   "inventing": "4",
   "initiative": "d6",
   "hitPts": "12",
   "hitPtsSrc": "12",
   "power": "53",
   "powerSrc": "53",
   "story": "GW source: AC 7, HD 14, MV 18. 2m+ at shoulder, mutated horse (\"neo-Percheron\"), 1000kg bulk, agile despite size. MS 12, intelligent, partial to PSH. Precognition mutation. Combat: 2d6 kicks per forehoof, 3d6 bite. Treated with respect, serves as humanoid mount.\nMP build: A/P Mammal, Standard power level\nAbilities: A/P Mammal Standard (20 CP — Speed, Heightened Agility, Natural Weaponry hooves+bite — kicks 2d6/forehoof + bite 3d6 modeled as +d6 blunt and +d8 sharp), Size Change Larger 9' (7.5 CP), Heightened Senses Time/Precognitive (15 CP — Precognition mutation), Heightened Strength ~+4 (4 CP), Speed +3 (2.5 CP — for MV 18), Armor 5 = 3/1/0/1 K/E/B/Ent (7.5 CP — partial muscled hide)\nEquipment: saddle/harness for mount use\nWeaknesses: Distinctive (giant horse) -5\nCP estimate: ~56.5\nEncounter: Brutorz (No. appearing 1d6). HTH d6+1, Init d6.",
   "abilities": [
    {
     "desc": "A/P Mammal Standard (20 CP — Speed, Heightened Agility, Natural Weaponry hooves+bite — kicks 2d6/forehoof + bite 3d6 modeled as +d6 blunt and +d8 sharp)",
     "cp": "20",
     "ip": "",
     "mods": {
      "move_mod": 3
     }
    },
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Heightened Senses Time/Precognitive (15 CP — Precognition mutation)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Heightened Strength ~+4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "st_mod": 4
     }
    },
    {
     "desc": "Speed +3 (2.5 CP — for MV 18)",
     "cp": "2.5",
     "ip": ""
    },
    {
     "desc": "Armor 5 = 3/1/0/1 K/E/B/Ent (7.5 CP — partial muscled hide)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Gear: saddle/harness for mount use",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Distinctive (giant horse) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "3",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 9,
    "endurance_mod": 4,
    "profile": 1.5,
    "move_mod": 3
   }
  }
 ],
 "cal then": [
  {
   "name": "Cal Then",
   "stats": {
    "st": {
     "cp": "6"
    },
    "en": {
     "cp": "3"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "8"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "4",
   "initiative": "d8+1",
   "hitPts": "7",
   "hitPtsSrc": "7",
   "power": "41",
   "powerSrc": "41",
   "story": "GW source: AC 9, HD 6, MV 4/12 (ground/fly). Intelligent (MS 18) flying insect, up to 2.5m. Huge mandibles 10d6 dmg, can crush duralloy given time. Gourmet for bones — rips flesh off living creatures to get to bones. Resistant to all heat and cold.\nMP build: A/P Insect, Standard power level (high-MS variant — skip Lowered Int weakness)\nAbilities: A/P Insect Standard (20 CP — Flight 12m, Natural Weaponry crushing mandibles +d8 sharp, Heightened Senses bone-detection), Size Change Larger 8' (5 CP), Heightened Cool ~+8 outside A/P (8 CP — for MS 18), Heightened Strength ~+4 (4 CP — for crushing power), Heightened Attack +2d6 (10 CP — 10d6 GW = high-tier MP bite), Unprotection -3 Kinetic associated with bite, Max -6 (10 CP — supplement ability, for \"given time, crush even duralloy\" — each bite reduces target armor), Adaptation Energy heat+cold (5 CP)\nWeaknesses: - Distinctive (giant flying insect) -5 CP (in A/P bundle)\nCP estimate: ~57\nEncounter: Cal Then (No. appearing 1d2). HTH d6, Init d8+1.",
   "abilities": [
    {
     "desc": "A/P Insect Standard (20 CP — Flight 12m, Natural Weaponry crushing mandibles +d8 sharp, Heightened Senses bone-detection)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 8' (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "st_mod": 3,
      "en_mod": 3,
      "profile_mod": "x1.3"
     }
    },
    {
     "desc": "Heightened Cool ~+8 outside A/P (8 CP — for MS 18)",
     "cp": "8",
     "ip": "",
     "mods": {
      "cl_mod": 8
     }
    },
    {
     "desc": "Heightened Strength ~+4 (4 CP — for crushing power)",
     "cp": "4",
     "ip": "",
     "mods": {
      "st_mod": 4
     }
    },
    {
     "desc": "Heightened Attack +2d6 (10 CP — 10d6 GW = high-tier MP bite)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Unprotection -3 Kinetic associated with bite",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Max -6 (10 CP — supplement ability, for \"given time, crush even duralloy\" — each bite reduces target armor)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy heat+cold (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "- Distinctive (giant flying insect) -5 CP (in A/P bundle)",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 7,
    "endurance_mod": 3,
    "cool_mod": 8,
    "profile": 1.3
   }
  }
 ],
 "centisteed": [
  {
   "name": "Centisteed",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "4"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "7",
   "hitPtsSrc": "7",
   "power": "41",
   "powerSrc": "41",
   "story": "GW source: AC 9, HD 7, MV 30. Long-bodied mutated horse with 16 legs, almost insect-like. Carries 2 human-sized riders at full speed. Force Field Generation. Total mental immunity. Increased Metabolism (huge fodder requirement). Combat-unstable — one rider must dedicate to control.\nMP build: A/P Mammal, Standard power level\nAbilities: A/P Mammal Standard (20 CP — Speed, Heightened Agility, Natural Weaponry hooves/mandibles), Size Change Larger 8' (5 CP), Force Field A Personal (~22 protection, 17.5 CP), Adaptation Mental complete immunity (5 CP), Super Speed +1 turn (10 CP), Speed +6 (5 CP — total Move 30)\nEquipment: saddle/bridle (riding gear)\nWeaknesses: - A/P bundle: Lowered Intelligence -5, Distinctive (centipede-horse) -5\nCP estimate: ~52\nEncounter: Centisteed (No. appearing 1d4). HTH d6+1, Init d3.",
   "abilities": [
    {
     "desc": "A/P Mammal Standard (20 CP — Speed, Heightened Agility, Natural Weaponry hooves/mandibles)",
     "cp": "20",
     "ip": "",
     "mods": {
      "move_mod": 17
     }
    },
    {
     "desc": "Size Change Larger 8' (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "st_mod": 3,
      "en_mod": 3,
      "profile_mod": "x1.3"
     }
    },
    {
     "desc": "Force Field A Personal (~22 protection, 17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental complete immunity (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Super Speed +1 turn (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Speed +6 (5 CP — total Move 30)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Gear: saddle/bridle (riding gear)",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "- A/P bundle: Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (centipede-horse) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 3,
    "endurance_mod": 3,
    "profile": 1.3,
    "move_mod": 17
   }
  }
 ],
 "cren tosh": [
  {
   "name": "Cren Tosh",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "8"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "4",
   "initiative": "d6",
   "hitPts": "13",
   "hitPtsSrc": "13",
   "power": "50",
   "powerSrc": "50",
   "story": "GW source: AC 3, HD 16, MV 12. 2m fish that can transform into any lizard (with Sleeth-like mutations) for up to 24 hours. In fish form, burrows wide tunnels into riverbanks for nesting. Eats only plants, collects shiny objects.\nMP build: A/P Fish (primary form), Standard power level\nAbilities: A/P Fish Standard (20 CP — Adaptation Aquatic, Heightened Senses, Natural Weaponry bite +d6 sharp), Size Change Larger 7' (2.5 CP), Heightened Endurance +3 (3 CP), Shape-Shifting Comprehensive (lizard category w/ Sleeth-tier mutations) ~25 CP — high-tier shift inheriting target abilities, Tunneling (Max SR 2 dirt, Max Speed 6, associated with bite for nesting tunnels) 12.5 CP (supplement), Armor 12 = 7/2/0/3 (20 CP)\nWeaknesses: Distinctive (large fish/lizard transformer) -5\nCP estimate: ~88 + Sleeth-form variable abilities\nEncounter: Cren Tosh (No. appearing 1d4). HTH d6, Init d6.",
   "abilities": [
    {
     "desc": "A/P Fish Standard (20 CP — Adaptation Aquatic, Heightened Senses, Natural Weaponry bite +d6 sharp)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 7' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": 2,
      "en_mod": 1,
      "profile_mod": "x1.2"
     }
    },
    {
     "desc": "Heightened Endurance +3 (3 CP)",
     "cp": "3",
     "ip": "",
     "mods": {
      "en_mod": 3
     }
    },
    {
     "desc": "Shape-Shifting Comprehensive (lizard category w/ Sleeth-tier mutations) ~25 CP — high-tier shift inheriting target abilities",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Tunneling (Max SR 2 dirt, Max Speed 6, associated with bite for nesting tunnels) 12.5 CP (supplement)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 7/2/0/3 (20 CP)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Distinctive (large fish/lizard transformer) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "7",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "3",
   "aggmods": {
    "strength_mod": 2,
    "endurance_mod": 4,
    "profile": 1.2
   }
  }
 ],
 "crep plant": [
  {
   "name": "Crep Plant",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "15"
    },
    "ag": {
     "cp": "5"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "9",
   "hitPtsSrc": "9",
   "power": "36",
   "powerSrc": "36",
   "story": "GW source: AC 3, HD 15, MV 1. Two varieties: water (pink, submerged) and land (red, rainy areas). Mental mutations: Death Field Generation, Molecular Disruption, Life Leech (feeds via). Plant mutations: Mobility, 1d4 manipulation vines, Parasitic Attachment. Reproduction: leaf-attachments drain blood 10 HP/turn, drop after victim dies, burrow → new plant.\nMP build: A/P Plant, High power level (HD 15 boss)\nAbilities: A/P Plant High (30 CP — Mobility, Stretching A 1d4 vines, Natural Weaponry vine grasp, Heightened Endurance), Power Blast Bio Area Effect Death Field 20m radius (25 CP — Death Field Generation), Disintegration A (15 CP — Molecular Disruption), Siphon Hits Parasitic Attachment 10 HP/turn sustained (15 CP — Life Leech feeding mechanism), Armor 12 = 8/2/0/2 K/E/B/Ent (20 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (giant carnivore plant) -5\nCP estimate: ~105\nEncounter: Crep Plant (No. appearing 1). HTH d6, Init d4.",
   "abilities": [
    {
     "desc": "A/P Plant High (30 CP — Mobility, Stretching A 1d4 vines, Natural Weaponry vine grasp, Heightened Endurance)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Power Blast Bio Area Effect Death Field 20m radius (25 CP — Death Field Generation)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Disintegration A (15 CP — Molecular Disruption)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Siphon Hits Parasitic Attachment 10 HP/turn sustained (15 CP — Life Leech feeding mechanism)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 8/2/0/2 K/E/B/Ent (20 CP)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (giant carnivore plant) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "8",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2"
  }
 ],
 "ert": [
  {
   "name": "Ert",
   "stats": {
    "st": {
     "cp": "6"
    },
    "en": {
     "cp": "3"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d2",
   "weight": "30",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "1",
   "hitPtsSrc": "1",
   "power": "24",
   "powerSrc": "24",
   "story": "GW source: AC 9, HD 3, MV 8. 1m fish in swift mountain streams. Bite has chance to turn victim to granite-like rock — treat as intensity 12 poison attack, \"D\" result = stone.\nMP build: A/P Fish, Low power level\nAbilities: A/P Fish Low (10 CP — Adaptation Aquatic, Natural Weaponry bite +d4 sharp), Transmutation A (organic→stone, contact via bite, intensity 12 save) (17.5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (innocuous-looking fish) -5\nCP estimate: ~27.5\nEncounter: Ert (No. appearing 1d4). HTH d3, Init d3.",
   "abilities": [
    {
     "desc": "A/P Fish Low (10 CP — Adaptation Aquatic, Natural Weaponry bite +d4 sharp)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Transmutation A (organic→stone, contact via bite, intensity 12 save) (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (innocuous-looking fish) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ]
  }
 ],
 "ert telden": [
  {
   "name": "Ert Telden",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "70",
   "inventing": "2",
   "initiative": "d3",
   "hitPts": "6",
   "hitPtsSrc": "6",
   "power": "35",
   "powerSrc": "35",
   "story": "GW source: AC 6, HD 12, MV 9. 1m+ fish in backwaters/marshes/swamps. Self-destructive defense: when removed from water, turn 1 burns hot enough to deal 5d6 heat damage to all within 30m; turn 2 explodes for 10d6 to all in range. Sometimes captured by tribes for catapult-launched warfare.\nMP build: A/P Fish, Standard power level\nAbilities: A/P Fish Standard (20 CP — Adaptation Aquatic, Heightened Senses, Natural Weaponry bite), Size Change Smaller 4.5' (2.5 CP), Power Blast Energy Heat Area Effect 30m radius / 60\" diameter — escalating 2-stage (turn 1 ~2d6, turn 2 ~3d6 + Death Touch finisher), trigger-restricted to \"when out of water\" (~30 CP), Adaptation Energy heat (self-immune, 5 CP), Armor 6 = 3/2/0/1 (10 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (orange-glowing fish out of water) -5, Special Requirement (water-bound — dies if out >2 turns) -7.5\nCP estimate: ~62.5\nEncounter: Ert Telden (No. appearing 1d3). HTH d3, Init d3.",
   "abilities": [
    {
     "desc": "A/P Fish Standard (20 CP — Adaptation Aquatic, Heightened Senses, Natural Weaponry bite)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Power Blast Energy Heat Area Effect 30m radius / 60\" diameter — escalating 2-stage (turn 1 ~2d6, turn 2 ~3d6 + Death Touch finisher)",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "trigger-restricted to \"when out of water\" (~30 CP)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy heat (self-immune, 5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 3/2/0/1 (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (orange-glowing fish out of water) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Special Requirement (water-bound — dies if out >2 turns) -7.5",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "3",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": -1,
    "profile": 0.6666666666666666
   }
  }
 ],
 "fen": [
  {
   "name": "Fen",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "12"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "6",
   "initiative": "d6",
   "hitPts": "8",
   "hitPtsSrc": "8",
   "power": "48",
   "powerSrc": "48",
   "story": "GW source: AC 7, HD 10, MV 12 water / 3 land / 8 fly. Intelligent man-sized fish, walks on 2 stubby fins. Lungs + gills (24h out of water OK). Translucent skin = invisible underwater. Use weapons; tail club 6d6. Resistant to radiation, poison resistance 18, reflect heat + light (laser) for 5 turns before taking damage. Shape-change to large bird and fly to escape.\nMP build: Humanoid (intelligent, weapons — no A/P)\nAbilities: Adaptation Aquatic (5 CP), Adaptation Energy radiation complete (5 CP), Adaptation Bio poison resistance 18 (5 CP), Reflection Energy (heat + light/laser, duration 5 rounds before taking damage) ~12.5 CP — limited duration variant, Invisibility Visible Light (Underwater-only restriction) 7.5 CP, Flight 8m (5 CP), Shape-Shifting (large bird, escape only, no abilities transfer) 10 CP, Natural Weaponry tail club +d10 blunt (10 CP — for 6d6 GW), Armor 5 = 2/2/0/1 (7.5 CP)\nEquipment: Any weapon — Fens collect and use freely (15-25 CP iron-age to recovered tech).\nWeaknesses: none baseline\nCP estimate: ~67.5 + equipment\nEncounter: Fen (No. appearing 1d4). HTH d6, Init d6.",
   "abilities": [
    {
     "desc": "Adaptation Aquatic (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy radiation complete (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Bio poison resistance 18 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Reflection Energy (heat + light/laser, duration 5 rounds before taking damage) ~12.5 CP — limited duration variant",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Invisibility Visible Light (Underwater-only restriction) 7.5 CP",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Flight 8m (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Shape-Shifting (large bird, escape only, no abilities transfer) 10 CP",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Natural Weaponry tail club +d10 blunt (10 CP — for 6d6 GW)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Armor 5 = 2/2/0/1 (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Gear: Any weapon — Fens collect and use freely (15-25 CP iron-age to recovered tech).",
     "cp": "-25",
     "ip": ""
    },
    {
     "desc": "none baseline",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "2",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "1"
  }
 ],
 "fleshin": [
  {
   "name": "Fleshin",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "7"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "2",
   "initiative": "d3",
   "hitPts": "5",
   "hitPtsSrc": "5",
   "power": "38",
   "powerSrc": "38",
   "story": "GW source: AC 8, HD 8, MV 9 water / 5 fly (glide). 2m fish in large lakes. Surface-skims, then launches and glides on broad pectoral fins for hours. Feeds on water birds + small animals; attacks humans when hungry. Dorsal fin: intensity 15 poison spines. If seriously threatened: shapechange to Sleeth with all that creature's powers.\nMP build: A/P Fish, Standard power level\nAbilities: A/P Fish Standard (20 CP — Adaptation Aquatic, Flight gliding, Natural Weaponry bite +d6 sharp), Size Change Larger 7' (2.5 CP), Poison/Venom A intensity 15 contact passive on dorsal (12.5 CP), Shape-Shifting (Sleeth with full ability transfer, escape/desperation only) 25 CP — high-tier specific-target shift, Armor 3 = 1/1/0/1 (5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (giant flying fish) -5\nCP estimate: ~65\nEncounter: Fleshin (No. appearing 1d4). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "A/P Fish Standard (20 CP — Adaptation Aquatic, Flight gliding, Natural Weaponry bite +d6 sharp)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 7' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": 2,
      "en_mod": 1,
      "profile_mod": "x1.2"
     }
    },
    {
     "desc": "Poison/Venom A intensity 15 contact passive on dorsal (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Shape-Shifting (Sleeth with full ability transfer, escape/desperation only) 25 CP — high-tier specific-target shift",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Armor 3 = 1/1/0/1 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (giant flying fish) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 2,
    "endurance_mod": 1,
    "profile": 1.2
   }
  }
 ],
 "gren": [
  {
   "name": "Gren",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "7",
   "initiative": "d6",
   "hitPts": "15",
   "hitPtsSrc": "15",
   "power": "58",
   "powerSrc": "58",
   "story": "GW source: AC 4, HD 20, MV 12. PSH-looking but with deep green skin. Intelligent, secluded in deep forests. Cannot be seen or sensed by any creature until they reveal themselves. Refuse to use ancient tech or learn Ancient knowledge. 70% shun outsiders, 30% friendly to PSH if approached non-hostilely.\nMP build: Humanoid (intelligent — no A/P)\nAbilities: Heightened Endurance +6 (6 CP — for HD 20), Invisibility full-sensory (visible + IR + sonic + mental + olfactory), Restriction \"deep forest only\" (~25 CP — high-tier multi-sense Invisibility with terrain Restriction -5), Adaptation Mental sense-immunity (5 CP — backstop), Heightened Cool ~+4 (4 CP), Heightened Intelligence ~+4 (4 CP), Armor 9 = 5/2/0/2 K/E/B/Ent (15 CP — leather/hide armor)\nEquipment: Iron-age weapons only — bow (8 CP) + spear (15 CP) typical, never ancient tech\nWeaknesses: Phobia (Ancient tech, refuses to use or learn) -5\nCP estimate: ~54 + equipment\nEncounter: Gren (No. appearing 1d4). HTH d6, Init d6.",
   "abilities": [
    {
     "desc": "Heightened Endurance +6 (6 CP — for HD 20)",
     "cp": "6",
     "ip": "",
     "mods": {
      "en_mod": 6
     }
    },
    {
     "desc": "Invisibility full-sensory (visible + IR + sonic + mental + olfactory)",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Restriction \"deep forest only\" (~25 CP — high-tier multi-sense Invisibility with terrain Restriction -5)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental sense-immunity (5 CP — backstop)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Heightened Cool ~+4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "cl_mod": 4
     }
    },
    {
     "desc": "Heightened Intelligence ~+4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "in_mod": 4
     }
    },
    {
     "desc": "Armor 9 = 5/2/0/2 K/E/B/Ent (15 CP — leather/hide armor)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Gear: Iron-age weapons only — bow (8 CP) + spear (15 CP) typical",
     "cp": "8",
     "ip": ""
    },
    {
     "desc": "Gear: never ancient tech",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Phobia (Ancient tech, refuses to use or learn) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "endurance_mod": 6,
    "intelligence_mod": 4,
    "cool_mod": 4
   }
  }
 ],
 "herkel": [
  {
   "name": "Herkel",
   "stats": {
    "st": {
     "cp": "6"
    },
    "en": {
     "cp": "5"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "2"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d2",
   "weight": "10",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "1",
   "hitPtsSrc": "1",
   "power": "25",
   "powerSrc": "25",
   "story": "GW source: AC 9, HD 4, MV 8. Small (.5m) viciously biting fish, piranha-grade. Bite 6d6/turn. Scales coated with intensity 18 contact poison. Eats anything fittable in jaws.\nMP build: A/P Fish, Low power level\nAbilities: A/P Fish Low (10 CP — Adaptation Aquatic, Natural Weaponry vicious bite +d8+1 sharp / 6d6 GW), Size Change Smaller 3' (5 CP), Heightened Attack +1d6 to damage (5 CP — frenzied bite), Poison/Venom A intensity 18 passive contact via scales (15 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5, Compulsion (eats anything, frenzied feeders) -5\nCP estimate: ~30\nEncounter: Herkel (No. appearing 1d2). HTH d2, Init d3.",
   "abilities": [
    {
     "desc": "A/P Fish Low (10 CP — Adaptation Aquatic, Natural Weaponry vicious bite +d8+1 sharp / 6d6 GW)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 3' (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "en_mod": -1,
      "profile_mod": "/2"
     }
    },
    {
     "desc": "Heightened Attack +1d6 to damage (5 CP — frenzied bite)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Poison/Venom A intensity 18 passive contact via scales (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Compulsion (eats anything, frenzied feeders) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d2",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": -1,
    "endurance_mod": -1,
    "profile": 0.5
   }
  }
 ],
 "herp": [
  {
   "name": "Herp",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "5"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1000",
   "inventing": "3",
   "initiative": "d4",
   "hitPts": "16",
   "hitPtsSrc": "16",
   "power": "53",
   "powerSrc": "53",
   "story": "GW source: AC 3, HD 20, MV 10. 3.5m carnivorous mutated beetle, flightless. Wing case reflects sonic. Acid stream 30m, 15d6 dmg, eats through 1/2 cm duralloy in 3 turns. All-weather tracking.\nMP build: A/P Insect, High power level (HD 20 boss)\nAbilities: A/P Insect High (30 CP — Natural Weaponry mandibles, Heightened Senses all-weather tracking, Heightened Attack +1d6, Reflection Sonic), Size Change Larger 12' (15 CP), Power Blast Bio acid stream 30m ~3d8 sharp/bio (25 CP), Armor 12 = 8/2/0/2 (20 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5, Compulsion (fight to death) -5\nCP estimate: ~90\nEncounter: Herp (No. appearing 1d4). HTH d8+1, Init d4.",
   "abilities": [
    {
     "desc": "A/P Insect High (30 CP — Natural Weaponry mandibles, Heightened Senses all-weather tracking, Heightened Attack +1d6, Reflection Sonic)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 12' (15 CP)",
     "cp": "15",
     "ip": "",
     "mods": {
      "st_mod": 9,
      "en_mod": 9,
      "profile_mod": "x2"
     }
    },
    {
     "desc": "Power Blast Bio acid stream 30m ~3d8 sharp/bio (25 CP)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 8/2/0/2 (20 CP)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Compulsion (fight to death) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "8",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 9,
    "endurance_mod": 9,
    "profile": 2
   }
  }
 ],
 "hisser": [
  {
   "name": "Hisser",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "12"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "7",
   "initiative": "d6",
   "hitPts": "17",
   "hitPtsSrc": "17",
   "power": "61",
   "powerSrc": "61",
   "story": "GW source: AC 3, HD 18, MV 12. 3m half-man-half-snake, arid regions. Telepathic, MS 12. Mass mind, sonic attack ability, +1 random mental mutation per individual. Scaly skin laser+sonic resistant. Matriarchal (queen + 70 males). No spoken language — all telepathic. Use Ancient artifacts.\nMP build: Humanoid (intelligent — no A/P)\nAbilities: Size Change Larger 9' (7.5 CP), Telepathy visual+verbal (10 CP), Sonic Abilities A + Area Effect (12.5 CP), Random mutation per individual ~10 CP (roll on §10-12), Armor 12 = 6/3/1/2 (20 CP — laser/sonic-weighted)\nEquipment: Recovered tech artifact per individual (~10-15 CP)\nCP estimate: ~60 + per-individual mutation + equipment\nEncounter: Hisser (No. appearing 1d4). HTH d6+1, Init d6.",
   "abilities": [
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Telepathy visual+verbal (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Sonic Abilities A + Area Effect (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Random mutation per individual ~10 CP (roll on §10-12)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 6/3/1/2 (20 CP — laser/sonic-weighted)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Gear: Recovered tech artifact per individual (~10-15 CP)",
     "cp": "-15",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "6",
   "protEnergy": "3",
   "protBio": "1",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "hoop": [
  {
   "name": "Hoop",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "14"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "5",
   "initiative": "d6",
   "hitPts": "16",
   "hitPtsSrc": "16",
   "power": "55",
   "powerSrc": "55",
   "story": "GW source: AC 9, HD 15, MV 18. 2.6m mutated rabbitoid bipeds. Leap 8m vertical. Intelligent (MS 3-18), telepathic, mass mind. Special: transmute metal to rubber (touch, 1m radius). Manipulative forepaws. Use Ancient weapons.\nMP build: Humanoid (\"Tall\" descriptor free at 2.6m)\nAbilities: Size Change Larger 7' (2.5 CP), Heightened Agility ~+8 (8 CP — covers leap-8m), Telepathy (10 CP), Transmutation Metal→Rubber touch range 1m radius (17.5 CP)\nEquipment: Ancient weapons preferred — pistol/rifle/blaster per individual\nCP estimate: ~38 + equipment\nEncounter: Hoop (No. appearing 1d6). HTH d6, Init d6.",
   "abilities": [
    {
     "desc": "Size Change Larger 7' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": 2,
      "en_mod": 1,
      "profile_mod": "x1.2"
     }
    },
    {
     "desc": "Heightened Agility ~+8 (8 CP — covers leap-8m)",
     "cp": "8",
     "ip": "",
     "mods": {
      "ag_mod": 8
     }
    },
    {
     "desc": "Telepathy (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Transmutation Metal→Rubber touch range 1m radius (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Gear: Ancient weapons preferred — pistol/rifle/blaster per individual",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 2,
    "endurance_mod": 1,
    "agility_mod": 8,
    "profile": 1.2
   }
  }
 ],
 "hopper": [
  {
   "name": "Hopper",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "3"
    },
    "ag": {
     "cp": "16"
    },
    "in": {
     "cp": "2"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "4",
   "hitPtsSrc": "4",
   "power": "36",
   "powerSrc": "36",
   "story": "GW source: AC 9, HD 3, MV 12 (hop at 24). Giant hare-like mutant. 100kg burden mount; requires special saddle/harness. 75% chance new rider thrown for 1-6 dice damage on first ride. Stupid (hoops regard them as we do chimps). Chameleon powers. Unburdened: 12m leaps, 8m vertical clear.\nMP build: A/P Mammal, Low power level\nAbilities: A/P Mammal Low (10 CP — Heightened Agility, Speed, Natural Weaponry kicks +d4 sharp), Size Change Larger 7' (2.5 CP), Speed +6 (5 CP — for MV 12 normal), Super Speed +1 turn with Restriction \"leaping only\" (10 CP — for MV 24 hop mode), Invisibility Visible Light Camouflage (10 CP — chameleon powers)\nEquipment: Special saddle (mount accessory)\nWeaknesses: Lowered Intelligence -5, Distinctive (giant hare) -5\nCP estimate: ~37.5\nEncounter: Hopper (No. appearing 2d4). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "A/P Mammal Low (10 CP — Heightened Agility, Speed, Natural Weaponry kicks +d4 sharp)",
     "cp": "10",
     "ip": "",
     "mods": {
      "move_mod": 1
     }
    },
    {
     "desc": "Size Change Larger 7' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": 2,
      "en_mod": 1,
      "profile_mod": "x1.2"
     }
    },
    {
     "desc": "Speed +6 (5 CP — for MV 12 normal)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Super Speed +1 turn with Restriction \"leaping only\" (10 CP — for MV 24 hop mode)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Invisibility Visible Light Camouflage (10 CP — chameleon powers)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Gear: Special saddle (mount accessory)",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (giant hare) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 2,
    "endurance_mod": 1,
    "profile": 1.2,
    "move_mod": 1
   }
  }
 ],
 "horl choo": [
  {
   "name": "Horl Choo",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "18"
    },
    "ag": {
     "cp": "8"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "12",
   "hitPtsSrc": "12",
   "power": "44",
   "powerSrc": "44",
   "story": "GW source: AC 5, HD 18, MV 6. Black plant resembling a lumpy porcupine with 3m spear-like quill-stems. 5d6 (6-30) stems. Flings spears at any being within 90m: intensity 9 poison + 3d6 dmg. Spears attached by strong vines — retrieve missed shots, drag impaled prey back to base. Dissolving juices break down victim. Limited mobility (moves to better hunting grounds).\nMP build: A/P Plant, Standard power level\nAbilities: A/P Plant Standard (20 CP — Mobility limited, Stretching A retrieving vines, Natural Weaponry vines), Special Missile Weapon spear-stems 90m range 3d6 sharp + intensity 9 poison ammo 5d6 (20 CP — combined poison-tipped missile), Power Blast Bio dissolving juices for digestion (15 CP — also functions as area attack post-impale), Armor 8 = 5/1/0/2 (12.5 CP — woody bark)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~67.5\nEncounter: Horl Choo (No. appearing 1d6). HTH d6, Init d4.",
   "abilities": [
    {
     "desc": "A/P Plant Standard (20 CP — Mobility limited, Stretching A retrieving vines, Natural Weaponry vines)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Special Missile Weapon spear-stems 90m range 3d6 sharp + intensity 9 poison ammo 5d6 (20 CP — combined poison-tipped missile)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Power Blast Bio dissolving juices for digestion (15 CP — also functions as area attack post-impale)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Armor 8 = 5/1/0/2 (12.5 CP — woody bark)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "2"
  }
 ],
 "kai lin": [
  {
   "name": "Kai Lin",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "5"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "600",
   "inventing": "2",
   "initiative": "d2",
   "hitPts": "9",
   "hitPtsSrc": "9",
   "power": "40",
   "powerSrc": "40",
   "story": "GW source: AC 6, HD 12, MV 10. 3-4m plant resembling a reptile. Runs on 2 stalks with thorny pads (clawed-foot resemblance), trails root-tail. Rad-resistant green bark scales. Scavenger but kills fresh prey. MS 5. Mutations: Electrical Generation, Attraction Odor, Radiated Eyes.\nMP build: A/P Plant, Standard power level\nAbilities: A/P Plant Standard (20 CP — Mobility, Natural Weaponry thorny pad-claws +d4 sharp, Heightened Senses), Size Change Larger 9' (7.5 CP), Lightning Control A Electrical Bolt contact 4d6 (12.5 CP — Electrical Generation), Emotion Control Pheromones (Attraction Odor for prey lure) (7.5 CP), Power Blast Energy radiation eyes short range (12.5 CP — Radiated Eyes), Adaptation Energy radiation (5 CP — rad-resistant bark), Stretching A root-tail entwining for assimilating carrion (5 CP), Armor 6 = 3/2/0/1 K/E/B/Ent (10 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive (reptile-plant) -5\nCP estimate: ~80\nEncounter: Kai Lin (No. appearing 1d4). HTH d6+1, Init d2.",
   "abilities": [
    {
     "desc": "A/P Plant Standard (20 CP — Mobility, Natural Weaponry thorny pad-claws +d4 sharp, Heightened Senses)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Lightning Control A Electrical Bolt contact 4d6 (12.5 CP — Electrical Generation)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Emotion Control Pheromones (Attraction Odor for prey lure) (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Power Blast Energy radiation eyes short range (12.5 CP — Radiated Eyes)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy radiation (5 CP — rad-resistant bark)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Stretching A root-tail entwining for assimilating carrion (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 3/2/0/1 K/E/B/Ent (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (reptile-plant) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "3",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "keeshin": [
  {
   "name": "Keeshin",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "7"
    },
    "ag": {
     "cp": "16"
    },
    "in": {
     "cp": "18"
    },
    "cl": {
     "cp": "16"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "50",
   "inventing": "9",
   "initiative": "d6+1",
   "hitPts": "4",
   "hitPtsSrc": "4",
   "power": "49",
   "powerSrc": "49",
   "story": "GW source: AC 3, HD 7, MV Telekinetic Flight. Small white mutated amphibian in water. IN 18, MS 16. Mental mutations: Telekinetic Flight, Telekinesis, Telekinetic Arm, Force Field Generation, Life Leech, De-evolution, Mental Blast, Cryokinesis, Reflection. Uses any 2 per turn. Solitary, ruthless, greedy. Builds underwater stone dwellings telekinetically with air pockets, stockpiles Ancient devices.\nMP build: Humanoid (intelligent — no A/P)\nAbilities: \nEquipment: Stockpile of Ancient artifacts in dwelling. Encountered Keeshin carries 1d6 random artifacts (15-30 CP avg).\nWeaknesses: Compulsion (greedy, gathers Ancient devices) -5 CP\nCP estimate: ~165 base + equipment (boss-tier despite HD 7; mental mutation kit dominates)\nEncounter: Keeshin (No. appearing 1). HTH d3, Init d6+1.",
   "abilities": [
    {
     "desc": "Gear: Stockpile of Ancient artifacts in dwelling. Encountered Keeshin carries 1d6 random artifacts (15-30 CP avg).",
     "cp": "-30",
     "ip": ""
    },
    {
     "desc": "Compulsion (greedy, gathers Ancient devices) -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ]
  }
 ],
 "kep": [
  {
   "name": "Kep",
   "stats": {
    "st": {
     "cp": "16"
    },
    "en": {
     "cp": "16"
    },
    "ag": {
     "cp": "4"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d10",
   "weight": "3000",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "13",
   "hitPtsSrc": "13",
   "power": "44",
   "powerSrc": "44",
   "story": "GW source: AC 2, HD 20, MV N/A. Carnivorous plant in sandy soil, grows underground. 30m diameter pressure-sensitive net of squeeze roots just below surface. Walking over → roots spring out, ensnare. Squeeze 5d6 constrictive dmg/turn. Damaged >half HP: releases captives, retreats underground. Prey ceases struggle: dissolving juices digest. After meal: 1 mobile seed scurries off to make new plant.\nMP build: A/P Plant, High power level (HD 20 boss; trap-tier)\nAbilities: A/P Plant High (30 CP — Stretching A 30m diameter root net, Natural Weaponry crushing roots, Heightened Endurance, Heightened Strength), Tunneling sand soil (Max SR 1, Max Speed 12, primary locomotion underground, supplement) ~12.5 CP, Grapnel (squeeze roots, 30m diameter trap zone, ensnare + 5d6 crush per turn) ~20 CP, Power Blast Bio dissolving juices post-capture digestion (10 CP), Heightened Endurance +4 (4 CP), Armor 16 = 10/2/0/4 K/E/B/Ent (30 CP — thick root mass)\nWeaknesses: Lowered Intelligence -5, Distinctive (when revealed) -5, Special Requirement (sandy soil only) -5\nCP estimate: ~107.5\nEncounter: Kep (No. appearing 1d4). HTH d6+1, Init d4.",
   "abilities": [
    {
     "desc": "A/P Plant High (30 CP — Stretching A 30m diameter root net, Natural Weaponry crushing roots, Heightened Endurance, Heightened Strength)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Tunneling sand soil (Max SR 1, Max Speed 12, primary locomotion underground, supplement) ~12.5 CP",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Grapnel (squeeze roots, 30m diameter trap zone, ensnare + 5d6 crush per turn) ~20 CP",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Power Blast Bio dissolving juices post-capture digestion (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Heightened Endurance +4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "en_mod": 4
     }
    },
    {
     "desc": "Armor 16 = 10/2/0/4 K/E/B/Ent (30 CP — thick root mass)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (when revealed) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Special Requirement (sandy soil only) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "10",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "4",
   "aggmods": {
    "endurance_mod": 4
   }
  }
 ],
 "menarl": [
  {
   "name": "Menarl",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "3"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "8"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "4",
   "initiative": "d6",
   "hitPts": "8",
   "hitPtsSrc": "8",
   "power": "44",
   "powerSrc": "44",
   "story": "GW source: AC 6, HD 7, MV 6. 10m intelligent water snake with 10 human-shaped manipulator arms. Heightened Strength 17, MS 12. Bird-loving — frenzied near birds. Friendly to humanoids, will use Ancient devices if shown how.\nMP build: Humanoid (intelligent, manipulative — no A/P)\nAbilities: Size Change Larger 9' (7.5 CP), Physical Ability B Extra Limbs (10 arms, 4 attack-pairs available per turn) ~17.5 CP, Adaptation Aquatic (5 CP), Natural Weaponry bite + arm-grip (7.5 CP), Armor 6 = 4/1/0/1 (10 CP)\nEquipment: Will use Ancient devices if shown how — variable per encounter (10-25 CP if armed)\nWeaknesses: - Compulsion (frenzy near birds — distractible, attacks birds in preference to other targets) -5\nCP estimate: ~52.5 + equipment\nEncounter: Menarl (No. appearing 1). HTH d6+1, Init d6.",
   "abilities": [
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Physical Ability B Extra Limbs (10 arms, 4 attack-pairs available per turn) ~17.5 CP",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Aquatic (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Natural Weaponry bite + arm-grip (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 4/1/0/1 (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Gear: Will use Ancient devices if shown how — variable per encounter (10-25 CP if armed)",
     "cp": "-25",
     "ip": ""
    },
    {
     "desc": "- Compulsion (frenzy near birds — distractible, attacks birds in preference to other targets) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "narl ep": [
  {
   "name": "Narl Ep",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "4"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d12",
   "weight": "",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "18",
   "hitPtsSrc": "18",
   "power": "51",
   "powerSrc": "51",
   "story": "GW source: AC 3, HD 20, MV N/A. Enormous white mutated tree, 50m+ tall, lives in water. Pale green leafy top + 5-30 squeeze vines projecting above surface. Spring: seed pods on vines. Pods cracked (sharp blow) → 2-12 seeds fly out + sonic blast 3d6 in 10m radius.\nMP build: A/P Plant, High power level (HD 20 boss)\nAbilities: A/P Plant High (30 CP — Stretching A 5-30 squeeze vines, Natural Weaponry vine grasp +d8+1 blunt, Heightened Endurance, Heightened Strength), Size Change Larger 15' (20 CP), Grapnel (squeeze vines, crushing) (15 CP), Special Missile Weapon — seed pods (sonic blast 3d6 + 2-12 seed projectiles, 10m radius, ammo limited to ripe pods in spring) (15 CP), Sonic Abilities A Sonic Blast Area Effect 10m (12.5 CP — pod-cracking trigger), Adaptation Aquatic (5 CP), Armor 12 = 6/2/1/3 (20 CP — bark + plant fiber)\nWeaknesses: Lowered Intelligence -5, Distinctive (50m white tree) -5, Special Requirement (immobile, rooted in water) -5\nCP estimate: ~117.5\nEncounter: Narl Ep (No. appearing 1d6). HTH 2d6, Init d3.",
   "abilities": [
    {
     "desc": "A/P Plant High (30 CP — Stretching A 5-30 squeeze vines, Natural Weaponry vine grasp +d8+1 blunt, Heightened Endurance, Heightened Strength)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 15' (20 CP)",
     "cp": "20",
     "ip": "",
     "mods": {
      "st_mod": 12,
      "en_mod": 12,
      "profile_mod": "x2.5"
     }
    },
    {
     "desc": "Grapnel (squeeze vines, crushing) (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Special Missile Weapon — seed pods (sonic blast 3d6 + 2-12 seed projectiles, 10m radius, ammo limited to ripe pods in spring) (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Sonic Abilities A Sonic Blast Area Effect 10m (12.5 CP — pod-cracking trigger)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Aquatic (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 6/2/1/3 (20 CP — bark + plant fiber)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (50m white tree) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Special Requirement (immobile, rooted in water) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "2d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "6",
   "protEnergy": "2",
   "protBio": "1",
   "protEntropy": "3",
   "aggmods": {
    "strength_mod": 12,
    "endurance_mod": 12,
    "profile": 2.5
   }
  }
 ],
 "obb": [
  {
   "name": "Obb",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "12"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "50",
   "inventing": "6",
   "initiative": "d6",
   "hitPts": "7",
   "hitPtsSrc": "7",
   "power": "45",
   "powerSrc": "45",
   "story": "GW source: AC 10, HD 12, MV 1/15 (ground/fly). 1m mutated fungus resembling a bat. Nearly immobile on ground, hawk-swift in air. Single black eye delivers intensity 16 radiation blast. Two clawed appendages strike for 3d6 each. Devours half of body, plants spores in remains; 1d6 young obbs emerge in 1 day. Resistant to radiation, all laser, light, heat. Sometimes peacefully associates with intelligent beings — alien logic.\nMP build: A/P Plant (fungus), Standard power level — high-MS variant, skip Lowered Int\nAbilities: A/P Plant Standard (20 CP — Flight 15m, Natural Weaponry clawed appendages +d6 sharp x2, Heightened Senses), Size Change Smaller 4.5' (2.5 CP), Power Blast Energy radiation eye intensity 16 25-30m ~2d6 (17.5 CP), Adaptation Energy (radiation + laser + heat, multi-type) (10 CP), Adaptation Light (light immunity) (5 CP)\nWeaknesses: Distinctive (fungus-bat) -5 CP\nCP estimate: ~50\nEncounter: Obb (No. appearing 1d6). HTH d3, Init d6.",
   "abilities": [
    {
     "desc": "A/P Plant Standard (20 CP — Flight 15m, Natural Weaponry clawed appendages +d6 sharp x2, Heightened Senses)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Power Blast Energy radiation eye intensity 16 25-30m ~2d6 (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy (radiation + laser + heat, multi-type) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Adaptation Light (light immunity) (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Distinctive (fungus-bat) -5 CP",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": -1,
    "profile": 0.6666666666666666
   }
  }
 ],
 "orlen": [
  {
   "name": "Orlen",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "12"
    },
    "cl": {
     "cp": "14"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "6",
   "initiative": "d6",
   "hitPts": "15",
   "hitPtsSrc": "15",
   "power": "56",
   "powerSrc": "56",
   "story": "GW source: AC 7, HD 15, MV 15. Two-headed, 2.5m tall humanoid mutants with 4 arms, each arm pair under a separate brain. All telepathic, with telekinesis and willpower in both brains. 25% have 2 random mutations (one per side), typically poison claws (random intensity, 2 hands) + de-evolution (mental). Barter peacefully for tech; built four-arm-adapted versions.\nMP build: Humanoid (intelligent, society — no A/P)\nAbilities: Size Change Larger 8' (5 CP), Physical Ability B Extra Limbs 4 arms (10 CP — 2 manipulative pairs, +1 attack/turn), Dual Brain → Heightened Defense Mental + Heightened Intelligence (10 CP — two-brain mechanic, save vs. mental x2), Telepathy (10 CP), Telekinesis A (7.5 CP), Willpower C Self-Control (10 CP), Armor 5 = 3/1/0/1 (7.5 CP)\nEquipment: Any tech, often four-arm-adapted artifacts custom-built (~15-20 CP per individual)\nWeaknesses: Distinctive (two-headed four-armed) -5\nCP estimate: ~60 + equipment\nEncounter: Orlen (No. appearing 1). HTH d6+1, Init d6.",
   "abilities": [
    {
     "desc": "Size Change Larger 8' (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "st_mod": 3,
      "en_mod": 3,
      "profile_mod": "x1.3"
     }
    },
    {
     "desc": "Physical Ability B Extra Limbs 4 arms (10 CP — 2 manipulative pairs, +1 attack/turn)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Dual Brain → Heightened Defense Mental + Heightened Intelligence (10 CP — two-brain mechanic, save vs. mental x2)",
     "cp": "10",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Telepathy (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Telekinesis A (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Willpower C Self-Control (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Armor 5 = 3/1/0/1 (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Gear: Any tech",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Gear: often four-arm-adapted artifacts custom-built (~15-20 CP per individual)",
     "cp": "-20",
     "ip": ""
    },
    {
     "desc": "Distinctive (two-headed four-armed) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "3",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 3,
    "endurance_mod": 3,
    "profile": 1.3,
    "mental_def_bonus": 2
   }
  }
 ],
 "parn": [
  {
   "name": "Pam",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "10",
   "hitPtsSrc": "10",
   "power": "43",
   "powerSrc": "43",
   "story": "GW source: AC 6 (also -3 to opponent AC in close combat from antennae), HD 10 + antennae. MV 6/16. 3m beetle. 4d6 (4-24) 1.3m barbed spines on back, shoots 2/turn at 50m, 2d6 dmg. 4 sword-like antenna structures (3m), 3d6 dmg each in close. Each antenna AC 5, 18 HP. Ruthless carnivore, fights to death.\nMP build: A/P Insect, Standard power level\nAbilities: A/P Insect Standard (20 CP — Natural Weaponry antennae +d8+1 sharp 4 limbs, Heightened Attack -3 to opponent AC = +3 hit close, Physical Ability B Extra Limbs antennae as separate strikers), Size Change Larger 9' (7.5 CP), Special Missile Weapon spines 50m range 2d6 sharp 2/turn ammo 4d6 quills (12.5 CP), Armor 6 = 4/1/0/1 (10 CP)\nWeaknesses: Lowered Intelligence -5, Compulsion (fights to death) -5\nCP estimate: ~55\nEncounter: Pam (No. appearing 1d4). HTH d6+1, Init d4.",
   "abilities": [
    {
     "desc": "A/P Insect Standard (20 CP — Natural Weaponry antennae +d8+1 sharp 4 limbs, Heightened Attack -3 to opponent AC = +3 hit close, Physical Ability B Extra Limbs antennae as separate strikers)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Special Missile Weapon spines 50m range 2d6 sharp 2/turn ammo 4d6 quills (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 4/1/0/1 (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Compulsion (fights to death) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "perth": [
  {
   "name": "Perth",
   "stats": {
    "st": {
     "cp": "5"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "1"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "50",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "1",
   "hitPtsSrc": "1",
   "power": "17",
   "powerSrc": "17",
   "story": "GW source: AC 4, HD 8, MV N/A. 1m tall flower-bush. Disturbed → glows rainbow → emits 3d6 random-intensity radiation in 15m radius. Each round different intensity. Damaged → 1d4 simultaneous blasts. Petals dry to 1 HP/g healing powder (20g/flower, 3-day sun; half effective if artificial drying).\nMP build: Plant (immobile)\nAbilities: Change Environment Damaging Hard Radiation 33\" diameter (25 CP — 5 Devitalization Entropy/round in 15m radius, supplement), Light Control C Glare rainbow (5 CP), Armor 9 = 4/3/0/2 K/E/B/Ent (15 CP)\nWeaknesses: Distinctive (stationary plant) -5, Low Self Control (reactive blasting only) -5\nCP estimate: ~45\nEncounter: Perth (No. appearing 1d3). HTH d2, Init d3.",
   "abilities": [
    {
     "desc": "Change Environment Damaging Hard Radiation 33\" diameter (25 CP — 5 Devitalization Entropy/round in 15m radius, supplement)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Light Control C Glare rainbow (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 9 = 4/3/0/2 K/E/B/Ent (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Distinctive (stationary plant) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Low Self Control (reactive blasting only) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d2",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "3",
   "protBio": "0",
   "protEntropy": "2"
  }
 ],
 "pineto": [
  {
   "name": "Pineto",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "4"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "2"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "6",
   "hitPtsSrc": "6",
   "power": "38",
   "powerSrc": "38",
   "story": "GW source: AC 4, HD 2, MV 18. Mutated horizontal-trunk plant beast, mobile branches. 800kg cargo as mount. Tail lashes 1d6. Sharp needles — riders take 1 dmg/turn without saddle. Goad-controlled.\nMP build: A/P Plant, Low power level\nAbilities: A/P Plant Low (10 CP — Mobility, Heightened Senses), Heightened Strength ~+4 (4 CP — for 800kg cargo), Heightened Agility ~+4 (4 CP), Speed +6 (5 CP — for MV 18), Natural Weaponry tail lash + needle contact (5 CP), Armor 9 = 5/2/0/2 (15 CP — bark + needles)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~43\nEncounter: Pineto (No. appearing 1d4). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "A/P Plant Low (10 CP — Mobility, Heightened Senses)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Heightened Strength ~+4 (4 CP — for 800kg cargo)",
     "cp": "4",
     "ip": "",
     "mods": {
      "st_mod": 4
     }
    },
    {
     "desc": "Heightened Agility ~+4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "ag_mod": 4
     }
    },
    {
     "desc": "Speed +6 (5 CP — for MV 18)",
     "cp": "5",
     "ip": "",
     "mods": {
      "move_mod": 6
     }
    },
    {
     "desc": "Natural Weaponry tail lash + needle contact (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 9 = 5/2/0/2 (15 CP — bark + needles)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 4,
    "agility_mod": 4,
    "move_mod": 6
   }
  }
 ],
 "podog": [
  {
   "name": "Podog",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "1"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "5",
   "hitPtsSrc": "5",
   "power": "36",
   "powerSrc": "36",
   "story": "GW source: AC 5 (8 if ridden), HD 4, MV 15. Large mutated mongrels. Carnivorous pack hunters, simple commands. Bite 2d6. Totally poison-immune. 1 in 100 has Dual Brain + Telepathy with master. Bay-cry mimics prey/opponent for confusion + initiative bonus.\nMP build: A/P Mammal, Low power level\nAbilities: A/P Mammal Low (10 CP — Heightened Senses smell, Natural Weaponry bite +d6 sharp), Adaptation Bio poison full immunity (5 CP), Size Change Larger 8' (5 CP), Speed +4 (5 CP), Reflection Sonic Sound Imitation +1 init (5 CP — bay/mimic cry), Armor 8 (when wild) = 5/1/0/2 (12.5 CP) / Armor 4 (when ridden, flanks exposed)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~42.5\nEncounter: Podog (No. appearing 1d6). HTH d6+1, Init d3.",
   "abilities": [
    {
     "desc": "A/P Mammal Low (10 CP — Heightened Senses smell, Natural Weaponry bite +d6 sharp)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Adaptation Bio poison full immunity (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 8' (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "st_mod": 3,
      "en_mod": 3,
      "profile_mod": "x1.3"
     }
    },
    {
     "desc": "Speed +4 (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "move_mod": 4
     }
    },
    {
     "desc": "Reflection Sonic Sound Imitation +1 init (5 CP — bay/mimic cry)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 8 (when wild) = 5/1/0/2 (12.5 CP) / Armor 4 (when ridden, flanks exposed)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "aggmods": {
    "strength_mod": 3,
    "endurance_mod": 3,
    "profile": 1.3,
    "move_mod": 4
   }
  }
 ],
 "rakox": [
  {
   "name": "Rakox",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "6"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d10",
   "weight": "3000",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "15",
   "hitPtsSrc": "15",
   "power": "48",
   "powerSrc": "48",
   "story": "GW source: AC 4/6, HD 20, MV 9. Slow but powerful mutated oxen. Partial carapace, frill of 8 forward-pointing horns. Gore: 1d6/horn, man-sized opponent gets struck by 1-3 horns per attack. Charge tendency when frightened (esp. wild). Charging rakox does double damage. Stupid, skittish. 1000kg cargo, beasts of burden. 1 / 5d6 in wild herds.\nMP build: A/P Mammal, High power level (HD 20)\nAbilities: A/P Mammal High (30 CP — Natural Weaponry 8 horns + bite, Heightened Strength, Heightened Endurance, Physical Ability B Extra Limbs/multi-horn 1-3 horns hit per gore), Size Change Larger 9' (7.5 CP), Heightened Endurance +4 (4 CP), Heightened Attack +1d6 with Restriction \"charging only\" (~5 CP — double damage on charge), Armor 9 = 6/2/0/1 K/E/B/Ent (15 CP — partial carapace; AC 4 from front [horns], AC 6 flanks)\nEquipment: Yoke/draft harness for domesticated use\nWeaknesses: Lowered Intelligence -5, Distinctive (8-horned ox) -5, Phobia / Compulsion (charges when frightened, especially wild) -5\nCP estimate: ~60\nEncounter: Rakox (No. appearing 1d6). HTH d8+1, Init d3.",
   "abilities": [
    {
     "desc": "A/P Mammal High (30 CP — Natural Weaponry 8 horns + bite, Heightened Strength, Heightened Endurance, Physical Ability B Extra Limbs/multi-horn 1-3 horns hit per gore)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Heightened Endurance +4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "en_mod": 4
     }
    },
    {
     "desc": "Heightened Attack +1d6 with Restriction \"charging only\" (~5 CP — double damage on charge)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 9 = 6/2/0/1 K/E/B/Ent (15 CP — partial carapace; AC 4 from front [horns], AC 6 flanks)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Gear: Yoke/draft harness for domesticated use",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (8-horned ox) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia / Compulsion (charges when frightened, especially wild) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "6",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 8,
    "profile": 1.5
   }
  }
 ],
 "robotic unit": [
  {
   "name": "Defense/Attack Borg",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "16"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "14"
    },
    "cl": {
     "cp": "14"
    }
   },
   "originType": "Science Project",
   "species": "Mixed",
   "mass": "d10",
   "weight": "",
   "inventing": "7",
   "initiative": "d6",
   "hitPts": "30",
   "hitPtsSrc": "30",
   "power": "76",
   "powerSrc": "76",
   "story": "GW source: Power: nuclear plant. Sensors: standard, IR, UV, telescopic. Control: self-controlled, Stage V I.D., special electronic. Construction: 3m sphere with 1m turret. Anti-grav 96 KPH. 2 tentacles (5m, 10m paralysis fields). Twin t/p beams (500 kg @ 50m). Weaponry: 3 laser batteries × 5 guns each (500m/20d6, 1000m/15d6, 1500m/10d6), 2 energy grenade launchers (range 100/300/500m, 2d20 grenades each), 2 micro-missile launchers (2d20 missiles each), 1 photon grenade launcher (250m range, 1d20 grenades). Energy screen 100 pts. 200 HP, AC 1. Organic-brain quirk per §17.10.\nMP build: Vehicle (sphere + turret), High power level (boss-tier combat)\nAbilities: Adaptation Bio (5 CP), Adaptation Mental partial (5 CP — borg organic brain), Heightened Defense Mental (5 CP), Heightened Endurance +4 (4 CP), Durability x2 (5 CP), Stretching A tentacles (5m, paralysis 10m field, 2 tentacles) (10 CP), Power Blast Energy laser-battery suite — Multi-Blast x3 batteries × 5 guns (50 CP — 20d6 short / 15d6 mid / 10d6 long range), Power Blast Bio/Energy grenade launchers ×2 area effect (15 CP), Power Blast Kinetic micro-missile launchers ×2 (15 CP), Power Blast Energy photon grenade launcher (10 CP), Telekinesis A x2 t/p beams (10 CP — 500kg @ 50m), Force Field A Personal energy screen 100pt (17.5 CP), Speed +30 (15 CP — 96 kph), Armor 20 = 12/4/2/2 K/E/B/Ent (40 CP — duralloy fortress)\nWeaknesses: Special Requirement: Power source nuclear -5, Restriction: No organic functions -5, Distinctive: Obviously combat machine -5, Phobia/Compulsion: Borg quirk (roll d10 §17.10) -5, Vulnerability: Mental Attacks when FF down -5\nCP estimate: ~205\nEncounter: Defense/Attack Borg (No. appearing 1). HTH d6, Init d6.",
   "abilities": [
    {
     "desc": "Adaptation Bio (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental partial (5 CP — borg organic brain)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Heightened Endurance +4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "en_mod": 4
     }
    },
    {
     "desc": "Durability x2 (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "hits_mod": 15
     }
    },
    {
     "desc": "Stretching A tentacles (5m, paralysis 10m field, 2 tentacles) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Power Blast Energy laser-battery suite — Multi-Blast x3 batteries × 5 guns (50 CP — 20d6 short / 15d6 mid / 10d6 long range)",
     "cp": "50",
     "ip": ""
    },
    {
     "desc": "Power Blast Bio/Energy grenade launchers ×2 area effect (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Power Blast Kinetic micro-missile launchers ×2 (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Power Blast Energy photon grenade launcher (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Telekinesis A x2 t/p beams (10 CP — 500kg @ 50m)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Force Field A Personal energy screen 100pt (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Speed +30 (15 CP — 96 kph)",
     "cp": "15",
     "ip": "",
     "mods": {
      "move_mod": 32
     }
    },
    {
     "desc": "Armor 20 = 12/4/2/2 K/E/B/Ent (40 CP — duralloy fortress)",
     "cp": "40",
     "ip": ""
    },
    {
     "desc": "Special Requirement: Power source nuclear -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Restriction: No organic functions -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive: Obviously combat machine -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia/Compulsion: Borg quirk (roll d10 §17.10) -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Vulnerability: Mental Attacks when FF down -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "12",
   "protEnergy": "4",
   "protBio": "2",
   "protEntropy": "2",
   "form": "Defense/Attack Borg",
   "aggmods": {
    "endurance_mod": 4,
    "hits_mod": 15,
    "mental_def_bonus": 2,
    "move_mod": 32
   }
  },
  {
   "name": "Death Machine",
   "stats": {
    "st": {
     "cp": "18"
    },
    "en": {
     "cp": "18"
    },
    "ag": {
     "cp": "16"
    },
    "in": {
     "cp": "14"
    },
    "cl": {
     "cp": "14"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d12",
   "weight": "",
   "inventing": "7",
   "initiative": "d6",
   "hitPts": "280",
   "hitPtsSrc": "280",
   "power": "92",
   "powerSrc": "92",
   "story": "GW source: Power: nuclear plant. Sensors: standard, IR, UV at 10km. Control: only by specific PCI (effectively uncontrollable by PCs). Construction: 20×9×4m, knobby projections. Anti-grav 150 KPH. Weaponry: 2 blaster cannons (750m/100hp, 1500m/75hp, 3000m/50hp), 6 black ray cannons (300m), 16 batteries × 4 Mark VII blaster rifles each, 4 trek guns (200m), 8 laser batteries × 5 guns each (750m/20d6, 1500m/15d6, 3000m/10d6), 6 mini-missile launchers (2d10 missiles each), 5d10 fusion bombs + launcher (3000m), special energy damping field 50m radius (kills robotics within range, 200 dmg to other energy screens). Energy screens 400 pts, AC 1, 750 HP.\nMP build: Vehicle (massive lozenge), Apex power level\nAbilities: Adaptation Bio (5 CP), Adaptation Mental partial (5 CP), Heightened Defense Mental (5 CP), Heightened Endurance +6 (6 CP), Heightened Strength +6 (6 CP), Durability x10 (50 CP — for 750 HP), Multi-blast suite Power Blast Energy: blaster cannons + laser batteries + Mark VII rifles (full battery array, ~80 CP), Power Blast Kinetic: black ray cannons (15 CP), Power Blast Kinetic: trek guns + fusion bombs (20 CP — apex-tier ordnance), Power Blast Kinetic: mini-missile launchers (10 CP), Change Environment Damaging EMP energy damping 50m radius (25 CP — supplement Change Environment, kills robotics, 200 dmg to other FFs), Force Field A High-Capacity 400pt (30 CP), Speed +60 (30 CP — 150 kph), Armor 20 = 12/4/2/2 K/E/B/Ent (40 CP — fortress duralloy)\nWeaknesses: Special Requirement: Power source nuclear -5, Restriction: No organic functions -5, Restriction: Cannot operate without PCI control link -10, Distinctive: Obviously apex weapon -5, Phobia/Compulsion: PCI-controlled (PCI quirks transfer) -5\nCP estimate: ~400+\nEncounter: Death Machine (No. appearing 1). HTH 2d6, Init d6.",
   "abilities": [
    {
     "desc": "Adaptation Bio (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental partial (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Heightened Endurance +6 (6 CP)",
     "cp": "6",
     "ip": "",
     "mods": {
      "en_mod": 6
     }
    },
    {
     "desc": "Heightened Strength +6 (6 CP)",
     "cp": "6",
     "ip": "",
     "mods": {
      "st_mod": 6
     }
    },
    {
     "desc": "Durability x10 (50 CP — for 750 HP)",
     "cp": "50",
     "ip": "",
     "mods": {
      "hits_mod": 252
     }
    },
    {
     "desc": "Multi-blast suite Power Blast Energy: blaster cannons + laser batteries + Mark VII rifles (full battery array, ~80 CP)",
     "cp": "80",
     "ip": ""
    },
    {
     "desc": "Power Blast Kinetic: black ray cannons (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Power Blast Kinetic: trek guns + fusion bombs (20 CP — apex-tier ordnance)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Power Blast Kinetic: mini-missile launchers (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Change Environment Damaging EMP energy damping 50m radius (25 CP — supplement Change Environment, kills robotics, 200 dmg to other FFs)",
     "cp": "25",
     "ip": ""
    },
    {
     "desc": "Force Field A High-Capacity 400pt (30 CP)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Speed +60 (30 CP — 150 kph)",
     "cp": "30",
     "ip": "",
     "mods": {
      "move_mod": 43
     }
    },
    {
     "desc": "Armor 20 = 12/4/2/2 K/E/B/Ent (40 CP — fortress duralloy)",
     "cp": "40",
     "ip": ""
    },
    {
     "desc": "Special Requirement: Power source nuclear -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Restriction: No organic functions -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Restriction: Cannot operate without PCI control link -10",
     "cp": "-10",
     "ip": ""
    },
    {
     "desc": "Distinctive: Obviously apex weapon -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Phobia/Compulsion: PCI-controlled (PCI quirks transfer) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "2d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "12",
   "protEnergy": "4",
   "protBio": "2",
   "protEntropy": "2",
   "form": "Death Machine",
   "aggmods": {
    "strength_mod": 6,
    "endurance_mod": 6,
    "hits_mod": 252,
    "mental_def_bonus": 2,
    "move_mod": 43
   }
  },
  {
   "name": "Engineering Bot (Standard)",
   "stats": {
    "st": {
     "cp": "18"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "10"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d8",
   "weight": "1000",
   "inventing": "5",
   "initiative": "d3",
   "hitPts": "12",
   "hitPtsSrc": "12",
   "power": "36",
   "powerSrc": "36",
   "story": "GW source: Power: broadcast + 12hr hydrogen cell. Sensors: standard, IR, UV, microscopic. Control: Vocal Stage II I.D., standard electronic, programmed. Construction: 1.5×3×2m. Anti-grav at 24 KPH carrying 2000 kilos. Two 5m crane arms (1500 kg each), 4 tentacles (5m, 250 kg each), t/p beam (500 kg @ 10m). Equipment: stock parts, sonic torch, micro-laser, atomic torch, fusion torch, power tools. Sealed for underwater/vacuum. 9 HD / 45 HP, AC 3.\nMP build: Humanoid industrial, Standard power level\nAbilities: Adaptation Bio (5 CP), Adaptation Mental (10 CP), Adaptation Aquatic (5 CP — sealed body), Adaptation Vacuum (5 CP — sealed body), Heightened Defense Mental (5 CP), Stretching B Crane Arms (5m extension, ×2) (10 CP), Stretching A Tentacles (5m, ×4) (10 CP), Telekinesis A tractor/pressor beam (500kg @ 10m) (7.5 CP), Equipment: tool array (sonic torch, micro-laser, atomic torch, fusion torch — Power Blast Energy variants for tools-as-weapons) (15 CP), Armor 12 = 7/3/0/2 K/E/B/Ent (20 CP)\nWeaknesses: Special Requirement: Power source broadcast + 12hr H2 -10, Restriction: No organic functions -5, Distinctive: Obviously industrial machine -5, Lowered Cool: Programmed (will weld PC into wall plate) -5\nCP estimate: ~92\nEncounter: Engineering Bot (Standard) (No. appearing 1). HTH d8+1, Init d3.",
   "abilities": [
    {
     "desc": "Adaptation Bio (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Adaptation Aquatic (5 CP — sealed body)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Vacuum (5 CP — sealed body)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Stretching B Crane Arms (5m extension, ×2) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Stretching A Tentacles (5m, ×4) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Telekinesis A tractor/pressor beam (500kg @ 10m) (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Equipment: tool array (sonic torch, micro-laser, atomic torch, fusion torch — Power Blast Energy variants for tools-as-weapons) (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Armor 12 = 7/3/0/2 K/E/B/Ent (20 CP)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Special Requirement: Power source broadcast + 12hr H2 -10",
     "cp": "-10",
     "ip": ""
    },
    {
     "desc": "Restriction: No organic functions -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive: Obviously industrial machine -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Lowered Cool: Programmed (will weld PC into wall plate) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "7",
   "protEnergy": "3",
   "protBio": "0",
   "protEntropy": "2",
   "form": "Engineering Bot (Standard)",
   "aggmods": {
    "mental_def_bonus": 2
   }
  },
  {
   "name": "General Household Robotoid",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "6"
    },
    "cl": {
     "cp": "6"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d4",
   "weight": "150",
   "inventing": "3",
   "initiative": "d3",
   "hitPts": "6",
   "hitPtsSrc": "6",
   "power": "22",
   "powerSrc": "22",
   "story": "GW source: Power: broadcast + 4hr chemical battery. Sensors: standard, infrared. Control: Vocal Stage I I.D., programmed. Construction: 1.5m humanoid. Walks. 2 arms with 1m tentacles. Equipment: cleaners, polishers, insecticides, vacuum, trash compactor, incinerator. 5 HD / 20 HP, AC 4.\nMP build: Humanoid, Low power level\nAbilities: Adaptation Bio (5 CP), Adaptation Mental (10 CP), Heightened Defense Mental (5 CP), Stretching A short manipulator tentacles (1m, ×2) (5 CP), Equipment: cleaning tools, vacuum hose, basic kit (5 CP), Armor 9 = 5/2/0/2 K/E/B/Ent (15 CP — light alloy housing)\nWeaknesses: Special Requirement: Power source broadcast + 4hr backup -10, Restriction: No organic functions -5, Distinctive: Obviously machine -5, Lowered Cool: Programmed (cleaning fixation) -5\nCP estimate: ~25\nEncounter: General Household Robotoid (No. appearing 1). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "Adaptation Bio (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Stretching A short manipulator tentacles (1m, ×2) (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Equipment: cleaning tools",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "vacuum hose",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "basic kit (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 9 = 5/2/0/2 K/E/B/Ent (15 CP — light alloy housing)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Special Requirement: Power source broadcast + 4hr backup -10",
     "cp": "-10",
     "ip": ""
    },
    {
     "desc": "Restriction: No organic functions -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive: Obviously machine -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Lowered Cool: Programmed (cleaning fixation) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2",
   "form": "General Household Robotoid",
   "aggmods": {
    "mental_def_bonus": 2
   }
  },
  {
   "name": "Security Robotoid",
   "stats": {
    "st": {
     "cp": "16"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "12"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Science Project",
   "species": "Tech Construct",
   "mass": "d6",
   "weight": "600",
   "inventing": "6",
   "initiative": "d6",
   "hitPts": "12",
   "hitPtsSrc": "12",
   "power": "56",
   "powerSrc": "56",
   "story": "GW source: Power: broadcast or nuclear plant. Sensors: standard, IR, UV. Control: Vocal Stage IV I.D., special electronic, programmed. Construction: 2.5m humanoid. Walks + anti-grav 96 KPH carrying 400 kilos. 2 padded tentacles (3m, paralysis device, 200 kg each). 2 t/p beams (200 kg @ 30m). Weaponry: 4 paralysis rods (3m extensions), slug projector + 10 clips, grenade launcher (50m range, 4 sleep + 5 tear-gas grenades). Programmed to subdue all life forms acting violently. Can summon Medical/Engineering bots. 12 HD / 72 HP, AC 2.\nMP build: Humanoid, Standard power level (service tier)\nAbilities: Adaptation Bio (5 CP), Adaptation Mental (10 CP), Heightened Defense Mental (5 CP), Stretching A padded tentacles (3m, paralysis-equipped, ×2) (10 CP), Telekinesis A x2 tractor/pressor beams (200kg @ 30m, dual) (15 CP), Equipment: 4 paralysis rods (Power Blast Bio Paralysis, 3m, 4 charges) (10 CP), Equipment: slug projector (Power Blast Kinetic, 50m, 10 clips) (10 CP), Equipment: grenade launcher (Power Blast Bio/Energy, area 30m, 4 sleep + 5 tear-gas) (10 CP), Speed +30 (15 CP — anti-grav 96 kph supplement), Armor 16 = 10/3/1/2 K/E/B/Ent (30 CP — duralloy plating)\nWeaknesses: Special Requirement: Power source nuclear -5, Restriction: No organic functions -5, Distinctive: Obviously security machine -5, Compulsion: Programmed to subdue violent acts -5\nCP estimate: ~125\nEncounter: Security Robotoid (No. appearing 1). HTH d6+1, Init d6.",
   "abilities": [
    {
     "desc": "Adaptation Bio (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Heightened Defense Mental (5 CP)",
     "cp": "5",
     "ip": "",
     "mods": {
      "mentdef_mod": 2
     }
    },
    {
     "desc": "Stretching A padded tentacles (3m, paralysis-equipped, ×2) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Telekinesis A x2 tractor/pressor beams (200kg @ 30m, dual) (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Equipment: 4 paralysis rods (Power Blast Bio Paralysis, 3m, 4 charges) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Equipment: slug projector (Power Blast Kinetic, 50m, 10 clips) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Equipment: grenade launcher (Power Blast Bio/Energy, area 30m, 4 sleep + 5 tear-gas) (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Speed +30 (15 CP — anti-grav 96 kph supplement)",
     "cp": "15",
     "ip": "",
     "mods": {
      "move_mod": 33
     }
    },
    {
     "desc": "Armor 16 = 10/3/1/2 K/E/B/Ent (30 CP — duralloy plating)",
     "cp": "30",
     "ip": ""
    },
    {
     "desc": "Special Requirement: Power source nuclear -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Restriction: No organic functions -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive: Obviously security machine -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Compulsion: Programmed to subdue violent acts -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "10",
   "protEnergy": "3",
   "protBio": "1",
   "protEntropy": "2",
   "form": "Security Robotoid",
   "aggmods": {
    "mental_def_bonus": 2,
    "move_mod": 33
   }
  }
 ],
 "sep": [
  {
   "name": "Sep",
   "stats": {
    "st": {
     "cp": "6"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "6"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d10",
   "weight": "2000",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "13",
   "hitPtsSrc": "13",
   "power": "46",
   "powerSrc": "46",
   "story": "GW source: AC 5, HD 17, MV 10. Mutated land-shark. Telekinetic sand-burrowing. Detects creatures up to 50m. Springs from ground, bites 9d6, burrows back, maneuvers 1-2 turns underground, attacks from new direction.\nMP build: A/P Fish, Standard power level\nAbilities: A/P Fish Standard (20 CP — Natural Weaponry massive bite ~2d10 sharp, Heightened Senses 50m, Tunneling associated with bite for sand-burrow primary locomotion — Max SR 2 sand 5 CP + Max Speed 12 = 10 CP, total 15 CP within or supplementing A/P), Size Change Larger 12' (15 CP), Tunneling (sand burrow, Max SR 2, Max Speed 12, +2 dmg bonus on bite from CP overflow) (15 CP — supplement ability), Heightened Strength ~+4 (4 CP), Heightened Attack +2 hit (4 CP), Armor 8 = 5/1/0/2 (12.5 CP — hide)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~70\nEncounter: Sep (No. appearing 1d6). HTH d8+1, Init d4.",
   "abilities": [
    {
     "desc": "A/P Fish Standard (20 CP — Natural Weaponry massive bite ~2d10 sharp, Heightened Senses 50m, Tunneling associated with bite for sand-burrow primary locomotion — Max SR 2 sand 5 CP + Max Speed 12 = 10 CP, total 15 CP within or supplementing A/P)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 12' (15 CP)",
     "cp": "15",
     "ip": "",
     "mods": {
      "st_mod": 9,
      "en_mod": 9,
      "profile_mod": "x2"
     }
    },
    {
     "desc": "Tunneling (sand burrow, Max SR 2, Max Speed 12, +2 dmg bonus on bite from CP overflow) (15 CP — supplement ability)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Heightened Strength ~+4 (4 CP)",
     "cp": "4",
     "ip": "",
     "mods": {
      "st_mod": 4
     }
    },
    {
     "desc": "Heightened Attack +2 hit (4 CP)",
     "cp": "4",
     "ip": ""
    },
    {
     "desc": "Armor 8 = 5/1/0/2 (12.5 CP — hide)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d8+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 13,
    "endurance_mod": 9,
    "profile": 2
   }
  }
 ],
 "serf": [
  {
   "name": "Serf",
   "stats": {
    "st": {
     "cp": "16"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "14"
    },
    "cl": {
     "cp": "15"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "150",
   "inventing": "8",
   "initiative": "d6+1",
   "hitPts": "10",
   "hitPtsSrc": "10",
   "power": "52",
   "powerSrc": "52",
   "story": "GW source: AC 6, HD 10, MV 12. Mutated humanoid. Heightened Strength, partial carapace, poison claws (intensity 8). MS 15. Mental mutations: Light Wave Manipulation, Density Control (others), Life Leech, Death Field Generation, Mental Blast, Telepathy. Semi-nomadic military \"brigades\", uniforms. General has ancient weapon. 90% prefer mental attacks.\nMP build: Humanoid (intelligent — no A/P)\nAbilities: \nEquipment: Old uniforms (cosmetic). General has ancient weapon (artifact, blast rifle/grenade launcher class, 15-20 CP).\nWeaknesses: Distinctive (military uniform identity) -5\nCP estimate: ~135 base + general's artifact (over HD-10 budget; full mutation list = boss-tier despite mid HD)\nEncounter: Serf (No. appearing 1d6). HTH d6+1, Init d6+1.",
   "abilities": [
    {
     "desc": "Gear: Old uniforms (cosmetic). General has ancient weapon (artifact, blast rifle/grenade launcher class, 15-20 CP).",
     "cp": "-20",
     "ip": ""
    },
    {
     "desc": "Distinctive (military uniform identity) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ]
  }
 ],
 "seroon lou": [
  {
   "name": "Seroon Lou",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "8"
    },
    "in": {
     "cp": "6"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "3",
   "initiative": "d3",
   "hitPts": "3",
   "hitPtsSrc": "3",
   "power": "34",
   "powerSrc": "34",
   "story": "GW source: AC 8, HD 8, MV 3. Carnivorous aquatic plant up to 30m, semi-intelligent. Stalk 3m above water, mobile roots walk bottom. Eye atop stalk + 11-20 manipulation vines. Wields rocks/clubs. Drags victims to bottom for assimilation. Hides among Narl Ep (similar appearance, darker color).\nMP build: A/P Plant, Standard power level\nAbilities: A/P Plant Standard (20 CP — Stretching A Elongation 3m+ vines, Natural Weaponry vines wielding clubs +d6 blunt, Heightened Senses eye-on-stalk), Adaptation Aquatic (5 CP), Armor 3 = 1/1/0/1 (5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5 (mitigated by Narl Ep mimicry advantage)\nCP estimate: ~30\nEncounter: Seroon Lou (No. appearing 3d6). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "A/P Plant Standard (20 CP — Stretching A Elongation 3m+ vines, Natural Weaponry vines wielding clubs +d6 blunt, Heightened Senses eye-on-stalk)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Adaptation Aquatic (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 3 = 1/1/0/1 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5 (mitigated by Narl Ep mimicry advantage)",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1"
  }
 ],
 "sleeth": [
  {
   "name": "Sleeth",
   "stats": {
    "st": {
     "cp": "12"
    },
    "en": {
     "cp": "14"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "17"
    },
    "cl": {
     "cp": "17"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d6",
   "weight": "400",
   "inventing": "9",
   "initiative": "d6+1",
   "hitPts": "17",
   "hitPtsSrc": "17",
   "power": "66",
   "powerSrc": "66",
   "story": "GW source: AC 5, HD 18, MV 12. 3m mutated lizard. IN 17, MS 17. Mental mutations: Telepathy, Precognition, special Force Field Negation (any FF within 30m). Illusion-immune, poison resistance 18. 1 in 10 has additional rolled mutation. Peaceful, philosophical, communal. Use all weapons.\nMP build: Humanoid (intelligent, peaceful — no A/P)\nAbilities: Size Change Larger 9' (7.5 CP), Telepathy (10 CP), Heightened Senses Vision Precognitive (15 CP), Negation Force Field 30m (15 CP), Adaptation Mental illusion-immunity (5 CP), Adaptation Bio poison-resistance 18 (5 CP), Armor 8 = 4/2/0/2 (12.5 CP)\nEquipment: Any weapon (15-25 CP iron-age to recovered tech)\nWeaknesses: none baseline (peaceful nature is flavor only)\nCP estimate: ~85 + equipment\nEncounter: Sleeth (No. appearing 1d2). HTH d6+1, Init d6+1.",
   "abilities": [
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Telepathy (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Heightened Senses Vision Precognitive (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Negation Force Field 30m (15 CP)",
     "cp": "15",
     "ip": ""
    },
    {
     "desc": "Adaptation Mental illusion-immunity (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Adaptation Bio poison-resistance 18 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 8 = 4/2/0/2 (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Gear: Any weapon (15-25 CP iron-age to recovered tech)",
     "cp": "-25",
     "ip": ""
    },
    {
     "desc": "none baseline (peaceful nature is flavor only)",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "2",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "soul besh": [
  {
   "name": "Soul Besh",
   "stats": {
    "st": {
     "cp": "8"
    },
    "en": {
     "cp": "10"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d3",
   "weight": "50",
   "inventing": "2",
   "initiative": "d3",
   "hitPts": "4",
   "hitPtsSrc": "4",
   "power": "35",
   "powerSrc": "35",
   "story": "GW source: AC 8, HD 10, MV 9. Flightless mutated mosquito, 1.3m. Chameleon powers (concealment ambush). 2m coiled proboscis: pierces sleeping victim 1d6 + intensity 18 paralytic. Next turn: blood-drain 12 HP/turn. Antidote from boiled exoskeleton (150cc, 10cc dose).\nMP build: A/P Insect, Standard power level\nAbilities: A/P Insect Standard (20 CP — Invisibility Visible-Light Camouflage, Stretching A Elongation 2m proboscis, Natural Weaponry proboscis pierce +d6 sharp), Size Change Smaller 4.5' (2.5 CP), Poison/Venom A intensity 18 paralytic carrier on bite (10 CP), Siphon Hits vampiric 12/turn sustained (17.5 CP), Armor 3 = 1/1/0/1 (5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~55\nEncounter: Soul Besh (No. appearing 1d3). HTH d3, Init d3.",
   "abilities": [
    {
     "desc": "A/P Insect Standard (20 CP — Invisibility Visible-Light Camouflage, Stretching A Elongation 2m proboscis, Natural Weaponry proboscis pierce +d6 sharp)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 4.5' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": -1,
      "profile_mod": "/1.5"
     }
    },
    {
     "desc": "Poison/Venom A intensity 18 paralytic carrier on bite (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Siphon Hits vampiric 12/turn sustained (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Armor 3 = 1/1/0/1 (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "1",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": -1,
    "profile": 0.6666666666666666
   }
  }
 ],
 "terl": [
  {
   "name": "Terl",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "8"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "4"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d4",
   "weight": "80",
   "inventing": "2",
   "initiative": "d4",
   "hitPts": "7",
   "hitPtsSrc": "7",
   "power": "39",
   "powerSrc": "39",
   "story": "GW source: AC 5, HD 9, MV Telekinetic Flight. 2m mutated barracuda covered in brightly colored feathers instead of scales. Mates/hatches in water, lives in trees. Breathes water and air. Telekinetic flight. Predator: uses cryogenesis + sonic attack simultaneously to kill prey. Bite 2d6 fallback. Feathers reflect heat + laser. Detects/avoids radiation.\nMP build: A/P Fish, Standard power level\nAbilities: A/P Fish Standard (20 CP — Adaptation Aquatic, Adaptation Aerial dual-breathing, Natural Weaponry bite +d6 sharp), Size Change Larger 7' (2.5 CP), Flight (Telekinetic, moderate speed) 10 CP, Ice Abilities B Ice Blast Cryogenesis (12.5 CP), Sonic Abilities A Sonic Blast (10 CP), Reflection Energy (heat + laser via feathers) (12.5 CP), Heightened Senses (radiation detection, 30m+ range) (7.5 CP), Armor 8 = 5/1/0/2 (12.5 CP — feather + scale)\nWeaknesses: Lowered Intelligence -5, Distinctive (feathered barracuda) -5\nCP estimate: ~85\nEncounter: Terl (No. appearing 1d3). HTH d6, Init d4.",
   "abilities": [
    {
     "desc": "A/P Fish Standard (20 CP — Adaptation Aquatic, Adaptation Aerial dual-breathing, Natural Weaponry bite +d6 sharp)",
     "cp": "20",
     "ip": ""
    },
    {
     "desc": "Size Change Larger 7' (2.5 CP)",
     "cp": "2.5",
     "ip": "",
     "mods": {
      "st_mod": 2,
      "en_mod": 1,
      "profile_mod": "x1.2"
     }
    },
    {
     "desc": "Flight (Telekinetic, moderate speed) 10 CP",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Ice Abilities B Ice Blast Cryogenesis (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Sonic Abilities A Sonic Blast (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Reflection Energy (heat + laser via feathers) (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Heightened Senses (radiation detection, 30m+ range) (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Armor 8 = 5/1/0/2 (12.5 CP — feather + scale)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive (feathered barracuda) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "5",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": 2,
    "endurance_mod": 1,
    "profile": 1.2
   }
  }
 ],
 "tribesmen": [
  {
   "name": "Bulk grunt example (Normal Power, warrior archetype)",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "12"
    },
    "ag": {
     "cp": "10"
    },
    "in": {
     "cp": "6"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Human",
   "mass": "d4",
   "weight": "150",
   "inventing": "3",
   "initiative": "d3",
   "hitPts": "8",
   "hitPtsSrc": "8",
   "power": "42",
   "powerSrc": "42",
   "story": "GW source: No dedicated stat block — encounter table specifies \"wandering band of 1-100 (2d10) Pure Strain Humans or humanoids.\" Tech level varies per region. Reaction varies by tribe disposition.\nMP build: Humanoid (PSH or mutated humanoid)\nAbilities: none baseline (PSH); +1 mutation from §10-12 if humanoid\nCP estimate: Normal grunt ~25 + equipment; Low sub-leader ~40 + equipment + mutations; Standard chief ~70 + equipment + mutations; High legendary ~110 + equipment + mutations.\nEncounter: Bulk grunt example (Normal Power, warrior archetype) (No. appearing 2d10). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "none baseline (PSH); +1 mutation from §10-12 if humanoid",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "form": "Bulk grunt example (Normal Power, warrior archetype)"
  }
 ],
 "win seen": [
  {
   "name": "Win Seen",
   "stats": {
    "st": {
     "cp": "14"
    },
    "en": {
     "cp": "13"
    },
    "ag": {
     "cp": "4"
    },
    "in": {
     "cp": "3"
    },
    "cl": {
     "cp": "8"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "1",
   "initiative": "d3",
   "hitPts": "6",
   "hitPtsSrc": "6",
   "power": "34",
   "powerSrc": "34",
   "story": "GW source: AC 9, HD 13, MV N/A. Creeping vine tangle, runners up to 20m diameter, all connected. Two varieties:\nMP build: A/P Plant, Low power level (immobile)\nAbilities: - A/P Plant Low (10 CP — Sonic Abilities A contact-trigger, Poison/Venom A intensity 14 contact)\nWeaknesses: Lowered Intelligence -5, Distinctive -5, Special Requirement (immobile, can be uprooted/burned) -5\nCP estimate: ~20 (aquatic) / ~40 (land)\nEncounter: Win Seen (No. appearing 1d3). HTH d6, Init d3.",
   "abilities": [
    {
     "desc": "- A/P Plant Low (10 CP — Sonic Abilities A contact-trigger, Poison/Venom A intensity 14 contact)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Special Requirement (immobile, can be uprooted/burned) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ]
  }
 ],
 "yexil": [
  {
   "name": "Yexil",
   "stats": {
    "st": {
     "cp": "11"
    },
    "en": {
     "cp": "6"
    },
    "ag": {
     "cp": "12"
    },
    "in": {
     "cp": "6"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d8",
   "weight": "1500",
   "inventing": "3",
   "initiative": "d4",
   "hitPts": "9",
   "hitPtsSrc": "9",
   "power": "44",
   "powerSrc": "44",
   "story": "GW source: AC 6, HD 10, MV 4/15 (ground/fly). 8m wingspan, 3m tall, indeterminate origin chimera. Slow-witted, friendly. 2 hairy legs, lion-head, large mandibles, hands at end of each wing. Bite 3d6, laser eyes 5d6 at 25m. Orange/black fur, cold-resistant. Gourmet for manufactured clothing — trades worthless tech (pistols/bombs/grenades) for snappy outfits.\nMP build: Humanoid (intelligent enough to trade — no A/P) with chimeric features\nAbilities: Size Change Larger 9' (7.5 CP), Flight 15m (7.5 CP), Power Blast Energy laser eyes 25m ~2d8 (17.5 CP), Natural Weaponry bite +d8 sharp (7.5 CP), Adaptation Energy/cold (5 CP), Physical Ability B Extra Limbs hand-tipped wings (5 CP), Armor 6 = 4/1/0/1 (10 CP)\nEquipment: Random tech (1d3 of pistol/bombs/grenades) — yexil considers worthless, GM picks.\nWeaknesses: Lowered Intelligence -5, Compulsion (gourmand for clothing) -5\nCP estimate: ~55\nEncounter: Yexil (No. appearing 1). HTH d6+1, Init d4.",
   "abilities": [
    {
     "desc": "Size Change Larger 9' (7.5 CP)",
     "cp": "7.5",
     "ip": "",
     "mods": {
      "st_mod": 5,
      "en_mod": 4,
      "profile_mod": "x1.5"
     }
    },
    {
     "desc": "Flight 15m (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Power Blast Energy laser eyes 25m ~2d8 (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Natural Weaponry bite +d8 sharp (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Adaptation Energy/cold (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Physical Ability B Extra Limbs hand-tipped wings (5 CP)",
     "cp": "5",
     "ip": ""
    },
    {
     "desc": "Armor 6 = 4/1/0/1 (10 CP)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Gear: Random tech (1d3 of pistol/bombs/grenades) — yexil considers worthless",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Gear: GM picks.",
     "cp": "",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Compulsion (gourmand for clothing) -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d6+1",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "4",
   "protEnergy": "1",
   "protBio": "0",
   "protEntropy": "1",
   "aggmods": {
    "strength_mod": 5,
    "endurance_mod": 4,
    "profile": 1.5
   }
  }
 ],
 "zarn": [
  {
   "name": "Zarn",
   "stats": {
    "st": {
     "cp": "10"
    },
    "en": {
     "cp": "4"
    },
    "ag": {
     "cp": "14"
    },
    "in": {
     "cp": "5"
    },
    "cl": {
     "cp": "10"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d2",
   "weight": "",
   "inventing": "3",
   "initiative": "d4",
   "hitPts": "1",
   "hitPtsSrc": "1",
   "power": "29",
   "powerSrc": "29",
   "story": "GW source: AC 7, HD 4, MV teleportation only (max 200m). 10cm orange parasitic beetle, semi-intelligent. Spits intensity 16 paralytic poison (5m range), then teleports. Spittle persistent — save each turn per unwashed area. Paralysis lasts 1 week. Bores skull, lays 4d6 eggs in brain; hatch day 4, emerge day 5. Surgical removal only.\nMP build: A/P Insect, Low power level\nAbilities: A/P Insect Low (10 CP — Heightened Senses, Natural Weaponry bore-mandibles +d4 sharp post-paralysis only), Size Change Smaller 1' (10 CP), Teleportation 200m alt-turns (12.5 CP), Special Missile Weapon spit intensity 16 paralytic 5m persistent (17.5 CP), Armor 5 = 3/0/0/2 (7.5 CP)\nWeaknesses: Lowered Intelligence -5, Distinctive -5\nCP estimate: ~57.5\nEncounter: Zarn (No. appearing 1). HTH d3, Init d4.",
   "abilities": [
    {
     "desc": "A/P Insect Low (10 CP — Heightened Senses, Natural Weaponry bore-mandibles +d4 sharp post-paralysis only)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Size Change Smaller 1' (10 CP)",
     "cp": "10",
     "ip": "",
     "mods": {
      "st_mod": -2,
      "en_mod": -2,
      "profile_mod": "/6"
     }
    },
    {
     "desc": "Teleportation 200m alt-turns (12.5 CP)",
     "cp": "12.5",
     "ip": ""
    },
    {
     "desc": "Special Missile Weapon spit intensity 16 paralytic 5m persistent (17.5 CP)",
     "cp": "17.5",
     "ip": ""
    },
    {
     "desc": "Armor 5 = 3/0/0/2 (7.5 CP)",
     "cp": "7.5",
     "ip": ""
    },
    {
     "desc": "Lowered Intelligence -5",
     "cp": "-5",
     "ip": ""
    },
    {
     "desc": "Distinctive -5",
     "cp": "-5",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d3",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ],
   "protKinetic": "3",
   "protEnergy": "0",
   "protBio": "0",
   "protEntropy": "2",
   "aggmods": {
    "strength_mod": -2,
    "endurance_mod": -2,
    "profile": 0.16666666666666666
   }
  }
 ],
 "zeethh": [
  {
   "name": "Zeethh",
   "stats": {
    "st": {
     "cp": "4"
    },
    "en": {
     "cp": "1"
    },
    "ag": {
     "cp": "1"
    },
    "in": {
     "cp": "2"
    },
    "cl": {
     "cp": "12"
    }
   },
   "originType": "Mutated or Evolved",
   "species": "Monster",
   "mass": "d2",
   "weight": "",
   "inventing": "1",
   "initiative": "d6",
   "hitPts": "1",
   "hitPtsSrc": "1",
   "power": "8",
   "powerSrc": "8",
   "story": "GW source: AC 10, HD 1 each, MV None (teleporting seeds). 1d100 plants. 1.5m blade of mutated purple grass. Tassels grow continuously summer-long, hold 1d6 spiked seeds each. Each turn warm-blooded creatures within 20m: zeethhs teleport 1/4 of total seeds into them.\nMP build: A/P Plant, Low power level (swarm encounter — see swarm mechanic below)\nAbilities: A/P Plant Low (10 CP — Mobility none, no useful direct attacks individually), Special Missile Weapon teleporting spiked seeds (covered in swarm mechanic, not per-plant)\nCP estimate: Per-plant ~10. Swarm field-effect difficult to price standalone — treat as encounter hazard with 1d100 plants × 3 seeds = up to 300 seeds × 1/4 = up to 75 attacks/turn at saturation.\nEncounter: Zeethh (No. appearing 1d4). HTH d2, Init d6.",
   "abilities": [
    {
     "desc": "A/P Plant Low (10 CP — Mobility none, no useful direct attacks individually)",
     "cp": "10",
     "ip": ""
    },
    {
     "desc": "Special Missile Weapon teleporting spiked seeds (covered in swarm mechanic, not per-plant)",
     "cp": "",
     "ip": ""
    }
   ],
   "attacks": [
    {
     "name": "Strike (HTH)",
     "toHit": "",
     "damage": "d2",
     "dmgType": "Kinetic",
     "kb": ""
    }
   ]
  }
 ]
};

/* ---------------------------------------------------------------------------
 * MP_GW_VEHICLES — Gamma World apex robots modeled as MP Vehicles (not characters).
 * Authored compact; mp_engine.js buildVehicleFromMPData() expands each into a full
 * FLYER.json-schema (version 10) export for import into the MP Vehicle builder.
 * System def fields: { sp(spaces), abId, cp(abilityCp), dmg, integral, area, autofire,
 *   pr, range, dmgtype, adjST/EN/AG/IN/CL, desc }. abId null => descriptive-only row.
 * abId slugs confirmed from a real export: power-blast, force-field, automation, flight,
 *   cargo, passenger-seat, communicators. INFERRED (verify vs builder): armor, robot-brain,
 *   disintegration, change-environment, paralysis, telekinesis.
 * Range codes (abilityData.range): 0 LoS,1 Voice,2 BCx16,3 BCx8,4 BCx4,5 BCx2,6 BCx1,7 BC/2,8 BC/4,9 1",10 Touch.
 * ------------------------------------------------------------------------- */
var MP_GW_VEHICLES = {
 "death machine": {
  name: "Death Machine", model: "GW Apex", operator: "PCI-linked",
  sizeKey: 37.5, techMod: 25, maneuverMod: 0,
  bcs: { ag: 9, in: 14, cl: 9 },
  armor: [8, 5, 4, 3, 0],
  systems: [
   { sp: 16, abId: "force-field", cp: 50, pr: 16, desc: "Force Field: 48 pts (12/12/12/12) (50), PR 16 — per-hit wall; drops when cumulative deflected > vehicle Power; fully-blocked hits don't count" },
   { sp: 4,  abId: "robot-brain", cp: 14, adjIN: 14, desc: "Robot Brain: +14 IN (autonomous; operable only via its PCI link)" },
   { sp: 16, abId: "power-blast", cp: 50, dmg: "4d10", dmgtype: "Energy", range: 5, pr: 1, desc: "Blaster cannons x2 — Power Blast Energy (heaviest; capped 4d10)" },
   { sp: 24, abId: "power-blast", cp: 35, dmg: "3d10", dmgtype: "Energy", autofire: 5, range: 5, pr: 1, desc: "Laser batteries x8 (5 guns ea) — Power Blast Energy, Autofire" },
   { sp: 16, abId: "power-blast", cp: 20, dmg: "2d10", dmgtype: "Energy", autofire: 4, range: 4, pr: 1, desc: "Mark VII blaster-rifle batteries x16 — Power Blast Energy, Autofire (rapid)" },
   { sp: 12, abId: "disintegration", cp: 15, dmg: "2d8", dmgtype: "Disintegration", range: 6, pr: 2, desc: "Black-ray cannons x6 — Disintegration (Other; ignores Force Field, Armor, and SR)" },
   { sp: 8,  abId: "power-blast", cp: 20, dmg: "2d10", dmgtype: "Kinetic", area: 5, range: 5, pr: 1, desc: "Trek guns + fusion bombs — Power Blast Kinetic, Area (fusion bombs)" },
   { sp: 8,  abId: "power-blast", cp: 10, dmg: "2d6", dmgtype: "Kinetic", autofire: 5, range: 5, pr: 1, desc: "Mini-missile launchers x6 — Power Blast Kinetic, Autofire" },
   { sp: 6,  abId: "change-environment", cp: 25, area: 9, desc: "EMP energy-damping field, 50m radius — disables robotics in range; 200 dmg to other Force Fields" },
   { sp: 274, abId: null, desc: "Hull structure, nuclear plant, drive, crawlways (remaining spaces)" }
  ]
 },
 "defense/attack borg": {
  name: "Defense/Attack Borg", model: "GW Boss", operator: "self (organic-brain quirk §17.10)",
  sizeKey: 15, techMod: 20, maneuverMod: 0,
  bcs: { ag: 9, in: 5, cl: 9 },
  armor: [8, 5, 4, 3, 0],
  systems: [
   { sp: 4, abId: "force-field", cp: 25, pr: 16, desc: "Force Field: 28 pts (7/7/7/7) (25), PR 16 — per-hit wall; drops when deflected > vehicle Power" },
   { sp: 1, abId: "robot-brain", cp: 5, adjIN: 5, desc: "Organic brain: +5 IN (self-controlled; §17.10 quirk)" },
   { sp: 2, abId: "power-blast", cp: 20, dmg: "2d10", dmgtype: "Energy", autofire: 5, range: 5, pr: 1, desc: "Laser batteries x3 (5 guns ea) — Power Blast Energy, Autofire" },
   { sp: 1, abId: "power-blast", cp: 20, dmg: "2d10", dmgtype: "Energy", area: 5, range: 4, pr: 1, desc: "Energy grenade launchers x2 — Power Blast Energy, Area" },
   { sp: 1, abId: "power-blast", cp: 20, dmg: "2d10", dmgtype: "Kinetic", autofire: 4, range: 4, pr: 1, desc: "Micro-missile launchers x2 — Power Blast Kinetic, Autofire" },
   { sp: 1, abId: "power-blast", cp: 10, dmg: "2d6", dmgtype: "Energy", area: 4, range: 4, pr: 1, desc: "Photon grenade launcher — Power Blast Energy, Area" },
   { sp: 2, abId: "paralysis", cp: 20, range: 9, desc: "Paralysis tentacles x2 — Paralysis Ray (5m/10m fields), no Hits damage" },
   { sp: 1, abId: "telekinesis", cp: 10, range: 5, desc: "Twin t/p beams — Telekinesis (500 kg @ 50m)" },
   { sp: 3, abId: null, desc: "Sphere structure, nuclear plant, turret (remaining spaces)" }
  ]
 }
};
