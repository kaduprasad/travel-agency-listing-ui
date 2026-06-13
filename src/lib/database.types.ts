export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type EmptyObject = Record<string, never>;

export interface Database {
  __InternalSupabase: { PostgrestVersion: "12" };
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string | null;
          description: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          address: Json | null;
          hero_images: string[] | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          description?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          address?: Json | null;
          hero_images?: string[] | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          tagline?: string | null;
          description?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          address?: Json | null;
          hero_images?: string[] | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          agency_id: string | null;
          role: "agency_admin" | "super_admin";
          full_name: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          role?: "agency_admin" | "super_admin";
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          role?: "agency_admin" | "super_admin";
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          id: string;
          agency_id: string;
          model: string;
          category: string;
          seats: number;
          luggage: number | null;
          ac: boolean;
          transmission: "manual" | "automatic" | null;
          fuel_type: string | null;
          local_rate_per_km: number | null;
          intercity_rate_per_km: number | null;
          airport_flat_rate: number | null;
          package_km: number | null;
          package_total: number | null;
          min_km_per_day: number | null;
          driver_charge_per_day: number | null;
          features: string[] | null;
          images: string[];
          primary_image: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          model: string;
          category: string;
          seats?: number;
          luggage?: number | null;
          ac?: boolean;
          transmission?: "manual" | "automatic" | null;
          fuel_type?: string | null;
          local_rate_per_km?: number | null;
          intercity_rate_per_km?: number | null;
          airport_flat_rate?: number | null;
          package_km?: number | null;
          package_total?: number | null;
          min_km_per_day?: number | null;
          driver_charge_per_day?: number | null;
          features?: string[] | null;
          images?: string[];
          primary_image?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          model?: string;
          category?: string;
          seats?: number;
          luggage?: number | null;
          ac?: boolean;
          transmission?: "manual" | "automatic" | null;
          fuel_type?: string | null;
          local_rate_per_km?: number | null;
          intercity_rate_per_km?: number | null;
          airport_flat_rate?: number | null;
          package_km?: number | null;
          package_total?: number | null;
          min_km_per_day?: number | null;
          driver_charge_per_day?: number | null;
          features?: string[] | null;
          images?: string[];
          primary_image?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          id: string;
          agency_id: string;
          car_id: string | null;
          car_model_snapshot: string | null;
          travel_type: "local" | "intercity" | "airport" | "package";
          full_name: string;
          phone: string;
          email: string | null;
          source_city: string | null;
          destination_city: string | null;
          start_date: string | null;
          end_date: string | null;
          start_time: string | null;
          end_time: string | null;
          message: string | null;
          status: "new" | "contacted" | "confirmed" | "closed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          car_id?: string | null;
          car_model_snapshot?: string | null;
          travel_type: "local" | "intercity" | "airport" | "package";
          full_name: string;
          phone: string;
          email?: string | null;
          source_city?: string | null;
          destination_city?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          message?: string | null;
          status?: "new" | "contacted" | "confirmed" | "closed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          car_id?: string | null;
          car_model_snapshot?: string | null;
          travel_type?: "local" | "intercity" | "airport" | "package";
          full_name?: string;
          phone?: string;
          email?: string | null;
          source_city?: string | null;
          destination_city?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          message?: string | null;
          status?: "new" | "contacted" | "confirmed" | "closed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          agency_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          agency_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          agency_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: EmptyObject;
    Functions: EmptyObject;
    Enums: {
      user_role: "agency_admin" | "super_admin";
      travel_type: "local" | "intercity" | "airport" | "package";
      enquiry_status: "new" | "contacted" | "confirmed" | "closed" | "cancelled";
    };
    CompositeTypes: EmptyObject;
  };
}

export type Agency = Database["public"]["Tables"]["agencies"]["Row"];
export type Car = Database["public"]["Tables"]["cars"]["Row"];
export type Enquiry = Database["public"]["Tables"]["enquiries"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PushSubscriptionRow = Database["public"]["Tables"]["push_subscriptions"]["Row"];
