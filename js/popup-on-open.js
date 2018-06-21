function toggleReader(){
    //console.log('toggle!!!!');
    chrome.runtime.sendMessage({action: "toggleReader"});    
}
function denayLastRequest(){
    console.log('denayLastRequest!!!!');
    chrome.runtime.sendMessage({action: "denayLastRequest"});    
}


var lastOpening = Number(localStorage.getItem('lastOpening')),
    now = new Date().getTime();
    localStorage.setItem('lastOpening', now);
if(now - lastOpening > 1000){
    chrome.permissions.contains({
        origins: ['https://*.facebook.com/*']},function(status){
            if(status){
                toggleReader();
                window.close();
            }   
    })
    
}
else{
    denayLastRequest();
}

