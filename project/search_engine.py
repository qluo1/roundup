import os.path
from datetime import datetime as DT
import whoosh
from whoosh.index import create_in,open_dir
from whoosh.qparser import QueryParser,MultifieldParser
from whoosh.fields import *

schema = Schema(title=TEXT(stored=True),issueId=ID(unique=True,stored=True,sortable=True),
                status=ID(), priority=ID(),assignedto=ID(stored=True),
                creator=ID(stored=True),msg=TEXT,createAt=DATETIME(sortable=True))

from copy import copy

class TrackerSearcher(object):
    """ """
    def __init__(self,tracker):
        """ """
        self.tracker = tracker
        _root = os.path.dirname(tracker.tracker_home)
        _name = os.path.basename(tracker.tracker_home)
        self.index = os.path.join(_root, _name + "_index")

    def build_index(self,rebuild=False):
        """ """
        if not os.path.exists(self.index):
            os.mkdir(self.index)

        ix = create_in(self.index,schema)

        db = self.tracker.open("admin")
        writer = ix.writer()
        for i in db.issue.list():
            node = db.issue.getnode(i)
            messages = ""
            for m in node.messages:
                msg = db.msg.getnode(m)
                if messages:
                    messages += "\n\n"
                messages += msg.content

            if rebuild:
                writer.delete_by_term('issueId',unicode(node.id))
            createAt = DT.strptime(node.creation.formal(),"%Y-%m-%d.%H:%M:%S")
            writer.add_document(title=unicode(node.title),issueId=unicode(node.id),
                        status=unicode(node.status),priority=unicode(node.priority),
                        assignedto=unicode(node.assignedto),
                        creator=unicode(node.creator),msg=unicode(messages,errors='replace'),createAt=createAt)

        writer.commit()

    def search_index(self,querystring,page=1):
        """ """
        ix = open_dir(self.index)
        qp = MultifieldParser(["creator","title","msg","createAt","msg","assignedto"],schema=schema)
        user_q = qp.parse(querystring)

        total = 0
        with  ix.searcher() as searcher:
            results = searcher.search_page(user_q,page)
            # debug 
            print results.pagenum, results.pagecount, results.pagelen
            print("Showing results %d-%d of %d"
                        % (results.offset + 1, results.offset + results.pagelen ,len(results)))
            res = []
            for i in results:
                # print i
                res.append(i.fields())

            return {'page': results.pagenum,'count': len(results),
                    'pages':results.pagecount,'pgsize':results.pagelen,'data': res}

    def add_issue(self,issueId):
        """ """
        ix = open_dir(self.index)



if __name__ == "__main__":

    from conf import trackers

    for t in trackers:

        searcher = TrackerSearcher(t['tracker'])
        searcher.build_index()
        searcher.build_index(True)
        searcher.search_index("msg:Test AND title:issue AND creator:4")
        searcher.search_index("creator:4",3)
        searcher.search_index("status:3")
        searcher.search_index("createAt:[20140328 to 20140405]")
    
    # build_index()

    # build_index(True)

    # print "search msg AND title AND creator"
    # search_index("msg:Test AND title:issue AND creator:4")

    # print "search creator"
    # search_index("creator:4",3)

    # print "search status"

    # search_index("status:3")

    # print "search priority"

    # search_index("priority:3")

    # print "search createAt"

    # search_index("createAt:201403")


    # print "search createAt range"

    # search_index("createAt:[20140328 to 20140405]")
