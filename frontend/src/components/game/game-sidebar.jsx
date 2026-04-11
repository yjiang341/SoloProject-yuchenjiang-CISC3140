import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getAbilityModifier, formatModifier } from '@/lib/api'
import { 
  Heart, 
  Sparkles, 
  Sword, 
  Shield, 
  Coins, 
  Clock,
  Package,
  LogOut,
  Home,
  User
} from 'lucide-react'

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export default function GameSidebar({ 
  character, 
  inventory, 
  gameTime, 
  isOpen, 
  onClose,
  onViewInventory 
}) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!character) return null

  const hpPercent = (character.hp / character.max_hp) * 100
  const mpPercent = character.max_mp > 0 ? (character.mp / character.max_mp) * 100 : 0

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Character Header */}
          <div className="mb-6 p-4 bg-sidebar-accent rounded-lg">
            <h2 className="text-xl font-heading text-sidebar-primary">{character.name}</h2>
            <p className="text-sm text-sidebar-foreground/70 capitalize">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>

          {/* Health & Mana */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="w-4 h-4 text-health" />
                  <span>Health</span>
                </div>
                <span className="text-sm font-mono">{character.hp}/{character.max_hp}</span>
              </div>
              <Progress value={hpPercent} className="h-2 bg-sidebar-accent [&>div]:bg-health" />
            </div>

            {character.max_mp > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-mana" />
                    <span>Mana</span>
                  </div>
                  <span className="text-sm font-mono">{character.mp}/{character.max_mp}</span>
                </div>
                <Progress value={mpPercent} className="h-2 bg-sidebar-accent [&>div]:bg-mana" />
              </div>
            )}
          </div>

          {/* Combat Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Sword className="w-4 h-4" />
                <span>Attack</span>
              </div>
              <span className="text-lg font-mono">+{character.attack}</span>
            </div>
            <div className="p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
                <Shield className="w-4 h-4" />
                <span>Defense</span>
              </div>
              <span className="text-lg font-mono">{character.defense}</span>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-sidebar-foreground/70 mb-3 uppercase tracking-wide">Abilities</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                <div key={stat} className="flex justify-between p-2 bg-sidebar-accent/50 rounded">
                  <span className="capitalize text-sidebar-foreground/70">{stat.slice(0, 3)}</span>
                  <span className="font-mono">
                    {character[stat]} ({formatModifier(getAbilityModifier(character[stat]))})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-experience" />
                <span className="text-sm">Gold</span>
              </div>
              <span className="font-mono">{character.gold}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sidebar-primary" />
                <span className="text-sm">Experience</span>
              </div>
              <span className="font-mono">{character.experience} XP</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-sidebar-accent rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Play Time</span>
              </div>
              <span className="font-mono">{formatTime(gameTime)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onViewInventory}
            >
              <Package className="w-4 h-4 mr-2" />
              Inventory ({inventory.length})
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/character')}>
              <Home className="w-4 h-4 mr-2" />
              Character Select
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
