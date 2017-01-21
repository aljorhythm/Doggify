function dogifyLog(obj){
    console.log('DOGIFY', obj);
}
dogifyLog('index.js');
$(document).ready(function(){
    function putPNGOnTop(params){
        $originalImgContainer = $(params['original_img_container_selector'])
        $overlayImg = $("<img>")
            .attr('src',  chrome.extension.getURL('img/overlays/dog.png'))
            .css(params['img_css'])
        $originalImgContainer.append($overlayImg)
    }
    var targets = {
        facebook_profile : {
            original_img_selector : ".profilePic img",
            original_img_container_selector : ".photoContainer .profilePicThumb",
            img_css : {
                'position' : 'absolute',
                'top' : '10%',
                'right' : '10%',
                'width' : '30%'
            }
        }
    }
    for(targetKey in targets){
        dogifyLog('doing ' + targetKey)
        putPNGOnTop(targets[targetKey])
    }
})
