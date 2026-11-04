import pytest
from app.application.services.document_validators import (
    validate_and_sanitize_cpf,
    validate_and_sanitize_cnpj
)

def test_validate_cpf_valid():
    cleaned = validate_and_sanitize_cpf("111.444.777-35")
    assert cleaned == "11144477735"

def test_validate_cpf_already_clean():
    cleaned = validate_and_sanitize_cpf("11144477735")
    assert cleaned == "11144477735"

def test_validate_cpf_invalid_length():
    with pytest.raises(ValueError, match="11 digitos"):
        validate_and_sanitize_cpf("123.456.78-9")

def test_validate_cpf_repeated_digits():
    with pytest.raises(ValueError, match="sequencia de digitos repetidos"):
        validate_and_sanitize_cpf("111.111.111-11")

def test_validate_cpf_invalid_first_digit():
    with pytest.raises(ValueError, match="primeiro digito verificador"):
        validate_and_sanitize_cpf("11144477795")

def test_validate_cpf_invalid_second_digit():
    with pytest.raises(ValueError, match="segundo digito verificador"):
        validate_and_sanitize_cpf("11144477739")

def test_validate_cnpj_valid_numeric():
    cleaned = validate_and_sanitize_cnpj("00.000.000/0001-91")
    assert cleaned == "00000000000191"

def test_validate_cnpj_valid_alphanumeric():
    cleaned = validate_and_sanitize_cnpj("AB.123.456/0001-10")
    assert cleaned == "AB123456000110"

def test_validate_cnpj_alphanumeric_lowercase():
    cleaned = validate_and_sanitize_cnpj("ab.123.456/0001-10")
    assert cleaned == "AB123456000110"

def test_validate_cnpj_repeated_digits():
    with pytest.raises(ValueError, match="sequencia de caracteres repetidos"):
        validate_and_sanitize_cnpj("22.222.222/2222-22")

def test_validate_cnpj_invalid_check_digit():
    with pytest.raises(ValueError, match="digito verificador"):
        validate_and_sanitize_cnpj("00.000.000/0001-99")

def test_validate_cnpj_alphanumeric_invalid_check_digit():
    with pytest.raises(ValueError, match="digito verificador"):
        validate_and_sanitize_cnpj("AB.123.456/0001-99")

def test_validate_cnpj_non_numeric_check_digits():
    with pytest.raises(ValueError, match="digitos numericos verificadores"):
        validate_and_sanitize_cnpj("AB.123.456/0001-1A")
