'use client'

import { useState, useTransition, useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button, buttonVariants } from '@/components/ui/button'
import { Upload, X, Save, ArrowLeft, Loader2, Image as ImageIcon, Crop } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ActionState } from '../actions'
import { MarkdownEditor } from './markdown-editor'
import { ImageCropperModal } from './image-cropper'

interface ProjectFormProps {
  project?: {
    id: string
    title: string
    summary: string
    image: string | null
    architecture_image?: string | null
    tags: string[]
    featured: boolean
    overview?: string | null
    technologies?: string | null
    achievements?: string | null
    challenges?: string | null
    github_url?: string | null
  }
  submitAction: (prevState: ActionState | null, formData: FormData) => Promise<ActionState>
  title: string
}

export function ProjectForm({ project, submitAction, title }: ProjectFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(submitAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLTextAreaElement>(null)

  // Form states
  const [projectTitle, setProjectTitle] = useState(project?.title || '')
  const [summary, setSummary] = useState(project?.summary || '')

  // Auto-grow summary textarea height
  useEffect(() => {
    const textarea = summaryRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [summary])

  const [tagsInput, setTagsInput] = useState(project?.tags?.join(', ') || '')
  const [featured, setFeatured] = useState(project?.featured || false)
  
  // Extended content states
  const [overview, setOverview] = useState(project?.overview || '')
  const [technologies, setTechnologies] = useState(project?.technologies || '')
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '')
  const [achievements, setAchievements] = useState(project?.achievements || '')
  const [challenges, setChallenges] = useState(project?.challenges || '')
  
  // Image states
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Architecture Image states
  const [archPreview, setArchPreview] = useState<string | null>(project?.architecture_image || null)
  const [archFile, setArchFile] = useState<File | null>(null)
  const [isDraggingOverArch, setIsDraggingOverArch] = useState(false)

  // Cropper state
  const [cropperState, setCropperState] = useState<{
    src: string
    filename: string
    target: 'image' | 'architecture'
    aspectRatio: number | null
  } | null>(null)

  const handleDragOverArch = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOverArch(true)
  }

  const handleDragLeaveArch = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOverArch(false)
  }

  const handleDropArch = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsDraggingOverArch(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCropperState({
        src: url,
        filename: file.name,
        target: 'architecture',
        aspectRatio: null,
      })
    }
  }

  const handleArchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCropperState({
        src: url,
        filename: file.name,
        target: 'architecture',
        aspectRatio: null,
      })
    }
  }

  const handleRemoveArch = () => {
    if (archPreview && archPreview.startsWith('blob:')) {
      URL.revokeObjectURL(archPreview)
    }
    setArchFile(null)
    setArchPreview(null)
    const fileInput = document.getElementById('architecture-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    setIsDraggingOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCropperState({
        src: url,
        filename: file.name,
        target: 'image',
        aspectRatio: 16 / 9,
      })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc to exit/cancel
      if (e.key === 'Escape') {
        e.preventDefault()
        router.push('/admin')
      }

      // 2. Enter to save
      if (e.key === 'Enter') {
        const activeEl = document.activeElement
        const isTextArea = activeEl && activeEl.tagName.toLowerCase() === 'textarea'

        // If inside a textarea, Enter does normal newline, but Cmd+Enter or Ctrl+Enter saves
        const shouldSubmit = !isTextArea || e.ctrlKey || e.metaKey

        if (shouldSubmit) {
          e.preventDefault()
          formRef.current?.requestSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setCropperState({
        src: url,
        filename: file.name,
        target: 'image',
        aspectRatio: 16 / 9,
      })
    }
  }

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleCropperConfirm = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile)
    const target = cropperState?.target

    if (target === 'image') {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
      setImageFile(croppedFile)
      setImagePreview(previewUrl)
      
      const fileInput = document.getElementById('image-upload') as HTMLInputElement
      if (fileInput) {
        const dt = new DataTransfer()
        dt.items.add(croppedFile)
        fileInput.files = dt.files
      }
    } else if (target === 'architecture') {
      if (archPreview && archPreview.startsWith('blob:')) {
        URL.revokeObjectURL(archPreview)
      }
      setArchFile(croppedFile)
      setArchPreview(previewUrl)
      
      const fileInput = document.getElementById('architecture-upload') as HTMLInputElement
      if (fileInput) {
        const dt = new DataTransfer()
        dt.items.add(croppedFile)
        fileInput.files = dt.files
      }
    }

    if (cropperState?.src) {
      URL.revokeObjectURL(cropperState.src)
    }
    setCropperState(null)
  }

  const handleCropperClose = () => {
    if (cropperState?.src) {
      URL.revokeObjectURL(cropperState.src)
    }
    setCropperState(null)
  }

  const handleEditImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (imagePreview) {
      setCropperState({
        src: imagePreview,
        filename: imageFile?.name || 'project-image.jpg',
        target: 'image',
        aspectRatio: 16 / 9,
      })
    }
  }

  const handleEditArch = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (archPreview) {
      setCropperState({
        src: archPreview,
        filename: archFile?.name || 'architecture-diagram.jpg',
        target: 'architecture',
        aspectRatio: null,
      })
    }
  }

  // Parse tags for live preview
  const tagsPreview = tagsInput
    ? tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : []

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Saving Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/50 backdrop-blur-md transition-all duration-300">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/80 border border-border/80 shadow-2xl max-w-xs text-center">
            <div className="relative flex items-center justify-center">
              <Loader2 className="size-10 animate-spin text-primary" />
              <div className="absolute inset-0 size-10 rounded-full border-2 border-primary/20 animate-ping" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Saving Project</p>
              <p className="text-xs text-muted-foreground">Uploading assets and updating database records...</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="group grid size-9 place-items-center rounded-lg border border-border bg-input/5 text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Workspace</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card/40 border border-border/60 backdrop-blur-md rounded-2xl p-8 shadow-xl">
        <form ref={formRef} action={formAction} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Project Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Real-time Streaming Platform"
              className="w-full h-11 rounded-lg border border-border bg-input/10 px-4 text-sm text-foreground placeholder-muted-foreground/50 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <label htmlFor="summary" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Summary Description
            </label>
            <textarea
              id="summary"
              name="summary"
              ref={summaryRef}
              required
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a detailed description of what the project does, the technical challenge it solves, and the outcomes."
              className="w-full rounded-lg border border-border bg-input/10 p-4 text-sm text-foreground placeholder-muted-foreground/50 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none overflow-hidden"
            />
          </div>

          {/* Overview */}
          <MarkdownEditor
            id="overview"
            name="overview"
            label="Project Overview (Markdown)"
            value={overview}
            onChange={setOverview}
            placeholder="Deep dive into the project's goals, context, and overall architecture."
            rows={6}
          />

          {/* Technologies Used */}
          <MarkdownEditor
            id="technologies"
            name="technologies"
            label="Technologies Used (Markdown)"
            value={technologies}
            onChange={setTechnologies}
            placeholder="List and explain the main technologies used (e.g. Next.js for SSR, Supabase for auth/db)."
            rows={4}
          />

          {/* Key Achievements */}
          <MarkdownEditor
            id="achievements"
            name="achievements"
            label="Key Achievements (Markdown)"
            value={achievements}
            onChange={setAchievements}
            placeholder="- Improved performance by 50%&#10;- Handled 10k concurrent users"
            rows={4}
          />

          {/* Challenges & Solutions */}
          <MarkdownEditor
            id="challenges"
            name="challenges"
            label="Challenges & Solutions (Markdown)"
            value={challenges}
            onChange={setChallenges}
            placeholder="What were the hardest parts of building this? How did you solve them?"
            rows={5}
          />

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Tags / Technologies
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Kafka, Spark, Iceberg, Snowflake (comma-separated)"
              className="w-full h-11 rounded-lg border border-border bg-input/10 px-4 text-sm text-foreground placeholder-muted-foreground/50 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-[11px] text-muted-foreground/85">
              Enter tags separated by commas.
            </p>

            {/* Live tags preview */}
            {tagsPreview.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mr-1 self-center">Preview:</span>
                {tagsPreview.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="rounded-full border border-border bg-primary/10 text-primary px-2.5 py-0.5 font-mono text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <label htmlFor="github_url" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              GitHub Link (View Source)
            </label>
            <input
              id="github_url"
              name="github_url"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="e.g. https://github.com/username/project"
              className="w-full h-11 rounded-lg border border-border bg-input/10 px-4 text-sm text-foreground placeholder-muted-foreground/50 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Project Image
            </label>
            
            <input type="hidden" name="originalImageUrl" value={project?.image || ''} />
            <input
              id="image-upload"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl border border-border/80 bg-muted/20 group/preview"
                >
                  <Image
                    src={imagePreview}
                    alt="Project image preview"
                    fill
                    className="object-cover"
                  />
                  
                  {/* Hover/Drag Replace Overlay */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 text-white gap-2 pointer-events-none",
                    isDraggingOver ? "opacity-100" : "opacity-0 group-hover/preview:opacity-100"
                  )}>
                    <Upload className="size-6 animate-bounce" />
                    <span className="text-xs font-medium">
                      {isDraggingOver ? "Drop to replace image" : "Drag or click to change image"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditImage}
                    className="absolute top-3 right-12 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/85"
                    title="Crop / Resize Image"
                  >
                    <Crop className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/85"
                  >
                    <X className="size-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('image-upload')?.click()} 
                    className="absolute inset-0 z-20 cursor-pointer opacity-0" 
                    aria-label="Change image" 
                  />
                </div>
              ) : (
                <label
                  htmlFor="image-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center aspect-[16/9] w-full max-w-md rounded-xl border border-dashed cursor-pointer transition-all duration-200 group",
                    isDraggingOver 
                      ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5" 
                      : "border-border/80 bg-input/5 hover:bg-input/10 hover:border-primary/40"
                  )}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    <div className={cn(
                      "grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-all mb-3 duration-200",
                      isDraggingOver ? "bg-primary/20 text-primary scale-110 rotate-3" : "group-hover:text-primary"
                    )}>
                      <Upload className="size-5" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isDraggingOver ? "text-primary" : "text-foreground"
                    )}>
                      {isDraggingOver ? "Drop image here!" : "Click or drag image here"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP (max 4MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Architecture Diagram Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              System Architecture Diagram
            </label>
            
            <input type="hidden" name="originalArchitectureImageUrl" value={project?.architecture_image || ''} />
            <input
              id="architecture-upload"
              name="architecture_image"
              type="file"
              accept="image/*"
              onChange={handleArchChange}
              className="hidden"
            />

            <div className="flex flex-col gap-4">
              {archPreview ? (
                <div 
                  onDragOver={handleDragOverArch}
                  onDragLeave={handleDragLeaveArch}
                  onDrop={handleDropArch}
                  className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl border border-border/80 bg-muted/20 group/arch-preview"
                >
                  <Image
                    src={archPreview}
                    alt="Architecture diagram preview"
                    fill
                    className="object-cover"
                  />
                  
                  {/* Hover/Drag Replace Overlay */}
                  <div className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 text-white gap-2 pointer-events-none",
                    isDraggingOverArch ? "opacity-100" : "opacity-0 group-hover/arch-preview:opacity-100"
                  )}>
                    <Upload className="size-6 animate-bounce" />
                    <span className="text-xs font-medium">
                      {isDraggingOverArch ? "Drop to replace diagram" : "Drag or click to change diagram"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditArch}
                    className="absolute top-3 right-12 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/85"
                    title="Crop / Resize Image"
                  >
                    <Crop className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveArch}
                    className="absolute top-3 right-3 z-30 grid size-8 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/85"
                  >
                    <X className="size-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('architecture-upload')?.click()} 
                    className="absolute inset-0 z-20 cursor-pointer opacity-0" 
                    aria-label="Change architecture diagram" 
                  />
                </div>
              ) : (
                <label
                  htmlFor="architecture-upload"
                  onDragOver={handleDragOverArch}
                  onDragLeave={handleDragLeaveArch}
                  onDrop={handleDropArch}
                  className={cn(
                    "flex flex-col items-center justify-center aspect-[16/9] w-full max-w-md rounded-xl border border-dashed cursor-pointer transition-all duration-200 group",
                    isDraggingOverArch 
                      ? "border-primary bg-primary/5 scale-[1.01] shadow-lg shadow-primary/5" 
                      : "border-border/80 bg-input/5 hover:bg-input/10 hover:border-primary/40"
                  )}
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                    <div className={cn(
                      "grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground transition-all mb-3 duration-200",
                      isDraggingOverArch ? "bg-primary/20 text-primary scale-110 rotate-3" : "group-hover:text-primary"
                    )}>
                      <Upload className="size-5" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      isDraggingOverArch ? "text-primary" : "text-foreground"
                    )}>
                      {isDraggingOverArch ? "Drop diagram here!" : "Click or drag diagram here"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">System schema image (max 4MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Featured Toggle Switch */}
          <div 
            onClick={() => setFeatured(!featured)}
            className="flex items-center justify-between rounded-xl border border-border/60 bg-input/5 p-4 transition-all hover:bg-input/10 cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <label 
                htmlFor="featured-switch" 
                className="text-sm font-semibold tracking-tight text-foreground cursor-pointer"
                onClick={(e) => e.stopPropagation()} // Prevent double toggle
              >
                Feature Project
              </label>
              <p className="text-xs text-muted-foreground pr-4">
                Display this project in the Featured Work section on the homepage
              </p>
            </div>
            
            <input
              type="hidden"
              name="featured"
              value={featured ? 'true' : 'false'}
            />

            <button
              id="featured-switch"
              type="button"
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-primary/20",
                featured ? "bg-primary" : "bg-muted-foreground/30"
              )}
              role="switch"
              aria-checked={featured}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out",
                  featured ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Server action error alert */}
          {state?.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-xs text-destructive">
              {state.error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-6 mt-8">
            <Link
              href="/admin"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 border-border text-muted-foreground hover:text-foreground inline-flex items-center',
                isPending && 'pointer-events-none opacity-50'
              )}
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 px-5 gap-1.5 shadow-lg shadow-primary/15"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
      {cropperState && (
        <ImageCropperModal
          src={cropperState.src}
          filename={cropperState.filename}
          defaultAspectRatio={cropperState.aspectRatio}
          onClose={handleCropperClose}
          onConfirm={handleCropperConfirm}
        />
      )}
    </div>
  )
}
