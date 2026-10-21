import asyncio
import os
import sys
import uuid
import httpx
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from app.infrastructure.database.session import check_database_connection
from app.application.services.storage_service import R2StorageService

async def run_diagnostic():
    print("=== TESTE ISOLADO DE CONEXOES & CRUD STORAGE ===")

    print("\n1. Testando conexao com Supabase PostgreSQL...")
    db_ok = await check_database_connection()
    if db_ok:
        print("[OK] Supabase PostgreSQL conectado com sucesso!")
    else:
        print("[FALHA] Nao foi possivel conectar ao Supabase PostgreSQL.")

    print("\n2. Testando conexao com Supabase Auth...")
    supabase_url = os.getenv("SUPABASE_URL", "")
    auth_ok = False
    if supabase_url:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(f"{supabase_url.rstrip('/')}/auth/v1/health")
                auth_ok = res.status_code in [200, 404, 401]
        except Exception:
            auth_ok = False
    if auth_ok:
        print(f"[OK] Supabase Auth ativo em: {supabase_url}")
    else:
        print("[FALHA] Supabase Auth inacessivel.")

    print("\n3. Testando Cloudflare R2 Storage (Bucket e Operacoes)...")
    storage = R2StorageService()
    r2_ok = storage.check_connection()
    if r2_ok:
        print(f"[OK] Cloudflare R2 bucket '{storage.default_bucket}' alcancavel via head_bucket!")
    else:
        print(f"[FALHA] Nao foi possivel alcancar o bucket '{storage.default_bucket}'.")

    if r2_ok:
        test_filename = f"tenants/test/diag_{uuid.uuid4().hex[:8]}.txt"
        test_content = b"DocFlow Connection Test"
        print(f"\n4. Executando CRUD de teste no R2: {test_filename}...")
        try:
            uploaded_path = storage.upload_file(
                file_bytes=test_content,
                file_path=test_filename,
                content_type="text/plain"
            )
            print(f"[OK] Upload no R2 efetuado: {uploaded_path}")

            presigned_url = storage.generate_download_url(file_path=uploaded_path, expiration_seconds=60)
            print(f"[OK] URL assinada gerada: {presigned_url[:60]}...")

            deleted = storage.delete_file(file_path=uploaded_path)
            if deleted:
                print(f"[OK] Arquivo temporario excluido do R2.")
            else:
                print(f"[AVISO] Nao foi possivel excluir o arquivo temporario.")
        except Exception as exc:
            print(f"[FALHA] Erro durante o CRUD no R2: {exc}")

    print("\n=== DIAGNOSTICO CONCLUIDO ===")

if __name__ == "__main__":
    asyncio.run(run_diagnostic())
