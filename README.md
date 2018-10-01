jQuery Soap
===========
**file:** jquery.soap.js  
**version:** 1.7.3

![SOAP](https://raw.githubusercontent.com/doedje/jquery.soap/master/Icon.jpg)

jQuery plugin for communicating with a web service using SOAP.
--------------------------------------------------------------
This script uses $.ajax to send a SOAPEnvelope. It can take XML DOM, XML string or JSON as input and the response can be returned as either XML DOM, XML string or JSON too.

Big thanx to everybody that contributed to $.soap!

**Let's $.soap()!**

_**NOTE:** Please see my note on contacting me about issues, bugs, problems or any other questions below. I really prefer you use the issue tracker on github instead of sending me mail...._

License GNU/GPLv3
-----------------
Copyright (C) 2009-2017 - Remy Blom, the Netherlands

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
You can download the [latest version](https://github.com/doedje/jquery.soap/archive/1.7.3.zip) as a zip, which contains all the files within this repository.

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
You won't be able to have a page on http://www.example.com do an ajax call ($.soap is using $.ajax internally) to http://www.anotherdomain.com due to Same Origin Policy. To overcome this you should either use some kind of proxy on http://www.example.com or use CORS. Keep in mind that it also not allowed to go from http://www.example.com to http://soap.example.com or even to http://www.example.com:8080

Basically, when you are not able to do a call to your webService with a relative url, you will have to do something to circumvent same origin policy, here are some links to help you out:

http://stackoverflow.com/questions/3076414/ways-to-circumvent-the-same-origin-policy  

If you have full control over the apache or nginx server you are serving your html from, the easiest way to setup a proxy is by using their reverse proxy capabilities:

[Setting up a reverse proxy in apache](http://lmgtfy.com/?q=setting+up+a+reverse+proxy+in+apache)  
[Setting up a reverse proxy in nginx](http://lmgtfy.com/?q=setting+up+a+reverse+proxy+in+nginx)

_I apologise when you get upset for using lmgtfy.com in the previous links, I just **love** that site! ;)_

Demo page
---------
I included a simple demo page that you can use for testing. It allows you to play around with all the options for $.soap. Please take note that to make it work with your SOAP services you are again bound by the **same origin policy**.

Contacting me
-------------
Please note I don't mind you contacting me when you run into trouble implementing this plugin, but to keep things nice for me too, just follow these simple guidelines when you do:

- First make sure you're not getting an error because of **same origin policy**! Please double check!! About 80% of the people that contact me because they have trouble getting $.soap to work are having problems because of same origin policy.
- Check the [issues section](https://github.com/doedje/jquery.soap/issues/) and the [closed issues section](https://github.com/doedje/jquery.soap/issues?page=1&state=closed) to see if someone else already had your problem, if not
- Open an issue in the [issues section](https://github.com/doedje/jquery.soap/issues/) instead of sending me mail. This way others can learn from your case too! Please include the following:
	- the versions of your jquery and jquery.soap
	- your $.soap call
	- the request as sent to the server
	- the response from the server
- Being polite helps, especially when you want me to help you with _your_ problems. So please take the time to formulate something like a question. Opening an issue with just some code and/or error messages will be regarded as **unpolite** and will receive a ditto reply.
(I just don't like receiving stuff like [issue #18](https://github.com/doedje/jquery.soap/issues/18) on my day off...)

_I also have a dayjob with deadlines, I'm a dad of two lovely little girls and I like to go out camping a lot, so please understand I am not always able to reply to you asap..._

**Thanx for understanding!! =]**

History
-------
$.soap was originally based on jqSOAPClient.beta.js by proton17 (written in 2007) and started as just a jquery wrapper in 2009.
I published it to the new plugins.jquery.com website in 2013 which used github. Being on github was a good thing for $.soap as a lot of people started to use it and reported bugs, contributed code and even did complete rewrites!

Especially [Zach Shelton](http://zachofalltrades.net) and [Anthony-redFox](https://github.com/anthony-redFox) helped me improve $.soap a lot! **A big thank you to everybody involved!**

Version numbers are [semver](http://semver.org/) compatible.

[In depth overview of all changes to $.soap](HISTORY.md)
