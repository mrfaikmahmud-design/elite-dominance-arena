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
      fixtures: {
        Row: {
          bracket_position: string | null
          completed_at: string | null
          created_at: string
          id: string
          match_number: number
          player1_id: string | null
          player1_score: number | null
          player2_id: string | null
          player2_score: number | null
          round: number
          scheduled_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          match_number?: number
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          round?: number
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          bracket_position?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          match_number?: number
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          round?: number
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      hall_of_fame: {
        Row: {
          champion_id: string | null
          champion_name: string
          champion_photo_url: string | null
          created_at: string
          id: string
          notes: string | null
          prize: number | null
          tournament_id: string | null
          tournament_name: string
          won_on: string
        }
        Insert: {
          champion_id?: string | null
          champion_name: string
          champion_photo_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prize?: number | null
          tournament_id?: string | null
          tournament_name: string
          won_on: string
        }
        Update: {
          champion_id?: string | null
          champion_name?: string
          champion_photo_url?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          prize?: number | null
          tournament_id?: string | null
          tournament_name?: string
          won_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_of_fame_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          active: boolean
          countdown_to: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          active?: boolean
          countdown_to?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          active?: boolean
          countdown_to?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      match_submissions: {
        Row: {
          created_at: string
          decider_p1: number | null
          decider_p2: number | null
          fixture_id: string
          id: string
          leg1_p1: number | null
          leg1_p2: number | null
          leg2_p1: number | null
          leg2_p2: number | null
          notes: string | null
          player1_score: number
          player2_score: number
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_by: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          decider_p1?: number | null
          decider_p2?: number | null
          fixture_id: string
          id?: string
          leg1_p1?: number | null
          leg1_p2?: number | null
          leg2_p1?: number | null
          leg2_p2?: number | null
          notes?: string | null
          player1_score: number
          player2_score: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          decider_p1?: number | null
          decider_p2?: number | null
          fixture_id?: string
          id?: string
          leg1_p1?: number | null
          leg1_p2?: number | null
          leg2_p1?: number | null
          leg2_p2?: number | null
          notes?: string | null
          player1_score?: number
          player2_score?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_by?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_submissions_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link_url: string | null
          read: boolean
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link_url?: string | null
          read?: boolean
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link_url?: string | null
          read?: boolean
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      player_badges: {
        Row: {
          awarded_at: string
          badge_key: string
          badge_name: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          badge_key: string
          badge_name: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          badge_key?: string
          badge_name?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          blood_group: string | null
          contact_number: string | null
          country: string | null
          created_at: string
          current_location: string | null
          display_name: string | null
          district: string | null
          dob: string | null
          draws: number
          efootball_username: string | null
          favorite_club: string | null
          fb_name: string | null
          fb_profile_link: string | null
          goals_conceded: number
          goals_scored: number
          id: string
          konami_uid: string | null
          losses: number
          name_locked: boolean
          playing_device: string | null
          rating: number
          recovery_code: string | null
          tournaments_played: number
          tournaments_won: number
          updated_at: string
          username: string
          wins: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          blood_group?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          display_name?: string | null
          district?: string | null
          dob?: string | null
          draws?: number
          efootball_username?: string | null
          favorite_club?: string | null
          fb_name?: string | null
          fb_profile_link?: string | null
          goals_conceded?: number
          goals_scored?: number
          id: string
          konami_uid?: string | null
          losses?: number
          name_locked?: boolean
          playing_device?: string | null
          rating?: number
          recovery_code?: string | null
          tournaments_played?: number
          tournaments_won?: number
          updated_at?: string
          username: string
          wins?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          blood_group?: string | null
          contact_number?: string | null
          country?: string | null
          created_at?: string
          current_location?: string | null
          display_name?: string | null
          district?: string | null
          dob?: string | null
          draws?: number
          efootball_username?: string | null
          favorite_club?: string | null
          fb_name?: string | null
          fb_profile_link?: string | null
          goals_conceded?: number
          goals_scored?: number
          id?: string
          konami_uid?: string | null
          losses?: number
          name_locked?: boolean
          playing_device?: string | null
          rating?: number
          recovery_code?: string | null
          tournaments_played?: number
          tournaments_won?: number
          updated_at?: string
          username?: string
          wins?: number
        }
        Relationships: []
      }
      registrations: {
        Row: {
          created_at: string
          fb_post_link: string | null
          id: string
          notes: string | null
          payment_reference: string | null
          status: string
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fb_post_link?: string | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          status?: string
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          fb_post_link?: string | null
          id?: string
          notes?: string | null
          payment_reference?: string | null
          status?: string
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          active: boolean
          created_at: string
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          tier: string | null
          website_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
          tier?: string | null
          website_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          tier?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          entry_fee: number
          format: Database["public"]["Enums"]["tournament_format"]
          id: string
          max_slots: number
          name: string
          prize_distribution: Json | null
          prize_pool: number
          registration_deadline: string | null
          rules: string | null
          slug: string
          starts_at: string
          status: Database["public"]["Enums"]["tournament_status"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          max_slots?: number
          name: string
          prize_distribution?: Json | null
          prize_pool?: number
          registration_deadline?: string | null
          rules?: string | null
          slug: string
          starts_at: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          entry_fee?: number
          format?: Database["public"]["Enums"]["tournament_format"]
          id?: string
          max_slots?: number
          name?: string
          prize_distribution?: Json | null
          prize_pool?: number
          registration_deadline?: string | null
          rules?: string | null
          slug?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
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
      admin_update_player_name: {
        Args: {
          _display_name: string
          _fb_name: string
          _user_id: string
          _username: string
        }
        Returns: undefined
      }
      get_recovery_code: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      regenerate_recovery_code: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "player"
      match_status:
        | "scheduled"
        | "live"
        | "pending_approval"
        | "completed"
        | "disputed"
      submission_status: "pending" | "approved" | "rejected"
      tournament_format:
        | "single_elimination"
        | "double_elimination"
        | "round_robin"
      tournament_status:
        | "upcoming"
        | "registration_open"
        | "registration_closed"
        | "live"
        | "completed"
        | "cancelled"
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
      app_role: ["super_admin", "admin", "moderator", "player"],
      match_status: [
        "scheduled",
        "live",
        "pending_approval",
        "completed",
        "disputed",
      ],
      submission_status: ["pending", "approved", "rejected"],
      tournament_format: [
        "single_elimination",
        "double_elimination",
        "round_robin",
      ],
      tournament_status: [
        "upcoming",
        "registration_open",
        "registration_closed",
        "live",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
