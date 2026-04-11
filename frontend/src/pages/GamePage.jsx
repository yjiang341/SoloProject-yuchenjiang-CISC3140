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
  processChoice,
  rollDice,
} from '@/lib/api'
import GameSidebar from '@/components/game/game-sidebar'
import EventPanel from '@/components/game/event-panel'
import CombatPanel from '@/components/game/combat-panel'
import InventoryPanel from '@/components/game/inventory-panel'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import '@/styles/GamePage.css'

// Fallback events (from backend services config)
const fallbackEvents = {
  start_awakening: {
    id: 'start_awakening',
    title: 'The Awakening',
    description: 'You awaken in a cold, damp dungeon cell...',
    event_type: 'story',
    options: [
      { text: 'Try to reach the keys through the bars', next_event: 'reach_keys', stat_check: { stat: 'dexterity', dc: 10 } },
      { text: 'Call out for help', next_event: 'call_help' },
    ],
  },
}

function GameContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const characterId = searchParams.get('character')
  const saveId = searchParams.get('save')
  
  const [user, setUser] = useState(null)
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

  // Load initial game state
  useEffect(() => {
    async function initialize() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/auth/login')
        return
      }
      setUser(user)
      
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
          save = await getSave(saveId)
        } else {
          save = await getLatestSave(characterId)
        }
        
        if (!save) {
          // Create new save
          save = await createSave(user.id, characterId, 'Auto Save', {
            currentEventId: 'start_awakening',
            gameTime: 0,
          })
        }
        
        setCurrentSave(save)
        setGameTime(save.game_time_seconds || 0)
        
        // Load current event
        await loadEvent(save.current_event_id || 'start_awakening')
        
      } catch (err) {
        console.error('Failed to initialize game:', err)
        addMessage('Error loading game. Using fallback data.', 'error')
        // Use fallback
        setCurrentEvent(fallbackEvents.start_awakening)
        setAvailableOptions(fallbackEvents.start_awakening.options)
      }
      
      setLoading(false)
    }
    
    initialize()
  }, [characterId, saveId, navigate])

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

  async function loadEvent(eventId) {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
      
      if (event) {
        setCurrentEvent(event)
        setAvailableOptions(event.options)
        setLastCheckResult(null)
      } else if (fallbackEvents[eventId]) {
        setCurrentEvent(fallbackEvents[eventId])
        setAvailableOptions(fallbackEvents[eventId].options)
        setLastCheckResult(null)
      } else {
        addMessage(`Event "${eventId}" not found. Returning to start.`, 'warning')
        await loadEvent('start_awakening')
      }
    } catch (err) {
      console.error('Failed to load event:', err)
      if (fallbackEvents[eventId]) {
        setCurrentEvent(fallbackEvents[eventId])
        setAvailableOptions(fallbackEvents[eventId].options)
      }
    }
  }

  function addMessage(text, type = 'info') {
    setMessages(prev => [...prev, { text, type, id: Date.now() }])
  }

  const handleChoice = useCallback(async (choiceIndex) => {
    if (!character || !currentEvent) return
    
    const choice = availableOptions[choiceIndex]
    if (!choice) return
    
    // Process the choice
    const result = processChoice(character, { options: availableOptions }, choiceIndex, lastCheckResult)
    
    // Show messages
    result.messages.forEach(msg => addMessage(msg))
    
    // Handle stat check results
    if (result.checkResult) {
      setLastCheckResult(result.checkResult)
      
      // Filter options based on check result
      const postCheckOptions = getPostCheckOptions(currentEvent, result.checkResult.success)
      setAvailableOptions(postCheckOptions)
      return
    }
    
    // Apply effects to character
    if (result.effects) {
      const updatedChar = { ...character, ...result.effects }
      setCharacter(updatedChar)
      
      try {
        await updateCharacter(character.id, result.effects)
      } catch (err) {
        console.error('Failed to save character updates:', err)
      }
      
      // Check for level up
      if (checkLevelUp(updatedChar)) {
        const levelUpData = processLevelUp(updatedChar)
        const finalChar = { ...updatedChar, ...levelUpData }
        setCharacter(finalChar)
        addMessage(`Level Up! You are now level ${levelUpData.level}. Gained ${levelUpData.hpGained} HP!`, 'success')
        
        try {
          await updateCharacter(character.id, levelUpData)
        } catch (err) {
          console.error('Failed to save level up:', err)
        }
      }
    }
    
    // Handle item rewards
    if (choice.effects?.item) {
      try {
        const newItem = await addItemToInventory(character.id, {
          item_id: choice.effects.item,
          item_name: choice.effects.item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          item_type: 'misc',
          quantity: 1,
        })
        setInventory(prev => [...prev, newItem])
        addMessage(`Obtained: ${newItem.item_name}`, 'success')
      } catch (err) {
        console.error('Failed to add item:', err)
      }
    }
    
    // Handle combat
    if (choice.combat) {
      setCombatData(choice.combat)
      setGameMode('combat')
      return
    }
    
    // Record choice in history
    if (currentSave) {
      try {
        await recordEventChoice(currentSave.id, currentEvent.id, choiceIndex, result)
      } catch (err) {
        console.error('Failed to record choice:', err)
      }
    }
    
    // Load next event
    if (result.nextEventId) {
      await loadEvent(result.nextEventId)
      
      // Update save
      if (currentSave) {
        try {
          await updateSave(currentSave.id, {
            current_event_id: result.nextEventId,
            game_time_seconds: gameTime,
          })
        } catch (err) {
          console.error('Failed to update save:', err)
        }
      }
    }
  }, [character, currentEvent, availableOptions, lastCheckResult, currentSave, gameTime])

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
