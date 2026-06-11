import type { SubscriptionTier } from "@/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ChatMessageRole = "user" | "assistant";
export type HoroscopeSource = "ai" | "fallback";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_place_name: string | null;
          birth_lat: number | null;
          birth_lng: number | null;
          birth_timezone: string | null;
          sun_sign: string | null;
          moon_sign: string | null;
          rising_sign: string | null;
          subscription_tier: SubscriptionTier;
          messages_today_count: number;
          messages_reset_date: string;
          dossier: Json;
          onboarding_completed: boolean;
          telegram_id: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_place_name?: string | null;
          birth_lat?: number | null;
          birth_lng?: number | null;
          birth_timezone?: string | null;
          sun_sign?: string | null;
          moon_sign?: string | null;
          rising_sign?: string | null;
          subscription_tier?: SubscriptionTier;
          messages_today_count?: number;
          messages_reset_date?: string;
          dossier?: Json;
          onboarding_completed?: boolean;
          telegram_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_place_name?: string | null;
          birth_lat?: number | null;
          birth_lng?: number | null;
          birth_timezone?: string | null;
          sun_sign?: string | null;
          moon_sign?: string | null;
          rising_sign?: string | null;
          subscription_tier?: SubscriptionTier;
          messages_today_count?: number;
          messages_reset_date?: string;
          dossier?: Json;
          onboarding_completed?: boolean;
          telegram_id?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      natal_charts: {
        Row: {
          id: string;
          user_id: string;
          chart_data: Json;
          has_birth_time: boolean;
          computed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chart_data: Json;
          has_birth_time?: boolean;
          computed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          chart_data?: Json;
          has_birth_time?: boolean;
          computed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "natal_charts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      compatibility_links: {
        Row: {
          id: string;
          user_id: string;
          partner_name: string;
          partner_birth_date: string;
          partner_birth_time: string | null;
          partner_birth_place_name: string | null;
          partner_lat: number | null;
          partner_lng: number | null;
          partner_timezone: string | null;
          synastry_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          partner_name: string;
          partner_birth_date: string;
          partner_birth_time?: string | null;
          partner_birth_place_name?: string | null;
          partner_lat?: number | null;
          partner_lng?: number | null;
          partner_timezone?: string | null;
          synastry_data?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          partner_name?: string;
          partner_birth_date?: string;
          partner_birth_time?: string | null;
          partner_birth_place_name?: string | null;
          partner_lat?: number | null;
          partner_lng?: number | null;
          partner_timezone?: string | null;
          synastry_data?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "compatibility_links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_horoscopes: {
        Row: {
          id: string;
          user_id: string;
          horoscope_date: string;
          text: string;
          main_transit: Json | null;
          chart_fingerprint: string;
          source: HoroscopeSource;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          horoscope_date: string;
          text: string;
          main_transit?: Json | null;
          chart_fingerprint: string;
          source: HoroscopeSource;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          horoscope_date?: string;
          text?: string;
          main_transit?: Json | null;
          chart_fingerprint?: string;
          source?: HoroscopeSource;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_horoscopes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: ChatMessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: ChatMessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: ChatMessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type NatalChart = Database["public"]["Tables"]["natal_charts"]["Row"];
export type CompatibilityLink =
  Database["public"]["Tables"]["compatibility_links"]["Row"];
export type ChatMessage = Database["public"]["Tables"]["chat_messages"]["Row"];
export type DailyHoroscope =
  Database["public"]["Tables"]["daily_horoscopes"]["Row"];
