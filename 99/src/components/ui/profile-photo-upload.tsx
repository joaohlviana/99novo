"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { FileUpload } from './file-upload';
import { Cropper, CropperDescription, CropperImage, CropperCropArea } from './cropper';
import { Upload, Crop, Save, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange?: (photoUrl: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ProfilePhotoUpload({
  currentPhoto,
  onPhotoChange,
  className,
  size = 'lg'
}: ProfilePhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cropData, setCropData] = useState({
    x: 10,
    y: 10,
    width: 200,
    height: 200,
  });

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const handleFileSelect = (files: Array<{ id: string; file: File; preview: string }>) => {
    if (files.length > 0) {
      setSelectedFile(files[0].preview);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      // Here you would normally process the crop and upload to your backend
      onPhotoChange?.(selectedFile);
      setIsOpen(false);
      setSelectedFile(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <Avatar className={sizeClasses[size]}>
              <AvatarImage src={currentPhoto} />
              <AvatarFallback>
                <Upload className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
              <Upload className="h-5 w-5 text-white" />
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alterar Foto de Perfil</DialogTitle>
            <DialogDescription>
              Selecione uma nova foto de perfil e ajuste o enquadramento conforme necessário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {!selectedFile ? (
              <FileUpload
                accept="image/png,image/jpeg,image/jpg"
                maxSizeMB={5}
                onFileSelect={handleFileSelect}
              >
                Selecione sua foto de perfil
              </FileUpload>
            ) : (
              <div className="space-y-4">
                <Cropper
                  className="h-80"
                  image={selectedFile}
                  onCropChange={setCropData}
                >
                  <CropperDescription />
                  <CropperImage />
                  <CropperCropArea className="rounded-full" />
                </Cropper>

                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Escolher Outra
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#e0093e] hover:bg-[#c0082e] w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Foto
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}