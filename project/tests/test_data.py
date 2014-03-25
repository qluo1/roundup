from conf import TRACKER
from roundup import instance, mailgw, date
from roundup import password, date
import random

db = TRACKER.open("admin")
assert db


def test_new_user():
    """ """
    try:
        db.user.lookup("sxljb016")
    except:

        db.user.create(username='sxljb016', password=password.Password('test'),
            realname='Samuel Luo', roles='User', address='Samuel.Luo@gs.com')
        db.commit()


def test_new_issue():

    uid = db.user.lookup("sxljb016")
    title = "%d-test new issue" % random.randint(1,10000)

    msg = db.msg.create(summary=title, content="test new issue on data",
                        author=uid,date=date.Date())
    issue = db.issue.create(title=title,priority="bug",status="testing",
                        messages=[msg],assignedto=uid)

    db.commit()


