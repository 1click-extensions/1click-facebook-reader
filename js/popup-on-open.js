function toggleReader(){
    chrome.runtime.sendMessage({action: "toggleReader"});    
}


var lastOpening = Number(localStorage.getItem('lastOpening')),
    now = new Date().getTime();
    localStorage.setItem('lastOpening', now);
if(now - lastOpening > 2000){
    chrome.permissions.contains({
        origins: ['https://*.facebook.com/*']},function(status){
            if(status){
                toggleReader();
                window.close();
            }    
    })
    
}

