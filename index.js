function dogifyLog(obj){
    console.log('DOGIFY', obj);
}

dogifyLog('index.js');

$(document).ready(function(){
    function sanitizeImgUrl(url){
        if(url.indexOf("//") == 0)
            return "https:" + url
        return url
    }
    function putPNGOnTop(params){
        var $originalImgContainer = $(params['original_img_container_selector'])
        var $img = $(params['original_img_selector'])
        console.log($img)
        var imgUrl = sanitizeImgUrl($img.attr('src'))
        console.log($(params['original_img_selector']))
        console.log(imgUrl)
        getFaceResults(imgUrl).then(function(faceResults){
            console.log(faceResults)
            var $overlayImg = $("<img>")
                .attr('src',  chrome.extension.getURL('img/overlays/dog.png'))
                .css({

                })//.css(params['img_css'])
            $originalImgContainer.append($overlayImg)
        }, function(err){
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
            putPNGOnTop(targets[targetKey])
        }catch(err){

        }
    }

})
