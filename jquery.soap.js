/*==========================
jquery.soap.js  http://plugins.jquery.com/soap/ or https://github.com/doedje/jquery.soap
version: 1.2.0

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
	success: function (SOAPResponse) {},			// callback function to handle successful return (required)
	error:   function (SOAPResponse) {},				// callback function to handle fault return (required)

	// debugging
	enableLogging: false						// to enable the local log function set to true, defaults to false (optional)
}

======================*/

(function($) {
	var enableLogging; // set by config/options

	$.soap = function(options) {
		var config = {};
		if (!this.globalConfig) { //this setup once
			this.globalConfig = {
				appendMethodToURL: true,
				noPrefix: false,
				soap12: false,
				enableLogging: false
			};
		}

		//a configuration call will not have 'params' specified
		if (options && !options.params) {
			$.extend(this.globalConfig, options);//update global config
			return;
		}
		$.extend(config, this.globalConfig, options);

		enableLogging = config.enableLogging;// function log will only work below this line!
		log(config);

		var soapRequest; //will be created defined based on type of 'params' received

		if ($.type(config.params) === "string") {
			//ensure that string is not empty and contains more than whitespace
			if (/\S/.test(config.params)) {
				//it had better be a well formed XML string, but we'll trust that it is
				var xml;
				if (SOAPTool.isWrappedWithEnvelope(config.params)) {
					xml = config.params;
				} else {
					xml = SOAPTool.wrapWithEnvelope(config.params, config.soap12);
				}
				soapRequest = new SOAPRequest();
				//override the toString method of SOAPRequest
				soapRequest.toString = function(){
					return xml;
				};
			} else {
				//soapRequest is left undefined
			}

		} else if ($.isXMLDoc(config.params)) {
			soapRequest = config.params;
			soapRequest = new SOAPRequest();
			//override the toString method of SOAPRequest
			soapRequest.toString = function(){
				return SOAPTool.dom2String(config.params);
			};

		} else if ($.isPlainObject(config.params)) {
			//build from JSON
			if (!!config.method || !!config.elementName) {
				var name = !!config.elementName ? config.elementName : config.method;
				//get prefix to show in child elements of complex objects
				//unless the config.noPrefix is set to true
				var prefix = (!!config.namespaceQualifier && !config.noPrefix) ? config.namespaceQualifier+':' : '';
				var mySoapObject = SOAPTool.json2soap(name, config.params, prefix);
				// fallback for changing namespaceUrl to namespaceURL
				if (!config.namespaceURL && !!config.namespaceUrl) {
					warn('jquery.soap: namespaceUrl is deprecated, use namespaceURL instead!');
					config.namespaceURL = config.namespaceUrl;
				}
				if (!!config.namespaceQualifier && !!config.namespaceURL) {
					mySoapObject.ns = SOAPTool.Namespace(config.namespaceQualifier, config.namespaceURL);
				}
				soapRequest = new SOAPRequest(mySoapObject);
				if (config.soap12) {
					soapRequest.soapNamespace = SOAPTool.SOAP12_NAMESPACE;
				}
			}

		} else {
			//no request
		}

		// WSS
		if (!!config.wss && !!config.wss.username && !!config.wss.password) {
			// create nodes
			var wssSecurity = new SOAPObject('Soap:Security');
			var wssUsernameToken = new SOAPObject('wsse:UsernameToken');
			var wssUsername = new SOAPObject('wsse:Username');
			var wssPassword = new SOAPObject('wsse:Password');
			var wssNonce = new SOAPObject('wsse:Nonce');
			var wsuCreated = new SOAPObject('wsu:Created');

			// give them namespaces and Type attributes
			wssSecurity.attr('xmlns:wsse', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd');
			wssSecurity.attr('xmlns:wsu', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd');
			wssUsername.attr('Type', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd');
			wssPassword.attr('Type', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText');
			wssNonce.attr('Type', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd');
			wsuCreated.attr('Type', 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd');

			// fill the nodes
			wssUsername.val(config.wss.username);
			wssPassword.val(config.wss.password);
			wssNonce.val(config.wss.nonce);
			wsuCreated.val(config.wss.created);

			// put them in eachother...
			wssUsernameToken.appendChild(wssUsername);
			wssUsernameToken.appendChild(wssPassword);
			wssUsernameToken.appendChild(wssNonce);
			wssUsernameToken.appendChild(wsuCreated);
			wssSecurity.appendChild(wssUsernameToken);

			// add to soapRequest
			soapRequest.addHeader(wssSecurity);
		}

		if (!!soapRequest && $.isFunction(config.request)) {
			config.request(soapRequest);
		}

		if (!!config.url && !!soapRequest) {//we have a request and somewhere to send it
			if (!$.isFunction(config.error)) {
				throw new Error ("error callback function was not provided");
			}
			if (!$.isFunction(config.success)) {
				throw new Error ("success callback function was not provided");
			}
			var client = new SOAPClient();
			client.Proxy = config.url;
			if(config.appendMethodToURL && !!config.method){
				client.Proxy += config.method;
			}
			var action = config.method;
			if (!!config.SOAPAction) {
				action = config.SOAPAction;
			}
			client.SendRequest(action, soapRequest, function (response) {
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
		this._tId = null;
		this.Proxy = "";
		this.SOAPServer = "";
		this.CharSet = "UTF-8";
		this.Timeout = 0;
		this.SendRequest = function(action, soapReq, callback) {

			if (!$.isFunction(callback)) {
				throw new Error("callback function was not specified");
			}
			if(!!this.Proxy) {
				var content = soapReq.toString();
				var contentType = SOAPTool.SOAP11_TYPE;
				if (SOAPTool.isSOAP12(content)) {
					contentType = SOAPTool.SOAP12_TYPE;
				}
				var SOAPServer = this.SOAPServer;
				var xhr = $.ajax({//see http://api.jquery.com/jQuery.ajax/
					type: "POST",
					url: this.Proxy,
					dataType: "xml",
					processData: false,
					data: content,
					contentType: contentType + "; charset=" + this.CharSet,
					beforeSend: function(req) {
						req.setRequestHeader("Method", "POST");
						req.setRequestHeader("SOAPServer", SOAPServer);
						if (contentType === SOAPTool.SOAP11_TYPE) {
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

	//Singleton SOAP Tool
	var SOAPTool=(function(){
		var _self = {
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
					if(params.constructor.toString().indexOf("Array") != -1) {// type is array
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
			soap2xml: function(soapObj) {
				var out = [];
				var isNSObj=false;
				try {
					if(!!soapObj&&typeof(soapObj)==="object"&&soapObj.typeOf==="SOAPObject") {
						out.push("<"+soapObj.name);
						//Namespaces
						if(!!soapObj.ns) {
							if(typeof(soapObj.ns)==="object") {
								isNSObj=true;
								out.push(" xmlns:"+soapObj.ns.name+"=\""+soapObj.ns.uri+"\"");
							} else  {
								out.push(" xmlns=\""+soapObj.ns+"\"");
							}
						}
						//Node Attributes
						if(soapObj.attributes.length > 0) {
							var cAttr;
							var aLen=soapObj.attributes.length-1;
							do {
								cAttr=soapObj.attributes[aLen];
								if(isNSObj) {
									out.push(" "+soapObj.ns.name+":"+cAttr.name+"=\""+cAttr.value+"\"");
								} else {
									out.push(" "+cAttr.name+"=\""+cAttr.value+"\"");
								}
							} while(aLen--);
						}
						out.push(">");
						//Node children
						if(soapObj.hasChildren()) {
							var cPos, cObj;
							for(cPos in soapObj.children){
								cObj = soapObj.children[cPos];
								if(typeof(cObj)==="object"){out.push(SOAPTool.soap2xml(cObj));}
							}
						}
						//Node Value
						if(!!soapObj.value){out.push(soapObj.value);}
						//Close Tag
						out.push("</"+soapObj.name+">");
						return out.join("");
					}
				} catch(e){
					alert("Unable to process SOAPObject! Object must be an instance of SOAPObject");
				}
			}
		};
		return _self;
	})();

	//Soap request - this is what being sent using SOAPClient.SendRequest
	var SOAPRequest=function(soapObj) {
		this.typeOf="SOAPRequest";
		this.soapNamespace = SOAPTool.SOAP11_NAMESPACE;
		var nss=[];
		var headers=[];
		var bodies=(!!soapObj)?[soapObj]:[];
		this.addNamespace=function(ns, uri){nss.push(new SOAPTool.Namespace(ns, uri));};
		this.addHeader=function(soapObj){headers.push(soapObj);};
		this.addBody=function(soapObj){bodies.push(soapObj);};
		this.toString=function() {
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
	};

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
		this.toJSON=function(){
			if ($.xml2json) {
				return $.xml2json(this.content);
			}
			throw new Error("Missing JQuery Plugin 'xml2json'");
		};
	};

	//Soap Object - Used to build body envelope and other structures
	var SOAPObject = function(name) {
		this.typeOf="SOAPObject";
		this.ns=null;
		this.name=name;
		this.attributes=[];
		this.children=[];
		this.value=null;
		this.attr=function(name, value){this.attributes.push({"name":name, "value":value});return this;};
		this.appendChild=function(obj){this.children.push(obj);return obj;};
		this.addParameter=function(name,value){var obj=new SOAPObject(name);obj.val(value);this.appendChild(obj);};
		this.hasChildren=function(){return (this.children.length > 0)?true:false;};
		this.val=function(v){if(!v){return this.value;}else{this.value=v;return this;}};
		this.toString=function(){return SOAPTool.soap2xml(this);};
	};

	function log(x) {
		if (enableLogging && typeof(console)==='object') {
			if ($.isFunction(console.log)) {
				console.log(x);
			}
		}
	}

	function warn(x) {
		if (typeof(console)==='object') {
			if ($.isFunction(console.warn)) {
				console.warn(x);
			}
		}
	}

})(jQuery);

