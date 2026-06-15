export function Hero() {
  const metrics = [
    { value: "4B+", label: "Events / day processed" },
    { value: "38%", label: "Cloud spend reduced" },
    { value: "99.9%", label: "Pipeline freshness SLA" },
  ]

  return (
    <section id="top" className="relative overflow-hidden">
      {/* subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-40 md:pt-48">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Seeking Data Engineer Internship Opportunities
        </div>

        <h1 className="mt-8 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl">
          I build the data infrastructure behind confident decisions.
        </h1>

        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {
            "Hi, I'm Tachapol Chaimongkolsup. I'm a Computer Engineering student at King Mongkut's University of Technology Thonburi (KMUTT) with a strong interest in Data Engineering, Analytics, and Data Platforms."
          }
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#work"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            View featured work
          </a>
          <a
            href="#resume"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Download résumé
          </a>
        </div>

        {/* Hide metrics as requested
        <dl className="mt-20 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-card px-6 py-7">
              <dt className="font-mono text-3xl font-semibold tracking-tight text-foreground">
                {m.value}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">{m.label}</dd>
            </div>
          ))}
        </dl>
        */}
      </div>
    </section>
  )
}
