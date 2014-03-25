import tornado
import tornado.web

from utils.helper import FlashMessageMixin, NodeProxy

class User(object):

    def __init__(self,db,username):
        """ """
        self.db = db
        self.username = username
        self.uid = self.db.user.lookup(username)

    def hasRole(self,role):
        return self.db.user.has_Role(self.uid,role)

    def hasPermission(self,perm,item=None):
        return self.db.security.hasPermission(perm,self.uid,item)

    def is_view_ok(self,item,itemid):
        if self.itemid:
            return self.db.security.hasPermission('View',self.uid,item,None,itemid)

        return self.db.security.hasPermission('View',self.uid,item)

    def is_edit_ok(self,item,itemid):
        return self.db.security.hasPermission('Edit',self.uid,item,None,itemid)

class Context(object):

    def __init__(self,user,item,itemid=None):
        """
            
        """
        self.user = user
        self.db = user.db
        self.item = item
        self.itemid = itemid

    def is_view_ok(self):
        """ """
        return self.user.is_view_ok(self.item,self.itemid)

    def is_edit_ok(self):
        """ """
        if self.itemid:
            return self.user.is_edit_ok(self.item,self.itemid)
        return False

    def list(self):
        if not self.itemid:
            kl = self.db.getclass(self.item)
            return [ NodeProxy(kl.getnode(i)) for i in kl.list()]
    
    def filter(self,filterspec):
        """
            filterspec like dict(status=["1","2"])
        """
        if not self.itemid:
            kl = self.db.getclass(self.item)
            return [ NodeProxy(kl.getnode(i)) for i in kl.filter(None,filterspec)]

    def __getattr__(self,field):
        if self.itemid:
            kl = self.db.getclass(self.item)
            return NodeProxy(kl.getnode(self.itemid))[field]


class SetupHandler(tornado.web.RequestHandler,FlashMessageMixin):

    def prepare(self):
        """ """
        self.tracker = self.application.tracker
        self.db = self.tracker.open("admin")
        self.username = self.get_secure_cookie("user") or "anonymous"

        # re-open db with current user
        self.uid = self.db.user.lookup(self.username)
        self.db = self.tracker.open(self.uid)
        self.db.setCurrentUser(self.username)
        self.db.tx_Source = "web"
        self.set_secure_cookie("user",self.username)

        ## web context
        user =  User(self.db,self.username)
        
        # default context object
        self.context = {
            'user': user,
            'context': Context(user,"issue"),
            'login_url': self.get_login_url(),
            'ok_message': self.get_flash_message("ok"),
            'error_message': self.get_flash_message("error"),
        }

    def on_finish(self):
        self.db.close()



class IndexHandler(SetupHandler):

    def get(self):

        print self.path_args, self.path_kwargs
        self.render("index.html",**self.context)

class APIHandler(SetupHandler):
    def get(self,path):
        print path, self.path_args,self.path_kwargs
        print self.request.arguments, self.request.uri, self.request.path

        if path == "index":

            return self.render("modules/issue.list.html",**self.context)
        else:
            self.write("hello world")


class AuthHandler(SetupHandler):

    def get(self,path):
        if path == "logout":
            if self.username != "anonymous":
                self.username = "anonymous"
                self.set_secure_cookie("user",self.username)
                self.set_flash_message("ok","you have been logged out")

        self.redirect("/")

    def post(self,path):

        username = self.get_argument('login_name')
        password = self.get_argument('login_password')

        error = ""
        if username and password and self.username == "anonymous":
            try:
                uid = self.db.user.lookup(username)
                pwd = self.db.user.get(uid,'password')
                if pwd != password:
                    raise ValueError("Invalid Password")

                self.set_secure_cookie("user",username)
                self.set_flash_message("ok","welcome back %s" % username)

            except KeyError:
                error = "invalid user name"
            except ValueError:
                error = "invalid password"
        if error:
            self.set_flash_message('error',error)
        
        self.redirect("/")