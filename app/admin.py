import cgi
import os

import jinja2
import webapp2

from google.appengine.ext import ndb

from datastore import Song

JINJA_ENVIRONMENT = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
	extensions=['jinja2.ext.autoescape'],
	autoescape=True
)

class AdminListPage(webapp2.RequestHandler):
	def get(self):
		songlist = Song.gql('').fetch(limit=None)
		
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENVIRONMENT.get_template('head.html')
		self.response.write(template.render({'title': 'Admin'}))
		template = JINJA_ENVIRONMENT.get_template('admin_list.html')
		testSong = Song()
		testSong.title = 'Test'
		self.response.write(template.render({'songs': songlist}))

app = webapp2.WSGIApplication([
	('/admin', AdminListPage)
], debug=True)
