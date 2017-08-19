import re
from aiohttp import web

import method_server.models
from . import db, methods, json

def main():
    database = db.Database()
    method_db = methods.MethodDatabase(database)

    async def do_search(request):
        q = request.query.get('query')
        if not isinstance(q, str):
            return web.HTTPBadRequest(reason="Include a string query")

        if len(q) < 3:
            return web.HTTPBadRequest(reason="Must have at least 3 characters in the search string")
        search_string = re.sub('[^a-z ]', '', q.lower()) # abundance of caution
        return web.json_response({'methods' : method_db.find_methods(search_string)}, dumps=json.dumps)

    app = web.Application()
    app.router.add_get('/method', do_search)

    web.run_app(app, port=8081)
