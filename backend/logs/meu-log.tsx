/*
==========================================
LOGS DO BACKEND E FRONTEND
==========================================

INSTRUÇÕES DE USO:
1. Apague todo o conteúdo abaixo desta linha
2. Cole seus logs aqui
3. Salve o arquivo
4. Me avise que salvou para eu analisar

==========================================
DATA: [DATA ATUAL]
HORA: [HORA ATUAL]
==========================================

[VOU TE MANDAR AS MENSAGEM COM O CHAT oi
21:39

Premium
Oi, Saulo! Como posso te ajudar com suas finanças hoje? 😊
21:39


quero adicionar uma meta
21:39

Premium
Que legal! Qual valor você quer juntar?
21:39


eu quero junta um a valor de 6500 viagem para gramado com pasagem de ida e volta vai ser nas minhas ferias em setembro
21:41

Premium
Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500
21:41


nao foi criada a a meta
21:42

Premium
Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500
21:42


nao estou vendo na plataforma essa meta criada esta havendo algum erro
21:42

Premium
Posso te ajudar com isso! Pode me dar mais detalhes?
21:43


ja te dei informaçao, voce nao pode resolver isso
21:43

Premium
Entendi sua frustração, Saulo. Vou verificar com a equipe técnica e te aviso assim que resolvermos. Você prefere que eu envie a resposta por aqui ou por e-mail?
21:43


so pra entender o meu problema o que estavamos discultindo mesmo
21:44

Premium
Pelo que entendi, você está com dificuldade para visualizar uma meta criada na plataforma e suspeita que possa ser algum erro técnico. Estou verificando isso para te ajudar a resolver.
21:44


qual e o valor dess meta?
21:44

Premium
Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!
21:44


eu quero saber de voce qual e o valor que eu solicitei dessa meta e para onde eu vou ?
21:45

Premium
Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!
21:45


voce entendeu ou nao ?
21:45

Premium
Desculpe, Saulo! Parece que houve um mal-entendido. Você pode me explicar novamente qual meta você está se referindo? Assim, posso te ajudar melhor!
21:45


estamos conversando sobre ela agora, olha as mensagem anterior que voce vai sabse o que estamos falando
21:46

Premium
Ah, entendi agora, Saulo! Vou revisar nosso histórico rapidinho para pegar o contexto e te responder com precisão sobre essa meta. Um minutinho! ⏳
21:46


ok fico aguardando
21:47

Premium
Posso te ajudar com isso! Pode me dar mais detalhes?
21:47


voce ja viu o historico ou nao ?voce disse que iria volta e me dizer
21:47

Premium
Saulo, acabei de ver o histórico sim! Você estava falando sobre a meta de guardar R$ 1.000 por mês, certo? Vamos ajustar seu planejamento para alcançar esse objetivo.
21:48


errado! era 6500 valor viagem para gramado
21:48

Premium
Que legal! Meta criada: viagem para gramado - R$ 6500
21:48

logs do backen


C:\Users\USER\finnextho\backend>npm run build

> backend@1.0.0 build
> rimraf dist && tsc


C:\Users\USER\finnextho\backend>npm run dev

> backend@1.0.0 dev
> cross-env NODE_ENV=development ts-node-dev --respawn --transpile-only src/index.ts

[INFO] 21:33:07 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.8.3)
[config/env.ts] Variáveis de ambiente carregadas.
[config/env.ts] NODE_ENV: development
[firebaseAdmin] Initializing Firebase Admin...
[firebaseAdmin] Project ID: finup-saas-2025
[firebaseAdmin] Client Email: firebase-adminsdk-fbsvc@finup-saas-2025.iam.gserviceaccount.com
[firebaseAdmin] Private Key exists: true
[firebaseAdmin] Firebase Admin initialized successfully
[firebaseAdmin] Initializing Firebase Admin...
[firebaseAdmin] Firebase Admin initialized successfully
info: 🤖 Robot Orchestrator inicializado {"service":"robot-orchestrator","timestamp":"2025-07-08T00:33:21.487Z"}
info: 🤖 Robot Orchestrator inicializado {"service":"robot-orchestrator","timestamp":"2025-07-08T00:33:22.846Z"}
✅ Conectado ao MongoDB
🚀 Servidor rodando na porta 5000
🔗 Ambiente: development
🤖 Browser inicializado para automação bancária
info: 🚀 Iniciando orquestração de tarefas {"service":"robot-orchestrator","timestamp":"2025-07-08T00:33:27.006Z"}
OPTIONS /api/auth/session 204 22.942 ms - 0
OPTIONS /api/auth/session 204 1.416 ms - 0
POST /api/auth/session 200 8838.753 ms - 496
POST /api/auth/session 200 7710.364 ms - 496
OPTIONS /api/goals 204 1.131 ms - 0
OPTIONS /api/chatbot/sessions 204 0.468 ms - 0
OPTIONS /api/transacoes 204 0.580 ms - 0
OPTIONS /api/chatbot/sessions 204 0.490 ms - 0
OPTIONS /api/market-data 204 0.568 ms - 0
OPTIONS /api/market-data 204 0.482 ms - 0
OPTIONS /api/goals 204 0.576 ms - 0
OPTIONS /api/market-data 204 1.086 ms - 0
OPTIONS /api/investimentos 204 0.524 ms - 0
OPTIONS /api/investimentos 204 0.690 ms - 0
OPTIONS /api/market-data 204 0.468 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
[AUTH] 🔍 Iniciando autenticação para: GET /sessions
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /sessions
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
GET /api/chatbot/sessions 200 310.948 ms - 604
[AUDIT] GET /sessions - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 289ms - IP: ::1
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 278.523 ms - -
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 251.203 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getInvestimentos: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
[AUTH] 🔍 Iniciando autenticação para: GET /sessions
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /sessions
getInvestimentos: results = []
GET /api/investimentos 304 270.311 ms - -
GET /api/chatbot/sessions 304 272.807 ms - -
[AUDIT] GET /sessions - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 304 - Duration: 317ms - IP: ::1
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 273.263 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getInvestimentos: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 354.846 ms - -
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
getInvestimentos: results = []
GET /api/investimentos 304 594.129 ms - -
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
POST /api/market-data 200 2901.350 ms - -
POST /api/market-data 200 2771.715 ms - -
POST /api/market-data 200 2601.449 ms - -
POST /api/market-data 200 2827.939 ms - -
OPTIONS /api/investimentos 204 0.510 ms - 0
OPTIONS /api/transacoes 204 0.358 ms - 0
OPTIONS /api/market-data 204 0.349 ms - 0
OPTIONS /api/transacoes 204 0.401 ms - 0
OPTIONS /api/goals 204 0.671 ms - 0
OPTIONS /api/transacoes 204 0.368 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getInvestimentos: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: results = []
GET /api/investimentos 304 114.861 ms - -
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 92.576 ms - -
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 82.788 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 48.085 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 1101.691 ms - -
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
POST /api/market-data 200 3232.692 ms - -
OPTIONS /api/chatbot/sessions 204 0.468 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /sessions
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /sessions
[ChatbotController] Nova sessão criada: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
POST /api/chatbot/sessions 200 97.983 ms - 324
[AUDIT] POST /sessions - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 92ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.546 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 1 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 2 mensagens
[ChatbotController] Histórico completo: 2 mensagens
[DETECT_USER_INTENT] Analyzing message: oi
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.0,
  "response": "Oi! Tudo bem? Como posso te ajudar hoje?",
  "requiresConfirmation": false
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: false,
  response: 'Oi! Tudo bem? Como posso te ajudar hoje?'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Oi, Saulo! Como posso te ajudar com suas finanças hoje? 😊
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 10166ms
POST /api/chatbot/query 200 10182.940 ms - 530
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 10171ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.350 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 3 mensagens
[ChatbotController] Dados encontrados: 3 transações, 0 investimentos, 1 metas
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 3,
  totalInvestimentos: 0,
  totalMetas: 1,
  hasTransactions: true,
  hasInvestments: false,
  hasGoals: true
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 4 mensagens
[ChatbotController] Histórico completo: 4 mensagens
[DETECT_USER_INTENT] Analyzing message: quero adicionar uma meta
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "CREATE_GOAL",
  "entities": {},
  "confidence": 0.95,
  "response": "Que legal! Qual valor você quer juntar e para qual objetivo?",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'CREATE_GOAL',
  entities: {},
  confidence: 0.95,
  requiresConfirmation: true,
  response: 'Que legal! Qual valor você quer juntar e para qual objetivo?'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'CREATE_GOAL',
  payload: {
    meta: '',
    valor_total: 0,
    data_conclusao: '2026-07-08',
    categoria: ''
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: Nova meta - R$ 0',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Que legal! Qual valor você quer juntar e para qual objetivo?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[ChatbotController] Action detected with confidence: 0.95
[ChatbotController] Action details: {
  type: 'CREATE_GOAL',
  payload: {
    meta: '',
    valor_total: 0,
    data_conclusao: '2026-07-08',
    categoria: ''
  },
  confidence: 0.95
}
[hasCompleteData] Checking action: {
  type: 'CREATE_GOAL',
  payload: {
    meta: '',
    valor_total: 0,
    data_conclusao: '2026-07-08',
    categoria: ''
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: Nova meta - R$ 0',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Que legal! Qual valor você quer juntar e para qual objetivo?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[hasCompleteData] CREATE_GOAL check: { valor_total: 0, meta: '', hasData: false }
[ChatbotController] Has complete data: false
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 4901.084 ms - 839
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 4897ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.357 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 5 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 6 mensagens
[ChatbotController] Histórico completo: 6 mensagens
[DETECT_USER_INTENT] Analyzing message: eu quero  junta um a valor de 6500 viagem para gramado com pasagem de ida e volta vai ser nas minhas ferias em setembro
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "CREATE_GOAL",
  "entities": {
    "valor_total": 6500,
    "meta": "viagem para gramado com passagem de ida e volta",
    "data_conclusao": "setembro",
    "categoria": "viagem"
  },
  "confidence": 0.95,
  "response": "Ótimo, Saulo! Vou criar uma meta para você juntar R$ 6.500 para uma viagem para Gramado com passagem de ida e volta, com prazo até setembro. Está correto?",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'CREATE_GOAL',
  entities: {
    valor_total: 6500,
    meta: 'viagem para gramado com passagem de ida e volta',
    data_conclusao: 'setembro',
    categoria: 'viagem'
  },
  confidence: 0.95,
  requiresConfirmation: true,
  response: 'Ótimo, Saulo! Vou criar uma meta para você juntar R$ 6.500 para uma viagem para Gramado com passagem de ida e volta, com prazo até setembro. Está correto?'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'viagem'
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Ótimo, Saulo! Vou criar uma meta para você juntar R$ 6.500 para uma viagem para Gramado com passagem de ida e volta, com prazo até setembro. Está correto?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[ChatbotController] Action detected with confidence: 0.95
[ChatbotController] Action details: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'viagem'
  },
  confidence: 0.95
}
[hasCompleteData] Checking action: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'viagem'
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Ótimo, Saulo! Vou criar uma meta para você juntar R$ 6.500 para uma viagem para Gramado com passagem de ida e volta, com prazo até setembro. Está correto?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[hasCompleteData] CREATE_GOAL check: {
  valor_total: 6500,
  meta: 'viagem para gramado com passagem de ida e volta',
  hasData: true
}
[ChatbotController] Has complete data: true
[ChatbotController] Executing action automatically...
[ChatbotController] Creating goal with payload: {
  meta: 'viagem para gramado com passagem de ida e volta',
  valor_total: 6500,
  data_conclusao: '2026-07-08',
  categoria: 'viagem'
}
[createGoal] User found: new ObjectId('6856b3ffaf565a2443715aae')
[ChatbotController] Goal created successfully: {
  meta: 'viagem para gramado com passagem de ida e volta',
  descricao: '',
  valor_total: 6500,
  valor_atual: 0,
  data_conclusao: 2026-07-08T00:00:00.000Z,
  userId: '6856b3ffaf565a2443715aae',
  categoria: 'viagem',
  prioridade: 'media',
  createdAt: 2025-07-08T00:41:26.929Z,
  _id: new ObjectId('686c693630d3c59cbf6f8afa'),
  __v: 0
}
[ChatbotController] Action executed successfully, returning response...
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 8564.760 ms - -
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 8561ms - IP: ::1
OPTIONS /api/goals 204 0.447 ms - 0
OPTIONS /api/goals 204 0.563 ms - 0
OPTIONS /api/goals/progress-by-category 204 0.436 ms - 0
OPTIONS /api/market-data 204 0.410 ms - 0
OPTIONS /api/investimentos 204 0.399 ms - 0
OPTIONS /api/goals/progress-by-category 204 0.429 ms - 0
OPTIONS /api/goals 204 0.410 ms - 0
OPTIONS /api/transacoes 204 0.535 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getInvestimentos: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getInvestimentos: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
[AUTH] 🔍 Iniciando autenticação para: GET /progress-by-category
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /progress-by-category
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getTransacoes: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getTransacoes: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 501.389 ms - -
getInvestimentos: results = []
GET /api/investimentos 304 554.291 ms - -
GET /api/goals/progress-by-category 304 418.705 ms - -
getTransacoes: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getTransacoes: results = []
GET /api/transacoes 304 464.285 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] 🔍 Iniciando autenticação para: GET /progress-by-category
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /progress-by-category
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 42.678 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /
getGoals: firebaseUid = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
getGoals: mongoId = jJOp4uvDcnMXNWeJxaQvLTRHhcC2
GET /api/goals/progress-by-category 304 50.762 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /progress-by-category
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /progress-by-category
getGoals: query = { userId: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' }
getGoals: results = []
GET /api/goals 304 68.189 ms - -
GET /api/goals/progress-by-category 304 72.810 ms - -
[AUTH] 🔍 Iniciando autenticação para: GET /progress-by-category
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: GET /progress-by-category
GET /api/goals/progress-by-category 304 35.523 ms - -
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
POST /api/market-data 200 2380.044 ms - -
OPTIONS /api/chatbot/query 204 0.704 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 7 mensagens
[ChatbotController] Dados encontrados: 3 transações, 0 investimentos, 2 metas
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 3,
  totalInvestimentos: 0,
  totalMetas: 2,
  hasTransactions: true,
  hasInvestments: false,
  hasGoals: true
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 8 mensagens
[ChatbotController] Histórico completo: 8 mensagens
[DETECT_USER_INTENT] Analyzing message: nao foi criada a a meta
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "CREATE_GOAL",
  "entities": {
    "valor_total": 6500,
    "meta": "viagem para gramado com passagem de ida e volta",
    "data_conclusao": "setembro"
  },
  "confidence": 0.9,
  "response": "Parece que houve um engano anterior. Vamos criar sua meta agora: viagem para gramado com passagem de ida e volta no valor de R$ 6500 para setembro. Está correto?",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'CREATE_GOAL',
  entities: {
    valor_total: 6500,
    meta: 'viagem para gramado com passagem de ida e volta',
    data_conclusao: 'setembro'
  },
  confidence: 0.9,
  requiresConfirmation: true,
  response: 'Parece que houve um engano anterior. Vamos criar sua meta agora: viagem para gramado com passagem de ida e volta no valor de R$ 6500 para setembro. Está correto?'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.9,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Parece que houve um engano anterior. Vamos criar sua meta agora: viagem para gramado com passagem de ida e volta no valor de R$ 6500 para setembro. Está correto?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[ChatbotController] Action detected with confidence: 0.9
[ChatbotController] Action details: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.9
}
[hasCompleteData] Checking action: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado com passagem de ida e volta',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.9,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado com passagem de ida e volta - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Parece que houve um engano anterior. Vamos criar sua meta agora: viagem para gramado com passagem de ida e volta no valor de R$ 6500 para setembro. Está correto?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[hasCompleteData] CREATE_GOAL check: {
  valor_total: 6500,
  meta: 'viagem para gramado com passagem de ida e volta',
  hasData: true
}
[ChatbotController] Has complete data: true
[ChatbotController] Executing action automatically...
[ChatbotController] Creating goal with payload: {
  meta: 'viagem para gramado com passagem de ida e volta',
  valor_total: 6500,
  data_conclusao: '2026-07-08',
  categoria: 'Outros'
}
[createGoal] User found: new ObjectId('6856b3ffaf565a2443715aae')
[ChatbotController] Goal created successfully: {
  meta: 'viagem para gramado com passagem de ida e volta',
  descricao: '',
  valor_total: 6500,
  valor_atual: 0,
  data_conclusao: 2026-07-08T00:00:00.000Z,
  userId: '6856b3ffaf565a2443715aae',
  categoria: 'Outros',
  prioridade: 'media',
  createdAt: 2025-07-08T00:42:21.596Z,
  _id: new ObjectId('686c696d30d3c59cbf6f8b10'),
  __v: 0
}
[ChatbotController] Action executed successfully, returning response...
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 10016.470 ms - -
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 10021ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.544 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 9 mensagens
[ChatbotController] Dados encontrados: 3 transações, 0 investimentos, 3 metas
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 3,
  totalInvestimentos: 0,
  totalMetas: 3,
  hasTransactions: true,
  hasInvestments: false,
  hasGoals: true
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 10 mensagens
[ChatbotController] Histórico completo: 10 mensagens
[DETECT_USER_INTENT] Analyzing message: nao estou vendo na plataforma essa meta criada esta havendo algum erro
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.9,
  "response": "Parece que está havendo algum problema com a visualização da meta criada. Vou verificar aqui para te ajudar. Pode me confirmar se você já atualizou a página ou saiu e entrou novamente na plataforma? Às vezes, isso resolve.",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.9,
  requiresConfirmation: true,
  response: 'Parece que está havendo algum problema com a visualização da meta criada. Vou verificar aqui para te ajudar. Pode me confirmar se você já atualizou a página ou saiu e entrou novamente na plataforma? Às vezes, isso resolve.'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Action detected with confidence: 0.9
[ChatbotController] Action details: { type: 'UNKNOWN', payload: {}, confidence: 0.9 }
[hasCompleteData] Checking action: {
  type: 'UNKNOWN',
  payload: {},
  confidence: 0.9,
  requiresConfirmation: false,
  successMessage: '',
  errorMessage: '',
  response: 'Parece que está havendo algum problema com a visualização da meta criada. Vou verificar aqui para te ajudar. Pode me confirmar se você já atualizou a página ou saiu e entrou novamente na plataforma? Às vezes, isso resolve.'
}
[ChatbotController] Has complete data: false
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 7837.545 ms - 696
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 7999ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.408 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 11 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 12 mensagens
[ChatbotController] Histórico completo: 12 mensagens
[DETECT_USER_INTENT] Analyzing message: ja te dei informaçao, voce nao pode resolver isso
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.0,
  "response": "Entendi que você está frustrado. Vou verificar o que pode estar acontecendo com a meta que você mencionou. Pode me confirmar se era uma meta específica que você tentou criar? Assim posso te ajudar melhor.",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: true,
  response: 'Entendi que você está frustrado. Vou verificar o que pode estar acontecendo com a meta que você mencionou. Pode me confirmar se era uma meta específica que você tentou criar? Assim posso te ajudar melhor.'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Entendi sua frustração, Saulo. Vou verificar com a equipe técnica e te aviso assim que resolvermos. Você prefere que eu envie a resposta por aqui ou por e-mail?
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 11593ms
POST /api/chatbot/query 200 11606.517 ms - 634
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 11601ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.433 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 13 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 14 mensagens
[ChatbotController] Histórico completo: 14 mensagens
[DETECT_USER_INTENT] Analyzing message: so pra entender o meu problema o que estavamos discultindo mesmo
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.0,
  "response": "Parece que estamos tentando entender qual era o problema que estávamos discutindo antes. Se você puder me dar mais detalhes ou refrescar minha memória sobre o assunto, posso tentar ajudar melhor.",
  "requiresConfirmation": false
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: false,
  response: 'Parece que estamos tentando entender qual era o problema que estávamos discutindo antes. Se você puder me dar mais detalhes ou refrescar minha memória sobre o assunto, posso tentar ajudar melhor.'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Pelo que entendi, você está com dificuldade para visualizar uma meta criada na plataforma e suspeita que possa ser algum erro técnico. Estou verificando isso para te ajudar a resolver.
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 10957ms
POST /api/chatbot/query 200 10973.321 ms - 657
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 10975ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.349 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 15 mensagens
[ChatbotController] Dados encontrados: 3 transações, 0 investimentos, 3 metas
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 3,
  totalInvestimentos: 0,
  totalMetas: 3,
  hasTransactions: true,
  hasInvestments: false,
  hasGoals: true
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 16 mensagens
[ChatbotController] Histórico completo: 16 mensagens
[DETECT_USER_INTENT] Analyzing message: qual e o valor dess meta?
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "ANALYZE_DATA",
  "entities": {},
  "confidence": 0.9,
  "response": "Parece que você está querendo saber o valor de uma meta específica. Você lembra qual era o objetivo dessa meta? Assim posso te ajudar melhor.",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'ANALYZE_DATA',
  entities: {},
  confidence: 0.9,
  requiresConfirmation: true,
  response: 'Parece que você está querendo saber o valor de uma meta específica. Você lembra qual era o objetivo dessa meta? Assim posso te ajudar melhor.'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9,
  requiresConfirmation: true,
  successMessage: 'Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!',
  errorMessage: 'Ops! Tive um problema ao analisar seus dados. Pode tentar novamente?',
  response: 'Parece que você está querendo saber o valor de uma meta específica. Você lembra qual era o objetivo dessa meta? Assim posso te ajudar melhor.',
  followUpQuestions: [
    'Quer que eu gere um relatório detalhado?',
    'Posso sugerir melhorias?',
    'Quer comparar com períodos anteriores?'
  ]
}
[ChatbotController] Action detected with confidence: 0.9
[ChatbotController] Action details: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9
}
[hasCompleteData] Checking action: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9,
  requiresConfirmation: true,
  successMessage: 'Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!',
  errorMessage: 'Ops! Tive um problema ao analisar seus dados. Pode tentar novamente?',
  response: 'Parece que você está querendo saber o valor de uma meta específica. Você lembra qual era o objetivo dessa meta? Assim posso te ajudar melhor.',
  followUpQuestions: [
    'Quer que eu gere um relatório detalhado?',
    'Posso sugerir melhorias?',
    'Quer comparar com períodos anteriores?'
  ]
}
[ChatbotController] Has complete data: true
[ChatbotController] Executing action automatically...
[ChatbotController] Action executed successfully, returning response...
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 6029.351 ms - -
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 6017ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.759 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 17 mensagens
[ChatbotController] Dados encontrados: 3 transações, 0 investimentos, 3 metas
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 3,
  totalInvestimentos: 0,
  totalMetas: 3,
  hasTransactions: true,
  hasInvestments: false,
  hasGoals: true
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 18 mensagens
[ChatbotController] Histórico completo: 18 mensagens
[DETECT_USER_INTENT] Analyzing message: eu quero saber de voce qual e o valor que eu solicitei dessa meta e para onde eu vou ?
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "ANALYZE_DATA",
  "entities": {},
  "confidence": 0.9,
  "response": "Parece que você está querendo informações sobre uma meta específica que já criou. Vou verificar aqui para te passar os detalhes. Um momento, por favor!",
  "requiresConfirmation": false
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'ANALYZE_DATA',
  entities: {},
  confidence: 0.9,
  requiresConfirmation: false,
  response: 'Parece que você está querendo informações sobre uma meta específica que já criou. Vou verificar aqui para te passar os detalhes. Um momento, por favor!'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9,
  requiresConfirmation: false,
  successMessage: 'Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!',
  errorMessage: 'Ops! Tive um problema ao analisar seus dados. Pode tentar novamente?',
  response: 'Parece que você está querendo informações sobre uma meta específica que já criou. Vou verificar aqui para te passar os detalhes. Um momento, por favor!',
  followUpQuestions: [
    'Quer que eu gere um relatório detalhado?',
    'Posso sugerir melhorias?',
    'Quer comparar com períodos anteriores?'
  ]
}
[ChatbotController] Action detected with confidence: 0.9
[ChatbotController] Action details: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9
}
[hasCompleteData] Checking action: {
  type: 'ANALYZE_DATA',
  payload: { analysisType: 'general' },
  confidence: 0.9,
  requiresConfirmation: false,
  successMessage: 'Pronto! Análise concluída. Dá uma olhada nos resultados no seu dashboard!',
  errorMessage: 'Ops! Tive um problema ao analisar seus dados. Pode tentar novamente?',
  response: 'Parece que você está querendo informações sobre uma meta específica que já criou. Vou verificar aqui para te passar os detalhes. Um momento, por favor!',
  followUpQuestions: [
    'Quer que eu gere um relatório detalhado?',
    'Posso sugerir melhorias?',
    'Quer comparar com períodos anteriores?'
  ]
}
[ChatbotController] Has complete data: true
[ChatbotController] Executing action automatically...
[ChatbotController] Action executed successfully, returning response...
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 6494.094 ms - -
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 6486ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.482 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 19 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 20 mensagens
[ChatbotController] Histórico completo: 20 mensagens
[DETECT_USER_INTENT] Analyzing message: voce entendeu ou nao ?
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.0,
  "response": "Desculpe, não consegui entender completamente. Poderia me dar mais detalhes sobre o que você está perguntando?",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: true,
  response: 'Desculpe, não consegui entender completamente. Poderia me dar mais detalhes sobre o que você está perguntando?'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Desculpe, Saulo! Parece que houve um mal-entendido. Você pode me explicar novamente qual meta você está se referindo? Assim, posso te ajudar melhor!
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 10852ms
POST /api/chatbot/query 200 10872.876 ms - 621
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 10858ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.406 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 21 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 22 mensagens
[ChatbotController] Histórico completo: 22 mensagens
[DETECT_USER_INTENT] Analyzing message: estamos conversando sobre ela agora, olha as mensagem anterior que voce vai sabse o que estamos falando
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.5,
  "response": "Entendi que estamos continuando uma conversa anterior, mas não consegui identificar claramente qual ação você quer realizar. Poderia me dizer se é sobre criar uma meta, registrar uma transação ou algo mais? Assim posso te ajudar melhor!",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: true,
  response: 'Entendi que estamos continuando uma conversa anterior, mas não consegui identificar claramente qual ação você quer realizar. Poderia me dizer se é sobre criar uma meta, registrar uma transação ou algo mais? Assim posso te ajudar melhor!'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Ah, entendi agora, Saulo! Vou revisar nosso histórico rapidinho para pegar o contexto e te responder com precisão sobre essa meta. Um minutinho! ⏳
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 11721ms
POST /api/chatbot/query 200 11734.763 ms - 620
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 11729ms - IP: ::1
OPTIONS /api/market-data 204 0.564 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /
getMarketDataController: Received customIndicesList from req.body: [ '^BVSP', '^GSPC' ]
getMarketData: Received customIndicesList: [ '^BVSP', '^GSPC' ]
getMarketData: Fetching data for symbols: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
Response from Yahoo Finance API for ETH-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for IVVB11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for EURBRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for GC=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for KNRI11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BOVA11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BTC-USD: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for HGLG11.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^GSPC: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for CL=F: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BRL=X: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBAS3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for VALE3.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ITUB4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for BBDC4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for PETR4.SA: { chart: { result: [ [Object] ], error: null } }
Response from Yahoo Finance API for ^BVSP: { chart: { result: [ [Object] ], error: null } }
getMarketData: resultsMap keys: [
  'PETR4.SA',  'VALE3.SA',
  'ITUB4.SA',  'BBDC4.SA',
  'BBAS3.SA',  'BTC-USD',
  'ETH-USD',   'GC=F',
  'CL=F',      'HGLG11.SA',
  'KNRI11.SA', 'BOVA11.SA',
  'IVVB11.SA', 'BRL=X',
  'EURBRL=X',  '^BVSP',
  '^GSPC'
]
getMarketData: Returning marketData with indices: [ '^BVSP', '^GSPC' ]
POST /api/market-data 200 858.996 ms - -
OPTIONS /api/chatbot/feedback 204 0.724 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /feedback
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /feedback
[AIService] Preferências atualizadas para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AIService] Cache de aprendizado ajustado baseado no feedback
[AIService] Feedback salvo para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2: 5/5
POST /api/chatbot/feedback 200 20.824 ms - 85
[AUDIT] POST /feedback - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 6ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.372 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 23 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 24 mensagens
[ChatbotController] Histórico completo: 24 mensagens
[DETECT_USER_INTENT] Analyzing message: ok fico aguardando
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.9,
  "response": "Beleza, estou aqui quando precisar! Só chamar.",
  "requiresConfirmation": false
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.9,
  requiresConfirmation: false,
  response: 'Beleza, estou aqui quando precisar! Só chamar.'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Action detected with confidence: 0.9
[ChatbotController] Action details: { type: 'UNKNOWN', payload: {}, confidence: 0.9 }
[hasCompleteData] Checking action: {
  type: 'UNKNOWN',
  payload: {},
  confidence: 0.9,
  requiresConfirmation: false,
  successMessage: '',
  errorMessage: '',
  response: 'Beleza, estou aqui quando precisar! Só chamar.'
}
[ChatbotController] Has complete data: false
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 5067.551 ms - 514
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 5066ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.513 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 25 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 26 mensagens
[ChatbotController] Histórico completo: 26 mensagens
[DETECT_USER_INTENT] Analyzing message: voce ja viu o historico ou nao ?voce disse que iria volta e me dizer
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "UNKNOWN",
  "entities": {},
  "confidence": 0.0,
  "response": "Desculpe, parece que houve um mal-entendido. Não tenho registro de ter dito que voltaria com informações sobre o histórico. Como posso te ajudar hoje?",
  "requiresConfirmation": false
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'UNKNOWN',
  entities: {},
  confidence: 0.5,
  requiresConfirmation: false,
  response: 'Desculpe, parece que houve um mal-entendido. Não tenho registro de ter dito que voltaria com informações sobre o histórico. Como posso te ajudar hoje?'
}
[DETECT_USER_INTENT] UNKNOWN intent, returning response only
[ChatbotController] Using simplified response: Saulo, acabei de ver o histórico sim! Você estava falando sobre a meta de guardar R$ 1.000 por mês, certo? Vamos ajustar seu planejamento para alcançar esse objetivo.
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
[ChatbotController] Resposta processada em 9161ms
POST /api/chatbot/query 200 9203.540 ms - 640
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 9212ms - IP: ::1
OPTIONS /api/chatbot/query 204 0.482 ms - 0
[AUTH] 🔍 Iniciando autenticação para: POST /query
[AUTH] 📋 Headers recebidos: {
  authorization: 'Bearer eyJhbGciOiJSU...',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
  'x-forwarded-for': undefined,
  'x-real-ip': undefined
}
[AUTH] 🔑 Token recebido (primeiros 20 chars): eyJhbGciOiJSUzI1NiIs...
[AUTH] 📏 Tamanho do token: 992
[AUTH] 🔥 Tentando verificar token Firebase...
[AUTH] ✅ Token Firebase válido para UID: jJOp4uvDcnMXNWeJxaQvLTRHhcC2
[AUTH] ✅ Configurando req.user com dados Firebase
[AUTH] 👤 req.user configurado: {
  uid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2',
  _id: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2'
}
[AUTH] ✅ Autenticação bem-sucedida para: POST /query
[ChatbotController] Processando mensagem para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, chatId: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 27 mensagens
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: basic
Chatbot - Status da assinatura: { status: 'active', plan: 'Plano Top Anual', isPremium: true }
[ChatbotController] Dados reais do usuário: {
  name: 'Saulo chagas da Silva Martins',
  subscriptionPlan: 'Plano Top Anual',
  subscriptionStatus: 'active',
  isPremium: true,
  totalTransacoes: 0,
  totalInvestimentos: 0,
  totalMetas: 0,
  hasTransactions: false,
  hasInvestments: false,
  hasGoals: false
}
[ChatHistoryService] Buscando conversa: ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd
[ChatHistoryService] Conversa ed9eaf91-0a4a-4dc9-a6e4-8506e071c1dd encontrada com 28 mensagens
[ChatbotController] Histórico completo: 28 mensagens
[DETECT_USER_INTENT] Analyzing message: errado! era 6500 valor viagem para gramado
[AIService] Detecting automated action with prompt
[AIService] Action detection response: {
  "intent": "CREATE_GOAL",
  "entities": {
    "valor_total": 6500,
    "meta": "viagem para gramado",
    "data_conclusao": null,
    "categoria": null
  },
  "confidence": 0.95,
  "response": "Entendi, Saulo! Vamos ajustar sua meta para juntar R$ 6.500 para a viagem para Gramado. Você tem algum prazo em mente para alcançar esse valor?",
  "requiresConfirmation": true
}
[DETECT_USER_INTENT] Raw AI response: {
  intent: 'CREATE_GOAL',
  entities: {
    valor_total: 6500,
    meta: 'viagem para gramado',
    data_conclusao: null,
    categoria: null
  },
  confidence: 0.95,
  requiresConfirmation: true,
  response: 'Entendi, Saulo! Vamos ajustar sua meta para juntar R$ 6.500 para a viagem para Gramado. Você tem algum prazo em mente para alcançar esse valor?'
}
[DETECT_USER_INTENT] Parsed response: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Entendi, Saulo! Vamos ajustar sua meta para juntar R$ 6.500 para a viagem para Gramado. Você tem algum prazo em mente para alcançar esse valor?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[ChatbotController] Action detected with confidence: 0.95
[ChatbotController] Action details: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.95
}
[hasCompleteData] Checking action: {
  type: 'CREATE_GOAL',
  payload: {
    meta: 'viagem para gramado',
    valor_total: 6500,
    data_conclusao: '2026-07-08',
    categoria: 'Outros'
  },
  confidence: 0.95,
  requiresConfirmation: true,
  successMessage: 'Que legal! Meta criada: viagem para gramado - R$ 6500',
  errorMessage: 'Ops! Tive um problema ao criar sua meta. Pode tentar novamente?',
  response: 'Entendi, Saulo! Vamos ajustar sua meta para juntar R$ 6.500 para a viagem para Gramado. Você tem algum prazo em mente para alcançar esse valor?',
  followUpQuestions: [
    'Quer que eu crie um plano de economia?',
    'Posso analisar se a meta é realista?',
    'Quer ver outras metas relacionadas?'
  ]
}
[hasCompleteData] CREATE_GOAL check: { valor_total: 6500, meta: 'viagem para gramado', hasData: true }
[ChatbotController] Has complete data: true
[ChatbotController] Executing action automatically...
[ChatbotController] Creating goal with payload: {
  meta: 'viagem para gramado',
  valor_total: 6500,
  data_conclusao: '2026-07-08',
  categoria: 'Outros'
}
[createGoal] User found: new ObjectId('6856b3ffaf565a2443715aae')
[ChatbotController] Goal created successfully: {
  meta: 'viagem para gramado',
  descricao: '',
  valor_total: 6500,
  valor_atual: 0,
  data_conclusao: 2026-07-08T00:00:00.000Z,
  userId: '6856b3ffaf565a2443715aae',
  categoria: 'Outros',
  prioridade: 'media',
  createdAt: 2025-07-08T00:48:56.411Z,
  _id: new ObjectId('686c6af830d3c59cbf6f8b6a'),
  __v: 0
}
[ChatbotController] Action executed successfully, returning response...
Analytics atualizado para usuário jJOp4uvDcnMXNWeJxaQvLTRHhcC2, tipo: premium
POST /api/chatbot/query 200 8574.414 ms - -
[AUDIT] POST /query - User: jJOp4uvDcnMXNWeJxaQvLTRHhcC2 - Status: 200 - Duration: 8568ms - IP: ::1
SIGINT received. Shutting down gracefully...

fronend Microsoft Windows [versão 10.0.19045.2728]
(c) Microsoft Corporation. Todos os direitos reservados.

C:\Users\USER>cd finnextho/frotend
O sistema não pode encontrar o caminho especificado.

C:\Users\USER>cd finnextho

C:\Users\USER\finnextho>cd frontend

C:\Users\USER\finnextho\frontend>npm run dev

> frontend@1.0.0 dev
> next dev

   ▲ Next.js 15.3.2
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.67:3000
   - Environments: .env.local, .env
   - Experiments (use with caution):
     · staleTimes
     ✓ scrollRestoration

 ✓ Starting...
 ✓ Ready in 8.2s


C:\Users\USER\finnextho\frontend>npm run dev

> frontend@1.0.0 dev
> next dev

   ▲ Next.js 15.3.2
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.67:3000
   - Environments: .env.local, .env
   - Experiments (use with caution):
     · staleTimes
     ✓ scrollRestoration

 ✓ Starting...
 ✓ Ready in 10.5s
 ○ Compiling / ...
 ✓ Compiled / in 22.5s (1105 modules)
 ✓ Compiled in 5.5s (1105 modules)
✅ Usando configuração das variáveis de ambiente
✅ Configuração do Firebase válida: {
  authDomain: 'finup-saas-2025.firebaseapp.com',
  projectId: 'finup-saas-2025',
  hasApiKey: true,
  hasAppId: true
}
[AuthProvider] Inicializando AuthProvider
[AuthProvider] Inicializando AuthProvider
 GET / 200 in 35797ms
 ○ Compiling /auth/login ...
 ✓ Compiled /auth/login in 12.8s (1117 modules)
 ○ Compiling /middleware ...
 ✓ Compiled /middleware in 4.4s (151 modules)
 ○ Compiling /dashboard ...
 ✓ Compiled /dashboard in 15.1s (1160 modules)
✅ Usando configuração das variáveis de ambiente
✅ Configuração do Firebase válida: {
  authDomain: 'finup-saas-2025.firebaseapp.com',
  projectId: 'finup-saas-2025',
  hasApiKey: true,
  hasAppId: true
}
[AuthProvider] Inicializando AuthProvider
[AuthInitializer] authChecked: false isAuthReady: false loading: true user: false
[AuthInitializer] Showing loading spinner
 GET /_next/data/development/dashboard.json 200 in 18856ms
 ○ Compiling /transacoes ...
 ✓ Compiled /transacoes in 8.8s (1348 modules)
✅ Usando configuração das variáveis de ambiente
✅ Configuração do Firebase válida: {
  authDomain: 'finup-saas-2025.firebaseapp.com',
  projectId: 'finup-saas-2025',
  hasApiKey: true,
  hasAppId: true
}
[AuthProvider] Inicializando AuthProvider
[AuthInitializer] authChecked: false isAuthReady: false loading: true user: false
[AuthInitializer] Showing loading spinner
 GET /_next/data/development/transacoes.json 200 in 9842ms
 ○ Compiling /metas ...
 ✓ Compiled /metas in 6.7s (1350 modules)
✅ Usando configuração das variáveis de ambiente
✅ Configuração do Firebase válida: {
  authDomain: 'finup-saas-2025.firebaseapp.com',
  projectId: 'finup-saas-2025',
  hasApiKey: true,
  hasAppId: true
}
[AuthProvider] Inicializando AuthProvider
[AuthInitializer] authChecked: false isAuthReady: false loading: true user: false
[AuthInitializer] Showing loading spinner
 GET /_next/data/development/metas.json 200 in 7602ms
]

==========================================
FIM DOS LOGS
==========================================
*/