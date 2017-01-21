chrome.webRequest.onHeadersReceived.addListener(function (details)
{
	for (i = 0; i < details.responseHeaders.length; i++) {
		if (details.responseHeaders[i].name.toUpperCase() == "X-WEBKIT-CSP") {
			details.responseHeaders[i].value = "default-src *;script-src https://*.feedhound.co https://*.facebook.com http://*.facebook.com https://*.fbcdn.net http://*.fbcdn.net *.facebook.net *.google-analytics.com *.virtualearth.net *.google.com 127.0.0.1:* *.spotilocal.com:* chrome-extension://lifbcibllhkdhoafpjfnlhfpfgnpldfl 'unsafe-inline' 'unsafe-eval' https://*.akamaihd.net http://*.akamaihd.net;style-src * 'unsafe-inline';connect-src https://*.facebook.com http://*.facebook.com https://*.fbcdn.net http://*.fbcdn.net *.facebook.net *.spotilocal.com:* https://*.akamaihd.net ws://*.facebook.com:* http://*.akamaihd.net https://westus.api.cognitive.microsoft.com/face/v1.0/detect";
		}
	}
	return {
		responseHeaders : details.responseHeaders
	};
}, {
	urls : ["*://*.facebook.com/*"],
	types : ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
},
	["blocking", "responseHeaders"]
);