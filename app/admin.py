import cgi
import os
import uuid

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
		id = self.request.get('id')
		# Return to the admin page if no song was requested.
		if not id:
			self.redirect('/admin')
			return
		
		song = Song.gql('WHERE id = :1', id).get()
		
		# Return to the admin page if the song was not found.
		if not song:
			self.response.write('Song ' + id + ' was not found.  Try refreshing?')
			return
		
		self.response.headers['Content-Type'] = 'text/html'
		template = JINJA_ENV.get_template('head.html')
		self.response.write(template.render({'title': 'Edit song'}))
		template = JINJA_ENV.get_template('edit.html')
		self.response.write(template.render({'song': song}))
	
	def post(self):
		id = self.request.get('id')
		
		# Attempt to load the song from the datastore.
		song = Song.gql('WHERE id = :1', id).get()
		
		# If no ID was set or no song was found,
		while not song:
			# Generate a random ID.
			id = uuid.uuid4().hex
			# Ensure the generated ID is unique.
			if Song.gql('WHERE id = :1', id).count(limit=1) == 0:
				song = Song()
				song.id = id
		
		song.title = self.request.get('title')
		song.artist = self.request.get('artist')
		song.album = self.request.get('album')
		
		song.intervals = self.request.get('intervals')
		
		try:
			song.startingNote = float(self.request.get('startingNote'))
		except ValueError:
			song.startingNote = None
		
		song.docId = self.request.get('docId')
		song.vidId = self.request.get('vidId')
		
		# Save the changes to the datastore.
		song.put()
		
		self.redirect('/admin/edit?id=' + song.id)

app = webapp2.WSGIApplication([
	('/admin', AdminListPage),
	('/admin/add', AddSongPage),
	('/admin/edit', EditSongPage)
], debug=True)
