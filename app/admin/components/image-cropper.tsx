'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { 
  X, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Crop, 
  Check, 
  ImageIcon,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageCropperModalProps {
  src: string
  filename: string
  defaultAspectRatio?: number | null // null for Freeform
  onClose: () => void
  onConfirm: (croppedFile: File) => void
}

const ASPECT_RATIOS = [
  { label: '16:9 (Cover)', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '1:1 (Square)', value: 1 / 1 },
  { label: 'Freeform', value: null },
]

const EXPORT_WIDTHS = [
  { label: 'Original', value: 'original' },
  { label: '1200px (Recommended)', value: 1200 },
  { label: '800px', value: 800 },
  { label: '600px', value: 600 },
]

const FORMATS = [
  { label: 'WebP (Optimized)', value: 'image/webp' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG (Lossless)', value: 'image/png' },
]

export function ImageCropperModal({
  src,
  filename,
  defaultAspectRatio = 16 / 9,
  onClose,
  onConfirm,
}: ImageCropperModalProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Crop configuration states
  const [aspectRatio, setAspectRatio] = useState<number | null>(defaultAspectRatio)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [exportWidth, setExportWidth] = useState<number | 'original'>(1200)
  const [format, setFormat] = useState('image/webp')
  const [quality, setQuality] = useState(0.85)

  // Image properties
  const [imageMeta, setImageMeta] = useState({ width: 0, height: 0, loaded: false })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Estimated size preview
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null)

  // Reset states when source changes
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setRotation(0)
    setImageMeta({ width: 0, height: 0, loaded: false })
  }, [src])

  // Get image natural dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageMeta({
      width: img.naturalWidth,
      height: img.naturalHeight,
      loaded: true,
    })
  }

  // Calculate viewport size (fixed width of 640px, adjusting height for aspect ratio)
  const viewportSize = useMemo(() => {
    const maxWidth = 640
    const maxHeight = 420
    
    // Determine aspect ratio to use
    let ratio = aspectRatio
    if (ratio === null && imageMeta.loaded) {
      ratio = imageMeta.width / imageMeta.height
    }
    ratio = ratio || 16 / 9

    let width = maxWidth
    let height = width / ratio

    if (height > maxHeight) {
      height = maxHeight
      width = height * ratio
    }

    return { width, height }
  }, [aspectRatio, imageMeta])

  // Swapped dimensions if rotated 90 or 270 degrees
  const isRotated90or270 = rotation === 90 || rotation === 270
  const currentImageWidth = isRotated90or270 ? imageMeta.height : imageMeta.width
  const currentImageHeight = isRotated90or270 ? imageMeta.width : imageMeta.height

  // Base scale where the image covers the viewport
  const baseScale = useMemo(() => {
    if (!imageMeta.loaded) return 1
    return Math.max(
      viewportSize.width / currentImageWidth,
      viewportSize.height / currentImageHeight
    )
  }, [imageMeta, viewportSize, currentImageWidth, currentImageHeight])

  const currentScale = baseScale * zoom

  // Clamp panning to ensure image covers the crop area
  const clampPan = (x: number, y: number, scaleVal: number) => {
    if (!imageMeta.loaded) return { x: 0, y: 0 }
    
    const renderedW = currentImageWidth * scaleVal
    const renderedH = currentImageHeight * scaleVal

    const maxPanX = Math.max(0, (renderedW - viewportSize.width) / 2)
    const maxPanY = Math.max(0, (renderedH - viewportSize.height) / 2)

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    }
  }

  // Handle zooming
  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(1, Math.min(3, newZoom))
    setZoom(clampedZoom)
    
    // Recalculate clamped pan with the new scale
    const newScale = baseScale * clampedZoom
    setPan((prev) => clampPan(prev.x, prev.y, newScale))
  }

  // Handle Drag / Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageMeta.loaded) return
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
    
    const targetPan = {
      x: panStart.x + dx,
      y: panStart.y + dy,
    }
    
    setPan(clampPan(targetPan.x, targetPan.y, currentScale))
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  // Touch Support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageMeta.loaded || e.touches.length !== 1) return
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
    
    const targetPan = {
      x: panStart.x + dx,
      y: panStart.y + dy,
    }
    
    setPan(clampPan(targetPan.x, targetPan.y, currentScale))
  }

  // Clockwise rotation
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  // Clean filename extension and apply correct output extension
  const getOutputFilename = () => {
    const dotIdx = filename.lastIndexOf('.')
    const baseName = dotIdx !== -1 ? filename.substring(0, dotIdx) : filename
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg'
    return `${baseName}-cropped.${ext}`
  }

  // Render on invisible canvas to compute size estimation and final export
  const generateCroppedBlob = (onComplete: (blob: Blob) => void) => {
    const img = imageRef.current
    if (!img || !imageMeta.loaded) return

    // Viewport Aspect Ratio
    let ratio = aspectRatio
    if (ratio === null) {
      ratio = imageMeta.width / imageMeta.height
    }
    ratio = ratio || 16 / 9

    // Export width determination
    const finalWidth = exportWidth === 'original' ? currentImageWidth : exportWidth
    const finalHeight = finalWidth / ratio

    // Create Canvas
    const canvas = document.createElement('canvas')
    canvas.width = finalWidth
    canvas.height = finalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw background color (white for JPG/WebP transparency support)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, finalWidth, finalHeight)

    // Compute transformations
    ctx.save()

    // 1. Center of canvas
    ctx.translate(finalWidth / 2, finalHeight / 2)

    // 2. Apply Pan (translated to canvas coordinate space)
    const scaleToCanvas = finalWidth / viewportSize.width
    const canvasPanX = pan.x * scaleToCanvas
    const canvasPanY = pan.y * scaleToCanvas
    ctx.translate(canvasPanX, canvasPanY)

    // 3. Apply Rotation
    ctx.rotate((rotation * Math.PI) / 180)

    // 4. Apply Scale
    // Scale on canvas matches rendering scale adjusted by the output target sizing ratio
    const canvasScale = currentScale * scaleToCanvas
    ctx.scale(canvasScale, canvasScale)

    // 5. Draw the source image centered
    ctx.drawImage(img, -imageMeta.width / 2, -imageMeta.height / 2, imageMeta.width, imageMeta.height)

    ctx.restore()

    // Convert to Blob
    canvas.toBlob(
      (blob) => {
        if (blob) onComplete(blob)
      },
      format,
      format === 'image/png' ? undefined : quality
    )
  }

  // Size estimation debounced/effect
  useEffect(() => {
    if (!imageMeta.loaded) return

    const timer = setTimeout(() => {
      generateCroppedBlob((blob) => {
        const kb = blob.size / 1024
        if (kb > 1024) {
          setEstimatedSize(`${(kb / 1024).toFixed(2)} MB`)
        } else {
          setEstimatedSize(`${Math.round(kb)} KB`)
        }
      })
    }, 400)

    return () => clearTimeout(timer)
  }, [src, zoom, pan, rotation, aspectRatio, exportWidth, format, quality, imageMeta.loaded])

  const handleApply = () => {
    generateCroppedBlob((blob) => {
      const croppedFile = new File([blob], getOutputFilename(), {
        type: format,
        lastModified: Date.now(),
      })
      onConfirm(croppedFile)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Column: Visual Viewport */}
        <div className="flex-1 bg-neutral-950 flex flex-col items-center justify-center p-6 relative select-none min-h-[360px] md:min-h-0 border-r border-border/10">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="text-[10px] tracking-wide uppercase font-mono bg-black/60 backdrop-blur-md border border-border/20 text-muted-foreground px-2.5 py-1 rounded-md">
              Preview Box
            </span>
          </div>

          {/* Crop Container Box */}
          <div 
            ref={containerRef}
            className="relative overflow-hidden border border-primary/20 shadow-inner bg-neutral-900 flex items-center justify-center cursor-move"
            style={{
              width: `${viewportSize.width}px`,
              height: `${viewportSize.height}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            {/* The Image itself */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={src}
              crossOrigin="anonymous"
              alt="Source raw upload"
              onLoad={handleImageLoad}
              className="max-w-none pointer-events-none transition-transform duration-75 select-none"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${currentScale})`,
                transformOrigin: 'center',
              }}
            />

            {/* Grid helper overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/40">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          </div>

          {/* Zoom Controls Overlay */}
          <div className="mt-5 flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-border/20 backdrop-blur-sm w-full max-w-xs">
            <button
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <button
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Settings Panels */}
        <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-card text-foreground gap-6 overflow-y-auto">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Crop className="size-4 text-primary" />
                  Crop & Resize
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Optimize image parameters</p>
              </div>
              <button
                onClick={onClose}
                className="grid place-items-center size-7 rounded-lg border border-border hover:bg-input/10 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Aspect Ratio Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ASPECT_RATIOS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setAspectRatio(item.value)
                      setPan({ x: 0, y: 0 })
                      setZoom(1)
                    }}
                    className={cn(
                      "text-xs px-2.5 py-1.5 border rounded-lg text-left transition-all hover:bg-input/5 font-medium",
                      aspectRatio === item.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step-wise Rotation */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                Rotate
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRotate}
                className="w-full justify-center gap-1.5 h-9 text-xs border-border"
              >
                <RotateCw className="size-3.5" />
                Rotate 90° Clockwise
              </Button>
            </div>

            {/* Resolution/Width presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                Resize Width
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {EXPORT_WIDTHS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setExportWidth(item.value as number | 'original')}
                    className={cn(
                      "text-xs px-2.5 py-1.5 border rounded-lg text-left transition-all hover:bg-input/5 font-medium",
                      exportWidth === item.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formats Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-input/10 px-2.5 text-xs text-foreground outline-none focus:border-primary"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Size & Dimension Estimates */}
            {imageMeta.loaded && (
              <div className="rounded-xl border border-border/60 bg-input/5 p-3.5 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original:</span>
                  <span>{imageMeta.width} x {imageMeta.height} px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Export size:</span>
                  <span>
                    {exportWidth === 'original' ? currentImageWidth : exportWidth} x{' '}
                    {Math.round(
                      (exportWidth === 'original' ? currentImageWidth : exportWidth) /
                        (aspectRatio || imageMeta.width / imageMeta.height)
                    )}{' '}
                    px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Est:</span>
                  <span className="text-primary font-bold">{estimatedSize || 'Calculating...'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-4 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 h-9 border-border text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 h-9 gap-1 shadow-lg shadow-primary/15"
            >
              <Check className="size-3.5" />
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
