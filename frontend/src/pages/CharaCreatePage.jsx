import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  createCharacter,
  getGameConfigCached,
} from '@/lib/api'
import { rollStat, getModifierString } from '@/lib/guest-utils'
import { ArrowLeft, ArrowRight, Check, AlertCircle, Heart, Sparkles, Sword, Shield, Dices } from 'lucide-react'

const RACES = [
  { index: 'human', name: 'Human', description: 'Versatile and adaptable.', abilityBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 } },
  { index: 'elf', name: 'Elf', description: 'Graceful and long-lived.', abilityBonuses: { dexterity: 2, intelligence: 1 } },
  { index: 'dwarf', name: 'Dwarf', description: 'Stout and hardy.', abilityBonuses: { constitution: 2, wisdom: 1 } },
  { index: 'halfling', name: 'Halfling', description: 'Small but brave.', abilityBonuses: { dexterity: 2, charisma: 1 } },
  { index: 'dragonborn', name: 'Dragonborn', description: 'Proud dragon descendants.', abilityBonuses: { strength: 2, charisma: 1 } },
  { index: 'gnome', name: 'Gnome', description: 'Clever inventors.', abilityBonuses: { intelligence: 2, constitution: 1 } },
  { index: 'half-elf', name: 'Half-Elf', description: 'Charming diplomats.', abilityBonuses: { charisma: 2, dexterity: 1, constitution: 1 } },
  { index: 'half-orc', name: 'Half-Orc', description: 'Fierce warriors.', abilityBonuses: { strength: 2, constitution: 1 } },
  { index: 'tiefling', name: 'Tiefling', description: 'Touched by infernal heritage.', abilityBonuses: { charisma: 2, intelligence: 1 } },
]

const CLASSES = [
  { index: 'barbarian', name: 'Barbarian', description: 'A fierce warrior of primal rage.', hitDie: 12, spellcaster: false },
  { index: 'bard', name: 'Bard', description: 'A magical performer using words and music.', hitDie: 8, spellcaster: true },
  { index: 'cleric', name: 'Cleric', description: 'A holy warrior wielding divine magic.', hitDie: 8, spellcaster: true },
  { index: 'druid', name: 'Druid', description: 'A priest of nature and shapeshifter.', hitDie: 8, spellcaster: true },
  { index: 'fighter', name: 'Fighter', description: 'A master of martial combat.', hitDie: 10, spellcaster: false },
  { index: 'monk', name: 'Monk', description: 'A martial artist harnessing ki energy.', hitDie: 8, spellcaster: false },
  { index: 'paladin', name: 'Paladin', description: 'A holy knight bound by sacred oath.', hitDie: 10, spellcaster: true },
  { index: 'ranger', name: 'Ranger', description: 'A hunter and tracker of the wild.', hitDie: 10, spellcaster: true },
  { index: 'rogue', name: 'Rogue', description: 'A stealthy specialist in subterfuge.', hitDie: 8, spellcaster: false },
  { index: 'sorcerer', name: 'Sorcerer', description: 'A spellcaster with innate magic.', hitDie: 6, spellcaster: true },
  { index: 'warlock', name: 'Warlock', description: 'A wielder of eldritch powers.', hitDie: 8, spellcaster: true },
  { index: 'wizard', name: 'Wizard', description: 'A scholarly master of arcane magic.', hitDie: 6, spellcaster: true },
]

const STATS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

export default function CreateCharacterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [gameConfig, setGameConfig] = useState(null)
  
  const [character, setCharacter] = useState({
    name: '',
    race: '',
    class: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  })
  
  // Derive remaining point-buy points directly from current stat values
  const pointsRemaining = STATS.reduce((pts, stat) => {
    const value = character[stat]
    let cost = 0
    if (value > 8) {
      for (let i = 9; i <= value; i++) {
        cost += i > 13 ? 2 : 1
      }
    }
    return pts - cost
  }, 27)

  useEffect(() => {
    const initialize = async () => {
      // Load game config (used for review step HP/MP display)
      try {
        const config = await getGameConfigCached()
        setGameConfig(config)
      } catch (err) {
        console.error('Failed to load game config, using local class data:', err)
      }

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setUser(user)
        else navigate('/auth/login')
      })
    }

    initialize()
  }, [navigate])

  function adjustStat(stat, delta) {
    const currentValue = character[stat]
    const newValue = currentValue + delta
    if (newValue < 8 || newValue > 15) return
    const cost = newValue > 13 ? 2 : 1
    if (delta > 0 && pointsRemaining < cost) return
    setCharacter(prev => ({ ...prev, [stat]: newValue }))
  }

  function rollAllStats() {
    const rolled = {}
    STATS.forEach(stat => { rolled[stat] = rollStat() })
    setCharacter(prev => ({ ...prev, ...rolled }))
    // pointsRemaining recomputes automatically from character state
  }

  function getFinalStat(stat) {
    const base = character[stat]
    const raceBonus = gameConfig?.raceBonuses[character.race]?.[stat]
      ?? selectedRace?.abilityBonuses?.[stat]
      ?? 0
    return base + raceBonus
  }

  async function handleCreate() {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const newCharacter = await createCharacter(user.id, character)
      navigate(`/game?character=${newCharacter.id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const selectedRace = RACES.find(r => r.index === character.race)
  const selectedClass = CLASSES.find(c => c.index === character.class)

  // Helper function to calculate ability modifier locally
  const getLocalAbilityModifier = (score) => Math.floor((score - 10) / 2)
  const getLocalFormatModifier = (modifier) => modifier >= 0 ? `+${modifier}` : `${modifier}`

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/character')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading text-primary">Create Your Hero</h1>
            <p className="text-muted-foreground">Shape your destiny in the Abyss</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s === step ? 'bg-primary' : s < step ? 'bg-primary/50' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/20 border border-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What is your name, adventurer?</CardTitle>
              <CardDescription>Choose wisely, for this name shall echo through the Abyss</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your character's name"
                  className="mt-2"
                  maxLength={30}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setError(null); setStep(2) }} disabled={character.name.length < 2}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Race Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Race</CardTitle>
              <CardDescription>Each race has unique abilities and stat bonuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {RACES.map((race) => (
                  <button
                    key={race.index}
                    onClick={() => setCharacter(prev => ({ ...prev, race: race.index }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      character.race === race.index
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading text-lg">{race.name}</span>
                      {character.race === race.index && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{race.description}</p>
                    <div className="text-xs text-accent">
                      {Object.entries(race.abilityBonuses || {}).map(([stat, bonus]) => (
                        <span key={stat} className="mr-2">
                          +{bonus} {stat.slice(0, 3).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { setError(null); setStep(3) }} disabled={character.race === ''}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Class Selection */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Class</CardTitle>
              <CardDescription>Your class determines your abilities and playstyle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {CLASSES.map((cls) => (
                  <button
                    key={cls.index}
                    onClick={() => setCharacter(prev => ({ ...prev, class: cls.index }))}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      character.class === cls.index
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading text-lg">{cls.name}</span>
                      {character.class === cls.index && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{cls.description}</p>
                    <div className="text-xs">
                      <span className="text-destructive">HD: d{cls.hitDie}</span>
                      {cls.spellcaster && (
                        <span className="text-blue-400 ml-2">Spellcaster</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { setError(null); setStep(4) }} disabled={character.class === ''}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Stat Point Buy */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Determine Your Abilities</CardTitle>
              <CardDescription>
                Use point buy to assign your stats
                {pointsRemaining > 0 && ` (${pointsRemaining} points remaining)`}
                {pointsRemaining === 0 && ' — points fully spent'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Roll button */}
              <div className="flex justify-center">
                <Button onClick={rollAllStats} variant="outline">
                  <Dices className="w-4 h-4 mr-2" /> Roll All Stats (4d6 drop lowest)
                </Button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {STATS.map((stat) => {
                  const baseValue = character[stat]
                  const finalValue = getFinalStat(stat)
                  const racialBonus = selectedRace?.abilityBonuses?.[stat] || 0
                  return (
                    <div key={stat} className="p-4 bg-card border border-border rounded-lg">
                      <div className="text-center mb-3">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {stat}
                        </div>
                        <div className="text-3xl font-heading text-primary">{finalValue}</div>
                        <div className="text-sm text-accent">{getModifierString(finalValue)}</div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustStat(stat, -1)}
                          disabled={baseValue <= 8}
                        >
                          −
                        </Button>
                        <span className="text-sm w-12 text-center">
                          {baseValue}
                          {racialBonus > 0 && (
                            <span className="text-green-400"> +{racialBonus}</span>
                          )}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustStat(stat, 1)}
                          disabled={baseValue >= 15 || pointsRemaining < (baseValue >= 13 ? 2 : 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Character summary */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-heading text-sm text-muted-foreground uppercase tracking-wide mb-2">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span><div className="font-medium">{character.name}</div></div>
                  <div><span className="text-muted-foreground">Race:</span><div className="font-medium">{selectedRace?.name}</div></div>
                  <div><span className="text-muted-foreground">Class:</span><div className="font-medium">{selectedClass?.name}</div></div>
                  <div><span className="text-muted-foreground">HP:</span><div className="font-medium text-green-400">{(selectedClass?.hitDie || 10) + getLocalAbilityModifier(getFinalStat('constitution'))}</div></div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => { setError(null); setStep(5) }}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Character</CardTitle>
              <CardDescription>Confirm your choices before entering the Abyss</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-destructive/20 border border-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-heading text-lg mb-3">Character Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="font-medium">{character.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Race:</span>
                    <div className="font-medium">{selectedRace?.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class:</span>
                    <div className="font-medium">{selectedClass?.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Level:</span>
                    <div className="font-medium">1</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Abilities</h4>
                  {STATS.map(stat => (
                    <div key={stat} className="flex justify-between text-sm">
                      <span className="capitalize">{stat}</span>
                      <span className="font-mono">
                        {getFinalStat(stat)} ({getLocalFormatModifier(getLocalAbilityModifier(getFinalStat(stat)))})
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Combat Stats</h4>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>HP: {(gameConfig?.classInfo[character.class]?.hitDie || selectedClass?.hitDie || 10) + getLocalAbilityModifier(getFinalStat('constitution'))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>MP: {selectedClass?.spellcaster ? Math.max(2, getLocalAbilityModifier(getFinalStat('intelligence')) + 1) * 2 : 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sword className="w-4 h-4 text-primary" />
                    <span>Attack: +{Math.max(getLocalAbilityModifier(getFinalStat('strength')), getLocalAbilityModifier(getFinalStat('dexterity'))) + 2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>Defense: {10 + getLocalAbilityModifier(getFinalStat('dexterity'))}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(4)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? 'Creating...' : 'Enter the Abyss'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
