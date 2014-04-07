import os.path
import whoosh
from whoosh.index import create_in,open_dir
from whoosh.qparser import QueryParser,MultifieldParser
from whoosh.fields import *

from .conf import INDEX_HOME
from .conf import TRACKER


schema = Schema(title=TEXT(stored=True),issueId=ID(unique=True,stored=True),
				status=ID(), priority=ID(),assignedto=ID(store=True),
				creator=ID(stored=True),msg=TEXT,createAt=DATETIME)

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

		writer.add_document(title=unicode(node.title),issueId=unicode(node.id),
					status=unicode(node.status),priority=unicode(node.priority),
					assignedto=unicode(node.assignedto),
					creator=unicode(node.creator),msg=unicode(messages))

	writer.commit()

def search_index(querystring):
	"""
	"""
	ix = open_dir(INDEX_HOME)
	qp = MultifieldParser(["creator","title","msg"],schema=schema)
	user_q = qp.parse(querystring)
	with  ix.searcher() as searcher:
		results = searcher.search(user_q)
		print results
		for i in results:
			print i


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
		# add issue
		writer.add_document(title=unicode(node.title),issueId=unicode(node.id),
					status=unicode(node.status),priority=unicode(node.priority),
					assignedto=unicode(node.assignedto),
					creator=unicode(node.creator),msg=unicode(messages))


if __name__ == "__main__":
	build_index()

	build_index(True)

	search_index("msg:Test AND title:issue AND creator:4")

	search_index("creator:4")


