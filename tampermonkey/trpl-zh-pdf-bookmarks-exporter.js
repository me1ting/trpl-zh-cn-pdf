// ==UserScript==
// @name         trpl-zh-cn-pdf-bookmarks-exporter
// @namespace    http://github.com/me1ting/trpl-zh-cn-pdf
// @version      0.0.1
// @description  export markbooks
// @author       me1ting
// @match        https://kaisery.github.io/trpl-zh-cn/print.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    const createUI = function () {
        const div = document.createElement("div")
        div.innerHTML = "<button id='exportBookmarks' type='button' style='position:absolute;top:0;left:0;z-index:999'>导出书签</button>"
        document.body.appendChild(div)
        document.body.insertBefore(div, document.body.firstElementChild)

        const botton = document.getElementById("exportBookmarks")
        botton.addEventListener("click", generate, false)
    }

    const generate = function () {
        let bookmarks = createBookmarks()
        if (bookmarks) {
            saveBookmarks(bookmarks)
        }
    }

    const createBookmarks = function () {
        const main = document.getElementById("content").firstElementChild
        const totalHeight = main.scrollHeight

        let bookmarks = []

        for (const child of main.children) {
            if (child.tagName === 'A' && child.classList.contains('header')) {
                const header = child.firstElementChild
                let title = header.innerText
                const pageNum = getPageNum(child.offsetTop)
                let bookmark = {
                    title,
                    page_num: pageNum,
                }

                if (header.tagName === "H1") {
                    bookmark.level = 1
                    bookmarks.push(bookmark)
                } else if (header.tagName === "H2") {
                    bookmark.level = 2
                    bookmarks.push(bookmark)
                } else if (header.tagName === "H3") {
                    bookmark.level = 3
                    bookmarks.push(bookmark)
                }
            }
        }
        return bookmarks
    }

    const getPageNum = function (offsetTop) {
        return Math.ceil(offsetTop / 955)
    }

    const saveBookmarks = function (bookmarks) {
        var elementA = document.createElement('a')
        elementA.setAttribute('href', 'data:text/plain;charset=utf-8,' + JSON.stringify(bookmarks))
        elementA.setAttribute('download', +new Date() + ".txt")
        elementA.style.display = 'none'
        document.body.appendChild(elementA)
        elementA.click()
        document.body.removeChild(elementA)
    }

    createUI()
})()