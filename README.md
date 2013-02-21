jQuery Soap
===========
file: jquery.soap.js
version: 0.9.2

jQuery plugin for communicating with a server using SOAP
--------------------------------------------------------

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
		namespaceQualifier: 'myns'
		namespaceUrl: 'urn://service.my.server.com'
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
Remy Blom,
The Netherlands
remy.blom@kmt.hku.nl

amended: 31 October 2011
by: Diccon Towns - dtowns@reapit.com - THANX! =]

Original jqSOAPClient.beta.js by proton17

Changelog
---------
0.9.2 - some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 - minor changes to keep LINT happy
0.9.0 - first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to $.soap