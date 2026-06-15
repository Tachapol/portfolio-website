"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const groups = [
  {
    category: "Languages",
    items: ["Python", "SQL", "TypeScript", "Bash"],
  },
  {
    category: "Data & Processing",
    items: ["Apache Spark", "dbt", "Airflow", "Kafka"],
  },
  {
    category: "Warehouses & Storage",
    items: ["Snowflake", "BigQuery", "Redshift", "Postgres"],
  },
  {
    category: "Cloud & Infra",
    items: ["AWS", "GCP"],
  },
  {
    category: "Analytics & BI",
    items: ["Power BI", "Tableau", "Looker"],
  },
  {
    category: "Practices",
    items: ["Data modeling", "Observability", "CI/CD", "Cost optimization"],
  },
]

const skillDescriptions: Record<string, string> = {
  // Languages
  "Python": "Primary language for data scripts, Spark applications, and orchestrator APIs.",
  "SQL": "Writing complex analytical queries, CTEs, optimization, and data modeling.",
  "Scala": "Building high-performance Spark jobs and functional data processing logic.",
  "TypeScript": "Developing robust frontends, web apps, and serverless backend API integrations.",
  "Bash": "Writing automation scripts, container entrypoints, and CI/CD pipelines.",

  // Data & Processing
  "Apache Spark": "Distributed compute engine for batch and streaming data pipelines on petabyte scale.",
  "dbt": "Transforming data in the warehouse using SQL software engineering best practices.",
  "Airflow": "Authoring, scheduling, and monitoring complex programmatic workflows.",
  "Kafka": "Real-time event streaming platform for ingesting high-throughput messaging logs.",
  "Flink": "Low-latency stateful stream processing for real-time analytics and alerts.",
  "Iceberg": "High-performance open table format for huge analytic datasets in lakehouses.",

  // Warehouses & Storage
  "Snowflake": "SaaS data warehouse with multi-cluster compute separation and secure data sharing.",
  "BigQuery": "Serverless, highly scalable cloud data warehouse with built-in ML integrations.",
  "Redshift": "AWS managed cloud data warehouse for fast, petabyte-scale analytic queries.",
  "Postgres": "Primary choice for relational databases, application state, and transactional loads.",
  "DuckDB": "Embeddable analytical database for fast local processing and serverless query acceleration.",

  // Cloud & Infra
  "AWS": "Cloud infrastructure including EMR, S3, RDS, ECS, Redshift, and Lambda functions.",
  "GCP": "Google Cloud infrastructure hosting BigQuery, GCS, GKE, Cloud Functions, and Pub/Sub.",
  "Terraform": "Infrastructure as Code to provision cloud resources repeatably and securely.",
  "Docker": "Containerizing applications and pipelines for consistent local/cloud deployment.",
  "Kubernetes": "Orchestrating containerized workloads, scaling Spark jobs, and managing services.",

  // Analytics & BI
  "Power BI": "Creating rich dashboards, DAX queries, and enterprise reporting solutions.",
  "Tableau": "Building interactive dashboards and visualizing complex business patterns.",
  "Looker": "Modeling logic with LookML to power single-source-of-truth analytics.",
  "Metabase": "Self-service open-source business intelligence for quick dashboarding.",

  // Practices
  "Data modeling": "Designing dimensional models (Kimball), One Big Table (OBT), and Data Vaults.",
  "Observability": "Setting up data quality monitoring, pipeline alerts, and SLA dashboards.",
  "CI/CD": "Automating test runs, dbt builds, and code deployment to staging/production.",
  "Cost optimization": "Analyzing warehouse credit usage, tuning Spark compute, and reducing cloud spend."
}

export function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  return (
    <section id="skills" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="font-mono text-sm text-primary">Capabilities</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            A full-stack data toolkit
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            From raw ingestion to the semantic layer, I work across the modern
            data stack with an emphasis on reliability and cost. Hover over any technology to explore my hands-on experience.
          </p>
        </div>

        {/* Removed overflow-hidden from grid, replaced with gap-6 standalone cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const isCategoryActive = activeCategory === g.category
            const isAnyActive = activeCategory !== null
            const isOtherCategory = isAnyActive && !isCategoryActive

            return (
              <div
                key={g.category}
                className={cn(
                  "bg-card rounded-2xl border border-border/60 p-6 transition-all duration-300 ease-out shadow-sm",
                  isCategoryActive && "bg-secondary/30 border-primary/20 shadow-md",
                  isOtherCategory && "opacity-35"
                )}
              >
                <h3 className={cn(
                  "text-xs font-bold uppercase tracking-wider transition-colors duration-300 ease-out",
                  isCategoryActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {g.category}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) => {
                    const isHovered = hoveredSkill === item
                    const isPeer = isCategoryActive && !isHovered

                    return (
                      <div
                        key={item}
                        className="relative"
                        onMouseEnter={() => {
                          setHoveredSkill(item)
                          setActiveCategory(g.category)
                        }}
                        onMouseLeave={() => {
                          setHoveredSkill(null)
                          setActiveCategory(null)
                        }}
                      >
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all duration-300 ease-out cursor-default select-none",
                            isHovered
                              ? "border-primary text-foreground bg-primary/10 shadow-[0_4px_12px_rgba(99,102,241,0.12)] -translate-y-[1.5px] ring-1 ring-primary/20 z-10 font-semibold"
                              : isPeer
                                ? "border-primary/30 text-foreground bg-primary/5 font-medium"
                                : "border-border/60 text-muted-foreground/80 bg-transparent hover:text-foreground hover:border-border"
                          )}
                        >
                          <span className={cn(
                            "rounded-full bg-primary shrink-0 transition-all duration-300 ease-out",
                            isHovered ? "size-1.5 opacity-100 mr-1.5 scale-100" : "size-0 opacity-0 scale-0"
                          )} />
                          {item}
                        </span>

                        {isHovered && skillDescriptions[item] && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-64 p-3.5 rounded-xl bg-card border border-border text-xs leading-normal font-sans shadow-2xl text-left z-50 pointer-events-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300 ease-out">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="size-1.5 rounded-full bg-primary" />
                              <span className="font-semibold text-foreground text-[13px] tracking-tight">{item}</span>
                            </div>
                            <p className="text-muted-foreground font-normal leading-relaxed text-[11px]">
                              {skillDescriptions[item]}
                            </p>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-card" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-border -z-10 mt-[1px]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
