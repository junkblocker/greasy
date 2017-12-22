// ==UserScript==
// @name          Show Password onMouseOver
// @namespace     junkblocker
// @include       *
// @description	  Show password when mouseover on password field
// @author        LouCypher
// @license       free
// @grant         none
// @version       1.1
// ==/UserScript==

// Local copy of the original by LouCypher
(function() {
    setTimeout(function() {
        var passFields = document.querySelectorAll("input[type='password']");
        if (!passFields.length) return;
        for (var i = 0; i < passFields.length; i++) {
            passFields[i].addEventListener("mouseover", function() {
                this.type = "text";
                this.style.backgroundColor = 'black';
                this.style.color = 'black';
                // At this point you can select all and password will get shown or can
                // copy and paste it elsewhere
            }, false);
            passFields[i].addEventListener("mouseout", function() {
                this.type = "password";
            }, false);
        }
    }, 1000);
})();
