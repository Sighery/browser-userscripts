// ==UserScript==
// @name         Steam Age Check Bypass
// @namespace    Sighery
// @version      0.1
// @description  Steam Age Check page bypass
// @author       Sighery
// @match        https://store.steampowered.com/agecheck/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=store.steampowered.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const year = document.querySelector("select#ageYear");
  const button = document.querySelector("a#view_product_page_btn");

  year.selectedIndex = 80;

  button.click();
})();
