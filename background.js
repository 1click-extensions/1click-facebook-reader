chrome.runtime.setUninstallURL("https://1ce.org");

if (!localStorage.created) {
  chrome.tabs.create({ url: "https://1ce.org" });
  var manifest = chrome.runtime.getManifest();
  localStorage.ver = manifest.version;
  localStorage.created = 1;
}

var cssByElements = {
  
  "like and share actions" : ".commentable_item ._sa_",
  "left column on feed page" : ".home_right_column",
  "likes counter" : ".UFILikeSentence",
  "shares counter" : ".UFIShareRow",
  "user's wall details column" : ".fbTimelineTwoColumn",
  "add comment form" : ".UFIAddComment",
  "side menu" : ".UFIAddComment",
  "date and privacy" : "._5pcp",

}, cssStr = '';

function setDefaults(){
  localStorage.setItem('like and share actions', 1);
  localStorage.setItem('shares counter', 1);
  localStorage.setItem('likes counter', 1);
  localStorage.setItem('add comment form', 1);
  localStorage.setItem('date and privacy', 1);
  localStorage.setItem('left column on feed page', 0);
  localStorage.setItem("user's wall details column", 0);
  localStorage.setItem("side menu", 0);
  localStorage.setItem("date and privacy", 0);
  setCssBySettings();
}
setDefaults();

chrome.runtime.onMessage.addListener(function (data, sender, callback) {
  console.log(data)
  if("getSettings" == data.action ){
    
    callback(getSettings());
  }
  if("setSettings" == data.action ){
    
    for(var ind of Object.keys(data.settings)){
      //console.log(ind, data.settings[ind]);
      localStorage.setItem(ind, data.settings[ind]);
    }
    setCssBySettings();
  }
  if("toggleReader" == data.action ){
    localStorage.setItem('readerOn',Number(!getReaderState()));
    injectAllTabs();
    toggleBrowsericon();
  }
  
});

function toggleBrowsericon(){
  if(getReaderState()){
    chrome.browserAction.setIcon({path:  chrome.runtime.getURL('images/browseraction.png')});
    chrome.browserAction.setTitle({title:chrome.i18n.getMessage("stop_reader")});
  }
  else{
    chrome.browserAction.setIcon({path:  chrome.runtime.getURL('images/browseraction_off.png')});
    chrome.browserAction.setTitle({title:chrome.i18n.getMessage("start_reader")});
  }
}
function getReaderState(){
  return Number(localStorage.getItem('readerOn'));
}

function getSettings(){
  var settings = {};
  for(var ind of Object.keys(cssByElements)){
    settings[ind] = Number(localStorage.getItem(ind));
  }
  return settings;
}

function setCssBySettings(){
  var settings = getSettings();
  css = [];
  for(var ind of Object.keys(cssByElements)){
    if(settings[ind]){
      css.push('body.reader-on ' + cssByElements[ind]);
    }
  }
  cssStr = css.join(',') + "{display:none!important;}"
}

function injectToTab(tab){
  //console.log(tab)
  if(/https?:\/\/.+\.facebook.com/.test(tab.url)){
    //console.log('inject to ' + tab.url)
    if(getReaderState()){
      chrome.tabs.insertCSS(tab.id, {code:cssStr});
      chrome.tabs.executeScript(tab.id, {code:"document.body.classList.add('reader-on')"});
    }
    else{
      chrome.tabs.executeScript(tab.id, {code:"document.body.classList.remove('reader-on')"});
    }
  }
}
function injectAllTabs(){
  chrome.tabs.query({currentWindow: false}, function(tabs) {
    tabs.forEach(function(tab) {
      //console.log(tab);
      injectToTab(tab);
    });
  });
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    tabs.forEach(function(tab) {
      injectToTab(tab);
     
    });
  });
chrome.tabs.onCreated.addListener(injectToTab);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  injectToTab(tab);
});
}

