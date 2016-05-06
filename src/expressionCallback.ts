import * as ko from "knockout";
import _utils from "./utils";
import _namespacedBinding from "./namespacedBinding";

export default class _expressionCallback {
    // Wrap an expression in an anonymous function so that it is called when the event happens
    static makePreprocessor(args) {
        return function expressionCallbackPreprocessor(val) {
            var trimmed = val;
            if(trimmed) {
                trimmed = trimmed.replace(/\s/g, '');
            }
            if(/^function\(.*,?\){.*}/ig.test(trimmed)){
                return `function(${args}){return (${val})(${args});}`
            }
            return 'function('+args+'){return(' + val + ');}';
        };
    }

    static eventPreprocessor = _expressionCallback.makePreprocessor("$data,$event");

    // Set the expressionCallback preprocessor for a specific binding
    static enableForBinding(bindingKeyOrHandler, args) {
        var args = Array.prototype.slice.call(arguments, 1).join();
        _utils.addBindingPreprocessor(bindingKeyOrHandler, _expressionCallback.makePreprocessor(args));
    }
}

// Create an "on" namespace for events to use the expression method
ko.bindingHandlers["on"] = {
    getNamespacedHandler: function(eventName: string) {
        var handler = ko.getBindingHandler('event' + _namespacedBinding.namespaceDivider + eventName);
        return _utils.addBindingPreprocessor(handler, _expressionCallback.eventPreprocessor);
    }
};
