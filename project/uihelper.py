from tornado import escape
class UiHelper(object):

    def __init__(self,user):
        self.db = user.db

    def _html_select(self,name,multiple=False,search=False,selected=None):
        if multiple:
            out = "<select multiple class='form-control' name='@%s'>" % name    
        else:
            out = "<select class='form-control' name='@%s'>" % name

        kls = self.db.getclass(name)
        for i in sorted(kls.list()):
            value =  kls.get(i,kls.labelprop())
            # print "html_select", i, selected
            if value == selected:
                out += "<option selected value='%s'>%s</option>" %(i,value)
            else:
                out += "<option value='%s'>%s</option>" %(i,value)
        
        if search:
            out += "<option selected value='%s'>%s</option>" %("","don't care")
        out += "</select>"
        return out

    def item_html_select(self,name,**kw):
        print name
        multiple = kw.get("multiple",False)
        search = kw.get("search",False)
        selected = kw.get("selected")
        return self._html_select(name,multiple=multiple,search=search,selected=selected)


    def id_to_name(self,item,itemid):
        """ """
        kls = self.db.getclass(item)
        node = kls.getnode(itemid)
        if hasattr(node,"name"):
            return getattr(node,"name")
        if hasattr(node,"username"):
            return getattr(node,"username")

        return node.id

    def hist_args_to_str(self,args):
        """ """
        out = ""
        if args == {}:
            return out
        if type(args) == tuple:
            out += str(args)
        else:
            for k,v in args.items():
                if k in ('creator','assignedto',):
                    out += "%s: %s; " %(k, self.id_to_name("user",v))
                elif k in ('status','priority'):
                    out += "%s: %s; " %(k, self.id_to_name(k,v))
                else:
                    out += "%s: %s; " % (k,str(v))
        return out
