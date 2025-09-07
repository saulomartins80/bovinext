import { Schema, model, Document } from "mongoose";

// Interface para os dados de manejo (adaptado de transação)
export interface ITransacao {
  descricao: string;                                           // Descrição do manejo
  valor: number;                                              // Custo do manejo
  data: Date;                                                 // Data do manejo
  categoria: string;                                          // Tipo: vacinacao, pesagem, reproducao
  tipo: "receita" | "despesa" | "transferencia";            // Mantido para compatibilidade
  conta: string;                                             // Animal/Lote afetado
  observacao?: string;                                       // Observações veterinárias
  userId: string;                                            // ID do fazendeiro
  // Campos específicos para pecuária
  animalId?: string;                                         // ID do animal específico
  lote?: string;                                             // Lote de animais
  veterinario?: string;                                      // Veterinário responsável
  produto?: string;                                          // Vacina/remédio usado
  dosagem?: string;                                          // Dosagem aplicada
  proximaAplicacao?: Date;                                   // Próxima vacinação
}

// Interface para o documento do Mongoose
export interface ITransacaoDocument extends ITransacao, Document {}

// Defina o schema do Mongoose
const transacaoSchema = new Schema<ITransacaoDocument>(
  {
    descricao: { type: String, required: true },
    valor: { type: Number, required: true },
    data: { type: Date, required: true },
    categoria: { type: String, required: true },
    tipo: { 
      type: String, 
      required: true, 
      enum: ["receita", "despesa", "transferencia"] 
    },
    conta: { type: String, required: true },
    observacao: { type: String, required: false }, // Campo opcional para observações
    userId: { type: String, required: true, index: true }, // Alterado para String
  },
  { timestamps: true } // Adiciona createdAt e updatedAt automaticamente
);

// Exporte tanto o modelo quanto as interfaces
export const Transacoes = model<ITransacaoDocument>("Transacao", transacaoSchema);
export default Transacoes;