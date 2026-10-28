import asyncio
import os
import uuid
import httpx
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

ADMIN_EMAIL = "admin@docflow.com.br"
ADMIN_PASSWORD = "Admin@DocFlow2026"
ADMIN_NOME = "Administrador DocFlow"
TENANT_ID = "6a7eb67b-bddc-4ad1-8898-0106ff268ed5"


async def get_or_create_supabase_user() -> str:
    admin_headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        list_resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=admin_headers,
            params={"page": 1, "per_page": 100},
        )

        existing_uid = None
        if list_resp.status_code == 200:
            data = list_resp.json()
            users = data if isinstance(data, list) else data.get("users", [])
            for u in users:
                if u.get("email") == ADMIN_EMAIL:
                    existing_uid = u.get("id")
                    print(f"[INFO] Admin ja existe no Supabase Auth: {existing_uid}")
                    break

        if existing_uid:
            update_resp = await client.put(
                f"{SUPABASE_URL}/auth/v1/admin/users/{existing_uid}",
                headers=admin_headers,
                json={"password": ADMIN_PASSWORD, "email_confirm": True},
            )
            if update_resp.status_code == 200:
                print(f"[OK] Senha do admin atualizada no Supabase Auth.")
            else:
                print(f"[WARN] Nao foi possivel atualizar senha: {update_resp.text}")
            return existing_uid

        create_resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=admin_headers,
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "email_confirm": True,
            },
        )
        if create_resp.status_code in [200, 201]:
            new_uid = create_resp.json().get("id")
            print(f"[OK] Admin criado no Supabase Auth: {new_uid}")
            return new_uid
        else:
            raise RuntimeError(f"Falha ao criar admin: {create_resp.status_code} {create_resp.text}")


async def sync_db(supabase_uid: str):
    import sqlalchemy as sa

    engine = sa.create_engine(DATABASE_URL.replace("postgresql+asyncpg", "postgresql"))
    with engine.connect() as conn:
        result = conn.execute(
            sa.text("SELECT id, supabase_user_id FROM usuarios WHERE email = :email"),
            {"email": ADMIN_EMAIL},
        ).fetchone()

        if result is None:
            conn.execute(
                sa.text(
                    "INSERT INTO usuarios (id, tenant_id, email, nome, perfil, supabase_user_id, ativo) "
                    "VALUES (:id, :tid, :email, :nome, 'ADMIN', :uid, true)"
                ),
                {
                    "id": str(uuid.uuid4()),
                    "tid": TENANT_ID,
                    "email": ADMIN_EMAIL,
                    "nome": ADMIN_NOME,
                    "uid": supabase_uid,
                },
            )
            conn.commit()
            print("[OK] Admin inserido na tabela usuarios do banco.")
        else:
            row_id, current_uid = result
            if str(current_uid) != supabase_uid:
                conn.execute(
                    sa.text("UPDATE usuarios SET supabase_user_id = :uid WHERE id = :id"),
                    {"uid": supabase_uid, "id": str(row_id)},
                )
                conn.commit()
                print(f"[OK] supabase_user_id atualizado: {current_uid} -> {supabase_uid}")
            else:
                print(f"[OK] Banco ja esta sincronizado. supabase_user_id: {current_uid}")


async def verify_login():
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={"apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json"},
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        if resp.status_code == 200:
            print(f"[OK] Login direto no Supabase Auth: SUCESSO")
        else:
            print(f"[ERRO] Login falhou: {resp.status_code} {resp.text}")


async def main():
    print("=== Fix Admin Auth ===")
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("[ERRO] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY nao configurados no .env")
        return

    supabase_uid = await get_or_create_supabase_user()

    if DATABASE_URL:
        try:
            await sync_db(supabase_uid)
        except Exception as e:
            print(f"[WARN] Nao foi possivel sincronizar o banco: {e}")
    else:
        print("[WARN] DATABASE_URL nao configurado, pulando sync do banco.")

    await verify_login()
    print("=== Concluido ===")


if __name__ == "__main__":
    asyncio.run(main())
