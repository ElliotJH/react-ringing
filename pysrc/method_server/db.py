import sqlalchemy
import sqlalchemy.ext.declarative
from sqlalchemy.orm import sessionmaker

from method_server.models import Model

__DEBUG__ = True


class Database:
    def __init__(self, cs='sqlite:///db.sqlite'):
        self.engine = sqlalchemy.create_engine(cs)
        Model.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

    def session(self):
        return self.Session()

