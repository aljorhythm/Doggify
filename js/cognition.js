var keys = Array("671cd53758654540ab4da9bd3e6366ef", "3c85b0920f504a498eb511269f0123b7");
var keyIndex = Math.floor(Math.random()*keys.length);

function getFaceResults(imgUrl){
    return new Promise(function(resolve, reject){
        var params = {
            // Request parameters
            "returnFaceId": "true",
            "returnFaceLandmarks": "true",
            "returnFaceAttributes": "headPose",
        };
        if(typeof imgUrl == 'undefined' || imgUrl == ""){
            return reject({"INVALID_URL" : imgUrl})
        }
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", getKey());
            },
            type: "POST",
            // Request body
            data: JSON.stringify({
                url : imgUrl
            }),
        })
        .done(resolve)
        .fail(reject);
    })
}

function getKey() {
 var key = keys[keyIndex]
 keyIndex = (keyIndex+1)%keys.length
 console.log("using " + key)
 return key
}