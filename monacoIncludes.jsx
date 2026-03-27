/*! RESOURCE: /scripts/classes/monaco/monacoEnvironment.js */
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		function url(type) {
return "scripts/snc-code-editor/" + type + ".worker.bundle.min.jsx?sysparm_substitute=false";
		}
		if (label === "json") {
			return url("json");
		}
		if (label === "css") {
			return url("css");
		}
		if (label === "html") {
			return url("html");
		}
		if (label === "typescript" || label === "javascript") {
			return url("ts");
		}
		return url("editor");
	}
};
;
/*! RESOURCE: /scripts/classes/monaco/GlideEditorMonaco.js */
var g_glideEditors = g_glideEditors || {};
var g_glideEditorArray = g_glideEditorArray || [];
const fetchCompletions = (url, onsuccess, onerror, g_ck) => {
	let xhr;
	if (typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
	else {
		const versions = [
			'MSXML2.XmlHttp.5.0',
			'MSXML2.XmlHttp.4.0',
			'MSXML2.XmlHttp.3.0',
			'MSXML2.XmlHttp.2.0',
			'Microsoft.XmlHttp'
		];
		for (let i = 0, len = versions.length; i < len; i++) {
			try {
				xhr = new window.ActiveXObject(versions[i]);
			} catch (e) {}
		}
	}
	xhr.onreadystatechange = () => {
		if (xhr.readyState === 4) xhr.status === 200 ? onsuccess(xhr.response) : onerror(xhr.response);
	};
	xhr.open('GET', url, true);
	xhr.setRequestHeader('X-UserToken', g_ck);
xhr.setRequestHeader('Accept', 'application/json');
xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send('');
};
var GlideEditorMonaco = Class.create({
	initialize: function (id, textareaId, monacoOptions, options) {
		this.id = id;
		this.textareaId = textareaId;
		this._showEditor();
		var el = $(id);
		var elTextArea = $(textareaId);
		this.originalValue = elTextArea.value;
		this.fetchedDeclarations = false;
		this.languages = {
			JAVASCRIPT: "javascript",
			HTML: "html"
		};
		var editorWithGlyphMargin = monacoOptions.language === this.languages.JAVASCRIPT && !options.isClientScript;
		this.monacoOptions = Object.assign({
			detectIndentation: false,
suggest: {showInterfaces: false},
			contextmenu: false,
			wordWrap: 'on',
			glyphMargin: editorWithGlyphMargin,
			lineDecorationsWidth: editorWithGlyphMargin ? "6px" : "8px",
			extraEditorClassName: editorWithGlyphMargin ? "script-editor-with-glyph-margin" : "script-editor-without-glyph-margin",
			value: elTextArea.value,
			theme: this.getTheme()
		}, monacoOptions || {}, { readOnly: monacoOptions?.readOnly || elTextArea.readOnly });
		this.options = options;
		this.messages = {
			condition: getMessage("Enter condition at line number."),
			log: getMessage("Enter log at line number."),
helpMacro: getMessage("/*The Syntax Editor macros are:\n-----------------------------"),
			helpMacroComments: getMessage("Editor macros help")
		};
		this.accessKey = this.options.accessKey.replace("CTRL", getMessage("Ctrl")).replace("SHIFT", getMessage("Shift")).replace("OPT", getMessage("Option")).replace("ALT", getMessage("Alt")).replace(" + ", getMessage("-")).replace("Cmd", getMessage("Cmd"));
		this.discoverDecorations = [];
		this.severityConf = {
			error: monaco.MarkerSeverity.Error,
			warning: monaco.MarkerSeverity.Warning,
			hint: monaco.MarkerSeverity.Hint,
			info: monaco.MarkerSeverity.Info
		};
		el.style.height = elTextArea.style.height;
		var include = Array.prototype.include;
		if (this.monacoOptions.language === this.languages.JAVASCRIPT) {
			const currentDiagnosticsOptions = monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions();
			var noValidationIfNotClientScript = this.options.isClientScript ? false : true;
			monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
				...currentDiagnosticsOptions,
				noSuggestionDiagnostics: noValidationIfNotClientScript
			});
		}
		monaco.editor.onDidCreateEditor((function(editor) {
			setTimeout((function() {
				if (this.monacoOptions.language === this.languages.JAVASCRIPT) {
					if (this.options.contextMenu === "true")
						this.enableDiscoverability();
					if (this.options.codeComplete)
						this.enableAutocomplete();
				}
			}).bind(this));
			setTimeout((function() {
				Array.prototype.include = include;
			}).bind(this), 5000);
			try {
				if (typeof window.CodeEditorTracker !== 'undefined' && typeof window.NowAssistCodeProvider === 'undefined' && typeof window.SidekickProvider === 'undefined') {
					const analytics = new window.CodeEditorTracker();
					analytics.initMonacoTelemetry(editor);
				}
			} catch (e) {
				console.log('Error initializing telemetry', e);
			}
		}).bind(this));
		delete Array.prototype.include;
		var ed = this.editor = monaco.editor.create(el, this.monacoOptions);
		var model = this.model = ed.getModel();
		model.onDidChangeContent((function(e) {
			elTextArea.value = ed.getValue();
			this._onTextChange();
		}).bind(this));
		ed.onDidContentSizeChange((function() {
			var minHeight = this.options.minHeight || 175;
			var maxHeight = this.options.maxHeight || 435
			var contentHeight = Math.min(Math.max(minHeight, model.getLineCount() * 19), maxHeight);
			el.style.height = contentHeight + "px";
			ed.layout();
		}).bind(this));
		if (this.monacoOptions.language === this.languages.JAVASCRIPT) {
			this._initMacros();
			var getDiscoveredLiteral = function(elem) {
				var elemClassList = elem.classList;
				if (elemClassList.contains("discoverable-text")) {
					var type, key;
var name = elem.innerText.replace(/"|"/g, "");
					var listLength = elemClassList.length;
					for (var i = 0; i < listLength; i++) {
						var className = elemClassList.item(i);
						if (className.startsWith("scriptInclude")) {
							type = "sys_script_include";
							key = className.substring(className.indexOf("-") + 1);
						}
						if (className.startsWith("dbObject")) {
							type = "sys_db_object";
							key = className.substring(className.indexOf("-") + 1);
						}
						if (className.startsWith("glideApi")) {
							type = "api";
							key = className.substring(className.indexOf("-") + 1);
						}
					}
					key = key.replace("XXdotXX", ".");
					if (!!key && !!type && !!name)
						return {
							type: type,
							key: key,
							name: name
						};
				}
				return;
			};
			var showEditorContext = function(event, literal) {
				event.preventDefault();
				return GlideEditorContextMenu.showEditorContext(event, literal, true);
			};
			el.on("contextmenu", (function(event) {
				var selection = this.model.getValueInRange(this.editor.getSelection());
				if (selection)
return true;
				var literal = getDiscoveredLiteral(event.target);
				if (literal)
					return showEditorContext(event, literal);
				return false;
			}).bind(this));
			el.on("mousedown", (function(event) {
				var osKeyFlag = event.metaKey;
				if (getMessage("Ctrl").indexOf(this.options.accessKey) === 0)
					osKeyFlag = event.ctrlKey;
				if (osKeyFlag && event.which == "1") {
					var literal = getDiscoveredLiteral(event.target);
					if (literal)
						GlideEditorContextMenu.openDefinitionTab(literal);
				}
			}).bind(this));
			this.isBreakpointsEnabled = this.options.breakpoints.breakpoints;
			if (this.isBreakpointsEnabled)
				this.monacoCommmon = new GlideEditorMonacoCommon(textareaId, this.editor, this.options.breakpoints, this.monacoOptions.readOnly, this.messages);
			if (this.options.linter)
				this.initLint();
		}
		if (!this.monacoOptions.readOnly)
			this.onEditorContentChanged();
		this.editor.onDidFocusEditorText((() => {
			this._registerCommands();
		}).bind(this));
		if (this.monacoOptions.language === this.languages.HTML) {
			eval("var apiListObj = " + options.apiList);
			var tags = [];
			if (apiListObj && apiListObj.jellySchema) {
				var attributes;
				for (var tagName in apiListObj.jellySchema) {
					attributes = [];
					for (var attr in apiListObj.jellySchema[tagName].attrs) {
						attributes.push({
							"name": attr
						})
					}
					tags.push({
						"name": tagName,
						"attributes": attributes
					});
				}
			}
			var data = {
				"version": 1.1,
				"tags": tags
			};
			monaco.languages.html.htmlDefaults.setOptions({
				"data": {
					"useDefaultDataProvider": true,
					"dataProviders": [data]
				}
			});
		}
		var themeEl = document.getElementById("polarisberg_theme_variables");
		if (themeEl) {
			var observer = new MutationObserver((function() {
				setTimeout((function() {
					monaco.editor.setTheme(this.getTheme());
				}).bind(this), 750);
			}).bind(this));
			observer.observe(themeEl, {
				attributeFilter: ["href"]
			});
		}
		var debounce = function(func, delay) {
			var debounceTimer;
			return function() {
				var context = this;
				var args = arguments;
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(function () {
					func.apply(context, args);
				}, delay);
			};
		};
		var resizeObserverDebounced = debounce(function() {
			ed.layout();
		}, 500);
		new ResizeObserver(resizeObserverDebounced).observe(el);
		g_glideEditors[this.textareaId] = this;
		g_glideEditorArray[g_glideEditorArray.length] = this;
	},
	getExtraCommands: function() {
		return {
			"showKeyMap": getMessage("Help"),
			"fullScreen": getMessage("Toggle Full Screen"),
			"find": getMessage("Start Searching"),
			"findNext": getMessage("Find Next"),
			"findPrev": getMessage("Find Previous"),
			"formatCode": getMessage("Format Code"),
			"replace": getMessage("Replace"),
			"replaceAll": getMessage("Replace All"),
			"commentSelection": getMessage("Toggle Comment"),
			"scriptDebugger": getMessage("Open Script Debugger")
		};
	},
	getExtraKeyMap: function() {
		var accessKey = this.accessKey;
		
		var isMac = window.navigator.userAgent.indexOf('Macintosh') >= 0;
		var displayModifierKey = isMac ? getMessage("Option") : getMessage("Alt");
		return {
			"showKeyMap": new GwtMessage().getMessage("{0}+H", accessKey),
			"fullScreen": new GwtMessage().getMessage("{0}+{1}+Enter", accessKey, displayModifierKey),
			"find": new GwtMessage().getMessage("{0}+F", accessKey),
			"findNext": new GwtMessage().getMessage("{0}+G", accessKey),
			"findPrev": new GwtMessage().getMessage("{0}+Shift+G", accessKey),
			"formatCode": new GwtMessage().getMessage("{0}+{1}+L", accessKey, displayModifierKey),
			"replace": new GwtMessage().getMessage("{0}+{1}+K", accessKey, displayModifierKey),
			"replaceAll": new GwtMessage().getMessage("{0}+{1}+R", accessKey, displayModifierKey),
"commentSelection": new GwtMessage().getMessage("{0}+{1}+/", accessKey, displayModifierKey)
		}
	},
	toString: function () {
		return "GlideEditorMonaco";
	},
	_onTextChange: function() {
		var ed = this.editor;
		if (!ed)
			return;
		var el = $(this.textareaId);
		var value = ed.getValue();
		if (el.changed) {
			if (value === this.originalValue)
				this._clearModified(el);
		} else {
			if (!el.changed && (ed.getValue() !== this.originalValue)) {
				this._setModified(el);
			}
		}
		onChangeLabelProcess(this.textareaId);
		fieldChanged(this.textareaId, el.changed);
	},
	_clearModified: function (el) {
		el.changed = false;
	},
	_setModified: function (el) {
		var form = el.up("form");
		if (!form)
			return;
		if ($("sys_original." + this.textareaId).getValue() !== el.getValue())
			el.changed = true;
	},
	changeJsEditorPreference: function(value) {
		var opposite;
		if (value == "true")
			opposite = "false";
		else if (value == "false")
			opposite = "true";
		else
			return;
		setPreference("glide.ui.javascript_editor", value);
		if (value == "false") {
			this._hideEditor();
		} else {
			this._showEditor();
			if (this.isBreakpointsEnabled)
				this.monacoCommmon = new GlideEditorMonacoCommon(this.textareaId, this.editor, this.options.breakpoints, this.monacoOptions.readOnly, messages);
		}
		var toggleElementShow = gel("js_editor_" + value + "." + this.textareaId);
		var toggleElementHide = gel("js_editor_" + opposite + "." + this.textareaId);
		showObjectInline(toggleElementShow);
		hideObject(toggleElementHide);
	},
	_hideEditor: function () {
		var el = $(this.id);
		var teaxtareaEl = $(this.textareaId);
		el.style.display = "none";
		teaxtareaEl.style.height = el.style.height;
		teaxtareaEl.style.display = "";
		$(this.textareaId + ".editor.toolbar").style.display = "none";
		$(this.textareaId + ".editor.toolbar.instructional.info").style.display = "none";
		$(this.textareaId + ".noeditor.toolbar").style.display = "";
		$("go_to_script." + this.textareaId).style.visibility = "";
		$("go_to_script." + this.textareaId).style.display = "";
	},
	_showEditor: function () {
		$(this.id).style.display = "";
		var teaxtareaEl = $(this.textareaId);
		teaxtareaEl.style.display = "none";
		if (this.model)
			this.model.setValue(teaxtareaEl.value);
		$(this.textareaId + ".noeditor.toolbar").style.display = "none";
		$(this.textareaId + ".editor.toolbar").style.display = "";
		$(this.textareaId + ".editor.toolbar.instructional.info").style.display = "";
	},
	showKeyMap: function(editor) {
		var dialog = new GlideModal("cm_key_map");
		dialog.setTitle(getMessage("Editor Key Map"));
		dialog.setWidth(400);
var bodyText = '<style>td {padding-right: 5px;}</style><table style="margin-left: 5px">';
		var shortCut;
		var extraCommands = this.getExtraCommands();
		var keyMap = this.getExtraKeyMap();
		for (var key in extraCommands) {
			shortCut = keyMap[key];
			if (!shortCut)
				continue;
shortCut = shortCut.replace(/\-/g,"+");
bodyText += "<tr><td><li>" + extraCommands[key] + "</li></td><td><b>" + shortCut + "</b></td></tr>";
		}
		if (this.monacoOptions.language === this.languages.JAVASCRIPT) {
bodyText += "</table><hr><b>" + getMessage("Macros:") + "</b>" + getMessage("Type help and hit TAB to view the list of macros");
		}
		dialog.setBody(bodyText);
	},
	fullScreen: function(editor, id) {
		var TREE_OFF = "Tree-Off";
		var TOOL_FULLSCREEN = "Monaco-Toolbar-fullscreen";
		var NONE = "none";
var ie = /MSIE \d/.test(navigator.userAgent);
		if (ie) {
			alert(getMessage("Full Screen mode is not available for IE versions 10 and under"));
			return;
		}
		var fieldsScriptTree = gel(id + ".fields_script_tree");
		var labelElem = gel("label." + id);
		var columnElem = gel("column." + id);
		var editorElem = gel(id + ".editor.toolbar");
		var debugContainer = gel(this.id);
		if (!this.isFullScreen) {
			labelElem.appendChild(editorElem);
			labelElem.className += " " + TOOL_FULLSCREEN;
			$("js_editor_true." + id).hide();
			debugContainer.className += " " + "Monaco-fullscreen";
			if (fieldsScriptTree) {
				fieldsScriptTree.className = "Monaco-Tree-fullscreen well";
				if (fieldsScriptTree.parentNode.style.display == NONE) {
					$$("div.Monaco-fullscreen")[0].addClassName(TREE_OFF);
				}
			} else {
				$$("div.Monaco-fullscreen")[0].addClassName(TREE_OFF);
			}
		}  else {
			if(fieldsScriptTree) {
				fieldsScriptTree.className = "well script_tree";
				if (fieldsScriptTree.parentNode.style.display == NONE) {
					$$("div.Monaco-fullscreen")[0].removeClassName(TREE_OFF);
				}
			} else {
				$$("div.Monaco-fullscreen")[0].removeClassName(TREE_OFF);
			}
			$$("div.Monaco-fullscreen")[0].removeClassName("Monaco-fullscreen");
			columnElem.appendChild(editorElem);
			labelElem.className = labelElem.className.replace(" " + TOOL_FULLSCREEN, "");
			$("js_editor_true." + id).show();
		}
		editor.layout();
		this.isFullScreen = !this.isFullScreen;
	},
	find: function(editor) {
		editor.getAction("actions.find").run();
	},
	findNext: function(editor) {
		editor.getAction("editor.action.nextSelectionMatchFindAction").run();
	},
	findPrev: function(editor) {
		editor.getAction("editor.action.previousSelectionMatchFindAction").run();
	},
	replace: function(editor) {
		editor.getAction("editor.action.startFindReplaceAction").run();
	},
	replaceAll: function(editor) {
		editor.getAction("editor.action.startFindReplaceAction").run();
	},
	commentSelection: function(editor) {
		editor.getAction("editor.action.commentLine").run();
	},
	scriptDebugger: function(editor) {
		var launchFunction;
		if (window.top.launchScriptDebugger){
			launchFunction = window.top.launchScriptDebugger;
		}
		else if (window.top.opener && window.top.opener.top.launchScriptDebugger) {
			launchFunction = window.top.opener.top.launchScriptDebugger;
		}
		else {
			launchFunction = this._launchScriptDebugger;
		}
		launchFunction(monaco.scriptInfo.id, monaco.scriptInfo.type, monaco.scriptInfo.field);
	},
	toggleLinter: function(editor) {
		if (!this.lintWorker)
			this.initLint();
		else
			this.toggleSyntaxCheck();
	},
	toggleLintConfig: function(value) {
		this.options.eslintConfig = JSON.stringify(value);
		this.initLint();
	},
	enableAutocomplete: function() {
		this.editorLibraries = {};
		this.editorLibraryDisposables = [];
		this.scriptIncludeLibraries = {};
		this.scriptIncludeDisposables = [];
		this.focusedEditor = null;
		var modelId = this.model.id;
		if (!this.editorLibraries[modelId])
			this.registerEditorOnFocus();
		this.editorLibraries[modelId] = [];
		if (!this.options.isClientScript && !this.options.lazyLoadCompletions)
			this.addCompletions();
		if (this.options.codeComplete) {
			this.editorLibraries[modelId].push(this.options.apiList);
			this.enableScriptIncludeIntellisense();
		}
	},
	addCompletions: function() {
const url = `/api/now/syntax_editor/completions?scope=`;
		fetchCompletions(
			url,
			response => this.addDeclarations(JSON.parse(response).result.result, this.model.id),
			() => {
			},
			g_ck
		);
	},
	addDeclarations: function(declarations, modelId) {
		this.editorLibraries[modelId].push(declarations);
		this.editorLibraries[modelId].forEach((function(library) {
			this.editorLibraryDisposables.push(monaco.languages.typescript.javascriptDefaults.addExtraLib(library));
		}).bind(this));
		this.fetchedDeclarations = true;
	},
	_registerCommands: function(){
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, (() => {
				this.showKeyMap();
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.Enter, (() => {
				this.fullScreen(this.editor, this.textareaId);
			}).bind(this));
			
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyL, (() => {
				this.formatCode(this.editor);
			}).bind(this));
			
			this.editor.addCommand(monaco.KeyMod.CtrlCmd |  monaco.KeyMod.Alt | monaco.KeyCode.KeyK, (() => {
				this.replace(this.editor);
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd |  monaco.KeyMod.Alt | monaco.KeyCode.KeyR, (() => {
				this.replaceAll(this.editor);	
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.Slash, (() => {
				this.commentSelection(this.editor);
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, (() => {
				this.find(this.editor);
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, (() => {
				this.findNext(this.editor);
			}).bind(this));
			this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Shift | monaco.KeyCode.KeyG, (() => {
				this.findPrev(this.editor);
			}).bind(this));
	},
	registerEditorOnFocus: function() {
		var modelId = this.model.id;
		this.editor.onDidFocusEditorWidget((function() {
			if (this.focusedEditor !== modelId && this.monacoOptions.language === this.languages.JAVASCRIPT && !this.monacoOptions.readOnly) {
				this.focusedEditor = this.model.id;
				this.editorLibraryDisposables.forEach(function(library) {
					library.dispose();
				});
				this.editorLibraryDisposables = [];
				if (!this.fetchedDeclarations && !this.options.isClientScript) {
					this.addCompletions();
				}
				else {
				this.editorLibraries[modelId].forEach((function(library) {
					this.editorLibraryDisposables.push(monaco.languages.typescript.javascriptDefaults.addExtraLib(library));
				}).bind(this));
				}
				if (!this.options.codeComplete && this.scriptIncludeDisposables.length > 0) {
					this.scriptIncludeDisposables.forEach(function(library) {
						library.dispose();
					});
					this.scriptIncludeDisposables = [];
				} else if (this.options.codeComplete && this.scriptIncludeDisposables.length === 0) {
					for (var scriptIncludeName in this.scriptIncludeLibraries) {
						this.scriptIncludeDisposables.push(
							monaco.languages.typescript.javascriptDefaults.addExtraLib(
								this.scriptIncludeLibraries[scriptIncludeName]
							)
						);
					}
				}
			}
		}).bind(this));
	},
	enableScriptIncludeIntellisense: function() {
		if (!this.autoCompleteWorker) {
			this.intialiseEditorCache()
				.then((function() {
					this.initializeIntellisenseForScriptIncludes();
				}).bind(this))
				.catch(function() {});
		}
	},
	intialiseEditorCache: function() {
		var contextMenuInfo = this.options.contextMenuData ? JSON.parse(this.options.contextMenuData): "";
		var flushTime = contextMenuInfo.flushTime;
		return new Promise((function(resolve, reject) {
			if (!this.editorCacheWorker) {
				this.editorCacheWorker = this.initializeEditorCacheWorker();
				if (this.editorCacheWorker) {
					this.editorCacheWorker.loadCache(flushTime, function(data) {
						resolve({ editorCacheReloaded: data.cacheReloaded });
					});
				} else reject("Editor cache worker failed to initalize");
			} else resolve({ editorCacheReloaded: false });
		}).bind(this));
	},
	toggleSyntaxCheck: function() {
		if (this.enableSyntaxCheck) this.removeLintErrors();
		else this.lintValidator();
		this.enableSyntaxCheck = !this.enableSyntaxCheck;
	},
	removeLintErrors: function() {
		monaco.editor.setModelMarkers(this.model, "LINT_MARKER", []);
	},
	initializeEditorCacheWorker: function() {
		if (!window.SharedWorker) return;
		this.editorCacheCallbacks = {};
this.editorCacheWorker = new SharedWorker("scripts/classes/monaco/editorCacheWorker.js?v=02-02-2026_1554&sysparm_substitute=false");
		this.editorCacheWorkerPort = this.editorCacheWorker.port;
		var addCallback = (function(operation, callback) {
			try {
				this.editorCacheCallbacks[operation] = this.editorCacheCallbacks[operation] || {};
				var id = Math.floor(Math.random() * 1001);
				this.editorCacheCallbacks[operation][id] = {
					callback,
					start: Date.now()
				};
				return id;
			} catch (e) {}
		}).bind(this);
		var removeCallback = (function(operation, id) {
			try {
				if (this.editorCacheCallbacks[operation]) delete this.editorCacheCallbacks[operation][id];
			} catch (e) {}
		}).bind(this);
		this.editorCacheWorkerPort.onmessage = (function(event) {
			try {
				var data = event.data;
				var id = data.id || "";
				var operation = data.operation || "";
				if (this.editorCacheCallbacks[operation] && this.editorCacheCallbacks[operation][id])
					this.editorCacheCallbacks[operation][id].callback && this.editorCacheCallbacks[operation][id].callback(data || {});
				removeCallback(data.operation, data.id);
			} catch (e) {}
		}).bind(this);
		return {
			loadCache: (function(cacheFlushTime, callback) {
				try {
					var operation = "loadCache";
					var id = addCallback(operation, callback);
					this.editorCacheWorkerPort.postMessage({
						operation,
						id,
						cacheFlushTime,
						g_ck: window.g_ck,
						transactionSource: window.transaction_source
					});
				} catch (e) {}
			}).bind(this),
			establishConnectionWithAutoCompleteWorker: (function(portToCommunicateWithAutoCompleteWorker) {
				var operation = "establishConnectionWithAutoCompleteWorker";
				this.editorCacheWorkerPort.postMessage(
					{
						operation,
						portToCommunicateWithAutoCompleteWorker
					},
					[portToCommunicateWithAutoCompleteWorker]
				);
			}).bind(this),
			establishConnectionWithDiscoverWorker: (function(data, callback) {
				var portToCommunicateWithDiscoverWorker = data.portToCommunicateWithDiscoverWorker;
				var editorCacheReloaded = data.editorCacheReloaded;
				var operation = "establishConnectionWithDiscoverWorker";
				var id = addCallback(operation, callback);
				this.editorCacheWorkerPort.postMessage(
					{
						operation,
						id,
						portToCommunicateWithDiscoverWorker,
						editorCacheReloaded
					},
					[portToCommunicateWithDiscoverWorker]
				);
			}).bind(this),
			destroy: (function() {
				try {
					if (this.editorCacheWorkerPort) {
						this.editorCacheWorkerPort.close && this.editorCacheWorkerPort.close();
						this.editorCacheWorker = null;
						this.editorCacheWorkerPort = null;
					}
				} catch (e) {}
			}).bind(this)
		};
	},
	initializeIntellisenseForScriptIncludes: function() {
		this.initializeAutoCompleteWorker();
		if (this.autoCompleteWorker) {
			this.connectAutoCompleteWorkerWithEditorCacheWorker();
			this.editor.onDidChangeModelContent((function(event) {
				var language = this.monacoOptions.language;
				if (language === this.languages.JAVASCRIPT)
					this.requestScriptIncludeIntellisense(event);
			}).bind(this));
		}
	},
	initializeAutoCompleteWorker: function() {
var autoCompleteWorker = new SharedWorker("scripts/classes/monaco/autoCompleteWorker.js?v=02-02-2026_1554&sysparm_substitute=false");
		this.autoCompleteWorker = autoCompleteWorker.port;
		this.autoCompleteWorker.onmessage = function(event) {
			onMessage(event);
		};
		var onMessage = (function(event) {
			var data = event.data;
			switch (data.operation) {
				case "addIntellisenseforScriptInclude":
					this.addIntellisenseforScriptInclude(data.response);
					break;
				case "removeIntellisenseOfScriptIncludes":
					this.removeIntellisenseOfScriptIncludes();
					break;
				default:
					break;
			}
		}).bind(this);
		this.autoCompleteWorker.postMessage({
			operation: "requestForExistingTypeDefinitions"
		});
	},
	connectAutoCompleteWorkerWithEditorCacheWorker: function() {
		var channelBetweenAutoCompleteWorkerAndEditorCacheWorker = new MessageChannel();
		this.autoCompleteWorker.postMessage(
			{
				operation: "establishConnectionWithEditorCacheWorker",
				portToCommunicateWithEditorCacheWorker: channelBetweenAutoCompleteWorkerAndEditorCacheWorker.port1
			},
			[channelBetweenAutoCompleteWorkerAndEditorCacheWorker.port1]
		);
		this.editorCacheWorker.establishConnectionWithAutoCompleteWorker(
			channelBetweenAutoCompleteWorkerAndEditorCacheWorker.port2
		);
	},
	addIntellisenseforScriptInclude: function(response) {
		var currentModelId = this.model.id;
		if (currentModelId !== this.focusedEditor)
			return;
		for (var scriptIncludeName in response) {
			var typeDefinition = response[scriptIncludeName].typeDefinition;
			if (!this.scriptIncludeLibraries[scriptIncludeName]) {
				var scriptIncludeDetails = scriptIncludeName.split(".");
				var scopeName = scriptIncludeDetails.length > 1 ? scriptIncludeDetails[0] : undefined;
				if (scopeName)
					typeDefinition = "declare namespace " + scopeName + " { " + typeDefinition + " } " + typeDefinition;
				this.scriptIncludeLibraries[scriptIncludeName] = typeDefinition;
				if (this.options.codeComplete) {
					this.scriptIncludeDisposables.push(
						monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefinition, scriptIncludeName)
					);
				}
			}
		}
	},
	removeIntellisenseOfScriptIncludes:function() {
		this.scriptIncludeDisposables.forEach(function(library) {
			library.dispose();
		});
		this.scriptIncludeDisposables = [];
		this.scriptIncludeLibraries = {};
	},
	requestScriptIncludeIntellisense: function(event) {
		var text = event.changes[0].text;
		var range = event.changes[0].range;
		if (text === "." || text === "(" || text === "()") {
			var probableScriptIncludeName = this.determineProbableScriptIncludeName(range);
			var apisRegisteredForIntellisense = monaco.languages.typescript.javascriptDefaults.getExtraLibs();
			if (!apisRegisteredForIntellisense[probableScriptIncludeName])
				this.delegateFetchingIntellisense(probableScriptIncludeName);
		}
	},
	determineProbableScriptIncludeName: function(range) {
		var lineNumber = range.endLineNumber;
		var column = range.endColumn;
		var model = this.model;
		var wordAtPosition = model.getWordAtPosition({ lineNumber, column });
		if (wordAtPosition) {
			var probableScriptIncludeName = wordAtPosition.word;
			var startColumn = wordAtPosition.startColumn;
			var currentLineContent = model.getLineContent(lineNumber);
			var scopeName = this.options.scope;
			var contentBeforeCurrentWord = currentLineContent.substring(0, startColumn - 1);
			if (contentBeforeCurrentWord.endsWith("."))
				scopeName = model.getWordAtPosition({ lineNumber, column: startColumn - 1 }).word;
			var probableScriptIncludeNameAlongWithScope = scopeName + "." + probableScriptIncludeName;
			return probableScriptIncludeNameAlongWithScope;
		}
	},
	delegateFetchingIntellisense: function(possibleScriptIncludeName) {
		this.autoCompleteWorker.postMessage({
			operation: "requestForTypeDefinition",
			possibleScriptIncludeName
		});
	},
	enableDiscoverability: function() {
		var contextMenuData = this.options.contextMenuData;
		var contextMenuInfo = contextMenuData ? JSON.parse(contextMenuData): "";
		var apisDocResourceFlushTime = contextMenuInfo.flushTime;
		var apisDocResourceIds = contextMenuInfo.apiDocResourceIds ? JSON.parse(contextMenuInfo.apiDocResourceIds) : "";
		try {
			this.apisDocResourceIds = apisDocResourceIds;
			if (!this.discoverWorker) {
				this.intialiseEditorCache(apisDocResourceFlushTime)
					.then((function(result) {
						this.initializeDiscoverWorker(result.editorCacheReloaded);
					}).bind(this))
					.catch(function() {});
			} else this.discoverTokens();
		} catch (e) {}
	},
	initializeDiscoverWorker: function(editorCacheReloaded) {
		this.discoverWorker = this.discoverInit();
		this.connectDiscoverWorkerWithEditorCacheWorker(editorCacheReloaded);
	},
	updateTokensOnEditor: function(result) {
		try {
			var tokens = result.tokens || [];
			var decorations = [];
			for (var i = 0; i < tokens.length; i++) {
				for (var j = 0; j < tokens[i].length; j++) {
					var discoverableToken = tokens[i][j];
					var token = discoverableToken.token;
					decorations.push({
						range: new monaco.Range(token.line, token.startColumn, token.line, token.endColumn),
						options: {
							inlineClassName: "discoverable-text " + discoverableToken.type + "-" + discoverableToken.key.replace(".", "XXdotXX")
						}
					});
				}
			}
			this.discoverDecorations = this.editor.deltaDecorations(this.discoverDecorations, decorations);
		} catch (e) {}
	},
	discoverEditorTokens: function(startLineNumber) {
		try {
			this.getEditorTokens(startLineNumber, (function(lines) {
				if (lines.length > 0) {
					this.discoverWorker.discoverTokens(
						this.apisDocResourceIds,
						lines,
						startLineNumber,
						{ currentScope: this.options.scope },
this.updateTokensOnEditor.bind(this)
					);
				}
			}).bind(this));
		} catch (e) {}
	},
	getEditorTokens: function(startLineNumber, cb) {
		try {
			var lines = [];
			var model = this.model;
			startLineNumber = isNaN(startLineNumber) ? 1 : startLineNumber;
			setTimeout((function() {
				var lineCount = model.getLineCount();
				for (var i = startLineNumber; i <= lineCount; i++) {
					var editorLine = model.getLineContent(i);
					var lineTokens = monaco.editor.tokenize(editorLine, this.languages.JAVASCRIPT)[0];
					lines.push(
						lineTokens.map(function(item, index) {
							var startIndex = item.offset;
							var endIndex = lineTokens[index + 1] && lineTokens[index + 1].offset;
							var string = editorLine.substring(startIndex, endIndex);
							return {
								line: i,
								string,
								type: item.type,
								startColumn: startIndex + 1,
								endColumn: (endIndex ? endIndex : startIndex + string.length) + 1
							};
						})
					);
				}
				cb(lines);
			}).bind(this), 1000);
		} catch (e) {}
	},
	discoverInit: function() {
		if (typeof window.SharedWorker === "undefined") return;
		this.discoverCallbacks = {};
		this.discoveredTokens = [];
var discoverWorker = new SharedWorker("scripts/classes/monaco/discoverWorker.js?v=02-02-2026_1554&sysparm_substitute=false");
		this.workerPort = discoverWorker.port;
		this.workerPort.onmessage = (function(message) {
			try {
				var data = message.data || {};
				var id = data.id || "";
				var command = data.command || "";
				if (command === "discover") {
					var newlyIdentifiedTokens = data.result.tokens;
					newlyIdentifiedTokens.forEach((function(newlyIdentifiedToken) {
						this.discoveredTokens.push(newlyIdentifiedToken);
					}).bind(this));
					data.result.tokens = this.discoveredTokens;
				}
				if (this.discoverCallbacks[command] && this.discoverCallbacks[command][id])
					this.discoverCallbacks[command][id].callback && this.discoverCallbacks[command][id].callback(data.result || {});
				removeCallback(data.command, data.id);
			} catch (e) {}
		}).bind(this);
		var addCallback = (function(command, callback) {
			try {
				this.discoverCallbacks[command] = this.discoverCallbacks[command] || {};
				var id = Math.floor(Math.random() * 1001);
				this.discoverCallbacks[command][id] = {
					callback,
					start: Date.now()
				};
				return id;
			} catch (e) {}
		}).bind(this);
		var removeCallback = (function(command, id) {
			try {
				if (this.discoverCallbacks[command]) delete this.discoverCallbacks[command][id];
			} catch (e) {}
		}).bind(this);
		var removeUnprocessedTokens = (function(startLineNumber) {
			if (!startLineNumber || startLineNumber === 1) {
				this.discoveredTokens = [];
				return;
			}
			this.discoveredTokens.length = findIndex(startLineNumber);
		}).bind(this);
		var findIndex = (function(startLineNumber) {
			var low = 0;
			var high = this.discoveredTokens.length - 1;
			while (low <= high) {
var mid = Math.floor((low + high) / 2);
				var lineNumber = this.discoveredTokens[mid][0].token.line;
				if (lineNumber === startLineNumber) return mid;
				else if (lineNumber < startLineNumber) low = mid + 1;
				else high = mid - 1;
			}
			return low;
		}).bind(this);
		return {
			establishConnectionWithEditorCacheWorker: (function(portToCommunicateWithEditorCacheWorker) {
				this.workerPort.postMessage(
					{
						command: "establishConnectionWithEditorCacheWorker",
						portToCommunicateWithEditorCacheWorker
					},
					[portToCommunicateWithEditorCacheWorker]
				);
			}).bind(this),
			discoverTokens: (function(apisDocResourceIds, lines, startLineNumber, options, callback) {
				try {
					var command = "discover";
					var id = addCallback(command, callback);
					removeUnprocessedTokens(startLineNumber);
					this.workerPort.postMessage({
						apisDocResourceIds,
						command,
						id,
						lines,
						currentScope: options.currentScope || ""
					});
				} catch (e) {}
			}).bind(this),
			destroy: (function() {
				try {
					if (this.workerPort) {
						this.workerPort.close && this.workerPort.close();
						this.discoverWorker = null;
						this.workerPort = null;
					}
				} catch (e) {}
			}).bind(this)
		};
	},
	connectDiscoverWorkerWithEditorCacheWorker: function(editorCacheReloaded) {
		if (this.discoverWorker && this.editorCacheWorker) {
			var channelBetweenDiscoverWorkerAndEditorCacheWorker = new MessageChannel();
			this.discoverWorker.establishConnectionWithEditorCacheWorker(
				channelBetweenDiscoverWorkerAndEditorCacheWorker.port1
			);
			function registerDiscoverabilityEvents() {
				try {
					this.registerDiscoverEvents.call(this);
					this.discoverTokens.call(this);
				} catch (e) {}
			}
			this.editorCacheWorker.establishConnectionWithDiscoverWorker(
				{
					portToCommunicateWithDiscoverWorker: channelBetweenDiscoverWorkerAndEditorCacheWorker.port2,
					editorCacheReloaded
				},
				registerDiscoverabilityEvents.bind(this)
			);
		}
	},
	registerDiscoverEvents: function() {
		var model = this.model;
		model.onDidChangeContent(
			this.onContentChangeDebounce((function(startLineNumber) {
				this.discoverTokens(startLineNumber);
			}).bind(this), 250)
		);
	},
	discoverTokens: function(startLineNumber) {
		if (this.monacoOptions.language === this.languages.JAVASCRIPT && this.options.contextMenu === "true" && this.discoverWorker)
			this.discoverEditorTokens(startLineNumber);
	},
	onContentChangeDebounce: function(func, delay) {
		var debounceTimer;
		var startLine;
		function getFirstEditedLine(event) {
			var changes = event.changes;
			if (changes.length > 0) {
				var change = changes[changes.length - 1];
				var startLineNumber = change.range.startLineNumber;
				return startLineNumber;
			}
			return 1;
		}
		return function(event) {
			var editedLine = getFirstEditedLine(event);
			startLine = startLine < editedLine ? startLine : editedLine;
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(function() {
				func(startLine);
				startLine = undefined;
			}, delay);
		};
	},
	getFirstEditedLine: function(event) {
		var changes = event.changes;
		if (changes.length > 0) {
			var change = changes[changes.length - 1];
			var startLineNumber = change.range.startLineNumber;
			return startLineNumber;
		}
		return 1;
	},
	initLint: function() {
		this.lintWorker = {
			onmessage: (function(fn) {
				if (this.lintWorker._workerInstance) {
					this.lintWorker._workerInstance.onmessage = function(data) {
						fn(data);
					};
				}
			}).bind(this),
			postMessage: (function(data) {
				if (this.lintWorker._workerInstance) this.lintWorker._workerInstance.postMessage(data);
			}).bind(this),
			_workerInstance: null
		};
		var lintWorkerCreated = this.initLintWorker();
		if (lintWorkerCreated) {
			try {
				this.eslintConfig = JSON.parse(this.options.eslintConfig);
			} catch (e) {
				this.eslintConfig = {};
			}
			this.enableSyntaxCheck = true;
			this.lintValidator();
		}
	},
	initLintWorker: function() {
		if (typeof Worker === undefined) return false;
var linterUrl = "/scripts/snc-code-editor/eslint_bundle.min.js?v=02-02-2026_1554&sysparm_substitute=false";
var scriptUrl = "scripts/classes/monaco/lintWorker.js?v=02-02-2026_1554&sysparm_substitute=false";
		if (!window.SharedWorker) this.lintWorker._workerInstance = new Worker(scriptUrl);
		else {
			var lintSharedWorker = new SharedWorker(scriptUrl);
			this.lintWorker._workerInstance = lintSharedWorker.port;
		}
		this.lintWorker._workerInstance.postMessage({
			linterUrl: linterUrl
		});
		this.lintWorker.onmessage((function(message) {
			var data = message.data;
			this.markLintErrors(data);
		}).bind(this));
		return true;
	},
	lintValidator: function() {
		var data = this.getEditorLintData();
		data.eslintOptions = this.eslintConfig;
		this.lintWorker.postMessage(data);
	},
	getEditorLintData: function() {
		var model = this.model;
		return {
			content: model.getValue(),
			version: model.getVersionId()
		};
	},
	markLintErrors: function(data) {
		var errors = data.errors;
		var version = data.version;
		var model = this.model;
		if (version !== model.getVersionId()) return;
		var markers = this.getMarkers(errors);
		monaco.editor.setModelMarkers(model, "LINT_MARKER", markers);
	},
	getMarkers: function(errors) {
		var markers = errors.map((function(err) {
			var lineLength = this.model.getLineLength(err.from.line);
			var startColumn = err.from.column;
			if (startColumn > lineLength) startColumn = lineLength;
			return {
				startLineNumber: err.from.line,
				endLineNumber: err.to.line,
				startColumn: startColumn,
				endColumn: err.to.column,
				message: err.message,
				severity: this.severityConf[err.severity]
			};
		}).bind(this));
		return markers;
	},
	onEditorContentChanged: function() {
		var model = this.model;
		var debounce = function(func, delay) {
			var debounceTimer;
			return function() {
				var context = this;
				var args = arguments;
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(function () {
					func.apply(context, args);
				}, delay);
			};
		};
		var javascriptLintValidatorDebounce = debounce((function() {
			if (!model.isDisposed()) this.lintValidator.call(this);
		}).bind(this), 500);
		model.onDidChangeContent((function() {
			if (this.enableSyntaxCheck && this.monacoOptions.language === this.languages.JAVASCRIPT)
				javascriptLintValidatorDebounce();
		}).bind(this));
	},
	_initMacros: function() {
		var div = $("syntax_macros");
		if (!div) return;
		var macros = div.select("textarea");
		var helpList = [];
		helpList.push(this.messages.helpMacro);
		var macrosList = [];
		for (var i = 0; i < macros.length; i++) {
			var macro = macros[i];
			macrosList.push({
				name: macro.getAttribute("name") + "",
				comments: macro.getAttribute("comments") + "",
				text: macro.value
			});
			helpList.push(macro.getAttribute("name") + " - " + macro.getAttribute("comments"));
		}
helpList.push("*/")
		macrosList.push({
			name: "help",
			comments: this.messages.helpMacroComments,
			text: helpList.join("\n")
		});
		macrosList = macrosList.map(function(macro) {
			return {
				label: macro.name,
				documentation: macro.comments || "",
				insertText: macro.text,
				kind: monaco.languages.CompletionItemKind.Snippet,
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
			};
		});
		var stringifiedMacrosList = JSON.stringify(macrosList);
		monaco.languages.registerCompletionItemProvider(this.languages.JAVASCRIPT, {
			provideCompletionItems() {
				return { suggestions: JSON.parse(stringifiedMacrosList) };
			}
		});
	},
	formatCode: function(editor) {
		var language = this.monacoOptions.language;
		if (language === this.languages.JAVASCRIPT || language === this.languages.HTML) {
			var selection = editor.getSelection();
			var model = this.model;
			if (selection.isEmpty())
				selection = new monaco.Range(0, 1, model.getLineCount(), model.getLineMaxColumn(model.getLineCount()));
			var languageBeautifier = language === this.languages.JAVASCRIPT ? beautifier.js : beautifier.html;
			var content = languageBeautifier(model.getValueInRange(selection));
			editor.executeEdits("formatCode", [
				{
					range: selection,
					text: content
				}
			]);
			return;
		}
		if (editor.getSelection().isEmpty())
			editor.getAction("editor.action.formatDocument").run();
		else
			editor.getAction("editor.action.formatSelection").run();
	},
	_launchScriptDebugger: function(id, type, field) {
		var width = window.top.innerWidth - 40,
			height = window.top.innerHeight,
			x = window.top.screenX + 20,
			y = window.top.screenY + 20,
			features = "width=" + width + ",height=" + height + ",toolbar=no,status=no,directories=no,menubar=no,resizable=yes,screenX=" + x +",left="+ x +",screenY="+ y +",top="+ y;
		var debuggerWind = window.open("", "sn_ScriptDebugger", features, false),
			prevFullUrl = debuggerWind.location.href,
			reload = false;
		if (prevFullUrl === "about:blank") {
			try {
				var storedTime = localStorage.getItem("sn_ScriptDebugger"),
					currentTime = new Date().getTime();
				if (storedTime && currentTime - storedTime < 60000) {
					debuggerWind.close();
					localStorage.setItem("sn_ScriptDebuggerExist_ShowNotification", new Date().getTime());
					return;
				}
			}
			catch (e) {
			}
			reload = true;
		}
		var url = "$jsdebugger.do?scriptId=" + id + "&scriptType=" + type + "&scriptField=" + field + "&sysparm_nostack=true";
		if (!reload) {
			var prevUrl = prevFullUrl.slice(prevFullUrl.indexOf("$jsdebugger.do"));
			if (prevUrl != url) {
				reload = true;
			}
		}
		if (reload) {
			debuggerWind = window.open(url, "sn_ScriptDebugger", features, false);
		}
		debuggerWind.focus();
		debuggerWind.setTimeout(focus, 100);
	},
	getTheme: function() {
		var BACKGROUND_PRIMARY = "--now-color_background--primary";
		var NEUTRAL_0 = "--now-color--neutral-0";
		var NEUTRAL_20 = "--now-color--neutral-20";
		var bodyEl = document.getElementsByTagName("body")[0];
		function getStyle(property) {
			return getComputedStyle(bodyEl).getPropertyValue(property);
		}
		function getRGB(rgb) {
			var rgbValues = rgb.split(",");
			if (rgbValues.length !== 3)
				return;
			return {
				r: parseInt(rgbValues[0]),
				g: parseInt(rgbValues[1]),
				b: parseInt(rgbValues[2])
			}
		}
		if (getStyle(BACKGROUND_PRIMARY) === getStyle(NEUTRAL_0))
			return "vs";
		if (getStyle(BACKGROUND_PRIMARY) === getStyle(NEUTRAL_20))
			return "vs-dark";
		var rgb = getRGB(getStyle(BACKGROUND_PRIMARY));
		if (!rgb)
			return "vs";
		var calcLum = function(c) {
c = c/255;
return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
		};
		var lum = calcLum(rgb.r) * 0.2126 + calcLum(rgb.g) * 0.7152 + calcLum(rgb.b) * 0.0722;
		if (lum > 0.5)
			return "vs";
		return "vs-dark";
	}
});
GlideEditorMonaco.get = function (textareaId) {
	return g_glideEditors[textareaId];
};
GlideEditorMonaco.getAll = function () {
	return g_glideEditorArray;
};
;
/*! RESOURCE: /scripts/classes/monaco/MonacoTextAreaElement.js */
var MonacoTextAreaElement = Class.create({
	initialize: function (name) {
		this.name = name;
		this.elem = document.getElementById(this.name);
	},
	setReadOnly: function (disabled) {
		var name = this.name;
		var editor = $(name).parentNode;
		var DISABLED = "disabled";
		var gEditor = GlideEditorMonaco.get(name);
		var formatCode = name + ".formatCode";
		var toggleLinter = name + ".toggleLinter";
		var replace = name + ".replace";
		var replaceAll = name + ".replaceAll";
		var save = name + ".save";
		var gTreeButton = $(name + ".scriptTreeToggleImage");
		var gTree = $(name + ".fields_script_tree");
		GlideEditorMonaco.get(this.name).editor.updateOptions({ readOnly: disabled });
		if (disabled) {
			if (gEditor.monacoOptions.language == "javascript") {
				$(formatCode).addClassName(DISABLED);
				$(toggleLinter).addClassName(DISABLED);
				if (gTreeButton) {
					gTreeButton.hide();
					editor.addClassName("col-lg-12");
				}
				if (gTree)
					gTree.hide();
			}
			$(replace).addClassName(DISABLED);
			$(replaceAll).addClassName(DISABLED);
			$(save).addClassName(DISABLED);
		} else {
			if (gEditor.monacoOptions.language == "javascript") {
				$(formatCode).removeClassName(DISABLED);
				$(toggleLinter).removeClassName(DISABLED);
				if (gTreeButton) {
					gTreeButton.show();
					editor.removeClassName("col-lg-12");
				}
				if (gTree)
					gTree.show();
			}
			$(replace).removeClassName(DISABLED);
			$(replaceAll).removeClassName(DISABLED);
			$(save).removeClassName(DISABLED);
		}
	},
	isDisabled: function () {
		return GlideEditorMonaco.get(this.name).editor.getRawOptions()["readOnly"];
	},
	isReadOnly: function () {
		return GlideEditorMonaco.get(this.name).editor.getRawOptions()["readOnly"];
	},
	getValue: function () {
		return GlideEditorMonaco.get(this.name).editor.getValue();
	},
	setValue: function (newValue) {
		GlideEditorMonaco.get(this.name).editor.setValue(newValue);
	},
	isVisible: function () {
		return true;
	},
	type: "MonacoTextAreaElement",
	z: null
});
;
/*! RESOURCE: /scripts/classes/syntax_editor5/references/simpleList.js */
var SimpleList = (function() {
	var SR_ASCENDING_TEXT = getMessage('Sort in ascending order');
	var SR_DESCENDING_TEXT = getMessage('Sort in descending order');
	var SORT_ASCENDING_CLASS = 'icon-vcr-up';
	var SORT_DESCENDING_CLASS = 'icon-vcr-down';
	var DEFAULT_TABLE_CAPTION = getMessage('Simple read only table');
	var NO_RECORDS_CLASS = 'simple-list-no-records';
	var HEADER = 'header';
	var BODY = 'body';
	function SimpleList(listData, parentElem) {
		this.listData = listData;
		this.tableElem = "";
		this.sortStatus = {
			column: getDefaultSort(listData),
			order: 1
		};
		
		$j(parentElem).append(getSimpleList.call(this));
		addListeners.call(this);
	}
	SimpleList.prototype.updateListBody = updateListBody;
	SimpleList.prototype.updateColumnHeader = updateColumnHeader;
	SimpleList.prototype.sortAndUpdateStatus = sortAndUpdateStatus;
	SimpleList.prototype.sortList = sortList;
	
	function getSimpleList() {
		var listData = this.listData;
		this.sortList(this.sortStatus.column, this.sortStatus.order);
		var caption = listData.caption || DEFAULT_TABLE_CAPTION;
		return '<table class="table list_table table-hover" id="' + listData.tableId + '" > \
<caption class="sr-only">' + caption + '</caption>' +
					getListHeader(listData) +
					getListBody(listData) +
'</table>';
	}
	function getListHeader(listData) {
		var infoHeaderCell = getInfoCell(listData.infoColumn, HEADER);
		var headerRow = listData.header.reduce(function(combinedHeader, header) {
			var isSort = header.defaultSort ? "text-primary" : "";
			var sortDir = header.defaultSort ? ' sort_dir="ASC" ' : ' ';
			var isHide = header.defaultSort ? "" : "hide";
			var srText = header.defaultSort ? SR_DESCENDING_TEXT : SR_ASCENDING_TEXT;
			var ColumnClassName = getColumnClassName(header);
			return (combinedHeader +
				'<th data-key="' + header.columnName + '" class="table-column-header ellipsis ' + ColumnClassName + '" ' + sortDir + ' > \
                    <a tabIndex="0" id="initailFocusLink" class="sort-columns ' + isSort + '">' + header.displayValue +
'<span class="sr-only label_sort_order">' + srText + '</span> \
</a> \
<span class="col-change-sort simple-list-sort-icon icon-vcr-up ' + isHide + '"></span> \
</th>');
		}, infoHeaderCell);
		return '<thead > \
                    <tr > ' +
						headerRow +
'</tr> \
</thead>';
	}
	function getListBody(listData) {
		var tBodyClassName = (listData.body && listData.body.length) ? "" : NO_RECORDS_CLASS;
		return '<tbody id="' + listData.tbodyId + '" class="' + tBodyClassName + '"  >' +
					getListBodyContents(listData) +
'</tbody>';
	}
	function getListBodyContents(listData) {
		var body = listData.body;
		var tbodyHtml = "";
		body.forEach(function(row, index) {
			var rowClass = 'list_' + (index % 2 ? 'even' : 'odd');
			tbodyHtml += getBodyRow(listData, row, rowClass);
		});
		return tbodyHtml;
	}
	function getInfoCell(infoColumn, cellType) {
		if (!infoColumn)
			return "";
		var infoCell = "";
		var infoClassName = infoColumn.className || "simple-list-info-column";
		if (cellType === BODY) {
			var title = infoColumn.displayValue || "Preview record";
			infoCell = '<td class="simple-list-info-row ' + infoClassName + ' " > \
<button type="button" class="simple-list-info-button btn btn-icon table-btn-lg icon-info" title="' + title + '" data-toggle="popover"></button> \
</td>';
		} else if (cellType === HEADER)
infoCell = '<th class="' + infoClassName + '"></th>';
		return infoCell;
	}
	function getBodyRow(listData, row, rowClass) {
		var infoBodyCell = getInfoCell(listData.infoColumn, BODY);
		var header = listData.header;
		var bodyRow = "";
		header.forEach(function(column) {
			var isLink = column.isLink ? ' tabIndex="0" class="simple-list-link" ' : "";
			var columnClassName = getColumnClassName(column);
			bodyRow += '<td class="ellipsis ' + columnClassName + '"> \
<span ' + isLink + ' >' + row[column.columnName] + '</span> \
</td>';
		});
		var rowAttrs = " ";
		if (listData.rowAttrs) {
			listData.rowAttrs.forEach(function(attr) {
				rowAttrs += 'data-' + attr + '="' + row[attr] + '" ';
			})
		}
        return '<tr class= "list_row ' + rowClass + '"' + rowAttrs + ' " >' +
                    infoBodyCell +
                    bodyRow +
'</tr>';
    }
	function updateListBody(updatedBody) {
		var listData = this.listData;
		if (updatedBody)
			listData.body = updatedBody;
		var tBodyElement = $j('#' + listData.tbodyId);
		if ((listData.body && listData.body.length))
			tBodyElement.removeClass(NO_RECORDS_CLASS);
		else {
			tBodyElement.addClass(NO_RECORDS_CLASS);
			return;
		}
		this.sortList(this.sortStatus.column, this.sortStatus.order);
		tBodyElement.html(getListBodyContents(listData));
	}
	function addListeners() {
		var sortStatus = this.sortStatus;
		var tableId = this.listData.tableId;
		this.tableElem = $j('#' + tableId);
		this.tableElem.find('.table-column-header').children().on('click', function(event) {
			var prevSortStatus = Object.assign({}, sortStatus);
			var key = $j(event.target).parent().data('key');
			this.sortAndUpdateStatus(key);
			this.updateListBody();
			this.updateColumnHeader(prevSortStatus);
		}.bind(this));
	}
	function sortAndUpdateStatus(key) {
		var sortStatus = this.sortStatus;
		if (sortStatus.column === key) {
			sortStatus.order = -1 * sortStatus.order;
		} else {
			sortStatus.order = 1;
			sortStatus.column = key;
		}
		this.sortList(key, sortStatus.order);
	}
	function updateColumnHeader(prevSortStatus) {
		var sortStatus = this.sortStatus;
		var currentRow = this.tableElem.find('th[data-key="' + sortStatus.column + '"]');
		if (prevSortStatus.column === sortStatus.column) {
			var sortIcon = currentRow.children('span');
			var srSortElement = currentRow.find('a > span');
			if (sortStatus.order === 1) {
				sortIcon.removeClass(SORT_DESCENDING_CLASS).addClass(SORT_ASCENDING_CLASS);
				srSortElement.text(SR_DESCENDING_TEXT);
			} else {
				sortIcon.removeClass(SORT_ASCENDING_CLASS).addClass(SORT_DESCENDING_CLASS);
				srSortElement.text(SR_ASCENDING_TEXT);
			}
		} else {
			var prevRow = this.tableElem.find('th[data-key="' + prevSortStatus.column + '"]');
			prevRow.removeAttr("sort_dir");
			if (sortStatus.order === 1)
				currentRow.attr("sort_dir", "ASC");
			else
				currentRow.attr("sort_dir", "DESC");
			$j(prevRow.children()[1]).addClass("hide").removeClass(SORT_DESCENDING_CLASS);
			prevRow.find('a > span').text(SR_ASCENDING_TEXT);
			$j(currentRow.children()[1]).addClass(SORT_ASCENDING_CLASS).removeClass("hide");
			currentRow.find('a > span').text(SR_DESCENDING_TEXT);
		}
	}
	function sortList(key, order) {
		var bodyData = this.listData.body;
		bodyData.sort(function(a, b) {
			if (!a[key])
				return order;
			if (!b[key])
				return -1 * order;
			if (a[key].toUpperCase() < b[key].toUpperCase())
				return -1 * order;
			if (a[key].toUpperCase() > b[key].toUpperCase())
				return order;
			return 0;
		});
	}
	function getDefaultSort(listData) {
		var column = listData.header.find(function(column) {
			return (column.defaultSort === true);
		});
		return column.columnName;
	}
	function getColumnClassName(column) {
		var className = column.className || ("simple-list-" + column.columnName);
		return className;
	}
	return SimpleList;
})();
;
/*! RESOURCE: /scripts/classes/syntax_editor5/references/GlideEditorFindReferences.js */
var GlideEditorFindReferences = (function() {
	var tableNamesMsg = getMessage('Script Include, Business Rule, UI Page, ACL, UI Action, UI Policy, List Controls, Widgets, Scripted REST API, Workflow Action and Flow Action.');
	var noReferencesText = new GwtMessage().getMessage('No files found in the tables: {0}', tableNamesMsg);
	var showAllFilesMsg = getMessage('Show All Files');
	var infoText = new GwtMessage().getMessage('The list shows search results from the tables: {0} To see results from all tables, click {1}.', tableNamesMsg, showAllFilesMsg);
	var usagesModalId = 'usages-modal';
	var jUsagesModalId = '#usages-modal';
	var modalBodyId = 'usages-modal-body';
	var popoverViewportPadding = 13;
	var typeMapper = {
		'sys_script_include': 'script_include',
		'sys_db_object': 'table'
	};
	var defaultSearchTables = ['sys_script', 'sys_script_include', 'sys_ui_page', 'sys_ui_action', 'sys_ui_policy', 'sys_security_acl', 'sys_ui_list_control', 'sys_widgets', 'sys_ws_operation', 'wf_action', 'sys_variable_value'];
	var modalElement;
	var usages;
	var literal;
	var literalName;
	var scope;
	var listView;
	var popoverStatus;
	var isFullSearchStarted;
	var modalTitle;
var tbodyBox;
	var focusTrap;
	var isMonaco;
	function initialise(contextLiteral, isMonacoEditor) {
		isMonaco = isMonacoEditor;
		usages = [];
		literal = contextLiteral;
		if (literal.type === 'sys_db_object')
			literalName = literal.key;
		else if (literal.type === 'sys_script_include') {
			var split = literal.key.split('.');
scope = split[0];
			literalName = split[1];
		}
		listView = null;
		popoverStatus = {
			isShown: false,
			eventTarget: null,
		};
		isFullSearchStarted = false;
		modalTitle = "";
		tbodyBox = {};
		focusTrap = false;
	}
	function addFocusTrap() {
		if (window.focusTrap) {
			focusTrap = window.focusTrap(document.getElementById(usagesModalId), {
				initialFocus: $j('.usages-modal_title')[0]
			});
			focusTrap.activate();
		}
	}
	function findUsageName(sysId) {
		var usage = usages.find(function(usage) {
			return (usage.sysId === sysId)
		});
		return usage.name ? usage.name : "no name";
	}
	function tBodyResizeHandler() {
		var tbody = document.getElementById(modalBodyId);
		if (tbody) {
			tbodyBox = tbody.getBoundingClientRect();
			var scrollbarWidth = (tbody.offsetWidth - tbody.clientWidth);
			if (scrollbarWidth)
				modalElement.find('thead').addClass('thead-scroll-offset');
		}
	}
	function isElementInViewport(dElem) {
		var elementBox = dElem.getBoundingClientRect();
		return (
			elementBox.bottom >= tbodyBox.top &&
			elementBox.bottom <= tbodyBox.bottom
		)
	}
	function isEllipsisActive(dElem) {
		return (dElem.clientWidth < dElem.scrollWidth);
	}
	function getNumOfFilesMsg(numberOfFiles) {
		if (numberOfFiles === 1)
			return getMessage('Showing 1 file');
		return new GwtMessage().getMessage('Showing {0} files', numberOfFiles);
	}
	function getUsagesAjax(literal, searchTables, ignoredTables, successCallback, failureCallback) {
		$j.ajax({
url: '/api/now/syntax_editor/getReferences',
			method: "POST",
			headers: {
				'X-UserToken': window.g_ck
			},
contentType: 'application/json',
			data: JSON.stringify({
				searchWord: literal.key,
				searchWordType: typeMapper[literal.type],
				searchTables: searchTables,
				ignoredTables: ignoredTables
			})
		})
		.done(function(data) {
			if (data.result && data.result.result)
				successCallback(data.result.result);
		})
		.fail(function(error) {
			if (failureCallback)
				failureCallback(error);
		});
	}
	function getUsages() {
		getUsagesAjax(literal,
			defaultSearchTables,
			[],
			function(data) {
				usages = JSON.parse(data);
				renderModal();
			}
		);
	}
	function getAllUsages() {
		getUsagesAjax(
			literal,
			[],
			defaultSearchTables,
			updateModal,
			function() {
				isFullSearchStarted = false;
			}
		);
	}
	function updateModal(fullUsages) {
		var defaultUsagesNum = usages.length;
		usages = usages.concat(JSON.parse(fullUsages));
		modalElement.find(".info-message").text(getNumOfFilesMsg(usages.length));
		modalElement.find(".info-message-wrapper .icon-info").hide();
		modalElement.find(".modal-footer").hide();
		var noReferencesElem = modalElement.find(".no-references-msg");
		if (!usages.length) {
			noReferencesElem.addClass("full-body-height");
noReferencesElem.html('<p>' + getMessage('No files found') + '</p>');
		} else {
			updateListBody(usages);
			$j('#' + modalBodyId).addClass("full-body-height");
			if (defaultUsagesNum === 0)
				noReferencesElem.addClass("hide");
		}
		tBodyResizeHandler();
	}
	function getCombinedUsages(usage) {
		var maxNumberOfDigits = (function() {
			var maxLineNumber = 0;
			usage.fields.forEach(function(scriptField) {
				scriptField.references.forEach(function(reference) {
					maxLineNumber = Math.max(maxLineNumber, reference.lineNo);
				});
			});
			return maxLineNumber.toString().length;
		})();
		var combinedUsages = usage.fields.map(function(scriptField) {
			return scriptField.references.reduce(function(combinedref, ref) {
				var paddedLine = ("Line " + ref.lineNo).padEnd(maxNumberOfDigits + 6);
return combinedref + paddedLine + ref.code.replace(/\r?\n|\r/gm, "") + "\n";
			}, scriptField.name + "\n");
		});
		return combinedUsages.reduce(function(combinedScripts, script) {
			return (combinedScripts + script.trim() + "\n\n")
		}, "").trim();
	}
	function addEditorDecorations(scriptEditor, usage) {
		var headingLines = (function() {
			var headingLines = [];
			var index = 0;
			usage.fields.forEach(function(scriptField) {
				headingLines.push(index);
				index += (scriptField.references.length + 2);
			});
			return headingLines;
		})();
		if (isMonaco) {
			var decorations = headingLines.map(function(headingLine) {
				return {
					range: new monaco.Range(headingLine + 1, 1, headingLine + 1, 1),
					options: {
						inlineClassName: 'popover-script-heading',
						isWholeLine: true
					}
				}
			});
			scriptEditor.deltaDecorations([], decorations);
		} else {
			headingLines.map(function(headingLine) {
				return scriptEditor.addLineClass(headingLine, 'text', 'popover-script-heading');
			});
			var charWidth = scriptEditor.defaultCharWidth(), basePadding = 4;
			scriptEditor.on("renderLine", function(cm, line, elt) {
var lineRegex = /^Line [0-9]+ */;
				var matchingText = (lineRegex.exec(line.text) || [""])[0];
				var off = CodeMirror.countColumn(matchingText, matchingText.length, cm.getOption("tabSize")) * charWidth;
				elt.style.textIndent = "-" + off + "px";
				elt.style.paddingLeft = (basePadding + off) + "px";
			});
			scriptEditor.refresh();
		}
	}
	function showEditorPreview(sysId) {
		if ($j("#usages-preview").siblings().length > 0)
			return;
		var usage = usages.find(function(usage) {
			return (usage.sysId === sysId)
		});
		var combinedUsagesString = getCombinedUsages(usage);
		var usagesPreview = document.getElementById("usages-preview");
		var scriptEditor;
		if (isMonaco) {
			scriptEditor = monaco.editor.create(usagesPreview, {
				value: combinedUsagesString,
				language: "javascript",
				readOnly: true,
				lineNumbers: "off",
				wordWrap: "on",
				wrappingIndent: "deepIndent",
				contextmenu: false,
				minimap: {
					enabled: false
				}
			});
		} else {
			scriptEditor = CodeMirror.fromTextArea(usagesPreview, {
				lineNumbers: false,
				mode: "javascript",
				lineWrapping: true,
				readOnly: true,
				viewportMargin: Infinity,
				cursorBlinkRate: -1
			});
			scriptEditor.setValue(combinedUsagesString);
		}
		addEditorDecorations(scriptEditor, usage);
		modalElement.find(".usages-popover").removeClass("invisible");
	}
	function hidePopover() {
		popoverStatus.isShown = false;
		modalElement.find(".usages-popover").addClass("invisible");
		$j(popoverStatus.eventTarget).popover('hide');
	}
	function showPopover(event) {
		var target = $j(event.target);
		var sysId = target.parent().parent().data('sysid');
		if (popoverStatus.isShown) {
			hidePopover();
			if (popoverStatus.eventTarget === event.target) return;
		}
		popoverStatus.isShown = true;
		popoverStatus.eventTarget = event.target;
		var popoverTemplate = '<div class="invisible usages-popover popover glide-popup" role="tooltip" > \
			<div class="arrow"> \
</div> \
			<div class="popover-body"> \
				<div class="popover-header"> \
<h3 class="popover-title ellipsis"></h3> \
<button class="open-file btn btn-default">' + getMessage('Open File') + '</button> \
</div> \
				<div class="popover-content" > \
</div> \
</div> \
</div>';
		var content;
		if (isMonaco)
content = '<div id="usages-preview" style="height: 80px; direction: ltr;"></div>';
		else
content = '<textarea class="invisible" id="usages-preview"></textarea>';
		target.popover({
			template: popoverTemplate,
			placement: 'bottom',
			title: new GwtMessage().getMessage('Usage of {0} in {1}', literalName, findUsageName(sysId)),
			content: content,
			trigger: 'manual',
			placement: "auto",
			viewport: {
				selector: jUsagesModalId + ' .modal-body',
				padding: popoverViewportPadding
			}
		});
		target.one('shown.bs.popover', function() {
			showEditorPreview(sysId);
		});
		target.popover('show');
	}
	function addListeners() {
		modalElement.on('mouseover', 'td', function(event) {
			var tdElement;
			var target = $j(event.target);
			var nodeName = target.prop('nodeName');
			if (nodeName === 'SPAN')
				tdElement = target.parent();
			else if (nodeName === 'TD')
				tdElement = target;
			if (tdElement) {
				if (tdElement.data('data-dynamic-title'))
					return;
				if (isEllipsisActive(tdElement.get(0)))
					$j(tdElement).attr('data-dynamic-title', $j(tdElement).text().trim());
			}
		});
		modalElement.on('mouseover', '.modal-title, .popover-title', function(event) {
			var target = $j(event.target);
			if (target.data('data-dynamic-title'))
				return;
			if (isEllipsisActive(target.get(0))) {
				var tooltipText = target.hasClass('modal-title') ? modalTitle : target.text().trim();
				target.attr('data-dynamic-title', tooltipText);
			}
		});
		modalElement.on('click', '.simple-list-info-button', function(event) {
			event.stopPropagation();
			showPopover(event);
		});
		modalElement.on('click', ':not(.simple-list-info-button)', function(event) {
			if ($j(event.target).closest('.usages-popover').length > 0) {
				return;
			}
			if (popoverStatus.isShown) {
				hidePopover();
			}
		});
		modalElement.on('click', '.open-file, .simple-list-link', function(event) {
			var row;
			var target = $j(event.target);
			if (target.hasClass('open-file'))
				row = target.closest('.usages-popover').parent().parent();
			else if (target.hasClass('simple-list-link'))
				row = target.parent().parent();
			if (row)
				GlideEditorContextMenu.openRecord(row.data('tablename'), row.data('sysid'));
		});
		$j('#show-all-button').on('click', function(event) {
			if (!isFullSearchStarted) {
				isFullSearchStarted = true;
				getAllUsages();
			}
		});
		$j(document).on('click', outsideClickHandler);
		modalElement.on('keydown', function(event) {
			if (event.which === 27) {
				if (popoverStatus.isShown) {
					event.stopPropagation();
					hidePopover();
				} else
					modalElement.modal('hide');
			}
		});
		addTbodyScrollListener();
		modalElement.on('hide.bs.modal', function() {
			destroyModal();
		});
	}
	function outsideClickHandler() {
		if ($j(event.target).closest('.modal-content').length > 0)
			return;
		modalElement.modal('hide');
	};
	function destroyModal() {
		if (window.focusTrap && focusTrap)
			focusTrap.deactivate();
		$j(document).off('click', outsideClickHandler);
	};
	function addTbodyScrollListener() {
		var modalBodyElement = modalElement.find('.modal-body');
		$j('#' + modalBodyId).on('scroll', function() {
			if (!popoverStatus.isShown)
				return;
			var popoverTarget = popoverStatus.eventTarget;
			if (!isElementInViewport(popoverTarget)) {
				hidePopover();
				return;
			}
			var popoverTargetBottom = popoverTarget.getBoundingClientRect().bottom;
			var modalBodyTop = modalBodyElement[0].getBoundingClientRect().top;
			var popoverTop = (popoverTargetBottom - modalBodyTop);
			modalElement.find('.popover').css({top: popoverTop});
		});
	}
	function updateListBody(usages) {
		listView.updateListBody(usages);
	}
	function noUsagesMsg(numberOfFiles) {
		if (!numberOfFiles)
			return '<div class="no-references-msg"> \
<p>' + noReferencesText + '</p> \
<p>' + getMessage('To find references in other tables, click ' + showAllFilesMsg) + '</p> \
</div>';
		return '';
	}
	function getModalBody(listData) {
		return '<div class=usages-modal-container>' +
(isMonaco ? '<style>.monaco-editor .cursors-layer > .cursor {display: none !important;}</style>' : '') +
					'<div class="info-message-wrapper"> \
<span class="info-message">' + getNumOfFilesMsg(usages.length) + '</span> \
<span tabIndex="-1" class="icon-info icon-info-tooltip text-primary" aria-label="' + infoText + '" title="' + infoText + '"></span> \
</div> \
					<hr> \
					<div class="usages-table-wrapper"> \
</div>' +
					noUsagesMsg(listData.length) +
					'<hr class="table-bottom-break"> \
					<div class="modal-footer"> \
<button class="btn btn-default" id="show-all-button" >' + showAllFilesMsg + '</button> \
</div> \
</div>'
	}
	function getTableConfig(tableData) {
		return {
			tableId: "usages-modal-table",
			tbodyId: modalBodyId,
			caption: "",
			infoColumn: {
				displayValue: getMessage('Preview script'),
				className: "mini-width"
			},
			rowAttrs: ['sysId', 'tableName'],
			header: [
				{
					columnName: 'name',
					displayValue: getMessage('File name'),
					isLink: true,
					className: "medium-width"
				},
				{
					columnName: 'tableDisplayName',
					displayValue: getMessage('File type'),
					className: "small-width"
				},
				{
					columnName: 'applicationLabel',
					displayValue: getMessage('Application'),
					defaultSort: true,
					className: "small-width"
				}
			],
			body: tableData
		}
	}
	function renderTable(tableData) {
		modalElement = $j(jUsagesModalId);
		var tableConfig = getTableConfig(tableData);
		var tableWrapper = modalElement.find(".usages-table-wrapper");
		listView = new SimpleList(tableConfig, tableWrapper);
	}
	function showCloseButton() {
		modalElement.find('#usages-modal_closemodal').css('display', 'initial');
	}
	function renderModal() {
		var usagesModal = new GlideModal(usagesModalId, true);
		modalTitle = new GwtMessage().getMessage('Files referencing {0}', literalName);
		usagesModal.setTitle(modalTitle);
		var modalBody = getModalBody(usages);
		usagesModal.setBody(modalBody);
		renderTable(usages);
		showCloseButton();
		addListeners();
		addFocusTrap();
		tBodyResizeHandler();
	}
	function showUsages(contextLiteral, isMonaco) {
		initialise(contextLiteral, isMonaco);
		getUsages();
	}
	return {
		showUsages: showUsages
	};
})();
;
/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorContextMenu.js */
var GlideEditorContextMenu = (function() {
	var showDocLabel = getMessage("Show Documentation");
	var findReferencesLabel = getMessage("Find References");
	var contextMenuItems = [
	                        {type: "sys_db_object", menu: getMessage("Show Definition"), action: "record", keyField: "name"},
	                        {type: "sys_db_object", menu: getMessage("Show Data"), action: "list", keyField: "name"},
							{type: "sys_db_object", menu: findReferencesLabel, action: "reference"},
	                        {type: "sys_script_include", menu: getMessage("Open Definition"), action: "record", keyField: "api_name"},
							{type: "sys_script_include", menu: findReferencesLabel, action: "reference"}
	                       ];
const docUrlPrefix = "https://docs.servicenow.com/csh?topicname=c_";
	const docUrlSuffix = "API.html&version=" + getVersion();
	function showEditorContext(event, literal, isMonaco) {
		var cMenu = new GwtContextMenu('context_menu_editor_' + literal.name);
		cMenu.clear();
		addContextMenuItems(cMenu, literal, isMonaco);
		return contextShow(event, cMenu.getID(), 500, 0, 0);
	}
	function openDefinitionTab(literal) {
		if (literal.type === "api") {
var topic = literal.key.replace("-Global", "");
topic = topic.replace("-Scoped", "Scoped");
			window.open(docUrlPrefix + topic + docUrlSuffix, "_blank");
		}
		else {
	        if (window.isDevStudio || literal.type === 'sys_script_include')
	            openDefinition(literal)
	        else {
	            var uri = literal.type + ".do?sysparm_query=name=" + literal.key
	            window.open(uri, "_blank");
	        }
	    }
	}
	function openDefinition(literal) {
	    $j.ajax({
url: 'api/now/v1/syntax_editor/cache/' + literal.type + '?name=' + literal.key,
	            method: "GET",
	            headers: {
	                'X-UserToken': window.g_ck
	            }
	        })
	        .done(function(data) {
	            if (!data || typeof data !== 'object')
	                return;
				var sys_id = data.result && data.result.result;
				openRecord(literal.type, sys_id);
	        });
	}
	function openRecord(tableName, sysId) {
		if (!sysId || !tableName)
			return;
		var studioId = tableName + "_" + sysId;
		var uri = tableName + ".do?sys_id=" + sysId;
		if (window.isDevStudio) {
			if (window.openStudioTab)
				window.openStudioTab(uri, studioId);
		} else
			window.open(uri, "_blank");
	}
	function addItemToContextMenu(cMenu, item, literal, id) {
		var uri = (item.action == 'list' ? literal.key + "_list.do?sys_id=-1" : literal.type + ".do?sysparm_query=" + item.keyField + "=" + literal.key);
		if (window.isDevStudio) {
			var openStudioTab = function() {
				window.openStudioTab(uri, id);
			};
			cMenu.addFunc(item.menu, openStudioTab, id);
		} else {
			cMenu.addURL(item.menu, uri, "_blank", id);
		}
	}
	function addContextMenuItems(cMenu, literal, isMonaco) {
	    if (literal.type === "api") {
			var openDocumenation = function() {
var topic = literal.key.replace("-Global", "");
topic = topic.replace("-Scoped", "Scoped");
				window.open(docUrlPrefix + topic + docUrlSuffix, "_blank");
			}
			cMenu.addFunc(showDocLabel, openDocumenation, literal.key);
	    }
	    else
	        contextMenuItems.forEach(function(item) {
	            if (item.type == literal.type) {
	                var id = (item.action == 'list' ? literal.key + "_list" : literal.type + "_" + literal.key);
					if (item.action === 'reference') {
						var showReferences = function() {
							GlideEditorFindReferences.showUsages(literal, isMonaco);
						};
						cMenu.addFunc(findReferencesLabel, showReferences, literal.key);
					}
					else if ((window.isDevStudio && item.action === 'record') || literal.type === 'sys_script_include') {
						var openContextMenuTab = function() {
							openDefinition(literal);
						};
						cMenu.addFunc(item.menu, openContextMenuTab, id);
					}
					else {
						addItemToContextMenu(cMenu, item, literal, id);
	                }
	            }
	        });
	}
	function getVersion() {
var buildName = 'Zurich';
		var version = buildName.toLowerCase();
		var p1 = version.indexOf('(');
		var p2 = version.indexOf(')');
		if (p1 > -1 && p2 > p1)
			version = version.substring(p1 + 1, p2);
		return version;
	}
	
	return {
		showEditorContext: showEditorContext,
		openDefinitionTab: openDefinitionTab,
		openRecord: openRecord
	};
})();
;
/*! RESOURCE: /scripts/classes/monaco/GlideEditorMonacoCommon.js */
var GlideEditorMonacoCommon = Class.create({
	initialize: function init(id, editor, debugpoints, readOnly, messages) {
		this.id = id;
		this.editor = editor;
		this.debugpoints = debugpoints;
		this.readOnly = readOnly;
		this.debugPointType = {
			LOGPOINT: "LOGPOINT",
			BREAKPOINT: "BREAKPOINT",
			CONDITIONAL_BREAKPOINT: "CONDITIONAL_BREAKPOINT"
		};
		this.debugPointClassName = {
			LOGPOINT: "script-editor-log-point-marker",
			BREAKPOINT: "script-editor-break-point-marker",
			CONDITIONAL_BREAKPOINT: "script-editor-conditional-break-point-marker"
		};
		this.debugPointApi = {
LOGPOINT: "logpoints/logpoint",
BREAKPOINT: "debugger/breakpoint"
		};
		this.debugPointPlaceholder = {
			LOGPOINT: messages.log,
			BREAKPOINT: messages.condition
		};
		this._gutterActions = {
			onMouseDownEvent: undefined,
			onContextMenuEvent: undefined,
			onDidScrollChangeEvent: undefined,
			onMouseLeaveEvent: undefined,
			onMouseMoveEvent: undefined,
			onDidChangeContentEvent: undefined
		};
		this.gutterDecorations = [];
		this.overlayWidget = {};
		this.viewZoneId = null;
		this.domNode = null;
		this.decoratedLineNumber = null;
		this.logPoints = {};
		this.breakPoints = {};
		this.contextMenuLineNumber = null;
		this.contextMenuOpened = false;
		this.currlineNumber = null;
		this.currDebugPointType = null;
		this.gutterClasses = [
			"script-editor-monaco-hover",
			"script-editor-debug-point-marker",
			"script-editor-break-point-marker",
			"script-editor-conditional-break-point-marker",
			"script-editor-log-point-marker"
		];
		this.initializeReferences();
		$j(this.gutterContextMenuId).find("li").hover(function() {
			$j(this).focus();
		});
		$j(window.document).mouseup((function(e) {
			var contextMenu = $j(this.gutterContextMenuId);
			if (!contextMenu.is(e.target) && contextMenu.has(e.target).length === 0 && !this.isContextMenuClickedOnGutter(e.target)) {
				this.hideContextMenu();
				if (this.viewZoneId != null && !e.target.classList.contains("script-editor-input-widget")) {
					this.removeInputWidget();
					var data = { evaluationString: this.domNode.value };
					if (this.currDebugPointType === this.debugPointType.LOGPOINT) {
						if (data.evaluationString.trim() === "")
							this.toggleLogpoint(this.currlineNumber);
						else
							this.toggleLogpoint(this.currlineNumber, data.evaluationString);
					} else if (this.currDebugPointType === this.debugPointType.BREAKPOINT) {
						this.toggleBreakpoint(this.currlineNumber, data.evaluationString.trim());
					}
				}
			}
		}).bind(this));
		$j(this.addLogpointId).on("click", (function() {
			this.showLogpointEditor.call(this);
		}).bind(this));
		$j(this.editLogpointId).on("click", (function() {
			this.showLogpointEditor.call(this);
		}).bind(this));
		$j(this.removeLogpointId).on("click", (function() {
			this.onRemoveLogpointClick.call(this);
		}).bind(this));
		$j(this.addBreakpointId).on("click", (function() {
			this.onAddBreakpointClick.call(this);
		}).bind(this));
		$j(this.addConditionId).on("click", (function() {
			this.showBreakpointEditor.call(this);
		}).bind(this));
		$j(this.editConditionId).on("click", (function() {
			this.showBreakpointEditor.call(this);
		}).bind(this));
		$j(this.removeConditionId).on("click", (function() {
			this.onRemoveConditionClick.call(this);
		}).bind(this));
		$j(this.removeBreakpointId).on("click", (function() {
			this.onRemoveBreakpointClick.call(this);
		}).bind(this));
		$j(this.addConditionalBreakpointId).on("click", (function() {
			this.showBreakpointEditor.call(this);
		}).bind(this));
		this.loadPoints((function() {
			this.gutterClickAction();
		}).bind(this));
	},
	showLogpointEditor: function() {
		this.showInputWidget(this.contextMenuLineNumber, this.debugPointType.LOGPOINT);
	},
	onRemoveLogpointClick: function() {
		this.toggleLogpoint(this.contextMenuLineNumber);
		this.hideContextMenu();
	},
	onAddBreakpointClick: function() {
		this.toggleBreakpoint(this.contextMenuLineNumber, "");
		this.hideContextMenu();
	},
	showBreakpointEditor: function() {
		this.showInputWidget(this.contextMenuLineNumber, this.debugPointType.BREAKPOINT);
	},
	onRemoveConditionClick: function() {
		this.toggleBreakpoint(this.contextMenuLineNumber, "");
		this.hideContextMenu();
	},
	onRemoveBreakpointClick: function() {
		this.toggleBreakpoint(this.contextMenuLineNumber);
		this.hideContextMenu();
	},
	isContextMenuClickedOnGutter: function(target) {
		var targetEl = $j(target);
		var result = false;
		this.gutterClasses.forEach(function(c) {
			if (targetEl.hasClass(c))
				result = true;
		});
		return result;
	},
	initializeReferences: function() {
		this.addBreakpointId = "#addBreakpoint";
		this.addConditionId = "#addCondition";
		this.editConditionId = "#editCondition";
		this.removeConditionId = "#removeCondition";
		this.removeBreakpointId = "#removeBreakpoint";
		this.addConditionalBreakpointId = "#addConditionalBreakpoint";
		this.gutterContextMenuId = "#gutterContextMenu";
		this.addLogpointId = "#addLogpoint";
		this.editLogpointId = "#editLogpoint";
		this.removeLogpointId = "#removeLogpoint";
		this.gutterContextMenuId = "#gutterContextMenu";
	},
	hideAllElements: function() {
		$j(".breakpoint-menu-item").addClass("hide-me");
	},
	showElement: function(elementId) {
		$j(elementId).removeClass("hide-me");
	},
	hideElement: function(elementId) {
		$j(elementId).addClass("hide-me");
	},
	hideContextMenu: function() {
		this.hideElement(this.gutterContextMenuId);
		this.contextMenuOpened = false;
	},
	onGutterContextMenu: function(lineNumber, position) {
		this.hideAllElements();
		if (this.breakPoints[lineNumber]) {
			this.showElement(this.removeBreakpointId);
			var evaluationString = this.breakPoints[lineNumber].evaluationString;
			if (evaluationString && evaluationString.length > 0) {
				this.showElement(this.editConditionId);
				this.showElement(this.removeConditionId);
			} else {
				this.showElement(this.addConditionId);
				this.hideElement(this.editConditionId);
			}
		} else if (this.logPoints[lineNumber]) {
			this.showElement(this.editLogpointId);
			this.showElement(this.removeLogpointId);
		} else {
			this.showElement(this.addBreakpointId);
			this.showElement(this.addConditionalBreakpointId);
			this.showElement(this.addLogpointId);
		}
		if (document.getElementById("gutterContextMenu")) {
			this.contextMenuLineNumber = lineNumber;
			this.showContextMenu(position);
		}
	},
	showContextMenu: function(position) {
		var gutterContextMenuElement = $j(this.gutterContextMenuId);
		gutterContextMenuElement.css({
			top: position.y + "px",
			left: position.x + "px",
			"position": "fixed"
		});
		if (!this.isBrowserIE()) {
			gutterContextMenuElement.css({
				"z-index": "1000"
			});
		}
		this.showElement(this.gutterContextMenuId);
		this.contextMenuOpened = true;
		var contextmenuHeight = gutterContextMenuElement.children().first().height();
		if (window.innerHeight < position.y + contextmenuHeight) {
			gutterContextMenuElement.css({
				top: (position.y - contextmenuHeight) + "px"
			});
		}
		this.focusContextMenu(gutterContextMenuElement);
	},
	focusContextMenu: function(gutterContextMenuElement) {
		var listNodes = gutterContextMenuElement.children().first().children();
		this.displayedContextMenuItems = [];
		listNodes.each((function(index, item) {
			if (!item.classList.contains("hide-me"))
				this.displayedContextMenuItems.push(item);
		}).bind(this));
		if (this.displayedContextMenuItems && this.displayedContextMenuItems.length > 0)
			this.displayedContextMenuItems[0].focus();
	},
	isBrowserIE: function() {
		var userAgent = navigator.userAgent.toLowerCase();
return userAgent.indexOf("msie ") > -1 || userAgent.indexOf("trident/") > -1;
	},
	loadPoints: function(then) {
		var scriptType = g_form.getTableName();
		var scriptId = g_form.getUniqueValue();
		var scriptField = this.id.split(".")[1];
var url = "/api/now/js/debugpoints/script" + "/" + scriptType + "/" + scriptId + "/" + scriptField;
		$j.ajax({url: url, method: "GET", headers: {"X-UserToken": window.g_ck}})
			.done((function(data) {
				if (!data || typeof data !== "object")
					return;
				var result = data.result || {};
				var debugpoints = result.debugpoints || {};
				this.updateBreakPoints(debugpoints.BREAKPOINT || {});
				this.updateLogPoints(debugpoints.LOGPOINT || {});
				this.removeAllDebugPointsDecorations();
				this.renderBreakPoints();
				this.renderLogPoints();
				if (then)
					then();
			}).bind(this));
	},
	updatePointContent: function(lineNumber, evaluationString, debugPointType) {
		var scriptType = g_form.getTableName();
		var scriptId = g_form.getUniqueValue();
		var scriptField = this.id.split(".")[1];
		var api = this.debugPointApi[debugPointType];
		var requestData = null;
		if (evaluationString != null)
			requestData = JSON.stringify({"evaluationString": evaluationString});
var url = "/api/now/js/" + api + "/" + scriptType + "/" + scriptId + "/" + scriptField + "/" + lineNumber;
		$j.ajax({
			url: url,
			method: "POST",
headers: {"X-UserToken": window.g_ck, Accept: "application/json", "Content-Type": "application/json"},
			data: requestData
		})
		.done((function() {
			this.loadPoints();
		}).bind(this));
	},
	toggleBreakpoint: function(lineNumber, statement) {
		this.updatePointContent(lineNumber, statement, this.debugPointType.BREAKPOINT);
	},
	toggleLogpoint: function(lineNumber, statement) {
		this.updatePointContent(lineNumber, statement, this.debugPointType.LOGPOINT);
	},
	gutterClickAction: function() {
		this._glyphHoverOverlayWidget = this.addGlyphHoverWidget();
		var showHoverAtLine;
		this._gutterActions.onMouseDownEvent = this.editor.onMouseDown((function(e) {
			if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN && e.event.leftButton) {
				this.handleGutterClick(e.target.position.lineNumber);
				this.showGlyphHoverWidget(e.target.position.lineNumber);
			} else if (e.target.type === monaco.editor.MouseTargetType.OVERLAY_WIDGET && e.event.leftButton) {
				if (e.target.element.classList.contains("script-editor-monaco-hover")) {
					this.hideGlyphHoverWidget();
					this.handleGutterClick(showHoverAtLine);
				} else return;
			} else if (!e.event.rightButton) {
				this.handleGutterClick();
			}
		}).bind(this));
		this._gutterActions.onContextMenuEvent = this.editor.onContextMenu((function(e) {
			var position = {
				x: e.event.browserEvent.clientX,
				y: e.event.browserEvent.clientY
			};
			if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
				this.handleGutterClick(e.target.position.lineNumber, position);
				e.event.preventDefault();
			} else if (e.target.type === monaco.editor.MouseTargetType.OVERLAY_WIDGET) {
				this.handleGutterClick(showHoverAtLine, position);
				e.event.preventDefault();
			}
		}).bind(this));
		this._gutterActions.onDidScrollChangeEvent = this.editor.onDidScrollChange((function() {
			this.hideGlyphHoverWidget();
			this.handleGutterClick();
		}).bind(this));
		this._gutterActions.onMouseMoveEvent = this.editor.onMouseMove((function(e) {
			if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN && !e.target.detail.isAfterLines) {
				var gutterDecorationAtLine = this.gutterDecorations[e.target.position.lineNumber];
				if (gutterDecorationAtLine === undefined || gutterDecorationAtLine.length === 0) {
					showHoverAtLine = e.target.position.lineNumber;
					this.showGlyphHoverWidget(e.target.position.lineNumber);
				} else this.hideGlyphHoverWidget();
			} else if (e.target.type === monaco.editor.MouseTargetType.OVERLAY_WIDGET) return;
			else this.hideGlyphHoverWidget();
		}).bind(this));
		this._gutterActions.onMouseLeaveEvent = this.editor.onMouseLeave((function() {
			this.hideGlyphHoverWidget();
		}).bind(this));
		var model = this.editor.getModel();
		var lineCount = model.getLineCount();
		this._gutterActions.onDidChangeContentEvent = model.onDidChangeContent((function() {
			var newLineCount = model.getLineCount();
			if (newLineCount !== lineCount) {
				lineCount = newLineCount;
				this.removeAllDebugPointsDecorations();
				if (this.logPoints) this.renderLogPoints();
				if (this.breakPoints) this.renderBreakPoints();
				if (this.viewZoneId != null) {
					this.addDecorationsToLineWithWidget();
					this.layoutZone();
				}
			}
		}).bind(this));
	},
	disposeEvents: function() {
		this._glyphHoverOverlayWidget && this.destroyGlyphHoverWidget(this.editor, this._glyphHoverOverlayWidget);
		this._gutterActions.onMouseDownEvent && this._gutterActions.onMouseDownEvent.dispose();
		this._gutterActions.onContextMenuEvent && this._gutterActions.onContextMenuEvent.dispose();
		this._gutterActions.onMouseLeaveEvent && this._gutterActions.onMouseLeaveEvent.dispose();
		this._gutterActions.onMouseMoveEvent && this._gutterActions.onMouseMoveEvent.dispose();
		this._gutterActions.onDidScrollChangeEvent && this._gutterActions.onDidScrollChangeEvent.dispose();
		this._gutterActions.onDidChangeContentEvent && this._gutterActions.onDidChangeContentEvent.dispose();
	},
	handleGutterClick: function(lineNumber, position) {
		if (position === undefined && lineNumber !== undefined && this.debugpoints.hasBreakpointRole) {
			if (this.breakPoints[lineNumber])
				this.toggleBreakpoint(lineNumber);
			else if (this.logPoints[lineNumber])
				this.toggleLogpoint(lineNumber);
			else
				this.toggleBreakpoint(lineNumber, "");
		} else if (position !== undefined && lineNumber !== undefined && !this.readOnly) {
			this.onGutterContextMenu(lineNumber, position);
		}
	},
	showInputWidget: function(lineNumber, debugPointType) {
		this.currlineNumber = lineNumber;
		this.currDebugPointType = debugPointType;
		var debugPoint = this.breakPoints[lineNumber] || this.logPoints[lineNumber];
		if (this.viewZoneId !== null) {
			this.removeInputWidget();
			this.revertDeltaDecorationsAtLine(this.decoratedLineNumber);
		}
		this.addInputWidget(
			lineNumber,
			debugPoint ? debugPoint.evaluationString : "",
			debugPointType
		);
		this.hideContextMenu();
		var inputWidgetNode = this.domNode;
		setTimeout(function() {
			inputWidgetNode.focus()
		}, 150);
		inputWidgetNode.onkeydown = (function(e) {
			if (e.key === "Enter") {
				this.removeInputWidget();
				var data = { evaluationString: this.domNode.value };
				if (debugPointType === this.debugPointType.LOGPOINT) {
					if (data.evaluationString.trim() === "")
						this.toggleLogpoint(lineNumber);
					else
						this.toggleLogpoint(lineNumber, data.evaluationString);
				} else if (debugPointType === this.debugPointType.BREAKPOINT) {
					this.toggleBreakpoint(lineNumber, data.evaluationString.trim());
				}
			} else if (e.key === "Escape") {
				this.removeInputWidget();
				this.revertDeltaDecorationsAtLine(lineNumber);
			}
		}).bind(this);
	},
	revertDeltaDecorationsAtLine: function(lineNumber) {
		var debugPoint = this.breakPoints[lineNumber] || this.logPoints[lineNumber];
		if (debugPoint) {
			this.updateDebugPointDecoration(
				lineNumber,
				debugPoint.evaluationString,
				this.breakPoints[lineNumber]
					? debugPoint.evaluationString === "" ? this.debugPointType.BREAKPOINT : this.debugPointType.CONDITIONAL_BREAKPOINT
					: this.debugPointType.LOGPOINT
			);
		} else this.removeDebugPointDecoration(lineNumber);
		this.decoratedLineNumber = null;
	},
	addGlyphHoverWidget: function() {
		var glyphHoverOverlayWidget = {
			domNode: null,
			getId: function() {
				return "script-editor-glyphHoverWidget";
			},
			getDomNode: function() {
				var domNode = null;
				if (!this.domNode) {
					domNode = document.createElement("div");
					domNode.className = "script-editor-monaco-hover hidden";
					domNode.setAttribute("aria-hidden", "true");
					domNode.setAttribute("role", "tooltip");
					domNode.style.cursor = "pointer";
					domNode.oncontextmenu = function(e) {
						e.preventDefault();
					};
				}
				this.domNode = this.domNode || domNode;
				return this.domNode;
			},
			getPosition: function() {
				return null;
			}
		};
		this.editor.addOverlayWidget(glyphHoverOverlayWidget);
		return glyphHoverOverlayWidget;
	},
	showGlyphHoverWidget: function(lineNumber) {
		var glyphHoverOverlayWidgetNode = this._glyphHoverOverlayWidget.domNode;
		glyphHoverOverlayWidgetNode.classList.remove("hidden");
		var editorLayout = this.editor.getLayoutInfo();
		var topForLineNumber = this.editor.getTopForLineNumber(lineNumber);
		var editorScrollTop = this.editor.getScrollTop();
		var lineHeight = this.editor.getOption(monaco.editor.EditorOption.lineHeight);
		var nodeHeight = glyphHoverOverlayWidgetNode.clientHeight;
var top = topForLineNumber - editorScrollTop - (nodeHeight - lineHeight) / 2;
		var widgetLeft = editorLayout.glyphMarginLeft + "px";
		var widgetTop = Math.max(Math.round(top ), 0) + "px";
		glyphHoverOverlayWidgetNode.style.left = widgetLeft;
		glyphHoverOverlayWidgetNode.style.top = widgetTop;
	},
	hideGlyphHoverWidget: function() {
		this._glyphHoverOverlayWidget.domNode.classList.add("hidden");
	},
	destroyGlyphHoverWidget: function(editor, glyphHoverOverlayWidget) {
		this.editor.removeOverlayWidget(glyphHoverOverlayWidget);
	},
	renderBreakPoints: function () {
		var lineCount = this.editor.getModel().getLineCount();
		for (var linenumber in this.breakPoints) {
			var lineNumber = parseInt(linenumber);
			if (linenumber > lineCount) return;
			var breakPoint = this.breakPoints[linenumber];
			var evaluationString = breakPoint.evaluationString;
			this.updateDebugPointDecoration(
				lineNumber,
				evaluationString,
				evaluationString === "" ? this.debugPointType.BREAKPOINT : this.debugPointType.CONDITIONAL_BREAKPOINT
			);
		}
	},
	renderLogPoints: function() {
		var lineCount = this.editor.getModel().getLineCount();
		for (var linenumber in this.logPoints) {
			var lineNumber = parseInt(linenumber);
			if (linenumber > lineCount) return;
			var logPoint = this.logPoints[linenumber];
			var evaluationString = logPoint.evaluationString;
			this.updateDebugPointDecoration(lineNumber, evaluationString, this.debugPointType.LOGPOINT);
		}
	},
	updateBreakPoints: function(breakPoints) {
		this.breakPoints = breakPoints;
	},
	updateLogPoints: function(logPoints) {
		this.logPoints = logPoints;
	},
	setFocus: function() {
		this.editor.focus();
	},
	updateDebugPointDecoration: function(lineNumber, evaluationString, type) {
		var hoverMessage = evaluationString;
		this.gutterDecorations[lineNumber] = this.editor.deltaDecorations(this.gutterDecorations[lineNumber] || [], [
			{
				range: new monaco.Range(lineNumber, 1, lineNumber, 1),
				options: {
					glyphMarginClassName: this.debugPointClassName[type],
					glyphMarginHoverMessage: { value: hoverMessage }
				}
			}
		]);
	},
	removeDebugPointDecoration: function(lineNumber) {
		this.gutterDecorations[lineNumber] = this.editor.deltaDecorations(this.gutterDecorations[lineNumber], []);
	},
	removeAllDebugPointsDecorations: function() {
		this.gutterDecorations = this.editor.deltaDecorations(this.gutterDecorations, []);
	},
	addInputWidget: function(lineNumber, data, debugPointType) {
		this.editor.updateOptions({
			scrollbar: {
				handleMouseWheel: false
			}
		});
		this.decoratedLineNumber = lineNumber;
		this.editor.changeViewZones((function(changeAccessor) {
			var domNode = document.createElement("div");
			this.viewZoneId = changeAccessor.addZone({
				domNode: domNode,
				afterLineNumber: lineNumber,
				heightInPx: 31,
				onDomNodeTop: (function(top) {
					this.domNode.style.top = top + "px";
				}).bind(this)
			});
			var layoutInfo = this.editor.getLayoutInfo();
			var width = layoutInfo.contentWidth;
			var left = layoutInfo.contentLeft;
			var placeholder = this.debugPointPlaceholder[debugPointType] + lineNumber;
			this.overlayWidget = {
				domNode: null,
				getId: function() {
					return "script-editor-input-widget";
				},
				getDomNode: function() {
					var domNode = null;
					if (!this.domNode) {
						domNode = document.createElement("input");
						domNode.placeholder = placeholder;
						domNode.maxLength = 255;
						domNode.value = data;
						domNode.classList.add("script-editor-input-widget");
						domNode.style.width = (width - 14) + "px";
						domNode.style.left = left + "px";
					}
					this.domNode = this.domNode || domNode;
					return this.domNode;
				},
				getPosition: function() {
					return null;
				}
			};
			this.editor.addOverlayWidget(this.overlayWidget);
			this.domNode = this.overlayWidget.getDomNode();
		}).bind(this));
		this.editor.onDidLayoutChange((function() {
			var layoutInfo = this.editor.getLayoutInfo();
			this.domNode.style.width = (layoutInfo.contentWidth - 14) + "px";
		}).bind(this));
		this.addDecorationsToLineWithWidget();
	},
	addDecorationsToLineWithWidget: function() {
		var lineNumber = this.decoratedLineNumber;
		this.gutterDecorations[lineNumber] = this.editor.deltaDecorations(this.gutterDecorations[lineNumber] || [], [
			{
				range: new monaco.Range(lineNumber, 1, lineNumber, 1),
				options: {
					isWholeLine: true,
					className: "script-editor-debugpoint-content",
					glyphMarginClassName: "script-editor-debug-point-marker"
				}
			}
		]);
	},
	layoutZone: function() {
		this.editor.changeViewZones((function(changeAccessor) {
			changeAccessor.layoutZone(this.viewZoneId);
		}).bind(this));
	},
	removeInputWidget: function() {
		this.editor.removeOverlayWidget(this.overlayWidget);
		this.editor.changeViewZones((function(changeAccessor) {
			changeAccessor.removeZone(this.viewZoneId);
		}).bind(this));
		this.viewZoneId = null;
		this.editor.updateOptions({
			scrollbar: {
				handleMouseWheel: true
			}
		});
		setTimeout((function() {
			this.setFocus()
		}).bind(this), 0);
	}
});
;
/*! RESOURCE: /scripts/classes/syntax_editor5/CodeMirrorNoScriptTextAreaElement.js */
var CodeMirrorNoScriptTextAreaElement = Class.create({
	initialize: function (name) {
		this.id = name;
		this.elem = document.getElementById(this.id);
		if (typeof window.textareaResize === "function")
			textareaResize(this.id);
	},
	setValue: function (newValue) {
		if (newValue == " XXmultiChangeXX")
			newValue = '';
		if (typeof window.jQuery === "function"){
			$j(this.elem)
				.val(newValue)
				.trigger("autosize.resize");
		} else {
			$(this.elem).setValue(newValue);
		}
		onChange(this.id);
	},
	type: "CodeMirrorNoScriptTextAreaElement",
	z:null
});
;
;
/*! RESOURCE: /scripts/monacoIncludes.js */
