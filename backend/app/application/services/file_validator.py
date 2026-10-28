import hashlib
from typing import Tuple

MAGIC_BYTES = {
    b"%PDF-": "application/pdf",
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png"
}

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

def validate_magic_bytes(header: bytes) -> str:
    for signature, mime in MAGIC_BYTES.items():
        if header.startswith(signature):
            return mime
    raise ValueError("Assinatura binaria invalida. Sao aceitos apenas arquivos PDF, JPEG ou PNG.")

def compute_file_hash_and_size(content: bytes) -> Tuple[str, int, str]:
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise ValueError("Arquivo excede o limite maximo de 10 MB.")

    mime_type = validate_magic_bytes(content[:16])
    sha256_hash = hashlib.sha256(content).hexdigest()
    return sha256_hash, len(content), mime_type
