import * as ko from "knockout";
import _utils from "./utils";

export class _interpolationMarkup {
    
    // Performance comparison at http://jsperf.com/markup-interpolation-comparison
    static parseInterpolationMarkup(textToParse: string, outerTextCallback: (text: string) => void, expressionCallback: (text: string) => void) {
        if(textToParse == null || textToParse.length < 3) {
            return;
        }
        const interpolationRegex = /}(?!\\)[\s\S]*?{\$(?!\\)/g;
        var reversed = textToParse.split('').reverse().join('');
        var interpolationNodes = reversed.match(interpolationRegex);
        var textNodes = reversed.split(interpolationRegex);
        if((interpolationNodes || { length: 0 }).length) {
            outerTextCallback(reverse(textNodes.pop()));
            while(textNodes.length > 0) {
                var expressionText = reverse(interpolationNodes.pop());
                expressionText = expressionText.substring(2, expressionText.length - 1);
                expressionCallback(expressionText);
                outerTextCallback(reverse(textNodes.pop()));
            }
        }

        function reverse(val) {
            return val == null ? null : val.split('').reverse().join('');
        }
    }

    static preprocessor(node: Node) {
        // only needs to work with text nodes
        if (node.nodeType === 3 && node.nodeValue && node.nodeValue.indexOf('${') !== -1 && (node.parentNode || <Node>{}).nodeName != "TEXTAREA") {
            var nodes = [];
            function addTextNode(text) {
                if (text)
                    nodes.push(document.createTextNode(text));
            }
            function wrapExpr(expressionText) {
                if (expressionText)
                    nodes.push.apply(nodes, _interpolationMarkup.wrapExpression(expressionText, node));
            }
            _interpolationMarkup.parseInterpolationMarkup(node.nodeValue, addTextNode, wrapExpr)

            if (nodes.length) {
                if (node.parentNode) {
                    for (var i = 0, n = nodes.length, parent = node.parentNode; i < n; ++i) {
                        parent.insertBefore(nodes[i], node);
                    }
                    parent.removeChild(node);
                }
                return nodes;
            }
        }
    }

    static wrapExpression(expressionText: string, node: Node) {
        var ownerDocument = node ? node.ownerDocument : document,
            binding,
            expressionText = _utils.trim(expressionText),
            result = [];

        binding = "text:" + _utils.trim(expressionText);
        result.push(ownerDocument.createComment("ko " + binding));
        result.push(ownerDocument.createComment("/ko"));
        return result;
    };

    static enable() {
        _utils.addNodePreprocessor(_interpolationMarkup.preprocessor);
    }
}

if (!ko.virtualElements.allowedBindings["html"]) {
    // Virtual html binding
    // SO Question: http://stackoverflow.com/a/15348139
    var overridden = ko.bindingHandlers.html.update;
    ko.bindingHandlers.html.update = function (element, valueAccessor) {
        if (element.nodeType === 8) {
            var html = ko.unwrap(valueAccessor());
            if (html != null) {
                var parsedNodes = ko.utils.parseHtmlFragment('' + html);
                ko.virtualElements.setDomNodeChildren(element, parsedNodes);
            } else {
                ko.virtualElements.emptyNode(element);
            }
        } else {
            overridden(element, valueAccessor);
        }
    };
    ko.virtualElements.allowedBindings["html"] = true;
}

export class _attributeInterpolationMarkup {
    private static dataBind = 'data-bind';
    static preprocessor(node) {
        if (node.nodeType === 1 && node.attributes.length) {
            var dataBindAttribute = node.getAttribute(_attributeInterpolationMarkup.dataBind);
            for (var attrs = ko.utils.arrayPushAll([], node.attributes), n = attrs.length, i = 0; i < n; ++i) {
                var attr = attrs[i];
                if (attr.specified && attr.name != _attributeInterpolationMarkup.dataBind && attr.value.indexOf('${') !== -1) {
                    var parts = [], attrValue = '';
                    function addText(text) {
                        if (text)
                            parts.push('"' + text.replace(/"/g, '\\"') + '"');
                    }
                    function addExpr(expressionText) {
                        if (expressionText) {
                            attrValue = expressionText;
                            parts.push('ko.unwrap(' + expressionText + ')');
                        }
                    }
                    _interpolationMarkup.parseInterpolationMarkup(attr.value, addText, addExpr);

                    if (parts.length > 1) {
                        attrValue = '""+' + parts.join('+');
                    }

                    if (attrValue) {
                        var attrName = attr.name.toLowerCase();
                        var attrBinding = _attributeInterpolationMarkup.attributeBinding(attrName, attrValue, node) || _attributeInterpolationMarkup._attributeBinding(attrName, attrValue, node);
                        if (!dataBindAttribute) {
                            dataBindAttribute = attrBinding
                        } else {
                            dataBindAttribute += ',' + attrBinding;
                        }
                        node.setAttribute(_attributeInterpolationMarkup.dataBind, dataBindAttribute);
                        // Using removeAttribute instead of removeAttributeNode because IE clears the
                        // class if you use removeAttributeNode to remove the id.
                        node.removeAttribute(attr.name);
                    }
                }
            }
        }
    }
    
    private static _attributeBinding(name, value, node) {
        if (ko.getBindingHandler(name)) {
            return name + ':' + value;
        } else {
            return 'attr.' + name + ':' + value;
        }
    }

    static attributeBinding = _attributeInterpolationMarkup._attributeBinding;

    static enable() {
        _utils.addNodePreprocessor(_attributeInterpolationMarkup.preprocessor);
    }
}