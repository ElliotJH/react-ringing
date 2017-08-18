import method_server.models
from . import db, methods


def main():
    database = db.Database()
    method_db = methods.MethodDatabase(database)
    method_db.update()