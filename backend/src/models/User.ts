import { supabaseService } from '../services/SupabaseService';
import { Database } from '../types/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface ISubscription {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripePriceId?: string;
    status?: string;
    plan?: string;
    cancelAtPeriodEnd?: boolean;
    expiresAt?: Date;
    currentPeriodEnd?: Date;
    trialEndsAt?: Date;
    subscriptionId?: string;
    updatedAt?: Date;
}

// Interface para compatibilidade com código existente
export interface IUser {
    id: string;
    email?: string;
    name?: string;
    firebaseUid: string;
    photoUrl?: string;
    fazenda_nome: string;
    fazenda_area?: number;
    fazenda_localizacao?: string;
    tipo_criacao?: string;
    experiencia_anos?: number;
    subscription?: {
        plan: string;
        status: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
  static async create(userData: UserInsert): Promise<UserRow> {
    return await supabaseService.createUser(userData);
  }

  static async findByFirebaseUid(firebaseUid: string): Promise<UserRow | null> {
    return await supabaseService.getUserByFirebaseUid(firebaseUid);
  }

  static async findById(userId: string): Promise<UserRow | null> {
    try {
      return await supabaseService.getUserByFirebaseUid(userId);
    } catch (error) {
      return null;
    }
  }

  static async update(userId: string, updates: UserUpdate): Promise<UserRow> {
    return await supabaseService.updateUser(userId, updates);
  }

  // Método para compatibilidade com código existente
  static async findOne(query: { firebaseUid: string }): Promise<IUser | null> {
    const user = await supabaseService.getUserByFirebaseUid(query.firebaseUid);
    if (!user) return null;

    return {
      id: user.id,
      firebaseUid: user.firebase_uid,
      email: user.email,
      name: user.display_name || undefined,
      fazenda_nome: user.fazenda_nome,
      fazenda_area: user.fazenda_area || undefined,
      fazenda_localizacao: user.fazenda_localizacao || undefined,
      tipo_criacao: user.tipo_criacao || undefined,
      experiencia_anos: user.experiencia_anos || undefined,
      subscription: {
        plan: user.subscription_plan,
        status: user.subscription_status
      },
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    };
  }
}