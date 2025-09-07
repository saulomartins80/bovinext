import { supabaseService } from '../services/SupabaseService';
import { Database } from '../types/database.types';

type AnimalRow = Database['public']['Tables']['animais']['Row'];
type AnimalInsert = Database['public']['Tables']['animais']['Insert'];
type AnimalUpdate = Database['public']['Tables']['animais']['Update'];

export class Animal {
  static async create(animalData: AnimalInsert): Promise<AnimalRow> {
    return await supabaseService.createAnimal(animalData);
  }

  static async findByUser(userId: string, status?: string): Promise<AnimalRow[]> {
    return await supabaseService.getAnimaisByUser(userId, status);
  }

  static async findById(animalId: string): Promise<AnimalRow> {
    return await supabaseService.getAnimalById(animalId);
  }

  static async update(animalId: string, updates: AnimalUpdate): Promise<AnimalRow> {
    return await supabaseService.updateAnimal(animalId, updates);
  }

  static async delete(animalId: string): Promise<boolean> {
    return await supabaseService.deleteAnimal(animalId);
  }

  // Métodos específicos para pecuária
  static async findByBrinco(userId: string, brinco: string): Promise<AnimalRow | null> {
    const animais = await supabaseService.getAnimaisByUser(userId);
    return animais.find(animal => animal.brinco === brinco) || null;
  }

  static async getByLote(userId: string, lote: string): Promise<AnimalRow[]> {
    const animais = await supabaseService.getAnimaisByUser(userId);
    return animais.filter(animal => animal.lote === lote);
  }

  static async getByRaca(userId: string, raca: string): Promise<AnimalRow[]> {
    const animais = await supabaseService.getAnimaisByUser(userId);
    return animais.filter(animal => animal.raca === raca);
  }

  static async getAnimaisParaVenda(userId: string, pesoMinimo: number = 450): Promise<AnimalRow[]> {
    const animais = await supabaseService.getAnimaisByUser(userId, 'ativo');
    return animais.filter(animal => 
      animal.peso_atual && 
      animal.peso_atual >= pesoMinimo &&
      animal.sexo === 'macho'
    );
  }

  static async getMatrizes(userId: string): Promise<AnimalRow[]> {
    const animais = await supabaseService.getAnimaisByUser(userId, 'ativo');
    return animais.filter(animal => animal.sexo === 'femea');
  }

  static async getReprodutores(userId: string): Promise<AnimalRow[]> {
    const animais = await supabaseService.getAnimaisByUser(userId, 'ativo');
    return animais.filter(animal => animal.sexo === 'macho');
  }

  // Cálculos zootécnicos
  static calcularIdadeEmMeses(dataNascimento: string): number {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje.getTime() - nascimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30);
  }

  static calcularGMD(pesoInicial: number, pesoFinal: number, dias: number): number {
    return (pesoFinal - pesoInicial) / dias;
  }

  static determinarCategoria(sexo: 'macho' | 'femea', idadeMeses: number): string {
    if (sexo === 'macho') {
      if (idadeMeses <= 8) return 'BEZERRO';
      if (idadeMeses <= 24) return 'NOVILHO';
      return 'BOI';
    } else {
      if (idadeMeses <= 8) return 'BEZERRA';
      if (idadeMeses <= 24) return 'NOVILHA';
      return 'VACA';
    }
  }
}
