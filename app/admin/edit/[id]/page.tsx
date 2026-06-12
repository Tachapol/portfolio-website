'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { updateProjectAction } from '../../actions'
import { ProjectForm } from '../../components/project-form'
import { Loader2 } from 'lucide-react'

interface EditProjectPageProps {
  params: Promise<{ id: string }>
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const router = useRouter()
  const { id } = use(params)
  
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // 1. Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 2. Fetch project
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError(error?.message || 'Project not found')
      } else {
        setProject(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <div className="absolute inset-0 size-8 rounded-full border-2 border-primary/20 animate-ping" />
        </div>
        <p className="text-xs text-muted-foreground font-mono">Loading project data...</p>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive font-semibold">Error: {error}</p>
        <button
          onClick={() => router.push('/admin')}
          className="text-xs underline text-muted-foreground hover:text-foreground"
        >
          Back to Admin Dashboard
        </button>
      </div>
    )
  }

  const boundUpdateAction = updateProjectAction.bind(null, id)

  return (
    <div className="min-h-screen bg-background py-8">
      <ProjectForm
        project={project}
        submitAction={boundUpdateAction}
        title="Edit Project"
      />
    </div>
  )
}
