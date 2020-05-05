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
                //let scheme = value.conditions[0].pageUrl.schemes;    
                rows[key] = new Row(key);
            }    
        }
    });
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
    var scheme = ['http', 'https'];

    if (detail.scheme.https == false) {scheme.pop();} 

    if (detail.scheme.http == false) {scheme.shift()}

    if (detail.previous == "") {
        rules[detail.new] = {
            hostContains: detail.new
        }
    }
    // else if (rules[detail.previous] != undefined) {
    //     let val = rules[detail.new];

    //     val.conditions[0].pageUrl.schemes = scheme;
    // }
}); 

window.addEventListener("beforeunload", function() {
    chrome.storage.local.set({rules: rules});  
})
