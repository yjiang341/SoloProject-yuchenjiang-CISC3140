import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, Sparkles, Sword, Shield, Coins, 
  ArrowLeft, Save, Dices, AlertCircle,
  Package, BookOpen, User
} from 'lucide-react'
import { EVENTS_DATA } from '@/lib/guest-config'
import { rollD20, statCheck, getModifier } from '@/lib/guest-utils'

/**
 * Guest Game Play Page
 * Full game experience without requiring authentication
 * All data persisted to localStorage
 */
export default function GuestPlayPage() {
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [gameState, setGameState] = useState(null)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [lastRoll, setLastRoll] = useState(null)
  const [showInventory, setShowInventory] = useState(false)
  const [showCharacter, setShowCharacter] = useState(false)

  // Load character and game state from localStorage
  useEffect(() => {
    const savedCharacter = localStorage.getItem('guestCharacter')
    const savedGameState = localStorage.getItem('guestGameState')

    if (!savedCharacter) {
      navigate('/guest/create')
      return
    }

    const char = JSON.parse(savedCharacter)
    const state = savedGameState ? JSON.parse(savedGameState) : {
      currentEventId: 'start_awakening',
      eventHistory: [],
      gameTimeSeconds: 0
    }

    setCharacter(char)
    setGameState(state)
    
    // Load current event
    const event = EVENTS_DATA[state.currentEventId]
    if (event) {
      setCurrentEvent(event)
    }
    
    setLoading(false)
  }, [navigate])

  // Auto-save game state
  const saveGame = useCallback(() => {
    if (character && gameState) {
      localStorage.setItem('guestCharacter', JSON.stringify(character))
      localStorage.setItem('guestGameState', JSON.stringify(gameState))
      setMessage({ type: 'success', text: 'Game saved!' })
      setTimeout(() => setMessage(null), 2000)
    }
  }, [character, gameState])

  // Handle option selection
  const selectOption = (option, index) => {
    if (!character || !gameState) return

    let newCharacter = { ...character }
    let checkResult = null

    // Handle stat checks if required
    if (option.stat_check) {
      const { stat, dc } = option.stat_check
      const statValue = character[stat] || 10
      const modifier = getModifier(statValue)
      const roll = rollD20()
      const total = roll + modifier
      const success = total >= dc

      checkResult = {
        stat,
        roll,
        modifier,
        total,
        dc,
        success
      }

      setLastRoll(checkResult)

      // If check failed, show failure message and potentially different outcome
      if (!success && option.failureEvent) {
        const failEvent = EVENTS_DATA[option.failureEvent]
        if (failEvent) {
          const failGameState = {
            ...gameState,
            currentEventId: option.failureEvent,
            eventHistory: [...gameState.eventHistory, {
              eventId: gameState.currentEventId,
              choice: index,
              checkResult
            }]
          }
          setCurrentEvent(failEvent)
          setGameState(failGameState)
          // Auto-save with correct new state before returning
          localStorage.setItem('guestCharacter', JSON.stringify(character))
          localStorage.setItem('guestGameState', JSON.stringify(failGameState))
          return
        }
      }
    }

    // Apply effects if any
    if (option.effects) {
      const effects = option.effects
      if (effects.hp) newCharacter.hp = Math.min(newCharacter.maxHp, Math.max(0, newCharacter.hp + effects.hp))
      if (effects.mp) newCharacter.mp = Math.min(newCharacter.maxMp, Math.max(0, newCharacter.mp + effects.mp))
      if (effects.gold) newCharacter.gold = Math.max(0, newCharacter.gold + effects.gold)
      if (effects.experience) newCharacter.experience += effects.experience
      if (effects.item) {
        newCharacter.inventory = [...(newCharacter.inventory || []), {
          id: effects.item,
          name: effects.item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          type: 'item',
          quantity: 1
        }]
      }
      
      // Stat changes
      ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(stat => {
        if (effects[stat]) newCharacter[stat] += effects[stat]
      })
    }

    // Move to next event
    let newGameState = gameState
    if (option.next_event) {
      const nextEvent = EVENTS_DATA[option.next_event]
      if (nextEvent) {
        setCurrentEvent(nextEvent)
        newGameState = {
          ...gameState,
          currentEventId: option.next_event,
          eventHistory: [...gameState.eventHistory, {
            eventId: gameState.currentEventId,
            choice: index,
            checkResult
          }]
        }
        setGameState(newGameState)
      } else {
        setMessage({ type: 'info', text: 'This path leads deeper... (Coming soon)' })
      }
    }

    setCharacter(newCharacter)

    // Auto-save after each action (use local newGameState to avoid stale closure)
    localStorage.setItem('guestCharacter', JSON.stringify(newCharacter))
    localStorage.setItem('guestGameState', JSON.stringify(newGameState))
  }

  // Reset game
  const resetGame = () => {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
      localStorage.removeItem('guestCharacter')
      localStorage.removeItem('guestGameState')
      navigate('/guest/create')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  if (!character || !currentEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-heading mb-2">No Character Found</h2>
            <p className="text-muted-foreground mb-4">Create a character to begin your adventure.</p>
            <Button onClick={() => navigate('/guest/create')}>
              Create Character
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-heading text-primary">{character.name}</h1>
              <p className="text-xs text-muted-foreground">
                Level {character.level} {character.race} {character.class}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowCharacter(!showCharacter)}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowInventory(!showInventory)}
            >
              <Package className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={saveGame}>
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            {message && message.type === 'success' && (
              <span className="text-xs text-green-400 font-medium">{message.text}</span>
            )}
          </div>
        </div>
      </header>

      <div className="flex max-w-6xl mx-auto">
        {/* Sidebar - Stats */}
        <aside className="hidden md:block w-64 p-4 border-r border-border min-h-[calc(100vh-65px)]">
          <div className="space-y-4">
            {/* Health */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" /> HP
                </span>
                <span>{character.hp}/{character.maxHp}</span>
              </div>
              <Progress value={(character.hp / character.maxHp) * 100} className="h-2" />
            </div>

            {/* Mana (if spellcaster) */}
            {character.maxMp > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-blue-500" /> MP
                  </span>
                  <span>{character.mp}/{character.maxMp}</span>
                </div>
                <Progress value={(character.mp / character.maxMp) * 100} className="h-2" />
              </div>
            )}

            {/* Combat stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-secondary/30 rounded text-center">
                <Sword className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Attack</div>
                <div className="font-bold">{character.attack}</div>
              </div>
              <div className="p-2 bg-secondary/30 rounded text-center">
                <Shield className="w-4 h-4 mx-auto mb-1 text-primary" />
                <div className="text-xs text-muted-foreground">Defense</div>
                <div className="font-bold">{character.defense}</div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center justify-between p-2 bg-accent/20 rounded">
              <span className="flex items-center gap-1 text-sm">
                <Coins className="w-4 h-4 text-accent" /> Gold
              </span>
              <span className="font-bold text-accent">{character.gold}</span>
            </div>

            {/* Stats */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">STR</span>
                <span>{character.strength} ({getModifier(character.strength) >= 0 ? '+' : ''}{getModifier(character.strength)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DEX</span>
                <span>{character.dexterity} ({getModifier(character.dexterity) >= 0 ? '+' : ''}{getModifier(character.dexterity)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CON</span>
                <span>{character.constitution} ({getModifier(character.constitution) >= 0 ? '+' : ''}{getModifier(character.constitution)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">INT</span>
                <span>{character.intelligence} ({getModifier(character.intelligence) >= 0 ? '+' : ''}{getModifier(character.intelligence)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">WIS</span>
                <span>{character.wisdom} ({getModifier(character.wisdom) >= 0 ? '+' : ''}{getModifier(character.wisdom)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CHA</span>
                <span>{character.charisma} ({getModifier(character.charisma) >= 0 ? '+' : ''}{getModifier(character.charisma)})</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full" onClick={resetGame}>
              Start Over
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4">
          {/* Message display */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' :
              message.type === 'error' ? 'bg-destructive/20 text-destructive' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Last roll display */}
          {lastRoll && (
            <div className="mb-4 p-3 bg-secondary/30 rounded-lg flex items-center gap-3">
              <Dices className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <span className="font-medium">{lastRoll.stat.toUpperCase()} Check: </span>
                <span>Rolled {lastRoll.roll} + {lastRoll.modifier} = {lastRoll.total}</span>
                <span className="text-muted-foreground"> (DC {lastRoll.dc})</span>
                <span className={lastRoll.success ? ' text-green-400' : ' text-destructive'}>
                  {lastRoll.success ? ' Success!' : ' Failed!'}
                </span>
              </div>
            </div>
          )}

          {/* Event card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-primary">
                {currentEvent.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {currentEvent.description}
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3">
            {currentEvent.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-4 px-4"
                onClick={() => selectOption(option, index)}
              >
                <span className="flex-1">
                  {option.text}
                  {option.stat_check && (
                    <span className="ml-2 text-xs text-accent">
                      [{option.stat_check.stat.toUpperCase()} DC {option.stat_check.dc}]
                    </span>
                  )}
                </span>
              </Button>
            ))}
          </div>
        </main>

        {/* Right sidebar - Inventory (toggle on mobile) */}
        {showInventory && (
          <aside className="fixed md:relative right-0 top-0 md:top-auto w-64 h-full md:h-auto p-4 bg-card md:bg-transparent border-l border-border z-40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading">Inventory</h3>
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setShowInventory(false)}>
                Close
              </Button>
            </div>
            {character.inventory?.length > 0 ? (
              <div className="space-y-2">
                {character.inventory.map((item, index) => (
                  <div key={index} className="p-2 bg-secondary/30 rounded text-sm">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">x{item.quantity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}
