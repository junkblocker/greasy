// ==UserScript==
// @id             Remove getpocket.com recommendation spam
// @name           Remove getpocket.com recommendation spam
// @version        1.0
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Remove getpocket.com recommendation spam
// @include        https://getpocket.com/a/recommended/*
// @grant          GM_getValue
// @grant          GM_setValue
// @run-at         document-end
// ==/UserScript==

/* jshint maxerr: 10000 */
/* jslint browser:true */
try {
    console.log('getpocket.user.js starting');
} catch (safe_wrap_top) {}
try {
    // Copyright (c) 2016-2018, Manpreet Singh <junkblocker@yahoo.com>
    (function() {
        if (!(/https:\/\/getpocket\.com\/(a\/(queue|recommended)|explore)\b/).test(document.location.href)) return;

        var interval = 100;

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
                interval = 100;
            });
        }

        var annoying_re = GM_getValue('annoying_str', undefined);
        if (annoying_re && annoying_re !== '') {
            annoying_re = new RegExp(annoying_re, 'i');
        } else {
            annoying_re = undefined;
        }
        console.log(annoying_re);

        // *************************
        // addEventHandler
        //
        // addEventHandler(maskLayer, "click", hideLayers);
        // addEventHandler(document.getElementById("someButton"), "click", saveConfiguration);
        // this.mouseDown = addEventHandler(this.handle, 'mousedown', this.start, this);
        // this.mouseDown = addEventHandler(this.handle, 'mousemove', this.start, this);
        // this.mouseDown = addEventHandler(this.handle, 'mouseup', this.start, this);
        // *************************
        var addEventHandler = typeof addEventHandler !== 'undefined' ? addEventHandler : function(target, eventName, eventHandler, scope) {
            var f;
            try {
                f = scope ? function() {
                    eventHandler.apply(scope, arguments);
                } : eventHandler;
                if (target.addEventListener) {
                    target.addEventListener(eventName, f, true);
                } else if (target.attachEvent) {
                    target.attachEvent('on' + eventName, f);
                }
            } catch (e) {
                console.log(e);
            }
            return f;
        };

        function removeAnnoyances() {
            if (doVisualUpdates) {
                var kinds = ['.spoc_header', '.flag-spoc'];
                for (var i = 0, l = kinds.length; i < l; i++) {
                    try {
                        console.log("Looking for", kinds[i]);
                        document.querySelectorAll(kinds[i]).forEach(function(item) {
                            item.parentNode.parentNode.style.display = 'none';
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
                // Dehighlight annoying items and send to back
                try {
                    if (typeof annoying_re !== 'undefined') {
                        document.querySelectorAll('.item_content_text a.title').forEach(function(item) {
                            var thisli = item.parentNode.parentNode.parentNode;
                            if (annoying_re.test(item.innerHTML)) {
                                if (thisli.style.opacity != '0.1') {
                                    thisli.style.opacity = '0.1';
                                }
                                var prnt = thisli.parentNode;
                                prnt.removeChild(thisli);
                                prnt.appendChild(thisli);
                            } else {
                                thisli.style.opacity = '1';
                            }
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
                try {
                    var title = document.querySelector('h2');
                    if (title && !title.configured) {
                        addEventHandler(title, 'click', function() {
                            var reg = prompt("Ignore matching regexp (automatic ignorecase): e.g. Trump|Hillary", GM_getValue('annoying_str', ''));
                            if (reg) {
                                GM_setValue('annoying_str', reg);
                                if (reg && reg !== '') {
                                    annoying_re = new RegExp(reg, 'i');
                                    setTimeout(removeAnnoyances, 100);
                                    return;
                                } else {
                                    annoying_re = undefined;
                                }
                            }
                        });
                        title.configured = 1;
                    }
                } catch (e) {
                    console.log(e);
                }
                interval += 100;
                if (interval > 10000) interval = 10000;
            }
            setTimeout(removeAnnoyances, interval);
        }
        removeAnnoyances();
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log('getpocket.user.js ended');
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=indent fenc= ff=unix ft=javascript ft=javascript sts=0 sw=4 ts=4 tw=0 nowrap :
