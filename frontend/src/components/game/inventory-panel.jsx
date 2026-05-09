'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateCharacter } from '@/lib/api'
import { removeItemFromInventory } from '@/lib/api'
import { Package, Sword, Shield, Sparkles, X } from 'lucide-react'

const ITEM_TYPE_ICONS = {
  weapon: Sword,
  armor: Shield,
  consumable: Sparkles,
  potion: Sparkles,
  misc: Package,
}

const SLOT_LABELS = {
  main_hand: 'Main Hand',
  off_hand: 'Off Hand',
  helmet: 'Helmet',
  chest: 'Chest',
  legs: 'Legs',
  boots: 'Boots',
  ring: 'Ring',
}

const CONSUMABLE_TYPES = new Set(['consumable', 'potion', 'food', 'supply'])
const CONSUMABLE_KEYWORDS = ['potion', 'healing', 'food', 'ration', 'antitoxin', 'lockpick', 'supply', 'elixir', 'bandage']

function isConsumableItem(item) {
  if (item?.properties?.consumable === true) return true
  if (CONSUMABLE_TYPES.has(item?.item_type)) return true

  const source = `${item?.item_id || ''} ${item?.item_name || ''}`.toLowerCase()
  return CONSUMABLE_KEYWORDS.some(keyword => source.includes(keyword))
}

function getConsumableEffect(item) {
  const declaredEffect = item?.properties?.use_effect
  if (declaredEffect && typeof declaredEffect === 'object') return declaredEffect

  const source = `${item?.item_id || ''} ${item?.item_name || ''}`.toLowerCase()

  if (source.includes('antitoxin')) {
    return { clear_status: true }
  }
  if (source.includes('mana') || source.includes('ether')) {
    return { mp: 10 }
  }
  if (source.includes('potion') || source.includes('healing') || source.includes('food') || source.includes('ration') || source.includes('bandage')) {
    return { hp: 10 }
  }

  return {}
}

export default function InventoryPanel({ inventory, character, onInventoryUpdate, onCharacterUpdate, onMessage, onClose }) {
  const [loading, setLoading] = useState(null)

  async function handleDrop(item) {
    if (!confirm(`Drop ${item.item_name}?`)) return
    
    setLoading(item.id)
    try {
      await removeItemFromInventory(character.id, item.id)
      onInventoryUpdate(prev => prev.filter(i => i.id !== item.id))
    } catch (err) {
      console.error('Failed to drop item:', err)
    }
    setLoading(null)
  }

  async function handleUse(item) {
    setLoading(`use-${item.id}`)

    try {
      const effect = getConsumableEffect(item)

      if (character && (effect.hp || effect.mp || effect.clear_status)) {
        const nextCharacter = {
          ...character,
          hp: effect.hp ? Math.min(character.max_hp, character.hp + effect.hp) : character.hp,
          mp: effect.mp ? Math.min(character.max_mp, character.mp + effect.mp) : character.mp,
          status_effects: effect.clear_status ? [] : character.status_effects,
        }

        await updateCharacter(character.id, nextCharacter)
        onCharacterUpdate?.(nextCharacter)
      }

      await removeItemFromInventory(character.id, item.id)
      onInventoryUpdate(prev => prev.flatMap(i => {
        if (i.id !== item.id) return [i]
        if ((i.quantity || 1) <= 1) return []
        return [{ ...i, quantity: (i.quantity || 1) - 1 }]
      }))

      onMessage?.(`Used ${item.item_name}.`, 'success')
    } catch (err) {
      console.error('Failed to use item:', err)
      onMessage?.(`Could not use ${item.item_name}.`, 'error')
    }

    setLoading(null)
  }

  const groupedItems = inventory.reduce((acc, item) => {
    const type = item.item_type || 'misc'
    if (!acc[type]) acc[type] = []
    acc[type].push(item)
    return acc
  }, {})

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-heading text-primary flex items-center gap-2">
            <Package className="w-6 h-6" />
            Inventory
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Your bag is empty</p>
            <p className="text-sm">Items you collect will appear here</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([type, items]) => {
            const Icon = ITEM_TYPE_ICONS[type] || Package
            
            return (
              <div key={type}>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {type}s
                </h3>
                
                <div className="space-y-2">
                  {items.map(item => {
                    const slot = item.properties?.slot
                    const rarity = item.properties?.rarity
                    const damage = item.properties?.damage
                    const acBase = item.properties?.ac_base
                    const isConsumable = isConsumableItem(item)
                    const statBonus = item.properties?.stat_bonus || {}
                    const bonusLabel = Object.entries(statBonus)
                      .filter(([, v]) => typeof v === 'number' && v !== 0)
                      .map(([k, v]) => k === 'ac_bonus' ? `+${v} AC` : k === 'damage' ? `DMG: ${v}` : `+${v} ${k.slice(0,3).toUpperCase()}`)
                      .join(', ')

                    return (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          item.is_equipped 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-muted/20 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{item.item_name}</span>
                              {item.quantity > 1 && (
                                <Badge
                                  variant="secondary"
                                  label={`Qty ${item.quantity}`}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                >
                                  x{item.quantity}
                                </Badge>
                              )}
                              {rarity === 'rare' && (
                                <Badge
                                  label="Rare"
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#c084fc',
                                    backgroundColor: 'rgba(168, 85, 247, 0.18)',
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                >
                                  Rare
                                </Badge>
                              )}
                              {item.is_equipped && slot && (
                                <Badge
                                  label={`Equipped: ${SLOT_LABELS[slot] || slot}`}
                                  size="small"
                                  sx={{
                                    height: 22,
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: '#60a5fa',
                                    backgroundColor: 'rgba(59, 130, 246, 0.18)',
                                    '& .MuiChip-label': { px: 1 },
                                  }}
                                >
                                  {SLOT_LABELS[slot] || slot}
                                </Badge>
                              )}
                            </div>
                            {bonusLabel && (
                              <p className="text-xs text-green-400 mt-1">{bonusLabel}</p>
                            )}
                            {damage && !bonusLabel && (
                              <p className="text-xs text-muted-foreground">Damage: {damage}</p>
                            )}
                            {acBase && !bonusLabel && (
                              <p className="text-xs text-muted-foreground">AC: {acBase}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {isConsumable && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleUse(item)}
                              disabled={loading === `use-${item.id}` || item.is_equipped}
                              title={item.is_equipped ? 'Unequip before using' : 'Use item'}
                            >
                              Use
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDrop(item)}
                            disabled={loading === item.id || loading === `use-${item.id}` || item.is_equipped}
                            title={item.is_equipped ? 'Unequip before dropping' : 'Drop item'}
                          >
                            Drop
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {/* Capacity indicator */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Carrying</span>
            <span>{inventory.length} items</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Use the Equipment panel to equip items to slots.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
