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
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          messages: Json
          route_analysis_id: string | null
          session_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          messages?: Json
          route_analysis_id?: string | null
          session_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          messages?: Json
          route_analysis_id?: string | null
          session_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_route_analysis_id_fkey"
            columns: ["route_analysis_id"]
            isOneToOne: false
            referencedRelation: "route_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          city: string
          contact_type: string
          created_at: string
          distance_km: number | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          name: string
          phone_number: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city: string
          contact_type: string
          created_at?: string
          distance_km?: number | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name: string
          phone_number: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string
          contact_type?: string
          created_at?: string
          distance_km?: number | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string
          phone_number?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_factors: {
        Row: {
          created_at: string
          description: string | null
          factor_type: string
          id: string
          lat: number
          lng: number
          location_name: string
          reported_by: string | null
          risk_level: number
          time_periods: Json | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          factor_type: string
          id?: string
          lat: number
          lng: number
          location_name: string
          reported_by?: string | null
          risk_level: number
          time_periods?: Json | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          factor_type?: string
          id?: string
          lat?: number
          lng?: number
          location_name?: string
          reported_by?: string | null
          risk_level?: number
          time_periods?: Json | null
          verified?: boolean | null
        }
        Relationships: []
      }
      route_analyses: {
        Row: {
          analysis_data: Json | null
          created_at: string
          destination_address: string
          destination_lat: number | null
          destination_lng: number | null
          detailed_reason: Json
          id: string
          origin_address: string
          origin_lat: number | null
          origin_lng: number | null
          recommended_route: string | null
          risk_score: number
          short_reason: string
          travel_time: string | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          destination_address: string
          destination_lat?: number | null
          destination_lng?: number | null
          detailed_reason: Json
          id?: string
          origin_address: string
          origin_lat?: number | null
          origin_lng?: number | null
          recommended_route?: string | null
          risk_score: number
          short_reason: string
          travel_time?: string | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          destination_address?: string
          destination_lat?: number | null
          destination_lng?: number | null
          detailed_reason?: Json
          id?: string
          origin_address?: string
          origin_lat?: number | null
          origin_lng?: number | null
          recommended_route?: string | null
          risk_score?: number
          short_reason?: string
          travel_time?: string | null
          user_id?: string
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_date: string
          incident_type: string
          lat: number
          lng: number
          location_name: string
          public_data: boolean | null
          reported_by: string | null
          severity: number
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_date: string
          incident_type: string
          lat: number
          lng: number
          location_name: string
          public_data?: boolean | null
          reported_by?: string | null
          severity: number
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          lat?: number
          lng?: number
          location_name?: string
          public_data?: boolean | null
          reported_by?: string | null
          severity?: number
          verified?: boolean | null
        }
        Relationships: []
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
