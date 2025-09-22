"use client";

import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  Users,
  Star,
  Camera,
  FileText,
  Settings,
  Info
} from 'lucide-react';

interface PublishStepProps {
  data: any;
  onUpdate: (data: any) => void;
  loading?: boolean;
}

export function PublishStep({ data, onUpdate, loading }: PublishStepProps) {
  // Validation checks
  const checks = {
    basicInfo: !!(data.title && data.category && data.modality && data.level && data.tags && data.tags.length >= 3),
    description: !!(data.shortDescription && data.shortDescription.length >= 100 && data.objectives && data.objectives.length >= 3 && data.whatYouGet && data.whatYouGet.length >= 3),
    structure: !!(data.duration && data.frequency),
    deliveryMode: !!(data.delivery_mode), // Validação para delivery_mode vinda do passo anterior
    pricing: !!(data.base_price && data.base_price > 0),
    gallery: !!(data.coverImage || data.galleryImages?.length > 0),
  };

  const allChecksPass = Object.values(checks).every(Boolean);
  const completionPercentage = Math.round((Object.values(checks).filter(Boolean).length / Object.values(checks).length) * 100);

  const formatDuration = () => {
    const type = data.duration_type === 'weeks' ? 'semanas' : data.duration_type === 'months' ? 'meses' : 'dias';
    return `${data.duration} ${type}`;
  };

  const getDeliveryModeDisplayInfo = (mode: string) => {
    switch(mode) {
      case 'PDF':
        return { title: '📚 E-book PDF', description: 'Material para download' };
      case 'Consultoria':
        return { title: '💬 Consultoria', description: 'Acompanhamento personalizado' };
      case 'Video':
        return { title: '🎥 Vídeo Aulas', description: 'Curso em vídeo' };
      default:
        return { title: 'Modalidade', description: 'Não definida' };
    }
  };

  const deliveryInfo = data.delivery_mode ? getDeliveryModeDisplayInfo(data.delivery_mode) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Program Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prévia do Programa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              {/* Cover Image */}
              <div className="aspect-video bg-muted flex items-center justify-center">
                {data.coverImage ? (
                  <img 
                    src={data.coverImage} 
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Imagem de capa</p>
                  </div>
                )}
              </div>
              
              {/* Program Info */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" />
                    <AvatarFallback>TR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{data.title || 'Título do Programa'}</h3>
                    <p className="text-sm text-muted-foreground mb-2">por Treinador</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{data.category || 'Categoria'}</Badge>
                      <Badge variant="outline">{data.modality || 'Modalidade'}</Badge>
                      {data.delivery_mode && <Badge variant="outline">{data.delivery_mode}</Badge>}
                      <Badge variant="outline">{data.level || 'Nível'}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {data.frequency}x por semana
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        5.0 (Novo)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-brand">
                      R$ {data.base_price || '0'}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {data.delivery_mode || 'Modo de entrega'}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {data.shortDescription?.substring(0, 150) || 'Descrição do programa...'}
                  {data.shortDescription?.length > 150 && '...'}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {(data.tags || []).slice(0, 6).map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-muted rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {(data.tags || []).length > 6 && (
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      +{data.tags.length - 6} mais
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Verificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.basicInfo ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Informações Básicas</p>
                    <p className="text-sm text-muted-foreground">
                      Título, categoria, modalidade e tags
                    </p>
                  </div>
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.description ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Descrição & Detalhes</p>
                    <p className="text-sm text-muted-foreground">
                      Descrição completa, objetivos e benefícios
                    </p>
                  </div>
                </div>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.structure ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Estrutura do Programa</p>
                    <p className="text-sm text-muted-foreground">
                      Duração e frequência
                    </p>
                  </div>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.deliveryMode ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Modalidade de Entrega</p>
                    <p className="text-sm text-muted-foreground">
                      Como o programa será entregue
                    </p>
                  </div>
                </div>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.pricing ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Preço Base</p>
                    <p className="text-sm text-muted-foreground">
                      Preço definido para o programa
                    </p>
                  </div>
                </div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {checks.gallery ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Galeria & Mídia</p>
                    <p className="text-sm text-muted-foreground">
                      Pelo menos uma imagem de capa
                    </p>
                  </div>
                </div>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📊 Resumo do Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Completude</span>
                  <span className="font-medium">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-brand h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Modalidade Treino</span>
                  <span className="font-medium">{data.modality || 'Não definida'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Entrega</span>
                  <span className="font-medium">{data.delivery_mode || 'Não selecionada'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Duração</span>
                  <span className="font-medium">{formatDuration()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Frequência</span>
                  <span className="font-medium">{data.frequency}x/semana</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preço</span>
                  <span className="font-medium">R$ {data.base_price || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tags</span>
                  <span className="font-medium">{(data.tags || []).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Imagens</span>
                  <span className="font-medium">{(data.galleryImages || []).length + (data.coverImage ? 1 : 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {deliveryInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {deliveryInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>{deliveryInfo.description}</p>
                {data.delivery_mode === 'PDF' && (
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Material para download</li>
                    <li>• Acesso vitalício</li>
                    <li>• Planilhas extras</li>
                    <li>• Guias práticos</li>
                  </ul>
                )}
                {data.delivery_mode === 'Consultoria' && (
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Chat direto com você</li>
                    <li>• Suporte personalizado</li>
                    <li>• Orientações individuais</li>
                    <li>• Acompanhamento contínuo</li>
                  </ul>
                )}
                {data.delivery_mode === 'Video' && (
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Vídeos em alta qualidade</li>
                    <li>• Conteúdo demonstrativo</li>
                    <li>• Acesso pela plataforma</li>
                    <li>• Progresso acompanhado</li>
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas Finais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Responda rapidamente aos interessados</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Mantenha as informações atualizadas</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Colete feedback dos alunos</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Atualize com novos resultados</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}