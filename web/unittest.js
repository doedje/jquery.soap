/*==========================
unittest.js  http://plugins.jquery.com/soap/ or https://github.com/doedje/jquery.soap
part of the jQuery.soap distribution version: 1.3.8

this file contains the javascript for the jQuery.soap demo
===========================*/

$(document).ready(function() {
	$.soapTest({
		data: function(s) {
			return new s('test')
				.addParameter('val','1')
				.addParameter('null', null)
				.addParameter('undefined');
		}
	}, '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><test><val>1</val><null nil="true"></null><undefined></undefined></test></soap:Body></soap:Envelope>')

	$.soapTest({
		data: function(SOAPObject) {
			return new SOAPObject('soap:Envelope')
				.addNamespace('ns','url')
				.attr('test','test')
				.newChild('child1')
					.attr('attr','val')
					.val('test')
				.end()
				.newChild('child2')
					.addParameter('name1','value1')
					.addParameter('name2','value2')
				.end();
		}
	}, '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" test="test"><soap:Body><child1 attr="val">test</child1><child2><name1>value1</name1><name2>value2</name2></child2></soap:Body></soap:Envelope>');

	$.soapTest({
		data: {
		 val: 0,
		 object: {
		  a: 1, b: 2, c:3
		 },
		 array: [4,5,6],
		 objects: [
		  {a: 7}, {a: 8}
		 ]
		}
	}, '')
});

/* functions */

$.soapTest = function(options, expected) {
	var optionsString = [];
	for (var i in options) {
		optionsString.push('\n	' + i + ': ' + options[i].toString().replace(/\t(\t)/g,'$1'));
	}

	$('#stage')
		.append('<hr />')
		.append($('<pre>').append('$.soap({ ' + optionsString.join(',') + '\n});'))
	if (expected) {
		$('#stage')
			.append('Expected:').append($('<pre>').append(expected.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
	}

	$.soap($.extend(options, {
		enableLogging: true,
		url: 'fake-soap-response.xml',
		beforeSend: function(s) {
			if (expected === s.toString()) {
				$('#stage')
					.append('Test succeeded!');
			} else {
				$('#stage')
					.append('Test failed! SOAPRequest:')
					.append($('<pre>').append(s.toString().replace(/</g, '&lt;').replace(/>/g, '&gt;')));
			}
		},
		success: function(s) {
			
console.log(s.toJSON())

		}
	}));
}

function dom2html(xmldom, tabcount) {
	var whitespace = /^\s+$/;
	var tabs = '  ';
	var xmlout = [];
	tabcount = (tabcount) ? tabcount : 0;

	xmlout.push('<', xmldom.nodeName);
	for (var i in xmldom.attributes) {
		var attribute = xmldom.attributes[i];
		if (attribute.nodeType === 2) {
			xmlout.push(' ', attribute.name, '="', attribute.value, '"');
		}
	}
	xmlout.push('>\n');
	++tabcount;
	for (var j in xmldom.childNodes) {
		var child = xmldom.childNodes[j];
		if (child.nodeType === 1) {
			xmlout.push(repeat(tabs, tabcount), dom2html(child, tabcount));
		}
		if (child.nodeType === 3 && !whitespace.test(child.nodeValue)) {
			xmlout.push(child.nodeValue);
		}
	}
	xmlout.push(repeat(tabs, --tabcount), '</', xmldom.nodeName, '>\n');
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