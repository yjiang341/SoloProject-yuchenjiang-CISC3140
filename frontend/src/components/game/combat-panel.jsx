'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { updateCharacter } from '@/lib/api'
import { 
  rollInitiative, 
  attackRoll, 
  calculateDamage, 
  calculateAC,
  rollDiceLocal,
  getAbilityModifierLocal
} from '@/lib/game-mechanics'
import { Sword, Shield, Heart, Zap, RotateCcw } from 'lucide-react'

// Simple enemy templates
const ENEMIES = {
  dungeon_guard: {
    name: 'Dungeon Guard',
    hp: 22,
    ac: 13,
    attack: 4,
    damage: '1d6+2',
    xp: 50,
    gold: 15,
  },
  dungeon_guards_pair: {
    name: 'Dungeon Guards',
    hp: 44,
    ac: 13,
    attack: 4,
    damage: '2d6+2',
    xp: 100,
    gold: 30,
  },
  giant_rat: {
    name: 'Giant Rat',
    hp: 7,
    ac: 12,
    attack: 2,
    damage: '1d4+1',
    xp: 25,
    gold: 0,
  },
  skeleton: {
    name: 'Skeleton',
    hp: 13,
    ac: 13,
    attack: 4,
    damage: '1d6+2',
    xp: 50,
    gold: 5,
  },
}

export default function CombatPanel({ 
  character, 
  combatData, 
  inventory, 
  onCombatEnd,
  onCharacterUpdate 
}) {
  const [enemy, setEnemy] = useState(null)
  const [enemyHp, setEnemyHp] = useState(0)
  const [playerTurn, setPlayerTurn] = useState(true)
  const [combatLog, setCombatLog] = useState([])
  const [combatOver, setCombatOver] = useState(false)

  useEffect(() => {
    // Initialize combat
    const enemyTemplate = ENEMIES[combatData.enemy_id] || ENEMIES.dungeon_guard
    setEnemy(enemyTemplate)
    setEnemyHp(enemyTemplate.hp)
    setCombatLog([`Combat begins! You face ${enemyTemplate.name}!`])
    
    // Roll initiative
    const playerInit = rollInitiative(character)
    const enemyInit = rollDiceLocal('1d20')
    
    const playerGoesFirst = playerInit.total >= enemyInit.roll
    setPlayerTurn(playerGoesFirst)
    
    setCombatLog(prev => [
      ...prev,
      `Initiative: You rolled ${playerInit.total}, enemy rolled ${enemyInit.roll}`,
      playerGoesFirst ? 'You act first!' : 'The enemy acts first!'
    ])
    
    // If enemy goes first, process their turn after a delay
    if (!playerGoesFirst) {
      setTimeout(() => processEnemyTurn(enemyTemplate, character.hp), 1500)
    }
  }, [combatData, character])

  function addLog(message) {
    setCombatLog(prev => [...prev, message])
  }

  async function handleAttack() {
    if (!playerTurn || combatOver) return
    
    const playerAC = calculateAC(character, inventory)
    
    // Player attacks
    const attack = attackRoll(character)
    addLog(`You attack! Roll: ${attack.roll} + ${attack.modifier} = ${attack.total}`)
    
    if (attack.total >= enemy.ac) {
      const isCrit = attack.isCritical()
      const weaponDamage = '1d6' // Default weapon damage
      const damage = calculateDamage(character, weaponDamage)
      const totalDamage = isCrit ? damage.total * 2 : damage.total
      
      addLog(isCrit 
        ? `CRITICAL HIT! You deal ${totalDamage} damage!` 
        : `Hit! You deal ${totalDamage} damage!`)
      
      const newEnemyHp = Math.max(0, enemyHp - totalDamage)
      setEnemyHp(newEnemyHp)
      
      if (newEnemyHp <= 0) {
        endCombat(true)
        return
      }
    } else {
      addLog('Your attack misses!')
    }
    
    setPlayerTurn(false)
    setTimeout(() => processEnemyTurn(enemy, character.hp), 1500)
  }

  function processEnemyTurn(currentEnemy, currentPlayerHp) {
    if (combatOver) return
    
    const playerAC = calculateAC(character, inventory)
    
    // Enemy attacks
    const enemyAttack = rollDiceLocal('1d20')
    const enemyTotal = enemyAttack.roll + currentEnemy.attack
    
    addLog(`${currentEnemy.name} attacks! Roll: ${enemyAttack.roll} + ${currentEnemy.attack} = ${enemyTotal}`)
    
    if (enemyTotal >= playerAC) {
      const damage = rollDiceLocal(currentEnemy.damage)
      const totalDamage = damage.roll
      
      addLog(enemyAttack.roll === 20 
        ? `CRITICAL HIT! ${currentEnemy.name} deals ${totalDamage} damage to you!`
        : `Hit! ${currentEnemy.name} deals ${totalDamage} damage to you!`)
      
      const newPlayerHp = Math.max(0, currentPlayerHp - totalDamage)
      
      // Update character HP
      const updatedChar = { ...character, hp: newPlayerHp }
      onCharacterUpdate(updatedChar)
      updateCharacter(character.id, { hp: newPlayerHp }).catch(console.error)
      
      if (newPlayerHp <= 0) {
        endCombat(false)
        return
      }
    } else {
      addLog(`${currentEnemy.name}'s attack misses!`)
    }
    
    setPlayerTurn(true)
  }

  async function handleFlee() {
    if (!playerTurn || combatOver) return
    
    const dexMod = getAbilityModifierLocal(character.dexterity)
    const fleeRoll = rollDiceLocal('1d20')
    const fleeTotal = fleeRoll.roll + dexMod
    const fleeDC = combatData.flee_dc || 12
    
    addLog(`Attempting to flee! Roll: ${fleeRoll.roll} + ${dexMod} = ${fleeTotal} vs DC ${fleeDC}`)
    
    if (fleeTotal >= fleeDC) {
      addLog('You successfully escape!')
      setCombatOver(true)
      setTimeout(() => onCombatEnd(false, null), 1500)
    } else {
      addLog('You failed to escape!')
      setPlayerTurn(false)
      setTimeout(() => processEnemyTurn(enemy, character.hp), 1500)
    }
  }

  function endCombat(victory) {
    setCombatOver(true)
    
    if (victory) {
      addLog(`${enemy.name} has been defeated!`)
      
      const rewards = {
        gold: enemy.gold,
        experience: enemy.xp,
      }
      
      // Apply rewards
      const updatedChar = {
        ...character,
        gold: character.gold + rewards.gold,
        experience: character.experience + rewards.experience,
      }
      onCharacterUpdate(updatedChar)
      updateCharacter(character.id, { 
        gold: updatedChar.gold, 
        experience: updatedChar.experience 
      }).catch(console.error)
      
      setTimeout(() => onCombatEnd(true, rewards), 2000)
    } else {
      addLog('You have been defeated...')
      setTimeout(() => onCombatEnd(false, null), 2000)
    }
  }

  if (!enemy) return null

  const playerAC = calculateAC(character, inventory)
  const enemyHpPercent = (enemyHp / enemy.hp) * 100
  const playerHpPercent = (character.hp / character.max_hp) * 100

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-heading text-destructive">Combat!</CardTitle>
          <Badge variant={playerTurn ? 'default' : 'secondary'}>
            {playerTurn ? 'Your Turn' : 'Enemy Turn'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Combat stats */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player stats */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium mb-2">{character.name}</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-health" /> HP
                  </span>
                  <span>{character.hp}/{character.max_hp}</span>
                </div>
                <Progress value={playerHpPercent} className="h-2 [&>div]:bg-health" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> AC
                </span>
                <span>{playerAC}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Sword className="w-3 h-3" /> Attack
                </span>
                <span>+{character.attack}</span>
              </div>
            </div>
          </div>

          {/* Enemy stats */}
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h3 className="font-medium mb-2 text-destructive">{enemy.name}</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-destructive" /> HP
                  </span>
                  <span>{enemyHp}/{enemy.hp}</span>
                </div>
                <Progress value={enemyHpPercent} className="h-2 [&>div]:bg-destructive" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> AC
                </span>
                <span>{enemy.ac}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Sword className="w-3 h-3" /> Attack
                </span>
                <span>+{enemy.attack}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Combat log */}
        <div className="bg-muted/20 rounded-lg p-4 h-48 overflow-y-auto">
          {combatLog.map((log, i) => (
            <div 
              key={i} 
              className={`text-sm mb-1 ${
                log.includes('CRITICAL') ? 'text-accent font-bold' :
                log.includes('defeated') || log.includes('escape') ? 'text-success' :
                log.includes('misses') ? 'text-muted-foreground' :
                log.includes('damage to you') ? 'text-destructive' :
                log.includes('You deal') ? 'text-primary' :
                ''
              }`}
            >
              {log}
            </div>
          ))}
        </div>

        {/* Actions */}
        {!combatOver && (
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              onClick={handleAttack}
              disabled={!playerTurn}
            >
              <Sword className="w-4 h-4 mr-2" />
              Attack
            </Button>
            {combatData.can_flee !== false && (
              <Button 
                variant="outline"
                onClick={handleFlee}
                disabled={!playerTurn}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Flee
              </Button>
            )}
          </div>
        )}

        {combatOver && (
          <div className="text-center py-4">
            <p className="text-lg font-medium">
              {enemyHp <= 0 ? 'Victory!' : character.hp <= 0 ? 'Defeat...' : 'Escaped!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
