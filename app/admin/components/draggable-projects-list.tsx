'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, GripVertical, FileCode, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { DeleteButton } from '../delete-button'
import { reorderProjectsAction } from '../actions'

interface ProjectType {
  id: string
  title: string
  summary: string
  image: string | null
  tags: string[]
  featured: boolean
  order_index: number
}

interface DraggableProjectsListProps {
  initialProjects: ProjectType[]
}

export function DraggableProjectsList({ initialProjects }: DraggableProjectsListProps) {
  const [projects, setProjects] = useState<ProjectType[]>(initialProjects)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Keep local state in sync if initialProjects changes
  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move'
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newList = [...projects]
    const draggedItem = newList[draggedIndex]
    newList.splice(draggedIndex, 1)
    newList.splice(index, 0, draggedItem)

    setDraggedIndex(index)
    setProjects(newList)
  }

  const handleDragEnd = async () => {
    setDraggedIndex(null)
    
    // Check if the order actually changed
    const orderChanged = projects.some((p, idx) => p.order_index !== idx)
    if (!orderChanged) return

    // Save the new order
    setSaveStatus('saving')
    
    try {
      const projectIds = projects.map((p) => p.id)
      const result = await reorderProjectsAction(projectIds)
      
      if (result.error) {
        setSaveStatus('error')
        console.error('Reordering failed:', result.error)
      } else {
        setSaveStatus('saved')
        // Update local order indices so we don't trigger unnecessary saves next time
        setProjects(prev => prev.map((p, idx) => ({ ...p, order_index: idx })))
        setTimeout(() => setSaveStatus('idle'), 2000)
      }
    } catch (err) {
      setSaveStatus('error')
      console.error(err)
    }
  }

  return (
    <div className="relative mt-10">
      {/* Saving Status Notification Badge */}
      {saveStatus !== 'idle' && (
        <div className="absolute -top-12 right-0 z-30 flex items-center gap-2 rounded-full border border-border/80 bg-card/85 px-3.5 py-1.5 text-xs backdrop-blur-md shadow-md animate-in fade-in slide-in-from-top-2 duration-250">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span className="font-mono text-muted-foreground">Saving new order...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="size-3.5 text-emerald-500" />
              <span className="font-mono text-emerald-500 font-medium">Order saved!</span>
            </>
          )}
          {saveStatus === 'error' && (
            <span className="font-mono text-destructive font-medium">Error saving order</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-card/60 cursor-grab active:cursor-grabbing select-none",
              draggedIndex === index && "opacity-20 border-primary/45 shadow-inner scale-[0.98] rotate-1 duration-150"
            )}
          >
            {/* Drag Handle Icon Indicator */}
            <div className="absolute top-2.5 left-2.5 z-30 p-1.5 rounded-lg bg-black/60 text-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md group-active:cursor-grabbing hover:text-white hover:bg-black/85">
              <GripVertical className="size-3.5" />
            </div>

            {/* Link Overlay */}
            <Link
              href={`/admin/edit/${project.id}`}
              className="absolute inset-0 z-10"
              aria-label={`Edit project ${project.title}`}
              draggable={false}
              onClick={(e) => {
                // Prevent navigation when dragging
                if (draggedIndex !== null) e.preventDefault()
              }}
            />

            {/* Thumbnail */}
            <div className="relative aspect-[16/9] overflow-hidden border-b border-border/50 bg-muted/20 pointer-events-none">
              {project.image ? (
                <Image
                  src={project.image}
                  alt={`${project.title} preview`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={index < 4}
                  draggable={false}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-input/10 text-muted-foreground/40">
                  <FileCode className="size-10 mb-2" />
                  <span className="text-[10px] font-mono">No Image</span>
                </div>
              )}

              {project.featured && (
                <span className="absolute top-2.5 right-2.5 rounded-full bg-primary/90 text-primary-foreground font-mono text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 backdrop-blur-md shadow-md">
                  Featured
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-4 pointer-events-none">
              <h3 className="text-base font-medium tracking-tight text-foreground line-clamp-1">
                {project.title}
              </h3>
              <p className="mt-1.5 text-pretty text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {project.summary}
              </p>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-input/10 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="rounded-full border border-border bg-input/10 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-auto p-4 pt-0 relative z-20">
              <div className="flex items-center justify-end gap-1.5 border-t border-border/40 pt-3">
                <Link
                  href={`/admin/edit/${project.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    'gap-1.5 h-7.5 px-2.5 text-xs text-muted-foreground hover:text-foreground inline-flex items-center'
                  )}
                  draggable={false}
                >
                  <Edit className="size-3" />
                  Edit
                </Link>
                <DeleteButton id={project.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
