import cgi
import os

import jinja2
import webapp2

from google.appengine.ext import ndb;

JINJA_ENVIRONMENT = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
	extensions=['jinja2.ext.autoescape'],
	autoescape=True
)

class MainPage(webapp2.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENVIRONMENT.get_template('index.html')
		self.response.write(template.render({}))

app = webapp2.WSGIApplication([
	('/', MainPage)
], debug=True)
