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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      establishments: {
        Row: {
          bairro: string
          cidade: string
          created_at: string
          descricao: string
          endereco: string
          horario_funcionamento: string
          id: string
          is_demo: boolean
          nome: string
          owner_id: string | null
          status: Database["public"]["Enums"]["establishment_status"]
          telefone: string
          tipo: Database["public"]["Enums"]["establishment_type"]
        }
        Insert: {
          bairro: string
          cidade?: string
          created_at?: string
          descricao?: string
          endereco: string
          horario_funcionamento?: string
          id?: string
          is_demo?: boolean
          nome: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["establishment_status"]
          telefone?: string
          tipo?: Database["public"]["Enums"]["establishment_type"]
        }
        Update: {
          bairro?: string
          cidade?: string
          created_at?: string
          descricao?: string
          endereco?: string
          horario_funcionamento?: string
          id?: string
          is_demo?: boolean
          nome?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["establishment_status"]
          telefone?: string
          tipo?: Database["public"]["Enums"]["establishment_type"]
        }
        Relationships: []
      }
      kit_items: {
        Row: {
          id: string
          kit_id: string
          nome: string
          ordem: number
          quantidade: number
          unidade: string
        }
        Insert: {
          id?: string
          kit_id: string
          nome: string
          ordem?: number
          quantidade: number
          unidade?: string
        }
        Update: {
          id?: string
          kit_id?: string
          nome?: string
          ordem?: number
          quantidade?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_items_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          alergenicos: string
          conservacao: string
          created_at: string
          data_disponibilidade: string | null
          descricao: string
          diario: boolean
          establishment_id: string
          estoque_total: number
          id: string
          imagem: string | null
          ingredientes: string
          nome: string
          preco: number
          preco_referencia: number | null
          retirada_fim: string
          retirada_inicio: string
          status: Database["public"]["Enums"]["kit_status"]
          updated_at: string
        }
        Insert: {
          alergenicos?: string
          conservacao?: string
          created_at?: string
          data_disponibilidade?: string | null
          descricao?: string
          diario?: boolean
          establishment_id: string
          estoque_total?: number
          id?: string
          imagem?: string | null
          ingredientes?: string
          nome: string
          preco: number
          preco_referencia?: number | null
          retirada_fim: string
          retirada_inicio: string
          status?: Database["public"]["Enums"]["kit_status"]
          updated_at?: string
        }
        Update: {
          alergenicos?: string
          conservacao?: string
          created_at?: string
          data_disponibilidade?: string | null
          descricao?: string
          diario?: boolean
          establishment_id?: string
          estoque_total?: number
          id?: string
          imagem?: string | null
          ingredientes?: string
          nome?: string
          preco?: number
          preco_referencia?: number | null
          retirada_fim?: string
          retirada_inicio?: string
          status?: Database["public"]["Enums"]["kit_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kits_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_requests: {
        Row: {
          bairro: string
          created_at: string
          email: string | null
          estabelecimento: string
          id: string
          responsavel: string
          status: Database["public"]["Enums"]["request_status"]
          telefone: string
          tipo: Database["public"]["Enums"]["establishment_type"]
        }
        Insert: {
          bairro: string
          created_at?: string
          email?: string | null
          estabelecimento: string
          id?: string
          responsavel: string
          status?: Database["public"]["Enums"]["request_status"]
          telefone: string
          tipo: Database["public"]["Enums"]["establishment_type"]
        }
        Update: {
          bairro?: string
          created_at?: string
          email?: string | null
          estabelecimento?: string
          id?: string
          responsavel?: string
          status?: Database["public"]["Enums"]["request_status"]
          telefone?: string
          tipo?: Database["public"]["Enums"]["establishment_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id: string
          nome?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          cancelled_at: string | null
          codigo_confirmacao: string
          completed_at: string | null
          created_at: string
          data_retirada: string
          establishment_id: string
          id: string
          idempotency_key: string
          kit_id: string
          lookup_token_hash: string
          nome_consumidor: string
          preco_unitario: number
          public_id: string
          quantidade: number
          status: Database["public"]["Enums"]["reservation_status"]
          telefone_consumidor: string
        }
        Insert: {
          cancelled_at?: string | null
          codigo_confirmacao: string
          completed_at?: string | null
          created_at?: string
          data_retirada: string
          establishment_id: string
          id?: string
          idempotency_key: string
          kit_id: string
          lookup_token_hash: string
          nome_consumidor: string
          preco_unitario: number
          public_id?: string
          quantidade: number
          status?: Database["public"]["Enums"]["reservation_status"]
          telefone_consumidor: string
        }
        Update: {
          cancelled_at?: string | null
          codigo_confirmacao?: string
          completed_at?: string | null
          created_at?: string
          data_retirada?: string
          establishment_id?: string
          id?: string
          idempotency_key?: string
          kit_id?: string
          lookup_token_hash?: string
          nome_consumidor?: string
          preco_unitario?: number
          public_id?: string
          quantidade?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          telefone_consumidor?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: false
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      admin_stats: { Args: never; Returns: Json }
      can_manage_establishment: { Args: { _est: string }; Returns: boolean }
      cancel_reservation: { Args: { _id: string }; Returns: undefined }
      cancel_reservation_by_token: {
        Args: { _public_id: string; _token: string }
        Returns: undefined
      }
      claim_first_admin: { Args: never; Returns: boolean }
      create_reservation: {
        Args: {
          _aceite: boolean
          _idempotency_key: string
          _kit_id: string
          _lookup_token: string
          _nome: string
          _quantidade: number
          _telefone: string
        }
        Returns: Json
      }
      get_public_kit: { Args: { _id: string }; Returns: Json }
      get_reservation: {
        Args: { _public_id: string; _token: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      kit_committed: { Args: { _kit_id: string }; Returns: number }
      kit_is_public: {
        Args: { k: Database["public"]["Tables"]["kits"]["Row"] }
        Returns: boolean
      }
      list_public_kits: { Args: never; Returns: Json }
      mark_reservation_picked_up: {
        Args: { _codigo: string; _id: string }
        Returns: undefined
      }
      register_establishment: { Args: { _data: Json }; Returns: string }
      save_kit: {
        Args: { _data: Json; _id: string; _items: Json }
        Returns: string
      }
      set_kit_status: {
        Args: {
          _id: string
          _status: Database["public"]["Enums"]["kit_status"]
        }
        Returns: undefined
      }
      sp_today: { Args: never; Returns: string }
      submit_partner_request: {
        Args: { _data: Json; _website: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "comerciante"
      establishment_status: "pendente" | "aprovado" | "rejeitado" | "suspenso"
      establishment_type: "padaria" | "cafeteria" | "confeitaria"
      kit_status: "rascunho" | "publicado" | "encerrado"
      request_status: "nova" | "aprovada" | "rejeitada"
      reservation_status: "reservada" | "retirada" | "cancelada"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "comerciante"],
      establishment_status: ["pendente", "aprovado", "rejeitado", "suspenso"],
      establishment_type: ["padaria", "cafeteria", "confeitaria"],
      kit_status: ["rascunho", "publicado", "encerrado"],
      request_status: ["nova", "aprovada", "rejeitada"],
      reservation_status: ["reservada", "retirada", "cancelada"],
    },
  },
} as const
