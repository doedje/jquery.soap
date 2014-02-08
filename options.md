jQuery.soap Detailed Options List
=================================
**file:** jquery.soap.js  
**version:** 1.3.4

Note that all options are optional. To actually send a request [url](#url) en [data](#data) are the minimal requirements. More [general information about the usage of jQuery.soap](README.md)

appendMethodToUrl
-----------------
type: **boolean**  
default: _true_

Indicates whether the specified [method](#method) should be added to the [url](#url)
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	appendMethodToURL: false
})
```
will send a request to `http://server.com/webServices/`

async
-----
type: **boolean**
default: _true_

Set to false when you want the $.ajax call to be sync.

beforeSend
----------
type: **function(SOAPEnvelope)**  

Callback function which passes back the SOAPEnvelope object prior to the $.ajax call
```
$.soap({
	beforeSend: function(SOAPEnvelope) {
		console.log(SOAPEnvelope.toString());
	}
});
```

data
----
type: **string** or **XMLDOM** or **JSON** or **function(SOAPObject)**  
default: _null_

The data to be sent to the WebService, mainly the contents of the soap:Body, although it may also contain the complete soap:Envelope (with optional soap:Header).

In the first example `var xml` is an array of strings which is joined together to form one XML string which is used as the `data`.
```
var xml = 
	['<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">',
		'<soap:Body>',
			'<requestNode>',
				...
			'</requestNode>',
		'</soap:Body>',
	'</soap:Envelope>'];

$.soap({
	data: xml.join('')
});
```

In the following example we use JSON to describe the request element.
```
$.soap({
	method: 'requestNode',
	data: {
		name: 'Remy Blom',
		msg: 'Hi!'
	}
});
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<requestNode>
			<name>Remy Blom</name>
			<msg>Hi!</msg>
		</requestNode>
	</soap:Body>
</soap:Envelope>
```
function passing back $.soap's SOAPObject that can be used to create and return an instance of the SOAPObject class.
```
$.soap({
	data: function(SOAPObject) {
		return new SOAPObject('soap:Envelope')
			.addNamespace('soap', 'http://schemas.xmlsoap.org/soap/envelope/')
			.newChild('soap:Body')
				... etc, etc
			.end()
	}
});
```
will result in:
```
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
	<soap:Body>
		...
	</soap:Body>
</soap:Envelope>
```

envAttributes
-------------
type: **object**  
default: _null_

Set additional attributes (like namespaces) on the soap:Envelope node
```
$.soap({
	envAttributes: {		
		'xmlns:another': 'http://anotherNamespace.com/'
	}
})
```
will result in:
```
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:another="http://anotherNamespace.com/">
  ...
</soap:Envelope>
```

elementName
-----------
type: **string**  
default: [method](#method)

Overrides [method](#method) as the name for the request element.

_This option ONLY applies when the request XML is going to be built from JSON [data](#data)._
```
$.soap({
	method: 'helloWorld',
	elementName: 'requestNode'
})
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<requestNode>
			...
		</requestNode>
	</soap:Body>
</soap:Envelope>
```

enableLogging
-------------
type: **boolean**  
default: _false_

Set to true if you want some debug information in the console about the information send and received, errors and [globalConfig](#globalConfig) updates.
```
$.soap({
	enableLoggin: true
})
```

error
-----
type: **function(SOAPResponse)**  

Allows to set a callback function for when the underlying $.ajax call goes wrong. 

_Note that $.soap() also returns a jqXHR object that implements the [Promise interface](README.md#promise), so instead of the error option you can also use `jqXHR.fail()`._
```
$.soap({
	error: function(SOAPResponse) {
		console.log(SOAPResponse.toString());
	}
});
```

HTTPHeaders
-----------
type: **object**  
default: _null_

Set additional http request headers, will be passed to $.ajax({ headers: }). A possible use is setting the `Authorization` header to do HTTP Basic Authorization as in the following example:
```
$.soap({
	HTTPHeaders: {
		'Authorization': 'Basic ' + btoa('user:pass')
	}
}): 
```

method
------
type: **string**

The service operation name. 

- Will be appended to the [url](#url) by default unless [appendMethodToURL](#appendMethodToURL) is set to _false_.
- Will be used to set SOAPAction request header unless a [SOAPAction](#SOAPAction) is specified
- When [data](#data) is specified as JSON `method` will be used for the request element name unless a [elementName](#elementName) is provided.
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem'
})
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<getItem>
			...
		</getItem>
	</soap:Body>
</soap:Envelope>
```
send to `http://server.com/webServices/getItem`.

namespaceQualifier
------------------
type: **string**  
default: _null_

Used as namespace prefix for all elements in the request element, in combination with [namespaceURL](#namespaceURL)

_This option ONLY applies when the request XML is going to be built from JSON [data](#data)._
```
$.soap({
	method: 'helloWorld',
	namespaceQualifier: 'myns',
	namespaceURL: 'urn://service.my.server.com'
});
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<myns:helloWorld xmlns:myns="urn://service.my.server.com">
			...
		</myns:helloWorld>
	</soap:Body>
</soap:Envelope>
```

namespaceURL
------------
type: **string**  
default: _null_

Used as the namespace url added to the request element in combination with [namespaceQualifier](#namespaceQualifier)

_This option ONLY applies when the request XML is going to be built from JSON [data](#data)._
```
$.soap({
	method: 'helloWorld',
	namespaceQualifier: 'myns',
	namespaceURL: 'urn://service.my.server.com'
});
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<myns:helloWorld xmlns:myns="urn://service.my.server.com">
			...
		</myns:helloWorld>
	</soap:Body>
</soap:Envelope>
```

noPrefix
--------
type: **boolean**  
default: _false_

Set to true if you don't want the [namespaceQualifier](#namespaceQualifier) to be the prefix for the nodes in the request element.

_This option ONLY applies when the request XML is going to be built from JSON [data](#data)._
```
$.soap({
	method: 'helloWorld',
	namespaceQualifier: 'myns',
	namespaceURL: 'urn://service.my.server.com',
	noPrefix: true
});
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
	<soap:Body>
		<helloWorld xmlns:myns="urn://service.my.server.com">
			...
		</helloWorld>
	</soap:Body>
</soap:Envelope>
```

request
-------
type: **function(SOAPEnvelope)**  

_This function is deprecated from 1.3.1, use [beforeSend](#beforeSend) instead_

Callback function which passes back the SOAPEnvelope object prior to the $.ajax call
```
$.soap({
	request: function(SOAPEnvelope) {
		console.log(SOAPEnvelope.toString());
	}
});
```

soap12
------
type: **boolean**  
default: _false_

Set to true if you want to sent a SOAP1.2 compatible soap:Envelope with SOAP1.2 namespace
```
$.soap({
	soap12: true
})
```
will result in:
```
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/">
  ...
</soap:Envelope>
```

SOAPAction
----------
type: **string**  
default: [method](#method)

Allows to manually set the HTTP Request Header 'SOAPAction'.
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	SOAPAction: 'getAnItem'
})
```

success
-------
type: **function(SOAPResponse)**  

Callback function to handle successful return.

_Note that $.soap() also returns a jqXHR object that implements the [Promise interface](README.md#promise), so instead of the success option you can also use `jqXHR.done()`._
```
$.soap({
	success: function(SOAPResponse) {
		console.log(SOAPResponse.toString());
	}
});
```

url
---
type: **string**  

Specifies the endpoint of the webService. By default the [method](#method) is added to the url. Setting [appendMethodToURL](#appendMethodToURL) to _false_ will not add the [method](#method).
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem'
})
```

wss
---
type: **object**

To create a soap:Header with credentials for WS-Security
```
$.soap({
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	}
});
```
will result in:
```
<soap:Envelope>
	<soap:Header>
		<wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
			<wsse:UsernameToken>
				<wsse:Username Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">user</wsse:Username>
				<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">pass</wsse:Password>
				<wsse:Nonce Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">aepfhvaepifha3p4iruaq349fu34r9q</wsse:Nonce>
				<wsu:Created Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">1383257509878</wsu:Created>
			</wsse:UsernameToken>
		</wsse:Security>
	</soap:Header>
	<soap:Body>
		...
	</soap:Body>
</soap:Envelope>
```
