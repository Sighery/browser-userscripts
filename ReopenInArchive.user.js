// ==UserScript==
// @name         Reopen in Archive
// @namespace    Sighery
// @version      0.1
// @description  If the article is paywalled, reopen it in archive if available
// @author       Sighery
// @match        https://www.ft.com/content/*
// @connect      archive.today
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/NetworkPromise.js
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archive.today
// ==/UserScript==

(async function () {
    'use strict';

    const paywalled = isPaywalled();

    if (paywalled !== true) {
        console.log("Article is not paywalled. Not redirecting.");
        return false;
    }

    const archiveUrl = await isArchiveAvailable();

    if (archiveUrl === null) {
        console.warn("Can't find archive. Not redirecting.");
        return false;
    }

    window.location.assign(archiveUrl);
})();

function isPaywalled() {
    // Just Financial Times for now
    let paywalled = false;
    if (window.location.href.match("(ft\.com\/)") !== null) {
        paywalled = isFTPaywalled();
    }
    return paywalled;
}

function isFTPaywalled() {
    let elem = document.querySelector("[data-component='recommendedOffers']");
    return elem !== null;
}

async function isArchiveAvailable() {
    const archiveUrl = `https://archive.today/newest/${window.location.href}`;

    const requests = [
        GM_xmlhttpRequestPromise({
            method: "OPTIONS",
            url: archiveUrl,
            timeout: 2000,
        }),
        // GM_xmlhttpRequestPromise({
        //     method: "HEAD",
        //     url: archiveUrl,
        //     timeout: 2000,
        // }),
    ];

    return Promise.any(requests).then(() => archiveUrl).catch(() => null);
}
