import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import '@/styles/SiteNavbar.css'

const signedInTabs = [
  { label: 'Adventure', to: '/game' },
  { label: 'Characters', to: '/character' },
  { label: 'Create Hero', to: '/character/create' },
]

const guestTabs = [
  { label: 'Guest Quest', to: '/guest/create' },
]

export default function SiteNavbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [accountName, setAccountName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadUserAndProfile(currentUser) {
      if (!currentUser) {
        if (isMounted) {
          setUser(null)
          setAccountName('')
          setAvatarUrl('')
        }
        return
      }

      if (isMounted) {
        setUser(currentUser)
      }

      const fallbackName =
        currentUser.user_metadata?.username ||
        currentUser.email?.split('@')[0] ||
        'Adventurer'

      await supabase
        .from('profiles')
        .upsert(
          {
            id: currentUser.id,
            username: fallbackName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (isMounted) {
        setAccountName(data?.username || fallbackName)
        setAvatarUrl(data?.avatar_url || '')
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      loadUserAndProfile(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserAndProfile(session?.user ?? null)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    try {
      await supabase.auth.signOut()
    } finally {
      // Force full reload so all auth-gated UI returns to guest mode immediately.
      window.location.replace('/')
    }
  }

  const navTabs = user ? signedInTabs : guestTabs

  const fallbackAvatar = `https://placehold.co/36x36/0f1724/f6cf6f?text=${encodeURIComponent((accountName || 'A').slice(0, 1).toUpperCase())}`

  return (
    <header className="site-navbar-wrap">
      <nav className="site-navbar" aria-label="Main navigation">
        <div className="site-navbar-left">
          <NavLink to="/" className="site-navbar-title">
            TruthOfAbyss
          </NavLink>

          <div className="site-navbar-tabs">
            {navTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `site-navbar-tab${isActive ? ' is-active' : ''}`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="site-navbar-auth">
          {user ? (
            <>
              <NavLink to="/user/profile" className="site-navbar-account">
                <img
                  src={avatarUrl || fallbackAvatar}
                  alt="Account avatar"
                  className="site-navbar-avatar"
                />
                {accountName}
              </NavLink>
              <Button
                className="site-navbar-login"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          ) : (
            <Button
              className="site-navbar-login"
              onClick={() => navigate('/auth/login')}
            >
              Log in
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}