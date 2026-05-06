// ==UserScript==
// @name         Steam Age Check Bypass
// @namespace    Sighery
// @version      0.2
// @description  Steam Age Check page bypass
// @author       Sighery
// @match        https://store.steampowered.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=store.steampowered.com
// @grant        GM_cookie
// @run-at       document-start
// ==/UserScript==

(async function () {
  'use strict';

  const cookiesSet = await areAgeCookiesSet();
  if (!cookiesSet) {
    console.warn("Setting age cookies");
    await setAgeCookies();
  }

  if (window.location.href.includes("/agecheck/")) {
    window.location.href = window.location.href.replace("/agecheck", "");
  }
})();


async function areAgeCookiesSet() {
  try {
    const cookie = await GM_cookie.list({ name: "birthtime", path: "/" });
    if (cookie !== undefined) {
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
}


async function setAgeCookies() {
  await GM_cookie.set({ name: "birthtime", value: "315529201", path: "/" });
  await GM_cookie.set({ name: "lastagecheckage", value: "1-January-1980", path: "/" });
}
