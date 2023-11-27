"""Added token to annotation association

Revision ID: 92fb2e4d05d0
Revises: c6d0153a3b44
Create Date: 2023-11-18 22:58:10.802332

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '92fb2e4d05d0'
down_revision = 'c6d0153a3b44'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('token', schema=None) as batch_op:
        batch_op.create_unique_constraint(None, ['word'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('token', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='unique')

    # ### end Alembic commands ###
