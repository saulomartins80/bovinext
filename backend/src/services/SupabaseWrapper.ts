// SupabaseWrapper com consultas reais ao banco (Supabase)
import { supabase } from '../config/supabase';

export const supabaseWrapper = {
  // Users
	async insertUser(userData: any): Promise<any> {
		const { data, error } = await supabase.from('users').insert(userData).select().single();
		if (error) throw error;
		return data;
	},

	async selectUserByFirebaseUid(firebaseUid: string): Promise<any> {
		const { data, error } = await supabase.from('users').select('*').eq('firebase_uid', firebaseUid).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateUser(userId: string, userData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('users').update(userData as any).eq('id', userId).select().single();
		if (error) throw error;
		return data;
	},

  // Animais
	async insertAnimal(animalData: any): Promise<any> {
		const { data, error } = await supabase.from('animais').insert(animalData).select().single();
		if (error) throw error;
		return data;
	},

	async selectAnimaisByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('animais')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectAnimalById(animalId: string): Promise<any | null> {
		const { data, error } = await supabase.from('animais').select('*').eq('id', animalId).maybeSingle();
		if (error) throw error;
		return data;
	},

	async updateAnimal(animalId: string, animalData: any): Promise<any> {
		const { data, error } = await (supabase as any).from('animais').update(animalData as any).eq('id', animalId).select().single();
		if (error) throw error;
		return data;
	},

	async deleteAnimal(animalId: string): Promise<boolean> {
		const { error } = await supabase.from('animais').delete().eq('id', animalId);
		if (error) throw error;
		return true;
	},

  // Manejos
	async insertManejo(manejoData: any): Promise<any> {
		const { data, error } = await supabase.from('manejos').insert(manejoData).select().single();
		if (error) throw error;
		return data;
	},

	async selectManejosByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('manejos')
			.select('*')
			.eq('user_id', userId)
			.order('data_manejo', { ascending: false });
		if (error) throw error;
		return data || [];
	},

  // Vendas
	async insertVenda(vendaData: any): Promise<any> {
		const { data, error } = await supabase.from('vendas').insert(vendaData).select().single();
		if (error) throw error;
		return data;
	},

	async selectVendasByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('vendas')
			.select('*')
			.eq('user_id', userId)
			.order('data_venda', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	async selectVendaById(vendaId: string): Promise<any | null> {
		const { data, error } = await supabase.from('vendas').select('*').eq('id', vendaId).maybeSingle();
		if (error) throw error;
		return data;
	},

  // Produção
	async insertProducao(producaoData: any): Promise<any> {
		const { data, error } = await supabase.from('producao').insert(producaoData).select().single();
		if (error) throw error;
		return data;
	},

	async selectProducaoByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('producao')
			.select('*')
			.eq('user_id', userId)
			.order('data_producao', { ascending: false });
		if (error) throw error;
		return data || [];
	},

  // Metas
	async insertMeta(metaData: any): Promise<any> {
		const { data, error } = await supabase.from('metas').insert(metaData).select().single();
		if (error) throw error;
		return data;
	},

	async selectMetasByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase.from('metas').select('*').eq('user_id', userId).order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

  // Chat
	async insertChatMessage(messageData: any): Promise<any> {
		const { data, error } = await supabase.from('chat_messages').insert(messageData).select().single();
		if (error) throw error;
		return data;
	},

	async selectChatMessagesByUser(userId: string): Promise<any[]> {
		const { data, error } = await supabase
			.from('chat_messages')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });
		if (error) throw error;
		return data || [];
	},

	// Alertas (placeholders por ora)
  async insertAlerta(alertaData: any): Promise<any> { throw new Error('insertAlerta not implemented'); },
  async selectAlertasByUser(userId: string): Promise<any[]> { return []; },
  async updateAlerta(alertaId: string, alertaData: any): Promise<any> { throw new Error('updateAlerta not implemented'); },

  // Mercado
  async selectPrecosMercado(): Promise<any[]> { return []; },

  // Dashboard
	async getEstatisticasDashboard(userId: string): Promise<any> {
		const [animaisRes, vendasRes] = await Promise.all([
			supabase.from('animais').select('id').eq('user_id', userId),
			supabase.from('vendas').select('valor_total').eq('user_id', userId)
		]);
		const total_animais = animaisRes.error ? 0 : (animaisRes.data?.length || 0);
		const receita_mensal = vendasRes.error ? 0 : (vendasRes.data || []).reduce((sum: number, v: any) => sum + (v.valor_total || 0), 0);
		return { total_animais, receita_mensal };
	}
};
