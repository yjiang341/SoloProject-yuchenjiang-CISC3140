'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, Dices, Check, AlertCircle } from 'lucide-react'
import { RACES, CLASSES, STAT_NAMES, BASE_STATS } from '@/backend/config/game-config'
import { rollStat, getModifier, getModifierString } from '@/backend/utils/stats'

/**
 * Guest Character Creation Page
 * Allows users to create a character without signing in
 * Character data is stored in localStorage
 */
export default function GuestCharacterCreatePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  
  // Character state
  const [name, setName] = useState('')
  const [selectedRace, setSelectedRace] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  })
  const [pointsRemaining, setPointsRemaining] = useState(27)

  // Calculate points used for point buy
  useEffect(() => {
    let used = 0
    Object.values(stats).forEach(value => {
      if (value > 8) {
        // Points cost increases above 13
        for (let i = 9; i <= value; i++) {
          used += i > 13 ? 2 : 1
        }
      }
    })
    setPointsRemaining(27 - used)
  }, [stats])

  // Roll all stats at once
  const rollAllStats = () => {
    const newStats = {}
    STAT_NAMES.forEach(stat => {
      newStats[stat.key] = rollStat()
    })
    setStats(newStats)
    setPointsRemaining(0) // Disable point buy after rolling
  }

  // Point buy adjustment
  const adjustStat = (statKey, delta) => {
    const currentValue = stats[statKey]
    const newValue = currentValue + delta
    
    // Enforce limits (8-15 for point buy)
    if (newValue < 8 || newValue > 15) return
    
    // Calculate cost
    const cost = newValue > 13 ? 2 : 1
    if (delta > 0 && pointsRemaining < cost) return
    
    setStats(prev => ({
      ...prev,
      [statKey]: newValue
    }))
  }

  // Apply racial bonuses
  const getStatWithRacialBonus = (statKey) => {
    const base = stats[statKey]
    if (!selectedRace) return base
    const bonus = selectedRace.abilityBonuses?.[statKey] || 0
    return base + bonus
  }

  // Calculate derived stats
  const calculateHP = () => {
    if (!selectedClass) return 10
    const conMod = getModifier(getStatWithRacialBonus('constitution'))
    return selectedClass.hitDie + conMod
  }

  const calculateAC = () => {
    const dexMod = getModifier(getStatWithRacialBonus('dexterity'))
    return 10 + dexMod
  }

  // Create character and start game
  const createCharacter = () => {
    if (!name.trim()) {
      setError('Please enter a character name')
      return
    }
    if (!selectedRace) {
      setError('Please select a race')
      return
    }
    if (!selectedClass) {
      setError('Please select a class')
      return
    }

    const character = {
      id: `guest_${Date.now()}`,
      name: name.trim(),
      race: selectedRace.name,
      class: selectedClass.name,
      level: 1,
      experience: 0,
      hp: calculateHP(),
      maxHp: calculateHP(),
      mp: selectedClass.spellcaster ? 10 + getModifier(getStatWithRacialBonus('intelligence')) : 0,
      maxMp: selectedClass.spellcaster ? 10 + getModifier(getStatWithRacialBonus('intelligence')) : 0,
      strength: getStatWithRacialBonus('strength'),
      dexterity: getStatWithRacialBonus('dexterity'),
      constitution: getStatWithRacialBonus('constitution'),
      intelligence: getStatWithRacialBonus('intelligence'),
      wisdom: getStatWithRacialBonus('wisdom'),
      charisma: getStatWithRacialBonus('charisma'),
      attack: getModifier(getStatWithRacialBonus('strength')) + 2,
      defense: calculateAC(),
      gold: 100,
      inventory: [],
      statusEffects: [],
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem('guestCharacter', JSON.stringify(character))
    localStorage.setItem('guestGameState', JSON.stringify({
      currentEventId: 'start_awakening',
      eventHistory: [],
      gameTimeSeconds: 0
    }))

    router.push('/guest/play')
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/frontend/public">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading text-primary">Create Your Hero</h1>
            <p className="text-muted-foreground">Guest Mode - Progress saved locally</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your character's name"
                  className="mt-2"
                  maxLength={30}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setError(''); setStep(2) }} disabled={!name.trim()}>
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
                    key={race.id}
                    onClick={() => setSelectedRace(race)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedRace?.id === race.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading text-lg">{race.name}</span>
                      {selectedRace?.id === race.id && (
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
                <Button onClick={() => { setError(''); setStep(3) }} disabled={!selectedRace}>
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
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedClass?.id === cls.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-heading text-lg">{cls.name}</span>
                      {selectedClass?.id === cls.id && (
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
                <Button onClick={() => { setError(''); setStep(4) }} disabled={!selectedClass}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Stats */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Determine Your Abilities</CardTitle>
              <CardDescription>
                Use point buy or roll for your stats
                {pointsRemaining > 0 && ` (${pointsRemaining} points remaining)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <Button onClick={rollAllStats} variant="outline">
                  <Dices className="w-4 h-4 mr-2" /> Roll All Stats (4d6 drop lowest)
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {STAT_NAMES.map((stat) => {
                  const baseValue = stats[stat.key]
                  const finalValue = getStatWithRacialBonus(stat.key)
                  const racialBonus = selectedRace?.abilityBonuses?.[stat.key] || 0
                  
                  return (
                    <div key={stat.key} className="p-4 bg-card border border-border rounded-lg">
                      <div className="text-center mb-2">
                        <div className="text-xs text-muted-foreground uppercase">{stat.name}</div>
                        <div className="text-3xl font-heading text-primary">{finalValue}</div>
                        <div className="text-sm text-accent">
                          {getModifierString(finalValue)}
                        </div>
                      </div>
                      {pointsRemaining >= 0 && (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustStat(stat.key, -1)}
                            disabled={baseValue <= 8}
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">
                            {baseValue}
                            {racialBonus > 0 && (
                              <span className="text-accent">+{racialBonus}</span>
                            )}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => adjustStat(stat.key, 1)}
                            disabled={baseValue >= 15 || pointsRemaining < (baseValue >= 13 ? 2 : 1)}
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Character Summary */}
              <div className="p-4 bg-secondary/30 rounded-lg mb-6">
                <h3 className="font-heading text-lg mb-3">Character Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <div className="font-medium">{name}</div>
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
                    <span className="text-muted-foreground">HP:</span>
                    <div className="font-medium text-green-400">{calculateHP()}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={createCharacter}>
                  Begin Adventure <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
