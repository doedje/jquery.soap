jQuery.soap Description of Classes
==================================
**file:** jquery.soap.js  
**version:** 1.6.7

This document is giving an overview of the classes used within $.soap.

SOAPEnvelope
------------

###constructor

`new SOAPEnvelope(soapObject);`

###properties

#####`attributes = {}`
#####`bodies = []`
#####`headers = []`
#####`prefix = 'soap'`
#####`soapConfig = null`
#####`typeof = 'SOAPEnvelope'`

###methods

#####`addAttribute(name, value)`
#####`addBody(soapObject)`
#####`addHeader(soapObject)`
#####`addNamespace(name, uri)`
#####`toString()`
#####`send(options)`

SOAPObject
--------------------

###constructor

`new SOAPObject(name);`

Creates a new SOAPObject with _name_

###properties

#####`attributes = {}`
#####`children = []`
#####`name = _string_`
#####`ns = {}`
#####`_parent = null`
#####`value = undefined`
#####`typeOf = 'SOAPObject'`

###methods

#####`addNamespace(name, url)`

#####`addParameter(name, value)`

#####`appendChild(soapObject)`

#####`attr(name, value)`

#####`end()`

#####`find(name)`

#####`hasChildren()`

#####`newChild(name)`

#####`parent()`

#####`toString()`

#####`val(value)`
