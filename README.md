jQuery SOAP
=========
jquery.soap.js
communicating with soap

This script is basically a wrapper for jqSOAPClient.beta.js from proton17

I only fixed a minor bug, and added two functions:
One function to send the soapRequest that takes a complex object as a parameter
and that deals with the response so you can set actions for success or error.
Also I made a very basic json2soap function.
(at the moment it will not deal with arrays properly)
After that I wrapped it all to become a proper jQuery plugin so you can call:

	$.soap({
		url: 'http://my.server.com/soapservices/',
		method: 'helloWorld',
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

Dependencies:
If you want the function to return json (ie. convert the response soap/xml to json)
you will need the jQuery.xml2json.js

created at: Dec 03, 2009
scripted by:

Remy Blom,
Utrecht School of Arts,
The Netherlands

www.hku.nl
remy.blom@kmt.hku.nl

amended: 31 October 2011
by: Diccon Towns - dtowns@reapit.com - THANX!