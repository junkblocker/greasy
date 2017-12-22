// ==UserScript==
// @name        Clear window.opener
// @description Prevents tampering with window.opener.
// @namespace   localhost
// @include     *
// @run-at      document-start
// @version     1.0
// @grant       none
// ==/UserScript==

if (window.opener != null) {
    window.opener = null;
    console.warn('Cleared window.opener!');
}
