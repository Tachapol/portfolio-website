'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createProjectAction } from '../actions'
import { ProjectForm } from '../components/project-form'
import { Loader2 } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div className="absolute inset-0 size-8 rounded-full border-2 border-primary/20 animate-ping" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">Verifying authorization...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <ProjectForm submitAction={createProjectAction} title="Add New Project" />
    </div>
  )
}
