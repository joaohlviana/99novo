"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeftIcon,
  CircleUserRoundIcon,
  XIcon,
} from "lucide-react"

import { useFileUpload } from "../../hooks/use-file-upload"
import { Button } from "./button"
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "./cropper"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { SimpleAvatarCropper } from "./simple-avatar-cropper"


// Define type for pixel crop area
type Area = { x: number; y: number; width: number; height: number }

// Helper function to safely check if a URL is a blob URL
const isBlobUrl = (url: unknown): url is string => {
  return typeof url === 'string' && url.startsWith('blob:');
}

// Helper function to safely revoke object URL
const safeRevokeObjectURL = (url: unknown): void => {
  if (isBlobUrl(url)) {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('Failed to revoke object URL:', error);
    }
  }
}

// Helper function to create a cropped image blob
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  outputWidth: number = pixelCrop.width,
  outputHeight: number = pixelCrop.height
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      return null
    }

    canvas.width = outputWidth
    canvas.height = outputHeight

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob)
      }, "image/jpeg")
    })
  } catch (error) {
    console.error("Error in getCroppedImg:", error)
    return null
  }
}

interface AvatarCropperProps {
  size?: "sm" | "md" | "lg"
  onImageChange?: (imageUrl: string | null) => void
  currentImage?: string | null
  className?: string
}

export function AvatarCropper({ 
  size = "md", 
  onImageChange,
  currentImage = null,
  className = ""
}: AvatarCropperProps) {
  const [hasError, setHasError] = useState(false);

  // Use simple cropper if there's an error
  if (hasError) {
    return (
      <SimpleAvatarCropper
        size={size}
        onImageChange={onImageChange}
        currentImage={currentImage}
        className={className}
      />
    );
  }

  // Validate currentImage prop
  useEffect(() => {
    if (currentImage !== null && typeof currentImage !== 'string') {
      console.warn('AvatarCropper: currentImage prop should be a string or null, got:', typeof currentImage);
      setHasError(true);
    }
  }, [currentImage]);
  const [
    { files, isDragging },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  })

  let previewUrl: string | null = null;
  let fileId: string | undefined = undefined;

  // Safely extract file info
  try {
    previewUrl = files[0]?.preview || null;
    fileId = files[0]?.id;
  } catch (error) {
    console.error('Error accessing file upload data:', error);
    setHasError(true);
    return null;
  }

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(currentImage)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const previousFileIdRef = useRef<string | undefined | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const handleCropChange = useCallback((pixels: Area | null) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApply = async () => {
    if (!previewUrl || !fileId || !croppedAreaPixels) {
      if (fileId) {
        removeFile(fileId)
        setCroppedAreaPixels(null)
      }
      return
    }

    try {
      const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels)

      if (!croppedBlob) {
        throw new Error("Failed to generate cropped image blob.")
      }

      const newFinalUrl = URL.createObjectURL(croppedBlob)

      safeRevokeObjectURL(finalImageUrl)

      setFinalImageUrl(newFinalUrl)
      onImageChange?.(newFinalUrl)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error during apply:", error)
      setHasError(true) // Fall back to simple cropper
      setIsDialogOpen(false)
    }
  }

  const handleRemoveFinalImage = () => {
    safeRevokeObjectURL(finalImageUrl)
    setFinalImageUrl(null)
    onImageChange?.(null)
  }

  useEffect(() => {
    const currentFinalUrl = finalImageUrl
    return () => {
      safeRevokeObjectURL(currentFinalUrl)
    }
  }, [finalImageUrl])

  useEffect(() => {
    try {
      if (fileId && fileId !== previousFileIdRef.current) {
        setIsDialogOpen(true)
        setCroppedAreaPixels(null)
      }
      previousFileIdRef.current = fileId
    } catch (error) {
      console.error("Error in file ID effect:", error);
      setHasError(true);
    }
  }, [fileId])

  // Size variants
  const sizeClasses = {
    sm: "size-12",
    md: "size-16", 
    lg: "size-20"
  }

  const buttonSizeClasses = {
    sm: "size-5",
    md: "size-6",
    lg: "size-7"
  }

  const iconSizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5"
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative inline-flex">
        <button
          className={`border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex ${sizeClasses[size]} items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none`}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          aria-label={finalImageUrl ? "Change image" : "Upload image"}
        >
          {finalImageUrl ? (
            <img
              className="size-full object-cover"
              src={finalImageUrl}
              alt="User avatar"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div aria-hidden="true">
              <CircleUserRoundIcon className={`${iconSizeClasses[size]} opacity-60`} />
            </div>
          )}
        </button>

        {finalImageUrl && (
          <Button
            onClick={handleRemoveFinalImage}
            size="icon"
            className={`border-background focus-visible:border-background absolute -top-1 -right-1 ${buttonSizeClasses[size]} rounded-full border-2 shadow-none`}
            aria-label="Remove image"
          >
            <XIcon className={`${iconSizeClasses[size]}`} />
          </Button>
        )}

        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
          tabIndex={-1}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-140 *:[button]:hidden">
          <DialogDescription className="sr-only">
            Crop image dialog
          </DialogDescription>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="flex items-center justify-between border-b p-4 text-base">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-my-1 opacity-60"
                  onClick={() => setIsDialogOpen(false)}
                  aria-label="Cancel"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                </Button>
                <span>Recortar imagem</span>
              </div>
              <Button
                className="-my-1"
                onClick={handleApply}
                disabled={!previewUrl}
                autoFocus
              >
                Aplicar
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="h-96 sm:h-120">
              <Cropper
                className="h-full"
                image={previewUrl}
                onCropChange={(cropData) => {
                  try {
                    handleCropChange({
                      x: cropData.x,
                      y: cropData.y,
                      width: cropData.width,
                      height: cropData.height
                    });
                  } catch (error) {
                    console.error("Error in crop change:", error);
                    setHasError(true);
                  }
                }}
              >
                <CropperDescription />
                <CropperImage />
                <CropperCropArea />
              </Cropper>
            </div>
          )}
          <DialogFooter className="border-t px-4 py-6">
            <div className="mx-auto flex w-full max-w-80 items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Clique e arraste para ajustar a área de corte
              </span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}