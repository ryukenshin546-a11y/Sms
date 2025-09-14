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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          company?: string | null
          business_type?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["account_status"]
          credit_balance: number
          email_verified: boolean
          phone_verified: boolean
          last_login_at?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          company?: string | null
          business_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["account_status"]
          credit_balance?: number
          email_verified?: boolean
          phone_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          company?: string | null
          business_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["account_status"]
          credit_balance?: number
          email_verified?: boolean
          phone_verified?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sms_accounts: {
        Row: {
          id: string
          user_id: string
          account_name: string
          username: string
          email: string
          encrypted_password: string
          original_email: string
          status: Database["public"]["Enums"]["account_status"]
          is_verified: boolean
          last_used_at?: string | null
          sms_website_url: string
          sender_name?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_name: string
          username: string
          email: string
          encrypted_password: string
          original_email: string
          status?: Database["public"]["Enums"]["account_status"]
          is_verified?: boolean
          last_used_at?: string | null
          sms_website_url?: string
          sender_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_name?: string
          username?: string
          email?: string
          encrypted_password?: string
          original_email?: string
          status?: Database["public"]["Enums"]["account_status"]
          is_verified?: boolean
          last_used_at?: string | null
          sms_website_url?: string
          sender_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generation_jobs: {
        Row: {
          id: string
          user_id: string
          sms_account_id?: string | null
          job_type: string
          priority: Database["public"]["Enums"]["job_priority"]
          batch_size: number
          status: Database["public"]["Enums"]["generation_status"]
          progress: number
          current_step?: string | null
          success_count: number
          failure_count: number
          total_count: number
          error_message?: string | null
          retry_count: number
          max_retries: number
          started_at?: string | null
          completed_at?: string | null
          created_at: string
          updated_at: string
          estimated_completion_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          sms_account_id?: string | null
          job_type?: string
          priority?: Database["public"]["Enums"]["job_priority"]
          batch_size?: number
          status?: Database["public"]["Enums"]["generation_status"]
          progress?: number
          current_step?: string | null
          success_count?: number
          failure_count?: number
          total_count?: number
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_completion_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          sms_account_id?: string | null
          job_type?: string
          priority?: Database["public"]["Enums"]["job_priority"]
          batch_size?: number
          status?: Database["public"]["Enums"]["generation_status"]
          progress?: number
          current_step?: string | null
          success_count?: number
          failure_count?: number
          total_count?: number
          error_message?: string | null
          retry_count?: number
          max_retries?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          estimated_completion_at?: string | null
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id?: string | null
          sms_account_id?: string | null
          generation_job_id?: string | null
          action: string
          description: string
          ip_address?: string | null
          user_agent?: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          sms_account_id?: string | null
          generation_job_id?: string | null
          action: string
          description: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          sms_account_id?: string | null
          generation_job_id?: string | null
          action?: string
          description?: string
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          setting_type: string
          description?: string | null
          is_public: boolean
          is_editable: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          setting_type?: string
          description?: string | null
          is_public?: boolean
          is_editable?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          setting_type?: string
          description?: string | null
          is_public?: boolean
          is_editable?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_name: string
          api_key: string
          api_secret_hash?: string | null
          permissions: Json
          rate_limit: number
          is_active: boolean
          last_used_at?: string | null
          expires_at?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_name: string
          api_key: string
          api_secret_hash?: string | null
          permissions?: Json
          rate_limit?: number
          is_active?: boolean
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_name?: string
          api_key?: string
          api_secret_hash?: string | null
          permissions?: Json
          rate_limit?: number
          is_active?: boolean
          last_used_at?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          is_email_sent: boolean
          is_sms_sent: boolean
          metadata: Json
          created_at: string
          read_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          is_email_sent?: boolean
          is_sms_sent?: boolean
          metadata?: Json
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          is_email_sent?: boolean
          is_sms_sent?: boolean
          metadata?: Json
          created_at?: string
          read_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "user" | "admin" | "superadmin"
      account_status: "active" | "inactive" | "suspended" | "deleted"
      generation_status: "pending" | "running" | "completed" | "failed" | "cancelled"
      job_priority: "low" | "normal" | "high" | "critical"
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
      user_role: ["user", "admin", "superadmin"] as const,
      account_status: ["active", "inactive", "suspended", "deleted"] as const,
      generation_status: ["pending", "running", "completed", "failed", "cancelled"] as const,
      job_priority: ["low", "normal", "high", "critical"] as const,
    },
  },
} as const
