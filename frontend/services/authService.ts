//frontend/services/authservices.ts - Firebase disabled, using Supabase
/* eslint-disable @typescript-eslint/no-unused-vars */
import api from './api';

export const authService = {
  async loginWithGoogle() {
    try {
      // Firebase disabled - redirect to Supabase auth
      throw new Error('Firebase disabled - use Supabase authentication');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  async login(email: string, password: string) {
    // Firebase disabled - redirect to Supabase auth
    throw new Error('Firebase disabled - use Supabase authentication');
  },

  async logout() {
    // Firebase disabled - redirect to Supabase auth
    throw new Error('Firebase disabled - use Supabase authentication');
  },

  async getSession() {
    try {
      const response = await api.get('/auth/session');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  async verifyToken(token: string) {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  },
};