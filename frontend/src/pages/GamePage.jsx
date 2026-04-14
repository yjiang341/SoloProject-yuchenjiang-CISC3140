import { useState, useEffect, useCallback, Suspense } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import {
  getCharacter,
  updateCharacter,
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
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import '@/styles/GamePage.css'

// Fallback events (from backend services config)
const fallbackEvents = {
  start_001: {
    id: 'start_001',
    title: 'The Awakening',
    description: 'You awaken in complete darkness. The cold stone beneath you sends shivers through your body. As your eyes adjust, you notice a faint glow emanating from a crack in the wall to your left.',
    event_type: 'story',
    options: [
      { text: 'Investigate the glowing crack', effects: { event: 'crack_001' }, requirements: {} },
      { text: 'Call out into the darkness', effects: { event: 'call_001' }, requirements: {} },
      { text: 'Feel around for any objects nearby', effects: { event: 'search_001' }, requirements: {} },
      { text: 'Sit still and listen carefully', effects: { event: 'listen_001' }, requirements: {} },
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
  const [gameMode, setGameMode] = useState('story') // 'story', 'combat', 'inventory'
  const [combatData, setCombatData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [gameTime, setGameTime] = useState(0)

  function addMessage(text, type = 'info') {
    setMessages(prev => [...prev, { text, type, id: Date.now() }])
  }

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
        setAvailableOptions(event.options)
        setLastCheckResult(null)
      } else if (fallbackEvents[resolvedId]) {
        setCurrentEvent(fallbackEvents[resolvedId])
        setAvailableOptions(fallbackEvents[resolvedId].options)
        setLastCheckResult(null)
      } else {
        addMessage(`Event "${resolvedId}" not found. Returning to start.`, 'warning')
        setCurrentEvent(fallbackEvents['start_001'])
        setAvailableOptions(fallbackEvents['start_001'].options)
        setLastCheckResult(null)
      }
    } catch (err) {
      console.error('Failed to load event:', err)
      if (fallbackEvents[resolvedId]) {
        setCurrentEvent(fallbackEvents[resolvedId])
        setAvailableOptions(fallbackEvents[resolvedId].options)
      }
    }
  }, [])

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

      if (nextId) await loadEvent(nextId)
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

    // Item reward
    if (effects.item) {
      try {
        const newItem = await addItemToInventory(character.id, {
          item_id: effects.item,
          item_name: effects.item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          item_type: 'misc',
          quantity: 1,
        })
        setInventory(prev => [...prev, newItem])
        addMessage(`Obtained: ${newItem.item_name}`, 'success')
      } catch (e) { console.error('Failed to add item:', e) }
    }

    // Combat
    if (option.combat) {
      setCombatData(option.combat)
      setGameMode('combat')
      return
    }

    // Advance to next event
    const nextEventId = option.next_event || effects.event
    if (nextEventId) {
      await loadEvent(nextEventId)
      if (currentSave) {
        try {
          await updateSave(currentSave.id, { current_event_id: nextEventId, game_time_seconds: gameTime })
        } catch (e) { console.error('Failed to update save:', e) }
      }
    }
  }, [character, currentEvent, availableOptions, currentSave, gameTime, loadEvent])

  function handleCombatEnd(victory, rewards) {
    setGameMode('story')
    setCombatData(null)
    
    if (victory) {
      addMessage('Victory! The enemy has been defeated.', 'success')
      if (rewards?.gold) {
        addMessage(`Found ${rewards.gold} gold!`, 'success')
      }
      if (rewards?.experience) {
        addMessage(`Gained ${rewards.experience} XP!`, 'success')
      }
    } else {
      addMessage('You have fallen in battle...', 'error')
    }
  }

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
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="game-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <GameSidebar
        character={character}
        inventory={inventory}
        gameTime={gameTime}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onViewInventory={() => setGameMode(gameMode === 'inventory' ? 'story' : 'inventory')}
      />

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
