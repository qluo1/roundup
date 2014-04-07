from conf import TRACKER
from roundup import instance, mailgw, date
from roundup import password, date
import random

db = TRACKER.open("admin")
assert db

def test_search_by_status():
	""" 
		{'status': ['4'], 'toDate': [''], '@title': ['adfadfaf'], 'priority': ['3'], 'fromDate': [''], 'user': ['2', '']}
	"""

	filter = {'status': ['4','3']}
	res = db.issue.filter(None,filterspec=filter)
	assert len(ret) > 0

def test_search_by_creator():
	""" """
	filter = {'creator': ['1','2']}
	res = db.issue.filter(None,filterspec=filter)
	assert len(ret) > 0

def test_search_by_assignedto():
	""" """
	filter = {'assignedto': ['1','2','3','4']}
	res = db.issue.filter(None,filterspec=filter)
	assert len(ret) > 0

def test_search_title():
	""" """
	

