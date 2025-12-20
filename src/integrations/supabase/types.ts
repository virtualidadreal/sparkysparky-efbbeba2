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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      detected_patterns: {
        Row: {
          created_at: string
          description: string | null
          evidence: Json | null
          first_detected_at: string
          id: string
          last_detected_at: string
          occurrences: number | null
          pattern_type: string
          status: string | null
          suggestions: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          evidence?: Json | null
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          occurrences?: number | null
          pattern_type: string
          status?: string | null
          suggestions?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          evidence?: Json | null
          first_detected_at?: string
          id?: string
          last_detected_at?: string
          occurrences?: number | null
          pattern_type?: string
          status?: string | null
          suggestions?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string
          detected_emotions: string[] | null
          entry_date: string
          id: string
          mood: string | null
          related_people: string[] | null
          sentiment: string | null
          summary: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          detected_emotions?: string[] | null
          entry_date?: string
          id?: string
          mood?: string | null
          related_people?: string[] | null
          sentiment?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          detected_emotions?: string[] | null
          entry_date?: string
          id?: string
          mood?: string | null
          related_people?: string[] | null
          sentiment?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string
          description: string | null
          detected_emotions: string[] | null
          id: string
          improved_content: string | null
          metadata: Json | null
          next_steps: Json | null
          original_content: string | null
          priority: string | null
          project_id: string | null
          related_people: string[] | null
          sentiment: string | null
          status: string | null
          suggested_improvements: Json | null
          summary: string | null
          tags: string[] | null
          title: string
          transcription: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          detected_emotions?: string[] | null
          id?: string
          improved_content?: string | null
          metadata?: Json | null
          next_steps?: Json | null
          original_content?: string | null
          priority?: string | null
          project_id?: string | null
          related_people?: string[] | null
          sentiment?: string | null
          status?: string | null
          suggested_improvements?: Json | null
          summary?: string | null
          tags?: string[] | null
          title: string
          transcription?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          detected_emotions?: string[] | null
          id?: string
          improved_content?: string | null
          metadata?: Json | null
          next_steps?: Json | null
          original_content?: string | null
          priority?: string | null
          project_id?: string | null
          related_people?: string[] | null
          sentiment?: string | null
          status?: string | null
          suggested_improvements?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          transcription?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligent_connections: {
        Row: {
          created_at: string
          id: string
          reasoning: string | null
          relationship: string
          source_id: string
          source_type: string
          strength: number
          target_id: string
          target_title: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reasoning?: string | null
          relationship: string
          source_id: string
          source_type: string
          strength?: number
          target_id: string
          target_title: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reasoning?: string | null
          relationship?: string
          source_id?: string
          source_type?: string
          strength?: number
          target_id?: string
          target_title?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_entries: {
        Row: {
          category: string | null
          confidence: number | null
          content: string
          created_at: string
          entry_type: string
          id: string
          is_active: boolean | null
          last_referenced_at: string | null
          metadata: Json | null
          reference_count: number | null
          source_id: string | null
          source_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          content: string
          created_at?: string
          entry_type: string
          id?: string
          is_active?: boolean | null
          last_referenced_at?: string | null
          metadata?: Json | null
          reference_count?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          confidence?: number | null
          content?: string
          created_at?: string
          entry_type?: string
          id?: string
          is_active?: boolean | null
          last_referenced_at?: string | null
          metadata?: Json | null
          reference_count?: number | null
          source_id?: string | null
          source_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          category: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string
          how_we_met: string | null
          id: string
          last_contact_date: string | null
          nickname: string | null
          notes: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          how_we_met?: string | null
          id?: string
          last_contact_date?: string | null
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          how_we_met?: string | null
          id?: string
          last_contact_date?: string | null
          nickname?: string | null
          notes?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_suggestions: {
        Row: {
          created_at: string
          id: string
          idea_ids: string[]
          status: string
          suggestion_count: number
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_ids?: string[]
          status?: string
          suggestion_count?: number
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_ids?: string[]
          status?: string
          suggestion_count?: number
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          keywords: string[] | null
          progress: number | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          keywords?: string[] | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          keywords?: string[] | null
          progress?: number | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sparky_messages: {
        Row: {
          brain: string | null
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          brain?: string | null
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          brain?: string | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          action_items: Json | null
          content: string
          created_at: string
          id: string
          key_insights: Json | null
          metrics: Json | null
          patterns_detected: Json | null
          period_end: string | null
          period_start: string | null
          project_id: string | null
          sources: Json | null
          summary_type: string
          title: string
          topic: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          content: string
          created_at?: string
          id?: string
          key_insights?: Json | null
          metrics?: Json | null
          patterns_detected?: Json | null
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          sources?: Json | null
          summary_type: string
          title: string
          topic?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          content?: string
          created_at?: string
          id?: string
          key_insights?: Json | null
          metrics?: Json | null
          patterns_detected?: Json | null
          period_end?: string | null
          period_start?: string | null
          project_id?: string | null
          sources?: Json | null
          summary_type?: string
          title?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      system_prompts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          key: string
          max_tokens: number | null
          model: string | null
          name: string
          prompt: string
          temperature: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          max_tokens?: number | null
          model?: string | null
          name: string
          prompt: string
          temperature?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          max_tokens?: number | null
          model?: string | null
          name?: string
          prompt?: string
          temperature?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      task_lists: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          list_id: string | null
          parent_task_id: string | null
          priority: string | null
          project_id: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          list_id?: string | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          list_id?: string | null
          parent_task_id?: string | null
          priority?: string | null
          project_id?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_usage: {
        Row: {
          alerts_count: number
          briefings_count: number
          created_at: string
          id: string
          suggestions_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          alerts_count?: number
          briefings_count?: number
          created_at?: string
          id?: string
          suggestions_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          alerts_count?: number
          briefings_count?: number
          created_at?: string
          id?: string
          suggestions_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_monthly_usage: {
        Row: {
          created_at: string
          generations_count: number
          id: string
          updated_at: string
          usage_month: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generations_count?: number
          id?: string
          updated_at?: string
          usage_month: string
          user_id: string
        }
        Update: {
          created_at?: string
          generations_count?: number
          id?: string
          updated_at?: string
          usage_month?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_quota: { Args: { p_user_id: string }; Returns: Json }
      increment_user_usage: { Args: { p_user_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      subscription_plan: "free" | "pro"
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
      subscription_plan: ["free", "pro"],
    },
  },
} as const
