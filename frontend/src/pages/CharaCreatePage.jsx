'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/backend/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createCharacter, STANDARD_ARRAY, RACE_BONUSES, CLASS_INFO } from '@/backend/services/character-service'
import { getAbilityModifier, formatModifier } from '@/backend/services/dnd-api'
import { ChevronLeft, ChevronRight, Sword, Shield, Heart, Sparkles } from 'lucide-react'

const RACES = [
  { index: 'human', name: 'Human', description: 'Versatile and adaptable, humans gain +1 to all stats.' },
  { index: 'elf', name: 'Elf', description: 'Graceful and wise, elves gain +2 Dexterity.' },
  { index: 'dwarf', name: 'Dwarf', description: 'Stout and hardy, dwarves gain +2 Constitution.' },
  { index: 'halfling', name: 'Halfling', description: 'Small but brave, halflings gain +2 Dexterity.' },
  { index: 'dragonborn', name: 'Dragonborn', description: 'Proud dragon descendants, +2 Strength, +1 Charisma.' },
  { index: 'gnome', name: 'Gnome', description: 'Clever inventors, gnomes gain +2 Intelligence.' },
  { index: 'half-elf', name: 'Half-Elf', description: 'Charming diplomats, half-elves gain +2 Charisma.' },
  { index: 'half-orc', name: 'Half-Orc', description: 'Fierce warriors, +2 Strength, +1 Constitution.' },
  { index: 'tiefling', name: 'Tiefling', description: 'Infernal heritage, +2 Charisma, +1 Intelligence.' },
]

const CLASSES = [
  { index: 'barbarian', name: 'Barbarian', description: 'A fierce warrior of primal rage.' },
  { index: 'bard', name: 'Bard', description: 'A magical performer using words and music.' },
  { index: 'cleric', name: 'Cleric', description: 'A holy warrior wielding divine magic.' },
  { index: 'druid', name: 'Druid', description: 'A priest of nature and shapeshifter.' },
  { index: 'fighter', name: 'Fighter', description: 'A master of martial combat.' },
  { index: 'monk', name: 'Monk', description: 'A martial artist harnessing ki energy.' },
  { index: 'paladin', name: 'Paladin', description: 'A holy knight bound by sacred oath.' },
  { index: 'ranger', name: 'Ranger', description: 'A hunter and tracker of the wild.' },
  { index: 'rogue', name: 'Rogue', description: 'A stealthy specialist in subterfuge.' },
  { index: 'sorcerer', name: 'Sorcerer', description: 'A spellcaster with innate magic.' },
  { index: 'warlock', name: 'Warlock', description: 'A wielder of eldritch powers.' },
  { index: 'wizard', name: 'Wizard', description: 'A scholarly master of arcane magic.' },
]

const STATS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

export default function CreateCharacterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  
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
  
  const [assignedStats, setAssignedStats] = useState({})
  const [availablePoints, setAvailablePoints] = useState([...STANDARD_ARRAY])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user)
      else router.push('/auth/login')
    })
  }, [router])

  function assignStat(stat, value) {
    // If stat already has a value, return it to available
    if (assignedStats[stat] !== undefined) {
      setAvailablePoints(prev => [...prev, assignedStats[stat]].sort((a, b) => b - a))
    }
    
    // Remove from available and assign
    setAvailablePoints(prev => {
      const index = prev.indexOf(value)
      if (index > -1) {
        const newAvailable = [...prev]
        newAvailable.splice(index, 1)
        return newAvailable
      }
      return prev
    })
    
    setAssignedStats(prev => ({ ...prev, [stat]: value }))
    setCharacter(prev => ({ ...prev, [stat]: value }))
  }

  function clearStat(stat) {
    if (assignedStats[stat] !== undefined) {
      setAvailablePoints(prev => [...prev, assignedStats[stat]].sort((a, b) => b - a))
      const newAssigned = { ...assignedStats }
      delete newAssigned[stat]
      setAssignedStats(newAssigned)
      setCharacter(prev => ({ ...prev, [stat]: 10 }))
    }
  }

  function getFinalStat(stat) {
    const base = character[stat]
    const raceBonus = RACE_BONUSES[character.race]?.[stat] || 0
    return base + raceBonus
  }

  async function handleCreate() {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const newCharacter = await createCharacter(user.id, character)
      router.push(`/game?character=${newCharacter.id}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1: return character.name.length >= 2
      case 2: return character.race !== ''
      case 3: return character.class !== ''
      case 4: return Object.keys(assignedStats).length === 6
      default: return false
    }
  }

  const selectedRace = RACES.find(r => r.index === character.race)
  const selectedClass = CLASSES.find(c => c.index === character.class)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          {/* Step 1: Name */}
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading text-primary">Name Your Character</CardTitle>
                <CardDescription>What shall the Abyss call you?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name</Label>
                  <Input
                    id="name"
                    value={character.name}
                    onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your character's name"
                    className="bg-input/50 text-lg"
                    maxLength={30}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Race */}
          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading text-primary">Choose Your Race</CardTitle>
                <CardDescription>Your heritage shapes your abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {RACES.map(race => (
                    <button
                      key={race.index}
                      onClick={() => setCharacter(prev => ({ ...prev, race: race.index }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        character.race === race.index
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-medium">{race.name}</div>
                      <div className="text-sm text-muted-foreground">{race.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Class */}
          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading text-primary">Choose Your Class</CardTitle>
                <CardDescription>Your path determines your power</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                  {CLASSES.map(cls => (
                    <button
                      key={cls.index}
                      onClick={() => setCharacter(prev => ({ ...prev, class: cls.index }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        character.class === cls.index
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-medium">{cls.name}</div>
                      <div className="text-sm text-muted-foreground">{cls.description}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 4: Stats */}
          {step === 4 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading text-primary">Assign Abilities</CardTitle>
                <CardDescription>Distribute your ability scores using the standard array</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Available points */}
                <div className="flex flex-wrap gap-2 justify-center p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground mr-2">Available:</span>
                  {availablePoints.map((point, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded font-mono">
                      {point}
                    </span>
                  ))}
                  {availablePoints.length === 0 && (
                    <span className="text-muted-foreground text-sm">All points assigned!</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid gap-3">
                  {STATS.map(stat => {
                    const raceBonus = RACE_BONUSES[character.race]?.[stat] || 0
                    const finalValue = getFinalStat(stat)
                    const modifier = getAbilityModifier(finalValue)
                    
                    return (
                      <div key={stat} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-28 capitalize font-medium">{stat}</div>
                        <Select
                          value={assignedStats[stat]?.toString() || ''}
                          onValueChange={(value) => assignStat(stat, parseInt(value))}
                        >
                          <SelectTrigger className="w-20 bg-input/50">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...availablePoints, assignedStats[stat]].filter(Boolean).sort((a, b) => b - a).map((point, i) => (
                              <SelectItem key={`${point}-${i}`} value={point.toString()}>
                                {point}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {raceBonus > 0 && (
                          <span className="text-success text-sm">+{raceBonus} ({selectedRace?.name})</span>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <span className="font-mono text-lg">{finalValue}</span>
                          <span className={`font-mono text-sm ${modifier >= 0 ? 'text-success' : 'text-destructive'}`}>
                            ({formatModifier(modifier)})
                          </span>
                        </div>
                        {assignedStats[stat] !== undefined && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearStat(stat)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-heading text-primary">Review Your Character</CardTitle>
                <CardDescription>Confirm your choices before entering the Abyss</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-3xl font-heading text-primary">{character.name}</h3>
                  <p className="text-muted-foreground">
                    {selectedRace?.name} {selectedClass?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stats */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Abilities</h4>
                    {STATS.map(stat => (
                      <div key={stat} className="flex justify-between text-sm">
                        <span className="capitalize">{stat}</span>
                        <span className="font-mono">
                          {getFinalStat(stat)} ({formatModifier(getAbilityModifier(getFinalStat(stat)))})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Derived Stats */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Combat Stats</h4>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-health" />
                      <span>HP: {CLASS_INFO[character.class]?.hitDie + getAbilityModifier(getFinalStat('constitution'))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-mana" />
                      <span>MP: {['bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard'].includes(character.class) ? Math.max(2, getAbilityModifier(getFinalStat(CLASS_INFO[character.class]?.primaryStat || 'intelligence')) + 1) * 2 : 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-primary" />
                      <span>Attack: +{Math.max(getAbilityModifier(getFinalStat('strength')), getAbilityModifier(getFinalStat('dexterity'))) + 2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent" />
                      <span>Defense: {10 + getAbilityModifier(getFinalStat('dexterity'))}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {step < 5 ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Enter the Abyss'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
