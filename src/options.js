import {Row} from "./row.js"

var rules = {};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("addrow").addEventListener("click", function() {
        var row = new Row();
        row.websitecell.dispatchEvent(new Event("dblclick"));
    });
    chrome.storage.local.get("rules", function(r) {
        var rows = {};

        if (r.rules != undefined) {
            rules = r.rules;

            for (const [key, value] of Object.entries(rules)) {
                rows[key] = new Row(key);
            }    
        }
    });

    chrome.storage.onChanged.addListener(function(changes, areaname) {
        if (changes.rules != undefined && areaname == "local") {
            rules = changes.rules.newValue;        
        }
    })
});

document.addEventListener("updaterules", function(d) {
    let detail = d.detail;

    if (detail.new == "") {
        return;
    }
    
    if (detail.delete == true) {
        delete rules[detail.previous];
        return;
    }

    if (rules[detail.previous] != undefined) {
        delete rules[detail.previous];
    }

    rules[detail.new] = {
        hostContains: detail.new
    };
}); 

window.addEventListener("blur", function() {
    chrome.storage.local.set({rules: rules});  
})
