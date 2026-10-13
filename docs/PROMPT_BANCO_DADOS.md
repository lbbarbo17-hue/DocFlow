# Prompt de Inicialização da Infraestrutura de Banco de Dados — DocFlow (Supabase & DDD Lite)

> **Finalidade:** Prompt de diretrizes para o agente ou engenheiro de software configurar e implementar exclusivamente a camada de persistência e banco de dados do projeto DocFlow.

---

```markdown
Você atuará como Engenheiro de Software Sênior especialista em Supabase, PostgreSQL e SQLAlchemy 2.0 (Async).

Estamos estruturando a infraestrutura de banco de dados do projeto **DocFlow** seguindo os princípios de **DDD Lite**. O frontend já está em desenvolvimento e a camada de Web API ainda será implementada posteriormente. 

**ESCOPO E RESTRIÇÃO ESTRITA DE ATUAÇÃO:**
- Você deve atuar **EXCLUSIVAMENTE** naquilo que é vinculado ao **BANCO DE DADOS E PERSISTÊNCIA**.
- **NÃO crie ou altere** rotas de API HTTP, endpoints FastAPI, controllers web, telas ou componentes de frontend.
- Crie e edite unicamente os arquivos que compõem a fundação do banco de dados dentro da arquitetura (modelos ORM, conexão assíncrona, migrations/DDL, schemas de dados, interfaces e implementações de repositório com multi-tenancy e hooks de auditoria).

---

### Stack Tecnológica do Banco de Dados
- **Banco de Dados:** Supabase (PostgreSQL gerenciado, substituindo o antigo Neon)
- **Engine ORM:** SQLAlchemy 2.0 (Modo Assíncrono com driver `asyncpg`)
- **Pooling & Conexão:** Supabase Transaction/Session Pooler via Connection String assíncrona
- **Controle de Esquema / Migrations:** Alembic
- **Validação de Dados:** Pydantic v2
- **Segurança de Dados:** Row Level Security (RLS) habilitado nativamente no PostgreSQL

---

### Regras de Arquitetura e Negócio (OBRIGATÓRIAS)

1. **Multi-Tenancy por Isolamento Lógico:**
   - Todas as tabelas operacionais (`Usuario`, `Aluno`, `Documento`, `Turma`, `Contrato`, etc.) DEVEM possuir a coluna `tenant_id` (UUID).
   - Nenhuma query no repositório de persistência pode ser executada sem filtrar explicitamente pelo `tenant_id` do tenant ativo.

2. **IDs como UUIDv4 Nativo:**
   - Todas as Primary Keys (PKs) de todas as tabelas devem ser UUID gerados diretamente no banco de dados.

3. **Owner vs Mencionado:**
   - A entidade `Tenant` possui o campo `tipo` (Enum: `INSTITUICAO` ou `EMPRESA`).
   - Entidades vinculadas como `Empresa` e `Instituicao` servem como catálogos locais do Tenant.
   - O `Aluno` pertence a um Tenant (`tenant_id` = Owner/Escrita) e pode ter vínculos com `instituicao_id` e `empresa_id` (Mencionados/Leitura).

4. **Armazenamento de Metadados de Arquivos:**
   - O banco de dados NÃO armazena arquivos binários (arquivos ficam no Cloudflare R2).
   - A tabela `Documento` guarda estritamente os metadados: `storage_path`, `file_hash` (SHA-256), `mime_type`, `tamanho_bytes` e `status`.

5. **Auditoria Imutável (Append-Only):**
   - Configure a tabela `AuditLog` e um hook/evento do SQLAlchemy para interceptar inserções/alterações e registrar de forma append-only: `user_id`, `tenant_id`, `action`, `resource_id` e `ip_address`.

6. **Boas Práticas de Segurança no Supabase:**
   - As tabelas devem estar preparadas para que o Row Level Security (RLS) do Supabase permaneça ativado.
   - As configurações devem utilizar a connection string do pooler (`DATABASE_URL` assíncrona com `postgresql+asyncpg://...`), preservando as chaves de API (`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) devidamente isoladas.

7. **Estilo de Código Estrito:**
   - **NÃO inclua comentários dentro dos blocos de código.** O código deve ser limpo, expressivo, fortemente tipado e autoexplicativo, sem ruídos ou anotações inline.

---

### Entregáveis Exclusivos da Camada de Banco de Dados

1. **Configuração de Ambiente (`.env.example`):**
   - Defina as variáveis necessárias para a conexão com o Supabase (`DATABASE_URL` assíncrona para o pooler, `SUPABASE_URL`, `SUPABASE_ANON_KEY`).

2. **Infraestrutura de Conexão Assíncrona (`infrastructure/database/`):**
   - Criação da engine assíncrona (`AsyncEngine`), session maker (`async_sessionmaker`) e gerador de sessão (`get_db_session`).
   - Função utilitária de verificação de conexão (Health Check que executa `SELECT 1` assíncrono capturando erros adequadamente).

3. **Modelos Mapeados no SQLAlchemy (`infrastructure/database/models/`):**
   - `Tenant`, `Instituicao`, `Empresa`, `Usuario`, `Turma`, `Aluno`, `Contrato`, `Documento` e `AuditLog`, com todas as Foreign Keys, índices e UUIDs configurados.

4. **Schemas Pydantic de Banco/DTOs (`domain/schemas/` ou `schemas/`):**
   - Schemas de Criação e Leitura para `Aluno` e `Documento`.

5. **Contratos e Implementações de Repositório (`domain/repositories/` e `infrastructure/repositories/`):**
   - Interface `IRepository` / `IAlunoRepository` e implementação concreta `SQLAlchemyAlunoRepository`, garantindo que métodos como `get_by_id` e listagens exijam obrigatoriamente o parâmetro `tenant_id`.

6. **Configuração de Migrations (Alembic):**
   - Arquivo `alembic.ini` e `env.py` configurados para carregar os modelos assincronamente e gerar migrações para o Supabase.

Apresente os arquivos estruturados rigorosamente dentro do padrão de pastas DDD Lite, contendo apenas o que é estritamente vinculado à arquitetura de banco de dados e persistência, sem comentários dentro do código.
```
