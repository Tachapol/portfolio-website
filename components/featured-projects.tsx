import Image from "next/image"
import { ArrowUpRight, Code } from "lucide-react"
import { createStaticClient } from "@/lib/supabase/static"

const staticProjects = [
  {
    id: "static-1",
    title: "Real-time CDC Pipeline",
    summary:
      "Change-data-capture streaming platform ingesting 4B+ events/day from Postgres into a lakehouse with sub-minute freshness.",
    image: "/projects/pipeline.png",
    tags: ["Kafka", "Flink", "Iceberg", "AWS"],
    featured: true,
  },
  {
    id: "static-2",
    title: "Lakehouse Migration",
    summary:
      "Re-architected a legacy warehouse into a cost-aware lakehouse, cutting compute spend 38%.",
    image: "/projects/warehouse.png",
    tags: ["Snowflake", "dbt", "Terraform"],
  },
  {
    id: "static-3",
    title: "Executive Analytics Suite",
    summary:
      "Semantic layer and dashboards powering company-wide reporting with 70% faster load times.",
    image: "/projects/analytics.png",
    tags: ["Looker", "dbt", "BigQuery"],
  },
  {
    id: "static-4",
    title: "ML Feature Store",
    summary:
      "Versioned, monitored feature platform serving online and offline models with freshness SLAs.",
    image: "/projects/ml-feature.png",
    tags: ["Spark", "Feast", "Python"],
    featured: true,
  },
]

interface ProjectType {
  id: string
  title: string
  summary: string
  image?: string | null
  tags: string[]
  featured?: boolean
  github_url?: string | null
}

import Link from "next/link"

function ProjectCard({ project }: { project: ProjectType }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/20 hover:bg-card/60">
      <Link
        href={`/projects/${project.id}`}
        className="relative aspect-[16/10] overflow-hidden border-b border-border"
      >
        <Image
          src={project.image || "/placeholder.svg"}
          alt={`${project.title} interface preview`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <Link href={`/projects/${project.id}`} className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
              {project.title}
            </h3>
            <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {project.summary}
          </p>
        </Link>
        <div className="mt-5 flex items-center justify-between gap-4 flex-wrap border-t border-border/40 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-input/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors border border-border/80 rounded-full px-2.5 py-1 bg-secondary/50 hover:bg-secondary"
            >
              <Code className="size-3.5" />
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export async function FeaturedProjects() {
  let dbProjects: ProjectType[] = []

  try {
    const supabase = createStaticClient()
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, summary, image, tags, featured, github_url")
      .order("order_index", { ascending: true })

    if (data && data.length > 0 && !error) {
      dbProjects = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        image: item.image,
        tags: item.tags || [],
        featured: item.featured,
        github_url: item.github_url,
      }))
    }
  } catch (err) {
    console.warn("Could not load projects from Supabase. Falling back to static projects.", err)
  }

  // Use DB projects if available, otherwise static fallback
  const baseProjects = dbProjects.length > 0 ? dbProjects : staticProjects
  const projectsToShow = baseProjects.filter((p) => p.featured)

  return (
    <section id="work" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-sm text-primary">Featured work</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Selected data platforms & analytics
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A few systems I&apos;ve designed and shipped end to end — from
            ingestion to the dashboards leaders rely on.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {projectsToShow.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
