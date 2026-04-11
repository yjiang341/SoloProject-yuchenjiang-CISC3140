import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import '@/styles/SignUpSuccessPage.css'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  const navigate = useNavigate()
  return (
    <div className="signup-success-page">
      <div className="signup-success-bg-gradient" />
      
      <Card className="signup-success-card">
        <CardHeader>
          <div className="signup-success-icon-wrapper">
            <Mail />
          </div>
          <CardTitle className="text-2xl font-heading text-primary">Check Your Email</CardTitle>
          <CardDescription className="text-muted-foreground">
            A confirmation link has been sent to your email address
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to confirm your account and begin your journey into the Abyss. 
            The link will expire in 24 hours.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" onClick={() => navigate('/auth/login')}>
            Return to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
