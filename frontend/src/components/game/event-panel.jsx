'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dices, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function EventPanel({ event, options, onChoice, checkResult, character }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  if (!event) return null

  async function handleChoiceClick(index) {
    setSelectedChoice(index)
    setIsProcessing(true)
    await onChoice(index)
    setIsProcessing(false)
    setSelectedChoice(null)
  }

  function getStatCheckBadge(option) {
    if (!option.stat_check) return null
    
    const { stat, dc } = option.stat_check
    const characterStat = character?.[stat] || 10
    const modifier = Math.floor((characterStat - 10) / 2)
    
    return (
      <Badge variant="outline" className="ml-2 text-xs">
        <Dices className="w-3 h-3 mr-1" />
        {stat.toUpperCase()} DC {dc} ({modifier >= 0 ? '+' : ''}{modifier})
      </Badge>
    )
  }

  function getConditionBadge(option) {
    if (option.condition === 'check_passed') {
      return <Badge className="ml-2 bg-success/20 text-success border-success/30">Success</Badge>
    }
    if (option.condition === 'check_failed') {
      return <Badge className="ml-2 bg-destructive/20 text-destructive border-destructive/30">Failure</Badge>
    }
    return null
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-heading text-primary">{event.title}</CardTitle>
          {event.event_type && (
            <Badge variant="secondary" className="capitalize">
              {event.event_type}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Event description */}
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground/90 leading-relaxed text-lg">
            {event.description}
          </p>
        </div>

        {/* Check result display */}
        {checkResult && (
          <div className={`p-4 rounded-lg border ${
            checkResult.success 
              ? 'bg-success/10 border-success/30' 
              : 'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center gap-3">
              {checkResult.success ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
              <div>
                <div className="font-medium">
                  {checkResult.natural20 ? 'Critical Success!' : 
                   checkResult.natural1 ? 'Critical Failure!' :
                   checkResult.success ? 'Success!' : 'Failed!'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rolled {checkResult.roll} + {checkResult.modifier} = {checkResult.total} 
                  {' '}vs DC {checkResult.dc}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Choices */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            What do you do?
          </h3>
          
          {options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className={`w-full justify-start text-left h-auto py-3 px-4 ${
                selectedChoice === index ? 'border-primary bg-primary/10' : ''
              }`}
              disabled={isProcessing}
              onClick={() => handleChoiceClick(index)}
            >
              <span className="flex-1">
                {option.text}
                {getStatCheckBadge(option)}
                {getConditionBadge(option)}
              </span>
              {option.combat && (
                <Badge variant="destructive" className="ml-2">Combat</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Effects warning */}
        {options.some(o => o.effects?.hp < 0) && (
          <div className="flex items-center gap-2 text-sm text-accent">
            <AlertTriangle className="w-4 h-4" />
            <span>Some choices may result in damage or resource loss</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
