// ==UserScript==
// @name         RB Setup
// @namespace    Sighery
// @version      0.11
// @description  Create direct link to Rumble, and setup Rumble videos to start, set max quality, and use wide view
// @author       Sighery
// @match        https://rumble.com/v*.html*
// @match        https://rumble.com/embed/*
// @match        https://reactionbase.site/*
// @match        https://reactionbase.xyz/*
// @match        https://reactionbase.app/*
// @connect      rumble.com
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/NetworkPromise.js
// @require      https://github.com/Sighery/browser-userscripts/raw/refs/heads/master/common/ShortNotification.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_audio
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reactionbase.xyz
// ==/UserScript==

const timer = ms => new Promise(res => setTimeout(res, ms));

(async function () {
    'use strict';

    if (window.location.href.includes("reactionbase.app/post/")) {
        bypassRBPost();
        return null;
    }

    if (window.location.href.includes("rumble.com/embed/")) {
        redirectRumbleEmbed();
        return null;
    }

    let RBVideoPageVersion = await isRBVideoPage();
    console.log(`RB page version: ${RBVideoPageVersion}`);
    if (RBVideoPageVersion > 0) {
        await setupRB(RBVideoPageVersion);
    } else if (window.location.href.match("(rumble\.com\/v)") !== null) {
        await setupRumble();
    }
})();

async function bypassRBPost() {
    await timer(1500);

    const unlockButton = document.evaluate(
        "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'),'unlock content')]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
    ).singleNodeValue;

    if (unlockButton === null) {
        console.warn("Couldn't locate button? Exiting");
        return;
    }

    if (!unlockButton.checkVisibility()) {
        console.log("Button not visible, assuming content is unlocked");
        return;
    }

    const unlockSection = unlockButton.parentElement;
    let unlockInput;

    let waitCount = 2000;

    while (true) {
        if (waitCount >= 2000) {
            unlockButton.click();
            console.log("Clicked button");
            waitCount = 0;
        }

        unlockInput = unlockSection.querySelector("input[value*='/unlock']");
        if (unlockInput === null) {
            await timer(200);
            waitCount += 200;
            console.log("Waiting for unlock request to go through...");
            continue;
        }

        break;
    }

    const unlockUrl = new URL(unlockInput.value)
    const unlockToken = unlockUrl.pathname.replace("/unlock/", "");
    console.warn(`Unlock code is ${unlockToken}, redirecting...`);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("pass", unlockToken);
    console.warn(currentUrl.href);
    window.location.href = currentUrl.href;
}

async function redirectRumbleEmbed() {
    let href = document.querySelector("link[rel='canonical']")?.href;
    if (href === null) {
        console.warn("No ref link found?");
        return null;
    }

    window.location.href = href;
}

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

async function extractRumbleLinkFromEmbed(iframeSelector) {
    while (true) {
        let link = document.querySelector(iframeSelector).getAttribute("src");
        if (!link.includes("rumble")) {
            await timer(100);
        } else {
            return link;
        }
    }
}

async function getRumbleEmbedLinkV2() {
    let rumbleOption = await getRumbleEmbedNode(2);
    // Set Rumble option as active
    if (!rumbleOption.classList.contains("active")) {
        rumbleOption.click();
    }

    return extractRumbleLinkFromEmbed("#video-player > iframe");
}

async function getRumbleEmbedLinkV3() {
    let rumbleData = videoData.find(x => x.url.includes("rumble.com"));
    let rumbleOption = Array.from(document.querySelectorAll("#video-buttons > .switch-btn")).find(x => x.textContent == rumbleData.name);
    // Set Rumble option as active
    if (!rumbleOption.classList.contains("active")) rumbleOption.click();

    return extractRumbleLinkFromEmbed("#video-player > iframe");
}

async function getRumbleEmbedLinkV4() {
    return extractRumbleLinkFromEmbed("iframe[src*='rumble']");
}

async function isRBVideoPage() {
    let site = window.location.href.match("(reactionbase\.*)");
    if (site === null) return 0;
    if (typeof videoData !== 'undefined') return 3;
    if (document.querySelector("iframe[src*='rumble']")) return 4;
    if (await getRumbleEmbedNode(1) !== null) return 1;
    if (await getRumbleEmbedNode(2) !== null) return 2;
    return 0;
}

async function setupRB(version) {
    // Block the site from disabling right-click
    document.addEventListener("contextmenu", function (e) {
        e.stopImmediatePropagation();
    }, true);

    let rumbleLink = null;
    if (version === 1) {
        rumbleLink = await getRumbleEmbedLinkV1();
    } else if (version === 2) {
        rumbleLink = await getRumbleEmbedLinkV2();
    } else if (version === 3) {
        rumbleLink = await getRumbleEmbedLinkV3();
    } else if (version === 4) {
        rumbleLink = await getRumbleEmbedLinkV4();
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
    } else if (version === 2 || version === 3) {
        target = document.querySelector("#video-buttons");
        directButton = stringToNode(`<button class="switch-btn"><a target="_blank" href="${link}">Direct Rumble</a></button>`);
        copyButton = stringToNode(`<button id="gm-script-copy-links" class="switch-btn">Copy links</button>`);
    } else if (version === 4) {
        target = document.querySelector("#content");
        directButton = stringToNode(`<button><a target="_blank" href="${link}">Direct Rumble</a></button>`);
        copyButton = stringToNode(`<button id="gm-script-copy-links">Copy links</button>`);
    }

    target.appendChild(directButton);
    target.appendChild(copyButton);
    let copyLinks = `${window.location.href}  |  ${link}`;
    document.getElementById("gm-script-copy-links").addEventListener("click", () => GM_setClipboard(copyLinks, "text"));
}

async function setupRumble() {
    await timer(1500);

    await GM.audio.setMute({ isMuted: true });

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
    if (document.querySelector("html").classList.contains("main-menu-expanded")) {
        document.querySelector("button.main-menu-toggle").click();
    }

    await GM.audio.setMute({ isMuted: false });

    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.caa.mp4?u=3&b=0
    //     https://1a-1791.com/video/fwe2/e0/s8/2/T/n/l/d/Tnldy.haa.mp4?u=3&b=0
}
