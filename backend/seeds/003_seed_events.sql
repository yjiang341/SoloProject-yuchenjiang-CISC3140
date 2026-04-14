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

-- ============================================================
-- Second-level events (referenced by the events above)
-- ============================================================
INSERT INTO public.events (id, title, description, event_type, options, requirements) VALUES

-- === From crack_001 ===

('runes_001', 'Ancient Rune Lore',
'Your eyes trace the shifting patterns of the carved script. Slowly, meaning begins to emerge from the symbols. The runes describe the Abyss — a realm between worlds where lost souls are tested. They speak of trials, of power hidden within suffering, and of a way out for those strong enough to endure.

The final rune pulses brightest of all: a symbol meaning both "danger" and "opportunity." Beneath it, barely visible, is a carved handprint. An invitation, or a warning?',
'story',
'[
  {"text": "Memorize the runes and squeeze through into the cavern", "effects": {"event": "cavern_001", "stat_change": {"intelligence": 1}}, "requirements": {}},
  {"text": "Step back — this knowledge fills you with dread", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

('cavern_001', 'The Bioluminescent Cavern',
'You squeeze through the crack, rough stone cutting into your skin. The pain is quickly forgotten.

The cavern beyond stretches vast and strange. Enormous mushrooms pulse with soft blue and green light, their spores drifting like luminescent snow. Paths of glowing moss trace between them like roads. The air is thick and warm. Somewhere ahead, you hear the faint trickle of water.',
'story',
'[
  {"text": "Gather the glowing mushrooms for food and rest", "effects": {"event": "rest_001"}, "requirements": {}},
  {"text": "Follow the sound of water deeper in", "effects": {"event": "water_001"}, "requirements": {}},
  {"text": "Search for another passage out of the cavern", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "A cloaked silhouette materializes from the fungal haze", "effects": {"event": "shop_001"}, "requirements": {}}
]',
'{}'),

('touch_runes_001', 'The Runes React',
'The moment your fingertips press against the carved stone, a jolt of energy surges through your body. The runes pulse rapidly, cycling through colors — blue, gold, crimson. Visions crash through your mind: a vast darkness, towering shapes moving within it, countless eyes turning toward you.

Then silence. The runes fade to a dim glow. You lower your hand, heart hammering. Something has changed. You feel charged, aware in a way you were not before.',
'story',
'[
  {"text": "Push through the crack while the energy still fills you", "effects": {"event": "cavern_001", "stat_change": {"max_hp": 5}}, "requirements": {}},
  {"text": "Shake off the visions and step back", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

-- === From call_001 ===

('spider_peace_001', 'The Language of Clicks',
'You hold perfectly still and attempt to mimic the clicking, chittering sounds. The creatures pause, their pale eyes focusing on you. Your imitation is crude — a child babbling — but the intent seems to register.

The largest creature inches forward, its needle-teeth parting. A slow, deliberate sequence of clicks emerges. You cannot understand the words, but the aggression has softened into something closer to curiosity.',
'story',
'[
  {"text": "Continue attempting to communicate — slow gestures and soft sounds", "effects": {"event": "crack_001", "stat_change": {"charisma": 1}}, "requirements": {}},
  {"text": "Slowly back away without breaking eye contact", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Move quickly — this window will not last long", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

('play_dead_001', 'The Dead Man Gambit',
'You collapse to the ground and go utterly limp. The clicking and chittering grow louder as the creatures circle you. One prods you sharply with a hooked appendage — you bite down the pain and do not flinch.

After what feels like an eternity, the sounds begin to recede. Apparently, unmoving prey holds little interest for the creatures of the Abyss.',
'story',
'[
  {"text": "Remain still until every sound has faded, then move quickly", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Slowly rise and investigate where the creatures went", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

-- === From search_001 ===

('pouch_001', 'The Coin Pouch',
'You pry open the small leather pouch. Inside, tarnished coins gleam faintly — not the common gold of the surface world, but a dark metal stamped with symbols you do not recognize. Twenty-five of them.

Beneath the coins, wrapped in cloth, is a torn note. The handwriting is frantic: "For whoever finds this — the merchant at the crossroads is real. Find the crossroads."',
'story',
'[
  {"text": "Pocket the coins and continue searching", "effects": {"item": {"name": "Abyss Coins", "type": "currency", "gold": 25}, "event": "crack_001"}, "requirements": {}},
  {"text": "Leave the coins — they mean nothing here", "effects": {"event": "crack_001"}, "requirements": {}}
]',
'{}'),

('dagger_001', 'The Rusty Dagger',
'The blade is short and pitted with rust, but the edge still holds. You test it carefully — sharp enough. The handle is wrapped in cracked leather, and carved into the pommel is a small eye-like symbol. An amulet as much as a weapon.

It is not much. But in this darkness, not much is everything.',
'story',
'[
  {"text": "Take the dagger and prepare for whatever comes next", "effects": {"item": {"name": "Rusty Dagger", "type": "weapon", "attack": 3}, "event": "crack_001"}, "requirements": {}},
  {"text": "Leave it — a rusted blade might shatter at the worst moment", "effects": {"event": "crack_001"}, "requirements": {}}
]',
'{}'),

('stone_001', 'The Warm Stone',
'The stone is perfectly smooth and oval, radiating warmth that has no business existing in this frozen dark. As you turn it over in your palms, the warmth pulses — rhythmically. Like a heartbeat.

You grip it tighter and the pulse quickens. Almost like a response.',
'story',
'[
  {"text": "Keep the stone — something this strange may prove useful", "effects": {"item": {"name": "Pulsing Stone", "type": "misc", "description": "Radiates warmth and pulses like a heartbeat"}, "event": "crack_001"}, "requirements": {}},
  {"text": "Set it down carefully — you do not trust it", "effects": {"event": "crack_001"}, "requirements": {}}
]',
'{}'),

-- === From listen_001 ===

('water_001', 'The Underground Stream',
'You follow the dripping until you find a narrow stream cutting through the stone floor. The water is clear and faintly luminescent, casting soft ripples of light across the ceiling.

Along the bank, hand-carved holds are worn into the rock — someone has climbed here, perhaps many times.',
'story',
'[
  {"text": "Cup your hands and drink the glowing water", "effects": {"event": "cavern_001", "stat_change": {"hp": 10}}, "requirements": {}},
  {"text": "Follow the stream upstream toward its source", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Follow the stream downstream into the dark", "effects": {"event": "cavern_001"}, "requirements": {}}
]',
'{}'),

('rustle_001', 'Fabric in the Dark',
'You move silently toward the sound and find its source: an aged figure huddled in a shallow alcove, wrapped in tattered robes. Their breathing is shallow and labored. They are alive — barely.

As you inch closer, they stir. One eye opens and fixes on you. "You are real," they whisper. "Not a vision. You are real."',
'story',
'[
  {"text": "Approach carefully and offer what help you can", "effects": {"event": "crack_001", "stat_change": {"xp": 25}}, "requirements": {}},
  {"text": "Watch from a distance — frailty can be a trap", "effects": {"event": "start_001"}, "requirements": {}},
  {"text": "Quietly retreat — you cannot afford complications", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

('thrumming_001', 'The Deep Thrumming',
'You descend deeper, guided by the vibration resonating in your chest. The air grows warmer. The walls begin to glow a dull, pulsing red.

The source: an enormous door of black stone set into the deepest wall. Ancient mechanisms behind it produce the rhythmic sound. Seven identical locks seal it shut. Carved above the arch is a single phrase you somehow understand: "Those who knock shall be answered."',
'story',
'[
  {"text": "Examine the door and its seven locks closely", "effects": {"event": "crack_001", "stat_change": {"intelligence_check": true}}, "requirements": {}},
  {"text": "Knock on the door", "effects": {"event": "call_001"}, "requirements": {}},
  {"text": "This door unnerves you profoundly — retreat quickly", "effects": {"event": "start_001"}, "requirements": {}}
]',
'{}'),

-- === Rest aftermath events (from rest_001) ===

('rest_full_001', 'Fully Rested',
'You sleep deeply, and for once the dreams are not nightmares. When you wake, your body feels restored — aches gone, mind clear, wounds closed.

The Abyss waits. But you face it renewed.',
'story',
'[
  {"text": "Return to the starting chamber and make a new choice", "effects": {"event": "start_001"}, "requirements": {}},
  {"text": "Head toward the glowing crack", "effects": {"event": "crack_001"}, "requirements": {}}
]',
'{}'),

('rest_short_001', 'A Brief Respite',
'You allow yourself only enough rest to still your breathing and bind the worst of your wounds. The deep exhaustion remains, but you are steadier than before.',
'story',
'[
  {"text": "Press on — you have no more time to waste", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Try for a longer rest", "effects": {"event": "rest_001"}, "requirements": {}}
]',
'{}'),

('meditate_001', 'Focused Meditation',
'You sit in silence and turn inward. The chaos of the Abyss recedes. Your breath steadies, your mind clears, and deep within you feel the familiar warmth of restored power.

When you open your eyes, you are ready.',
'story',
'[
  {"text": "Rise and continue your journey", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Remain in meditation — there is more to find within", "effects": {"event": "rest_full_001", "stat_change": {"mp": "full"}}, "requirements": {}}
]',
'{}'),

('no_rest_001', 'Pressing On',
'Your body protests every step. Sleep is a luxury the Abyss does not offer.

You are exhausted, wounded, and alone. But you are still moving.',
'story',
'[
  {"text": "Head toward the glowing crack", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Call out — perhaps someone nearby can help", "effects": {"event": "call_001"}, "requirements": {}},
  {"text": "Search the ground for anything useful", "effects": {"event": "search_001"}, "requirements": {}}
]',
'{}'),

-- === Combat aftermath ===

('escape_spider_001', 'A Narrow Escape',
'You run — and the creatures are fast, but not fast enough. You scramble over rocks, duck through fissures, and finally throw yourself through a narrow gap in the stone.

The chittering recedes. You are bleeding and breathless, but alive.',
'story',
'[
  {"text": "Catch your breath, then continue toward the glowing crack", "effects": {"event": "crack_001"}, "requirements": {}},
  {"text": "Find somewhere to rest and recover", "effects": {"event": "rest_001"}, "requirements": {}}
]',
'{}')

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  event_type = EXCLUDED.event_type,
  options = EXCLUDED.options,
  requirements = EXCLUDED.requirements;

