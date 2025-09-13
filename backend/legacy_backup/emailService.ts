/***************************************
 * 📧 EMAIL SERVICE - SISTEMA DE NOTIFICAÇÕES
 * (Serviço para envio de emails automáticos)
 ***************************************/

import nodemailer from 'nodemailer';
import { User } from '../models/User';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface GoalReminderData {
  userId: string;
  goal: any;
  daysRemaining: number;
}

interface TransactionAlertData {
  userId: string;
  transaction: any;
  alertType: 'high_value' | 'category_limit' | 'goal_impact';
}

interface WeeklyReportData {
  userId: string;
  report: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    goalsProgress: any[];
    topCategories: any[];
    recommendations: string[];
  };
}

interface UpsellEmailData {
  userId: string;
  currentPlan: string;
  recommendedPlan: string;
  benefits: string[];
  discount?: number;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configurar transporter (você pode usar Gmail, SendGrid, etc.)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // ou 'sendgrid', 'mailgun', etc.
      auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'sua-senha-app'
      }
    });
  }

  // 🎯 LEMBRETE DE METAS
  async sendGoalReminder(data: GoalReminderData): Promise<void> {
    try {
      const user = await User.findOne({ firebaseUid: data.userId });
      if (!user?.email) return;

      const { goal, daysRemaining } = data;
      const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Lembrete de Meta</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Olá ${user.name}, sua meta está te esperando!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">${goal.title}</h2>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Progresso:</span>
                <span style="font-weight: bold; color: #667eea;">${progress}%</span>
              </div>
              <div style="background: #e9ecef; height: 10px; border-radius: 5px; overflow: hidden;">
                <div style="background: #667eea; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 14px; color: #666;">
                <span>R$ ${goal.currentAmount.toFixed(2)}</span>
                <span>R$ ${goal.targetAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 0; color: #856404;">
                ⏰ <strong>${daysRemaining} dias restantes</strong> para atingir sua meta!
              </p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/metas" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Minhas Metas
              </a>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
            <p>💡 <strong>Dica:</strong> Aumente suas economias em R$ ${((goal.targetAmount - goal.currentAmount) / daysRemaining).toFixed(2)} por dia para atingir sua meta!</p>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: user.email,
        subject: `🎯 Lembrete: ${goal.title} - ${daysRemaining} dias restantes`,
        html
      });

      console.log(`📧 Email de lembrete de meta enviado para ${user.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email de lembrete de meta:', error);
    }
  }

  // 💰 ALERTA DE TRANSAÇÃO
  async sendTransactionAlert(data: TransactionAlertData): Promise<void> {
    try {
      const user = await User.findOne({ firebaseUid: data.userId });
      if (!user?.email) return;

      const { transaction, alertType } = data;
      
      let alertTitle = '';
      let alertMessage = '';
      let alertColor = '';

      switch (alertType) {
        case 'high_value':
          alertTitle = '💰 Transação de Alto Valor';
          alertMessage = 'Você registrou uma transação de valor significativo.';
          alertColor = '#dc3545';
          break;
        case 'category_limit':
          alertTitle = '⚠️ Limite de Categoria Atingido';
          alertMessage = 'Você atingiu o limite definido para esta categoria.';
          alertColor = '#ffc107';
          break;
        case 'goal_impact':
          alertTitle = '🎯 Impacto na Meta';
          alertMessage = 'Esta transação pode impactar o progresso de suas metas.';
          alertColor = '#17a2b8';
          break;
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${alertColor}; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">${alertTitle}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Olá ${user.name}, ${alertMessage}</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">Detalhes da Transação</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong>Descrição:</strong><br>
                  <span>${transaction.descricao}</span>
                </div>
                <div>
                  <strong>Valor:</strong><br>
                  <span style="color: ${transaction.tipo === 'receita' ? '#28a745' : '#dc3545'}; font-weight: bold;">
                    R$ ${transaction.valor.toFixed(2)}
                  </span>
                </div>
                <div>
                  <strong>Categoria:</strong><br>
                  <span>${transaction.categoria}</span>
                </div>
                <div>
                  <strong>Data:</strong><br>
                  <span>${new Date(transaction.data).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/transacoes" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Transações
              </a>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: user.email,
        subject: `⚠️ Alerta: ${alertTitle}`,
        html
      });

      console.log(`📧 Email de alerta de transação enviado para ${user.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email de alerta de transação:', error);
    }
  }

  // 📊 RELATÓRIO SEMANAL
  async sendWeeklyReport(data: WeeklyReportData): Promise<void> {
    try {
      const user = await User.findOne({ firebaseUid: data.userId });
      if (!user?.email) return;

      const { report } = data;
      const savingsRate = ((report.savings / report.totalIncome) * 100).toFixed(1);

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">📊 Seu Relatório Semanal</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Olá ${user.name}, aqui está o resumo da sua semana financeira!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <!-- Resumo Financeiro -->
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">💰 Resumo Financeiro</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
                <div style="padding: 15px; background: #d4edda; border-radius: 5px;">
                  <div style="font-size: 24px; font-weight: bold; color: #155724;">R$ ${report.totalIncome.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #155724;">Receitas</div>
                </div>
                <div style="padding: 15px; background: #f8d7da; border-radius: 5px;">
                  <div style="font-size: 24px; font-weight: bold; color: #721c24;">R$ ${report.totalExpenses.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #721c24;">Despesas</div>
                </div>
                <div style="padding: 15px; background: #d1ecf1; border-radius: 5px;">
                  <div style="font-size: 24px; font-weight: bold; color: #0c5460;">R$ ${report.savings.toFixed(2)}</div>
                  <div style="font-size: 14px; color: #0c5460;">Economias</div>
                </div>
              </div>
              <div style="text-align: center; margin-top: 15px; padding: 10px; background: #e2e3e5; border-radius: 5px;">
                <strong>Taxa de Economia: ${savingsRate}%</strong>
              </div>
            </div>

            <!-- Top Categorias -->
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">📈 Top Categorias de Gastos</h3>
              ${report.topCategories.map((cat, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                  <div>
                    <span style="font-weight: bold;">${index + 1}. ${cat.categoria}</span>
                  </div>
                  <div style="color: #dc3545; font-weight: bold;">R$ ${cat.total.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>

            <!-- Progresso das Metas -->
            ${report.goalsProgress.length > 0 ? `
              <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-bottom: 15px;">🎯 Progresso das Metas</h3>
                ${report.goalsProgress.map(goal => {
                  const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
                  return `
                    <div style="margin-bottom: 15px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${goal.title}</span>
                        <span style="font-weight: bold;">${progress}%</span>
                      </div>
                      <div style="background: #e9ecef; height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: #667eea; height: 100%; width: ${progress}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}

            <!-- Recomendações -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #856404; margin-bottom: 15px;">💡 Recomendações da Semana</h3>
              ${report.recommendations.map(rec => `
                <p style="margin: 5px 0; color: #856404;">• ${rec}</p>
              `).join('')}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver Dashboard Completo
              </a>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: user.email,
        subject: `📊 Seu Relatório Semanal - ${new Date().toLocaleDateString('pt-BR')}`,
        html
      });

      console.log(`📧 Relatório semanal enviado para ${user.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar relatório semanal:', error);
    }
  }

  // 💼 EMAIL DE UPSELL
  async sendUpsellEmail(data: UpsellEmailData): Promise<void> {
    try {
      const user = await User.findOne({ firebaseUid: data.userId });
      if (!user?.email) return;

      const { currentPlan, recommendedPlan, benefits, discount } = data;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🚀 Upgrade Especial</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Olá ${user.name}, temos uma oferta exclusiva para você!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 15px;">📈 Evolua para o ${recommendedPlan}</h3>
              <p style="color: #666; margin-bottom: 20px;">
                Você está usando o plano <strong>${currentPlan}</strong>. 
                Descubra como o <strong>${recommendedPlan}</strong> pode transformar suas finanças!
              </p>
              
              ${discount ? `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                  <h4 style="margin: 0; color: #155724;">🎉 OFERTA ESPECIAL</h4>
                  <p style="margin: 5px 0 0 0; color: #155724; font-size: 18px; font-weight: bold;">
                    ${discount}% de desconto no primeiro mês!
                  </p>
                </div>
              ` : ''}
              
              <h4 style="color: #333; margin-bottom: 10px;">✨ Benefícios Exclusivos:</h4>
              ${benefits.map(benefit => `
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                  <span style="color: #28a745; margin-right: 10px;">✅</span>
                  <span>${benefit}</span>
                </div>
              `).join('')}
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/planos" style="background: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px; font-weight: bold;">
                Fazer Upgrade Agora
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 15px;">
              <a href="${process.env.FRONTEND_URL}/planos/comparativo" style="color: #667eea; text-decoration: none;">
                Ver Comparativo Completo
              </a>
            </div>
          </div>
        </div>
      `;

      await this.sendEmail({
        to: user.email,
        subject: `🚀 Oferta Especial: Upgrade para ${recommendedPlan}`,
        html
      });

      console.log(`📧 Email de upsell enviado para ${user.email}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email de upsell:', error);
    }
  }

  // 📧 MÉTODO PRINCIPAL DE ENVIO
  private async sendEmail(emailData: EmailData): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@finnextho.com',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html)
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }

  // 🧹 REMOVER HTML PARA VERSÃO TEXTO
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export const emailService = new EmailService(); 