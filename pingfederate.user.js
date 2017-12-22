// ==UserScript==
// @id          link_pf_api_docs
// @name        Link PingFederate API Docs
// @description Link PingFederate API Docs
// @namespace   junkblocker
// @author      Manpreet Singh <junkblocker@yahoo.com>
// @match       *://*/*
// @grant       none
// @run-at      document-end
// @version     1.0
// ==/UserScript==

/* jshint maxerr: 10000 */
/* jslint browser:true */

try {
    console.log('pingfederate.user.js starting');
} catch (safe_wrap_top) {}
try {
    (function() {
        if (!(/PingFederate/.test(window.document.title))) {
            return;
        };
        var menu_ul = document.querySelector('li.nav-logout').parentNode;
        var api_link_li = document.createElement('li')
        var api_link = document.createElement('a');
        api_link.href = '/pf-admin-api/api-docs';
        api_link.text = 'API Documentation';
        api_link_li.appendChild(api_link);
        menu_ul.appendChild(api_link_li);
    }());
} catch (safe_wrap_bottom_1) {
    try {
        console.log(safe_wrap_bottom_1);
    } catch (safe_wrap_bottom_2) {}
}
try {
    console.log('pingfederate.user.js ended');
} catch (safe_wrap_bottom_3) {}

// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=4 ts=4 tw=79 nowrap :
