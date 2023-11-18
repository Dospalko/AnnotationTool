"""Added favorite to annotations

Revision ID: ce5ddf79c2c0
Revises: ac749de9a8ef
Create Date: 2023-11-18 12:47:52.671469

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ce5ddf79c2c0'
down_revision = 'ac749de9a8ef'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('annotation', schema=None) as batch_op:
        batch_op.add_column(sa.Column('favorite', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('annotation', schema=None) as batch_op:
        batch_op.drop_column('favorite')

    # ### end Alembic commands ###
