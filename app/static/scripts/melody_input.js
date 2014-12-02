'use strict';

(function () {
	var lastKeyIndex,
		query = [],
		queryElem,
		queryVis,
		waiting = 2;
	
	function init() {
		if (--waiting !== 0) {
			return;
		}
		
		tone.init();
		keyboard.init();
		queryVis.init();
		queryElem = document.getElementById('melodySearchQuery');
	}
	
	var queryVis = {
		data: undefined,
		chart: undefined,
		chartOptions: {
			legend: 'none',
			axisFontSize: 0,
			hAxis: {
				baselineColor: 'transparent',
				gridlineColor: 'transparent',
				textPosition: 'none'
			},
			vAxis: {
				baselineColor: 'transparent',
				gridlineColor: 'transparent',
				textPosition: 'none'
			},
			series: [{
				color: '#f57c00', // colorPrimary
				lineWidth: 4
			}],
			pointSize: 5
		},
		/**
		 * Initialize the data table and chart for the visualization.
		 */
		init: function () {
			this.data = new google.visualization.DataTable();
			this.data.addColumn('number', 'Index');
			this.data.addColumn('number', 'Interval');
			this.chart = new google.visualization.LineChart(document.getElementById('melodySearchQueryVis'));
			this.draw();
		},
		/**
		 * Update the chart with new data.
		 */
		draw: function () {
			this.chart.draw(this.data, this.chartOptions);
		}
	};
	
	var keyboard = {
		keys: undefined,
		/**
		 * Set up event listeners for the piano keyboard.
		 */
		init: function () {
			// Get the container element.
			var container = document.getElementById('pianoContainer');
			
			// Get the labels checkbox.
			var labelsCheckbox = document.getElementById('pianoLabelsCheckbox');
			labelsCheckbox.onchange = function (e) {
				if (e.target.checked) {
					container.classList.add('showLabels');
					localStorage.showPianoLabels = 'true';
				} else {
					container.classList.remove('showLabels');
					localStorage.showPianoLabels = '';
				}
			};
			if (localStorage.showPianoLabels) {
				labelsCheckbox.click();
			}
			
			// Get the keyboard key elements.
			this.keys = container.getElementsByTagName('button');
			// Convert the list of elements to an actual Array.
			this.keys = Array.prototype.slice.call(this.keys);
			
			var boundPressListener = this.keyboardKeyPressed.bind(this);
			var boundReleaseListener = this.keyboardKeyReleased.bind(this);
			
			for (var i = 0; i < this.keys.length; i++) {
				this.keys[i].onmousedown = boundPressListener;
				this.keys[i].ontouchstart = boundPressListener;
				this.keys[i].onmouseup = boundReleaseListener;
				this.keys[i].ontouchend = boundReleaseListener;
				this.keys[i].disabled = false;
			}
			
			var boundBackspaceListener = this.backspaceKeyPressed.bind(this);
			document.getElementById('pianoBackspace').onmousedown = boundBackspaceListener;
			document.getElementById('pianoBackspace').ontouchstart = boundBackspaceListener;
		},
		/**
		 * Handle a piano key being pressed.
		 * @param {MouseEvent|TouchEvent} e
		 */
		keyboardKeyPressed: function (e) {
			e.preventDefault();
			
			var keyIndex = this.keys.indexOf(e.currentTarget);
			// ADd the note to the query array.
			if (typeof lastKeyIndex === 'undefined') {
				query.push('u0');
			} else {
				var delta = (keyIndex - lastKeyIndex) / 2;
				// Use letters in place of positive/negative signs and decimal points.
				delta = (delta >= 0 ? 'u' : 'd') +
					Math.abs(delta);
				delta = delta.replace('.', 'p');
				query.push(delta);
			}
			
			// Add the note to the visualization.
			queryVis.data.addRows([[query.length - 1, keyIndex / 2]]);
			queryVis.draw();
			
			// Update the query element.
			queryElem.value = query.join(' ');
			
			lastKeyIndex = keyIndex;
			
			// Play the note.
			var freq = e.currentTarget.dataset.freq;
			freq = parseFloat(freq);
			tone.play(freq);
			
		},
		/**
		 * Handle a piano key being released.
		 * @param {MouseEvent|TouchEvent} e
		 */
		keyboardKeyReleased: function (e) {
			e.preventDefault();
			tone.stop();
		},
		/**
		 * Handle the piano backspace key being pressed.
		 * @param {MouseEvent|TouchEvent} e
		 */
		backspaceKeyPressed: function (e) {
			e.preventDefault();
			
			// Remove the last item from the query array.
			query.splice(-1, 1);
			// Update the query element.
			queryElem.value = query.join(' ');
			if (query.length === 0) {
				lastKeyIndex = undefined;
			}
			
			// Remove the last item from the visualization.
			queryVis.data.removeRow(query.length);
			queryVis.draw();
			
		}
			
	};
	
	var tone = {
		cxt: undefined,
		oscNode: undefined,
		gainNode: undefined,
		/**
		 * Set up the objects for playing tones when keyboard keys are pressed.
		 */
		init: function () {
			this.cxt = new AudioContext();
		},
		/**
		 * Start playing a tone.
		 * @param {Number} freq - The frequency to play
		 */
		play: function (freq) {
			if (this.oscNode) {
				this.oscNode.stop();
				this.oscNode.disconnect();
			}
			this.oscNode = this.cxt.createOscillator();
			this.oscNode.frequency.value = freq;
			this.oscNode.connect(this.cxt.destination); 
			this.oscNode.start();
		},
		/**
		 * Stop playing the current tone.
		 */
		stop: function () {
			this.oscNode.stop();
			this.oscNode.disconnect();
			this.oscNode = undefined;
		}
	};
	
	google.setOnLoadCallback(init);
	google.load('visualization', '1.0', {packages: ['corechart']});
	window.addEventListener('load', function () { init(); }, false);
})();
