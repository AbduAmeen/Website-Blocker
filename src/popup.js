var blockedtabs = {};

document.addEventListener('DOMContentLoaded', function() {
    var websitetext = document.getElementById("website");
    var hostnamebut = document.getElementById("hostname");
    var pageonlybut = document.getElementById("pageonly");

    chrome.tabs.query({active: true}, function(tab) {
        chrome.runtime.sendMessage("", {message: "popupOpened", tabId: tab[0].id}, {}, function (response) {
            try {
                var url = new URL(response.previousUrl);
                websitetext.innerText = url.hostname;

                if (url.toString() == chrome.runtime.getURL("blocked.html")) {
                    chrome.runtime.sendMessage("", {message: "previouslink", tabId: tab[0].id}, {}, function (response) {
                        websitetext.innerText = response.previousUrl;
                        hostnamebut.innerText = "Allow Host";
                        pageonlybut.innerText = "Allow This Page Only";
                    });
                    return;
                }
                else if (url.protocol != "http:" && url.protocol != "https:") {
                    hostnamebut.disabled = true;
                    pageonlybut.disabled = true;
                    websitetext.innerHTML = "&nbsp"
                }
            }
            catch(error) {
                hostnamebut.disabled = true;
                pageonlybut.disabled = true;
            }
        });
    });
});
