/*! RESOURCE: /scripts/elements/doctype/element_table_name.js */
var GlideTableName = Class.create({
    initialize: function(name) {
        this.name = name;
    },
    setData: function (data) {
        this.data = data;
    },
    setConfig: function(config) {
        this.config = config;
    },
    setValue: function(newValue) {
        var ajax = new GlideAjax('TableNameFieldValueLabel');
        ajax.addParam('sysparm_name', newValue);
        ajax.getXMLWait();
        var newLabel = ajax.getAnswer();
        this._updateFieldLabel(newValue, newLabel);
        onChange(this.name);
    },
    initializeSelect2: function() {
        if(!this.data && !this.config)
            return;
        var elementName = this.config.fieldType === "composite_name" ? "ni_tn_"+this.name :this.name;
        var element = gel(elementName);
        if(element)
            element.title = getMessage("Tables");
        $j(element).select2({
            initSelection: this._initSelection(this.data),
            ajax : this._constructAjaxObject(this.data,this.config),
        }).bind('select2-focused', function() {
            NOW.select2LabelWorkaround($j(this));
        });
    },
    _initSelection: function(data) {
        return function(element, callback) {
            var init = {id: data.initialValue, text: data.initialLabel};
            callback(init);
        };
    },
    _constructAjaxObject: function(data, config){
        return {
            type: 'POST',
            url : this._GRAPHQL_ENDPOINT,
            dataType: 'json',
            quietMillis: 250,
params: {contentType: "application/json"},
            data: this._constructGraphQLQuery(data,config),
            results : this._processResults(data,config)
        }
    },
    _constructGraphQLQuery: function(data,config) {
        return function(term) {
            return JSON.stringify({
                query: this._QUERY_STRING,
                variables: {
                    "chars": term,
                    "baseTable": data.baseTable,
                    "paginationLimit": this._PAGINATION_LIMIT,
                    "shortList": config.shortList,
                    "canRead": config.canRead,
                    "includeDefault": config.includeDefault,
                    "selectedOnly": config.selectedOnly,
                    "selectedField": this.name,
                    "selected":data.initialValue,
                    "noViews": config.noViews,
                    "noSystemTables": config.noSystemTables,
                    "filterEntitledTables": config.filterEntitledTables,
                    "tableName": data.tableName,
                    "fieldName": data.fieldName,
                    "showTableNames": config.showTableNames,
                    "showTableNamesOnLabel": config.showTableNamesOnLabel,
                    "skipRoot": config.skipRoot,
                    "recordSysId": data.sysId,
                    "allowPublic": config.allowPublic,
                    "skipScopeRestrictions": config.skipScopeRestrictions,
                    "tableChoicesScript": config.tableChoicesScript,
                    "noRemoteTables": config.noRemoteTables,
                    "includeDocumentTables": config.includeDocumentTables,
                    "appendLabelToTableName": true,
                    "serializedChanges": "",
                    "encodedRecord": ""
                }
            })
        }.bind(this);
    },
    _processResults : function (data,config) {
        return function(response,page,query) {
            var queryResults = response.data.GlideLayout_Query.tableChoiceListRetriever.tableNames;
            if (config.displayNone && !query.term)
                queryResults.unshift({id: data.noneChoiceValue, text: data.noneChoiceLabel});
            if (queryResults && queryResults.length > 0)
                queryResults.push({
                    id: '-1',
                    text: getMessage('Type more characters to see more results'),
                    disabled: true
                });
            if(config.fieldType === "composite_name" && !config.displayNone && queryResults.length > 0){
                queryResults.unshift({id: "*", text: "*"});
            }
            return {
                results: queryResults
            };
        }
    },
    _updateFieldLabel: function(value, label) {
        var element = gel(this.name);
        var newLabel = label;
        if (newLabel === '' && this.config.displayNone)
            newLabel = this.data.noneChoiceLabel;
        $j(element).select2('data', {id : value, text : newLabel});
    },
    _PAGINATION_LIMIT: 25,
_GRAPHQL_ENDPOINT: '/api/now/graphql',
    _QUERY_STRING: 'query (\
        $chars: String!, $paginationLimit: Int, $paginationOffset: Int,\
        $shortList: Boolean,\
        $canRead: Boolean,\
        $includeDefault: Boolean,\
        $selectedOnly: Boolean,\
        $selectedField: String,\
        $selected: String,\
        $noViews: Boolean,\
        $noSystemTables: Boolean,\
        $filterEntitledTables: Boolean,\
        $tableName: String,\
        $fieldName: String,\
        $showTableNames: Boolean,\
        $showTableNamesOnLabel: Boolean,\
        $tableChoicesScript: String,\
        $skipRoot: Boolean,\
        $baseTable: String,\
        $recordSysId: String!,\
        $serializedChanges: String!,\
        $encodedRecord: String!,\
        $allowPublic: Boolean,\
        $skipScopeRestrictions: Boolean,\
        $noRemoteTables: Boolean,\
        $includeDocumentTables: Boolean,\
        $appendLabelToTableName: Boolean\
        ) {\
        GlideLayout_Query {\
          tableChoiceListRetriever(\
            chars: $chars,\
            pagination: {limit: $paginationLimit, offset: $paginationOffset},\
            shortList: $shortList,\
            canRead: $canRead,\
            includeDefault: $includeDefault,\
            selectedOnly: $selectedOnly,\
            selectedField: $selectedField,\
            selected: $selected,\
            noViews: $noViews,\
            noSystemTables: $noSystemTables,\
            filterEntitledTables: $filterEntitledTables,\
            tableName: $tableName,\
            fieldName: $fieldName,\
            showTableNames:$showTableNames,\
            showTableNamesOnLabel: $showTableNamesOnLabel,\
            tableChoicesScript:$tableChoicesScript,\
            skipRoot:$skipRoot,\
            baseTable:$baseTable,\
            recordSysId:$recordSysId,\
            serializedChanges:$serializedChanges,\
            encodedRecord:$encodedRecord,\
            allowPublic:$allowPublic,\
            skipScopeRestrictions:$skipScopeRestrictions,\
            noRemoteTables: $noRemoteTables,\
            includeDocumentTables: $includeDocumentTables,\
            appendLabelToTableName: $appendLabelToTableName\
          ) {\
            tableNames {\
              id: value,\
              text: displayValue\
            }\
          }\
        }\
}'.replace(/\s/g, '')
});
;
