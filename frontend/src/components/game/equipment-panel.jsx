'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import {
  Sword,
  Shield,
  Package,
  X,
  HardHat,
  Shirt,
  Footprints,
  CircleDot,
  Dumbbell,
} from 'lucide-react'

// Equipment slots — D&D 5e inspired:
//   hand      : Main Hand (weapons only) | Off Hand (weapons, shields, torches)
//   body      : Helmet | Chest Armor | Leg Armor | Boots
//   accessory : Ring
const SLOTS = [
  { id: 'main_hand', label: 'Main Hand',   icon: Sword,      category: 'hand',      accepts: ['weapon', 'armor', 'misc'] },
  { id: 'off_hand',  label: 'Off Hand',    icon: Shield,     category: 'hand',      accepts: ['weapon', 'armor', 'misc'] },
  { id: 'helmet',    label: 'Helmet',      icon: HardHat,    category: 'body',      accepts: ['armor'] },
  { id: 'chest',     label: 'Chest Armor', icon: Shirt,      category: 'body',      accepts: ['armor'] },
  { id: 'legs',      label: 'Leg Armor',   icon: Dumbbell,   category: 'body',      accepts: ['armor'] },
  { id: 'boots',     label: 'Boots',       icon: Footprints, category: 'body',      accepts: ['armor'] },
  { id: 'ring',      label: 'Ring',        icon: CircleDot,  category: 'accessory', accepts: ['accessory'] },
]

// Used by getItemSlotCategory to resolve preferred slot → category
const HAND_SLOTS      = new Set(['main_hand', 'off_hand'])
const BODY_SLOTS      = new Set(['helmet', 'chest', 'legs', 'boots'])
const ACCESSORY_SLOTS = new Set(['ring'])

function inferAllowedSlots(item) {
  const explicit = item.properties?.allowed_slots
  if (Array.isArray(explicit) && explicit.length > 0) return explicit

  const source = `${item.item_id || ''} ${item.item_name || ''}`.toLowerCase()

  if (item.item_type === 'accessory' || source.includes('ring') || source.includes('amulet')) {
    return ['ring']
  }

  if (
    item.item_type === 'weapon' ||
    item.item_type === 'misc' ||
    source.includes('shield') ||
    source.includes('buckler') ||
    source.includes('torch') ||
    source.includes('lantern')
  ) {
    return ['main_hand', 'off_hand']
  }

  if (source.includes('helm') || source.includes('helmet') || source.includes('hood') || source.includes('hat') || source.includes('cap') || source.includes('coif')) {
    return ['helmet']
  }
  if (source.includes('boot') || source.includes('shoe') || source.includes('sandal') || source.includes('sabaton')) {
    return ['boots']
  }
  if (source.includes('greave') || source.includes('leg') || source.includes('chausses') || source.includes('tasset')) {
    return ['legs']
  }
  if (item.item_type === 'armor' || source.includes('armor') || source.includes('mail') || source.includes('plate') || source.includes('leather')) {
    return ['chest']
  }

  return []
}

/**
 * Determine which slot category an item belongs to.
 * - Items with properties.slot set are locked to that exact slot's category.
 * - Otherwise: weapons/misc → hand, armor → body, accessory → accessory.
 */
function getItemSlotCategory(item) {
  const allowedSlots = inferAllowedSlots(item)
  if (allowedSlots.some(slot => HAND_SLOTS.has(slot))) return 'hand'
  if (allowedSlots.some(slot => BODY_SLOTS.has(slot))) return 'body'
  if (allowedSlots.some(slot => ACCESSORY_SLOTS.has(slot))) return 'accessory'

  const equippedSlot = item.properties?.slot
  if (equippedSlot) {
    if (HAND_SLOTS.has(equippedSlot))      return 'hand'
    if (BODY_SLOTS.has(equippedSlot))      return 'body'
    if (ACCESSORY_SLOTS.has(equippedSlot)) return 'accessory'
  }
  if (item.item_type === 'weapon')    return 'hand'
  if (item.item_type === 'misc')      return 'hand'   // torches, lanterns, hand-held tools
  if (item.item_type === 'armor')     return 'body'
  if (item.item_type === 'accessory') return 'accessory'
  return null
}

function getEquippedInSlot(inventory, slotId) {
  return inventory.find(i => i.is_equipped && i.properties?.slot === slotId) || null
}

function getCompatibleItems(inventory, slot) {
  return inventory.filter(i => {
    if (i.is_equipped && i.properties?.slot === slot.id) return false // already equipped here

    const allowedSlots = inferAllowedSlots(i)
    if (allowedSlots.length > 0) return allowedSlots.includes(slot.id)

    // Category guard: hand-held items never go in body slots and vice-versa
    const itemCategory = getItemSlotCategory(i)
    if (itemCategory && itemCategory !== slot.category) return false

    return slot.accepts.includes(i.item_type)
  })
}

function getStatBonusLabel(item) {
  const bonus = item.properties?.stat_bonus || {}
  const parts = []
  if (bonus.ac_bonus) parts.push(`+${bonus.ac_bonus} AC`)
  if (bonus.attack_bonus) parts.push(`+${bonus.attack_bonus} ATK`)
  if (bonus.damage) parts.push(`DMG: ${bonus.damage}`)
  Object.entries(bonus).forEach(([k, v]) => {
    if (!['ac_bonus', 'attack_bonus', 'damage'].includes(k)) {
      parts.push(`+${v} ${k.slice(0, 3).toUpperCase()}`)
    }
  })
  return parts.join(', ')
}

/**
 * Equip an item to a specific slot in Supabase:
 * 1. Unequip any item currently in the same slot
 * 2. Equip the new item with slot info in properties
 */
async function equipToSlot(inventory, itemId, slotId) {
  const currentInSlot = getEquippedInSlot(inventory, slotId)

  // Unequip current item in that slot
  if (currentInSlot && currentInSlot.id !== itemId) {
    const updatedProps = {
      ...(currentInSlot.properties || {}),
      allowed_slots: currentInSlot.properties?.allowed_slots || inferAllowedSlots(currentInSlot),
      slot: null,
    }
    await supabase
      .from('inventory')
      .update({ is_equipped: false, properties: updatedProps })
      .eq('id', currentInSlot.id)
  }

  // Equip the new item
  const item = inventory.find(i => i.id === itemId)
  if (!item) return null
  const updatedProps = {
    ...(item.properties || {}),
    allowed_slots: item.properties?.allowed_slots || inferAllowedSlots(item),
    slot: slotId,
  }
  const { data, error } = await supabase
    .from('inventory')
    .update({ is_equipped: true, properties: updatedProps })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return { equipped: data, unequipped: currentInSlot }
}

async function unequipItem(item) {
  const updatedProps = {
    ...(item.properties || {}),
    allowed_slots: item.properties?.allowed_slots || inferAllowedSlots(item),
    slot: null,
  }
  const { data, error } = await supabase
    .from('inventory')
    .update({ is_equipped: false, properties: updatedProps })
    .eq('id', item.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export default function EquipmentPanel({ inventory, character, onInventoryUpdate, onClose }) {
  const [loading, setLoading] = useState(null)
  const [selectSlot, setSelectSlot] = useState(null) // slotId being selected for

  // Compute total stat bonuses from all equipped items
  const equippedItems = inventory.filter(i => i.is_equipped)
  const totalBonuses = equippedItems.reduce((acc, item) => {
    const bonus = item.properties?.stat_bonus || {}
    Object.entries(bonus).forEach(([stat, val]) => {
      if (typeof val === 'number') acc[stat] = (acc[stat] || 0) + val
    })
    return acc
  }, {})

  async function handleEquip(itemId, slotId) {
    setLoading(`${slotId}-${itemId}`)
    try {
      const result = await equipToSlot(inventory, itemId, slotId)
      if (result) {
        onInventoryUpdate(prev => prev.map(i => {
          if (i.id === result.equipped.id) return result.equipped
          if (result.unequipped && i.id === result.unequipped.id) {
            return { ...i, is_equipped: false, properties: { ...i.properties, slot: null } }
          }
          return i
        }))
      }
    } catch (err) {
      console.error('Failed to equip item:', err)
    }
    setLoading(null)
    setSelectSlot(null)
  }

  async function handleUnequip(item) {
    setLoading(item.id)
    try {
      const updated = await unequipItem(item)
      onInventoryUpdate(prev => prev.map(i => i.id === updated.id ? updated : i))
    } catch (err) {
      console.error('Failed to unequip item:', err)
    }
    setLoading(null)
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-heading text-primary flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Equipment
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stat bonuses from equipped gear */}
        {Object.keys(totalBonuses).length > 0 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Equipment Bonuses</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(totalBonuses).map(([stat, val]) => (
                <Badge key={stat} variant="secondary" className="text-xs">
                  +{val} {stat === 'ac_bonus' ? 'AC' : stat === 'attack_bonus' ? 'ATK' : stat === 'damage' ? 'DMG' : stat.slice(0, 3).toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Equipment slots grid */}
        <div className="grid grid-cols-1 gap-3">
          {SLOTS.map(slot => {
            const Icon = slot.icon
            const equipped = getEquippedInSlot(inventory, slot.id)
            const compatible = getCompatibleItems(inventory, slot)
            const isSelecting = selectSlot === slot.id

            return (
              <div key={slot.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">{slot.label}</span>
                  </div>
                  {equipped ? (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-medium">{equipped.item_name}</p>
                        {getStatBonusLabel(equipped) && (
                          <p className="text-xs text-green-400">{getStatBonusLabel(equipped)}</p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive h-7"
                        onClick={() => handleUnequip(equipped)}
                        disabled={loading === equipped.id}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">— Empty —</span>
                  )}
                </div>

                {/* Slot selector */}
                {!isSelecting ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 w-full h-7 text-xs"
                    onClick={() => setSelectSlot(slot.id)}
                    disabled={compatible.length === 0}
                  >
                    {compatible.length === 0 ? 'No compatible items' : `Change (${compatible.length} available)`}
                  </Button>
                ) : (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground">Choose item:</span>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectSlot(null)}>Cancel</Button>
                    </div>
                    {compatible.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquip(item.id, slot.id)}
                        disabled={loading === `${slot.id}-${item.id}`}
                        className="w-full text-left p-2 rounded border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.item_name}</span>
                          <div className="flex items-center gap-2">
                            {item.properties?.rarity === 'rare' && (
                              <Badge className="text-xs bg-purple-500/20 text-purple-400">Rare</Badge>
                            )}
                            {getStatBonusLabel(item) && (
                              <span className="text-xs text-green-400">{getStatBonusLabel(item)}</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Unequipped items notice */}
        {inventory.filter(i => !i.is_equipped && ['weapon', 'armor'].includes(i.item_type)).length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            <Package className="w-4 h-4 inline mr-1" />
            No unequipped weapons or armor in inventory
          </p>
        )}
      </CardContent>
    </Card>
  )
}
