# Configuração da Galeria dos Fãs CUCA

## Problema Identificado
A galeria dos fãs estava configurada apenas para PostgreSQL local, causando erros no Vercel onde este banco não está disponível.

## Solução Implementada
Criamos um sistema híbrido que detecta automaticamente o ambiente:

### Local (Desenvolvimento)
- Usa PostgreSQL local via API Express
- Funciona com o banco de dados configurado no Replit

### Vercel (Produção)
- Usa Supabase como banco de dados
- Fallback automático para API local se Supabase falhar

## Configuração Necessária no Supabase

1. **Criar Projeto Supabase**
   - Acesse https://supabase.com
   - Crie um novo projeto

2. **Executar Script SQL**
   - No painel do Supabase, vá em SQL Editor
   - Execute o script em `supabase-setup.sql`
   - Isso criará a tabela `fan_photos` com as configurações necessárias

3. **Configurar Variáveis de Ambiente**
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - Essas já foram configuradas no projeto

## Como Funciona

### Detecção de Ambiente
```javascript
const useSupabase = () => {
  return typeof window !== 'undefined' && 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    (window.location.hostname.includes('.vercel.app') || 
     window.location.hostname.includes('replit.app') ||
     import.meta.env.PROD);
};
```

### Fallback Automático
- Se o Supabase falhar, a aplicação automaticamente usa a API local
- Console mostra warnings quando ocorre fallback
- Garantia de funcionamento em qualquer ambiente

## Funcionalidades da Galeria

- ✅ Envio de fotos pelos usuários
- ✅ Moderação por administradores
- ✅ Aprovação/rejeição de fotos
- ✅ Exibição pública de fotos aprovadas
- ✅ Armazenamento de imagens em base64
- ✅ Compatibilidade com Vercel e desenvolvimento local

## Status Atual
- ✅ Banco PostgreSQL local configurado
- ✅ Schema atualizado com campo `image_data`
- ✅ API funcionando corretamente
- ✅ Serviço híbrido implementado
- ✅ Supabase helpers criados
- ✅ Script SQL para Supabase pronto

## Próximos Passos para Deplomar no Vercel
1. Execute o script SQL no Supabase
2. Faça deploy no Vercel
3. A galeria funcionará automaticamente com Supabase