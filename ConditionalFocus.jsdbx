(function() {
	top.NOW = top.NOW || {};
	top.NOW.magellan = top.NOW.magellan || {
		isNavigating: false,
		setNavigatingState: function(state) {
			this.isNavigating = state;
		},
		invokeWhenShouldFocus: function(currentWindow, onFocus) {
			if (this.isNavigating || currentWindow.self === currentWindow.top) {
				onFocus();
				this.isNavigating = false;
			}
		}
	};
})();