describe("Interpolation Markup preprocessor", function() {
    beforeEach(installMatchers);
    
    it('Should do nothing when there are no expressions', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some text"));
        expect(result).toBeUndefined();
    });

    it('Should do nothing when empty', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode(""));
        expect(result).toBeUndefined();
    });

    it('Should not parse unclosed binding', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some ${ text"));
        expect(result).toBeUndefined();
    });

    it('Should not parse unopened binding', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some } text"));
        expect(result).toBeUndefined();
    });

    it('Should create binding from ${...} expression', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some ${ expr } text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3]);   // text, comment, comment, text
        expect(result[1].nodeValue).toEqual('ko text:expr');
        expect(result[2].nodeValue).toEqual('/ko');
    });

    it('Should ignore escaped delimiters', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some ${ expr } \\} text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3]);   // text, comment, comment, text
        expect(result[1].nodeValue).toEqual('ko text:expr');
    });

    it('Should support two expressions', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("some ${ expr1 } middle ${ expr2 } text"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3, 8, 8, 3]);   // text, comment, comment, text, comment, comment, text
        expect(result[1].nodeValue).toEqual('ko text:expr1');
        expect(result[4].nodeValue).toEqual('ko text:expr2');
    });

    it('Should skip empty text', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("${ expr1 }${ expr2 }"));
        expect(result).toHaveNodeTypes([8, 8, 8, 8]);   // comment, comment, comment, comment
        expect(result[0].nodeValue).toEqual('ko text:expr1');
        expect(result[2].nodeValue).toEqual('ko text:expr2');
    });

    it('Should support more than two expressions', function() {
        var result = ko.punches.interpolationMarkup.preprocessor(document.createTextNode("x ${ expr1 } y ${ expr2 } z ${ expr3 }"));
        expect(result).toHaveNodeTypes([3, 8, 8, 3, 8, 8, 3, 8, 8]);   // text, comment, comment, text, comment, comment, text, comment, comment
        expect(result[1].nodeValue).toEqual('ko text:expr1');
        expect(result[4].nodeValue).toEqual('ko text:expr2');
        expect(result[7].nodeValue).toEqual('ko text:expr3');
    });
});

describe("Interpolation Markup bindings", function() {
    beforeEach(function() {
        prepareTestNode();
        installMatchers();
    });

    var savePreprocessNode = ko.bindingProvider.instance.preprocessNode;
    var originalWrapExpresssion = ko.punches.interpolationMarkup.wrapExpression;
    beforeEach(ko.punches.interpolationMarkup.enable);
    afterEach(function() { 
        ko.bindingProvider.instance.preprocessNode = savePreprocessNode; 
        ko.punches.interpolationMarkup.wrapExpression = originalWrapExpresssion;
    });

    it('Should replace ${...} expression with virtual text binding', function() {
        setNodeText(testNode, "hello ${'name'}!");
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello name!");
        expect(testNode).toContainHtml("hello <!--ko text:'name'-->name<!--/ko-->!");
    });

    it('Should replace multiple expressions', function() {
        setNodeText(testNode, "hello ${'name'}${'!'}");
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello name!");
    });

    it('Should support any content of expression, including functions and ${}', function() {
        setNodeText(testNode, "hello ${ (function(){return '\\${name}'}()) }!");
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello ${name}!");
    });

    it('Should ignore unmatched } and ${', function() {
        setNodeText(testNode, "hello }'name'${'!'}${");
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello }'name'!${");
    });

    it('Should update when observable changes', function() {
        setNodeText(testNode, "The best ${what}.");
        var observable = ko.observable('time');
        ko.applyBindings({what: observable}, testNode);
        expect(testNode).toContainText("The best time.");
        observable('fun');
        expect(testNode).toContainText("The best fun.");
    });

    it('Should be able to override wrapExpression to define a different set of elements', function() {
        ko.punches.interpolationMarkup.wrapExpression = function(expressionText, node) {
            return originalWrapExpresssion('"--" + ' + expressionText + ' + "--"', node);
        }

        setNodeText(testNode, "hello ${'name'}!");
        ko.applyBindings(null, testNode);
        expect(testNode).toContainText("hello --name--!");
    });

    it('Should not modify the content of <textarea> tags', function() {
        testNode.innerHTML = "<p>Hello</p><textarea>${'name'}</textarea><p>Goodbye</p>";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainHtml("<p>hello</p><textarea>${'name'}</textarea><p>goodbye</p>");
    });

    it('Should not modify the content of <script> tags', function() {
        testNode.innerHTML = "<p>Hello</p><script>${return}</script><p>Goodbye</p>";
        ko.applyBindings(null, testNode);
        expect(testNode).toContainHtml("<p>hello</p><script>${return}</script><p>goodbye</p>");
    });

    it('Should work when used in template declared using <script>', function() {
        testNode.innerHTML = "<div data-bind='template: \"tmpl\"'></div><script type='text/html' id='tmpl'>${'name'}</textarea>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0]).toContainText("name");
    });

    it('Should work when used in template declared using <textarea>', function() {
        testNode.innerHTML = "<div data-bind='template: \"tmpl\"'></div><textarea id='tmpl'>${'name'}</textarea>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0]).toContainText("name");
    });
});

describe("Attribute Interpolation Markup preprocessor", function() {
    var testNode;
    var originalAttributeBinding = ko.punches.attributeInterpolationMarkup.attributeBinding;
    beforeEach(function () {
        testNode = document.createElement("div");
    });
    afterEach(function () {
        ko.punches.attributeInterpolationMarkup.attributeBinding = originalAttributeBinding;
    });

    it('Should do nothing when there are no expressions', function() {
        testNode.setAttribute('title', "some text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('some text');
        expect(testNode.getAttribute('data-bind')).toBe(null);
    });

    it('Should do nothing when empty', function() {
        testNode.setAttribute('title', "");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toBe(null);
    });

    it('Should not parse unclosed binding', function() {
        testNode.setAttribute('title', "some ${text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('some ${text');
        expect(testNode.getAttribute('data-bind')).toBe(null);
    });

    it('Should not parse unopened binding', function() {
        testNode.setAttribute('title', "some} text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('some} text');
        expect(testNode.getAttribute('data-bind')).toBe(null);
    });

    it('Should create binding from ${...} expression', function() {
        testNode.setAttribute('title', "some ${expr} text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:""+"some "+ko.unwrap(expr)+" text"');
    });

    it('Should ignore unmatched delimiters', function() {
        testNode.setAttribute('title', "some ${expr1}expr2} text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:""+"some "+ko.unwrap(expr1}expr2)+" text"');
    });

    it('Should support two expressions', function() {
        testNode.setAttribute('title', "some ${expr1} middle ${expr2} text");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:""+"some "+ko.unwrap(expr1)+" middle "+ko.unwrap(expr2)+" text"');
    });

    it('Should skip empty text', function() {
        testNode.setAttribute('title', "${expr1}${expr2}");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:""+ko.unwrap(expr1)+ko.unwrap(expr2)');
    });

    it('Should support more than two expressions', function() {
        testNode.setAttribute('title', "x ${expr1} y ${expr2} z ${expr3}");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:""+"x "+ko.unwrap(expr1)+" y "+ko.unwrap(expr2)+" z "+ko.unwrap(expr3)');
    });

    it('Should create simple binding for single expression', function() {
        testNode.setAttribute('title', "${expr1}");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:expr1');
    });

    it('Should append to existing data-bind', function() {
        testNode.setAttribute('title', "${expr1}");
        testNode.setAttribute('data-bind', "text:expr2");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.title).toEqual('');
        expect(testNode.getAttribute('data-bind')).toEqual('text:expr2,attr.title:expr1');
    });

    it('Should not match expressions in data-bind', function() {
        testNode.setAttribute('data-bind', "text:'${xyz}'");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.getAttribute('data-bind')).toEqual("text:'${xyz}'");
    });

    it('Should support expressions in multiple attributes', function() {
        testNode.setAttribute('title', "${expr1}");
        testNode.setAttribute('class', "test");     // won't be in data-bind
        testNode.setAttribute('id', "${expr2}");
        testNode.setAttribute('data-test', "${expr3}");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:expr1,attr.id:expr2,attr.data-test:expr3'); // the order shouldn't matter
    });

    it('Should convert value and checked attributes to two-way bindings', function() {
        var input = document.createElement('input');
        input.type = 'checkbox';
        input.setAttribute('checked', "${expr2}");
        input.setAttribute('value', "${expr1}");
        ko.punches.attributeInterpolationMarkup.preprocessor(input);
        expect(input.getAttribute('data-bind')).toEqual('checked:expr2,value:expr1');
    });

    it('Should support custom attribute binding using "attributeBinding" extension point', function() {
        ko.punches.attributeInterpolationMarkup.attributeBinding = function(name, value, node) {
            var parsedName = name.match(/^ko-(.*)$/);
            if (parsedName) {
                return originalAttributeBinding(parsedName[1], value, node);
            }
        }
        // Won't be in data-bind because it doesn't include an expression
        testNode.setAttribute('ko-class', "test");
        // Should handle normal attributes normally
        testNode.setAttribute('title', "${expr1}");
        // This will use the custom handler
        testNode.setAttribute('ko-id', "${expr2}");
        ko.punches.attributeInterpolationMarkup.preprocessor(testNode);
        expect(testNode.getAttribute('data-bind')).toEqual('attr.title:expr1,attr.id:expr2');
    });
});

describe("Attribute Interpolation Markup bindings", function() {
    beforeEach(function() {
        prepareTestNode();
        installMatchers();
    });

    var savePreprocessNode = ko.bindingProvider.instance.preprocessNode;
    beforeEach(ko.punches.attributeInterpolationMarkup.enable);
    afterEach(function() { ko.bindingProvider.instance.preprocessNode = savePreprocessNode; });

    it('Should replace ${...} expression in attribute', function() {
        testNode.innerHTML = "<div title='hello ${\"name\"}!'></div>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0].title).toEqual("hello name!");
    });

    it('Should replace multiple expressions', function() {
        testNode.innerHTML = "<div title='hello ${\"name\"}${\"!\"}'></div>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0].title).toEqual("hello name!");
    });

    it('Should support any content of expression, including functions and ${}', function() {
        testNode.innerHTML = "<div title='hello ${ (function(){return \"\\${name}\"}()) }!'></div>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0].title).toEqual("hello ${name}!");
    });

    it('Should properly handle quotes in text sections', function() {
        testNode.innerHTML = "<div title='This is \"great\" ${\"fun\"} with &apos;friends&apos;'></div>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0].title).toEqual("This is \"great\" fun with 'friends'");
    });

    it('Should ignore unmatched } and ${', function() {
        testNode.innerHTML = "<div title='hello }\"name\"${\"!\"}${'></div>";
        ko.applyBindings(null, testNode);
        expect(testNode.childNodes[0].title).toEqual("hello }\"name\"!${");
    });

    it('Should support expressions in multiple attributes', function() {
        testNode.innerHTML = "<div title='${title}' id='${id}' class='test class' data-test='hello ${\"name\"}!' data-bind='text:content'></div>";
        ko.applyBindings({title: 'the title', id: 'test id', content: 'content'}, testNode);
        expect(testNode).toContainText("content");
        expect(testNode.childNodes[0].title).toEqual("the title");
        expect(testNode.childNodes[0].id).toEqual("test id");
        expect(testNode.childNodes[0].className).toEqual("test class");
        expect(testNode.childNodes[0].getAttribute('data-test')).toEqual("hello name!");
    });

    it('Should update when observable changes', function() {
        testNode.innerHTML = "<div title='The best ${what}.'></div>";
        var observable = ko.observable('time');
        ko.applyBindings({what: observable}, testNode);
        expect(testNode.childNodes[0].title).toEqual("The best time.");
        observable('fun');
        expect(testNode.childNodes[0].title).toEqual("The best fun.");
    });

    it('Should convert value attribute to two-way binding', function() {
        testNode.innerHTML = "<input value='${value}'/>";
        var observable = ko.observable('default value');
        ko.applyBindings({value: observable}, testNode);
        expect(testNode.childNodes[0].value).toEqual("default value");

        testNode.childNodes[0].value = 'user-enterd value';
        ko.utils.triggerEvent(testNode.childNodes[0], 'change');
        expect(observable()).toEqual("user-enterd value");
    });

    it('Should convert checked attribute to two-way binding', function() {
        testNode.innerHTML = "<input type='checkbox' checked='${isChecked}'/>";
        var observable = ko.observable(true);
        ko.applyBindings({isChecked: observable}, testNode);
        expect(testNode.childNodes[0].checked).toBe(true);

        testNode.childNodes[0].click();
        expect(observable()).toBe(false);
    });
});
