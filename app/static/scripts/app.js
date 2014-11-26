'use strict';

(function () {
	var URLS = {
		CHARTLYRICS_LYRIC: '/proxy/chartlyricslyric?q=',
		CHARTLYRICS_SONG: '/proxy/chartlyricssong',
		ITUNES: '/proxy/itunes?q=',
		SPOTIFY: '/proxy/spotify?q='
	};
	
	var TRANSITION_DURATION = 200; // Milliseconds
	
	/**
	 * Initialize the application.
	 */
	function init() {
		initSearchView();
		initSongView();
	}
	/**
	 * Set up event listeners for the search view.
	 */
	function initSearchView() {
		var searchTypeForm = document.getElementById('searchTypeForm'),
			lyricSearchForm = document.getElementById('lyricSearchForm'),
			melodySearchForm = document.getElementById('melodySearchForm');
		
		// Change the visible search type when the option is changed.
		searchTypeForm.onchange = function (e) {
			localStorage.searchType = e.target.value;
			if (e.target.value === 'melody') {
				lyricSearchForm.style.display = 'none';
				melodySearchForm.style.display = 'block';
				melodySearchForm.firstElementChild.focus();
			} else {
				melodySearchForm.style.display = 'none';
				lyricSearchForm.style.display = 'block';
				lyricSearchForm.firstElementChild.focus();
			}
		};
		
		// Override the lyric search form.
		lyricSearchForm.onsubmit = function(e) {
			e.preventDefault();
			if (e.target.q.value !== '') {
				searchForLyric(e.target.q.value);
			}
		};
		
		
		// Load the last used search type from localStorage.
		if (localStorage.searchType === 'melody') {
			//searchTypeForm.searchType.value = 'melody';
			document.getElementById('melodySearchType').click();
		} else {
			//searchTypeForm.searchType.value = 'lyric';
			document.getElementById('lyricSearchType').click();
		}
	}
	/**
	 * Set up event listeners for the song view.
	 */
	function initSongView() {
		document.getElementById('songUpButton').onclick = closeSong;
	}
	
	/**
	 * Search for songs containing a particular lyric.
	 * @param {String} query - The lyric to search for
	 */
	function searchForLyric(query) {
		// Hide the results card while loading.
		document.getElementById('resultsCard').classList.add('hidden');
		document.getElementById('songCard').classList.add('hidden');
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					if (xhr.responseXML) {
						showSearchResults(xhr.responseXML);
					} else {
						alert('Something went wrong while searching.');
					}
				} else {
					alert('A ' + xhr.status + ' error occurred while searching, likely because the API is misbehaving.');
				}
			}
		};
		xhr.open('GET', URLS.CHARTLYRICS_LYRIC + encodeURIComponent(query), true);
		xhr.send();
	}
	/**
	 * Process and display lyric search results.
	 * @param {XMLDocument} resultsXML - The search results
	 */
	function showSearchResults(resultsXML) {
		var results = resultsXML.getElementsByTagName('SearchLyricResult');
		
		// Get and clear the results list.
		var resultsList = document.getElementById('resultsList');
		resultsList.innerHTML = '';
		
		// Go through the results.
		for (var i = 0; i < results.length; i++) {
			// Skip any elements with no content.
			if (results[i].childNodes.length === 0) {
				continue;
			}
			
			var resultItem = document.createElement('li');
			var itemButton = document.createElement('button');
			itemButton.dataset.id = results[i].getElementsByTagName('LyricId')[0].childNodes[0].nodeValue;
			itemButton.dataset.checksum = results[i].getElementsByTagName('LyricChecksum')[0].childNodes[0].nodeValue;
			itemButton.dataset.title = results[i].getElementsByTagName('Song')[0].childNodes[0].nodeValue;
			itemButton.onclick = loadSong;
			
			var title = document.createElement('div');
			title.innerText = title.textContent = results[i].getElementsByTagName('Song')[0].childNodes[0].nodeValue;
			
			var artist = document.createElement('small');
			artist.innerText = artist.textContent = results[i].getElementsByTagName('Artist')[0].childNodes[0].nodeValue;
			
			itemButton.appendChild(title);
			itemButton.appendChild(artist);
			resultItem.appendChild(itemButton);
			resultsList.appendChild(resultItem);
		}
		// Show the results card.
		document.getElementById('resultsCard').classList.remove('hidden');
	}
	/**
	 * Load the song for the clicked button.
	 * @param {MouseEvent} e
	 */
	function loadSong(e) {
		var url = URLS.CHARTLYRICS_SONG;
		url += '?lyricId=' + encodeURIComponent(e.currentTarget.dataset.id);
		url += '&lyricCheckSum=' + encodeURIComponent(e.currentTarget.dataset.checksum);
		
		loadSongLinks(e.currentTarget.dataset.title);
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					if (xhr.responseXML) {
						showSong(xhr.responseXML);
					} else {
						alert('Something went wrong while loading the song.');
					}
				} else {
					alert('A ' + xhr.status + ' error occurred while loading the song, likely because the API is misbehaving.');
				}
			}
		};
		xhr.open('GET', url, true);
		xhr.send();
		
		// Hide the search view.
		var searchAppBar = document.getElementById('searchAppBar');
		var searchContainer = document.getElementById('searchContainer');
		searchAppBar.classList.add('hidden');
		searchContainer.classList.add('hidden');
		setTimeout(function () {
			searchAppBar.style.display = 'none';
			searchContainer.style.display = 'none';
		}, TRANSITION_DURATION);
		// Show the song view.
		var songAppBar = document.getElementById('songAppBar');
		var songContainer = document.getElementById('songContainer');
		songAppBar.style.display = null;
		songContainer.style.display = null;
		songAppBar.style.left = e.currentTarget.offsetLeft + 'px';
		songAppBar.style.right = (window.innerWidth - (e.currentTarget.offsetLeft + e.currentTarget.offsetWidth)) + 'px';
		songAppBar.style.top = (e.currentTarget.offsetTop - window.scrollY) + 'px';
		document.getElementById('songTitle').innerHTML = e.currentTarget.dataset.title;
		setTimeout(function () {
			songAppBar.classList.remove('hidden');
			songContainer.classList.remove('hidden');
			
			songAppBar.style.left = null;
			songAppBar.style.right = null;
			songAppBar.style.top = null;
		}, 1);
	}
	/**
	 * Load links to the song on iTunes and Spotify.
	 * @param {String} title - The title of the song to look up
	 */
	function loadSongLinks(title) {
		// Get the song links card.
		var songLinksCard = document.getElementById('songLinksCard');
		songLinksCard.classList.add('hidden');
		songLinksCard.innerHTML = '';
		
		// Search iTunes.
		var iTunesXHR = new XMLHttpRequest();
		iTunesXHR.onreadystatechange = function () {
			if (iTunesXHR.status === 200) {
				if (iTunesXHR.readyState === 4) {
					var response = JSON.parse(iTunesXHR.responseText);
					if (response.results && response.results.length) {
						songLinksCard.classList.remove('hidden');
						songLinksCard.innerHTML += '<a role=\"button\" href=\"' +
							response.results[0].trackViewUrl +
							'\" target=\"_blank\">' +
							'<img src=\"/static/images/icons/itunes_32.png\" alt=\"\" style=\"margin: -10px; margin-right: 10px;\" />' +
							'Buy on iTunes</a>';
					}
				}
			}
		};
		iTunesXHR.open('GET', URLS.ITUNES + encodeURIComponent(title), true);
		iTunesXHR.send();
		
		// Search Spotify.
		var spotifyXHR = new XMLHttpRequest();
		spotifyXHR.onreadystatechange = function () {
			if (spotifyXHR.status === 200) {
				if (spotifyXHR.readyState === 4) {
					var response = JSON.parse(spotifyXHR.responseText);
					if (response.tracks && response.tracks.items && response.tracks.items.length) {
						songLinksCard.classList.remove('hidden');
						songLinksCard.innerHTML += '<a role=\"button\" href=\"' +
							response.tracks.items[0].external_urls.spotify +
							'\" target=\"_blank\">' +
							'<img src=\"/static/images/icons/spotify_32.png\" alt=\"\" style=\"margin: -10px; margin-right: 10px;\" />' +
							'Listen on Spotify</a>';
					}
				}
			}
		};
		spotifyXHR.open('GET', URLS.SPOTIFY + encodeURIComponent(title), true);
		spotifyXHR.send();
	}
	/**
	 * Display the lyrics for the selected song.
	 * @param {XMLDocument} songXML - The song's data
	 */
	function showSong(songXML) {
		var songCard = document.getElementById('songCard');
		songCard.classList.add('hidden');
		songCard.innerHTML = '';
		
		var heading = document.createElement('h1');
		heading.innerText = heading.textContent = songXML.getElementsByTagName('LyricSong')[0].childNodes[0].nodeValue;
		var artist = document.createElement('small');
		artist.innerText = artist.textContent = songXML.getElementsByTagName('LyricArtist')[0].childNodes[0].nodeValue;
		var lyrics = document.createElement('pre');
		lyrics.innerText = lyrics.textContent = songXML.getElementsByTagName('Lyric')[0].childNodes[0].nodeValue;
		
		songCard.appendChild(heading);
		songCard.appendChild(artist);
		songCard.appendChild(lyrics);
		
		setTimeout(function () {
			songCard.classList.remove('hidden');
		}, 1);
	}
	/**
	 * Hide the current song and return to search results.
	 */
	function closeSong() {
		// Hide the song view.
		var songAppBar = document.getElementById('songAppBar');
		var songCard = document.getElementById('songCard');
		var songContainer = document.getElementById('songContainer');
		songAppBar.classList.add('hidden');
		songCard.classList.add('hidden');
		songContainer.classList.add('hidden');
		setTimeout(function () {
			songAppBar.style.display = 'none';
			songContainer.style.display = 'none';
		}, TRANSITION_DURATION);
		// Show the search view.
		var searchAppBar = document.getElementById('searchAppBar');
		var searchContainer = document.getElementById('searchContainer');
		searchAppBar.style.display = null;
		searchContainer.style.display = null;
		setTimeout(function () {
			searchAppBar.classList.remove('hidden');
			searchContainer.classList.remove('hidden');
		}, 1);
	}
	
	
	window.onload = init;
})();
