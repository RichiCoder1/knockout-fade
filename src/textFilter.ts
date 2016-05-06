import * as ko from "knockout";
import _utils from "./utils";

export class _filters {
    // Convert value to uppercase
    static uppercase(value) {
        return String.prototype.toUpperCase.call(ko.unwrap(value));
    };

    // Convert value to lowercase
    static lowercase(value) {
        return String.prototype.toLowerCase.call(ko.unwrap(value));
    };

    // Return default value if the input value is empty or null
    static _default (value, defaultValue) {
        value = ko.unwrap(value);
        if (typeof value === "function") {
            return value;
        }
        if (typeof value === "string") {
            return _utils.trim(value) === '' ? defaultValue : value;
        }
        return value == null || value.length == 0 ? defaultValue : value;
    };

    // Return the value with the search string replaced with the replacement string
    static replace(value, search, replace) {
        return String.prototype.replace.call(ko.unwrap(value), search, replace);
    };

    static fit(value, length, replacement, trimWhere) {
        value = ko.unwrap(value);
        if (length && ('' + value).length > length) {
            replacement = '' + (replacement || '...');
            length = length - replacement.length;
            value = '' + value;
            switch (trimWhere) {
                case 'left':
                    return replacement + value.slice(-length);
                case 'middle':
                    var leftLen = Math.ceil(length / 2);
                    return value.substr(0, leftLen) + replacement + value.slice(leftLen-length);
                default:
                    return value.substr(0, length) + replacement;
            }
        } else {
            return value;
        }
    };

    // Convert a model object to JSON
    static json(rootObject, space, replacer) {     // replacer and space are optional
        return ko.toJSON(rootObject, replacer, space);
    };

    // Format a number using the browser's toLocaleString
    static number(value) {
        return (+ko.unwrap(value)).toLocaleString();
    }
}

export class _textFilter {
    // Convert input in the form of `expression | filter1 | filter2:arg1:arg2` to a function call format
    // with filters accessed as ko.filters.filter1, etc.
    static preprocessor(input) {
        // Check if the input contains any | characters; if not, just return
        if (input.indexOf('|') === -1)
            return input;

        // Split the input into tokens, in which | and : are individual tokens, quoted strings are ignored, and all tokens are space-trimmed
        var tokens = input.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|\|\||[|:]|[^\s|:"'][^|:"']*[^\s|:"']|[^\s|:"']/g);
        if (tokens && tokens.length > 1) {
            // Append a line so that we don't need a separate code block to deal with the last item
            tokens.push('|');
            input = tokens[0];
            var lastToken, token, inFilters = false, nextIsFilter = false;
            for (var i = 1, token; token = tokens[i]; ++i) {
                if (token === '|') {
                    if (inFilters) {
                        if (lastToken === ':')
                            input += "undefined";
                        input += ')';
                    }
                    nextIsFilter = true;
                    inFilters = true;
                } else {
                    if (nextIsFilter) {
                        input = "ko.filters['" + token + "'](" + input;
                    } else if (inFilters && token === ':') {
                        if (lastToken === ':')
                            input += "undefined";
                        input += ",";
                    } else {
                        input += token;
                    }
                    nextIsFilter = false;
                }
                lastToken = token;
            }
        }
        return input;
    }

    // Set the filter preprocessor for a specific binding
    static enableForBinding(bindingKeyOrHandler) {
        _utils.addBindingPreprocessor(bindingKeyOrHandler, _textFilter.preprocessor);
    }
}

ko["filters"] = _filters;
ko["filters"]["default"] = _filters._default;