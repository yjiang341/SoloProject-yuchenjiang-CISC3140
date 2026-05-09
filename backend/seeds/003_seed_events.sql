-- Linear story event seed data for Truth of Abyss
-- Design goals:
-- 1) One-way progression (no loops)
-- 2) 3-4 options per main event; sub-events collapse back into main chain
-- 3) Combat checkpoints with skill_points_reward (normal=2, elite/boss=6)
-- 4) Treasure event (treasure flag triggers D&D API loot in frontend)
-- 5) Clear bad ending and good ending nodes

INSERT INTO public.events (id, title, description, event_type, options, requirements) VALUES

-- ============================================================
-- ACT 1 – THE AWAKENING
-- ============================================================

('start_001', 'The Awakening',
'You awaken on damp stone beneath the ruined watchtower of Black Hollow. Your head throbs, your gear is gone, and dawn bleeds through broken arches. A battered satchel lies near your hand. A cracked road points toward Emberfall village. You must choose how to begin.',
'story',
'[
  {
    "text": "Take the satchel quietly and slip away before anyone notices",
    "next_event": "satchel_s1",
    "effects": {}
  },
  {
    "text": "Search the watchtower ruins carefully for useful supplies",
    "next_event": "search_s1",
    "effects": {}
  },
  {
    "text": "Rest briefly on the cold stone to clear your aching head",
    "next_event": "rest_s1",
    "effects": {}
  }
]',
'{}'),

('satchel_s1', 'The Satchel',
'Inside the satchel you find a healing draught, a tattered map of the frontier roads, and 15 gold coins tied in cloth. Clearly someone left these for an adventurer in need.',
'story',
'[
  {
    "text": "Pocket the supplies and head down the road toward Emberfall",
    "next_event": "road_002",
    "effects": { "gold": 15, "item": "potion-of-healing" }
  }
]',
'{}'),

('search_s1', 'Among the Rubble',
'Beneath a collapsed wall you uncover a sealed box. Inside: 25 gold coins, a spare shortsword grip, and old rations. The ruins have more than they let on.',
'story',
'[
  {
    "text": "Take the findings and press on toward Emberfall",
    "next_event": "road_002",
    "effects": { "gold": 25, "experience": 15 }
  }
]',
'{}'),

('rest_s1', 'Brief Respite',
'You close your eyes for a few minutes. Pain recedes, clarity returns. When you rise the road to Emberfall looks less daunting, and you find 10 gold wedged under a loose stone.',
'rest',
'[
  {
    "text": "Refreshed, set out toward Emberfall",
    "next_event": "road_002",
    "effects": { "hp": 5, "gold": 10 }
  }
]',
'{}'),

-- ============================================================
-- ROAD TO EMBERFALL
-- ============================================================

('road_002', 'Road To Emberfall',
'A militia scout named Tamsin blocks your path. She warns that abyss-tainted wolves have infested the supply trail ahead. Emberfall will starve within the week without that route cleared. She offers a small reward if you handle it — but the choice of approach is yours.',
'story',
'[
  {
    "text": "Accept and take the direct trail — meet them head-on",
    "next_event": "ambush_003",
    "effects": { "experience": 20 }
  },
  {
    "text": "Scout the trail from a distance before engaging",
    "next_event": "scout_s2",
    "effects": {}
  },
  {
    "text": "Ask Tamsin for a full enemy briefing before moving",
    "next_event": "intel_s2",
    "effects": {}
  },
  {
    "text": "Lay rope-and-spike traps along the trail first",
    "next_event": "traps_s2",
    "effects": {}
  }
]',
'{}'),

('scout_s2', 'Scouting the Trail',
'Crouching behind brush you count the pack: eight wolves, spread across two choke-points. The lead wolf is larger — likely the alpha. Your vantage gives you tactical awareness but the pack is still here.',
'story',
'[
  {
    "text": "With their positions mapped, advance to clear the trail",
    "next_event": "ambush_003",
    "effects": { "experience": 15 }
  }
]',
'{}'),

('intel_s2', 'Tamsin''s Briefing',
'Tamsin draws a hasty map in the dirt. The wolves entered through a marsh breach and are led by an alpha corrupted by abyss residue. She hands you a vial of anti-toxin as a precaution.',
'story',
'[
  {
    "text": "Armed with knowledge, advance to clear the trail",
    "next_event": "ambush_003",
    "effects": { "experience": 15, "item": "antitoxin" }
  }
]',
'{}'),

('traps_s2', 'Laying Traps',
'Rope loops and sharpened stakes take an hour to set. When you spring the trail the wolves trigger two traps immediately — the pack is already wounded when true combat begins.',
'story',
'[
  {
    "text": "Drive them into your trap lines and finish the fight",
    "next_event": "ambush_003",
    "effects": { "experience": 15 }
  }
]',
'{}'),

-- ============================================================
-- ACT 2 – COMBAT: TRAIL AMBUSH (normal enemy, 2 skill pts)
-- ============================================================

('ambush_003', 'Trail Ambush',
'The reeds explode. A pack of abyss wolves bursts from the fog, eyes burning with void-light. They circle to kill. You have no choice but to fight.',
'combat',
'[
  {
    "text": "Stand your ground and fight the wolves",
    "combat": {
      "enemy_id": "abyss_wolf_pack",
      "recommended_level": 1,
      "can_flee": false,
      "skill_points_reward": 2,
      "onVictoryEvent": "ruins_004",
      "onDefeatEvent": "bad_end_001"
    }
  }
]',
'{}'),

-- ============================================================
-- RUINS OF THE SILVER ORDER
-- ============================================================

('ruins_004', 'Ruins Of The Silver Order',
'Past the trail you reach a collapsed chapel once belonging to the Silver Order — a knight''s brotherhood erased by the cult. A training codex, an armory cache, ancient inscriptions, and a quiet corner for rest all await. What you focus on may shape the battles ahead.',
'reward',
'[
  {
    "text": "Claim the training codex and armory cache",
    "next_event": "ruins_loot_s4",
    "effects": {}
  },
  {
    "text": "Search deeper in the ruins for hidden relics",
    "next_event": "ruins_deep_s4",
    "effects": {}
  },
  {
    "text": "Study the ancient inscriptions on the walls",
    "next_event": "ruins_study_s4",
    "effects": {}
  },
  {
    "text": "Set a brief camp and recover your strength",
    "next_event": "ruins_camp_s4",
    "effects": {}
  }
]',
'{}'),

('ruins_loot_s4', 'The Armory Cache',
'The codex holds combat drills that immediately sharpen your strikes. The cache yields a steel shield, still sturdy after years of neglect. You feel stronger and more resilient.',
'reward',
'[
  {
    "text": "Claim the shield and press forward to the treasure vault",
    "next_event": "treasure_005",
    "effects": { "strength": 1, "constitution": 1, "experience": 60, "item": "shield" }
  }
]',
'{}'),

('ruins_deep_s4', 'Deeper Into the Ruins',
'Behind a false wall you discover a sealed reliquary. It holds a chain shirt and 40 gold pieces left by the last knight who died defending this place.',
'reward',
'[
  {
    "text": "Take the relics and push forward to the treasure vault",
    "next_event": "treasure_005",
    "effects": { "experience": 50, "gold": 40, "item": "chain-shirt" }
  }
]',
'{}'),

('ruins_study_s4', 'The Ancient Inscriptions',
'The inscriptions are a tactical treatise — the Silver Order''s battle doctrine against abyss-corrupted foes. You memorize key passages. Your mind feels sharper, more attuned to the enemy.',
'story',
'[
  {
    "text": "Armed with new knowledge, advance to the treasure vault",
    "next_event": "treasure_005",
    "effects": { "experience": 70, "intelligence": 1 }
  }
]',
'{}'),

('ruins_camp_s4', 'A Brief Rest',
'You find a sheltered corner behind the altar. An hour of sleep and a strip of dried meat do wonders. You wake refreshed and ready.',
'rest',
'[
  {
    "text": "Refreshed and ready, press on to the treasure vault",
    "next_event": "treasure_005",
    "effects": { "hp": 10, "experience": 30 }
  }
]',
'{}'),

-- ============================================================
-- TREASURE EVENT
-- ============================================================

('treasure_005', 'Vault Of The Fallen Order',
'At the end of a torchlit corridor stands a heavy iron vault door, its lock long since rusted open. Inside, on a stone plinth, rests a single item left behind by the last knight of the Silver Order. Will you take it?',
'treasure',
'[
  {
    "text": "Reach in and claim the item from the vault",
    "next_event": "elite_005",
    "treasure": true
  }
]',
'{}'),

-- ============================================================
-- ELITE COMBAT: BLACKGUARD (elite enemy, 6 skill pts)
-- ============================================================

('elite_005', 'The Elite Blackguard',
'At the sanctum gate, a massive figure in black plate stands motionless. The cult''s elite blackguard raises a rune-carved halberd and speaks: "None shall pass. I am the gate." There is no way around — only through.',
'combat',
'[
  {
    "text": "Challenge the blackguard to single combat",
    "combat": {
      "enemy_id": "elite_blackguard",
      "recommended_level": 2,
      "can_flee": false,
      "skill_points_reward": 6,
      "onVictoryEvent": "sanctum_006",
      "onDefeatEvent": "bad_end_001"
    }
  }
]',
'{}'),

-- ============================================================
-- ACT 3 – SANCTUM OF ASH AND LIGHT
-- ============================================================

('sanctum_006', 'Sanctum Of Ash And Light',
'Inside the sanctum, healers'' scripts are carved into every surface. A soft light filters through the stone ceiling. The abyss gate looms ahead but there is still time to prepare. How will you use these final moments?',
'rest',
'[
  {
    "text": "Tend your wounds and rest fully before the final descent",
    "next_event": "sanctum_rest_s7",
    "effects": {}
  },
  {
    "text": "Study the abyss records to find the Abyss Lord''s weakness",
    "next_event": "sanctum_study_s7",
    "effects": {}
  },
  {
    "text": "Meditate to sharpen your resolve and clear your mind",
    "next_event": "sanctum_meditate_s7",
    "effects": {}
  },
  {
    "text": "Pray to your deity for strength and blessing",
    "next_event": "sanctum_pray_s7",
    "effects": {}
  }
]',
'{}'),

('sanctum_rest_s7', 'Restored',
'You press every wound closed and sleep for two hours. When you wake, your body feels whole again. The abyss gate still waits — but now so do you.',
'rest',
'[
  {
    "text": "Step up to the abyss gate",
    "next_event": "boss_007",
    "effects": { "hp": 999 }
  }
]',
'{}'),

('sanctum_study_s7', 'Knowledge Is Power',
'The abyss records describe the Abyss Lord''s one vulnerability: a brief window after each devastating attack when its guard drops. You memorize the pattern.',
'story',
'[
  {
    "text": "Knowing its weakness, you stride through the abyss gate",
    "next_event": "boss_007",
    "effects": { "experience": 50, "intelligence": 1 }
  }
]',
'{}'),

('sanctum_meditate_s7', 'Inner Clarity',
'Sitting cross-legged in the sanctum''s silence, you empty your mind of fear. When you open your eyes everything feels razor-sharp.',
'story',
'[
  {
    "text": "Mind clear, you step through the abyss gate",
    "next_event": "boss_007",
    "effects": { "experience": 40, "wisdom": 1 }
  }
]',
'{}'),

('sanctum_pray_s7', 'Divine Blessing',
'Kneeling before the healer''s altar, you speak a prayer. Light warms your hands briefly. Whether divine or imagined, you feel both braver and more persuasive.',
'story',
'[
  {
    "text": "Blessed, you walk through the abyss gate",
    "next_event": "boss_007",
    "effects": { "hp": 5, "charisma": 1, "experience": 40 }
  }
]',
'{}'),

-- ============================================================
-- FINAL COMBAT: ABYSS LORD (boss, 6 skill pts)
-- ============================================================

('boss_007', 'Final Battle: Abyss Lord',
'The abyss gate shatters. From black fire rises the Abyss Lord — commander of the cult, breaker of kingdoms, architect of every horror you have faced on this journey. It turns its gaze on you, and the air goes cold. This is the end — one way or another.',
'combat',
'[
  {
    "text": "Raise your weapon and face the Abyss Lord",
    "combat": {
      "enemy_id": "abyss_lord",
      "recommended_level": 3,
      "can_flee": false,
      "skill_points_reward": 6,
      "onVictoryEvent": "good_end_001",
      "onDefeatEvent": "bad_end_001"
    }
  }
]',
'{}'),

-- ============================================================
-- ENDINGS
-- ============================================================

('good_end_001', 'Good Ending: Dawn Over Emberfall',
'With a final strike the Abyss Lord shatters like black glass. The gate collapses. Light floods the sanctum. Emberfall is safe. You walk out of the ruins into morning sun, and across the frontier bards already compose the first verses of a legend bearing your name.',
'ending',
'[
  {
    "text": "Return to character selection",
    "effects": { "end_run": true }
  }
]',
'{}'),

('bad_end_001', 'Bad Ending: Journey''s End',
'Your wounds are too deep. The darkness swallows the last of your strength and the abyss claims your final breath. This journey ends here. The frontier still waits for a hero — but it will not be you. A new champion must rise.',
'ending',
'[
  {
    "text": "Accept fate and begin anew",
    "effects": { "delete_character": true }
  }
]',
'{}')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_type = EXCLUDED.event_type,
  options = EXCLUDED.options,
  requirements = EXCLUDED.requirements;
