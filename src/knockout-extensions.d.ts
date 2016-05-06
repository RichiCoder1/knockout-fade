interface KnockoutBindingHandler {
    getNamespacedHandler?(eventName: string): KnockoutBindingHandler;
    _propertyPreprocessors?: any;
}