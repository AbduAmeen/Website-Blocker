function redirect() {
    chrome.storage.local.get("redirect", function(d) {
        chrome.tabs.update({url: d.redirect});
    })
}

chrome.runtime.onInstalled.addListener(function() {
    initalize();
});

chrome.runtime.onStartup.addListener(function() {
    initalize();
});

function initalize() {
    chrome.storage.local.get(["redirect", "extern", "rules"], function(data) {
        if (data.redirect == undefined) {
            var redirect_def = chrome.runtime.getURL("blocked.html");

            chrome.storage.local.set({redirect: redirect_def}, function() {
                console.log('Redirect is set to ' + redirect_def);
            });
        }

        if (data.extern == undefined) {
            chrome.storage.local.set({extern: 0}, function() {
                console.log('Extern is set to 0');
            });
        }

        if (data.rules != undefined && Object.entries(data.rules).length > 0) {
            chrome.webNavigation.onCommitted.addListener(redirect, {url: Object.values(data.rules)});
        }
    })
}

chrome.storage.onChanged.addListener(function(changes, areaname) {
    if (changes.rules != undefined && areaname == "local") {
        var url = Object.values(changes.rules.newValue);

        chrome.webNavigation.onCommitted.removeListener(redirect);
        
        if (url.length != 0) {
            chrome.webNavigation.onCommitted.addListener(redirect, {url: url});
        }        
    }
})