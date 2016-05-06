import * as ko from "knockout";
import _utils from "./utils";

export default class _namespacedBinding {
    // Support dynamically-created, namespaced bindings. The binding key syntax is
    // "namespace.binding". Within a certain namespace, we can dynamically create the
    // handler for any binding. This is particularly useful for bindings that work
    // the same way, but just set a different named value, such as for element
    // attributes or CSS classes.
    static namespacedBindingMatch = /([^\.]+)\.(.+)/;
    static namespaceDivider = '.';

    // Knockout's built-in bindings "attr", "event", "css" and "style" include the idea of
    // namespaces, representing it using a single binding that takes an object map of names
    // to values. This default handler translates a binding of "namespacedName: value"
    // to "namespace: {name: value}" to automatically support those built-in bindings.
    static defaultGetHandler(bindingName: string, namespace: string, namespacedName: string) {
        var handler = <KnockoutBindingHandler> ko.utils.extend({}, this);
        function setHandlerFunction(funcName: string) {
            if (handler[funcName]) {
                handler[funcName] = function(element, valueAccessor) {
                    function subValueAccessor() {
                        var result = {};
                        result[bindingName] = valueAccessor();
                        return result;
                    }
                    var args = Array.prototype.slice.call(arguments, 0);
                    args[1] = subValueAccessor;
                    return ko.bindingHandlers[namespace][funcName].apply(this, args);
                };
            }
        }
        // Set new init and update functions that wrap the originals
        setHandlerFunction('init');
        setHandlerFunction('update');
        // Clear any preprocess function since preprocessing of the new binding would need to be different
        if (handler.preprocess)
            handler.preprocess = null;
        if (ko.virtualElements.allowedBindings[namespace])
            ko.virtualElements.allowedBindings[namespacedName] = true;
        return handler;
    }

    // Adds a preprocess function for every generated namespace.x binding. This can
    // be called multiple times for the same binding, and the preprocess functions will
    // be chained. If the binding has a custom getNamespacedHandler method, make sure that
    // it's set before this function is used.
    static addDefaultBindingPreprocessor(namespace, preprocessFn) {
        var handler = ko.getBindingHandler(namespace);
        if (handler) {
            var previousHandlerFn = handler.getNamespacedHandler || _namespacedBinding.defaultGetHandler;
            handler.getNamespacedHandler = function() {
                return _utils.addBindingPreprocessor(previousHandlerFn.apply(this, arguments), preprocessFn);
            };
        }
    }

    static preprocessor(value, binding, addBinding) {
        if (value.charAt(0) !== "{")
            return value;

        // Handle two-level binding specified as "binding: {key: value}" by parsing inner
        // object and converting to "binding.key: value"
        var subBindings = ko.expressionRewriting.parseObjectLiteral(value);
        ko.utils.arrayForEach(subBindings, function(keyValue) {
            addBinding(binding + _namespacedBinding.namespaceDivider + keyValue.key, keyValue.value);
        });
    }

    // Set the namespaced preprocessor for a specific binding
    static enableForBinding(bindingKeyOrHandler) {
        _utils.addBindingPreprocessor(bindingKeyOrHandler, _namespacedBinding.preprocessor);
    }

    private static addBindingHandlerCreator(matchRegex: string | RegExp, callbackFn: (match: RegExpMatchArray, bindingKey: string) => KnockoutBindingHandler) {
        var oldGetHandler = ko.getBindingHandler;
        ko.getBindingHandler = function(bindingKey) {
            var match;
            return oldGetHandler(bindingKey) || ((match = bindingKey.match(<any> matchRegex)) && callbackFn(match, bindingKey));
        };
    }
    
    static __init() {
        _namespacedBinding.addBindingHandlerCreator(_namespacedBinding.namespacedBindingMatch, function (match, bindingKey) {
            var namespace = match[1],
                namespaceHandler = ko.bindingHandlers[namespace];
            if (namespaceHandler) {
                var bindingName = match[2];
                var handlerFn = namespaceHandler.getNamespacedHandler || _namespacedBinding.defaultGetHandler;
                var handler = handlerFn.call(namespaceHandler, bindingName, namespace, bindingKey);
                ko.bindingHandlers[bindingKey] = handler;
                return handler;
            }
        });
    }
}

_namespacedBinding.__init();