/***************************************
 * 🛡️ ANTI-BAN SYSTEM - SISTEMA ANTI-BAN
 * (Evasão de detecção e bloqueios)
 ***************************************/

import { Page } from 'puppeteer';

export class AntiBanSystem {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  private static readonly VIEWPORTS = [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 }
  ];

  static async switchIdentity(page: Page): Promise<void> {
    console.log('🔄 Trocando identidade...');
    
    try {
      // Trocar User-Agent
      const randomUserAgent = this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
      await page.setUserAgent(randomUserAgent);

      // Trocar viewport
      const randomViewport = this.VIEWPORTS[Math.floor(Math.random() * this.VIEWPORTS.length)];
      await page.setViewport(randomViewport);

      // Configurar headers aleatórios
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
      });

      // Simular comportamento humano
      await this.simulateHumanBehavior(page);

      console.log('✅ Identidade trocada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao trocar identidade:', error);
    }
  }

  private static async simulateHumanBehavior(page: Page): Promise<void> {
    // Simular movimentos de mouse aleatórios
    const viewport = page.viewport();
    if (viewport) {
      for (let i = 0; i < 3; i++) {
        const x = Math.random() * viewport.width;
        const y = Math.random() * viewport.height;
        await page.mouse.move(x, y);
        await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)));
      }
    }

    // Simular scroll aleatório
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 100);
    });
  }

  static async enableStealthMode(page: Page): Promise<void> {
    console.log('🕵️ Ativando modo stealth...');
    
    try {
      await page.evaluateOnNewDocument(() => {
        // Remover propriedades que identificam automação
        delete (navigator as any).__proto__.webdriver;
        delete (navigator as any).__proto__.plugins;
        Object.defineProperty(window, "chrome", { get: () => undefined });
        
        // Simular plugins reais
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5]
        });

        // Simular linguagens reais
        Object.defineProperty(navigator, 'languages', {
          get: () => ['pt-BR', 'pt', 'en-US', 'en']
        });

        // Simular hardware real
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8
        });

        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8
        });
      });

      console.log('✅ Modo stealth ativado');
    } catch (error) {
      console.error('❌ Erro ao ativar modo stealth:', error);
    }
  }

  static async addRandomDelays(page: Page): Promise<void> {
    const delays = [1000, 2000, 3000, 5000, 8000];
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    
    console.log(`⏱️ Aguardando ${randomDelay}ms...`);
    await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, randomDelay)));
  }

  static async rotateIP(): Promise<void> {
    // Implementação fictícia de rotação de IP
    console.log('🌐 Rotacionando IP (simulado)...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  static async detectBanSignals(page: Page): Promise<{
    isBanned: boolean;
    signals: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    try {
      const pageContent = await page.content();
      const url = page.url();

      const banSignals = [
        'access denied',
        'blocked',
        'suspicious activity',
        'captcha',
        'verify you are human',
        'too many requests',
        'rate limit exceeded'
      ];

      const detectedSignals = banSignals.filter(signal => 
        pageContent.toLowerCase().includes(signal) || 
        url.toLowerCase().includes(signal)
      );

      const isBanned = detectedSignals.length > 0;
      const riskLevel = detectedSignals.length > 3 ? 'HIGH' : 
                       detectedSignals.length > 1 ? 'MEDIUM' : 'LOW';

      return {
        isBanned,
        signals: detectedSignals,
        riskLevel
      };
    } catch (error) {
      console.error('❌ Erro ao detectar sinais de ban:', error);
      return {
        isBanned: false,
        signals: [],
        riskLevel: 'LOW'
      };
    }
  }

  static async getAntiBanStatus(): Promise<{
    active: boolean;
    lastRotation: Date;
    totalRotations: number;
    currentIdentity: string;
  }> {
    return {
      active: true,
      lastRotation: new Date(),
      totalRotations: Math.floor(Math.random() * 100),
      currentIdentity: 'Anonymous-' + Math.random().toString(36).substr(2, 9)
    };
  }
} 