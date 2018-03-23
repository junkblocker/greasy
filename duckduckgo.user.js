// ==UserScript==
// @id             Duckduckgo
// @name           Duckduckgo search enhancements
// @version        1.2
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Add other search engines to Duckduckgo Interface and does fallback to github on no search results
// @include        https://duckduckgo.tld/*
// @grant          none
// @run-at         document-end
// ==/UserScript==

// Default fallback: ixquick -> startpage -> duckduckgo -> github -> peekier -> google | CEC
try {
    console.log("duckduckgo.user.js starting");
} catch (safe_wrap_top) {}
try {
    (function() {
        var doVisualUpdates = true;

        var hidden;
        if (typeof window.document.hidden !== 'undefined') {
            hidden = 'hidden';
        } else if (typeof window.document.msHidden !== 'undefined') {
            hidden = 'msHidden';
        } else if (typeof window.document.webkitHidden !== 'undefined') {
            hidden = 'webkitHidden';
        }

        if (hidden) {
            doVisualUpdates = !window.document[hidden];

            document.addEventListener('visibilitychange', function() {
                doVisualUpdates = !window.document[hidden];
            });
        }

        function killAds(loopy) {
            if (doVisualUpdates) {
                loopy = loopy || 0;
                loopy++;
                try {
                    // multiple divs with this same id can occur due to infinite scroll
                    var ads = document.querySelectorAll('.web-result-sponsored');
                    if (!ads) throw "No sponsored div found";
                    for (var i = 0; i < ads.length; i++) {
                        ads[i].style.display = 'none';
                    }
                    if (loopy < 30) setTimeout(killAds, 1000, loopy);
                } catch (ex) {
                    console.log(ex);
                }
            }
            setTimeout(killAds, 1000, loopy);
        }

        var addEventHandler = typeof addEventHandler !== 'undefined' ? addEventHandler : function(target, eventName, eventHandler, scope) {
            var f = scope ? function() {
                eventHandler.apply(scope, arguments);
            } : eventHandler;
            if (target.addEventListener) {
                target.addEventListener(eventName, f, true);
            } else if (target.attachEvent) {
                target.attachEvent('on' + eventName, f);
            }
            return f;
        };

        // *************************
        // addStyle
        // *************************
        var addStyle = typeof addStyle != 'undefined' ? addStyle : function(css) {
            if (typeof GM_addStyle !== 'undefined') {
                GM_addStyle(css);
                return;
            }

            var heads = document.getElementsByTagName('head');
            var root = heads ? heads[0] : document.body;
            var style = document.createElement('style');
            try {
                style.textContent = css;
            } catch (x) {
                try {
                    style.innerHTML = css;
                } catch (y) {
                    style.innerText = css;
                }
            }
            style.type = 'text/css';
            root.appendChild(style);
        };

        function makeButton(label, querys) {
            var button = document.createElement('button');
            button.id = 'my_' + label;
            button.className = 'btn';
            button.textContent = label;
            addEventHandler(button, "click", function() {
                window.location.replace(querys);
                return false;
            });
            return button;
        }

        function makeLink(label, querys) {
            var li = document.createElement('li');
            li.style.display = 'inline-block';
            var a = document.createElement('a');
            a.className = 'btn';
            a.href = querys;
            a.setAttribute('data-zci-link', 'whatever');
            a.innerHTML = label;
            li.appendChild(a);
            return li;
        }

        var hasClass = typeof hasClass !== 'undefined' ? hasClass : function(elem, cls) {
            if ((typeof(elem) == 'undefined') || (elem === null)) {
                console.log("Invalid hasClass elem argument");
                return false;
            } else if ((typeof(cls) == 'undefined') || (cls === null)) {
                console.log("Invalid hasClass cls argument");
                return false;
            }
            if (!elem.className) {
                return false;
            }
            return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        };

        function work() {
            var query_s = document.forms.x.q.value;
            console.log("Query", query_s);
            var ducks = "https://duckduckgo.com/html/?q=" + query_s + "&kj=w&kn=1&kp=-1&kx=g";
            var googles = 'https://encrypted.google.com/webhp#q=' + query_s + '&&tbs=li:1';
            var githubs = 'https://github.com/search?q=' + query_s;
            var ixquicks = "https://eu.ixquick.com/do/search?a=1&prfh=lang_homepageEEEs%2Fair%2Feng%2FN1Nconnect_to_serverEEEeuN1Nfont_sizeEEEmediumN1Nrecent_results_filterEEE1N1Nlanguage_uiEEEenglishN1Nsearch_engine_sourcesEEE1N1Ndisable_open_in_new_windowEEE0N1NsslEEE1N1Npower_refinementEEE1N1Ndisable_family_filterEEE1N1Nnum_of_resultsEEE100N1Npicture_privacyEEEonN1Ndisable_video_family_filterEEE1N1NsuggestionsEEE1N1N&cat=web&language=english&query=" + query_s + "&pl=chrome";
            var peekiers = 'https://peekier.com/#!' + query_s;

            var spages = "https://startpage.com/do/search/?query=" + query_s + "&cat=web&pl=ff&language=english&prfh=lang_homepageEEEs/white/eng/N1Nconnect_to_serverEEEusN1Nfont_sizeEEEmediumN1Nrecent_results_filterEEE1N1Nlanguage_uiEEEenglishN1Ndisable_open_in_new_windowEEE0N1NsslEEE1N1Ndisable_family_filterEEE1N1Nnum_of_resultsEEE100N1Ngeo_mapEEE1N1Npicture_privacyEEEonN1Ndisable_video_family_filterEEE1N1NsuggestionsEEE1N1N";
            var cec = 'http://wwwin-tools.cisco.com/onesearch/searchpage?queryFilter=' + query_s;
            var results = document.getElementsByClassName('no-results')[0];
            if (results && /No\s+results/.test(results.innerHTML)) {
                var did_you_mean = document.getElementById('did_you_mean');
                if (!did_you_mean) window.location.replace(githubs);
            }
            var before;
            var pn;
            before = document.getElementsByTagName('li');
            for (var i = 0; i < before.length; i++) {
                if (hasClass(before[i], 'zcm__item')) {
                    before = before[i];
                    pn = before.parentNode;

                    pn.insertBefore(makeLink('Ixquick', ixquicks), before);
                    pn.insertBefore(makeLink('Startpage', spages), before);
                    pn.insertBefore(makeLink('Github', githubs), before);
                    pn.insertBefore(makeLink('Peekier', peekiers), before);
                    pn.insertBefore(makeLink('Google', googles), before);
                    pn.insertBefore(makeLink('CEC', cec), before);
                    return;
                }
            }
            before = document.getElementById('header');
            if (before) {
                before = before.nextElementSibling;
                pn = before.parentNode;

                pn.insertBefore(makeButton('Ixquick', ixquicks), before);
                pn.insertBefore(makeButton('Startpage', spages), before);
                pn.insertBefore(makeButton('Github', githubs), before);
                pn.insertBefore(makeButton('Peekier', peekiers), before);
                pn.insertBefore(makeButton('Google', googles), before);
                pn.insertBefore(makeButton('CEC', cec), before);
                return;
            }
            before = document.getElementById('search_form_input_homepage');
            if (before) {
                before = before.parentNode.parentNode.parentNode;
                pn = before.parentNode;
                //before = before.nextSibling;

                pn.insertBefore(makeLink('Ixquick', ixquicks), before);
                pn.insertBefore(makeLink('Startpage', spages), before);
                pn.insertBefore(makeLink('Github', githubs), before);
                pn.insertBefore(makeLink('Peekier', peekiers), before);
                pn.insertBefore(makeLink('Google', googles), before);
                pn.insertBefore(makeLink('CEC', cec), before);
                return;
            }
            before = document.getElementById('links_wrapper');
            if (!before) before = document.querySelector('div.results-wrapper');
            if (before) {
                var xpn = before.parentNode;
                xpn.insertBefore(makeButton('Ixquick', ixquicks), before);
                xpn.insertBefore(makeButton('Startpage', spages), before);
                xpn.insertBefore(makeButton('Github', githubs), before);
                xpn.insertBefore(makeButton('Peekier', peekiers), before);
                xpn.insertBefore(makeButton('Google', googles), before);
                xpn.insertBefore(makeButton('CEC', cec), before);
                addStyle("button {padding: 3px; margin: 3px;}");
                return;
            }
        }
        setTimeout(killAds, 0);
        setTimeout(work, 0); // This helps li.zcm__item detection
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("duckduckgo.user.js ended");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=syntax fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
