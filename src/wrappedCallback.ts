import * as ko from "knockout";
import _utils from "./utils";

export default class _wrappedCallback {
    // Wrap a callback function in an anonymous function so that it is called with the appropriate
    // "this" value.
    static preprocessor(val) {
        // Matches either an isolated identifier or something ending with a property accessor
        if (/^([$_a-z][$\w]*|.+(\.\s*[$_a-z][$\w]*|\[.+\]))$/i.test(val)) {
            return 'function(_x,_y,_z){return(' + val + ')(_x,_y,_z);}';
        } else {
            return val;
        }
    }

    // Set the wrappedCallback preprocessor for a specific binding
    static enableForBinding(bindingKeyOrHandler) {
        _utils.addBindingPreprocessor(bindingKeyOrHandler, _wrappedCallback.preprocessor);
    }
}