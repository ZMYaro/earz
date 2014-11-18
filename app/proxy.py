import cgi
import urllib
import webapp2

CHARTLYRICS_SEARCH_URL = 'http://api.chartlyrics.com/apiv1.asmx/SearchLyricText?lyricText='
ITUNES_SEARCH_URL = 'http://ax.itunes.apple.com/WebObjects/MZStoreServices.woa/wa/wsSearch?term='
SPOTIFY_SEARCH_URL = 'https://api.spotify.com/v1/search?type=track&q='

class ChartLyricSearch(webapp2.RequestHandler):
	def get(self):
		# Do not allow usage by arbitrary external pages.
		if 'Referer' not in self.request.headers or self.request.headers['Referer'].find(self.request.host_url) == -1:
			self.error(403)
			return
		# Fetch and return the XML from ChartLyrics.
		self.response.headers['Content-Type'] = 'application/xml'
		resp = urllib.urlopen(CHARTLYRICS_SEARCH_URL + self.request.get('q'))
		self.response.write(resp.read())

class ITunesSearch(webapp2.RequestHandler):
	def get(self):
		# Do not allow usage by arbitrary external pages.
		if 'Referer' not in self.request.headers or self.request.headers['Referer'].find(self.request.host_url) == -1:
			self.error(403)
			return
		# Fetch and return the JSON from iTunes.
		self.response.headers['Content-Type'] = 'application/json'
		resp = urllib.urlopen(ITUNES_SEARCH_URL + self.request.get('q'))
		self.response.write(resp.read())

class SpotifySearch(webapp2.RequestHandler):
	def get(self):
		# Do not allow usage by arbitrary external pages.
		if 'Referer' not in self.request.headers or self.request.headers['Referer'].find(self.request.host_url) == -1:
			self.error(403)
			return
		# Fetch and return the JSON from Spotify.
		self.response.headers['Content-Type'] = 'application/json'
		resp = urllib.urlopen(SPOTIFY_SEARCH_URL + self.request.get('q'))
		self.response.write(resp.read())

app = webapp2.WSGIApplication([
	('/proxy/chartlyrics', ChartLyricSearch),
	('/proxy/itunes', ITunesSearch),
	('/proxy/spotify', SpotifySearch)
], debug=True)
