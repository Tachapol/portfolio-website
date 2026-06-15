'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image, { ImageProps } from 'next/image'
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ZoomableImageProps extends Omit<ImageProps, 'onClick'> {
  containerClassName?: string
}

export function ZoomableImage({
  src,
  alt,
  className,
  containerClassName,
  ...props
}: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Wait for hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Prevent body scrolling when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Reset zoom & pan on open/close
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, zoom])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, prev + 0.5))
  }

  const handleZoomOut = () => {
    setZoom((prev) => {
      const nextZoom = Math.max(1, prev - 0.5)
      if (nextZoom === 1) {
        setPan({ x: 0, y: 0 })
      }
      return nextZoom
    })
  }

  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleOpenFullPage = () => {
    if (typeof src === 'string') {
      window.open(src, '_blank')
    }
  }

  const handleFullscreen = () => {
    const element = overlayRef.current
    if (!element) return

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return // No panning needed if not zoomed
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setPanStart({ x: pan.x, y: pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    // Calculate boundary constraints (optional, let's keep it fluid but check bounding client rect if possible)
    // For a premium feel, fluid movement is excellent, but clamping keeps it within viewport.
    setPan({
      x: panStart.x + dx,
      y: panStart.y + dy,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom === 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setPanStart({ x: pan.x, y: pan.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    const dx = touch.clientX - dragStart.x
    const dy = touch.clientY - dragStart.y
    setPan({
      x: panStart.x + dx,
      y: panStart.y + dy,
    })
  }

  // Mouse wheel scroll to zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 0.1 : -0.1
    setZoom((prev) => {
      const nextZoom = Math.max(1, Math.min(4, prev + zoomFactor))
      if (nextZoom === 1) {
        setPan({ x: 0, y: 0 })
      }
      return nextZoom
    })
  }

  const modalContent = isOpen && (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          setIsOpen(false)
        }
      }}
    >
      {/* Action floating header bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 p-1.5 rounded-full shadow-lg">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="grid place-items-center size-9 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Zoom In (+)"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="grid place-items-center size-9 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Zoom Out (-)"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          onClick={handleReset}
          disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
          className="grid place-items-center size-9 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Reset Zoom"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          onClick={handleFullscreen}
          className="grid place-items-center size-9 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
        <button
          onClick={handleOpenFullPage}
          className="grid place-items-center size-9 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
          title="Open in New Tab"
        >
          <ExternalLink className="size-4" />
        </button>
        <span className="h-4 w-px bg-neutral-800 mx-1" />
        <button
          onClick={() => setIsOpen(false)}
          className="grid place-items-center size-9 rounded-full bg-primary text-primary-foreground hover:brightness-110 shadow-md transition-all"
          title="Close (Esc)"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Interactive Zoomable Viewport */}
      <div 
        className={cn(
          "w-full h-full flex items-center justify-center overflow-hidden relative",
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* The Image inside the Lightbox */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            transformOrigin: 'center',
          }}
          className="relative w-[85vw] h-[85vh] flex items-center justify-center pointer-events-none select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={typeof src === 'string' ? src : undefined}
            alt={alt}
            className="max-w-full max-h-full object-contain pointer-events-none select-none rounded-lg"
          />
        </div>

        {/* Zoom scale info tag */}
        {zoom > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-800 text-[10px] tracking-wider uppercase font-mono text-neutral-400 pointer-events-none shadow-md">
            Scale: <span className="text-white font-bold">{zoom.toFixed(1)}x</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Clickable Image Preview */}
      <div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "cursor-zoom-in group relative overflow-hidden transition-all duration-300 hover:brightness-95 hover:shadow-lg", 
          containerClassName
        )}
      >
        <Image
          src={src}
          alt={alt}
          className={cn("transition-transform duration-500 group-hover:scale-[1.015]", className)}
          {...props}
        />
        {/* Hover magnifier hint */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 text-white rounded-full p-2.5 backdrop-blur-sm shadow-md border border-white/10 scale-90 group-hover:scale-100 transition-transform duration-300">
            <ZoomIn className="size-5" />
          </div>
        </div>
      </div>

      {mounted && typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent}
    </>
  )
}
