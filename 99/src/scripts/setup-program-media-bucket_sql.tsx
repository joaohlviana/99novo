-- ===============================================
-- SETUP BUCKET PARA MÍDIA DOS PROGRAMAS
-- ===============================================
-- Este script configura o bucket de armazenamento para
-- imagens e vídeos dos programas de treinamento
-- Execute no Supabase SQL Editor

-- ===============================================
-- 1. CRIAR BUCKET PARA MÍDIA DOS PROGRAMAS
-- ===============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'make-e547215c-program-media',
  'make-e547215c-program-media',
  false, -- Bucket privado (URLs assinadas)
  5242880, -- 5MB em bytes
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/mov',
    'video/avi'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 2. POLÍTICAS RLS PARA O BUCKET
-- ===============================================

-- Policy: Trainers podem fazer upload de suas mídias
CREATE POLICY "trainers_upload_program_media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'make-e547215c-program-media'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] IN ('program-covers', 'program-gallery', 'program-videos')
);

-- Policy: Trainers podem ver suas próprias mídias
CREATE POLICY "trainers_view_own_program_media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'make-e547215c-program-media'
  AND auth.role() = 'authenticated'
);

-- Policy: Trainers podem deletar suas próprias mídias
CREATE POLICY "trainers_delete_own_program_media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'make-e547215c-program-media'
  AND auth.role() = 'authenticated'
);

-- Policy: Trainers podem atualizar suas próprias mídias
CREATE POLICY "trainers_update_own_program_media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'make-e547215c-program-media'
  AND auth.role() = 'authenticated'
);

-- ===============================================
-- 3. VERIFICAÇÃO
-- ===============================================

-- Verificar se bucket foi criado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'make-e547215c-program-media'
    ) THEN
        RAISE NOTICE '✅ Bucket make-e547215c-program-media criado com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Erro: Bucket não foi criado!';
    END IF;
END $$;

-- Verificar políticas criadas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'trainers_upload_program_media'
    ) THEN
        RAISE NOTICE '✅ Políticas RLS criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Algumas políticas podem não ter sido criadas.';
    END IF;
END $$;

-- ===============================================
-- 4. INFORMAÇÕES DO BUCKET
-- ===============================================

-- Mostrar configuração do bucket
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'make-e547215c-program-media';

-- Mostrar políticas criadas
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%program_media%';

-- ===============================================
-- 5. DOCUMENTAÇÃO
-- ===============================================

/*
ESTRUTURA DE PASTAS NO BUCKET:

make-e547215c-program-media/
├── program-covers/          # Thumbnails dos programas
├── program-gallery/         # Galeria de imagens
└── program-videos/          # Vídeos demonstrativos

CONFIGURAÇÕES:
- Bucket privado (URLs assinadas)
- Limite: 5MB por arquivo
- Formatos: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, AVI
- Políticas RLS: Apenas trainers autenticados

USAGE:
1. Execute este script no Supabase SQL Editor
2. O serviço MediaUploadService irá usar este bucket automaticamente
3. URLs assinadas com validade de 1 ano

NEXT STEPS:
1. Testar upload via interface
2. Verificar geração de URLs assinadas
3. Implementar limpeza de arquivos órfãos (opcional)
*/