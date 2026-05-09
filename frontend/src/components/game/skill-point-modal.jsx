'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

const STATS = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']

const STAT_LABELS = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

/**
 * Modal that appears after combat victory to let the player assign earned skill points.
 * Props:
 *   character      - current character object (for displaying base stats)
 *   skillPoints    - number of points to distribute
 *   onConfirm(statDeltas) - called with { strength: 1, dexterity: 2, … }
 */
export default function SkillPointModal({ character, skillPoints, onConfirm }) {
  const [allocated, setAllocated] = useState(
    STATS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
  )

  const totalAllocated = STATS.reduce((sum, s) => sum + allocated[s], 0)
  const remaining = skillPoints - totalAllocated

  function adjust(stat, delta) {
    const next = allocated[stat] + delta
    if (next < 0) return
    if (delta > 0 && remaining <= 0) return
    if (character[stat] + allocated[stat] + delta > 30) return // hard cap
    setAllocated(prev => ({ ...prev, [stat]: next }))
  }

  function handleConfirm() {
    onConfirm(allocated)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-primary/50 bg-card shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Combat Reward</p>
          <CardTitle className="text-2xl font-heading text-primary">Skill Point Assignment</CardTitle>
          <CardDescription className="text-base">
            You earned{' '}
            <span className="text-primary font-bold">{skillPoints} skill point{skillPoints !== 1 ? 's' : ''}</span>.
            Distribute them to strengthen your hero.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Remaining counter */}
          <div className="text-center">
            <Badge
              variant={remaining === 0 ? 'default' : 'secondary'}
              className="text-sm px-4 py-1"
            >
              {remaining > 0 ? `${remaining} point${remaining !== 1 ? 's' : ''} remaining` : 'All points assigned!'}
            </Badge>
          </div>

          {/* Stat rows */}
          <div className="grid grid-cols-1 gap-2">
            {STATS.map(stat => {
              const base = character[stat] || 10
              const delta = allocated[stat]
              const final = base + delta
              return (
                <div
                  key={stat}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-xs font-bold text-muted-foreground uppercase">
                      {STAT_LABELS[stat]}
                    </span>
                    <span className="font-mono text-lg">{base}</span>
                    {delta > 0 && (
                      <span className="text-green-400 font-mono text-sm">+{delta} → {final}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjust(stat, -1)}
                      disabled={delta <= 0}
                      className="h-8 w-8 p-0"
                    >
                      −
                    </Button>
                    <span className="w-6 text-center font-mono">{delta}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adjust(stat, 1)}
                      disabled={remaining <= 0}
                      className="h-8 w-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Confirm button */}
          <Button
            className="w-full mt-2"
            onClick={handleConfirm}
            disabled={remaining > 0}
          >
            {remaining > 0
              ? `Assign ${remaining} more point${remaining !== 1 ? 's' : ''}`
              : 'Confirm & Continue'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
