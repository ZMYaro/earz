'use strict';

(function () {
	var URLS = {
		lyricSearch: '/api/search/lyric?q=',
		
		song: '/api/song?id=',
		lyricsHTML: '/api/lyrics?format=html&id=',
				
		iTunes: '/proxy/itunes?q=',
		spotify: '/proxy/spotify?q=',
		youTube: 'https://www.youtube.com/results?search_query='
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
					try {
						showSearchResults(JSON.parse(xhr.responseText));
					} catch (e) {
						alert('Something went wrong while searching.');
					}
				} else {
					alert('A ' + xhr.status + ' error occurred while searching.  Please wait and then try again.');
				}
			}
		};
		xhr.open('GET', URLS.lyricSearch + encodeURIComponent(query), true);
		xhr.send();
	}
	/**
	 * Process and display lyric search results.
	 * @param {Object} results - The search results
	 */
	function showSearchResults(results) {
		// Get and clear the results list.
		var resultsList = document.getElementById('resultsList');
		resultsList.innerHTML = '';
		
		// Go through the results.
		for (var i = 0; i < results.length; i++) {
			var resultItem = document.createElement('li');
			var itemButton = document.createElement('button');
			itemButton.dataset.id = results[i].id
			itemButton.dataset.title = results[i].title;
			itemButton.onclick = loadSong;
			
			var title = document.createElement('div');
			title.innerText = title.textContent = results[i].title;
			
			var metadata = document.createElement('small');
			metadata.innerText = metadata.textContent = results[i].artist +
				(results[i].album ? ' - ' + results[i].album : '');
			
			itemButton.appendChild(title);
			itemButton.appendChild(metadata);
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
		loadSongLinks(e.currentTarget.dataset.title);
		
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					showSong(xhr.responseText);
				} else {
					alert('A ' + xhr.status + ' error occurred while loading the song.  Please wait and then try again.');
				}
			}
		};
		xhr.open('GET', URLS.lyricsHTML + encodeURIComponent(e.currentTarget.dataset.id), true);
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
		iTunesXHR.open('GET', URLS.iTunes + encodeURIComponent(title), true);
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
		spotifyXHR.open('GET', URLS.spotify + encodeURIComponent(title), true);
		spotifyXHR.send();
	}
	/**
	 * Display the lyrics for the selected song.
	 * @param {String} songLyrics - The song's lyrics as HTML
	 */
	function showSong(songLyrics) {
		var songCard = document.getElementById('songCard');
		songCard.classList.add('hidden');
		songCard.innerHTML = '';
		
		var bodyTag = /<body.*?>/.exec(songLyrics)[0];
		var bodyStartIndex = songLyrics.indexOf(bodyTag) + bodyTag.length;
		var bodyEndIndex = songLyrics.indexOf('</body>');
		
		songCard.innerHTML = songLyrics.substring(bodyStartIndex, bodyEndIndex);
		
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
