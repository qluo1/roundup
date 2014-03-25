import roundup
from roundup import hyperdb

## helper
class NodeProxy(object):
    """
        helper class for lookup value/label in template rendering
    """

    def __init__(self,node):
        assert node.cl.db
        self.node = node
        self.db = node.cl.db
        self.props = node.cl.getprops()

    def __getitem__(self,field):
        # assert field in self.props.keys(),"unknown field: %s" % field

        try:
            p_kl = self.props[field]
            if isinstance(p_kl,hyperdb.Link):
                _classname = p_kl.classname
                _cl = self.db.getclass(_classname)
                return _cl.get(self.node[field],_cl.key)
            if isinstance(p_kl,hyperdb.Multilink):
                _classname = p_kl.classname
                _cl = self.db.getclass(_classname)
                # return list of uderlying items
                return [NodeProxy(_cl.getnode(v)) for v in self.node[field] ]
        except KeyError:
            if field in ("history",):
                return self.node.history
            print "unknown field: %s" % field
        except IndexError:
            return ""

        return self.node[field]

    def __getattr__(self,field):
        # print "getattr", field
        return self.__getitem__(field)


import tornado.escape

class FlashMessageMixin(object):
    """ 
        simple flash message mixin, cookie based
    """

    def set_flash_message(self, key, message):
        if not isinstance(message, basestring):
            message = tornado.escape.json_encode(message)
        self.set_secure_cookie('flash_msg_%s' % key, message)

    def get_flash_message(self, key):
        val = self.get_secure_cookie('flash_msg_%s' % key)
        self.clear_cookie('flash_msg_%s' % key)
        
        if val is not None and not isinstance(val, basestring):
            val = tornado.escape.json_decode(val)
        return val

