"""Added token to annotation association

Revision ID: c6d0153a3b44
Revises: ce5ddf79c2c0
Create Date: 2023-11-18 21:15:47.202355

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c6d0153a3b44'
down_revision = 'ce5ddf79c2c0'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('token', schema=None) as batch_op:
        batch_op.add_column(sa.Column('annotation_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'annotation', ['annotation_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('token', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('annotation_id')

    # ### end Alembic commands ###
