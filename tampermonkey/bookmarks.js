// ==UserScript==
// @name         trpl-zh-cn-pdf-bookmarks
// @namespace    http://github.com/me1ting/trpl-zh-cn-pdf
// @version      2026.07.18
// @description  export bookmarks
// @author       me1ting
// @match        https://kaisery.github.io/trpl-zh-cn/print.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict'

    function createUI() {
        const button = document.createElement('button')
        button.textContent = '书签'
        const leftMenu = document.querySelector("#mdbook-menu-bar>.right-buttons")
        leftMenu.insertBefore(button, leftMenu.firstChild)
        button.addEventListener("click", handleBookmarkButtonClick, false)
    }

    function handleBookmarkButtonClick() {
        const bookmarks = createBookmarks()
        if (bookmarks) {
            saveBookmarks(bookmarks)
        }
    }

    function createBookmarks() {
        const main = document.querySelector("#mdbook-content>main")

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
        elementA.setAttribute('download', "bookmarks.txt")
        elementA.style.display = 'none'
        document.body.appendChild(elementA)
        elementA.click()
        document.body.removeChild(elementA)
    }

    function removeCodeInHeader() {
        const headers = document.querySelectorAll('#mdbook-content>main a.header')
        for (const header of headers) {
            const code = header.querySelector("code")
            if (code) {
                header.innerHTML = header.textContent
                //console.log(`remove code in ${header.textContent}`)
            }
        }
    }

    function removeOriginalLinks() {
        const main = document.querySelector("#mdbook-content>main")
        const paragraphsAfterH1 = main.querySelectorAll("h1 + p")
        for (const p of paragraphsAfterH1) {
            if (isOriginalLinks(p)) {
                p.remove()
                //console.log(`remove original link: ${p.innerText}`)
            }
        }

        const paragraphsAfterH2 = main.querySelectorAll("h2 + p")
        for (const p of paragraphsAfterH2) {
            if (isOriginalLinks(p)) {
                p.remove()
                //console.log(`remove original link: ${p.innerText}`)
            }
        }

        const paragraphsAfterH3 = main.querySelectorAll("h3 + p")
        for (const p of paragraphsAfterH3) {
            if (isOriginalLinks(p)) {
                p.remove()
                //console.log(`remove original link: ${p.innerText}`)
            }
        }

    }

    function isOriginalLinks(paragraph) {
        const child = paragraph.children[0]
        if (child && child.tagName === 'A') {
            const text = paragraph.innerText.trim()
            return text.endsWith(".md")
        }
        return false
    }

    function fixWrongHeaders() {
        const main = document.querySelector("#mdbook-content>main")

        const h1List = main.querySelectorAll(":scope > h1")
        for (const h1 of h1List) {
            let nextSibling = h1.nextElementSibling
            if (!nextSibling) {
                continue
            }
            // 特例：“采用测试驱动开发完善库的功能”的h1与h2间隔了一个空白超链接<p>
            if (nextSibling.tagName === "P" && isEmptyLinkParagraph(nextSibling)) {
                const oldNextSibling = nextSibling
                nextSibling = oldNextSibling.nextElementSibling
                oldNextSibling.remove()
            }
            if (!nextSibling) {
                continue
            }
            // 大多数情况下h1与h2重复，可以移除h1保留h2，或移除h2降级h1
            // 这里为了兼容后续特例，采用后者
            if (nextSibling.tagName === "H2") {
                nextSibling.remove()
            } else if (nextSibling.tagName === "H3") {
                // 特例：“使用任意数量的 futures”没有h2
            } else {
                // 正确的h1，跳过
                continue
            }

            changeTagName(h1, "H2")
        }
    }

    function isEmptyLinkParagraph(p) {
        if (p.innerText.trim() === "") {
            for (const child of p.children) {
                if (child.tagName !== "A") {
                    return false
                }
            }
            return true
        }
    }

    function changeTagName(element, newTag) {
        const newElement = document.createElement(newTag)
        newElement.innerHTML = element.innerHTML

        for (let attr of element.attributes) {
            newElement.setAttribute(attr.name, attr.value)
        }

        element.replaceWith(newElement)
        return newElement
    }

    function overrideStyles() {
        document.documentElement.style.fontFamily = '"Microsoft YaHei", "微软雅黑", sans-serif'
    }


    removeCodeInHeader()
    removeOriginalLinks()
    fixWrongHeaders()
    overrideStyles()
    createUI()
})()