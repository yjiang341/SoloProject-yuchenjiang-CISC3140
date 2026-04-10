-- Seed initial game events
INSERT INTO public.events (id, title, description, event_type, options, requirements) VALUES

-- Starting event
('start_001', 'The Awakening', 
'You awaken in complete darkness. The cold stone beneath you sends shivers through your body. As your eyes adjust, you notice a faint glow emanating from a crack in the wall to your left. The air is thick with the scent of decay and something... ancient. You hear distant echoes - perhaps footsteps, perhaps something else entirely.

A voice whispers in your mind: "Welcome to the Abyss, traveler. Your journey begins now."',
'story',
'[
  {"text": "Investigate the glowing crack", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Call out into the darkness", "effects": {"event": "call_001", "stat_change": {"charisma_check": true}}, "requirements": {}},
  {"text": "Feel around for any objects nearby", "effects": {"event": "search_001"}, "requirements": {}},
  {"text": "Sit still and listen carefully", "effects": {"event": "listen_001", "stat_change": {"wisdom_check": true}}, "requirements": {}}
]',
'{}'),

-- Crack investigation
('crack_001', 'The Glowing Fissure',
'You approach the crack cautiously. The glow intensifies as you near, revealing ancient runes carved into the stone. They pulse with an otherworldly energy. Through the crack, you glimpse what appears to be a vast cavern filled with bioluminescent fungi.

The runes seem to react to your presence, shifting and changing before your eyes.',
'story',
'[
  {"text": "Try to read the runes", "effects": {"event": "runes_001", "stat_change": {"intelligence_check": true}}, "requirements": {}},
  {"text": "Squeeze through the crack", "effects": {"event": "cavern_001", "stat_change": {"hp": -5}}, "requirements": {}},
  {"text": "Touch the glowing runes", "effects": {"event": "touch_runes_001"}, "requirements": {}},
  {"text": "Step back and reconsider", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

-- Call out event
('call_001', 'Echoes in the Dark',
'Your voice echoes through the darkness, bouncing off unseen walls. For a moment, there is only silence. Then, you hear it - a response. Not words, but a series of clicks and chittering sounds, growing closer.

Multiple points of light appear in the darkness - eyes, reflecting what little light exists.',
'story',
'[
  {"text": "Prepare to fight", "effects": {"event": "combat_spider_001"}, "requirements": {}},
  {"text": "Try to communicate peacefully", "effects": {"event": "spider_peace_001", "stat_change": {"charisma_check": true}}, "requirements": {}},
  {"text": "Run toward the glowing crack", "effects": {"event": "crack_001", "stat_change": {"dexterity_check": true}}, "requirements": {}},
  {"text": "Play dead", "effects": {"event": "play_dead_001"}, "requirements": {}}
]',
'{}'),

-- Search event
('search_001', 'Hidden Treasures',
'Your hands sweep across the cold stone floor. You find several objects: a small pouch that jingles with coins, what feels like a dagger, and a smooth stone that seems warm to the touch.

As you collect these items, you notice the air growing colder.',
'story',
'[
  {"text": "Examine the pouch", "effects": {"item": {"name": "Coin Pouch", "gold": 25}, "event": "pouch_001"}, "requirements": {}},
  {"text": "Take the dagger", "effects": {"item": {"name": "Rusty Dagger", "type": "weapon", "attack": 3}, "event": "dagger_001"}, "requirements": {}},
  {"text": "Investigate the warm stone", "effects": {"event": "stone_001", "stat_change": {"intelligence_check": true}}, "requirements": {}},
  {"text": "Take everything and move on", "effects": {"items": [{"name": "Coin Pouch", "gold": 15}, {"name": "Rusty Dagger", "type": "weapon", "attack": 3}, {"name": "Mysterious Stone", "type": "misc"}], "event": "crack_001"}, "requirements": {}}
]',
'{}'),

-- Listen event
('listen_001', 'Whispers of the Abyss',
'You close your eyes and focus on the sounds around you. Beyond the immediate echoes, you begin to distinguish patterns. Dripping water to your north. The soft rustle of... fabric? To your east. And beneath it all, a low, rhythmic thrumming that seems to come from deep below.

Your heightened awareness reveals more about your surroundings.',
'story',
'[
  {"text": "Follow the sound of water", "effects": {"event": "water_001"}, "requirements": {}},
  {"text": "Investigate the rustling sound", "effects": {"event": "rustle_001"}, "requirements": {}},
  {"text": "Try to locate the source of the thrumming", "effects": {"event": "thrumming_001", "stat_change": {"wisdom": 1}}, "requirements": {}},
  {"text": "The sounds unnerve you - head toward the light", "effects": {"event": "crack_001"}, "requirements": {}}
]',
'{}'),

-- Combat event example
('combat_spider_001', 'Abyss Crawlers Attack!',
'Three spider-like creatures emerge from the shadows. Their bodies are pale and eyeless, but rows of needle-like teeth glisten with venom. They move with unsettling coordination, surrounding you.

COMBAT INITIATED: Abyss Crawlers (3)',
'combat',
'[
  {"text": "Attack aggressively", "effects": {"combat": {"enemy": "abyss_crawler", "count": 3, "strategy": "aggressive"}}, "requirements": {}},
  {"text": "Fight defensively", "effects": {"combat": {"enemy": "abyss_crawler", "count": 3, "strategy": "defensive"}}, "requirements": {}},
  {"text": "Try to escape", "effects": {"event": "escape_spider_001", "stat_change": {"dexterity_check": true}}, "requirements": {}},
  {"text": "Use an item", "effects": {"open_inventory": true, "combat": {"enemy": "abyss_crawler", "count": 3}}, "requirements": {}}
]',
'{}'),

-- Shop event example
('shop_001', 'The Wandering Merchant',
'A cloaked figure materializes from the shadows, their face hidden beneath a hood. They spread their hands, and various items float in the air before you, each glowing with a soft light.

"Welcome, traveler," the figure speaks in a voice like grinding stone. "I deal in goods both mundane and... unusual. What catches your eye?"',
'shop',
'[
  {"text": "Browse weapons", "effects": {"shop_category": "weapons"}, "requirements": {}},
  {"text": "Browse armor", "effects": {"shop_category": "armor"}, "requirements": {}},
  {"text": "Browse potions", "effects": {"shop_category": "consumables"}, "requirements": {}},
  {"text": "Ask about rare items", "effects": {"shop_category": "rare", "stat_change": {"charisma_check": true}}, "requirements": {}},
  {"text": "Leave the merchant", "effects": {"event": "merchant_leave_001"}, "requirements": {}}
]',
'{}'),

-- Rest event example
('rest_001', 'A Moment of Respite',
'You find a small alcove that seems defensible. The stone here is dry, and strange moss provides a soft surface. You could rest here, but the Abyss never truly sleeps.

Your body aches for rest, but danger could lurk around any corner.',
'rest',
'[
  {"text": "Take a full rest (restore all HP/MP)", "effects": {"rest": "full", "stat_change": {"hp": "full", "mp": "full"}, "event": "rest_full_001"}, "requirements": {}},
  {"text": "Take a short rest (restore 25% HP)", "effects": {"rest": "short", "stat_change": {"hp_percent": 25}, "event": "rest_short_001"}, "requirements": {}},
  {"text": "Meditate (restore MP only)", "effects": {"rest": "meditate", "stat_change": {"mp": "full"}, "event": "meditate_001"}, "requirements": {}},
  {"text": "Keep moving - no time to rest", "effects": {"event": "no_rest_001"}, "requirements": {}}
]',
'{}')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_type = EXCLUDED.event_type,
  options = EXCLUDED.options,
  requirements = EXCLUDED.requirements;
