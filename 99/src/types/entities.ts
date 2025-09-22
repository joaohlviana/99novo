/**
 * 🏗️ ENTIDADES PRINCIPAIS DO SISTEMA
 * 
 * Tipos TypeScript robustos para todas as entidades do domínio.
 * Organizados por domínio com herança e composição adequadas.
 */

import { BaseEntity } from '../services';

// ===============================
// CORE ENTITIES
// ===============================

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: UserRole[];
  preferences: UserPreferences;
  location: Location;
  socialLinks: SocialLinks;
  onboardingCompleted: boolean;
  lastLoginAt?: string;
  metadata: UserMetadata;
}

export interface UserRole {
  type: 'client' | 'trainer' | 'admin';
  isActive: boolean;
  activatedAt: string;
  permissions: string[];
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  communication: CommunicationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  reminders: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'trainers' | 'private';
  showLocation: boolean;
  showProgress: boolean;
  allowMessaging: boolean;
  allowDiscovery: boolean;
}

export interface CommunicationPreferences {
  preferredMethod: 'email' | 'whatsapp' | 'app';
  languages: string[];
  timezone: string;
}

export interface UserMetadata {
  registrationSource: string;
  referredBy?: string;
  tags: string[];
  customFields: Record<string, any>;
}

// ===============================
// TRAINER ENTITIES
// ===============================

export interface Trainer extends User {
  profile: TrainerProfile;
  qualifications: Qualification[];
  specialties: Specialty[];
  services: TrainerService[];
  availability: Availability;
  pricing: PricingConfig;
  stats: TrainerStats;
  reviews: Review[];
  programs: Program[];
  gallery: MediaItem[];
  stories: Story[];
  settings: TrainerSettings;
}

export interface TrainerProfile {
  title: string;
  experience: number; // anos
  rating: number;
  reviewCount: number;
  studentCount: number;
  description: string;
  mission?: string;
  approach?: string;
  achievements: Achievement[];
  languages: string[];
  serviceMode: ServiceMode[];
  maxStudents?: number;
}

export interface Qualification {
  id: string;
  title: string;
  institution: string;
  type: 'certification' | 'degree' | 'course' | 'workshop';
  date: string;
  expiryDate?: string;
  verified: boolean;
  document?: MediaItem;
}

export interface Specialty {
  id: string;
  category: string; // referencia sports categories
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications: string[];
  description?: string;
}

export interface TrainerService {
  id: string;
  name: string;
  description: string;
  type: 'program' | 'consultation' | 'personal' | 'group' | 'workshop';
  duration: string;
  price: number;
  currency: string;
  serviceMode: ServiceMode[];
  maxParticipants?: number;
  isActive: boolean;
}

export interface Availability {
  timezone: string;
  schedule: WeeklySchedule;
  exceptions: ScheduleException[];
  bufferTime: number; // minutos
  advance: {
    min: number; // dias
    max: number; // dias
  };
}

export interface WeeklySchedule {
  [key: string]: DaySchedule; // monday, tuesday, etc.
}

export interface DaySchedule {
  available: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  type: 'available' | 'busy' | 'break';
}

export interface ScheduleException {
  date: string;
  type: 'unavailable' | 'custom';
  reason?: string;
  customSlots?: TimeSlot[];
}

export interface PricingConfig {
  currency: string;
  hourlyRate?: number;
  packages: PricingPackage[];
  discounts: Discount[];
  paymentMethods: PaymentMethod[];
}

export interface PricingPackage {
  id: string;
  name: string;
  sessions: number;
  price: number;
  validityDays: number;
  description?: string;
  popular?: boolean;
}

export interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  condition: 'first_session' | 'bulk' | 'loyalty' | 'seasonal';
  minSessions?: number;
  validUntil?: string;
}

export interface PaymentMethod {
  type: 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash';
  enabled: boolean;
  processingFee?: number;
}

export interface TrainerStats {
  totalStudents: number;
  activeStudents: number;
  completedPrograms: number;
  totalHours: number;
  responseTime: number; // minutos
  completionRate: number; // 0-1
  satisfactionRate: number; // 0-1
  earningsThisMonth: number;
  earningsTotal: number;
}

export interface TrainerSettings {
  autoAcceptBookings: boolean;
  maxStudentsPerProgram: number;
  reminderNotifications: boolean;
  publicProfile: boolean;
  allowInstantBooking: boolean;
  requireDeposit: boolean;
  cancellationPolicy: CancellationPolicy;
}

export interface CancellationPolicy {
  hoursBeforeSession: number;
  feePercentage: number;
  rescheduleAllowed: boolean;
  rescheduleLimit: number;
}

// ===============================
// CLIENT ENTITIES
// ===============================

export interface Client extends User {
  profile: ClientProfile;
  goals: FitnessGoal[];
  preferences: ClientPreferences;
  history: ActivityHistory;
  subscriptions: Subscription[];
  favorites: Favorite[];
  progress: ProgressRecord[];
}

export interface ClientProfile {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  healthConditions: HealthCondition[];
  allergies: string[];
  medications: string[];
  emergencyContact: EmergencyContact;
  measurements: PhysicalMeasurements;
}

export interface FitnessGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility' | 'health' | 'sport_specific';
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
}

export interface ClientPreferences {
  workoutTypes: string[];
  workoutDuration: number; // minutos
  workoutFrequency: number; // por semana
  preferredTimes: string[];
  equipment: Equipment[];
  budget: BudgetRange;
  trainerGender?: 'male' | 'female' | 'any';
  communicationStyle: 'formal' | 'casual' | 'motivational';
}

export interface Equipment {
  name: string;
  hasAccess: boolean;
  location: 'home' | 'gym' | 'outdoor';
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
  period: 'session' | 'week' | 'month';
}

export interface HealthCondition {
  condition: string;
  severity: 'mild' | 'moderate' | 'severe';
  notes?: string;
  doctorCleared: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface PhysicalMeasurements {
  height?: number; // cm
  weight?: number; // kg
  bodyFat?: number; // %
  muscleMass?: number; // kg
  measurements?: BodyMeasurements;
  recordedAt: string;
}

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  bicep?: number;
  thigh?: number;
  [key: string]: number | undefined;
}

// ===============================
// PROGRAM ENTITIES
// ===============================

export interface Program extends BaseEntity {
  title: string;
  description: string;
  shortDescription?: string;
  trainer: TrainerSummary;
  category: string;
  subcategory?: string;
  level: ProgramLevel;
  type: ProgramType;
  duration: ProgramDuration;
  pricing: ProgramPricing;
  content: ProgramContent;
  requirements: ProgramRequirements;
  features: string[];
  stats: ProgramStats;
  media: MediaItem[];
  reviews: Review[];
  tags: string[];
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: string;
  metadata: ProgramMetadata;
}

export type ProgramLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type ProgramType = 'course' | 'coaching' | 'consultation' | 'workshop' | 'challenge';
export type ServiceMode = 'online' | 'in_person' | 'hybrid';

export interface ProgramDuration {
  weeks?: number;
  sessions?: number;
  hoursPerWeek?: number;
  totalHours?: number;
  flexible: boolean;
}

export interface ProgramPricing {
  type: 'one_time' | 'subscription' | 'pay_per_session';
  amount: number;
  currency: string;
  originalPrice?: number;
  discountPercentage?: number;
  paymentPlans?: PaymentPlan[];
  freeTrialDays?: number;
}

export interface PaymentPlan {
  id: string;
  name: string;
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestRate?: number;
}

export interface ProgramContent {
  modules: ProgramModule[];
  resources: Resource[];
  assessments: Assessment[];
  bonuses: Bonus[];
}

export interface ProgramModule {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedTime: number; // minutos
  lessons: Lesson[];
  isLocked: boolean;
  unlockConditions?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'audio' | 'interactive' | 'live';
  content: LessonContent;
  duration: number; // minutos
  order: number;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface LessonContent {
  video?: VideoContent;
  text?: TextContent;
  audio?: AudioContent;
  interactive?: InteractiveContent;
  attachments?: MediaItem[];
}

export interface VideoContent {
  url: string;
  thumbnail: string;
  duration: number;
  quality: VideoQuality[];
  captions?: Caption[];
}

export interface VideoQuality {
  resolution: string;
  url: string;
  bitrate: number;
}

export interface Caption {
  language: string;
  url: string;
}

export interface TextContent {
  content: string;
  format: 'markdown' | 'html' | 'plain';
  estimatedReadTime: number;
}

export interface AudioContent {
  url: string;
  duration: number;
  transcript?: string;
}

export interface InteractiveContent {
  type: 'quiz' | 'exercise' | 'calculator' | 'form';
  config: any;
  data: any;
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'worksheet' | 'template' | 'app' | 'link';
  url: string;
  description?: string;
  downloadable: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'practical' | 'peer_review';
  questions: Question[];
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number; // minutos
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'text' | 'file_upload';
  question: string;
  options?: string[];
  correctAnswer?: any;
  points: number;
  explanation?: string;
}

export interface Bonus {
  id: string;
  title: string;
  description: string;
  type: 'content' | 'service' | 'discount' | 'access';
  value: any;
  conditions?: string[];
}

export interface ProgramRequirements {
  fitnessLevel?: ProgramLevel[];
  equipment: Equipment[];
  timeCommitment: string;
  prerequisites?: string[];
  ageRange?: AgeRange;
  healthRestrictions?: string[];
}

export interface AgeRange {
  min?: number;
  max?: number;
}

export interface ProgramStats {
  enrollments: number;
  activeStudents: number;
  completionRate: number;
  averageRating: number;
  reviewCount: number;
  totalRevenue: number;
  conversionRate: number;
}

export interface ProgramMetadata {
  difficulty: number; // 1-10
  intensity: number; // 1-10
  popularity: number; // 1-10
  trending: boolean;
  featured: boolean;
  certificateOffered: boolean;
  languagesAvailable: string[];
  accessDuration: number; // dias
  supportIncluded: boolean;
}

// ===============================
// SHARED ENTITIES
// ===============================

export interface Location {
  country: string;
  state: string;
  city: string;
  address?: string;
  zipCode?: string;
  coordinates?: Coordinates;
  timezone?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  alt?: string;
  size?: number; // bytes
  duration?: number; // segundos para video/audio
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
}

export interface Review {
  id: string;
  reviewer: UserSummary;
  rating: number; // 1-5
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpful: number;
  reported: boolean;
  createdAt: string;
  updatedAt: string;
  response?: TrainerResponse;
}

export interface TrainerResponse {
  content: string;
  createdAt: string;
  isPublic: boolean;
}

export interface Story {
  id: string;
  type: 'image' | 'video' | 'text';
  content: StoryContent;
  duration: number; // segundos
  viewCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StoryContent {
  media?: MediaItem;
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  overlays?: StoryOverlay[];
}

export interface StoryOverlay {
  type: 'text' | 'sticker' | 'poll' | 'question';
  content: any;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'certification' | 'milestone' | 'award' | 'competition';
  date: string;
  verifiable: boolean;
  url?: string;
}

export interface ActivityHistory {
  totalSessions: number;
  totalHours: number;
  completedPrograms: number;
  joinedAt: string;
  lastActivity: string;
  streak: {
    current: number;
    longest: number;
  };
  achievements: Achievement[];
}

export interface Subscription {
  id: string;
  program: ProgramSummary;
  trainer: TrainerSummary;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  amount: number;
  currency: string;
  progress: SubscriptionProgress;
}

export interface SubscriptionProgress {
  completedSessions: number;
  totalSessions: number;
  completedModules: number;
  totalModules: number;
  lastActivity: string;
  currentModule?: string;
  estimatedCompletion?: string;
}

export interface Favorite {
  id: string;
  type: 'trainer' | 'program' | 'workout';
  targetId: string;
  addedAt: string;
}

export interface ProgressRecord {
  id: string;
  type: 'measurement' | 'photo' | 'performance' | 'milestone';
  data: any;
  notes?: string;
  recordedAt: string;
  isPublic: boolean;
  attachments?: MediaItem[];
}

// ===============================
// SUMMARY TYPES (for references)
// ===============================

export interface UserSummary {
  id: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
}

export interface TrainerSummary extends UserSummary {
  title: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
}

export interface ProgramSummary {
  id: string;
  title: string;
  trainer: TrainerSummary;
  level: ProgramLevel;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  thumbnail: string;
}

// ===============================
// SEARCH & FILTERS
// ===============================

export interface SearchFilters {
  query?: string;
  categories?: string[];
  levels?: ProgramLevel[];
  serviceModes?: ServiceMode[];
  priceRange?: [number, number];
  rating?: number;
  location?: string;
  distance?: number; // km
  availability?: 'today' | 'this_week' | 'this_month';
  verified?: boolean;
  hasReviews?: boolean;
  languages?: string[];
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'newest' | 'popular';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  query: string;
  filters: SearchFilters;
  suggestions?: string[];
  facets?: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

// ===============================
// MESSAGES & CHAT ENTITIES
// ===============================

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'file' | 'workout' | 'payment';
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
  replyTo?: string; // ID da mensagem respondida
  isEdited?: boolean;
  editedAt?: Date;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: ChatMessage;
  programId?: string;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
  metadata?: {
    program?: string;
    trainerSpecialty?: string;
    [key: string]: any;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'client' | 'trainer' | 'admin';
  isOnline?: boolean;
  lastSeen?: Date;
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// ===============================
// WORKOUT ENTITIES
// ===============================

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscleGroups: MuscleGroup[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  variations?: string[];
  tags: string[];
}

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'core' | 'obliques' | 'lower_back'
  | 'quadriceps' | 'hamstrings' | 'gluteus' | 'calves' | 'tibialis'
  | 'full_body' | 'cardio' | 'legs' | 'arms';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutos
  exercises: WorkoutExercise[];
  equipmentNeeded: string[];
  targetMuscleGroups: MuscleGroup[];
  tags: string[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps?: number;
  duration?: number; // segundos para exercícios baseados em tempo
  weight?: number;
  restTime: number; // segundos
  instructions?: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  trainerId: string;
  clientId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  schedule: {
    [day: string]: string; // templateId para cada dia da semana
  };
  goals: string[];
  notes?: string;
  progress: WorkoutProgramProgress;
}

export interface WorkoutProgramProgress {
  completedSessions: number;
  totalSessions: number;
  currentWeek: number;
  totalWeeks: number;
}

export interface WorkoutSession {
  id: string;
  workoutId: string; // template ID
  userId: string;
  trainerId?: string;
  programId?: string;
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  duration?: number; // minutos reais
  exercises: WorkoutSessionExercise[];
  notes?: string;
  rating?: number; // 1-5
  caloriesBurned?: number;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  plannedSets: number;
  plannedReps?: number;
  plannedDuration?: number;
  completedSets: number;
  logs: ExerciseLog[];
}

export interface ExerciseLog {
  exerciseId?: string;
  set: number;
  reps?: number;
  weight?: number;
  duration?: number; // segundos
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  restTime?: number; // segundos
}

// ===============================
// NOTIFICATION ENTITIES (extended)
// ===============================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  category: 'booking' | 'payment' | 'program' | 'message' | 'system' | 'promotion';
  title: string;
  message: string;
  shortMessage?: string;
  data?: Record<string, any>;
  recipient: {
    id: string;
    type: 'client' | 'trainer' | 'admin';
  };
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    type: 'user' | 'system';
  };
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  actionButton?: {
    text: string;
    action: string;
    url?: string;
  };
  expiresAt?: string;
  readAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    deviceId?: string;
    platform?: string;
    version?: string;
    [key: string]: any;
  };
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app';
  enabled: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  error?: string;
  sentAt?: string;
  deliveredAt?: string;
}