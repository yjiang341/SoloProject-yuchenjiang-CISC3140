'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from 'frontend/components/ui/card'
import { Button } from 'frontend/components/ui/button'
import { Badge } from 'frontend/components/ui/badge'
import { toggleEquipItem, removeItemFromInventory } from 'backend/services/character-service'
import { Package, Sword, Shield, Sparkles, X, Check } from 'lucide-react'

const ITEM_TYPE_ICONS = {
  weapon: Sword,
  armor: Shield,
  potion: Sparkles,
  misc: Package,
}

export default function InventoryPanel({ inventory, character, onInventoryUpdate, onClose }) {
  const [loading, setLoading] = useState(null)

  async function handleEquip(item) {
    setLoading(item.id)
    try {
      const updated = await toggleEquipItem(item.id, !item.is_equipped)
      onInventoryUpdate(prev => prev.map(i => i.id === item.id ? updated : i))
    } catch (err) {
      console.error('Failed to equip item:', err)
    }
    setLoading(null)
  }

  async function handleDrop(item) {
    if (!confirm(`Drop ${item.item_name}?`)) return
    
    setLoading(item.id)
    try {
      await removeItemFromInventory(item.id)
      onInventoryUpdate(prev => prev.filter(i => i.id !== item.id))
    } catch (err) {
      console.error('Failed to drop item:', err)
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
                  {items.map(item => (
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
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.item_name}</span>
                            {item.quantity > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                x{item.quantity}
                              </Badge>
                            )}
                            {item.is_equipped && (
                              <Badge className="bg-primary/20 text-primary text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Equipped
                              </Badge>
                            )}
                          </div>
                          {item.properties?.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.properties.description}
                            </p>
                          )}
                          {item.properties?.damage && (
                            <p className="text-sm text-muted-foreground">
                              Damage: {item.properties.damage}
                            </p>
                          )}
                          {item.properties?.ac_base && (
                            <p className="text-sm text-muted-foreground">
                              AC: {item.properties.ac_base}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {(type === 'weapon' || type === 'armor') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEquip(item)}
                            disabled={loading === item.id}
                          >
                            {item.is_equipped ? 'Unequip' : 'Equip'}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDrop(item)}
                          disabled={loading === item.id}
                        >
                          Drop
                        </Button>
                      </div>
                    </div>
                  ))}
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
        </div>
      </CardContent>
    </Card>
  )
}
