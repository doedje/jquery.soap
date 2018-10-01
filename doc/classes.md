jQuery.soap Description of Classes
==================================
**file:** jquery.soap.js  
**version:** 1.7.3

This document is giving an overview of the classes used within $.soap.

SOAPObject
--------------------
This object can also be used to construct the `data` parameter, see the [documentation](https://github.com/doedje/jquery.soap/blob/master/doc/options.md#data) on how to do that.

###constructor

`new SOAPObject(name);`

Creates a new SOAPObject with _name_

###properties

The properties should be regarded as privates and not be used.

#####`attributes = {}`
#####`children = []`
#####`name = string`
#####`ns = {}`
#####`_parent = null`
#####`value = undefined`
#####`typeOf = 'SOAPObject'`

###methods

The following methods are available to create a rich SOAPObject.

#####`addNamespace(name, url)`

Adds a namespace to the current node. The namespace declaration is stored in `this.ns`. When `this.toString()` is used to get the string representing this SOAPObject it is presented as an attribute in the form `xmlns:name="url"`.  

returns `this`

#####`addParameter(name, value)`

Creates a child SOAPObject with name and value.

returns `this`

#####`appendChild(soapObject)`

Adds the soapObject as a child.

returns `this`

#####`attr(name, value)`

Creates an attribute in the form `name="value"`.

returns `this`

#####`end()`

returns `this._parent`

#####`find(name)`

returns the first childObject with the `name` specified by `name`

#####`hasChildren()`

returns `boolean`: `true` when the object has children, `false` when it does not. 

#####`newChild(name)`

creates a new SOAPObject and adds it as a child to the current node, returns that child.

returns `SOAPObject`

#####`parent()`

returns `this._parent`

#####`toString()`

returns a string representing the SOAPObject, with all it's namespaces, attributes and childnodes.

#####`val(value)`

When `value` is undefined it returns the value of the current node. When `value` is set it sets the value of the current node and returns `this`.


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
