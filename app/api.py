import json

import webapp2

from google.appengine.api import search
from google.appengine.ext import ndb

from datastore import Song
from constants import INDECES

class LyricSearchHandler(webapp2.RequestHandler):
	def get(self):
		queryString = self.request.get('q')
		index = search.Index(INDECES['lyrics'])
		query = search.Query(
			query_string=queryString,
			options=search.QueryOptions(
				sort_options=search.SortOptions(
					# Find best matches unless a different sort method is chosen.
					match_scorer=search.MatchScorer()
				)
			)
		)
		results = index.search(query)
		
		resultsList = []
		for result in results:
			song = Song.gql('WHERE id = :1', result._doc_id).get()
			if song:
				resultsList.append({
					'id': song.id,
					'title': song.title,
					'artist': song.artist,
					'album': song.album
				})
		
		self.response.headers['Content-Type'] = 'application/json'
		self.response.write(json.dumps(resultsList))

class SongInfoHandler(webapp2.RequestHandler):
	def get(self):
		id = self.request.get('id')
		song = Song.gql('WHERE id = :1', id).get()
		songDict = {
			'id': song.id,
			'title': song.title,
			'artist': song.artist,
			'album': song.album,
			
			'intervals': song.intervals,
			'startingNote': song.startingNote,
			
			'docId': song.docId,
			'vidId': song.vidId
		}
		
		self.response.headers['Content-Type'] = 'application/json'
		self.response.write(json.dumps(songDict))

class LyricsHandler(webapp2.RequestHandler):
	def get(self):
		id = self.request.get('id')
		format = self.request.get('format')
		song = Song.gql('WHERE id = :1', id).get()
		if format and format == 'html':
			self.response.headers['Content-Type'] = 'text/html'
			self.response.write(song.lyricsHTML)
		else:
			self.response.headers['Content-Type'] = 'text/plain'
			self.response.write(song.lyricsText)

app = webapp2.WSGIApplication([
	('/api/search/lyric', LyricSearchHandler),
	('/api/song', SongInfoHandler),
	('/api/lyrics', LyricsHandler)
], debug=True)
