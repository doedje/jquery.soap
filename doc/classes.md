jQuery.soap Description of Classes
==================================
**file:** jquery.soap.js  
**version:** 1.6.0

This document is giving an overview of the classes used within $.soap.

SOAPEnvelope
------------

###constructor

`new SOAPEnvelope(soapObject);`

###properties

#####`attributes`
#####`bodies`
#####`headers`
#####`prefix`
#####`soapConfig`
#####`typeof = 'SOAPEnvelope'`

###methods

#####`addAttribute(name, value)`
#####`addNamespace(name, uri)`
#####`addHeader(soapObject)`
#####`addBody(soapObject)`
#####`toString()`
#####`send(options)`

SOAPObject
--------------------

###**constructor

`new SOAPObject(name);`

Creates a new SOAPObject with _name_

###properties

#####`attributes`  
#####`children`  
#####`name`  
#####`ns`  
#####`_parent`  
#####`value`  
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
