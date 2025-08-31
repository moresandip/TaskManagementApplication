import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          entity_name: string;
          task_type: 'Call' | 'Meeting' | 'Video Call';
          time: string;
          contact_person: string;
          note: string;
          status: 'Open' | 'Closed';
          phone_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          entity_name: string;
          task_type: 'Call' | 'Meeting' | 'Video Call';
          time: string;
          contact_person: string;
          note?: string;
          status?: 'Open' | 'Closed';
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          entity_name?: string;
          task_type?: 'Call' | 'Meeting' | 'Video Call';
          time?: string;
          contact_person?: string;
          note?: string;
          status?: 'Open' | 'Closed';
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};