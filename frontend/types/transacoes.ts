import { Transacao, NovaTransacaoPayload, AtualizarTransacaoPayload, ApiResponse } from '.';

export const createTransacao = (payload: NovaTransacaoPayload): Promise<ApiResponse<Transacao>> => {
  console.log('Creating transaction:', payload);
  return Promise.resolve({ success: true, data: {} as Transacao });
};

export const updateTransacao = (id: string, payload: AtualizarTransacaoPayload): Promise<ApiResponse<Transacao>> => {
  console.log('Updating transaction:', { id, payload });
  return Promise.resolve({ success: true, data: {} as Transacao });
};

export const getTransacoes = (): Promise<ApiResponse<Transacao[]>> => {
  return Promise.resolve({ success: true, data: [] });
};

export const deleteTransacao = (id: string): Promise<ApiResponse<void>> => {
  console.log('Deleting transaction:', id);
  return Promise.resolve({ success: true });
};
