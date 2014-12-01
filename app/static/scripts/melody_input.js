'use strict';

(function () {
	var lastKeyIndex,
		query = [],
		queryElem;
	
	function init() {
		tone.init();
		keyboard.init();
		queryElem = document.getElementById('melodySearchQuery');
	}
	
	var keyboard = {
		container: undefined,
		keys: undefined,
		/**
		 * Set up event listeners for the piano keyboard.
		 */
		init: function() {
			// Get the container element.
			this.container = document.getElementById('pianoContainer');
			// Get the keyboard key elements.
			this.keys = this.container.getElementsByTagName('button');
			// Convert the list of elements to an actual Array.
			this.keys = Array.prototype.slice.call(this.keys);
			
			var boundPressListener = this.keyboardKeyPressed.bind(this);
			var boundReleaseListener = this.keyboardKeyReleased.bind(this);
			
			for (var i = 0; i < this.keys.length; i++) {
				this.keys[i].onmousedown = boundPressListener;
				this.keys[i].ontouchstart = boundPressListener;
				this.keys[i].onmouseup = boundReleaseListener;
				this.keys[i].ontouchend = boundReleaseListener;
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
			if (lastKeyIndex) {
				var delta = (keyIndex - lastKeyIndex) / 2;
				delta = (delta >= 0 ? 'u' : 'd') +
					Math.abs(delta);
				query.push(delta);
			}
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
			query.splice(-1, 1);
			queryElem.value = query.join(' ');
			if (query.length === 0) {
				lastKeyIndex = undefined;
			}
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
	
	window.addEventListener('load', init, false);
})();