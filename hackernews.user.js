// ==UserScript==
// @id             hacker_news
// @name           Hacker News Site Improvements
// @version        1.0
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Hacker News Site Improvements
// @include        http://hackerne.ws
// @include        http://hackerne.ws/
// @include        http://hackerne.ws/*
// @include        http://news.ycombinator.com/*
// @include        https://news.ycombinator.com/*
// @license        MIT
// @require        http://code.jquery.com/jquery-1.11.2.js
// @require        https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// @grant          GM_deleteValue
// @grant          GM_getValue
// @grant          GM_listValues
// @grant          GM_log
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_setValue
// @run-at         document-end
// ==/UserScript==

/* jshint maxerr    : 10000   */
/* jslint browser   : true   */
/* jslint esversion : 6   */

try {
    console.log("hackernews.user.js starting");
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
            var originalTitle = document.title;
            doVisualUpdates = !window.document[hidden];

            document.addEventListener('visibilitychange', function() {
                doVisualUpdates = !window.document[hidden];
                interval = 100;
            });
        }

        function reloadIfDDoSed() {
            var delay;
            if (doVisualUpdates) {
                delay = 60000;
            } else {
                delay = 120000;
            }
            if (/\?id=([0-9]+)/.test(document.location.href)) {
                delay = ((RegExp.$1) + 0) % delay + 30000;
                try {
                    if (document.body.firstElementChild.innerText == 'An error occurred.') {
                        window.location.replace(document.location.href);
                    } else {
                        return;
                    }
                } catch (e) {
                    console.log(e);
                }
                setTimeout(reloadIfDDoSed, delay);
            }
        }
        reloadIfDDoSed();

        if (typeof jQuery == 'undefined' || !jQuery) {
            if (typeof $ == 'undefined' || $ === null) {
                if (!this.jQuery) {
                    console.log("Could not get jQuery");
                    return;
                }
                $ = this.jQuery;
            }
        } else {
            $ = this.jQuery = jQuery.noConflict(true);
        }

        const HIGHLIGHT_COLOR = 'rgb(221, 255, 221)';
        const CURSOR_ROW_COLOR = 'rgb(255, 255, 192)';
        const ANIMATE = false;

        (function($) {
            $.fn.row_cur = function() {
                // Do your awesome plugin stuff here
                return this.each(function() {
                    if ($(this).css('background-color') != 'rgb(221, 255, 221)') {
                        $(this).css('background-color', CURSOR_ROW_COLOR);
                    }
                });
            };
            $.fn.row_uncur = function() {
                // Do your awesome plugin stuff here
                return this.each(function() {
                    if ($(this).css('background-color') != 'rgb(221, 255, 221)') {
                        $(this).css('background-color', 'inherit');
                    }
                });
            };
        })($);

        var drop = typeof drop !== 'undefined' ? drop : function(e) {
            e.preventDefault();
            e.stopPropagation();
        };

        const entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

        function escapeHTML(string) {
            return String(string).replace(/[&<>"'\/]/g, function(s) {
                return entityMap[s];
            });
        }

        var $xp = typeof $xp !== 'undefined' ? $xp : function(exp, node) {
            if (!node || node === '') node = document;
            var i, arr = [],
                r = document.evaluate(exp, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (i = 0, l = r.snapshotLength; i < l; i++) arr.push(r.snapshotItem(i));
            return arr;
        };

        // *************************
        // xhr_org
        //
        // uses = getValue/log
        // *************************
        var xhr_org;
        if (typeof GM_xmlhttpRequest !== "undefined") {
            xhr_org = GM_xmlhttpRequest;
        } else {
            xhr_org = function(details) {
                details.method = typeof details.method !== 'undefined' ? details.method.toUpperCase() : "GET";
                if (!details.url) {
                    if (getValue('DEVELOPER', 0)) {
                        console.log("GM_xmlhttpRequest requires an URL.");
                    }
                    return;
                }
                // build XMLHttpRequest object
                var oXhr, aAjaxes = [];
                if (typeof ActiveXObject !== "undefined") {
                    var oCls = ActiveXObject;
                    aAjaxes[aAjaxes.length] = {
                        cls: oCls,
                        arg: "Microsoft.XMLHTTP"
                    };
                    aAjaxes[aAjaxes.length] = {
                        cls: oCls,
                        arg: "Msxml2.XMLHTTP"
                    };
                    aAjaxes[aAjaxes.length] = {
                        cls: oCls,
                        arg: "Msxml2.XMLHTTP.3.0"
                    };
                }
                if (typeof XMLHttpRequest !== "undefined") {
                    aAjaxes[aAjaxes.length] = {
                        cls: XMLHttpRequest,
                        arg: undefined
                    };
                }
                for (var i = aAjaxes.length; i >= 0; i--) {
                    try {
                        oXhr = new aAjaxes[i].cls(aAjaxes[i].arg);
                        if (oXhr) break;
                    } catch (e) {}
                }
                // run it
                if (oXhr) {
                    if (details.onreadystatechange) {
                        oXhr.onreadystatechange = function() {
                            details.onreadystatechange(oXhr);
                        };
                    }
                    if (details.onload) {
                        oXhr.onload = function() {
                            details.onload(oXhr);
                        };
                    }
                    if (details.onerror) {
                        oXhr.onerror = function() {
                            details.onerror(oXhr);
                        };
                    }
                    oXhr.open(details.method || "GET", details.url, true);
                    if (details.overrideMimeType) {
                        oXhr.overrideMimeType(details.overrideMimeType);
                    }
                    if (details.headers) {
                        for (var header in details.headers) {
                            oXhr.setRequestHeader(header, details.headers[header]);
                        }
                    }
                    oXhr.send(details.data || null);
                } else {
                    console.log("This Browser is not supported, please upgrade.");
                    return;
                }
            };
        }

        function xhr(u, f) {
            xhr_org({
                method: 'GET',
                url: u,
                onload: f,
            });
        }

        const CACHE_PERIOD = 15 * 24 * 60 * 60 * 1000;
        const HN_DARK_ORANGE = '#ff6600';
        const HN_LIGHT_ORANGE = '#ff9900';
        const DEFAULT_PEOPLE = {
            'Araq': 'Nim author',
            'bcantrill': 'dtrace',
            'cperciva': 'Colin Percival, crypto, Former FreeBSD security officer, tarsnap',
            'pg': 'Paul Graham',
            'dang': 'hn',
            'sctb': 'hn',
            'rsync': 'rsync.net',
            'tptacek': 'Thomas Ptacek, crypto',
        };
        const DEFAULT_SIGHTS = [
            'cisco.com',
            'sentinelone.com'
        ];
        const DEFAULT_NOBLES = Object.keys(DEFAULT_PEOPLE);
        const FIXED_FONT_FAMILY = 'Menlo, Monaco, "Bitstream Vera Sans Mono", "Lucida Console", Consolas, Terminal, "Courier New", Courier, monospace';
        const SANS_SERIF_FONT_FAMILY = 'Lato, "Helvetica Neue", Helvetica, Verdana, Arial, FreeSans, "Luxi-sans", "Nimbus Sans L", sans-serif';
        const SERIF_FONT_FAMILY = 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif';

        var FONT_FAMILY = FIXED_FONT_FAMILY;
        var DIALOG_FONT_FAMILY = SANS_SERIF_FONT_FAMILY;

        // return: Whether elem is in array a
        var inArray = typeof inArray !== 'undefined' ? inArray : function(a, elem) {
            for (var i = 0, l = a.length; i < l; i++) {
                if (a[i] === elem) return true;
            }
            return false;
        };

        // requires: inArray
        var addUnique = typeof addUnique !== 'undefined' ? addUnique : function(a, elem) {
            if (!inArray(a, elem)) a.push(elem);
            return a;
        };

        function getViewportHeight() {
            var height = window.innerHeight; // Safari, Opera
            var mode = document.compatMode;

            if ((mode || !$.support.boxModel)) { // IE, Gecko
                height = (mode == 'CSS1Compat') ?
                    document.documentElement.clientHeight : // Standards
                    document.body.clientHeight; // Quirks
            }

            return height;
        }

        // MODIFIED
        //
        // returns true if ALL OF AN ELEMENT is in the viewport vertically
        // requires getViewportHeight and $
        function elementCompletelyInViewport(el, padding) {
            padding = padding || 10;
            padding = padding >= 0 ? padding : 0 - padding;
            var viewport = {};
            viewport.top = 0;
            viewport.scrolled = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            viewport.bottom = getViewportHeight();
            var bounds = {};
            bounds.topRelativeToViewport = $(el).offset().top - viewport.scrolled;
            bounds.bottomRelativeToViewport = bounds.topRelativeToViewport + $(el).outerHeight();
            return (
                (bounds.topRelativeToViewport >= (viewport.top + padding) && bounds.bottomRelativeToViewport <= (viewport.bottom - padding))
            );
        }

        // *************************
        // scrollToElement(element) - MODIFIED with 10 padding
        // *************************
        function scrollToElement(theElement, padding) {
            padding = padding || 10;
            padding = 0 - padding;
            var selectedPosX = 0;
            var selectedPosY = padding;

            while (theElement !== null) {
                selectedPosX += theElement.offsetLeft;
                selectedPosY += theElement.offsetTop;
                theElement = theElement.offsetParent;
            }

            window.scrollTo(selectedPosX, selectedPosY);
        }

        function centerElementByScrolling(element) {
            $('html,body').animate({
                scrollTop: $(element).offset().top - Math.max(0, (getViewportHeight() - $(element).outerHeight()) / 2)
            }, 250);
        }

        var isGM = (typeof GM_getValue != 'undefined' && typeof GM_getValue('a', 'b') != 'undefined');

        function openInTab(url) {
            setTimeout(function() {
                if (!url) return;
                if (window && typeof window.open === 'function') {
                    window.open(url);
                } else if (unsafeWindow && typeof unsafeWindow.open === 'function') {
                    unsafeWindow.open(url);
                } else if (typeof GM_openInTab === 'function') {
                    GM_openInTab(url);
                } else {
                    window.location.href = url;
                }
            }, 500);
        }

        // XXX: This may not be compatible with cooked getValue because of
        // 'undefined'/'null'
        var getRawValue = isGM ? GM_getValue : function(name, def) {
            var s;
            try {
                s = localStorage.getItem(name);
            } catch (e) {}
            return (s == "undefined" || s == "null") ? def : s;
        };
        var setRawValue = function(name, value) {
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

        var getValue = typeof getValue !== 'undefined' ? getValue : function(name, defaultValue) {
            var value = getRawValue(name);
            if (!value || typeof value != 'string' || value.length < 1) {
                try {
                    setValue(name, defaultValue);
                } catch (e) {
                    console.log(e);
                }
                return defaultValue;
            }

            var type = value[0];
            tvalue = value.substring(1);
            switch (type) {
                case 'b':
                    value = (tvalue == 'true');
                    break;
                case 'n':
                    value = Number(tvalue);
                    break;
                case 'o': // object
                    try {
                        value = JSON.parse(tvalue);
                    } catch (e) {
                        console.log('ERROR: getValue(', name, ', ', defaultValue, ') could not parse stored value', tvalue, e);
                        console.log('Returning default value');
                        value = defaultValue;
                    }
                    break;
                case 's':
                    value = tvalue;
                    break;
                case 'f': // function
                    try {
                        value = eval('(' + tvalue + ')');
                    } catch (e) {
                        console.log('ERROR: getValue(', name, ', ', defaultValue, ') could not parse stored value', tvalue, e);
                        console.log('Returning default function');
                        value = defaultValue;
                    }
                    break;
                default:
                    value = defaultValue;
                    break;
            }
            return value;
        };

        var setValue = typeof setValue !== 'undefined' ? setValue : function(name, value) {
            var type = (typeof value)[0];
            if (type == 'o') {
                try {
                    value = type + JSON.stringify(value);
                } catch (e) {
                    console.log(e);
                    return;
                }
            } else if (type == 'f') {
                try {
                    value = type + value.toString();
                } catch (e) {
                    console.log(e);
                    return;
                }
            } else if (/^[bsn]$/.test(type)) {
                value = type + value;
            } else {
                throw "Invalid type passed to setValue(" + name + ", ...)";
            }
            setRawValue(name, value);
        };

        var deleteValue = isGM ? GM_deleteValue : function(name) {
            try {
                localStorage.removeItem(name);
            } catch (e) {
                console.log('deleteValue failed for', name, 'Ignored.');
            }
        };

        var listValues = isGM ? GM_listValues : function() {
            var ret = [];
            try {
                for (var i = 0; i < localStorage.length; i++) {
                    ret.push(localStorage.key(i));
                }
            } catch (e) {
                console.log('listValues failed for', name);
            }
            return ret;
        };

        // deleteValue('config');

        var config = getValue('config', {
            'people': DEFAULT_PEOPLE,
            'nobles': DEFAULT_NOBLES,
            'sights': DEFAULT_SIGHTS,
        });

        var removeEventHandler = typeof removeEventHandler != 'undefined' ? removeEventHandler : function(target, eventName, eventHandler) {
            if (target.addEventListener) {
                target.removeEventListener(eventName, eventHandler, true);
            } else if (target.attachEvent) {
                target.detachEvent('on' + eventName, eventHandler);
            }
        };

        var addEventHandler = typeof addEventHandler != 'undefined' ? addEventListener : function(target, eventName, eventHandler, scope) {
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

        // Creates a new node with the given attributes and properties (be careful with XPCNativeWrapper limitations)
        function createNode(type, attributes, props) {
            var node = document.createElement(type);
            if (attributes) {
                for (var attr in attributes) {
                    if (!attributes.hasOwnProperty(attr)) continue;
                    node.setAttribute(attr, attributes[attr]);
                }
            }
            if (props) {
                for (var prop in props) {
                    if (!props.hasOwnProperty(prop)) continue;
                    if (prop in node) node[prop] = props[prop];
                }
            }
            return node;
        }

        function configureScript() {
            if (top !== self || document.body.tagName.toLowerCase() === 'frameset') return;

            // Gets the layers
            var maskLayer = document.getElementById("hnmaskLayer");
            var dialogLayer = document.getElementById("hndialogLayer");
            // Checks the layers state
            // Creates the layers if they don't exist or displays them if they are hidden
            if ((maskLayer) && (dialogLayer)) {
                if ((maskLayer.style.display === "none") && (dialogLayer.style.display === "none")) {
                    maskLayer.style.display = "";
                    dialogLayer.style.display = "";
                }
                dialogLayer.focus();
            } else {
                createLayers();
            }

            function createLayers() {
                // Creates a layer to mask the page during configuration
                maskLayer = createNode("div", {
                    id: "hnmaskLayer",
                    title: "Click here to return to the page"
                });

                // Creates a layer for the configuration dialog
                dialogLayer = createNode("div", {
                    id: "hndialogLayer"
                });

                dialogLayer.innerHTML = "<div id='hnconfTitle'>Hacker News</div>" +
                    "    <ul>" +
                    "        <li>Purge article/comments cache</li>" +
                    "        <input type='button' id='hnPurgeArticleCacheButton' value='Purge' title='Purge article/comments cache'/>" +
                    "        <li>Reset followed users list to default</li>" +
                    "        <input type='button' id='hnDefaultUserFollowButton' value='Reset' title='Reset followed users list to default'/>" +
                    "        <li>Reset followed sites list to default</li>" +
                    "        <input type='button' id='hnDefaultSiteFollowButton' value='Reset' title='Reset followed sites list to default'/>" +
                    "        <li>Save configuration to disk</li>" +
                    "        <input type='button' id='hnSaveConfigurationButton' value='Save' title='Save configuration to disk'/>" +
                    "        <li>Load saved configuration form disk</li>" +
                    "        <input type='file' id='hnLoadConfigurationFile'>" +
                    "        <li>Reset everything (USE WITH CAUTION)</li>" +
                    "        <input type='button' id='hnResetEverythingButton' value='Reset Everything' title='Reset everything'/>" +
                    "    </ul>" +
                    "</div>" +
                    "<div>" + genFollowDisplay() + "</div>";

                // Appends the layers to the document
                document.body.appendChild(maskLayer);
                document.body.appendChild(dialogLayer);

                // Adds the necessary event listeners
                addEventHandler(maskLayer, "click", hideLayers);
                addEventHandler(document.getElementById("hnPurgeArticleCacheButton"), "click", makePurgeArticleCacheHandler());
                addEventHandler(document.getElementById("hnDefaultUserFollowButton"), "click", makeDefaultUserFollowHandler());
                addEventHandler(document.getElementById("hnDefaultSiteFollowButton"), "click", makeDefaultSiteFollowHandler());
                addEventHandler(document.getElementById("hnSaveConfigurationButton"), "click", makeSaveConfigurationHandler());
                addEventHandler(document.getElementById("hnResetEverythingButton"), "click", makeResetConfigHandler());
                addEventHandler(document.getElementById("hnLoadConfigurationFile"), "change", makeLoadConfigurationFileHandler());

                addStyle(
                    // Adds styles and classes for the configuration layers and its contents
                    "#hnmaskLayer {\n" +
                    "    background-color: black !important;\n" +
                    "    opacity: 0.7 !important;\n" +
                    "    z-index: 2147483645 !important;\n" +
                    "    position: fixed !important;\n" +
                    "    left: 0px !important;\n" +
                    "    top: 0px !important;\n" +
                    "    width: 100% !important;\n" +
                    "    height: 100% !important;\n" +
                    "\n}" +
                    "#hndialogLayer {\n" +
                    "    background-color: white !important;\n" +
                    "    overflow: auto !important;\n" +
                    "    padding: 20px !important;\n" +
                    "    z-index: 2147483646 !important;\n" +
                    "    outline: black solid thin !important;\n" +
                    "    position: fixed !important;\n" +
                    "    left: 30% !important;\n" +
                    "    top: 7.5% !important;\n" +
                    "    width: 40% !important;\n" +
                    "    height: 85% !important;\n" +
                    "    text-align: left !important;\n" +
                    "    font-family: 'Times New Roman',Times,serif !important;\n" +
                    "    text-shadow: 0 0 1px #ccc !important;\n" +
                    "\n}" +
                    "#hndialogLayer > * {\n" +
                    "    margin: 20px 0px !important;\n" +
                    "}\n" +
                    "#hndialogLayer li {\n" +
                    "    margin: 15pt 0px 7px !important;\n" +
                    "    line-height: 1.5 !important;\n" +
                    "    font-style: italic !important;\n" +
                    "    color: #333 !important;\n" +
                    "    display: list-item !important;\n" +
                    "    list-style-type: none !important;\n" +
                    "    font-size: 11pt !important;\n" +
                    "    font-family: " + DIALOG_FONT_FAMILY + " !important;\n" +
                    "    background: url(data:image/gif;base64,R0lGODlhAQACAIAAAMncpv///yH5BAAAAAAALAAAAAABAAIAAAICRAoAOw==) left bottom repeat-x !important;\n" +
                    "    border: none !important;\n" +
                    "}\n" +
                    "#hndialogLayer input, #hndialogLayer select {\n" +
                    "    vertical-align: bottom !important;\n" +
                    "    margin-right: 0.5em !important;\n" +
                    "    margin-bottom: 1em !important;\n" +
                    "    color: #333 !important;\n" +
                    "    background-color: " + HN_LIGHT_ORANGE + " !important;\n" +
                    "    font-size: 10pt !important;\n" +
                    "    line-height: 1.2 !important;\n" +
                    "    border: 1px solid #333 !important;\n" +
                    "    width: 100% !important;\n" +
                    "}\n" +
                    "#hnconfTitle {\n" +
                    "    cursor: default !important;\n" +
                    "    font-size: 14pt !important;\n" +
                    "    line-height: 1.5 !important;\n" +
                    "    font-weight: bold !important;\n" +
                    "    text-align: center !important;\n" +
                    "    color: #333 !important;\n" +
                    "    margin: 20px !important;\n" +
                    "    font-family: " + DIALOG_FONT_FAMILY + " !important;\n" +
                    "}\n" +
                    "#hnconfButDiv {\n" +
                    "    text-align: center !important;\n" +
                    "}\n" +
                    "#hnconfButDiv input {\n" +
                    "    margin: 5px !important;\n" +
                    "}\n" +
                    "#hndialogLayer ul {\n" +
                    "    list-style-type: none !important;\n" +
                    "    line-height: 1.5 !important;\n" +
                    "    padding-left: 40px !important;\n" +
                    "    padding-right: 40px !important;\n" +
                    "    color: #333 !important;\n" +
                    "    list-style-image: none !important;\n" +
                    "    display: list-item !important;\n" +
                    "    font-size: 11pt !important;\n" +
                    "    font-family: " + DIALOG_FONT_FAMILY + " !important;\n" +
                    "    " +
                    "background: none !important;\n" +
                    "    border: none !important;\n" +
                    "}\n" +
                    "#hndialogLayer em {\n" +
                    "    font-weight: bold !important;\n" +
                    "    font-style: normal !important;\n" +
                    "    color: red !important;\n" +
                    "}\n");
            }

            // Changes the enabled state of all input/select fields of the dialog layer. If newState is undefined or not boolean, it does nothing
            // It is a nested function
            function setDialogInputState(newState) {
                if (typeof(newState) !== "boolean") return;
                var allInputs = $xp(".//input|.//select", dialogLayer);
                allInputs.forEach(function(i) {
                    i.disabled = !newState;
                });
            }

            // Exits the configuration by hiding the layers
            // It is called by the Cancel button and the maskLayer event listeners
            // It is a nested function
            function hideLayers(evt) {
                dialogLayer.style.display = "none";
                maskLayer.style.display = "none";
            }

            function makeResetConfigHandler(evt) {
                return function() {
                    window.setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);

                        setValue('config', {
                            'people': DEFAULT_PEOPLE,
                            'nobles': DEFAULT_NOBLES,
                            'sights': DEFAULT_SIGHTS,
                        });

                        // Reloads page and script
                        window.location.reload();
                    }, 0);
                };
            }

            function makePurgeArticleCacheHandler(evt) {
                return function() {
                    setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);

                        setRawValue('HEADLINES_CACHE', JSON.stringify({}));
                        setRawValue('COMMENTS_CACHE', JSON.stringify({}));

                        // Reloads page and script
                        window.location.reload();
                    }, 0);
                };
            }

            function makeDefaultUserFollowHandler(evt) {
                return function() {
                    setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);
                        config.nobles = DEFAULT_NOBLES;
                        setValue('config', config);

                        // Reloads page and script
                        window.location.reload();
                    }, 0);
                };
            }

            function makeDefaultSiteFollowHandler(evt) {
                return function() {
                    setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);
                        config.sights = DEFAULT_SIGHTS;
                        setValue('config', config);

                        // Reloads page and script
                        window.location.reload();
                    }, 0);
                };
            }

            function makeSaveConfigurationHandler(evt) {
                return function() {
                    setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);

                        DiskFile.saveAsFile(JSON.stringify(config), "HackerNews.json", "text/plain;charset=utf-8");

                        // Reloads page and script
                        window.location.reload();
                    }, 0);
                };
            }

            function makeLoadConfigurationFileHandler(evt) {
                return function(evt) {
                    setTimeout(function() {
                        // Disables the input/select fields
                        setDialogInputState(false);

                        DiskFile.readFromFile(evt);
                    }, 0);
                };
            }
        }

        var DiskFile = {
            /*
             * saveAsFile(text, filename, mimetype)
             *
             * Example: saveAsFile("Some content","filename.txt","text/plain;charset=utf-8");
             */
            saveAsFile: function(text, filename, mimetype) {
                try {
                    var blob = new Blob([text], {
                        type: mimetype
                    });
                    saveAs(blob, filename);
                } catch (e) {
                    window.open("data:" + mimetype + "," + encodeURIComponent(text), '_blank', '');
                }
            },
            readFromFile: function(e) {
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function(e) {
                    var contents = e.target.result;
                    try {
                        value = JSON.parse(contents);
                        if (!value || !value.people || !value.nobles || !value.sights) throw 'Could not parse that JSON';
                        setValue('config', value);
                        // Reloads page and script
                        window.location.reload();
                    } catch (ex) {
                        console.log('readFromFile', ex);
                        alert("Could not parse that JSON");
                    }
                };
                reader.readAsText(file);
            },
        };

        var registerMenuCommand = typeof GM_registerMenuCommand !== 'undefined' ? GM_registerMenuCommand : function() {};

        // Registers the configuration menu command
        registerMenuCommand("Hacker News Configuration", configureScript, null, null, "H");

        function doLogo() {
            try {
                var config_link = document.getElementById('ourlogo');
                if (!config_link) {
                    var logo = $xp('/html/body/center/table/tbody/tr/td/table/tbody/tr/td/a')[0];
                    if (!logo) return;
                    config_link = document.createElement('span');
                    config_link.id = 'ourlogo';
                    config_link.style.color = HN_DARK_ORANGE;
                    config_link.style.padding = '3px 5px 3px 5px';
                    config_link.style.borderRadius = '3px';
                    config_link.style.border = '1px dotted';
                    config_link.style.cursor = 'pointer';
                    config_link.setAttribute('alt', 'Configure Hacker News Improvements plugin');
                    config_link.setAttribute('title', 'Configure Hacker News Improvements plugin');
                    logo.parentNode.appendChild(config_link);
                    addEventHandler(config_link, "click", configureScript);
                }
                config_link.innerHTML = config.nobles.length + '/' + Object.keys(config.people).length + '/' + config.sights.length; // 'C';
            } catch (ce) {
                console.log(ce);
            }
        }

        function infinite_scroll() {
            if (!isPaginatedPage()) return;

            var $table;
            var $tablebg;
            var fetch;
            var loading = false;

            function more() {
                fetch = $('a[rel="nofollow"]').filter(function() {
                    return $(this).text() === 'More';
                });

                var tr = fetch.closest('tr');
                if (!tr || !tr[0] || !tr[0].previousElementSibling || !/morespace/.test(tr[0].previousElementSibling.className)) {
                    tr = tr.closest('tr');
                }
                $tablebg = $(document.body).css('background-color');
                if (!$table) $table = tr.closest('table');
                tr.prev().remove();
                tr.remove();
            }

            more();

            $(window).scroll(function() {
                if (loading) return;
                if ($(window).scrollTop() + getViewportHeight() > $(document).height() - 100) {
                    loading = true;
                    $table.css('background-color', '#DFD');
                    $.get(fetch.attr('href'), function(data) {
                        var $newtable;
                        var $trs;
                        if (isMainPage()) {
                            $newtable = $('<div>').html(data).find('a[id^="up_"]').closest('table');
                            $trs = $newtable.find('tr');
                        } else if (isCommentsPage()) {
                            $newtable = $('<div>').html(data).find('table[id="hnmain"]');
                            $trs = $newtable.find('tr.athing');
                        }
                        $table.append($trs);

                        loading = false;
                        $table.css('background-color', $tablebg);
                        more();
                        work();
                    });
                }
            });
        }

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
                style.innerHTML = css;
            } catch (x) {
                style.innerText = css;
            }
            style.type = 'text/css';
            root.appendChild(style);
        };

        var $morelinks_background_color = HN_DARK_ORANGE;
        var $morelinks_hover_color = HN_LIGHT_ORANGE;

        var $morelinks = {

            _menu_items: [
                ['/classic', 'Classic', 'classic'],
                ['/best', 'Highest voted recent links', 'best'],
                ['/active', 'Most active current discussions', 'active'],
                ['/bestcomments', 'Highest voted recent comments', 'best comments'],
                ['/leaders', 'Users with most karma', 'best users'],
                ['/newest', 'Newest stories', 'newest stories'],
                ['/hidden', 'Hidden stories (for a week)', 'hidden stories'],
                ['/shownew', 'Newest Show HN', 'newest show'],
                ['/over?points=400', 'Posts with score over 400', 'Over 400'],
                ['/over?points=450', 'Posts with score over 450', 'Over 450'],
                ['/over?points=500', 'Posts with score over 500', 'Over 500'],
                ['/noobstories', 'Submissions from new accounts', 'noob stories'],
                ['/noobcomments', 'Comments from new accounts', 'noob comments'],
            ],

            _draw_css: function() {
                var css = '#morelinks_menu{position:absolute;display:inline;}' +
                    '#morelinks_menu ul .item{display:none;}' +
                    '#morelinks_menu ul .top{margin-bottom:4px;}' +
                    '#morelinks_menu ul:hover .item{display:block;background-color:' + $morelinks_background_color + ';}' +
                    '#morelinks_menu ul:hover .item a{padding:5px 10px;display:block;}' +
                    '#morelinks_menu ul:hover .item a:hover{background-color:' + $morelinks_hover_color + '}' +
                    '#morelinks_menu ul{width:100%;float:left;margin:0;padding:0 2px 2px 2px;list-style:none;}';
                return css;
            },

            init: function() {
                if (document.getElementById("morelinks_menu")) return;
                //var menu_links = $xp('/html/body/center/table/tbody/tr/td/table/tbody/tr/td[2]/span[@class="pagetop"]/a[@href="show"]');
                var menu_links = $xp('/html/body/center/table/tbody/tr/td/table/tbody/tr/td[2]/span[@class="pagetop"]/a[@href="submit"]');
                var submit_link_parent = menu_links[0].parentNode;
                var dd_link = '<style>' + this._draw_css() + '</style>' +
                    ' | <div id="morelinks_menu"><ul>' +
                    '<li class="top"><a href="/lists">other pages</a></li>';
                for (var i = 0, k = this._menu_items.length; i < k; i++) {
                    dd_link += '<li class="item"><a href="' + this._menu_items[i][0] + '" title="' + this._menu_items[i][1] + '">' + this._menu_items[i][2] + '</a></li>';
                }
                dd_link += '</ul></div>';
                submit_link_parent.innerHTML += dd_link;
            }
        };

        function genFollowDisplay() {
            var html = '<table><thead><tr><th>User</th><th>Notes</th></tr></thead>';
            var followed = false;
            if (config && config.people) {
                for (var human in config.people) {
                    if (config.people.hasOwnProperty(human)) {
                        html += '<tr><td><a href="/user?id=' + human + '" target="_blank">' + human + (config.nobles.indexOf(human) != -1 ? ' *' : '') + '</a></td><td>' + escapeHTML(config.people[human]) + "</td></tr>\n";
                    }
                }
            }
            html += '<tr><td><b>Following sites</b></td><td>' + config.sights.join(", ") + '</td></tr>';
            html += '</table>';
            return html;
        }

        function newTabifyLinks(doc) {
            doc = doc || document;
            if (!doc) return;
            var links = doc.querySelectorAll('a');
            var link;

            var host = document.location.host;
            var protocol = document.location.protocol;
            //var to_this_domain = new RegExp(protocol + '/*(.*\\.)?' + host + '(/.*#.*$|$)');

            for (var i = 0, l = links.length; i < l; i++) {
                link = links[i];

                if (
                    /^[Aa]$/.test(link.nodeName) && // for <a> only
                    link.id === '' &&
                    link.parentNode.className != 'pagetop' &&
                    link.parentNode.parentNode.className != "pagetop" &&
                    link.parentNode.className != "yclinks" &&
                    link.innerText != "More" &&
                    link.innerText != "link" &&
                    link.innerText != "reply" &&
                    !link.onClick && // no onClick defined
                    link.href && // has a href
                    !(/(?:^javascript:)/.test(link.href))) { // not javascript:
                    link.target = "_blank";
                }
            }
        }

        function initCache(a_name) {
            var now = Date.now();
            var the_cache;
            try {
                the_cache = getRawValue(a_name, '{}'); // needs a comma to test
                the_cache = JSON.parse(the_cache);
                if (!the_cache) return {};
                // rough purge of the_cache
                for (var cached in the_cache) {
                    if (the_cache.hasOwnProperty(cached) && (now - the_cache[cached].t) >= CACHE_PERIOD) {
                        delete the_cache[cached];
                    }
                }
            } catch (e) {
                the_cache = {};
            }
            return the_cache;
        }

        function persistCache(a_name, a_cache) {
            try {
                setRawValue(a_name, JSON.stringify(a_cache));
                return true;
            } catch (e) {
                console.log("Could not persist cache", a_name, e);
                return false;
            }
        }

        function makeParentLink(comment, parentlevel, $hover_container) {
            var link = $('<a id="a_' + parentlevel + '" href="#">parent</a>');
            link.mouseenter(function(event) {
                drop(event);
                try {
                    //log('Entered', event.target.id);
                    var $this = $(this);
                    var p = event.target.id.replace(/^a_/, '');
                    //log('Parent', p);
                    var pid = document.getElementById(p);
                    var pid_container_row = $(pid).closest('table').closest('tr')[0];
                    var hidden = (pid_container_row.style.display == 'none');
                    if (hidden) {
                        pid_container_row.style.display = '';
                    } else {
                        // Make down voted content readable by setting the font to black
                        var content_html = pid.innerHTML.replace(/<font color="#[^"]+">/ig, '<font color="black">');
                        var $pid = $(pid);
                        $hover_container.hide().width($pid.width()).height($pid.height()).css('top', $this.parent().position().top - 10 - ($this.height() * 2.0) - $hover_container.height() + 'px').css('left', $pid.position().left + 'px').html(content_html).css('padding', '10px 10px 20px 10px').fadeIn('medium');
                    }
                } catch (e) {
                    console.log(e);
                }
                return false;
            });
            link.mouseout(function(event) {
                drop(event);
                try {
                    $hover_container.fadeOut('medium').empty();
                } catch (e) {
                    console.log(e);
                }
                return false;
            });
            link.click(function(event) {
                drop.event();
                try {
                    var parental_unit = event.target.id.replace(/^a_/, '');
                    scrollToElement(document.getElementById(parental_unit));
                } catch (e) {
                    console.log(e);
                }
                return false;
            });
            var r = $(comment).find('u');
            if (r[0]) {
                r.last().after(link).after(" | ");
            } else {
                $(comment).find('font').last().append(link);
            }
        }

        function makeStoryUnFollowFunction(sid) {
            return function(event) {
                drop(event);
                setTimeout(function() {
                    var comments_cache = initCache('COMMENTS_CACHE');
                    if (comments_cache[sid]) {
                        delete comments_cache[sid];
                        persistCache('COMMENTS_CACHE', comments_cache);
                    }
                    $(event.target).hide();
                    $(event.target.parentNode).find('a').css('background-color', 'inherit');
                }, 0);
                return false;
            };
        }

        function makeUserUnFollowFunction(username) {
            return function(event) {
                drop(event);
                setTimeout(function() {
                    try {
                        var label = $(event.target).text();
                        if (username) {
                            if (label == '+') {
                                var desc = prompt("Description for " + username + "?", config.people[username] || username);
                                if (desc) {
                                    config.people[username] = desc;
                                    addUnique(config.nobles, username);
                                    setValue('config', config);
                                    DiskFile.saveAsFile(JSON.stringify(config), "HackerNews.json", "text/plain;charset=utf-8");
                                } else {
                                    return false;
                                }
                            } else {
                                config.nobles = config.nobles.filter(function(a) {
                                    return a != username;
                                });
                                setValue('config', config);
                                DiskFile.saveAsFile(JSON.stringify(config), "HackerNews.json", "text/plain;charset=utf-8");
                            }
                            doLogo();
                            highlightFollowedUsers();
                        }
                    } catch (anything) {
                        console.log(anything);
                    }
                    return false;
                }, 0);
                return false;
            };
        }

        function makeSiteUnFollowFunction(sitename) {
            return function(event) {
                drop(event);
                setTimeout(function() {
                    try {
                        var label = $(event.target).text();
                        if (sitename) {
                            if (label == '+') {
                                addUnique(config.sights, sitename);
                                setValue('config', config);
                                DiskFile.saveAsFile(JSON.stringify(config), "HackerNews.json", "text/plain;charset=utf-8");
                            } else {
                                config.sights = config.sights.filter(function(a) {
                                    return a != sitename;
                                });
                                setValue('config', config);
                                DiskFile.saveAsFile(JSON.stringify(config), "HackerNews.json", "text/plain;charset=utf-8");
                            }
                            doLogo();
                            highlightFollowedSites();
                        }
                    } catch (anything) {
                        console.log(anything);
                    }
                    return false;
                }, 0);
                return false;
            };
        }

        function makeUserNav(username, sign) {
            var follow;
            if (sign) {
                follow = $('<a href="#" class="user_follow" title="Follow ' + username + '">Follow ' + username + '</a>');
            } else {
                follow = $('<a href="#" class="user_follow" title="Unfollow ' + username + '">Unfollow ' + username + '</a>');
            }
            follow.click(makeUserUnFollowFunction(username));
            return $('<nav/>').append(
                $('<ul/>').append(
                    $('<li/>').append(
                        $('<a href="#">*</a>')
                    ).append(
                        $('<ul/>').append(
                            $('<li/>').append(follow)
                        )
                    )
                )
            );
        }

        function makeFollowUserLink(follow_re, user_anode) {
            if (!follow_re || !user_anode) return;
            try {
                var username = user_anode.innerHTML;
                if (username && /^</.test(username)) { // New users get <font color="#3c963c">username</font>
                    username = user_anode.firstChild.innerHTML;
                }
                if (username) {
                    if (follow_re.test(username)) {
                        $(user_anode).css({
                            'background-color': HN_DARK_ORANGE,
                            'color': 'white',
                            'padding': '0 2px',
                            'border-radius': '3px',
                        });
                        $(user_anode).after($('<a href="#" class="user_follow" title="Unfollow ' + username + '">-</a>').click(makeUserUnFollowFunction(username)));
                        //$(user_anode).after(makeUserNav(username, true));
                    } else {
                        $(user_anode).css({
                            'background-color': 'inherit',
                            'color': 'inherit',
                            'padding': '0 2px',
                            'border-radius': '3px',
                        });
                        $(user_anode).after($('<a href="#" class="user_follow" title="Follow ' + username + '">+</a>').click(makeUserUnFollowFunction(username)));
                        //$(user_anode).after(makeUserNav(username, true));
                    }
                    desc = config.people[username];
                    if (desc) {
                        var esc_desc = escapeHTML(desc);
                        $(user_anode).attr('alt', desc).attr('title', desc);
                        $(user_anode).after($('<span class="flair" alt="' + esc_desc + '" title="' + esc_desc + '">' + esc_desc + '</span>'));
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }

        // color people followed and make follow/unfollow links etc.
        function highlightFollowedUsers(doc) {
            try {
                doc = doc || document;
                var follow_re = new RegExp('^(' + config.nobles.join("|") + ')$');
                if (isMainPage()) {
                    // color people followed and make follow/unfollow links etc.
                    $('.user_follow, .flair', doc).remove();

                    try {
                        $('.subtext a:nth-child(2)', doc).each(function() {
                            makeFollowUserLink(follow_re, this);
                        });
                    } catch (it) {
                        console.log(it);
                    }
                } else if (isCommentsPage()) {
                    $('.user_follow, .flair', doc).remove();

                    makeFollowUserLink(follow_re, $('table .subtext a', doc)[0]);
                    try {
                        $('span.comhead > a.hnuser', doc).each(function() {
                            makeFollowUserLink(follow_re, this);
                        });
                    } catch (a) {
                        console.log(a);
                    }
                } else if (isLeadersPage()) {
                    $('.user_follow, .flair', doc).remove();
                    doLeadersPage(doc);
                } else if (isProfilePage()) {
                    var td = $('.user_follow', doc).closest('td')[0];
                    td.innerHTML = td.firstChild.innerHTML;
                    doProfilePage(doc);
                } else {
                    console.log("Don't understand what kind of hn page this is");
                }
            } catch (e) {
                console.log(e);
            }
        }

        // color sites followed and make follow/unfollow links etc.
        function highlightFollowedSites(doc) {
            try {
                doc = doc || document;
                var follow_re = new RegExp('^(' + config.sights.join("|") + ')$');
                if (isMainPage() || isCommentsPage()) {
                    highlightSites(doc);
                } else {
                    console.log("Not a site highlightable hn page?");
                }
            } catch (e) {
                console.log(e);
            }
        }

        var main_nav = {

            row: 0,

            ncunh: function(e) {
                $(e).parent().row_uncur().prev().row_uncur();
            },

            nch: function(e) {
                var sw = $(e).parent().row_cur().prev().row_cur();
                centerElementByScrolling(sw[0]);
            },

            init: function() {
                if (!isMainPage()) return;
                main_nav.row = 0;

                try {
                    var $second_row = $('tr td.subtext').parent().first();
                    var $first_row = $second_row.prev();
                    $second_row.row_cur();
                    centerElementByScrolling(document.body.firstChild);
                    $first_row.row_cur().focus();
                } catch (eh) {
                    console.log(eh);
                }

                // keypress doesn't get arrow etc., must use keydown
                $(document).keydown(main_nav.main_page_keydown_handler);
            },

            main_page_keydown_handler: function(event) {
                try {
                    var shouldBubble = false;
                    /* Don't use shortcuts in various text fields */
                    if ($("*:focus").is("input") || $("*:focus").is("textarea")) {
                        shouldBubble = true;
                        return shouldBubble;
                    }
                    var code = event.which || event.keyCode;
                    var trows, $story_href, story_href, comment_href;
                    switch (code) {
                        case 112: // F1 - help
                        case 191: // ? - help
                        case 72: // H - help
                        case 104: // h - help
                            drop(event);
                            window.alert("h/? - Help\n\n" +
                                "j/J/Down - Next item\nk/K/Up - Previous item\n\n" +
                                "0 - First item on page\n$ - Last item on page\n\n" +
                                "o/O/Enter/Right - Open item and content in new tabs\n\n" +
                                "s/S/a/A - Open article/story only\n\n" +
                                "c/C - Open comments only\n\n" +
                                "u/U - Unfollow the story\n\n" +
                                "r/R - Reload\n\n" +
                                "n/N - Next unread/followed item\np/P - Previous unread item"
                            );
                            shouldBubble = false;
                            return shouldBubble;
                        case 40: // Down Arrow
                        case 74: // J - down
                        case 106: // j - down
                            drop(event);
                            trows = $('tr td.subtext');
                            if (main_nav.row >= 0) {
                                main_nav.ncunh(trows[main_nav.row]);
                            }
                            main_nav.row++;
                            if (main_nav.row >= trows.length) {
                                main_nav.row = 0;
                            }
                            main_nav.nch(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 38: // Up
                        case 75: // K - up
                        case 107: // k - up
                            drop(event);
                            trows = $('tr td.subtext');
                            if (main_nav.row >= 0) {
                                main_nav.ncunh(trows[main_nav.row]);
                            }
                            main_nav.row--;
                            if (main_nav.row < 0) {
                                main_nav.row = trows.length - 1;
                            }
                            main_nav.nch(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 48: // 0
                        case 71: // g (vi gg)
                            // Handle G in the fall through hack below
                            if (code == 48 || !event.shiftKey) {
                                drop(event);
                                trows = $('tr td.subtext');
                                if (main_nav.row >= 0) {
                                    main_nav.ncunh(trows[main_nav.row]);
                                }
                                main_nav.row = 0;
                                main_nav.nch(trows[main_nav.row]);
                                shouldBubble = false;
                                return shouldBubble;
                            }
                        case 52: // 4 - needs shift key
                            if (!event.shiftKey) {
                                console.log('keydown which', event.which);
                                console.log('keydown keyCode', event.keyCode);
                                console.log('keydown charCode', event.charCode);
                                break;
                            }
                        case 36: // $, G
                            drop(event);
                            trows = $('tr td.subtext');
                            if (main_nav.row >= 0) {
                                main_nav.ncunh(trows[main_nav.row]);
                            }
                            main_nav.row = trows.length - 1;
                            main_nav.nch(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 39: // Right, o, O, Enter
                        case 13:
                        case 79:
                        case 111:
                            drop(event);
                            trows = $('tr td.subtext');
                            var $elem = $(trows[main_nav.row]);
                            var $comment = $elem.parent();
                            var $story = $comment.prev();
                            story_href = $story.find('td.title a').first().attr('href');
                            if (story_href) {
                                openInTab(story_href);
                                if (ANIMATE) $story.fadeOut('slow').fadeIn('slow');
                            }
                            try {
                                comment_href = $elem.find('a[href*="item?id="]').first().attr('href');
                                if (comment_href) {
                                    // Don't open Ask HN twice
                                    if (comment_href != story_href)
                                        openInTab(comment_href);
                                    if (ANIMATE) $comment.fadeOut('slow').fadeIn('slow');
                                } else {
                                    throw "Comments link not found.";
                                }
                            } catch (ec) {
                                console.log(ec);
                            }
                            // Only center on open if essential
                            if (!elementCompletelyInViewport(trows[main_nav.row])) centerElementByScrolling(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 83: // s - story
                            drop(event);
                            trows = $('tr td.subtext');
                            $story = $(trows[main_nav.row]).parent().prev();
                            story_href = $story.find('td.title a').first().attr('href');
                            if (story_href) {
                                openInTab(story_href);
                                if (ANIMATE) $story.fadeOut('slow').fadeIn('slow');
                            }
                            // Only center on open if essential
                            if (!elementCompletelyInViewport(trows[main_nav.row])) centerElementByScrolling(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 67: // C, Left - comments
                            drop(event);
                            trows = $('tr td.subtext');
                            $elem = $(trows[main_nav.row]);
                            $comment = $elem.parent();
                            $story = $comment.prev();
                            try {
                                comment_href = $elem.find('a[href*="item?id="]').first().attr('href');
                                if (!comment_href) throw "Comments link not found.";

                                openInTab(comment_href);
                                if (ANIMATE) $comment.fadeOut('slow').fadeIn('slow');
                            } catch (ec) {
                                console.log(ec);
                            }
                            // Only center on open if essential
                            if (!elementCompletelyInViewport(trows[main_nav.row])) centerElementByScrolling(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 114: // r, R
                        case 82:
                            window.location.reload();
                            break;
                        case 110: // n, N
                        case 78:
                            drop(event);
                            trows = $('tr td.subtext');
                            if (main_nav.row >= 0) {
                                main_nav.ncunh(trows[main_nav.row]);
                            } else {
                                main_nav.row = 0;
                            }
                            var next_unread, l;
                            for (next_unread = main_nav.row + 1, l = trows.length; next_unread < l; next_unread++) {
                                if ($(trows[next_unread]).parent().prev().css('background-color') == 'rgb(221, 255, 221)' ||
                                    $(trows[next_unread]).find('a.highlight').length) {
                                    main_nav.row = next_unread;
                                    main_nav.nch(trows[main_nav.row]);
                                    shouldBubble = false;
                                    return shouldBubble;
                                }
                            }
                            main_nav.row = l - 1;
                            main_nav.nch(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 112: // p, P
                        case 80:
                            drop(event);
                            trows = $('tr td.subtext');
                            if (main_nav.row >= 0) {
                                main_nav.ncunh(trows[main_nav.row]);
                            } else {
                                main_nav.row = 0;
                            }
                            var prev_unread;
                            for (prev_unread = main_nav.row - 1; prev_unread >= 0; prev_unread--) {
                                if ($(trows[prev_unread]).parent().prev().css('background-color') == 'rgb(221, 255, 221)' ||
                                    $(trows[prev_unread]).find('a.highlight').length) {
                                    main_nav.row = prev_unread;
                                    main_nav.nch(trows[main_nav.row]);
                                    shouldBubble = false;
                                    return shouldBubble;
                                }
                            }
                            main_nav.row = 0;
                            main_nav.nch(trows[main_nav.row]);
                            shouldBubble = false;
                            return shouldBubble;
                        case 117: // u - Unfollow the story
                        case 85: // U
                            drop(event);
                            trows = $('tr td.subtext');
                            $elem = $(trows[main_nav.row]);
                            var story_id = $elem.find('span.age a:last-child')[0].href.replace(/.*item\?id=(\d+).*/, '$1');
                            if (story_id && story_id !== 0) {
                                $elem.parent().find('a').removeClass('highlight').end().find('a.unfollow').remove();
                                setTimeout(function() {
                                    var comments_cache = initCache('COMMENTS_CACHE');
                                    if (comments_cache[story_id]) {
                                        delete comments_cache[story_id];
                                        persistCache('COMMENTS_CACHE', comments_cache);
                                    }
                                    shouldBubble = false;
                                    return shouldBubble;
                                }, 0);
                            } else {
                                window.alert("Not a story");
                            }
                            shouldBubble = false;
                            return shouldBubble;
                        case 119: // Cmd+w
                            // Don't block browser function
                            shouldBubble = true;
                            return shouldBubble;
                        default:
                            console.log('keydown which', event.which);
                            console.log('keydown keyCode', event.keyCode);
                            console.log('keydown charCode', event.charCode);
                            break;
                    }
                    shouldBubble = true;
                    return shouldBubble;
                } catch (e) {
                    console.log("main_page_keydown_handler", e);
                }
            }
        };

        function addSearchField(doc) {
            if ((!doc || doc == document) && !document.getElementById('searcher')) {
                // Grab the top bar
                var selector = document.querySelector('td > table > tbody > tr');

                // Insert a new td between the submit link and the login link
                var cell = selector.insertCell(2);

                // Inject the search box html into the header
                cell.innerHTML = '<span id="searcher">' +
                    '  <form method="get" action="//hn.algolia.com/" style="margin:0;"><input style="height:20px;" type="text" name="q" value="" size="17" placeholder="Search"/>' +
                    '</span>';
            }
        }

        function highlightSites(doc) {
            try {
                doc = doc || document;
                var sights_re = new RegExp('^(' + config.sights.join("|") + ')$');
                $('span.sitestr', doc).each(function() {
                    var site = this.innerText;
                    var oldNode;
                    if (sights_re.test(site)) {
                        $(this).addClass('site-flair');
                        oldNode = $(this).closest('a').prev();
                        if (oldNode && oldNode.hasClass('unfollow')) {
                            oldNode[0].innerText = '-';
                        } else {
                            $(this.parentNode).before($('<a href="#" class="unfollow" title="Unfollow this site">-</a>').click(makeSiteUnFollowFunction(site))).before(' ');

                        }
                        this.highlighted = true;
                    } else {
                        $(this).removeClass('site-flair');
                        oldNode = $(this).closest('a').prev();
                        if (oldNode && oldNode.hasClass('unfollow')) {
                            oldNode[0].innerText = '+';
                        } else {
                            $(this.parentNode).before($('<a href="#" class="unfollow" title="Follow this site">+</a>').click(makeSiteUnFollowFunction(site))).before(' ');
                        }
                    }
                });
            } catch (ste) {
                console.log(ste);
            }
        }

        function betteridgeALink(link) {
            if (!link) return;
            if (/^(Do \S+ really) /.test(link.innerHTML)) {
                $(link).addClass('betteridge-yes');
            } else if (/^(Is|Are|Does|Do|Has|Have|Did|Will|Can|Could|Should.*\?$) /.test(link.innerHTML)) {
                $(link).addClass('betteridge-no');
            }
        }

        function doMainPage(doc) {
            try {
                doc = doc || document;
                addSearchField(doc);
                highlightSites(doc);

                var now = Date.now();
                var headlines_cache = initCache('HEADLINES_CACHE');
                var comments_cache = initCache('COMMENTS_CACHE');

                $('span.age a:last-child', doc).each(function() {
                    if (this.processed) return;
                    this.processed = true;
                    var story_id = this.href.replace(/.*item\?id=(\d+).*/, '$1');
                    if (!story_id) return;
                    var $first_row = $(this).closest('tr').first().prev();
                    var link = $first_row.find('.title a')[0];
                    betteridgeALink(link);
                    if (!headlines_cache[story_id]) {
                        $first_row.addClass('highlight');
                        headlines_cache[story_id] = {
                            'c': 0
                        };
                    } else {
                        var $comments_count = $(this).closest('td').find('a').last();
                        var text = $comments_count.text();
                        if (comments_cache[story_id]) {
                            $comments_count.addClass('highlight');
                            $comments_count.after($('<a href="#" class="unfollow" title="Unfollow this story">-</a>').click(makeStoryUnFollowFunction(story_id))).after(' ');
                        }
                        var count = text.replace(/[^0-9]/g, '');
                        if (headlines_cache[story_id].c != count && text != 'discuss' && text != 'comments') {
                            var diff = count - headlines_cache[story_id].c;
                            diff = " (" + (diff > 0 ? "+" : "") + diff + ")";
                            $comments_count.after(diff);
                            headlines_cache[story_id].c = count;
                        }
                    }
                    headlines_cache[story_id].t = now;
                });
                highlightFollowedUsers(doc);

                persistCache('HEADLINES_CACHE', headlines_cache);
            } catch (me) {
                console.log("doMainPage", me);
            }
        }

        function nonOutboundComments() {
            try {
                if (!isCommentsPage()) return;

                var button = document.getElementById('onlyCommentsWithLinksButton');
                if (button.value == 'Posts w/o links too (L)') {
                    button.value = 'Links posts only (L)';
                    $('.comment').each(function() {
                        if (isFlatCommentsPage()) {
                            $(this).closest('tr').show();
                        } else {
                            $(this).closest('table').closest('tr').show();
                        }
                    });
                } else {
                    button.value = 'Posts w/o links too (L)';
                    $('.comment').each(function() {
                        if (isFlatCommentsPage()) {
                            if ($(this).find('a[rel="nofollow"]').length === 0) $(this).closest('tr').hide();
                        } else {
                            if ($(this).find('a[rel="nofollow"]').length === 0) $(this).closest('table').closest('tr').hide();
                        }
                    });
                }
            } catch (cp) {
                console.log(cp);
            }
        }

        function newComments() {
            try {
                if (!isCommentsPage()) return;

                var button = document.getElementById('onlyNewCommentsButton');
                if (button.value == 'Seen posts too (N)') {
                    button.value = 'Unseen posts only (N)';
                    $('.comment').each(function() {
                        if (isFlatCommentsPage()) {
                            $(this).closest('tr').show();
                        } else {
                            $(this).closest('table').closest('tr').show();
                        }
                    });
                } else {
                    button.value = 'Seen posts too (N)';
                    document.newCommentsHidden = true;
                    $('.comment').each(function() {
                        if (isFlatCommentsPage()) {
                            if (!$(this).parent('td').hasClass('newcomment')) $(this).closest('tr').hide();
                        } else {
                            if (!$(this).parent('td').hasClass('newcomment')) $(this).closest('table').closest('tr').hide();
                        }
                    });
                }
            } catch (cp) {
                console.log(cp);
            }
        }

        function makeCommentsPageKeydownHandler(story_id) {
            return function(event) {
                try {
                    /* Don't use shortcuts in various text fields */
                    if ($("*:focus").is("input") || $("*:focus").is("textarea")) return true;
                    var code = event.which || event.keyCode;
                    switch (code) {
                        case 63: // ? - help
                        case 72: // H - help
                        case 104: // h - help
                            drop(event);
                            window.alert("h/? - Help\n\nl/L/t/T - Toggle Links only posts\n\n" +
                                "n/N - Toggle new only posts\n\n" +
                                "u/U - Unfollow this story\n\n" +
                                "r/R - Reload this page");
                            return false;
                        case 76: // L - links
                        case 108: // l
                        case 84: // T
                        case 116: // t
                            drop(event);
                            nonOutboundComments();
                            return false;
                        case 78: // N - new
                        case 110: // n
                            drop(event);
                            newComments();
                            return false;
                        case 114: // r - reload page
                        case 82: // R
                            window.location.reload();
                            break;
                        case 117: // u - Unfollow the story
                        case 85: // U
                            drop(event);
                            if (story_id !== 0) {
                                setTimeout(function() {
                                    var comments_cache = initCache('COMMENTS_CACHE');
                                    if (comments_cache[story_id]) {
                                        delete comments_cache[story_id];
                                        persistCache('COMMENTS_CACHE', comments_cache);
                                    }
                                    window.alert("Unfollowed");
                                    return false;
                                }, 0);
                            } else {
                                window.alert("Not a story");
                            }
                            return false;
                        case 119: // Cmd+w
                            // Don't block browser function
                            return true;
                        default:
                            console.log(code);
                            break;
                    }
                } catch (e) {
                    console.log("Comments page keydown handler", e);
                }
                return true;
            };
        }

        function doCommentsPage(doc) {
            try {
                doc = doc || document;
                addSearchField(doc);
                highlightSites(doc);
                // BUG: The insertion in autopager continued pages is weird. Each comment
                // seems to be counting for one page. The result is that parent navigation
                // does not work for continued pages. To make it work as it is now, the
                // parentstack mechanism would need to be persisted (in the page?).
                //
                // An alternate is to rescan from the top everytime. WE ARE CURRENTLY USING
                // THIS.
                if (!document.getElementById('hover_container')) {
                    $('body').append('<div id="hover_container" style="position:absolute;left:0px;top:0px;display:none;width:100px;height:100px;border-radius:10px;z-index:100;background: rgba(240,240,240,0.95);color:white !important;border: 1px solid #ccc;box-shadow:3px 3px 5px rgba(0,0,0,0.3);padding:10px 10px 20px 10px;"></div>');
                }
                var comments_cache = initCache('COMMENTS_CACHE');
                var $hover_container = $('#hover_container');

                var x;
                var oldlevel = -1;
                var parentstack = ['comment_none'];
                var story_id = window.location.href.replace(/^.*item\?id=(\d+).*$/, '$1');
                if (!/^\d+$/.test(story_id)) {
                    // Not a story but other comments like page like somebody's comments history
                    story_id = 0;
                }
                if (story_id) {
                    var link = $('tr.athing td.title a')[0];
                    betteridgeALink(link);
                    if (!comments_cache[story_id]) {
                        comments_cache[story_id] = {};
                        comments_cache[story_id].c = {};
                    }
                    comments_cache[story_id].t = Date.now();
                    if (!document.getElementById(story_id + '_unfollow') && !/threads\?id=/.test(document.location.href)) {
                        $('td.title', doc).append(' ').append($('<a href="#" id="' + story_id + '_unfollow" title="Unfollow this story">-</a>').click(makeStoryUnFollowFunction(story_id)).css('color', HN_LIGHT_ORANGE));
                    }
                }

                var debug_levels = false;
                var repeated;

                $("td.default", doc).each(function(idx, elem) {
                    // The following can be reduced like so using jQuery
                    // .closest("table").closest("tr")
                    // .not(".level_0")
                    var hn_comment_id;
                    try {
                        // hn_comment_id = $(this).find('span.comhead a').last().attr('href').replace(/^.*item\?id=(\d+).*/, '$1');
                        hn_comment_id = $(this).find('a').filter(function() {
                            return /item\?id=/.test(this.href);
                        }).first().attr('href').replace(/^.*item\?id=(\d+).*/, '$1');
                    } catch (e) {
                        console.log("Could not determine comment id. Probably a deleted comment.");
                    }
                    if (!hn_comment_id) {
                        try {
                            // hn_comment_id = $(this).find('span.comhead a').last().attr('href').replace(/^.*item\?id=(\d+).*/, '$1');
                            hn_comment_id = $(this).find('a').filter(function() {
                                return /reply\?id=/.test(this.href);
                            }).last().attr('href').replace(/^.*reply\?id=(\d+).*/, '$1');
                        } catch (e) {
                            console.log("Could not determine comment id. Probably a deleted comment.");
                        }
                    }
                    if (debug_levels) console.log("comment_id", hn_comment_id);
                    if (!(/^[0-9]+$/).test(hn_comment_id)) {
                        console.log("Could not determine good comment id");
                        return;
                    }
                    if (story_id && !comments_cache[story_id].c[hn_comment_id]) {
                        $(this).addClass('newcomment');
                        comments_cache[story_id].c[hn_comment_id] = 1;
                    }
                    var new_id = 'comment_' + hn_comment_id;
                    // Is it already processed in a previous pass? If yes then we only let
                    // the stack level calculation code work and not create any links etc.
                    repeated = document.getElementById(new_id);
                    $(this).attr('id', new_id);
                    var level;
                    try {
                        level = $(this.previousElementSibling.previousElementSibling.firstChild).attr('width') / 40;
                        if (level > oldlevel) {
                            if (debug_levels) console.log(oldlevel, "v", level);
                            if (level && !repeated) {
                                makeParentLink(this, parentstack[level], $hover_container);
                            }
                            for (x = oldlevel; x < level; x++) {
                                parentstack.push(new_id);
                            }
                        } else if (level < oldlevel) {
                            if (debug_levels) console.log(oldlevel, "^", level);
                            for (x = level; x <= oldlevel; x++) {
                                parentstack.pop();
                            }
                            parentstack.push(new_id);
                            if (level && !repeated) {
                                makeParentLink(this, parentstack[level], $hover_container);
                            }
                        } else {
                            if (debug_levels) console.log("=", level);
                            parentstack.pop();
                            parentstack.push(new_id);
                            if (level && !repeated) {
                                makeParentLink(this, parentstack[level], $hover_container);
                            }
                        }
                        if (debug_levels) console.log("Stack at", hn_comment_id, "=", parentstack);
                        oldlevel = level;
                    } catch (nolevel) {
                        // e.g. /bestcomments has no threading. it is just individual comments
                    }
                });

                // Distinguish OP comments
                try {
                    var op = $('table .subtext', doc).find('a').eq(0).text();
                    // https://news.ycombinator.com/threads?id=<user>
                    if ((!op || op === '') && /threads.id=([a-zA-Z0-9_]+)/.test(window.location.href)) {
                        op = RegExp.$1;
                    }

                    $('.comhead a').filter(function() {
                        return $(this).html() == op;
                    }, doc).closest('td').addClass('op');
                } catch (e) {
                    console.log("Couldn't do the op color change thing", e);
                }
                highlightFollowedUsers(doc);
                persistCache('COMMENTS_CACHE', comments_cache);
                if (!document.getElementById('onlyCommentsWithLinksButton')) {
                    var $insert_where;
                    if (isFlatCommentsPage()) {
                        $insert_where = $('.comment:first').closest('table');
                    } else {
                        $insert_where = $('.comment:first').closest('table').closest('tbody').closest('table');
                    }
                    $insert_where.before($("<center>" +
                        "<input type='button' id='onlyCommentsWithLinksButton' value='Links posts only (L)' alt='Press L' title='Press L'/>" +
                        "<input type='button' id='onlyNewCommentsButton' value='Unseen posts only (N)'  alt='Press N' title='Press N'/>" +
                        "</center>"));
                    addEventHandler(document.getElementById("onlyCommentsWithLinksButton"), "click", nonOutboundComments);
                    addEventHandler(document.getElementById("onlyNewCommentsButton"), "click", newComments);

                    // keypress doesn't get arrow etc., must use keydown
                    $(document).keydown(makeCommentsPageKeydownHandler(story_id));
                }
            } catch (cp) {
                console.log(cp);
            }
        }

        function doLeadersPage(doc) {
            doc = doc || document;
            try {
                var follow_re = new RegExp('^(' + config.nobles.join("|") + ')$');
                $('center > table > tbody > tr:nth-child(3) > td > table > tbody tr td:nth-child(2) a', doc).each(function() {
                    try {
                        makeFollowUserLink(follow_re, this);
                    } catch (e1) {
                        console.log("Inner", e1);
                    }
                });
            } catch (e) {
                console.log(e);
            }
        }

        function doProfilePage(doc) {
            doc = doc || document;
            try {
                var follow_re = new RegExp('^(' + config.nobles.join("|") + ')$');
                var u_node = $('center > table > tbody > tr:nth-child(3) > td table > tbody tr td:nth-child(2)', doc)[0];
                // wrap in a dummy span to help makeFollowUserLink which appends
                u_node.innerHTML = '<span>' + u_node.innerHTML + '</span>';
                makeFollowUserLink(follow_re, u_node.firstChild);
            } catch (e) {
                console.log(e);
            }
        }

        function doOneTime() {
            try {
                if (document.done_one_time) return;
                document.done_one_time = true;

                $('span.pagetop font', document).attr('color', 'black');

                doLogo();
                infinite_scroll();
                main_nav.init();

                addStyle(
                    "body {\n" +
                    "    text-rendering: optimizeLegibility;\n" +
                    "}\n" +
                    "body, table {\n" +
                    "    background-color: #fcfcfc;\n" +
                    "    font-family: " + FONT_FAMILY + " !important;\n" +
                    "    font-size: 10pt;\n" +
                    "    line-height: 1.5;\n" +
                    "}\n" +
                    "pre, code {\n" +
                    "    font-family: Menlo, Monaco, \"Bitstream Vera Sans Mono\", \"Lucida Console\", Consolas, Terminal, \"Courier New\", Courier, monospace;\n" +
                    "    background-color: rgba(0, 0, 0, 0.02);\n" +
                    "}\n" +
                    "table {\n" +
                    "    width: 100%;\n" +
                    "}\n" +
                    ".comhead, .comment, .subtext, a:link, a:hover, a:visited, input {\n" +
                    "    font-family: " + FONT_FAMILY + " !important;\n" +
                    "    font-size: 10pt;\n" +
                    "    line-height: 1.5;\n" +
                    "}\n" +
                    "a:link, .comment a:link, a:hover, .comment a:hover, a:visited, .comment a:visited {\n" +
                    "    color: black;\n" +
                    "    text-decoration: none;\n" +
                    "}\n" +
                    ".title > .comhead, .title > a:link, .title > a:hover, .title > a:visited {\n" +
                    "    font-family: " + FONT_FAMILY + " !important;\n" +
                    "    font-size: 10pt;\n" +
                    "    color: rgb(10, 10, 10);\n" +
                    "}\n" +
                    ".site-highlight, a.site-highlight:link, a.site-highlight:hover,  a.site-highlight:visited {\n" +
                    "    background-color: " + HN_LIGHT_ORANGE + ";\n" +
                    "    color: black;\n" +
                    "}\n" +
                    ".highlight, a.highlight:link, a.highlight:hover,  a.highlight:visited {\n" +
                    "    background-color: " + HIGHLIGHT_COLOR + ";\n" +
                    "}\n" +
                    "a.highlight:link, a.highlight:hover,  a.highlight:visited {\n" +
                    "    text-decoration: none;\n" +
                    "}\n" +
                    "a.site-highlight:link, a.site-highlight:hover,  a.site-highlight:visited,\n" +
                    "a.follow:link, a.follow:hover,  a.follow:visited,\n" +
                    "a.unfollow:link, a.unfollow:hover,  a.unfollow:visited {\n" +
                    "    color: " + HN_LIGHT_ORANGE + ";\n" +
                    "    text-decoration: none;\n" +
                    "}\n" +
                    "td.default {\n" +
                    "    background-color: #f9f9f9;\n" +
                    "    padding: 7px;\n" +
                    "    border-radius: 7px;\n" +
                    "    border: 1px solid #f0f0f0;\n" +
                    "    width: 100%;\n" +
                    "}\n" +
                    "td.default i {\n" +
                    "    background-color: #e9e9e9;\n" +
                    "}\n" +
                    "td.op {\n" +
                    "    border-color: " + HN_LIGHT_ORANGE + ";\n" +
                    "}\n" +
                    "td.default.newcomment {\n" +
                    "    background-color: " + HIGHLIGHT_COLOR + ";\n" +
                    "}\n" +
                    "a.user_follow {\n" +
                    "    color: " + HN_DARK_ORANGE + ";\n" +
                    "    padding: 0px 3px 0px 3px;\n" +
                    "    border-radius: 3px;\n" +
                    "}\n" +
                    ".comment a[rel=\"nofollow\"] {\n" +
                    "    color: " + HN_DARK_ORANGE + ";\n" +
                    "}\n" +
                    "a.togg:hover, a.user_follow:hover, .comment a[rel=\"nofollow\"]:hover {\n" +
                    "    border-radius: 3px;\n" +
                    "    background-color: " + HN_DARK_ORANGE + ";\n" +
                    "    color: white;\n" +
                    "    text-decoration: none;\n" +
                    "}\n" +
                    ".flair, .site-flair {\n" +
                    "    font-size: xx-small;\n" +
                    "    display: inline-block;\n" +
                    "    color: " + HN_LIGHT_ORANGE + ";\n" +
                    "    background-color: #fefefe;\n" +
                    "    margin: 0px 5px -5px 5px;\n" +
                    "    max-width: 10em;\n" +
                    "    overflow: hidden;\n" +
                    "    text-overflow: ellipsis;\n" +
                    "    white-space: nowrap;\n" +
                    "    border: 1px dotted " + HN_DARK_ORANGE + ";\n" +
                    "    border-radius: 3px;\n" +
                    "    padding: 1px 3px 1px 3px;\n" +
                    "}\n" +
                    ".topsel a:link, .topsel a:visited {\n" +
                    "    background-color: " + HN_LIGHT_ORANGE + ";\n" +
                    "}\n" +
                    "/* Provide a way to read downvoted text by hovering on it */\n" +
                    "span.comment font:hover, span.dead:hover {\n" +
                    "    color: black;\n" +
                    "}\n" +
                    ".togg {\n" +
                    "    float: left;\n" +
                    "    margin-right: 5px;\n" +
                    "}\n" +
                    ".votearrow {\n" +
                    "    margin-bottom: 10px;\n" +
                    "}\n" +
                    "a.betteridge-no:after {\n" +
                    "    color: #600;\n" +
                    "    font-size: 50%;\n" +
                    "    text-transform: uppercase;\n" +
                    "    letter-spacing: 1px;\n" +
                    "    background-color: #fff;\n" +
                    "    content: ' Probably not ';\n" +
                    " }\n" +
                    "a.betteridge-yes:after {\n" +
                    "    color: #600;\n" +
                    "    font-size: 50%;\n" +
                    "    text-transform: uppercase;\n" +
                    "    letter-spacing: 1px;\n" +
                    "    background-color: #fff;\n" +
                    "    content: ' Probably ';\n" +
                    " }\n" +
                    ".container {\n" +
                    "   margin: 0 auto;\n" +
                    "   display: inline-block;\n" +
                    "}\n" +
                    "nav {\n" +
                    " display: inline-block;\n" +
                    "   word-wrap:break-word !important;\n" +
                    "}\n" +
                    "nav ul {\n" +
                    "   padding: 0;\n" +
                    "   margin: 0;\n" +
                    "   list-style: none;\n" +
                    "   position: relative;\n" +
                    "}\n" +
                    "nav ul li {\n" +
                    "   display: inline-block;\n" +
                    "   background-color: yellow;\n" +
                    "}\n" +
                    "nav a {\n" +
                    "   display: block;\n" +
                    "   padding: 0 10px; \n" +
                    "   color: #FFF;\n" +
                    "   text-decoration:none;\n" +
                    "}\n" +
                    "/* Hide Dropdowns by Default */\n" +
                    "nav ul ul {\n" +
                    "   display: none;\n" +
                    "   position: absolute; \n" +
                    //"   top: 60px; /* the height of the main nav */\n" +
                    "}\n" +
                    "/* Display Dropdowns on Hover */\n" +
                    "nav ul li:hover > ul {\n" +
                    "   display:inherit;\n" +
                    "}\n" +
                    "/* Fisrt Tier Dropdown */\n" +
                    "nav ul ul li {\n" +
                    "   width: 270px;\n" +
                    "   float: none;\n" +
                    "   display: list-item;\n" +
                    "   position: relative;\n" +
                    "}\n" +
                    "/* Second, Third and more Tiers    */\n" +
                    "nav ul ul ul li {\n" +
                    "   position: relative;\n" +
                    "   top:-60px; \n" +
                    "   left: 270px;\n" +
                    "}\n" +
                    "/* Change this in order to change the Dropdown symbol */\n" +
                    "li > a:after { content:  ''}\n" +
                    "li > a:only-child:after { content: ''; }\n"
                );
                $('table table').attr('cellpadding', '5');
                $('img[width=18][height=18]').hide();
                if (document.getElementById("morelinks_menu")) return;
                $morelinks.init();
            } catch (e) {
                console.log(e);
            }
        }

        function isMainPage() {
            var url = window.location.href;

            return (
                /^https?:\/\/(news\.ycombinator\.com|hackerne\.ws)(#|$|\/?$|\?$)/.test(url) ||
                /^https?:\/\/(news\.ycombinator\.com|hackerne\.ws)\/(active|ask|best|classic|from|newest|hidden|news\d*|over|show|shownew|x)(#|$|\/|\?)/.test(url) ||
                /^https?:\/\/(news\.ycombinator\.com|hackerne\.ws)\/submitted\?id=.+/.test(url)
            );
        }

        function isPaginatedPage() {
            return (isMainPage() || /(ycombinator\.com|hackerne\.ws)\/((best|new)comments|threads)/.test(window.location.href));
        }

        function isCommentsPage() {
            return /(ycombinator\.com|hackerne\.ws)\/(item|threads|(best|new)comments)/.test(
                window.location.href);
        }

        function isFlatCommentsPage() {
            return /\b(new|best)comments\b/.test(document.location.href);
        }

        function isLeadersPage() {
            return /^https?:\/\/(news\.ycombinator\.com|hackerne\.ws)\/leaders(\/|\?|#|$)/.test(
                window.location.href);
        }

        function isProfilePage() {
            return /^https?:\/\/(news\.ycombinator\.com|hackerne\.ws)\/user\?id=.+(\/|\?|#|$)/.test(
                window.location.href);
        }

        function appendKarma(userName, karma) {
            if (!document) return;
            var userNameLinks = document.querySelectorAll('a[href="user?id=' + userName + '"]');
            for (var i = 0; i < userNameLinks.length; i++) {
                if (!userNameLinks[i].getAttribute('karma')) {
                    userNameLinks[i].insertAdjacentHTML('afterend', ' (' + karma + ')');
                    userNameLinks[i].setAttribute('karma', karma);
                }
            }
        }

        function getKarma(userName) {
            xhr('https://hacker-news.firebaseio.com/v0/user/' + userName + '/karma.json', function(karma) {
                appendKarma(userName, karma.responseText);
            });
        }

        function revealKarma() {
            if (!document) return;
            var loggedUserName = document.getElementsByClassName('pagetop')[1].querySelectorAll('a')[0].href.split('=')[1],
                userNameLinks = document.querySelectorAll('a[href^="user?id="]'),
                done = [];
            for (var i = 0; i < userNameLinks.length; i++) {
                var userName = userNameLinks[i].href.split('=')[1];
                if (userName !== loggedUserName && done.indexOf(userName) === -1) {
                    done.push(userName);
                    getKarma(userName);
                }
            }
        }

        function work(doc) {
            try {
                doc = doc || document;
                newTabifyLinks(doc);

                if (isMainPage()) {
                    doMainPage(doc);
                } else if (isCommentsPage()) {
                    doCommentsPage(doc); // no doc here since we scan every time
                    $('table:first', doc).width('100%');
                } else if (isLeadersPage()) {
                    doLeadersPage(doc);
                } else if (isProfilePage()) {
                    doProfilePage(doc);
                } else {
                    console.log("Unrecognized hackernews page type");
                }
                revealKarma();
            } catch (e) {
                console.log(e);
            }
        }

        function page_insert_event_handler(e) {
            work(e.target);
        }

        // NOTE: User AutoPagerize instead of AutoPager. Users underscoreEventHandler
        window.addEventListener("AutoPatchWork.DOMNodeInserted", page_insert_event_handler, false);
        window.addEventListener("AutoPagerize_DOMNodeInserted", page_insert_event_handler, false);
        window.addEventListener("AutoPagerAfterInsert", page_insert_event_handler, false);
        doOneTime();
        work();
    })();
    // vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=2 ts=2 tw=79 nowrap :
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("hackernews.user.js ended");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=0 nowrap :
