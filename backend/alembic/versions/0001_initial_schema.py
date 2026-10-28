from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("cnpj", sa.String(length=18), nullable=False),
        sa.Column("tipo", sa.Enum("INSTITUICAO", "EMPRESA", name="tipo_tenant_enum"), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tenants")),
        sa.UniqueConstraint("cnpj", name=op.f("uq_tenants_cnpj"))
    )
    op.create_index(op.f("ix_tenants_cnpj"), "tenants", ["cnpj"], unique=True)

    op.create_table(
        "instituicoes",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("razao_social", sa.String(length=255), nullable=False),
        sa.Column("nome_fantasia", sa.String(length=255), nullable=True),
        sa.Column("cnpj", sa.String(length=18), nullable=False),
        sa.Column("codigo_mec", sa.String(length=50), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_instituicoes_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_instituicoes"))
    )
    op.create_index(op.f("ix_instituicoes_tenant_id"), "instituicoes", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_instituicoes_cnpj"), "instituicoes", ["cnpj"], unique=False)

    op.create_table(
        "empresas",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("razao_social", sa.String(length=255), nullable=False),
        sa.Column("nome_fantasia", sa.String(length=255), nullable=True),
        sa.Column("cnpj", sa.String(length=18), nullable=False),
        sa.Column("ramo_atividade", sa.String(length=100), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_empresas_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_empresas"))
    )
    op.create_index(op.f("ix_empresas_tenant_id"), "empresas", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_empresas_cnpj"), "empresas", ["cnpj"], unique=False)

    op.create_table(
        "usuarios",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("perfil", sa.Enum("ADMIN", "COORDENADOR", "RH", "ESTUDANTE", name="perfil_usuario_enum"), nullable=False),
        sa.Column("supabase_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_usuarios_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_usuarios"))
    )
    op.create_index(op.f("ix_usuarios_tenant_id"), "usuarios", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_usuarios_email"), "usuarios", ["email"], unique=False)
    op.create_index(op.f("ix_usuarios_supabase_user_id"), "usuarios", ["supabase_user_id"], unique=False)

    op.create_table(
        "turmas",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instituicao_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("codigo", sa.String(length=50), nullable=False),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("semestre_referencia", sa.String(length=20), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["instituicao_id"], ["instituicoes.id"], name=op.f("fk_turmas_instituicao_id_instituicoes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_turmas_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_turmas"))
    )
    op.create_index(op.f("ix_turmas_tenant_id"), "turmas", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_turmas_instituicao_id"), "turmas", ["instituicao_id"], unique=False)

    op.create_table(
        "alunos",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("instituicao_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("empresa_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("turma_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("nome", sa.String(length=255), nullable=False),
        sa.Column("cpf", sa.String(length=14), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("matricula", sa.String(length=50), nullable=False),
        sa.Column("status", sa.Enum("ATIVO", "INATIVO", "CONCLUIDO", "TRANCADO", name="status_aluno_enum"), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_alunos_empresa_id_empresas"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["instituicao_id"], ["instituicoes.id"], name=op.f("fk_alunos_instituicao_id_instituicoes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_alunos_tenant_id_tenants"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["turma_id"], ["turmas.id"], name=op.f("fk_alunos_turma_id_turmas"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_alunos"))
    )
    op.create_index(op.f("ix_alunos_tenant_id"), "alunos", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_alunos_instituicao_id"), "alunos", ["instituicao_id"], unique=False)
    op.create_index(op.f("ix_alunos_empresa_id"), "alunos", ["empresa_id"], unique=False)
    op.create_index(op.f("ix_alunos_turma_id"), "alunos", ["turma_id"], unique=False)
    op.create_index(op.f("ix_alunos_cpf"), "alunos", ["cpf"], unique=False)
    op.create_index(op.f("ix_alunos_matricula"), "alunos", ["matricula"], unique=False)

    op.create_table(
        "contratos",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("aluno_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("empresa_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("instituicao_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("numero_contrato", sa.String(length=100), nullable=False),
        sa.Column("data_inicio", sa.Date(), nullable=False),
        sa.Column("data_fim", sa.Date(), nullable=False),
        sa.Column("valor_bolsa", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["aluno_id"], ["alunos.id"], name=op.f("fk_contratos_aluno_id_alunos"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_contratos_empresa_id_empresas"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["instituicao_id"], ["instituicoes.id"], name=op.f("fk_contratos_instituicao_id_instituicoes"), ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_contratos_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contratos"))
    )
    op.create_index(op.f("ix_contratos_tenant_id"), "contratos", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_contratos_aluno_id"), "contratos", ["aluno_id"], unique=False)
    op.create_index(op.f("ix_contratos_empresa_id"), "contratos", ["empresa_id"], unique=False)
    op.create_index(op.f("ix_contratos_instituicao_id"), "contratos", ["instituicao_id"], unique=False)

    op.create_table(
        "documentos",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("aluno_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tipo", sa.Enum("RG", "CPF", "COMPROVANTE_RESIDENCIA", "COMPROVANTE_MATRICULA", "CONTRATO_APRENDIZAGEM", "TERMO_COMPROMISSO_ESTAGIO", "OUTROS", name="tipo_documento_enum"), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("file_hash", sa.String(length=64), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("tamanho_bytes", sa.BigInteger(), nullable=False),
        sa.Column("status", sa.Enum("PENDENTE", "EM_ANALISE", "APROVADO", "RECUSADO", "EXPIRADO", name="status_documento_enum"), nullable=False),
        sa.Column("data_validade", sa.Date(), nullable=True),
        sa.Column("justificativa_recusa", sa.Text(), nullable=True),
        sa.Column("validado_por_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["aluno_id"], ["alunos.id"], name=op.f("fk_documentos_aluno_id_alunos"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_documentos_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_documentos"))
    )
    op.create_index(op.f("ix_documentos_tenant_id"), "documentos", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_documentos_aluno_id"), "documentos", ["aluno_id"], unique=False)
    op.create_index(op.f("ix_documentos_file_hash"), "documentos", ["file_hash"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("resource_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("resource_type", sa.String(length=100), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("detalhes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("timestamp_utc", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_audit_logs_tenant_id_tenants"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["usuarios.id"], name=op.f("fk_audit_logs_user_id_usuarios"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_logs"))
    )
    op.create_index(op.f("ix_audit_logs_tenant_id"), "audit_logs", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_resource_id"), "audit_logs", ["resource_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_timestamp_utc"), "audit_logs", ["timestamp_utc"], unique=False)

    op.execute("ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE instituicoes ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;")

def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("documentos")
    op.drop_table("contratos")
    op.drop_table("alunos")
    op.drop_table("turmas")
    op.drop_table("usuarios")
    op.drop_table("empresas")
    op.drop_table("instituicoes")
    op.drop_table("tenants")
    op.execute("DROP TYPE IF EXISTS status_documento_enum;")
    op.execute("DROP TYPE IF EXISTS tipo_documento_enum;")
    op.execute("DROP TYPE IF EXISTS status_aluno_enum;")
    op.execute("DROP TYPE IF EXISTS perfil_usuario_enum;")
    op.execute("DROP TYPE IF EXISTS tipo_tenant_enum;")
