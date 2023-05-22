# trpl-zh-cn-pdf
[trpl-zh-cn](https://github.com/KaiserY/trpl-zh-cn/)原滋原味的mdBook风格pdf版本，使用chrome打印，并使用脚本生成书签。

# Usage
## 安装Tampermonkey和脚本
安装`Tampermonkey` chrome插件，并复制`tampermonkey/trpl-zh-pdf-bookmarks-exporter.js`的内容到Tampermonkey的新建脚本中。

该脚本提供**打印优化**和生成**书签草案**。

打印优化包括：

- 移除title中的code样式

在[打印页面](https://kaisery.github.io/trpl-zh-cn/print.html)，打印完成，或取消打印对话框后，在页面的左上角会看到`导出书签`按钮，点击即可下载`书签草案`。

## 生成pdf和书签草案
在[打印页面](https://kaisery.github.io/trpl-zh-cn/print.html)，选择`保存为pdf`，取消勾选`更多设置`-`选项`-`页眉和页脚`。

在chrome完成加载预览后，点击保存为pdf。然后点击`导出书签`按钮，生成书签草案。

## 重定位书签
根据html页面生成的书签草案可能存在偏移，需要纠正。这里需要使用到`bookmarks-fixer.exe`（即本仓库bookmarks-fixer目录中的rust项目），[mupdf](https://mupdf.com/releases/)的`mutool.exe`，`search.js`。

将这3个文件，以及pdf文件和书签草案拷贝到同一文件夹下，执行以下命令生成重定位的书签文件：
```
# git bash
PATH=.:$PATH
./bookmarks-fixer.exe trpl.pdf 1684768338706.txt
```
其中`trpl.pdf`是pdf文件名，`1684768338706.txt`是书签草案文件名。

重定位的书签文件名为书签草案文件名添加`.fixed`后缀，如`1684768338706.txt.fixed`。

### 手动修复
如果以上命令提示`...please fix it by hand`，说明存在多个匹配结果或者无匹配结果，你需要编辑重定位的书签文件，添加目标`level`的`title`的正确书签信息。

## 保存书签到pdf文件
重定位的书签文件采用的是`FreePic2Pdf`+`PdgCntEditor`软件所支持格式，你可以用这两个软件，但由于Virustotal报毒的原因，我没有使用这两个软件。

我目前使用的是自己写的[pdfbookmark](https://github.com/me1ting/pdfbookmark)，下载并解压到`bookmarks-fixer.exe`所在文件夹。

保存书签到pdf：
```
mv 1684768338706.txt.fixed trpl.pdf.bookmarks
pdfbookmark save trpl.pdf trpl_saved.pdf
```
生成的`trpl_saved.pdf`就是带有书签的pdf文件。

## 压缩pdf
Google搜索`pdf 压缩`，找一个在线压缩网站来进行压缩。
