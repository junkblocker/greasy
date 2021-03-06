// ==UserScript==
// @id             Peekier
// @name           Peekier search enhancements
// @version        1.1
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Add other search engines to Peekier Interface and does fallback to google on no search results
// @include        https://peekier.tld/
// @grant          none
// @run-at         document-end
// ==/UserScript==

// Default fallback: ixquick -> startpage -> duckduckgo -> github -> peekier -> google | CEC
try {
    console.log("peekier.user.js starting");
} catch (safe_wrap_top) {}
try {
    (function() {
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

        function duck(what) {
            return 'https://duckduckgo.com/html/?q=' + what + '&kj=w&kn=1&kp=-1&kx=g';
        }

        function google(what, kind) {
            if (kind && kind === 'pics') {
                return 'https://encrypted.google.com/search?q=' + what + '&tbm=isch' + '&&tbs=li:1';
            } else if (kind && kind === 'video') {
                return 'https://encrypted.google.com/search?q=' + what + '&tbm=vid' + '&&tbs=li:1';
            } else {
                return 'https://encrypted.google.com/webhp#q=' + what + '&&tbs=li:1';
            }
        }

        function ixquick(what) {
            return 'https://eu.ixquick.com/do/search?a=1&prfh=lang_homepageEEEs%2Fair%2Feng%2FN1Nconnect_to_serverEEEeuN1Nfont_sizeEEEmediumN1Nrecent_results_filterEEE1N1Nlanguage_uiEEEenglishN1Nsearch_engine_sourcesEEE1N1Ndisable_open_in_new_windowEEE0N1NsslEEE1N1Npower_refinementEEE1N1Ndisable_family_filterEEE1N1Nnum_of_resultsEEE100N1Npicture_privacyEEEonN1Ndisable_video_family_filterEEE1N1NsuggestionsEEE1N1N&cat=web&language=english&query=' + what + '&pl=chrome';
        }

        function spage(what) {
            return 'https://startpage.com/do/search/?query=' + what + '&cat=web&pl=ff&language=english&prfh=lang_homepageEEEs/white/eng/N1Nconnect_to_serverEEEusN1Nfont_sizeEEEmediumN1Nrecent_results_filterEEE1N1Nlanguage_uiEEEenglishN1Ndisable_open_in_new_windowEEE0N1NsslEEE1N1Ndisable_family_filterEEE1N1Nnum_of_resultsEEE100N1Ngeo_mapEEE1N1Npicture_privacyEEEonN1Ndisable_video_family_filterEEE1N1NsuggestionsEEE1N1N';
        }

        function github(what) {
            return 'https://github.com/search?q=' + what;
        }

        function cec(what) {
            return 'http://wwwin-tools.cisco.com/onesearch/searchpage?queryFilter=' + what;
        }

        function peekier(what) {
            return 'https://peekier.com/#!' + what;
        }

        function makeButton(label, querys) {
            var button = document.createElement('button');
            button.id = 'my_' + label;
            button.textContent = label;
            button.alt = querys;
            button.title = querys;
            addEventHandler(button, 'click', function() {
                window.location.replace(querys);
                return false;
            });
            return button;
        }

        function makeOtherLink(label, url) {
            var a = document.createElement('a');
            a.className = 'addsettings';
            a.id = label;
            a.href = url;
            a.innerHTML = label;
            return a;
        }

        function work() {
            var query_s, search_kind;
            query_s = document.getElementById('searchquerysmall').value;
            search_kind = '';
            if (query_s) {
                console.log("Query string", query_s);

                var results = document.getElementById('results-none');
                if (results && /No results found/.test(results.innerHTML)) {
                    window.location.replace(google(query_s, search_kind));
                } else {
                    results = document.getElementById('query-container');
                    if (results) {
                        var div = document.createElement('div');
                        div.setAttribute('align', 'center');

                        div.appendChild(makeButton('Ixquick', ixquick(query_s, search_kind)));
                        div.appendChild(makeButton('Startpage', spage(query_s, search_kind)));
                        div.appendChild(makeButton('DuckDuckGo', duck(query_s, search_kind)));
                        div.appendChild(makeButton('Github', github(query_s, search_kind)));
                        div.appendChild(makeButton('Google', google(query_s, search_kind)));
                        div.appendChild(makeButton('CEC', cec(query_s, search_kind)));

                        results.appendChild(div);
                    }
                }
            } else {
                var links = document.getElementById('searchbox');
                links.insertBefore(makeOtherLink('CEC', cec('')), links.firstChild);
                links.insertBefore(document.createTextNode(' | '), links.firstChild);
                links.insertBefore(makeOtherLink('Github', github('')), links.firstChild);
                links.insertBefore(document.createTextNode(' | '), links.firstChild);
                links.insertBefore(makeOtherLink('Google', google('')), links.firstChild);
                links.insertBefore(document.createTextNode(' | '), links.firstChild);
                links.insertBefore(makeOtherLink('Duckduckgo', duck('')), links.firstChild);
                links.insertBefore(document.createTextNode(' | '), links.firstChild);
                links.insertBefore(makeOtherLink('Startpage', spage('')), links.firstChild);
                links.insertBefore(document.createTextNode(' | '), links.firstChild);
                links.insertBefore(makeOtherLink('Ixquick', ixquick('')), links.firstChild);
            }
        }
        setTimeout(work, 500);
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("peekier.user.js ended");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=syntax fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
