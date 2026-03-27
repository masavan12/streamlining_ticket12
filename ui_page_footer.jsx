/*! RESOURCE: /scripts/ui_page_footer.js */
(function() {
	addLateLoadEvent(throwFrameLoaded);
	var pad = (isMSIE6 || isMSIE7 || navigator.userAgent.indexOf('MSIE 8') != -1) ? 1 : 0;
	function throwFrameLoaded() {
		try {
			if (window.parent.CustomEvent) {
				window.parent.CustomEvent.fire('content_frame.loaded', self.name, 10);
				window.parent.CustomEvent.fire('content_frame.loaded', self.name, getPageHeight());
			}
		} catch (e) {}
	}
	function throwFrameSized() {
		try {
			if (window.parent.CustomEvent) {
				var previousHeight = window["g_iframe_height"];
				var pageHeight = getPageHeight();
				if (previousHeight != pageHeight) {
					window.parent.CustomEvent.fire('content_frame.resized', self.name, pageHeight);
					window["g_iframe_height"] = getPageHeight();
				}
			}
		} catch (e) {}
	}
	function throwFrameSizedSmaller(){
		try {
			if (window.parent.CustomEvent) {
				window.parent.CustomEvent.fire('content_frame.loaded', self.name, getPageHeight(true));
			}
		} catch (e) {}
	}
	function getPageHeight(resizeSmall) {
		var popupElement, popupHeight;
		var popups = $$('body > div.popup, .modal.in > .modal-dialog');
		if (popups.length > 0) {
			popupElement = popups[0];
			popupHeight = popupElement.scrollHeight + popupElement.offsetTop;
			return (document.body.scrollHeight > popupHeight ? document.body.scrollHeight : popupHeight) + pad;
		}
		if ($$('body > div.section_header_content_no_scroll').length > 0) {
			var mainContentHeight = $$('body > div.section_header_content_no_scroll')[0].scrollHeight;
			var header = $$('body > div.section_header_div_no_scroll.form_title');
			var headerHeight = header.length == 0 ? 0 : header[0].getHeight();
			return mainContentHeight + headerHeight;
		}
		if ($$('body > .touch_scroll').length > 0)
			return $$('body > .touch_scroll')[0].scrollHeight;
		if (document.body.scrollHeight || document.documentElement.scrollHeight) {
			if (!resizeSmall){
				if(document.body.scrollHeight > document.documentElement.scrollHeight)
					return document.body.scrollHeight;
				else
					return document.documentElement.scrollHeight;
			}
			else{
				if(document.documentElement.scrollHeight > document.body.scrollHeight)
					return document.body.scrollHeight;
				else
					return document.documentElement.scrollHeight;
			}
		}
		return document.body.offsetHeight;
	}
	addAfterPageLoadedEvent(function() {
		CustomEvent.observe('frame.resized', throwFrameSized);
		CustomEvent.observe('frame.resized.smaller', throwFrameSizedSmaller);
CustomEvent.observe('partial.page.reload', throwFrameLoaded);
		Event.observe(document.onresize ? document : window, "resize", throwFrameSized);
		_frameChanged();
	});
})();
;
