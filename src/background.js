var rules;
var redirectLink;
var blockedtabs = {};

function onTabActivated(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url != undefined) {
            window.sessionStorage[tab.id] = tab.url;
            redirect(tab);
        }
    });
}

function onTabUpdated(tabId, changeInfo, tab) {
    if(changeInfo.url){
        window.sessionStorage[tabId] = changeInfo.url;
    }

    if (tab.url != undefined) {
        redirect(tab)
    }
}

function redirect(tab) {
    if (rules == undefined || rules.length == 0) {
        return;
    }

    try {
        let url = new URL(tab.url);
        let hostname = url.hostname;

        if (rules[url.toString()] != undefined) {
            window.sessionStorage[tab.id + "p"] = tab.url;
            chrome.tabs.update({url: redirectLink});
        }
        else if (rules[hostname] != undefined) {
            window.sessionStorage[tab.id + "p"] = tab.url;
            chrome.tabs.update({url: redirectLink});
        }
        else if (url.hostname.lastIndexOf('.') != url.hostname.indexOf('.')) {
            hostname = hostname.slice(url.hostname.lastIndexOf('.', url.hostname.lastIndexOf('.') - 1) + 1, url.hostname.length);
            
            if (rules[hostname] != undefined) {
                window.sessionStorage[tab.id + "p"] = tab.url;
                chrome.tabs.update({url: redirectLink});
            }
        }

        if (url.toString() == chrome.runtime.getURL("blocked.html")) {
            chrome.browserAction.setIcon({path: "images/restriction-shield16.png"});
            return;
        }
        else if (url.protocol != "http:" && url.protocol != "https:") {
            chrome.browserAction.setIcon({path: "images/red-unavailable16.png"});            
        }
        else {
            chrome.browserAction.setIcon({path: "images/green-checkmark16.png"});
            return;
        }
    } catch (error) {
        console.log(error);
        return;
    }  
}

function initalize() {
    chrome.storage.local.get(["redirect", "extern", "rules"], function(data) {
        if (data.redirect == undefined) {
            redirectLink = chrome.runtime.getURL("blocked.html");

            chrome.storage.local.set({redirect: redirectLink}, function() {
                console.log('Redirect is set to ' + redirectLink);
            });
        }
        else {
            redirectLink = data.redirect;
        }

        if (data.extern == undefined) {
            chrome.storage.local.set({extern: 0}, function() {
                console.log('Extern is set to 0');
            });
        }

        if (data.rules != undefined && Object.entries(data.rules).length > 0) {
            rules = data.rules;
            //chrome.webNavigation.onCommitted.addListener(redirect, {url: Object.values(data.rules)});
        }
        else {
            rules = [];
        }
    })
}

chrome.runtime.onInstalled.addListener(function() {
    initalize();
});

chrome.runtime.onStartup.addListener(function() {
    initalize();
});

chrome.storage.onChanged.addListener(function(changes, areaname) {
    if (changes.rules != undefined && areaname == "local") {
        rules = changes.rules.newValue;
        // var url = Object.values(changes.rules.newValue);

        // chrome.webNavigation.onCommitted.removeListener(redirect);
        
        // if (url.length != 0) {
        //     chrome.webNavigation.onCommitted.addListener(redirect, {url: url});
        // }        
    }

    if (changes.redirect != undefined && areaname == "local") {
        redirectLink = changes.redirect.newValue;
    }
})

chrome.tabs.onUpdated.addListener(onTabUpdated);
chrome.tabs.onActivated.addListener(onTabActivated);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.message == "popupOpened") {
        sendResponse({previousUrl: window.sessionStorage[message.tabId]});
    }
    else if (message.message == "previouslink") {
        sendResponse({previousUrl: window.sessionStorage[message.tabId + "p"]});
    }
    return true;
});