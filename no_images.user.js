// ==UserScript==
// @id             no_images
// @name           Disable all images on the page
// @version        1.0
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Disable all images on the page if noimages or blockimages is in url params
// @include        http://*
// @include        https://*
// @grant          none
// @run-at         document-start
// ==/UserScript==

try {
    console.log("no_images.user.js starting");
} catch (safe_wrap_top) {}
try {
    (function() {
        var block_images = (/[#?;&](no|block)[_-]?images?/i).test(document.location.href);

        // *************************
        // getStyle
        //
        // getStyle(document.getElementById("foo"), "display"); // might return "inline-block"
        // *************************
        var getStyle = typeof getStyle !== 'undefined' ? getStyle : function(elm, prop) {
            var strValue = "";
            if (document.defaultView && document.defaultView.getComputedStyle) {
                strValue = document.defaultView.getComputedStyle(elm, "").getPropertyValue(prop);
            } else if (elm.currentStyle) {
                prop = prop.replace(/\-(\w)/g, function(strMatch, p1) {
                    return p1.toUpperCase();
                });
                strValue = elm.currentStyle[prop];
            }
            return strValue;
        };

        function hideImage(img) {
            try {
                img.style.display = 'none';
            } catch (x1) {}
            try {
                img.setAttribute('src', '');
            } catch (x2) {}
            try {
                img.style.backgroundImage = 'none';
            } catch (x3) {}
        }

        function hideImages(doc) {
            try {
                doc = doc || document;
                if (doc && typeof doc.nodeName != 'undefined' && doc.nodeName.toLowerCase() == 'img') {
                    hideImage(doc);
                }
                var links;
                if (typeof doc.querySelectorAll == 'function') {
                    links = doc.querySelectorAll('img');
                    for (var i = 0, l = links.length; i < l; i++) {
                        hideImage(links[i]);
                    }

                    var cs;
                    links = doc.querySelectorAll('*');
                    for (i = 0, l = links.length; i < l; i++) {
                        cs = getStyle(links[i], 'background-image');
                        if (cs !== '' && cs != 'none') {
                            hideImage(links[i]);
                        }
                    }
                }
            } catch (e) {
                console.log("hideImages", doc, e);
            }
        }

        function hideImagesCallback(e) {
            hideImages(e.target);
        }

        if (block_images) {
            var mo = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            if (typeof mo !== "undefined") {
                var observer = new mo(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.addedNodes !== null) {
                            for (var i = 0; i < mutation.addedNodes.length; i++) {
                                hideImages(mutation.addedNodes[i]);
                            }
                        }
                    });
                });
                observer.observe(document, {
                    childList: true,
                    subtree: true,
                });
            } else {
                window.addEventListener("DOMNodeInserted", hideImagesCallback, false);
                window.addEventListener("AutoPatchWork.DOMNodeInserted", hideImagesCallback, false);
                window.addEventListener("AutoPagerize_DOMNodeInserted", hideImagesCallback, false);
                window.addEventListener("AutoPagerAfterInsert", hideImagesCallback, false);
            }
            hideImages(document);
        }
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("no_images.user.js ended");
} catch (safe_wrap_bottom_3) {}
