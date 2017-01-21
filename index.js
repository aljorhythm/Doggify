function dogifyLog(obj){
    console.log('DOGIFY', obj);
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

        // take into account parent border
        var borderX = forceInt($imgContainer.css("border-left-width")) + forceInt($imgContainer.css("padding-left-width")) + forceInt($img.css("border-left-width")) + forceInt($img.css("padding-left-width"))
        var borderY = forceInt($imgContainer.css("border-top-width")) + forceInt($imgContainer.css("padding-top-width")) + forceInt($img.css("border-top-width")) + forceInt($img.css("padding-top-width"))
        x += borderX
        y += borderY

        dogifyLog({
            'ratio' : ratio,
            'display ratio': naturalHeightRatio,
            'x' : x,
            'y' : y,
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
                'display' : 'none'
            })
            .addClass('dogify-overlay')
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
        $imgs.each(function(idx, img){
            if(params['limit'] && idx > params['limit']){
                return
            }
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
        "facebook.com/" : {
            original_img_selector : ".profilePic.img, .stage img"
        },
        "m.facebook.com/" : {
            original_img_selector : "#MRoot img"
        },
        "wikipedia.org" : {
            original_img_selector : ".vcard tr:nth-child(2) .image img:first-child"
        },
        "localhost:8888" : {
            original_img_selector : ".imgContainer img"
        },
        "instagram.com" : {
            original_img_selector : "main :not(header) > div img",
            limit : 5
        }
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

})
