/*! RESOURCE: /scripts/polaris_theme_refresh_observer.js */
(function() {
	addEventListener('load', function(){
if (!NOW || NOW.isUsingPolaris !== true)
			return;
if (!top.NOW || top.NOW.isPolarisWrapper !== "true")
			return;
		if(!CustomEvent.observe){
			console.warn('Include CustomEventManager.js on your page to enable the theme refresh observer');
			return;
		}
		function refreshTheme() {
			var url = 'AJAXJellyRunner.do?template=polarisberg_theme_variables&sysparm_path_only=true&sysparm_exclude_dark=' + NOW.exclude_dark_theme;
			var fetchOptions = {
				method: 'POST',
				headers: {
'Content-Type': 'application/json',
					'X-UserToken': window.g_ck
				},
			}
			return fetch(url, fetchOptions)
				.then(function(response) {
					return response.text()
				})
				.then(function(responseText){
					var el = document.getElementById("polarisberg_theme_variables");
					el.setAttribute("href", responseText);
					CustomEvent.fireAll("polarisberg_theme_variables.path_changed", responseText);
				})
		}
		var debounceRefresh = null;
		var preferences = ["compact", "glide.ui.polaris.theme.variant"];
		var refreshListener = function(e) {
			if (debounceRefresh) clearTimeout(debounceRefresh);
			debounceRefresh = setTimeout(refreshTheme, 100);
		};
		preferences.forEach(function(item){ CustomEvent.observe(item, refreshListener) });
	})
}())
;
