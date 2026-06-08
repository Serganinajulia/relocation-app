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
      cities: {
        Row: {
          airport_code: string | null
          area_km2: number | null
          climate_data: Json | null
          climate_desc_i18n: Json | null
          climate_type_id: number | null
          country_id: string
          created_at: string | null
          crime_index: number | null
          ecology_desc_i18n: Json | null
          english_level: string | null
          general_desc_i18n: Json | null
          has_mountains: boolean | null
          has_sea: boolean | null
          id: string
          infrastructure_data: Json | null
          kids_desc_i18n: Json | null
          medicine_desc_i18n: Json | null
          name_i18n: Json
          pets_desc_i18n: Json | null
          population: number | null
          safety_data: Json | null
          safety_index: number | null
          social_data: Json | null
          social_desc_i18n: Json | null
          temp_summer_max: number | null
          temp_summer_min: number | null
          temp_winter_max: number | null
          temp_winter_min: number | null
          timezone_offset: number | null
          transport_desc_i18n: Json | null
          updated_at: string | null
        }
        Insert: {
          airport_code?: string | null
          area_km2?: number | null
          climate_data?: Json | null
          climate_desc_i18n?: Json | null
          climate_type_id?: number | null
          country_id: string
          created_at?: string | null
          crime_index?: number | null
          ecology_desc_i18n?: Json | null
          english_level?: string | null
          general_desc_i18n?: Json | null
          has_mountains?: boolean | null
          has_sea?: boolean | null
          id?: string
          infrastructure_data?: Json | null
          kids_desc_i18n?: Json | null
          medicine_desc_i18n?: Json | null
          name_i18n: Json
          pets_desc_i18n?: Json | null
          population?: number | null
          safety_data?: Json | null
          safety_index?: number | null
          social_data?: Json | null
          social_desc_i18n?: Json | null
          temp_summer_max?: number | null
          temp_summer_min?: number | null
          temp_winter_max?: number | null
          temp_winter_min?: number | null
          timezone_offset?: number | null
          transport_desc_i18n?: Json | null
          updated_at?: string | null
        }
        Update: {
          airport_code?: string | null
          area_km2?: number | null
          climate_data?: Json | null
          climate_desc_i18n?: Json | null
          climate_type_id?: number | null
          country_id?: string
          created_at?: string | null
          crime_index?: number | null
          ecology_desc_i18n?: Json | null
          english_level?: string | null
          general_desc_i18n?: Json | null
          has_mountains?: boolean | null
          has_sea?: boolean | null
          id?: string
          infrastructure_data?: Json | null
          kids_desc_i18n?: Json | null
          medicine_desc_i18n?: Json | null
          name_i18n?: Json
          pets_desc_i18n?: Json | null
          population?: number | null
          safety_data?: Json | null
          safety_index?: number | null
          social_data?: Json | null
          social_desc_i18n?: Json | null
          temp_summer_max?: number | null
          temp_summer_min?: number | null
          temp_winter_max?: number | null
          temp_winter_min?: number | null
          timezone_offset?: number | null
          transport_desc_i18n?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_climate_type_id_fkey"
            columns: ["climate_type_id"]
            isOneToOne: false
            referencedRelation: "climate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cities_climate_type"
            columns: ["climate_type_id"]
            isOneToOne: false
            referencedRelation: "climate_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cities_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      climate_types: {
        Row: {
          code: string
          id: number
          name_i18n: Json
        }
        Insert: {
          code: string
          id?: number
          name_i18n: Json
        }
        Update: {
          code?: string
          id?: number
          name_i18n?: Json
        }
        Relationships: []
      }
      costs: {
        Row: {
          baby_supplies_usd: number | null
          cafes_usd: number | null
          city_id: string | null
          coworking_usd: number | null
          created_at: string | null
          data_source: string | null
          fitness_usd: number | null
          groceries_usd: number | null
          id: string
          internet_home_usd: number | null
          kindergarten_usd: number | null
          last_verified_at: string | null
          period_month: string | null
          school_usd: number | null
          summary_i18n: Json | null
          transport_basic_usd: number | null
          updated_at: string | null
          utilities_usd: number | null
        }
        Insert: {
          baby_supplies_usd?: number | null
          cafes_usd?: number | null
          city_id?: string | null
          coworking_usd?: number | null
          created_at?: string | null
          data_source?: string | null
          fitness_usd?: number | null
          groceries_usd?: number | null
          id?: string
          internet_home_usd?: number | null
          kindergarten_usd?: number | null
          last_verified_at?: string | null
          period_month?: string | null
          school_usd?: number | null
          summary_i18n?: Json | null
          transport_basic_usd?: number | null
          updated_at?: string | null
          utilities_usd?: number | null
        }
        Update: {
          baby_supplies_usd?: number | null
          cafes_usd?: number | null
          city_id?: string | null
          coworking_usd?: number | null
          created_at?: string | null
          data_source?: string | null
          fitness_usd?: number | null
          groceries_usd?: number | null
          id?: string
          internet_home_usd?: number | null
          kindergarten_usd?: number | null
          last_verified_at?: string | null
          period_month?: string | null
          school_usd?: number | null
          summary_i18n?: Json | null
          transport_basic_usd?: number | null
          updated_at?: string | null
          utilities_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "costs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_costs_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          citizenship_path_i18n: Json | null
          citizenship_years: number | null
          created_at: string | null
          currency: string | null
          id: string
          language_info_i18n: Json | null
          local_income_tax_desc_i18n: Json | null
          name_i18n: Json
          passport_strength: number | null
          remote_income_tax_note_i18n: Json | null
          remote_income_tax_type: string | null
          residency_tax_desc_i18n: Json | null
          updated_at: string | null
          usd_rate: number | null
        }
        Insert: {
          citizenship_path_i18n?: Json | null
          citizenship_years?: number | null
          created_at?: string | null
          currency?: string | null
          id: string
          language_info_i18n?: Json | null
          local_income_tax_desc_i18n?: Json | null
          name_i18n: Json
          passport_strength?: number | null
          remote_income_tax_note_i18n?: Json | null
          remote_income_tax_type?: string | null
          residency_tax_desc_i18n?: Json | null
          updated_at?: string | null
          usd_rate?: number | null
        }
        Update: {
          citizenship_path_i18n?: Json | null
          citizenship_years?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          language_info_i18n?: Json | null
          local_income_tax_desc_i18n?: Json | null
          name_i18n?: Json
          passport_strength?: number | null
          remote_income_tax_note_i18n?: Json | null
          remote_income_tax_type?: string | null
          residency_tax_desc_i18n?: Json | null
          updated_at?: string | null
          usd_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "countries_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "country_politics"
            referencedColumns: ["country_id"]
          },
        ]
      }
      country_languages: {
        Row: {
          country_id: string
          created_at: string | null
          is_official: boolean | null
          is_widely_spoken: boolean | null
          language_id: number
        }
        Insert: {
          country_id: string
          created_at?: string | null
          is_official?: boolean | null
          is_widely_spoken?: boolean | null
          language_id: number
        }
        Update: {
          country_id?: string
          created_at?: string | null
          is_official?: boolean | null
          is_widely_spoken?: boolean | null
          language_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "country_languages_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_languages_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lang_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_lang_language"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      country_politics: {
        Row: {
          country_id: string
          created_at: string | null
          description_i18n: Json | null
          eiu_regime_type_id: number
          fh_score: number | null
          fh_status_id: number
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          description_i18n?: Json | null
          eiu_regime_type_id: number
          fh_score?: number | null
          fh_status_id: number
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          description_i18n?: Json | null
          eiu_regime_type_id?: number
          fh_score?: number | null
          fh_status_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_politics_eiu_regime_type_id_fkey"
            columns: ["eiu_regime_type_id"]
            isOneToOne: false
            referencedRelation: "eiu_regime_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_politics_fh_status_id_fkey"
            columns: ["fh_status_id"]
            isOneToOne: false
            referencedRelation: "fh_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_politics_eiu"
            columns: ["eiu_regime_type_id"]
            isOneToOne: false
            referencedRelation: "eiu_regime_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_politics_fh"
            columns: ["fh_status_id"]
            isOneToOne: false
            referencedRelation: "fh_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      country_residency_options: {
        Row: {
          application_fee_usd: number | null
          country_id: string
          created_at: string | null
          description_i18n: Json | null
          duration_months: number | null
          is_path_to_citizenship: boolean | null
          legal_services_usd: number | null
          min_income_usd: number | null
          residency_type_id: number
          taxes_desc_i18n: Json | null
          updated_at: string | null
        }
        Insert: {
          application_fee_usd?: number | null
          country_id: string
          created_at?: string | null
          description_i18n?: Json | null
          duration_months?: number | null
          is_path_to_citizenship?: boolean | null
          legal_services_usd?: number | null
          min_income_usd?: number | null
          residency_type_id: number
          taxes_desc_i18n?: Json | null
          updated_at?: string | null
        }
        Update: {
          application_fee_usd?: number | null
          country_id?: string
          created_at?: string | null
          description_i18n?: Json | null
          duration_months?: number | null
          is_path_to_citizenship?: boolean | null
          legal_services_usd?: number | null
          min_income_usd?: number | null
          residency_type_id?: number
          taxes_desc_i18n?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_residency_options_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_residency_options_residency_type_id_fkey"
            columns: ["residency_type_id"]
            isOneToOne: false
            referencedRelation: "residency_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_residency_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_residency_type"
            columns: ["residency_type_id"]
            isOneToOne: false
            referencedRelation: "residency_types"
            referencedColumns: ["id"]
          },
        ]
      }
      eiu_regime_types: {
        Row: {
          id: number
          name_i18n: Json
        }
        Insert: {
          id?: number
          name_i18n: Json
        }
        Update: {
          id?: number
          name_i18n?: Json
        }
        Relationships: []
      }
      fh_statuses: {
        Row: {
          id: number
          name_i18n: Json
        }
        Insert: {
          id?: number
          name_i18n: Json
        }
        Update: {
          id?: number
          name_i18n?: Json
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string | null
          complexity: number | null
          id: number
          name_i18n: Json | null
        }
        Insert: {
          code?: string | null
          complexity?: number | null
          id: number
          name_i18n?: Json | null
        }
        Update: {
          code?: string | null
          complexity?: number | null
          id?: number
          name_i18n?: Json | null
        }
        Relationships: []
      }
      rent_options: {
        Row: {
          accommodation_type: string | null
          bedrooms_count: number | null
          city_id: string | null
          created_at: string | null
          id: string
          last_verified_at: string | null
          period_month: string | null
          price_usd_max: number | null
          price_usd_min: number | null
          rent_features_i18n: Json | null
          updated_at: string | null
        }
        Insert: {
          accommodation_type?: string | null
          bedrooms_count?: number | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          period_month?: string | null
          price_usd_max?: number | null
          price_usd_min?: number | null
          rent_features_i18n?: Json | null
          updated_at?: string | null
        }
        Update: {
          accommodation_type?: string | null
          bedrooms_count?: number | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          period_month?: string | null
          price_usd_max?: number | null
          price_usd_min?: number | null
          rent_features_i18n?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rent_city"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_options_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      residency_types: {
        Row: {
          id: number
          name_i18n: Json | null
        }
        Insert: {
          id: number
          name_i18n?: Json | null
        }
        Update: {
          id?: number
          name_i18n?: Json | null
        }
        Relationships: []
      }
      tourist_visas: {
        Row: {
          allowed_days: number | null
          conditions_i18n: Json | null
          destination_country_id: string
          origin_country_id: string
          visa_type: string | null
        }
        Insert: {
          allowed_days?: number | null
          conditions_i18n?: Json | null
          destination_country_id: string
          origin_country_id: string
          visa_type?: string | null
        }
        Update: {
          allowed_days?: number | null
          conditions_i18n?: Json | null
          destination_country_id?: string
          origin_country_id?: string
          visa_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_visa_destination"
            columns: ["destination_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_visa_origin"
            columns: ["origin_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourist_visas_destination_country_id_fkey"
            columns: ["destination_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourist_visas_origin_country_id_fkey"
            columns: ["origin_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
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
