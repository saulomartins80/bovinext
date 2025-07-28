// Utilitários para mensagens amigáveis e personalizadas

/**
 * Obtém um nome amigável do usuário
 */
interface User {
  name?: string | null;
  email?: string | null;
  displayName?: string | null;
}
export const getFriendlyName = (user: User | null): string => {
  if (!user) {
    return "Usuário";
  }
  
  // Check name (string | null)
  if (user?.name && typeof user.name === 'string') {
    // Usar apenas o primeiro nome se houver mais de um
    const firstName = user.name.split(' ')[0];
    return firstName;
  }
  
  // Check displayName (for Firebase users)
  if (user?.displayName && typeof user.displayName === 'string') {
    const firstName = user.displayName.split(' ')[0];
    return firstName;
  }
  
  if (user?.email && typeof user.email === 'string') {
    // Usar prefixo do email se não houver nome
    const emailPrefix = user.email.split('@')[0];
    // Capitalizar primeira letra
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  }
  
  // Fallback amigável
  return "Amigo";
};

/**
 * Obtém saudação baseada na hora do dia
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

/**
 * Mensagens de erro amigáveis
 */
export const friendlyErrorMessages = {
  network: "Parece que você está sem conexão. Verifique sua internet e tente novamente.",
  server: "Nosso servidor está temporariamente indisponível. Tente novamente em alguns minutos.",
  auth: "Sua sessão expirou. Faça login novamente para continuar.",
  validation: "Verifique os dados informados e tente novamente.",
  unknown: "Algo inesperado aconteceu. Tente novamente ou entre em contato conosco.",
  save: "Não foi possível salvar. Verifique os dados e tente novamente.",
  load: "Não conseguimos carregar os dados. Tente novamente em alguns instantes.",
  delete: "Não foi possível excluir. Tente novamente.",
  update: "Não foi possível atualizar. Tente novamente.",
};

/**
 * Mensagens de sucesso amigáveis
 */
export const friendlySuccessMessages = {
  save: "Salvo com sucesso!",
  update: "Atualizado com sucesso!",
  delete: "Excluído com sucesso!",
  login: "Login realizado com sucesso!",
  logout: "Logout realizado com sucesso!",
  register: "Cadastro realizado com sucesso!",
  passwordChange: "Senha alterada com sucesso!",
  profileUpdate: "Perfil atualizado com sucesso!",
};

/**
 * Mensagens de confirmação personalizadas
 */
interface ConfirmationData {
  valor?: number;
  tipo?: string;
  valor_total?: number;
  meta?: string;
  nome?: string;
}
export const getConfirmationMessage = (
  type: 'transaction' | 'goal' | 'investment', 
  data: ConfirmationData
): string => {
  switch (type) {
    case 'transaction': {
      const valor = data.valor?.toFixed(2) || '0,00';
      const tipo = data.tipo === 'receita' ? 'receita' : 'despesa';
      return `Ótimo! Vamos registrar essa ${tipo} de R$ ${valor}?`;
    }
    
    case 'goal': {
      const goalValor = data.valor_total?.toFixed(2) || '0,00';
      const meta = data.meta || 'meta';
      return `Vamos criar sua meta "${meta}" com valor de R$ ${goalValor}?`;
    }
    
    case 'investment': {
      const invValor = data.valor?.toFixed(2) || '0,00';
      const nome = data.nome || 'investimento';
      const invTipo = data.tipo || 'investimento';
      return `Vamos registrar seu investimento "${nome}" (${invTipo}) de R$ ${invValor}?`;
    }
    
    default:
      return "Confirme as informações:";
  }
};

/**
 * Mensagens de validação amigáveis
 */
export const friendlyValidationMessages = {
  required: "Este campo é obrigatório",
  email: "Digite um email válido",
  password: "A senha deve ter pelo menos 6 caracteres",
  passwordMatch: "As senhas não coincidem",
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  numeric: "Digite apenas números",
  currency: "Digite um valor válido (ex: 250,00)",
  positive: "O valor deve ser positivo",
  notZero: "O valor não pode ser zero",
  date: "Digite uma data válida",
  futureDate: "A data deve ser futura",
  pastDate: "A data deve ser passada",
};

/**
 * Mensagens de loading amigáveis
 */
export const friendlyLoadingMessages = {
  saving: "Salvando...",
  loading: "Carregando...",
  updating: "Atualizando...",
  deleting: "Excluindo...",
  processing: "Processando...",
  connecting: "Conectando...",
  authenticating: "Autenticando...",
  searching: "Buscando...",
  calculating: "Calculando...",
};

/**
 * Mensagens de boas-vindas personalizadas
 */
export const getWelcomeMessage = (user: User | null): string => {
  const greeting = getGreeting();
  const name = getFriendlyName(user);
  return `${greeting}, ${name}!`;
};

/**
 * Mensagens de feedback para ações do usuário
 */
export const getActionFeedback = (action: string, success: boolean = true): string => {
  if (success) {
    switch (action) {
      case 'create': return "Criado com sucesso!";
      case 'update': return "Atualizado com sucesso!";
      case 'delete': return "Removido com sucesso!";
      case 'save': return "Salvo com sucesso!";
      case 'send': return "Enviado com sucesso!";
      default: return "Ação realizada com sucesso!";
    }
  } else {
    switch (action) {
      case 'create': return "Não foi possível criar. Tente novamente.";
      case 'update': return "Não foi possível atualizar. Tente novamente.";
      case 'delete': return "Não foi possível remover. Tente novamente.";
      case 'save': return "Não foi possível salvar. Tente novamente.";
      case 'send': return "Não foi possível enviar. Tente novamente.";
      default: return "Não foi possível realizar a ação. Tente novamente.";
    }
  }
}; 