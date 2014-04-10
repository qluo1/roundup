import roundup
from roundup import instance
from functools import partial
from conf import *

from tornado import escape

from conf import TRACKER
db = TRACKER.open("admin")

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



