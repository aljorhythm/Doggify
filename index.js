function dogifyLog(obj){
    console.log('DOGIFY', obj);
}

dogifyLog('index.js');

$(document).ready(function(){

    function putPNGOnTop(params){
        var $originalImgContainer = $(params['original_img_container_selector'])
        var imgUrl = $(params['original_img_selector']).attr('src')
        console.log($(params['original_img_selector']))
        console.log(imgUrl)
        var promise = getFaceResults(imgUrl)
        console.log(promise)
        promise.then(function(faceResults){
            console.log(faceResults)
            var $overlayImg = $("<img>")
                .attr('src',  chrome.extension.getURL('img/overlays/dog.png'))
                .css({

                })//.css(params['img_css'])
            $originalImgContainer.append($overlayImg)
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
        wikipedia
    }

    for(targetKey in targets){
        dogifyLog('doing ' + targetKey)
        putPNGOnTop(targets[targetKey])
    }

})
