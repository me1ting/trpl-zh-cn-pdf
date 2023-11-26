package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

type Bookmark struct {
	Title   string `json:"title"`
	Level   int    `json:"level"`
	PageNum int    `json:"pageNum"`
}

type Bookmarks []Bookmark

// 这些 title 不需要序号
var TitlesWithoutSeqs = []string{"Rust 程序设计语言", "前言", "介绍"}
var TopLevel, SecondLevel = 1, 2

func (bookmarks Bookmarks) String() string {
	var buffer bytes.Buffer

	noSeqs := false
	topSeq := 0
	secondSeq := 0

	for _, bookmark := range bookmarks {
		seqs := ""

		if bookmark.Level == TopLevel {
			if SliceContains(TitlesWithoutSeqs, bookmark.Title) {
				noSeqs = true
			} else {
				noSeqs = false
				topSeq += 1
				secondSeq = 0
				seqs = fmt.Sprintf("%d ", topSeq)
			}
		} else if bookmark.Level == SecondLevel {
			secondSeq += 1
			if !noSeqs {
				seqs = fmt.Sprintf("%d.%d ", topSeq, secondSeq)
			}
		}

		if bookmark.Level == 2 {
			buffer.WriteRune('\t')
		}
		buffer.WriteString(fmt.Sprintf("%s %s\t%d\r\n", seqs, bookmark.Title, bookmark.PageNum))
	}

	return buffer.String()
}

func SliceContains[E comparable](list []E, e E) bool {
	for _, item := range list {
		if item == e {
			return true
		}
	}
	return false
}

func loadBookmarks(filename string) []Bookmark {
	//utf-8 encoded
	data, err := os.ReadFile(filename)
	if err != nil {
		log.Fatal(err)
	}

	var bookmarks []Bookmark
	json.Unmarshal(data, &bookmarks)
	return bookmarks
}

// 重定位定位所有书签的准确位置
func locateAll(pdfFile string, bookmarks []Bookmark) []Bookmark {
	offset := 0

	for i := 0; i < len(bookmarks); i++ {
		newOffset, error := locate(pdfFile, &bookmarks[i], offset)
		if error != nil {
			log.Print(error)
			continue
		}
		offset = newOffset
	}
	return bookmarks
}

// 重定位书签的准确位置
// 如果找到准确位置，修改bookmark.pageNum为准确位置，并返回新的偏移量
// 如果没有找到准确位置，或者存在多个匹配位置，返回错误
func locate(pdfFile string, bookmark *Bookmark, offset int) (newOffset int, err error) {
	cmd := exec.Command("mutool", "run", "search.js", pdfFile, fmt.Sprintf("%d", bookmark.PageNum+offset), bookmark.Title, fmt.Sprintf("%d", bookmark.Level))

	var outBuffer bytes.Buffer
	var errBuffer bytes.Buffer

	cmd.Stdout = &outBuffer
	cmd.Stderr = &errBuffer

	// https://pkg.go.dev/os/exec
	if errors.Is(cmd.Err, exec.ErrDot) {
		cmd.Err = nil
	} else {
		log.Fatalf("execute mutool failed: %v", err)
	}

	if err := cmd.Run(); err != nil {
		log.Fatalf("execute mutool failed: %v", err)
	}

	// warning messages
	//errStr := errBuffer.String()
	//if errStr != "" {
	//	log.Println(errStr)
	//}

	outStr := strings.TrimSpace(outBuffer.String())

	if outStr == "" {
		return 0, fmt.Errorf("no result of %v", bookmark)
	}

	if strings.Contains(outStr, ",") {
		return 0, fmt.Errorf("multi results of %v, with results %v", bookmark, outStr)
	}

	newPageNum, err := strconv.Atoi(outStr)
	if err != nil {
		log.Fatal("bad mutool result")
	}

	newOffset = newPageNum - bookmark.PageNum
	bookmark.PageNum = newPageNum

	return
}

func main() {
	if len(os.Args) < 3 {
		fmt.Fprintf(os.Stderr, "Usage of %s:\n", os.Args[0])
		fmt.Fprintf(os.Stderr, "fixer input.pdf bookmarks.txt")
		os.Exit(1)
	}

	pdfFile, bookmarksFile := os.Args[1], os.Args[2]
	bookmarks := loadBookmarks(bookmarksFile)
	bookmarks = locateAll(pdfFile, bookmarks)
	os.WriteFile(bookmarksFile+".fixed", []byte(Bookmarks(bookmarks).String()), 0644)
}
