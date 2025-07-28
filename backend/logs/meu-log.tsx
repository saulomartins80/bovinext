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

[
SAULO@USER MINGW64 ~
$ cd finnextho/frontend

SAULO@USER MINGW64 ~/finnextho/frontend (main)
$ npm run lint

> frontend@1.0.0 lint
> eslint .

=============

WARNING: You are currently running a version of TypeScript which is not official
ly supported by @typescript-eslint/typescript-estree.

You may find that it works just fine, or you may not.

SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0

YOUR TYPESCRIPT VERSION: 5.8.3

Please only submit bug reports when using the officially supported version.

=============

C:\Users\USER\finnextho\frontend\components\AssetSelectionModal.tsx
   20:12  error    'selected' is defined but never used  no-unused-vars
  185:24  error    'asset' is defined but never used     no-unused-vars
  185:24  warning  'asset' is defined but never used     @typescript-eslint/no-u
nused-vars

C:\Users\USER\finnextho\frontend\components\Chatbot.tsx
    13:17  error    'JSX' is defined but never used
      no-unused-vars
    13:17  warning  'JSX' is defined but never used
      @typescript-eslint/no-unused-vars
   344:3   error    'isPremium' is defined but never used
      no-unused-vars
   344:3   warning  'isPremium' is defined but never used
      @typescript-eslint/no-unused-vars
   353:16  error    'messageId' is defined but never used
      no-unused-vars
   354:21  error    'action' is defined but never used
      no-unused-vars
   355:18  error    'action' is defined but never used
      no-unused-vars
   356:20  error    'action' is defined but never used
      no-unused-vars
   430:9   error    'handleRecommendationClick' is assigned a value but never us
ed    no-unused-vars
   430:9   warning  'handleRecommendationClick' is assigned a value but never us
ed    @typescript-eslint/no-unused-vars
   453:9   error    'validateMessage' is assigned a value but never used
      no-unused-vars
   453:9   warning  'validateMessage' is assigned a value but never used
      @typescript-eslint/no-unused-vars
   453:37  warning  Unexpected any. Specify a different type
      @typescript-eslint/no-explicit-any
   621:65  warning  Unexpected any. Specify a different type
      @typescript-eslint/no-explicit-any
   745:14  error    'message' is defined but never used
      no-unused-vars
   811:14  error    'values' is defined but never used
      no-unused-vars
   880:18  error    'setChatId' is assigned a value but never used
      no-unused-vars
   880:18  warning  'setChatId' is assigned a value but never used
      @typescript-eslint/no-unused-vars
   881:10  error    'sessions' is assigned a value but never used
      no-unused-vars
   881:10  warning  'sessions' is assigned a value but never used
      @typescript-eslint/no-unused-vars
   884:10  error    'feedbackModal' is assigned a value but never used
      no-unused-vars
   884:10  warning  'feedbackModal' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1162:74  warning  Unexpected any. Specify a different type
      @typescript-eslint/no-explicit-any
  1297:9   error    'switchSession' is assigned a value but never used
      no-unused-vars
  1297:9   warning  'switchSession' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1304:9   error    'deleteSession' is assigned a value but never used
      no-unused-vars
  1304:9   warning  'deleteSession' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1330:9   error    'handleActionConfirmWithForm' is assigned a value but never
used  no-unused-vars
  1330:9   warning  'handleActionConfirmWithForm' is assigned a value but never
used  @typescript-eslint/no-unused-vars
  1348:31  error    'action' is defined but never used
      no-unused-vars
  1348:31  warning  'action' is defined but never used
      @typescript-eslint/no-unused-vars
  1361:9   error    'handleFeedback' is assigned a value but never used
      no-unused-vars
  1361:9   warning  'handleFeedback' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1381:9   error    'closeFeedbackModal' is assigned a value but never used
      no-unused-vars
  1381:9   warning  'closeFeedbackModal' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1391:9   error    'handleDashboardResponse' is assigned a value but never used
      no-unused-vars
  1391:9   warning  'handleDashboardResponse' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1424:9   error    'processSpecialCommands' is assigned a value but never used
      no-unused-vars
  1424:9   warning  'processSpecialCommands' is assigned a value but never used
      @typescript-eslint/no-unused-vars
  1702:2   error    Unnecessary semicolon
      no-extra-semi

C:\Users\USER\finnextho\frontend\components\ChatbotWithDelete.tsx
  71:18  error    'appTheme' is assigned a value but never used        no-unused
-vars
  71:18  warning  'appTheme' is assigned a value but never used        @typescri
pt-eslint/no-unused-vars
  79:9   error    'messagesEndRef' is assigned a value but never used  no-unused
-vars
  79:9   warning  'messagesEndRef' is assigned a value but never used  @typescri
pt-eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\components\ConfigurableTableSection.tsx
  13:23  error  'symbol' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\components\DashboardContent.tsx
  16:11  error    'User' is already defined                              no-rede
clare
  22:11  error    'ApiError' is defined but never used                   no-unus
ed-vars
  22:11  warning  'ApiError' is defined but never used                   @typesc
ript-eslint/no-unused-vars
  52:5   error    'setCustomIndices' is assigned a value but never used  no-unus
ed-vars
  52:5   warning  'setCustomIndices' is assigned a value but never used  @typesc
ript-eslint/no-unused-vars
  52:25  error    'indices' is defined but never used                    no-unus
ed-vars
  52:25  warning  'indices' is defined but never used                    @typesc
ript-eslint/no-unused-vars
  54:24  error    'indices' is defined but never used                    no-unus
ed-vars

C:\Users\USER\finnextho\frontend\components\DebugConfig.tsx
  22:15  error    '_' is defined but never used  no-unused-vars
  22:15  warning  '_' is defined but never used  @typescript-eslint/no-unused-va
rs
  26:15  error    '_' is defined but never used  no-unused-vars
  26:15  warning  '_' is defined but never used  @typescript-eslint/no-unused-va
rs

C:\Users\USER\finnextho\frontend\components\DynamicDashboard.tsx
   37:24  error    'response' is defined but never used      no-unused-vars
  219:63  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  497:33  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  539:34  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\components\FinanceMarket.tsx
  33:23  error  'stocks' is defined but never used       no-unused-vars
  34:24  error  'cryptos' is defined but never used      no-unused-vars
  35:28  error  'commodities' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\components\IAUsageChart.tsx
   6:9  warning  Unexpected any. Specify a different type      @typescript-eslin
t/no-explicit-any
  86:9  error    Unexpected lexical declaration in case block  no-case-declarati
ons

C:\Users\USER\finnextho\frontend\components\Layout.tsx
  16:16  error    'NodeJS' is not defined                   no-undef
  17:20  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  27:29  error    'callback' is defined but never used      no-unused-vars
  29:31  error    'callback' is defined but never used      no-unused-vars

C:\Users\USER\finnextho\frontend\components\MobileHeader.tsx
   2:10  error    'useRouter' is defined but never used                no-unused
-vars
   2:10  warning  'useRouter' is defined but never used                @typescri
pt-eslint/no-unused-vars
  17:3   error    'showBackButton' is assigned a value but never used  no-unused
-vars
  17:3   warning  'showBackButton' is assigned a value but never used  @typescri
pt-eslint/no-unused-vars
  18:3   error    'onBack' is defined but never used                   no-unused
-vars
  18:3   warning  'onBack' is defined but never used                   @typescri
pt-eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\components\MobileNavigation.tsx
  12:3  error    'BarChart3' is defined but never used  no-unused-vars
  12:3  warning  'BarChart3' is defined but never used  @typescript-eslint/no-un
used-vars
  14:3  error    'PieChart' is defined but never used   no-unused-vars
  14:3  warning  'PieChart' is defined but never used   @typescript-eslint/no-un
used-vars

C:\Users\USER\finnextho\frontend\components\PasswordChangeForm.tsx
  65:19  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\components\QuickAddAssistant.tsx
    7:16  error    'type' is defined but never used          no-unused-vars
    7:61  error    'data' is defined but never used          no-unused-vars
    7:67  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   23:15  error    'value' is defined but never used         no-unused-vars
   23:22  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   42:44  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  240:48  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  240:66  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  382:52  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\components\RPADashboard.tsx
   21:3   error    'HardDrive' is defined but never used                no-unuse
d-vars
   21:3   warning  'HardDrive' is defined but never used                @typescr
ipt-eslint/no-unused-vars
   23:3   error    'Settings' is defined but never used                 no-unuse
d-vars
   23:3   warning  'Settings' is defined but never used                 @typescr
ipt-eslint/no-unused-vars
  203:14  error    Unexpected constant condition                        no-const
ant-condition
  237:46  warning  Unexpected any. Specify a different type             @typescr
ipt-eslint/no-explicit-any
  239:11  error    'icon' is assigned a value but never used            no-unuse
d-vars
  239:11  warning  'icon' is assigned a value but never used            @typescr
ipt-eslint/no-unused-vars
  343:9   error    'getStatusColor' is assigned a value but never used  no-unuse
d-vars
  343:9   warning  'getStatusColor' is assigned a value but never used  @typescr
ipt-eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\components\Sidebar.tsx
  29:23  error  'collapsed' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\components\StripeCheckout.tsx
  20:61  error    'onSuccess' is defined but never used       no-unused-vars
  20:61  warning  'onSuccess' is defined but never used       @typescript-eslint
/no-unused-vars
  40:13  error    'token' is assigned a value but never used  no-unused-vars
  40:13  warning  'token' is assigned a value but never used  @typescript-eslint
/no-unused-vars

C:\Users\USER\finnextho\frontend\components\TransactionForm.tsx
  28:12  error  'payload' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\components\TransactionTable.tsx
  29:12  error    'transacao' is defined but never used  no-unused-vars
  30:14  error    'id' is defined but never used         no-unused-vars
  38:3   error    'theme' is defined but never used      no-unused-vars
  38:3   warning  'theme' is defined but never used      @typescript-eslint/no-u
nused-vars

C:\Users\USER\finnextho\frontend\components\TwoFactorAuthSetup.tsx
  8:16  error  'success' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\context\AuthContext.tsx
    3:3   error    'GoogleAuthProvider' is defined but never used          no-un
used-vars
    3:3   warning  'GoogleAuthProvider' is defined but never used          @type
script-eslint/no-unused-vars
    5:3   error    'signInWithPopup' is defined but never used             no-un
used-vars
    5:3   warning  'signInWithPopup' is defined but never used             @type
script-eslint/no-unused-vars
   12:10  error    'handleRedirectResult' is defined but never used        no-un
used-vars
   12:10  warning  'handleRedirectResult' is defined but never used        @type
script-eslint/no-unused-vars
   18:37  error    'isUserRegistrationComplete' is defined but never used  no-un
used-vars
   18:37  warning  'isUserRegistrationComplete' is defined but never used  @type
script-eslint/no-unused-vars
   60:11  error    'email' is defined but never used                       no-un
used-vars
   60:26  error    'password' is defined but never used                    no-un
used-vars
   64:30  error    'updatedProfileData' is defined but never used          no-un
used-vars
   65:13  error    'user' is defined but never used                        no-un
used-vars
   87:46  warning  Unexpected any. Specify a different type                @type
script-eslint/no-explicit-any
  247:21  warning  Unexpected any. Specify a different type                @type
script-eslint/no-explicit-any
  395:21  warning  Unexpected any. Specify a different type                @type
script-eslint/no-explicit-any
  428:21  warning  Unexpected any. Specify a different type                @type
script-eslint/no-explicit-any

C:\Users\USER\finnextho\frontend\context\DashboardContext.tsx
   52:22  error    'indices' is defined but never used
 no-unused-vars
   53:23  error    'options' is defined but never used
 no-unused-vars
   54:20  error    'index' is defined but never used
 no-unused-vars
   55:23  error    'symbol' is defined but never used
 no-unused-vars
   56:23  error    'oldSymbol' is defined but never used
 no-unused-vars
   56:42  error    'newIndex' is defined but never used
 no-unused-vars
   57:17  error    'symbol' is defined but never used
 no-unused-vars
   58:18  error    'symbol' is defined but never used
 no-unused-vars
   59:21  error    'symbol' is defined but never used
 no-unused-vars
   60:15  error    'symbol' is defined but never used
 no-unused-vars
   61:15  error    'symbol' is defined but never used
 no-unused-vars
   62:20  error    'symbol' is defined but never used
 no-unused-vars
   63:21  error    'assets' is defined but never used
 no-unused-vars
   64:23  error    'stocks' is defined but never used
 no-unused-vars
   65:24  error    'cryptos' is defined but never used
 no-unused-vars
   66:28  error    'commodities' is defined but never used
 no-unused-vars
   67:21  error    'fiis' is defined but never used
 no-unused-vars
   68:21  error    'etfs' is defined but never used
 no-unused-vars
   69:27  error    'currencies' is defined but never used
 no-unused-vars
  152:27  error    'setAvailableStocks' is assigned a value but never used
 no-unused-vars
  152:27  warning  'setAvailableStocks' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  153:28  error    'setAvailableCryptos' is assigned a value but never used
 no-unused-vars
  153:28  warning  'setAvailableCryptos' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  154:32  error    'setAvailableCommodities' is assigned a value but never used
 no-unused-vars
  154:32  warning  'setAvailableCommodities' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  155:25  error    'setAvailableFiis' is assigned a value but never used
 no-unused-vars
  155:25  warning  'setAvailableFiis' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  156:25  error    'setAvailableEtfs' is assigned a value but never used
 no-unused-vars
  156:25  warning  'setAvailableEtfs' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  157:31  error    'setAvailableCurrencies' is assigned a value but never used
 no-unused-vars
  157:31  warning  'setAvailableCurrencies' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  158:28  error    'setAvailableIndices' is assigned a value but never used
 no-unused-vars
  158:28  warning  'setAvailableIndices' is assigned a value but never used
 @typescript-eslint/no-unused-vars
  199:21  warning  Unexpected any. Specify a different type
 @typescript-eslint/no-explicit-any

C:\Users\USER\finnextho\frontend\context\FinanceContext.tsx
   32:20  error    'novaTransacao' is defined but never used        no-unused-va
rs
   33:21  error    'id' is defined but never used                   no-unused-va
rs
   33:33  error    'updatedTransaction' is defined but never used   no-unused-va
rs
   34:23  error    'id' is defined but never used                   no-unused-va
rs
   36:21  error    'novoInvestimento' is defined but never used     no-unused-va
rs
   37:22  error    'id' is defined but never used                   no-unused-va
rs
   37:34  error    'updatedInvestimento' is defined but never used  no-unused-va
rs
   38:24  error    'id' is defined but never used                   no-unused-va
rs
   40:13  error    'novaMeta' is defined but never used             no-unused-va
rs
   41:14  error    'id' is defined but never used                   no-unused-va
rs
   41:26  error    'updatedMeta' is defined but never used          no-unused-va
rs
   42:16  error    'id' is defined but never used                   no-unused-va
rs
   48:24  warning  Unexpected any. Specify a different type         @typescript-
eslint/no-explicit-any
   52:28  warning  Unexpected any. Specify a different type         @typescript-
eslint/no-explicit-any
  361:21  warning  Unexpected any. Specify a different type         @typescript-
eslint/no-explicit-any

C:\Users\USER\finnextho\frontend\context\NotificationContext.tsx
  6:21  error  'notification' is defined but never used  no-unused-vars
  7:24  error  'id' is defined but never used            no-unused-vars
  8:16  error  'id' is defined but never used            no-unused-vars

C:\Users\USER\finnextho\frontend\context\ThemeContext.tsx
  8:14  error  'theme' is defined but never used  no-unused-vars

C:\Users\USER\finnextho\frontend\fix-eslint-errors.js
   5:39  error    'filePath' is defined but never used              no-unused-va
rs
   5:39  warning  'filePath' is defined but never used              @typescript-
eslint/no-unused-vars
  17:9   error    'importStart' is assigned a value but never used  no-unused-va
rs
  17:9   warning  'importStart' is assigned a value but never used  @typescript-
eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\fix-module-error.js
  46:14  error  Unnecessary escape character: \.  no-useless-escape
  47:29  error  Unnecessary escape character: \/  no-useless-escape

C:\Users\USER\finnextho\frontend\hooks\useIAAnalytics.ts
   6:52  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
   7:54  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  49:57  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  65:48  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\lib\firebase\auth.ts
  86:26  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\lib\firebase\client.ts
  138:19  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\api\auth\[...nextauth].ts
  36:41  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  36:53  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  42:50  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  42:62  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\pages\configuracoes.tsx
  186:20  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  187:17  error    'value' is defined but never used         no-unused-vars
  187:24  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\investimentos.tsx
  103:36  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  103:69  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  117:48  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  248:43  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  357:31  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  379:34  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  379:75  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  393:36  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  393:77  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\metas.tsx
   81:38  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   81:80  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   95:38  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   95:80  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  181:19  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  198:21  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\milhas.tsx
    3:3   error    'TrendingUp' is defined but never used              no-unused
-vars
    3:3   warning  'TrendingUp' is defined but never used              @typescri
pt-eslint/no-unused-vars
    5:11  error    'DollarSign' is defined but never used              no-unused
-vars
    5:11  warning  'DollarSign' is defined but never used              @typescri
pt-eslint/no-unused-vars
  187:21  error    'show' is defined but never used                    no-unused
-vars
  188:18  error    'tab' is defined but never used                     no-unused
-vars
  189:21  warning  Unexpected any. Specify a different type            @typescri
pt-eslint/no-explicit-any
  350:18  error    'tab' is defined but never used                     no-unused
-vars
  351:24  error    'invoice' is defined but never used                 no-unused
-vars
  352:25  error    'show' is defined but never used                    no-unused
-vars
  502:18  error    'tab' is defined but never used                     no-unused
-vars
  503:21  error    'show' is defined but never used                    no-unused
-vars
  504:21  error    'card' is defined but never used                    no-unused
-vars
  506:24  error    'invoice' is defined but never used                 no-unused
-vars
  507:25  error    'show' is defined but never used                    no-unused
-vars
  508:21  warning  Unexpected any. Specify a different type            @typescri
pt-eslint/no-explicit-any
  966:9   error    'handleAddItem' is assigned a value but never used  no-unused
-vars
  966:9   warning  'handleAddItem' is assigned a value but never used  @typescri
pt-eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\pages\payment\sucesso.tsx
  141:23  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\precos.tsx
  16:10  error    'selectedPlan' is assigned a value but never used     no-unuse
d-vars
  16:10  warning  'selectedPlan' is assigned a value but never used     @typescr
ipt-eslint/no-unused-vars
  16:24  error    'setSelectedPlan' is assigned a value but never used  no-unuse
d-vars
  16:24  warning  'setSelectedPlan' is assigned a value but never used  @typescr
ipt-eslint/no-unused-vars

C:\Users\USER\finnextho\frontend\pages\profile.tsx
   14:10  error    'Edit' is defined but never used                          no-
unused-vars
   14:10  warning  'Edit' is defined but never used                          @ty
pescript-eslint/no-unused-vars
   14:16  error    'Trash2' is defined but never used                        no-
unused-vars
   14:16  warning  'Trash2' is defined but never used                        @ty
pescript-eslint/no-unused-vars
   14:24  error    'Calendar' is defined but never used                      no-
unused-vars
   14:24  warning  'Calendar' is defined but never used                      @ty
pescript-eslint/no-unused-vars
   14:46  error    'Phone' is defined but never used                         no-
unused-vars
   14:46  warning  'Phone' is defined but never used                         @ty
pescript-eslint/no-unused-vars
   14:53  error    'MapPin' is defined but never used                        no-
unused-vars
   14:53  warning  'MapPin' is defined but never used                        @ty
pescript-eslint/no-unused-vars
   31:30  error    'updatedProfileData' is defined but never used            no-
unused-vars
   48:5   error    'refreshSubscription' is assigned a value but never used  no-
unused-vars
   48:5   warning  'refreshSubscription' is assigned a value but never used  @ty
pescript-eslint/no-unused-vars
   51:11  error    'resolvedTheme' is assigned a value but never used        no-
unused-vars
   51:11  warning  'resolvedTheme' is assigned a value but never used        @ty
pescript-eslint/no-unused-vars
   53:10  error    'userData' is assigned a value but never used             no-
unused-vars
   53:10  warning  'userData' is assigned a value but never used             @ty
pescript-eslint/no-unused-vars
  163:28  warning  Unexpected any. Specify a different type                  @ty
pescript-eslint/no-explicit-any
  252:21  warning  Unexpected any. Specify a different type                  @ty
pescript-eslint/no-explicit-any

C:\Users\USER\finnextho\frontend\pages\sistema.tsx
  389:52  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\pages\transacoes.tsx
  133:32  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\public\sw.js
  1:0  error  Parsing error: File appears to be binary

C:\Users\USER\finnextho\frontend\scripts\advanced-lint-fix.js
  58:0  error  Parsing error: Expression or comma expected

C:\Users\USER\finnextho\frontend\scripts\aggressive-fix.js
  3:8  error    'fs' is defined but never used  no-unused-vars
  3:8  warning  'fs' is defined but never used  @typescript-eslint/no-unused-var
s

C:\Users\USER\finnextho\frontend\scripts\check-firebase-config.js
  5:0  error  Parsing error: Expression or comma expected

C:\Users\USER\finnextho\frontend\scripts\manual-fix.js
  31:26  error  Parsing error: Unterminated string literal

C:\Users\USER\finnextho\frontend\services\api.ts
  143:72  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  158:28  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  159:27  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  160:31  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  165:64  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  391:48  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  448:34  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  448:48  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  501:57  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  526:36  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  538:55  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  562:44  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  574:50  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  618:34  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\services\iaAnalyticsService.ts
   67:58  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   83:59  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   99:55  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
   99:86  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  115:46  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  115:77  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  208:64  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\services\subscriptionService.ts
  35:21  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\src\hooks\useChatStream.ts
   19:17  error  'message' is defined but never used  no-unused-vars
   19:34  error  'chatId' is defined but never used   no-unused-vars
  117:16  error  Unexpected constant condition        no-constant-condition

C:\Users\USER\finnextho\frontend\src\hooks\useChatStreamSecure.ts
   20:17  error  'message' is defined but never used  no-unused-vars
   20:34  error  'chatId' is defined but never used   no-unused-vars
  111:16  error  Unexpected constant condition        no-constant-condition

C:\Users\USER\finnextho\frontend\src\hooks\useIAAnalytics.ts
   73:18  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  139:69  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  152:60  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\src\hooks\useMileage.ts
   56:60  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  273:53  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  334:76  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any
  362:63  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\src\utils\security.ts
  123:67  warning  Unexpected any. Specify a different type  @typescript-eslint/
no-explicit-any

C:\Users\USER\finnextho\frontend\types\chat.ts
   5:13  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  12:18  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  23:20  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any
  44:20  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\types\index.ts
  32:34  warning  Unexpected any. Specify a different type  @typescript-eslint/n
o-explicit-any

C:\Users\USER\finnextho\frontend\types\market.ts
  7:11  warning  Unexpected any. Specify a different type  @typescript-eslint/no
-explicit-any
  8:12  warning  Unexpected any. Specify a different type  @typescript-eslint/no
-explicit-any

C:\Users\USER\finnextho\frontend\types\transacoes.ts
   3:33  error    'transacao' is defined but never used  no-unused-vars
   3:33  warning  'transacao' is defined but never used  @typescript-eslint/no-u
nused-vars
   7:33  error    'id' is defined but never used         no-unused-vars
   7:33  warning  'id' is defined but never used         @typescript-eslint/no-u
nused-vars
   7:45  error    'transacao' is defined but never used  no-unused-vars
   7:45  warning  'transacao' is defined but never used  @typescript-eslint/no-u
nused-vars
  15:33  error    'id' is defined but never used         no-unused-vars
  15:33  warning  'id' is defined but never used         @typescript-eslint/no-u
nused-vars

✖ 318 problems (157 errors, 161 warnings)
  1 error and 0 warnings potentially fixable with the `--fix` option.


SAULO@USER MINGW64 ~/finnextho/frontend (main)
$
]

==========================================
FIM DOS LOGS
==========================================
*/