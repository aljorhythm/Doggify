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
        console.log(face)
        var faceLandmarks = face['faceLandmarks']
        var $overlayImg = $("<img>");
        $overlayImg.attr('src',  chrome.extension.getURL('img/overlays/dog3.png'))
            .css({
                'position' : 'absolute',
            }).load(function(){
                var pic_real_width = this.width;   // Note: $(this).width() will not
                var pic_real_height = this.height; // work for in memory images.
                $imgContainer.append($overlayImg)
            })
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
            original_img_container_selector : ".photoContainer .profilePicThumb",
            img_css : {
                'position' : 'absolute',
                'top' : '10%',
                'right' : '10%',
                'width' : '30%'
            }
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
