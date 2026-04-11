import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Sword, Shield, Scroll, Users, LogIn, LogOut, UserPlus, Gamepad2 } from 'lucide-react'
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
    <div className="home-page">
      {/* Background effects */}
      <div className="home-bg-gradient" />
      <div className="home-bg-pattern" />
      
      <div className="home-content">
        {/* Logo/Title */}
        <div className="home-title-section">
          <h1 className="home-title">
            Truth of Abyss
          </h1>
          <p className="home-subtitle">
            Descend into darkness. Discover your fate.
          </p>
          <p className="home-tagline">
            A Text-Based D&D RPG Adventure
          </p>
        </div>

        {/* Main menu */}
        <div className="home-menu">
          {loading ? (
            <div className="home-loading">
              <div className="home-spinner" />
            </div>
          ) : user ? (
            <>
              <Button 
                size="lg" 
                className="home-menu-btn"
                onClick={() => navigate('/character')}
              >
                <Sword className="w-5 h-5 mr-3" />
                Continue Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="home-menu-btn"
                onClick={() => navigate('/character/create')}
              >
                <UserPlus className="w-5 h-5 mr-3" />
                New Character
              </Button>
              <Button 
                size="lg" 
                variant="ghost"
                className="home-menu-btn-signout"
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUser(null)
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg" 
                className="home-menu-btn"
                onClick={() => navigate('/auth/login')}
              >
                <LogIn className="w-5 h-5 mr-3" />
                Enter the Abyss
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="home-menu-btn"
                onClick={() => navigate('/auth/sign-up')}
              >
                <Scroll className="w-5 h-5 mr-3" />
                Begin Your Story
              </Button>
              <div className="home-divider">
                <div className="home-divider-line">
                  <span className="home-divider-border" />
                </div>
                <div className="home-divider-text-wrapper">
                  <span className="home-divider-text">or</span>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="secondary"
                className="home-menu-btn"
                onClick={() => navigate('/guest/create')}
              >
                <Gamepad2 className="w-5 h-5 mr-3" />
                Play as Guest
              </Button>
              <p className="home-guest-note">
                No account needed. Progress saved locally.
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">
              <Sword />
            </div>
            <h3 className="home-feature-title">Turn-Based Combat</h3>
            <p className="home-feature-desc">
              Strategic battles using D&D 5e mechanics with dice rolls and stat checks
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <Scroll />
            </div>
            <h3 className="home-feature-title">Branching Narrative</h3>
            <p className="home-feature-desc">
              Your choices shape the story with multiple paths and endings to discover
            </p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <Users />
            </div>
            <h3 className="home-feature-title">Classic D&D Classes</h3>
            <p className="home-feature-desc">
              12 classes, 9 races, and full character customization from D&D 5e SRD
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="home-footer">
          <p>Powered by D&D 5e SRD API</p>
        </footer>
      </div>
    </div>
  )
}
