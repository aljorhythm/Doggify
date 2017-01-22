var keys = [
	"671cd53758654540ab4da9bd3e6366ef", // weikang
	"3c85b0920f504a498eb511269f0123b7", // bernard
	"240069313dc3460ba6d390bcc9f2046d",  // jingloon
	"48fbfc98af6d4e4caea1e34909c3647f" // joel
];
var keyIndex = Math.floor(Math.random() * keys.length);

function getFaceAPIKey() {
	var key = keys[keyIndex]
	keyIndex = (keyIndex+1) % keys.length
	console.log("background.js - using " + key)
	return key
}

function getFaceResults(imgUrl){
    return new Promise(function(resolve, reject){
        // don't issue api call if cached
        console.log('getFaceResults() ' + imgUrl)
        chrome.storage.local.get(imgUrl, function(faceResultsAssociativeArray){
            console.log('getFaceResults() callback', faceResultsAssociativeArray, chrome.runtime.lastError)

            if(faceResultsAssociativeArray[imgUrl]){
                console.log(['Cache found ', imgUrl, faceResultsAssociativeArray[imgUrl]])
                resolve(faceResultsAssociativeArray[imgUrl])
            }else{
                console.log('Cache not found ' + imgUrl)
                // issue api call
                var params = {
                    // Request parameters
                    "returnFaceId": "true",
                    "returnFaceLandmarks": "true",
                    "returnFaceAttributes": "headPose"
                };
                if(typeof imgUrl == 'undefined' || imgUrl == ""){
                    return reject({"INVALID_URL" : imgUrl})
                }
                $.ajax({
                    url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?" + $.param(params),
                    beforeSend: function(xhrObj){
                        // Request headers
                        xhrObj.setRequestHeader("Content-Type","application/json");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", getFaceAPIKey());
                    },
                    type: "POST",
                    // Request body
                    data: JSON.stringify({
                        url : imgUrl
                    }),
                })
                .done(function(faceResults){
                    // cache
                    var imgResult = {}
                    imgResult[imgUrl] = faceResults
                    dogifyLog(['Caching', imgResult, faceResults])
                    chrome.storage.local.set(imgResult)
                    resolve(faceResults)
                })
                .fail(reject)
            }
        })

    })
}
