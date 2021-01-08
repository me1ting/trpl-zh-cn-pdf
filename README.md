# trpl-zh-cn-pdf
[trpl-zh-cn](https://github.com/KaiserY/trpl-zh-cn/)原滋原味的mdBook风格pdf版本，使用chrome打印，并使用脚本生成书签。

# 基本原理
## 生成pdf
使用mdBook的打印功能即可，它会调用chrome的打印功能。

## 获取书签
根据mdBook的html页面中的header标签，可以获取书签信息，使用element的位置可以获取其所属页号，这一切可以交给`TamperMonkey`脚本来完成。

## 重定位书签
根据html信息获取的书签，其页号信息存成偏差，需要修复每个书签信息。使用`mupdf`查询title来重定位其所在的页面，这一切使用`bookmarks-fixer`这个rust脚本来完成。

```shell
PATH=/d/Applications2/mupdf-1.16.0:$PATH
./bookmarks-fixer.exe input.pdf bookmarks.txt
```

## 保存书签到pdf
使用`FreePic2Pdf`+`PdgCntEditor`来完成。
