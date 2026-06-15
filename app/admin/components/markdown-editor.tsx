'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Eye, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (val: string) => void
  placeholder: string
  rows?: number
}

export function MarkdownEditor({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow height based on scrollHeight
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea && activeTab === 'write') {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value, activeTab])

  // Simple Markdown formatting parser similar to project detail view
  const formattedContent = value
    ? value
        .replace(/^(#{1,6})([^\s#])/gm, '$1 $2')
        .replace(/(?<!\n)\r?\n(?!\r?\n)/g, '  \n')
    : ''

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={value} />
      {/* Header with Label and Tabs */}
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </label>
        
        {/* Toggle Tabs */}
        <div className="flex rounded-lg border border-border/80 bg-input/5 p-0.5 text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-md transition-all cursor-pointer",
              activeTab === 'write'
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Edit2 className="size-3" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-md transition-all cursor-pointer",
              activeTab === 'preview'
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="size-3" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview Body */}
      {activeTab === 'write' ? (
        <textarea
          id={id}
          ref={textareaRef}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-input/10 p-4 text-sm text-foreground placeholder-muted-foreground/50 transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none overflow-hidden"
        />
      ) : (
        <div 
          className={cn(
            "w-full rounded-lg border border-border bg-input/5 p-4 text-sm text-foreground overflow-y-auto resize-y min-h-[100px]",
            value ? "prose prose-invert max-w-none" : "flex items-center justify-center text-muted-foreground/30 italic select-none"
          )}
          style={{ minHeight: `${rows * 20 + 32}px` }}
        >
          {value ? (
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-xl mt-3 mb-2 font-bold text-foreground border-b border-border/40 pb-1" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-lg mt-3 mb-1.5 font-semibold text-foreground" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-base mt-2.5 mb-1 font-medium text-foreground" {...props} />,
                p: ({ node, ...props }) => <p className="text-sm leading-relaxed text-muted-foreground mb-3" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 text-sm mb-3 space-y-1 text-muted-foreground" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 text-sm mb-3 space-y-1 text-muted-foreground" {...props} />,
                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                code: ({ node, ...props }) => <code className="bg-muted px-1 py-0.5 rounded font-mono text-[0.9em] text-primary" {...props} />,
                pre: ({ node, ...props }) => <pre className="bg-muted p-3 rounded-md overflow-x-auto font-mono text-[0.85em] text-foreground mb-3 border border-border/40" {...props} />,
                a: ({ node, ...props }) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          ) : (
            "Nothing to preview yet..."
          )}
        </div>
      )}
    </div>
  )
}
