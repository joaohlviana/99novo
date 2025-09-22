import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, X, Crop, User, Loader2 } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import { Slider } from './slider';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../../lib/supabase/client';

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

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  bucketName?: string;
  allowRemove?: boolean;
  className?: string;
  label?: string;
  description?: string;
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

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  size = 'lg',
  variant = 'circle',
  bucketName = 'avatars',
  allowRemove = true,
  className,
  label,
  description
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'processing' | 'uploading' | 'finalizing' | ''>('');
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

  // Upload cropped image with progress tracking
  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('processing');
    
    try {
      // Stage 1: Processing image (0-25%)
      setUploadProgress(10);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImage) {
        throw new Error('Erro ao processar a imagem');
      }
      setUploadProgress(25);

      // Stage 2: Authentication (25-35%)
      setUploadStage('uploading');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }
      setUploadProgress(35);

      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `avatar-${user.id}-${timestamp}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      // Stage 3: Remove old avatar (35-45%)
      if (currentAvatarUrl && currentAvatarUrl.includes(bucketName)) {
        try {
          const oldPath = extractFilePathFromUrl(currentAvatarUrl, bucketName);
          if (oldPath) {
            await supabase.storage.from(bucketName).remove([oldPath]);
          }
        } catch (error) {
          console.warn('Não foi possível remover avatar anterior:', error);
        }
      }
      setUploadProgress(45);

      // Stage 4: Upload new avatar (45-75%)
      setUploadProgress(50);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, croppedImage, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false // Don't overwrite, create new file
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }
      setUploadProgress(75);

      // Stage 5: Generate URL (75-100%)
      setUploadStage('finalizing');
      setUploadProgress(85);
      
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        // Fallback to public URL if signed URL fails
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);
        onAvatarChange(publicUrl);
      } else {
        onAvatarChange(signedUrlData.signedUrl);
      }

      setUploadProgress(100);
      setIsCropDialogOpen(false);
      toast.success('Avatar atualizado com sucesso!');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
    }
  };

  // Helper function to extract file path from URL
  const extractFilePathFromUrl = (url: string, bucketName: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === bucketName);
      
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Remove avatar following Supabase best practices
  const handleRemove = async () => {
    if (!currentAvatarUrl) return;

    try {
      setIsUploading(true);
      
      // Extract file path and delete from storage
      if (currentAvatarUrl.includes(bucketName)) {
        const filePath = extractFilePathFromUrl(currentAvatarUrl, bucketName);
        if (filePath) {
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);
          
          if (error) {
            console.warn('Erro ao remover arquivo do storage:', error);
          }
        }
      }

      onAvatarChange('');
      toast.success('Avatar removido com sucesso!');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Erro ao remover avatar');
    } finally {
      setIsUploading(false);
    }
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
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onClick={() => fileInputRef.current?.click()}
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
                {isUploading ? (
                  <Loader2 className={`${config.icon} animate-spin mx-auto mb-1`} />
                ) : (
                  <Camera className={`${config.icon} mx-auto mb-1`} />
                )}
                <p className={`${config.text} font-medium`}>
                  {isUploading ? 'Enviando...' : 'Foto'}
                </p>
              </div>
            )}

            {/* Overlay on hover */}
            {currentAvatarUrl && !isUploading && (
              <div className={`
                absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center 
                opacity-0 group-hover:opacity-100 transition-opacity
                ${isRounded ? 'rounded-full' : 'rounded-lg'}
              `}>
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}

            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className={`
                absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center 
                text-white ${isRounded ? 'rounded-full' : 'rounded-lg'}
              `}>
                <div className="text-center space-y-2">
                  {/* Circular Progress Ring */}
                  <div className="relative w-12 h-12">
                    <svg 
                      className="w-12 h-12 transform -rotate-90" 
                      viewBox="0 0 48 48"
                    >
                      {/* Background circle */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="4"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="#e0093e"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - uploadProgress / 100)}`}
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    {/* Percentage text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold">{Math.round(uploadProgress)}%</span>
                    </div>
                  </div>
                  
                  {/* Stage text */}
                  <p className="text-xs font-medium">
                    {uploadStage === 'processing' && 'Processando...'}
                    {uploadStage === 'uploading' && 'Enviando...'}
                    {uploadStage === 'finalizing' && 'Finalizando...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Remove button */}
          {allowRemove && currentAvatarUrl && !isUploading && (
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
              disabled={isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !imageSrc || !croppedAreaPixels}
              className="bg-brand hover:bg-brand-hover relative overflow-hidden"
            >
              {isUploading ? (
                <>
                  {/* Progress bar background */}
                  <div 
                    className="absolute inset-0 bg-brand-hover transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <div className="relative flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {uploadStage === 'processing' && 'Processando...'}
                    {uploadStage === 'uploading' && 'Enviando...'}
                    {uploadStage === 'finalizing' && 'Finalizando...'}
                    <span className="ml-2 text-xs">({Math.round(uploadProgress)}%)</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Aplicar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarUpload;