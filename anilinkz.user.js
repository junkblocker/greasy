// ==UserScript==
// @id             anilinkz
// @name           anilinkz fixup
// @version        1.1
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    anilinkz.com fixup
// @include        http://anilinkz.tld/*
// @grant          GM_addStyle
// @run-at         document-end
// ==/UserScript==

/* jshint maxerr: 10000 */
/* jslint browser:true */

try {
    console.log('anilinkz.user.js starting');
} catch (safe_wrap_top) {}
try {
    (function() {
        var interval = 500;
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
            var originalTitle = document.title;
            doVisualUpdates = !window.document[hidden];

            document.addEventListener('visibilitychange', function() {
                doVisualUpdates = !window.document[hidden];
            });
        }

        var PreferredSourcePicker = {
            scores: {
                // Has HTML5 player
                'vNest': 9, // ad free, slow
                'sMoe': 8, // ad free, slow
                'UpCr2': 10,
                'UpCr4': 10,
                'VidCr2': 10,
                'VidCr4': 10,
                'AuEn': 9, // Can't start at arbitrary position
                'v44': 9, // fast

                'PlayP': 6, // Flash Only :(
                'PlayP2': 6, // Flash Only :(
                'Daily': 6,
                'gDrive': 5,
                'Pbb': 4,
                'ArkVid': 5, // slow
                'Nova': 5,
                'vZoo': 4, // Pause control broken
                'eStream': 1,
                'yUp': 0,
                'AuEn2': -1,
                'oLoad': -1,
                'vDrive': -1,
                'Vous': 6,

                // Not working with uBlock origin anymore
                'Baka': -1,
                '4up': -1,
            },

            score: function(src_name) {
                return (typeof PreferredSourcePicker.scores[src_name] == 'undefined') ? 0 : PreferredSourcePicker.scores[src_name];
            },

            run: function() {
                var picked_src;
                var picked_index;
                var picked_url;
                var looking_at;
                var not_already_picked = !(/(\?src=|#selected)/.test(location.href));
                var links = document.querySelectorAll('#sources a');
                var link_src_names = [];
                var i;
                for (i = 0, l = links.length; i < l; i++) {
                    links[i].href += '#selected';
                    looking_at = link_src_names[i] = links[i].innerText || links[i].innerHTML;
                    links[i].innerText = looking_at + "\n" + PreferredSourcePicker.score(looking_at);
                    if (not_already_picked) {
                        if (!picked_src || (PreferredSourcePicker.score(looking_at) > PreferredSourcePicker.score(picked_src))) {
                            picked_src = looking_at;
                            picked_index = i;
                            picked_url = links[i].href;
                        }
                    }
                }
                if (links && links.length) {
                    var last_link = links[links.length - 1];
                    var reselect = document.createElement('a');
                    reselect.text = "Reselect\n-";
                    reselect.href = last_link.href.replace(/\?.*$/, '');
                    last_link.parentNode.insertBefore(reselect, last_link.parentNode.lastChild);
                    if (not_already_picked && picked_index !== 0) {
                        window.location.replace(picked_url);
                    }
                }
            }
        };

        PreferredSourcePicker.run();
        var ad_selector = '.sa, .ads, #tago, #tagoan, #hloading, #ifr_adid, #aad.ad, .jhasvdjhas a, .jhasvdjhas, .vjs-center-ad, .vjs-top-ad';

        var addStyle = typeof addStyle != 'undefined' ? addStyle : function(css) {
            if (typeof GM_addStyle !== 'undefined') {
                GM_addStyle(css);
                return;
            }

            var heads = document.getElementsByTagName('head');
            var root = heads ? heads[0] : document.body;
            var style = document.createElement('style');
            try {
                style.innerHTML = css;
            } catch (x) {
                style.innerText = css;
            }
            style.type = 'text/css';
            root.appendChild(style);
        };
        addStyle(
            '    body {\n' +
            '      margin: 0px;\n' +
            '      font-size: 13px;\n' +
            '    }\n' +
            '    .kwarta, .la {\n' +
            '      background-color: rgb(63, 63, 63);\n' +
            '    }\n' +
            '    #topnav, #wrap {\n' +
            '      width: auto;\n' +
            '    }\n' +
            '    a:link {\n' +
            '      text-decoration: underline;\n' +
            '    }\n' +
            '    a:visited {\n' +
            '      color: yellow;\n' +
            '      text-decoration: underline;\n' +
            '    }\n' +
            '    h3, h2, h1 {\n' +
            '      color: white;\n' +
            '      text-shadow: none !important;\n' +
            '    }\n' +
            '    #nextprevlist div span {\n' +
            '      text-shadow: none;\n' +
            '    }\n' +
            '    /* Ads and chat boxes */\n' +
            '    #chatango, .sideright, #leftside {\n' +
            '      display: none;\n' +
            '    }\n' +
            '    a:hover {\n' +
            '      color: black;\n' +
            '      text-decoration: none;\n' +
            '      background-color: white;\n' +
            '    }\n' +
            '');

        function blockAds() {
            if (doVisualUpdates) {
                try {
                    $(ad_selector).hide().attr('z-index', 0).remove();
                } catch (e) {
                    console.log('blockAds', e);
                }
                try {
                    $('iframe').each(function() {
                        try {
                            $(ad_selector, this.contentWindow.document).hide().attr('z-index', 0).remove();
                        } catch (e) {
                            console.log('blockAds', e);
                        }
                    });
                } catch (e) {
                    console.log('blockAds', e);
                }
                if (interval > 10000) {
                    interval = 10000;
                } else {
                    interval += 100;
                }
            }
            setTimeout(blockAds, interval);
        }
        setTimeout(function() {
            $('span.trending a, span.latest a, div#nextprevlist a, div#eplist a, a.ser, a.ep').attr('target', '_blank');
            blockAds();
        }, 2000);
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log('anilinkz.user.js ended');
} catch (safe_wrap_bottom_3) {}

// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
