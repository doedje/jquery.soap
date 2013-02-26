jQuery Soap
===========
**file:** jquery.soap.js
**version:** 0.9.3

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

Config call
-----------
Since version 0.9.3 it is possible to make a call to **$.soap** just to set extra config values. When you have a lot of calls to $.soap and are tired of repeating the same values for url, returnJson, namespace and error for instance, this new approach can come in handy:

	$.soap({
		url: 'http://my.server.com/soapservices/',
		namespaceQualifier: 'myns',
		namespaceUrl: 'urn://service.my.server.com',
		returnJson: true,
		error: function (string) {
			// show error
		}
	});

	$.soap({
		method: 'helloWorld',
		params: {
			name: 'Remy Blom',
			msg: 'Hi!'
		},
		success: function (data) {
			// do stuff with data
		}
	});

The code above will do exactly the same as the first example, but when you want to do another call to the same soapserver you only have to specify the changed values:

	$.soap({
		method: 'doSomethingElse',
		params: {},
		success: function (data) {
			// do stuff with data
		}
	});

But it won't stop you from doing a call to a completely different soapserver with a different error handler for instance, like so:

	$.soap({
		url: 'http://another.server.com/anotherService'
		method: 'helloWorld',
		params: {
			name: 'Remy Blom',
			msg: 'Hi!'
		},
		success: function (data) {
			// do stuff with data
		},
		error: function (data) {
			alert('that other server might be down...')
		}
	});

_NOTE: the **method** is used as a key. If no method is specified in the options passed to **$.soap** all options are stored in the globalConfig, there won't be a soapRequest. When a method is specified the globalConfig will be used and all options passed to **$.soap** will overrule those in globalConfig, but keep in mind, they won't be overwritten!_

Dependencies
------------
If you want the function to return json
(ie. convert the response soap/xml to json)
you will need the **jQuery.xml2json.js**


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
Version | Changes
--- | ---
0.9.3 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | minor changes to keep LINT happy.
0.9.0 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**