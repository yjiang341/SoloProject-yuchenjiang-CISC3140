import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import '@/styles/ErrorPage.css'

export default function AuthErrorPage() {
  const navigate = useNavigate()
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-header">
          <h1 className="error-title">Authentication Failed</h1>
          <p className="error-description">
            Something went wrong during authentication. The dark forces may have interfered with your passage.
          </p>
        </div>
        <div className="error-actions">
          <Button variant="default" onClick={() => navigate('/auth/login')}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return to the Surface
          </Button>
        </div>
      </div>
    </div>
  )
}
