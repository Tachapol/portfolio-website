'use client'

import { useActionState, useState } from 'react'
import { signInAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import { Lock, Mail, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInAction, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-md bg-card/40 border border-border/80 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-primary/5">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="self-start inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to site
          </Link>

          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground font-mono text-lg font-bold shadow-lg shadow-primary/20 mb-4 transition-transform hover:scale-105 duration-300">
            TC
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to manage your portfolio projects
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Email Address
            </label>
            <div className="relative flex items-center group/input">
              <Mail className="absolute left-3.5 size-4.5 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                className="w-full h-11 rounded-lg border border-border bg-input/5 pl-11 pr-4 text-sm text-foreground placeholder-muted-foreground/45 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-input/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Password
            </label>
            <div className="relative flex items-center group/input">
              <Lock className="absolute left-3.5 size-4.5 text-muted-foreground/60 transition-colors group-focus-within/input:text-primary pointer-events-none" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full h-11 rounded-lg border border-border bg-input/5 pl-11 pr-11 text-sm text-foreground placeholder-muted-foreground/45 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-input/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 flex items-center justify-center p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-input/20 transition-all outline-none focus:ring-1 focus:ring-primary/20"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {state.error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-11 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/95 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/15 active:scale-[0.99] shadow-md shadow-primary/10 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
