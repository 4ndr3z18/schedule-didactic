/**
 * Tipos de la base de datos de UsachSchedule.
 *
 * Se mantienen escritos a mano con el mismo formato que genera
 * `supabase gen types typescript`, porque el scaffold de Next.js (Fase 1)
 * todavía no existe y no hay CLI ejecutable en este entorno. Al conectarse el
 * proyecto real se regenera y se reemplaza este archivo sin tocar el resto:
 *
 *   supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 *
 * Vive en `src/lib/supabase/` (no en `src/server/`) para que el cliente de
 * navegador pueda importar solo el tipo sin cruzar la frontera del backend.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          career: string | null;
          created_at: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          career?: string | null;
          created_at?: string;
          full_name: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          career?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      schedule_blocks: {
        Row: {
          created_at: string;
          day_of_week: number;
          duration: number;
          id: string;
          module_index: number;
          subject_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          duration?: number;
          id?: string;
          module_index: number;
          subject_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          duration?: number;
          id?: string;
          module_index?: number;
          subject_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_blocks_subject_owner_fkey';
            columns: ['subject_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'subjects';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'schedule_blocks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      subjects: {
        Row: {
          code: string;
          color: string;
          created_at: string;
          id: string;
          level: number;
          name: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          code: string;
          color?: string;
          created_at?: string;
          id?: string;
          level: number;
          name: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          code?: string;
          color?: string;
          created_at?: string;
          id?: string;
          level?: number;
          name?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subjects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];

export type Tables<
  TableName extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][TableName]['Row'];

export type TablesInsert<
  TableName extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][TableName]['Insert'];

export type TablesUpdate<
  TableName extends keyof PublicSchema['Tables'],
> = PublicSchema['Tables'][TableName]['Update'];
