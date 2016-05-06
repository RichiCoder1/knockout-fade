import * as ko from "knockout";

namespace _utils {
    
    type koPreprocess = (value: string, name: string, addBindingCallback?: (name: string, value: string) => void) => string
    // Add a preprocess function to a binding handler.
    export function addBindingPreprocessor(bindingKeyOrHandler: KnockoutBindingHandler | string, preprocessFn: koPreprocess) {
        return chainPreprocessor(getOrCreateHandler(bindingKeyOrHandler), 'preprocess', preprocessFn);
    }

    // These utility functions are separated out because they're also used by
    // preprocessBindingProperty

    // Get the binding handler or create a new, empty one
    export function getOrCreateHandler(bindingKeyOrHandler: KnockoutBindingHandler | string): KnockoutBindingHandler {
        return typeof bindingKeyOrHandler === 'object' ? bindingKeyOrHandler :
            (ko.getBindingHandler(bindingKeyOrHandler) || (ko.bindingHandlers[bindingKeyOrHandler] = <KnockoutBindingHandler>{}));
    }
    
    // Add a preprocess function
    export function chainPreprocessor(object: any, prop: string, fn: koPreprocess) {
        if (object[prop]) {
            // If the handler already has a preprocess function, chain the new
            // one after the existing one. If the previous function in the chain
            // returns a falsy value (to remove the binding), the chain ends. This
            // method allows each function to modify and return the binding value.
            var previousFn = object[prop];
            object[prop] = function(value, binding, addBinding) {
                value = previousFn.call(this, value, binding, addBinding);
                if (value)
                    return fn.call(this, value, binding, addBinding);
            };
        } else {
            object[prop] = fn;
        }
        return object;
    }

    // Add a preprocessNode function to the binding provider. If a
    // function already exists, chain the new one after it. This calls
    // each function in the chain until one modifies the node. This
    // method allows only one function to modify the node.
    export function addNodePreprocessor(preprocessFn: (node: Node) => Node[] | void) {
        var provider = ko.bindingProvider.instance;
        if (provider.preprocessNode) {
            var previousPreprocessFn = provider.preprocessNode;
            provider.preprocessNode = function(node: Node) {
                var newNodes = previousPreprocessFn.call(this, node) as Node[];
                if (!newNodes)
                    newNodes = preprocessFn.call(this, node);
                return newNodes;
            };
        } else {
            provider.preprocessNode = preprocessFn;
        }
    }

    export function addBindingHandlerCreator(matchRegex: string | RegExp, callbackFn: (match: RegExpMatchArray, bindingKey: string) => KnockoutBindingHandler) {
        var oldGetHandler = ko.getBindingHandler;
        ko.getBindingHandler = function(bindingKey) {
            var match;
            return oldGetHandler(bindingKey) || ((match = bindingKey.match(<any> matchRegex)) && callbackFn(match, bindingKey));
        };
    }
    
    export function trim(string: string) {
        return string == null ? '' :
            string.trim ?
                string.trim() :
                string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }
}

export default _utils;