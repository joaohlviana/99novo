/**
 * 🎯 SIMPLE AVATAR UPLOAD
 * 
 * Versão simplificada do AvatarUpload que apenas processa a imagem
 * e delega o upload real para hooks externos (como useSaveTrainerAvatar)
 */

import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, X, Crop, User } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Slider } from './slider';
import { toast } from 'sonner@2.0.3';

// Types
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SimpleAvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange: (file: File) => void;  // Recebe File processado
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  allowRemove?: boolean;
  className?: string;
  label?: string;
  description?: string;
  isLoading?: boolean;  // Estado de loading externo
}

// Helper function to create image from URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Get cropped image using canvas
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  outputSize: number = 400
): Promise<Blob | null> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Não foi possível obter contexto do canvas');
    }

    // Set canvas size to desired output
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputSize,
      outputSize
    );

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    return null;
  }
}

// Size configurations
const sizeConfig = {
  sm: { container: 'w-16 h-16', icon: 'h-6 w-6', text: 'text-xs' },
  md: { container: 'w-20 h-20', icon: 'h-7 w-7', text: 'text-sm' },
  lg: { container: 'w-24 h-24', icon: 'h-8 w-8', text: 'text-sm' },
  xl: { container: 'w-32 h-32', icon: 'h-10 w-10', text: 'text-base' },
};

export const SimpleAvatarUpload: React.FC<SimpleAvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  size = 'lg',
  variant = 'circle',
  allowRemove = true,
  className,
  label,
  description,
  isLoading = false
}) => {
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  
  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = sizeConfig[size];
  const isRounded = variant === 'circle';

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea: CropArea, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageSrc = reader.result as string;
      setImageSrc(imageSrc);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropDialogOpen(true);
    });
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Process cropped image and send to parent
  const handleProcessImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImage) {
        throw new Error('Erro ao processar a imagem');
      }

      // Convert blob to File
      const processedFile = new File(
        [croppedImage], 
        `avatar-${Date.now()}.jpg`, 
        { type: 'image/jpeg' }
      );

      // Send processed file to parent
      onAvatarChange(processedFile);
      
      setIsCropDialogOpen(false);
      
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar a imagem');
    }
  };

  // Remove avatar
  const handleRemove = () => {
    // Create empty file to signal removal
    const emptyFile = new File([], '', { type: 'image/jpeg' });
    onAvatarChange(emptyFile);
  };

  // Close crop dialog
  const handleCloseCropDialog = () => {
    setIsCropDialogOpen(false);
    setSelectedFile(null);
    setImageSrc('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return (
    <>
      <div className={`flex flex-col items-center space-y-3 ${className}`}>
        {/* Avatar Display */}
        <div className="relative group">
          <div
            className={`
              ${config.container} relative overflow-hidden border-2 border-dashed border-gray-300 
              flex items-center justify-center cursor-pointer transition-all
              ${isRounded ? 'rounded-full' : 'rounded-lg'}
              ${currentAvatarUrl ? 'border-solid border-gray-200 hover:border-gray-300' : 'hover:border-gray-400 hover:bg-gray-50'}
              ${isLoading ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            aria-label={currentAvatarUrl ? 'Alterar avatar' : 'Fazer upload do avatar'}
          >
            {currentAvatarUrl ? (
              <Avatar className={`${config.container} ${isRounded ? 'rounded-full' : 'rounded-lg'}`}>
                <AvatarImage 
                  src={currentAvatarUrl} 
                  alt="Avatar do usuário"
                  className="object-cover"
                />
                <AvatarFallback>
                  <User className={config.icon} />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="text-center text-gray-500">
                <Camera className={`${config.icon} mx-auto mb-1`} />
                <p className={`${config.text} font-medium`}>
                  {isLoading ? 'Enviando...' : 'Foto'}
                </p>
              </div>
            )}

            {/* Overlay on hover */}
            {currentAvatarUrl && !isLoading && (
              <div className={`
                absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center 
                opacity-0 group-hover:opacity-100 transition-opacity
                ${isRounded ? 'rounded-full' : 'rounded-lg'}
              `}>
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>

          {/* Remove button */}
          {allowRemove && currentAvatarUrl && !isLoading && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              size="icon"
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full shadow-sm"
              aria-label="Remover avatar"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Label and description */}
        {label && (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      {/* Crop Dialog with react-easy-crop */}
      <Dialog open={isCropDialogOpen} onOpenChange={handleCloseCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="h-5 w-5" />
              Ajustar Imagem
            </DialogTitle>
            <DialogDescription>
              Ajuste o enquadramento e zoom da sua imagem de perfil conforme desejado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* React Easy Crop */}
            <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1} // Square aspect ratio for avatars
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape={isRounded ? 'round' : 'rect'}
                  showGrid={false}
                  style={{
                    containerStyle: {
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }
                  }}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="px-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom
              </label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Instructions */}
            <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded">
              Arraste para reposicionar e use o controle de zoom para ajustar sua imagem
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseCropDialog}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessImage}
              disabled={!imageSrc || !croppedAreaPixels}
              className="bg-brand hover:bg-brand-hover"
            >
              <Upload className="h-4 w-4 mr-2" />
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SimpleAvatarUpload;