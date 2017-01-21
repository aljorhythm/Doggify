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
    function overlayImage($imgContainer, $img, face){
        dogifyLog(face)
        var faceLandmarks = face['faceLandmarks']
        var $overlayImg = $("<img>")
        //From Face Api
        var nose = faceLandmarks['noseTip']
        var lip = faceLandmarks['upperLipBottom']

        var dogPng = {
            height : 960
        }
        //get the height ratio
        var ratio = (lip.y - nose.y) / 110;

        //mount up dog pic at coordinates:
        // natural
        var x = nose.x - (330 * ratio)
        var y = nose.y - (480 * ratio)
        var height = dogPng['height'] * ratio

        // displayed
        var naturalHeightRatio = ($img.height() / $img[0].naturalHeight)
        x = x * naturalHeightRatio
        y = y * ($img.width() / $img[0].naturalWidth)
        height = height * naturalHeightRatio

        dogifyLog('ratio : ' + ratio)
        dogifyLog('display ratio : ' + naturalHeightRatio)
        dogifyLog('x : ' + x)
        dogifyLog('y : ' + y)
        dogifyLog('height : ' + height)

        $overlayImg.attr('src',  chrome.extension.getURL('img/overlays/dog.png'))
            .css({
                'position' : 'absolute',
                'top' : y + 'px',
                'left' : x + 'px',
                'height' : height,
                'display' : 'none'
            })
            .on('load', function(){
                $overlayImg.fadeIn(3000)
            })
        $imgContainer.append($overlayImg)
    }
    function putPNGsOnTop(params){
        var $imgs = $(params['original_img_selector'])
        $imgs.each(function(_, img){
            var $img = $(img);
            var $originalImgContainer = $img.parent();
            var imgUrl = sanitizeImgUrl($img.attr('src'))
            dogifyLog('URL from ' + params['original_img_selector'] + " : " + imgUrl)
            getFaceResults(imgUrl).then(function(faceResults){
                dogifyLog('Successful request to Cognition API')
                dogifyLog(faceResults.length + ' faces')
                faceResults.forEach(function(face, idx){
                    dogifyLog('Overlaying ' + (idx + 1) + '/' + faceResults.length)
                    overlayImage($originalImgContainer, $img, face)
                })
            }, function(err){
                dogifyLog('getFaceResults() error')
                dogifyLog(err)
            })
        })
    }

    var targets = {
        facebook_profile : {
            original_img_selector : ".profilePic.img"
        },
        facebook_verified_profile : {
            original_img_selector : "",
            original_img_container_selector : ""
        },
        wikipedia_main : {
            original_img_selector : ".vcard tr:nth-child(2) .image img:first-child"
        },
        localhost_test : {
            original_img_selector : ".imgContainer img"
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
