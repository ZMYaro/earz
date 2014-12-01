import urllib

from google.appengine.api import search
from google.appengine.ext import ndb

from constants import DEFAULTS,INDECES

URLS = {
	'html': 'https://docs.google.com/feeds/download/documents/export/Export?exportFormat=html&id=',
	'txt': 'https://docs.google.com/feeds/download/documents/export/Export?exportFormat=txt&id='
}

class Song(ndb.Model):
	id = ndb.StringProperty()
	title = ndb.StringProperty()
	artist = ndb.StringProperty()
	album = ndb.StringProperty()
	
	intervals = ndb.TextProperty()
	startingNote = ndb.FloatProperty()
	
	docId = ndb.StringProperty() # The document ID of the lyrics doc, if any
	vidId = ndb.StringProperty() # The YouTube video id of the music video, if any
	
	def _pre_put_hook(self):
		# Fill in default values for fields.
		if self.startingNote == None:
			self.startingNote = DEFAULTS['startingNote']
	
	def _post_put_hook(self,future):
		# Update the song's associated search document.
		if self.docId:
			lyricsDoc = search.Document(
				doc_id=self.id,
				fields=[
					search.TextField(name='lyrics', value=self.lyricsText),
					search.TextField(name='title', value=self.title),
					search.AtomField(name='artist', value=self.artist),
					search.AtomField(name='album', value=self.album)
				]
			)
			search.Index(name=INDECES['lyrics']).put(lyricsDoc)
			
			melodyDoc = search.Document(
				doc_id=self.id,
				fields=[
					search.TextField(name='intervals', value=self.intervals)
				]
			)
			search.Index(name=INDECES['melody']).put(melodyDoc)
	
	def getLyricsHTML(self):
		resp = urllib.urlopen(URLS['html'] + self.docId)
		return resp.read()
	
	def getLyricsText(self):
		resp = urllib.urlopen(URLS['txt'] + self.docId)
		return resp.read()
	
	lyricsHTML = property(getLyricsHTML)
	lyricsText = property(getLyricsText)

