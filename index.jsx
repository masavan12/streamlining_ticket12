/*! RESOURCE: /scripts/utils/StringHelpers.js */
window.NOW ||= {};
window.NOW.SyntaxEditor ||= {};
(exports => {
const SANITIZE_RGX = /[^a-zA-Z0-9_$]/g;
	exports.sanitizeVarName = str => {
		var validStr = str.replace(SANITIZE_RGX, '_');
if (/^[0-9]/.test(validStr)) {
			validStr = '_' + validStr;
		}
		return validStr;
	};
})(window.NOW.SyntaxEditor);
;
;
/*! RESOURCE: /scripts/utils/index.js */
