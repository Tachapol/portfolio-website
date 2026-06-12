import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar Skeleton */}
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

      <article className="mx-auto max-w-6xl px-6 py-12 md:py-20 animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="flex flex-col gap-8 md:gap-12 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6 w-full">
            {/* Badge */}
            <div className="h-6 w-32 rounded-full bg-muted"></div>
            {/* Title */}
            <div className="space-y-3">
              <div className="h-12 w-3/4 rounded-lg bg-muted"></div>
              <div className="h-12 w-1/2 rounded-lg bg-muted"></div>
            </div>
            {/* Summary */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-muted"></div>
              <div className="h-4 w-5/6 rounded bg-muted"></div>
              <div className="h-4 w-4/6 rounded bg-muted"></div>
            </div>
            {/* Date & Tags */}
            <div className="flex gap-4 pt-6">
              <div className="h-8 w-20 rounded-full bg-muted"></div>
              <div className="h-8 w-24 rounded-full bg-muted"></div>
              <div className="h-8 w-16 rounded-full bg-muted"></div>
            </div>
          </div>

          {/* Hero Image Skeleton */}
          <div className="w-full lg:w-1/2 flex-shrink-0">
            <div className="aspect-[4/3] w-full rounded-2xl bg-muted lg:aspect-[16/10]"></div>
          </div>
        </div>

        {/* Content Sections Skeleton */}
        <div className="mt-20 grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2 space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted"></div>
                <div className="h-8 w-48 rounded bg-muted"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-4 w-5/6 rounded bg-muted"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted"></div>
                <div className="h-8 w-56 rounded bg-muted"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-muted"></div>
                <div className="h-4 w-11/12 rounded bg-muted"></div>
                <div className="h-4 w-4/5 rounded bg-muted"></div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-48 w-full rounded-2xl bg-muted"></div>
            <div className="h-48 w-full rounded-2xl bg-muted"></div>
          </div>
        </div>
      </article>
    </div>
  )
}
