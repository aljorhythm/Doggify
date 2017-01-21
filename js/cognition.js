function getFaceResults(imgUrl){
    return new Promise(function(resolve, reject){
        var params = {
            // Request parameters
            "returnFaceId": "true",
            "returnFaceLandmarks": "true",
            "returnFaceAttributes": "",
        };
        $.ajax({
            url: "https://westus.api.cognitive.microsoft.com/face/v1.0/detect?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Content-Type","application/json");
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","3c85b0920f504a498eb511269f0123b7");
            },
            type: "POST",
            // Request body
            data: {
                url : imgUrl
            },
        })
        .done(resolve)
        .fail(reject);
    })
}
