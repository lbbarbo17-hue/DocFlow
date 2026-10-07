# Prompt de Continuidade do Projeto DocFlow (Para Próxima Sessão / Conta)

> **Instruções de Uso:** Caso precise abrir uma nova conversa ou usar outra conta de IA, basta copiar e colar todo o bloco abaixo diretamente no chat. Ele contém o estado exato do projeto, o histórico do que foi feito e os próximos passos imediatos.

---

```markdown
Você atuará como Engenheiro de Software Sênior especialista em FastAPI, Python assíncrono, SQLAlchemy 2.0, Supabase (PostgreSQL) e Next.js.

Estamos dando continuidade ao desenvolvimento do projeto **DocFlow** (Plataforma B2B SaaS para guarda e gestão documental de aprendizes e estagiários sob o padrão DDD Lite).

---

### 1. Estado Atual do Projeto e O Que Já Está Pronto

O repositório já possui uma infraestrutura robusta, testada e conectada ao Supabase:

1. **Banco de Dados (Supabase PostgreSQL):**
   - Região: São Paulo (`sa-east-1`), conectado via Connection Pooler (porta 6543) com `statement_cache_size: 0`.
   - 9 tabelas criadas via Alembic (`alembic upgrade head`) com Row Level Security (RLS) habilitado:
     `tenants`, `instituicoes`, `empresas`, `usuarios`, `turmas`, `alunos`, `contratos`, `documentos`, `audit_logs`.
   - Chaves primárias em UUIDv4 nativo (`gen_random_uuid()`) e isolamento lógico por `tenant_id` em todas as tabelas.

2. **Web API RESTful (FastAPI + Swagger UI):**
   - Servidor FastAPI configurado em `backend/app/main.py` com CORS liberado para o frontend (`localhost:3000`) e Swagger ativo em `http://localhost:8000/docs` (com 29 operações mapeadas cobrindo 100% das entidades).
   - **Módulos Já Implementados e Testados:**
     - `Health:` `GET /api/v1/health` (valida conexão assíncrona com Supabase via `SELECT 1`).
     - `Tenants:` `POST /api/v1/tenants`, `GET /api/v1/tenants`, `GET /api/v1/tenants/{id}`, `POST /tenants/{id}/logo`, `GET /tenants/{id}/logo-url`.
     - `Alunos:` CRUD completo (`POST`, `GET`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}`), `POST /{id}/avatar`, `GET /{id}/avatar-url`.
     - `Documentos (Bloco 1):` 
       - `POST /api/v1/documentos/upload`: Upload multipart real integrado ao Cloudflare R2 com validação de *Magic Bytes* (PDF, JPEG, PNG) e gravação de metadados.
       - `GET /api/v1/documentos/aluno/{aluno_id}`: Listagem dos documentos de um aluno.
       - `GET /api/v1/documentos/{documento_id}`: Detalhes do documento.
       - `GET /api/v1/documentos/{documento_id}/download-url`: Geração de URL assinada temporária para download seguro direto do Cloudflare R2.
       - `POST /api/v1/documentos/{documento_id}/validate`: Aprovação ou recusa com justificativa obrigatória.
     - `Turmas (Bloco 2):`
       - CRUD completo de turmas + `GET /api/v1/turmas/{turma_id}/conformidade` (taxa de conformidade de dossiês).
     - `Autenticação & Usuários (Bloco 3):`
       - `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /auth/me/avatar`, `GET /auth/me/avatar-url`.
     - `Instituições Formadoras & Empresas Parceiras:`
       - `POST /api/v1/instituicoes`, `GET /api/v1/instituicoes`, `GET /api/v1/instituicoes/{id}`, `PATCH`, `DELETE`.
       - `POST /api/v1/empresas`, `GET /api/v1/empresas`, `GET /api/v1/empresas/{id}`, `PATCH`, `DELETE`.
     - `Contratos de Estágio / Aprendizagem:`
       - `POST /api/v1/contratos`, `GET /api/v1/contratos`, `GET /api/v1/contratos/aluno/{aluno_id}`, `GET /{id}`, `PATCH`, `DELETE`.

3. **Frontend (Next.js 15):**
   - Todas as páginas desenvolvidas e compilando (`npm run build` gerou as 18 rotas com sucesso).
   - Variáveis configuradas em `frontend/.env.local` e dependências instaladas.

---

### 2. Regras Estritas de Desenvolvimento (OBRIGATÓRIAS)

1. **Clean Code Estrito:** **NÃO inclua comentários dentro dos blocos de código Python ou TypeScript.** O código deve ser limpo, expressivo, fortemente tipado e autoexplicativo, sem comentários inline (`#`).
2. **Multi-Tenancy Obrigatório:** Nenhuma consulta ou mutação pode ser executada sem filtrar explicitamente pelo `tenant_id` (injetado via header `X-Tenant-ID` ou token JWT).
3. **Arquitetura DDD Lite:**
   - `domain/`: entidades, enums, schemas e contratos abstratos de repositório.
   - `application/`: serviços e casos de uso orquestradores.
   - `infrastructure/`: conexões de banco, implementações de repositório e controllers/rotas da Web API.

---

### 3. Sua Próxima Tarefa Imediata: BLOCO 4 — Conectar o Frontend Next.js à API Real

Os Blocos 1 (Documentos), 2 (Turmas) e 3 (Autenticação) já estão concluídos e testados com sucesso no backend. Sua tarefa agora é **conectar o Frontend às rotas reais**:

1. **Criar Cliente de API (`frontend/src/lib/api.ts`):**
   - Função utilitária com `fetch` configurada para `http://localhost:8000/api/v1`.
   - Injeção automática do `X-Tenant-ID` ou token JWT no header.

2. **Substituir Mocks pelas Chamadas Reais:**
   - Na tela do Estudante (`frontend/src/app/estudante/checklist/page.tsx`): buscar documentos reais da API.
   - Na tela do Coordenador (`frontend/src/app/coordenador/dossies/page.tsx` ou dashboard): buscar turmas e conformidade da API.

3. **Verificação:**
   - Rodar `npm run dev` no frontend e confirmar a exibição dos dados reais do Supabase nas telas!

Por favor, execute essas etapas com base nessas diretrizes!
```
