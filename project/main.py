from conf import trackers
import roundup
from roundup import instance

import tornado
import tornado.httpserver
import tornado.web
from tornado.options import define, options, parse_command_line


define("port", default=8888, help="run on the given port", type=int)
define("debug", default=True, help="debug flag", type=bool)


from handlers import *

class Application(tornado.web.Application):

    def __init__(self,trackers,settings):
        self.trackers = trackers
        handlers = []
        for t in trackers:
            url = t['url']
            tracker = t['tracker']
            #
            handlers.append((r"/%s/" % url,IndexHandler,dict(tracker=tracker)))
            handlers.append((r"/%s/api/(.*)" % url,APIHandler,dict(tracker=tracker)))
            handlers.append((r"/%s/auth/(.*)" % url,AuthHandler,dict(tracker=tracker)))


        tornado.web.Application.__init__(self,handlers,**settings)


if __name__ == "__main__":

    from conf import settings
    parse_command_line()

    if options.debug:
        print "running in debug mode"
        settings.update(dict(
            autoreload=True,
            static_hash_cache=False,
            compiled_template_cache=False
            )
        )

    app = Application(trackers,settings)
    server = tornado.httpserver.HTTPServer(app)
    server.listen(options.port)
    tornado.ioloop.IOLoop.instance().start()
