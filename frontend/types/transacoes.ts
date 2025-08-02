import { Transacao, NovaTransacaoPayload, AtualizarTransacaoPayload, ApiResponse } from '.';

export const createTransacao = (_: NovaTransacaoPayload): Promise<ApiResponse<Transacao>> => {
  return Promise.resolve({ success: true, data: {} as Transacao });
};

export const updateTransacao = (_: string, __: AtualizarTransacaoPayload): Promise<ApiResponse<Transacao>> => {
  return Promise.resolve({ success: true, data: {} as Transacao });
};

export const getTransacoes = (): Promise<ApiResponse<Transacao[]>> => {
  return Promise.resolve({ success: true, data: [] });
};

export const deleteTransacao = (_: string): Promise<ApiResponse<void>> => {
  return Promise.resolve({ success: true });
};
