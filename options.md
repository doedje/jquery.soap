jQuery.soap Detailed Options List
=================================
**version:** 1.3.0

Note that all options are optional. To actually send a request [url](#url) en [data](#data) are the minimal requirements. More general information about the usage

appendMethodToUrl
-----------------
type: **boolean**  
default: _true_

Indicates whether the specified [method](#method) should added to the [url](#url)
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	appendMethodToURL: false
})
```

data
----
type: **string** or **XMLDOM** or **JSON** or **function(SOAPObject)**  
default: _null_

The data to be send to the WebService, mainly the contents of the soap:Body
```
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

Override 'method' as outer element.

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

Set to true if you want some debug information in the console about the information send and received, errors and globalConfig updates.
```
$.soap({
	enableLoggin: true
})
```

error
-----
type: **function(SOAPResponse)**  

Allows to set a callback function for when the underlying $.ajax call goes wrong. 

_Note that $.soap() also returns a jqXHR object that implements the [Promise interface](README.md#promise), so instead of the success option you can also use `jqXHR.fail()`._
```
$.soap({
	error: function(SOAPResponse) {
		console.log(SOAPResponse.toString());
	}
});

HTTPHeaders
-----------
type: **object**  
default: _null_

Set additional http headers send with the $.ajax call, will be given to $.ajax({ headers: })
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
- Will be used to set SOAPAction request header if no [SOAPAction](#SOAPAction) is specified
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
		<helloWorld>
			...
		</helloWorld>
	</soap:Body>
</soap:Envelope>
```
send to `http://server.com/webServices/getItem`.

namespaceQualifier
------------------
type: **string**  
default: _null_

Used as namespace prefix for all elements in request in combination with [namespaceURL](#namespaceURL)

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

Set to true if you don't want the [namespaceQualifier](#namespaceQualifier) to be the prefix for the nodes in params.

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
type: **function(SOAPRequest)**  

Callback function which passes back the request object prior to ajax call
```
$.soap({
	request: function(SOAPRequest) {
		console.log(SOAPRequest.toString());
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

Allows to manually set the Request Header 'SOAPAction'.
```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	SOAPAction: 'getAnItem'
})
```

success
-------
type: **function(SOAPResponse)  

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
