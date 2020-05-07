function initializeElements(row) {
    row.table = document.getElementById("blocked_t");

    row.tr = row.table.insertRow(1);
    row.tr.classList.add("row");

    row.websitecell = row.tr.insertCell(0);
    row.websitecell.classList.add("website");

    row.scheme = row.tr.insertCell(1);
    row.scheme.classList.add("scheme");
    
    row.schemedrop = row.scheme.appendChild(document.createElement("div"));
    row.schemedrop.classList.add("dropdown");
    
    row.schemedropbut = document.createElement("button");
    row.schemedropbut.classList.add("dropdown");
    row.schemedropbut.innerText = "http/https";

    row.schemedroplist = row.scheme.appendChild(document.createElement("div"));
    row.schemedroplist.classList.add("dropdownlist");
    
    row.schemedrop.appendChild(row.schemedropbut);
    row.schemedrop.appendChild(row.schemedroplist);

    var schemedroplisthttpcheck = document.createElement("input");
    schemedroplisthttpcheck.type = "checkbox";
    schemedroplisthttpcheck.disabled = true;
    schemedroplisthttpcheck.defaultChecked = true;

    var schemedroplisthttpscheck = document.createElement("input");
    schemedroplisthttpscheck.type = "checkbox";
    schemedroplisthttpscheck.disabled = true;
    schemedroplisthttpscheck.defaultChecked = true;

    var schemedroplisthttp = document.createElement("button");
    schemedroplisthttp.classList.add("dropdownbut");
    schemedroplisthttp.appendChild(schemedroplisthttpcheck);
    schemedroplisthttp.innerHTML += "http";

    var schemedroplisthttps = document.createElement("button");
    schemedroplisthttps.classList.add("dropdownbut");
    schemedroplisthttps.appendChild(schemedroplisthttpscheck);
    schemedroplisthttps.innerHTML += "https";

    row.schemedroplist.appendChild(schemedroplisthttp);
    row.schemedroplist.appendChild(schemedroplisthttps);

    row.delete = row.tr.insertCell(2);
    row.delete.classList.add("buttons");

    row.deletebut = row.delete.appendChild(document.createElement("button"));
    row.deletebut.classList.add("delete");

    row.deleteimg = row.deletebut.appendChild(document.createElement("img"));
    row.deleteimg.setAttribute("src", "images/garbage-can.png");
}

export class Row {
    constructor(website = "", scheme = {http: true, https: true}) {
        initializeElements(this);
        
        this.website = website;
        this.previouswebsite = website;
        this.currentwebsite = website;
        this.previousscheme = Object.assign({}, scheme);
        this.currentscheme = scheme;
        this.websitecell.innerText = website;

        var httpbut = this.schemedroplist.children[0];
        var httpsbut = this.schemedroplist.children[1];
        var httpcheck = this.schemedroplist.children[0].children[0];
        var httpscheck = this.schemedroplist.children[1].children[0];
        var tr = this.tr;
        var currentwebsite = this.currentwebsite;
        var previouswebsite = this.previouswebsite;
        var currentscheme = this.currentscheme;
        var previousscheme = this.previousscheme;

        this.websitecell.addEventListener("dblclick", function() {
            this.setAttribute("contenteditable", "true");
            this.classList.add("selected");
            this.focus();
            tr.classList.remove("row");
        });

        this.websitecell.addEventListener('blur', function() {
            this.setAttribute("contenteditable", "false");
            this.classList.remove("selected");
            tr.classList.add("row");
            currentwebsite = this.innerText.trim();

            if (currentwebsite != "" && currentwebsite != previouswebsite) {
                try {
                    var url = new URL(currentwebsite);
                    
                    if (url.protocol === "http" || url.protocol === "https") {
                        let returnobj = {previous: previouswebsite, new: currentwebsite, scheme: currentscheme, delete: false}
                        document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
                        previouswebsite = currentwebsite;
                    }
                } catch (error) {
                    let pattern = /^[a-z\d]([a-z\d\-]{0,61}[a-z\d])?(\.[a-z\d]([a-z\d\-]{0,61}[a-z\d])?)*$/i;
                    
                    if (pattern.test(currentwebsite)) {
                        let returnobj = {previous: previouswebsite, new: currentwebsite, scheme: currentscheme, delete: false}
                        document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
                        previouswebsite = currentwebsite;    
                    }
                }
            }
        });

        this.schemedrop.addEventListener("mouseleave", function() {
            var dropbut = this.parentElement.children[0].children[0];
            var httpcheck = this.children[1].children[0].children[0];
            var httpscheck = this.children[1].children[1].children[0];
        
            if (currentscheme.http == true && currentscheme.https == true) {
                dropbut.innerText = "http/https";
            }
            else if (currentscheme.http == true && currentscheme.https == false) {
                dropbut.innerText = "http";
            }
            else if (currentscheme.http == false && currentscheme.https == true) {
                dropbut.innerText = "https";
            }
            else {
                dropbut.innerText = "http/https";
                httpscheck.checked = true;
                httpcheck.checked = true;
                currentscheme.http = true;
                currentscheme.https = true;
            }        

            // if (currentscheme.http != previousscheme.http || currentscheme.https != previousscheme.https) {
            //     let returnobj = {previous: previouswebsite, new: currentwebsite, scheme: scheme, delete: false}
            //     document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
            //     previousscheme.https = currentscheme.https;
            //     previousscheme.http = currentscheme.http;
            // }
        });

        this.websitecell.addEventListener("keydown", function(e) {
            if (e.key == "Enter") {
                this.blur();
            }
        });

        this.deletebut.addEventListener("click", function() {
            document.getElementById("blocked_t").deleteRow(this.parentElement.parentElement.rowIndex);
            let returnobj = {previous: previouswebsite, new: currentwebsite, scheme: scheme, delete: true}
            document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
        });

        httpbut.addEventListener("click", function() {
            this.children[0].checked = !this.children[0].checked;
            
            currentscheme.http = this.children[0].checked;
        });

        httpsbut.addEventListener("click", function() {
            this.children[0].checked = !this.children[0].checked;

            currentscheme.https = this.children[0].checked;
        });

        if (previousscheme.http == undefined) {
            this.previousscheme.http = false;
            this.currentscheme.http = false;
        }

        if (previousscheme.https == undefined) {
            this.previousscheme.https = false;
            this.currentscheme.https = false;
        }
        
        httpcheck.checked = this.previousscheme.http;
        httpscheck.checked = this.previousscheme.https;

        this.schemedrop.dispatchEvent(new Event("mouseleave"));
    }
}
