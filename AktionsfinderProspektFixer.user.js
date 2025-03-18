// ==UserScript==
// @name         Aktionsfinder Prospekt Fixer
// @namespace    Sighery
// @version      0.1
// @description  Fix prospect view having some weird padding on the right side
// @author       Sighery
// @match        https://www.aktionsfinder.at/l/*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aktionsfinder.at
// @grant        none
// ==/UserScript==

const timer = ms => new Promise(res => setTimeout(res, ms));

(async function () {
    'use strict';

    // Magazine is formed via JS after load. There's a div that gets served
    // with the template but it's empty and only loaded after script runs.
    while (true) {
        let elem = document.querySelector("#root > div > div:nth-child(2)");
        if (elem.className !== "") {
            console.log(elem);
            elem.style.paddingRight = "0px";
            break;
        }

        await timer(100);
    }
})();
