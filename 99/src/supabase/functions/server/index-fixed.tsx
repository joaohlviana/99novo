import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage buckets and attempt RLS setup
async function initializeStorageBuckets() {
  const requiredBuckets = [
    {
      name: 'make-e547215c-avatars',
      public: false, // Private bucket for security
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    {
      name: 'make-e547215c-trainer-assets',
      public: false,
      fileSizeLimit: 52428800, // 50MB for trainer galleries
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    },
    {
      name: 'make-e547215c-documents',
      public: false,
      fileSizeLimit: 10485760, // 10MB for PDFs/certificates
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
    },
    {
      name: 'make-e547215c-program-media',
      public: false,
      fileSizeLimit: 5242880, // 5MB for program media
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    }
  ];
  
  try {
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }
    
    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    console.log('📂 Buckets existentes:', existingBucketNames);
    
    // Check and fix bucket privacy settings
    for (const bucketConfig of requiredBuckets) {
      const existingBucket = existingBuckets?.find(b => b.name === bucketConfig.name);
      
      if (existingBucket) {
        console.log(`✅ Bucket '${bucketConfig.name}' encontrado`);
        
        // Check if bucket is incorrectly public
        if (existingBucket.public && !bucketConfig.public) {
          console.log(`🔧 Corrigindo bucket público '${bucketConfig.name}' para privado...`);
          
          const { error: updateError } = await supabase.storage.updateBucket(
            bucketConfig.name,
            { public: false }
          );
          
          if (updateError) {
            console.error(`❌ Erro ao tornar bucket privado '${bucketConfig.name}':`, updateError);
          } else {
            console.log(`✅ Bucket '${bucketConfig.name}' agora é privado`);
          }
        } else if (!existingBucket.public && !bucketConfig.public) {
          console.log(`✅ Bucket '${bucketConfig.name}' já está privado (correto)`);
        }
      } else {
        console.log(`🔧 Criando bucket privado '${bucketConfig.name}'...`);
        
        const { data: newBucket, error: createError } = await supabase.storage.createBucket(
          bucketConfig.name,
          {
            public: bucketConfig.public,
            fileSizeLimit: bucketConfig.fileSizeLimit,
            allowedMimeTypes: bucketConfig.allowedMimeTypes
          }
        );
        
        if (createError) {
          console.error(`❌ Erro ao criar bucket '${bucketConfig.name}':`, createError);
        } else {
          console.log(`✅ Bucket privado '${bucketConfig.name}' criado com sucesso`);
        }
      }
    }
    
    console.log('🎯 Inicialização de buckets concluída');
  } catch (error) {
    console.error('❌ Erro na inicialização de buckets:', error);
  }
}

// Initialize buckets on startup
initializeStorageBuckets();

// Health check endpoint
app.get("/make-server-e547215c/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    backend: "supabase"
  });
});

// Generate RLS setup script for manual execution
app.get("/make-server-e547215c/generate-rls-script", (c) => {
  const sqlScript = `
-- =============================================
-- RLS POLICIES SETUP FOR STORAGE
-- Execute this script in Supabase SQL Editor
-- =============================================

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "make_users_upload" ON storage.objects;
DROP POLICY IF EXISTS "make_users_view" ON storage.objects;
DROP POLICY IF EXISTS "make_users_update" ON storage.objects;
DROP POLICY IF EXISTS "make_users_delete" ON storage.objects;

-- Create upload policy: Users can upload files to their own folder
CREATE POLICY "make_users_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media') 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create view policy: Users can view their own files
CREATE POLICY "make_users_view" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create update policy: Users can update their own files
CREATE POLICY "make_users_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create delete policy: Users can delete their own files
CREATE POLICY "make_users_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents', 'make-e547215c-program-media')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Verification: Check if policies were created
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'make_users_%';

-- Success message
SELECT 'RLS policies created successfully!' as status;
  `.trim();

  return c.text(sqlScript, 200, {
    'Content-Type': 'text/plain',
    'Content-Disposition': 'attachment; filename="setup-rls-policies.sql"'
  });
});

// Start the server
Deno.serve(app.fetch);