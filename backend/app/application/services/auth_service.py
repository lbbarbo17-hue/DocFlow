import os
import uuid
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

class SupabaseAuthService:
    @staticmethod
    async def signup(email: str, password: str) -> Optional[uuid.UUID]:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            return None

        url = f"{SUPABASE_URL}/auth/v1/signup"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "password": password
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code in [200, 201]:
                data = response.json()
                user_id_str = data.get("id") or (data.get("user") or {}).get("id")
                if user_id_str:
                    return uuid.UUID(user_id_str)
            return None

    @staticmethod
    async def login(email: str, password: str) -> Dict[str, Any]:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Configuracoes do Supabase nao encontradas."
            )

        url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "email": email,
            "password": password
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciais invalidas no Supabase Auth."
                )
            return response.json()
