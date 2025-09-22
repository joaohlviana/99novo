/**
 * 🔍 SCHEMAS ZOD PARA VALIDAÇÃO
 * 
 * Todos os schemas de validação centralizados usando Zod.
 * Garante tipagem forte e validação consistente em toda a aplicação.
 */

import { z } from 'zod';

// ==============================
// BASE SCHEMAS
// ==============================

export const baseEntitySchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  createdAt: z.string().datetime('Data de criação inválida'),
  updatedAt: z.string().datetime('Data de atualização inválida')
});

export const paginationParamsSchema = z.object({
  page: z.number().int().min(1, 'Página deve ser maior que 0'),
  limit: z.number().int().min(1).max(100, 'Limite deve ser entre 1 e 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const filterParamsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  priceRange: z.tuple([z.number(), z.number()]).optional(),
  rating: z.number().min(0).max(5).optional()
});

// ==============================
// USER SCHEMAS
// ==============================

export const userSchema = baseEntitySchema.extend({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  avatar: z.string().url('URL do avatar inválida').optional(),
  role: z.enum(['client', 'trainer', 'admin']),
  status: z.enum(['active', 'inactive', 'pending']),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido').optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  location: z.object({
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(2, 'Estado é obrigatório'),
    country: z.string().default('BR')
  }).optional()
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updateUserSchema = createUserSchema.partial();

// ==============================
// TRAINER SCHEMAS
// ==============================

export const trainerSpecialtySchema = z.object({
  sport: z.string().min(1, 'Esporte é obrigatório'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  experience: z.number().min(0, 'Experiência deve ser positiva'),
  certifications: z.array(z.string()).default([])
});

export const trainerSchema = baseEntitySchema.extend({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  specialties: z.array(trainerSpecialtySchema).min(1, 'Pelo menos uma especialidade é obrigatória'),
  hourlyRate: z.number().min(0, 'Taxa por hora deve ser positiva'),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  totalHours: z.number().min(0),
  isVerified: z.boolean().default(false),
  serviceMode: z.enum(['online', 'presencial', 'ambos']),
  availability: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    hours: z.object({
      start: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
      end: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido')
    })
  }).optional(),
  gallery: z.array(z.string().url('URL de imagem inválida')).default([]),
  videos: z.array(z.object({
    title: z.string().min(1, 'Título do vídeo é obrigatório'),
    url: z.string().url('URL do vídeo inválida'),
    thumbnail: z.string().url('URL da thumbnail inválida').optional()
  })).default([])
});

export const createTrainerSchema = trainerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
  totalHours: true
});

export const updateTrainerSchema = createTrainerSchema.partial();

// ==============================
// PROGRAM SCHEMAS
// ==============================

export const programSchema = baseEntitySchema.extend({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  trainerId: z.string().min(1, 'ID do treinador é obrigatório'),
  sport: z.string().min(1, 'Esporte é obrigatório'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1, 'Duração deve ser pelo menos 1 semana'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  maxStudents: z.number().min(1, 'Máximo de alunos deve ser pelo menos 1'),
  currentStudents: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  thumbnail: z.string().url('URL da thumbnail inválida').optional(),
  images: z.array(z.string().url('URL de imagem inválida')).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  syllabus: z.array(z.object({
    week: z.number().min(1),
    title: z.string().min(1, 'Título da semana é obrigatório'),
    description: z.string().min(1, 'Descrição da semana é obrigatória'),
    topics: z.array(z.string()).default([])
  })).default([])
});

export const createProgramSchema = programSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentStudents: true,
  rating: true,
  reviewCount: true
});

export const updateProgramSchema = createProgramSchema.partial();

// ==============================
// MESSAGE SCHEMAS
// ==============================

export const messageSchema = baseEntitySchema.extend({
  chatId: z.string().min(1, 'ID do chat é obrigatório'),
  senderId: z.string().min(1, 'ID do remetente é obrigatório'),
  content: z.string().min(1, 'Conteúdo da mensagem é obrigatório'),
  type: z.enum(['text', 'image', 'file']).default('text'),
  readAt: z.string().datetime('Data de leitura inválida').optional(),
  editedAt: z.string().datetime('Data de edição inválida').optional()
});

export const createMessageSchema = messageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const chatSchema = baseEntitySchema.extend({
  participants: z.array(z.string()).min(2, 'Chat deve ter pelo menos 2 participantes'),
  lastMessage: z.string().optional(),
  lastMessageAt: z.string().datetime('Data da última mensagem inválida').optional(),
  unreadCount: z.record(z.string(), z.number()).default({})
});

// ==============================
// FINANCIAL SCHEMAS
// ==============================

export const transactionSchema = baseEntitySchema.extend({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  type: z.enum(['income', 'expense', 'withdrawal']),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['pending', 'completed', 'cancelled']).default('pending'),
  metadata: z.record(z.any()).optional()
});

export const createTransactionSchema = transactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// ==============================
// WORKOUT SCHEMAS
// ==============================

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Nome do exercício é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  instructions: z.string().min(1, 'Instruções são obrigatórias'),
  sets: z.number().min(1, 'Número de séries deve ser pelo menos 1'),
  reps: z.string().min(1, 'Repetições são obrigatórias'),
  duration: z.number().optional(),
  rest: z.number().optional(),
  notes: z.string().optional()
});

export const workoutSchema = baseEntitySchema.extend({
  name: z.string().min(1, 'Nome do treino é obrigatório'),
  description: z.string().optional(),
  trainerId: z.string().min(1, 'ID do treinador é obrigatório'),
  clientId: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'Pelo menos um exercício é obrigatório'),
  duration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto'),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  tags: z.array(z.string()).default([])
});

export const createWorkoutSchema = workoutSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// ==============================
// NOTIFICATION SCHEMAS
// ==============================

export const notificationSchema = baseEntitySchema.extend({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  type: z.enum(['message', 'booking', 'payment', 'system']),
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  isRead: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.any()).optional()
});

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// ==============================
// SERVICE RESPONSE SCHEMAS
// ==============================

export const serviceResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  metadata: z.object({
    timestamp: z.string().datetime(),
    source: z.enum(['cache', 'api', 'mock']),
    requestId: z.string()
  }).optional()
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
});

// ==============================
// VALIDATION HELPERS
// ==============================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  
  return { success: false as const, errors: result.error };
}

export function validateAndThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = validateData(schema, data);
  
  if (!result.success) {
    throw new Error(`Validation failed: ${result.errors?.message}`);
  }
  
  return result.data;
}

// Export dos tipos TypeScript gerados pelos schemas
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type Trainer = z.infer<typeof trainerSchema>;
export type CreateTrainer = z.infer<typeof createTrainerSchema>;
export type UpdateTrainer = z.infer<typeof updateTrainerSchema>;

export type Program = z.infer<typeof programSchema>;
export type CreateProgram = z.infer<typeof createProgramSchema>;
export type UpdateProgram = z.infer<typeof updateProgramSchema>;

export type Message = z.infer<typeof messageSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type Chat = z.infer<typeof chatSchema>;

export type Transaction = z.infer<typeof transactionSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;

export type Exercise = z.infer<typeof exerciseSchema>;
export type Workout = z.infer<typeof workoutSchema>;
export type CreateWorkout = z.infer<typeof createWorkoutSchema>;

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotification = z.infer<typeof createNotificationSchema>;

export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type FilterParams = z.infer<typeof filterParamsSchema>;
export type ServiceResponse<T> = z.infer<typeof serviceResponseSchema> & { data?: T };
export type PaginatedResponse<T> = z.infer<typeof paginatedResponseSchema> & { data: T[] };