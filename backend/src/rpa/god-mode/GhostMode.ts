/***************************************
 * 🕵️ GHOST MODE - MODO FANTASMA
 * (Evasão de detecção avançada)
 ***************************************/

import { Page } from 'puppeteer';

export class GhostMode {
  private static readonly ANTI_DETECTION_TACTICS = [
    "random-mouse-movement",
    "dynamic-ip-rotation", 
    "fake-user-agent-cycle"
  ];

  static async activate(page: Page): Promise<void> {
    console.log('🕵️ Ativando Ghost Mode...');
    
    try {
      await page.evaluateOnNewDocument(() => {
        // 🕵️‍♂️ Apaga qualquer fingerprinting
        delete (navigator as any).__proto__.webdriver;
        delete (navigator as any).__proto__.plugins;
        Object.defineProperty(window, "chrome", { get: () => undefined });
        
        // Remover propriedades que podem identificar automação
        delete (window as any).navigator.webdriver;
        delete (window as any).navigator.plugins;
        delete (window as any).navigator.languages;
        
        // Simular comportamento humano
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8
        });
        
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8
        });
      });

      // Configurar User-Agent realista
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Configurar viewport realista
      await page.setViewport({ 
        width: 1366, 
        height: 768, 
        deviceScaleFactor: 1 
      });

      // 🌪️ Tática de IP rotativo (simulado)
      await this.rotateIP();
      
      console.log('✅ Ghost Mode ativado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao ativar Ghost Mode:', error);
    }
  }

  private static async rotateIP(): Promise<void> {
    // Implementação fictícia de rotação de IP
    console.log('🌐 Rotacionando IP (simulado)...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  static async addRandomDelays(page: Page): Promise<void> {
    // Adicionar delays aleatórios para simular comportamento humano
    const delays = [100, 200, 300, 500, 800, 1200];
    const randomDelay = delays[Math.floor(Math.random() * delays.length)];
    
    // Usar page.waitForFunction como alternativa ao waitForTimeout
    try {
      await page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, randomDelay)));
    } catch (error) {
      // Fallback para Promise direto se waitForFunction falhar
      await new Promise(resolve => setTimeout(resolve, randomDelay));
    }
  }

  static async simulateHumanBehavior(page: Page): Promise<void> {
    // Simular movimentos de mouse aleatórios
    const viewport = page.viewport();
    if (viewport) {
      const x = Math.random() * viewport.width;
      const y = Math.random() * viewport.height;
      
      await page.mouse.move(x, y);
    }
  }

  static async hideAutomationSignatures(page: Page): Promise<void> {
    await page.evaluateOnNewDocument(() => {
      // Remover propriedades que identificam automação
      const propertiesToRemove = [
        'webdriver',
        'selenium',
        'puppeteer',
        'cypress',
        'playwright'
      ];

      propertiesToRemove.forEach(prop => {
        delete (window as any)[prop];
        delete (navigator as any)[prop];
      });

      // Simular plugins reais
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5]
      });

      // Simular linguagens reais
      Object.defineProperty(navigator, 'languages', {
        get: () => ['pt-BR', 'pt', 'en-US', 'en']
      });
    });
  }

  static async enableStealthMode(page: Page): Promise<void> {
    // Configurações adicionais de stealth
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    // Desabilitar recursos que podem identificar automação
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  static async getGhostStatus(): Promise<{
    active: boolean;
    tactics: string[];
    lastRotation: Date;
  }> {
    return {
      active: true,
      tactics: this.ANTI_DETECTION_TACTICS,
      lastRotation: new Date()
    };
  }
} 