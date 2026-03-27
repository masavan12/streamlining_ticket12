/*! RESOURCE: /scripts/classes/GlideElementReference.js */
var GlideElementReference = Class.create({
    initialize: function(element, completer, ref, dependentReference, refQualElements, readonly) {
        this.element = element;
        this.completer = completer;
        this.ref = ref;
        this.dependentReference = dependentReference;
        this.refQualElements = refQualElements;
        this.sysReadOnly = readonly;
    },
    getOptions: function(createOptionsResult) {
if (!this.element.ac) {
            var klass = window[this.completer];
            new klass(this.element, this.ref, this.dependentReference, this.refQualElements);
        }
        var acInstance = this.element.ac;
        var selected = [];
if (acInstance.getKeyValue())
            selected.push({displayValue: this.sysReadOnly ? $("sys_display." + this.ref).value : acInstance.getDisplayValue(), value: acInstance.getKeyValue()});
        var optionsResult = createOptionsResult(selected, null);
        optionsResult.getAvailable = function(term) {
            return new Promise(function(resolve, reject) {
                var ga = new GlideAjax(acInstance.PROCESSOR);
                ga.setQueryString(acInstance.getCustomerQuerystring(term));
                ga.setErrorCallback(function(req) { reject(req); });
                ga.getXML(function(response) {
                    if (!response.responseXML || !response.responseXML.documentElement) {
                        this.isResolvingFlag = false;
                        return;
                    }
                    var xml = response.responseXML;
                    var items = xml.getElementsByTagName("item");
                    var available = [];
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        available.push({displayValue: item.getAttribute("label"), value: item.getAttribute("name")});
                    }
                    resolve(available);
                });
            });
        };
        return optionsResult;
    },
    type: "GlideElementReference"
});
(function() {
    CachedEvent.after('glideform.initialized', function() {
        if (!window["g_form"])
            return;
        var elms = $$('input[data-type="ac_reference_input"]');
        elms.each(function(elm) {
            var ref = elm.getAttribute('data-ref');
            var dependent = elm.getAttribute('data-dependent');
            var refQualElements = elm.getAttribute('data-ref-qual');
            var completer = elm.getAttribute('data-completer');
            if (ref && completer) {
                var handler = new GlideElementReference(elm, completer, ref, dependent, refQualElements);
                g_form.registerHandler(ref, handler);
            }
        });
        var readOnlyElms = $$('input[data-type="ac_reference_readonly"]');
        readOnlyElms.each(function(elm) {
            var ref = elm.getAttribute('data-ref');
            var dependent = elm.getAttribute('data-dependent');
            var refQualElements = elm.getAttribute('data-ref-qual');
            var completer = elm.getAttribute('data-completer');
            var readonly = elm.getAttribute('data-readonly');
            if (ref && completer) {
                var handler = new GlideElementReference(elm, completer, ref, dependent, refQualElements, readonly);
                g_form.registerHandler(ref, handler);
            }
        });
    });
})();
;
