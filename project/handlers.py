import re
import tornado
import tornado.web

from roundup.date import Date
from utils.helper import FlashMessageMixin, NodeProxy
from utils.pagination import Pagination
from search_engine import search_index, add_issue
from copy import copy

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
        if itemid:
            return self.db.security.hasPermission('View',self.uid,item,None,itemid)

        return self.db.security.hasPermission('View',self.uid,item)

    def is_edit_ok(self,item,itemid):
        return self.db.security.hasPermission('Edit',self.uid,item,None,itemid)


PAGE_SIZE = 10
class Context(object):

    def __init__(self,user,item,itemid=None):
        """
            
        """
        self.user = user
        self.db = user.db
        self.item = item
        self.itemid = itemid
        self.pagination = None
        self.page = None

        if not itemid:
            kls = self.db.getclass(item)

    def is_view_ok(self):
        """ """
        return self.user.is_view_ok(self.item,self.itemid)

    def is_edit_ok(self):
        """ """
        if self.itemid:
            return self.user.is_edit_ok(self.item,self.itemid)
        return False

    def list(self,page):
        if not self.itemid:
            kl = self.db.getclass(self.item)
            self.pagination = Pagination(page,PAGE_SIZE,kl.count())
            start = (page-1)*PAGE_SIZE
            end = page*PAGE_SIZE
            return [NodeProxy(kl.getnode(i)) for i in kl.list()][start:end]
    
    def filter(self,filterspec):
        """
            filterspec like dict(status=["1","2"])
        """
        if not self.itemid:
            kl = self.db.getclass(self.item)
            # TODO pagination here
            return [NodeProxy(kl.getnode(i)) for i in kl.filter(None,filterspec)]

    def __getattr__(self,field):
        if self.itemid:
            kl = self.db.getclass(self.item)
            return NodeProxy(kl.getnode(self.itemid))[field]

class ContextSearch(object):

    def __init__(self,user,item,qstring):
        """ """
        self.user = user
        self.db = user.db
        self.item = item
        self.query = qstring

    def is_view_ok(self):
        """ """
        return self.user.is_view_ok(self.item,None)

    def is_edit_ok(self):
        """ """
        return False
    def list(self,page):
        """ """
        res = search_index(self.query,page)
        kl = self.db.getclass("issue")
        results = [NodeProxy(kl.getnode(r['issueId'])) for r in res['data']]
        self.page = page
        self.pagination = Pagination(page,res['pgsize'],res['count'])
        return results


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
        self.user =  User(self.db,self.username)
        
        # default context object
        self.context = {
            'user': self.user,
            'context': Context(self.user,"issue"),
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
    """ 
        for ajax call
    """

    def get(self,path):
        print path, self.path_args,self.path_kwargs
        print self.request.arguments, self.request.uri, self.request.path

        args = self.request.arguments

        if path == "list":
            page = args.get('page',1)
            if type(page) != int:
                page = page[0]
            self.context['page'] = int(page)

            return self.render("modules/issue.list.html",**self.context)

        if path == "new":
            return self.render("modules/issue.new.html",**self.context)

        if path == "search":
            self.context['page'] = 1
            self.context['results'] = None

            return self.render("modules/issue.search.html",**self.context)

        dre=re.compile(r'([^\d]+)0*(\d+)')
        match = dre.match(path)
        if match:
            group = match.groups()
            item = group[0]
            itemid = group[1]

            # update context
            self.context['context'] = Context(self.user,item,itemid)
            print item
            print "%s.html"%item
            return self.render("modules/" + "%s.html"%item,**self.context)

    def post(self,path):

        args = self.request.arguments
        print args

        if path =="new":
            if args.get('@title') and args.get('@note') and args.get('status') and args.get('priority'):
                title = args['@title'][0]
                note = args['@note'][0]
                status = args['status'][0]
                pri = args['priority'][0]
                assignedto = args['user'][0]

                # message
                msg_ = self.db.msg.create(content=note, summary=title,
                author=self.uid,date=Date())
                print "msg: ", msg_
                # new issue
                new_ = self.db.issue.create(title=title,status=status,
                            priority=pri,messages=[msg_],
                            assignedto=assignedto)

                # add attached file
                if self.request.files:
                    file1 = self.request.files['@file'][0]
                    body = file1['body']
                    file_= self.db.file.create(name=file1['filename'],content=body)
                    self.db.issue.set(new_,files=[file_])
                
                print "issue: ", new_

                if new_ and msg_:
                    self.db.commit()
                    # update search index
                    add_issue(new_)
                    return self.write({"status":"ok","id": new_});
                else:
                    print "unexpect error on saving issue??"
                    return self.write({"status":"error", "message":"issue failed to created"})
            else:
                print "error missing more fields"

            return self.write({"status":"error", "message":"missing all required fields"})

        if path == "search":

            ## pagination
            page = args.get('page',1)
            if type(page) != int:
                page = int(page[0])
            self.context['page'] = page

            """ search items """
            status,priority = args['status'][0],args['priority'][0]
            assignedto,creator = args['user']
            title = args['title'][0]
            fromDate,toDate = args['fromDate'][0],args['toDate'][0]

            print status,priority,assignedto,creator,title,fromDate,toDate

            q = []
            if status:
                q.append(u"status:%s" % status)
            if priority:
                q.append(u"priority:%s" % priority)
            if creator:
                q.append(u"creator:%s" % creator)
            if title:
                q.append(u"title:%s" % title)


            qstring = " AND ".join(q)
            self.context['context'] = ContextSearch(self.user,"issue",qstring)


            return self.render("modules/issue.search.result.html",**self.context)


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
