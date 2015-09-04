jQuery Soap
===========
**file:** jquery.soap.js  
**version:** 1.6.7

![SOAP](https://raw.githubusercontent.com/doedje/jquery.soap/master/Icon.jpg)

jQuery plugin for communicating with a web service using SOAP.
--------------------------------------------------------------
This script uses $.ajax to send a SOAPEnvelope. It can take XML DOM, XML string or JSON as input and the response can be returned as either XML DOM, XML string or JSON too.

Big thanx to everybody that contributed to $.soap!

**Let's $.soap()!**

_**NOTE:** Please see my note on contacting me about issues, bugs, problems or any other questions below before sending me mail...._

Example
-------
```Javascript
$.soap({
	url: 'http://my.server.com/soapservices/',
	method: 'helloWorld',

	data: {
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
will result in
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

Installation
------------
You can download the [latest version](https://github.com/doedje/jquery.soap/archive/1.6.7.zip) as a zip, which contains all the files within this repository.

Or just get the file [jquery.soap.js](https://raw.github.com/doedje/jquery.soap/master/jquery.soap.js)

Or install by bower or npm:

```
$ npm install jquery.soap

$ bower install jquery.soap
```

Dependencies
------------
[jQuery](http://jquery.com/download/) -- Should work fine with any version 1.9 or up, MAY work back to v1.6  

the function `SOAPResponse.toJSON()` depends on any 3rd party **jQuery.xml2json** plugin

Previously the bower.json mentioned the one from fyneworks, published by [XTREEM](https://github.com/xtreemrage/jquery.xml2json), as a dependency but that has been removed due to the fact that it has jquery 1.11 as dependency and is thus not usable with 1.9, 1.10 or 2.x versions of jquery.

As from version 1.6.7 you must manually install any 3rd party jQuery.xml2json plugin when you wish to use the `SOAPResponse.toJSON` function, like one from the list below:

[sparkbuzz/jQuery-xml2json](https://github.com/sparkbuzz/jQuery-xml2json)  
[fyneworks](http://www.fyneworks.com/jquery/xml-to-json/)

_Keep in mind that changing the plugin you are using might break your existing code that is already using `SOAPResonse.toJSON` because all plugins create objects with different structures!_

Options overview
----------------
[In depth overview of all the available options for $.soap](doc/options.md)
```Javascript
options = {
	url: 'http://my.server.com/soapservices/',		//endpoint address for the service
	method: 'helloWorld',							// service operation name
													// 1) will be appended to url if appendMethodToURL=true
													// 2) will be used for request element name when building xml from JSON 'params' (unless 'elementName' is provided)
													// 3) will be used to set SOAPAction request header if no SOAPAction is specified
	appendMethodToURL: true,						// method name will be appended to URL defaults to true
	SOAPAction: 'action',							// manually set the Request Header 'SOAPAction', defaults to the method specified above (optional)
	soap12: false,									// use SOAP 1.2 namespace and HTTP headers - default to false
	context: document.body							// Used to set this in beforeSend, success, error and data callback functions

	// addional headers and namespaces
	envAttributes: {								// additional attributes (like namespaces) for the Envelope:
		'xmlns:another': 'http://anotherNamespace.com/'
	}
	HTTPHeaders: {									// additional http headers send with the $.ajax call, will be given to $.ajax({ headers: })
		'Authorization': 'Basic ' + btoa('user:pass')
	}

	//data can be XML DOM, XML String, JSON or a function
	data: domXmlObject,								// XML DOM object
	data: xmlString,								// XML String for request (alternative to internal build of XML from JSON 'params')
	data: {											// JSON structure used to build request XML - SHOULD be coupled with ('namespaceQualifier' AND 'namespaceURL') AND ('method' OR 'elementName')
		name: 'Remy Blom',
		msg: 'Hi!'
	},
	data: function(SOAPObject) {					// function returning an instance of the SOAPObject class
		return new SOAPObject('soap:Envelope')
			.addNamespace('soap', 'http://schemas.xmlsoap.org/soap/envelope/')
			.newChild('soap:Body')
				... etc, etc
			.end()
	},

	//these options ONLY apply when the request XML is going to be built from JSON 'params'
	namespaceQualifier: 'myns',						// used as namespace prefix for all elements in request (optional)
	namespaceURL: 'urn://service.my.server.com',	// namespace url added to parent request element (optional)
	noPrefix: false,								// set to true if you don't want the namespaceQualifier to be the prefix for the nodes in params. defaults to false (optional)
	elementName: 'requestElementName',				// override 'method' as outer element (optional)

	//callback functions
	beforeSend: function (SOAPEnvelope)  {},		// callback function - SOAPEnvelope object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (optional)
	error:   function (SOAPResponse) {},			// callback function to handle fault return (optional)
	statusCode: {									// callback functions based on statusCode
		404: function() {
			console.log('404 Not Found')
		},
		200: function() {
			console.log('200 OK')
		}
	}

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	},

	// debugging
	enableLogging: false							// to enable the local log function set to true, defaults to false (optional)
}
```

Deprecated options
------------------
To keep the names of the options a bit more consistent with common naming conventions I renamed a few options:

old | new | reason
--- | --- | ---
napespaceUrl | namespaceURL | to capitalize URL is quite common
params | data | $.ajax uses data too, more consistent
request | beforeSend | $.ajax uses beforeSend too, more consistent

The old names are mapped to the new names and will be _removed_ at version 2.0.0 (that might take years, or decades). A warning is printed to the console when you use an old name.

Promise
-------
Since version 1.3.0 $.soap() returns the jqXHR object which implements the Promise interface. This allows you to use `.done()`, `.fail()`, `.always()`, etc. So instead of using the `success` and `error` option, you can also do:
```
$.soap({
	...
}).done(function(data, textStatus, jqXHR) {
	// do stuff on success here...
}).fail(function(jqXHR, textStatus, errorThrown) {
	// do stuff on error here...
})
```
The advantage is that these promise callbacks give you direct access to the original parameters provided by $.ajax instead of $.soap's SOAPResponse objects.

globalConfig
------------
Since version 0.9.3 it is possible to make a call to **$.soap** just to set extra config values. When you have a lot of calls to $.soap and are tired of repeating the same values for url, namespace and error for instance, this new approach can come in handy:
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
	data: {
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
	data: {...},
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
	data: {
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
_**NOTE**: the **data** parameter is used as a key. If no data is specified in the options passed to **$.soap** all options are stored in the globalConfig, a SOAPEnvelope won't be created, there will be nothing to send. When a method is specified the globalConfig will be used and all options passed to **$.soap** will overrule those in globalConfig, but keep in mind, they won't be overwritten!_

WS-Security
-----------
As from version 1.1.0 jQuery.soap supports a very basic form of WSS. This feature was requested (issue #9) and rather easy to implement, but I don't have a way to test it properly. So if you run into problems, please let me know (see below)
```
$.soap({
	// other parameters..

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	}
});
```

HTTP Basic Authorization
------------------------
Using the HTTPHeaders option it is relatively simple to implement HTTP Basic Authorization as follows:
```Javascript
var username = 'foo';
var password = 'bar';

$.soap({
	// other parameters...

	HTTPHeaders: {
		Authorization: 'Basic ' + btoa(username + ':' + password)
	}
});
```

Same Origin Policy
------------------
You won't be able to have a page on http://www.example.com do an ajax call ($.soap is using $.ajax internally) to http://www.anotherdomain.com due to Same Origin Policy. To overcome this you should either install a proxy on http://www.example.com or use CORS. Keep in mind that it also not allowed to go from http://www.example.com to http://soap.example.com or even to http://www.example.com:8080

Some links on **circumventing same origin policy**

http://stackoverflow.com/questions/3076414/ways-to-circumvent-the-same-origin-policy  
http://usamadar.com/2012/06/24/getting-around-browsers-same-origin-policy-sop-with-proxies-script-injection-jsonp-and-cors/  

Demo page
---------
I included a simple demo page that you can use for testing. It allows you to play around with all the options for $.soap. Please take note that to make it work with your SOAP services you are again bound by the **same origin policy**.

Contacting me
-------------
Please note I don't mind you contacting me when you run into trouble implementing this plugin, but to keep things nice for me too, just follow these simple guidelines when you do:

- First make sure you're not getting an error because of **same origin policy**!
- Check the [issues section](https://github.com/doedje/jquery.soap/issues/) and the [closed issues section](https://github.com/doedje/jquery.soap/issues?page=1&state=closed) to see if someone else already had your problem, if not
- Open an issue in the [issues section](https://github.com/doedje/jquery.soap/issues/) instead of sending me mail. This way others can learn from your case too! Please include the following:
	- the versions of your jquery and jquery.soap
	- your $.soap call
	- the request as sent to the server
	- the response from the server
- Being polite helps, especially when you want me to help you with _your_ problems. So please take the time to formulate something like a question. Opening an issue with just some code sniplets and error messages will be regarded as **unpolite** and will receive a ditto reply.
(I just don't like receiving stuff like [issue #18](https://github.com/doedje/jquery.soap/issues/18) on a sunday)

_I also have a dayjob with deadlines and I'm a dad of two lovely little girls, so please understand I am not always able to reply to you asap..._

**Thanx for understanding!! =]**

License GNU/GPLv3
-----------------
Copyright (C) 2009-2015 - Remy Blom, the Netherlands

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

**When GPL is not an option for you, contact me for information about the commercial license**

History
-------
$.soap was originally based on jqSOAPClient.beta.js by proton17 (written in 2007) and started as just a jquery wrapper in 2009.
I published it to the new plugins.jquery.com website in 2013 which uses github. Being on github was a good thing for $.soap as a lot of people started to use it and reported bugs, contributed code and even did complete rewrites!

Especially [Zach Shelton](http://zachofalltrades.net) and [Anthony-redFox](https://github.com/anthony-redFox) helped me improve $.soap a lot! **A big thank you to everybody involved!**

Changelog
---------
Version numbers are [semver](http://semver.org/) compatible.

Version | Date | Changes
--- | --- | ---
1.6.7 | 2015-09-04 | removed the dependency on jquery.xml2json from bower.json as discussed in [#83](https://github.com/doedje/jquery.soap/issues/83)
1.6.6 | 2015-09-02 | pull request #82: XHR for progress support may break IE8/IE9 cross-domain requests, thanx [Arun Menon](https://github.com/arunmenon1975)
1.6.5 | 2015-06-08 | pull request #78: Added Date object serialization to ISO8601, thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.6.4 | 2015-03-13 | fix for SOAPObject.end() throwing error parent() is not a function, bug introduced in 1.6.0
1.6.3 | 2015-03-13 | fix the dependency for xml2json to be >=1.3 instead of >1.3
1.6.2 | 2015-03-13 | fix for #74: added xml2json as a dependency in bower.json
1.6.1 | 2015-03-02 | pull request #73: Fix regression on SOAPTool.json2soap serialization for boolean type: thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.6.0 | 2015-02-16 | feature request #71: added statusCode, like $.ajax has... Thanx [AndersMygind](https://github.com/AndersMygind), fixed setting SOAPHeader as XML (did not work properly)
1.5.0 | 2015-01-31 | pull request #67: context added, some SOAP::Lite support, Thanx [ShaunMaher](https://github.com/ShaunMaher), pull request #69: return deferred object when !SOAPObject or !config.url, thanx [maxgrass](https://github.com/maxgrass), added SOAPHeader option as requested by [Adam Malcontenti-Wilson](https://github.com/adammw) in #62, fix for falsey values.
1.4.4 | 2014-10-18 | pull request #65: fix namespace and type for nil attribute, Thanx [philipc](https://github.com/philipc)
1.4.3 | 2014-09-18 | fix for empty namespaces like xmlns="" as found by XGreen on [StackOverflow](http://stackoverflow.com/questions/25809803/cdata-gets-removed-before-being-sent)
1.4.2 | 2014-09-17 | pull request #61: hot fix for the CData issue [StackOverflow](http://stackoverflow.com/questions/25809803/cdata-gets-removed-before-being-sent), Thanx [josepot](https://github.com/josepot)
1.4.1 | 2014-09-11 | pull request #59: Encode XML special chars, thanx [Simon St&uuml;cher](https://github.com/stchr)
1.4.0 | 2014-09-11 | fix for #56: overzealous loop conversion, #57: feature request - thanx [miljbee](https://github.com/miljbee), pull request #58 thanx [Brian Mooney](https://github.com/irishshagua), improved demo page
1.3.10 | 2014-07-16 | fix for #54: overzealous loop conversion
1.3.9 | 2014-07-07 | fix for #30: for (var in obj) does not work well in IE8: thanx [todd-lockhart](https://github.com/todd-lockhart), fix for #51: XML header missing, some minor updates
1.3.8 | 2014-04-14 | fix for #45: handle string objects in json2soap: thanx [PALLEAU Michel](https://github.com/mic006)
1.3.7 | 2014-02-27 | fix for #40: removed trailing slash on SOAP1.2 namespaceURL: thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.3.6 | 2014-02-26 | fix for issue #38: specifying only namespaceURL works too
1.3.5 | 2014-02-20 | bugfix for #36: correct handling of setting null values using SOAPObject
1.3.4 | 2014-02-08 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.3.3 | 2014-02-08 | bugfix: fixed json2soap for arrays
1.3.2 | 2014-01-16 | bugfix: _async_ defaulted to **false**? should have been **true**
1.3.1 | 2013-11-04 | minor changes: SOAPRequest is now SOAPEnvelope, request is now beforeSend
1.3.0 | 2013-10-31 | massive rewrite (fixes #14, #19, #20, lot of stuff from #21, #23) Triggered by [anthony-redFox](https://github.com/anthony-redFox)
1.2.2 | 2013-10-31 | fix for #24: a parameter set to NULL should be translated as &lt;language nil="true" /&gt;
1.2.1 | 2013-09-09 | fixed WSS namespace: from Soap:Security to wsse:Security (pull request #17) thanx [Giacomo Trezzi](https://github.com/G3z)
1.2.0 | 2013-08-26 | added noPrefix option and fixed bug of double namespace prefixes for nested objects (#13, #15)
1.1.0 | 2013-07-11 | Added WSS functionality (issue #9)
1.0.7 | 2013-07-03 | Changed the license to GNU GPLv3, I could never have used the MIT license since jqSOAPClient.beta.js is already licensed GNU GPLv3
1.0.6 | 2013-06-27 | params object to SOAPObject code fixed for complex object/array combi's
1.0.5 | 2013-06-20 | enableLogging is an option, changed namespaceUrl to namespaceURL (with fallback)
1.0.4 | 2013-06-20 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.3 | 2013-06-20 | Included a little demo and fixed SOAPServer and SOAPAction request headers
1.0.2 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.1 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.0 | 2013-04-02 | Minor fix (return for dom2string in reponse)
0.10.0 | 2013-03-29 | The **First Zach Shelton version**, better code, XML DOM, XML string and JSON in and out: thanx [Zach Shelton](https://github.com/zachofalltrades)
0.9.4 | 2013-02-26 | changed the charset of the $.ajax call to UTF-8 and removed the " quotes
0.9.3 | 2013-02-26 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | 2013-02-21 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | 2013-02-20 | minor changes to keep LINT happy.
0.9.0 | 2013-02-20 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**
