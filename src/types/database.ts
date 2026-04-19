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
      affiliate_networks: {
        Row: {
          affiliate_id: string
          api_credentials: Json | null
          base_url_template: string | null
          created_at: string
          default_commission_rate: number | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          name: string
          type: Database["public"]["Enums"]["affiliate_network_type"]
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          api_credentials?: Json | null
          base_url_template?: string | null
          created_at?: string
          default_commission_rate?: number | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name: string
          type: Database["public"]["Enums"]["affiliate_network_type"]
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          api_credentials?: Json | null
          base_url_template?: string | null
          created_at?: string
          default_commission_rate?: number | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          name?: string
          type?: Database["public"]["Enums"]["affiliate_network_type"]
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_avatar_url: string | null
          author_name: string | null
          body_ar: string
          body_en: string | null
          category_id: string | null
          created_at: string
          excerpt_ar: string | null
          excerpt_en: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          read_time_minutes: number | null
          schema_data: Json | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[] | null
          title_ar: string
          title_en: string | null
          updated_at: string
          view_count: number
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string | null
          body_ar: string
          body_en?: string | null
          category_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          schema_data?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[] | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string | null
          body_ar?: string
          body_en?: string | null
          category_id?: string | null
          created_at?: string
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          read_time_minutes?: number | null
          schema_data?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[] | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      buying_guides: {
        Row: {
          body_ar: string
          category_id: string | null
          comparison_data: Json | null
          created_at: string
          excerpt_ar: string | null
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          title_ar: string
          updated_at: string
          view_count: number
        }
        Insert: {
          body_ar: string
          category_id?: string | null
          comparison_data?: Json | null
          created_at?: string
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          title_ar: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          body_ar?: string
          category_id?: string | null
          comparison_data?: Json | null
          created_at?: string
          excerpt_ar?: string | null
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          title_ar?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "buying_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          display_order: number
          icon: string | null
          id: string
          is_featured: boolean
          name_ar: string
          name_en: string | null
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_featured?: boolean
          name_ar: string
          name_en?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_featured?: boolean
          name_ar?: string
          name_en?: string | null
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clicks: {
        Row: {
          country_code: string | null
          coupon_id: string | null
          created_at: string
          device_type: string | null
          fingerprint_hash: string | null
          id: string
          referrer: string | null
          session_id: string | null
          store_id: string
          user_agent: string | null
        }
        Insert: {
          country_code?: string | null
          coupon_id?: string | null
          created_at?: string
          device_type?: string | null
          fingerprint_hash?: string | null
          id?: string
          referrer?: string | null
          session_id?: string | null
          store_id: string
          user_agent?: string | null
        }
        Update: {
          country_code?: string | null
          coupon_id?: string | null
          created_at?: string
          device_type?: string | null
          fingerprint_hash?: string | null
          id?: string
          referrer?: string | null
          session_id?: string | null
          store_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clicks_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string
          currency_symbol: string
          display_order: number
          flag_emoji: string | null
          hreflang: string
          name_ar: string
          name_en: string
          status: Database["public"]["Enums"]["country_status"]
        }
        Insert: {
          code: string
          created_at?: string
          currency: string
          currency_symbol: string
          display_order?: number
          flag_emoji?: string | null
          hreflang: string
          name_ar: string
          name_en: string
          status?: Database["public"]["Enums"]["country_status"]
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          currency_symbol?: string
          display_order?: number
          flag_emoji?: string | null
          hreflang?: string
          name_ar?: string
          name_en?: string
          status?: Database["public"]["Enums"]["country_status"]
        }
        Relationships: []
      }
      coupon_categories: {
        Row: {
          category_id: string
          coupon_id: string
        }
        Insert: {
          category_id: string
          coupon_id: string
        }
        Update: {
          category_id?: string
          coupon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_categories_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_categories_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_countries: {
        Row: {
          country_code: string
          coupon_id: string
        }
        Insert: {
          country_code: string
          coupon_id: string
        }
        Update: {
          country_code?: string
          coupon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_countries_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "coupon_countries_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_countries_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          click_count: number
          code: string | null
          conversion_count: number
          created_at: string
          description_ar: string | null
          description_en: string | null
          destination_url: string
          discount_display: string | null
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number | null
          display_order: number
          expires_at: string | null
          id: string
          is_exclusive: boolean
          is_featured: boolean
          last_verified_at: string | null
          max_discount: number | null
          meta_description: string | null
          min_order: number | null
          reveal_count: number
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["coupon_status"]
          store_id: string
          success_rate: number | null
          title_ar: string
          title_en: string | null
          updated_at: string
          verification_note: string | null
          verified_by: string | null
        }
        Insert: {
          click_count?: number
          code?: string | null
          conversion_count?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          destination_url: string
          discount_display?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_exclusive?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          max_discount?: number | null
          meta_description?: string | null
          min_order?: number | null
          reveal_count?: number
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          store_id: string
          success_rate?: number | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
          verification_note?: string | null
          verified_by?: string | null
        }
        Update: {
          click_count?: number
          code?: string | null
          conversion_count?: number
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          destination_url?: string
          discount_display?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_exclusive?: boolean
          is_featured?: boolean
          last_verified_at?: string | null
          max_discount?: number | null
          meta_description?: string | null
          min_order?: number | null
          reveal_count?: number
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["coupon_status"]
          store_id?: string
          success_rate?: number | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          verification_note?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string | null
          id: string
          is_confirmed: boolean
          preferences: Json | null
          unsubscribed_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_confirmed?: boolean
          preferences?: Json | null
          unsubscribed_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_confirmed?: boolean
          preferences?: Json | null
          unsubscribed_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      reveals: {
        Row: {
          country_code: string | null
          coupon_id: string
          created_at: string
          fingerprint_hash: string | null
          id: string
          user_agent: string | null
        }
        Insert: {
          country_code?: string | null
          coupon_id: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          user_agent?: string | null
        }
        Update: {
          country_code?: string | null
          coupon_id?: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reveals_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reveals_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_overrides: {
        Row: {
          canonical_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          nofollow: boolean
          noindex: boolean
          og_image: string | null
          path: string
          schema_data: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          canonical_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          nofollow?: boolean
          noindex?: boolean
          og_image?: string | null
          path: string
          schema_data?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          canonical_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          nofollow?: boolean
          noindex?: boolean
          og_image?: string | null
          path?: string
          schema_data?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seo_overrides_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_categories: {
        Row: {
          category_id: string
          is_primary: boolean
          store_id: string
        }
        Insert: {
          category_id: string
          is_primary?: boolean
          store_id: string
        }
        Update: {
          category_id?: string
          is_primary?: boolean
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_countries: {
        Row: {
          country_code: string
          store_id: string
        }
        Insert: {
          country_code: string
          store_id: string
        }
        Update: {
          country_code?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_countries_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "store_countries_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          affiliate_network_id: string | null
          affiliate_params: Json | null
          cover_url: string | null
          created_at: string
          description_ar: string | null
          description_en: string | null
          display_order: number
          id: string
          is_featured: boolean
          is_verified: boolean
          logo_url: string | null
          meta_description: string | null
          meta_title: string | null
          name_ar: string
          name_en: string
          og_image: string | null
          rating: number | null
          review_count: number | null
          schema_data: Json | null
          short_description_ar: string | null
          short_description_en: string | null
          slug: string
          status: Database["public"]["Enums"]["store_status"]
          updated_at: string
          website_url: string
        }
        Insert: {
          affiliate_network_id?: string | null
          affiliate_params?: Json | null
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name_ar: string
          name_en: string
          og_image?: string | null
          rating?: number | null
          review_count?: number | null
          schema_data?: Json | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug: string
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
          website_url: string
        }
        Update: {
          affiliate_network_id?: string | null
          affiliate_params?: Json | null
          cover_url?: string | null
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          logo_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name_ar?: string
          name_en?: string
          og_image?: string | null
          rating?: number | null
          review_count?: number | null
          schema_data?: Json | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["store_status"]
          updated_at?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_affiliate_network_id_fkey"
            columns: ["affiliate_network_id"]
            isOneToOne: false
            referencedRelation: "affiliate_networks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      coupon_public: {
        Row: {
          click_count: number | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          discount_display: string | null
          discount_type:
            | Database["public"]["Enums"]["coupon_discount_type"]
            | null
          discount_value: number | null
          display_order: number | null
          expires_at: string | null
          id: string | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          last_verified_at: string | null
          max_discount: number | null
          meta_description: string | null
          min_order: number | null
          reveal_count: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["coupon_status"] | null
          store_id: string | null
          success_rate: number | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_display?: string | null
          discount_type?:
            | Database["public"]["Enums"]["coupon_discount_type"]
            | null
          discount_value?: number | null
          display_order?: number | null
          expires_at?: string | null
          id?: string | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          max_discount?: number | null
          meta_description?: string | null
          min_order?: number | null
          reveal_count?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["coupon_status"] | null
          store_id?: string | null
          success_rate?: number | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_display?: string | null
          discount_type?:
            | Database["public"]["Enums"]["coupon_discount_type"]
            | null
          discount_value?: number | null
          display_order?: number | null
          expires_at?: string | null
          id?: string | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          last_verified_at?: string | null
          max_discount?: number | null
          meta_description?: string | null
          min_order?: number | null
          reveal_count?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["coupon_status"] | null
          store_id?: string | null
          success_rate?: number | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      reveal_coupon: {
        Args: {
          p_country_code?: string
          p_coupon_id: string
          p_fingerprint?: string
          p_user_agent?: string
        }
        Returns: string
      }
    }
    Enums: {
      affiliate_network_type:
        | "admitad"
        | "arabclicks"
        | "cj"
        | "awin"
        | "impact"
        | "direct"
      article_status: "draft" | "published" | "archived"
      country_status: "active" | "coming_soon" | "disabled"
      coupon_discount_type:
        | "percentage"
        | "fixed"
        | "free_shipping"
        | "bogo"
        | "other"
      coupon_status: "draft" | "active" | "paused" | "expired"
      store_status: "active" | "paused" | "archived"
      user_role: "super_admin" | "editor" | "viewer"
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
      affiliate_network_type: [
        "admitad",
        "arabclicks",
        "cj",
        "awin",
        "impact",
        "direct",
      ],
      article_status: ["draft", "published", "archived"],
      country_status: ["active", "coming_soon", "disabled"],
      coupon_discount_type: [
        "percentage",
        "fixed",
        "free_shipping",
        "bogo",
        "other",
      ],
      coupon_status: ["draft", "active", "paused", "expired"],
      store_status: ["active", "paused", "archived"],
      user_role: ["super_admin", "editor", "viewer"],
    },
  },
} as const
