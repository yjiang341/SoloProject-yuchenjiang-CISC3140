'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  getAttackModifier,
  getDamageRange,
  getEquippedWeaponDamage,
  rollDiceLocal,
  getAbilityModifierLocal
} from '@/lib/game-mechanics'
import { ENEMY_STATS } from '@/lib/enemy-balance'
import { Sword, Shield, Heart, Zap, RotateCcw } from 'lucide-react'

export default function CombatPanel({ 
  character, 
  combatData, 
  inventory, 
  onCombatEnd,
  onCharacterUpdate 
}) {
  const enemy = useMemo(() => {
    const baseEnemy = ENEMY_STATS[combatData.enemy_id] || ENEMY_STATS.dungeon_guard
    const recommendedLevel = combatData.recommended_level || character.level || 1
    const levelGap = recommendedLevel - (character.level || 1)
    const scale = Math.max(0.7, Math.min(1.4, 1 + (levelGap * 0.12)))

    return {
      ...baseEnemy,
      ...(combatData.enemy_overrides || {}),
      hp: Math.max(1, Math.round((combatData.enemy_overrides?.hp || baseEnemy.hp) * scale)),
      ac: Math.max(8, Math.round((combatData.enemy_overrides?.ac || baseEnemy.ac) + (levelGap > 0 ? 1 : 0))),
      attack: Math.max(1, Math.round((combatData.enemy_overrides?.attack || baseEnemy.attack) + (levelGap > 0 ? 1 : 0))),
    }
  }, [character.level, combatData])

  const initiative = useMemo(() => {
    const playerInit = rollInitiative(character)
    const enemyInit = rollDiceLocal('1d20')
    return {
      playerGoesFirst: playerInit.total >= enemyInit.roll,
      playerTotal: playerInit.total,
      enemyTotal: enemyInit.roll,
    }
  }, [character])

  const [enemyHp, setEnemyHp] = useState(() => enemy.hp)
  const [playerTurn, setPlayerTurn] = useState(() => initiative.playerGoesFirst)
  const [combatLog, setCombatLog] = useState(() => {
    return [
      `Combat begins! You face ${enemy.name}!`,
      `Initiative: You rolled ${initiative.playerTotal}, enemy rolled ${initiative.enemyTotal}`,
      initiative.playerGoesFirst ? 'You act first!' : 'The enemy acts first!',
    ]
  })
  const [combatOver, setCombatOver] = useState(false)
  const enemyTurnTimeoutRef = useRef(null)
  const characterRef = useRef(character)
  const enemyRef = useRef(enemy)

  useEffect(() => {
    characterRef.current = character
  }, [character])

  useEffect(() => {
    enemyRef.current = enemy
  }, [enemy])

  const addLog = useCallback((message) => {
    setCombatLog(prev => [...prev, message])
  }, [])

  const endCombat = useCallback((victory) => {
    setCombatOver(true)
    if (enemyTurnTimeoutRef.current) {
      clearTimeout(enemyTurnTimeoutRef.current)
      enemyTurnTimeoutRef.current = null
    }

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
        experience: updatedChar.experience,
      }).catch(console.error)

      setTimeout(() => onCombatEnd({ outcome: 'victory', rewards, skillPointsEarned: combatData.skill_points_reward || 0 }), 2000)
    } else {
      addLog('You have been defeated...')
      setTimeout(() => onCombatEnd({ outcome: 'defeat', rewards: null }), 2000)
    }
  }, [addLog, character, enemy, onCharacterUpdate, onCombatEnd, combatData.skill_points_reward])

  const processEnemyTurn = useCallback(function processEnemyTurn() {
    try {
      if (combatOver) return

      const currentEnemy = enemyRef.current
      const currentCharacter = characterRef.current
      const currentPlayerHp = currentCharacter.hp

      const playerAC = calculateAC(currentCharacter, inventory)

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
        const updatedChar = { ...currentCharacter, hp: newPlayerHp }
        onCharacterUpdate(updatedChar)
        updateCharacter(currentCharacter.id, { hp: newPlayerHp }).catch(console.error)

        if (newPlayerHp <= 0) {
          endCombat(false)
          return
        }
      } else {
        addLog(`${currentEnemy.name}'s attack misses!`)
      }

      setPlayerTurn(true)
    } catch (error) {
      console.error('Enemy turn failed:', error)
      addLog('Enemy hesitates in confusion. Your turn!')
      setPlayerTurn(true)
    }
  }, [combatOver, endCombat, inventory, onCharacterUpdate, addLog])

  useEffect(() => {
    if (!playerTurn && !combatOver) {
      enemyTurnTimeoutRef.current = setTimeout(() => {
        processEnemyTurn()
        enemyTurnTimeoutRef.current = null
      }, 900)
      return () => {
        if (enemyTurnTimeoutRef.current) {
          clearTimeout(enemyTurnTimeoutRef.current)
          enemyTurnTimeoutRef.current = null
        }
      }
    }
    return undefined
  }, [playerTurn, combatOver, processEnemyTurn])

  async function handleAttack() {
    if (!playerTurn || combatOver) return
    
    // Player attacks
    const equipmentAttackBonus = getAttackModifier(character, inventory) - (typeof character.attack === 'number' ? character.attack : getAbilityModifierLocal(character.strength || 10))
    const attack = attackRoll(character, equipmentAttackBonus)
    addLog(`You attack! Roll: ${attack.roll} + ${attack.modifier} = ${attack.total}`)
    
    if (attack.total >= enemy.ac) {
      const isCrit = attack.isCritical()
      const weaponDamage = getEquippedWeaponDamage(inventory, '1d6')
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
      setTimeout(() => onCombatEnd({ outcome: 'fled', rewards: null }), 1500)
    } else {
      addLog('You failed to escape!')
      setPlayerTurn(false)
    }
  }

  const playerAC = calculateAC(character, inventory)
  const playerAttack = getAttackModifier(character, inventory)
  const weaponDamage = getEquippedWeaponDamage(inventory, '1d6')
  const playerDamageRange = getDamageRange(character, inventory, weaponDamage)
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
                  <Sword className="w-3 h-3" /> Hit
                </span>
                <span>+{playerAttack}</span>
              </div>
              {playerDamageRange && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Damage</span>
                  <span>{playerDamageRange.dice} {playerDamageRange.modifier >= 0 ? '+' : ''}{playerDamageRange.modifier} ({playerDamageRange.min}-{playerDamageRange.max})</span>
                </div>
              )}
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
