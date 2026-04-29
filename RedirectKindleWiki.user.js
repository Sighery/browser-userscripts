// ==UserScript==
// @name         Redirect Kindle Wiki
// @namespace    Sighery
// @version      0.1.0
// @description  Redirect to the ad-free and analytics-free Kindle wiki
// @author       Sighery
// @match        https://kindlemodding.org/*
// @icon         https://sighery.github.io/kindlewiki/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const url = new URL(window.location.href);
  url.hostname = "sighery.github.io";
  url.pathname = `/kindlewiki${url.pathname}`;
  window.location.href = url.href;
})();
