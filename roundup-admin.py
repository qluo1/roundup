import sys
# python version check
from roundup import version_check

# import the admin tool guts and make it go
from roundup.admin import AdminTool
from roundup.i18n import _

if __name__ == "__main__":
    tool = AdminTool()
    sys.exit(tool.main())
