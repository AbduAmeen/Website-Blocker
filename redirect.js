document.addEventListener('DOMContentLoaded', function() {
    var redirfile = document.getElementById('redirectFile');
    var redirurl = document.getElementById('redirectURL');
    var redirurlbut = document.getElementById('redirectURLBut');
    
    loadCurrentExtern();

    redirfile.addEventListener("change", function() {
        setRedirectFile(redirfile.files);
    }, false);
    redirfile.addEventListener("load", function() {
        setRedirectFile(redirfile.files);
    }, false);
    redirurlbut.addEventListener("click", function() {
        setRedirectURL(redirurl.value);
    }, false);
});

function setRedirectURL(url) {
    if (url.length != 0) {
        chrome.storage.local.set({redirect: url, extern: 0}, function() {
            loadCurrentExtern("url");
            console.log(url);
        });
    }
}

function setRedirectFile(file) {
    if (file.length != 0) {
        chrome.storage.local.get('extern', function(data) {
            //impl indexeddb
            window.webkitRequestFileSystem(PERSISTENT, file[0].size, function(fs) {
                fs.root.removeRecursively(function(d) {
                    console.log('cleaned');
                }, console.error);
                fs.root.getFile(data.extern.name, {create: false}, function(d) {
                    d.remove(function() {
                        console.log('cleaned');
                    }, console.error);
                }, console.error);

                fs.root.getFile(file[0].name, {create: true}, function(f) {
                    f.createWriter(function(fi) {
                        fi.onwriteend = function() {
                            loadCurrentExtern();
                        };
                        fi.write(file[0]);
                    }, console.error);
                }, console.error);
            }, console.error);
            chrome.storage.local.set({redirect: chrome.runtime.getURL("blocked.html"), extern: {
                name: file[0].name, size: file[0].size
            }});
        });
    }
}

function loadCurrentExtern() {
    chrome.storage.local.get(['redirect','extern'], function(data) {
        var urlbox = document.getElementById('redirectURL');
        var preview = document.getElementById('preview');
        var aud = document.getElementById('aud');
        var vid = document.getElementById('vid');
        var obj = document.getElementById('obj');
        var previewtext = document.getElementById('filepreviewtext');

        if (data.redirect != chrome.runtime.getURL("blocked.html")) {
            urlbox.setAttribute('placeholder', data.redirect);
            previewtext.hidden = true;
            preview.hidden = true;
            vid.hidden = true;
            obj.hidden = true;
            aud.hidden = true;
        }
        else {
            window.webkitRequestFileSystem(PERSISTENT, data.extern.size, function(fs) {
                fs.root.getFile(data.extern.name, {create: false}, function(f) {
                    f.file(function(fi) {
                        var type = fi.type.substring(0,fi.type.indexOf('/'));
                        
                        previewtext.hidden = false;
                        preview.hidden = true;
                        vid.hidden = true;
                        obj.hidden = true;
                        aud.hidden = true;
                        urlbox.setAttribute('placeholder', '');

                        if (type == "image") {
                            preview.setAttribute("src", f.toURL());
                            preview.hidden = false;
                        }
                        else if (type == "audio") {
                            aud.setAttribute("src", f.toURL());
                            aud.hidden = false;               
                        }
                        else if (type == "video") {
                            vid.setAttribute("src", f.toURL());
                            vid.hidden = false;
                        }
                        else {
                            obj.setAttribute("src", f.toURL());
                            obj.hidden = false;
                        }
                    });
                }, console.error)
            }, console.error);
        }
    });
}