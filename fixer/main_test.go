package main

import (
	"os"
	"testing"
)

func TestIt(t *testing.T) {
	pdfFile, bookmarksFile := "trpl.pdf", "bookmarks.txt"
	bookmarks := loadBookmarks(bookmarksFile)
	bookmarks = locateAll(pdfFile, bookmarks)
	os.WriteFile(bookmarksFile+".fixed", []byte(Bookmarks(bookmarks).String()), 0644)
}
