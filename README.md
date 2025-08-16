# Finnextho

Este é o repositório do projeto Finnextho, uma aplicação completa de finanças pessoais com recursos avançados de IA e integração com APIs financeiras.

## 🚀 Sobre o Projeto

Finnextho é uma plataforma financeira moderna que oferece:
- **Gestão de finanças pessoais** com interface intuitiva
- **IA integrada** para análise e sugestões financeiras
- **Integração com APIs** (Stripe, Pluggy, Yahoo Finance)
- **Sistema de assinaturas** com pagamentos seguros
- **Dashboard interativo** com gráficos e relatórios
- **Autenticação segura** com Firebase Auth

## 📁 Estrutura do Projeto

```
finnextho/
├── backend/          # Servidor Node.js/TypeScript
│   ├── src/         # Código fonte do backend
│   ├── scripts/     # Scripts utilitários
│   └── docs/        # Documentação técnica
├── frontend/        # Aplicação Next.js/React
│   ├── components/  # Componentes React
│   ├── pages/       # Páginas da aplicação
│   └── services/    # Serviços e APIs
└── docs/           # Documentação geral
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com TypeScript
- **Express.js** para API REST
- **MongoDB** como banco de dados
- **Firebase Admin** para autenticação
- **Stripe** para pagamentos
- **Redis** para cache

### Frontend
- **Next.js** com React
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Firebase Auth** para autenticação
- **Chart.js** para gráficos

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB
- Redis (opcional)
- Contas nas APIs (Stripe, Firebase, etc.)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure as variáveis de ambiente
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie arquivos `.env` baseados nos exemplos:
- `backend/.env.example`
- `frontend/.env.example`

### APIs Necessárias
- **Firebase**: Para autenticação e banco de dados
- **Stripe**: Para processamento de pagamentos
- **Pluggy**: Para integração bancária
- **OpenAI**: Para funcionalidades de IA

## 📚 Documentação

- [Guia de Implementação](./FINN_IMPLEMENTATION_GUIDE.md)
- [Configuração de Segurança](./SECURITY_IMPLEMENTATION.md)
- [Deploy no Render](./RENDER_DEPLOYMENT.md)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@finnextho.com ou abra uma issue no GitHub.

---

**Finnextho** - Transformando a gestão financeira pessoal com tecnologia avançada. 