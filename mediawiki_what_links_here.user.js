// ==UserScript==
// @name           MediaWiki What links here
// @namespace      junkblocker
// @description    Show "What links here" in MediaWiki based wiki Page
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @version        1.1
// @include        http://*.wiki*/*
// @include        https://*.wiki*/*
// @include        http://wiki.*/*
// @include        https://wiki.*/*
// @include        http://*/wiki/*
// @include        https://*/wiki/*
// @include        http://themodelfactory.tld/*
// @include        http://encyclopediadramatica.tld/*
// @grant          GM_xmlhttpRequest
// @run-at         document-end
// ==/UserScript==

try {
    console.log("mediawiki_what_links_here.user.js starting");
} catch (safe_wrap_top) {}
try {
    // Copyright (c) 2006-2017, Manpreet Singh <junkblocker@yahoo.com>
    // I can no longer locate the original author of this script. If you
    // are the author, please contact me. This script should be put up on
    // userscripts.org
    (function() {
        // *************************
        // $xp - xpath helper
        // *************************
        var $xp = typeof $xp !== 'undefined' ? $xp : function(xpath, root) {
            var doc = root ? root.evaluate ? root : root.ownerDocument : document;
            var got = doc.evaluate(xpath, root || doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            var next, result = [];
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
        // xhr
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
                for (var i = aAjaxes.length; i--;) {
                    try {
                        oXhr = new aAjaxes[i].cls(aAjaxes[i].arg);
                        if (oXhr) break;
                    } catch (e) {
                        console.log("mediawiki_what_links_here", e);
                    }
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

        var limit = 100;
        var leftc = [];
        var pclass;
        var blass;
        var wlh;
        var ibt = ['p-Browse', 'p-tb'];
        if (document.body.innerHTML.indexOf('mw-panel') != -1) {
            // new
            leftc = ['mw-panel', 'panel'];
            pclass = 'portal expanded';
            bclass = 'body';
            wlh = 'WhatLinksHere';
        } else {
            // old
            leftc = ['column-one'];
            pclass = 'portlet';
            bclass = 'pBody';
            wlh = 'Whatlinkshere';
        }
        if (document.evaluate('.//div[@id="p-tb"]/h5', document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
            hnum = 'h5';
        } else {
            hnum = 'h3';
        }

        //var title;
        //document.body.classList.forEach(function(c) {
        //if (/^page-/.test(c)) title = c.replace(/^page-/, '');
        //});
        //console.log(title);

        //var search_url = window.location.href.replace(/^(.+\/).*/, "$1") + 'Special:' + wlh + '/' + encodeURIComponent(title); // + "?limit=" + limit;
        var search_url = document.evaluate('.//li[@id="t-whatlinkshere"]/a', document.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (!search_url) return;
        search_url = search_url.href;

        function waiting_img() {
            var img = document.createElement('img');
            var data = 'data:image/gif;base64,' +
                'R0lGODlhGAAYAPUAAK6urrKysrW1tbu7u729vcPDw8bGxsvLy87OztHR0dbW1tra2tvb2+Li4ubm' +
                '5ujo6O/v7/Pz8/f397S0tLq6ur6+vsXFxcjIyM/Pz9PT09XV1d7e3uHh4efn5+7u7q+vr7Gxsbi4' +
                'uMTExMzMzNnZ2enp6fLy8sLCwuDg4O3t7cDAwM3NzdTU1OPj4+Tk5Orq6uzs7La2tsHBwcrKytfX' +
                '1/Hx8bm5udLS0uvr6/Dw8NDQ0AAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/i1N' +
                'YWRlIGJ5IEtyYXNpbWlyYSBOZWpjaGV2YSAod3d3LmxvYWRpbmZvLm5ldCkAIfkEAAoA/wAsAAAA' +
                'ABgAGAAABbGgJI5kgyANqa7kEgCAsLC0CA0wPED16JwNxysXcPQkjoFAMFAIcjEehMdCLJcGxDCA' +
                'kEAajUj1KjBEFIXCQvwAU1UN5XLGerxXDINhfVy1H2J9fgYEBQyCEYAjCQSNB4E1EQwLKSKMBANm' +
                'R5ILhyIOhIaCEIojXw+Cm5CpJD8HlSsRDkY0CGmPLA4JCqixCQYFCIERb7q8NA8JCLQPJ71Iz30M' +
                'BwierCNnCnfXEqvcrCEAIfkEAAoA/wAsAAAAABgAGAAABbagJI6k9DxlqooRRlGYt86SNt2TJj7y' +
                'GnWdiMSCm1wexMClV8pUKphW8WIBWAGW1OP55HgKE0phEbgCJkxR50mpbCSRzcbTMZ/TcMzzIiRF' +
                'KmYFKhEcXiocgAEVKDQ+HEElEQsXGX2NER6WHRYFBW+XHRyMEpudnzSEjyQblJaomZGNsrOyqa5+' +
                'HaMpHRcXpyUPCwt4Ix0YGBwjEZbBG7oloSMeGhpMPLSkGRkd2CUewsTYt93YIQAh+QQACgD/ACwA' +
                'AAAAGAAYAAAGt0CJcEgsGo9GRyLhQDqFJRGBIPI8kY3ptCFxjEbNY2nZLBWmhVIjJBAQwsVEQTQy' +
                'STYi0UYiarcTR3IFdUImdnx+AiNHXgdcRiRsAiGPRoZOJHkKDlZXRyYJAiAhJEMmGyWeJB8AHx8g' +
                'jwpfh0gmBa2uH4sSCgeETwW5rrseqKrCApWehaEfpMtHHpyMDrRGJZ2MZEgeDQ3ZRSUKm6a03d9O' +
                'JXDFG9ke1lcOJCSp0EUm3vD2+/xFQQAh+QQACgD/ACwAAAAAGAAYAAAGv0CJcEgsGo/HhwPJJC4s' +
                'lkWTGTmcToeIJOJ4aJGOpVBzsmS2oxNB8y06RiOUMLLZaDeE/EnsPhzkRnh5BHxFKHZHVXkjU1Qb' +
                'KG2NRykZZm0pDimNERYTnoxCGxpsUyiengQPQgsZpE2mpwOqWyiaUymdn5GbDgsjB66SEigEICAn' +
                's0YPyUQRAwDQABZJCwvMQg4g0QAT1xIpG9bNEtnbE7ZFKclckBEn2weSKSgoqg+dIAfoU11DESn7' +
                'hAkcSCQIACH5BAAKAP8ALAAAAAAYABgAAAa0QIlwSCwaj8ikcghjsWDL5Oaw2kSHrxd2ldFKXJku' +
                '8pVhuYYRqCSyEqky4/DZGDmoRKukqxVBtqhzV3R9gnotakIRLohKGyoEIoEtCxuESiIEmXBCk5VL' +
                'EZiaaItXjpCBhUIvh6lCGyIiVkgwjEQLE7gDLUcwLawRC3csoLi4eUa9rBkfzB8rB8UTm3RQMAEA' +
                'zRMsBBMDA6hHLgHNHxMuLisr4LwD5AO1UQvjHwELrZzpu0lBACH5BAAKAP8ALAAAAAAYABgAAAa9' +
                'QIlwSCwaj8ikclhbLGrLZCeTaUSHqcfwsaClhp1OMuXUCmtQYWM2Ex/JC7dxPbMiH3JjrWG/+v9F' +
                'aUwpgkopNCsLRB0NeUkbBjIGZhKMHYVIGzKSlDWEVzWIioFhmEemDzIgAASOQil8phIyALWsmDUz' +
                'BAQrRikxtgAglxsbUBu7u46/wSALMjExMrDJrUYzwTIr0dEZNSsEMjRvMzEgBh3l3DMSNR0Psq9m' +
                'NOYgMeOA7SsUFCvxUQ8oIQkCACH5BAAKAP8ALAAAAAAYABgAAAa7QIlwSCwaj8gccknMNRpK5hJH' +
                'IuGkTcgQstlEJY5r8qkdfh0sltgIea6LjtvNsYS8izkHne0oY40kNiAxN19/YCAAigAkWDgbZRiL' +
                'igVSEDcHLEKSk5VMORgYmhINMYsgjZaQQ4GDGIaHEhBoBgZeSbBDDTYxvalFDaF7RRgxIIMGUcoH' +
                'BQWvRhiDvQYSG7UbEqDNN0cOvL0bOAUEBAVXDhg3d0NxGA2kNuQE79mxEAbkBut/cXOx/0OCAAAh' +
                '+QQACgD/ACwAAAAAGAAYAAAGwUCJcEgsGo/IJNLjiQgjnY6S6LlMApaSxMPhaKeSC2AMUEUinI5T' +
                'WPIcPRMyICA9D0uLhbsIlwc4Rh15X0QRFnIEa4UlhEUlKgEBBFJgQxE0Fxc0HXuVEhEYE6IWikkl' +
                'nGwDA6ITG1OXOq4SJausgEoRC7FPoaOlSKedlxYYjZ6FHBudx58YBAQXy5Ybt4HPz7JFHJnVRI/X' +
                'gBEbykLbGJRFlyoEOmc0FhY0Q1FJEadOoCoWF7+eC/ALmBXqYExgpSAAOw==';
            img.src = data;
            return img;
        }

        function fetchWhatLinksHere(search_url) {
            for (var i = trackback_body.childNodes.length - 1; i >= 0; i--) {
                trackback_body.removeChild(trackback_body.childNodes[i]);
            }
            trackback_body.appendChild(spinner);

            xhr({
                method: "GET",
                url: search_url,
                onerror: function() {
                    console.log('xhr failed for', search_url);
                },
                onload: function(req) {
                    var res = document.createElement('div');

                    res.innerHTML = req.responseText;
                    trackback_body.removeChild(spinner);

                    ul_result = document.evaluate('.//div[@id="bodyContent"]/div[@id="mw-content-text"]/ul', res, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                    if (ul_result.singleNodeValue) {
                        var navi_div = document.createElement('ul');
                        trackback_body.appendChild(navi_div);

                        var setNavigation = function() {

                            var navi_li = document.createElement('li');

                            var resolve_navi = function(navi) {
                                var navi_result = document.evaluate('.//div[@id="bodyContent"]/div[@id="mw-content-text"]/a[contains(text(),"' + navi + '")][contains(@href,":' + wlh + '")]', res, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                                if (navi_result.singleNodeValue) {
                                    var navi_a = navi_result.singleNodeValue;
                                    navi_a.innerText = navi_a.innerText.trim();
                                    navi_a.addEventListener("click", function(event) {
                                        fetchWhatLinksHere(navi_a.href);
                                        event.preventDefault();
                                    }, false);
                                    navi_li.appendChild(document.createTextNode("("));
                                    navi_li.appendChild(navi_a);
                                    navi_li.appendChild(document.createTextNode(")"));
                                    navi_div.appendChild(navi_li);
                                }
                            };
                            resolve_navi('previous'); // previous
                            resolve_navi('next'); // next
                        };

                        setNavigation();
                        var non_meta = false;
                        $xp('.//li/a', ul_result.singleNodeValue).forEach(function(link) {
                            if (link.href && !(/redirect=/.test(link.href)) && !(/:/.test(link.innerText))) {
                                non_meta = true;
                                var li = document.createElement('li');
                                li.appendChild(link);
                                navi_div.appendChild(li);
                                var wlh_this = document.createElement('a');
                                wlh_this.href = window.location.href.replace(/^(.+\/).*/, "$1") + 'Special:' + wlh + '/' + encodeURIComponent(link.innerText); // + "?limit=" + limit;
                                wlh_this.innerText = '<<';
                                wlh_this.addEventListener("click", function(event) {
                                    fetchWhatLinksHere(wlh_this.href);
                                    event.preventDefault();
                                }, false);
                                li.appendChild(document.createTextNode(' '));
                                li.appendChild(wlh_this);
                            }
                        });
                        if (!non_meta) {
                            var li = document.createElement('li');
                            li.appendChild(document.createTextNode('(meta)'));
                            navi_div.appendChild(li);
                        }
                        setNavigation();
                        trackback_body.style.display = 'block';
                    }
                }
            });
        }

        var trackback_div = document.createElement('div');
        trackback_div.setAttribute('id', 'p-trackback');
        trackback_div.setAttribute('class', pclass);

        var trackback_header = document.createElement(hnum);
        trackback_header.innerText = 'What links here?';
        trackback_header.cursor = 'crosshair';
        trackback_header.addEventListener("click", function(event) {
            fetchWhatLinksHere(search_url);
            event.preventDefault();
        }, false);
        trackback_div.appendChild(trackback_header);

        var trackback_body = document.createElement('div');
        trackback_body.setAttribute('class', bclass);
        trackback_div.appendChild(trackback_body);

        var spinner = waiting_img();

        var inserted = 0;
        var left_column;
        var ibt_el;
        leftc.forEach(function(left) {
            if (inserted) return;
            left_column = document.getElementById(left);
            if (!left_column) return;
            ibt.forEach(function(x) {
                if (inserted) return;
                ibt_el = document.getElementById(x);
                if (!ibt_el) return;
                left_column.insertBefore(trackback_div, ibt_el);
                inserted = 1;
            });
        });

        fetchWhatLinksHere(search_url);

    })();
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log("mediawiki_what_links_here.user.js ended ");
} catch (safe_wrap_bottom_3) {}

// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=0 nowrap :
