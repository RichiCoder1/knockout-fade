function prepareTestNode() {
    // The bindings specs make frequent use of this utility function to set up
    // a clean new DOM node they can execute code against
    var existingNode = document.getElementById("testNode");
    if (existingNode != null)
        existingNode.parentNode.removeChild(existingNode);
    testNode = document.createElement("div");
    testNode.id = "testNode";
    document.body.appendChild(testNode);
};

nodeText = function(node) {
    return 'textContent' in node ? node.textContent : node.innerText;
};

setNodeText = function(node, text) {
    'textContent' in node ? node.textContent = text : node.innerText = text;
};

function cleanedHtml(node) {
    var cleanedHtml = node.innerHTML.toLowerCase().replace(/\r\n/g, "");
    // IE < 9 strips whitespace immediately following comment nodes. Normalize by doing the same on all browsers.
    cleanedHtml = cleanedHtml.replace(/(<!--.*?-->)\s*/g, "$1");
    // Also remove __ko__ expando properties (for DOM data) - most browsers hide these anyway but IE < 9 includes them in innerHTML
    cleanedHtml = cleanedHtml.replace(/ __ko__\d+=\"(ko\d+|null)\"/g, "");
    return cleanedHtml;
}

var customMatchers = {
    toHaveNodeTypes: function (util, customEqualityTesters) {
        return { 
            compare: function(actual, expected) {
                var values = ko.utils.arrayMap(actual, function (node) { return node.nodeType; });
                var result = {
                    pass: util.equals(values, expected, customEqualityTesters),
                    message: null
                };
                if(!result.pass) {
                    result.message = "Expected node types + " + expected + ", but got " + values;
                }
                return result;
            }
        }
    },
    toContainHtml: function (util, customEqualityTesters) {
        return { 
            compare: function(actual, expected) {
                var html = cleanedHtml(actual);
                var result = {
                    pass: html === expected,
                    message: null
                };
                if(!result.pass) {
                    result.message = "Expected '" + html + "' to be equal to '" + expected + "'.";
                }
                return result;
            }
        }
    },
    toContainText: function (util, customEqualityTesters) {
        return { 
            compare: function(actual, expected) {
                var actualText = nodeText(actual);
                var cleanedActualText = actualText.replace(/\r\n/g, "\n");
                var result = {
                    pass: cleanedActualText === expected,
                    message: null
                };
                if(!result.pass) {
                    result.message = "Expected '" + cleanedActualText + "' to be equal to '" + expected + "'.";
                }
                return result;
            }
        }
    },
    toContainHtmlElementsAndText: function (util, customEqualityTesters) {
        return { 
            compare: function(actual, expected) {
                var html = cleanedHtml(actual).replace(/<!--.+?-->/g, "");  // remove comments
                var result = {
                    pass: html === expected,
                    message: null
                };
                if(!result.pass) {
                    result.message = "Expected '" + html + "' to be equal to '" + expected + "'.";
                }
                return result;
            }
        }
    },
    toEqualOneOf: function (util, customEqualityTesters) {
        return { 
            compare: function(actual, expected) {    
                var passed = false;
                for (var i = 0; i < expected.length; i++) {
                    if (util.equals(actual, expected[i], customEqualityTesters)) {
                        passed = true;
                        break;
                    }
                }
                var result = {
                    pass: passed,
                    message: null
                };
                if(!result.pass) {
                    result.message = "Expected '" + actual + "' to be one of " + expected + ".";
                }
                return result;
            }
        }
    }
};

function installMatchers() {
    jasmine.addMatchers(customMatchers);
}