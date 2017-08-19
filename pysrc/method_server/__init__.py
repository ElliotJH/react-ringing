import method_server.models
from . import db, methods


def main():
    database = db.Database()
    method_db = methods.MethodDatabase(database)
    results = method_db.find_methods("lincolnshire surprise major")
    print(results)