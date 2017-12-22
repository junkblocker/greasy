// ==UserScript==
// @name        Conceal history.length
// @description Intercepts read access to history.length property
// @namespace   localhost
// @include     *
// @run-at      document-start
// @version     1.0.1
// @grant       none
// ==/UserScript==

let _history = {
    length: history.length
};
Object.defineProperty(history, 'length', {
    get: function() {
        if (_history.length > 2) {
            return 2;
        } else {
            return _history.length;
        }
    }
});
