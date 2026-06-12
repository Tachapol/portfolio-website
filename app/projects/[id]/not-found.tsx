import Link from "next/link"
import { SearchX, ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <SearchX className="size-10 text-muted-foreground" />
      </div>
      
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Project not found
      </h1>
      
      <p className="mb-8 max-w-md text-muted-foreground">
        We couldn&apos;t find the project you&apos;re looking for. It might have been removed or the URL is incorrect.
      </p>
      
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "default" }),
          "gap-2 shadow-lg shadow-primary/20"
        )}
      >
        <ArrowLeft className="size-4" />
        Back to Portfolio
      </Link>
    </div>
  )
}
