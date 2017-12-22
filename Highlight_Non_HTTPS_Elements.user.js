// ==UserScript==
// @id             Highlight_Non_HTTPS_Elements
// @name           Highlight Non HTTPS Elements
// @version        1.0
// @namespace      junkblocker
// @author         Manpreet Singh <junkblocker@yahoo.com>
// @description    Highlight non-HTTPS elements in the page
// @include        http://*
// @include        https://*
// @grant          none
// @run-at         document-end
// ==/UserScript==

// From original scripts by Adam Katz and Tod Beardsley

try {
  console.log("Highlight_Non_HTTPS_Elements.user.js starting");
} catch (safe_wrap_top) {};
try {
  (function() {

    var ssl_bg = "#cfb"; // green background for SSL-protected password fields
    var plain_bg = "#fcb"; // red background for non-SSL-protected password fields

    var rel_ssl = '',
      rel_plain = '';
    var pw_field = 'input[type="password"]';

    function addStyle(content) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.appendChild(document.createTextNode(content));
      var head = document.getElementsByTagName("head");
      head && head[0] ? head = head[0] : head = document.body;
      head.appendChild(style);
    }

    function pwcss(sel, rgb) {
      return sel + pw_field + ' { color:#000; background:' + rgb + '!important }\n';
    }

    if (location.protocol == "https:") {
      rel_ssl = pw_field + ", ";
    } else {
      rel_plain = pw_field + ", ";
    }

    addStyle(
      pwcss(rel_ssl + 'form[action^="https://"] ', ssl_bg) +
      pwcss(rel_plain + 'form[action^="http://"] ', plain_bg)
    );

    var forms = document.getElementsByTagName("form");

    // For each form, on each password field, note the domain it submits to
    // (unless it's the same domain as the current page).  TODO: strip subdomains?
    for (var f = 0, fl = forms.length; f < fl; f++) {
      var target;
      if (!forms[f].action || !forms[f].action.match) {
        // defaults for forms without actions -> assume JavaScript
        target = [(location.protocol == "https:"), "javascript"];
      } else {
        target = forms[f].action.match(/^http(s?):..([^\/]+)/i);
      }

      var pws = document.evaluate("//input[@type='password']", forms[f], null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

      if (!pws || !target || !target[2]) {
        continue;
      }

      // Report when domain doesn't match
      var is_secure = " will be sent to <" + target[2] + ">";
      if (location.host == target[2]) {
        is_secure = "";
      }

      if (target[2].match(/^javascript(?![^:])/)) {
        is_secure = "UNKNOWN SECURITY, password to be sent via " + target[2];
      } else if (target[1]) {
        is_secure = "SSL secured password" + is_secure;
      } else {
        is_secure = "INSECURE password" + is_secure;
      }

      for (var p = 0, pl = pws.snapshotLength; p < pl; p++) {
        var field = pws.snapshotItem(p);

        // target is SSL, same host, and already has a rollover title -> never mind
        if (target[1] && target[2] == location.host && field.title) {
          continue;
        }

        // rollover text gets security notice plus previous title on newline
        field.title = is_secure + (field.title ? "\n" + field.title : "");
      }
    }

    if (location.protocol == 'https') {
      window.setTimeout(
        function nonHTTPS() {
          srcElements = document.evaluate('//*[translate(@src, "HTP", "htp")]', document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
            //console.log(srcElements.snapshotLength + " elements found.");

            for (var i = 0; i < srcElements.snapshotLength; i++) {
              thisSrc = srcElements.snapshotItem(i);
              //console.log("Element: " + thisSrc.src + "has: " + thisSrc.src.search('http://'));
                if (thisSrc.src.search('http://') == 0) {
                  thisSrc.title = thisSrc.nodeName + ": comes from " + thisSrc.src;
                  thisSrc.style.border = "medium dotted red";
                  thisSrc.style.backgroundColor = "black";
                  thisSrc.style.color = "green";
                  thisSrc.style.zIndex = 65536;
                  thisSrc.style.visibility = "visible";
                  if (thisSrc.offsetWidth < 10) {
                    thisSrc.style.width = "10px";
                  }
                  if (thisSrc.offsetHeight < 10) {
                    thisSrc.style.height = "10px";
                  }
                }
            }
            return false;
        }, 300);
    }
  })();
} catch (safe_wrap_bottom_1) {
  try {
    console.log(safe_wrap_bottom_1);
  } catch (safe_wrap_bottom_2) {}
};
try {
  console.log("Highlight_Non_HTTPS_Elements.user.js ended");
} catch (safe_wrap_bottom_3) {};
// vim: set et fdm=indent fenc=utf-8 ff=unix ft=javascript sts=0 sw=2 ts=2 tw=79 nowrap :
