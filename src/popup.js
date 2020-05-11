var blockedtabs = {};
var mode = "block";
var currentUrl;
var previousUrl;
var currentTabIndex;
var gotprevurl = false;

function initalize() {
    var websitetext = document.getElementById("website");
    var hostnamebut = document.getElementById("hostname");
    var pageonlybut = document.getElementById("pageonly");
        
    chrome.tabs.query({active: true}, function(tab) {
        currentTabIndex = tab[0].id;
        
        chrome.runtime.sendMessage("", {message: "popupOpened", tabId: currentTabIndex}, {}, function (response) {
            currentUrl = new URL(response.currentUrl);
        
            if (currentUrl.toString() == chrome.runtime.getURL("blocked.html")) {
                let func = function() {
                    websitetext.innerText = previousUrl.hostname;
                    hostnamebut.innerText = "Allow Host";
                    pageonlybut.hidden = true;
                    mode = "allow";
                    document.body.style.height = "auto";
                }
    
                if (!gotprevurl) {
                    chrome.runtime.sendMessage({message: "previouslink", tabId: currentTabIndex}, function (response) {
                        previousUrl = Object.assign(new URL(response.previousUrl));
                        func();
                        gotprevurl = true;
                    });
                }
                else {
                    func();
                }
                
                return;
            }
            else if (currentUrl.protocol != "http:" && currentUrl.protocol != "https:") {
                hostnamebut.hidden = true;
                pageonlybut.hidden = true;
                websitetext.innerHTML = "Disabled"
                document.body.style.height = "auto";
            }
            else {
                websitetext.innerText = currentUrl.hostname;
                pageonlybut.hidden = false;
                hostnamebut.innerText = "Block Host";
                mode = "block";
                document.body.style.height = "130px";
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var hostnamebut = document.getElementById("hostname");
    var pageonlybut = document.getElementById("pageonly");

    var onTabUpdated = function(tabId, changeInfo, tab) {
        if (tab.status == "complete") {
            initalize();
            chrome.tabs.onUpdated.removeListener(onTabUpdated);
        }
    }

    var storageSet = function(data, rules) {
        if (!data.rules || Object.values(data.rules).length == 0 || 
        (Object.values(rules) != Object.values(data.rules) && Object.values(rules).length != 0)) 
        {
            chrome.tabs.update(currentTabIndex, {url: data.redirect}, function() {
                chrome.tabs.onUpdated.addListener(onTabUpdated);
            });
        }
    }

    initalize();

    hostnamebut.addEventListener("click", function() {
        switch (mode) {
            case "allow": {
                if (!previousUrl) {
                    return;
                }

                chrome.storage.local.get(["rules"], function(data) {
                    var rules = data.rules;

                    if (!rules) {rules = {}}

                    if (rules[previousUrl.hostname]){
                        delete rules[previousUrl.hostname];
                    }
                    
                    if (rules[previousUrl.toString()]) {
                        delete rules[previousUrl.toString()];
                    }
                    
                    if (previousUrl.hostname.lastIndexOf("www.") == 0) {
                        var hn = previousUrl.hostname.substring(4, previousUrl.hostname.length);
                        delete rules[hn];
                    }

                    chrome.storage.local.set({rules: rules}, function() {
                        if (!data.rules || Object.values(data.rules).length == 0 || 
                        (Object.values(rules) != Object.values(data.rules) && Object.values(rules).length != 0)) 
                        {
                            chrome.tabs.update(currentTabIndex, {url: previousUrl.toString()}, function(tab) {
                                var func = function() {
                                    chrome.webNavigation.onCompleted.removeListener(func);
                                    initalize();
                                }
                                chrome.webNavigation.onCompleted.addListener(func);
                            });
                        }
                    });
                })
                break;
            }
            case "block": {
                if (!currentUrl) {
                    return;
                }
                chrome.storage.local.get(["rules", "redirect"], function(data) {
                    var rules = data.rules;

                    if (!rules) {rules = {}}

                    rules[currentUrl.hostname] = currentUrl.hostname;
                    
                    chrome.storage.local.set({rules: rules}, function() {
                        storageSet(data, rules);
                    });
                })
                break;
            }
        }
    }); 
    
    pageonlybut.addEventListener("click", function() {
        if (!currentUrl) {
            return;
        }

        chrome.storage.local.get(["rules", "redirect"], function(data) {
            var rules = data.rules;

            if (!rules) {rules = {}}

            rules[currentUrl] = currentUrl;

            chrome.storage.local.set({rules: rules}, function() {
                storageSet(data, rules);
            });
        })
    });
});