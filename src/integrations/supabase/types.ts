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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_name: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          marketing_goals: string | null
          monthly_budget: number | null
          preferred_cities: string[] | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          marketing_goals?: string | null
          monthly_budget?: number | null
          preferred_cities?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          marketing_goals?: string | null
          monthly_budget?: number | null
          preferred_cities?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_billboards: {
        Row: {
          billboard_city: string
          billboard_id: string
          billboard_image: string | null
          billboard_lat: number | null
          billboard_lng: number | null
          billboard_location: string | null
          billboard_title: string
          campaign_id: string
          created_at: string
          id: string
          price_per_day: number
          scheduled_off_at: string | null
          status: Database["public"]["Enums"]["banner_status"]
          updated_at: string
        }
        Insert: {
          billboard_city: string
          billboard_id: string
          billboard_image?: string | null
          billboard_lat?: number | null
          billboard_lng?: number | null
          billboard_location?: string | null
          billboard_title: string
          campaign_id: string
          created_at?: string
          id?: string
          price_per_day: number
          scheduled_off_at?: string | null
          status?: Database["public"]["Enums"]["banner_status"]
          updated_at?: string
        }
        Update: {
          billboard_city?: string
          billboard_id?: string
          billboard_image?: string | null
          billboard_lat?: number | null
          billboard_lng?: number | null
          billboard_location?: string | null
          billboard_title?: string
          campaign_id?: string
          created_at?: string
          id?: string
          price_per_day?: number
          scheduled_off_at?: string | null
          status?: Database["public"]["Enums"]["banner_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_billboards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          creative_url: string | null
          duration_days: number
          id: string
          name: string
          scheduled_off_at: string | null
          start_date: string
          status: Database["public"]["Enums"]["campaign_status"]
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creative_url?: string | null
          duration_days?: number
          id?: string
          name: string
          scheduled_off_at?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["campaign_status"]
          total_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creative_url?: string | null
          duration_days?: number
          id?: string
          name?: string
          scheduled_off_at?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          business_id: string
          business_unread_count: number
          created_at: string
          id: string
          last_message_at: string
          last_message_preview: string | null
          listing_id: string | null
          order_id: string | null
          owner_id: string
          owner_unread_count: number
          updated_at: string
        }
        Insert: {
          business_id: string
          business_unread_count?: number
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_preview?: string | null
          listing_id?: string | null
          order_id?: string | null
          owner_id: string
          owner_unread_count?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          business_unread_count?: number
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_preview?: string | null
          listing_id?: string | null
          order_id?: string | null
          owner_id?: string
          owner_unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_bookings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          listing_id: string
          order_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          listing_id: string
          order_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          listing_id?: string
          order_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_bookings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          area: string | null
          city: string
          created_at: string
          description: string | null
          height_ft: number | null
          id: string
          images: string[]
          latitude: number | null
          legacy_id: string | null
          longitude: number | null
          owner_id: string | null
          price_per_day: number
          price_per_month: number | null
          price_per_week: number | null
          size: string | null
          status: Database["public"]["Enums"]["listing_status"]
          tags: string[]
          title: string
          traffic_estimate: string | null
          type: string
          updated_at: string
          width_ft: number | null
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string
          description?: string | null
          height_ft?: number | null
          id?: string
          images?: string[]
          latitude?: number | null
          legacy_id?: string | null
          longitude?: number | null
          owner_id?: string | null
          price_per_day?: number
          price_per_month?: number | null
          price_per_week?: number | null
          size?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[]
          title: string
          traffic_estimate?: string | null
          type?: string
          updated_at?: string
          width_ft?: number | null
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          description?: string | null
          height_ft?: number | null
          id?: string
          images?: string[]
          latitude?: number | null
          legacy_id?: string | null
          longitude?: number | null
          owner_id?: string | null
          price_per_day?: number
          price_per_month?: number | null
          price_per_week?: number | null
          size?: string | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[]
          title?: string
          traffic_estimate?: string | null
          type?: string
          updated_at?: string
          width_ft?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          related_conversation_id: string | null
          related_order_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_conversation_id?: string | null
          related_order_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_conversation_id?: string | null
          related_order_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_conversation_id_fkey"
            columns: ["related_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_at: string | null
          business_id: string
          created_at: string
          creative_url: string | null
          duration_days: number
          end_date: string
          id: string
          listing_id: string
          notes: string | null
          owner_id: string
          paid_at: string | null
          price_per_day: number
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["order_status"]
          total_cost: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          business_id: string
          created_at?: string
          creative_url?: string | null
          duration_days: number
          end_date: string
          id?: string
          listing_id: string
          notes?: string | null
          owner_id: string
          paid_at?: string | null
          price_per_day: number
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cost: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          business_id?: string
          created_at?: string
          creative_url?: string | null
          duration_days?: number
          end_date?: string
          id?: string
          listing_id?: string
          notes?: string | null
          owner_id?: string
          paid_at?: string | null
          price_per_day?: number
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invited_email: string | null
          invited_phone: string | null
          invited_user_id: string | null
          owner_id: string
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["invite_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_email?: string | null
          invited_phone?: string | null
          invited_user_id?: string | null
          owner_id: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_email?: string | null
          invited_phone?: string | null
          invited_user_id?: string | null
          owner_id?: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_role_selections: {
        Row: {
          primary_role: Database["public"]["Enums"]["app_role"]
          selected_at: string
          user_id: string
        }
        Insert: {
          primary_role: Database["public"]["Enums"]["app_role"]
          selected_at?: string
          user_id: string
        }
        Update: {
          primary_role?: Database["public"]["Enums"]["app_role"]
          selected_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          cache_key: string
          data: Json
          fetched_at: string
          id: string
        }
        Insert: {
          cache_key: string
          data: Json
          fetched_at?: string
          id?: string
        }
        Update: {
          cache_key?: string
          data?: Json
          fetched_at?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "property_owner"
        | "printing_vendor"
        | "agency"
        | "business"
      banner_status: "printing" | "live" | "scheduled_off" | "off"
      campaign_status:
        | "draft"
        | "printing"
        | "live"
        | "paused"
        | "scheduled_off"
        | "ended"
      invite_status: "pending" | "accepted" | "declined"
      listing_status: "available" | "booked" | "inactive"
      notification_type:
        | "order_request"
        | "order_approved"
        | "order_rejected"
        | "order_paid"
        | "order_status_change"
        | "new_message"
        | "system"
      order_status:
        | "pending"
        | "approved"
        | "rejected"
        | "paid"
        | "printing"
        | "installed"
        | "live"
        | "completed"
        | "cancelled"
      team_role: "viewer" | "commenter" | "editor" | "payer"
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
      app_role: [
        "admin",
        "user",
        "property_owner",
        "printing_vendor",
        "agency",
        "business",
      ],
      banner_status: ["printing", "live", "scheduled_off", "off"],
      campaign_status: [
        "draft",
        "printing",
        "live",
        "paused",
        "scheduled_off",
        "ended",
      ],
      invite_status: ["pending", "accepted", "declined"],
      listing_status: ["available", "booked", "inactive"],
      notification_type: [
        "order_request",
        "order_approved",
        "order_rejected",
        "order_paid",
        "order_status_change",
        "new_message",
        "system",
      ],
      order_status: [
        "pending",
        "approved",
        "rejected",
        "paid",
        "printing",
        "installed",
        "live",
        "completed",
        "cancelled",
      ],
      team_role: ["viewer", "commenter", "editor", "payer"],
    },
  },
} as const
