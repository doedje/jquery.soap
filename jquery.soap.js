/*==========================
jquery.soap.js  http://plugins.jquery.com/soap/ or https://github.com/doedje/jquery.soap
version: 1.2.1

jQuery plugin for communicating with a web service using SOAP.

One function to send the soapRequest that takes a complex object as a parameter

Dependencies
------------
jQuery -- built and tested with v1.9.1 and v1.10.1, MAY work back to v1.6
SOAPResponse.toJSON() depends on jQuery.xml2json.js

Authors / History
-----------------

2013-06 >> fix for SOAPServer and SOAPAction headers, better params object to SOAPObject function
Remy Blom == www.hku.nl == remy.blom@kmt.hku.nl
Utrecht School of Arts,The Netherlands

2013-03 >> update internal OO structure, enable XML & object input as well as JSON
Zach Shelton == zachofalltrades.net
https://github.com/zachofalltrades/jquery.soap

2013-02-19 >> published to plugins.jquery.com/soap/
Remy Blom == https://github.com/doedje/jquery.soap

2011-10-31 >> fix handling of arrays in JSON paramaters
Diccon Towns == dtowns@reapit.com

2009-12-03 >> wrap jqSOAPClient as plugin
Remy Blom == www.hku.nl == remy.blom@kmt.hku.nl
Utrecht School of Arts,The Netherlands

2007-12-20 >> jqSOAPClient.beta.js by proton17
http://archive.plugins.jquery.com/project/jqSOAPClient

License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

I may consider permitting uses outside of the license terms on a by-case basis.

USAGE
-----

options {
	url: 'http://my.server.com/soapservices/',		//endpoint address for the service
	method: 'helloWorld',							// service operation name
													// 1) will be appended to url if appendMethodToURL=true
													// 2) will be used for request element name when building xml from JSON 'params' (unless 'elementName' is provided)
													// 3) will be used to set SOAPAction request header if no SOAPAction is specified
	appendMethodToURL: true,						// method name will be appended to URL defaults to true
	SOAPAction: 'action',							// manually set the Request Header 'SOAPAction', defaults to the method specified above (optional)
	soap12: false,									// use SOAP 1.2 namespace and HTTP headers - default to false

	//params can be XML DOM, XML String, or JSON
	params: domXmlObject,							// XML DOM object
	params: xmlString,								// XML String for request (alternative to internal build of XML from JSON 'params')
	params: {										// JSON structure used to build request XML - SHOULD be coupled with ('namespaceQualifier' AND 'namespaceURL') AND ('method' OR 'elementName')
		name: 'Remy Blom',
		msg: 'Hi!'
	},

	//these options ONLY apply when the request XML is going to be built from JSON 'params'
	namespaceQualifier: 'myns',						// used as namespace prefix for all elements in request (optional)
	namespaceURL: 'urn://service.my.server.com',	// namespace url added to parent request element (optional)
	noPrefix: false,								// set to true if you don't want the namespaceQualifier to be the prefix for the nodes in params. defaults to false (optional)
	elementName: 'requestElementName',				// override 'method' as outer element (optional)

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	},

	//callback functions
	request: function (SOAPRequest)  {},			// callback function - request object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (optional)
	error:   function (SOAPResponse) {},				// callback function to handle fault return (optional)

	// debugging
	enableLogging: false						// to enable the local log function set to true, defaults to false (optional)
}

======================*/

(function($) {
	var enableLogging;
	var globalConfig = { // this setup once, defaults go here
		appendMethodToURL: true,
		noPrefix: false,
		soap12: false,
		enableLogging: false
	};

	$.soap = function(options) {
		var config = {};

		// a configuration call will not have 'data' specified ('params' is used for backwards compatibility)
		if (options && !options.params && !options.data) {
			$.extend(globalConfig, options); // update global config
			return;
		}
		$.extend(config, globalConfig, options);
		// function log will only work below this line!
		enableLogging = config.enableLogging;

		// fallbacks for changed properties
		SOAPTool.fallbackDeprecated(config);

		var soapObject = SOAPTool.processData({
			data: config.data,
			name: (!!config.elementName) ? config.elementName : config.method,
			prefix: (!!config.namespaceQualifier && !config.noPrefix) ? config.namespaceQualifier+':' : '',
			namespaceURL: config.namespaceURL,
			namespaceQualifier: config.namespaceQualifier
		});

		if (!!soapObject && !!config.url) { // we have a request and somewhere to send it
			// Create a SOAPRequest with the soapObject
			var soapRequest = new SOAPRequest(soapObject);
			// WSS
			if (!!config.wss) {
				// add to WSS Security header to soapRequest
				soapRequest.addHeader(SOAPTool.createWSSHeader(config.wss));
			}
			// append Method?
			if(!!config.appendMethodToURL && !!config.method){
				config.url += config.method;
			}
			return soapRequest.send({
				url: config.url,
				action: (!!config.SOAPAction) ? config.SOAPAction : config.method,
				soap12: config.soap12,
				beforeSend: config.request
			}).done(function(data, textStatus, jqXHR) {
				if ($.isFunction(config.success)) {
					config.success(new SOAPResponse(textStatus, jqXHR));
				}
			}).fail(function(jqXHR, textStatus, errorThrown) {
				if ($.isFunction(config.error)) {
					config.error(new SOAPResponse(textStatus, jqXHR));
				}
			});
		}
	};

	//Soap request - this is what being sent
	function SOAPRequest (soapObject) {
		this.typeOf = "SOAPRequest";
		this.prefix = 'soap';
		this.soapConfig = null;

console.log(soapObject)

		var env, header, body;
		// let's get the soap namespace prefix
		var parts = soapObject.name.split(':');
		if (parts[1] === 'Envelope') {
			this.prefix = parts[0];
			if (soapObject.attr('xmlns:' + this.prefix) === this.SOAP11.namespaceURL) {
				this.soapConfig = this.SOAP11;
			}
			if (soapObject.attr('xmlns:' + this.prefix) === this.SOAP12.namespaceURL) {
				this.soapConfig = this.SOAP12;
			}
			// attributes
			var attributes = soapObject.attr();
			for (var i in attributes) {
				// hmm, attributes and namespaces are not the same....

console.log('attributes > ' + i + ' > ' + attributes[i])

			}
			// headers
			header = soapObject.find(this.prefix + ':Header');
			if (header && header.children) {
				for (var j in header.children) {
					this.addHeader(header.children[j]);
				}
			}
			// body
			body = soapObject.find(this.prefix + ':Body');
			if (body && body.children) {
				for (var k in body.children) {
					this.addBody(body.children[k]);
				}
			} else {
				// hier zouden we de children van env nog kunnen adden als body...
			}
		} else {
			// rootnode was not Envelope... let's presume...
		}

		/* what is there to check anywaze...
		[x] is there a soap envelope?
		[x] is there a soap header?
		[x] is there a soap body?
		[x] is there a soap11 or soap12 namespace?
		[ ] are there any additional namespaces for the envelope?
		[ ] is there a soap header
		[ ] any additional namespaces for the body?
		*/

		env = soapObject.find(this.prefix + ':Envelope');
		header = soapObject.find(this.prefix + ':Header');
		body = soapObject.find(this.prefix + ':Body');

		if (!env && !header && !body) {
			// a soapObject with nothing, mere data
			this.addBody(soapObject);
		}
	}

	SOAPRequest.prototype = {
		SOAP11: {
			type: 'text/xml',
			namespaceURL: 'http://schemas.xmlsoap.org/soap/envelope/'
		},
		SOAP12: {
			type: 'application/soap+xml',
			namespaceURL: 'http://www.w3.org/2003/05/soap-envelope/'
		},
		namespaces: [],
		headers: [],
		bodies: [],
		addNamespace: function(name, uri) {
			this.namespaces.push({name: name, uri: uri});
		},
		addHeader: function(soapObject) {
			this.headers.push(soapObject);
		},
		addBody: function(soapObject) {
			this.bodies.push(soapObject);
		},
		toString: function() {
			var soapEnv = new SOAPObject(this.prefix + ':Envelope');
			soapEnv.attr('xmlns:' + this.prefix, this.soapConfig.namespaceURL);
			//Add Namespace(s)
			if (this.namespaces.length > 0) {
				for (var i in this.namespaces) {
					var myNS = namespaces[i];
					soapEnv.attr("xmlns:" + myNS.name, myNS.uri);
				}
			}
			//Add Header(s)
			if (this.headers.length > 0) {
				var soapHeader = soapEnv.newChild(this.prefix + ':Header');
				for (var j in this.headers) {
					soapHeader.appendChild(this.headers[j]);
				}
			}
			//Add Body(s)
			if (this.bodies.length > 0) {
				var soapBody = soapEnv.newChild(this.prefix + ':Body');
				for (var k in this.bodies) {
					soapBody.appendChild(this.bodies[k]);
				}
			}
			return soapEnv.toString();
		},
		send: function(options) {
			var thisRequest = this;
			if (!this.soapConfig) {
				this.soapConfig = (options.soap12) ? this.SOAP12 : this.SOAP11;
			}
			var contentType = this.soapConfig.type;
			return $.ajax({
				type: "POST",
				url: options.url,
				dataType: "xml",
				processData: false,
				data: this.toString(),
				contentType: contentType + "; charset=UTF-8",
				beforeSend: function(req) {
					if (contentType === thisRequest.SOAP11.type && !!options.action) {
						req.setRequestHeader("SOAPAction", options.action);
					}
					// function to preview the soapObject before it is send to the server
					if ($.isFunction(options.beforeSend)) {
						options.beforeSend(thisRequest);
					}
				}
			});
		}
	};

	// SOAPObject - an abstraction layer to build SOAP Objects.
	var SOAPObject = function(name) {
		this.typeOf = 'SOAPObject';
		this.name = name;
		this.ns = {};
		this.attributes = {};
		this._parent = null;
		this.children = [];
		this.value = null;

		this.attr = function(name, value) {
			if (!!name && !!value) {
				this.attributes[name] = value;
				return this;
			} else if (!!name) {
				return this.attributes[name];
			} else {
				return this.attributes;
			}
		};
		this.val = function(value) {
			if (!value) {
				return this.value;
			} else {
				this.value = value;
				return this;
			}
		};
		this.addNamespace = function(name, url) {
			this.ns[name] = url;
			return this;
		};
		this.appendChild = function(obj) {
			obj._parent = this;
			this.children.push(obj);
			return obj;
		};
		this.newChild = function(name) {
			var obj = new SOAPObject(name);
			this.appendChild(obj);
			return obj;
		};
		this.addParameter = function(name, value) {
			var obj = new SOAPObject(name);
			obj.val(value);
			this.appendChild(obj);
			return this;
		};
		this.hasChildren = function() {
			return (this.children.length > 0) ? true : false;
		};
		this.find = function(name) {
			if (this.name === name) {
				return this;
			} else {
				for(var i in this.children) {
					return this.children[i].find(name);
				}
			}
		};
		this.end = this.parent = function() {
			return this._parent;
		};
		this.toString = function() {
			var out = [];
			out.push('<'+this.name);
			//Namespaces
			for (var name in this.ns) {
					out.push(' xmlns:' + name + '="' + this.ns[name] + '"');
			}
			//Node Attributes
			for (var attr in this.attributes) {
					out.push(' ' + attr + '="' + this.attributes[attr] + '"');
			}
			out.push('>');
			//Node children
			if(this.hasChildren()) {
				for(var cPos in this.children) {
					var cObj = this.children[cPos];
					if ((typeof(cObj) === 'object') && (cObj.typeOf === 'SOAPObject')) {
						out.push(cObj.toString());
					}
				}
			}
			//Node Value
			if (!!this.value) {
				out.push(this.value);
			}
			//Close Tag
			out.push('</' + this.name + '>');
			return out.join('');
		};
	};

	//Soap response - this will be passed to the callback from SOAPClient.SendRequest
	var SOAPResponse = function(status, xhr) {
		this.typeOf = "SOAPResponse";
		this.status = status;
		this.headers = xhr.getAllResponseHeaders().split('\n');
		this.httpCode = xhr.status;
		this.httpText = xhr.statusText;
		this.content = (xhr.responseXML === undefined) ? xhr.responseText : xhr.responseXML;
		this.toString = function(){
			if (typeof this.content === 'string') {
				return this.content;
			}
			if ($.isXMLDoc(this.content)) {
				return SOAPTool.dom2string(this.content);
			}
			throw new Error("Unexpected Content: " + $.type(this.content));
		};
		this.toXML = function(){
			if ($.isXMLDoc(this.content)) {
				return this.content;
			}
			return $.parseXML(this.content);
		};
		this.toJSON = function(){
			if ($.xml2json) {
				return $.xml2json(this.content);
			}
			throw new Error("Missing JQuery Plugin 'xml2json'");
		};
	};

	//Singleton SOAP Tool
	var SOAPTool = {
		processData: function(options) {
			var soapObject;
			if ($.type(options.data) === "string") {
				// if data is XML string, parse to XML DOM
				// ensure that string is not empty and contains more than whitespace
				if (/\S/.test(options.data)) {
					options.data = $.parseXML(options.data);
				}
			}
			if ($.isXMLDoc(options.data)) {
				// if data is XML DOM, parse to SOAPObject
				soapObject = SOAPTool.dom2soap(options.data.firstChild);
			} else if ($.isPlainObject(options.data)) {
				// if data is JSON, parse to SOAPObject
				if (!!options.name) {
					soapObject = SOAPTool.json2soap(options.name, options.data, options.prefix);
					if (!!options.namespaceQualifier && !!options.namespaceURL) {
						soapObject.addNamespace(options.namespaceQualifier, options.namespaceURL);
					}
				}
			} else if ($.isFunction(options.data)) {
				// if data is function, the function should return a SOAPObject
				soapObject = options.data(SOAPObject);
			}
			return soapObject;
		},
		json2soap: function (name, params, prefix, parentNode) {
			var soapObject;
			var childObject;
			if (typeof params == 'object') {
				// added by DT - check if object is in fact an Array and treat accordingly
				if(params.constructor.toString().indexOf("Array") != -1) { // type is array
					for(var x in params) {
						childObject = this.json2soap(name, params[x], prefix, parentNode);
						parentNode.appendChild(childObject);
					}
				} else {
					soapObject = new SOAPObject(prefix+name);
					for(var y in params) {
						childObject = this.json2soap(y, params[y], prefix, soapObject);
						soapObject.appendChild(childObject);
					}
				}
			} else {
				soapObject = new SOAPObject(prefix+name);
				soapObject.val(''+params); // the ''+ is added to fix issues with falsey values.
			}
			return soapObject;
		},
		dom2soap: function (xmldom) {
			var whitespace = /^\s+$/;
			var soapObject = new SOAPObject(xmldom.nodeName);
			for (var i in xmldom.attributes) {
				var attribute = xmldom.attributes[i];
				soapObject.attr(attribute.name, attribute.value);
			}
			for (var j in xmldom.childNodes) {
				var child = xmldom.childNodes[j];
				if (child.nodeType === 1) {
					var childObject = SOAPTool.dom2soap(child);
					soapObject.appendChild(childObject);
				}
				if (child.nodeType === 3 && !whitespace.test(child.nodeValue)) {
					soapObject.val(child.nodeValue);
				}
			}
			return soapObject;
		},
		dom2string: function(dom) {
			if (typeof XMLSerializer!=="undefined") {
				return new window.XMLSerializer().serializeToString(dom);
			} else {
				return dom.xml;
			}
		},
		createWSSHeader: function(wssValues) {
			if  (!!wssValues.username && !!wssValues.password) {
				var wssConst = {
					security: "wsse:Security",
					securityNS: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
					usernameToken: "wsse:UsernameToken",
					usernameTokenNS: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
					username: "wsse:Username",
					usernameType: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
					password: "wsse:Password",
					passwordType: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText",
					nonce: "wsse:Nonce",
					nonceType: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
					wsuCreated: "wsu:Created",
					wsuCreatedType: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
				};
				var WSSNode = new SOAPObject(wssConst.security)
					.addNamespace('wsse', wssConst.securityNS)
					.addNamespace('wsu', wssConst.usernameTokenNS)
					.newChild(wssConst.usernameToken)
						.newChild(wssConst.username)
							.attr('Type', wssConst.usernameType)
							.val(wssValues.username)
						.end()
						.newChild(wssConst.password)
							.attr('Type', wssConst.passwordType)
							.val(wssValues.password)
						.end()
					.end();
				var userTokenNode = WSSNode.find(wssConst.usernameToken);
				if (!!wssValues.nonce) {
					userTokenNode
						.newChild(wssConst.nonce)
							.attr('Type', wssConst.nonceType)
							.val(wssValues.nonce);
				}
				if (!!wssValues.created) {
					userTokenNode
						.newChild(wssConst.wsuCreated)
							.attr('Type', wssConst.wsuCreatedType)
							.val(wssValues.created);
				}
				return WSSNode;
			}
		},
		fallbackDeprecated: function(config) {
			// fallbacks for changed properties: (the old names will deprecate at version 2.0.0!)
			var deprecated = {
				// usage -> oldParam: 'newParam'
				namespaceUrl: 'namespaceURL',
				params: 'data'
			};
			for (var oldParam in deprecated) {
				var newParam = deprecated[oldParam];
				if (!config[newParam] && !!config[oldParam]) {
					warn('jquery.soap: ' + oldParam + ' is deprecated, use ' + newParam + ' instead!');
					config[newParam] = config[oldParam];
					delete config[oldParam];
				}
			}
		}
	};
	function log() {
		if (enableLogging && typeof(console)==='object') {
			if ($.isFunction(console.log)) {
				if (arguments.length == 1) {
					console.log(arguments[0]);
				} else {
					console.log(arguments);
				}
			}
		}
	}
	function warn() {
		if (typeof(console)==='object') {
			if ($.isFunction(console.warn)) {
				if (arguments.length == 1) {
					console.warn(arguments[0]);
				} else {
					console.warn(arguments);
				}
			}
		}
	}
})(jQuery);

