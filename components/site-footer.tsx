const social = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Email", href: "mailto:tachapol.false@@gmail.com" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold">
            TC
          </span>
          <span>© {new Date().getFullYear()} Tachapol Chaimongkolsup</span>
        </div>
        <div className="flex items-center gap-6">
          {social.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
