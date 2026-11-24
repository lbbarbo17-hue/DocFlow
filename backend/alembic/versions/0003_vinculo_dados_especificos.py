from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0003_vinculo_dados_especificos"
down_revision: Union[str, None] = "0002_add_avatar_logo_paths"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE tipo_documento_enum ADD VALUE IF NOT EXISTS 'APOLICE_SEGURO';")

    tipo_vinculo_enum = postgresql.ENUM("APRENDIZ", "ESTAGIARIO", name="tipo_vinculo_enum")
    tipo_vinculo_enum.create(op.get_bind(), checkfirst=True)

    op.add_column("instituicoes", sa.Column("cidade", sa.String(length=120), nullable=True))
    op.add_column("empresas", sa.Column("cidade", sa.String(length=120), nullable=True))

    op.add_column("usuarios", sa.Column("instituicao_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("usuarios", sa.Column("empresa_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        op.f("fk_usuarios_instituicao_id_instituicoes"),
        "usuarios",
        "instituicoes",
        ["instituicao_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        op.f("fk_usuarios_empresa_id_empresas"),
        "usuarios",
        "empresas",
        ["empresa_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(op.f("ix_usuarios_instituicao_id"), "usuarios", ["instituicao_id"], unique=False)
    op.create_index(op.f("ix_usuarios_empresa_id"), "usuarios", ["empresa_id"], unique=False)

    op.add_column(
        "alunos",
        sa.Column(
            "tipo_vinculo",
            postgresql.ENUM("APRENDIZ", "ESTAGIARIO", name="tipo_vinculo_enum", create_type=False),
            server_default="APRENDIZ",
            nullable=False,
        ),
    )

    op.create_table(
        "dados_aprendiz",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("aluno_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("numero_ctps", sa.String(length=50), nullable=True),
        sa.Column("serie_ctps", sa.String(length=20), nullable=True),
        sa.Column("cbo", sa.String(length=20), nullable=True),
        sa.Column("curso_aprendizagem", sa.String(length=255), nullable=True),
        sa.Column("numero_contrato_aprendizagem", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["aluno_id"], ["alunos.id"], name=op.f("fk_dados_aprendiz_aluno_id_alunos"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_dados_aprendiz_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_dados_aprendiz")),
        sa.UniqueConstraint("aluno_id", name=op.f("uq_dados_aprendiz_aluno_id")),
    )
    op.create_index(op.f("ix_dados_aprendiz_tenant_id"), "dados_aprendiz", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_dados_aprendiz_aluno_id"), "dados_aprendiz", ["aluno_id"], unique=True)

    op.create_table(
        "dados_estagiario",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("aluno_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("numero_tce", sa.String(length=100), nullable=True),
        sa.Column("apolice_seguro", sa.String(length=100), nullable=True),
        sa.Column("seguradora", sa.String(length=255), nullable=True),
        sa.Column("supervisor_empresa", sa.String(length=255), nullable=True),
        sa.Column("curso_superior_tecnico", sa.String(length=255), nullable=True),
        sa.Column("semestre_atual", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["aluno_id"], ["alunos.id"], name=op.f("fk_dados_estagiario_aluno_id_alunos"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tenant_id"], ["tenants.id"], name=op.f("fk_dados_estagiario_tenant_id_tenants"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_dados_estagiario")),
        sa.UniqueConstraint("aluno_id", name=op.f("uq_dados_estagiario_aluno_id")),
    )
    op.create_index(op.f("ix_dados_estagiario_tenant_id"), "dados_estagiario", ["tenant_id"], unique=False)
    op.create_index(op.f("ix_dados_estagiario_aluno_id"), "dados_estagiario", ["aluno_id"], unique=True)

    op.execute("ALTER TABLE dados_aprendiz ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE dados_estagiario ENABLE ROW LEVEL SECURITY;")


def downgrade() -> None:
    op.drop_table("dados_estagiario")
    op.drop_table("dados_aprendiz")
    op.drop_column("alunos", "tipo_vinculo")
    op.drop_index(op.f("ix_usuarios_empresa_id"), table_name="usuarios")
    op.drop_index(op.f("ix_usuarios_instituicao_id"), table_name="usuarios")
    op.drop_constraint(op.f("fk_usuarios_empresa_id_empresas"), "usuarios", type_="foreignkey")
    op.drop_constraint(op.f("fk_usuarios_instituicao_id_instituicoes"), "usuarios", type_="foreignkey")
    op.drop_column("usuarios", "empresa_id")
    op.drop_column("usuarios", "instituicao_id")
    op.drop_column("empresas", "cidade")
    op.drop_column("instituicoes", "cidade")
    postgresql.ENUM("APRENDIZ", "ESTAGIARIO", name="tipo_vinculo_enum").drop(op.get_bind(), checkfirst=True)
