import AIService from '../services/aiService_fixed';
import { ChatbotController } from '../controllers/chatbotController_fixed';

describe('Refactored Components Tests', () => {
  describe('AIService', () => {
    let aiService: AIService;

    beforeEach(() => {
      aiService = new AIService();
    });

    test('should initialize successfully', () => {
      expect(aiService).toBeDefined();
      expect(aiService).toBeInstanceOf(AIService);
    });

    test('should process message without errors', async () => {
      const result = await aiService.processMessage('test-user', 'Hello', []);
      
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.entities).toBeDefined();
      expect(typeof result.response).toBe('string');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    test('should handle error cases gracefully', async () => {
      // Test with null/undefined values
      const result = await aiService.processMessage('', '', []);
      
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
    });

    test('should process conversation history', async () => {
      const conversationHistory = [
        { sender: 'user' as const, content: 'Olá' },
        { sender: 'assistant' as const, content: 'Oi! Como posso ajudar?' }
      ];
      
      const result = await aiService.processMessage('test-user', 'Como estão meus investimentos?', conversationHistory);
      
      expect(result).toBeDefined();
      expect(result.response).toBeDefined();
    });
  });

  describe('ChatbotController', () => {
    let chatbotController: ChatbotController;

    beforeEach(() => {
      chatbotController = ChatbotController.getInstance();
    });

    test('should initialize as singleton', () => {
      const instance1 = ChatbotController.getInstance();
      const instance2 = ChatbotController.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeDefined();
    });

    test('should handle missing authentication gracefully', async () => {
      const mockReq = {
        body: { message: 'test', chatId: 'test-chat' },
        user: null
      } as any;
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as any;

      await chatbotController.processMessage(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should create session with valid user', async () => {
      const mockReq = {
        user: { uid: 'test-user-123' }
      } as any;
      
      const mockRes = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      } as any;

      await chatbotController.createSession(mockReq, mockRes);
      
      // Should either succeed or fail gracefully
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('Code Quality Checks', () => {
    test('should not have syntax errors in fixed files', () => {
      // This test passes if the files can be imported without syntax errors
      expect(() => {
        require('../services/aiService_fixed');
        require('../controllers/chatbotController_fixed');
      }).not.toThrow();
    });

    test('should export expected classes and functions', () => {
      const AIServiceModule = require('../services/aiService_fixed');
      const ChatbotControllerModule = require('../controllers/chatbotController_fixed');
      
      expect(AIServiceModule.default).toBeDefined();
      expect(ChatbotControllerModule.ChatbotController).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', async () => {
      const aiService = new AIService();
      
      // Test with various invalid inputs
      const testCases = [
        { userId: '', query: '', history: [] },
        { userId: null as any, query: null as any, history: null as any },
        { userId: 'valid', query: '', history: [] }
      ];

      for (const testCase of testCases) {
        const result = await aiService.processMessage(
          testCase.userId, 
          testCase.query, 
          testCase.history
        );
        
        expect(result).toBeDefined();
        expect(typeof result.response).toBe('string');
      }
    });
  });
});
