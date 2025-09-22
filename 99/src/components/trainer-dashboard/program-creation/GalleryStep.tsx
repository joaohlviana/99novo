"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Camera, Video, Image, Upload, X, Plus, Loader2 } from 'lucide-react';
import type { ProgramData } from '../../../services/training-programs-simple.service';
import { GalleryUpload } from '../../ui/gallery-upload';
import { mediaUploadService } from '../../../services/media-upload.service';
import { toast } from 'sonner@2.0.3';

interface GalleryStepProps {
  data: ProgramData;
  onUpdate: (data: Partial<ProgramData>) => void;
  loading?: boolean;
}

export function GalleryStep({ data, onUpdate, loading }: GalleryStepProps) {
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleCoverImageUpload = async (file: File) => {
    try {
      setUploadingCover(true);
      console.log('📤 Fazendo upload da capa:', file.name);
      
      const result = await mediaUploadService.uploadFile(file, {
        folder: 'program-covers'
      });
      
      onUpdate({ coverImage: result.url });
      toast.success('Capa carregada com sucesso!');
      
    } catch (error: any) {
      console.error('❌ Erro no upload da capa:', error);
      toast.error('Erro ao carregar capa: ' + error.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // O upload da galeria agora é feito pelo GalleryUpload component integrado

  const handleCoverImageChange = (imageUrl: string) => {
    onUpdate({ coverImage: imageUrl });
  };

  const handleGalleryChange = (images: string[]) => {
    onUpdate({ gallery: images });
  };

  const handleVideosChange = (videos: string[]) => {
    onUpdate({ videos: videos });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Main Form */}
      <div className="space-y-6">
        
        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Thumbnail do Programa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Thumbnail principal do programa *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Esta será a imagem de capa que aparecerá na listagem de programas. Escolha uma imagem atrativa e representativa.
              </p>
              
              {/* Cover Image Upload Area */}
              <div className="relative">
                {data.coverImage ? (
                  <div className="relative group">
                    <div className="aspect-video w-full rounded-xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={data.coverImage} 
                        alt="Capa do programa"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={uploadingCover}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                handleCoverImageUpload(file);
                              }
                            };
                            input.click();
                          }}
                        >
                          {uploadingCover ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4 mr-2" />
                          )}
                          {uploadingCover ? 'Carregando...' : 'Alterar'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCoverImageChange('')}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className={`aspect-video w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group ${
                      uploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                      if (uploadingCover) return;
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleCoverImageUpload(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 group-hover:text-gray-600">
                      <div className="w-16 h-16 rounded-full bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center mb-4">
                        {uploadingCover ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <Plus className="h-8 w-8" />
                        )}
                      </div>
                      <h3 className="font-medium text-lg mb-2">
                        {uploadingCover ? 'Carregando...' : 'Adicionar Thumbnail'}
                      </h3>
                      <p className="text-sm text-center max-w-xs">
                        {uploadingCover 
                          ? 'Fazendo upload da sua imagem...'
                          : 'Clique para selecionar uma imagem de capa atrativa para seu programa'
                        }
                      </p>
                      {!uploadingCover && (
                        <div className="mt-4 text-xs text-gray-400">
                          Formato recomendado: 16:9 (1920x1080px)
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Upload Tips */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Image className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Dicas para thumbnail perfeito</h4>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Use imagens de alta qualidade (mínimo 1280x720px)</li>
                        <li>• Prefira formato 16:9 para melhor visualização</li>
                        <li>• Inclua texto ou elementos que destaquem o programa</li>
                        <li>• Evite imagens muito escuras ou com pouco contraste</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Galeria de Imagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Fotos adicionais do programa</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione fotos que mostrem exercícios, resultados, equipamentos ou ambiente de treino.
              </p>
              
              <GalleryUpload
                images={data.gallery || []}
                onImagesChange={handleGalleryChange}
                maxImages={12}
                uploadFolder="program-gallery"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Vídeos Demonstrativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Vídeos do programa</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione vídeos curtos mostrando exercícios, depoimentos ou apresentação do programa.
              </p>
              
              <GalleryUpload
                images={data.videos || []}
                onImagesChange={handleVideosChange}
                maxImages={6}
                uploadFolder="program-videos"
                disabled={loading}
              />
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Video className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Dica para vídeos</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Vídeos de 30-60 segundos têm melhor engajamento. Mostre exercícios sendo executados corretamente ou depoimentos de alunos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}