import uuid
from datetime import date
from decimal import Decimal
import pytest
from pydantic import ValidationError
from app.domain.enums import StatusAluno, PerfilUsuario
from app.domain.schemas.aluno import AlunoCreate, AlunoUpdate
from app.domain.schemas.contrato import ContratoCreate, ContratoUpdate
from app.domain.schemas.usuario import UsuarioCreate, LoginRequest

def test_aluno_create_valid():
    aluno = AlunoCreate(
        nome="Beatriz Helena Ramos",
        cpf="111.444.777-35",
        email="beatriz@escola.sp.gov.br",
        matricula="MAT-2026-001",
        status=StatusAluno.ATIVO
    )
    assert aluno.nome == "Beatriz Helena Ramos"
    assert aluno.cpf == "11144477735"
    assert aluno.email == "beatriz@escola.sp.gov.br"
    assert aluno.matricula == "MAT-2026-001"
    assert aluno.status == StatusAluno.ATIVO
    assert aluno.turma_id is None

def test_aluno_create_invalid_email():
    with pytest.raises(ValidationError):
        AlunoCreate(
            nome="Aluno Invalido",
            cpf="12345678901",
            email="email-invalido-sem-arroba",
            matricula="MAT-001"
        )

def test_aluno_create_short_cpf():
    with pytest.raises(ValidationError):
        AlunoCreate(
            nome="Aluno Invalido",
            cpf="12345",
            email="aluno@teste.com",
            matricula="MAT-001"
        )

def test_aluno_update_partial():
    update_data = AlunoUpdate(
        nome="Beatriz Atualizada",
        ativo=False
    )
    assert update_data.nome == "Beatriz Atualizada"
    assert update_data.ativo is False
    assert update_data.cpf is None
    assert update_data.email is None

def test_contrato_create_valid():
    aluno_id = uuid.uuid4()
    contrato = ContratoCreate(
        aluno_id=aluno_id,
        numero_contrato="CTR-2026-999",
        data_inicio=date(2026, 2, 1),
        data_fim=date(2027, 2, 1),
        valor_bolsa=Decimal("1650.00")
    )
    assert contrato.aluno_id == aluno_id
    assert contrato.numero_contrato == "CTR-2026-999"
    assert contrato.valor_bolsa == Decimal("1650.00")
    assert contrato.data_inicio == date(2026, 2, 1)

def test_contrato_negative_allowance():
    aluno_id = uuid.uuid4()
    with pytest.raises(ValidationError):
        ContratoCreate(
            aluno_id=aluno_id,
            numero_contrato="CTR-FAIL",
            data_inicio=date(2026, 1, 1),
            data_fim=date(2026, 12, 31),
            valor_bolsa=Decimal("-100.00")
        )

def test_contrato_update_allowance_and_period():
    update = ContratoUpdate(
        valor_bolsa=Decimal("1800.00"),
        data_fim=date(2027, 6, 30)
    )
    assert update.valor_bolsa == Decimal("1800.00")
    assert update.data_fim == date(2027, 6, 30)
    assert update.data_inicio is None

def test_login_request_valid():
    login = LoginRequest(
        email="coordenador@docflow.com",
        senha="SenhaForte123!"
    )
    assert login.email == "coordenador@docflow.com"
    assert login.senha == "SenhaForte123!"

def test_login_request_invalid_email():
    with pytest.raises(ValidationError):
        LoginRequest(
            email="notanemail",
            senha="123"
        )

def test_usuario_create_valid():
    tenant_id = uuid.uuid4()
    usuario = UsuarioCreate(
        tenant_id=tenant_id,
        email="admin@docflow.com",
        nome="Administrador Geral",
        perfil=PerfilUsuario.ADMIN,
        senha="Password123!"
    )
    assert usuario.tenant_id == tenant_id
    assert usuario.perfil == PerfilUsuario.ADMIN
