function initializeElements(row) {
    row.table = document.getElementById("blocked_t");

    row.tr = row.table.insertRow(1);
    row.tr.classList.add("row");

    row.websitecell = row.tr.insertCell(0);
    row.websitecell.classList.add("website");
    
    row.delete = row.tr.insertCell(1);
    row.delete.classList.add("buttons");

    row.deletebut = row.delete.appendChild(document.createElement("button"));
    row.deletebut.classList.add("delete");

    row.deleteimg = row.deletebut.appendChild(document.createElement("img"));
    row.deleteimg.setAttribute("src", "images/garbage-can.png");
}

export class Row {
    constructor(website = "") {
        initializeElements(this);
        
        this.website = website;
        this.previouswebsite = website;
        this.currentwebsite = website;
        this.websitecell.innerText = website;

        var tr = this.tr;
        var currentwebsite = this.currentwebsite;
        var previouswebsite = this.previouswebsite;

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
                        let returnobj = {previous: previouswebsite, new: currentwebsite, delete: false}
                        document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
                        previouswebsite = currentwebsite;
                    }
                } catch (error) {
                    let pattern = /^[a-z\d]([a-z\d\-]{0,61}[a-z\d])?(\.[a-z\d]([a-z\d\-]{0,61}[a-z\d])?)*$/i;
                    
                    if (pattern.test(currentwebsite)) {
                        let returnobj = {previous: previouswebsite, new: currentwebsite, delete: false}
                        document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
                        previouswebsite = currentwebsite;    
                    }
                }
            }
        });

        this.websitecell.addEventListener("keydown", function(e) {
            if (e.key == "Enter") {
                this.blur();
            }
        });

        this.deletebut.addEventListener("click", function() {
            document.getElementById("blocked_t").deleteRow(this.parentElement.parentElement.rowIndex);
            let returnobj = {previous: previouswebsite, new: currentwebsite, delete: true}
            document.dispatchEvent(new CustomEvent("updaterules", {detail: returnobj}));
        });
    }
}
