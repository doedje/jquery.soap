/*==========================
jquery.soap.js
version: 0.9.5

jQuery plugin for communicating with a server using SOAP

This script is basically a wrapper for jqSOAPClient.beta.js from proton17

I only added the code at the top:
One function to send the soapRequest that takes a complex object as a parameter
which is converted to soap by the json2soap function.
Diccon Towns fixed it to properly deal with arrays! Thanx for that!
And that deals with the response so you can set actions for success or error.

After that I wrapped it all to hide stuff from the global namespace
and it becomes a proper jQuery plugin so you can call:

	$.soap({
		url: 'http://my.server.com/soapservices/',
		method: 'helloWorld',
		namespaceQualifier: 'myns',
		namespaceUrl: 'urn://service.my.server.com',
		params: {
			name: 'Remy Blom',
			msg: 'Hi!'
		},
		returnJson: true,  // default is false, so it won't need dependencies
		success: function (data) {
			// do stuff with data
		},
		error: function (string) {
			// show error
		}
	});

This will create the following XML:

	<soap:Envelope
		xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
		xmlns:myns="urn://service.my.server.com">
		<soap:Body>
			<myns:helloWorld>
				<name>Remy Blom</name>
				<msg>Hi!</msg>
			</myns:helloWorld>
		</soap:Body>
	</soap:Envelope>

And this will be send to: url + method
http://my.server.com/soapservices/helloWorld

Dependencies
-----------
If you want the function to return json (ie. convert the response soap/xml to json)
you will need the jQuery.xml2json.js

Authors
-------
created at: Dec 03, 2009
scripted by:

Remy Blom,
Utrecht School of Arts,
The Netherlands

www.hku.nl
remy.blom@kmt.hku.nl

amended: 31 October 2011
by: Diccon Towns - dtowns@reapit.com - THANX! =]

Original code: jqSOAPClient.beta.js by proton17
ORIGINAL LICENSE:

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
==========================*/

/*====================

options {
	url: 'http://my.server.com/soapservices/',		//endpoint address for the service
	method: 'helloWorld',							// service operation name 
	 												// 1) will be appended to url if appendMethodToURL=true
	 												// 2) will be used for request element name when building xml from 'params' unless 'elementName' is provided
	namespaceQualifier: 'myns',						// used as namespace prefix for all elements in request (when request is built from 'params')
	namespaceUrl: 'urn://service.my.server.com',	// namespace url added to parent request element (when request is built from 'params')
	elementName: 'requestElementName',				// optional string to use for the name xml element (see 'method') 
	xml: someVariableString,						// fully built XML structure for request (alternative to internal build of XML from 'params') 
	params: {										// JSON structure used to build request XML - SHOULD be coupled with ('namespaceQualifier' + 'namespaceUrl') and ('method' or 'elementName')  
		name: 'Remy Blom',
		msg: 'Hi!'
	},
	returnJson: false, 								// defaults to false to avoid additional plugin dependencies
	appendMethodToURL: true, 						// method name will be appended to URL defaults to true
	soap12: false, 									// use SOAP 1.2 namespace and HTTP headers - default to false
	request: function (data) {						// callback function - request object is passed back prior to ajax call 
		// do stuff with data
	},
	success: function (data) {						// callback function to handle successful return
		// do stuff with data
	},
	error: function (string) {						// callback function to handle fault return
		// show error
	}
}

======================*/

(function($) {
	$.soap = function(options) {
		var config = {};
		if (!this.globalConfig) { //this setup once
			this.globalConfig = {
				returnJson: false,
				appendMethodToURL: true,
				soap12: false
			};
		}
		if (options && !options.xml && !options.params) {//a configuration call should/will not have xml or params specified 
			$.extend(this.globalConfig, options);//update global config
			return;
		} 
		$.extend(config, this.globalConfig, options);
		var soapRequest;
		if (!!config.xml && (/\S/.test(config.xml))) {//is an xml parameter given that contains more than whitespace?
			if (SOAPTool.isWrappedWithEnvelope(config.xml)) {
				soapRequest = config.xml;
			} else { //wrap with appropriate soap envelope if necessary
				soapRequest = SOAPTool.wrapWithEnvelope(config.xml, config.soap12);
			}
		} else if (!!config.params && (!!config.method || !!config.elementName)) {//build soapRequest from params...
			var name = !!config.elementName ? config.elementName : config.method;
			var prefix = !!config.namespaceQualifier ? config.namespaceQualifier+':' : '';//get prefix to show in child elements of complex objects
			var mySoapObject = SOAPTool.json2soap(new SOAPObject(name), config.params, prefix);
			if (!!config.namespaceQualifier && !!config.namespaceUrl) {
				mySoapObject.ns = SOAPTool.Namespace(config.namespaceQualifier, config.namespaceUrl);
			}
			soapRequest = new SOAPRequest(mySoapObject);
			if (config.soap12) {
				soapRequest.soapNamespace = SOAPTool.SOAP12_NAMESPACE;
			}
		} else {
			//no request
		}
		if (!!soapRequest && !!config.request && (typeof(config.request)=="function")) {
			config.request(soapRequest);//TODO - send back only xml? (request could be object OR xml string at this point)
		}
		if (!!config.url && !!soapRequest) {//we have a request and somewhere to send it
			var client = new SOAPClient();
			client.Proxy = config.url;
			if(config.appendMethodToURL && !!config.method){
				client.Proxy += config.method;
			}
			client.SendRequest(config.method, soapRequest, function (response) {
				console.log(response);
				//response object includes methods toJSON(), toXML(), and toString(), and also provides access to the HTTP response 
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
//		this.httpHeaders = {};
//		this.SetHTTPHeader = function(name, value){
//			var re = /^[\w]{1,20}$/;
//			if((typeof(name) === "string") && re.test(name)) {
//				this.httpHeaders[name] = value;
//			}
//		};
		this.SendRequest = function(action, soapReq, callback) {
			if(!!this.Proxy) {
				var content;
				var contentType = SOAPTool.SOAP11_TYPE;
				if (typeof(soapReq)==='string') {
					content = soapReq;
				} else {
					content = soapReq.toString();
				}
				if (SOAPTool.isSOAP12(content)) {
					contentType = SOAPTool.SOAP12_TYPE;
				}
//				getResponse = function (xData, status) {
//					if(!!this._tId) {clearTimeout(this._tId);}
//					var response = new SOAPResponse(status, xData.status, xData.statusText, xData.getAllResponseHeaders());
//					response.content = (xData.responseXML === undefined) ? xData.responseText : xData.responseXML;
//					callback(response);
//				};
				var xhr = $.ajax({//see http://api.jquery.com/jQuery.ajax/
					type: "POST",
					url: this.Proxy,
					dataType: "xml",
					processData: false,
					data: content,
//					complete: getResponse,
					contentType: contentType + "; charset=" + this.CharSet,
					beforeSend: function(req) {
						req.setRequestHeader("Method", "POST");
//						req.setRequestHeader("SOAPServer", this.SOAPServer);
//						console.log("SOAPServer", this.SOAPServer);
						if (contentType === SOAPTool.SOAP11_TYPE) {
							req.setRequestHeader("SOAPAction", action);
//							console.log("SOAPAction", action);
						}
//						if(!!this.httpHeaders) {
//							var hh = null, ch = null;
//							for(hh in this.httpHeaders) {
//								if (!this.httpHeaders.hasOwnProperty || this.httpHeaders.hasOwnProperty(hh)) {
//									ch = this.httpHeaders[hh];
//									req.setRequestHeader(hh, ch.value);
//								}
//							}
//						}
					}
				});
				xhr.always(function(a, status, c){
					var response;
					if ($.isXMLDoc(a)) {
						response = new SOAPResponse(status, c);
						response.content = a;
					} else {
						response = new SOAPResponse(status, a);
						response.content = (a.responseXML === undefined) ? a.responseText : a.responseXML;
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
			json2soap: function (soapObject, params, prefix) {
				for (var x in params) {
					if (typeof params[x] == 'object') {
						// added by DT - check if object is in fact an Array and treat accordingly
						if(params[x].constructor.toString().indexOf("Array") != -1) {// type is array
							for(var y in params[x]) {
								soapObject.addParameter(prefix+x, params[x][y]);
							}
						} else {
							myParam = this.json2soap(new SOAPObject(prefix+x), params[x], prefix);
							soapObject.appendChild(myParam);
						}
					} else {
						soapObject.addParameter(prefix+x, params[x]);
					}
				}
				return soapObject;
			},
			Namespace: function(name, uri) {
				return {"name":name, "uri":uri};
			},
			soap2xml: function(soapObj) {
				var out = [];
				var isNSObj=false;
				try {
					if(!!soapObj&&typeof(soapObj)==="object"&&soapObj.typeOf==="SOAPObject") {
						//Namespaces
						if(!!soapObj.ns) {
							if(typeof(soapObj.ns)==="object") {
								isNSObj=true;
								out.push("<"+soapObj.ns.name+":"+soapObj.name);
								out.push(" xmlns:"+soapObj.ns.name+"=\""+soapObj.ns.uri+"\"");
							} else  {
								out.push("<"+soapObj.name);
								out.push(" xmlns=\""+soapObj.ns+"\"");
							}
						} else {
							out.push("<"+soapObj.name);
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
						if(isNSObj){out.push("</"+soapObj.ns.name+":"+soapObj.name+">");}
						else {out.push("</"+soapObj.name+">");}
						return out.join("");
					}
				} catch(e){
					alert("Unable to process SOAPObject! Object must be an instance of SOAPObject");
				}
			}
		}
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
			if (typeof this.content==='undefined') return '';
			if (typeof this.content==='string') return this.content;
			if ($.isXMLDoc(this.content)) {
				if (typeof XMLSerializer!=="undefined") {
					return new window.XMLSerializer().serializeToString(this.content);
				} else {
					return this.content.xml;
				}
			}
			throw new Error("Unexpected Content: " + typeof(this.content));
		};
		this.toXML=function(){
			if ($.isXMLDoc(this.content)) { return this.content;}
			if (window.DOMParser){ return new DOMParser().parseFromString(this.toString(),'text/xml');}
			if (window.ActiveXObject && window.GetObject) {
				var dom = new ActiveXObject('Microsoft.XMLDOM');
				dom.loadXML(this.toString());
				return dom;
			}
			throw new Error('No XML Parser');
		};
		this.toJSON=function(){
			if ($.xml2json) {
				return $.xml2json(this.content);
			}
			throw new Error("Missing JQuery Plugin 'xml2json'");
		};
	}

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

})(jQuery);

