import _utils from "./utils";

export default class _preprocessBindingProperty {
    // Attach a preprocess function to a specific property of a binding. This allows you to
    // preprocess binding "options" using the same preprocess functions that work for bindings.
    static addPreprocessor(bindingKeyOrHandler, property, preprocessFn) {
        var handler = _utils.getOrCreateHandler(bindingKeyOrHandler);
        if (!handler._propertyPreprocessors) {
            // Initialize the binding preprocessor
            _utils.chainPreprocessor(handler, 'preprocess', _preprocessBindingProperty.propertyPreprocessor);
            handler._propertyPreprocessors = {};
        }
        // Add the property preprocess function
        _utils.chainPreprocessor(handler._propertyPreprocessors, property, preprocessFn);
    }

    // In order to preprocess a binding property, we have to preprocess the binding itself.
    // This preprocess function splits up the binding value and runs each property's preprocess
    // function if it's set.
    private static propertyPreprocessor(value, binding, addBinding) {
        if (value.charAt(0) !== "{")
            return value;

        var subBindings = ko.expressionRewriting.parseObjectLiteral(value),
            resultStrings = [],
            propertyPreprocessors = (<any> this)._propertyPreprocessors || {};
            
        ko.utils.arrayForEach(subBindings, function(keyValue) {
            var prop = keyValue.key, propVal = keyValue.value;
            if (propertyPreprocessors[prop]) {
                propVal = propertyPreprocessors[prop](propVal, prop, addBinding);
            }
            if (propVal) {
                resultStrings.push("'" + prop + "':" + propVal);
            }
        });
        return "{" + resultStrings.join(",") + "}";
    }
}