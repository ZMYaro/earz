import cgi
import os

import jinja2
import webapp2

from google.appengine.ext import ndb

from datastore import Song

JINJA_ENV = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
	extensions=['jinja2.ext.autoescape'],
	autoescape=True
)

class AdminListPage(webapp2.RequestHandler):
	def get(self):
		songlist = Song.gql('').fetch(limit=None)
		
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENV.get_template('head.html')
		self.response.write(template.render({'title': 'Admin'}))
		template = JINJA_ENV.get_template('admin_list.html')
		testSong = Song()
		testSong.title = 'Test'
		self.response.write(template.render({'songs': songlist}))

class AddSongPage(webapp2.RequestHandler):
	def get(self):
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENV.get_template('head.html')
		self.response.write(template.render({'title': 'Add song'}))
		template = JINJA_ENV.get_template('edit.html')
		self.response.write(template.render({}))

class EditSongPage(webapp2.RequestHandler):
	def get(self):
		# Get the requested song id.
		songId = self.request.get('id')
		# Return to the admin page if no song was requested.
		if not songId:
			self.redirect('/admin')
			return
		
		song = Song.gql('WHERE id = :1', songId)
		
		# Return to the admin page if the song was not found.
		if not song:
			self.redirect('/admin')
			return
		
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENV.get_template('head.html')
		self.response.write(template.render({'title': 'Edit song'}))
		template = JINJA_ENV.get_template('edit.html')
		self.response.write(template.render({song: song}))
	
	def post(self):
		# TODO: Implement saving the song.
		self.redirect('/admin')
	

app = webapp2.WSGIApplication([
	('/admin', AdminListPage),
	('/admin/add', AddSongPage),
	('/admin/edit', EditSongPage)
], debug=True)
