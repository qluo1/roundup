"""Templating engine adapter for the Chameleon."""

__docformat__ = 'restructuredtext'

import os.path
import chameleon

from roundup.cgi.templating import StringIO, context, TALLoaderBase

class Loader(TALLoaderBase):
    def __init__(self, dir):
        self.dir = dir
        self.loader = chameleon.PageTemplateLoader(dir)

    def load(self, tplname):
        src, filename = self._find(tplname)
        return RoundupPageTemplate(self.loader.load(src))

class RoundupPageTemplate(object):
    def __init__(self, pt):
        self._pt = pt

    def render(self, client, classname, request, **options):
        c = context(client, self, classname, request)
        c.update({'options': options})

        def translate(msgid, domain=None, mapping=None, default=None):
            result = client.translator.translate(domain, msgid,
                         mapping=mapping, default=default)
            return unicode(result, client.translator.OUTPUT_ENCODING)

        output = self._pt.render(None, translate, **c)
        return output.encode(client.charset)

    def __getitem__(self, name):
        return self._pt[name]

    def __getattr__(self, name):
        return getattr(self._pt, name)

