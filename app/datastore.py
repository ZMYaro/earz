
from google.appengine.api import search
from google.appengine.ext import ndb

URLS = {
	'html': 'https://docs.google.com/feeds/download/documents/export/Export?exportFormat=html&id=',
	'txt': 'https://docs.google.com/feeds/download/documents/export/Export?exportFormat=txt&id='
}

DEFAULTS = {
	'startingNote': 440
}

LYRICS_INDEX_NAME = 'lyricsIndex'

class Song(ndb.Model):
	title = ndb.StringProperty()
	artist = ndb.StringProperty()
	album = ndb.StringProperty()
	
	intervals = ndb.JsonProperty()
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
			doc = search.Document(
				doc_id=self.id,
				fields=[
					search.TextField(name='lyrics', value=self.lyricsTxt),
					search.TextField(name='title', value=self.title)
				]
			)
			search.Index(name=LYRICS_INDEX_NAME).put(doc)
	
	def getLyricsHTML(self):
		resp = urllib.urlopen(URLS['html'] + self.docId)
		self.response.write(resp.read())
	
	def getLyricsText(self):
		resp = urllib.urlopen(URLS['txt'] + self.docId)
		self.response.write(resp.read())
	
	lyricsHTML = property(getLyricsHTML)
	lyricsText = property(getLyricsText)

