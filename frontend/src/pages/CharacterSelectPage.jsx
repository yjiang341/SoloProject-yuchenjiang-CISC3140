'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/backend/supabase/client'
import { getUserCharacters, deleteCharacter } from '@/backend/services/character-service'
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

export default function CharacterSelectPage() {
  const router = useRouter()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    async function loadCharacters() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
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
  }, [router])

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your champions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-primary mb-2">Choose Your Champion</h1>
          <p className="text-muted-foreground">Select a character to continue your journey</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Create New Character Card */}
          <Link href="/character/create">
            <Card className="h-full border-dashed border-2 border-border hover:border-primary/50 transition-colors cursor-pointer bg-card/50">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <Plus className="w-12 h-12 text-muted-foreground mb-4" />
                <CardTitle className="text-xl mb-2">Create New Character</CardTitle>
                <CardDescription>Begin a new adventure in the Abyss</CardDescription>
              </CardContent>
            </Card>
          </Link>

          {/* Existing Characters */}
          {characters.map(char => (
            <Card key={char.id} className="border-border/50 bg-card/80 backdrop-blur hover:border-primary/30 transition-colors">
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
                <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
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
                    onClick={() => router.push(`/game?character=${char.id}`)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {characters.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            You have no characters yet. Create one to begin your adventure!
          </p>
        )}

        {/* Back to menu */}
        <div className="text-center mt-8">
          <Button variant="outline" asChild>
            <Link href="/frontend/public">Return to Main Menu</Link>
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
