// ==UserScript==
// @name        Conceal window.name
// @description Intercepts read access to window.name property.
// @namespace   localhost
// @include     *
// @run-at      document-start
// @version     1.0.1
// @grant       none
// ==/UserScript==

var _window = {
    name: window.name
};
Object.defineProperty(window, 'name', {
    get: function() {
        //No CAPTCHA reCAPTCHA
        if (/^https:\/\/www\.google\.com\/recaptcha\/api2\/(?:anchor|frame)\?.+$/.test(window.location.href) && /^I[0-1]_[1-9][0-9]+$/.test(_window.name)) {
            return _window.name;
        } else {
            if (_window.name != '') {
                console.warn('Intercepted read access to window.name "' + _window.name + '" from ' + window.location);
            }
            return '';
        }
    }
});
