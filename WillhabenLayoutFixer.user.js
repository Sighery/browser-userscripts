// ==UserScript==
// @name         Willhaben Layout Fixer
// @namespace    Sighery
// @description  Improve Willhaben layout
// @version      0.1
// @downloadURL  https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/WillhabenLayoutFixer.user.js
// @updateURL    https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/WillhabenLayoutFixer.user.js
// @author       Sighery
// @match        https://www.willhaben.at/iad
// @match        https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz*
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=willhaben.at
// ==/UserScript==


(function () {
    'use strict';

    let style = document.createElement("style");
    document.head.appendChild(style);

    style.innerHTML = `
        div[class*='Grid']:has(#skip-to-content) {
            grid-template-columns: auto !important;
        }

        #skip-to-resultlist a[href^='/iad/kaufen-und-verkaufen/d/'] div:has(>img) {
            width: 400px !important;
        }

        #skip-to-resultlist a[href^='/iad/kaufen-und-verkaufen/d/'] span[aria-hidden='true'] {
            overflow: initial !important;
        }

        [id*='-result-list-'][id^='apn-'] {
            display: none !important;
        }
    `;
})();
