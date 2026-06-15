import { createStaticClient } from "@/lib/supabase/static"
import { notFound } from "next/navigation"
import Image from "next/image"
import { ZoomableImage } from "@/components/zoomable-image"
import Link from "next/link"
import ReactMarkdown from 'react-markdown'

interface MarkdownContentProps {
  content: string
  className?: string
  size?: 'sm' | 'base'
}

function MarkdownContent({ content, className, size = 'base' }: MarkdownContentProps) {
  const isSm = size === 'sm'
  
  // Format headers that are missing a space after #, e.g. "#Header" -> "# Header"
  // Also preserve single newlines as line breaks
  const formattedContent = content
    ? content
        .replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
        .replace(/(?<!\n)\r?\n(?!\r?\n)/g, '  \n')
    : ''

  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className={`${isSm ? 'text-xl mt-4 mb-2' : 'text-3xl mt-6 mb-4'} font-bold tracking-tight text-foreground`} {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className={`${isSm ? 'text-lg mt-3.5 mb-1.5' : 'text-2xl mt-5 mb-3'} font-semibold tracking-tight text-foreground`} {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className={`${isSm ? 'text-base mt-3 mb-1' : 'text-xl mt-4 mb-2'} font-medium tracking-tight text-foreground`} {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className={`${isSm ? 'text-sm mb-3' : 'text-base mb-4'} leading-relaxed text-muted-foreground`} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className={`list-disc pl-5 ${isSm ? 'text-sm mb-3 space-y-1' : 'text-base mb-4 space-y-2'} text-muted-foreground`} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className={`list-decimal pl-5 ${isSm ? 'text-sm mb-3 space-y-1' : 'text-base mb-4 space-y-2'} text-muted-foreground`} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          code: ({ node, ...props }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[0.85em] text-foreground" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-[0.85em] text-foreground mb-4 border border-border/40" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-primary hover:underline font-medium" {...props} />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  )
}
import { ArrowLeft, Calendar, FileText, ArrowUpRight, Award, Activity, Cpu, Code, Layers } from "lucide-react"

export const revalidate = 60 // Revalidate every minute if using static generation

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id")

  return projects?.map((project) => ({
    id: project.id,
  })) || []
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const supabase = createStaticClient()

  // First try to fetch from Supabase
  const { data: project } = await supabase
    .from("projects")
    .select("title, summary, image")
    .eq("id", id)
    .single()

  if (!project) {
    return {
      title: "Project Not Found",
    }
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.summary,
    openGraph: {
      images: [project.image || "/placeholder.svg"],
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  
  const supabase = createStaticClient()

  // If this ID matches a static fallback in a real scenario, you'd handle it.
  // For now, we query the database directly.
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !project) {
    notFound()
  }

  const currentOrder = project.order_index ?? 0
  
  // 1. Fetch next project in order_index sequence
  const { data: nextProjects } = await supabase
    .from("projects")
    .select("id, title, summary, image")
    .gt("order_index", currentOrder)
    .order("order_index", { ascending: true })
    .limit(1)

  let nextProject = nextProjects && nextProjects.length > 0 ? nextProjects[0] : null

  // 2. Wrap around if last project
  if (!nextProject) {
    const { data: firstProjects } = await supabase
      .from("projects")
      .select("id, title, summary, image")
      .order("order_index", { ascending: true })
      .limit(1)

    if (firstProjects && firstProjects.length > 0 && firstProjects[0].id !== id) {
      nextProject = firstProjects[0]
    }
  }

  const createdAt = new Date(project.created_at || Date.now())
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(createdAt)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            {project.featured && (
              <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary shadow-sm shadow-primary/20">
                Featured Project
              </span>
            )}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              {project.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground text-pretty max-w-2xl">
              {project.summary}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>{formattedDate}</span>
              </div>
              
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/80 rounded-full px-3.5 py-1 bg-secondary/30 hover:bg-secondary/60"
                >
                  <Code className="size-4" />
                  View Source
                </a>
              )}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="pt-4 flex flex-wrap gap-2">
                {project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-foreground shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Hero Image */}
          {project.image && (
            <div className="w-full lg:w-1/2 flex-shrink-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl ring-1 ring-white/10 lg:aspect-[16/10]">
                <ZoomableImage
                  src={project.image}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  containerClassName="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="mt-20 grid gap-12 md:grid-cols-3">
          
          <div className="md:col-span-2 space-y-16">
            {project.overview && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Project Overview</h2>
                </div>
                <MarkdownContent content={project.overview} size="base" />
              </section>
            )}

            {project.challenges && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Activity className="size-5 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Challenges & Solutions</h2>
                </div>
                <MarkdownContent content={project.challenges} size="base" />
              </section>
            )}

            {project.architecture_image && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Layers className="size-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    System Architecture & Pipeline Design
                  </h2>
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-xl backdrop-blur-sm">
                  <ZoomableImage
                    src={project.architecture_image}
                    alt={`${project.title} System Architecture Diagram`}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 1200px) 100vw, 768px"
                    containerClassName="w-full h-full"
                  />
                </div>
              </section>
            )}
          </div>

          <div className="space-y-12">
            {project.technologies && (
              <section className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Cpu className="size-5 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">Technologies</h3>
                </div>
                  <MarkdownContent content={project.technologies} size="sm" />
              </section>
            )}

            {project.achievements && (
              <section className="space-y-6 rounded-2xl border border-border/50 bg-card/30 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Award className="size-5 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">Key Achievements</h3>
                </div>
                  <MarkdownContent content={project.achievements} size="sm" />
              </section>
            )}
          </div>
        </div>

        {/* Read Next Project Section */}
        {nextProject && (
          <div className="mt-24 pt-16 border-t border-border/40">
            <p className="font-mono text-xs text-primary uppercase tracking-wider">Read Next Project</p>
            <Link 
              href={`/projects/${nextProject.id}`}
              className="group relative mt-6 block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20 hover:bg-card/60"
            >
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Image side */}
                {nextProject.image && (
                  <div className="relative aspect-[16/10] md:aspect-video w-full md:w-80 overflow-hidden bg-muted/20 shrink-0">
                    <Image
                      src={nextProject.image}
                      alt={nextProject.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                )}
                
                {/* Text side */}
                <div className="p-8 flex flex-col justify-between flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span>Next Case Study</span>
                      <span className="text-muted-foreground/30">•</span>
                      <span className="group-hover:text-primary transition-colors flex items-center gap-1">
                        View project
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {nextProject.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 pr-6">
                      {nextProject.summary}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
