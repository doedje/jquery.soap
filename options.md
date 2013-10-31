jQuery.soap Detailed Options List
=================================
**version:** 1.3.0

appendMethodToUrl
-----------------
type: **boolean**  
optional, default: _true_  

Indicates whether the specified [method](#method) should added to the [url](#url)

```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	appendMethodToURL: false
})
```

envAttributes
-------------
type: **object**
optional: default: _null_

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

data
----
type: **string** or **XMLDOM** or **JSON** or **function(SOAPObject)**
optional: default: _null_

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

elementName
-----------
type: **string**
optional: default: [method](#method)

Override 'method' as outer element

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
optional: default: _false_

Set to true if you want some debug information in the console about the information send and received, errors and globalConfig updates.

```
$.soap({
	enableLoggin: true
})
```

HTTPHeaders
-----------
type: **object**
optional: default: _null_

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
required 

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

namespaceQualifier
------------------
type: **string**
optional: default: _null_

Used as namespace prefix for all elements in request in combination with [namespaceURL](#namespaceURL)
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
optional: default: _null_

Used as the namespace url added to the request element in combination with [namespaceQualifier](#namespaceQualifier)
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
optional: default: _false_

Set to true if you don't want the namespaceQualifier to be the prefix for the nodes in params.
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

soap12
------
type: **boolean**
optional: default: _false_

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
optional, defaults to [method](#method)

Allows to manually set the Request Header 'SOAPAction'.

```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem',
	SOAPAction: 'getAnItem'
})
```

url
---
type: **string**  
required 

Specifies the endpoint of the webService. By default the [method](#method) is added to the url. Setting [appendMethodToURL](#appendMethodToURL) to _false_ will not add the [method](#method).

```
$.soap({
	url: 'http://server.com/webServices/',
	method: 'getItem'
})
```

Helper
------

```
options = {

	//these options ONLY apply when the request XML is going to be built from JSON 'params'

	// WS-Security
	wss: {
		username: 'user',
		password: 'pass',
		nonce: 'w08370jf7340qephufqp3r4',
		created: new Date().getTime()
	},

	//callback functions
	request: function (SOAPRequest)  {},			// callback function - request object is passed back prior to ajax call (optional)
	success: function (SOAPResponse) {},			// callback function to handle successful return (optional)
	error:   function (SOAPResponse) {},			// callback function to handle fault return (optional)

}
```