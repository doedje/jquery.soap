jQuery Soap History
=====================

![SOAP](https://raw.githubusercontent.com/doedje/jquery.soap/master/Icon.jpg)

Version numbers are [semver](http://semver.org/) compatible.

Version | Date | Changes
--- | --- | ---
1.7.3 | 2018-10-01 | PR #123 - Accounts for null response, thanx to [oneton](https://github.com/oneton)!
1.7.2 | 2018-01-16 | fix for #125 - Support for Bare parameter style
1.7.1 | 2017-06-12 | fixed a syntax error in 1.7.0, thanx to [torcu](https://github.com/torcu) for pointing that out
1.7.0 | 2017-06-01 | **SYNTAX ERROR IN SCRIPT** - feature timeout from #116 in PR #117, thanx [mojovski](https://github.com/mojovski), PR #118 and #119, thanx [ChristofVerhoeven](https://github.com/ChristofVerhoeven)
1.6.11 | 2017-02-09 | PR #111, thanx [oneton](https://github.com/oneton), fix for #109, updated demo to use jQuery 3.1.1
1.6.10 | 2016-10-25 | adding action to contentType for soap1.2, fix #102, thanx to [gormed](https://github.com/gormed)
1.6.9 | 2016-08-24 | pull request #100: fix for #99 General issue - Bad in cross-domain url calls, thanx [nothingmi](https://github.com/nothingmi)
1.6.8 | 2016-03-07 | Tried to add proper nodejs support, but I failed at that. If someone knows how to get it to work, please send a pull request :)
1.6.7 | 2015-09-04 | removed the dependency on jquery.xml2json from bower.json as discussed in [#83](https://github.com/doedje/jquery.soap/issues/83)
1.6.6 | 2015-09-02 | pull request #82: XHR for progress support may break IE8/IE9 cross-domain requests, thanx [Arun Menon](https://github.com/arunmenon1975)
1.6.5 | 2015-06-08 | pull request #78: Added Date object serialization to ISO8601, thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.6.4 | 2015-03-13 | fix for SOAPObject.end() throwing error parent() is not a function, bug introduced in 1.6.0
1.6.3 | 2015-03-13 | fix the dependency for xml2json to be >=1.3 instead of >1.3
1.6.2 | 2015-03-13 | fix for #74: added xml2json as a dependency in bower.json
1.6.1 | 2015-03-02 | pull request #73: Fix regression on SOAPTool.json2soap serialization for boolean type: thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.6.0 | 2015-02-16 | feature request #71: added statusCode, like $.ajax has... Thanx [AndersMygind](https://github.com/AndersMygind), fixed setting SOAPHeader as XML (did not work properly)
1.5.0 | 2015-01-31 | pull request #67: context added, some SOAP::Lite support, Thanx [ShaunMaher](https://github.com/ShaunMaher), pull request #69: return deferred object when !SOAPObject or !config.url, thanx [maxgrass](https://github.com/maxgrass), added SOAPHeader option as requested by [Adam Malcontenti-Wilson](https://github.com/adammw) in #62, fix for falsey values.
1.4.4 | 2014-10-18 | pull request #65: fix namespace and type for nil attribute, Thanx [philipc](https://github.com/philipc)
1.4.3 | 2014-09-18 | fix for empty namespaces like xmlns="" as found by XGreen on [StackOverflow](http://stackoverflow.com/questions/25809803/cdata-gets-removed-before-being-sent)
1.4.2 | 2014-09-17 | pull request #61: hot fix for the CData issue [StackOverflow](http://stackoverflow.com/questions/25809803/cdata-gets-removed-before-being-sent), Thanx [josepot](https://github.com/josepot)
1.4.1 | 2014-09-11 | pull request #59: Encode XML special chars, thanx [Simon St&uuml;cher](https://github.com/stchr)
1.4.0 | 2014-09-11 | fix for #56: overzealous loop conversion, #57: feature request - thanx [miljbee](https://github.com/miljbee), pull request #58 thanx [Brian Mooney](https://github.com/irishshagua), improved demo page
1.3.10 | 2014-07-16 | fix for #54: overzealous loop conversion
1.3.9 | 2014-07-07 | fix for #30: for (var in obj) does not work well in IE8: thanx [todd-lockhart](https://github.com/todd-lockhart), fix for #51: XML header missing, some minor updates
1.3.8 | 2014-04-14 | fix for #45: handle string objects in json2soap: thanx [PALLEAU Michel](https://github.com/mic006)
1.3.7 | 2014-02-27 | fix for #40: removed trailing slash on SOAP1.2 namespaceURL: thanx [AlexandreFournier](https://github.com/AlexandreFournier)
1.3.6 | 2014-02-26 | fix for issue #38: specifying only namespaceURL works too
1.3.5 | 2014-02-20 | bugfix for #36: correct handling of setting null values using SOAPObject
1.3.4 | 2014-02-08 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.3.3 | 2014-02-08 | bugfix: fixed json2soap for arrays
1.3.2 | 2014-01-16 | bugfix: _async_ defaulted to **false**? should have been **true**
1.3.1 | 2013-11-04 | minor changes: SOAPRequest is now SOAPEnvelope, request is now beforeSend
1.3.0 | 2013-10-31 | massive rewrite (fixes #14, #19, #20, lot of stuff from #21, #23) Triggered by [anthony-redFox](https://github.com/anthony-redFox)
1.2.2 | 2013-10-31 | fix for #24: a parameter set to NULL should be translated as &lt;language nil="true" /&gt;
1.2.1 | 2013-09-09 | fixed WSS namespace: from Soap:Security to wsse:Security (pull request #17) thanx [Giacomo Trezzi](https://github.com/G3z)
1.2.0 | 2013-08-26 | added noPrefix option and fixed bug of double namespace prefixes for nested objects (#13, #15)
1.1.0 | 2013-07-11 | Added WSS functionality (issue #9)
1.0.7 | 2013-07-03 | Changed the license to GNU GPLv3, I could never have used the MIT license since jqSOAPClient.beta.js is already licensed GNU GPLv3
1.0.6 | 2013-06-27 | params object to SOAPObject code fixed for complex object/array combi's
1.0.5 | 2013-06-20 | enableLogging is an option, changed namespaceUrl to namespaceURL (with fallback)
1.0.4 | 2013-06-20 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.3 | 2013-06-20 | Included a little demo and fixed SOAPServer and SOAPAction request headers
1.0.2 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.1 | 2013-04-02 | Fix to the manifest file, new version# needed to publish to plugins.jquery.com
1.0.0 | 2013-04-02 | Minor fix (return for dom2string in reponse)
0.10.0 | 2013-03-29 | The **First Zach Shelton version**, better code, XML DOM, XML string and JSON in and out: thanx [Zach Shelton](https://github.com/zachofalltrades)
0.9.4 | 2013-02-26 | changed the charset of the $.ajax call to UTF-8 and removed the " quotes
0.9.3 | 2013-02-26 | Added the possibility to call **$.soap** just to set extra config values.
0.9.2 | 2013-02-21 | some extra cleaning of stupid code in my part of the script. Now it uses the addNamespace function to properly set namespaces.
0.9.1 | 2013-02-20 | minor changes to keep LINT happy.
0.9.0 | 2013-02-20 | first version to go on the new jQuery plugin page, changed the name of the function from $.soapRequest to **$.soap**
