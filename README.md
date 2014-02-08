jQuery Soap
===========
**file:** jquery.soap.js  
**version:** 1.3.4

jQuery plugin for communicating with a web service using SOAP.
--------------------------------------------------------------
This script uses $.ajax to send a SOAPEnvelope. It can take XML DOM, XML string or JSON as input and the response can be returned as either XML DOM, XML string or JSON too.

Thanx to proton17, Diccon Towns and Zach Shelton!

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

Options overview
----------------
[More detailed list of the available options for jQuery.soap](options.md)
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

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	},

	//callback functions
	beforeSend: function (SOAPEnvelope)  {},			// callback function - SOAPEnvelope object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (optional)
	error:   function (SOAPResponse) {},			// callback function to handle fault return (optional)

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
request | beforeSend | $.ajax uses data too, more consistent

The old names are mapped to the new names and will be deprecated at version 2.0.0 (that might take years, or decades). A warning is printed to the console when you use an old name.

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

Dependencies
------------
jQuery -- built and tested with v1.10.2, MAY work back to v1.6  
SOAPResponse.toJSON() depends on **jQuery.xml2json.js**

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
jquery.soap is based on jqSOAPClient.beta.js which was licensed under GNU/GPLv3

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

**I may consider permitting uses outside of the license terms on a by-case basis.**

Authors / History
-----------------
2013-10 >> total rewrite, triggered by pull request #21 by anthony-redFox  
Remy Blom == https://github.com/doedje/jquery.soap

2013-06 >> fix for SOAPServer and SOAPAction headers, better params object to SOAPObject function  
Remy Blom == https://github.com/doedje/jquery.soap

2013-03 >> update internal OO structure, enable XML & object input as well as JSON  
Zach Shelton == zachofalltrades.net  
https://github.com/zachofalltrades/jquery.soap

2013-02-19 >> published to plugins.jquery.com/soap/  
Remy Blom == https://github.com/doedje/jquery.soap

2011-10-31 >> fix handling of arrays in JSON paramaters  
Diccon Towns == dtowns@reapit.com

2009-12-03 >> wrap jqSOAPClient as plugin  
Remy Blom == https://github.com/doedje/jquery.soap

2007-12-20 >> jqSOAPClient.beta.js by proton17  
http://archive.plugins.jquery.com/project/jqSOAPClient

Changelog
---------
Version numbers are [semver](http://semver.org/) compatible from version 1.0.0 and up.

Version | Date | Changes
--- | --- | ---
1.3.4 | 2014-02-08 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.3.3 | 2014-02-08 | bugfix: fixed json2soap for arrays
1.3.2 | 2014-01-16 | bugfix: _async_ defaulted to **false**? should have been **true**
1.3.1 | 2013-11-04 | minor changes: SOAPRequest is now SOAPEnvelope, request is now beforeSend
1.3.0 | 2013-10-31 | massive rewrite (fixes #14, #19, #20, lot of stuff from #21, #23)
1.2.2 | 2013-10-31 | fix for #24: a parameter set to NULL should be translated as &lt;language nil="true" /&gt;
1.2.1 | 2013-09-09 | fixed WSS namespace: from Soap:Security to wsse:Security (pull request #17)
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
0.10.0 | 2013-03-29 | The **First Zach Shelton version**, better code, XML DOM, XML string and JSON in and out
0.9.4 | 2013-02-26 | changed the charset of the $.ajax call to UTF-8 and removed the " quotes
0.9.3 | 2013-02-26 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | 2013-02-21 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | 2013-02-20 | minor changes to keep LINT happy.
0.9.0 | 2013-02-20 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**
