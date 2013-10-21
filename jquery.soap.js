/*==========================
jquery.soap.js  http://plugins.jquery.com/soap/ or https://github.com/doedje/jquery.soap
version: 1.2.1

jQuery plugin for communicating with a web service using SOAP.

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
	appendMethodToURL: true,						// method name will be appended to URL defaults to true
	SOAPAction: 'action',							// manually set the Request Header 'SOAPAction', defaults to the method specified above (optional)
	soap12: false,									// use SOAP 1.2 namespace and HTTP headers - default to false
	soapConfig: {									// configuration  for soap envelop node element
		type: string,
		headers: string,
		customNS: {},
		prefix: string,
		namespace: string
	},

	//params can be XML DOM, XML String
	params: domXmlObject,							// XML DOM object
	params: xmlString,								// XML String for request

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	},

	//callback functions
	success: function (SOAPResponse) {},			// callback function to handle successful return (required)
	error:   function (SOAPResponse) {},			// callback function to handle fault return (required)

	// debugging
	enableLogging: false						// to enable the local log function set to true, defaults to false (optional)
}

======================*/

(function($) {
	var enableLogging; // set by config/options
	var globalConfig = { //this setup once
		headers: {},
		soapConfig: {},
		appendMethodToURL: true,
		soap12: false,
		enableLogging: false
	};

	$.soap = function(options) {
		var config = {};

		//a configuration call will not have 'params' specified
		if (options && !options.params || ($.type(options.params) !== "string" || !$.isXMLDoc(config.params))) {
			$.extend(globalConfig, options);//update global config
			return;
		}

		$.extend(config, globalConfig, options);
		enableLogging = config.enableLogging;// function log will only work below this line!

		//a configuration Soap
		$.extend(SOAPTool.settings, !!config.soap12 ? SOAP12 : SOAP11, globalConfig.soapConfig);
		if ($.type(options.soapConfig) === 'object') {
			$.extend(SOAPTool.settings, options.soapConfig);
		}
		log(config);
		log(SOAPTool.settings);

		SOAPTool.startEnvelope();
		SOAPTool.pushHeaders(config.wss);
		SOAPTool.pushBody(config.params);
		SOAPTool.endEnvelope();

		if (!!config.url) {//we have a request and somewhere to send it
			if (!$.isFunction(config.error)) {
				throw new Error ("error callback function was not provided");
			}
			if (!$.isFunction(config.success)) {
				throw new Error ("success callback function was not provided");
			}
			var client = new SOAPClient();
			var url = client.Proxy = config.url;
			if(config.appendMethodToURL && !!config.method){
				url += config.method;
			}
			var action = config.SOAPAction || config.method;
			client.SendRequest(action, url, function (response) {
				log(response);
				if (response.status !== 'success') {
					config.error(response);
				} else {
					config.success(response);
				}
			});
		}
	};


	var SOAPClient = function() {
		this.typeOf="SOAPClient";
		this.SendRequest = function(action, url, callback) {

			if (!$.isFunction(callback)) {
				throw new Error("callback function was not specified");
			}
			if(!!url) {
				var contentType = SOAPTool.settings.type;
				var xhr = $.ajax({//see http://api.jquery.com/jQuery.ajax/
					type: "POST",
					url: url,
					dataType: "xml",
					processData: false,
					data: SOAPTool.xml.join(""),
					contentType: contentType + "; charset=UTF-8",
					beforeSend: function(req) {
						if (contentType === SOAP11.type) {
							req.setRequestHeader("SOAPAction", action);
						}
					}
				});
				xhr.always(function(a, status, c){
					var response;
					var a_type = 'data';
					var c_type = 'jqXHR';
					log("status: " + $.type(status) + " '" + status + "'");
					if (status !== 'success') {
						a_type = 'jqXHR';
						c_type = 'errorThrown';
					}
					log("-- a: " + a_type + " --");
					log(a);
					log("-- c: " + c_type + " --");
					log(c);
					log("a: " + a_type + ": " + $.type(a) + "  isXMLDoc(a):" + $.isXMLDoc(a) + "  a.responseText:" + $.type(a.responseText) + "  isXMLDoc(a.responseText):" + $.isXMLDoc(a.responseText) + "  a.responseXML:" + $.type(a.responseXML) + "  isXMLDoc(a.responseXML):" + $.isXMLDoc(a.responseXML));
					log("c: " + c_type + ": " + $.type(c) + "  isXMLDoc(c):" + $.isXMLDoc(c) + "  c.responseText:" + $.type(c.responseText) + "  isXMLDoc(c.responseText):" + $.isXMLDoc(c.responseText) + "  c.responseXML:" + $.type(c.responseXML) + "  isXMLDoc(c.responseXML):" + $.isXMLDoc(c.responseXML));
					if ($.isXMLDoc(a)) {
						response = new SOAPResponse(status, c);
						response.content = SOAPTool.dom2string(a);
					} else if ($.type(a)==='object') {
						response = new SOAPResponse(status, a);
						response.content = (a.responseXML === undefined) ? a.responseText : a.responseXML;
					} else if ($.type(c)==='object') {
						response = new SOAPResponse(status, c);
						response.content = (c.responseXML === undefined) ? c.responseText : c.responseXML;
					} else {
						throw new Error("unexpected return types for jqXHR.always()");
					}
					callback(response);
				});
			}
		};
	};

	var SOAP11 = {
		type: "text/xml",
		headers: "",
		customNS: {},
		prefix: "SOAP-ENV",
		namespace: "http://schemas.xmlsoap.org/soap/envelope/"
	},
	SOAP12 = {
		type: "application/soap+xml",
		headers: "",
		customNS: {},
		prefix: "env",
		namespace: "http://www.w3.org/2003/05/soap-envelope"
	},
	WSSconst = {
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

	//Singleton SOAP Tool
	var SOAPTool=(function(){
		var _self = {
			xml: [],
			settings: {},
			startEnvelope: function () {
				var prefix = this.settings.prefix,
					namespace = this.settings.namespace,
					customNS = this.settings.customNS;
				this.xml = ["<", prefix, ":Envelope xmlns:", prefix, "=\"", namespace, "\" "];
				for (ns in customNS) {
					if (customNS.hasOwnProperty(ns)) {
						this.xml.push(ns, "=\"", customNS[ns], "\" ");
					}
				}
				this.xml.push(">");
			},
			endEnvelope: function () {
				var prefix = this.settings.prefix;
				this.xml.push("</", prefix, ":Envelope>");
			},
			pushHeaders: function (wss) {
				var boolWSS = (!!wss && !!wss.username && !!wss.password),
					prefix = this.settings.prefix;
				if (boolWSS || this.settings.headrs) {
					this.xml.push("<", prefix, ":Header>", (this.settings.headers || ""));
					if (boolWSS) {
						var wss = WSSconst;

						this.xml.push("<", wss.security, " ", "xmlns:wsse", "=\"", wss.securityNS, "\">");
						this.xml.push("<", wss.usernameToken, " ", "xmlns:wsu", "=\"", wss.usernameTokenNS, "\">");
						this.xml.push("<", wss.username, " ", "Type", "=\"", wss.usernameType, "\">", wss.username, "</", wss.username, ">");
						this.xml.push("<", wss.password, " ", "Type", "=\"", wss.passwordType, "\">", wss.password, "</", wss.password, ">");
						if (wss.nonce) {
							this.xml.push("<", wss.nonce, " ", "Type", "=\"", wss.nonceType, "\">", wss.nonce, "</", wss.nonce, ">");
						}
						if (wss.created) {
							this.xml.push("<", wss.wsuCreated, " ", "Type", "=\"", wss.wsuCreatedType, "\">", wss.created, "</", wss.wsuCreated, ">");
						}
						this.xml.push("</", wss.usernameToken, ">");
						this.xml.push("</", wss.security, ">");
					}
					this.xml.push("</", prefix, ":Header>");
				}
			},
			pushBody: function (xml) {
				var prefix = this.settings.prefix;
				this.xml.push("<", prefix, ":Body>", $.isXMLDoc(xml) ? this.dom2String(xml) : xml, "</", prefix, ":Body>");
			},
			dom2string: function(dom) {
				if (window.XMLSerializer) {
					return new window.XMLSerializer().serializeToString(dom);
				} else {
					return dom.xml;
				}
			}
		};
		return _self;
	})();

	//Soap response - this will be passed to the callback from SOAPClient.SendRequest
	var SOAPResponse=function(status, xhr) {
		this.typeOf="SOAPResponse";
		this.status=status;
		this.headers=xhr.getAllResponseHeaders().split('\n');
		this.httpCode=xhr.status;
		this.httpText=xhr.statusText;
		this.content=null;
		this.toString=function(){
			if (typeof this.content==='string') {
				return this.content;
			}
			if ($.isXMLDoc(this.content)) {
				return SOAPTool.dom2string(this.content);
			}
			throw new Error("Unexpected Content: " + $.type(this.content));
		};
		this.toXML=function(){
			if ($.isXMLDoc(this.content)) {
				return this.content;
			}
			return $.parseXML(this.content);
		};
	};

	function log(x) {
		if (enableLogging && typeof(console)==='object') {
			if ($.isFunction(console.log)) {
				console.log(x);
			}
		}
	}

})(jQuery);

