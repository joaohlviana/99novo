"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Button } from './button';
import { FileUpload } from './file-upload';
import { Plus, X, Upload, Loader2 } from 'lucide-react';
import { cn } from './utils';
import { mediaUploadService } from '../../services/media-upload.service';
import { toast } from 'sonner@2.0.3';

interface GalleryUploadProps {
  images: string[];
  onImagesChange?: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  uploadFolder?: string;
  disabled?: boolean;
}

export function GalleryUpload({
  images = [],
  onImagesChange,
  maxImages = 8,
  className,
  uploadFolder = 'program-gallery',
  disabled = false
}: GalleryUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (files: Array<{ id: string; file: File; preview: string }>) => {
    console.log('📁 Arquivos selecionados:', files.length);
    setPendingFiles(files);
  };

  const handleAddImages = async () => {
    if (pendingFiles.length === 0) return;

    try {
      setUploading(true);
      console.log('📤 Iniciando upload de', pendingFiles.length, 'arquivo(s)');

      // Upload dos arquivos para Supabase Storage
      const filesToUpload = pendingFiles.map(f => f.file);
      const uploadResults = await mediaUploadService.uploadMultipleFiles(filesToUpload, {
        folder: uploadFolder
      });

      // Obter URLs dos uploads
      const newImageUrls = uploadResults.map(result => result.url);
      
      // Adicionar às imagens existentes
      const updatedImages = [...images, ...newImageUrls].slice(0, maxImages);
      onImagesChange?.(updatedImages);

      // Resetar estado
      setPendingFiles([]);
      setIsOpen(false);

      toast.success(`${newImageUrls.length} imagem(ns) adicionada(s) com sucesso!`);
      console.log('✅ Upload concluído:', newImageUrls);

    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      toast.error('Erro ao fazer upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange?.(newImages);
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
            <img 
              src={image} 
              alt={`Galeria ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveImage(index)}
                className="h-8 w-8 p-0"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {canAddMore && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex items-center justify-center group">
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Adicionar
                  </p>
                </div>
              </div>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Fotos à Galeria</DialogTitle>
                <DialogDescription>
                  Selecione e faça upload de novas fotos para sua galeria.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você pode adicionar até {maxImages - images.length} foto(s) adicional(is).
                </p>

                <FileUpload
                  accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                  maxSizeMB={5}
                  onFileSelect={handleFileSelect}
                >
                  Selecione as fotos para upload
                </FileUpload>

                {pendingFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Arquivos selecionados:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {pendingFiles.map((file, index) => (
                        <div key={file.id} className="aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={file.preview} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pendingFiles.length} arquivo(s) • {pendingFiles.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024 < 1 
                        ? `${(pendingFiles.reduce((acc, f) => acc + f.file.size, 0) / 1024).toFixed(1)} KB`
                        : `${(pendingFiles.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(1)} MB`
                      }
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setPendingFiles([]);
                    }}
                    className="w-full sm:w-auto"
                    disabled={uploading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddImages}
                    disabled={pendingFiles.length === 0 || uploading}
                    className="bg-[#e0093e] hover:bg-[#c0082e] w-full sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fazendo Upload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Fazer Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{images.length} de {maxImages} fotos adicionadas</span>
        {uploading && (
          <div className="flex items-center gap-1 text-brand">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
}