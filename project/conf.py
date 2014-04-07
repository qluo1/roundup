import os
import sys
import uuid

HOME = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HOME)
TRACKER_HOME = os.path.join(ROOT,"tracker")

ROUNDUP_HOME = os.path.join(ROOT,"roundup")

INDEX_HOME = os.path.join(ROOT,"index")

if ROUNDUP_HOME not in sys.path:
	sys.path.append(ROUNDUP_HOME)

import roundup
from roundup import instance

TRACKER = instance.open(TRACKER_HOME)

settings = dict(
    cookie_secret="cfa5809d-a2cf-47bb-adbf-5695915d87fa",
    login_url="/auth/login",
    template_path=os.path.join(HOME, "templates"),
    static_path=os.path.join(HOME, "static"),
    # xsrf_cookies=True,
)
