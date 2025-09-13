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
      // USUÁRIOS E FAZENDAS
      users: {
        Row: {
          id: string
          firebase_uid: string
          email: string
          display_name: string | null
          fazenda_nome: string
          fazenda_area: number | null
          fazenda_localizacao: string | null
          tipo_criacao: string | null
          experiencia_anos: number | null
          subscription_plan: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          firebase_uid: string
          email: string
          display_name?: string | null
          fazenda_nome: string
          fazenda_area?: number | null
          fazenda_localizacao?: string | null
          tipo_criacao?: string | null
          experiencia_anos?: number | null
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          firebase_uid?: string
          email?: string
          display_name?: string | null
          fazenda_nome?: string
          fazenda_area?: number | null
          fazenda_localizacao?: string | null
          tipo_criacao?: string | null
          experiencia_anos?: number | null
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      
      // ANIMAIS
      animais: {
        Row: {
          id: string
          user_id: string
          brinco: string
          raca: string
          sexo: 'macho' | 'femea'
          data_nascimento: string
          peso_nascimento: number | null
          peso_atual: number | null
          mae_id: string | null
          pai_id: string | null
          status: 'ativo' | 'vendido' | 'morto' | 'transferido'
          lote: string | null
          pasto: string | null
          observacoes: string | null
          valor_compra: number | null
          custo_acumulado: number
          previsao_venda: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brinco: string
          raca: string
          sexo: 'macho' | 'femea'
          data_nascimento: string
          peso_nascimento?: number | null
          peso_atual?: number | null
          mae_id?: string | null
          pai_id?: string | null
          status?: 'ativo' | 'vendido' | 'morto' | 'transferido'
          lote?: string | null
          pasto?: string | null
          observacoes?: string | null
          valor_compra?: number | null
          custo_acumulado?: number
          previsao_venda?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brinco?: string
          raca?: string
          sexo?: 'macho' | 'femea'
          data_nascimento?: string
          peso_nascimento?: number | null
          peso_atual?: number | null
          mae_id?: string | null
          pai_id?: string | null
          status?: 'ativo' | 'vendido' | 'morto' | 'transferido'
          lote?: string | null
          pasto?: string | null
          observacoes?: string | null
          valor_compra?: number | null
          custo_acumulado?: number
          previsao_venda?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // MANEJOS
      manejos: {
        Row: {
          id: string
          user_id: string
          animal_id: string
          tipo_manejo: string
          data_manejo: string
          observacoes: string | null
          custo: number | null
          veterinario: string | null
          produto_usado: string | null
          dosagem: string | null
          proxima_aplicacao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          animal_id: string
          tipo_manejo: string
          data_manejo: string
          observacoes?: string | null
          custo?: number | null
          veterinario?: string | null
          produto_usado?: string | null
          dosagem?: string | null
          proxima_aplicacao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          animal_id?: string
          tipo_manejo?: string
          data_manejo?: string
          observacoes?: string | null
          custo?: number | null
          veterinario?: string | null
          produto_usado?: string | null
          dosagem?: string | null
          proxima_aplicacao?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // VENDAS
      vendas: {
        Row: {
          id: string
          user_id: string
          comprador: string
          tipo_venda: 'frigorifico' | 'leilao' | 'direto'
          peso_total: number
          preco_arroba: number
          valor_total: number
          data_venda: string
          data_entrega: string | null
          funrural: number
          icms: number
          outros_impostos: number
          lucro_liquido: number
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comprador: string
          tipo_venda: 'frigorifico' | 'leilao' | 'direto'
          peso_total: number
          preco_arroba: number
          valor_total: number
          data_venda: string
          data_entrega?: string | null
          funrural?: number
          icms?: number
          outros_impostos?: number
          lucro_liquido: number
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comprador?: string
          tipo_venda?: 'frigorifico' | 'leilao' | 'direto'
          peso_total?: number
          preco_arroba?: number
          valor_total?: number
          data_venda?: string
          data_entrega?: string | null
          funrural?: number
          icms?: number
          outros_impostos?: number
          lucro_liquido?: number
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ANIMAIS VENDIDOS (relacionamento)
      vendas_animais: {
        Row: {
          id: string
          venda_id: string
          animal_id: string
          created_at: string
        }
        Insert: {
          id?: string
          venda_id: string
          animal_id: string
          created_at?: string
        }
        Update: {
          id?: string
          venda_id?: string
          animal_id?: string
          created_at?: string
        }
      }

      // PRODUÇÃO
      producao: {
        Row: {
          id: string
          user_id: string
          animal_id: string
          tipo_producao: 'nascimento' | 'desmame' | 'engorda' | 'reproducao'
          data_producao: string
          peso: number | null
          ganho_medio_diario: number | null
          custo_producao: number
          receita: number | null
          margem_lucro: number | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          animal_id: string
          tipo_producao: 'nascimento' | 'desmame' | 'engorda' | 'reproducao'
          data_producao: string
          peso?: number | null
          ganho_medio_diario?: number | null
          custo_producao: number
          receita?: number | null
          margem_lucro?: number | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          animal_id?: string
          tipo_producao?: 'nascimento' | 'desmame' | 'engorda' | 'reproducao'
          data_producao?: string
          peso?: number | null
          ganho_medio_diario?: number | null
          custo_producao?: number
          receita?: number | null
          margem_lucro?: number | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // METAS DE PRODUÇÃO
      metas: {
        Row: {
          id: string
          user_id: string
          nome_da_meta: string
          descricao: string | null
          valor_total: number
          valor_atual: number
          data_conclusao: string
          categoria: 'producao' | 'reproducao' | 'ganho_peso' | 'vendas' | 'expansao' | 'melhoramento'
          prioridade: 'baixa' | 'media' | 'alta'
          unidade: 'kg' | 'litros' | 'animais' | 'hectares' | 'reais'
          tipo_animal: 'bovino' | 'suino' | 'ovino' | 'caprino' | 'aves' | 'todos'
          lote_alvo: string | null
          concluida: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome_da_meta: string
          descricao?: string | null
          valor_total: number
          valor_atual?: number
          data_conclusao: string
          categoria?: 'producao' | 'reproducao' | 'ganho_peso' | 'vendas' | 'expansao' | 'melhoramento'
          prioridade?: 'baixa' | 'media' | 'alta'
          unidade?: 'kg' | 'litros' | 'animais' | 'hectares' | 'reais'
          tipo_animal?: 'bovino' | 'suino' | 'ovino' | 'caprino' | 'aves' | 'todos'
          lote_alvo?: string | null
          concluida?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome_da_meta?: string
          descricao?: string | null
          valor_total?: number
          valor_atual?: number
          data_conclusao?: string
          categoria?: 'producao' | 'reproducao' | 'ganho_peso' | 'vendas' | 'expansao' | 'melhoramento'
          prioridade?: 'baixa' | 'media' | 'alta'
          unidade?: 'kg' | 'litros' | 'animais' | 'hectares' | 'reais'
          tipo_animal?: 'bovino' | 'suino' | 'ovino' | 'caprino' | 'aves' | 'todos'
          lote_alvo?: string | null
          concluida?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // CHAT MESSAGES
      chat_messages: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          channel: string
          phone_number: string | null
          media_url: string | null
          timestamp: string
          context: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          channel?: string
          phone_number?: string | null
          media_url?: string | null
          timestamp?: string
          context?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          channel?: string
          phone_number?: string | null
          media_url?: string | null
          timestamp?: string
          context?: Json | null
          created_at?: string
          updated_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
