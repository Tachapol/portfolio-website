'use client'

import { useState, useTransition } from 'react'
import { deleteContactMessageAction } from '../actions'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const [confirm, setConfirm] = useState(false)

  const handleDelete = () => {
    if (!confirm) {
      setConfirm(true)
      // Reset after 3 seconds if not clicked again
      setTimeout(() => setConfirm(false), 3000)
      return
    }

    startTransition(async () => {
      const result = await deleteContactMessageAction(id)
      if (result.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button
      variant={confirm ? "destructive" : "outline"}
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
      className={`gap-1 h-8 px-2.5 text-xs font-medium transition-all ${
        confirm 
          ? 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30' 
          : 'text-muted-foreground hover:text-foreground border-border/60 hover:bg-secondary/40'
      }`}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" />
      )}
      {confirm ? "Confirm?" : "Delete"}
    </Button>
  )
}
