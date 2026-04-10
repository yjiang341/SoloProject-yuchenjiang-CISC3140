'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-heading text-primary mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground">
            Something went wrong during authentication. The dark forces may have interfered with your passage.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <Button asChild variant="default">
            <Link href="/auth/login">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/frontend/public">Return to the Surface</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
