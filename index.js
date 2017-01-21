function dogifyLog(obj){
    console.log('DOGIFY', obj);
}

dogifyLog('index.js');

$(document).ready(function(){
    function sanitizeImgUrl(url){
        if(url && url.indexOf("//") == 0)
            return "https:" + url
        return url
    }
    function overlayImage($imgContainer, face){
        dogifyLog(face)
        var faceLandmarks = face['faceLandmarks']
        var $overlayImg = $("<img>")
        //From Face Api
        var nose = faceLandmarks['noseTip']
        var lip = faceLandmarks['upperLipBottom']

        //get the height ratio
        var ratio = (lip.y - nose.y) / 110;

        //mount up dog pic at coordinates:
        var x = nose.x - (330 * ratio)
        var y = nose.y - (480 * ratio)

        dogifyLog('ratio : ' + ratio)
        dogifyLog('x : ' + x)
        dogifyLog('y : ' + y)
        dogifyLog('height : ' + 960 * ratio)

        $overlayImg.attr('src',  chrome.extension.getURL('img/overlays/dog.png'))
            .css({
                'position' : 'absolute',
                'top' : x + 'px',
                'left' : y + 'px',
                'height' : 960 * ratio,
                'display' : 'none'
            })
            .on('load', function(){
                $overlayImg.fadeIn(3000)
            })
        $imgContainer.append($overlayImg)
    }
    function putPNGsOnTop(params){
        var $originalImgContainer = $(params['original_img_container_selector'])
        var $img = $(params['original_img_selector'])
        var imgUrl = sanitizeImgUrl($img.attr('src'))
        dogifyLog('URL from ' + params['original_img_selector'] + " : " + imgUrl)
        getFaceResults(imgUrl).then(function(faceResults){
            dogifyLog('Successful request to Cognition API')
            dogifyLog(faceResults.length + ' faces')
            faceResults.forEach(function(face, idx){
                dogifyLog('Overlaying ' + (idx + 1) + '/' + faceResults.length)
                overlayImage($originalImgContainer, face)
            })
        }, function(err){
            dogifyLog('getFaceResults() error')
            dogifyLog(err)
        })
    }

    var targets = {
        facebook_profile : {
            original_img_selector : ".profilePic.img",
            original_img_container_selector : ".photoContainer .profilePicThumb"
        },
        facebook_verified_profile : {
            original_img_selector : "",
            original_img_container_selector : ""
        },
        wikipedia_main : {
            original_img_selector : ".vcard tr:nth-child(2) .image img",
            original_img_container_selector : ".vcard tr:nth-child(2) td a"
        }
    }

    for(targetKey in targets){
        dogifyLog('doing ' + targetKey)
        try{
            putPNGsOnTop(targets[targetKey])
        }catch(err){
            dogifyLog('target error ' + targetKey)
            dogifyLog(err)
        }
    }

})
