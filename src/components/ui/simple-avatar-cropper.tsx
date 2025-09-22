/**
 * 🖼️ SIMPLE AVATAR CROPPER
 * 
 * Versão simplificada do avatar cropper para quando o cropper completo falhar
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleUserRoundIcon, XIcon } from "lucide-react";
import { useFileUpload } from "../../hooks/use-file-upload";
import { Button } from "./button";

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

interface SimpleAvatarCropperProps {
  size?: "sm" | "md" | "lg";
  onImageChange?: (imageUrl: string | null) => void;
  currentImage?: string | null;
  className?: string;
}

export function SimpleAvatarCropper({ 
  size = "md", 
  onImageChange,
  currentImage = null,
  className = ""
}: SimpleAvatarCropperProps) {
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
  });

  const previewUrl = files[0]?.preview || null;
  const fileId = files[0]?.id;

  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(currentImage);

  // Auto-apply image without cropping
  useEffect(() => {
    if (previewUrl && fileId) {
      // Clean up previous image
      safeRevokeObjectURL(finalImageUrl);
      
      setFinalImageUrl(previewUrl);
      onImageChange?.(previewUrl);
    }
  }, [previewUrl, fileId, onImageChange, finalImageUrl]);

  const handleRemoveFinalImage = useCallback(() => {
    safeRevokeObjectURL(finalImageUrl);
    setFinalImageUrl(null);
    onImageChange?.(null);
    
    // Remove from file upload state
    if (fileId) {
      removeFile(fileId);
    }
  }, [finalImageUrl, onImageChange, fileId, removeFile]);

  // Cleanup on unmount
  useEffect(() => {
    const currentFinalUrl = finalImageUrl;
    return () => {
      safeRevokeObjectURL(currentFinalUrl);
    };
  }, [finalImageUrl]);

  // Size variants
  const sizeClasses = {
    sm: "size-12",
    md: "size-16", 
    lg: "size-20"
  };

  const buttonSizeClasses = {
    sm: "size-5",
    md: "size-6",
    lg: "size-7"
  };

  const iconSizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5"
  };

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
      
      {finalImageUrl && (
        <p className="text-xs text-muted-foreground text-center">
          Imagem carregada com sucesso
        </p>
      )}
    </div>
  );
}