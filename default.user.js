// ==UserScript==
// @grant          GM_log
// @grant          GM_registerMenuCommand
// @grant          GM_addStyle
// @grant          GM_openInTab
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_listValues
// @grant          GM_xmlhttpRequest
// ==/UserScript==

/* jshint maxerr: 10000 */
/* jshint browser: true */

if (typeof jQuery == 'undefined' || !jQuery) {
    if (typeof $ != 'undefined' || $ !== null) {
        console.log("$ seems defined");
    } else if (this.jQuery) {
        console.log("this.jQuery seems defined");
        $ = this.jQuery;
    } else {
        console.log("Could not get jQuery");
    }
} else {
    $ = this.jQuery = jQuery.noConflict(true);
}

var rm = typeof rm !== 'undefined' ? rm : function(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
};

var any = typeof any !== 'undefined' ? any : function(c, fn) {
    if (c.some) {
        return c.some(fn);
    }
    if (typeof c.length === 'number') {
        return Array.prototype.some.call(c, fn);
    }
    return Object.keys(c).some(function(k) {
        return fn(c[k], k, c);
    });
};
var all = typeof all !== 'undefined' ? all : function(c, fn) {
    if (c.every) {
        return c.every(fn);
    }
    if (typeof c.length === 'number') {
        return Array.prototype.every.call(c, fn);
    }
    return Object.keys(c).every(function(k) {
        return fn(c[k], k, c);
    });
};
var each = typeof each !== 'undefined' ? each : function(c, fn) {
    if (c.forEach) {
        c.forEach(fn);
    } else if (typeof c.length === 'number') {
        Array.prototype.forEach.call(c, fn);
    } else {
        Object.keys(c).forEach(function(k) {
            fn(c[k], k, c);
        });
    }
};
var map = typeof map !== 'undefined' ? map : function(c, fn) {
    if (c.map) {
        return c.map(fn);
    }
    if (typeof c.length === 'number') {
        return Array.prototype.map.call(c, fn);
    }
    return Object.keys(c).map(function(k) {
        return fn(c[k], k, c);
    });
};

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

function isDescendant(child, parent) {
    var node = child.parentNode;
    while (node !== null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

function replaceText(oldText, newText, node) {
    node = node || document.body; // base node

    var childs = node.childNodes,
        i = 0;

    while (node = childs[i]) {
        if (node.nodeType == 3) { // text node found, do the replacement
            if (node.textContent) {
                node.textContent = node.textContent.replace(oldText, newText);
            } else { // support to IE
                node.nodeValue = node.nodeValue.replace(oldText, newText);
            }
        } else { // not a text mode, look forward
            replaceText(oldText, newText, node);
        }
        i++;
    }
}

// *************************
// log(object, ...) - logs to console(s) or pops up a dialog
// *************************
var log = typeof log !== 'undefined' ? log : function() {
    var o = Array.prototype.concat.apply([], arguments);

    // Prefer console log to GM_log as it requires no setup to make logs
    // visible in firefox
    if (typeof console != 'undefined' && console.log) {
        console.log(o.join(", "));
        return true;
    } else if (typeof GM_log != 'undefined') {
        GM_log(o.join(", "));
        return true;
    } else if (window.opera) {
        opera.postError(o.join(", "));
        return true;
    } else {
        window.confirm(o.join(", "));
        return true;
    }
    return false;
};

// *************************
// hasClass/addClass/removeClass(elem, cls)
// *************************
var hasClass = typeof hasClass !== 'undefined' ? hasClass : function(elem, cls) {
    if ((typeof(elem) == 'undefined') || (elem === null)) {
        console.log("Invalid hasClass elem argument");
        return false;
    } else if ((typeof(cls) == 'undefined') || (cls === null)) {
        console.log("Invalid hasClass cls argument", cls);
        return false;
    }
    return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
};
var addClass = typeof addClass !== 'undefined' ? addClass : function(elem, cls) {
    if (typeof elem.classList !== 'undefined') {
        elem.classList.add(cls);
    } else if (!hasClass(elem, cls)) {
        elem.className += " " + cls;
    }
};
var removeClass = typeof removeClass !== 'undefined' ? removeClass : function(elem, cls) {
    if (hasClass(elem, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        elem.className = elem.className.replace(reg, ' ');
    }
};

// *************************
// addEventHandler/removeEventHandler
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

var removeEventHandler = typeof removeEventHandler !== 'undefined' ? removeEventHandler : function(target, eventName, eventHandler) {
    try {
        if (target.addEventListener) {
            target.removeEventListener(eventName, eventHandler, true);
        } else if (target.attachEvent) {
            target.detachEvent('on' + eventName, eventHandler);
        }
    } catch (e) {
        console.log(e);
    }
};

// Usage: element.addEventListener('click', makeDoubleClick(double, single));
//
// or using addEventHandler above
//
// Usage: addEventHandler(element, 'click', makeDoubleClick(double, single));
var makeDoubleClick = typeof makeDoubleClick !== 'undefined' ? makeDoubleClick : function(doubleClickCallback, singleClickCallback) {
    return (function() {
        var clicks = 0,
            timeout;
        return function() {
            clicks++;
            if (clicks == 1) {
                if (singleClickCallback) singleClickCallback.apply(this, arguments);
                timeout = setTimeout(function() {
                    clicks = 0;
                }, 400);
            } else {
                if (timeout) clearTimeout(timeout);
                if (doubleClickCallback) doubleClickCallback.apply(this, arguments);
                clicks = 0;
            }
        };
    }());
};

var drop = typeof drop !== 'undefined' ? drop : function(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
    } catch (ex) {
        console.log(ex);
    }
};

// *************************
// mouseClick(element)
// *************************
var mouseClick = typeof mouseClick !== 'undefined' ? mouseClick : function(elem, a_button) {
    var button = a_button || 0;
    var ev = document.createEvent("MouseEvents");
    //ev.initEvent("click", true, true);
    ev.initMouseEvent('click', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null);
    elem.dispatchEvent(ev);
};
var mouseDown = typeof mouseDown !== 'undefined' ? mouseDown : function(elem, a_button) {
    var button = a_button || 0;
    var ev = document.createEvent("MouseEvents");
    //ev.initEvent("mousedown", true, true);
    ev.initMouseEvent('mousedown', true, true, window, 0, 1, 1, 1, 1, false, false, false, false, button, null);
    elem.dispatchEvent(ev);
};

// *************************
// registerMenuCommand
// *************************
var registerMenuCommand = typeof GM_registerMenuCommand !== 'undefined' ? GM_registerMenuCommand : function() {};

// *************************
// makeMenuToggle(key, defaultBoolValue, toggleToTrueText, toggleToFalseText, optionalMenuPrefix)
//
// Requires: getValue
// Requires: setValue
// *************************
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
// addScript
// *************************
var addScript = typeof addScript !== 'undefined' ? addScript : function(script) {

    var heads = document.getElementsByTagName('head');
    var root = heads ? heads[0] : document.body;
    var s = document.createElement('script');
    s.language = 'javascript';
    s.type = 'text/javascript';
    s.text = script;
    root.appendChild(s);
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
    style.type = "text/css";
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

// *************************
// openInTab
// *************************
var openInTab = typeof GM_openInTab !== 'undefined' ? GM_openInTab : window.open;

// *************************
// Typed storage variables
//
// Requires: log()
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
var _REG = {};

var isGM = (typeof GM_getValue != 'undefined' && typeof GM_getValue('a', 'b') != 'undefined');
// XXX: This may not be compatible with cooked getValue because of
// 'undefined'/'null'
var getRawValue = isGM ? GM_getValue : function(name, def) {
    var s;
    try {
        s = localStorage.getItem(name);
    } catch (e) {
        s = def;
    }
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

var reg = typeof reg !== 'undefined' ? reg : function(name, type_defaults, ok_p) {
    //log('DEBUG: reg(', name, ',', type_defaults, ',', ok_p, ')');
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
            //log("DEBUG: Checking that value", v, "of", name, "is of type", typeof type_defaults);
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

// *************************
// forEach
//
// requires: log(...)
// *************************
var forEach = typeof forEach !== 'undefined' ? forEach : function(lst, func) {
    var i;
    if (lst.snapshotItem) {
        i = 0;
        var len = lst.snapshotLength;
        while (i < len) {
            func(lst.snapshotItem(i), i, lst);
            i++;
        }
    } else if (lst.iterateNext) {
        var item;
        while (item = lst.iterateNext()) {
            func(item, lst);
        }
    } else if (lst.forEach) {
        lst.forEach(func);
    } else if (typeof lst.length != 'undefined' && typeof lst === 'object') {
        Array.forEach(lst, func);
    } else if (typeof lst === 'object') {
        for (i in lst) func(lst[i], i, lst);
    } else {
        log("forEach could not figure out what to do with", lst);
    }
};

// *************************
// $xp - xpath helper
// *************************
var $xp = typeof $xp !== 'undefined' ? $xp : function(xpath, root) {
    var doc = root ? root.evaluate ? root : root.ownerDocument : document;
    var got = doc.evaluate(xpath, root || doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var next, result = [];
    console.log(got.resultType, got);
    switch (got.resultType) {
        case got.STRING_TYPE:
            return got.stringValue;
        case got.NUMBER_TYPE:
            return got.numberValue;
        case got.BOOLEAN_TYPE:
            return got.booleanValue;
        default:
            if (got.snapshotItem) {
                var i = 0;
                var len = got.snapshotLength;
                while (i < len) {
                    result.push(got.snapshotItem(i));
                    i++;
                }
            } else if (got.iterateNext) {
                while ((next = got.iterateNext()))
                    result.push(next);
            }
            return result;
    }
    return arr;
};

// *************************
// $xp1 - Returns only the first element of the array returned by $x (or null
// if the array was empty)
// *************************
var $xp1 = typeof $xp1 !== 'undefined' ? $xp1 : function(exp, node) {
    if (!node || node === '') node = document;
    return document.evaluate(exp, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

// *************************
// type(object) - returns the type of an object as a string e.g. 'Function'
// *************************
var type = typeof type !== 'undefined' ? type : function(o) {
    return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
};

var isSafari = typeof isSafari !== 'undefined' ? isSafari : function() {
    return navigator.appVersion.search("Safari") != -1;
};

var isChrome = typeof isChrome !== 'undefined' ? isChrome : function() {
    // or Chromium etc.
    return navigator.appVersion.search("Chrome") != -1;
};

// *************************
// xhr
//
// uses = getValue/log
// *************************
var xhr;
if (typeof GM_xmlhttpRequest !== "undefined") {
    xhr = GM_xmlhttpRequest;
} else {
    xhr = function(details) {
        details.method = details.method.toUpperCase() || "GET";
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
// *************************
// getBaseDomain(url_or_hostname)
//
// Originally from - supergenpass.com bookmarklet
// *************************

// These are pulled out of the function for repeated use speedup
var DOMAIN_LIST = 'ac.ac|com.ac|edu.ac|gov.ac|net.ac|mil.ac|org.ac|com.ae|net.ae|org.ae|gov.ae|ac.ae|co.ae|sch.ae|pro.ae|com.ai|org.ai|edu.ai|gov.ai|com.ar|net.ar|org.ar|gov.ar|mil.ar|edu.ar|int.ar|co.at|ac.at|or.at|gv.at|priv.at|com.au|gov.au|org.au|edu.au|id.au|oz.au|info.au|net.au|asn.au|csiro.au|telememo.au|conf.au|otc.au|id.au|com.az|net.az|org.az|com.bb|net.bb|org.bb|ac.be|belgie.be|dns.be|fgov.be|com.bh|gov.bh|net.bh|edu.bh|org.bh|com.bm|edu.bm|gov.bm|org.bm|net.bm|adm.br|adv.br|agr.br|am.br|arq.br|art.br|ato.br|bio.br|bmd.br|cim.br|cng.br|cnt.br|com.br|coop.br|ecn.br|edu.br|eng.br|esp.br|etc.br|eti.br|far.br|fm.br|fnd.br|fot.br|fst.br|g12.br|ggf.br|gov.br|imb.br|ind.br|inf.br|jor.br|lel.br|mat.br|med.br|mil.br|mus.br|net.br|nom.br|not.br|ntr.br|odo.br|org.br|ppg.br|pro.br|psc.br|psi.br|qsl.br|rec.br|slg.br|srv.br|tmp.br|trd.br|tur.br|tv.br|vet.br|zlg.br|com.bs|net.bs|org.bs|ab.ca|bc.ca|mb.ca|nb.ca|nf.ca|nl.ca|ns.ca|nt.ca|nu.ca|on.ca|pe.ca|qc.ca|sk.ca|yk.ca|gc.ca|co.ck|net.ck|org.ck|edu.ck|gov.ck|com.cn|edu.cn|gov.cn|net.cn|org.cn|ac.cn|ah.cn|bj.cn|cq.cn|gd.cn|gs.cn|gx.cn|gz.cn|hb.cn|he.cn|hi.cn|hk.cn|hl.cn|hn.cn|jl.cn|js.cn|ln.cn|mo.cn|nm.cn|nx.cn|qh.cn|sc.cn|sn.cn|sh.cn|sx.cn|tj.cn|tw.cn|xj.cn|xz.cn|yn.cn|zj.cn|arts.co|com.co|edu.co|firm.co|gov.co|info.co|int.co|nom.co|mil.co|org.co|rec.co|store.co|web.co|ac.cr|co.cr|ed.cr|fi.cr|go.cr|or.cr|sa.cr|com.cu|net.cu|org.cu|ac.cy|com.cy|gov.cy|net.cy|org.cy|co.dk|art.do|com.do|edu.do|gov.do|gob.do|org.do|mil.do|net.do|sld.do|web.do|com.dz|org.dz|net.dz|gov.dz|edu.dz|ass.dz|pol.dz|art.dz|com.ec|k12.ec|edu.ec|fin.ec|med.ec|gov.ec|mil.ec|org.ec|net.ec|com.ee|pri.ee|fie.ee|org.ee|med.ee|com.eg|edu.eg|eun.eg|gov.eg|net.eg|org.eg|sci.eg|com.er|net.er|org.er|edu.er|mil.er|gov.er|ind.er|com.es|org.es|gob.es|edu.es|nom.es|com.et|gov.et|org.et|edu.et|net.et|biz.et|name.et|info.et|ac.fj|com.fj|gov.fj|id.fj|org.fj|school.fj|com.fk|ac.fk|gov.fk|net.fk|nom.fk|org.fk|asso.fr|nom.fr|barreau.fr|com.fr|prd.fr|presse.fr|tm.fr|aeroport.fr|assedic.fr|avocat.fr|avoues.fr|cci.fr|chambagri.fr|chirurgiens-dentistes.fr|experts-comptables.fr|geometre-expert.fr|gouv.fr|greta.fr|huissier-justice.fr|medecin.fr|notaires.fr|pharmacien.fr|port.fr|veterinaire.fr|com.ge|edu.ge|gov.ge|mil.ge|net.ge|org.ge|pvt.ge|co.gg|org.gg|sch.gg|ac.gg|gov.gg|ltd.gg|ind.gg|net.gg|alderney.gg|guernsey.gg|sark.gg|com.gr|edu.gr|gov.gr|net.gr|org.gr|com.gt|edu.gt|net.gt|gob.gt|org.gt|mil.gt|ind.gt|com.gu|edu.gu|net.gu|org.gu|gov.gu|mil.gu|com.hk|net.hk|org.hk|idv.hk|gov.hk|edu.hk|co.hu|2000.hu|erotika.hu|jogasz.hu|sex.hu|video.hu|info.hu|agrar.hu|film.hu|konyvelo.hu|shop.hu|org.hu|bolt.hu|forum.hu|lakas.hu|suli.hu|priv.hu|casino.hu|games.hu|media.hu|szex.hu|sport.hu|city.hu|hotel.hu|news.hu|tozsde.hu|tm.hu|erotica.hu|ingatlan.hu|reklam.hu|utazas.hu|ac.id|co.id|go.id|mil.id|net.id|or.id|co.il|net.il|org.il|ac.il|gov.il|k12.il|muni.il|idf.il|co.im|net.im|org.im|ac.im|lkd.co.im|gov.im|nic.im|plc.co.im|co.in|net.in|ac.in|ernet.in|gov.in|nic.in|res.in|gen.in|firm.in|mil.in|org.in|ind.in|ac.ir|co.ir|gov.ir|id.ir|net.ir|org.ir|sch.ir|ac.je|co.je|net.je|org.je|gov.je|ind.je|jersey.je|ltd.je|sch.je|com.jo|org.jo|net.jo|gov.jo|edu.jo|mil.jo|ad.jp|ac.jp|co.jp|go.jp|or.jp|ne.jp|gr.jp|ed.jp|lg.jp|net.jp|org.jp|gov.jp|hokkaido.jp|aomori.jp|iwate.jp|miyagi.jp|akita.jp|yamagata.jp|fukushima.jp|ibaraki.jp|tochigi.jp|gunma.jp|saitama.jp|chiba.jp|tokyo.jp|kanagawa.jp|niigata.jp|toyama.jp|ishikawa.jp|fukui.jp|yamanashi.jp|nagano.jp|gifu.jp|shizuoka.jp|aichi.jp|mie.jp|shiga.jp|kyoto.jp|osaka.jp|hyogo.jp|nara.jp|wakayama.jp|tottori.jp|shimane.jp|okayama.jp|hiroshima.jp|yamaguchi.jp|tokushima.jp|kagawa.jp|ehime.jp|kochi.jp|fukuoka.jp|saga.jp|nagasaki.jp|kumamoto.jp|oita.jp|miyazaki.jp|kagoshima.jp|okinawa.jp|sapporo.jp|sendai.jp|yokohama.jp|kawasaki.jp|nagoya.jp|kobe.jp|kitakyushu.jp|utsunomiya.jp|kanazawa.jp|takamatsu.jp|matsuyama.jp|com.kh|net.kh|org.kh|per.kh|edu.kh|gov.kh|mil.kh|ac.kr|co.kr|go.kr|ne.kr|or.kr|pe.kr|re.kr|seoul.kr|kyonggi.kr|com.kw|net.kw|org.kw|edu.kw|gov.kw|com.la|net.la|org.la|com.lb|org.lb|net.lb|edu.lb|gov.lb|mil.lb|com.lc|edu.lc|gov.lc|net.lc|org.lc|com.lv|net.lv|org.lv|edu.lv|gov.lv|mil.lv|id.lv|asn.lv|conf.lv|com.ly|net.ly|org.ly|co.ma|net.ma|org.ma|press.ma|ac.ma|com.mk|com.mm|net.mm|org.mm|edu.mm|gov.mm|com.mn|org.mn|edu.mn|gov.mn|museum.mn|com.mo|net.mo|org.mo|edu.mo|gov.mo|com.mt|net.mt|org.mt|edu.mt|tm.mt|uu.mt|com.mx|net.mx|org.mx|gob.mx|edu.mx|com.my|org.my|gov.my|edu.my|net.my|com.na|org.na|net.na|alt.na|edu.na|cul.na|unam.na|telecom.na|com.nc|net.nc|org.nc|ac.ng|edu.ng|sch.ng|com.ng|gov.ng|org.ng|net.ng|gob.ni|com.ni|net.ni|edu.ni|nom.ni|org.ni|com.np|net.np|org.np|gov.np|edu.np|ac.nz|co.nz|cri.nz|gen.nz|geek.nz|govt.nz|iwi.nz|maori.nz|mil.nz|net.nz|org.nz|school.nz|com.om|co.om|edu.om|ac.om|gov.om|net.om|org.om|mod.om|museum.om|biz.om|pro.om|med.om|com.pa|net.pa|org.pa|edu.pa|ac.pa|gob.pa|sld.pa|edu.pe|gob.pe|nom.pe|mil.pe|org.pe|com.pe|net.pe|com.pg|net.pg|ac.pg|com.ph|net.ph|org.ph|mil.ph|ngo.ph|aid.pl|agro.pl|atm.pl|auto.pl|biz.pl|com.pl|edu.pl|gmina.pl|gsm.pl|info.pl|mail.pl|miasta.pl|media.pl|mil.pl|net.pl|nieruchomosci.pl|nom.pl|org.pl|pc.pl|powiat.pl|priv.pl|realestate.pl|rel.pl|sex.pl|shop.pl|sklep.pl|sos.pl|szkola.pl|targi.pl|tm.pl|tourism.pl|travel.pl|turystyka.pl|com.pk|net.pk|edu.pk|org.pk|fam.pk|biz.pk|web.pk|gov.pk|gob.pk|gok.pk|gon.pk|gop.pk|gos.pk|edu.ps|gov.ps|plo.ps|sec.ps|com.pt|edu.pt|gov.pt|int.pt|net.pt|nome.pt|org.pt|publ.pt|com.py|net.py|org.py|edu.py|com.qa|net.qa|org.qa|edu.qa|gov.qa|asso.re|com.re|nom.re|com.ro|org.ro|tm.ro|nt.ro|nom.ro|info.ro|rec.ro|arts.ro|firm.ro|store.ro|www.ro|com.ru|net.ru|org.ru|gov.ru|pp.ru|com.sa|edu.sa|sch.sa|med.sa|gov.sa|net.sa|org.sa|pub.sa|com.sb|net.sb|org.sb|edu.sb|gov.sb|com.sd|net.sd|org.sd|edu.sd|sch.sd|med.sd|gov.sd|tm.se|press.se|parti.se|brand.se|fh.se|fhsk.se|fhv.se|komforb.se|kommunalforbund.se|komvux.se|lanarb.se|lanbib.se|naturbruksgymn.se|sshn.se|org.se|pp.se|com.sg|net.sg|org.sg|edu.sg|gov.sg|per.sg|com.sh|net.sh|org.sh|edu.sh|gov.sh|mil.sh|gov.st|saotome.st|principe.st|consulado.st|embaixada.st|org.st|edu.st|net.st|com.st|store.st|mil.st|co.st|com.sv|org.sv|edu.sv|gob.sv|red.sv|com.sy|net.sy|org.sy|gov.sy|ac.th|co.th|go.th|net.th|or.th|com.tn|net.tn|org.tn|edunet.tn|gov.tn|ens.tn|fin.tn|nat.tn|ind.tn|info.tn|intl.tn|rnrt.tn|rnu.tn|rns.tn|tourism.tn|com.tr|net.tr|org.tr|edu.tr|gov.tr|mil.tr|bbs.tr|k12.tr|gen.tr|co.tt|com.tt|org.tt|net.tt|biz.tt|info.tt|pro.tt|int.tt|coop.tt|jobs.tt|mobi.tt|travel.tt|museum.tt|aero.tt|name.tt|gov.tt|edu.tt|nic.tt|us.tt|uk.tt|ca.tt|eu.tt|es.tt|fr.tt|it.tt|se.tt|dk.tt|be.tt|de.tt|at.tt|au.tt|co.tv|com.tw|net.tw|org.tw|edu.tw|idv.tw|gov.tw|com.ua|net.ua|org.ua|edu.ua|gov.ua|ac.ug|co.ug|or.ug|go.ug|co.uk|me.uk|org.uk|edu.uk|ltd.uk|plc.uk|net.uk|sch.uk|nic.uk|ac.uk|gov.uk|nhs.uk|police.uk|mod.uk|dni.us|fed.us|com.uy|edu.uy|net.uy|org.uy|gub.uy|mil.uy|com.ve|net.ve|org.ve|co.ve|edu.ve|gov.ve|mil.ve|arts.ve|bib.ve|firm.ve|info.ve|int.ve|nom.ve|rec.ve|store.ve|tec.ve|web.ve|co.vi|net.vi|org.vi|com.vn|biz.vn|edu.vn|gov.vn|net.vn|org.vn|int.vn|ac.vn|pro.vn|info.vn|health.vn|name.vn|com.vu|edu.vu|net.vu|org.vu|de.vu|ch.vu|fr.vu|com.ws|net.ws|org.ws|gov.ws|edu.ws|ac.yu|co.yu|edu.yu|org.yu|com.ye|net.ye|org.ye|gov.ye|edu.ye|mil.ye|ac.za|alt.za|bourse.za|city.za|co.za|edu.za|gov.za|law.za|mil.za|net.za|ngo.za|nom.za|org.za|school.za|tm.za|web.za|co.zw|ac.zw|org.zw|gov.zw|eu.org|au.com|br.com|cn.com|de.com|de.net|eu.com|gb.com|gb.net|hu.com|no.com|qc.com|ru.com|sa.com|se.com|uk.com|uk.net|us.com|uy.com|za.com|dk.org|tel.no|fax.nr|mob.nr|mobil.nr|mobile.nr|tel.nr|tlf.nr|e164.arpa|za.net|za.org'.split('|');

var getBaseDomain = typeof getBaseDomain !== 'undefined' ? getBaseDomain : function(url) {
    var hostname = url.toLowerCase();
    hostname = hostname.replace(/^\s*|\s*$/g, '');
    hostname = hostname.replace(/^[a-z]+[0-9a-z-]*:\/\//, '');
    hostname = hostname.replace(/^([^\/]+).*/, '$1');
    hostname = hostname.replace(/^.*:.*@/, '');
    hostname = hostname.replace(/:\d+$/, '');
    hostname = hostname.split('.');

    var domain;

    /*jsl:ignore*/
    if (hostname[2] != null) { // NOTE: Don't mess with this expression!!!!
        /*jsl:end*/
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
};

// cloneStyleTo(source_element, destination_element)
var cloneStyleTo = typeof cloneStyleTo !== 'undefined' ? cloneStyleTo : function(from, to) {
    to.style.cssText = window.getComputedStyle(from, null).cssText;
};

// *************************
// toggleFullScreen(id_or_element)
//
// Toggle the specified id or element to full screen mode using HTML5 full
// screen api
// *************************
var toggleFullScreen = typeof toggleFullScreen !== 'undefined' ? toggleFullScreen : function(id_or_element, doc) {
    doc = doc || document;
    if (!id_or_element) {
        if (typeof "log" == "function") {
            log("toggleFullScreen: An ID or element must be passed");
        }
        return;
    }
    if (typeof id_or_element == typeof "") {
        id_or_element = doc.getElementById(id_or_element);
        if (!id_or_element) {
            if (typeof "log" == "function") {
                log("toggleFullScreen: Could not find the specified id_or_element");
            }
            return;
        }
    }
    var pfx = ["webkit", "moz", "ms", "o", ""];

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

    if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
        RunPrefixMethod(document, "CancelFullScreen");
    } else {
        RunPrefixMethod(id_or_element, "RequestFullScreen");
    }
};

// calculate the contrast of a color to decide if white or black text color should be used
//
// Returns: black or white based on hexcolor
// Example: getContrastYIQ('00ff00')
function getContrastYIQ(hexcolor) {
    if (hexcolor.length > 6)
        hexcolor = hexcolor.substring(hexcolor.length - 6, hexcolor.length);

    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}

// *************************
// changeLuminanceOfColorByFraction("#69c", 0);		// returns "#6699cc"
// changeLuminanceOfColorByFraction("6699CC", 0.2);	// "#7ab8f5" - 20% lighter
// changeLuminanceOfColorByFraction("69C", -0.5);	// "#334d66" - 50% darker
// changeLuminanceOfColorByFraction("000", 1);		// "#000000" - true black cannot be made lighter!
//
// NOTE: CSS HAS HSL or HSLA LIKE SO:
//
// color: hsla(50, 80%, 20%, 0.5);
// background-color: hsl(120, 100%, 50%);
//
// *************************
var changeLuminanceOfColorByFraction = typeof changeLuminanceOfColorByFraction !== 'undefined' ? changeLuminanceOfColorByFraction : function(hex, signedLuminanceFraction) {
    hex = hex || '#ffffff';
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    signedLuminanceFraction = signedLuminanceFraction || 0;
    // convert to decimal and change luminosity
    var rgb = "#",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * signedLuminanceFraction)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    return rgb;
};

var xorEncode = typeof xorEncode !== 'undefined' ? xorEncode : function(txt, pass) {
    var ord = [];
    var buf = "";

    for (z = 1; z <= 255; z++) {
        ord[String.fromCharCode(z)] = z;
    }

    for (j = z = 0; z < txt.length; z++) {
        buf += String.fromCharCode(ord[txt.substr(z, 1)] ^ ord[pass.substr(j, 1)]);
        j = (j < pass.length) ? j + 1 : 0;
    }

    return buf;
};

// http://blog.mackerron.com/2010/08/08/extended-multi-line-js-regexps/
var convertRegExpSource = typeof convertRegExpSource !== 'undefined' ? convertRegExpSource : function(source, ext, multi) { // string, boolean, boolean
    if (!ext && !multi) return source;
    var convertedSource = '',
        len = source.length;
    var inCharClass = false,
        inComment = false,
        justBackslashed = false;
    for (var i = 0; i < len; i++) {
        var c = source.charAt(i);
        if (justBackslashed) {
            if (!inComment) convertedSource += c;
            justBackslashed = false;
            continue;
        }
        if (c == '\\') {
            if (!inComment) convertedSource += c;
            justBackslashed = true;
            continue;
        }
        if (inCharClass) {
            convertedSource += c;
            if (c == ']') inCharClass = false;
            continue;
        }
        if (inComment) {
            if (c == "\n" || c == "\r") inComment = false;
            continue;
        }
        if (c == '[') {
            convertedSource += c;
            inCharClass = true;
            continue;
        }
        if (ext && c == '#') {
            inComment = true;
            continue;
        }
        if (multi && c == '.') {
            convertedSource += '[\\s\\S]';
            continue;
        }
        if (!ext || !c.match(/\s/)) convertedSource += c;
    }
    return convertedSource;
};

function findPos(obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj !== null && obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }
    return [curleft, curtop];
}

// *************************
// scrollToElement(element)
//
// requires: findPos(obj)
// *************************
var scrollToElement = typeof scrollToElement !== 'undefined' ? scrollToElement : function(theElement) {
    var pos = findPos(theElement);

    window.scrollTo(pos[0], pos[1]);
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

// returns true if even a single pixel is in the viewport vertically
// requires getViewportHeight and $ (jQuery)
function elementInViewport(el) {
    var viewport = {};
    viewport.top = 0;
    viewport.scrolled = (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
    viewport.bottom = getViewportHeight();
    var bounds = {};
    bounds.topRelativeToViewport = $(el).offset().top - viewport.scrolled;
    bounds.bottomRelativeToViewport = bounds.topRelativeToViewport + $(el).outerHeight();
    return (
        (bounds.topRelativeToViewport >= viewport.top && bounds.topRelativeToViewport <= viewport.bottom) ||
        (bounds.bottomRelativeToViewport >= viewport.top && bounds.bottomRelativeToViewport <= viewport.bottom));
}

// returns true if ALL OF AN ELEMENT is in the viewport vertically
// requires getViewportHeight and $ (jQuery)
//
// elementCompletelyInViewport(elem, 10) - check if the elem is completly in
// the viewport and even has 10 pixels of space (vertically only) around it
function elementCompletelyInViewport(el, padding) {
    padding = padding || 0;
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

function compareVersion(new_version, old_version) {
    var r_parts = new_version.split('.'),
        l_parts = old_version.split('.'),
        r_len = r_parts.length,
        l_len = l_parts.length,
        r = l = 0;
    for (var i = 0, len = (r_len > l_len ? r_len : l_len); i < len && r == l; ++i) {
        r = +(r_parts[i] || '0');
        l = +(l_parts[i] || '0');
    }
    return (r !== l) ? r > l : false;
}

function unescapeHTML(s) {
    return s.replace('&amp;', '&').replace('&lt;', "<").replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', '\'');
}

/******************************************************************************
 * saveAsFile(text, filename, mimetype)
 *
 * Example: saveAsFile("Some content","filename.txt","text/plain;charset=utf-8");
 ******************************************************************************
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs = saveAs || function(e) {
    "use strict";
    if (typeof e === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
        return
    }
    var t = e.document,
        n = function() {
            return e.URL || e.webkitURL || e
        },
        r = t.createElementNS("http://www.w3.org/1999/xhtml", "a"),
        o = "download" in r,
        i = function(e) {
            var t = new MouseEvent("click");
            e.dispatchEvent(t)
        },
        a = /constructor/i.test(e.HTMLElement),
        f = /CriOS\/[\d]+/.test(navigator.userAgent),
        u = function(t) {
            (e.setImmediate || e.setTimeout)(function() {
                throw t
            }, 0)
        },
        d = "application/octet-stream",
        s = 1e3 * 40,
        c = function(e) {
            var t = function() {
                if (typeof e === "string") {
                    n().revokeObjectURL(e)
                } else {
                    e.remove()
                }
            };
            setTimeout(t, s)
        },
        l = function(e, t, n) {
            t = [].concat(t);
            var r = t.length;
            while (r--) {
                var o = e["on" + t[r]];
                if (typeof o === "function") {
                    try {
                        o.call(e, n || e)
                    } catch (i) {
                        u(i)
                    }
                }
            }
        },
        p = function(e) {
            if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)) {
                return new Blob([String.fromCharCode(65279), e], {
                    type: e.type
                })
            }
            return e
        },
        v = function(t, u, s) {
            if (!s) {
                t = p(t)
            }
            var v = this,
                w = t.type,
                m = w === d,
                y, h = function() {
                    l(v, "writestart progress write writeend".split(" "))
                },
                S = function() {
                    if ((f || m && a) && e.FileReader) {
                        var r = new FileReader;
                        r.onloadend = function() {
                            var t = f ? r.result : r.result.replace(/^data:[^;]*;/, "data:attachment/file;");
                            var n = e.open(t, "_blank");
                            if (!n) e.location.href = t;
                            t = undefined;
                            v.readyState = v.DONE;
                            h()
                        };
                        r.readAsDataURL(t);
                        v.readyState = v.INIT;
                        return
                    }
                    if (!y) {
                        y = n().createObjectURL(t)
                    }
                    if (m) {
                        e.location.href = y
                    } else {
                        var o = e.open(y, "_blank");
                        if (!o) {
                            e.location.href = y
                        }
                    }
                    v.readyState = v.DONE;
                    h();
                    c(y)
                };
            v.readyState = v.INIT;
            if (o) {
                y = n().createObjectURL(t);
                setTimeout(function() {
                    r.href = y;
                    r.download = u;
                    i(r);
                    h();
                    c(y);
                    v.readyState = v.DONE
                });
                return
            }
            S()
        },
        w = v.prototype,
        m = function(e, t, n) {
            return new v(e, t || e.name || "download", n)
        };
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
        return function(e, t, n) {
            t = t || e.name || "download";
            if (!n) {
                e = p(e)
            }
            return navigator.msSaveOrOpenBlob(e, t)
        }
    }
    w.abort = function() {};
    w.readyState = w.INIT = 0;
    w.WRITING = 1;
    w.DONE = 2;
    w.error = w.onwritestart = w.onprogress = w.onwrite = w.onabort = w.onerror = w.onwriteend = null;
    return m
}(typeof self !== "undefined" && self || typeof window !== "undefined" && window || this.content);
if (typeof module !== "undefined" && module.exports) {
    module.exports.saveAs = saveAs
} else if (typeof define !== "undefined" && define !== null && define.amd !== null) {
    define([], function() {
        return saveAs
    })
}
var saveAsFile = typeof saveAsFile !== 'undefined' ? saveAsFile : function(text, filename, mimetype) {
    try {
        var blob = new Blob([text], {
            type: mimetype
        });
        saveAs(blob, filename);
    } catch (e) {
        window.open("data:" + mimetype + "," + encodeURIComponent(text), '_blank', '');
    }
};
// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=2 ts=2 tw=79 nowrap :
