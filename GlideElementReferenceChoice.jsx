/*! RESOURCE: /scripts/classes/GlideElementReferenceChoice.js */
var GlideElementReferenceChoice = Class.create({
	initialize: function(name, id){
		this.name = name;
		this.id = id;
	},
	type : "GlideElementReferenceChoiceWithoutNone",
	clearValue: function() {
		var control = gel(this.id);
		if (control && control.options && control.options.length > 0 && control.selectedIndex !== 0) {
			var opt = control.options[0];
			g_form.setValue(this.name, opt.value, opt.text);
		}
	}
});
(function() {
	CachedEvent.after('glideform.initialized', function() {
		if(!window["g_form"])
			return;
		var elms = $$('select[data-type="glide_element_reference_choice_without_none"]');
		elms.each(function(elm) {
			var ref = elm.getAttribute('data-ref');
			if (ref && elm.id) {
				var handler = new GlideElementReferenceChoice(ref, elm.id);
				g_form.registerHandler(ref, handler);
			}
		});
	});
})();
;
