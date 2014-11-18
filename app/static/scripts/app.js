'use strict';

(function () {
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
		
		// Load the last used search type from localStorage.
		if (localStorage.searchType === 'melody') {
			//searchTypeForm.searchType.value = 'melody';
			document.getElementById('melodySearchType').click();
		} else {
			//searchTypeForm.searchType.value = 'lyric';
			document.getElementById('lyricSearchType').click();
		}
	}
	
	
	window.onload = init;
})();
