import tornado.ioloop
import tornado.web


class TodoHandler(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header('Content-Type', 'application/json')

    def initialize(self, manager):
        self.todo_manager = manager

    def get(self):
        self.write({ "data": self.todo_manager.todo})

    def post(self):
        req_body = tornado.escape.json_decode(self.request.body)
        if "text" not in req_body or "id" not in req_body or "checked" not in req_body:
            raise tornado.web.HTTPError(log_message="Incomplete Body")
        self.todo_manager.todo.append(req_body)
        self.write({"data": self.todo_manager.todo})

    def put(self):
        req_body = tornado.escape.json_decode(self.request.body)
        if "text" not in req_body or "id" not in req_body or "checked" not in req_body:
        	raise tornado.web.HTTPError(log_message="Incomplete Body")
        for index, todo in enumerate(self.todo_manager.todo):
        	if todo["id"] == req_body["id"]:
        		self.todo_manager.todo[index] = req_body
        		break
        self.write({"data": self.todo_manager.todo})

    def delete(self):
        req_body = tornado.escape.json_decode(self.request.body)
        if "id" not in req_body:
            raise tornado.web.HTTPError(log_message="id or text missing")
        self.todo_manager.todo = list(filter(lambda x: req_body["id"] != x["id"] , self.todo_manager.todo))


class TodoManager(object):
    def __init__(self):
        self.todo = []


def make_app():
    return tornado.web.Application([
        (r"/todo", TodoHandler, dict(manager=TodoManager()))
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    tornado.ioloop.IOLoop.current().start()
