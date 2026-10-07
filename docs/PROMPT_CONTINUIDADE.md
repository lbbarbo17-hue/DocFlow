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

### 3. Próximos Passos Prioritários: Conexão do Frontend com a API Real

O frontend já foi sincronizado com a branch `develop` (todas as 18 rotas compiladas e validadas), e o backend conta com 29 endpoints ativos no Swagger integrando Supabase e Cloudflare R2. Os dois conteúdos prioritários a serem executados quando retomarmos são:

#### FRENTE 1: Criação do Cliente HTTP Centralizado (`frontend/src/lib/api.ts`)
1. **Configuração Base:**
   - Criar `frontend/src/lib/api.ts` apontando para `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'`.
2. **Interceptação de Headers Obrigatórios:**
   - Injeção automática do Bearer token JWT extraído da sessão/localStorage no header `Authorization`.
   - Injeção do header de isolamento multi-tenant `X-Tenant-ID` em todas as requisições autenticadas.
3. **Tratamento Padronizado:**
   - Tratamento de status 401 (redirecionamento automático para `/login`).
   - Tratamento de erros 422 e 400 com repasse das mensagens da API para os toasts do `AppContext`.

#### FRENTE 2: Substituição dos Mocks pelas Chamadas Reais da API
1. **Fluxo Real de Autenticação (`frontend/src/app/login/page.tsx`):**
   - Ligar o formulário ao endpoint `POST /api/v1/auth/login`.
   - Armazenar o `access_token` retornado e chamar `GET /api/v1/auth/me` para carregar o perfil e o `tenant_id` real do usuário logado.
   - Redirecionar para o painel correspondente de acordo com o perfil retornado (`ESTUDANTE`, `COORDENADOR`, `ADMIN`).
2. **Painel do Estudante (`frontend/src/app/estudante/checklist/page.tsx` & `enviar/page.tsx`):**
   - Listar documentos reais do aluno chamando `GET /api/v1/documentos/aluno/{aluno_id}`.
   - Realizar o envio real de PDFs e fotos chamando `POST /api/v1/documentos/upload` com gravação direta no bucket do Cloudflare R2.
   - Gerar links de visualização com URLs assinadas via `GET /api/v1/documentos/{id}/download-url`.
3. **Painel do Coordenador (`frontend/src/app/coordenador/dossies/page.tsx` & dashboard):**
   - Buscar as turmas reais via `GET /api/v1/turmas` e o cálculo analítico de conformidade via `GET /api/v1/turmas/{turma_id}/conformidade`.
   - Permitir que o coordenador aprove ou recuse documentos em tempo real via `POST /api/v1/documentos/{id}/validate`.

---

### 4. Como Executar e Validar
1. Iniciar o backend:
   ```bash
   cd backend
   .venv\Scripts\uvicorn app.main:app --reload --port 8000
   ```
2. Iniciar o frontend:
   ```bash
   cd frontend
   npm run dev
   ```
3. Acessar `http://localhost:3000` e validar as telas interagindo diretamente com os dados reais do Supabase e Cloudflare R2!
```
