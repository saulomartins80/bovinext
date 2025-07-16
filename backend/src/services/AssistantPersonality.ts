interface RawResponse {
  response: string;
  action?: any;
  insights?: string[];
  recommendations?: any[];
  followUpQuestions?: string[];
  metadata?: any;
}

interface AssistantResponse extends RawResponse {
  personality: {
    tone: string;
    style: string;
    expertise: string;
    empathy: string;
  };
}

interface UserProfile {
  name?: string;
  subscriptionPlan?: string;
  riskProfile?: string;
  communicationStyle?: string;
  expertise?: string;
}

export class AssistantPersonality {
  private traits = {
    tone: "amigável e profissional",
    style: "explicativo mas conciso",
    expertise: "alto conhecimento financeiro",
    empathy: "alto nível",
    humor: "ocasional e discreto"
  };

  private expertiseLevels = {
    basic: {
      vocabulary: "simples e direto",
      explanations: "com exemplos práticos",
      technicalTerms: "evitados ou explicados"
    },
    intermediate: {
      vocabulary: "técnico moderado",
      explanations: "detalhadas mas acessíveis",
      technicalTerms: "usados com contexto"
    },
    advanced: {
      vocabulary: "técnico avançado",
      explanations: "profundas e detalhadas",
      technicalTerms: "usados livremente"
    }
  };

  private communicationStyles = {
    detailed: {
      responseLength: "longa e completa",
      examples: "múltiplos exemplos",
      explanations: "passo a passo"
    },
    concise: {
      responseLength: "curta e direta",
      examples: "um exemplo principal",
      explanations: "pontos-chave"
    },
    visual: {
      responseLength: "média com estrutura",
      examples: "com números e dados",
      explanations: "organizadas em tópicos"
    }
  };

  addTone(response: RawResponse, userProfile?: UserProfile): AssistantResponse {
    try {
      console.log('[AssistantPersonality] 🎭 Aplicando personalidade à resposta');

      const adaptedResponse = this.adaptToUserProfile(response, userProfile);
      const personalizedResponse = this.addPersonalizedElements(adaptedResponse, userProfile);
      const finalResponse = this.applyPersonalityTraits(personalizedResponse);

      return {
        ...finalResponse,
        personality: {
          tone: this.traits.tone,
          style: this.traits.style,
          expertise: this.traits.expertise,
          empathy: this.traits.empathy
        }
      };

    } catch (error) {
      console.error('[AssistantPersonality] ❌ Erro ao aplicar personalidade:', error);
      return {
        ...response,
        personality: {
          tone: "profissional",
          style: "direto",
          expertise: "básico",
          empathy: "neutro"
        }
      };
    }
  }

  private adaptToUserProfile(response: RawResponse, userProfile?: UserProfile): RawResponse {
    if (!userProfile) return response;

    const expertise = userProfile.expertise || 'basic';
    const communicationStyle = userProfile.communicationStyle || 'concise';
    const userName = userProfile.name;

    // Adaptar vocabulário ao nível de expertise
    let adaptedResponse = response.response;
    
    if (expertise === 'basic') {
      adaptedResponse = this.simplifyLanguage(adaptedResponse);
    } else if (expertise === 'advanced') {
      adaptedResponse = this.enhanceTechnicalLanguage(adaptedResponse);
    }

    // Adaptar estilo de comunicação
    if (communicationStyle === 'detailed') {
      adaptedResponse = this.addDetailedExplanations(adaptedResponse);
    } else if (communicationStyle === 'visual') {
      adaptedResponse = this.addVisualStructure(adaptedResponse);
    }

    // Personalizar com nome do usuário
    if (userName) {
      adaptedResponse = this.personalizeWithName(adaptedResponse, userName);
    }

    return {
      ...response,
      response: adaptedResponse
    };
  }

  private addPersonalizedElements(response: RawResponse, userProfile?: UserProfile): RawResponse {
    if (!userProfile) return response;

    const riskProfile = userProfile.riskProfile;
    const subscriptionPlan = userProfile.subscriptionPlan;

    let personalizedResponse = response.response;

    // Adicionar elementos baseados no perfil de risco
    if (riskProfile) {
      personalizedResponse = this.addRiskProfileContext(personalizedResponse, riskProfile);
    }

    // Adicionar elementos baseados no plano de assinatura
    if (subscriptionPlan === 'premium') {
      personalizedResponse = this.addPremiumFeatures(personalizedResponse);
    }

    // Adicionar empatia e encorajamento
    personalizedResponse = this.addEmpathyAndEncouragement(personalizedResponse);

    return {
      ...response,
      response: personalizedResponse
    };
  }

  private applyPersonalityTraits(response: RawResponse): RawResponse {
    let finalResponse = response.response;

    // Aplicar tom amigável mas profissional
    finalResponse = this.applyFriendlyProfessionalTone(finalResponse);

    // Adicionar expertise quando apropriado
    finalResponse = this.addExpertiseInsights(finalResponse);

    // Adicionar humor ocasional
    finalResponse = this.addOccasionalHumor(finalResponse);

    return {
      ...response,
      response: finalResponse
    };
  }

  private simplifyLanguage(text: string): string {
    const replacements = {
      'diversificação': 'distribuição de investimentos',
      'alocação': 'distribuição',
      'volatilidade': 'variações',
      'liquidez': 'facilidade de resgate',
      'rentabilidade': 'retorno',
      'patrimônio': 'bens',
      'aportes': 'investimentos',
      'resgate': 'saque'
    };

    let simplified = text;
    Object.entries(replacements).forEach(([complex, simple]) => {
      simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
    });

    return simplified;
  }

  private enhanceTechnicalLanguage(text: string): string {
    const enhancements = {
      'investimento': 'alocação de capital',
      'poupança': 'reserva de liquidez',
      'meta': 'objetivo financeiro',
      'transação': 'movimentação financeira',
      'análise': 'avaliação quantitativa'
    };

    let enhanced = text;
    Object.entries(enhancements).forEach(([simple, technical]) => {
      enhanced = enhanced.replace(new RegExp(simple, 'gi'), technical);
    });

    return enhanced;
  }

  private addDetailedExplanations(text: string): string {
    // Adicionar explicações mais detalhadas
    const explanations = {
      'diversificação': ' (distribuir o dinheiro em diferentes tipos de investimentos para reduzir riscos)',
      'juros compostos': ' (juros sobre juros, que fazem o dinheiro crescer exponencialmente ao longo do tempo)',
      'inflação': ' (aumento geral dos preços que diminui o poder de compra do dinheiro)'
    };

    let detailed = text;
    Object.entries(explanations).forEach(([term, explanation]) => {
      if (detailed.includes(term)) {
        detailed = detailed.replace(term, term + explanation);
      }
    });

    return detailed;
  }

  private addVisualStructure(text: string): string {
    // Adicionar estrutura visual com emojis e formatação
    const structured = text
      .replace(/•/g, '📌')
      .replace(/✅/g, '✅')
      .replace(/⚠️/g, '⚠️')
      .replace(/💡/g, '💡');

    return structured;
  }

  private personalizeWithName(text: string, userName: string): string {
    // Adicionar nome do usuário de forma natural
    const greetings = [
      `Olá ${userName}!`,
      `${userName}, `,
      `Perfeito, ${userName}!`,
      `${userName}, `
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (!text.includes(userName)) {
      return text.replace(/^(Olá|Oi|Perfeito|Que legal)/, randomGreeting);
    }

    return text;
  }

  private addRiskProfileContext(text: string, riskProfile: string): string {
    const riskContexts = {
      conservative: ' (considerando seu perfil conservador, focamos em segurança)',
      moderate: ' (com seu perfil moderado, equilibramos risco e retorno)',
      aggressive: ' (seu perfil agressivo permite buscar maiores retornos)'
    };

    const context = riskContexts[riskProfile as keyof typeof riskContexts];
    if (context && !text.includes('perfil')) {
      return text + context;
    }

    return text;
  }

  private addPremiumFeatures(text: string): string {
    const premiumAdditions = [
      '\n\n💎 Como usuário premium, você tem acesso a análises mais detalhadas e recomendações personalizadas.',
      '\n\n⭐ Sua assinatura premium permite insights exclusivos e estratégias avançadas.',
      '\n\n🚀 Com seu plano premium, posso oferecer análises mais profundas e sugestões otimizadas.'
    ];

    const randomAddition = premiumAdditions[Math.floor(Math.random() * premiumAdditions.length)];
    return text + randomAddition;
  }

  private addEmpathyAndEncouragement(text: string): string {
    const encouragements = [
      ' Você está no caminho certo!',
      ' Continue assim!',
      ' Cada passo conta!',
      ' Você está fazendo um ótimo trabalho!'
    ];

    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    if (text.includes('meta') || text.includes('investimento') || text.includes('poupança')) {
      return text + randomEncouragement;
    }

    return text;
  }

  private applyFriendlyProfessionalTone(text: string): string {
    // Manter tom amigável mas profissional
    const friendlyReplacements = {
      'você deve': 'eu sugiro',
      'você precisa': 'recomendo',
      'você tem que': 'aconselho',
      'obrigatório': 'recomendado',
      'necessário': 'importante'
    };

    let friendly = text;
    Object.entries(friendlyReplacements).forEach(([formal, friendly]) => {
      friendly = friendly.replace(new RegExp(formal, 'gi'), friendly);
    });

    return friendly;
  }

  private addExpertiseInsights(text: string): string {
    const insights = [
      ' 💡 Dica: ',
      ' 📊 Insight: ',
      ' 🎯 Estratégia: ',
      ' ⚡ Pro tip: '
    ];

    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    
    if (text.includes('investimento') && !text.includes('💡') && !text.includes('📊')) {
      return text + randomInsight + 'Diversificação é sempre uma boa estratégia.';
    }

    return text;
  }

  private addOccasionalHumor(text: string): string {
    // Adicionar humor discreto ocasionalmente (20% das vezes)
    if (Math.random() < 0.2) {
      const humorElements = [
        ' 😊',
        ' 🎯',
        ' 💪',
        ' 🚀'
      ];
      
      const randomHumor = humorElements[Math.floor(Math.random() * humorElements.length)];
      return text + randomHumor;
    }

    return text;
  }

  getPersonalityStats(): any {
    return {
      traits: this.traits,
      expertiseLevels: Object.keys(this.expertiseLevels),
      communicationStyles: Object.keys(this.communicationStyles),
      version: '1.0'
    };
  }
} 