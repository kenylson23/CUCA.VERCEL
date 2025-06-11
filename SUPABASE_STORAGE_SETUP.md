# Integração do Supabase Storage para Galeria de Fotos

## Configuração do Supabase Storage

### 1. Criar Bucket no Supabase

No painel do Supabase, vá para Storage e crie um novo bucket:

```sql
-- Criar bucket para galeria de fãs
INSERT INTO storage.buckets (id, name, public)
VALUES ('fan-gallery', 'fan-gallery', true);
```

### 2. Configurar Políticas de Segurança (RLS)

```sql
-- Política para permitir uploads autenticados
CREATE POLICY "Authenticated users can upload fan photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fan-gallery' 
  AND auth.role() = 'authenticated'
);

-- Política para leitura pública
CREATE POLICY "Public read access for fan gallery" ON storage.objects
FOR SELECT USING (bucket_id = 'fan-gallery');

-- Política para admins deletarem fotos
CREATE POLICY "Admins can delete fan photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'fan-gallery' 
  AND auth.role() = 'authenticated'
);
```

### 3. Configurar Variáveis de Ambiente

Adicione no arquivo `.env`:

```env
# Supabase Configuration (Backend)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Frontend Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

## Como Funciona a Integração

### Backend (Server-side)

O sistema agora oferece uma abordagem híbrida:

1. **Upload para Supabase Storage**: Quando configurado, as imagens são enviadas para o Supabase Storage
2. **Fallback para Base64**: Se o Supabase não estiver configurado, usa o método anterior de armazenar base64
3. **Compatibilidade**: Mantém compatibilidade com fotos existentes em base64

### Frontend (Client-side)

O componente de galeria prioriza:

1. `imageUrl` (URL do Supabase Storage) se disponível
2. `imageData` (base64) como fallback
3. Placeholder vazio se nenhum estiver disponível

### Fluxo de Upload

1. Usuário seleciona imagem
2. Imagem é convertida para base64 (para preview)
3. No backend:
   - Se Supabase configurado: converte base64 para blob e faz upload
   - Salva URL e chave do storage no banco de dados
   - Mantém base64 para compatibilidade
4. Frontend usa URL do storage se disponível

### Vantagens da Integração

- **Performance**: URLs diretas são mais rápidas que base64
- **Escalabilidade**: Storage separado do banco de dados
- **Gestão**: Controle granular de acesso via RLS
- **CDN**: Supabase oferece CDN global
- **Compatibilidade**: Transição suave sem quebrar funcionalidades existentes

### Estrutura de Arquivos

```
server/
├── supabaseStorage.ts     # Funções do Supabase Storage
└── routes.ts              # Integração híbrida no upload

client/src/
├── lib/
│   ├── supabase.ts        # Cliente Supabase
│   └── galleryService.ts  # Service de galeria
└── pages/
    └── galeria-fas.tsx    # Componente atualizado
```

## Monitoramento

O sistema registra logs detalhados para debug:

- Upload bem-sucedido para Supabase Storage
- Fallback para base64 em caso de erro
- Tentativas de deletar do storage
- Configuração detectada ou não