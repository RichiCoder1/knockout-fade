interface KnockoutBindingHandler {
    getNamespacedHandler?(eventName: string): KnockoutBindingHandler;
    _propertyPreprocessors?: any;
}

interface KnockoutBindingProvider {
    preprocessNode(node: Node): Node[] | void;
}