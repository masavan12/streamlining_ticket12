/*! RESOURCE: /scripts/sn/common/ui/popover/_module.js */
angular.module('sn.common.ui.popover', []);
;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snBindPopoverSelection.js */
angular.module('sn.common.ui.popover').directive('snBindPopoverSelection', function(snCustomEvent) {
	"use strict";
	return {
		restrict: "A",
		controller: function($scope, $element, $attrs , snCustomEvent) {
			snCustomEvent.observe('list.record_select', recordSelectDataHandler);
			function recordSelectDataHandler(data, event) {
				if (!data || !event)
					return;
				event.stopPropagation();
				var ref = ($scope.field) ? $scope.field.ref : $attrs.ref;
				if (data.ref === ref) {
					if (window.g_form) {
						if ($attrs.addOption) {
							addGlideListChoice('select_0' + $attrs.ref, data.value, data.displayValue);
						} else {
							var fieldValue = typeof $attrs.ref === 'undefined' ? data.ref : $attrs.ref;
							window.g_form._setValue(fieldValue, data.value, data.displayValue);
							clearDerivedFields(data.value);
						}
					}
					if ($scope.field) {
						$scope.field.value = data.value;
						$scope.field.displayValue = data.displayValue;
					}
				}
			}
			function clearDerivedFields(value) {
				if (window.DerivedFields) {
					var df = new DerivedFields($scope.field ? $scope.field.ref : $attrs.ref);
					df.clearRelated();
					df.updateRelated(value);
				}
			}
		}
	};
});
;
/*! RESOURCE: /scripts/sn/common/ui/popover/directive.snComplexPopover.js */
angular.module('sn.common.ui.popover').directive('snComplexPopover', function(getTemplateUrl, $q, $http, $templateCache, $compile, $timeout){
	"use strict";
	return {
		restrict: 'E',
		replace:true,
		templateUrl: function(elem, attrs){
			return getTemplateUrl(attrs.buttonTemplate);
		},
		controller: function($scope, $element, $attrs, $q, $document, snCustomEvent, snComplexPopoverService){
			$scope.type = $attrs.complexPopoverType || "complex_popover";
			if ($scope.closeEvent){
				snCustomEvent.observe($scope.closeEvent, destroyPopover);
				$scope.$on($scope.closeEvent, destroyPopover);
			}
			$scope.$parent.$on('$destroy', destroyPopover);
			$scope.$on('$destroy', function() {
				snCustomEvent.un($scope.closeEvent, destroyPopover);
			});
			var newScope;
			var open;
			var popover;
			var content;
			var popoverDefaults = {
				container: 'body',
				html: true,
				placement: 'auto',
				trigger: 'manual',
template: '<div class="complex_popover popover" role="dialog"><div class="arrow"></div><div class="popover-content"></div></div>'
			};
			var popoverConfig = angular.extend(popoverDefaults, $scope.popoverConfig);
			$scope.loading      = false;
			$scope.initialized  = false;
			$scope.popOverDisplaying = false;
			$scope.onDownKey = function(event) {
				if (!event) return;
				var downArrowKey = 40;
				if (event.keyCode === downArrowKey || event.key === 'ArrowDown')
					$scope.togglePopover(event);
			};
			$scope.togglePopover = function(event) {
				if (!open){
					showPopover(event);
				} else {
					destroyPopover();
				}
				$scope.popOverDisplaying = !$scope.popOverDisplaying;
			};
			function showPopover(e) {
				if ($scope.loading)
					return;
				$scope.$toggleButton = angular.element(e.target);
				$scope.loading = true;
				$scope.$emit('list.toggleLoadingState', true);
				_getTemplate()
					.then(_insertTemplate)
					.then(_createPopover)
					.then(_bindHtml)
					.then(function(){
						$scope.initialized = true;
						if (!$scope.loadEvent)
							_openPopover();
					});
			}
			function destroyPopover() {
				if (!newScope)
					return;
				$scope.$toggleButton.on('hidden.bs.popover', function(){
					open = false;
					$scope.$toggleButton.data('bs.popover').$element.removeData('bs.popover').off('.popover');
					$scope.$toggleButton = null;
					snCustomEvent.fire('hidden.complexpopover.' + $scope.ref);
				});
				$scope.$toggleButton.popover('hide');
				snCustomEvent.fire('hide.complexpopover.' + $scope.ref, $scope.$toggleButton);
newScope.$broadcast('$destroy');
				newScope.$destroy();
				newScope = null;
				$scope.initialized = false;
				angular.element(popoverConfig.container).off({
					'keydown': keyDownHandler
				});
				angular.element(window).off({
					'click': complexHtmlHandler
				});
			}
			function _getTemplate() {
				return snComplexPopoverService.getTemplate(getTemplateUrl($attrs.template));
			}
			function _createPopover() {
				$scope.$toggleButton.popover(popoverConfig);
				return $q.when(true);
			}
			function _insertTemplate(response) {
				newScope = $scope.$new();
				if ($scope.loadEvent)
					newScope.$on($scope.loadEvent, _openPopover);
				content = $compile(response.data)(newScope);
				popoverConfig.content = content;
				newScope.open = true;
				snCustomEvent.fire('inserted.complexpopover.' + $scope.ref, $scope.$toggleButton);
				return $q.when(true);
			}
			function _bindHtml() {
				angular.element(popoverConfig.container).on({
					'keydown': keyDownHandler
				});
				angular.element(window).on({
					'click': complexHtmlHandler
				});
				return $q.when(true);
			}
			function complexHtmlHandler(e) {
				var parentComplexPopoverScope = angular.element(e.target).parents('.popover-content').children().scope();
				if (parentComplexPopoverScope && (parentComplexPopoverScope.type = "complex_popover") && $scope.type === "complex_popover")
					return;
				if (!open || angular.element(e.target).parents('html').length === 0)
					return;
				if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length === 0) {
					_eventClosePopover(e);
					destroyPopover(e);
				}
				if (e.target.classList.contains(popoverConfig.closeBtnClass) && e.type === 'click') {
					_eventClosePopover(e);
					destroyPopover(e);
				}
			}
			function keyDownHandler(e) {
if (e.keyCode != 27)
					return;
				if (!open || angular.element(e.target).parents('html').length === 0)
					return;
				if ($scope.initialized && !$scope.loading && !$scope.$toggleButton.is(e.target) && content.parents('.popover').has(angular.element(e.target)).length > 0) {
					_eventClosePopover(e);
					destroyPopover();
				}
			}
			function _eventClosePopover(e) {
					e.preventDefault();
					e.stopPropagation();
			}
			function createAndActivateFocusTrap(popover) {
				var deferred = $q.defer();
				if (!window.focusTrap) {
					deferred.reject('Focus trap not found');
				} else {
					if (!$scope.focusTrap) {
						$scope.focusTrap = window.focusTrap(popover, { clickOutsideDeactivates: true });
					}
					try {
						$scope.focusTrap.activate({
							onActivate: function() {
								deferred.resolve();
							}
						});
					} catch(e) {
						console.warn("Unable to activate focus trap", e);
					}
				}
				return deferred.promise;
			}
			function deactivateAndDestroyFocusTrap() {
				var deferred = $q.defer();
				if (!$scope.focusTrap) {
					deferred.reject("Focus trap not found");
				} else {
					try {
						$scope.focusTrap.deactivate({
							returnFocus: false,
							onDeactivate: function () {
								deferred.resolve();
							}
						});
					} catch (e) {
						console.warn("Unable to deactivate focus trap", e);
					}
					$scope.focusTrap = null;
				}
				return deferred.promise;
			}
			function _openPopover() {
				if (open) {
					return;
				}
				open = true;
				$timeout(function() {
					$scope.$toggleButton.popover('show');
					$scope.loading = false;
					snCustomEvent.fire('show.complexpopover.' + $scope.ref, $scope.$toggleButton);
					$scope.$toggleButton.on('shown.bs.popover', function(evt) {
						var popoverObject = angular.element(evt.target).data('bs.popover'),
							$tooltip,
							popover;
						$tooltip = popoverObject && popoverObject.$tip;
						popover = $tooltip && $tooltip[0];
						if (popover) {
							createAndActivateFocusTrap(popover);
						}
						snCustomEvent.fire('shown.complexpopover.' + $scope.ref, $scope.$toggleButton);
						var element = document.querySelector('.filter-accordion-title');
						if (element)
							element.focus();
					});
					$scope.$toggleButton.on('hide.bs.popover', function () {
						deactivateAndDestroyFocusTrap().finally(function() {
							$scope.$toggleButton.focus();
						});
					});
				}, 0 );
			}
		}
	};
});
;
/*! RESOURCE: /scripts/sn/common/ui/popover/service.snComplexPopoverService.js */
angular.module('sn.common.ui.popover').service('snComplexPopoverService', function($http, $q, $templateCache){
	"use strict";
	return {
		getTemplate: getTemplate
	};
	function getTemplate(template){
		return $http.get(template, {cache: $templateCache});
	}
});
;
;
/*! RESOURCE: /scripts/sn/common/ui/popover/js_includes_ui_popover.js */
/*! RESOURCE: /scripts/app.form_presence/app.form_presence.js */
angular.module('sn.form_presence', ['sn.base', 'sn.common.presence', 'sn.messaging', 'sn.i18n', 'sn.common.controls', 'sn.common.avatar', 'sn.common.ui.popover', 'sn.common.user_profile']).directive('formPresence',
		function(snRecordWatcher, getTemplateUrl, $rootScope, $q, i18n) {
	"use strict";
	return {
		restrict: 'E',
		templateUrl: getTemplateUrl('ng_form_presence.xml'),
		controller: function($scope, $http, $window, userData, ambAIA) {
			
			var aiexEnabled = $window.aiex.agentic_processes_view_enabled === 'true';
			if(aiexEnabled){
				$scope.activeAIA = {
					initials: i18n.getMessage('AI'),
					displayName: i18n.getMessage('Now Assist'),
					name: i18n.getMessage('Now Assist'),
					status: i18n.getMessage('working'),
					presence: [],
					badge_count: 0
				};
				ambAIA.preloadAIA().then(function(current){
					setActiveAIA(current);
					ambAIA.initExecutionPlanWatcher();
					ambAIA.initMessageWatcher(current);
				});
				$rootScope.$on('aiex.aia.activity', function() {
					ambAIA.getCurrentRuns().then(function(current){
						setActiveAIA(current);
					});
				});
				function setActiveAIA(presence) {
					$scope.activeAIA.presence = ambAIA.populatePresence(presence);
					$scope.activeAIA.activePresence = ambAIA.getActivePresence($scope.activeAIA.presence);
					$scope.activeAIA.shouldAnimate = ambAIA.shouldAnimate($scope.activeAIA.presence);
					
					$scope.activeAIA.badge_count = ambAIA.getBadgeCount($scope.activeAIA.presence);
					var badgeCountEvent = new CustomEvent('aiex.aia.badge', {detail: {count: $scope.activeAIA.badge_count}});
					$window.dispatchEvent(badgeCountEvent);
				}
			}
			var viewingUsersCounter = 0;
			$scope.viewingUsers = [];
			if (g_form.isDatabaseView())
				return;
			$rootScope.$on('sn.sessions', function(somescope, presence) {
				validateViewingUsers(presence);
			});
			if (typeof(g_form) != "undefined")
				snRecordWatcher.initRecord(g_form.getTableName(), g_form.getUniqueValue());
			function validateViewingUsers(sessions) {
				var raceCounter = ++viewingUsersCounter;
				var viewingUsers = [];
				var promises = [];
				angular.forEach(sessions, function(item) {
					var user = {
						avatar: item.user_avatar,
						initials: item.user_initials,
						userID: item.user_id,
						displayName: item.user_display_name,
name: item.user_display_name,
						status: item.status
					};
					if (user.avatar && user.initials)
						viewingUsers.push(user);
					else {
						promises.push(userData.getUserById(user.userID).then(function(userInfo) {
							user.initials = userInfo.user_initials;
							user.avatar = userInfo.user_avatar;
							viewingUsers.push(user);
						}));
					}
				});
				$q.all(promises).then(function() {
					if (raceCounter == viewingUsersCounter)
						setViewingUsers(viewingUsers);
				});
			}
			function setViewingUsers(users) {
				$scope.viewingUsers = users;
				if ($scope.viewingUsers.length !== 0) {
					if (!$scope.$$phase)
						$rootScope.$apply();
					$rootScope.$emit('sn.presence', $scope.viewingUsers);
				}
			}
		},
		link: function($scope, $element) {
			$scope.$watch('viewingUsers.length', function(newValue, oldValue) {
				if (oldValue <= 1  && newValue > 1)
					$element.find('.sn-popover-presence').tooltip().popover();
			});
		}
	}
}).run(function($rootScope, $http, userData, i18n, ambAIA) {
	"use strict";
var previousMessages = {};
var previousDecorations = {};
	if (typeof g_form != "undefined" && g_form.isDatabaseView())
		return;
	$rootScope.$on('record.updated', function(someScope, data) {
		if (data.sys_id !== g_form.getUniqueValue())
			return;
		var modifiedFields = g_form.modifiedFields;
		var visibleElements = [];
		var hiddenElements = [];
		angular.forEach(data.changes, function(field) {
			if (isConcurrentModification(data, field, modifiedFields) || isCurrentActiveElement(data, field)) {
				if (!g_form.submitted)
					showConcurrentFieldMsg(data, field);
			} else {
				var uiEl = g_form.getGlideUIElement(field);
				if (!uiEl)
					return;
				if (uiEl.getType() == 'journal_input')
					return;
				if (!g_form.submitted && !g_submitted && data.record) {
					if(uiEl.getElementParentNode().offsetParent) visibleElements.push(field);
					else hiddenElements.push(field);
				}
			}
		});
		[...visibleElements, ...hiddenElements].forEach(field => showFieldUpdatedDecoration(data, field));
	});
	function isConcurrentModification(data, field, modifiedFields) {
		return modifiedFields[g_form.getTableName() + '.' + field]
			&& data.record && data.record.sys_updated_by && g_user.getUserName() != data.record.sys_updated_by.value;
	}
	function isCurrentActiveElement(data, field) {
		if (typeof document.activeElement === 'undefined') {
			return;
		}
		return document.activeElement.name === g_form.getTableName() + '.' + field
			&& g_user.getUserName() != data.record.sys_updated_by.value;
	}
	function showConcurrentFieldMsg(data, field) {
		if (!(field in data.record))
			return;
		getUserDisplayName(data.record.sys_updated_by.display_value, function(display_name) {
			var displayValue = data.record[field].display_value;
			var message = i18n.getMessage("{name} has set this field to {value}").withValues({name : display_name, value : displayValue});
			if (!displayValue)
				message = i18n.getMessage("{name} has cleared the value of this field").withValues({name : display_name});
			if (previousMessages[field])
				g_form.hideFieldMsg(field);
			previousMessages[field] = message;
			g_form.showFieldMsg(field, message, 'error');
		})
	}
	function showFieldUpdatedDecoration(data, field) {
		if (typeof data.record[field] !== 'undefined') {
			try {
				g_form.setLiveUpdating(true);
				var value = data.record[field].value;
				var displayValue = data.record[field].display_string || data.record[field].display_value;
				g_form.setValue(field, value, displayValue);
				g_form.setLiveUpdateOriginalValue(field, value, displayValue);
			} finally {
				g_form.setLiveUpdating(false);
			}
		}
		getUserDisplayName(data.record.sys_updated_by.display_value, function(display_name) {
			var message = i18n.getMessage("{name} has modified this field value").withValues({name : display_name.escapeHTML()});
			if (previousDecorations[field])
				g_form.removeDecoration(field, 'icon-activity-circle', previousDecorations[field], 'color-accent');
			previousDecorations[field] = message;
			g_form.addDecoration(field, 'icon-activity-circle', message, 'color-accent');
		});
	}
	function getUserDisplayName(user_name, callback) {
		userData.getUserByName(user_name).then(function(userInfo) {
			var result = user_name;
			if (userInfo && userInfo.user_name == user_name)
				result = userInfo.user_display_name;
			callback.call(null, result);
		});
	}
}).config(function($locationProvider) {
	$locationProvider.html5Mode({rewriteLinks: false});
});
;
/*! RESOURCE: /scripts/app.form_presence/service.userData.js */
angular.module('sn.form_presence').service('userData', function($http, $q) {
	var userCache = {
		sys_id: {},
		user_name: {}
	}
	function tryCache(field, value) {
		return userCache[field][value];
	}
	function loadCache(result) {
		userCache.sys_id[result.user_sys_id] = result;
		userCache.user_name[result.user_name] = result;
	}
	function getUserBy(field, value) {
		var defered = $q.defer();
		var cachedResult = tryCache(field, value);
		if (cachedResult) {
			defered.resolve(cachedResult);
			return defered.promise;
		}
var url = '/api/now/ui/user/';
		if (field == 'user_name')
url += 'user_name/' + value;
		else
			url += value;
		$http.get(url).success(function(response) {
			loadCache(response.result);
			defered.resolve(response.result);
		});
		userCache[field][value] = defered.promise;
		return defered.promise;
	}
	return {
		getUserById: function(userId) {
			return getUserBy('sys_id', userId);
		},
		getUserByName: function(userName) {
			return getUserBy('user_name', userName);
		}
	}
})
;
/*! RESOURCE: /scripts/app.form_presence/constants.activeAIA.js */
angular.module('sn.form_presence')
    .constant('NOW_ASSIST_IN_PROGRESS', 'Now Assist is currently working on this record.')
    
    .constant('STATE_REASONS', {
        NO_ACTIVITY: 'no_activity',
        USER_EXITED: 'user_exited',
        LIVE_AGENT_REQUESTED: 'live_agent_requested'
    })
    
    .constant('CARD_UI_STATES', {
        REVIEW_OUTPUT: 'review_output',
        REQUIRES_INPUT: 'requires_input',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
        IN_PROGRESS: 'in_progress'
    })
    
    .constant('CARD_STATE_CONFIG', {})
        
    .run(function(CARD_STATE_CONFIG, CARD_UI_STATES) {
        CARD_STATE_CONFIG[CARD_UI_STATES.FAILED] = {
            variant: 'critical',
            icon: 'icon-error',
            label: 'Failed'
        };
        
        CARD_STATE_CONFIG[CARD_UI_STATES.CANCELLED] = {
            variant: 'critical',
            icon: 'icon-clear',
            label: 'Cancelled'
        };
        
        CARD_STATE_CONFIG[CARD_UI_STATES.REVIEW_OUTPUT] = {
            variant: 'info',
            icon: 'icon-check-circle',
            label: 'Review output'
        };
        
        CARD_STATE_CONFIG[CARD_UI_STATES.REQUIRES_INPUT] = {
            variant: 'warning',
            icon: 'icon-alert',
            label: 'Requires input'
        };
    });
;
/*! RESOURCE: /scripts/app.form_presence/service.ambAIA.js */
angular.module('sn.form_presence').service('ambAIA', function(
    snRecordWatcher, 
    $rootScope, 
    $http,
    i18n, 
    CARD_UI_STATES, 
    CARD_STATE_CONFIG) {
    'use strict';
    var service = this;
    var executionPlanWatcherInitialized = false;
    var messageWatcherInitialized = false;
	var currentTable = g_form.getTableName();
	var currentSysId = g_form.getUniqueValue();
	if (!currentTable || !currentSysId) {
		console.log('ambAIA: Cannot initialize execution plan watcher - missing table or sys_id');
		return;
	}
    service.getCurrentRuns = function(){
        var payload = {
			recordTable: currentTable,
			recordSysId: currentSysId,
            fields: '',
            getUILabelData: true,
		};
		var params = {
			method: "post",
url: "/api/sn_now_canvas_ai/agentic_processing/current-runs",
			data: payload
		};
		return $http(params).then(function(response){
			return response.data.result.current;
		});
    };
	
    service.preloadAIA = function() {
		return service.getCurrentRuns();
	};
    function iterateStateCount(presence,state){
        for (var i = 0; i < presence.length; i++){
            if (presence[i].key === state) {
                presence[i].count++;
                break;
            }
        }
    }
    service.populatePresence = function(current){
        var presence = [];
        
        var uiStates = [
            CARD_UI_STATES.IN_PROGRESS,
            CARD_UI_STATES.REQUIRES_INPUT,
            CARD_UI_STATES.REVIEW_OUTPUT
        ];
        
        for (var i = 0; i < uiStates.length; i++) {
            var stateKey = uiStates[i];
            var config = CARD_STATE_CONFIG[stateKey] || {};
            
            presence.push({
                key: stateKey,
                count: 0,
                label: i18n.getMessage((config.label || stateKey)),
                variant: config.variant || 'info',
                icon: config.icon || ''
            });
        }
    
        var currentRuns = current || [];
    
        for (var j = 0; j < currentRuns.length; j++) {
            var run = currentRuns[j];
            
            if (run.isPendingInfo) {
                iterateStateCount(presence,CARD_UI_STATES.REQUIRES_INPUT);
            } else {
                var state = run.uiState.value;
                
                if (state) {
                    iterateStateCount(presence,state);
                }
            }
        }
        return presence;
    };
    service.getActivePresence = function(presence){
        var activePresence = [];
        
        for (var i = 0; i < presence.length; i++) {
            if (presence[i].count > 0) {
                activePresence.push(presence[i]);
            }
        }
        
        return activePresence.length > 0 ? activePresence : [];
    };
    service.shouldAnimate = function(presence){
        var inProgress = presence.find(function(p){ return p.key === CARD_UI_STATES.IN_PROGRESS}) || 0;
        var requiresInput = presence.find(function(p){ return p.key === CARD_UI_STATES.REQUIRES_INPUT}) || 0;
        return inProgress.count > 0 && requiresInput.count == 0;
    };
    service.getBadgeCount = function(presence){
        var reviewOutput = presence.find(function(p){ return p.key === CARD_UI_STATES.REVIEW_OUTPUT}) || 0;
        var requiresInput = presence.find(function(p){ return p.key === CARD_UI_STATES.REQUIRES_INPUT}) || 0;
        return reviewOutput.count + requiresInput.count;
    };
    function emitActivityEvent(table_name){
        if (table_name === 'sn_aia_execution_plan' || table_name === 'sys_cs_message') {
            $rootScope.$emit('aiex.aia.activity');
        }
    }
    
    service.initMessageWatcher = function(presence) {
        if (messageWatcherInitialized || !g_form) {
            return;
        }
        
        var uniqueConversationsSet = [...new Set(
            presence
            .filter(function(run){return run.conversation})
            .map(function(run){return run.conversation})
        )];
        var uniqueConversations = uniqueConversationsSet.join(',');
        
        var messagesFilterBase = '^payloadSTARTSWITH{"uiType":"InputText"^ORpayloadSTARTSWITH{"uiType":"Picker"^ORpayloadSTARTSWITH{"uiType":"Boolean"^ORpayloadSTARTSWITH{"uiType":"Date"^ORpayloadSTARTSWITH{"uiType":"Time"^ORpayloadSTARTSWITH{"uiType":"DateTime"';
		var encodedQuery = 'conversationIN'+uniqueConversations+messagesFilterBase;
	
        snRecordWatcher.initList('sys_cs_message', encodedQuery);
        $rootScope.$on('record.updated', function(event, data) {
            emitActivityEvent(data.table_name);
        });
        messageWatcherInitialized = true;
    }
    service.initExecutionPlanWatcher = function() {
        var aiaAgentBackgroundFilter = 'conversation.device_type=AI Agent Background^stateINin_progress,completed,wrap_up,terminated,abandoned^related_task_table='+currentTable+'^related_task_record='+currentSysId;
        var otherDevicesFilter = 'conversation.device_type!=AI Agent Background^state=completed^related_task_table='+currentTable+'^related_task_record='+currentSysId;
        var encodedQuery = aiaAgentBackgroundFilter+'^NQ'+otherDevicesFilter;
        if (executionPlanWatcherInitialized || !g_form) {
            return;
        }
        snRecordWatcher.initList('sn_aia_execution_plan', encodedQuery);
        $rootScope.$on('record.updated', function(event, data) {
            emitActivityEvent(data.table_name);
        });
        $rootScope.$on('record.inserted', function(event, data) {
            emitActivityEvent(data.table_name);
        });
        $rootScope.$on('record.deleted', function(event, data) {
            emitActivityEvent(data.table_name);
        });
        executionPlanWatcherInitialized = true;
    };
});
;
;
/*! RESOURCE: /scripts/js_includes_form_presence.js */
