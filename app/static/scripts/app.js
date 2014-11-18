'use strict';

(function () {
	var URLS = {
		CHARTLYRICS: '/proxy/chartlyrics?q=',
		ITUNES: '/proxy/itunes?q=',
		SPOTIFY: '/proxy/spotify?q='
	};
	
	/**
	 * Initialize the application.
	 */
	function init() {
		initSearchCard();
	}
	/**
	 * Set up event listeners for the search card.
	 */
	function initSearchCard() {
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
	 * Search for songs containing a particular lyric.
	 * @param {String} query - The lyric to search for
	 */
	function searchForLyric(query) {
		// Hide the results card while loading.
		document.getElementById('resultsCard').classList.add('hidden');
		document.getElementById('resultCard').classList.add('hidden');
		
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
		xhr.open('GET', URLS.CHARTLYRICS + encodeURIComponent(query), true);
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
	
	
	window.onload = init;
})();
