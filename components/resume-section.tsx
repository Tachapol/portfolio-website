"use client"

import { useState, useEffect } from "react"
import { Download, FileText, Eye, X } from "lucide-react"

const highlights = [
  "Computer Engineering student @ KMUTT",
  "Focus on Data Engineering, Analytics, and Data Platforms",
  "Hands-on with Python, SQL, Airflow, Snowflake, and Docker",
]

export function ResumeSection() {
  const [isOpen, setIsOpen] = useState(false)

  // Block body scroll when previewer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <section id="resume" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative grid grid-cols-1 gap-10 p-8 md:grid-cols-2 md:items-center md:p-12">
            <div>
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FileText className="size-6" />
              </div>
              <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Have the full picture
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Download my résumé for a complete look at experience, impact,
                and the tools I work with day to day.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/resume/Tachapol-Chaimongkolsup_CV.pdf"
                  download
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 cursor-pointer"
                >
                  <Download className="size-4" />
                  Download résumé
                </a>
                <button
                  onClick={() => setIsOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-secondary cursor-pointer"
                >
                  <Eye className="size-4" />
                  Preview résumé
                </button>
              </div>
            </div>

            <ul className="flex flex-col gap-px overflow-hidden rounded-2xl border border-border bg-border">
              {highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-3 bg-card px-5 py-4 text-sm text-foreground"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Fullscreen Interactive PDF Preview Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl h-[85vh] bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
          >
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-background/50">
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">Tachapol Chaimongkolsup — CV</h3>
                <p className="text-[10px] font-mono text-muted-foreground">PDF Document • Interactive Viewer</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/resume/Tachapol-Chaimongkolsup_CV.pdf"
                  download
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Frame Body */}
            <div className="flex-1 bg-muted/10 relative">
              <iframe
                src="/resume/Tachapol-Chaimongkolsup_CV.pdf"
                className="w-full h-full border-0 bg-card"
                title="Tachapol Chaimongkolsup Résumé CV"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
