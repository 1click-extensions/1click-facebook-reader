function addMessage(str){
    var div = document.createElement('div');
    div.style.padding = '10px';
    div.style['font-size'] = '18px';
    div.style['color'] = '#fff';
    div.style['position'] = 'fixed';
    div.style['position'] = 'fixed';
    div.style['top'] = '30px';
    div.style['z-index'] = 999;
    div.style['transition'] =  'opacity 0.5s ease';
    div.style['background'] =  'red';
    div.style['left'] =  'calc(50% - 100px)';
    div.innerText = str;
    document.body.appendChild(div);
    setTimeout(function(){
        div.style['opacity'] =  0;
        setTimeout(function(){
            document.body.removeChild(div);
        },3000);
    },3000);

}

function chooseMessage(isOff){
    if(isOff){
        addMessage(chrome.i18n.getMessage("reader_off")) ;
    }
    else{
        addMessage(chrome.i18n.getMessage("reader_on")) ;
    }
}