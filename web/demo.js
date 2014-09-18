/*==========================
demo.js  http://plugins.jquery.com/soap/ or https://github.com/doedje/jquery.soap
part of the jQuery.soap distribution version: 1.4.3

this file contains the javascript for the jQuery.soap demo
===========================*/

$(document).ready(function() {
	$('#test').click(function(e) {
		// stop the form to be submitted...
		e.preventDefault();
		// empty all elements with results and feedback
		$('#feedbackHeader, #feedback, #soapcall, #requestXML').empty();
		// gather the data
		var data = $('#data').val();
		if ($('#dataType').val() == 'json') {
			data = eval("("+data+")");
		}

		var wss;
		if ($('#enableWSS').prop('checked')) {
			wss = {
				username: $('#wssUsername').val(),
				password: $('#wssPassword').val(),
				nonce: 'aepfhvaepifha3p4iruaq349fu34r9q',
				created: new Date().getTime()
			};
		}

		var callout = writeSoapCall();
		$('#soapcall').text(callout);

		$.soap({
			url: $('#url').val(),
			method: $('#method').val(),

			appendMethodToURL: $('#appendMethodToURL').prop('checked'),
			SOAPAction: $('#SOAPAction').val(),
			soap12: $('#soap12').prop('checked'),
			async: $('#async').prop('checked'),

			data: data,
			wss: wss,

			/*
			HTTPHeaders: {
				Authorization: 'Basic ' + btoa('test:test'),
				SOAPAction: ''
			},
			*/

			envAttributes: {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
			},

			namespaceQualifier:  $('#namespaceQualifier').val(),
			namespaceURL: $('#namespaceURL').val(),
			noPrefix: $('#noPrefix').prop('checked'),
			elementName: $('#elementName').val(),

			enableLogging: $('#enableLogging').prop('checked'),

			beforeSend: function(SOAPEnvelope) {
				var xmlout = dom2html($.parseXML(SOAPEnvelope.toString()).firstChild);
				$('#requestXML').text(xmlout);
			},
			success: function(SOAPResponse) {
				$('#feedbackHeader').html('Response: Success!');
				$('#feedback').text(dom2html(SOAPResponse.toXML().firstChild));
			},
			error: function(SOAPResponse) {
				$('#feedbackHeader').html('Response: Error!');
			//	$('#feedback').text(SOAPResponse.toString());
			}
		});
	});
});

function writeSoapCall() {
	var options = [];
	if ($('#url').val()) { options.push('  url: "' + $('#url').val() + '"'); }
	if ($('#method').val()) { options.push('  method: "' + $('#method').val() + '"'); }
	if ($('#appendMethodToURL').prop('checked') == false) { options.push('  appendMethodToURL: false'); }
	if ($('#SOAPAction').val()) { options.push('  SOAPAction: "' + $('#SOAPAction').val() + '"'); }
	if ($('#soap12').prop('checked') == true) { options.push('  soap12: true'); }
	if ($('#async').prop('checked') == false) { options.push('  async: false'); }
	var prettyData = $('#data').val();
	if ($('#dataType').val() == 'xml') {
		prettyData = '"' + prettyData.replace(/\"/g,'\\"') + '"';
	}
	prettyData = prettyData.replace(/\n/g,'\n  ');
	if ($('#data').val()) { options.push('  data: ' + prettyData); }
	if ($('#namespaceQualifier').val()) { options.push('  namespaceQualifier: "' + $('#namespaceQualifier').val() + '"'); }
	if ($('#namespaceURL').val()) { options.push('  namespaceURL: "' + $('#namespaceURL').val() + '"'); }
	if ($('#noPrefix').prop('checked') == true) { options.push('  noPrefix: true'); }
	if ($('#elementName').val()) { options.push('  elementName: "' + $('#elementName').val() + '"'); }
	if ($('#enableLogging').prop('checked') == true) { options.push('  enableLogging: true'); }
	if ($('#enableWSS').prop('checked')) {
		options.push('  wss: {\n    username: "' + $('#wssUsername').val() + '"');
		options.push('    password: "' + $('#wssPassword').val() + '"');
		options.push('    nonce: "aepfhvaepifha3p4iruaq349fu34r9q"');
		options.push('    created: new Date().getTime()\n  };');
	}
	var callout = [];
	callout.push('$.soap({');
	callout.push(options.join(',\n'));
	callout.push('});');
	callout.push('','url used: ' + ($('#appendMethodToURL').prop('checked') ? $('#url').val() + $('#method').val() : $('#url').val()))
	return callout.join('\n');
}
function dom2html(xmldom, tabcount) {
	var whitespace = /^\s+$/;
	var tabs = '  ';
	var xmlout = [];
	tabcount = (tabcount) ? tabcount : 0;

	xmlout.push('\n', repeat(tabs, tabcount), '<', xmldom.nodeName);
	for (var i in xmldom.attributes) {
		var attribute = xmldom.attributes[i];
		if (attribute.nodeType === 2) {
			xmlout.push(' ', attribute.name, '="', attribute.value, '"');
		}
	}
	xmlout.push('>');
	++tabcount;
	// for (var j in xmldom.childNodes) {
	for (var j = 0; j < xmldom.childNodes.length; j++) {
		var child = xmldom.childNodes[j];
		if (child.nodeType === 1) {
			xmlout.push(dom2html(child, tabcount));
		}
		if (child.nodeType === 3 && !whitespace.test(child.nodeValue)) {
			xmlout.push(child.nodeValue);
		}
		if (child.nodeType === 4) {
			xmlout.push('<![CDATA[' + child.nodeValue + ']]>');
		}
	}
 	if (xmldom.childNodes.length === 1 && (xmldom.childNodes[0].nodeType === 3 || xmldom.childNodes[0].nodeType === 4)) {
		xmlout.push('</', xmldom.nodeName, '>');
	} else {
		xmlout.push('\n', repeat(tabs, --tabcount),'</', xmldom.nodeName, '>');
	}
	return xmlout.join('');
}
function repeat(x, n) {
	var s = '';
	for (;;) {
		if (n & 1) s += x;
		n >>= 1;
		if (n) x += x;
		else break;
	}
	return s;
}