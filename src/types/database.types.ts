export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone_number: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_number?: string;
          full_name?: string | null;
          created_at?: string;
        };
      };
      services: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          base_price: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          base_price?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          base_price?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          service_id: number | null;
          customer_name: string;
          customer_phone: string;
          customer_notes: string | null;
          image_url: string | null;
          status: string;
          final_price: number | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          service_id?: number | null;
          customer_name: string;
          customer_phone: string;
          customer_notes?: string | null;
          image_url?: string | null;
          status?: string;
          final_price?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          service_id?: number | null;
          customer_name?: string;
          customer_phone?: string;
          customer_notes?: string | null;
          image_url?: string | null;
          status?: string;
          final_price?: number | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: number;
          user_id: string;
          appointment_time: string;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          appointment_time: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          appointment_time?: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}

