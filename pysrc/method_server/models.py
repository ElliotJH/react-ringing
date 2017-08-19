import sqlalchemy
import sqlalchemy.ext.declarative
import sqlalchemy.orm

Model = sqlalchemy.ext.declarative.declarative_base()

import sqlalchemy
import sqlalchemy.ext.declarative
import sqlalchemy.orm

Model = sqlalchemy.ext.declarative.declarative_base()


class Method(Model):
    """A method with its notation"""
    __tablename__ = 'method'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    notation = sqlalchemy.Column(sqlalchemy.String)

    method_set_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('method_set.id'))
    method_set = sqlalchemy.orm.relationship("MethodSet", back_populates="methods")

    def __repr__(self):
        return f"Method(id={self.id}, name={self.name}, method_set={self.method_set.name!r}, notation={self.notation!r})"

class MethodSet(Model):
    """A method collection"""
    __tablename__ = 'method_set'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    stage = sqlalchemy.Column(sqlalchemy.Integer)
    methods = sqlalchemy.orm.relationship("Method")

    def __repr__(self):
        return f"MethodSet({self.id}, {self.name!r}, {self.stage})"