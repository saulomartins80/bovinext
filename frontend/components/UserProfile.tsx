// components/UserProfile.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import api from "../services/api";

interface UserProfileData {
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

export default function UserProfile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/api/user/${user.uid}`);
        
        if (response.data) {
          setUserData(response.data);
        } else {
          throw new Error('Não conseguimos encontrar seus dados');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar seu perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Ops! Algo deu errado</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Perfil do Usuário</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <p className="mt-1 text-lg">{userData?.name || 'Não informado'}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-lg">{userData?.email}</p>
        </div>
        
        {userData?.role && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Função</label>
            <p className="mt-1 text-lg capitalize">{userData.role}</p>
          </div>
        )}
        
        {userData?.createdAt && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Membro desde</label>
            <p className="mt-1 text-lg">
              {new Date(userData.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}