chrome.runtime.setUninstallURL("https://1ce.org");

if (!localStorage.created) {
  chrome.tabs.create({ url: "https://1ce.org" });
  var manifest = chrome.runtime.getManifest();
  localStorage.ver = manifest.version;
  localStorage.created = 1;
}

var cssByElements = {
  "like and share actions" : [".commentable_item ._sa_",".UFICommentActions"],
  "likes counter" : [".UFILikeSentence"],
  "shares counter" : [".UFIShareRow"],
  "add comment form" : [".UFIAddComment"],
  "date and privacy" : ["._5pcp"],
  "Wall details column" : [".fbTimelineTwoColumn"],
  "left column " : [".home_right_column",".pagelet"],
  "side menu" : [".UFIAddComment"],

}, cssStr = '';

function setDefaults(){
  localStorage.setItem('like and share actions', 1);
  localStorage.setItem('shares counter', 1);
  localStorage.setItem('likes counter', 1);
  localStorage.setItem('add comment form', 1);
  localStorage.setItem('date and privacy', 1);
  localStorage.setItem('left column on feed page', 0);
  localStorage.setItem('left column on group page', 0);
  localStorage.setItem("Wall details column", 0);
  localStorage.setItem("side menu", 0);
  localStorage.setItem("date and privacy", 0);
  setCssBySettings();
}
setDefaults();
var waitWithToggle;
chrome.runtime.onMessage.addListener(function (data, sender, callback) {
  //console.log(data)
  if("getSettings" == data.action ){
    callback(getSettings());
  }
  if("setSettings" == data.action ){
    
    for(var ind of Object.keys(data.settings)){
      //console.log(ind, data.settings[ind]);
      localStorage.setItem(ind, data.settings[ind]);
    }
    setCssBySettings();
    callback(true);
  }
  if("toggleReader" == data.action ){
    waitWithToggle = setTimeout(toggleReader, 1100);
    setTimeout(function(){
        localStorage.setItem('usedAlready',1);
    },10000);
  }
  if("denayLastRequest" == data.action ){
    //console.log(waitWithToggle,'denayLastRequest')
    if(waitWithToggle){
      
      clearTimeout(waitWithToggle);
      waitWithToggle = null;
    }

  }
  
});

function toggleReader(){
  localStorage.setItem('readerOn',Number(!getReaderState()));
  injectAllTabs(true);
  togglePageActionIcon();
  waitWithToggle = null;
}

function togglePageActionIcon(){
  // chrome.tabs.query( { active: true, currentWindow: true }, function(tabs){
  //   //console.log(tabs[0]);
  //   injectJsCurrentTab(tabs[0]);
  // });
  
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
      css.push(cssByElements[ind].join(", body.reader-on "));
    }
  }
  cssStr = 'body.reader-on ' + css.join(', body.reader-on ') + "{display:none!important;}"
}

function injectToTab(tab, onClick){
  //console.log(tab)
  if(isFacebook(tab.url)){
    //console.log('inject to ' , onClick)
    if(tab.active && localStorage.getItem('usedAlready')){
        //ensure tab opend
      setTimeout(function(){
       // injectJsCurrentTab();
      },700);
    }
    if(getReaderState()){
      chrome.pageAction.setIcon({tabId: tab.id,path:  chrome.runtime.getURL('images/browseraction.png')});
      chrome.pageAction.setTitle({tabId: tab.id,title:chrome.i18n.getMessage("stop_reader")});
      chrome.tabs.insertCSS(tab.id, {code:cssStr});
      chrome.tabs.executeScript(tab.id, {code:"document.body.classList.add('reader-on')"});
      //add message just when page action clicked
      if(tab.active && onClick){
         chrome.tabs.executeScript(tab.id, {file:"js/on-toggle.js"}, function(){
           chrome.tabs.executeScript(tab.id, {code:"chooseMessage(1)"});
         });
       }      
    }
    else{
      chrome.pageAction.setIcon({tabId: tab.id,path:  chrome.runtime.getURL('images/browseraction_off.png')});
      chrome.pageAction.setTitle({tabId: tab.id,title:chrome.i18n.getMessage("start_reader")});
      chrome.tabs.executeScript(tab.id, {code:"document.body.classList.remove('reader-on')"});
      //add message just when page action clicked
      if(tab.active && onClick){
        chrome.tabs.executeScript(tab.id, {file:"js/on-toggle.js"}, function(){
          chrome.tabs.executeScript(tab.id, {code:"chooseMessage(0)"});
        });
      }  
    }
  }
}

// chrome.pageAction.onClicked.addListener(function(tab){
//   console.log(tab)
//   chrome.pageAction.setPopup({
//     tabId: tab.id,
//     popup : '<html><body>sdsdsdfsdf</body></html>'
//   });
//   chrome.pageAction.getPopup(
//      tab.id,
//     function(str){
//       console.log(str);
//     }
//   );
// })
function changePopup(tab){
  console.log(tab.url);
  //on facebook page, or on any pages if url null (permissions didnt granted)
  if(isFacebook(tab.url) || !tab.url){
    console.log(tab.id);
    chrome.pageAction.show(tab.id);
  }
  
}
function injectAllTabs(onClick){
  chrome.tabs.query({currentWindow: false}, function(tabs) {
    tabs.forEach(function(tab) {
      //console.log(tab);
      changePopup(tab);
      injectToTab(tab, onClick);
    });
  });
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    tabs.forEach(function(tab) {
      changePopup(tab);
      injectToTab(tab, onClick);
     
    });
  });
chrome.tabs.onCreated.addListener(function(tab){
  injectToTab(tab, false);
  changePopup(tab);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  console.log(tab);
  injectToTab(tab, false);
  changePopup(tab);
});
}
injectAllTabs();


function isFacebook(url){
  return /https?:\/\/.+\.facebook.com/.test(url);
}