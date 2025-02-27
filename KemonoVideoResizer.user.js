// ==UserScript==
// @name         Kemono Video Resizer
// @namespace    Sighery
// @version      0.1.0
// @description  Resize Kemono videos to almost window width
// @author       Sighery
// @match        https://kemono.su/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kemono.su
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    const timer = ms => new Promise(res => setTimeout(res, ms))

    const removeSize = function (elem) {
        console.log(elem);
        elem.style.removeProperty("height");
        elem.style.removeProperty("width");
        elem.style.height = "";
        elem.style.width = "";
    };

    for (let i = 0; i < 10; i++) {
        let videos = document.querySelectorAll(".fluid_video_wrapper");
        if (videos.length === 0) {
            console.warn("Couldn't adjust video, retrying in 0.5s");
            await timer(500);
            continue;
        }

        videos.forEach(removeSize);
    }
})();
