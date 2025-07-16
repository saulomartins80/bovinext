/***************************************
 * 🎨 CONSTRUTOR DE RESPOSTAS
 * Gerencia templates e constrói respostas personalizadas
 ***************************************/

import * as fs from 'fs';
import * as path from 'path';

export class ResponseBuilder {
  private templates: any = {};
  private templatesPath: string;
  
  constructor() {
    this.templatesPath = path.join(__dirname, '../assets/response_templates.json');
    this.loadTemplates();
  }
  
  /**
   * 📂 CARREGAR TEMPLATES
   */
  private loadTemplates(): void {
    try {
      if (fs.existsSync(this.templatesPath)) {
        const templateData = fs.readFileSync(this.templatesPath, 'utf-8');
        this.templates = JSON.parse(templateData);
        console.log(`🎨 [ResponseBuilder] Templates carregados: ${Object.keys(this.templates).length} categorias`);
      } else {
        console.warn(`⚠️ [ResponseBuilder] Arquivo de templates não encontrado: ${this.templatesPath}`);
        this.templates = this.getDefaultTemplates();
      }
    } catch (error) {
      console.error(`❌ [ResponseBuilder] Erro ao carregar templates:`, error);
      this.templates = this.getDefaultTemplates();
    }
  }
  
  /**
   * 🎯 OBTER RESPOSTA
   */
  getResponse(intent: string, phase: string, variables?: any): string {
    console.log(`🎨 [ResponseBuilder] Obtendo resposta: ${intent}.${phase}`);
    
    const intentTemplates = this.templates[intent];
    if (!intentTemplates) {
      console.warn(`⚠️ [ResponseBuilder] Intent não encontrado: ${intent}`);
      return this.getDefaultResponse(intent, phase);
    }
    
    const phaseTemplates = intentTemplates[phase];
    if (!phaseTemplates || !Array.isArray(phaseTemplates)) {
      console.warn(`⚠️ [ResponseBuilder] Phase não encontrada: ${intent}.${phase}`);
      return this.getDefaultResponse(intent, phase);
    }
    
    // Selecionar template aleatório
    const selectedTemplate = phaseTemplates[
      Math.floor(Math.random() * phaseTemplates.length)
    ];
    
    // Substituir variáveis
    return this.replaceVariables(selectedTemplate, variables);
  }
  
  /**
   * 🔄 SUBSTITUIR VARIÁVEIS
   */
  private replaceVariables(template: string, variables?: any): string {
    if (!variables) return template;
    
    return Object.keys(variables).reduce((result, key) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      return result.replace(regex, variables[key]);
    }, template);
  }
  
  /**
   * 💡 OBTER SUGESTÕES CONTEXTUAIS
   */
  getContextualSuggestions(context: any): string[] {
    const suggestions = [];
    
    // Sugestões baseadas no contexto
    if (context.isNewUser) {
      suggestions.push(...(this.templates.CONTEXT_SUGGESTIONS?.new_user || []));
    } else if (context.subscriptionPlan === 'premium') {
      suggestions.push(...(this.templates.CONTEXT_SUGGESTIONS?.premium_user || []));
    } else {
      suggestions.push(...(this.templates.CONTEXT_SUGGESTIONS?.experienced_user || []));
    }
    
    // Sugestões baseadas na última ação
    if (context.lastActions?.length > 0) {
      const lastAction = context.lastActions[context.lastActions.length - 1];
      
      if (lastAction === 'CREATE_GOAL') {
        suggestions.push(...(this.templates.CONTEXT_SUGGESTIONS?.after_goal || []));
      } else if (lastAction === 'ADD_TRANSACTION') {
        suggestions.push(...(this.templates.CONTEXT_SUGGESTIONS?.after_transaction || []));
      }
    }
    
    return suggestions.slice(0, 4); // Máximo 4 sugestões
  }
  
  /**
   * 🎭 OBTER RESPOSTA PERSONALIZADA
   */
  getPersonalizedResponse(intent: string, phase: string, context: any, variables?: any): string {
    const baseResponse = this.getResponse(intent, phase, variables);
    
    // Personalizar baseado no contexto
    if (context.subscriptionPlan === 'enterprise') {
      return this.addEnterpriseTouch(baseResponse);
    }
    
    if (context.financialStatus === 'CRITICAL') {
      return this.addUrgencyTouch(baseResponse);
    }
    
    if (context.isNewUser) {
      return this.addWelcomeTouch(baseResponse);
    }
    
    return baseResponse;
  }
  
  /**
   * 🏢 ADICIONAR TOQUE EMPRESARIAL
   */
  private addEnterpriseTouch(response: string): string {
    const enterpriseWords = ['profissional', 'estratégico', 'avançado', 'otimizado'];
    // Lógica para adicionar palavras empresariais
    return response;
  }
  
  /**
   * 🚨 ADICIONAR TOQUE DE URGÊNCIA
   */
  private addUrgencyTouch(response: string): string {
    if (!response.includes('🚨') && !response.includes('⚠️')) {
      return `⚠️ ${response}`;
    }
    return response;
  }
  
  /**
   * 🎉 ADICIONAR TOQUE DE BOAS-VINDAS
   */
  private addWelcomeTouch(response: string): string {
    if (!response.includes('👋') && !response.includes('🎉')) {
      return `👋 ${response}`;
    }
    return response;
  }
  
  /**
   * 📋 OBTER TEMPLATE COMPLETO
   */
  getCompleteTemplate(intent: string): any {
    return this.templates[intent] || {};
  }
  
  /**
   * 🔄 RECARREGAR TEMPLATES
   */
  reloadTemplates(): void {
    this.loadTemplates();
  }
  
  /**
   * 📥 CARREGAR TEMPLATES EXTERNOS
   */
  loadExternalTemplates(templatesData?: any): void {
    if (templatesData) {
      this.templates = { ...this.templates, ...templatesData };
      console.log(`🎨 [ResponseBuilder] Templates externos carregados`);
    } else {
      this.loadTemplates();
    }
  }
  
  /**
   * 🎯 RESPOSTA PADRÃO
   */
  private getDefaultResponse(intent: string, phase: string): string {
    const defaultResponses = {
      'CREATE_GOAL': 'Vamos criar sua meta financeira! 🎯',
      'ADD_TRANSACTION': 'Vou registrar sua transação! 💰',
      'ANALYZE_INVESTMENT': 'Vou analisar seus investimentos! 📊',
      'GET_DASHBOARD': 'Preparando seu dashboard! 📈',
      'EMERGENCY': 'Detectei uma situação que precisa de atenção! ⚠️'
    };
    
    return defaultResponses[intent] || 'Como posso ajudar você? 🤖';
  }
  
  /**
   * 📚 TEMPLATES PADRÃO
   */
  private getDefaultTemplates(): any {
    return {
      "CREATE_GOAL": {
        "initial": [
          "Vamos criar sua meta financeira! 🎯 Qual valor você deseja alcançar?",
          "Ótimo! Vamos planejar sua meta. Qual o valor total necessário?"
        ],
        "success": [
          "✅ Meta criada com sucesso! Valor: R$ {amount}",
          "🎯 Meta registrada! Você quer juntar R$ {amount}"
        ]
      },
      "ADD_TRANSACTION": {
        "initial": [
          "Vou registrar sua transação! 💰 Qual foi o valor?",
          "Perfeito! Vamos adicionar essa transação."
        ],
        "success": [
          "✅ Transação adicionada! R$ {amount}",
          "💰 Registrado com sucesso!"
        ]
      },
      "GENERAL": {
        "greeting": [
          "Olá! Como posso ajudar? 🤖",
          "Bem-vindo! Estou aqui para suas finanças! 💰"
        ],
        "error": [
          "Ops! Algo deu errado. Pode tentar novamente? 🔧",
          "Desculpe, tive um problema. Vamos tentar de novo? 🔄"
        ]
      }
    };
  }
  
  /**
   * 🎨 CONSTRUIR RESPOSTA COMPLETA
   */
  buildCompleteResponse(intent: string, context: any, variables?: any): any {
    const template = this.getCompleteTemplate(intent);
    
    return {
      response: this.getPersonalizedResponse(intent, 'success', context, variables),
      suggestions: this.getContextualSuggestions(context),
      followUpQuestions: template.followUpQuestions || [],
      recommendations: template.recommendations || [],
      template: template
    };
  }
  
  /**
   * 🔍 BUSCAR TEMPLATE
   */
  searchTemplate(query: string): any[] {
    const results = [];
    
    for (const [intent, intentData] of Object.entries(this.templates)) {
      if (intent.toLowerCase().includes(query.toLowerCase())) {
        results.push({ intent, data: intentData });
      }
      
      // Buscar nas fases
      if (typeof intentData === 'object') {
        for (const [phase, phaseData] of Object.entries(intentData)) {
          if (phase.toLowerCase().includes(query.toLowerCase())) {
            results.push({ intent, phase, data: phaseData });
          }
          
          // Buscar nos templates
          if (Array.isArray(phaseData)) {
            phaseData.forEach((template, index) => {
              if (template.toLowerCase().includes(query.toLowerCase())) {
                results.push({ intent, phase, template, index });
              }
            });
          }
        }
      }
    }
    
    return results;
  }
  
  /**
   * 📊 ESTATÍSTICAS DOS TEMPLATES
   */
  getStats(): any {
    const stats = {
      totalIntents: Object.keys(this.templates).length,
      totalPhases: 0,
      totalTemplates: 0,
      intents: {}
    };
    
    for (const [intent, intentData] of Object.entries(this.templates)) {
      if (typeof intentData === 'object') {
        const phases = Object.keys(intentData).length;
        stats.totalPhases += phases;
        stats.intents[intent] = { phases };
        
        for (const [phase, phaseData] of Object.entries(intentData)) {
          if (Array.isArray(phaseData)) {
            stats.totalTemplates += phaseData.length;
            stats.intents[intent][phase] = phaseData.length;
          }
        }
      }
    }
    
    return stats;
  }
} 