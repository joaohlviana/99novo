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

// Initialize storage buckets (without RLS setup)
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
    
    for (const bucketConfig of requiredBuckets) {
      if (existingBucketNames.includes(bucketConfig.name)) {
        console.log(`✅ Bucket '${bucketConfig.name}' já existe`);
      } else {
        console.log(`🔧 Criando bucket '${bucketConfig.name}'...`);
        
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
          console.log(`✅ Bucket '${bucketConfig.name}' criado com sucesso`);
        }
      }
    }
    
    console.log('🎯 Inicialização de buckets concluída');
    console.log('⚠️ RLS policies devem ser configuradas manualmente no Supabase Dashboard');
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

// Storage setup endpoint - alternative to SQL setup
app.post("/make-server-e547215c/setup-storage", async (c) => {
  try {
    console.log('🔧 Starting storage setup...');
    
    // This will be automatically called during server initialization
    await initializeStorageBuckets();
    
    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return c.json({
        success: false,
        error: `Failed to list buckets: ${listError.message}`,
        timestamp: new Date().toISOString()
      }, 500);
    }
    
    const ourBuckets = buckets?.filter(b => b.name.startsWith('make-e547215c-')) || [];
    
    return c.json({
      success: true,
      message: "Storage setup completed successfully",
      buckets: ourBuckets.map(b => ({
        name: b.name,
        public: b.public,
        createdAt: b.created_at
      })),
      bucketsCount: ourBuckets.length,
      expectedBuckets: 3,
      isComplete: ourBuckets.length === 3,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Storage setup error:', error);
    return c.json({
      success: false,
      error: `Storage setup failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }, 500);
  }
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
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents') 
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create view policy: Users can view their own files
CREATE POLICY "make_users_view" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create update policy: Users can update their own files
CREATE POLICY "make_users_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
    AND auth.uid()::text = split_part(name, '/', 1)
  );

-- Create delete policy: Users can delete their own files
CREATE POLICY "make_users_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
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

// Provide simple RLS setup instructions
app.get("/make-server-e547215c/setup-rls", (c) => {
  return c.json({
    success: false,
    message: "Manual RLS setup required - SQL execution via code is not supported by Supabase",
    instructions: [
      "1. Go to your Supabase Dashboard",
      "2. Navigate to SQL Editor",
      "3. Download the RLS script from: /make-server-e547215c/generate-rls-script", 
      "4. Copy and paste the script into SQL Editor",
      "5. Execute the script",
      "6. Test avatar upload functionality"
    ],
    downloadUrl: "/make-server-e547215c/generate-rls-script",
    timestamp: new Date().toISOString()
  });
});

// Avatar management endpoints following Supabase best practices
app.post("/make-server-e547215c/avatars/upload", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({
        success: false,
        error: "Token de autorização necessário",
        timestamp: new Date().toISOString()
      }, 401);
    }

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    if (userError || !user) {
      return c.json({
        success: false,
        error: "Usuário não autenticado",
        timestamp: new Date().toISOString()
      }, 401);
    }

    const { fileData, fileName, userType = 'user' } = await c.req.json();
    
    if (!fileData || !fileName) {
      return c.json({
        success: false,
        error: "Dados do arquivo obrigatórios",
        timestamp: new Date().toISOString()
      }, 400);
    }

    // Create secure file path
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${user.id}/avatar-${timestamp}-${sanitizedFileName}`;
    const bucketName = 'make-e547215c-avatars';

    // Convert base64 to blob
    const base64Data = fileData.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryData = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)));
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, binaryData, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({
        success: false,
        error: `Erro no upload: ${uploadError.message}`,
        timestamp: new Date().toISOString()
      }, 500);
    }

    // Generate signed URL for security
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      return c.json({
        success: false,
        error: `Erro ao gerar URL: ${signedUrlError.message}`,
        timestamp: new Date().toISOString()
      }, 500);
    }

    return c.json({
      success: true,
      message: "Avatar enviado com sucesso",
      data: {
        url: signedUrlData.signedUrl,
        path: filePath
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return c.json({
      success: false,
      error: `Erro no servidor: ${error.message}`,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Test avatar upload without authentication (for development)
app.post("/make-server-e547215c/test-avatar-upload", async (c) => {
  try {
    console.log('🧪 Testing avatar upload...');
    
    // Create a test file
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    const bucketName = 'make-e547215c-avatars';
    const fileName = 'test-avatar.jpg';
    const filePath = `test-user/avatar-${Date.now()}-${fileName}`;
    
    // Convert base64 to binary
    const base64Data = testImageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const binaryData = new Uint8Array(atob(base64Data).split('').map(char => char.charCodeAt(0)));
    
    // Upload using service role (bypasses RLS for testing)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, binaryData, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return c.json({
        success: false,
        error: `Test upload failed: ${uploadError.message}`,
        suggestion: "RLS policies may need to be configured manually",
        timestamp: new Date().toISOString()
      }, 500);
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 300); // 5 minutes for test

    if (signedUrlError) {
      console.error('❌ Test signed URL failed:', signedUrlError);
    }

    // Clean up test file
    await supabase.storage.from(bucketName).remove([filePath]);

    return c.json({
      success: true,
      message: "Test upload successful - storage is working!",
      data: {
        uploadPath: filePath,
        signedUrl: signedUrlData?.signedUrl || 'Not generated'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test avatar upload error:', error);
    return c.json({
      success: false,
      error: `Test failed: ${error.message}`,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Start the server
Deno.serve(app.fetch);