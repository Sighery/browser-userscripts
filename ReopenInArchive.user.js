// ==UserScript==
// @name         Reopen in Archive
// @namespace    Sighery
// @version      0.1
// @description  If the article is paywalled, reopen it in archive if available
// @author       Sighery
// @match        https://www.ft.com/content/*
// @connect      archive.today
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=archive.today
// ==/UserScript==

(async function () {
    'use strict';

    const paywalled = isPaywalled();
    const archiveUrl = await isArchiveAvailable();
    if (archiveUrl !== null) {
        window.location.assign(archiveUrl);
    }
})();

function isPaywalled() {
    // Just Financial Times for now
    let paywalled = false;
    if (window.location.href.match("(ft\.com\/v)") !== null) {
        paywalled = isFTPaywalled();
    }
    return paywalled;
}

function isFTPaywalled() {
    let elem = document.querySelector("#recommendedOffers-Recommended Offers");
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

class NetworkError extends Error {
    constructor(response) {
        super('Some kind of network error happened requesting ' + response.url);
        this.name = 'NetworkError';
        this.response = response;
    }
}


class HttpError extends Error {
    constructor(response) {
        super(response.status + ' for ' + response.url);
        this.name = 'HttpError';
        this.response = response;
    }
}


class TimeoutError extends Error {
    constructor(response) {
        super('Timeout for ' + response.url);
        this.name = 'TimeoutError';
        this.response = response;
    }
}

function GM_xmlhttpRequestPromise(data) {
    // Data can have a special parameter preventredirect to throw an error if
    // final URL doesn't match initial URL (since there's no actual way to block
    // redirections with XMLHttpRequest)
    return new Promise((resolve, reject) => {
        // Match old callback functions to Promise resolve/reject
        data.onload = (response) => {
            if (data.preventredirect === true && data.url !== response.finalUrl) {
                response.url = data.url;
                response.status = 302;
                reject(new HttpError(response));
            } else if (response.status === 200) {
                resolve(response);
            } else {
                // Apparently errors >= 400 do not count to trigger onerror
                response.url = response.finalUrl;
                reject(new HttpError(response));
            }
        }
        data.ontimeout = (response) => {
            // Apparently Tampermonkey provides no response element for ontimeout
            response.url = data.url;
            reject(new TimeoutError(response));
        }
        data.onerror = (response) => {
            // Seems this is only triggered by network errors
            response.url = response.finalUrl;
            reject(new NetworkError(response));
        }

        GM_xmlhttpRequest(data);
    });
}
