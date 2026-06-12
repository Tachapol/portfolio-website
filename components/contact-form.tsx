"use client"

import type React from "react"
import { useState } from "react"
import { Check, Loader2, AlertCircle } from "lucide-react"
import { submitContactFormAction } from "@/app/admin/actions"

type Status = "idle" | "submitting" | "success"

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate() {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Please enter your name."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address."
    if (form.message.trim().length < 10)
      next.message = "Tell me a little more (10+ characters)."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    setStatus("submitting")
    
    try {
      const result = await submitContactFormAction(form.name, form.email, form.message)
      if (result.error) {
        setSubmitError(result.error)
        setStatus("idle")
      } else {
        setStatus("success")
        setForm({ name: "", email: "", message: "" })
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.")
      setStatus("idle")
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary"

  return (
    <section id="contact" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="font-mono text-sm text-primary">Contact</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Let&apos;s build something reliable.
            </h2>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Whether you need a pipeline rescued, a warehouse modeled, or
              dashboards your team will trust — I&apos;d love to hear about it.
            </p>

            <div className="mt-10 flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Email</span>
              <a
                href="mailto:tachapol.false@gmail.com"
                className="w-fit text-foreground underline-offset-4 hover:underline"
              >
                tachapol.false@gmail.com
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-foreground">
                Name
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClass}
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-sm text-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${fieldClass} resize-none`}
                placeholder="Tell me about your project or challenge…"
              />
              {errors.message && (
                <p className="text-xs text-destructive">{errors.message}</p>
              )}
            </div>

            {submitError && (
              <p className="text-xs text-destructive flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 p-3 rounded-xl mt-1">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{submitError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "submitting" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {status === "success" && <Check className="size-4" />}
              {status === "success"
                ? "Message sent"
                : status === "submitting"
                  ? "Sending…"
                  : "Send message"}
            </button>

            {status === "success" && (
              <p className="text-center text-xs text-muted-foreground">
                Thanks — I&apos;ll get back to you within a day or two.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
