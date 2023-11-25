// ==UserScript==
// @name         trpl-zh-cn-pdf-bookmarks
// @namespace    http://github.com/me1ting/trpl-zh-cn-pdf
// @version      2023.11.25
// @description  export bookmarks
// @author       me1ting
// @match        https://kaisery.github.io/trpl-zh-cn/print.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    const createUI = function () {
        const botton = document.createElement('button');
        botton.textContent = '书签';
        const leftMenus = document.querySelector("#menu-bar>.right-buttons")
        leftMenus.insertBefore(botton, leftMenus.firstChild)
        botton.addEventListener("click", handleButtonClick, false)
    }

    const handleButtonClick = function () {
        const bookmarks = createBookmarks()
        if (bookmarks) {
            saveBookmarks(bookmarks)
        }
    }

    const createBookmarks = function () {
        const main = document.getElementById("content").firstElementChild

        let bookmarks = []

        for (const child of main.children) {
            if (child.tagName === 'H1' || child.tagName === 'H2') {
                const header = child
                const title = header.innerText
                const pageNum = getPageNum(child.offsetTop)
                const bookmark = {
                    title,
                    pageNum,
                }

                if (header.tagName === "H1") {
                    bookmark.level = 1
                } else if (header.tagName === "H2") {
                    bookmark.level = 2
                }
                bookmarks.push(bookmark)
            }
        }
        return bookmarks
    }

    const getPageNum = function (offsetTop) {
        return Math.ceil(offsetTop / 955)
    }

    const saveBookmarks = function (bookmarks) {
        const elementA = document.createElement('a')
        elementA.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(bookmarks))
        elementA.setAttribute('download', "bookmarks" + new Date() + ".txt")
        elementA.style.display = 'none'
        document.body.appendChild(elementA)
        elementA.click()
        document.body.removeChild(elementA)
    }

    const removeCodeInHeader = function () {
        const headers = document.querySelectorAll('#content>main a.header')
        for (const header of headers) {
            const code = header.querySelector("code");
            if (code) {
                header.innerHTML = header.textContent;
            }
        }
    }

    const removeOriginalLinks = function () {
        const blockQuotesAfterH1 = document.querySelectorAll("h1 + blockquote");
        for (const quote of blockQuotesAfterH1) {
            if (isOriginalLinks(quote)) {
                quote.remove()
            }
        }

        const blockQuotesAfterH2 = document.querySelectorAll("h2 + blockquote");
        for (const quote of blockQuotesAfterH2) {
            if (isOriginalLinks(quote)) {
                quote.remove()
            }
        }

    }

    const isOriginalLinks = function (quote) {
        const text = quote.innerText
        const slices = text.split("\n")
        return slices.length == 2 && slices[0].endsWith(".md") && slices[1].startsWith("commit ")
    }

    removeCodeInHeader()
    removeOriginalLinks()
    createUI()
})()