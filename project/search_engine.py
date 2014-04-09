import os.path
from datetime import datetime as DT
import whoosh
from whoosh.index import create_in,open_dir
from whoosh.qparser import QueryParser,MultifieldParser
from whoosh.fields import *

from conf import INDEX_HOME
from conf import TRACKER


schema = Schema(title=TEXT(stored=True),issueId=ID(unique=True,stored=True,sortable=True),
				status=ID(), priority=ID(),assignedto=ID(stored=True),
				creator=ID(stored=True),msg=TEXT,createAt=DATETIME(sortable=True))

from copy import copy

def build_index(rebuild=False):
	""" 
		build index data for the tracker
	"""
	if not os.path.exists(INDEX_HOME):
		os.mkdir(INDEX_HOME)

	ix = create_in(INDEX_HOME,schema)

	db = TRACKER.open("admin")
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
					creator=unicode(node.creator),msg=unicode(messages),createAt=createAt)

	writer.commit()

def search_index(querystring,page=1):
	"""
	"""
	ix = open_dir(INDEX_HOME)
	qp = MultifieldParser(["creator","title","msg","createAt"],schema=schema)
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


def add_issue(issueId):
	""" 
		add a new issue 
	"""
	ix = open_dir(INDEX_HOME)
	db = TRACKER.open("admin")
	node = db.issue.getnode(issueId)
	messages = ""
	for m in node.messages:
		msg = db.msg.getnode(m)
		if messages:
			messages += "\n\n"
		messages += msg.content
	with ix.searcher() as searcher:
		writer = ix.writer()
		indexed_issues = set([i['issueId'] for i in searcher.all_stored_fields()])
		if unicode(node.id) in indexed_issues:
			writer.delete_by_term('issueId',unicode(node.id))
		
		createAt = DT.strptime(node.creation.formal(),"%Y-%m-%d.%H:%M:%S")
		# add issue
		writer.add_document(title=unicode(node.title),issueId=unicode(node.id),
					status=unicode(node.status),priority=unicode(node.priority),
					assignedto=unicode(node.assignedto),
					creator=unicode(node.creator),msg=unicode(messages),createAt=createAt)

		writer.commit()

if __name__ == "__main__":
	build_index()

	build_index(True)

	print "search msg AND title AND creator"
	search_index("msg:Test AND title:issue AND creator:4")

	print "search creator"
	search_index("creator:4",3)

	print "search status"

	search_index("status:3")

	print "search priority"

	search_index("priority:3")

	print "search createAt"

	search_index("createAt:201403")


	print "search createAt range"

	search_index("createAt:[20140328 to 20140405]")
