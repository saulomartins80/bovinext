# Fontes

## Erro: inter.woff2 não encontrado

Para corrigir este erro, você pode:

### Opção 1: Usar Google Fonts (Recomendado)
Adicione no `pages/_document.tsx` ou `_app.tsx`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
  rel="stylesheet"
/>
```

### Opção 2: Download da fonte
1. Baixe a fonte Inter de: https://rsms.me/inter/
2. Coloque o arquivo `inter.woff2` neste diretório
3. Mantenha o preload no HTML

### Opção 3: Remover preload
Remova a linha de preload da fonte no HTML se não estiver usando. 