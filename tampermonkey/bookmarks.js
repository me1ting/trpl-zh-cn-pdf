// ==UserScript==
// @name         trpl-zh-cn-pdf-bookmarks
// @namespace    http://github.com/me1ting/trpl-zh-cn-pdf
// @version      2025.05.21
// @description  export bookmarks
// @author       me1ting
// @match        https://kaisery.github.io/trpl-zh-cn/print.html
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict'

    GM_addStyle(`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    `)

    function createUI() {
        const botton = document.createElement('button')
        botton.textContent = '书签'
        const leftMenus = document.querySelector("#menu-bar>.right-buttons")
        leftMenus.insertBefore(botton, leftMenus.firstChild)
        botton.addEventListener("click", handleBookmarkButtonClick, false)
    }

    function handleBookmarkButtonClick() {
        const bookmarks = createBookmarks()
        if (bookmarks) {
            saveBookmarks(bookmarks)
        }
    }

    function createBookmarks() {
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

    function getPageNum(offsetTop) {
        return Math.ceil(offsetTop / 955)
    }

    function saveBookmarks(bookmarks) {
        const elementA = document.createElement('a')
        elementA.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(bookmarks))
        elementA.setAttribute('download', "bookmarks" + new Date() + ".txt")
        elementA.style.display = 'none'
        document.body.appendChild(elementA)
        elementA.click()
        document.body.removeChild(elementA)
    }

    function removeCodeInHeader() {
        const headers = document.querySelectorAll('#content>main a.header')
        for (const header of headers) {
            const code = header.querySelector("code")
            if (code) {
                header.innerHTML = header.textContent
            }
        }
    }

    function removeOriginalLinks() {
        const blockQuotesAfterH1 = document.querySelectorAll("h1 + blockquote")
        for (const quote of blockQuotesAfterH1) {
            if (isOriginalLinks(quote)) {
                quote.remove()
            }
        }

        const blockQuotesAfterH2 = document.querySelectorAll("h2 + blockquote")
        for (const quote of blockQuotesAfterH2) {
            if (isOriginalLinks(quote)) {
                quote.remove()
            }
        }

    }

    function isOriginalLinks(quote) {
        const text = quote.innerText
        const slices = text.split("\n")
        return slices.length == 2 && slices[0].endsWith(".md") && slices[1].startsWith("commit ")
    }

    function overrideStyles() {
        document.documentElement.style.fontFamily = '"Open Sans", "Noto Sans SC", sans-serif'
    }


    removeCodeInHeader()
    removeOriginalLinks()
    overrideStyles()
    createUI()
})()