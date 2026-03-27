/*! RESOURCE: /scripts/plugins/CharCounter.js */
Plugin.create('charCounter', {
	initialize: function(elem, options){
		var defaults = {
			allowed: 140,		
			warning: 25,
			css: 'counter',
			counterElement: 'span',
			cssWarning: 'warning',
			cssExceeded: 'exceeded',
			elementId: '',
			available: 0
		};
			
		var options = Object.extend(defaults, options);
		function calculate(obj){
			var count = $(obj).getValue().length,	
				available = options.allowed - count;
			
			if (available <= options.warning && available >= 0){
				$(obj).next().addClassName(options.cssWarning);
			}else{
				$(obj).next().removeClassName(options.cssWarning);
			}
			if (available < 0){
				$(obj).next().addClassName(options.cssExceeded);
			}else{
				$(obj).next().removeClassName(options.cssExceeded);
			}
			$(obj).removeAttribute("aria-describedby");
			var counterText = new GwtMessage().getMessage('{0} characters remaining of {1} characters', available, options.allowed);
			$(obj).next().update(counterText);
			var charCountLiveRegion = $(obj).next().next();
			var counterText_live = '';
			if (available > options.warning)
				charCountLiveRegion.setAttribute('aria-live', 'polite');
			else
				charCountLiveRegion.setAttribute('aria-live', 'assertive');
			if (available === options.allowed * 0.5 || available === options.allowed * 0.25 || available === options.warning || available <= 0)
				counterText_live = new GwtMessage().getMessage('{0} characters remaining', available);
			charCountLiveRegion.textContent = counterText_live;
		}
        $(elem).setAttribute("aria-controls","live_region_text." + options.elementId);
		$(elem).insert({
after: ('<'+ options.counterElement + ' id="char_counter.' + options.elementId + '" class="' + options.css + '"></' + options.counterElement+ '>'+
'<span id="live_region_text.' + options.elementId + '" role="region" class="sr-only"></span>')
		});
		calculate(elem);
		$(elem).observe('keyup', function(){calculate(this)});
		$(elem).observe('change', function(){calculate(this)});
		$(elem).observe('focus', function(){$(elem).setAttribute("aria-describedby","char_counter." + options.elementId);});
	}		
});
;
