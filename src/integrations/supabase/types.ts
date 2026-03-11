export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_charged: number
          expert_id: string
          id: string
          room_id: string | null
          session_notes_encrypted: string | null
          session_type: string
          slot_id: string | null
          slot_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_charged?: number
          expert_id: string
          id?: string
          room_id?: string | null
          session_notes_encrypted?: string | null
          session_type?: string
          slot_id?: string | null
          slot_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_charged?: number
          expert_id?: string
          id?: string
          room_id?: string | null
          session_notes_encrypted?: string | null
          session_type?: string
          slot_id?: string | null
          slot_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "expert_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string
          id: string
          ip_hash: string | null
          metadata: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blackbox_entries: {
        Row: {
          ai_flag_level: number
          content_encrypted: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          id: string
          is_private: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_flag_level?: number
          content_encrypted: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          is_private?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_flag_level?: number
          content_encrypted?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          id?: string
          is_private?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackbox_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blackbox_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          escalation_history: Json | null
          escalation_reason: string | null
          flag_level: number
          id: string
          room_id: string | null
          session_notes_encrypted: string | null
          started_at: string | null
          status: string
          student_id: string
          therapist_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          escalation_history?: Json | null
          escalation_reason?: string | null
          flag_level?: number
          id?: string
          room_id?: string | null
          session_notes_encrypted?: string | null
          started_at?: string | null
          status?: string
          student_id: string
          therapist_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          escalation_history?: Json | null
          escalation_reason?: string | null
          flag_level?: number
          id?: string
          room_id?: string | null
          session_notes_encrypted?: string | null
          started_at?: string | null
          status?: string
          student_id?: string
          therapist_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blackbox_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          created_at: string
          delta: number
          id: string
          institution_id: string | null
          notes: string | null
          reference_id: string | null
          type: Database["public"]["Enums"]["credit_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          institution_id?: string | null
          notes?: string | null
          reference_id?: string | null
          type: Database["public"]["Enums"]["credit_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          institution_id?: string | null
          notes?: string | null
          reference_id?: string | null
          type?: Database["public"]["Enums"]["credit_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ecc_stability_pool: {
        Row: {
          balance: number
          id: string
          institution_id: string | null
          total_contributed: number
          total_disbursed: number
          updated_at: string
        }
        Insert: {
          balance?: number
          id?: string
          institution_id?: string | null
          total_contributed?: number
          total_disbursed?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          id?: string
          institution_id?: string | null
          total_contributed?: number
          total_disbursed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecc_stability_pool_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_requests: {
        Row: {
          admin_id: string | null
          created_at: string
          entry_id: string | null
          id: string
          justification_encrypted: string
          resolved_at: string | null
          session_id: string | null
          spoc_id: string
          status: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          entry_id?: string | null
          id?: string
          justification_encrypted: string
          resolved_at?: string | null
          session_id?: string | null
          spoc_id: string
          status?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          entry_id?: string | null
          id?: string
          justification_encrypted?: string
          resolved_at?: string | null
          session_id?: string | null
          spoc_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_requests_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_requests_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "blackbox_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "peer_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_requests_spoc_id_fkey"
            columns: ["spoc_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_availability: {
        Row: {
          created_at: string
          end_time: string
          expert_id: string
          id: string
          institution_id: string | null
          is_booked: boolean
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          expert_id: string
          id?: string
          institution_id?: string | null
          is_booked?: boolean
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          expert_id?: string
          id?: string
          institution_id?: string | null
          is_booked?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_availability_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_availability_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          credits_pool: number
          eternia_code_hash: string
          id: string
          is_active: boolean
          name: string
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_pool?: number
          eternia_code_hash: string
          id?: string
          is_active?: boolean
          name: string
          plan_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_pool?: number
          eternia_code_hash?: string
          id?: string
          is_active?: boolean
          name?: string
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      peer_messages: {
        Row: {
          content_encrypted: string
          created_at: string
          id: string
          sender_id: string
          session_id: string
        }
        Insert: {
          content_encrypted: string
          created_at?: string
          id?: string
          sender_id: string
          session_id: string
        }
        Update: {
          content_encrypted?: string
          created_at?: string
          id?: string
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "peer_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          escalation_note_encrypted: string | null
          id: string
          intern_id: string | null
          is_flagged: boolean
          started_at: string | null
          status: Database["public"]["Enums"]["peer_session_status"]
          student_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          escalation_note_encrypted?: string | null
          id?: string
          intern_id?: string | null
          is_flagged?: boolean
          started_at?: string | null
          status?: Database["public"]["Enums"]["peer_session_status"]
          student_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          escalation_note_encrypted?: string | null
          id?: string
          intern_id?: string | null
          is_flagged?: boolean
          started_at?: string | null
          status?: Database["public"]["Enums"]["peer_session_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_sessions_intern_id_fkey"
            columns: ["intern_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          institution_id: string | null
          is_active: boolean
          is_verified: boolean
          last_login: string | null
          role: Database["public"]["Enums"]["app_role"]
          specialty: string | null
          streak_days: number
          total_sessions: number
          training_progress: Json | null
          training_status: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          institution_id?: string | null
          is_active?: boolean
          is_verified?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          streak_days?: number
          total_sessions?: number
          training_progress?: Json | null
          training_status?: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          institution_id?: string | null
          is_active?: boolean
          is_verified?: boolean
          last_login?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          specialty?: string | null
          streak_days?: number
          total_sessions?: number
          training_progress?: Json | null
          training_status?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      quest_cards: {
        Row: {
          category: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      quest_completions: {
        Row: {
          completed_at: string
          completed_date: string
          id: string
          quest_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          id?: string
          quest_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          id?: string
          quest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quest_completions_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "quest_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quest_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_credentials: {
        Row: {
          created_at: string
          emoji_pattern_encrypted: string
          fragment_pairs_encrypted: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji_pattern_encrypted: string
          fragment_pairs_encrypted: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji_pattern_encrypted?: string
          fragment_pairs_encrypted?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sound_content: {
        Row: {
          artist: string | null
          category: string
          cover_emoji: string | null
          created_at: string
          description: string | null
          duration_sec: number | null
          file_url: string | null
          id: string
          is_active: boolean
          play_count: number
          title: string
        }
        Insert: {
          artist?: string | null
          category: string
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          play_count?: number
          title: string
        }
        Update: {
          artist?: string | null
          category?: string
          cover_emoji?: string | null
          created_at?: string
          description?: string | null
          duration_sec?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          play_count?: number
          title?: string
        }
        Relationships: []
      }
      user_private: {
        Row: {
          contact_is_self: boolean | null
          created_at: string
          device_id_encrypted: string | null
          emergency_name_encrypted: string | null
          emergency_phone_encrypted: string | null
          emergency_relation: string | null
          student_id_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_is_self?: boolean | null
          created_at?: string
          device_id_encrypted?: string | null
          emergency_name_encrypted?: string | null
          emergency_phone_encrypted?: string | null
          emergency_relation?: string | null
          student_id_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_is_self?: boolean | null
          created_at?: string
          device_id_encrypted?: string | null
          emergency_name_encrypted?: string | null
          emergency_phone_encrypted?: string | null
          emergency_relation?: string | null
          student_id_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_private_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_credit_balance: { Args: { _user_id: string }; Returns: number }
      get_daily_earn_total: { Args: { _user_id: string }; Returns: number }
      get_pool_balance: { Args: { _institution_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_play_count: { Args: { _track_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "student" | "intern" | "expert" | "spoc" | "admin"
      appointment_status: "pending" | "confirmed" | "completed" | "cancelled"
      content_type: "text" | "voice"
      credit_type: "earn" | "spend" | "grant" | "purchase"
      peer_session_status: "pending" | "active" | "completed" | "flagged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "intern", "expert", "spoc", "admin"],
      appointment_status: ["pending", "confirmed", "completed", "cancelled"],
      content_type: ["text", "voice"],
      credit_type: ["earn", "spend", "grant", "purchase"],
      peer_session_status: ["pending", "active", "completed", "flagged"],
    },
  },
} as const
