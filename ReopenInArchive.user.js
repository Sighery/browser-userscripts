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

class Sites {
    static FT = 0;

    static matchSite() {
        if (window.location.href.match("(ft\.com\/)") !== null) {
            return Sites.FT;
        }

        throw new Error("Site not supported");
    }
}

(async function () {
    'use strict';

    const site = Sites.matchSite();
    const paywalled = isPaywalled(site);

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

function isPaywalled(site) {
    switch (site) {
        case Sites.FT:
            return isFTPaywalled();
        default:
            return false;
    }
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

    return Promise.any(requests).catch(() => null).then((res) => {
        // Archive will always return 200 regardless, but some times the site is not yet archived.
        // An easy way to test this without parsing HTML is to look at the path in the URL. If the
        // URL still has `/newest/`, without resolving to a specific timestamp like
        // `/20250326055136/`, it means it's not yet archived, and the HTML response is that of
        // triggering an archive
        let finalUrl = new URL(res.finalUrl);
        return finalUrl.pathname.startsWith("/newest/") ? null : archiveUrl;
    });
}
