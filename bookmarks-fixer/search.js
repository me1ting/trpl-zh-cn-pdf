(function () {
    if (scriptArgs.length < 4) {
        print("usage: mutool run input.pdf pageNum title level");
        print("This scrpit will serach `string` from `pageNum - 5` to `pageNum + 5`(no contains).");
        return;
    }

    var doc = new Document(scriptArgs[0]);
    var text = scriptArgs[2];
    var countPages = doc.countPages();
    var pageNum = parseInt(scriptArgs[1]) - 1;//At mupdf context, page numbers start from 0.
    var level = parseInt(scriptArgs[3]);

    var i = Math.max(0, pageNum - 5);
    var n = Math.min(countPages, pageNum + 5);

    //31.69,23.767,18.529
    var levelFontSize = [0, 31, 23, 18]

    var isFound = false;
    var foundPageNums = [];
    for (; i < n; ++i) {
        var page = doc.loadPage(i);
        var results = page.search(text);
        if (results.length > 0) {
            var j = 0;
            for (; j < results.length; j++) {
                var fontSize = results[j][5] - results[j][1];
                if (fontSize >= levelFontSize[level] - 1 && fontSize <= levelFontSize[level] + 2) {
                    foundPageNums.push(i + 1);//see above
                    isFound = true;
                    break;
                }
            }
        }
    }

    if (isFound) {
        print(foundPageNums.join());
    }
})()