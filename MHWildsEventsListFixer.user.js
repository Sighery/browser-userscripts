// ==UserScript==
// @name         Monster Hunter Wilds Event List Fixer
// @namespace    Sighery
// @version      0.1.0
// @description  Fix the events list so it's less annoying to grok
// @author       Sighery
// @match        https://info.monsterhunter.com/wilds/event-quest/*/schedule*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=monsterhunter.com
// @grant        none
// ==/UserScript==

const EVENTS_URL = "https://info.monsterhunter.com/wilds/event-quest/en-us/schedule?utc=2";
const DATE_REGEX = /\d{2}\.\d{2}\.\d{4}/g;

(function () {
    'use strict';

    if (window.location.href !== EVENTS_URL) {
        window.location.replace(EVENTS_URL);
    }

    fixWeekTabs();
    fixQuestDescriptions();
})();


function replaceUSDateFormat(input) {
    let output = input;
    let matches = input.match(DATE_REGEX);

    for (let match of matches) {
        let exploded = match.split(".");
        let fixed = [exploded[1], exploded[0], exploded[2]].join("/");
        output = output.replace(match, fixed);
    }

    return output;
}


function fixWeekTabs() {
    const TABS_SELECTOR = "ul.tab1 > li";
    for (let elem of document.querySelectorAll(TABS_SELECTOR)) {
        elem.innerHTML = replaceUSDateFormat(elem.innerHTML);
    }
}


function fixQuestDescriptions() {
    const QUESTS_SELECTOR = "table td.overview li";
    for (let elem of document.querySelectorAll(QUESTS_SELECTOR)) {
        let text = elem.textContent.toLowerCase();
        if (text.includes("start date") || text.includes("end date")) {
            elem.innerHTML = replaceUSDateFormat(elem.innerHTML);
        }
    }
}
