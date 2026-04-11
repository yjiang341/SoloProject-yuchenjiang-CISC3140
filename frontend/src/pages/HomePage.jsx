import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Sword, Shield, Scroll, Users, LogIn, UserPlus, Gamepad2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import '../styles/HomePage.css'


export default function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      // supabase instance already imported at top
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyem0wLTR2Mkg0djJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-heading text-primary mb-4 tracking-wider">
            Truth of Abyss
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto">
            Descend into darkness. Discover your fate.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            A Text-Based D&D RPG Adventure
          </p>
        </div>

        {/* Main menu */}
        <div className="w-full max-w-md space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : user ? (
            <>
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                onClick={() => navigate('/character')}
              >
                <Sword className="w-5 h-5 mr-3" />
                Continue Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full text-lg h-14"
                onClick={() => navigate('/character/create')}
              >
                <UserPlus className="w-5 h-5 mr-3" />
                New Character
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg" 
                className="w-full text-lg h-14"
                asChild
              >
                <Link to="/auth/login">
                  <LogIn className="w-5 h-5 mr-3" />
                  Enter the Abyss
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="w-full text-lg h-14"
                asChild
              >
                <Link to="/auth/sign-up">
                  <Scroll className="w-5 h-5 mr-3" />
                  Begin Your Story
                </Link>
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full text-lg h-14"
                asChild
              >
                <Link to="/guest/create">
                  <Gamepad2 className="w-5 h-5 mr-3" />
                  Play as Guest
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                No account needed. Progress saved locally.
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Sword className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg mb-2">Turn-Based Combat</h3>
            <p className="text-sm text-muted-foreground">
              Strategic battles using D&D 5e mechanics with dice rolls and stat checks
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Scroll className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg mb-2">Branching Narrative</h3>
            <p className="text-sm text-muted-foreground">
              Your choices shape the story with multiple paths and endings to discover
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-heading text-lg mb-2">Classic D&D Classes</h3>
            <p className="text-sm text-muted-foreground">
              12 classes, 9 races, and full character customization from D&D 5e SRD
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-4 text-center text-sm text-muted-foreground/50">
          <p>Powered by D&D 5e SRD API</p>
        </footer>
      </div>
    </div>
  )
}
