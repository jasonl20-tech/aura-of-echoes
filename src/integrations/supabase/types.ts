export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          woman_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          woman_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          woman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_woman_id_fkey"
            columns: ["woman_id"]
            isOneToOne: false
            referencedRelation: "women"
            referencedColumns: ["id"]
          },
        ]
      }
      free_access_periods: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          end_time: string
          id: string
          start_time: string
          user_id: string | null
          woman_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          end_time: string
          id?: string
          start_time?: string
          user_id?: string | null
          woman_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          end_time?: string
          id?: string
          start_time?: string
          user_id?: string | null
          woman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "free_access_periods_woman_id_fkey"
            columns: ["woman_id"]
            isOneToOne: false
            referencedRelation: "women"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          message_type: string
          sender_type: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          message_type?: string
          sender_type: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          user_id: string
          woman_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          user_id: string
          woman_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string
          woman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_woman_id_fkey"
            columns: ["woman_id"]
            isOneToOne: false
            referencedRelation: "women"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      women: {
        Row: {
          age: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          interests: string[] | null
          name: string
          personality: string | null
          price: number
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          age: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          name: string
          personality?: string | null
          price?: number
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          age?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          interests?: string[] | null
          name?: string
          personality?: string | null
          price?: number
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      women_api_keys: {
        Row: {
          active: boolean
          api_key: string
          created_at: string
          id: string
          last_used_at: string | null
          woman_id: string
        }
        Insert: {
          active?: boolean
          api_key: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          woman_id: string
        }
        Update: {
          active?: boolean
          api_key?: string
          created_at?: string
          id?: string
          last_used_at?: string | null
          woman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "women_api_keys_woman_id_fkey"
            columns: ["woman_id"]
            isOneToOne: false
            referencedRelation: "women"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_free_access: {
        Args:
          | { woman_id: string }
          | { woman_id: string; specific_user_id?: string }
        Returns: boolean
      }
      has_subscription: {
        Args: { user_id: string; woman_id: string }
        Returns: boolean
      }
      has_subscription_or_free_access: {
        Args: { user_id: string; woman_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_by_email: {
        Args: { user_email: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
