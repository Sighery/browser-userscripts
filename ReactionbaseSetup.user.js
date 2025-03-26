// ==UserScript==
// @name         Reactionbase Setup
// @namespace    Sighery
// @version      0.2
// @description  Create direct link to Rumble, and setup Rumble videos to start, set max quality, and use wide view
// @author       Sighery
// @match        https://rumble.com/v*.html*
// @match        https://reactionbase.site/*
// @match        https://reactionbase.xyz/*
// @connect      rumble.com
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/NetworkPromise.js
// @grant        GM_xmlhttpRequest
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rumble.com
// ==/UserScript==

const timer = ms => new Promise(res => setTimeout(res, ms));

(async function () {
    'use strict';

    if (isReactionbaseVideoPage()) {
        await setupReactionbase();
    } else if (window.location.href.match("(rumble\.com\/v)") !== null) {
        await setupRumble();
    }
})();

function getRumbleEmbedNode() {
    return document.querySelector("#video-options .video-btn[onclick*='rumble.com/embed']");
}

function getRumbleEmbedLink() {
    let rumbleVideo = getRumbleEmbedNode();

    const endStr = "')";
    const startStr = "changeVideo('";

    let rumbleLink = rumbleVideo.getAttribute("onclick");
    if (rumbleLink.endsWith(endStr)) {
        rumbleLink = rumbleLink.substring(0, rumbleLink.length - endStr.length);
    }
    if (rumbleLink.startsWith(startStr)) {
        rumbleLink = rumbleLink.substring(startStr.length, rumbleLink.length);
    }

    return rumbleLink;
}

function isReactionbaseVideoPage() {
    let site = window.location.href.match("(reactionbase\.*)");
    let rumbleVideo = getRumbleEmbedNode();
    if (rumbleVideo === null || site === null) return false;
    return true;
}

async function setupReactionbase() {
    let rumbleLink = getRumbleEmbedLink();

    console.log(`Fetching data of embed ${rumbleLink}`);

    let response = await GM_xmlhttpRequestPromise({
        method: "GET",
        url: rumbleLink,
        timeout: 1500,
    });

    let parsed = Document.parseHTMLUnsafe(response.responseText);
    let link = parsed.querySelector("link[rel='canonical']")?.href;

    if (link === null) {
        console.warn("Couldn't get Rumble video data");
        console.warn(response);
        return false;
    }

    let target = document.querySelector("#video-options");

    let directButton = stringToNode(`<button class="video-btn" aria-label="Direct Rumble"><a target="_blank" href="${link}">Direct Rumble</a></button>`);

    target.appendChild(directButton);
}

async function setupRumble() {
    await timer(1500);

    const getVideo = () => {
        return document.querySelector(".videoPlayer-Rumble-cls video");
    }

    let video = getVideo();

    video.click();
    await timer(500);
    video.click();

    await timer(500);

    let playbackSettings = document.querySelector(".videoPlayer-Rumble-cls div[title='Playback settings']");

    // This is the only element that has a click event
    playbackSettings.children[0].click();

    let qualityScreen = playbackSettings.children[1];
    let qualityOptions = qualityScreen.children[2];
    let highestQuality = qualityOptions.children[qualityOptions.children.length - 1];

    console.log(`Setting quality ${highestQuality.textContent}`);

    highestQuality.click();

    await timer(50);

    let theaterToggle = document.querySelector(".videoPlayer-Rumble-cls div[title='Toggle theater mode']");
    theaterToggle.click();

    video = getVideo();
    video.load();


    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.caa.mp4?u=3&b=0
    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.haa.mp4?u=3&b=0
}

function stringToNode(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
};
