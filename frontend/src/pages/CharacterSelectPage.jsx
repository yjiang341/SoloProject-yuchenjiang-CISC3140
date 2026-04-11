import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { getUserCharacters, deleteCharacter } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Play, Sword, Shield, Heart, User } from 'lucide-react'
import '@/styles/CharacterSelectPage.css'

export default function CharacterSelectPage() {
  const navigate = useNavigate()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    async function loadCharacters() {
      // supabase instance already imported at top
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/auth/login')
        return
      }
      
      try {
        const chars = await getUserCharacters(user.id)
        setCharacters(chars)
      } catch (err) {
        console.error('Failed to load characters:', err)
      }
      setLoading(false)
    }
    
    loadCharacters()
  }, [navigate])

  async function handleDelete() {
    if (!deleteTarget) return
    
    try {
      await deleteCharacter(deleteTarget)
      setCharacters(prev => prev.filter(c => c.id !== deleteTarget))
    } catch (err) {
      console.error('Failed to delete character:', err)
    }
    setDeleteTarget(null)
  }

  if (loading) {
    return (
      <div className="character-select-loading">
        <div className="text-center">
          <div className="character-select-spinner" />
          <p className="text-muted-foreground">Loading your champions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="character-select-page">
      <div className="character-select-bg-gradient" />
      
      <div className="character-select-content">
        <div className="character-select-header">
          <h1 className="character-select-title">Choose Your Champion</h1>
          <p className="character-select-subtitle">Select a character to continue your journey</p>
        </div>

        {characters.length > 0 && (
        <div className="character-select-grid">
          {/* Create New Character Card */}
          <Card 
            className="character-select-create-card"
            onClick={() => navigate('/character/create')}
          >
            <CardContent className="character-select-create-content">
              <Plus className="character-select-create-icon" />
              <CardTitle className="text-xl mb-2">Create New Character</CardTitle>
              <CardDescription>Begin a new adventure in the Abyss</CardDescription>
            </CardContent>
          </Card>

          {/* Existing Characters */}
          {characters.map(char => (
            <Card key={char.id} className="character-select-char-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-heading text-primary">{char.name}</CardTitle>
                    <CardDescription className="capitalize">
                      Level {char.level} {char.race} {char.class}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteTarget(char.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="character-select-char-stats">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-health" />
                    <span>{char.hp}/{char.max_hp}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sword className="w-4 h-4 text-primary" />
                    <span>{char.attack}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>{char.defense}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-experience" />
                    <span>{char.experience} XP</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/game?character=${char.id}`)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {characters.length === 0 && (
          <div className="character-select-empty">
            <Card 
              className="character-select-empty-card"
              onClick={() => navigate('/character/create')}
            >
              <CardContent className="character-select-create-content">
                <Plus className="character-select-create-icon" />
                <CardTitle className="text-xl mb-2">Create New Character</CardTitle>
                <CardDescription>Begin a new adventure in the Abyss</CardDescription>
              </CardContent>
            </Card>
            <Card className="character-select-empty-msg">
              <CardContent className="character-select-empty-msg-content">
                <User className="character-select-empty-icon" />
                <CardTitle className="text-xl mb-2">No Characters Yet</CardTitle>
                <CardDescription>
                  You haven't created any characters. Create your first hero to begin your adventure in the Abyss!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Back to menu */}
        <div className="character-select-actions">
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to Main Menu
          </Button>
          <Button 
            variant="ghost" 
            className="text-muted-foreground"
            onClick={async () => {
              await supabase.auth.signOut()
              navigate('/')
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This character and all their progress will be permanently deleted from the Abyss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
