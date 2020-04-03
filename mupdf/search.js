(function(){
    if (scriptArgs.length < 3){
        print("usage: mutool run input.pdf pageNum string");
        print("This scrpit will serach `string` from `pageNum - 5` to `pageNum + 5`(no contains).");
        return;
    }

    var doc = new Document(scriptArgs[0]);
    var text = scriptArgs[2];
    var countPages = doc.countPages();
    var pageNum = parseInt(scriptArgs[1]) - 1;//At mupdf environment, page number is begins with 0.
    var i = Math.max(0, pageNum - 5);
    var n = Math.min(countPages, pageNum + 5);

    var isFound = false;
    var foundPageNums = [];
    for (; i < n; ++i) {
        var page = doc.loadPage(i);
        var result = page.search(text);
        if (result.length > 0) {
            foundPageNums.push(i + 1);//see before
            isFound = true;
        }
    }

    if (isFound){
        print(foundPageNums.join());
    }
})()