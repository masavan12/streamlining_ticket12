/*! RESOURCE: /scripts/GlideFilterCurrency.js */
var GlideFilterCurrency = Class.create(GlideFilterString, {
	
	initialize: function(tableName, item) {
		GlideFilterHandler.prototype.initialize.call(this, tableName, item);
	},
	
	_operOnChange: function() {
		var lastOp = this.lastOperator; 
		this.lastOperator = this._getOperator();
		
		if((fieldComparisonOperators.indexOf(lastOp) >= 0) != (fieldComparisonOperators.indexOf(this.lastOperator) >= 0)) {
			this.inputCnt = 0;
			this.input = [];
		}
		this.getValues();
		if (lastOp != 'BETWEEN' && this._getOperator() == 'BETWEEN') {
			this.values[2] = this.values[1];
			this.values[1] = '';
		}
		this._unescapeIfRequired();
		this._build();	
	},
	_setup: function(values) {
		this.maxValues = 2;
		this.id = this.tr.tableField + "." + guid();
		this.listenForOperChange = true;
	},
	
	_build: function() {
		GlideFilterString.prototype._build.call(this);
		var s = this._addSelect(60, false, 1);
		this._getCurrencies(s);
	},
	
	_getCurrencies: function(s) {
		var currencies = new Array();
		if (currencies.length != 0)
			return currencies;
		
	  	var ajax = new GlideAjax("CurrencyConverter");
  		ajax.addParam("sysparm_name", "getCurrencies");
	  	ajax.getXMLAnswer(this._getCurrenciesResponse.bind(this), null, s);
	},
	
	_getCurrenciesResponse: function(answer, s) {		
	  	var values = answer;
	  	var currencies = values.split(",");
    	var cache = this._getCache();
		cache.put("currencies", values);
		for (var i = 0; i < currencies.length; i++)
			addOption(s, currencies[i], currencies[i]);
			
		this.currency_widget = s;
		this._parseValue();
	},
	
	_resolveFromCache:function() {
		var cache = this._getCache();
		var value = cache.get("currencies");
		if (value)
			return value.split(",");
		
		return [];
	},
	
	_getCache:function() {
		if (typeof(g_cache_currency) != "undefined")
			return g_cache_currency;
			
		g_cache_currency = new GlideClientCache(1);
		
		return g_cache_currency;
	},
  
	
	_parseValue: function() {
		if (this.inputs.length == 0)
			return;
		var processSelect = false;
		for (var i=0; i < this.inputs.length; i++) {	
			var v = this.inputs[i].value;
			if (!v)
				continue;
				
			if (v.indexOf('javascript') < 0)
				continue;
				
			processSelect = true;
			var sa = v.split(';');
			var first = sa[0].split('\'');
			var currency = first[first.length - 1];
			var price = sa[sa.length - 1];
			var priceIndex = price.indexOf('\'');
			price = price.substring(0, priceIndex);
			this.inputs[i].value = price;
		}
		if (!processSelect)
			return;
		
		var sel = new Select(this.currency_widget);
		sel.selectValue(currency);
	},
    
	getValues: function() {
		if (this._isMappingEnabled)
			return this.getMappingValue();
		if (!this.currency_widget)
			return '';
		var v = GlideFilterString.prototype.getValues.call(this);
		var tn = this.item.table.tableName;
		var fn = this.item.name;
		var valList = v.split('@');
		if (valList[0] === "NULL")
return "NULL";
		var fromVal = 'javascript:global.getCurrencyFilter(\'' + tn + '\',\'' + fn +'\', \'' + this.currency_widget.value + ';' + valList[0] + '\')'
		if (this._isFieldComparisonOperator())
			fromVal = valList[0];
		if ((valList.length > 1 && this._getOperator() == 'BETWEEN') || (valList.length > 2))
			return fromVal + '@javascript:global.getCurrencyFilter(\'' + tn + '\',\'' + fn +'\', \'' + this.currency_widget.value + ';' + valList[1] + '\')'
		return fromVal;
	},
	_isFieldComparisonOperator: function() {
		var op = this._getOperator();
		return ((op == 'SAMEAS') || (op == 'NSAMEAS') || (op == 'GT_FIELD') || (op == 'LT_FIELD') || (op == 'GT_OR_EQUALS_FIELD') || (op == 'LT_OR_EQUALS_FIELD'))
	},
	
	destroy : function() {
		GlideFilterString.prototype.destroy.call(this);
		this.currency_widget = null;
	},
	z: null
});
g_filter_extension_map['currency'] = function(tableName, elementDef) { return new GlideFilterCurrency(tableName, elementDef) };
g_filter_extension_map['price'] = g_filter_extension_map['currency'];
sysopers['price'] = sysopers['decimal'];
sysopers['currency'] = sysopers['decimal'];
numericTypes['price'] = 1;
numericTypes['currency'] = 1;
;
