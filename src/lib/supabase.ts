import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

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