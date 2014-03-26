import roundup
from roundup import instance
from functools import partial
from conf import *

from tornado import escape

from conf import TRACKER
db = TRACKER.open("admin")

def get_html_select(name,multiple=True,selected=None):
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
    out += "</select>"
    return out


status_html_select = partial(get_html_select,"status",False)

priority_html_select = partial(get_html_select,"priority",False)

user_html_select = partial(get_html_select,"user",False)

user_html_select_mult = partial(get_html_select,"user",True)
