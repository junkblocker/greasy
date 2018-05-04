// ==UserScript==
// @id             reddit
// @name           Reddit Improvements
// @version        1.2
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Miscellaneous Reddit Improvements
// @include        *://*.reddit.tld/*
// @include        *://pay.reddit.tld/
// @include        *://pay.reddit.tld/*
// @include        *://reddit.tld/*
// @require        http://code.jquery.com/jquery-1.11.2.js
// @grant          GM_log
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_listValues
// @grant          GM_addStyle
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @run-at         document-end
// ==/UserScript==

try {
    console.log("reddit.user.js starting");
} catch (safe_wrap_top) {}
try {

    // Copyright (c) 2006-2014, Manpreet Singh <junkblocker@yahoo.com>
    // Based on a bunch of scripts
    (function() {
        if (window.location.host == 'www.reddit.com') {
            var url = window.location.href.replace(/www\.reddit\.com/, 'old.reddit.com');
            window.location.replace(url);
            return;
        }

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

        document.title = document.title.replace(/ curated by \/u\/.*/, '');
        // grab jQuery
        //$ = navigator.appVersion.search("Safari") != -1 && typeof jQuery !== 'undefined' ? jQuery : unsafeWindow.jQuery;
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

        (function($) {
            $.fn.meh = function() {
                // Do your awesome plugin stuff here
                return this.each(function() {
                    $(this).css('color', '#cccccc');
                });
            };
            $.fn.ncolor = function() {
                // Do your awesome plugin stuff here
                return this.each(function() {
                    $(this).css('color', '#339933');
                });
            };
        })($);

        var drop = typeof drop !== 'undefined' ? drop : function(e) {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (ex) {
                console.log("drop", ex);
            }
        };

        function inArray(a, elem) {
            for (var i = 0, l = a.length; i < l; i++) {
                if (a[i] == elem) {
                    return true;
                }
            }
            return false;
        }

        function addUnique(a, elem) {
            if (!inArray(a, elem)) {
                a.push(elem);
            }
            return a;
        }

        function scrollToElement(theElement) {
            var selectedPosX = 0;
            var selectedPosY = 0;

            while (theElement !== null) {
                selectedPosX += theElement.offsetLeft;
                selectedPosY += theElement.offsetTop;
                theElement = theElement.offsetParent;
            }

            window.scrollTo(selectedPosX, selectedPosY);
        }

        // *************************
        // mouseClick(element)
        // *************************
        function mouseClick(elem, button) {
            button = button || 0;
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null);
            elem.dispatchEvent(ev);
        }

        var isGM = (typeof GM_getValue != 'undefined' && typeof GM_getValue('a', 'b') != 'undefined');

        var registerMenuCommand;
        if (typeof GM_registerMenuCommand !== 'undefined') {
            registerMenuCommand = GM_registerMenuCommand;
        } else {
            registerMenuCommand = function() {};
        }

        // *************************
        // Typed storage variables
        //
        // Usage: reg(varname, default_value, [array_of_valid_values])
        //        getValue(varname, default_value)
        //        setValue(varname, default_value)
        //        deleteValue(varname)
        //        listValues()
        //
        // Examples:
        //
        //    reg('Count', 0);
        //    reg('Style', 0, [0, 1]);
        //    reg('cache', {});
        //    reg('Valid?', true);
        //    reg('FrameState', 'expanded', ['expanded', 'collapsed']);
        // *************************
        var _REG_IGNORE = false;
        var _REG = {};

        var getValue = typeof getValue !== 'undefined' ? getValue : function(name, defaultValue) {
            if (!_REG_IGNORE && typeof _REG[name] == 'undefined') {
                throw 'ERROR: ' + name + ' accessed before registering.';
            }
            var typev = isGM ? GM_getValue(name) : localStorage.getItem(name);
            if (!typev || typev === '') {
                if (_REG_IGNORE || _REG[name](defaultValue)) {
                    return defaultValue;
                } else {
                    throw "ERROR: Invalid default value " + defaultValue + " passed for " + name;
                }
            }

            var tprefix = typev[0];
            var tvalue = typev.substring(1);
            switch (tprefix) {
                case 'b':
                    value = (tvalue == 'true');
                    break;
                case 'n':
                    value = Number(tvalue);
                    break;
                case 'o':
                    try {
                        value = JSON.parse(tvalue);
                    } catch (e) {
                        console.log('ERROR: getValue(', name, ', ', defaultValue, ') could not parse stored value', tvalue, e);
                        console.log('Returning default value');
                        value = defaultValue;
                    }
                    break;
                default:
                    value = defaultValue;
                    break;
            }
            if (!_REG_IGNORE && !_REG[name](value)) {
                if (_REG[name](defaultValue)) {
                    throw typeof value + "ERROR: Could not fix invalid saved value '" + value + "' for '" + name + "' with invalid default '" + defaultValue + "'";
                } else {
                    console.log("WARNING: Fixing", name, "to default because of wrong previous type");
                    setValue(name, defaultValue);
                    value = defaultValue;
                }
            }
            return value;
        };

        var setValue = typeof setValue !== 'undefined' ? setValue : function(name, value) {
            if (!_REG_IGNORE) {
                if (typeof _REG[name] == 'undefined') {
                    throw 'ERROR:' + name + ' being assigned value ' + value + ' before registering';
                } else if (!_REG[name](value)) {
                    throw 'ERROR: setValue(' + name + ', ' + value + ') is wrong type';
                }
            }
            var type = (typeof value)[0];
            if (type == 'o') {
                value = type + JSON.stringify(value);
            } else {
                value = type + value;
            }
            if (isGM) {
                GM_setValue(name, value);
            } else {
                localStorage.setItem(name, value);
            }
        };

        var deleteValue = isGM ? GM_deleteValue : function(name) {
            localStorage.removeItem(name);
        };

        var listValues = isGM ? GM_listValues : function() {
            var ret = [];
            for (var i = 0; i < localStorage.length; i++) {
                ret.push(localStorage.key(i));
            }
            return ret;
        };

        var reg = typeof reg !== 'undefined' ? reg : function(name, type_defaults, ok_p) {
            //console.log('DEBUG: reg(', name, ',', type_defaults, ',', ok_p, ')');
            if (typeof name == 'undefined' || typeof type_defaults == 'undefined') {
                throw 'ERROR: reg(...) - Needs at least name and type_defaults arguments';
            }
            if (typeof _REG[name] != 'undefined') {
                throw 'ERROR: reg(' + name + ') - Already registered';
            }
            if (typeof ok_p != 'undefined' && !((typeof ok_p == 'object' && typeof ok_p.unshift != 'undefined') || typeof ok_p != 'function')) {
                throw 'ERROR: reg(' + name + ') - Invalid ok_p type. Must be an array or function.';
            }
            _REG_IGNORE = true;
            var oldval = getValue(name);
            _REG_IGNORE = false;
            var ret;
            if (typeof oldval == 'undefined') {
                _REG_IGNORE = true;
                setValue(name, type_defaults);
                oldval = type_defaults;
                _REG_IGNORE = false;
            }
            if (typeof ok_p == 'function') {
                _REG[name] = ok_p;
            } else if (typeof ok_p == 'undefined') {
                _REG[name] = function(v) {
                    //console.log("DEBUG: Checking that value", v, "of", name, "is of type", typeof type_defaults);
                    return typeof v == typeof type_defaults;
                };
            } else if (typeof ok_p == 'object' && typeof ok_p.unshift != 'undefined') {
                _REG[name] = function(v) {
                    return inArray(ok_p, v);
                };
            } else {
                throw "ERROR: Could not define the ok_p for " + name;
            }
            return oldval;
        };

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

        function makeMenuToggle(key, defaultBoolValue, toggleToTrueText, toggleToFalseText, optionalMenuPrefix) {
            // Load current value into variable
            window[key] = getValue(key, defaultBoolValue);
            // Add menu toggle
            registerMenuCommand((optionalMenuPrefix ? optionalMenuPrefix + ": " : "") + (window[key] ? toggleToFalseText : toggleToTrueText), function() {
                setValue(key, !window[key]);
                location.reload();
            });
        }

        // *************************
        // toggleFullScreen(id_or_element)
        //
        // Toggle the specified id or element to full screen mode using HTML5 full
        // screen api
        // *************************
        var pfx = ["webkit", "moz", "ms", "o", ""];

        /**
         * Run a method prefix with browser specific prefix
         */
        function RunPrefixMethod(obj, method) {
            var p = 0,
                m, t;
            while (p < pfx.length && !obj[m]) {
                m = method;
                if (pfx[p] === "") {
                    m = m.substr(0, 1).toLowerCase() + m.substr(1);
                }
                m = pfx[p] + m;
                t = typeof obj[m];
                if (t != "undefined") {
                    pfx = [pfx[p]];
                    return (t == "function" ? obj[m]() : obj[m]);
                }
                p++;
            }
            return false;
        }

        /**
         * Is element in fullscreen mode?
         */
        function isFullScreen() {
            return !!(RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen"));
        }

        function cancelFullScreen() {
            RunPrefixMethod(document, "CancelFullScreen");
        }

        function fullScreen(id_or_element, doc) {
            doc = doc || document;
            if (!id_or_element) {
                console.log("toggleFullScreen: An ID or element must be passed");
                return;
            }
            if (typeof id_or_element == typeof "") {
                id_or_element = document.getElementById(id_or_element);
                if (!id_or_element) {
                    console.log("toggleFullScreen: Could not find the specified id_or_element");
                    return;
                }
            }

            RunPrefixMethod(id_or_element, "RequestFullScreen");
        }

        function toggleFullScreen(id_or_element, doc) {
            doc = doc || document;
            if (!id_or_element) {
                console.log("toggleFullScreen: An ID or element must be passed");
                return;
            }
            if (typeof id_or_element == typeof "") {
                id_or_element = document.getElementById(id_or_element);
                if (!id_or_element) {
                    console.log("toggleFullScreen: Could not find the specified id_or_element");
                    return;
                }
            }

            if (isFullScreen()) {
                cancelFullScreen();
            } else {
                RunPrefixMethod(id_or_element, "RequestFullScreen");
            }
        }

        var images_ok = reg('Expand images', true);
        if (/[#?]image/.test(document.location.href)) {
            images_ok = true;
        } else if ((/[#?;&](no|block)[_-]?image/i).test(document.location.href)) {
            images_ok = false;
        }
        setValue('Expand images', images_ok);
        makeMenuToggle('Expand images', true, 'Turn ON images inlining', 'Turn OFF images inlining');
        var nsfw_ok = reg('Expand NSFW images', false);
        makeMenuToggle('Expand NSFW images', false, 'Turn ON NSFW images inlining', 'Turn OFF NFSW images inlining');
        var nsfl_ok = reg('Expand NSFL images', false);
        makeMenuToggle('Expand NSFL images', false, 'Turn ON NSFL images inlining', 'Turn OFF NFSL images inlining');
        var spoiler_ok = reg('Expand spoiler images', false);
        makeMenuToggle('Expand spoiler images', false, 'Turn ON spoiler images inlining', 'Turn OFF spoiler images inlining');
        var hide_nsfw = reg('Show NSFW articles', false);
        makeMenuToggle('Show NSFW articles', false, 'Hide NSFW articles', 'Show NSFW articles');
        var filter_ok = reg('All filtering', true);
        makeMenuToggle('All filtering', true, 'Turn ON filtering', 'Turn OFF filtering');

        var ban_subreddits_default = [
            't:.*', // Happened on April 1, 2012
        ];
        var ban_domains_default = [];
        var meh_subjects_default = [];
        var meh_subreddits_default = [];
        var meh_domains_default = [];
        var cool_domains_default = [
            'drive.google.com',
            'docs.google.com',
            'lh3.googleusercontent.com',
        ];
        var cool_subreddits_default = [
            'BestOfStreamingVideo',
            'BSD',
            'budgetfood',
            'computerforensics',
            'darknetplan',
            'deals',
            'golang',
            'minimeals',
            'netsec',
            'readablecode',
            'ReverseEngineering',
            'sysor',
            'vim',
            'xss',
        ];
        var ban_users_default = [
            'AbsurdWebLingo', // liar and an asshole
            'jaelholroyd', // Westboro
            'orthag',
            'sdvaletone', // liar, asshole, jerk, troll
            'sepetoner', // liar
            'suspicious666', // liar
            'Trapped_in_Reddit', // old comments poster bot
        ];
        reg('ban_subreddits', ban_subreddits_default);
        reg('ban_domains', ban_domains_default);
        reg('meh_subjects', meh_subjects_default);
        reg('meh_subreddits', meh_subreddits_default);
        reg('meh_domains', meh_domains_default);
        reg('cool_subreddits', cool_subreddits_default);
        reg('cool_domains', cool_domains_default);
        reg('ban_users', ban_users_default);

        function resetSettings() {
            setValue('ban_subreddits', ban_subreddits_default);
            setValue('ban_domains', ban_domains_default);
            setValue('meh_subjects', meh_subjects_default);
            setValue('meh_subreddits', meh_subreddits_default);
            setValue('meh_domains', meh_domains_default);
            setValue('cool_subreddits', cool_subreddits_default);
            setValue('cool_domains', cool_domains_default);
            setValue('ban_users', ban_users_default);
        }

        var ban_subreddits_re, meh_subreddits_re, ban_domains_re, meh_domains_re, cool_domains_re, cool_subreddits_re, ban_users_re, male_re, female_re, highlight_title_re, spoiler_re, nsfl_re;

        function makeREs() {
            ban_subreddits_re = new RegExp('^(' + getValue('ban_subreddits', ban_subreddits_default).join('|') + ')$');
            meh_subreddits_re = new RegExp('^(' + getValue('meh_subreddits', meh_subreddits_default).join('|') + ')$');
            ban_domains_re = new RegExp('^(' + getValue('ban_domains', ban_domains_default).join('|') + ')$');
            meh_domains_re = new RegExp('^(' + getValue('meh_domains', meh_domains_default).join('|') + ')$');
            cool_subreddits_re = new RegExp('^(' + getValue('cool_subreddits', cool_subreddits_default).join('|') + ')$');
            cool_domains_re = new RegExp('^(' + getValue('cool_domains', cool_domains_default).join('|') + ')$');
            ban_users_re = new RegExp('^(' + getValue('ban_users', ban_users_default).join('|') + ')$');
            male_re = /[(<\[{]\s*m(ale)?\s*[}\]>)]|cock(?!-?(up|ed))/i;
            female_re = /[(<\[{]\s*f(emale)?\s*[}\]>)]/i;
            highlight_title_re = /\bfree(?!d\b|dom|lance|mason|ze|nas|-?trade|\s+(time|of|speech))\b|for\s+\$?\d+\s(cent|doll)|zero[^a-z]*day|(exploit|vulnerabilit)|download(?!ed|ing)|giv.*away|available|\boffer|\bsale(?!sforce|sman)|\$|discount|promo|deal(?!er|ing|\s*(breaker|with))|for\s+(the\s+)?price\s+of|(cent|ollars?|half|\d|%)\s+off|cisco/i;
            spoiler_re = /s+p+o+i+l+e+r+/i;
            nsfl_re = /n+s+f+l/i;
        }

        //resetSettings();
        makeREs();

        registerMenuCommand("Reset reddit settings to default", function() {
            resetSettings();
            makeREs();
        });

        reg('SLAPPED', 0);
        var ignore_re = reg('IGNORE_REGEXP', '');
        if (ignore_re && ignore_re !== '') {
            ignore_re = new RegExp(ignore_re, 'i');
        } else {
            ignore_re = undefined;
        }

        /**
         * Prompt for and set a subject ignore regexp
         */
        function ignoreRegexp() {
            var reg = prompt("Ignore subject matching regexp (automatic case insensitive):", getValue('IGNORE_REGEXP', ''));
            setValue('IGNORE_REGEXP', reg);
        }

        registerMenuCommand("Ignore subject matching regexp", ignoreRegexp, null, null, "S");

        var imgur_re = /imgur\.com\/([a-z0-9]+)($|#|\?)/i;
        var imgur_re_1 = /^https?:\/\/(i\.)?imgur\.com\/(a|gallery)\/.+/i;
        var imgur_re_2 = /^https?:\/\/(i\.)?imgur\.com\/(.{5,7}(.png|.jpg|gifv?|svg))/i;
        var memegen_re = /memegenerator\.net\/instance\/([0-9]+)/i;
        var youtube_re = /(youtube\.com.+?v[=\/]|youtu\.be\/)([a-z0-9_-]+)/i;
        var qkmeme_re = /(qkme\.me|quickmeme\.com\/meme)\/([a-z0-9]+)/i;
        var pics_for_all_re = /(pic4all\.eu\/|^)(images\/|view\.php\?filename=)(.+)/i;
        var gfycat_re = /^(https?:\/\/)(gfycat\.com\/.+(?!\.gifv?))(?:$|#|\?)/i;
        var image_re = /imgur\.com\/(?!a\/)|\.(jpeg|jpg|png|gifv?|svg)(\?|$)|pics\.livejournal\.com\/[^\/]+\/pic\//i;

        function getImageURL(url) {
            /*jsl:ignore*/
            if (imgur_re_1.test(url)) {
                return "https://i.imgur.com" + url.replace(/[?#].*$/, '').substr(url.lastIndexOf("/"), 6) + ".jpg";
            } else if (match = imgur_re_2.exec(url)) {
                return "https://i.imgur.com/" + match[2];
            } else if (match = imgur_re.exec(url)) {
                return 'https://i.imgur.com/' + match[1] + '.jpg';
            } else if (match = youtube_re.exec(url)) {
                return 'https://img.youtube.com/vi/' + match[2] + '/0.jpg';
            } else if (match = memegen_re.exec(url)) {
                return 'http://images.memegenerator.net/instances/500x/' + match[1] + '.jpg';
            } else if (match = qkmeme_re.exec(url)) {
                return 'http://i.qkme.me/' + match[2] + '.jpg';
            } else if (match = pics_for_all_re.exec(url)) {
                return 'http://www.pic4all.eu/images/' + match[3];
            } else if (match = gfycat_re.exec(url)) {
                return match[1] + 'giant.' + match[2] + '.gif';
            } else if (image_re.test(url)) {
                url = url.replace(/^http(:\/\/(i\.)?imgur\.com)/, 'https$1');
                return url;
            }
            return undefined;
            /*jsl:end*/
        }

        // *************************
        // getBaseDomain(url_or_hostname)
        //
        // Originally from - supergenpass.com bookmarklet
        // *************************
        var DOMAIN_LIST = 'ac.ac|com.ac|edu.ac|gov.ac|net.ac|mil.ac|org.ac|com.ae|net.ae|org.ae|gov.ae|ac.ae|co.ae|sch.ae|pro.ae|com.ai|org.ai|edu.ai|gov.ai|com.ar|net.ar|org.ar|gov.ar|mil.ar|edu.ar|int.ar|co.at|ac.at|or.at|gv.at|priv.at|com.au|gov.au|org.au|edu.au|id.au|oz.au|info.au|net.au|asn.au|csiro.au|telememo.au|conf.au|otc.au|id.au|com.az|net.az|org.az|com.bb|net.bb|org.bb|ac.be|belgie.be|dns.be|fgov.be|com.bh|gov.bh|net.bh|edu.bh|org.bh|com.bm|edu.bm|gov.bm|org.bm|net.bm|adm.br|adv.br|agr.br|am.br|arq.br|art.br|ato.br|bio.br|bmd.br|cim.br|cng.br|cnt.br|com.br|coop.br|ecn.br|edu.br|eng.br|esp.br|etc.br|eti.br|far.br|fm.br|fnd.br|fot.br|fst.br|g12.br|ggf.br|gov.br|imb.br|ind.br|inf.br|jor.br|lel.br|mat.br|med.br|mil.br|mus.br|net.br|nom.br|not.br|ntr.br|odo.br|org.br|ppg.br|pro.br|psc.br|psi.br|qsl.br|rec.br|slg.br|srv.br|tmp.br|trd.br|tur.br|tv.br|vet.br|zlg.br|com.bs|net.bs|org.bs|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|co.ck|net.ck|org.ck|edu.ck|gov.ck|com.cn|edu.cn|gov.cn|net.cn|org.cn|ac.cn|ah.cn|bj.cn|cq.cn|gd.cn|gs.cn|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|jl.cn|js.cn|ln.cn|mo.cn|nm.cn|nx.cn|qh.cn|sc.cn|sn.cn|sh.cn|sx.cn|tj.cn|tw.cn|xj.cn|xz.cn|yn.cn|zj.cn|arts.co|com.co|edu.co|firm.co|gov.co|info.co|int.co|nom.co|mil.co|org.co|rec.co|store.co|web.co|ac.cr|co.cr|ed.cr|fi.cr|go.cr|or.cr|sa.cr|com.cu|net.cu|org.cu|ac.cy|com.cy|gov.cy|net.cy|org.cy|co.dk|art.do|com.do|edu.do|gov.do|gob.do|org.do|mil.do|net.do|sld.do|web.do|com.dz|org.dz|net.dz|gov.dz|edu.dz|ass.dz|pol.dz|art.dz|com.ec|k12.ec|edu.ec|fin.ec|med.ec|gov.ec|mil.ec|org.ec|net.ec|com.ee|pri.ee|fie.ee|org.ee|med.ee|com.eg|edu.eg|eun.eg|gov.eg|net.eg|org.eg|sci.eg|com.er|net.er|org.er|edu.er|mil.er|gov.er|ind.er|com.es|org.es|gob.es|edu.es|nom.es|com.et|gov.et|org.et|edu.et|net.et|biz.et|name.et|info.et|ac.fj|com.fj|gov.fj|id.fj|org.fj|school.fj|com.fk|ac.fk|gov.fk|net.fk|nom.fk|org.fk|asso.fr|nom.fr|barreau.fr|com.fr|prd.fr|presse.fr|tm.fr|aeroport.fr|assedic.fr|avocat.fr|avoues.fr|cci.fr|chambagri.fr|chirurgiens-dentistes.fr|experts-comptables.fr|geometre-expert.fr|gouv.fr|greta.fr|huissier-justice.fr|medecin.fr|notaires.fr|pharmacien.fr|port.fr|veterinaire.fr|com.ge|edu.ge|gov.ge|mil.ge|net.ge|org.ge|pvt.ge|co.gg|org.gg|sch.gg|ac.gg|gov.gg|ltd.gg|ind.gg|net.gg|alderney.gg|guernsey.gg|sark.gg|com.gr|edu.gr|gov.gr|net.gr|org.gr|com.gt|edu.gt|net.gt|gob.gt|org.gt|mil.gt|ind.gt|com.gu|edu.gu|net.gu|org.gu|gov.gu|mil.gu|com.hk|net.hk|org.hk|idv.hk|gov.hk|edu.hk|co.hu|2000.hu|erotika.hu|jogasz.hu|sex.hu|video.hu|info.hu|agrar.hu|film.hu|konyvelo.hu|shop.hu|org.hu|bolt.hu|forum.hu|lakas.hu|suli.hu|priv.hu|casino.hu|games.hu|media.hu|szex.hu|sport.hu|city.hu|hotel.hu|news.hu|tozsde.hu|tm.hu|erotica.hu|ingatlan.hu|reklam.hu|utazas.hu|ac.id|co.id|go.id|mil.id|net.id|or.id|co.il|net.il|org.il|ac.il|gov.il|k12.il|muni.il|idf.il|co.im|net.im|org.im|ac.im|lkd.co.im|gov.im|nic.im|plc.co.im|co.in|net.in|ac.in|ernet.in|gov.in|nic.in|res.in|gen.in|firm.in|mil.in|org.in|ind.in|ac.ir|co.ir|gov.ir|id.ir|net.ir|org.ir|sch.ir|ac.je|co.je|net.je|org.je|gov.je|ind.je|jersey.je|ltd.je|sch.je|com.jo|org.jo|net.jo|gov.jo|edu.jo|mil.jo|ad.jp|ac.jp|co.jp|go.jp|or.jp|ne.jp|gr.jp|ed.jp|lg.jp|net.jp|org.jp|gov.jp|hokkaido.jp|aomori.jp|iwate.jp|miyagi.jp|akita.jp|yamagata.jp|fukushima.jp|ibaraki.jp|tochigi.jp|gunma.jp|saitama.jp|chiba.jp|tokyo.jp|kanagawa.jp|niigata.jp|toyama.jp|ishikawa.jp|fukui.jp|yamanashi.jp|nagano.jp|gifu.jp|shizuoka.jp|aichi.jp|mie.jp|shiga.jp|kyoto.jp|osaka.jp|hyogo.jp|nara.jp|wakayama.jp|tottori.jp|shimane.jp|okayama.jp|hiroshima.jp|yamaguchi.jp|tokushima.jp|kagawa.jp|ehime.jp|kochi.jp|fukuoka.jp|saga.jp|nagasaki.jp|kumamoto.jp|oita.jp|miyazaki.jp|kagoshima.jp|okinawa.jp|sapporo.jp|sendai.jp|yokohama.jp|kawasaki.jp|nagoya.jp|kobe.jp|kitakyushu.jp|utsunomiya.jp|kanazawa.jp|takamatsu.jp|matsuyama.jp|com.kh|net.kh|org.kh|per.kh|edu.kh|gov.kh|mil.kh|ac.kr|co.kr|go.kr|ne.kr|or.kr|pe.kr|re.kr|seoul.kr|kyonggi.kr|com.kw|net.kw|org.kw|edu.kw|gov.kw|com.la|net.la|org.la|com.lb|org.lb|net.lb|edu.lb|gov.lb|mil.lb|com.lc|edu.lc|gov.lc|net.lc|org.lc|com.lv|net.lv|org.lv|edu.lv|gov.lv|mil.lv|id.lv|asn.lv|conf.lv|com.ly|net.ly|org.ly|co.ma|net.ma|org.ma|press.ma|ac.ma|com.mk|com.mm|net.mm|org.mm|edu.mm|gov.mm|com.mn|org.mn|edu.mn|gov.mn|museum.mn|com.mo|net.mo|org.mo|edu.mo|gov.mo|com.mt|net.mt|org.mt|edu.mt|tm.mt|uu.mt|com.mx|net.mx|org.mx|gob.mx|edu.mx|com.my|org.my|gov.my|edu.my|net.my|com.na|org.na|net.na|alt.na|edu.na|cul.na|unam.na|telecom.na|com.nc|net.nc|org.nc|ac.ng|edu.ng|sch.ng|com.ng|gov.ng|org.ng|net.ng|gob.ni|com.ni|net.ni|edu.ni|nom.ni|org.ni|com.np|net.np|org.np|gov.np|edu.np|ac.nz|co.nz|cri.nz|gen.nz|geek.nz|govt.nz|iwi.nz|maori.nz|mil.nz|net.nz|org.nz|school.nz|com.om|co.om|edu.om|ac.om|gov.om|net.om|org.om|mod.om|museum.om|biz.om|pro.om|med.om|com.pa|net.pa|org.pa|edu.pa|ac.pa|gob.pa|sld.pa|edu.pe|gob.pe|nom.pe|mil.pe|org.pe|com.pe|net.pe|com.pg|net.pg|ac.pg|com.ph|net.ph|org.ph|mil.ph|ngo.ph|aid.pl|agro.pl|atm.pl|auto.pl|biz.pl|com.pl|edu.pl|gmina.pl|gsm.pl|info.pl|mail.pl|miasta.pl|media.pl|mil.pl|net.pl|nieruchomosci.pl|nom.pl|org.pl|pc.pl|powiat.pl|priv.pl|realestate.pl|rel.pl|sex.pl|shop.pl|sklep.pl|sos.pl|szkola.pl|targi.pl|tm.pl|tourism.pl|travel.pl|turystyka.pl|com.pk|net.pk|edu.pk|org.pk|fam.pk|biz.pk|web.pk|gov.pk|gob.pk|gok.pk|gon.pk|gop.pk|gos.pk|edu.ps|gov.ps|plo.ps|sec.ps|com.pt|edu.pt|gov.pt|int.pt|net.pt|nome.pt|org.pt|publ.pt|com.py|net.py|org.py|edu.py|com.qa|net.qa|org.qa|edu.qa|gov.qa|asso.re|com.re|nom.re|com.ro|org.ro|tm.ro|nt.ro|nom.ro|info.ro|rec.ro|arts.ro|firm.ro|store.ro|www.ro|com.ru|net.ru|org.ru|gov.ru|pp.ru|com.sa|edu.sa|sch.sa|med.sa|gov.sa|net.sa|org.sa|pub.sa|com.sb|net.sb|org.sb|edu.sb|gov.sb|com.sd|net.sd|org.sd|edu.sd|sch.sd|med.sd|gov.sd|tm.se|press.se|parti.se|brand.se|fh.se|fhsk.se|fhv.se|komforb.se|kommunalforbund.se|komvux.se|lanarb.se|lanbib.se|naturbruksgymn.se|sshn.se|org.se|pp.se|com.sg|net.sg|org.sg|edu.sg|gov.sg|per.sg|com.sh|net.sh|org.sh|edu.sh|gov.sh|mil.sh|gov.st|saotome.st|principe.st|consulado.st|embaixada.st|org.st|edu.st|net.st|com.st|store.st|mil.st|co.st|com.sv|org.sv|edu.sv|gob.sv|red.sv|com.sy|net.sy|org.sy|gov.sy|ac.th|co.th|go.th|net.th|or.th|com.tn|net.tn|org.tn|edunet.tn|gov.tn|ens.tn|fin.tn|nat.tn|ind.tn|info.tn|intl.tn|rnrt.tn|rnu.tn|rns.tn|tourism.tn|com.tr|net.tr|org.tr|edu.tr|gov.tr|mil.tr|bbs.tr|k12.tr|gen.tr|co.tt|com.tt|org.tt|net.tt|biz.tt|info.tt|pro.tt|int.tt|coop.tt|jobs.tt|mobi.tt|travel.tt|museum.tt|aero.tt|name.tt|gov.tt|edu.tt|nic.tt|us.tt|uk.tt|ca.tt|eu.tt|es.tt|fr.tt|it.tt|se.tt|dk.tt|be.tt|de.tt|at.tt|au.tt|co.tv|com.tw|net.tw|org.tw|edu.tw|idv.tw|gov.tw|com.ua|net.ua|org.ua|edu.ua|gov.ua|ac.ug|co.ug|or.ug|go.ug|co.uk|me.uk|org.uk|edu.uk|ltd.uk|plc.uk|net.uk|sch.uk|nic.uk|ac.uk|gov.uk|nhs.uk|police.uk|mod.uk|dni.us|fed.us|com.uy|edu.uy|net.uy|org.uy|gub.uy|mil.uy|com.ve|net.ve|org.ve|co.ve|edu.ve|gov.ve|mil.ve|arts.ve|bib.ve|firm.ve|info.ve|int.ve|nom.ve|rec.ve|store.ve|tec.ve|web.ve|co.vi|net.vi|org.vi|com.vn|biz.vn|edu.vn|gov.vn|net.vn|org.vn|int.vn|ac.vn|pro.vn|info.vn|health.vn|name.vn|com.vu|edu.vu|net.vu|org.vu|de.vu|ch.vu|fr.vu|com.ws|net.ws|org.ws|gov.ws|edu.ws|ac.yu|co.yu|edu.yu|org.yu|com.ye|net.ye|org.ye|gov.ye|edu.ye|mil.ye|ac.za|alt.za|bourse.za|city.za|co.za|edu.za|gov.za|law.za|mil.za|net.za|ngo.za|nom.za|org.za|school.za|tm.za|web.za|co.zw|ac.zw|org.zw|gov.zw|eu.org|au.com|br.com|cn.com|de.com|de.net|eu.com|gb.com|gb.net|hu.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|uk.net|us.com|uy.com|za.com|dk.org|tel.no|fax.nr|mob.nr|mobil.nr|mobile.nr|tel.nr|tlf.nr|e164.arpa|za.net|za.org'.split('|');

        function getBaseDomain(url) {
            var hostname = url.toLowerCase();
            hostname = hostname.replace(/^\s*|\s*$/g, '');
            hostname = hostname.replace(/^[a-z]+[0-9a-z-]*:\/\//, '');
            hostname = hostname.replace(/^([^\/]+).*/, '$1');
            hostname = hostname.replace(/^.*:.*@/, '');
            hostname = hostname.replace(/:\d+$/, '');
            hostname = hostname.split('.');

            var domain;

            if (!hostname[2]) {
                domain = hostname[hostname.length - 2] + '.' + hostname[hostname.length - 1];

                for (var i = 0; i < DOMAIN_LIST.length; i++) {
                    if (domain == DOMAIN_LIST[i]) {
                        domain = hostname[hostname.length - 3] + '.' + domain;
                        break;
                    }
                }
            } else {
                domain = hostname.join('.');
            }
            return domain;
        }

        function isCommentsPage() {
            var url = location.href;
            if (typeof isCommentsPage.cache[url] === 'undefined') {
                isCommentsPage.cache[url] = url.replace(/[?#].*$/, '').search('/comments/') != -1;
            }
            return isCommentsPage.cache[url];
        }
        isCommentsPage.cache = {};

        function isSomeFrontPage() {
            var url = window.location.href.replace(/[?#].*$/, '');
            if (typeof isSomeFrontPage.cache[url] === 'undefined') {
                isSomeFrontPage.cache[url] = url.match(/reddit.com(\/r\/all|\/r\/[^?#;\/]+\+[^?#;\/]|\/m\/|\/domain\/[^\/]+)?(\/(new|controversial|top))?((\/)|$)/) && !url.match(/\/comments\//);
            }
            return isSomeFrontPage.cache[url];
        }
        isSomeFrontPage.cache = {};

        function isAMultiSubredditFrontpage() {
            var url = location.href.replace(/[?#].*$/, '');
            if (typeof isAMultiSubredditFrontpage.cache[url] === 'undefined') {
                isAMultiSubredditFrontpage.cache[url] = url.match(/reddit.com(\/r\/all|\/r\/[^?#;\/]+\+[^?#;\/]|\/r\/[^\/]+\/related|\/user\/[^\/]+\/m\/|\/me\/m\/|\/domain\/[^\/]+|\/new|\/controversial|\/top|\/saved|\/$|$)/);
            }
            return isAMultiSubredditFrontpage.cache[url];
        }
        isAMultiSubredditFrontpage.cache = {};

        function logged_in_p() {
            var $uname = $('#header-bottom-right .user a');
            // This is a hack but we need useruser here somehow
            return $uname && $uname.text() != 'useruser' && $uname.text() != 'user';
        }

        function make_links(url, ttl, in_list) {
            url = !url ? '' : url.replace(/['"]/g, '\\$&');
            try {
                if (url[0] == '/') url = location.protocol + '//' + location.host + url;
            } catch (e) {
                console.log("Could not fix url");
            }
            ttl = !ttl ? '' : ttl.replace(/['"]/g, '\\$&');
            // delicious.com
            $("<a></a>")
                .attr("href", "javascript:(function(){win=window%3Bvar%20url%3D%27http://delicious.com/save%3Furl%3D%27%2BencodeURIComponent(%27" + url + "%27)%2B%27%26title%3D%27%2BencodeURIComponent(%27" + ttl + "%27)%2B%27%26v%3D5%26jump%3Dyes%26tags%3Dvia:reddit%27%3Bop%3Dfunction(){if(%21win.open(url%2C%27t%27%2C%27toolbar%3D0%2Cresizable%3D0%2Cstatus%3D1%2Cwidth%3D250%2Cheight%3D150%27))loc.href%3Durl%3B}%3Bif(/Firefox/.test(navigator.userAgent))window.setTimeout(op%2C0)%3Belse%20op()%3B})()")
                .text("delicious")
                .addClass("option")
                .addClass("active")
                .appendTo(
                    $("<li></li>", in_list).addClass("delicious").appendTo(in_list));
            // readitlaterlist.com
            $("<a></a>")
                .attr("href", "javascript:(function(){win=window%3Bvar%20url%3D%27https://readitlaterlist.com/save%3Furl%3D%27%2BencodeURIComponent(%27" + url + "%27)%2B%27%26title%3D%27%2BencodeURIComponent(%27" + ttl + "%27)%3Bop%3Dfunction(){if(%21win.open(url%2C%27t%27%2C%27toolbar%3D0%2Cresizable%3D0%2Cstatus%3D1%2Cwidth%3D250%2Cheight%3D150%27))loc.href%3Durl%3B}%3Bif(/Firefox/.test(navigator.userAgent))window.setTimeout(op%2C0)%3Belse%20op()%3B})()")
                .text("readitlaterlist")
                .addClass("option")
                .addClass("active")
                .appendTo(
                    $("<li></li>", in_list)
                    .addClass("readitlaterlist")
                    .appendTo(in_list));
            return;
        }

        function makeClosure(asshole, downlink) {
            return function() {
                console.log('Downvoting', asshole);
                scrollToElement(downlink.parentNode.parentNode);
                mouseClick(downlink);
                setValue("SLAPPED", Date.now().toString());
                console.log('Downvoting', asshole, 'done');
            };
        }

        function downvoteLusers(doc, front) {
            if (!logged_in_p()) return;
            doc = doc || document;
            var delay = 0;
            var doing = getValue("SLAPPED", 0);
            var now = Date.now();
            if (doing && doing > (now - (15 * 1000))) {
                window.setTimeout(downvoteLusers, 10 * 1000, doc, front);
                return;
            }
            $('.author', doc).each(function() {
                try {
                    if (!$(this).attr('href')) return;
                    var tagline = $(this).parent();
                    if (!(/tagline/).test(tagline.attr('class'))) return;
                    var author = $(this).text();
                    if (author) {
                        if (ban_users_re.test(author)) { // if [deleted] then won't be one
                            tagline.meh();
                            var x;
                            if (front) {
                                x = tagline;
                            } else {
                                tagline.parent().find('.md').meh();
                                x = tagline.parent();
                            }
                            x = x.parent().parent().children('.midcol').children('.down');
                            if (/(^| )down($| )/.test(x.attr('class'))) {
                                delay += (2000 + Math.random() * 5000);
                                window.setTimeout(makeClosure(author, x.get(0)), delay);
                            }
                        }
                    }
                } catch (e) {
                    console.log("author fail", e);
                }
            });
        }

        var default_img_src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAAAyCAYAAADhna1TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACbpJREFUeNrMW+9PW+cVPjRAk8DgsgXIBiuGpiEECF6YFNopiUsqNdKk1pO2D5E2FfZh0j41+wtK/4J6n/aVaVKiSYkG+ZRKIzNCm2ALzDSkLSQDpzNZgHS2A05XnISd5/K+8PL6Xt8fttmO9Mr394/nPuec55x7Xba1tUX7YVevXt0zf+nSJfN3eHiYBgcHzekrV67I1S08AmI6xiOd79gfr3dYLn+7r9Pxuj6evEs1hyqot+1b9Fb1H81lTT0/pbJSA6MD4sI+4nG5oaGBNjc3KcWGeR6/dQuOG0B0O7f1+53pkgJjAcj7CgPiPB5Y7PZ+VVVVpL+/n6qrq80FyWSSxsbGKJvNhnh23PaEnT8u+JpPzv/c/O35ye+ofJ9AgWtE4Dk8wjyCPAwBUkr5HTh9+vQOKLC6ujrCsqmpqct5gSmCbT79cme6fJ9cB0BEeQxqy88LgIIipgSam5tzdmYWkdiuZGyB3f/eKLVO9hcfmDzxRAKjm2TAqPgNsesEwBLVMpmM30uqBQsFS0PK8rhg6Yhd7Co4xrgMrn8SrjTqsN0HhmEMXbhwgSorK80FGxsbdOvWLYAzYHkT9mxBTBvKy7RdkADc7E7GPFXhHRgfWQa2JS4w7WLbP7DrhJuamsyZpaUlBF6A+isPoHwkMplbSwlGzdoC4/PG81mPoGyrh33OK9QfUZ+mC2DOW7htVAT+uHRZ4WIBDRzMpwFMeYlBkRcR87jPeAEZaFibt3LBceHaEbFeBveITBAv7YPotQu8pbAejQVDeYRhWoCgXltYTuwHMH4Y49fC2nzExT7qNoYAt+TA1IonWBphdveaFTtJiU1ugr2eKY1SCLwWwZCgom5lVtKzgKp6o77BAzi7QfhHimhMFXIj5UXya1NEVVRUBFD8QaBh8Dw1Njbm7MDaxGBdEkJ9yNPh1dVVWSzK7DGqlRJhBdARkYrTNuB4BfhdK9FZCDDvIbix5ghAc7S1tZGuWO0MtRCGChrAWl5eDs/Pz4cZtLgAZKirq8tobW01t2dVbNy5c2eAtwsKZqaL4OoRq4y2R8e4TNdAOMLMCOCCAUixbXFxkebm5szps2fP5gA+OTkJ4TecU3t5q5lqBUODChsx/SBH4CnA1Aq6hjQKDzBDQvwUSwKIbswOYgaZ1bV6PvRprl+/TpZq2h04Oih79E6OwFNiRpQZYbS3t5txArKcRxgMwUXKOqbU1t3dTYhZExMT5rwEB+fHco5NQR8xpUeAYuQTgVbADB8/ftzo7e3daRQlEgk6c+ZM8ViyliBKzIuAw9f3Wq/tpohDKCrRrEL7QcYlUXGnHLKUHVNsQXn1b+wkp/6co2Pe5ZMHVVBwQTqVdyy7SfRPvsGlO9u/biy5QjTHDEitbo/EAtG96by7KM0q041WVlYATMq2hrK3ESem2DEmCHeRfowgB3eyZUpsjNOJ8tBSfNPd5xzq2NXcZY+W8rJGuhFcGnGHs5KU+16aVu9pPZmcPvKrf91dbat8EfTgy/Bz2ye/oTH5MV/werJkMQcPaWFhAWxBiv11AeVCzHr/MjFygYnhqYAtAAbZx7M928y//khu65Ka210dWml7RnzgqpcLexk59SYhQcskrQMzCnGFLKAGOks7WMWOWKE5Js/XNea/vG+wJgn2M0BN7O0NRCfOELV2u747ZCOtgnZrAY0xWietbGfYZSVI9CgHu/wtwUPVfFN9RPdniP6T2c4umHdjAM8JwNJayrLH6JCuEeljhmGEHA9f37w99tHg5gW0P2wZU4oicl9B2a41fVXinvaxzUrZbPb/DhgITavA6bNW8sWYKIuokNXLL6cnKrMaDAFctiCKYaKwHPGxq94gDzkxyI4xI0JEeSr4bty4YapSaQAJGa6AuLDn+Jwxo+Twcr/UjJnFRbCWCUFUOdn09DQKOrOmKRY7dBditsivHuh/CYwpufkpRWVHzkmuQyE7Vd24QQhHK0MVj2Po50K9htJEgDLroc2pWlwrIeJOwDg1qj7gODF08eLFglsNaD7NzMyYQb2+vp46NVW9xoyLx+MkazUZs1AC0O57ZtJS7mixgrB8mQ/r+8WEY7r+kF0qwLFjoBA3ASiojHHTCOiIF2DCsdd23fTQ4Sp6wc/o+YvdB3WAlXTHyU4p51VJT/fvLQDkoI8Ku2BXkjbIFxC7efNmBLUTYo4X9kimgHUSWDDhH4tL1HbsxG6FwUr6xEn3pcHa2ho9Xls1PLqUI1u8CjxUolEOgBHONGZrE0/eCSDJFD1OIY3Dg5+92N124bM5+tfDBD1Jp6im1qD2ji46+h17uVDMD8EOVFYVpHxB2TfZtc7zzUaYBUGAg4Eb10FS+7VCmOWUJs8FMJ/MTNHGkyR1dHZxyXWEHi4naOb2FHWeylLzK9bfAjji4pI1HZ/9jP3YKEpJAGFkSJcCAJDpXFvtCDrED5m+4TaWwIAxPNbTSXrETHn7h+9Q1cEK2uSFLS2t9PKhw/T57DQd/W5rSRlT1/JG0WoltD8DsoEFgCDq8HEPgJHpWAZrrLMSeLivZ8+5MP86S1U1dbS5VUkVPF9ZjnUvUWNDI8W+ypjb+GKMj1hTKDAhNaWaNfx2YWemYoCjfhElezroHcPlMCDta7/ZYMYYuFM2u0lfPRP6obLMBCeb3V6gxqH0v1fp8aMEZZ6kTNcTXbn83wH7BMfPS/2gnrYlI/CrgqKuS69naCWZoduxOaqsaaDGV46bN32w2qCvmRkPv1g0wclkAUYZffpJjGoEeBj37s7Qp9MTVMWH7u5sp9df7wPIl8nNJya5L/9LwhhTpaqGeIIYo4Oi1DgMQB0FOvv2uEIWbDjwMp34/gX6/PYYPXowT/VHm2lleYnKDrCG4eVZBunpepIeP1zKKTkQ+K9duxZkpvYUoIpL149B5oEL6aAg6KKQ7Ovro7/Pze9xC9UqGbTOH7xDqbWEyZ5vHztNRkPzdhzifb5cSZjiUGcqPlwU7ZGiizw/wMQRU9R+sJUiljUO3j0DNDz1L+anWc06i8MMb5tR3jZkkqtU05CbUqGRyEtj3II1fzn8S3rj6W+KA4xTG0F9JyUBDJ07a7qck4FhAFI0vbePV2GYy2WhiuNDTfPxYmT3fslDDZU4MrBnvsUnMCmwIZ/JtwzqOykAlPetgxKvoKz1bdEfQr8HLoVp0ZsJk9tPQTxmJj/AxPJ9qQ2m4InChYrV58Ux+ZwmO7jalh87jhfKlGIDM46vn7gOMvRPM0BvsMkqO3nJeBJ4Gaf4dCo7Rj0dcB8FnhkyOPCNsFALiD9AmC6AuFAIKDIFQwDieBxXUiK4fujrYAU0x/8rwAAMImsNIHK00QAAAABJRU5ErkJggg==';

        function imageRefitter(event) {
            if (event.which != 1) { // only left mouseclick
                return;
            }
            drop(event);
            try {
                var i = this.firstChild;
                if ((!i.style.width || i.style.width === '' || i.style.width == 'auto') &&
                    (!i.style.height || i.style.height === '' || i.style.height == 'auto')) {
                    i.style.width = 'auto';
                    var ih = window.innerHeight;
                    i.style.height = '' + ih + 'px';
                    scrollToElement(i);
                } else if (!i.style.height.match(/^($|auto$)/) && (i.style.width === '' || i.style.width == 'auto')) {
                    i.style.width = '100%';
                    i.style.height = 'auto';
                    scrollToElement(i);
                } else if (i.style.width == '100%' && (!i.style.height || i.style.height === '' || i.style.height == 'auto')) {
                    i.style.height = 'auto';
                    i.style.width = 'auto';
                    scrollToElement(i);
                }
            } catch (ex) {
                console.log(ex);
            }
            return false;
        }

        function scaleThumbnail(entry) {
            try {
                // This assumes image thumbnails are on everywhere
                var thumbnail = entry.previousSibling;
                if (thumbnail && thumbnail.childElementCount) {
                    const wanted_height = 50,
                        wanted_width = 70;
                    // Scale thumbnail in the rectangle so that it always fits within
                    // the minimum entry height (50) and thus the preview always lies
                    // below the entry
                    var $it = $(thumbnail.firstChild);
                    var orig_height = $it.height();
                    var orig_width = $it.width();
                    var new_width, new_height;
                    if (orig_width > wanted_width) {
                        new_height = Math.round(orig_height * wanted_width / orig_width);
                        $it.attr('width', wanted_width);
                        $it.attr('height', new_height);
                        orig_width = wanted_width;
                        orig_height = new_height;
                    }
                    if (orig_height > wanted_height) {
                        new_width = orig_width * wanted_height / orig_height;
                        $it.attr('height', wanted_height);
                        $it.attr('width', new_width);
                        orig_width = new_width;
                        orig_height = wanted_height;
                    }
                    new_v_pad = Math.round((wanted_height - orig_height) / 2);
                    if (new_v_pad > 0) {
                        $it.attr('style', 'padding-top: ' + new_v_pad + 'px; padding-bottom: ' + new_v_pad + 'px; background: black;');
                    }
                    new_h_pad = Math.round((wanted_width - orig_width) / 2);
                    if (new_h_pad > 0) {
                        $it.attr('style', 'padding-left: ' + new_h_pad + 'px; padding-right: ' + new_h_pad + 'px; background: black;');
                    }
                }
            } catch (se) {
                console.log("scaleThumbnail", se);
            }
        }

        // element - 'entry'
        // url - url of the entry
        // imgurl - url to the image
        // doc - document this thingy lives in
        function makeResizeableImage(entry, url, imgurl) {
            var $e = $(entry);
            var imgdiv_id = 'imgdiv_' + url.replace(/[^a-zA-Z0-9]+/g, '') + imgurl.replace(/[^a-zA-Z0-9]+/g, '');
            if (document.getElementById(imgdiv_id)) {
                return;
            }
            if (!$e.hasClass('junkblocker')) {
                var imgdiv = $("<center id='" + imgdiv_id + "' class='junkblocker' url='" + url + "' target='_blank' style='display:block;margin:0px;overflow:auto;padding:10px;background-color:black;'><img style='display:block;' src='" + imgurl + "' /></center>", document);
                // allow clicking to zoom in/out
                imgdiv.mousedown(imageRefitter);
                $e.after(imgdiv);

                var toggle_fullscreen = $("<li><a id='a_" + imgdiv_id + "' href=\"#\">Full Screen</a></li>", document);
                $(toggle_fullscreen).click(function(event) {
                    drop(event);
                    try {
                        toggleFullScreen(imgdiv_id);
                        if (!isFullScreen()) {
                            // scroll to the entry
                            scrollToElement(event.target.parentNode.parentNode);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                    return false;
                });
                $e.find('.buttons').append(toggle_fullscreen);

                try {
                    // This assumes image thumbnails are on everywhere
                    var thumbnail = entry.previousSibling;
                    var timeout;
                    $(thumbnail).attr('id', 'thumbnail_' + imgdiv_id)
                        // take complete control over thumbnail clicks
                        .removeAttr('href')
                        .removeAttr('target')
                        .removeAttr('click')
                        .removeAttr('mousedown')
                        .removeAttr('mouseenter');

                    addHoverAction(thumbnail, function(event) {
                        var id;
                        try {
                            // TODO: Figure out why sometimes the target is a vs img
                            if (/^thumbnail_/.test(event.target.id)) {
                                id = event.target.id.replace(/^thumbnail_/, '');
                            } else if (/^thumbnail_/.test(event.target.parentNode.id)) {
                                id = event.target.parentNode.id.replace(/^thumbnail_/, '');
                            } else {
                                return false;
                            }
                            $('#' + id).slideToggle();
                        } catch (e) {
                            console.log("slideToggle fail", e);
                        }
                    });
                } catch (ex) {
                    console.log("makeResizeableImage", ex);
                }
            }
        }

        function addPersistent(name, item) {
            setValue(name, addUnique(getValue(name, []), item));
        }

        function removePersistent(name, item) {
            setValue(name, getValue(name, []).filter(function(a) {
                return a != item;
            }));
        }

        function makeSubredditFunction(name) {
            return function(event) {
                if (!filter_ok) return false;
                window.setTimeout(function() {
                    if (!filter_ok) return false;
                    var label;
                    try {
                        label = $(event.target).text();
                        if (label == '[X]') {
                            addPersistent('ban_subreddits', name);
                            removePersistent('meh_subreddits', name);
                            $(event.target).text('[✓]');
                            makeREs();
                            //window.alert("Banned " + name + " subreddit");
                        } else if (label == '[✓]') {
                            removePersistent('ban_subreddits', name);
                            $(event.target).text('[X]');
                            makeREs();
                            //window.alert("Unbanned " + name + " subreddit");
                        } else if (label == ':-/') {
                            addPersistent('meh_subreddits', name);
                            removePersistent('ban_subreddits', name);
                            $(event.target).text(':-)');
                            makeREs();
                            //window.alert("Mehed " + name + " subreddit");
                        } else if (label == ':-)') {
                            removePersistent('meh_subreddits', name);
                            $(event.target).text(':-/');
                            makeREs();
                            //window.alert("Unmehed " + name + " subreddit");
                        }
                    } catch (ex) {
                        window.alert("Subreddit " + name + " " + label + " failed: " + ex);
                    }
                    return false;
                }, 0);
                return false;
            };
        }

        function makeCollapseFunction(x) {
            return function(event) {
                drop(event);
                try {
                    var label = event.target.innerHTML;
                    $('#' + x).slideToggle(function() {
                        if (label == '[collapse]') {
                            event.target.innerHTML = '[expand]';
                        } else if (label == '[expand]') {
                            event.target.innerHTML = '[collapse]';
                        }
                    });
                } catch (ex) {
                    console.log("collapseFunction", ex);
                }
                return false;
            };
        }

        function groupSubreddits(doc) {
            try {
                doc = doc || document;
                var last_sitetable_element;
                var sitetable = doc.querySelectorAll('#siteTable');
                if (sitetable) {
                    sitetable = sitetable[sitetable.length - 1];
                }
                if (!sitetable) sitetable = doc;
                var the_links = sitetable.getElementsByTagName('a');
                var myhash = new Object();

                for (i = 0; i < the_links.length; i++) {
                    var node = the_links[i];
                    if (node.className.match(/.*subreddit.*/)) {
                        var subreddit = node.innerHTML.replace(/^\/?r\//, '');
                        if (!myhash[subreddit]) {
                            myhash[subreddit] = new Array();
                            myhash[subreddit + "_link"] = node.href;
                        }
                        var parentdiv = $(node).closest('.thing')[0];
                        myhash[subreddit].push(parentdiv);
                    }
                }

                if (sitetable.hasChildNodes() && Object.keys(myhash).length) {
                    while (sitetable.childNodes.length >= 2) {
                        // Only remove the top level entry divs and nothing else
                        var first = sitetable.firstChild;
                        if ((/div/i).test(first.tagName) && !/nav-buttons/.test(first.className)) {
                            sitetable.removeChild(first);
                        } else {
                            last_sitetable_element = first;
                            break;
                        }
                    }
                }

                var random_id;
                for (var k in myhash) {
                    random_id = 'subreddit_group_' + k;
                    var subreddit_cdiv;
                    subreddit_cdiv = document.getElementById(random_id);
                    if (!subreddit_cdiv) {
                        subreddit_cdiv = document.createElement('div');
                        subreddit_cdiv.id = random_id;
                    }
                    if (!k.match(/.*_link$/)) {
                        var titlenode;
                        var banlink;
                        var div = $('div#' + random_id + '_title');
                        if (!div || !div[0]) {
                            div = $('<div id="' + random_id + '_title"/>');
                            if (last_sitetable_element) {
                                $(last_sitetable_element).before(div);
                                $(last_sitetable_element).before(subreddit_cdiv);
                            } else {
                                $(sitetable).append(div);
                                $(sitetable).append(subreddit_cdiv);
                            }
                            titlenode = $('<a href="' + myhash[k + "_link"] + '" id="' + k + '_link" target="_blank" class="junkblocker_subreddit_group_title">/r/' + k + '</a>');
                            div.append(titlenode).append(document.createElement('br'));
                            if (!filter_ok || !ban_subreddits_re.test(k)) {
                                div.attr('align', 'center');
                                titlenode
                                    .before(
                                        $('<a href="#" style="display: inline-block; position: relative; float: left;">[collapse]</a>').ncolor().click(makeCollapseFunction(random_id)))
                                    .after(document.createTextNode(' '));
                                if (!meh_subreddits_re.test(k)) {
                                    titlenode
                                        .after(
                                            $('<a href="#" title="Ban subreddit ' + k + '">[X]</a>').ncolor().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                } else {
                                    titlenode
                                        .after(
                                            $('<a href="#" title="Ban subreddit ' + k + '">[X]</a>').meh().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                }
                                if (!meh_subreddits_re.test(k)) {
                                    titlenode
                                        .ncolor()
                                        .css('font-size', '10pt')
                                        .after(
                                            $('<a href="#" title="Downgrade subreddit' + k + '">:-/</a>').ncolor().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                } else {
                                    titlenode
                                        .meh()
                                        .css('font-size', '10pt')
                                        .after(
                                            $('<a href="#" title="Upgrade subreddit' + k + '">:-)</a>').meh().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                }
                            } else {
                                div.attr('align', 'right');
                                if (!meh_subreddits_re.test(k)) {
                                    titlenode
                                        .ncolor()
                                        .after(
                                            $('<a href="#">[✓]</a>').ncolor().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                } else {
                                    titlenode
                                        .meh()
                                        .after(
                                            $('<a href="#">[✓]</a>').meh().click(makeSubredditFunction(k)))
                                        .after(document.createTextNode(' '));
                                }
                            }
                        } else {
                            titlenode = $('a#' + k + '_link');
                        }
                        if (!filter_ok || !ban_subreddits_re.test(k)) {
                            var sub_entries = myhash[k];
                            var entry;
                            for (var m = 0; m < sub_entries.length; m++) {
                                entry = sub_entries[m];
                                // $(entry).css('background-color', changeLuminanceOfColorByFraction(getStyle(entry, 'background-color'), -0.1));
                                if (meh_subreddits_re.test(k)) {
                                    $(entry).find('*').meh();
                                } else {
                                    $(entry).find('a').filter(function() {
                                        return !/(admin|friend|moderator|submitter)/.test(this.className);
                                    }).ncolor();
                                }
                                subreddit_cdiv.appendChild(entry);
                            }
                        }
                    }
                }
                doc.grouped = 1;
                markSubscriptionStatus(doc);
            } catch (ex) {
                console.log('groupSubreddits', ex);
            }
        }

        function doComments(doc) {
            handleEntries();
            try {
                // inline images and videos for open comments
                $('.noncollapsed a', doc).each(function() {
                    var h = $(this).attr('href');
                    var m = image_re.exec(h);
                    if (m) {
                        var id = 'inline-image-junkblocker-' + h.replace(/[^a-zA-Z0-9]+/g, '');
                        if (document.getElementById(id)) {
                            return;
                        }
                        var imgdiv = $("<div id='" + id + "' class='junkblocker' url='" + h + "' target='_blank' style='display:block;margin:0px;overflow:auto;padding:10px;background-color:black;'><img style='display:block;' src='" + h + "' /></div>", doc);
                        $(this).closest('.md').append(imgdiv);

                        // allow clicking to zoom in/out
                        imgdiv.mousedown(imageRefitter);
                        return;
                    }
                    if ($(this).hasClass('junkblocker')) return;
                    m = youtube_re.exec(h);
                    if (m) {
                        var video = m[2];
                        $(this)
                            .attr('target', video)
                            .html("<table style='border-collapse: separate; border-spacing: 0px; padding: 0px;'><tr><td style='border-radius: 7px 0px 0px 7px; background-color: #FAFAFA; border: 1px solid #6688AA;'>" + $(this).text() + "</td><td style='padding: 0px; border: 1px solid #000;'><img style='display: block;' src='https://img.youtube.com/vi/" + video + "/0.jpg' height='200' width='320' alt='" + video + "' /></td></tr></table>");
                        return;
                    }
                });
                // NOTE: This doesn't care about banned user thingy yet
                $('a.submitter', doc).each(function() {
                    $(this).closest('.thing').attr('style', 'background: #eeffee !important');
                });
                if (filter_ok) {
                    $('.noncollapsed .tagline a.author', doc).each(function() {
                        var $user = $(this);
                        var user_for_entry = $user.text();
                        if (user_for_entry) {
                            if (ban_users_re.test(user_for_entry)) {
                                $(this).parent().parent().find('a').meh();
                                create_change_user_link($user, user_for_entry, '[X]');
                            } else {
                                $(this).parent().parent().find('a').filter(function() {
                                    return !/(admin|friend|moderator|submitter)/.test(this.className);
                                }).ncolor();
                                create_change_user_link($user, user_for_entry, '[✓]');
                            }
                        }
                    });
                }
                // hide share links
                $('li a.share', doc).parent().hide();
                $('li a.give-gold', doc).parent().hide();
                // hide report links
                $('li form.report-button', doc).parent().hide();
            } catch (ex) {
                console.log('doComments', ex);
            }
        }

        function create_change_user_link($user, name, current) {
            function _makeUserFunction(operation) {
                return function(event) {
                    drop(event);
                    try {
                        window.setTimeout(function() {
                            if (!filter_ok) return;
                            try {
                                var $target = $(event.target);
                                var $label = $target.text();
                                if ($label == '[X]') {
                                    addPersistent('ban_users', name);
                                    $target.text('[✓]');
                                    makeREs();
                                    window.alert("Banned user " + name);
                                } else if ($label == '[✓]') {
                                    removePersistent('ban_users', name);
                                    $target.text('[X]');
                                    makeREs();
                                    window.alert("Unbanned user " + name);
                                }
                            } catch (e) {
                                window.alert(e);
                            }
                        }, 0);
                    } catch (ex) {
                        console.log(ex);
                    }
                    return false;
                };
            }

            if (filter_ok) {
                if (current == '[X]') {
                    $user
                        .after(document.createTextNode(' '))
                        .after($('<a href="#" title="Unban user ' + name + '">[✓]</a>').click(_makeUserFunction()).ncolor());
                } else {
                    $user
                        .after(document.createTextNode(' '))
                        .after($('<a href="#" title="Ban user ' + name + '">[X]</a>').click(_makeUserFunction()).ncolor());
                }
            }
        }

        function handleEntries() {
            try {
                $('.entry').each(function(loop_count) {
                    $(this).find('.expando-button').each(function() {
                        addHoverAction(this, function(event) {
                            mouseClick(event.target);
                        }, 300);
                    });
                    var $thing = $(this).closest('.thing');
                    if ($thing && $thing[0] && $thing[0].junkblocker) {
                        return;
                    }
                    $thing.attr('junkblocker', 1);
                    var itm;
                    var meh = false;
                    // block crap subreddits which make frontpage too often
                    if (isAMultiSubredditFrontpage()) {
                        if (!$(this).attr('msb_handled')) {
                            $(this).attr('msb_handled', 1);
                            var $subreddit = $(this).find('a.subreddit');
                            var subreddit_for_entry = $subreddit.text();
                            if (subreddit_for_entry) {
                                if (filter_ok && ban_subreddits_re.test(subreddit_for_entry)) {
                                    $(this).parent().hide();
                                    return;
                                } else if (filter_ok && meh_subreddits_re.test(subreddit_for_entry)) {
                                    meh = true;
                                } else if (cool_subreddits_re.test(subreddit_for_entry)) {
                                    $(this).parent().attr('style', 'background: #ccffcc !important');
                                }
                            }
                        }
                    }
                    if (isSomeFrontPage()) {
                        if (!$(this).attr('cool_handled')) {
                            $(this).attr('cool_handled', 1);
                            var domain_for_entry = $(this).find('p.title > span.domain > a').text();
                            if (cool_domains_re.test(domain_for_entry)) {
                                $thing.attr('style', 'background: #ccffcc !important');
                            }
                        }
                        if (!$(this).attr('user_handled')) {
                            $(this).attr('user_handled', 1);
                            var $user = $(this).children('p.tagline').children('a.author');
                            var user_for_entry = $user.text();
                            if (user_for_entry) {
                                if (ban_users_re.test(user_for_entry)) {
                                    meh = true;
                                    create_change_user_link($user, user_for_entry, '[X]');
                                } else {
                                    create_change_user_link($user, user_for_entry, '[✓]');
                                }
                            }
                        }
                    }
                    itm = $(this).children('p.title').children('a.title');
                    url = itm.attr('href');
                    if (!url) return;
                    if (!$(this).attr('domain_handled')) {
                        $(this).attr('domain_handled', Math.random());
                        if (isSomeFrontPage()) {
                            if (hide_nsfw && $(this).parent().attr('class').search('over18') != -1) {
                                $(this).parent().hide();
                            } else {
                                var basedomain = getBaseDomain(url);
                                if (filter_ok) {
                                    if (ban_domains_re.test(basedomain)) {
                                        $(this).parent().hide();
                                        return;
                                    } else if (meh_domains_re.test(basedomain)) {
                                        itm.parent().children('span.domain')
                                            .append(document.createTextNode(' '))
                                            .append('<a href="#" title="Ban domain ' + basedomain + '">[X]</a>')
                                            .append(document.createTextNode(' '))
                                            .append('<a href="#">:-)</a>');
                                        meh = true;
                                    } else {
                                        itm.parent().children('span.domain')
                                            .append(document.createTextNode(' '))
                                            .append('<a href="#" title="Ban domain ' + basedomain + '">[X]</a>')
                                            .append(document.createTextNode(' '))
                                            .append('<a href="#" title="Downgrade domain ' + basedomain + '">:-/</a>');
                                    }
                                }
                            }
                        }
                    }

                    _flat_list = $(this).children('ul.flat-list');
                    ttl = itm.text();

                    if (highlight_title_re.test(ttl)) {
                        $(this).parent().attr('style', 'background: #ccffcc !important');
                    } else if (ignore_re && ignore_re.test(ttl)) {
                        meh = true;
                    }

                    if (meh) {
                        $(this).find('a').meh();
                    } else {
                        $(this).find('a').filter(function() {
                            return !/(admin|friend|moderator|submitter)/.test(this.className);
                        }).ncolor();
                    }
                    scaleThumbnail(this);
                    ///////////////////
                    // inline images //
                    ///////////////////
                    try {
                        var imgurl = getImageURL(url);
                        if (imgurl && images_ok &&
                            // nsfw is ok or not nsfw tagged
                            (nsfw_ok || $(this).parent().attr('class').search('over18') == -1) &&
                            // image is not nsfw or nsfw is ok
                            (nsfl_ok || !nsfl_re.test(ttl)) &&
                            (spoiler_ok || !spoiler_re.test(ttl))) {
                            if (male_re.test(ttl) && !female_re.test(ttl)) {
                                meh = true;
                            } else {
                                window.setTimeout(makeResizeableImage, loop_count * 1000, this, url, imgurl);
                                meh ? $(this).find('a').meh() : $(this).find('a').filter(function() {
                                    return !/(admin|friend|moderator|submitter)/.test(this.className);
                                }).ncolor();
                            }
                        }
                    } catch (a) {
                        console.log("inlining fail", a);
                    }
                    // hide share links
                    $('li.share', _flat_list).hide();
                    //$('li a.give-gold', _flat_list).hide();
                    // hide report links
                    $('li form.report-button', _flat_list).parent().hide();
                });
            } catch (e) {
                console.log('handleEntries', e);
            }
        }

        function handleCommentExpandEvent(e) {
            try {
                var c = e.target.getAttribute('class');
                if (!c) return;
                if (c.search('thing') != -1) {
                    downvoteLusers(e.target, false);
                    doComments(e.target);
                }
            } catch (ex) {
                console.log("handleCommentExpandEvent", ex);
            }
        }

        function handleUserPage(doc) {
            try {
                downvoteLusers(doc, false);
                handleEntries();
                doComments(doc);
                window.addEventListener("DOMNodeInserted", handleCommentExpandEvent, false);
            } catch (ex) {
                console.log("handleUserPage", ex);
            }
        }

        function handleCommentsPage(doc) {
            try {
                doc = doc || document;
                downvoteLusers(doc, false);

                /////////////////////////////////////////////////////////////////////////////////////
                // From reddit overlay parent post - http://userscripts.org/scripts/show/112755 START
                /////////////////////////////////////////////////////////////////////////////////////
                if (!document.getElementById('vindolin_imageparent_container')) {
                    $('body').append('<div id="vindolin_imageparent_container" style="position:absolute;left:0px;top:0px;display:none;width:100px;height:100px;border-radius:10px;z-index:100;background:-moz-linear-gradient(top,rgba(20,15,10,0.95) 100%,rgba(20,15,10,0.95) 100%);color:white !important;box-shadow:3px 3px 5px rgba(0,0,0,0.2);padding:10px;"></div>');
                }
                var $parent_container = $('#vindolin_imageparent_container');

                $('a.bylink:contains(parent)').each(function() {
                    $(this).mouseenter(function(event) {
                        drop(event);
                        try {
                            var $this = $(this);
                            var post = $this.parents('.thing').first();
                            var parent_post = post.parents('div.thing').first().find('div.entry').first();
                            var parent_post_md = parent_post.find('div.md').first();
                            $parent_container
                                .hide()
                                .width(parent_post_md.width())
                                .height(parent_post.height())
                                .css('top', $this.position().top - ($this.height() * 1.5) - $parent_container.height() + 'px')
                                .css('left', $this.position().left + 'px')
                                .html(parent_post.clone())
                                .fadeIn('fast');
                        } catch (ex) {
                            console.log(ex);
                        }
                        return false;
                    });
                    $(this).mouseout(function(event) {
                        drop(event);
                        try {
                            $parent_container.fadeOut('fast');
                        } catch (ex) {
                            console.log(ex);
                        }
                        return false;
                    });
                });
                // From reddit overlay parent post - http://userscripts.org/scripts/show/112755 END
                /////////////////////////////////////////////////////////////////////////////////////
                doComments(doc);
                Fresh.run(doc);
            } catch (e) {
                console.log(e);
            }
        }

        // func will be passed event
        function addHoverAction(elem, func, delay) {
            if (func == null) {
                console.log("addHoverAction", "Passed null function");
                return;
            }
            try {
                var timeout;
                delay = delay != null ? delay : 300;
                elem.addEventListener('mouseenter', function(event) {
                    drop(event);
                    try {
                        if (timeout != null) {
                            clearTimeout(timeout);
                        }
                        timeout = window.setTimeout(func, delay, event);
                    } catch (ex) {
                        console.log(ex);
                    }
                    return false;
                });
                elem.addEventListener('mouseleave', function(event) {
                    drop(event);
                    try {
                        if (timeout != null) {
                            clearTimeout(timeout);
                            timeout = null;
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                    return false;
                });
            } catch (ahe) {
                console.log(ahe);
            }
        }

        var xhr;
        if (typeof GM_xmlhttpRequest !== "undefined") {
            xhr = GM_xmlhttpRequest;
        } else {
            xhr = function(details) {
                console.log('xhr being initiated with', details);
                details.method = details.method.toUpperCase() || "GET";
                if (!details.url) {
                    if (getValue('DEVELOPER', 0)) {
                        log("GM_xmlhttpRequest requires an URL.");
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
                    log("This Browser is not supported, please upgrade.");
                    return;
                }
            };
        }
        var Subscription = {
            load_requested: {
                '': false
            },
            load_done: {
                '': false
            },
            after: '',

            SUB_STATUS_YES: 1,
            SUB_STATUS_NO: 2,
            SUB_STATUS_UNKNOWN: 3,

            subscriptions: [],
            is_load_done: function() {
                var req;
                for (req in Subscription.load_requested) {
                    if (!Subscription.load_requested.hasOwnProperty(req)) continue;
                    if (!Subscription.load_done[req]) return false;
                }
                return true;
            },
            retrieveSubscriptions: function(doc, after, tried) {
                try {
                    after = after || Subscription.after;
                    tried = tried || 0;
                    if (doc != document) return;
                    if (Subscription.load_requested[after]) return;
                    if (!logged_in_p()) return;
                    Subscription.load_requested[after] = true;
                    Subscription.load_done[after] = false;

                    xhr({
                        method: 'GET',
                        url: window.location.protocol + '//www.reddit.com/subreddits/mine/subscriber/.json?limit=100' + (after != '' ? '&after=' + after : ''),
                        onload: function(response) {
                            // { data : children: [ { data: { display_name
                            var subs = JSON.parse(response.responseText);
                            try {
                                for (var i = 0, l = subs.data.children.length; i < l; i++) {
                                    Subscription.subscriptions.push(subs.data.children[i].data.display_name);
                                }
                                if (l == 100) {
                                    window.setTimeout(Subscription.retrieveSubscriptions, 2000, doc, subs.data.children[100 - 1].data.name);
                                    window.setTimeout(function() {
                                        Subscription.load_done[after] = true;
                                    }, 3000);
                                } else {
                                    Subscription.load_done[after] = true;
                                }
                            } catch (e) {
                                console.log("Subscription.retrieveSubscriptions", e);
                            }
                        },
                        onerror: function(response) {
                            if (response.status === 503 && tried < 12)
                                // Service not available, retry every 5 seconds
                                window.setTimeout(Subscription.retrieveSubscriptions, 5000, doc, after, tried + 1);
                        }
                    });
                } catch (e) {
                    console.log(e, e.stack);
                }
            },
            isSubscribed: function(subreddit) {
                if (!Subscription.is_load_done()) return Subscription.SUB_STATUS_UNKNOWN;
                if (Subscription.subscriptions.indexOf(subreddit) != -1) {
                    return Subscription.SUB_STATUS_YES;
                } else {
                    return Subscription.SUB_STATUS_NO;
                }
            },
        };

        var CommentsPreview = {
            /* Number of comments to display. Default is 3 */
            topComments: 7,
            sort_kind: {
                'confidence': 'score',
                'hot': 'hot',
                'top': 'level',
                'new': 'new',
                'controversial': 'fight',
                'old': 'old',
                'random': 'random',
            },
            addPreviewLinks: function(doc) {
                try {
                    var i, len, link, articleID, tmp,
                        a = (doc || document).querySelectorAll('.linklisting .comments:not(.empty)');
                    if (a.length) {
                        Object.keys(CommentsPreview.sort_kind).forEach(function(kind) {
                            for (i = 0, len = a.length; i < len; i += 1) {
                                if (!a[i].parentNode.querySelector('.' + kind + 'link') && /[0-9]/.test(a[i])) {
                                    articleID = a[i].getAttribute('href').replace(/^.*?\/comments\/([a-zA-Z0-9]+).*$/, '$1');
                                    link = document.createElement('a');
                                    link.className = kind + 'link';
                                    tmp = "java";
                                    link.href = tmp + 'script:;';
                                    link.setAttribute('kind', kind);
                                    link.setAttribute('id', kind + 'link' + articleID);
                                    link.textContent = ' >' + CommentsPreview.sort_kind[kind];
                                    a[i].parentNode.parentNode.querySelector('.first').insertBefore(link, null);
                                    CommentsPreview.addListener(link, articleID);
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.log(e);
                }
            },
            addListener: function(link, id) {
                try {
                    addHoverAction(link, function(event) {
                        CommentsPreview.retrieveTopComments(event.target, id);
                    }, 300);
                } catch (ex) {
                    console.log("CommentsPreview.addListener", ex);
                }
            },
            retrieveTopComments: function(ele, articleID) {
                var pre, url, thisPre;
                CommentsPreview.kill_preview = function(event) {
                    drop(event);
                    try {
                        this.parentNode.removeChild(this);
                    } catch (ex) {
                        console.log(ex);
                    }
                    return false;
                };
                try {
                    var kind = ele.getAttribute('kind');
                    if (!document.querySelector('#preview' + articleID)) {
                        pre = document.createElement('div');
                        pre.setAttribute('id', 'preview' + articleID);
                        pre.classList.add('loading');
                        pre.addEventListener('click', CommentsPreview.kill_preview);
                        ele.parentNode.parentNode.querySelector('.first').insertBefore(pre, null);
                    }
                    if (document.querySelector('#preview' + articleID).classList.contains("loading")) {
                        url = window.location.protocol + '//www.reddit.com/comments/' + articleID + '/.json?limit=' + (CommentsPreview.topComments + 5) + '&sort=' + kind;
                        xhr({
                            method: 'GET',
                            url: url,
                            onload: function(response) {
                                CommentsPreview.onloadJSON(response);
                            },
                            onerror: function(response) {
                                if (response.status === 503) {
                                    window.setTimeout(CommentsPreview.retrieveTopComments, 1000, ele, articleID);
                                }
                            }
                        });
                    } else {
                        thisPre = document.querySelector('#preview' + articleID);
                        thisPre.parentNode.parentNode.style.marginBottom = '';
                        thisPre.parentNode.removeChild(thisPre);
                    }
                } catch (e) {
                    console.log(e);
                }
            },
            onloadJSON: function(response) {
                try {
                    var i, len, content, ups, downs, contentDiv, article, author, permalink,
                        newHTML = '',
                        comments = JSON.parse(response.responseText),
                        commentsLength = comments[1].data.children.length,
                        articleID = comments[0].data.children[0].data.id,
                        threadLink = comments[0].data.children[0].data.permalink;
                    len = CommentsPreview.topComments < commentsLength ? CommentsPreview.topComments : commentsLength;
                    for (i = 0; i < len; i += 1) {
                        content = comments[1].data.children[i].data.body_html;
                        if (content) {
                            contentDiv = document.createElement('div');
                            contentDiv.innerHTML = content;
                            content = contentDiv.firstChild.textContent;
                            author = comments[1].data.children[i].data.author;
                            ups = comments[1].data.children[i].data.ups;
                            permalink = threadLink + comments[1].data.children[i].data.id;
                            newHTML += '<a class="authorLink" target="_blank" href="/u/' + author;
                            newHTML += '">' + author + '</a>&nbsp;&nbsp;';
                            newHTML += '(' + (ups >= 0 ? '+' : '') + ups + ')';
                            newHTML += '<a href="' + permalink + '" target="_blank" class="perma">permalink</a>';
                            newHTML += '<br />' + content;
                        }
                    }
                    article = document.querySelector('#preview' + articleID);
                    article.classList.remove('loading');
                    article.innerHTML = newHTML;
                    article.parentNode.parentNode.style.marginBottom = (article.offsetHeight + 5) + 'px';
                    article.removeEventListener('click', CommentsPreview.kill_preview);
                    $(article).find('a').attr('target', '_blank');
                } catch (e) {
                    console.log(e);
                }
            },
            init: function() {
                var style = '';
                style += "div[id^=preview] {box-sizing:border-box;-moz-box-sizing:border-box;border-radius:5px;white-space:normal;padding:5px;position:absolute;margin-top: 2px;border: 1px solid #ccc;box-shadow:3px 3px 5px rgba(0,0,0,0.3);}\n";
                style += ".loading:before{content:\"Loading...\";}\n";
                style += "div[id^=preview] .md{border:1px solid #ccc;background:#eee;box-sizing:border-box;-moz-box-sizing:border-box;margin:3px;padding:2px 8px;}";
                style += ".listing-page .linklisting .buttons li { vertical-align: top; }";
                style += ".perma {float:right;color:#888!important;}";
                addStyle(style);
            },
        };

        var Fresh = {
            _CACHE_PERIOD: 30 * 24 * 60 * 60 * 1000,

            _cache: reg('Freshness', {}),

            _highlight: function(cutoff) {
                try {
                    var once = false;
                    $('.entry').each(function() {
                        var date = new Date($(this).find('time').attr('datetime')).getTime();
                        if (date > cutoff) {
                            $(this).addClass('new-comment');
                            if (!once) {
                                scrollToElement(this);
                                once = true;
                            }
                        } else {
                            $(this).removeClass('new-comment');
                        }
                    });
                } catch (e) {
                    console.log(e);
                }
            },

            _commentThreadID: function() {
                var match = /\/comments\/([a-z0-9]{6,})/.exec(window.location);
                return match != null ? match[1] : null;
            },

            _lastvisit: function() {
                var cid = Fresh._commentThreadID();
                if (cid != null) {
                    var last = Fresh._cache[cid] || null;
                    if (last != null) {
                        return parseFloat(last);
                    } else {
                        return null;
                    }
                } else {
                    return null;
                }
            },

            _mark: function(time) {
                try {
                    var cid = Fresh._commentThreadID();
                    if (cid != null) {
                        Fresh._cache[cid] = time || Date.now();
                        Fresh._saveCache();
                    }
                } catch (e) {
                    console.log(e);
                }
            },

            run: function() {
                try {
                    Fresh._purgeOldCache();
                    var last = Fresh._lastvisit();
                    if (last) {
                        Fresh._highlight(last);
                    }
                    Fresh._mark();
                } catch (e) {
                    console.log(e);
                }
            },

            _purgeOldCache: function() {
                try {
                    var now = Date.now();
                    var cached;
                    for (cached in Fresh._cache) {
                        if (!Fresh._cache.hasOwnProperty(cached)) continue;
                        if ((now - Fresh._cache[cached]) >= Fresh._CACHE_PERIOD) {
                            delete Fresh._cache[cached];
                        }
                    }
                    Fresh._saveCache();
                } catch (e) {
                    console.log(e);
                }
            },

            _saveCache: function() {
                try {
                    setValue('Freshness', Fresh._cache);
                } catch (e) {
                    console.log(e);
                }
            },
        };

        function markSubscriptionStatus(doc) {
            doc = doc || document;
            if (!logged_in_p()) return;
            if (doc == document) Subscription.retrieveSubscriptions(doc);

            if (Subscription.is_load_done()) {
                $('.junkblocker_subreddit_group_title', doc).each(function() {
                    var linktext = this.innerText || this.textContent;
                    if ($(this).hasClass('junkblocker_subscription_tagged')) return;
                    $(this).addClass('junkblocker_subscription_tagged');
                    var status = Subscription.isSubscribed(linktext.replace(/^\/r\//, ''));
                    if (status == Subscription.SUB_STATUS_YES) {} else if (status == Subscription.SUB_STATUS_NO) {
                        $(this).css('color', 'blue');
                    } else {
                        $(this).css('color', 'red');
                    }
                });
            } else {
                console.log("Load not done yet", Subscription.load_requested, Subscription.load_done);
                window.setTimeout(markSubscriptionStatus, 2000, doc);
            }
        }

        function afterGrouping(adoc) {
            try {
                if (typeof adoc.grouped == 'undefined') {
                    console.log('Rescheduling afterGrouping');
                    window.setTimeout(afterGrouping, 1000, adoc);
                    return;
                }
                CommentsPreview.addPreviewLinks(adoc);
                handleEntries();
                downvoteLusers(adoc, true);
            } catch (e) {
                console.log(e);
            }
        }

        function handleMaybeMainPage(doc) {
            doc = doc || document;
            try {
                var front_page = isSomeFrontPage();
                if (front_page) {
                    $('body', doc).addClass('listing-chooser-collapsed');
                    $('a.thumbnail', doc).each(function() {
                        try {
                            if (this.href && /youtu\.?be/i.test(this.href)) {
                                $(this).attr('href', '#')
                                    .removeAttr('target')
                                    .removeAttr('click')
                                    .removeAttr('mousedown');
                            }
                        } catch (ex) {
                            console.log(ex);
                        }
                    });
                }
                if (isAMultiSubredditFrontpage()) {
                    groupSubreddits(doc);
                    afterGrouping(doc);
                } else {
                    CommentsPreview.addPreviewLinks(doc);
                    if (front_page) downvoteLusers(doc, true);
                    handleEntries();
                }
                CommentsPreview.addPreviewLinks();
                if (front_page) downvoteLusers(doc, true);
                handleEntries();
            } catch (e) {
                console.log(e);
            }
        }

        function work(doc) {
            try {
                try {
                    // https://www.reddit.com/r/privacy/comments/4aqdg0/reddit_started_tracking_the_links_we_click_heres/
                    $(".outbound").attr("data-outbound-url", null);
                    $(".outbound").attr("data-href-url", null);
                    $(".outbound").removeClass("outbound");
                    var a_col = document.getElementsByTagName('a');
                    var a, reddit_tracking_url;
                    for (var i = 0; i < a_col.length; i++) {
                        a = a_col[i];
                        reddit_tracking_url = a.getAttribute('data-href-url');
                        if (reddit_tracking_url) a.setAttribute('data-outbound-url', reddit_tracking_url);
                    }
                } catch (privary_e) {}

                doc = doc || document;
                var first_page = (doc == document);
                if (first_page) {
                    if (document.getElementById('toggleSideBar')) {
                        console.log("Main page again?");
                        return;
                    }
                    CommentsPreview.init();

                    // hide sidebar
                    $('.side').hide();
                    $("#header-bottom-right").prepend("<a href='#' id='toggleSideBar'>Sidebar</a><span class='separator'>|</span>");
                    infiniteScroll();
                    // move the search box - from Reddit fixer
                    try {
                        var s = document.getElementById('search');
                        s.firstChild.style.fontSize = '8pt';
                        document.getElementById('header-bottom-right').appendChild(s);
                    } catch (e) {
                        console.log("Could not move the search box", e);
                    }
                    $("#toggleSideBar").click(function(event) {
                        drop(event);
                        try {
                            $(".side").slideToggle();
                        } catch (ex) {
                            console.log(ex);
                        }
                        return false;
                    });

                    addStyle(
                        "body {\n" +
                        "line-height: 1.5;\n" +
                        "}\n" +
                        ".thing, .title, .loggedin,\n" +
                        "a:link.title, a:hover.title, a:visited.title,\n" +
                        "a:link.loggedin, a:hover.loggedin, a:visited.loggedin,\n" +
                        "a:link.author, a:hover.author, a:visited.author,\n" +
                        "a:link.subreddit, a:hover.subreddit, a:visited.subreddit,\n" +
                        ".tabmenu a:link, .tabmenu a:hover, .tabmenu a:visited,\n" +
                        "#header-bottom-right a:link, #header-bottom-right a:hover, #header-bottom-right a:visited\n" +
                        " {\n" +
                        " color: #333333;\n" +
                        "}\n" +
                        "a:link.admin, a:hover.admin, a:visited.admin,\n" +
                        "a:link.moderator, a:hover.moderator, a:visited.moderator {\n" +
                        " color: blue;\n" +
                        "}\n" +
                        "a:link.friend, a:hover.friend, a:visited.friend {\n" +
                        " color: red;\n" +
                        "}\n" +
                        "a:link.submitter, a:hover.submitter, a:visited.submitter {\n" +
                        " color: #66cc66;\n" +
                        "}\n" +
                        ".link .title {\n" +
                        " font-size: 10pt !important;\n" +
                        " font-weight: normal !important;\n" +
                        "}\n" +
                        ".entry .buttons li a {\n" +
                        " font-weight: normal !important;\n" +
                        "}\n" +
                        // From Reddit pretty comment boxes
                        ".comment {\n" +
                        " -moz-border-radius:7px !important;\n" +
                        " -webkit-border-radius:7px !important;\n" +
                        " border-radius:7px !important;\n" +
                        " margin-left:10px!important;\n" +
                        " margin-right:10px!important;\n" +
                        " margin-top:0px!important;\n" +
                        " margin-bottom:8px!important;\n" +

                        " background-color:#ffffff !important;\n" +
                        " border:1px solid #bbbcbf !important;\n" +
                        " padding-left:5px!important;\n" +
                        " padding-top:5px!important;\n" +
                        " padding-right:8px!important;\n" +
                        " padding-bottom:0px!important;\n" +
                        "}\n" +
                        ".comment .comment{\n" +
                        " margin-right:0px!important;\n" +
                        " background-color:#F7F7F8 !important;\n" +
                        "}\n" +
                        ".comment .comment .comment{\n" +
                        " background-color:#ffffff !important;\n" +
                        "}\n" +
                        ".comment .comment .comment .comment{\n" +
                        " background-color:#F7F7F8 !important;\n" +
                        "}\n" +
                        ".comment .comment .comment .comment .comment{\n" +
                        " background-color:#ffffff !important;\n" +
                        "}\n" +
                        ".comment .comment .comment .comment .comment .comment{\n" +
                        " background-color:#F7F7F8 !important;\n" +
                        "}\n" +
                        ".comment .comment .comment .comment .comment .comment .comment{\n" +
                        " background-color:#ffffff !important;\n" +
                        "}\n" +
                        // end pretty boxes
                        "body > .content {\n" +
                        " padding-right:0px; !important;\n" +
                        "}\n" +
                        "#siteTable_organic, .organic-listing, .promoted, .promotedlink {\n" +
                        " display: none !important;\n" +
                        "}\n" +
                        "#header, #header-bottom-right, .tabmenu li a {\n" +
                        " background-color: #f7f7f8;\n" +
                        "}\n" +
                        ".md {\n" +
                        " max-width: 100% !important;\n" +
                        "}\n" +
                        ".md a {\n" +
                        "  color: black;\n" +
                        "  background-color: #cfc;\n" +
                        "}\n" +
                        // remove dotted border and wasteful spacing from comments
                        ".comment .child {\n" +
                        "  border: none; !important;\n" +
                        "  margin-left: 0px !important;\n" +
                        "}\n" +
                        "a.give-gold {\n" +
                        "  display: none;\n" +
                        "}\n" +
                        ".entry .buttons li a:link.confidencelink, .entry .buttons li a:link.hotlink, .entry .buttons li a:link.toplink, .entry .buttons li a:link.newlink, .entry .buttons li a:link.controversiallink, .entry .buttons li a:link.oldlink, .entry .buttons li a:link.randomlink,\n" +
                        ".entry .buttons li a:hover.confidencelink, .entry .buttons li a:hover.hotlink, .entry .buttons li a:hover.toplink, .entry .buttons li a:hover.newlink, .entry .buttons li a:hover.controversiallink, .entry .buttons li a:hover.oldlink, .entry .buttons li a:hover.randomlink,\n" +
                        ".entry .buttons li a:visited.confidencelink, .entry .buttons li a:visited.hotlink, .entry .buttons li a:visited.toplink, .entry .buttons li a:visited.newlink, .entry .buttons li a:visited.controversiallink, .entry .buttons li a:visited.oldlink, .entry .buttons li a:visited.randomlink {\n" +
                        "  color: #339933;\n" +
                        "  text-decoration: none;\n" +
                        "}\n"
                    );
                    if (!$(".titlebox")) {
                        $(".side").each(function() {
                            $(this).hide();
                        });
                    }
                    //var v = $("#sr-header-area", doc);
                    //if (v) v.hide();
                    // hide user name
                    var uname = $('#header-bottom-right .user a');
                    if (!(/login or register/).test(uname.text())) {
                        //uname.text(uname.text().replace(/^\s*(\S).*$/, '$1'));
                        uname.text("user");
                    }
                }
                var _flat_list, url, ttl;
                if (location.href.replace(/[?#].*$/, '').search('/user/') != -1 && location.href.replace(/[?#].*$/, '').search('/m/') == -1) {
                    handleUserPage(doc);
                } else if (location.href.replace(/[?#].*$/, '').search('/comments/') != -1) {
                    handleCommentsPage(doc);
                } else {
                    handleMaybeMainPage(doc);
                }
            } catch (e) {
                console.log(e);
            }
        }

        function infiniteScroll() {
            var $table;
            var $tablebg;
            var fetch;
            var loading = false;

            function more() {
                fetch = $('span.nextprev a[rel="nofollow next"]').filter(function() {
                    return $(this).text() === 'next \u203a';
                });

                if (!fetch || fetch.length === 0) return;
                var tr = fetch.closest('div');
                if (!tr || !tr[0] || !tr[0].previousElementSibling || !/clearleft/.test(tr[0].previousElementSibling.className)) {
                    tr = tr.closest('div');
                }
                $tablebg = $(document.body).css('background-color');
                if (!$table) $table = $('div[id="siteTable"]');
                tr.prev().remove();
                tr.remove();
            }

            more();

            function actualScroll() {
                loading = true;
                $table.css('background-color', '#EFE');
                $.get(fetch.attr('href'), function(data) {
                    var $newtable = $('<div>').html(data).find('div[id="siteTable"]');
                    // var $trs = $newtable.find('div');
                    // $table.append($trs);
                    $table.after($newtable);

                    loading = false;
                    $table.css('background-color', $tablebg);
                    more();
                    work($newtable[0]);
                });
            }

            $(window).scroll(function() {
                if (loading) return;
                if ($(window).scrollTop() + getViewportHeight() > $(document).height() - 100) {
                    actualScroll();
                }
            });
            $(document).keydown(function(event) {
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
                        case 63: // ? - help
                        case 72: // H - help
                        case 104: // h - help
                            drop(event);
                            window.alert("h/? - Help\n\n" +
                                "n/N - Fetch next page and embed (AKA Infinite Scroll)\n\n" +
                                "r/R - Reload this page");
                            return false;
                        case 78: // N - next
                        case 110: // n
                            actualScroll();
                            return false;
                        case 114: // r - reload page
                        case 82: // R
                            window.location.reload();
                            break;
                        default:
                            console.log(code);
                            break;
                    }
                } catch (e) {
                    console.log("keydown", e);
                }
            });
        }

        // AutoPager(ize)/Pagerization support
        work();
    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("reddit.user.js ended");
} catch (safe_wrap_bottom_3) {}
// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
