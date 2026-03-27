/*! RESOURCE: /scripts/cs.collab/collabButton.js */
(function(){
	var openCollabChat = function(collabChatId) {
		var table = g_form.getTableName();
		var id = g_form.getUniqueValue();
		var message = {
			payload: {
				parentTable: table,
				parentSysId: id,
				collabChatId
			}
		};
		CustomEvent.fireTop('collab:open_collab_chat', message);
	}
if (window.parent.NOW && window.parent.NOW.isPolarisWrapper === "true") {
		addAfterPageLoadedEvent(function() {
				var button = gel("create_collab_chat");
				if (!button)
					return;
				button.style.display = "initial";
				button.addEventListener("click", function() {
					openCollabChat();
				});
CustomEvent.fire("frame.resized");
			
				const queryString = window.location.search;
				const urlParams = new URLSearchParams(queryString);
				const openCollab = urlParams.get('open-collab-chat');
				const collabChatId = urlParams.get('collab_chat_id');
				if (openCollab) {
					openCollabChat(collabChatId);
				}
		});
	}
})()
;
