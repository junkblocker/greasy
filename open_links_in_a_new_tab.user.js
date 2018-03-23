// ==UserScript==
// @id             open_links_in_a_new_tab
// @name           Open links in a new tab
// @version        1.1
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    opens links on specified pages in new tabs
// @include        *://*swish.cgi*
// @include        *://chneukirchen.org/*
// @include        *://*trivium*
// @include        *://encrypted.google.tld*
// @include        *://www.dragonflydigest.tld*
// @include        *://gist.github.tld*
// @inclue         *;//www.shiningsilence.tld*
// @include        *://*.livejournal.tld*
// @include        *://*newshelton.tld*
// @include        *://*popurls.tld*
// @include        *://*reddit.tld*
// @include        *://*vim.org*
// @include        *://*vuxml.org*
// @include        *://*wallhaven.cc*
// @include        *://*wallhaven.cc*
// @include        *://*wikimedia.org*
// @include        *://*wikipedia.tld*
// @run-at         document-end
// @grant          none
// ==/UserScript==

try {
    console.log("open_links_in_a_new_tab.user.js starting");
} catch (safe_wrap_top) {};
try {
    (function() {
        function open_in_new_tab_work(doc) {
            try {
                doc = doc || document;
                if (!doc.querySelectorAll || typeof doc.querySelectorAll == 'undefined') return;
                var links = doc.querySelectorAll('a');
                var link;

                // XXX: Does Javascript/DOM have any methods to call to do this without this
                // hack?
                var base = document.baseURI;

                for (var i = 0, l = links.length; i < l; i++) {
                    link = links[i];
                    try {
                        //if (!(/^[Aa]$/).test(link.nodeName)) {
                        //console.log("Skipping non <a> link", link.href);
                        //} else
                        if (link.onClick) { // for example on reddit comment thread collapse/expand [+]/[-] links
                            // console.log("Skipping link with onClick", link.href);
                            // } else if (!link.href) {
                            // console.log("Skipping link with no href");
                        } else if ((/^javascript/).test(link.href)) {
                            // console.log("Skipping javascript link", link.href);
                        } else if (base == link.origin + link.pathname) {
                            // (Internal) link to the same page
                            // console.log("Skipping internal link", link.href);
                        } else {
                            link.target = "_blank";
                        }
                    } catch (ex) {
                        console.log("Error:", ex);
                    }
                }
            } catch (e) {
                console.log("Error", e);
            }
        }
        var mo = window.MutationObserver || window.MozMutationObserver || window.WebKitMutationObserver;
        if (typeof mo !== "undefined") {
            var observer = new mo(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes !== null) {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            open_in_new_tab_work(mutation.addedNodes[i]);
                        }
                    }
                });
            });
            observer.observe(document, {
                childList: true,
                subtree: true,
            });
        } else {
            function open_in_new_tab_boot(e) {
                open_in_new_tab_work(e.target);
            }
            window.addEventListener("DOMNodeInserted", open_in_new_tab_boot, false);
            window.addEventListener("AutoPatchWork.DOMNodeInserted", open_in_new_tab_boot, false);
            window.addEventListener("AutoPagerize_DOMNodeInserted", open_in_new_tab_boot, false);
            window.addEventListener("AutoPagerAfterInsert", open_in_new_tab_boot, false);
        }
        open_in_new_tab_work(document);
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
};
try {
    console.log("open_links_in_a_new_tab.user.js ended");
} catch (safe_wrap_bottom_3) {};
