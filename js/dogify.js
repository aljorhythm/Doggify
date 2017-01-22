var targets = {
    "facebook.com/" : {
        original_img_selector : ".profilePic.img, .mtm img:not(.spotlight), img.spotlight"
    },
    "wikipedia.org" : {
        original_img_selector : ".vcard tr:nth-child(2) .image img:first-child"
    },
    "localhost:8888" : {
        original_img_selector : ".imgContainer img"
    },
    "instagram.com" : {
        original_img_selector : "main > section :not(header) > div > img, img[id]",
        scroll_listener : true
    }
}

function dogifyLog(obj){
    console.log('DOGIFY ' + new Date().toString(), obj);
}

// forces val to be a number (defaultVal if specified if not 0)
function forceInt(val, defaultVal){
    defaultVal = defaultVal || 0;
    if(typeof val == 'string'){
        val = parseInt(val, 10)
    }
    if(typeof val == 'undefined' || val == null || isNaN(val)){
        return defaultVal
    }
    return val
}

dogifyLog('index.js');

var IMAGES = {
    DOGS : [
        chrome.extension.getURL('img/overlays/smartdog.png'),
        chrome.extension.getURL('img/overlays/smartdalm.png')
    ]
}

function getRandomDogImageURL(){
    return IMAGES['DOGS'][Math.floor(Math.random() * IMAGES['DOGS'].length)]
}

function dogify(){
    function sanitizeImgUrl(url){
        if(url && url.indexOf("//") == 0)
            return "https:" + url
        return url
    }
    function overlayImage($imgContainer, $originalImg, face){
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
        var naturalHeightRatio = ($originalImg.height() / $originalImg[0].naturalHeight)
        x = x * naturalHeightRatio
        y = y * ($originalImg.width() / $originalImg[0].naturalWidth)
        height = height * naturalHeightRatio

        // take into account parent border
        var borderX = forceInt($imgContainer.css("border-left-width")) + forceInt($imgContainer.css("padding-left-width")) + forceInt($originalImg.css("border-left-width")) + forceInt($originalImg.css("padding-left-width"))
        var borderY = forceInt($imgContainer.css("border-top-width")) + forceInt($imgContainer.css("padding-top-width")) + forceInt($originalImg.css("border-top-width")) + forceInt($originalImg.css("padding-top-width"))
        x += borderX
        y += borderY

        var rotation = 'rotateZ(' + face['faceAttributes']['headPose']['roll'] + 'deg) rotateY(' + face['faceAttributes']['headPose']['yaw'] + 'deg)'

        dogifyLog({
            'ratio' : ratio,
            'display ratio': naturalHeightRatio,
            'x' : x,
            'y' : y,
            'rotation' : rotation,
            'border-x' : borderX,
            'border-y' : borderY,
            'height' : height
        })

        $overlayImg.attr('src', getRandomDogImageURL())
            .css({
                'position' : 'absolute',
                'top' : y + 'px',
                'left' : x + 'px',
                'height' : height,
                'transform' : rotation,
                'display' : 'none'
            })
            .addClass('dogified')
            .on('load', function(){
                $overlayImg.fadeIn(3000)
            })

        // ensure position:absolute works
        if($imgContainer.css('position') == 'static'){
            $imgContainer.css('position', 'relative')
        }

        $imgContainer.append($overlayImg)
    }

    function putPNGsOnTop(params){
        var $imgs = $(params['original_img_selector'])
        dogifyLog($imgs.length + ' images found')
        // exclude marked imgs
        $imgs.not('.dogified').not('.dogify-attempted').each(function(idx, originalImg){
            if(params['limit'] && idx > params['limit']){
                return
            }
            var $originalImg = $(originalImg)
            var $originalImgContainer = $originalImg.parent()
            var imgUrl = sanitizeImgUrl($originalImg.attr('src'))

            // should have excluded the overlay itself when .filtered(), doing hack to not do face detection for local images
            // if(imgUrl.indexOf('chrome://') >= 0 || $originalImg.hasClass('dogified') || $originalImg.hasClass('dogify-attempted')){
            //     return
            // }
            dogifyLog('URL from ' + params['original_img_selector'] + " : " + imgUrl)
            dogifyLog($originalImg)
            dogifyLog('alt : ' + $originalImg.attr('alt'))

            var processFaceResults = function(faceResults){
                dogifyLog('Successful request to Cognition API')
                faceResults = faceResults || []
                dogifyLog(faceResults.length + ' faces')
                faceResults.forEach(function(face, idx){
                    dogifyLog('Overlaying ' + (idx + 1) + '/' + faceResults.length)
                    overlayImage($originalImgContainer, $originalImg, face)
                    // tag original image
                })
            }
            $originalImg.addClass('dogify-attempted')
            getFaceResults(imgUrl)
                .then(
                    processFaceResults,
                    function(err){
                        dogifyLog('getFaceResults() error idx: ' + idx + '/' + $imgs.length)
                        var errorCode = err['responseJSON']['error']['code'] || null
                        var statusCode = err['responseJSON']['error']['statusCode'] || null
                        dogifyLog('error code: ' + errorCode + ' status code:' + statusCode)
                        dogifyLog(err)
                        return
                        if(errorCode == 'RateLimitExceeded' || statusCode == 429){
                            dogifyLog('RATE LIMIT EXCEED TRY AGAIN idx: ' + idx)
                            setTimeout(function(){
                                return getFaceResults(imgUrl).then(processFaceResults)
                            }, 2000)
                        }
                    }
                )
        })
    }

    for(targetKey in targets){
        dogifyLog('searching ' + targetKey + ' in ' + location.href)
        if(location.href.indexOf(targetKey) >= 0){
            dogifyLog('doing ' + targetKey)
            try{
                putPNGsOnTop(targets[targetKey])
            }catch(err){
                dogifyLog('target error ' + targetKey)
                dogifyLog(err)
            }
        }
    }
}

$(function(){
    for(targetKey in targets){
        dogifyLog('searching ' + targetKey + ' in ' + location.href)
        if(location.href.indexOf(targetKey) >= 0){
            dogifyLog('add scroll event')
            $(window).scroll(function() {
               if($(window).scrollTop() + $(window).height() == $(document).height()) {
                   setTimeout(dogify, 2000)
               }
            })
        }
    }
})
