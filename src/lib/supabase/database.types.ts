export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {id: string; display_name: string; created_at: string};
        Insert: {id: string; display_name?: string; created_at?: string};
        Update: {display_name?: string};
        Relationships: [];
      };
    };
    Views: {[key: string]: never};
    Functions: {[key: string]: never};
    Enums: {[key: string]: never};
    CompositeTypes: {[key: string]: never};
  };
};
