import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import {
  getCharacter,
  updateCharacter,
  deleteCharacter,
  getCharacterInventory,
  addItemToInventory,
  createSave,
  updateSave,
  getLatestSave,
} from '@/lib/api'
import { getAbilityModifierLocal, savingThrow } from '@/lib/game-mechanics'
import GameSidebar from '@/components/game/game-sidebar'
import EventPanel from '@/components/game/event-panel'
import CombatPanel from '@/components/game/combat-panel'
import InventoryPanel from '@/components/game/inventory-panel'
import SkillPointModal from '@/components/game/skill-point-modal'
import EquipmentPanel from '@/components/game/equipment-panel'
import '@/styles/GamePage.css'

// D&D 5e API item lists for treasure events
const NORMAL_ITEMS = ['dagger', 'handaxe', 'javelin', 'light-crossbow', 'shortbow', 'shortsword', 'leather-armor', 'studded-leather-armor', 'padded-armor']
const RARE_ITEMS = ['longsword', 'rapier', 'battleaxe', 'greataxe', 'greatsword', 'war-pick', 'flail', 'glaive', 'chain-mail', 'breastplate', 'half-plate', 'splint', 'scale-mail']

const STORY_ITEM_OVERRIDES = {
  'potion-of-healing': {
    item_type: 'consumable',
    properties: { consumable: true, use_effect: { hp: 10 } },
  },
  antitoxin: {
    item_type: 'consumable',
    properties: { consumable: true, use_effect: { clear_status: true } },
  },
  shield: {
    item_type: 'armor',
    properties: { slot: 'off_hand', stat_bonus: { ac_bonus: 2 }, ac_base: 12 },
  },
  'chain-shirt': {
    item_type: 'armor',
    properties: { slot: 'chest', stat_bonus: { ac_bonus: 3 }, ac_base: 13 },
  },
}

function inferStoryItemType(itemId) {
  const key = (itemId || '').toLowerCase()

  if (key.includes('potion') || key.includes('healing') || key.includes('food') || key.includes('ration') || key.includes('antitoxin') || key.includes('lockpick') || key.includes('supply')) {
    return 'consumable'
  }
  if (key.includes('armor') || key.includes('mail') || key.includes('shield') || key.includes('helm') || key.includes('boots')) {
    return 'armor'
  }
  if (key.includes('sword') || key.includes('axe') || key.includes('bow') || key.includes('dagger') || key.includes('mace') || key.includes('spear')) {
    return 'weapon'
  }

  return 'misc'
}

function buildStoryRewardItem(itemId) {
  const override = STORY_ITEM_OVERRIDES[itemId]
  const item_type = override?.item_type || inferStoryItemType(itemId)
  const properties = { ...(override?.properties || {}) }

  if (item_type === 'weapon' && !properties.slot) properties.slot = 'main_hand'
  if (item_type === 'armor' && !properties.slot) {
    const k = itemId.toLowerCase()
    if (k.includes('shield') || k.includes('buckler')) properties.slot = 'off_hand'
    else if (k.includes('helm') || k.includes('hat') || k.includes('hood') || k.includes('cap') || k.includes('coif') || k.includes('crown')) properties.slot = 'helmet'
    else if (k.includes('greave') || k.includes('leg') || k.includes('chausses') || k.includes('tasset')) properties.slot = 'legs'
    else if (k.includes('boot') || k.includes('sabatons') || k.includes('shoe') || k.includes('sandal')) properties.slot = 'boots'
    else properties.slot = 'chest' // default: breastplate, mail, armor, etc.
  }
  if (item_type === 'consumable') properties.consumable = true

  if (!properties.allowed_slots) {
    const k = itemId.toLowerCase()
    if (item_type === 'weapon' || item_type === 'misc' || k.includes('shield') || k.includes('buckler') || k.includes('torch') || k.includes('lantern')) {
      properties.allowed_slots = ['main_hand', 'off_hand']
    } else if (item_type === 'accessory') {
      properties.allowed_slots = ['ring']
    } else if (properties.slot) {
      properties.allowed_slots = [properties.slot]
    }
  }

  return {
    item_id: itemId,
    item_name: itemId.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    item_type,
    quantity: 1,
    properties,
  }
}

// Map D&D API equipment categories to inventory item_type and slot
// D&D 5e API armor_category values: 'Light', 'Medium', 'Heavy', 'Shield'
function mapDnDItemToInventory(apiItem) {
  const category = apiItem.equipment_category?.index || 'adventuring-gear'
  let item_type = 'misc'
  let slot = null
  let stat_bonus = {}

  if (category === 'weapon') {
    item_type = 'weapon'
    const twoHanded = apiItem.properties?.some(p => p.index === 'two-handed')
    // Two-handed weapons must go in main hand; daggers/handaxes can go off-hand but default main
    slot = twoHanded ? 'main_hand' : 'main_hand'
    const dmg = apiItem.damage?.damage_dice || '1d6'
    stat_bonus = { damage: dmg }
  } else if (category === 'armor') {
    item_type = 'armor'
    const armorCat = apiItem.armor_category || ''
    if (armorCat === 'Shield') {
      // Shields are held in the off hand, not worn
      slot = 'off_hand'
    } else {
      // Light/Medium/Heavy → body slot by item name heuristics
      const idx = (apiItem.index || '').toLowerCase()
      if (idx.includes('helm') || idx.includes('cap') || idx.includes('hood') || idx.includes('hat') || idx.includes('coif')) {
        slot = 'helmet'
      } else if (idx.includes('boot') || idx.includes('sabaton') || idx.includes('shoe') || idx.includes('sandal')) {
        slot = 'boots'
      } else if (idx.includes('greave') || idx.includes('chausses') || idx.includes('tasset') || idx.includes('leg')) {
        slot = 'legs'
      } else {
        slot = 'chest' // breastplate, chain mail, leather armor, scale mail, splint, plate, etc.
      }
    }
    const base = apiItem.armor_class?.base || 11
    stat_bonus = { ac_bonus: base - 10 }
  }

  return {
    item_id: apiItem.index,
    item_name: apiItem.name,
    item_type,
    quantity: 1,
    properties: {
      allowed_slots:
        item_type === 'weapon'
          ? ['main_hand', 'off_hand']
          : item_type === 'armor' && slot === 'off_hand'
            ? ['main_hand', 'off_hand']
            : slot
              ? [slot]
              : undefined,
      slot,
      stat_bonus,
      description: apiItem.desc?.[0] || '',
      damage: item_type === 'weapon' ? (apiItem.damage?.damage_dice || '1d6') : undefined,
      ac_base: item_type === 'armor' ? apiItem.armor_class?.base : undefined,
      rarity: RARE_ITEMS.includes(apiItem.index) ? 'rare' : 'normal',
      weight: apiItem.weight,
      cost: apiItem.cost ? `${apiItem.cost.quantity} ${apiItem.cost.unit}` : undefined,
    },
  }
}

async function fetchTreasureItem() {
  const isRare = Math.random() < 0.7
  const list = isRare ? RARE_ITEMS : NORMAL_ITEMS
  const index = list[Math.floor(Math.random() * list.length)]
  try {
    const res = await fetch(`https://www.dnd5eapi.co/api/equipment/${index}`)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return { item: mapDnDItemToInventory(data), isRare }
  } catch {
    // Fallback item if API fails
    return {
      item: {
        item_id: index,
        item_name: index.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        item_type: isRare ? 'weapon' : 'armor',
        quantity: 1,
        properties: { slot: isRare ? 'main_hand' : 'chest', stat_bonus: {}, rarity: isRare ? 'rare' : 'normal' },
      },
      isRare,
    }
  }
}

// Fallback events (from backend services config)
const fallbackEvents = {
  start_001: {
    id: 'start_001',
    title: 'The Awakening',
    description: 'You awaken on damp stone beneath the ruined watchtower of Black Hollow. Wind howls through broken arches while dawn paints the horizon. A battered satchel lies nearby and a worn road leads toward the frontier village. You must choose how to begin.',
    event_type: 'story',
    options: [
      { text: 'Take the satchel quietly and slip away before anyone notices', next_event: 'satchel_s1', effects: {} },
      { text: 'Search the watchtower ruins carefully for useful supplies', next_event: 'search_s1', effects: {} },
      { text: 'Rest briefly on the cold stone to clear your aching head', next_event: 'rest_s1', effects: {} },
    ],
  },
  satchel_s1: {
    id: 'satchel_s1',
    title: 'The Satchel',
    description: 'Inside the satchel you find a healing draught, a tattered map, and 15 gold coins tied in cloth.',
    event_type: 'story',
    options: [
      { text: 'Pocket the supplies and head down the road toward Emberfall', next_event: 'road_002', effects: { gold: 15, item: 'potion-of-healing' } },
    ],
  },
  search_s1: {
    id: 'search_s1',
    title: 'Among the Rubble',
    description: 'Beneath a collapsed wall you uncover a sealed box with 25 gold coins and old rations.',
    event_type: 'story',
    options: [
      { text: 'Take the findings and press on toward Emberfall', next_event: 'road_002', effects: { gold: 25, experience: 15 } },
    ],
  },
  rest_s1: {
    id: 'rest_s1',
    title: 'Brief Respite',
    description: 'You rest for a few minutes. Pain recedes, clarity returns. You find 10 gold wedged under a loose stone.',
    event_type: 'rest',
    options: [
      { text: 'Refreshed, set out toward Emberfall', next_event: 'road_002', effects: { hp: 5, gold: 10 } },
    ],
  },
  road_002: {
    id: 'road_002',
    title: 'Road To Emberfall',
    description: 'A militia scout named Tamsin warns that abyss-tainted wolves have cut off the supply trail. Emberfall will starve without it cleared. How will you approach?',
    event_type: 'story',
    options: [
      { text: 'Accept and take the direct trail — meet them head-on', next_event: 'ambush_003', effects: { experience: 20 } },
      { text: 'Scout the trail from a distance before engaging', next_event: 'scout_s2', effects: {} },
      { text: 'Ask Tamsin for a full enemy briefing before moving', next_event: 'intel_s2', effects: {} },
      { text: 'Lay rope-and-spike traps along the trail first', next_event: 'traps_s2', effects: {} },
    ],
  },
  scout_s2: {
    id: 'scout_s2',
    title: 'Scouting the Trail',
    description: 'You count the pack: eight wolves across two choke-points. Your vantage gives tactical awareness.',
    event_type: 'story',
    options: [
      { text: 'With their positions mapped, advance to clear the trail', next_event: 'ambush_003', effects: { experience: 15 } },
    ],
  },
  intel_s2: {
    id: 'intel_s2',
    title: "Tamsin's Briefing",
    description: 'Tamsin draws a hasty map and hands you a vial of anti-toxin as a precaution.',
    event_type: 'story',
    options: [
      { text: 'Armed with knowledge, advance to clear the trail', next_event: 'ambush_003', effects: { experience: 15, item: 'antitoxin' } },
    ],
  },
  traps_s2: {
    id: 'traps_s2',
    title: 'Laying Traps',
    description: 'Rope loops and sharpened stakes take an hour. The wolves trigger two traps immediately — they are wounded before true combat begins.',
    event_type: 'story',
    options: [
      { text: 'Drive them into your trap lines and finish the fight', next_event: 'ambush_003', effects: { experience: 15 } },
    ],
  },
  ambush_003: {
    id: 'ambush_003',
    title: 'Trail Ambush',
    description: 'A pack of abyss wolves leaps from the reeds. Their eyes burn with void-light.',
    event_type: 'combat',
    options: [
      {
        text: 'Stand your ground and fight the wolves',
        combat: {
          enemy_id: 'abyss_wolf_pack',
          recommended_level: 1,
          can_flee: false,
          skill_points_reward: 2,
          onVictoryEvent: 'ruins_004',
          onDefeatEvent: 'bad_end_001',
        },
      },
    ],
  },
  ruins_004: {
    id: 'ruins_004',
    title: 'Ruins Of The Order',
    description: 'Inside a collapsed chapel you discover a training codex, an armory cache, ancient inscriptions, and a quiet corner for rest. What will you focus on?',
    event_type: 'reward',
    options: [
      { text: 'Claim the training codex and armory cache', next_event: 'ruins_loot_s4', effects: {} },
      { text: 'Search deeper in the ruins for hidden relics', next_event: 'ruins_deep_s4', effects: {} },
      { text: 'Study the ancient inscriptions on the walls', next_event: 'ruins_study_s4', effects: {} },
      { text: 'Set a brief camp and recover your strength', next_event: 'ruins_camp_s4', effects: {} },
    ],
  },
  ruins_loot_s4: {
    id: 'ruins_loot_s4',
    title: 'The Armory Cache',
    description: 'The codex sharpens your strikes; the cache yields a steel shield still sturdy after years of neglect.',
    event_type: 'reward',
    options: [
      { text: 'Claim the shield and press forward to the treasure vault', next_event: 'treasure_005', effects: { strength: 1, constitution: 1, experience: 60, item: 'shield' } },
    ],
  },
  ruins_deep_s4: {
    id: 'ruins_deep_s4',
    title: 'Deeper Into the Ruins',
    description: 'Behind a false wall you discover a sealed reliquary with a chain shirt and 40 gold pieces.',
    event_type: 'reward',
    options: [
      { text: 'Take the relics and push forward to the treasure vault', next_event: 'treasure_005', effects: { experience: 50, gold: 40, item: 'chain-shirt' } },
    ],
  },
  ruins_study_s4: {
    id: 'ruins_study_s4',
    title: 'The Ancient Inscriptions',
    description: 'The Silver Order\'s battle doctrine against abyss-corrupted foes. Your mind feels sharper.',
    event_type: 'story',
    options: [
      { text: 'Armed with new knowledge, advance to the treasure vault', next_event: 'treasure_005', effects: { experience: 70, intelligence: 1 } },
    ],
  },
  ruins_camp_s4: {
    id: 'ruins_camp_s4',
    title: 'A Brief Rest',
    description: 'An hour of sleep in a sheltered corner behind the altar does wonders. You wake refreshed.',
    event_type: 'rest',
    options: [
      { text: 'Refreshed and ready, press on to the treasure vault', next_event: 'treasure_005', effects: { hp: 10, experience: 30 } },
    ],
  },
  treasure_005: {
    id: 'treasure_005',
    title: 'Vault Of The Fallen Order',
    description: 'At the end of a torchlit corridor stands a heavy iron vault door, its lock rusted open. Inside, on a stone plinth, rests a single item left by the last knight of the Silver Order.',
    event_type: 'treasure',
    options: [
      { text: 'Reach in and claim the item from the vault', next_event: 'elite_005', treasure: true },
    ],
  },
  elite_005: {
    id: 'elite_005',
    title: 'Elite Blackguard',
    description: 'The cult\'s blackguard champion blocks the gate to the abyss sanctum.',
    event_type: 'combat',
    options: [
      {
        text: 'Challenge the blackguard to single combat',
        combat: {
          enemy_id: 'elite_blackguard',
          recommended_level: 2,
          can_flee: false,
          skill_points_reward: 6,
          onVictoryEvent: 'sanctum_006',
          onDefeatEvent: 'bad_end_001',
        },
      },
    ],
  },
  sanctum_006: {
    id: 'sanctum_006',
    title: 'Sanctum Rest',
    description: 'A hidden sanctuary lets you tend wounds and prepare for the final descent. How will you use these last moments?',
    event_type: 'rest',
    options: [
      { text: 'Tend your wounds and rest fully before the final descent', next_event: 'sanctum_rest_s7', effects: {} },
      { text: 'Study the abyss records to find the Abyss Lord\'s weakness', next_event: 'sanctum_study_s7', effects: {} },
      { text: 'Meditate to sharpen your resolve and clear your mind', next_event: 'sanctum_meditate_s7', effects: {} },
      { text: 'Pray to your deity for strength and blessing', next_event: 'sanctum_pray_s7', effects: {} },
    ],
  },
  sanctum_rest_s7: {
    id: 'sanctum_rest_s7',
    title: 'Restored',
    description: 'You sleep for two hours. When you wake your body feels whole again.',
    event_type: 'rest',
    options: [
      { text: 'Step up to the abyss gate', next_event: 'boss_007', effects: { hp: 999 } },
    ],
  },
  sanctum_study_s7: {
    id: 'sanctum_study_s7',
    title: 'Knowledge Is Power',
    description: 'The abyss records describe the Abyss Lord\'s one vulnerability: a brief window after each devastating attack.',
    event_type: 'story',
    options: [
      { text: 'Knowing its weakness, you stride through the abyss gate', next_event: 'boss_007', effects: { experience: 50, intelligence: 1 } },
    ],
  },
  sanctum_meditate_s7: {
    id: 'sanctum_meditate_s7',
    title: 'Inner Clarity',
    description: 'Sitting in silence you empty your mind of fear. Everything feels razor-sharp.',
    event_type: 'story',
    options: [
      { text: 'Mind clear, you step through the abyss gate', next_event: 'boss_007', effects: { experience: 40, wisdom: 1 } },
    ],
  },
  sanctum_pray_s7: {
    id: 'sanctum_pray_s7',
    title: 'Divine Blessing',
    description: 'You kneel before the healer\'s altar and speak a prayer. Light warms your hands briefly.',
    event_type: 'story',
    options: [
      { text: 'Blessed, you walk through the abyss gate', next_event: 'boss_007', effects: { hp: 5, charisma: 1, experience: 40 } },
    ],
  },
  boss_007: {
    id: 'boss_007',
    title: 'The Abyss Lord',
    description: 'At the heart of the abyss, the lord of the cult rises from black fire.',
    event_type: 'combat',
    options: [
      {
        text: 'Raise your weapon and face the Abyss Lord',
        combat: {
          enemy_id: 'abyss_lord',
          recommended_level: 3,
          can_flee: false,
          skill_points_reward: 6,
          onVictoryEvent: 'good_end_001',
          onDefeatEvent: 'bad_end_001',
        },
      },
    ],
  },
  good_end_001: {
    id: 'good_end_001',
    title: 'Good Ending: Dawn Over Emberfall',
    description: 'The abyss gate collapses. Emberfall is safe, and your name becomes legend among the frontier folk.',
    event_type: 'ending',
    options: [
      { text: 'Return to character selection', effects: { end_run: true } },
    ],
  },
  bad_end_001: {
    id: 'bad_end_001',
    title: "Bad Ending: Journey's End",
    description: 'Your wounds are too deep. Your journey ends here. To continue, a new hero must rise.',
    event_type: 'ending',
    options: [
      { text: 'Accept fate and begin anew', effects: { delete_character: true } },
    ],
  },
}

function GameContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const characterId = searchParams.get('character')
  const saveId = searchParams.get('save')
  
  const [character, setCharacter] = useState(null)
  const [inventory, setInventory] = useState([])
  const [currentSave, setCurrentSave] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [availableOptions, setAvailableOptions] = useState([])
  const [lastCheckResult, setLastCheckResult] = useState(null)
  const [messages, setMessages] = useState([])
  const [gameMode, setGameMode] = useState('story') // 'story', 'combat', 'inventory', 'equipment'
  const [combatData, setCombatData] = useState(null)
  const [combatOutcomeTargets, setCombatOutcomeTargets] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gameTime, setGameTime] = useState(0)
  const messageTimersRef = useRef(new Set())
  // Skill point modal state
  const [skillPointModal, setSkillPointModal] = useState({ open: false, points: 0, pendingEventId: null })

  function addMessage(text, type = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    setMessages(prev => [...prev, { text, type, id }])

    // Auto-dismiss success (green) messages after 3 seconds
    if (type === 'success') {
      const timerId = setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id))
        messageTimersRef.current.delete(timerId)
      }, 5000)
      messageTimersRef.current.add(timerId)
    }
  }

  useEffect(() => {
    const timers = messageTimersRef.current
    return () => {
      timers.forEach(timerId => clearTimeout(timerId))
      timers.clear()
    }
  }, [])

  const loadEvent = useCallback(async (eventId) => {
    const LEGACY_ID_MAP = { 'start_awakening': 'start_001' }
    const resolvedId = LEGACY_ID_MAP[eventId] || eventId
    try {
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', resolvedId)
        .maybeSingle()
      if (event) {
        setCurrentEvent(event)
        setAvailableOptions(event.options || [])
        setLastCheckResult(null)
      } else if (fallbackEvents[resolvedId]) {
        setCurrentEvent(fallbackEvents[resolvedId])
        setAvailableOptions(fallbackEvents[resolvedId].options || [])
        setLastCheckResult(null)
      } else {
        addMessage(`Event "${resolvedId}" not found. Returning to start.`, 'warning')
        setCurrentEvent(fallbackEvents['start_001'])
        setAvailableOptions(fallbackEvents['start_001'].options || [])
        setLastCheckResult(null)
      }
    } catch (err) {
      console.error('Failed to load event:', err)
      if (fallbackEvents[resolvedId]) {
        setCurrentEvent(fallbackEvents[resolvedId])
        setAvailableOptions(fallbackEvents[resolvedId].options || [])
      }
    }
  }, [])

  const persistEventProgress = useCallback(async ({
    eventId,
    choiceIndex,
    choiceText,
    result,
    nextEventId,
    payload = {},
  }) => {
    if (!currentSave) return

    const entry = {
      eventId,
      choiceIndex,
      choiceText,
      result,
      nextEventId: nextEventId || null,
      at: new Date().toISOString(),
      ...payload,
    }

    const existingState = currentSave.game_state || {}
    const existingHistory = Array.isArray(existingState.eventHistory) ? existingState.eventHistory : []
    const nextHistory = [...existingHistory, entry]

    const nextGameState = {
      ...existingState,
      eventHistory: nextHistory,
      flags: {
        ...(existingState.flags || {}),
        [eventId]: true,
        ...(nextEventId ? { [nextEventId]: true } : {}),
      },
    }

    const updates = {
      current_event_id: nextEventId || currentEvent?.id || currentSave.current_event_id,
      game_time_seconds: gameTime,
      game_state: nextGameState,
    }

    await Promise.allSettled([
      updateSave(currentSave.id, updates),
      supabase.from('event_history').insert({
        save_id: currentSave.id,
        event_id: eventId,
        choice_index: choiceIndex,
        result_data: entry,
      }),
    ])

    setCurrentSave(prev => prev
      ? {
        ...prev,
        ...updates,
      }
      : prev)
  }, [currentEvent?.id, currentSave, gameTime])

  const goToBadEnd = useCallback(async (reason = 'Character died') => {
    await loadEvent('bad_end_001')
    if (currentSave) {
      await updateSave(currentSave.id, {
        current_event_id: 'bad_end_001',
        game_time_seconds: gameTime,
      })
      setCurrentSave(prev => prev ? { ...prev, current_event_id: 'bad_end_001' } : prev)
    }
  }, [currentSave, gameTime, loadEvent])

  // Load initial game state
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/auth/login')
        return
      }
      
      if (!characterId) {
        navigate('/character')
        return
      }
      
      try {
        // Load character
        const char = await getCharacter(characterId)
        if (!char || char.user_id !== user.id) {
          navigate('/character')
          return
        }
        setCharacter(char)
        
        // Load inventory
        const inv = await getCharacterInventory(characterId)
        setInventory(inv)
        
        // Load or create save
        let save
        if (saveId) {
          const { data } = await supabase
            .from('game_saves')
            .select('*')
            .eq('id', saveId)
            .maybeSingle()
          save = data
        } else {
          save = await getLatestSave(characterId)
        }
        
        if (!save) {
          // Create new save
          save = await createSave(user.id, characterId, 'Auto Save', {
            currentEventId: 'start_001',
            gameTime: 0,
          })
        }
        
        setCurrentSave(save)
        setGameTime(save.game_time_seconds || 0)
        
        // Load current event
        await loadEvent(save.current_event_id || 'start_001')
        
      } catch (err) {
        console.error('Failed to initialize game:', err)
        addMessage('Error loading game. Using fallback data.', 'error')
        // Use fallback
        setCurrentEvent(fallbackEvents.start_001)
        setAvailableOptions(fallbackEvents.start_001.options)
      }
      
      setLoading(false)
    }
    
    initialize()
  }, [characterId, saveId, navigate, loadEvent])

  // Game timer
  useEffect(() => {
    if (!currentSave || loading) return
    
    const interval = setInterval(() => {
      setGameTime(t => t + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [currentSave, loading])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!currentSave || !currentEvent || loading) return
    
    const interval = setInterval(async () => {
      try {
        await updateSave(currentSave.id, {
          current_event_id: currentEvent.id,
          game_time_seconds: gameTime,
        })
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [currentSave, currentEvent, gameTime, loading])

  const handleChoice = useCallback(async (choiceIndex) => {
    if (!character || !currentEvent) return

    const option = availableOptions[choiceIndex]
    if (!option) return

    // Handle stat check if required
    if (option.stat_check) {
      const { stat, dc } = option.stat_check
      const checkResult = savingThrow(character, stat, dc)
      setLastCheckResult({ ...checkResult, stat, dc })

      addMessage(
        `${stat.toUpperCase()} check: rolled ${checkResult.roll} + ${getAbilityModifierLocal(character[stat] || 10)} = ${checkResult.total} vs DC ${dc} — ${checkResult.success ? 'Success!' : 'Failed!'}`,
        checkResult.success ? 'success' : 'error'
      )

      const nextId = checkResult.success
        ? (option.next_event || option.effects?.event)
        : (option.failureEvent || option.effects?.event)

      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: checkResult.success ? 'check_success' : 'check_failed',
        nextEventId: nextId,
        payload: {
          check: {
            stat,
            dc,
            roll: checkResult.roll,
            total: checkResult.total,
            success: checkResult.success,
          },
        },
      })

      if (nextId) {
        await loadEvent(nextId)
      }
      return
    }

    // Apply effects
    const effects = option.effects || {}
    let updatedChar = { ...character }

    if (effects.hp)         updatedChar.hp         = Math.min(updatedChar.max_hp, Math.max(0, updatedChar.hp + effects.hp))
    if (effects.mp)         updatedChar.mp         = Math.min(updatedChar.max_mp, Math.max(0, updatedChar.mp + effects.mp))
    if (effects.gold)       updatedChar.gold       = Math.max(0, updatedChar.gold + effects.gold)
    if (effects.experience) updatedChar.experience = (updatedChar.experience || 0) + effects.experience

    // Simple level-up: 100 XP per level
    const xpThreshold = updatedChar.level * 100
    if (updatedChar.experience >= xpThreshold) {
      updatedChar.level    += 1
      updatedChar.max_hp   += 5
      updatedChar.hp       = Math.min(updatedChar.hp + 5, updatedChar.max_hp)
      addMessage(`Level Up! You are now level ${updatedChar.level}!`, 'success')
    }

    if (JSON.stringify(updatedChar) !== JSON.stringify(character)) {
      setCharacter(updatedChar)
      try { await updateCharacter(character.id, updatedChar) } catch (e) { console.error('Failed to save character:', e) }
    }

    if (updatedChar.hp <= 0 && !effects.delete_character && !effects.end_run) {
      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: 'defeat',
        nextEventId: 'bad_end_001',
      })
      await goToBadEnd()
      return
    }

    // Item reward
    if (effects.item) {
      try {
        const newItem = await addItemToInventory(character.id, buildStoryRewardItem(effects.item))
        setInventory(prev => [...prev, newItem])
        addMessage(`Obtained: ${newItem.item_name}`, 'success')
      } catch (e) { console.error('Failed to add item:', e) }
    }

    if (effects.delete_character) {
      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: 'character_deleted',
      })
      try {
        await deleteCharacter(character.id)
      } catch (e) {
        console.error('Failed to delete character:', e)
      }
      setMessages([])
      navigate('/character/create')
      return
    }

    if (effects.end_run) {
      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: 'run_completed',
      })
      navigate('/character')
      return
    }

    // Combat
    if (option.combat) {
      setCombatData(option.combat)
      setCombatOutcomeTargets({
        victoryEvent: option.combat.onVictoryEvent,
        defeatEvent: option.combat.onDefeatEvent || 'bad_end_001',
        fleeEvent: option.combat.onFleeEvent || option.combat.onDefeatEvent || 'bad_end_001',
        skillPointsReward: option.combat.skill_points_reward || 0,
        sourceEventId: currentEvent.id,
        sourceChoiceIndex: choiceIndex,
        sourceChoiceText: option.text,
      })
      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: 'combat_started',
      })
      setGameMode('combat')
      return
    }

    // Treasure event
    if (option.treasure) {
      const nextEventId = option.next_event || effects.event
      addMessage('You reach into the vault...', 'info')
      try {
        const { item, isRare } = await fetchTreasureItem()
        const newItem = await addItemToInventory(character.id, item)
        setInventory(prev => [...prev, newItem])
        addMessage(
          isRare
            ? `✨ Rare find! You obtained: ${newItem.item_name}!`
            : `You obtained: ${newItem.item_name}.`,
          isRare ? 'success' : 'info'
        )
      } catch (e) {
        console.error('Treasure fetch failed:', e)
        addMessage('The vault is empty.', 'warning')
      }
      await persistEventProgress({
        eventId: currentEvent.id,
        choiceIndex,
        choiceText: option.text,
        result: 'treasure_obtained',
        nextEventId,
      })
      if (nextEventId) {
        await loadEvent(nextEventId)
        if (currentSave) {
          await updateSave(currentSave.id, { current_event_id: nextEventId, game_time_seconds: gameTime }).catch(() => {})
        }
      }
      return
    }

    // Advance to next event
    const nextEventId = option.next_event || effects.event
    await persistEventProgress({
      eventId: currentEvent.id,
      choiceIndex,
      choiceText: option.text,
      result: 'advanced',
      nextEventId,
    })

    if (nextEventId) {
      await loadEvent(nextEventId)
      if (currentSave) {
        try {
          await updateSave(currentSave.id, { current_event_id: nextEventId, game_time_seconds: gameTime })
        } catch (e) { console.error('Failed to update save:', e) }
      }
    }
  }, [
    character,
    currentEvent,
    availableOptions,
    currentSave,
    gameTime,
    loadEvent,
    navigate,
    persistEventProgress,
    goToBadEnd,
  ])

  const handleCombatEnd = useCallback(async ({ outcome, rewards, skillPointsEarned }) => {
    setGameMode('story')
    setCombatData(null)

    if (outcome === 'victory') {
      addMessage('Victory! The enemy has been defeated.', 'success')
      if (rewards?.gold) addMessage(`Found ${rewards.gold} gold!`, 'success')
      if (rewards?.experience) addMessage(`Gained ${rewards.experience} XP!`, 'success')

      const victoryEventId = combatOutcomeTargets?.victoryEvent
      const skillPts = skillPointsEarned ?? combatOutcomeTargets?.skillPointsReward ?? 0

      if (victoryEventId) {
        await persistEventProgress({
          eventId: combatOutcomeTargets.sourceEventId,
          choiceIndex: combatOutcomeTargets.sourceChoiceIndex,
          choiceText: combatOutcomeTargets.sourceChoiceText,
          result: 'combat_victory',
          nextEventId: victoryEventId,
          payload: { rewards },
        })
      }

      setCombatOutcomeTargets(null)

      if (skillPts > 0) {
        // Show skill point modal before loading next event
        setSkillPointModal({ open: true, points: skillPts, pendingEventId: victoryEventId })
      } else if (victoryEventId) {
        await loadEvent(victoryEventId)
      }
      return
    }

    if (outcome === 'fled') {
      addMessage('You failed to complete the battle and your quest collapsed.', 'warning')
      const fleeTarget = combatOutcomeTargets?.fleeEvent || 'bad_end_001'
      await persistEventProgress({
        eventId: combatOutcomeTargets?.sourceEventId || currentEvent?.id,
        choiceIndex: combatOutcomeTargets?.sourceChoiceIndex ?? -1,
        choiceText: combatOutcomeTargets?.sourceChoiceText || 'Combat',
        result: 'combat_fled',
        nextEventId: fleeTarget,
      })
      await loadEvent(fleeTarget)
      setCombatOutcomeTargets(null)
      return
    }

    const defeatTarget = combatOutcomeTargets?.defeatEvent || 'bad_end_001'
    await persistEventProgress({
      eventId: combatOutcomeTargets?.sourceEventId || currentEvent?.id,
      choiceIndex: combatOutcomeTargets?.sourceChoiceIndex ?? -1,
      choiceText: combatOutcomeTargets?.sourceChoiceText || 'Combat',
      result: 'combat_defeat',
      nextEventId: defeatTarget,
    })
    if (defeatTarget === 'bad_end_001') {
      await goToBadEnd()
    } else {
      await loadEvent(defeatTarget)
    }
    setCombatOutcomeTargets(null)
  }, [combatOutcomeTargets, currentEvent?.id, goToBadEnd, loadEvent, persistEventProgress])

  const handleSkillPointConfirm = useCallback(async (statDeltas) => {
    if (!character) return
    const updatedChar = { ...character }
    Object.entries(statDeltas).forEach(([stat, delta]) => {
      if (delta > 0) updatedChar[stat] = (updatedChar[stat] || 0) + delta
    })
    setCharacter(updatedChar)
    try { await updateCharacter(character.id, updatedChar) } catch (e) { console.error('Failed to save skill points:', e) }
    const pendingEventId = skillPointModal.pendingEventId
    setSkillPointModal({ open: false, points: 0, pendingEventId: null })
    if (pendingEventId) await loadEvent(pendingEventId)
  }, [character, skillPointModal.pendingEventId, loadEvent])

  if (loading) {
    return (
      <div className="game-loading">
        <div className="text-center">
          <div className="game-spinner" />
          <p className="text-muted-foreground">Entering the Abyss...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="game-page">
      {/* Sidebar */}
      <GameSidebar
        character={character}
        inventory={inventory}
        gameTime={gameTime}
        onViewInventory={() => setGameMode(gameMode === 'inventory' ? 'story' : 'inventory')}
        onViewEquipment={() => setGameMode(gameMode === 'equipment' ? 'story' : 'equipment')}
      />

      {/* Skill Point Modal */}
      {skillPointModal.open && character && (
        <SkillPointModal
          character={character}
          skillPoints={skillPointModal.points}
          onConfirm={handleSkillPointConfirm}
        />
      )}

      {/* Main content */}
      <main className="game-main">
        <div className="game-main-content">
          {/* Messages */}
          {messages.length > 0 && (
            <div className="game-messages">
              {messages.slice(-5).map(msg => (
                <div
                  key={msg.id}
                  className={`game-message ${
                    msg.type === 'success' ? 'game-message--success' :
                    msg.type === 'error' ? 'game-message--error' :
                    msg.type === 'warning' ? 'game-message--warning' :
                    'game-message--info'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          )}

          {/* Game panels */}
          {gameMode === 'story' && currentEvent && (
            <EventPanel
              event={currentEvent}
              options={availableOptions}
              onChoice={handleChoice}
              checkResult={lastCheckResult}
              character={character}
            />
          )}

          {gameMode === 'combat' && combatData && (
            <CombatPanel
              character={character}
              combatData={combatData}
              inventory={inventory}
              onCombatEnd={handleCombatEnd}
              onCharacterUpdate={setCharacter}
            />
          )}

          {gameMode === 'inventory' && (
            <InventoryPanel
              inventory={inventory}
              character={character}
              onInventoryUpdate={setInventory}
              onCharacterUpdate={setCharacter}
              onMessage={addMessage}
              onClose={() => setGameMode('story')}
            />
          )}

          {gameMode === 'equipment' && (
            <EquipmentPanel
              inventory={inventory}
              character={character}
              onInventoryUpdate={setInventory}
              onCharacterUpdate={setCharacter}
              onClose={() => setGameMode('story')}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="game-loading">
        <div className="text-center">
          <div className="game-spinner" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  )
}
