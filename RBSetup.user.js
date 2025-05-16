// ==UserScript==
// @name         RB Setup
// @namespace    Sighery
// @version      0.5
// @description  Create direct link to Rumble, and setup Rumble videos to start, set max quality, and use wide view
// @author       Sighery
// @match        https://rumble.com/v*.html*
// @match        https://reactionbase.site/*
// @match        https://reactionbase.xyz/*
// @connect      rumble.com
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/NetworkPromise.js
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/ShortNotification.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rumble.com
// ==/UserScript==

const timer = ms => new Promise(res => setTimeout(res, ms));

(async function () {
    'use strict';

    let RBVideoPageVersion = await isRBVideoPage();
    console.log(RBVideoPageVersion);
    if (RBVideoPageVersion > 0) {
        await setupRB(RBVideoPageVersion);
    } else if (window.location.href.match("(rumble\.com\/v)") !== null) {
        await setupRumble();
    }
})();

async function getRumbleEmbedNode(version) {
    if (version === 1) {
        return document.querySelector("#video-options .video-btn[onclick*='rumble.com/embed']");
    } else if (version === 2) {
        // Takes a little bit to load
        let videoContainer = document.querySelector("#video-buttons");
        while (videoContainer.children === 0) {
            await timer(100);
        }
        let videoOptions = document.querySelectorAll("#video-buttons > button");
        for (let option of videoOptions) {
            if (option.textContent.toLowerCase() === "rumble") {
                return option;
            }
        }
    }

    return null;
}

async function getRumbleEmbedLinkV1() {
    let rumbleVideo = await getRumbleEmbedNode(1);
    let rumbleLink = rumbleVideo.getAttribute("onclick");

    // const endStr = "')";
    // const startStr = "changeVideo('";
    return rumbleLink.replace(/^(changeVideo\(\')/, "").replace(/(\'\))$/, "");
}

async function getRumbleEmbedLinkV2() {
    let rumbleOption = await getRumbleEmbedNode(2);
    // Set Rumble option as active
    if (!rumbleOption.classList.contains("active")) {
        rumbleOption.click();
    }

    while (true) {
        let link = document.querySelector("#video-player > iframe").getAttribute("src");
        if (!link.includes("rumble")) {
            await timer(100);
        } else {
            return link;
        }
    }
}

async function isRBVideoPage() {
    let site = window.location.href.match("(reactionbase\.*)");
    if (site === null) return 0;
    if (await getRumbleEmbedNode(1) !== null) return 1;
    if (await getRumbleEmbedNode(2) !== null) return 2;
    return 0;
}

async function setupRB(version) {
    let rumbleLink = null;
    if (version === 1) {
        rumbleLink = await getRumbleEmbedLinkV1();
    } else if (version === 2) {
        rumbleLink = await getRumbleEmbedLinkV2();
    }

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

    let target = null;
    let directButton = null;
    let copyButton = null;
    if (version === 1) {
        target = document.querySelector("#video-options");
        directButton = stringToNode(`<button class="video-btn" aria-label="Direct Rumble"><a target="_blank" href="${link}">Direct Rumble</a></button>`);
        copyButton = stringToNode(`<button id="gm-script-copy-links" class="video-btn" aria-label="Copy links">Copy links</button>`);
    } else if (version === 2) {
        target = document.querySelector("#video-buttons");
        directButton = stringToNode(`<button class="switch-btn"><a target="_blank" href="${link}">Direct Rumble</a></button>`);
        copyButton = stringToNode(`<button id="gm-script-copy-links" class="switch-btn">Copy links</button>`);
    }

    target.appendChild(directButton);
    target.appendChild(copyButton);
    let copyLinks = `${window.location.href}  |  ${link}`;
    document.getElementById("gm-script-copy-links").addEventListener("click", () => GM_setClipboard(copyLinks, "text"));
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
    notify(`Quality ${highestQuality.textContent}`, 5000);

    highestQuality.click();

    await timer(50);

    let theaterToggle = document.querySelector(".videoPlayer-Rumble-cls div[title='Toggle theater mode']");
    theaterToggle.click();

    video = getVideo();
    video.currentTime = 0;

    // Now they've also decided to always expand the sidebar for some reason.
    if (document.querySelector("html").classList.contains("main-menu-mode-permanent")) {
        document.querySelector("button.main-menu-toggle").click();
    }

    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.caa.mp4?u=3&b=0
    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.haa.mp4?u=3&b=0
}
