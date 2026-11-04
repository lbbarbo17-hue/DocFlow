import pytest
from app.application.services.file_validator import (
    validate_magic_bytes,
    compute_file_hash_and_size,
    MAX_FILE_SIZE_BYTES
)

def test_validate_magic_bytes_pdf():
    pdf_header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3"
    mime = validate_magic_bytes(pdf_header)
    assert mime == "application/pdf"

def test_validate_magic_bytes_jpeg():
    jpeg_header = b"\xff\xd8\xff\xe0\x00\x10JFIF"
    mime = validate_magic_bytes(jpeg_header)
    assert mime == "image/jpeg"

def test_validate_magic_bytes_png():
    png_header = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
    mime = validate_magic_bytes(png_header)
    assert mime == "image/png"

def test_validate_magic_bytes_invalid():
    invalid_header = b"MZ\x90\x00\x03\x00\x00\x00"
    with pytest.raises(ValueError, match="Assinatura binaria invalida"):
        validate_magic_bytes(invalid_header)

def test_compute_file_hash_and_size_valid():
    content = b"%PDF-1.7\nSample document content"
    sha256, size, mime = compute_file_hash_and_size(content)
    assert mime == "application/pdf"
    assert size == len(content)
    assert len(sha256) == 64
    assert isinstance(sha256, str)

def test_compute_file_hash_and_size_exceeds_max_size():
    oversized_content = b"%PDF-" + (b"0" * (MAX_FILE_SIZE_BYTES + 10))
    with pytest.raises(ValueError, match="Arquivo excede o limite maximo"):
        compute_file_hash_and_size(oversized_content)
