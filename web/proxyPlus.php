<?php

date_default_timezone_set('Europe/Berlin');
$start = microtime(true);

if(!function_exists('curl_init')) {
	print 'curl_init() not defined, install php-curl!';
	exit; 
}

$url = $_GET['url'];
$mimeType = $_SERVER['CONTENT_TYPE'];

$url = preg_replace('/\s/','+', $url);
$timeout = 14000;

// Build the post variable
$postvars = array();

if ($_POST) {
	foreach ($_POST as $key => $value) {
		$postvars[$key] = $value;
	}
} else {
	$postvars = $GLOBALS['HTTP_RAW_POST_DATA'];
}
if ($_FILES) {
	foreach ($_FILES as $key => $value) {
		$postvars[$key . '_filename'] = $value["name"];
		$postvars[$key . '_mimetype'] = $value["type"];
		$postvars[$key] = '@' . $value['tmp_name'];
	}
}

// send request to crossdomain url
$session = curl_init($url);

$headerObject = getallheaders();

$headers[] = 'Connection: Keep-Alive';
$headers[] = 'Content-Type: ' . $mimeType;
$headers[] = 'Accept-Charset: UTF-8';
if (isset($headerObject['Authorization'])) {
	$headers[] = 'Authorization: ' . $headerObject['Authorization'];
}
if (isset($headerObject['SOAPAction'])) {
	$headers[] = 'SOAPAction: ' . $headerObject['SOAPAction'];
}


curl_setopt($session, CURLOPT_USERAGENT, "ProxyPlus/PHP/Remy.Blom@hku.nl");
curl_setopt($session, CURLOPT_TIMEOUT, $timeout);
curl_setopt($session, CURLOPT_CONNECTTIMEOUT, $timeout);
curl_setopt($session, CURLOPT_HTTPHEADER, $headers);
curl_setopt($session, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
if ($postvars) {
	curl_setopt($session, CURLOPT_POST, true);
	curl_setopt($session, CURLOPT_POSTFIELDS, $postvars);
} else {
	if(file_get_contents('php://input')) {
		curl_setopt($session, CURLOPT_POST, true);
		curl_setopt($session, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
	}
}

// execute
$response = curl_exec($session);

// get values from response
$response_httpcode = curl_getinfo($session, CURLINFO_HTTP_CODE);
$response_mime = curl_getinfo($session, CURLINFO_CONTENT_TYPE);
$response_time = curl_getinfo($session, CURLINFO_TOTAL_TIME);

$errorNumber = curl_errno($session);
$errorText = curl_error($session);

curl_close($session);

$end = microtime(true);
$diffTime = $end - $start;

// check for error
if ($errorNumber) {
	http_response_code(504);
	echo 'ProxyPlus: Error fetching remote url (' . $url . '): ' . $errorText . ' (curl_errno: ' . $errorNumber . ')';
} else {
	// send response to browser with the received http code
	http_response_code($response_httpcode);
	// timing headers for debugging:
	header("X-ProxyPlus-Timing: PHP: " . round(1000 * (microtime(true) - $start)) . 'ms' . ', Curl: ' . round(1000 * $response_time) . 'ms');

	$charset = "UTF-8";
	if ($mimeType) {
		header("Content-Type: ".$mimeType);
	} else if ($response_mime) {
		header("Content-Type: ".$response_mime."; charset=".$charset);
	} else {
		header("Content-Type: text/html; charset=".$charset);
	}
	echo $response;
}

?>
