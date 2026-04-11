/**
 * Guest Mode Game Configuration
 * Static data for character creation and events in guest mode (no backend needed)
 */

export const RACES = [
  { id: 'human', name: 'Human', description: 'Versatile and ambitious', abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 } },
  { id: 'elf', name: 'Elf', description: 'Graceful and long-lived', abilityBonuses: { dexterity: 2, intelligence: 1 } },
  { id: 'dwarf', name: 'Dwarf', description: 'Hardy and steadfast', abilityBonuses: { constitution: 2, wisdom: 1 } },
  { id: 'halfling', name: 'Halfling', description: 'Small but brave', abilityBonuses: { dexterity: 2, charisma: 1 } },
  { id: 'dragonborn', name: 'Dragonborn', description: 'Proud dragon-kin', abilityBonuses: { strength: 2, charisma: 1 } },
  { id: 'gnome', name: 'Gnome', description: 'Curious inventors', abilityBonuses: { intelligence: 2, constitution: 1 } },
  { id: 'half-elf', name: 'Half-Elf', description: 'Best of both worlds', abilityBonuses: { charisma: 2, dexterity: 1, constitution: 1 } },
  { id: 'half-orc', name: 'Half-Orc', description: 'Fierce warriors', abilityBonuses: { strength: 2, constitution: 1 } },
  { id: 'tiefling', name: 'Tiefling', description: 'Touched by the infernal', abilityBonuses: { charisma: 2, intelligence: 1 } }
]

export const CLASSES = [
  { id: 'barbarian', name: 'Barbarian', description: 'Fierce warriors fueled by rage', hitDie: 12, spellcaster: false, primaryStat: 'strength' },
  { id: 'bard', name: 'Bard', description: 'Inspiring performers and magicians', hitDie: 8, spellcaster: true, primaryStat: 'charisma' },
  { id: 'cleric', name: 'Cleric', description: 'Divine spellcasters and healers', hitDie: 8, spellcaster: true, primaryStat: 'wisdom' },
  { id: 'druid', name: 'Druid', description: 'Nature-wielding shapeshifters', hitDie: 8, spellcaster: true, primaryStat: 'wisdom' },
  { id: 'fighter', name: 'Fighter', description: 'Masters of martial combat', hitDie: 10, spellcaster: false, primaryStat: 'strength' },
  { id: 'monk', name: 'Monk', description: 'Martial artists with ki powers', hitDie: 8, spellcaster: false, primaryStat: 'dexterity' },
  { id: 'paladin', name: 'Paladin', description: 'Holy warriors bound by oath', hitDie: 10, spellcaster: true, primaryStat: 'strength' },
  { id: 'ranger', name: 'Ranger', description: 'Skilled hunters and trackers', hitDie: 10, spellcaster: true, primaryStat: 'dexterity' },
  { id: 'rogue', name: 'Rogue', description: 'Stealthy and cunning tricksters', hitDie: 8, spellcaster: false, primaryStat: 'dexterity' },
  { id: 'sorcerer', name: 'Sorcerer', description: 'Born with innate magic', hitDie: 6, spellcaster: true, primaryStat: 'charisma' },
  { id: 'warlock', name: 'Warlock', description: 'Pact-bound magic wielders', hitDie: 8, spellcaster: true, primaryStat: 'charisma' },
  { id: 'wizard', name: 'Wizard', description: 'Learned arcane scholars', hitDie: 6, spellcaster: true, primaryStat: 'intelligence' }
]

export const STAT_NAMES = [
  { key: 'strength', name: 'Strength', abbr: 'STR' },
  { key: 'dexterity', name: 'Dexterity', abbr: 'DEX' },
  { key: 'constitution', name: 'Constitution', abbr: 'CON' },
  { key: 'intelligence', name: 'Intelligence', abbr: 'INT' },
  { key: 'wisdom', name: 'Wisdom', abbr: 'WIS' },
  { key: 'charisma', name: 'Charisma', abbr: 'CHA' }
]

export const BASE_STATS = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10
}

export const EVENTS_DATA = {
  'start_awakening': {
    id: 'start_awakening',
    title: 'The Awakening',
    description: 'You awaken in a cold, damp dungeon cell. The flickering torchlight casts dancing shadows on the moss-covered stone walls. Your memories are fragmented—you remember only your name and a strange symbol burned into your mind.\n\nThrough the rusted bars of your cell, you see a corridor stretching into darkness. A ring of ancient keys lies just beyond your reach on the floor...',
    event_type: 'story',
    options: [
      { text: 'Try to reach the keys through the bars', next_event: 'reach_keys', stat_check: { stat: 'dexterity', dc: 10 }, failureEvent: 'reach_keys_fail' },
      { text: 'Call out for help', next_event: 'call_help' },
      { text: 'Examine the cell for another way out', next_event: 'examine_cell', stat_check: { stat: 'intelligence', dc: 8 }, failureEvent: 'examine_cell_fail' },
      { text: 'Try to break the rusty bars with brute force', next_event: 'break_bars', stat_check: { stat: 'strength', dc: 14 }, failureEvent: 'break_bars_fail' }
    ]
  },
  'reach_keys': {
    id: 'reach_keys',
    title: 'Desperate Grasp',
    description: 'You press yourself against the cold bars, stretching your arm as far as it will go. Your fingers brush against the cold metal of the key ring... and you grab it!\n\nWith trembling hands, you unlock your cell. Freedom at last, but the dungeon still surrounds you.',
    event_type: 'story',
    options: [
      { text: 'Head toward the faint light in the corridor', next_event: 'toward_light' },
      { text: 'Descend deeper into the darkness', next_event: 'into_darkness' },
      { text: 'Search the nearby cells first', next_event: 'search_cells' }
    ]
  },
  'reach_keys_fail': {
    id: 'reach_keys_fail',
    title: 'So Close',
    description: 'Your fingers brush against the keys, but you cannot quite reach them. The noise of your struggle echoes through the corridor.\n\nFrom somewhere in the darkness, you hear shuffling footsteps approaching...',
    event_type: 'story',
    options: [
      { text: 'Hide in the shadows and wait', next_event: 'guard_approaches' },
      { text: 'Try again more carefully', next_event: 'reach_keys', stat_check: { stat: 'dexterity', dc: 12 }, failureEvent: 'guard_alerted' },
      { text: 'Prepare to fight', next_event: 'guard_alerted' }
    ]
  },
  'call_help': {
    id: 'call_help',
    title: 'Echoes in the Dark',
    description: 'Your voice echoes through the stone corridors. For a long moment, there is only silence. Then, from somewhere deep in the dungeon, you hear shuffling footsteps approaching...',
    event_type: 'story',
    options: [
      { text: 'Hide in the shadows of your cell', next_event: 'hide_cell', stat_check: { stat: 'dexterity', dc: 12 }, failureEvent: 'guard_alerted' },
      { text: 'Prepare to fight whatever comes', next_event: 'guard_alerted' },
      { text: 'Call out again, claiming to be a friend', next_event: 'diplomacy_attempt', stat_check: { stat: 'charisma', dc: 13 }, failureEvent: 'guard_alerted' }
    ]
  },
  'examine_cell': {
    id: 'examine_cell',
    title: 'Careful Observation',
    description: 'You study every inch of your prison. The mortar between the stones is old and crumbling in places. Behind a loose stone near the floor, you discover a narrow tunnel carved into the rock!\n\nAncient runes are carved along its walls, pulsing with a faint violet light.',
    event_type: 'story',
    options: [
      { text: 'Enter the mysterious tunnel', next_event: 'hidden_passage' },
      { text: 'Study the runes first', next_event: 'study_runes', stat_check: { stat: 'intelligence', dc: 14 }, failureEvent: 'runes_mystery' },
      { text: 'Ignore it and try for the keys instead', next_event: 'reach_keys' }
    ]
  },
  'examine_cell_fail': {
    id: 'examine_cell_fail',
    title: 'Nothing But Stone',
    description: 'You search the cell thoroughly, but find nothing useful. The walls are solid, the floor is bare, and hope seems distant.\n\nBut wait—you notice the keys lying just outside your cell...',
    event_type: 'story',
    options: [
      { text: 'Try to reach the keys', next_event: 'reach_keys', stat_check: { stat: 'dexterity', dc: 10 }, failureEvent: 'reach_keys_fail' },
      { text: 'Call out for help', next_event: 'call_help' }
    ]
  },
  'break_bars': {
    id: 'break_bars',
    title: 'Raw Power',
    description: 'You grip the rusted bars and pull with all your might. The ancient metal groans in protest... and then gives way with a satisfying screech!\n\nYou step through the gap you created, ready to face whatever lies ahead. The noise was considerable—you should move quickly.',
    event_type: 'story',
    options: [
      { text: 'Rush toward the light', next_event: 'toward_light' },
      { text: 'Move quietly into the shadows', next_event: 'into_darkness' }
    ]
  },
  'break_bars_fail': {
    id: 'break_bars_fail',
    title: 'Stubborn Steel',
    description: 'Despite your efforts, the bars hold firm. Your hands ache from the attempt, and the noise has attracted attention.\n\nYou hear heavy footsteps approaching from the corridor...',
    event_type: 'story',
    options: [
      { text: 'Hide and prepare an ambush', next_event: 'guard_ambush', effects: { hp: -2 } },
      { text: 'Face the approaching threat', next_event: 'guard_alerted' }
    ]
  },
  'toward_light': {
    id: 'toward_light',
    title: 'The Light Above',
    description: 'You creep toward the light, your bare feet silent on the cold stone. The corridor opens into a guard room. Two guards sit at a table, playing dice, their weapons leaning against the wall.\n\nA heavy wooden door leads outside—you can see moonlight through its cracks.',
    event_type: 'story',
    options: [
      { text: 'Try to sneak past them', next_event: 'sneak_guards', stat_check: { stat: 'dexterity', dc: 14 }, failureEvent: 'guards_combat' },
      { text: 'Create a distraction', next_event: 'distraction', stat_check: { stat: 'intelligence', dc: 12 }, failureEvent: 'guards_combat' },
      { text: 'Attack while they are distracted', next_event: 'guards_combat' },
      { text: 'Go back and try the other path', next_event: 'into_darkness' }
    ]
  },
  'into_darkness': {
    id: 'into_darkness',
    title: 'The Abyss Calls',
    description: 'You descend the stairs, leaving what little light remained behind. The darkness here is absolute—you can feel it pressing against you like a physical force.\n\nStrange whispers seem to echo from the walls, speaking in a language you cannot understand... yet somehow, you know they are speaking to you.',
    event_type: 'story',
    options: [
      { text: 'Follow the whispers', next_event: 'follow_whispers' },
      { text: 'Try to make a torch', next_event: 'make_torch', stat_check: { stat: 'wisdom', dc: 11 }, failureEvent: 'lost_in_dark' },
      { text: 'Feel your way along the wall', next_event: 'feel_wall' },
      { text: 'Return to the corridor above', next_event: 'toward_light' }
    ]
  },
  'guard_alerted': {
    id: 'guard_alerted',
    title: 'Unwanted Attention',
    description: 'A hulking figure emerges from the shadows—a dungeon guard, more beast than man, with pale skin and milky eyes. It sniffs the air and turns toward your cell, drawing a jagged blade.\n\n"Trying to escape, are we?" it growls.',
    event_type: 'combat',
    options: [
      { text: 'Fight the guard', next_event: 'guard_victory', effects: { hp: -5, gold: 15, experience: 50 } },
      { text: 'Try to talk your way out', next_event: 'talk_guard', stat_check: { stat: 'charisma', dc: 15 }, failureEvent: 'guard_attacks' },
      { text: 'Play dead', next_event: 'play_dead', stat_check: { stat: 'wisdom', dc: 12 }, failureEvent: 'guard_attacks' }
    ]
  },
  'guard_victory': {
    id: 'guard_victory',
    title: 'Victory',
    description: 'The guard falls before you, its pale blood pooling on the stone floor. As it dies, it whispers something in an ancient tongue—a warning, perhaps, or a curse.\n\nYou claim its weapon and what few coins it carried. The path ahead is now clear.',
    event_type: 'reward',
    options: [
      { text: 'Continue exploring', next_event: 'toward_light', effects: { item: 'jagged_blade' } }
    ]
  },
  'hidden_passage': {
    id: 'hidden_passage',
    title: 'Secret Way',
    description: 'The tunnel is barely wide enough to squeeze through. Ancient runes pulse with violet light along the walls, and you feel a strange energy thrumming through the stone.\n\nAfter what feels like hours of crawling, you emerge into a vast underground chamber lit by glowing crystals.',
    event_type: 'story',
    options: [
      { text: 'Explore the chamber', next_event: 'crystal_chamber' },
      { text: 'Touch the glowing crystals', next_event: 'touch_crystals', stat_check: { stat: 'wisdom', dc: 13 }, failureEvent: 'crystal_shock' },
      { text: 'Look for another exit', next_event: 'chamber_exit' }
    ]
  },
  'follow_whispers': {
    id: 'follow_whispers',
    title: 'The Truth Beckons',
    description: 'You surrender to the whispers, letting them guide you through the darkness. Step by step, turn by turn, deeper and deeper.\n\nFinally, you emerge into a vast underground chamber lit by crystals that glow with an otherworldly light. In the center stands an altar, and upon it rests a tome bound in dark leather—the cover bears the same symbol from your fragmented memories.',
    event_type: 'story',
    options: [
      { text: 'Approach and open the tome', next_event: 'open_tome' },
      { text: 'Examine the chamber for traps first', next_event: 'check_chamber', stat_check: { stat: 'wisdom', dc: 13 }, failureEvent: 'trap_triggered' },
      { text: 'This feels wrong. Leave immediately.', next_event: 'flee_chamber' }
    ]
  },
  'open_tome': {
    id: 'open_tome',
    title: 'Truth of the Abyss',
    description: 'As your fingers touch the ancient leather, knowledge floods your mind. You see visions of a great war between light and darkness, of a prison dimension called the Abyss, of souls trapped for eternity.\n\nYou understand now—you are not merely a prisoner of this dungeon. You are a soul that escaped the Abyss itself, and the forces that imprisoned you are hunting you still.\n\nThe tome offers you dark power... but at what cost?',
    event_type: 'story',
    options: [
      { text: 'Accept the power of the Abyss', next_event: 'accept_power', effects: { mp: 20, intelligence: 2 } },
      { text: 'Reject the darkness within', next_event: 'reject_power', effects: { wisdom: 2, charisma: 1 } },
      { text: 'Take the tome to study later', next_event: 'take_tome', effects: { item: 'tome_of_abyss' } }
    ]
  },
  'accept_power': {
    id: 'accept_power',
    title: 'Embrace the Dark',
    description: 'Dark energy surges through you as you accept the power offered by the Abyss. Your eyes flash with violet light, and you feel ancient knowledge settling into your mind.\n\nYou have gained magical abilities, but something within you has changed forever. The whispers are louder now, and they sound almost... pleased.',
    event_type: 'reward',
    options: [
      { text: 'Continue your journey', next_event: 'dungeon_exit', effects: { experience: 100 } }
    ]
  },
  'reject_power': {
    id: 'reject_power',
    title: 'Strength of Will',
    description: 'You push back against the seductive whispers of power. It takes every ounce of willpower, but you refuse to let the Abyss claim any more of you.\n\nThe tome crumbles to dust in your hands, and you feel... lighter somehow. The whispers fade to silence, and for the first time since awakening, you feel truly free.',
    event_type: 'reward',
    options: [
      { text: 'Continue your journey', next_event: 'dungeon_exit', effects: { experience: 100 } }
    ]
  },
  'dungeon_exit': {
    id: 'dungeon_exit',
    title: 'Freedom',
    description: 'You find your way out of the dungeon at last. The night air is cold but fresh, and the stars shine bright above you.\n\nYou stand at the edge of a vast forest. In the distance, you can see the lights of a village. Your adventure has only just begun...\n\n[End of Chapter 1 - To be continued]',
    event_type: 'story',
    options: [
      { text: 'Start over with a new character', next_event: 'start_awakening' }
    ]
  },
  'search_cells': {
    id: 'search_cells',
    title: 'Fellow Prisoners',
    description: 'You check the nearby cells. Most are empty, but in one you find the skeletal remains of a prisoner who did not escape. Clutched in its bony fingers is a small pouch.\n\nInside, you find a few gold coins and a rusty dagger.',
    event_type: 'reward',
    options: [
      { text: 'Continue exploring', next_event: 'toward_light', effects: { gold: 25, item: 'rusty_dagger' } }
    ]
  },
  'sneak_guards': {
    id: 'sneak_guards',
    title: 'Silent as Shadow',
    description: 'Moving with practiced grace, you slip past the guards. Their dice game holds their full attention as you silently lift the bar on the door and slip outside.\n\nThe cool night air greets you as you step into freedom.',
    event_type: 'story',
    options: [
      { text: 'Continue to freedom', next_event: 'dungeon_exit', effects: { experience: 75 } }
    ]
  },
  'guards_combat': {
    id: 'guards_combat',
    title: 'Desperate Fight',
    description: 'The guards spot you and leap to their feet, grabbing their weapons. "Prisoner loose!" one shouts.\n\nYou have no choice but to fight your way through. The battle is fierce, but you emerge victorious, though not unscathed.',
    event_type: 'combat',
    options: [
      { text: 'Escape through the door', next_event: 'dungeon_exit', effects: { hp: -8, gold: 30, experience: 100, item: 'guard_sword' } }
    ]
  }
}
