import Link from "next/link"
import { ArrowLeft, Database } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-6 overflow-hidden">
      {/* subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* ambient glow overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px] pointer-events-none -z-10" />

      {/* Glassmorphic card */}
      <div className="relative w-full max-w-md bg-card/25 backdrop-blur-xl border border-border/80 rounded-3xl p-8 md:p-10 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-6">
          <Database className="size-7" />
        </div>

        <h1 className="font-mono text-xs font-bold text-primary uppercase tracking-widest">
          ERROR 404
        </h1>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          Query returned 0 rows
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The requested route does not exist or has migrated to another workspace. Let&apos;s redirect your request back to safe ground.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
