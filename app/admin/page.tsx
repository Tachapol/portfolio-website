import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, LogOut, ArrowLeft, FileCode, Star, Cpu, GitBranch, Mail, MessageSquare, Clock } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signOutAction } from './actions'
import { DraggableProjectsList } from './components/draggable-projects-list'
import { DeleteMessageButton } from './components/delete-message-button'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Run auth check, projects query, and messages query in parallel to avoid sequential waterfall.
  // getUser() validates the token server-side (secure).
  const [authResult, projectsResult, messagesResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('projects')
      .select('id, title, summary, image, tags, featured, order_index, github_url')
      .order('order_index', { ascending: true }),
    supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const user = authResult.data.user
  if (!user) {
    redirect('/login')
  }

  const { data: projects, error } = projectsResult
  const { data: messages, error: messagesError } = messagesResult

  // Calculate dynamic stats
  const totalProjects = projects?.length || 0
  const featuredProjects = projects?.filter(p => p.featured).length || 0
  
  const tagsSet = new Set<string>()
  projects?.forEach(p => {
    if (p.tags) {
      p.tags.forEach(t => tagsSet.add(t))
    }
  })
  const totalTechs = tagsSet.size
  const githubLinks = projects?.filter(p => p.github_url).length || 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              View Site
            </Link>
            <span className="text-muted-foreground/40 font-mono text-[10px] select-none">|</span>
            <h1 className="text-sm font-medium tracking-tight text-foreground">
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-mono text-xs text-muted-foreground">
              Logged in as: <span className="text-foreground">{user.email}</span>
            </span>
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground border-border"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Area */}
        <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs text-primary uppercase tracking-wider">Workspace</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              Manage Projects
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl">
              Create, edit, or delete items shown in your Featured Work section.
            </p>
          </div>
          <div>
            <Link
              href="/admin/new"
              className={cn(
                buttonVariants({ variant: 'default', size: 'default' }),
                'gap-1.5 h-10 px-4 shadow-lg shadow-primary/10'
              )}
            >
              <Plus className="size-4" />
              Add New Project
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-4 select-none animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-xl border border-border/60 bg-card/25 p-4 backdrop-blur-sm hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Total Projects</span>
              <FileCode className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalProjects}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/25 p-4 backdrop-blur-sm hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Featured Work</span>
              <Star className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{featuredProjects}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/25 p-4 backdrop-blur-sm hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Technologies</span>
              <Cpu className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalTechs}</p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/25 p-4 backdrop-blur-sm hover:border-primary/20 transition-all duration-200">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold tracking-wider uppercase font-mono">GitHub Links</span>
              <GitBranch className="size-4 text-indigo-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{githubLinks}</p>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-10">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive mb-6">
              Error loading projects: {error.message}. Please check your Supabase credentials or database setup.
            </div>
          )}

          {!projects || projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border p-16 bg-card/20 backdrop-blur-sm">
              <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground mb-4">
                <FileCode className="size-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No projects found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                Your portfolio currently has no dynamic projects. Get started by adding one!
              </p>
              <Link href="/admin/new" className="mt-5">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  Add First Project
                </Button>
              </Link>
            </div>
          ) : (
            <DraggableProjectsList initialProjects={projects} />
          )}
        </div>

        {/* Inbox / Contact Messages Section */}
        <div className="mt-16 border-t border-border/60 pt-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="size-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                Inbox Messages
                {messages && messages.length > 0 && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-xs text-foreground">
                    {messages.length}
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contact submissions sent by visitors from the home page.
              </p>
            </div>
          </div>

          <div className="mt-8">
            {messagesError && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive mb-6">
                Error loading messages: {messagesError.message}
              </div>
            )}

            {!messages || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-border p-12 bg-card/25 backdrop-blur-sm">
                <MessageSquare className="size-8 text-muted-foreground/50 mb-3 animate-pulse" />
                <h3 className="text-sm font-medium text-foreground">No messages yet</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  When visitors submit the contact form on your portfolio website, their messages will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {messages.map((msg: any) => {
                  const date = new Date(msg.created_at || Date.now())
                  const formattedDate = new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(date)

                  return (
                    <div 
                      key={msg.id}
                      className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col justify-between hover:border-border transition-all duration-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground tracking-tight">{msg.name}</h4>
                            <a 
                              href={`mailto:${msg.email}`}
                              className="text-xs text-primary hover:underline font-medium break-all"
                            >
                              {msg.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground whitespace-nowrap shrink-0">
                            <Clock className="size-3" />
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap bg-secondary/20 rounded-xl p-3.5 border border-border/40 font-normal">
                          {msg.message}
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <DeleteMessageButton id={msg.id} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
