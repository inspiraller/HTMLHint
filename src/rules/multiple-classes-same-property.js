
var reportMultipleClassesWithSameProps = (typeof reportMultipleClassesWithSameProps!=='undefined')?reportMultipleClassesWithSameProps:function reportMultipleClassesWithSameProps(){};
var wrapTagPointers = (typeof wrapTagPointers!=='undefined')?wrapTagPointers:function wrapTagPointers(){};


var fs = require('fs');


HTMLHint.addRule({
    id: 'multiple-classes-same-property',
    description: 'Prevent classes with the same properties',
    init: function multipleClases(parser, reporter, options) {

        var self = this;

        // REMOVE FOR BUILD 
        /*           
        var reporter = {
            error:function(str, intLine){
                console.log(str);
            }
        }
        var strAllStyles = $('#styles').val();
        var strRegExcludeClasses =  '(\\.gr\\-1|\\.gr\\-2)+';
        var isExcludeBemModifier = true;
        */

        // RESTORE FOR BUILD  
             
        var getOption = function(options, prop){
            /*{
                "tag-pair": true,
                "multiple-classes-same-property":"strStylesPaths=C:\\projects\\careers\\Cwo.Careers.Web.UI\\ui\\app\\css\\,someOtherPath;strRegExcludeClasses=(\\.gr\\-1|\\.gr\\-2)+;isExcludeBemModifier=true;"
            }*/

            var arrMatch = options.match(RegExp('(^|\\;)' + prop + '\\=([^\\;]+)'));

            if(arrMatch && arrMatch.length){
                return arrMatch[2];
            }
            return null;
        };

        var strStylesPaths = getOption(options, 'strStylesPaths');
        var strRegExcludeClasses = getOption(options, 'strRegExcludeClasses');
        var isExcludeBemModifier = getOption(options, 'isExcludeBemModifier');
        isExcludeBemModifier = (isExcludeBemModifier ==='true')?true:false;
        
        //example
        //var strAllStyles = '.classX{ background:red;}'; 
        
        var getDirFiles = function(dir, strExt) {
            var reg = RegExp('\\.' + strExt + '$');
            var results = [];
            var list = fs.readdirSync(dir);
            list.forEach(function(file) {
                file = dir + '/' + file;

                file = file.replace(/\//g,'\\');
                file = file.replace(/\\/g,'\\\\');

                var stat = fs.statSync(file);


                if (stat && stat.isDirectory()){
                    results = results.concat(getDirFiles(file, strExt));
                }else if(reg.test(file)){
                    results.push(file);
                }                        
            });
            return results;
        };
        var concatFilesContent = function(files){
            var arr = [];
            var key;
            for(key in files){
                var filePath = files[key];
                var content = fs.readFileSync(filePath, "utf8");
                arr.push(content);
            }

            return arr.join('');
        };
        var concatAllCssFiles = function(strStylesPaths){
            var arrFiles = strStylesPaths.split(',');
            var arr = [];
            for(var i=0, intLen = arrFiles.length; i < intLen; ++i){
                var strFilePath = arrFiles[i];
                arr = arr.concat(getDirFiles(strFilePath, 'css'));    
            }
            var strAllStyles = concatFilesContent(arr); 
            return strAllStyles;           
        };

        var strAllStyles = concatAllCssFiles(strStylesPaths);
        
        var allEvent = function(event) {
            if(event.type == 'start'){

                var html = event.html;

                var markers = {
                    strMarkerStart : '\u21A3',
                    strMarkerEnd : '\u20AA',
                    strMarkerHandle : '\u20A9',
                    strMarkerEndComment : '\u03C8'
                };

                var htmlWrapped = wrapTagPointers(html, markers);
                        
                if(htmlWrapped.isValid === true){
                    var strWrapped = htmlWrapped.strHtml;                    
                    var objReport = reportMultipleClassesWithSameProps(strWrapped, markers, strAllStyles, strRegExcludeClasses, isExcludeBemModifier);

                    var arrMultipleClassesSameProperties = objReport.arrMultipleClassesSameProperties || [];
                    var arrSelectorsMissingFromCss = objReport.arrSelectorsMissingFromCss || [];

                    var objElem, strSelectors, strReport;

                    for(var i=0, intLen = arrMultipleClassesSameProperties.length; i < intLen; ++i){
                        var objMultiple = arrMultipleClassesSameProperties[i];
                        objElem = objMultiple.elem;
                        var objMatchingSelectors = Object.keys(objMultiple.matching.selectors);
                        strSelectors = objMatchingSelectors.join(',');
                        var objMatchingProperties = Object.keys(objMultiple.matching.properties);
                        var strProperties = objMatchingProperties.join(',');

                        strReport = "Multiple selectors exist with same properties. selectors = " + strSelectors + '. Properties = ' + strProperties ;
                        reporter.error(strReport, objElem.line, 0, self, event.raw);                    
                    }

                    for(i=0, intLen = arrSelectorsMissingFromCss.length; i < intLen; ++i){
                        var objMissing = arrSelectorsMissingFromCss[i];

                        objElem = objMissing.objElem;

                        strSelectors = objMissing.strSelectors;
                        strReport = "Selector(s) don't exist in css: " + strSelectors;
                        var intLine = objElem.line;

                        reporter.error(strReport, intLine, 0, self, event.raw);                    
                    }
                }else{
                    
                    // capture tag pairing.
                    var intStartLine = htmlWrapped.intStartLine;
                    var intBadLine = htmlWrapped.intBadLine;
                    var strMsg = htmlWrapped.strMsg;
                    
                    if(typeof intBadLine !== 'undefined'){
                        reporter.error(strMsg, intBadLine, 0, self, event.raw);      
                        reporter.error(strMsg, intStartLine, 0, self, event.raw); 
                    }
                                          
                }

            }
            parser.removeListener("start", allEvent);
        };
        parser.addListener("start", allEvent);
    }
});
