/// <reference path="../typings/browser.d.ts" />
import * as ko from "knockout";
import _utils from "./utils";
import { _filters, _textFilter } from "./textFilter";
import _namespacedBinding from "./namespacedBinding";
import _wrappedCallback from "./wrappedCallback";
import _preprocessBindingProperty from "./preprocessBindingProperty";
import _expressionCallback from "./expressionCallback";
import { _attributeInterpolationMarkup, _interpolationMarkup } from "./interpolationMarkup";

module ko_punches {
     export var utils = _utils;
     export var textFilter = _textFilter;
     export var namespacedBinding = _namespacedBinding;
     export var wrappedCallback = _wrappedCallback;
     export var preprocessBindingProperty = _preprocessBindingProperty;
     export var expressionCallback = _expressionCallback;
     export var interpolationMarkup = _interpolationMarkup;
     export var attributeInterpolationMarkup = _attributeInterpolationMarkup;
     
     export function enableAll() {
        // Enable interpolation markup
        _interpolationMarkup.enable();
        _attributeInterpolationMarkup.enable();

        // Enable auto-namspacing of attr, css, event, and style
        _namespacedBinding.enableForBinding('attr');
        _namespacedBinding.enableForBinding('css');
        _namespacedBinding.enableForBinding('event');
        _namespacedBinding.enableForBinding('style');

        // Make sure that Knockout knows to bind checked after attr.value (see #40)
        ko.bindingHandlers.checked.after.push('attr.value');

        // Enable filter syntax for text, html, and attr
        _textFilter.enableForBinding('text');
        _textFilter.enableForBinding('html');
        _namespacedBinding.addDefaultBindingPreprocessor('attr', _textFilter.preprocessor);

        // // Enable wrapped callbacks for click, submit, event, optionsAfterRender, and template options
        _wrappedCallback.enableForBinding('click');
        _wrappedCallback.enableForBinding('submit');
        _wrappedCallback.enableForBinding('optionsAfterRender');
        _namespacedBinding.addDefaultBindingPreprocessor('event', _wrappedCallback.preprocessor);
        _preprocessBindingProperty.addPreprocessor('template', 'beforeRemove', _wrappedCallback.preprocessor);
        _preprocessBindingProperty.addPreprocessor('template', 'afterAdd', _wrappedCallback.preprocessor);
        _preprocessBindingProperty.addPreprocessor('template', 'afterRender', _wrappedCallback.preprocessor);
     }
}
ko["punches"] = ko_punches;