export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_tier: string
          searches_today: number
          last_search_reset: string
          is_admin: boolean
          auth_provider: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_tier?: string
          searches_today?: number
          last_search_reset?: string
          is_admin?: boolean
          auth_provider?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_tier?: string
          searches_today?: number
          last_search_reset?: string
          is_admin?: boolean
          auth_provider?: string
          created_at?: string
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          location: string
          city: string
          bedrooms: string
          property_type: string
          image_urls: string[]
          has_photos: boolean
          contact_info: string | null
          listing_url: string | null
          listing_source: string | null
          listing_source_id: string | null
          posted_date: string
          is_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          location: string
          city: string
          bedrooms: string
          property_type: string
          image_urls?: string[]
          has_photos?: boolean
          contact_info?: string | null
          listing_url?: string | null
          listing_source?: string | null
          listing_source_id?: string | null
          posted_date?: string
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          location?: string
          city?: string
          bedrooms?: string
          property_type?: string
          image_urls?: string[]
          has_photos?: boolean
          contact_info?: string | null
          listing_url?: string | null
          listing_source?: string | null
          listing_source_id?: string | null
          posted_date?: string
          is_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          payment_method_id: string | null
          payment_intent_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          payment_method_id?: string | null
          payment_intent_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          payment_method_id?: string | null
          payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          cancelled_at: string | null
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          search_query: Json
          alert_enabled: boolean
          last_alert_sent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query: Json
          alert_enabled?: boolean
          last_alert_sent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: Json
          alert_enabled?: boolean
          last_alert_sent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          search_query: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          search_query: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          search_query?: Json
          created_at?: string
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
      [_ in never]: never
    }
  }
}