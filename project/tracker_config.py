import os

import roundup
from roundup import instance

HOME = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HOME)
TRACKER_HOME = os.path.join(ROOT,"trackers")

trackers = (
	dict(name="gsib",url="gsib/", tracker=instance.open(os.path.join(TRACKER_HOME,"tracker"))),
	dict(name="demo",url="demo/",tracker=instance.open(os.path.join(TRACKER_HOME,"demo"))),
)