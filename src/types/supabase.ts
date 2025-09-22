/**
 * 🔷 TIPOS GERADOS DO SUPABASE
 * 
 * Tipos TypeScript gerados automaticamente para o projeto
 * Project ID: rdujusymvebxndykyvhu
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      client_profiles: {
        Row: {
          id: string
          user_id: string
          fitness_level: "iniciante" | "intermediario" | "avancado" | null
          main_goal: string | null
          preferred_workout_time: string | null
          specific_goals: string[] | null
          has_injuries: boolean | null
          injury_details: string | null
          preferred_training_type: string[] | null
          budget_range: string | null
          city: string | null
          state: string | null
          is_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fitness_level?: "iniciante" | "intermediario" | "avancado" | null
          main_goal?: string | null
          preferred_workout_time?: string | null
          specific_goals?: string[] | null
          has_injuries?: boolean | null
          injury_details?: string | null
          preferred_training_type?: string[] | null
          budget_range?: string | null
          city?: string | null
          state?: string | null
          is_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fitness_level?: "iniciante" | "intermediario" | "avancado" | null
          main_goal?: string | null
          preferred_workout_time?: string | null
          specific_goals?: string[] | null
          has_injuries?: boolean | null
          injury_details?: string | null
          preferred_training_type?: string[] | null
          budget_range?: string | null
          city?: string | null
          state?: string | null
          is_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_ids: string[]
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_ids: string[]
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_ids?: string[]
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          trainer_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          trainer_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          trainer_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          message_type: "text" | "image" | "file" | "audio"
          file_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          message_type?: "text" | "image" | "file" | "audio"
          file_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          message_type?: "text" | "image" | "file" | "audio"
          file_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      profile_visits: {
        Row: {
          id: string
          visitor_id: string
          visited_id: string
          created_at: string
        }
        Insert: {
          id?: string
          visitor_id: string
          visited_id: string
          created_at?: string
        }
        Update: {
          id?: string
          visitor_id?: string
          visited_id?: string
          created_at?: string
        }
      }
      program_enrollments: {
        Row: {
          id: string
          program_id: string
          user_id: string
          trainer_id: string
          enrollment_type: "purchase" | "subscription"
          status: "active" | "completed" | "cancelled"
          amount_paid: number
          enrolled_at: string
          expires_at: string | null
          progress_percentage: number
          last_accessed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          program_id: string
          user_id: string
          trainer_id: string
          enrollment_type: "purchase" | "subscription"
          status?: "active" | "completed" | "cancelled"
          amount_paid: number
          enrolled_at?: string
          expires_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          program_id?: string
          user_id?: string
          trainer_id?: string
          enrollment_type?: "purchase" | "subscription"
          status?: "active" | "completed" | "cancelled"
          amount_paid?: number
          enrolled_at?: string
          expires_at?: string | null
          progress_percentage?: number
          last_accessed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      programs: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string
          sport_id: string
          difficulty_level: "iniciante" | "intermediario" | "avancado"
          duration_weeks: number
          price: number
          currency: string
          service_mode: "online" | "presencial" | "ambos"
          max_participants: number | null
          is_published: boolean
          gallery: Json
          structure: Json
          tags: string[]
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description: string
          sport_id: string
          difficulty_level: "iniciante" | "intermediario" | "avancado"
          duration_weeks: number
          price: number
          currency?: string
          service_mode: "online" | "presencial" | "ambos"
          max_participants?: number | null
          is_published?: boolean
          gallery?: Json
          structure?: Json
          tags?: string[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string
          sport_id?: string
          difficulty_level?: "iniciante" | "intermediario" | "avancado"
          duration_weeks?: number
          price?: number
          currency?: string
          service_mode?: "online" | "presencial" | "ambos"
          max_participants?: number | null
          is_published?: boolean
          gallery?: Json
          structure?: Json
          tags?: string[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      trainer_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          experience_years: number | null
          certifications: string[] | null
          service_mode: "online" | "presencial" | "ambos"
          hourly_rate: number | null
          city: string | null
          state: string | null
          specialties: string[]
          languages: string[] | null
          availability: Json | null
          social_links: Json | null
          gallery: string[] | null
          video_presentation: string | null
          rating_average: number | null
          rating_count: number | null
          is_complete: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          experience_years?: number | null
          certifications?: string[] | null
          service_mode: "online" | "presencial" | "ambos"
          hourly_rate?: number | null
          city?: string | null
          state?: string | null
          specialties?: string[]
          languages?: string[] | null
          availability?: Json | null
          social_links?: Json | null
          gallery?: string[] | null
          video_presentation?: string | null
          rating_average?: number | null
          rating_count?: number | null
          is_complete?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          experience_years?: number | null
          certifications?: string[] | null
          service_mode?: "online" | "presencial" | "ambos"
          hourly_rate?: number | null
          city?: string | null
          state?: string | null
          specialties?: string[]
          languages?: string[] | null
          availability?: Json | null
          social_links?: Json | null
          gallery?: string[] | null
          video_presentation?: string | null
          rating_average?: number | null
          rating_count?: number | null
          is_complete?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: "client" | "trainer"
          is_active: boolean
          activated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: "client" | "trainer"
          is_active?: boolean
          activated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: "client" | "trainer"
          is_active?: boolean
          activated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
          last_seen: string | null
          is_active: boolean
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fn_favorite_trainer: {
        Args: {
          trainer_id: string
          is_favorite: boolean
        }
        Returns: void
      }
      fn_follow_trainer: {
        Args: {
          trainer_id: string
          is_following: boolean
        }
        Returns: void
      }
      fn_track_profile_visit: {
        Args: {
          visited_id: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Tipos auxiliares para facilitar o uso
export type User = Tables<'users'>
export type UserRole = Tables<'user_roles'>
export type ClientProfile = Tables<'client_profiles'>
export type TrainerProfile = Tables<'trainer_profiles'>
export type Program = Tables<'programs'>
export type ProgramEnrollment = Tables<'program_enrollments'>
export type Conversation = Tables<'conversations'>
export type Message = Tables<'messages'>
export type Favorite = Tables<'favorites'>
export type Follow = Tables<'follows'>
export type ProfileVisit = Tables<'profile_visits'>

// Tipos para inserção
export type UserInsert = TablesInsert<'users'>
export type UserRoleInsert = TablesInsert<'user_roles'>
export type ClientProfileInsert = TablesInsert<'client_profiles'>
export type TrainerProfileInsert = TablesInsert<'trainer_profiles'>
export type ProgramInsert = TablesInsert<'programs'>

// Tipos para atualização
export type UserUpdate = TablesUpdate<'users'>
export type ClientProfileUpdate = TablesUpdate<'client_profiles'>
export type TrainerProfileUpdate = TablesUpdate<'trainer_profiles'>