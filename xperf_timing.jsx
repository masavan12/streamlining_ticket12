/*! RESOURCE: /scripts/doctype/xperf_timing.js */
window.NOW.xperf = window.performance || {};
if (!NOW.xperf.now) {
	NOW.xperf.now = function() { return new Date().getTime(); };
}
NOW.xperf.parseBegin = NOW.xperf.now();
NOW.xperf.cssBegin = NOW.xperf.now();
window.addEventListener("DOMContentLoaded", function(){
	var x = NOW.xperf;
	var last = x.lastDoctypeEnd - x.lastDoctypeBegin;
	if (window.console) {
		console.log("+-- Parse times");
		console.log("| CSS parse: " + (x.cssEnd - x.cssBegin));
		console.log("| JS  doctype: " + (x.scriptEnd - x.scriptBegin));
		console.log("| JS at end of page: " + last);
		console.log("+-- All parsing: " + (x.parseEnd - x.parseBegin + last));
	}
	var ms = Math.round(x.parseEnd - x.parseBegin + last);
	CustomEvent.fire('page_timing', { name: 'PARS', ms: ms, win: window });
	if (window.performance && performance.timing) {
		NOW.xperf.z = new Date().getTime();
		setTimeout(function () {
			var x = performance.timing.loadEventEnd - performance.timing.domContentLoadedEventStart;
			CustomEvent.fire('page_timing', { name: 'DOMC', ms: x, win: window });
			x = performance.timing.loadEventStart - NOW.xperf.z;
			CustomEvent.fire('page_timing', { name: 'PROC', ms: x, win: window });
}, 250);
	}
});
;
