import roundup
from roundup import instance
from functools import partial

from tornado import escape

## temporary workaround
from conf import trackers
db = trackers[0]['tracker'].open("admin")

def id_to_name(item,itemid):
    kls = db.getclass(item)
    node = kls.getnode(itemid)
    if hasattr(node,"name"):
        return getattr(node,"name")
    if hasattr(node,"username"):
        return getattr(node,"username")

    return node.id

def hist_args_to_str(args):
    """ """
    out = ""
    if args == {}:
        return out
    if type(args) == tuple:
        out += str(args)
    else:
        for k,v in args.items():
            if k in ('creator','assignedto',):
                out += "%s: %s; " %(k, id_to_name("user",v))
            elif k in ('status','priority'):
                out += "%s: %s; " %(k, id_to_name(k,v))
            else:
                out += "%s: %s; " % (k,str(v))
    return out

def get_html_select(name,multiple=True,search=False,selected=None):
    """ 
    """
    if multiple:
        out = "<select multiple class='form-control' name='@%s'>" % name    
    else:
        out = "<select class='form-control' name='@%s'>" % name

    kls = db.getclass(name)
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


status_html_select = partial(get_html_select,"status",False, False)
priority_html_select = partial(get_html_select,"priority",False, False)
user_html_select = partial(get_html_select,"user",False, False)
# 
status_html_select_search = partial(get_html_select,"status",False, True)
priority_html_select_search = partial(get_html_select,"priority",False, True)
user_html_select_search = partial(get_html_select,"user",False, True)

user_html_select_mult = partial(get_html_select,"user",True, False)
