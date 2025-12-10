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
      diary_entries: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          daily_summary: string | null
          emotions: Json | null
          id: string
          location_coordinates: Json | null
          location_name: string | null
          mentioned_people: string[] | null
          metadata: Json | null
          monthly_summary: string | null
          mood_score: number | null
          related_ideas: string[] | null
          related_projects: string[] | null
          sentiment: string | null
          time_of_day: string | null
          title: string | null
          transcription: string | null
          updated_at: string
          user_id: string
          weekly_summary: string | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          daily_summary?: string | null
          emotions?: Json | null
          id?: string
          location_coordinates?: Json | null
          location_name?: string | null
          mentioned_people?: string[] | null
          metadata?: Json | null
          monthly_summary?: string | null
          mood_score?: number | null
          related_ideas?: string[] | null
          related_projects?: string[] | null
          sentiment?: string | null
          time_of_day?: string | null
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id: string
          weekly_summary?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          daily_summary?: string | null
          emotions?: Json | null
          id?: string
          location_coordinates?: Json | null
          location_name?: string | null
          mentioned_people?: string[] | null
          metadata?: Json | null
          monthly_summary?: string | null
          mood_score?: number | null
          related_ideas?: string[] | null
          related_projects?: string[] | null
          sentiment?: string | null
          time_of_day?: string | null
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id?: string
          weekly_summary?: string | null
        }
        Relationships: []
      }
      idea_tags: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_tags_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string
          detected_emotions: string[] | null
          id: string
          improved_content: string | null
          metadata: Json | null
          next_steps: Json | null
          original_content: string
          related_people: string[] | null
          sentiment: string | null
          status: string | null
          suggested_improvements: Json | null
          summary: string | null
          tags: string[] | null
          title: string | null
          transcription: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          detected_emotions?: string[] | null
          id?: string
          improved_content?: string | null
          metadata?: Json | null
          next_steps?: Json | null
          original_content: string
          related_people?: string[] | null
          sentiment?: string | null
          status?: string | null
          suggested_improvements?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string
          detected_emotions?: string[] | null
          id?: string
          improved_content?: string | null
          metadata?: Json | null
          next_steps?: Json | null
          original_content?: string
          related_people?: string[] | null
          sentiment?: string | null
          status?: string | null
          suggested_improvements?: Json | null
          summary?: string | null
          tags?: string[] | null
          title?: string | null
          transcription?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          commitments_made: Json | null
          created_at: string
          id: string
          interaction_date: string
          metadata: Json | null
          my_emotion: string | null
          person_id: string | null
          related_diary_entry_id: string | null
          related_project_ids: string[] | null
          summary: string
          their_emotion: string | null
          topics: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commitments_made?: Json | null
          created_at?: string
          id?: string
          interaction_date?: string
          metadata?: Json | null
          my_emotion?: string | null
          person_id?: string | null
          related_diary_entry_id?: string | null
          related_project_ids?: string[] | null
          summary: string
          their_emotion?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commitments_made?: Json | null
          created_at?: string
          id?: string
          interaction_date?: string
          metadata?: Json | null
          my_emotion?: string | null
          person_id?: string | null
          related_diary_entry_id?: string | null
          related_project_ids?: string[] | null
          summary?: string
          their_emotion?: string | null
          topics?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_related_diary_entry_id_fkey"
            columns: ["related_diary_entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          birthday: string | null
          category: string
          created_at: string
          desired_contact_frequency: string | null
          email: string | null
          full_name: string
          id: string
          importance_level: number | null
          interests: string[] | null
          last_contact_date: string | null
          last_contact_summary: string | null
          needs_attention: boolean | null
          nickname: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          category: string
          created_at?: string
          desired_contact_frequency?: string | null
          email?: string | null
          full_name: string
          id?: string
          importance_level?: number | null
          interests?: string[] | null
          last_contact_date?: string | null
          last_contact_summary?: string | null
          needs_attention?: boolean | null
          nickname?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          category?: string
          created_at?: string
          desired_contact_frequency?: string | null
          email?: string | null
          full_name?: string
          id?: string
          importance_level?: number | null
          interests?: string[] | null
          last_contact_date?: string | null
          last_contact_summary?: string | null
          needs_attention?: boolean | null
          nickname?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          priority: number | null
          progress_percentage: number | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          target_end_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          priority?: number | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_end_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          priority?: number | null
          progress_percentage?: number | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          target_end_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          parent_tag_id: string | null
          type: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_tag_id?: string | null
          type: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_tag_id?: string | null
          type?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_parent_tag_id_fkey"
            columns: ["parent_tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: number | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
          urgency_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          urgency_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          urgency_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
