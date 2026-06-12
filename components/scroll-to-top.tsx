'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollToTop listens to Next.js route transitions and forces
 * the viewport to scroll to the top immediately.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Force immediate scroll to top on path change
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
