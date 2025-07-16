/***************************************
 * 🤖 PERSONALITY SERVICE - HUMANIZAÇÃO DO CHATBOT
 * (Sistema para tornar o chatbot mais natural e brasileiro)
 ***************************************/

interface UserMood {
  mood: 'happy' | 'stressed' | 'neutral' | 'excited' | 'worried';
  confidence: number;
  keywords: string[];
}

interface PersonalityContext {
  userId: string;
  userMood: UserMood;
  conversationHistory: any[];
  userPreferences: any;
  lastInteraction: Date;
  interactionCount: number;
}

interface NaturalResponse {
  text: string;
  emoji: string;
  tone: 'casual' | 'formal' | 'friendly' | 'professional' | 'excited';
  followUpQuestions: string[];
}

export class PersonalityService {
  private userPersonalities = new Map<string, PersonalityContext>();

  // 🎭 DETECTAR HUMOR DO USUÁRIO
  async detectUserMood(message: string): Promise<UserMood> {
    const lowerMessage = message.toLowerCase();
    
    // Palavras-chave para cada humor
    const moodKeywords = {
      happy: ['legal', 'ótimo', 'demais', 'incrível', 'maravilhoso', 'perfeito', 'show', 'top', 'massa', 'irado'],
      stressed: ['estressado', 'cansado', 'preocupado', 'ansioso', 'nervoso', 'tenso', 'difícil', 'complicado'],
      excited: ['empolgado', 'animado', 'eufórico', 'maravilhado', 'impressionado', 'surpreso', 'uau'],
      worried: ['preocupado', 'medo', 'ansioso', 'nervoso', 'tenso', 'estressado', 'difícil'],
      neutral: ['ok', 'beleza', 'tranquilo', 'suave', 'tudo bem', 'tudo certo']
    };

    // Detectar humor baseado em palavras-chave
    let detectedMood: keyof typeof moodKeywords = 'neutral';
    let maxScore = 0;
    const foundKeywords: string[] = [];

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      const score = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedMood = mood as keyof typeof moodKeywords;
        foundKeywords.push(...keywords.filter(keyword => lowerMessage.includes(keyword)));
      }
    }

    // Detectar humor baseado em emojis
    const emojiMoodMap: { [key: string]: keyof typeof moodKeywords } = {
      '😊': 'happy', '😄': 'happy', '😃': 'happy', '😁': 'happy', '😆': 'happy',
      '😡': 'stressed', '😤': 'stressed', '😰': 'stressed', '😨': 'stressed',
      '🤩': 'excited', '😍': 'excited', '😱': 'excited', '😲': 'excited',
      '😟': 'worried', '😕': 'worried', '😔': 'worried', '😞': 'worried',
      '😐': 'neutral', '😑': 'neutral', '😶': 'neutral'
    };

    for (const [emoji, mood] of Object.entries(emojiMoodMap)) {
      if (message.includes(emoji)) {
        detectedMood = mood;
        foundKeywords.push(emoji);
        break;
      }
    }

    // Detectar humor baseado em pontuação
    if (message.includes('!') && message.includes('!')) {
      detectedMood = 'excited';
    } else if (message.includes('...') || message.includes('??')) {
      detectedMood = 'worried';
    }

    return {
      mood: detectedMood,
      confidence: Math.min(0.9, 0.3 + (maxScore * 0.2)),
      keywords: foundKeywords
    };
  }

  // 🎨 ADAPTAR TOM BASEADO NO HUMOR
  async adaptTone(mood: UserMood, context: any): Promise<string> {
    const toneAdaptations = {
      happy: {
        prefix: ['Que legal!', 'Demais!', 'Show de bola!', 'Incrível!', 'Perfeito!'],
        suffix: ['😊', '🎉', '✨', '🚀', '💪'],
        style: 'casual'
      },
      stressed: {
        prefix: ['Tranquilo!', 'Fica calmo!', 'Vamos resolver isso!', 'Não se preocupe!'],
        suffix: ['😌', '🤗', '💪', '✨', '🌟'],
        style: 'supportive'
      },
      excited: {
        prefix: ['Uau!', 'Que demais!', 'Incrível!', 'Fantástico!', 'Maravilhoso!'],
        suffix: ['🤩', '🎉', '🚀', '💫', '⭐'],
        style: 'excited'
      },
      worried: {
        prefix: ['Fica tranquilo!', 'Não se preocupe!', 'Vamos resolver!', 'Tudo vai dar certo!'],
        suffix: ['🤗', '💪', '✨', '🌟', '😊'],
        style: 'reassuring'
      },
      neutral: {
        prefix: ['Beleza!', 'Tranquilo!', 'Suave!', 'Tudo certo!', 'Perfeito!'],
        suffix: ['😊', '👍', '✨', '💪', '🚀'],
        style: 'casual'
      }
    };

    const adaptation = toneAdaptations[mood.mood];
    const randomPrefix = adaptation.prefix[Math.floor(Math.random() * adaptation.prefix.length)];
    const randomSuffix = adaptation.suffix[Math.floor(Math.random() * adaptation.suffix.length)];

    return `${randomPrefix} ${randomSuffix}`;
  }

  // 🗣️ GERAR RESPOSTA NATURAL
  async generateNaturalResponse(intent: string, mood: UserMood, context: any): Promise<NaturalResponse> {
    const responses = {
      CREATE_TRANSACTION: {
        happy: {
          text: 'Que legal que você quer registrar uma transação! 💰 Vamos lá, qual valor e o que foi essa transação?',
          emoji: '💰',
          tone: 'excited',
          followUpQuestions: ['Quer categorizar automaticamente?', 'Tem mais alguma transação para registrar?']
        },
        stressed: {
          text: 'Tranquilo! Vamos registrar essa transação juntos! 💰 Qual valor e o que foi?',
          emoji: '💰',
          tone: 'supportive',
          followUpQuestions: ['Posso te ajudar a categorizar?', 'Quer que eu analise o impacto nas suas metas?']
        },
        neutral: {
          text: 'Beleza! Vamos registrar sua transação! 💰 Qual valor e o que foi?',
          emoji: '💰',
          tone: 'casual',
          followUpQuestions: ['Quer categorizar?', 'Tem mais alguma?']
        }
      },
      CREATE_GOAL: {
        happy: {
          text: 'Incrível! Vamos criar uma meta nova! 🎯 Qual valor você quer juntar e para qual objetivo?',
          emoji: '🎯',
          tone: 'excited',
          followUpQuestions: ['Quer definir um prazo?', 'Posso te ajudar a calcular quanto economizar por mês?']
        },
        stressed: {
          text: 'Ótimo! Vamos criar uma meta para organizar suas finanças! 🎯 Qual valor e objetivo?',
          emoji: '🎯',
          tone: 'supportive',
          followUpQuestions: ['Quer que eu sugira um prazo realista?', 'Posso te ajudar com estratégias de economia?']
        },
        neutral: {
          text: 'Beleza! Vamos criar sua meta! 🎯 Qual valor e para que você quer juntar?',
          emoji: '🎯',
          tone: 'casual',
          followUpQuestions: ['Quer definir prazo?', 'Posso calcular economia mensal?']
        }
      },
      CREATE_INVESTMENT: {
        happy: {
          text: 'Fantástico! Vamos registrar seu investimento! 📈 Qual valor, tipo e nome do investimento?',
          emoji: '📈',
          tone: 'excited',
          followUpQuestions: ['Quer que eu analise o risco?', 'Posso sugerir outros investimentos similares?']
        },
        stressed: {
          text: 'Perfeito! Vamos registrar seu investimento! 📈 Qual valor, tipo e nome?',
          emoji: '📈',
          tone: 'supportive',
          followUpQuestions: ['Quer que eu analise se é adequado ao seu perfil?', 'Posso explicar os riscos?']
        },
        neutral: {
          text: 'Beleza! Vamos registrar seu investimento! 📈 Qual valor, tipo e nome?',
          emoji: '📈',
          tone: 'casual',
          followUpQuestions: ['Quer análise de risco?', 'Posso sugerir outros?']
        }
      },
      GREETING: {
        happy: {
          text: 'Oi! Que legal te ver por aqui! 😊 Como posso te ajudar hoje?',
          emoji: '😊',
          tone: 'excited',
          followUpQuestions: ['Quer dar uma olhada no dashboard?', 'Tem alguma transação para registrar?']
        },
        stressed: {
          text: 'Oi! Tudo bem? 🤗 Como posso te ajudar hoje?',
          emoji: '🤗',
          tone: 'supportive',
          followUpQuestions: ['Quer que eu analise suas finanças?', 'Posso te ajudar com alguma meta?']
        },
        neutral: {
          text: 'Oi! Tudo bem? 😊 Como posso te ajudar hoje?',
          emoji: '😊',
          tone: 'casual',
          followUpQuestions: ['Quer ver o dashboard?', 'Tem algo para registrar?']
        }
      },
      DASHBOARD: {
        happy: {
          text: 'Perfeito! Vamos dar uma olhada no seu dashboard! 📊',
          emoji: '📊',
          tone: 'excited',
          followUpQuestions: ['Quer que eu analise seus gastos?', 'Posso sugerir melhorias?']
        },
        stressed: {
          text: 'Vamos analisar suas finanças juntos! 📊 Posso te ajudar a entender melhor.',
          emoji: '📊',
          tone: 'supportive',
          followUpQuestions: ['Quer que eu identifique oportunidades de economia?', 'Posso analisar suas metas?']
        },
        neutral: {
          text: 'Beleza! Vamos ver seu dashboard! 📊',
          emoji: '📊',
          tone: 'casual',
          followUpQuestions: ['Quer análise dos gastos?', 'Posso sugerir melhorias?']
        }
      }
    };

    const intentResponses = responses[intent as keyof typeof responses];
    if (!intentResponses) {
      return {
        text: 'Beleza! Como posso te ajudar? 😊',
        emoji: '😊',
        tone: 'casual',
        followUpQuestions: ['Quer ver o dashboard?', 'Tem algo para registrar?']
      };
    }

    const moodResponse = intentResponses[mood.mood] || intentResponses.neutral;
    return moodResponse;
  }

  // 🧠 APRENDER PREFERÊNCIAS DO USUÁRIO
  async learnUserPreferences(userId: string, message: string, response: string): Promise<void> {
    const context = this.userPersonalities.get(userId) || {
      userId,
      userMood: { mood: 'neutral', confidence: 0.5, keywords: [] },
      conversationHistory: [],
      userPreferences: {},
      lastInteraction: new Date(),
      interactionCount: 0
    };

    // Atualizar contador de interações
    context.interactionCount++;
    context.lastInteraction = new Date();

    // Detectar preferências de linguagem
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('beleza') || lowerMessage.includes('suave')) {
      context.userPreferences.languageStyle = 'casual';
    } else if (lowerMessage.includes('por favor') || lowerMessage.includes('obrigado')) {
      context.userPreferences.languageStyle = 'formal';
    }

    // Detectar preferências de emojis
    if (message.match(/[\u{1F600}-\u{1F64F}]/u)) {
      context.userPreferences.likesEmojis = true;
    }

    // Detectar preferências de detalhes
    if (lowerMessage.includes('mais detalhes') || lowerMessage.includes('explicar')) {
      context.userPreferences.likesDetails = true;
    }

    // Salvar contexto
    this.userPersonalities.set(userId, context);
  }

  // 📝 GERAR RESPOSTA PERSONALIZADA
  async generatePersonalizedResponse(userId: string, intent: string, message: string): Promise<string> {
    // Detectar humor
    const mood = await this.detectUserMood(message);
    
    // Obter contexto do usuário
    const context = this.userPersonalities.get(userId);
    
    // Gerar resposta natural
    const naturalResponse = await this.generateNaturalResponse(intent, mood, { userId, context });
    
    // Adaptar baseado nas preferências
    let response = naturalResponse.text;
    
    if (context?.userPreferences) {
      // Adicionar mais detalhes se o usuário gosta
      if (context.userPreferences.likesDetails) {
        response += ' Posso te dar mais detalhes se quiser!';
      }
      
      // Ajustar estilo de linguagem
      if (context.userPreferences.languageStyle === 'formal') {
        response = response.replace(/beleza/g, 'perfeito').replace(/suave/g, 'tranquilo');
      }
    }
    
    // Aprender com a interação
    await this.learnUserPreferences(userId, message, response);
    
    return response;
  }

  // 🎯 SUGERIR AÇÕES BASEADAS NO HUMOR
  async suggestActionsBasedOnMood(userId: string, mood: UserMood): Promise<string[]> {
    const suggestions = {
      happy: [
        'Que tal criar uma meta nova? 🎯',
        'Vamos registrar algumas transações? 💰',
        'Quer analisar seus investimentos? 📈',
        'Que tal fazer um relatório completo? 📊'
      ],
      stressed: [
        'Vamos analisar suas finanças juntos! 📊',
        'Posso te ajudar a organizar suas metas! 🎯',
        'Que tal ver onde você pode economizar? 💡',
        'Vamos criar um plano de ação! 📋'
      ],
      excited: [
        'Vamos aproveitar essa energia para organizar tudo! 🚀',
        'Que tal criar metas ambiciosas? 🎯',
        'Vamos analisar oportunidades de investimento! 📈',
        'Quer fazer um planejamento completo? 📊'
      ],
      worried: [
        'Vamos analisar suas finanças com calma! 📊',
        'Posso te ajudar a criar um plano de emergência! 🛡️',
        'Que tal revisar suas metas? 🎯',
        'Vamos identificar onde você pode economizar! 💡'
      ],
      neutral: [
        'Que tal dar uma olhada no dashboard? 📊',
        'Tem alguma transação para registrar? 💰',
        'Quer criar uma meta nova? 🎯',
        'Posso te ajudar com investimentos? 📈'
      ]
    };

    return suggestions[mood.mood] || suggestions.neutral;
  }

  // 🎨 APLICAR ESTILO BRASILEIRO
  applyBrazilianStyle(text: string): string {
    // Substituir expressões formais por brasileiras
    const brazilianExpressions = {
      'perfeito': ['beleza', 'suave', 'tranquilo', 'show'],
      'excelente': ['demais', 'irado', 'massa', 'top'],
      'muito bem': ['muito bem mesmo', 'show de bola', 'demais'],
      'obrigado': ['valeu', 'obrigado mesmo', 'valeu demais'],
      'por favor': ['por favor', 'faz favor', 'se puder'],
      'entendi': ['entendi', 'saquei', 'beleza', 'tranquilo']
    };

    let result = text;
    
    for (const [formal, brazilian] of Object.entries(brazilianExpressions)) {
      if (result.includes(formal)) {
        const randomBrazilian = brazilian[Math.floor(Math.random() * brazilian.length)];
        result = result.replace(formal, randomBrazilian);
      }
    }

    return result;
  }
}

export const personalityService = new PersonalityService(); 