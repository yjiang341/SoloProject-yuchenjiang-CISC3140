import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import '@/styles/UserProfile.css'

const MAX_FILE_SIZE = 2 * 1024 * 1024

function getFallbackName(user) {
  return user?.user_metadata?.username || user?.email?.split('@')[0] || 'Adventurer'
}

export default function UserProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [user, setUser] = useState(null)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      const { data: authData } = await supabase.auth.getUser()
      const currentUser = authData?.user

      if (!currentUser) {
        navigate('/auth/login')
        return
      }

      const fallbackName = getFallbackName(currentUser)

      await supabase.from('profiles').upsert(
        {
          id: currentUser.id,
          username: fallbackName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (!active) return

      setUser(currentUser)
      setNickname(profile?.username || fallbackName)
      setEmail(currentUser.email || '')
      setAvatarUrl(profile?.avatar_url || '')
      setLoading(false)
    }

    load()

    return () => {
      active = false
    }
  }, [navigate])

  async function saveNickname() {
    if (!user) return
    setError('')
    setStatus('')

    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('Nickname cannot be empty.')
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username: trimmed,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      setError(profileError.message)
      return
    }

    const { error: userMetaError } = await supabase.auth.updateUser({
      data: { username: trimmed },
    })

    if (userMetaError) {
      setError(userMetaError.message)
      return
    }

    setStatus('Nickname updated successfully.')
  }

  async function saveEmail() {
    setError('')
    setStatus('')

    const { error: emailError } = await supabase.auth.updateUser({
      email,
    })

    if (emailError) {
      setError(emailError.message)
      return
    }

    setStatus('Email update requested. Check your inbox to confirm the change.')
  }

  async function savePassword() {
    setError('')
    setStatus('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    })

    if (passwordError) {
      setError(passwordError.message)
      return
    }

    setPassword('')
    setStatus('Password updated successfully.')
  }

  async function handleAvatarUpload(event) {
    if (!user) return

    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setStatus('')

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Avatar must be smaller than 2MB.')
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
    const objectPath = `${user.id}/${Date.now()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(objectPath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(objectPath)

    const newAvatarUrl = publicUrlData.publicUrl

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          username: nickname.trim() || getFallbackName(user),
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      setError(profileError.message)
      return
    }

    setAvatarUrl(newAvatarUrl)
    setStatus('Avatar updated successfully.')
  }

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-content">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-content">
        <h1 className="user-profile-title">My Profile</h1>
        <p className="user-profile-subtitle">
          Manage your avatar, nickname, email, password, and account lifecycle.
        </p>

        {error && <div className="user-profile-alert user-profile-error">{error}</div>}
        {status && <div className="user-profile-alert user-profile-success">{status}</div>}

        <Card className="user-profile-card">
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>Upload an image for your account.</CardDescription>
          </CardHeader>
          <CardContent className="user-profile-row">
            <img
              src={avatarUrl || 'https://placehold.co/96x96/0f1724/f6cf6f?text=TOA'}
              alt="Account avatar"
              className="user-profile-avatar"
            />
            <div className="user-profile-stack">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="user-profile-hidden-input"
                onChange={handleAvatarUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()}>Upload New Avatar</Button>
              <p className="user-profile-help">Supported: PNG, JPG, WEBP, GIF. Max size: 2MB.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="user-profile-card">
          <CardHeader>
            <CardTitle>Nickname</CardTitle>
          </CardHeader>
          <CardContent className="user-profile-inline-form">
            <Input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="Your public nickname"
            />
            <Button onClick={saveNickname}>Save Nickname</Button>
          </CardContent>
        </Card>

        <Card className="user-profile-card">
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
          </CardHeader>
          <CardContent className="user-profile-inline-form">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
            <Button onClick={saveEmail}>Update Email</Button>
          </CardContent>
        </Card>

        <Card className="user-profile-card">
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className="user-profile-inline-form">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your new password"
            />
            <Button onClick={savePassword}>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}