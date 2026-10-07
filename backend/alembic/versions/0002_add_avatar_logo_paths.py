from alembic import op
import sqlalchemy as sa

revision = '0002_add_avatar_logo_paths'
down_revision = '0001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('alunos', sa.Column('avatar_path', sa.String(500), nullable=True))
    op.add_column('usuarios', sa.Column('avatar_path', sa.String(500), nullable=True))
    op.add_column('tenants', sa.Column('logo_path', sa.String(500), nullable=True))

def downgrade() -> None:
    op.drop_column('tenants', 'logo_path')
    op.drop_column('usuarios', 'avatar_path')
    op.drop_column('alunos', 'avatar_path')
