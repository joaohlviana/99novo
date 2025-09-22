"use client";

import * as React from "react";
import { cn } from "./utils";

interface CropperContextType {
  image?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  setCropData?: (data: { x: number; y: number; width: number; height: number }) => void;
}

const CropperContext = React.createContext<CropperContextType>({});

interface CropperProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  onCropChange?: (cropData: { x: number; y: number; width: number; height: number }) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

function Cropper({ 
  className, 
  image, 
  onCropChange,
  zoom = 1,
  onZoomChange,
  children, 
  ...props 
}: CropperProps) {
  const [cropData, setCropData] = React.useState({
    x: 10,
    y: 10,
    width: 200,
    height: 200,
  });

  const handleCropChange = React.useCallback((newCropData: typeof cropData) => {
    setCropData(newCropData);
    onCropChange?.(newCropData);
  }, [onCropChange]);

  return (
    <CropperContext.Provider value={{ image, cropData, setCropData: handleCropChange }}>
      <div
        className={cn(
          "relative w-full max-w-md mx-auto overflow-hidden rounded-lg border bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CropperContext.Provider>
  );
}

function CropperDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute top-2 left-2 z-10 rounded bg-black/50 px-2 py-1 text-xs text-white",
        className
      )}
      {...props}
    >
      Ajuste a área de corte
    </div>
  );
}

function CropperImage({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { image } = React.useContext(CropperContext);
  
  if (!image) return null;

  return (
    <img
      src={image}
      alt="Crop preview"
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  );
}

interface CropperCropAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  onMove?: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
}

function CropperCropArea({ 
  className, 
  onMove, 
  onResize,
  ...props 
}: CropperCropAreaProps) {
  const { cropData, setCropData } = React.useContext(CropperContext);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const cropAreaRef = React.useRef<HTMLDivElement>(null);

  if (!cropData || !setCropData) return null;

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!cropData) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropData.x,
      y: e.clientY - cropData.y,
    });
  }, [cropData]);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !cropAreaRef.current || !setCropData || !cropData) return;

    try {
      const parentRect = cropAreaRef.current.parentElement?.getBoundingClientRect();
      if (!parentRect) return;

      const newX = Math.max(0, Math.min(e.clientX - dragStart.x - parentRect.left, parentRect.width - cropData.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y - parentRect.top, parentRect.height - cropData.height));

      setCropData({
        ...cropData,
        x: newX,
        y: newY,
      });

      onMove?.(newX, newY);
    } catch (error) {
      console.error('Error in handleMouseMove:', error);
    }
  }, [isDragging, dragStart, cropData, setCropData, onMove]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={cropAreaRef}
      className={cn(
        "absolute border-2 border-white shadow-lg cursor-move",
        "before:absolute before:inset-0 before:bg-white/20",
        className
      )}
      style={{
        left: cropData.x,
        top: cropData.y,
        width: cropData.width,
        height: cropData.height,
      }}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {/* Corner resize handles */}
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-nw-resize" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-ne-resize" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 cursor-sw-resize" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 cursor-se-resize" />
    </div>
  );
}

export {
  Cropper,
  CropperDescription,
  CropperImage,
  CropperCropArea,
};