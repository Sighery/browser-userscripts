// ==UserScript==
// @name         Steam Key Registration Checkbox Checker
// @namespace    Sighery
// @version      2023-12-07
// @description  Automatically check the checkbox when registering new Steam keys
// @author       Sighery
// @match        https://store.steampowered.com/account/registerkey*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=steampowered.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    document.querySelector("input#accept_ssa").checked = true;
})();
