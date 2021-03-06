document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['extern'], function(d) {
        var background = document.getElementById('background');
        var aud = document.getElementById('aud');
        var vid = document.getElementById('vid');
        var obj = document.getElementById('obj');
        
        background.hidden = true;
        vid.hidden = true;
        obj.hidden = true;
        aud.hidden = true;

        if (d.extern == 0) {
            background.setAttribute("src", "images/default_image.jpg");
            background.hidden = false;
        }
        else {
            window.webkitRequestFileSystem(PERSISTENT, d.extern.size, function(fs) {
                fs.root.getFile(d.extern.name, {create: false}, function(f) {
                    f.file(function(fi) {
                        var type = fi.type.substring(0, fi.type.indexOf('/'));
                        if (type == "image") {
                            background.setAttribute("src", f.toURL());
                            background.hidden = false;
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
});

function getType(string) {
    var end = string.indexOf('/');
    if (end != -1) {
        return string.substring(0, end);
    }
}