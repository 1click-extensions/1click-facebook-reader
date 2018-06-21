

function fireSettings(){
    chrome.permissions.contains({
        origins: ['https://*.facebook.com/*']},function(status){
            
            if(status){
                 addSettings();
            }
            else{
                $('body').append($('<div class="grant-perm"><button type="butto" class="grant-permission-butt">' + chrome.i18n.getMessage('request_permission')  + '</button></div>'))
                $('.grant-permission-butt').click(function(){
                requestPermissions(function(){
                    addSettings()
                    });
                });
            }
        });
}

var settings = {}
fireSettings();
function addSettings(){
    chrome.runtime.sendMessage({action:"getSettings"}, function(settings){
        //console.log(settings);
        $('body').addClass('wide');
        
        $('#settings-title').text( chrome.i18n.getMessage('advanced_settings'));
        $('#settings-sub-title').text( chrome.i18n.getMessage('custom_settings'));
        $('#settings').empty();
        for(var ind of Object.keys(settings)){
            var indReplaced = ind.replace(/\s/g, '_');
            $('#settings').append($('<div class="setting setting-' + ind + '"><input type="checkbox" name="' + indReplaced + '" id="' + indReplaced + '" ' + (settings[ind] ? "checked='cecked'" : '' )+ '/><label for="' + indReplaced + '"> ' +  ind + '</label></div>'));
        }
        $('#settings :checkbox').each(function(){
            $(this).prettyCheckable();
        });
        $('#save').text( chrome.i18n.getMessage('save')).unbind('click').bind('click', function(){
            var settings = {};
            $('#settings :checkbox').each(function(){
                settings[$(this).attr('name').replace(/_/g,' ')] = Number($(this).is(':checked'));
            });
            console.log(settings);
            chrome.runtime.sendMessage({action:"setSettings",settings:settings}, function(status){
                console.log('status', status);
                if(status){
                    var add = $('<div class="saved-message"></div>');
                    add.text(chrome.i18n.getMessage('settings_saved'));
                    $('body').append(add);
                    setTimeout(function(){
                        add.remove();
                    },3000);
                }
            });
        });
    });

}


function requestPermissions(callback){
    chrome.permissions.request({ origins: ['https://*.facebook.com/*']},function(status){
    if(status){
        callback();
    }
    else{
        alert('Cant apply reader without permissions')
    }
    });
}