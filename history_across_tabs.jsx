/*! RESOURCE: /scripts/doctype/history_across_tabs.js */
(function () {
	var history = new BroadcastChannel('historySync');
	var serviceWorkerEvents = {
		createHistoryItem : 'POLARIS_HISTORY_ITEMS'
	};
	CustomEvent.observe('magellanNavigator.historyAdded', function(data) {
		var payload = data.history;
		history.postMessage({
			type: serviceWorkerEvents.createHistoryItem,
			user_sys_id: window.NOW.user.userID,
			payload
		});
	});
})();
;
