jQuery Soap
===========
**file:** jquery.soap.js  
**version:** 1.0.6

jQuery plugin for communicating with a web service using SOAP.
--------------------------------------------------------------
This script uses $.ajax to do a soapRequest. It can take XML DOM, XML string or JSON as input and the response can be returned as either XML DOM, XML string or JSON too.

Thanx to proton17, Diccon Towns and Zach Shelton!

**Let's $.soap()!**

_**NOTE:** Please see my note on contacting me about issues, bugs, problems or any other questions below before sending me mail...._

Example
-------
```Javascript
$.soap({
	url: 'http://my.server.com/soapservices/',
	method: 'helloWorld',

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
	xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	<soap:Body>
		<helloWorld>
			<name>Remy Blom</name>
			<msg>Hi!</msg>
		</helloWorld>
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
	elementName: 'requestElementName',				// override 'method' as outer element (optional)

	//callback functions
	request: function (SOAPRequest)  {},			// callback function - request object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (required)
	error:   function (SOAPResponse) {},			// callback function to handle fault return (required)

	// debugging
	enableLogging: true								// to enable the local log function set to true, defaults to false (optional)
}
```

Config call
-----------
Since version 0.9.3 it is possible to make a call to **$.soap** just to set extra config values. When you have a lot of calls to $.soap and are tired of repeating the same values for url, returnJson, namespace and error for instance, this new approach can come in handy:

```Javascript
$.soap({
	url: 'http://my.server.com/soapservices/',
	namespaceQualifier: 'myns',
	namespaceURL: 'urn://service.my.server.com',
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

Demo page
---------
I included a simple demo page that you can use for testing. It allows you to play around with all the options for $.soap. Please take note that to make it work with your SOAP services you are bound by the same origin policy.

Dependencies
------------
jQuery -- built and tested with v1.9.1, MAY work back to v1.6  
SOAPResponse.toJSON() depends on **jQuery.xml2json.js**

Contacting me
-------------
Please note I don't mind you contacting me when you run into trouble implementing this plugin. But to keep things nice for me too, just follow these simple guidelines when you do:

- check the issues on https://github.com/doedje/jquery.soap/issues/ to see if someone else already had your problem, if not
- open an issue on https://github.com/doedje/jquery.soap/issues/ instead of sending me mail. This way others can learn from your case too! Please include the following:
	- the versions of your jquery and jquery.soap
	- your $.soap call
	- the request as sent to the server
	- the response from the server

_I also have a dayjob with deadlines and I'm a dad of two lovely little girls, so please understand I am not always able to reply to you... **Thanx for understanding!! =]**_

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

Changelog
---------
Version | Date | Changes
--- | --- | ---
1.0.6 | 2013-06-27 | params object to SOAPObject code fixed for complex object/array combi's
1.0.5 | 2013-06-20 | enableLogging is an option, changed namespaceUrl to namespaceURL (with fallback)
1.0.4 | 2013-06-20 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.3 | 2013-06-20 | Included a little demo and fixed SOAPServer and SOAPAction request headers
1.0.2 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.1 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.0 | 2013-04-02 | Minor fix (return for dom2string in reponse)
0.10.0 | 2013-03-29 | The **First Zach Shelton version**, better code, XML DOM, XML string and JSON in and out
0.9.4 | 2013-02-26 | changed the charset of soapRequest to UTF-8 and removed the " quotes
0.9.3 | 2013-02-26 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | 2013-02-21 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | 2013-02-20 | minor changes to keep LINT happy.
0.9.0 | 2013-02-20 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**
