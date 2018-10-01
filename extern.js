/**
 * @fileoverview Externs for jquery.soap.js - 1.7.3 (works with Google Closure Compiler running in ADVANCED_OPTIMIZATIONS mode)
 *
 * @see https://github.com/doedje/jquery.soap
 * @externs
 */

/** @typedef {{
    typeOf: (string),
    status: (int),
    headers: (Array<Object<string, string>>),
    created: (?int|undefined),
    httpCode: (int),
    httpText: (string),
    content: (Object),
    toString: (function()),
    toXML: (function()),
    toJSON: (function())
}} */
 var SOAPResponse;

/** @typedef {{
    username: (string),
    password: (string),
    nonce: (?string|undefined),
    created: (?int|undefined)
}} */
var jQuerySoapWssSettings;

 /** @typedef {{
    url: (string),
    method: (string),
    appendMethodToURL: (?boolean|undefined),
    SOAPAction: (?string|undefined),
    soap12: (?boolean|undefined),
    context: (?Element|undefined),
    envAttributes: (Object<string, string>|undefined),
    HTTPHeaders: (Object<string, string>|undefined),
    data: (Object<?, ?>|function($.soap)|undefined),
    namespaceQualifier: (?string|undefined),
    namespaceURL: (?string|undefined),
    noPrefix: (?boolean|undefined),
    elementName: (?string|undefined),
    beforeSend: (function(Object<?, ?>)|undefined),
    success: (SOAPResponse|undefined),
    error: (SOAPResponse|undefined),
    statusCode: (Object<?, function()>|undefined),
    wss: (jQuerySoapWssSettings|undefined),
    enableLogging: (?boolean|undefined)
}} */
var jQuerySoapSettings;

/** @param {jQuerySoapSettings|Object<string, *>} options */
$.soap = function(options) {};
