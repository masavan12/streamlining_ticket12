/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: HermesTopicInspectorUIScript */
var HermesTopicInspectorUIScript = Class.create();
HermesTopicInspectorUIScript.prototype = {
    NA: getMessage("NA"),
    initialize: function() {},
    invalidServerResponsePopUp: function() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Received an invalid response from the server"));
        gm.on('closeconfirm', function() {
            GlideModal.prototype.get('hermes_consumer_viewer').destroy();
        });
        gm.render();
    },
    valueOrNA: function(value) {
        return value ? value : this.NA;
    },
    offsetValueOrNA: function(value) {
        return ((value || value == 0) && value > -1) ? value : this.NA;
    },
    getResponseElements: function(response, tagName) {
        if (!response)
            return;
        var responseXML = response.responseXML;
        if (!response.responseXML)
            return;
        var documentElement = responseXML.documentElement;
        if (!documentElement)
            return;
        var elements = documentElement.getElementsByTagName(tagName);
        if (!elements)
            return;
        return elements;
    },
    groupAndSortPartitions: function(partitionInfoList, nearDC) {
        var partitionInfoArr = [].slice.call(partitionInfoList);
        dcGroupedPartitions = partitionInfoArr.reduce(function(accum, elem) {
            (accum[elem.getAttribute("dc")] = accum[elem.getAttribute("dc")] || []).push(elem);
            return accum;
        }, {});
        var dcs = Object.keys(dcGroupedPartitions);
dcs.sort(function(a, b) {
            if (a == nearDC)
                return 1;
            else if (b == nearDC)
                return -1;
            return 0;
        });
        var result = [];
        for (var i = 0; i < dcs.length; i++) {
            var dcPartitionInfo = dcGroupedPartitions[dcs[i]];
            if (!dcPartitionInfo)
                continue;
dcPartitionInfo.sort(function(a, b) {
                return b.getAttribute("value") - a.getAttribute("value");
            });
            result.push(dcPartitionInfo);
        }
        return result.flatMap(function(partitionInfo) {
            return partitionInfo;
        });
    }
};
/*! RESOURCE: ConnectionUtils */
var ConnectionUtils = {
	getSysConnection: function() {
		var connGR = new GlideRecord("sys_connection");
		connGR.addQuery('active', true);
		connGR.addQuery("connection_alias", g_form.getValue("connection_alias"));
		connGR.addQuery("sys_domain", g_form.getValue("sys_domain"));
		connGR.addQuery("sys_id", "!=", g_form.getUniqueValue());
		connGR.query();
	
		return connGR;
	},
	
	doConnection: function(verb) {
		var currName = g_form.getValue("name");
if (currName.match(/[^A-Za-z0-9_ @./()#&+\-=!*]/)){
			g_form.addErrorMessage(new GwtMessage().getMessage("Invalid connection name"));
			return false;
		}
	
		if (g_form.getValue("active") == "false") {
			gsftSubmit(null, g_form.getFormElement(), verb);
			return;
		}
	
		var connGR;
		var performOverride = function() {
			connGR.active = false;
			connGR.update();
			gsftSubmit(null, g_form.getFormElement(), verb);
		};
	
		var grConnAlias = new GlideRecord("sys_alias");
		if (grConnAlias.get(g_form.getValue("connection_alias"))) {
			if (grConnAlias.multiple_connections == 'true') {
				gsftSubmit(null, g_form.getFormElement(), verb);
			} else {
				connGR = this.getSysConnection();
	
				if (connGR.next()) {
					var escapedCurrName = this.escapeHTML(currName);
					var escapedConnGRName = this.escapeHTML(connGR.name);
					
					if (escapedConnGRName.toUpperCase() == escapedCurrName.toUpperCase()) {
						var uniqueErrMsg = new GwtMessage().getMessage("A connection with {0} name already exists, duplicate connection names are not allowed", escapedCurrName);
						g_form.addErrorMessage(uniqueErrMsg);
						return false;
					}
	
					var title = new GwtMessage().getMessage("Confirm inactivation");
var question = new GwtMessage().getMessage("You already have a {0} connection active, {1}.<br/>By making this one active, {2} will become inactive. <br/>Are you sure you want to make {3} the active connection?", connGR.protocol, escapedConnGRName, escapedConnGRName, escapedCurrName);
	
					this.confirmOverride(title, question, performOverride);
				} else {
					gsftSubmit(null, g_form.getFormElement(), verb);
				}
			}
		}
	},
	
	confirmOverride: function(title, question, onPromptComplete) {
		var dialogClass = (window.GlideModal) ? GlideModal : GlideDialogWindow;
		var dialog = new GlideDialogWindow('glide_confirm_basic');
		dialog.setTitle(title);
		dialog.setSize(400, 325);
		dialog.setPreference('title', question);
		dialog.setPreference('onPromptComplete', onPromptComplete);
		dialog.render();
	},
	
	escapeHTML: function(str) {
return str.replace(/[&<>"'\u00AD]/g, function (c) {
			switch (c) {
				case '&': return '&amp;';
				case '<': return '&lt;';
				case '>': return '&gt;';
				case '"': return '&quot;';
				case "'": return '&#039;';
				case '\u00AD': return '&shy;';
				default: return c;
			}
		});
	}
	
	};
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;
    code = removeCommentsFromClientScript(code);
    var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
    var validatePattern = new RegExp(patternString);
    
    if (!validatePattern.test(code)) {
       var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
       g_form.showErrorBox(fieldName, msg);
       return false;
    }
    return true;
}
function validateNoServerObjectsInClientScript(fieldName) {
    var code = g_form.getValue(fieldName);
    if (code == "")
       return true;
    code = removeCommentsFromClientScript(code);
    
var doubleQuotePattern = /"[^"\r\n]*"/g;
    code = code.replace(doubleQuotePattern,""); 
var singleQuotePattern = /'[^'\r\n]*'/g;
    code = code.replace(singleQuotePattern,"");
    var rc = true;
var gsPattern = /(\s|\W)gs\./;
    if (gsPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }
var currentPattern = /(\s|\W)current\./;
    if (currentPattern.test(code)) {
       var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
       g_form.showErrorBox(fieldName, msg);
       rc = false;
    }
    return rc;    
}
function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
	var code = g_form.getValue(fieldName);
	var rc = true;
	if("global" == scopeName)
		return rc;
	
	code = removeCommentsFromClientScript(code);
	code = removeSpacesFromClientScript(code);
	code = removeNewlinesFromClientScript(code);
	
	var requiredStart =  "var"+scopeName+"="+scopeName+"||{};"+scopeName+"."+scriptName+"=(function(){\"usestrict\";";
	var requiredEnd = "})();";
	
	if(!code.startsWith(requiredStart)) {
		var msg = new GwtMessage().getMessage("Missing closure assignment.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}
	
	if(!code.endsWith(requiredEnd)) {
		var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
		g_form.showErrorBox(fieldName,msg);
		rc = false;
	}
	return rc;
}
function validateNotCallingFunction (fieldName, functionName) {
	var code = g_form.getValue(fieldName);
	var rc = true;
	var reg = new RegExp(functionName, "g");
	var matches;
	
	code = removeCommentsFromClientScript(code);
	
	if (code == '')
		return rc;
	
	matches = code.match(reg);
	rc = (matches && (matches.length == 1));
	
	if(!rc) {
		var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
		msg = new GwtMessage().getMessage(msg);
		g_form.showErrorBox(fieldName,msg);
	}
	
	return rc;
}
function removeCommentsFromClientScript(code) {
var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
    code = code.replace(pattern1,""); 
var pattern2 = /\/\/.*/g;
    code = code.replace(pattern2,"");
    return code;
}
function removeSpacesFromClientScript(code) {
var pattern = /\s*/g;
	return code.replace(pattern,"");
}
function removeNewlinesFromClientScript(code) {
var pattern = /[\r\n]*/g;
	return code.replace(pattern,"");
}
/*! RESOURCE: AssetSetDomainParameters */
function assetSetDomainParameters(gDialog) {
	var ga = new GlideAjax('global.AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'isDomainDataSeparationEnabled');
	ga.getXMLWait();
	if (ga.getAnswer() === 'true') {
		gDialog.setPreference('sysparm_domain', g_form.getValue('sysparm_domain'));
		gDialog.setPreference('sysparm_domain_scope', g_form.getValue('sysparm_domain_scope'));
	}
}
/*! RESOURCE: populate_scope_editor_slushbucket */
function populateLeftAndRightScopeEditor(dataLeft, dataRight) {
	slushbucketPopulateHelper(gel('scope_slush_left'), dataLeft);
	slushbucketPopulateHelper(gel('scope_slush_right'), dataRight);
}
function slushbucketPopulateHelper(select, data) {
	select.options.length = 0;
	if(data) {
		var list = data.split('^');
		for (var i = 0; i != list.length; i++) {
			var t = list[i].split(':');
			var label = atob(t[0]);
			var value = atob(t[1]);
			var o = new Option(label, value);
			select.options[select.options.length] = o;
		}
	}
}
function cancel() {
	g_form.fieldChanged('scope_slush', false);
	setTimeout(function() {reloadWindow(self);}, 1);
}
function editScopes() {
	g_form.fieldChanged('scope_slush', false);
	var jsonScopes = {
		"additionalScopes": scope_slush.getValues(scope_slush.getRightSelect()) || [],
		"removedScopes": scope_slush.getValues(scope_slush.getLeftSelect()) || []
	};
	var stringScopes = JSON.stringify(jsonScopes);
	
	var ga = new GlideAjax('AJAXAddScopes');
	ga.addParam('sysparm_name', 'updateScopes');
	ga.addParam('sysparm_scopes', stringScopes);
	ga.addParam('sysparm_oauthEntityId', g_form.getUniqueValue());
	ga.getXML(function(result) {
		g_navigation.reloadWindow();
	});
}
/*! RESOURCE: UpgradePlanProgressViewerUtil */
var UpgradePlanProgressViewerUtil = Class.create();
UpgradePlanProgressViewerUtil.prototype = {
	initialize: function() {
	},
	renderProgressViewer: function(title, progressId) {
		var self = this;
		var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
		var modal = new dialogClass('hierarchical_progress_viewer', false, '40em', '10.5em');
	
		modal.setTitle(title);
		modal.setPreference('sysparm_renderer_execution_id', progressId);
		modal.setPreference('sysparm_button_close', new GwtMessage().getMessage('Close'));
		modal.setPreference('sysparm_renderer_hide_drill_down', true);
	
		modal.on('bodyrendered', function() {
			self.disableModalCloseButton();
		});
	
		modal.on('renderStatus', function(statusObject) {
			self.addResultButtonIfApplicable(statusObject);
			self.addViewDetailsButtonIfApplicable(statusObject, progressId, modal);
		});
	
		modal.on('executionComplete', function() {
			self.updateModalButtons(modal);
		});
	
		modal.render();
	},
	addResultButtonIfApplicable: function(statusObject) {
		if (!this.isUpgradePlanComplete(statusObject))
			return;
		addButtonToProgressFooter(this.createResultButton(statusObject.result.upgradePlanSysId));
	},
	addViewDetailsButtonIfApplicable: function(statusObject, progressId, modal) {
		if (statusObject && statusObject.result && statusObject.result.succeedWithWarning && !$('sysparm_button_view_details') && !modal.title.includes(' - Execution Details'))
			addButtonToProgressFooter(this.createViewDetailsButton(progressId, modal));
	},
	disableModalCloseButton: function() {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn)
			closeBtn.disable();
	},
	isUpgradePlanComplete: function(statusObject) {
		return statusObject && statusObject.result && statusObject.result.upgradePlanSysId && !$('sysparm_button_result_page');
	},
	createResultButton: function(upgradePlanSysId) {
		var resultButton = new Element('button', {
			'id': 'sysparm_button_result_page',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('Go to Upgrade Plan'));
		resultButton.onclick = function() {
			window.location = 'sys_upgrade_plan.do?sys_id=' + upgradePlanSysId;
		};
		return resultButton;
	},
	createViewDetailsButton: function(progressId, modal) {
		var viewDetailsButton = new Element('button', {
			'id': 'sysparm_button_view_details',
			'type': 'button',
			'class': 'btn btn-default',
			'style': 'margin-left: 5px;'
		}).update(new GwtMessage().getMessage('View Details'));
		viewDetailsButton.onclick = function() {
			modal.setPreference('sysparm_renderer_hide_drill_down', false);
			modal.setTitle(modal.title + ' - Execution Details');
			modal.render();
		};
		return viewDetailsButton;
	},
	updateModalButtons: function(modal) {
		var closeBtn = $('sysparm_button_close');
		if (closeBtn) {
			closeBtn.onclick = function() {
				modal.destroy();
				reloadWindow(window);
			};
		}
		var resultBtn = $('sysparm_button_result_page');
		if (resultBtn)
			resultBtn.className += ' btn-primary';
		var viewDetailsBtn = $('sysparm_button_view_details');
		if (viewDetailsBtn)
			viewDetailsBtn.className += ' btn-secondary';
	},
	type: 'UpgradePlanProgressViewerUtil'
};
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
   if (!g_user.hasRole("ui_action_admin"))
      return;
   var element = Event.element(event);
   if (element.tagName.toLowerCase() == "span")
      element = element.parentNode;
   var id = element.getAttribute("gsft_id");
   var mcm = new GwtContextMenu('context_menu_action_' + id);
   mcm.clear();
   mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
   contextShow(event, mcm.getID(), 500, 0, 0);
   Event.stop(event);
}
addLoadEvent(function() {
   document.on('contextmenu', '.action_context', function (evt, element) {
      showUIActionContext(evt);
   });
});
/*! RESOURCE: ValidateStartEndDates */
function validateStartEndDate(startDateField, endDateField, processErrorMsg){
	var startDate = g_form.getValue(startDateField);
	var endDate = g_form.getValue(endDateField);
	var format = g_user_date_format;
	if (startDate === "" || endDate === "")
		return true;
	var startDateFormat = getDateFromFormat(startDate, format);
	var endDateFormat = getDateFromFormat(endDate, format);
	
	if (startDateFormat < endDateFormat)
		return true;
	
	if (startDateFormat === 0 || endDateFormat === 0){
		processErrorMsg(new GwtMessage().getMessage("{0} is invalid", g_form.getLabelOf(startDate === 0? startDateField : endDateField)));
		return false;
	}
	if (startDateFormat > endDateFormat){
		processErrorMsg(new GwtMessage().getMessage("{0} must be after {1}", g_form.getLabelOf(endDateField), g_form.getLabelOf(startDateField)));
		return false;
	}
	
	return true;
}
/*! RESOURCE: pdb_HighchartsConfigBuilder */
var HighchartsBuilder = {
	getChartConfig: function(chartOptions, tzOffset) {
		var chartTitle = chartOptions.title.text,
			xAxisTitle = chartOptions.xAxis.title.text,
			xAxisCategories = chartOptions.xAxis.categories,
			yAxisTitle = chartOptions.yAxis.title.text,
			series = chartOptions.series;
		this.convertEpochtoMs(xAxisCategories);
		this.formatDataSeries(xAxisCategories, series);
		var config = {
			chart: {
				type: 'area',
				zoomType: 'x'
			},
			credits: {
				enabled: false
			},
			title: {
				text: chartTitle
			},
			xAxis: {
				type: 'datetime',
				title: {
					text: xAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			yAxis: {
				reversedStacks: false,
				title: {
					text: yAxisTitle,
					style: {textTransform: 'capitalize'}
				}
			},
			plotOptions: {
				area: {
					stacking: 'normal'
				},
				series: {
					marker: {
						enabled: true,
						symbol: 'circle',
						radius: 2
					},
					step: 'center'
				}
			},
			tooltip: {
				valueDecimals: 2,
				style: {
					whiteSpace: "wrap",
					width: "200px"
				}
			},
			series: series
		};
var convertedOffset = -1 * (tzOffset/60);
		Highcharts.setOptions({
			lang: {
				thousandsSep: ','
			},
			global: {
				timezoneOffset: convertedOffset
			}
		});
		return config;
	},
    convertEpochtoMs: function(categories) {
		categories.forEach(function(point, index, arr) {
			arr[index] *= 1000;
		});
	},
	formatDataSeries: function(categories, series) {
		series.forEach(function(row, index, arr) {
			arr[index].data.forEach(function(innerRow, innerIndex, innerArr) {
				var value = innerRow;
				if (value == "NaN") {
					value = 0;
				}
			    var xValue = categories[innerIndex];
				innerArr[innerIndex] = [xValue, value];
			});
		});
	}
};
/*! RESOURCE: ActionLayoutItemColorHelper */
var ActionLayoutItemColorHelper = Class.create();
ActionLayoutItemColorHelper.prototype = {
    GROUP_TYPE_SPLIT_BUTTON: "1",
    COLUMN_NAME_COLOR: "color",
    COLUMN_NAME_VARIANT: "variant",
    BUTTON_OPTIONS: [{
            "value": "primary",
            "displayValue": "Primary"
        },
        {
            "value": "primary-positive",
            "displayValue": "Primary positive"
        },
        {
            "value": "primary-negative",
            "displayValue": "Primary negative"
        },
        {
            "value": "secondary",
            "displayValue": "Secondary"
        },
        {
            "value": "secondary-positive",
            "displayValue": "Secondary positive"
        },
        {
            "value": "secondary-negative",
            "displayValue": "Secondary negative"
        },
        {
            "value": "tertiary",
            "displayValue": "Tertiary"
        }
    ],
    MENU_OPTIONS: [{
            "value": "primary",
            "displayValue": "Primary"
        },
        {
            "value": "primary-selection",
            "displayValue": "Primary selection"
        },
        {
            "value": "secondary",
            "displayValue": "Secondary"
        },
        {
            "value": "secondary-selection",
            "displayValue": "Secondary selection"
        },
        {
            "value": "tertiary",
            "displayValue": "Tertiary"
        },
        {
            "value": "tertiary-selection",
            "displayValue": "Tertiary selection"
        }
    ],
    initialize: function() {},
    setButtonOptions: function(fieldName, initialValue) {
        g_form.clearOptions(fieldName);
        this.BUTTON_OPTIONS.forEach(option => {
            g_form.addOption(fieldName, option.value, option.displayValue);
        });
        if (initialValue && this.BUTTON_OPTIONS.find(option => option.value === initialValue)) {
            g_form.setValue(fieldName, initialValue);
        }
    },
    setDropdownOptions: function(fieldName, initialValue) {
        g_form.clearOptions(fieldName);
        this.MENU_OPTIONS.forEach(option => {
            g_form.addOption(fieldName, option.value, option.displayValue);
        });
        if (initialValue && this.MENU_OPTIONS.find(option => option.value === initialValue)) {
            g_form.setValue(fieldName, initialValue);
        }
    },
    loadVariantOptions: function(layoutItemSysId, initialValue) {
        var layoutItem = new GlideRecord("sys_ux_form_action_layout_item");
        layoutItem.get(layoutItemSysId);
        if (layoutItem.getValue("item_type") === "action") {
            this.setButtonOptions(this.COLUMN_NAME_VARIANT, initialValue);
        } else {
            var layoutGroup = new GlideRecord('sys_ux_form_action_layout_group');
            layoutGroup.get(layoutItem.getValue("layout_group"));
            if (layoutGroup.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
                this.setButtonOptions(this.COLUMN_NAME_VARIANT, initialValue);
            } else {
                this.setDropdownOptions(this.COLUMN_NAME_VARIANT, initialValue);
            }
        }
    },
    loadColorOptions: function(initialValue) {
        if (g_form.getValue("item_type") === "action") {
            this.setButtonOptions(this.COLUMN_NAME_COLOR, initialValue);
        } else {
            var gr = new GlideRecord('sys_ux_form_action_layout_group');
            gr.get(g_form.getValue("layout_group"));
            if (gr.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
                this.setButtonOptions(this.COLUMN_NAME_COLOR, initialValue);
            } else {
                this.setDropdownOptions(this.COLUMN_NAME_COLOR, initialValue);
            }
        }
    },
    handleActionItemTypeChange: function(itemType) {
        if (itemType === "action") {
            this.setButtonOptions(this.COLUMN_NAME_COLOR);
        }
		if (itemType === "group") {
            g_form.clearOptions(this.COLUMN_NAME_COLOR);
        }
    },
    handleActionItemGroupChange: function(layoutGroupSysId) {
        var gr = new GlideRecord('sys_ux_form_action_layout_group');
        gr.get(layoutGroupSysId);
        if (gr.getValue("type") === this.GROUP_TYPE_SPLIT_BUTTON) {
            this.setButtonOptions(this.COLUMN_NAME_COLOR);
        } else {
            this.setDropdownOptions(this.COLUMN_NAME_COLOR);
        }
    },
    type: "ActionLayoutItemColorHelper"
};
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
	if (!window.jQuery)
		return;
	if (!window.$j_glide)
		window.$j = jQuery.noConflict();
	if (window.$j_glide && jQuery != window.$j_glide) {
		if (window.$j_glide)
		jQuery.noConflict(true);
		window.$j = window.$j_glide;
	}
})();
;
;
