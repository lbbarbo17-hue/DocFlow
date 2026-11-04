import re

def validate_and_sanitize_cpf(raw_cpf: str) -> str:
    if not raw_cpf or not isinstance(raw_cpf, str):
        raise ValueError("CPF e obrigatorio e deve ser uma string.")

    cpf = re.sub(r"\D", "", raw_cpf)

    if len(cpf) != 11:
        raise ValueError("CPF deve conter exatamente 11 digitos numericos.")

    if len(set(cpf)) == 1:
        raise ValueError("CPF invalido: sequencia de digitos repetidos.")

    soma_1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    resto_1 = (soma_1 * 10) % 11
    digito_1 = 0 if resto_1 >= 10 else resto_1
    if digito_1 != int(cpf[9]):
        raise ValueError("CPF invalido: primeiro digito verificador incorreto.")

    soma_2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    resto_2 = (soma_2 * 10) % 11
    digito_2 = 0 if resto_2 >= 10 else resto_2
    if digito_2 != int(cpf[10]):
        raise ValueError("CPF invalido: segundo digito verificador incorreto.")

    return cpf

def validate_and_sanitize_cnpj(raw_cnpj: str) -> str:
    if not raw_cnpj or not isinstance(raw_cnpj, str):
        raise ValueError("CNPJ e obrigatorio e deve ser uma string.")

    cnpj = re.sub(r"[^A-Za-z0-9]", "", raw_cnpj).upper()

    if len(cnpj) != 14:
        raise ValueError("CNPJ deve conter exatamente 14 caracteres alfanumericos.")

    if not cnpj[:12].isalnum():
        raise ValueError("Os primeiros 12 caracteres do CNPJ devem ser alfanumericos.")

    if not cnpj[12:].isdigit():
        raise ValueError("Os dois ultimos caracteres do CNPJ devem ser digitos numericos verificadores.")

    if len(set(cnpj)) == 1:
        raise ValueError("CNPJ invalido: sequencia de caracteres repetidos.")

    multipliers_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma_1 = sum((ord(cnpj[i]) - 48) * multipliers_1[i] for i in range(12))
    resto_1 = soma_1 % 11
    digito_1 = 0 if resto_1 < 2 else 11 - resto_1
    if digito_1 != int(cnpj[12]):
        raise ValueError("CNPJ invalido: primeiro digito verificador incorreto.")

    multipliers_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    soma_2 = sum((ord(cnpj[i]) - 48) * multipliers_2[i] for i in range(12)) + (digito_1 * 2)
    resto_2 = soma_2 % 11
    digito_2 = 0 if resto_2 < 2 else 11 - resto_2
    if digito_2 != int(cnpj[13]):
        raise ValueError("CNPJ invalido: segundo digito verificador incorreto.")

    return cnpj
