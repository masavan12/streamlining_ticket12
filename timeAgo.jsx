/*! RESOURCE: /scripts/classes/timeAgo.js */
$j(function($) {
	'use strict';
	var ATTR = 'timeago';
	var TA_ATTRS = 'timeago-attrs';
	var EMPTY = 'sn-timeago-empty-msg';
	var settings = {
		allowFuture: true,
		strings: {}
	};
	updateMessages();
	findElements();
	setInterval(findElements, 30 * 1000);
	CustomEvent.observe('list_content_changed', findElements);
	CustomEvent.observe('date_field_changed', function(payload) {
		var id = payload.id;
		updateFormElement(id, payload.dateString);
		telemetryForRecordUpdateElement(id);
	});
	function findElements(root) {
		var elements = (root || document).querySelectorAll('[' + ATTR + ']');
		var i = elements.length;
		while (i--)
			updateElement(elements[i]);
	}
	function updateFormElement(id, dateString) {
		var element_calendar = gel(id);
		var element_timeago = gel(id + '.timeago');
		if (element_calendar && element_timeago) {
			element_timeago.setAttribute('title', dateString);
			if (g_user_date_time_format && dateString !== "") {
				var int = getDateFromFormat(dateString, g_user_date_time_format);
				int = convertUserTimeToUtcTimeMs(int);
				dateString = new Date(int).toISOString().split('.')[0].replace('T', ' ');
			}
			element_timeago.setAttribute(ATTR, dateString);
			element_calendar.setAttribute(ATTR, dateString);
			updateElement(element_calendar, false);
			updateElement(element_timeago, false);
		}
	}
	function updateMessages() {
		var msgs = getMessages([
			'just now',
			"about a minute ago",
			"about a minute from now",
			"about %d minutes ago",
			"about %d minutes from now",
			"about an hour ago",
			"about an hour from now",
			"about %d hours ago",
			"about %d hours from now",
			"a day ago",
			"a day from now",
			"%d days ago",
			"%d days from now",
			"about a month ago",
			"about a month from now",
			"about %d months ago",
			"about %d months from now",
			"about a year ago",
			"about a year from now",
			"about %d years ago",
			"about %d years from now",
			'(empty)'
		]);
		settings.strings = {
			justNow: msgs["just now"],
			minuteAgo: msgs["about a minute ago"],
			minuteFromNow: msgs["about a minute from now"],
			minutesAgo: msgs["about %d minutes ago"],
			minutesFromNow: msgs["about %d minutes from now"],
			hourAgo: msgs["about an hour ago"],
			hourFromNow: msgs["about an hour from now"],
			hoursAgo: msgs["about %d hours ago"],
			hoursFromNow: msgs["about %d hours from now"],
			dayAgo: msgs["a day ago"],
			dayFromNow: msgs["a day from now"],
			daysAgo: msgs["%d days ago"],
			daysFromNow: msgs["%d days from now"],
			monthAgo: msgs["about a month ago"],
			monthFromNow: msgs["about a month from now"],
			monthsAgo: msgs["about %d months ago"],
			monthsFromNow: msgs["about %d months from now"],
			yearAgo: msgs["about a year ago"],
			yearFromNow: msgs["about a year from now"],
			yearsAgo: msgs["about %d years ago"],
			yearsFromNow: msgs["about %d years from now"],
			numbers: [],
			empty: msgs["(empty)"]
		};
	}
	function toWords(distanceMillis) {
		var $l = settings.strings;
var seconds = Math.abs(distanceMillis) / 1000;
var minutes = seconds / 60;
var hours = minutes / 60;
var days = hours / 24;
var years = days / 365;
		var ago = true;
		if (settings.allowFuture) {
			if (distanceMillis < 0)
				ago = false;
		}
		function substitute(stringOrFunction, number) {
			var string = isFunction(stringOrFunction) ?
				stringOrFunction(number, distanceMillis) : stringOrFunction;
			var value = ($l.numbers && $l.numbers[number]) || number;
return string.replace(/%d/i, value);
		}
		var words = seconds < 45 && (distanceMillis >= 0 || !settings.allowFuture) && substitute($l.justNow, Math.round(seconds)) ||
			seconds < 90  && ago && substitute($l.minuteAgo, 1) ||
			seconds < 90  && !ago && substitute($l.minuteFromNow, 1) ||
			minutes < 45 && ago && substitute($l.minutesAgo, Math.round(minutes)) ||
			minutes < 45 && !ago && substitute($l.minutesFromNow, Math.round(minutes)) ||
			minutes < 90  && ago && substitute($l.hourAgo, 1) ||
			minutes < 90 && !ago && substitute($l.hourFromNow, 1) ||
			hours < 24 && ago && substitute($l.hoursAgo, Math.round(hours)) ||
			hours < 24 && !ago && substitute($l.hoursFromNow, Math.round(hours)) ||
			hours < 42 && ago &&  substitute($l.dayAgo, 1) ||
			hours < 42 && !ago && substitute($l.dayFromNow, 1) ||
			days < 30 && ago && substitute($l.daysAgo, Math.ceil(days)) ||
			days < 30 && !ago && substitute($l.daysFromNow, Math.ceil(days)) ||
			days < 45 && ago && substitute($l.monthAgo, 1) ||
			days < 45 && !ago && substitute($l.monthFromNow, 1) ||
days < 365 && ago && substitute($l.monthsAgo, Math.round(days / 30)) ||
days < 365 && !ago && substitute($l.monthsFromNow, Math.round(days / 30)) ||
			years < 1.5 && ago && substitute($l.yearAgo, 1) ||
			years < 1.5 && !ago && substitute($l.yearFromNow, 1) ||
			ago && substitute($l.yearsAgo, Math.round(years)) ||
			!ago && substitute($l.yearsFromNow, Math.round(years));		
		return words;
	}
	function isFunction(value) {
		return typeof value === 'function';
	}
	function isNumber(value) {
		return typeof value === 'number';
	}
	function isDate(value) {
		return Object.prototype.toString.call(value) === '[object Date]';
	}
	function isNull(value) {
		return (value === null || value === '' || typeof value === 'undefined')
	}
	function getEmptyMessage(element) {
		var attr = element.getAttribute(EMPTY);
		if (attr)
			return attr;
		return settings.strings.empty;
	}
	function parse(iso8601) {
		if (isDate(iso8601))
			return iso8601;
		if (isNull(iso8601))
			return null;
		if (isNumber(iso8601))
			return parseInt(iso8601, 10);
		return new Date(parseDateString(iso8601));
	}
	function parseDateString(iso8601) {
		var s = iso8601.trim();
s = s.replace(/\.\d+/, "");
s = s.replace(/-/, "/").replace(/-/, "/");
s = s.replace(/T/, " ").replace(/Z/, " UTC");
s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, " $1$2");
		return s;
	}
	function updateElement(element, isLocalTime) {
		var value = element.getAttribute(ATTR) || element.getAttribute('title');
		var time = parse(value);
		if (!isDate(time) || isNaN(time.getTime())) {
			element.setAttribute("data-original-title", '');
			return element.innerHTML = isNull(value) ? getEmptyMessage(element) : value;
		}
		var timeInWords = isLocalTime ? timeFromNow(time) : correctedTimeFromNow(time);
		var attrToSet = element.getAttribute(TA_ATTRS);
		if (attrToSet === 'title' && element.hasAttribute('data-original-title')) {
			element.setAttribute('data-original-title', timeInWords);
			if ($j(element).hasClass('datex'))
				element.setAttribute('title', '');
		}
		else
			element.setAttribute(attrToSet, timeInWords);
		if (element.hasClassName('date-timeago'))
			element.innerHTML = timeInWords;
	}
	function updateInterval(diff) {
		diff = Math.abs(diff);
		var SEC = 1000;
		var MIN = 60 * SEC;
		var HR = 60 * MIN;
		if (diff < MIN)
			return 2 * SEC;
		if (diff < (30 * MIN))
			return 12 * SEC;
		if (diff < HR)
			return MIN;
		if (diff < (8 * HR))
			return 20 * MIN;
		return 24 * HR;
	}
	function correctedTimeFromNow(date) {
		var isUserRecordTZ = typeof g_tz_user_offset == 'undefined' ? true : g_tz_user_offset;
		var offset = isUserRecordTZ ? new Date().getTimezoneOffset()*60000 - Math.abs(g_tz_offset) : 0;
		return timeBetween(Date.now() + offset, addTimeZone(date));
	}
	function timeFromNow(date) {
		return timeBetween(Date.now(), date);
	}
	function timeBetween(date1, date2) {
		return toWords(date1 - date2);
	}
	function convertTimezone(date, toUTC) {
		var timeZoneCorrection = (typeof g_tz_offset === 'number') ? Math.abs(g_tz_offset) : new Date().getTimezoneOffset() * 60000;
		if (toUTC)
return date + timeZoneCorrection;
		else
return date - timeZoneCorrection;
	}
	function removeTimeZone(time) {
		return convertTimezone(time, true);
	}
	function addTimeZone(time) {
		return convertTimezone(time, false);
	}
	function setTimeagoValue(id, date) {
		if (isDate(date))
			date = date.toISOString();
		var element = document.querySelector(id) || document.getElementById(id);
		if (element)
			element.setAttribute(ATTR, date);
		updateElement(element);
	}
});
;
