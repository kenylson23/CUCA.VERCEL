# 🚀 Guia Final - Deploy CUCA Beer no Vercel

## ✅ Problemas Corrigidos

### 1. Configuração de Build
- **vercel.json** configurado com `vite build`
- Output directory: `dist/public`
- Timeout aumentado para 30s nas functions

### 2. API Serverless
- **api/index.ts** corrigido para ES Modules
- Importação de `__dirname` usando `fileURLToPath`
- Fallback adequado para arquivos estáticos

### 3. Estrutura de Arquivos
- Build gera corretamente em `dist/public/`
- Roteamento SPA configurado nos rewrites
- Assets e imagens organizados

## 📋 Passos para Deploy

### 1. Variáveis de Ambiente
Configure no dashboard do Vercel:

```
DATABASE_URL=sua_url_postgresql_completa
NODE_ENV=production
SESSION_SECRET=chave-secreta-forte-minimo-32-caracteres
JWT_SECRET=chave-jwt-forte-minimo-32-caracteres
VERCEL=1
```

### 2. Configurações Automáticas
O Vercel detectará automaticamente:
- Build Command: `vite build`
- Output Directory: `dist/public`
- Runtime: Node.js 18.x

### 3. Após Deploy
Execute localmente para configurar o banco:

```bash
export DATABASE_URL="sua_url_do_vercel"
npm run db:push
```

## 🎯 URLs Disponíveis

- **Site**: `https://seu-projeto.vercel.app`
- **Admin**: `https://seu-projeto.vercel.app/admin`
- **APIs**: `https://seu-projeto.vercel.app/api/*`

## ⚠️ Checklist de Deploy

- [ ] Repositório conectado ao Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] DATABASE_URL válida e acessível
- [ ] Primeiro deploy executado
- [ ] Schema do banco sincronizado (`npm run db:push`)
- [ ] Teste de login com admin/cuca2024

## 🔧 Sistema de Autenticação

- **Desenvolvimento**: Sessões com express-session
- **Vercel**: JWT automático com cookies seguros
- **Credenciais**: admin / cuca2024

O projeto está pronto para implantação no Vercel com todas as configurações corrigidas.