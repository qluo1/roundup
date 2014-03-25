import os
import sys

## need parent folder with python search path
TEST_HOME=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if TEST_HOME not in sys.path:
	sys.path.append(TEST_HOME)
