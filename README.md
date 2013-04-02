jQuery Soap
===========
**file:** jquery.soap.js  
**version:** 1.0.0

jQuery plugin for communicating with a web service using SOAP.
--------------------------------------------------------------
This script uses $.ajax to do a soapRequest. It can take XML DOM, XML string or JSON as input and the response can be returned as either XML DOM, XML string or JSON too.

Thanx to proton17, Diccon Towns and Zach Shelton!

**Let's $.soap()!**

_**NOTE:** I just pulled in Zach Shelton's changes, made some quick changes to the README so this would at least reflect the current version of jquery.soap.js, but it might still contain errors AND be incomplete. I'll will test the script myself and make sure the README is right next week!_

Example
-------
```Javascript
$.soap({
	url: 'http://my.server.com/soapservices/',
	method: 'helloWorld',
	namespaceQualifier: 'myns',
	namespaceUrl: 'urn://service.my.server.com',
	params: {
		name: 'Remy Blom',
		msg: 'Hi!'
	},
	success: function (soapResponse) {
		// do stuff with soapResponse
		// if you want to have the response as JSON use soapResponse.toJSON();
		// or soapResponse.toString() to get XML string
		// or soapResponse.toXML() to get XML DOM
	},
	error: function (SOAPResponse) {
		// show error
	}
});
```

This will create the following XML:

```XML
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
```

And this will be send to: url + method
http://my.server.com/soapservices/helloWorld

Options
-------
```Javascript
{
	url: 'http://my.server.com/soapservices/',		//endpoint address for the service
	method: 'helloWorld',							// service operation name
													// 1) will be appended to url if appendMethodToURL=true
													// 2) will be used for request element name when building xml from JSON 'params' (unless 'elementName' is provided)
	appendMethodToURL: true,						// method name will be appended to URL defaults to true
	soap12: false,									// use SOAP 1.2 namespace and HTTP headers - default to false

	//params can be XML DOM, XML String, or JSON
	params: domXmlObject,							// XML DOM object
	params: xmlString,								// XML String for request (alternative to internal build of XML from JSON 'params')
	params: {										// JSON structure used to build request XML - SHOULD be coupled with ('namespaceQualifier' AND 'namespaceUrl') AND ('method' OR 'elementName')
		name: 'Remy Blom',
		msg: 'Hi!'
	},

	//these options ONLY apply when the request XML is going to be built from JSON 'params'
	namespaceQualifier: 'myns',						// used as namespace prefix for all elements in request (required)
	namespaceUrl: 'urn://service.my.server.com',	// namespace url added to parent request element (required)
	elementName: 'requestElementName',				// override 'method' as outer element (optional)

	//callback functions
	request: function (SOAPRequest)  {},			// callback function - request object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (required)
	error:   function (SOAPResponse) {}				// callback function to handle fault return (required)
}
```

Config call
-----------
Since version 0.9.3 it is possible to make a call to **$.soap** just to set extra config values. When you have a lot of calls to $.soap and are tired of repeating the same values for url, returnJson, namespace and error for instance, this new approach can come in handy:

```Javascript
$.soap({
	url: 'http://my.server.com/soapservices/',
	namespaceQualifier: 'myns',
	namespaceUrl: 'urn://service.my.server.com',
	error: function (soapResponse) {
		// show error
	}
});

$.soap({
	method: 'helloWorld',
	params: {
		name: 'Remy Blom',
		msg: 'Hi!'
	},
	success: function (soapResponse) {
		// do stuff with soapResponse
	}
});
```

The code above will do exactly the same as the first example, but when you want to do another call to the same soapserver you only have to specify the changed values:

```Javascript
$.soap({
	method: 'doSomethingElse',
	params: {...},
	success: function (soapResponse) {
		// do stuff with soapResponse
	}
});
```

But it won't stop you from doing a call to a completely different soapserver with a different error handler for instance, like so:

```Javascript
$.soap({
	url: 'http://another.server.com/anotherService'
	method: 'helloWorld',
	params: {
		name: 'Remy Blom',
		msg: 'Hi!'
	},
	success: function (soapResponse) {
		// do stuff with soapResponse
	},
	error: function (soapResponse) {
		alert('that other server might be down...')
	}
});
```

_**NOTE**: the **param** is used as a key. If no param is specified in the options passed to **$.soap** all options are stored in the globalConfig, there won't be a soapRequest. When a method is specified the globalConfig will be used and all options passed to **$.soap** will overrule those in globalConfig, but keep in mind, they won't be overwritten!_

Updating from 0.9.x
-------------------
To update to 1.0.0 is not quite a drop-in replacement. The return value from the $.soap() will be a SOAPResponse object. This object has toXML, toJSON, and toString methods -- meaning that the 'returnJSON' input parameter is no longer required (or used). It is also now possible to use XML (dom), xml (string), or JSON as the 'params' element when the options are passed in.

Same Origin Policy
------------------
You won't be able to have a page on http://www.example.com do an ajax call ($.soap is using $.ajax internally) to http://www.anotherdomain.com due to Same Origin Policy. To overcome this you should either install a proxy on http://www.example.com or use CORS. Keep in mind that it also not allowed to go from http://www.example.com to http://soap.example.com or even to http://www.example.com:8080

Dependencies
------------
jQuery -- built and tested with v1.9.1, MAY work back to v1.6  
SOAPResponse.toJSON() depends on **jQuery.xml2json.js**

Authors / History
-----------------

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

Changelog
---------
Version | Date | Changes
--- | --- | ---
1.0.0 | 2013-04-02 | Minor fix (return for dom2string in reponse)
0.10.0 | 2013-03-29 | The **First Zach Shelton version**, better code, XML DOM, XML string and JSON in and out
0.9.4 | 2013-02-26 | changed the charset of soapRequest to UTF-8 and removed the " quotes
0.9.3 | 2013-02-26 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | 2013-02-21 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | 2013-02-20 | minor changes to keep LINT happy.
0.9.0 | 2013-02-20 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**
