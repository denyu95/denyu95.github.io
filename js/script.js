var urls = [];
var searchFunc = function(path, search_id, content_id) {
    'use strict';
    $.ajax({
        url: path,
        dataType: "xml",
        success: function( xmlResponse ) {
            // get the contents from search data
            var datas = $( "entry", xmlResponse ).map(function() {
                return {
                    title: $( "title", this ).text(),
                    content: $("content",this).text(),
                    url: $( "url" , this).text()
                };
            }).get();
            var $input = document.getElementById(search_id);
            var $resultContent = document.getElementById(content_id);
            $input.addEventListener('input', function(){
                urls = [];
                var str='<ul class=\"search-result-list\">';                
                var keywords = this.value.trim().toLowerCase().split(/[\s\-]+/);
                $resultContent.innerHTML = "";
                if (this.value.trim().length <= 0) {
                    urls = [];
                    $("#local-search-result").hide();
                    return;
                }
                // perform local searching
                datas.forEach(function(data) {
                    var isMatch = true;
                    var content_index = [];
                    var data_title = data.title.trim().toLowerCase();
                    var data_content = data.content.trim().replace(/<[^>]+>/g,"").toLowerCase();
                    var data_url = data.url;
                    var index_title = -1;
                    var index_content = -1;
                    var first_occur = -1;
                    // only match artiles with not empty titles and contents
                    if(data_title != '' && data_content != '') {
                        keywords.forEach(function(keyword, i) {
                            index_title = data_title.indexOf(keyword);
                            index_content = data_content.indexOf(keyword);
                            if( index_title < 0 && index_content < 0 ){
                                isMatch = false;
                            } else {
                                if (index_content < 0) {
                                    index_content = 0;
                                }
                                if (i == 0) {
                                    first_occur = index_content;
                                }
                            }
                        });
                    }
                    // show search results
                    if (isMatch) {
                        urls.push(data_url);
                        str += "<li><a href='"+ data_url +"' class='search-result-title'  target='_Self'>"+ "> " + data_title +"</a>";
                        var content = data.content.trim().replace(/<[^>]+>/g,"");
                        if (first_occur >= 0) {
                            // cut out characters
                            var start = first_occur - 6;
                            var end = first_occur + 6;
                            if(start < 0){
                                start = 0;
                            }
                            if(start == 0){
                                end = 10;
                            }
                            if(end > content.length){
                                end = content.length;
                            }
                            var match_content = content.substr(start, end); 
                            // highlight all keywords
                            keywords.forEach(function(keyword){
                                var regS = new RegExp(keyword, "gi");
                                match_content = match_content.replace(regS, "<em class=\"search-keyword\">"+keyword+"</em>");
                            })
                            str += "<p class=\"search-result\">" + match_content +"...</p>"
                        }
                    }
                })
                $resultContent.innerHTML = str;
                if (urls.length == 0) {
                    $("#local-search-result").hide();
                } else {
                    $("#local-search-result").show();
                }
            })
        }
    })
}
window.onload=function(){
    var path = "/search.xml";
    var inputArea = document.querySelector("#local-search-input");

    inputArea.onfocus = function(){ 
        searchFunc(path, 'local-search-input', 'local-search-result');
    }

    var $resetButton = $("#search-form .fa-times");
    var $resultArea = $("#local-search-result");

    inputArea.oninput = function(){
        if (inputArea.value === "") {
            $resetButton.hide();
        } else {
            $resetButton.show();
        }
    }

    resetSearch = function(){
	urls = [];
        $resultArea.html("");
        $resultArea.hide();
        document.querySelector("#search-form").reset();
        $resetButton.hide();
        $(".no-result").hide();
    }

    inputArea.onkeydown = function(){ 
        if(event.keyCode==13){
            if (urls.length > 0) {
                window.location.href=urls[0];
            }
            return false;
        }
    }

    $resultArea.bind("DOMNodeRemoved DOMNodeInserted", function(e) {
        if (!$(e.target).text()) {
            $(".no-result").show();
        } else {
            $(".no-result").hide();
        }
    })
}
