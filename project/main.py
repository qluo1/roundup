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
        # toc 
        handlers = [(r'/',TocHandler,dict(trackers=trackers))]
        # trackers 
        for t in trackers:
            name = t['name']
            tracker = t['tracker']
            url = t['url']
            #
            handlers.append((r"/%s/" % name,IndexHandler,dict(path=url, tracker=tracker)))
            handlers.append((r"/%s/api/(.*)" % name,APIHandler,dict(path=url,tracker=tracker)))
            handlers.append((r"/%s/auth/(.*)" % name,AuthHandler,dict(path=url, tracker=tracker)))

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
