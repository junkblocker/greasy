// ==UserScript==
// @id          github
// @name        GitHub Enhancements
// @namespace   junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description GitHub Enhancements
// @include     https://github.com/*
// @match       https://github.com/*
// @version     1.0
// @grant       none
// @run-at      document-end
// ==/UserScript==

// Default fallback: ixquick -> startpage -> duckduckgo -> github -> peekier -> google | CEC
try {
    console.log("github.user.js starting");
} catch (safe_wrap_top) {}
try {
    (function() {

        var container = document.getElementsByClassName('container');
        for (var i = 0, l = container.length; i <l ; i++) {
            container[i].style.width = '95%';
        }

        if (!(/^https:\/\/(gist\.)?github\.com\/([^\/]+\/[^\/]+\/)?search/).test(document.location.href)) return;

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

        function isRepoSearch() {
            return /github.com\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)\/search/.test(document.location.href);
        }

        function github(what, kind) {
            kind = kind || 'Repositories';
            if (isRepoSearch()) {
                return 'https://github.com/' + RegExp.$1 + '/search?langOverride=&q=' + what + '&type=' + kind;
            } else {
                return 'https://github.com/search?q=' + what + '&type=' + kind;
            }
        }

        function gourl(url, aftertime) {
            setTimeout(function() {
                window.location.replace(url);
            }, aftertime || 50);
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
            a.className = 'btn btn-sm btn-primary';
            a.id = label;
            a.href = url;
            a.innerHTML = label;
            return a;
        }

        function work(after) {
            var query_s, search_kind;
            after = after || 0;
            if (document.forms.search_form && document.forms.search_form.q) {
                query_s = document.forms.search_form.q.value;
                search_kind = '';
            } else if (/https:\/\/github.com\/([^\/]+\/[^\/]+\/)?search\?.*?q=([^&;]+)/.test(document.location.href)) {
                query_s = RegExp.$2;
            }
            if (query_s) {
                console.log("Query string", query_s);

                var results = document.getElementsByClassName('blankslate')[0];
                if (results) {
                    if (/We couldn.t find any repositories matching/.test(results.innerHTML)) {
                        console.log('Should trigger a code search');
                        gourl(github(query_s, 'code'));
                    } else if (/We couldn.t find any code matching/.test(results.innerHTML) || /type=code/.test(document.location.href)) {
                        console.log('Should trigger a Commits search');
                        gourl(github(query_s, 'Commits'));
                    } else if (/We couldn.t find any commits matching/.test(results.innerHTML)) {
                        console.log('Should trigger an Issues search');
                        gourl(github(query_s, 'Issues'));
                    } else if (/We couldn.t find any issues matching/.test(results.innerHTML)) {
                        console.log('Should trigger a Wiki search');
                        gourl(github(query_s, 'Wikis'));
                    } else if (/We couldn.t find any wiki pages matching/.test(results.innerHTML)) {
                        if (isRepoSearch()) {
                            // Exhausted our options
                            console.log('Should trigger a general github search');
                            gourl('https://github.com/search?langOverride=&q=' + query_s);
                        } else {
                            console.log('Should trigger a Users search');
                            gourl(github(query_s, 'Users'));
                        }
                    } else if (/We couldn.t find any users matching/.test(results.innerHTML)) {
                        if (isRepoSearch()) {
                            console.log('Should trigger a general github search');
                            gourl('https://github.com/search?langOverride=&q=' + query_s);
                        } else {
                            console.log("Redirecting to google search");
                            gourl(google(query_s, search_kind));
                        }
                    }
                } else {
                    results = document.forms.search_form;
                    if (results) {
                        var div = document.createElement('div');
                        div.setAttribute('align', 'center');

                        div.appendChild(makeButton('Ixquick', ixquick(query_s, search_kind)));
                        div.appendChild(makeButton('StartPage', spage(query_s, search_kind)));
                        div.appendChild(makeButton('DuckDuckGo', duck(query_s, search_kind)));
                        div.appendChild(makeButton('Google', google(query_s, search_kind)));
                        div.appendChild(makeButton('CEC', cec(query_s, search_kind)));

                        results.parentNode.insertBefore(div, results);
                        return;
                    }
                }
            } else {
                var links = document.createElement('div');
                links.setAttribute('align', 'center');
                var where = document.getElementById('links') || document.getElementById('js-pjax-container') || document.getElementById('js-repo-pjax-container');
                links.insertBefore(makeOtherLink('CEC', cec('')), links.firstChild);
                links.insertBefore(document.createTextNode('   '), links.firstChild);
                links.insertBefore(makeOtherLink('Google', google('')), links.firstChild);
                links.insertBefore(document.createTextNode('   '), links.firstChild);
                links.insertBefore(makeOtherLink('Peekier', peekier('')), links.firstChild);
                links.insertBefore(document.createTextNode('   '), links.firstChild);
                links.insertBefore(makeOtherLink('Duckduckgo', duck('')), links.firstChild);
                links.insertBefore(document.createTextNode('   '), links.firstChild);
                links.insertBefore(makeOtherLink('StartPage', spage('')), links.firstChild);
                links.insertBefore(document.createTextNode('   '), links.firstChild);
                links.insertBefore(makeOtherLink('Ixquick', ixquick('')), links.firstChild);
                where.insertBefore(links, where.firstChild);
            }
            // force it to rerun in case of AJAX crap
            setTimeout(work, after + 1000);
        }
        setTimeout(work, 2000);
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("github.user.js ended ");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=syntax fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
