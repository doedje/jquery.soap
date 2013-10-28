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

		// fallbacks for changed properties: (the old names will deprecate at version 2.0.0!)
		// namespaceUrl to namespaceURL
		if (!config.namespaceURL && !!config.namespaceUrl) {
			warn('jquery.soap: namespaceUrl is deprecated, use namespaceURL instead!');
			config.namespaceURL = config.namespaceUrl;
		}
		// params to data
		if (!config.data && !!config.params) {
			warn('jquery.soap: params is deprecated, use data instead!');
			config.data = config.params;
		}

		var soapRequest = SOAPTool.processData(config);
		// will be created defined based on type of 'data' received

		if (!!soapRequest) {
			// WSS
			if (!!config.wss && !!config.wss.username && !!config.wss.password) {
				// add to soapRequest
				soapRequest.addHeader(SOAPTool.createWSSHeader(config.wss));
			}
			// function to preview the soapRequest before it is send to the server
			if ($.isFunction(config.request)) {
				config.request(soapRequest);
			}

			if (!!config.url && !!soapRequest) { // we have a request and somewhere to send it
				if(!!config.appendMethodToURL && !!config.method){
					config.url += config.method;
				}
				return soapRequest.send({
					url: config.url,
					action: (!!config.SOAPAction) ? config.SOAPAction : config.method,
					error: function (response) {
						if ($.isFunction(config.error)) {
							config.error(response);
						}
					},
					success: function (response) {
						if ($.isFunction(config.success)) {
							config.success(response);
						}
					}
				});
			}
		}
	};

	//Soap request - this is what being sent using SOAPClient.SendRequest
	var SOAPRequest = function(soapObj) {
		this.typeOf = "SOAPRequest";
		this.soapNamespace = SOAPTool.SOAP11_NAMESPACE;
		var nss = [];
		var headers = [];
		var bodies = (!!soapObj)?[soapObj]:[];
		this.addNamespace = function(ns, uri){nss.push(new SOAPTool.Namespace(ns, uri));};
		this.addHeader = function(soapObj){headers.push(soapObj);};
		this.addBody = function(soapObj){bodies.push(soapObj);};
		this.toString = function() {
			var soapEnv = new SOAPObject("soap:Envelope");
			soapEnv.attr("xmlns:soap",this.soapNamespace);
			//Add Namespace(s)
			if(nss.length>0){
				var tNs, tNo;
				for(tNs in nss){if(!nss.hasOwnProperty || nss.hasOwnProperty(tNs)){tNo=nss[tNs];if(typeof(tNo)==="object"){soapEnv.attr("xmlns:"+tNo.name, tNo.uri);}}}
			}
			//Add Header(s)
			if(headers.length>0) {
				var soapHeader = soapEnv.appendChild(new SOAPObject("soap:Header"));
				var tHdr;
				for(tHdr in headers){if(!headers.hasOwnProperty || headers.hasOwnProperty(tHdr)){soapHeader.appendChild(headers[tHdr]);}}
			}
			//Add Body(s)
			if(bodies.length>0) {
				var soapBody = soapEnv.appendChild(new SOAPObject("soap:Body"));
				var tBdy;
				for(tBdy in bodies){if(!bodies.hasOwnProperty || bodies.hasOwnProperty(tBdy)){soapBody.appendChild(bodies[tBdy]);}}
			}
			return soapEnv.toString();
		};
		this.send = function(options) {
			if(!!options.url) {
				var content = this.toString();
				var contentType = SOAPTool.SOAP11_TYPE;
				if (SOAPTool.isSOAP12(content)) {
					contentType = SOAPTool.SOAP12_TYPE;
				}
				return $.ajax({
					type: "POST",
					url: options.url,
					dataType: "xml",
					processData: false,
					data: content,
					contentType: contentType + "; charset=UTF-8",
					beforeSend: function(req) {
						if (contentType === SOAPTool.SOAP11_TYPE && !!options.action) {
							req.setRequestHeader("SOAPAction", options.action);
						}
					}
				}).done(function(data, textStatus, jqXHR) {
					options.success(new SOAPResponse(textStatus, jqXHR));
				}).fail(function(jqXHR, textStatus, errorThrown) {
					options.error(new SOAPResponse(textStatus, jqXHR));
				});
			}
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

	// SOAPObject - an abstraction layer to build SOAP Objects.
	var SOAPObject = function(name) {
		this.typeOf = 'SOAPObject';
		this.name = name;
		this.ns = {};
		this.attributes = {};
		this.parent = parent;
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
			obj.parent = this;
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
		this.end = function() {
			return this.parent;
		};
		this.parent = function() {
			return this.parent;
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

	//Singleton SOAP Tool
	var SOAPTool = {
		SOAP11_TYPE: "text/xml",
		SOAP12_TYPE: "application/soap+xml",
		SOAP11_NAMESPACE: "http://schemas.xmlsoap.org/soap/envelope/",
		SOAP12_NAMESPACE: "http://www.w3.org/2003/05/soap-envelope",
		isSOAP11: function(xml) {
			return (xml.indexOf(SOAPTool.SOAP11_NAMESPACE) !== -1);
		},
		isSOAP12: function(xml) {
			return (xml.indexOf(SOAPTool.SOAP12_NAMESPACE) !== -1);
		},
		isWrappedWithEnvelope: function(xml) {
			return (this.isSOAP11(xml) || this.isSOAP12(xml));
		},
		wrapWithEnvelope: function(xml, isSoap12) {
			var ns = (isSoap12) ? this.SOAP12_NAMESPACE : this.SOAP11_NAMESPACE ;
			var wrapped = "<soap:Envelope xmlns:soap=\""+ns+"\"><soap:Body>"+xml+"</soap:Body></soap:Envelope>";
			return wrapped;
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
		Namespace: function(name, uri) {
			return {"name":name, "uri":uri};
		},
		dom2string: function(dom) {
			if (typeof XMLSerializer!=="undefined") {
				return new window.XMLSerializer().serializeToString(dom);
			} else {
				return dom.xml;
			}
		},
		processData: function(options) {
			var soapRequest;
			if ($.isFunction(options.data)) {
				options.data = options.data(SOAPObject).toString();
			}
			if ($.type(options.data) === "string") {
				// ensure that string is not empty and contains more than whitespace
				if (/\S/.test(options.data)) {
					// it had better be a well formed XML string, but we'll trust that it is
					var xml;
					if (SOAPTool.isWrappedWithEnvelope(options.data)) {
						xml = options.data;
					} else {
						xml = SOAPTool.wrapWithEnvelope(options.data, options.soap12);
					}
					soapRequest = new SOAPRequest();
					//override the toString method of SOAPRequest
					soapRequest.toString = function(){
						return xml;
					};
				} else {
					//soapRequest is left undefined
				}
			} else if ($.isXMLDoc(options.data)) {
				soapRequest = new SOAPRequest();
				//override the toString method of SOAPRequest
				soapRequest.toString = function(){
					return SOAPTool.dom2String(options.data);
				};
			} else if ($.isPlainObject(options.data)) {
				//build from JSON
				if (!!options.method || !!options.elementName) {
					var name = !!options.elementName ? options.elementName : options.method;
					//get prefix to show in child elements of complex objects
					//unless the options.noPrefix is set to true
					var prefix = (!!options.namespaceQualifier && !options.noPrefix) ? options.namespaceQualifier+':' : '';
					var mySoapObject = SOAPTool.json2soap(name, options.data, prefix);
					if (!!options.namespaceQualifier && !!options.namespaceURL) {
						mySoapObject.addNamespace(options.namespaceQualifier, options.namespaceURL);
					}
					soapRequest = new SOAPRequest(mySoapObject);
					if (options.soap12) {
						soapRequest.soapNamespace = SOAPTool.SOAP12_NAMESPACE;
					}
				}
			} else {
				//no request
			}
			return soapRequest;
		},
		createWSSHeader: function(wssValues) {
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
			return new SOAPObject(wssConst.security)
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
					.newChild(wssConst.nonce)
						.attr('Type', wssConst.nonceType)
						.val(wssValues.nonce)
					.end()
					.newChild(wssConst.wsuCreated)
						.attr('Type', wssConst.wsuCreatedType)
						.val(wssValues.created)
					.end()
				.end();
		}
	};

})(jQuery);

