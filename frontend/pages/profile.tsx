'use client';

import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { User } from '@supabase/supabase-js';
import { 
  FiEdit, 
  FiCamera, 
  FiCheck, 
  FiX, 
  FiEye, 
  FiEyeOff, 
  FiAlertCircle,
  FiSettings,
  FiCreditCard
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

interface FormData {
  name: string;
  email: string;
  phone: string;
  fazenda: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const { user: authUser, updateProfile } = useAuth();
  const router = useRouter();
  
  // Define our custom user metadata type
  interface CustomUserMetadata {
    name?: string;
    avatar_url?: string;
    [key: string]: any;
  }

  // Extend the User type to include our custom fields
  interface ExtendedUser extends Omit<User, 'user_metadata'> {
    user_metadata: CustomUserMetadata;
    phone?: string;
    fazenda?: string;
    name?: string;
  }
  
  // Safely cast the auth user to our extended type
  const user = (authUser as unknown) as ExtendedUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    fazenda: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(user?.user_metadata?.avatar_url || '/default-avatar.png');
    setFormData({
      name: user?.user_metadata?.name || user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      fazenda: user?.fazenda || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Upload de avatar para o storage do Supabase
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuário não autenticado');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) throw uploadError;
    
    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  // Carrega os dados do perfil do usuário
  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Busca os dados do perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Atualiza o estado com os dados do perfil
      setFormData(prev => ({
        ...prev,
        name: profileData?.name || (user.user_metadata as any)?.name || '',
        email: user.email || '',
        phone: profileData?.phone || '',
        fazenda: profileData?.fazenda_nome || ''
      }));
      
      // Define a prévia do avatar
      if (profileData?.avatar_url) {
        setAvatarPreview(profileData.avatar_url);
      } else if ((user.user_metadata as any)?.avatar_url) {
        setAvatarPreview((user.user_metadata as any).avatar_url);
      }
      
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  }, [user]); // Removido supabase do array de dependências
  
  // Carrega os dados do perfil quando o componente é montado ou o usuário muda
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  // Manipulador de envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verificar se as senhas coincidem
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }
      
      // Atualizar perfil
      const updates = {
        name: formData.name,
        phone: formData.phone,
        fazenda: formData.fazenda,
        updated_at: new Date().toISOString()
      };
      
      // Se houver um novo avatar para enviar
      if (avatarFile) {
        try {
          setIsUploading(true);
          const avatarUrl = await uploadAvatar(avatarFile);
          await updateProfile({
            ...updates,
            avatar_url: avatarUrl
          });
          setAvatarPreview(avatarUrl);
          toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
          console.error('Erro ao fazer upload do avatar:', error);
          toast.error('Erro ao atualizar o avatar. Tente novamente.');
        } finally {
          setIsUploading(false);
        }
      } else {
        // Atualizar apenas os dados do perfil
        await updateProfile(updates);
        toast.success('Perfil atualizado com sucesso!');
      }
      
      // Se houver uma nova senha para atualizar
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        
        if (passwordError) throw passwordError;
        
        // Limpar campos de senha
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        toast.success('Senha atualizada com sucesso!');
      }
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipula a mudança de avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Valida o tipo do arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPEG, PNG ou WEBP');
      return;
    }
    
    // Valida o tamanho do arquivo (máx. 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 2MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Faz upload da imagem para o Supabase Storage
      const avatarUrl = await uploadAvatar(file);
      
      // Atualiza a URL do avatar no perfil do usuário
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);
        
      if (updateError) throw updateError;
      
      // Atualiza a visualização do avatar
      setAvatarPreview(avatarUrl);
      
      // Atualiza o contexto de autenticação
      if (user) {
        updateProfile({ ...user, avatar_url: avatarUrl });
      }
      
      toast.success('Avatar atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar o avatar:', error);
      toast.error('Erro ao atualizar o avatar. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Função para lidar com o logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  // Redireciona para a página de gerenciamento de assinatura
  const handleManageSubscription = async () => {
    toast.info('Gerenciamento de assinatura será implementado em breve.');
    console.log('[Profile] Iniciando criação de sessão do portal...');
  };

  const currentAvatarSrc = avatarPreview || (user?.user_metadata as any)?.avatar_url || '/default-avatar.png';

  // Se não houver usuário, redireciona para o login
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Mostra um indicador de carregamento
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gerencie suas informações pessoais e segurança
            </p>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setAvatarFile(null);
                    setAvatarPreview((user?.user_metadata as any)?.avatar_url || '/default-avatar.png');
                    setFormData({
                      name: (user?.user_metadata as any)?.name || user?.name || '',
                      email: user?.email || '',
                      phone: (user as any)?.phone || '',
                      fazenda: (user as any)?.fazenda || '',
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiX className="inline mr-2" /> Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading || isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FiCheck className="inline mr-2" /> Salvar
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                <FiEdit className="inline mr-2" /> Editar Perfil
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-200 overflow-hidden">
                  <Image
                    src={currentAvatarSrc}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    priority
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                {isEditing && !isUploading && (
                  <>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <FiCamera className="text-white text-2xl" />
                      <span className="sr-only">Alterar foto</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </>
                )}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">
                {isEditing ? (
                  <input
                    type="text"
                    id="header-name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-transparent border-b border-white text-center text-white placeholder-white::placeholder focus:outline-none"
                  />
                ) : (
                  user?.name || 'Usuário'
                )}
              </h2>
              <p className="text-blue-100">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="name"
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-gray-900 dark:text-gray-200">
                          {user?.name || 'Não informado'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-md text-gray-900 dark:text-gray-200">
                          {user?.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Segurança (Alterar Senha/Email)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Senha Atual (Necessária para alterar email ou senha)
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            autoComplete="current-password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nova Senha
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              id="newPassword"
                              name="newPassword"
                              autoComplete="new-password"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirmar Nova Senha
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              autoComplete="new-password"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Assinatura
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700/50 dark:to-gray-800/60 p-6 rounded-lg border border-blue-100 dark:border-gray-700">
                    {loading ? ( // Mock loading for BOVINEXT
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Plano Atual</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                              Gratuito
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                            <p className="text-lg font-medium capitalize text-yellow-600">
                              Inativo
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            Gerenciar Assinatura
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push('/assinaturas')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors"
                          >
                            Upgrade para Premium
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ações
          </h2>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/assinaturas')}
              className="w-full flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiCreditCard className="w-5 h-5 text-purple-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Gerenciar Assinatura</span>
            </button>

            <button
              onClick={() => router.push('/configuracoes')}
              className="w-full flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FiSettings className="w-5 h-5 text-purple-500 mr-3" />
              <span className="text-gray-700 dark:text-gray-300">Configurações</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-red-500"
            >
              <FiAlertCircle className="w-5 h-5 mr-3" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 