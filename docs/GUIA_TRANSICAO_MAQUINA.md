# GUIA DE TRANSIÇÃO E RECUPERAÇÃO DE MÁQUINA - DOCFLOW

## 1. Links Oficiais
- Repositório GitHub: https://github.com/lbbarbo17-hue/DocFlow.git
- Painel Supabase: https://supabase.com/dashboard/project/vbqfgyyjryvxqafwkyhd
- Painel Render (API Online): https://dashboard.render.com
- Swagger Online: https://docflow-lesl.onrender.com/docs
- Painel Cloudflare R2: https://dash.cloudflare.com

---

## 2. Arquivos de Ambiente Necessários

### backend/.env
```env
DATABASE_URL=postgresql+asyncpg://postgres.vbqfgyyjryvxqafwkyhd:%23%40BrAy04An%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://vbqfgyyjryvxqafwkyhd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicWZneXlqcnl2eHFhZndreWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjEyMjEsImV4cCI6MjEwNjc5NzIyMX0.vB9QiXXFSeDKWHW3FXVgnYxW3JR8AZ3HsjSw3dUf2eI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicWZneXlqcnl2eHFhZndreWhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTIyMTIyMSwiZXhwIjoyMTA2Nzk3MjIxfQ.hb1HM4xshqxUT8PA7qKm0fFnzsyeYPO378sgv_enjVE
CLOUDFLARE_R2_BUCKET=docflow-documents
CLOUDFLARE_R2_ACCOUNT_ID=be293faff1e8dbc7c3206f4755219a3b
CLOUDFLARE_R2_ACCESS_KEY_ID=bbd60a10a14e8627670292f079946951
CLOUDFLARE_R2_SECRET_ACCESS_KEY=958fd377a2f21a0718f7dece12079e07a5810053fd90e683a1ba539c52ea9eb7
```

### frontend/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://vbqfgyyjryvxqafwkyhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZicWZneXlqcnl2eHFhZndreWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjEyMjEsImV4cCI6MjEwNjc5NzIyMX0.vB9QiXXFSeDKWHW3FXVgnYxW3JR8AZ3HsjSw3dUf2eI
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 3. Dados Globais de Autenticação
- SuperAdmin: admin@docflow.com.br
- Senha: Admin@DocFlow2026
- Tenant ID: 6a7eb67b-bddc-4ad1-8898-0106ff268ed5

---

## 4. Instruções de Setup na Máquina Nova
1. git clone https://github.com/lbbarbo17-hue/DocFlow.git
2. cd DocFlow
3. git checkout pre-atualizacao
4. Criar backend/.env e frontend/.env.local
5. Backend: python -m venv .venv && .venv\Scripts\pip install -r requirements.txt && .venv\Scripts\uvicorn app.main:app --reload --port 8000
6. Frontend: npm install && npm run dev
