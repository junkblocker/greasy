// ==UserScript==
// @id          wiki_auto_login
// @name        Wiki Auto Login
// @namespace   junkblocker
// @description Logs you into Wikipedia universe wikis automatically. You can't stay logged out.
// @include     *://*.wikibooks.tld/*
// @include     *://*.wikidata.tld/*
// @include     *://*.wikinews.tld/*
// @include     *://*.wikipedia.tld/*
// @include     *://*.wikiquote.tld/*
// @include     *://*.wikisource.tld/*
// @include     *://*.wikiversity.tld/*
// @include     *://*.wikivoyage.tld/*
// @version     1.1
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==

try {
    console.log("wiki_auto_login.user.js starting");
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

        window.setTimeout(function() {
            // check if logout button is present
            var logout = document.getElementById("pt-logout");
            if (logout) {
                var foo = logout.getElementsByTagName("a")[0];
                addEventHandler(foo, 'click', function() {
                    setv('manual', true);
                });
            }
        }, 2000);

        function returnTo() {
            // return to original page after login/logout
            var zurueck = document.getElementById("mw-returnto");
            if (zurueck) {
                var zurueckLink = zurueck.getElementsByTagName("a")[0];
                if (zurueckLink) {
                    location.href = zurueckLink.href;
                }
            } else if (/\&returnto=([^;?&]+)/.test(document.location.href)) {
                var article = RegExp.$1;
                var logo = document.getElementById('p-logo');
                if (logo) logo = logo.getElementsByTagName('a')[0];
                logo = logo.href;
                var newlink = logo.replace(/\/[^\/]+$/, '/') + article;
                location.href = newlink;
            }
        }
        if (/^https?:\/\/([^\/]+\.)?.*Special:UserLogout/.test(document.location.href)) {
            returnTo();
            return;
        }
        var isGM = (typeof GM_getValue != 'undefined' && typeof GM_getValue('a', 'b') != 'undefined');
        var getv = isGM ? GM_getValue : function(name, def) {
            var s;
            try {
                s = localStorage.getItem(name);
            } catch (e) {}
            return (s == "undefined" || s == "null") ? def : s;
        };
        var setv = function(name, value) {
            try {
                if (isGM) {
                    GM_setValue(name, value);
                } else {
                    localStorage.setItem(name, value);
                }
            } catch (e) {
                console.log("setRawValue did nothing because", e);
            }
        };

        var hasClass = typeof hasClass !== 'undefined' ? hasClass : function(elem, cls) {
            if ((typeof(elem) == 'undefined') || (elem === null)) {
                console.log("Invalid hasClass elem argument");
                return false;
            } else if ((typeof(cls) == 'undefined') || (cls === null)) {
                console.log("Invalid hasClass cls argument");
                return false;
            }
            return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        };

        // check if login button is present
        if (!getv('manual', false)) {
            var loginPossible = document.getElementById("pt-login");
            if (loginPossible && !hasClass(loginPossible, "active")) {
                var foo = loginPossible.getElementsByTagName("a")[0];
                location.href = foo.href;
            }
        }

        function clickLogin() {
            if (!document.forms.userlogin) return;
            var manual = getv("manual", false);
            if (manual) {
                document.forms.userlogin.wpName.value = '';
                document.forms.userlogin.wpPassword.value = '';
            }
            var l = getv("login", '');
            if (manual || !l) {
                l = prompt("Login name", l);
                if (!l) {
                    returnTo();
                    return;
                }
                setv('login', l);
            }
            var p = getv("password", '');
            if (manual || !p) {
                p = prompt("Password", p);
                if (!p) {
                    returnTo();
                    return;
                }
                setv('password', p);
            }
            setv('manual', false);
            document.forms.userlogin.wpName.value = l;
            document.forms.userlogin.wpPassword.value = p;
            document.getElementById('wpRemember').checked = true;
            document.getElementById('wpLoginAttempt').click();
        }
        clickLogin();
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("wiki_auto_login.user.js ended");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=0 nowrap :
