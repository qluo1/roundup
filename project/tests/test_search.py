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

	data = {'status': ['4']}
	



def test_search_by_creator():
	""" """

def test_search_by_assignto():
	""" """


def test_search_title():
	""" """

