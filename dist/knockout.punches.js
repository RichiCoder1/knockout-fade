/*!
 * 
 * @license Knockout.Punches
 * Enhanced binding syntaxes for Knockout
 * (c) Richard Simpson 2016, Michael Best 2014-2015
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 * Version 0.6.0
 */
!function(e,r){if("object"==typeof exports&&"object"==typeof module)module.exports=r(require("knockout"));else if("function"==typeof define&&define.amd)define(["knockout"],r);else{var n=r("object"==typeof exports?require("knockout"):e.ko);for(var t in n)("object"==typeof exports?exports:e)[t]=n[t]}}(this,function(e){return function(e){function r(t){if(n[t])return n[t].exports;var i=n[t]={exports:{},id:t,loaded:!1};return e[t].call(i.exports,i,i.exports,r),i.loaded=!0,i.exports}var n={};return r.m=e,r.c=n,r.p="",r(0)}([function(e,r,n){"use strict";var t,i=n(1),a=n(2),o=n(3),u=n(4),s=n(5),d=n(6),l=n(7),c=n(8);!function(e){function r(){c._interpolationMarkup.enable(),c._attributeInterpolationMarkup.enable(),u["default"].enableForBinding("attr"),u["default"].enableForBinding("css"),u["default"].enableForBinding("event"),u["default"].enableForBinding("style"),i.bindingHandlers.checked.after.push("attr.value"),o._textFilter.enableForBinding("text"),o._textFilter.enableForBinding("html"),u["default"].addDefaultBindingPreprocessor("attr",o._textFilter.preprocessor),s["default"].enableForBinding("click"),s["default"].enableForBinding("submit"),s["default"].enableForBinding("optionsAfterRender"),u["default"].addDefaultBindingPreprocessor("event",s["default"].preprocessor),d["default"].addPreprocessor("template","beforeRemove",s["default"].preprocessor),d["default"].addPreprocessor("template","afterAdd",s["default"].preprocessor),d["default"].addPreprocessor("template","afterRender",s["default"].preprocessor)}e.utils=a["default"],e.textFilter=o._textFilter,e.namespacedBinding=u["default"],e.wrappedCallback=s["default"],e.preprocessBindingProperty=d["default"],e.expressionCallback=l["default"],e.interpolationMarkup=c._interpolationMarkup,e.attributeInterpolationMarkup=c._attributeInterpolationMarkup,e.enableAll=r}(t||(t={})),i.punches=t},function(r,n){r.exports=e},function(e,r,n){"use strict";var t,i=n(1);!function(e){function r(e,r){return t(n(e),"preprocess",r)}function n(e){return"object"==typeof e?e:i.getBindingHandler(e)||(i.bindingHandlers[e]={})}function t(e,r,n){if(e[r]){var t=e[r];e[r]=function(e,r,i){return e=t.call(this,e,r,i),e?n.call(this,e,r,i):void 0}}else e[r]=n;return e}function a(e){var r=i.bindingProvider.instance;if(r.preprocessNode){var n=r.preprocessNode;r.preprocessNode=function(r){var t=n.call(this,r);return t||(t=e.call(this,r)),t}}else r.preprocessNode=e}function o(e,r){var n=i.getBindingHandler;i.getBindingHandler=function(t){var i;return n(t)||(i=t.match(e))&&r(i,t)}}function u(e){return null==e?"":e.trim?e.trim():e.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")}e.addBindingPreprocessor=r,e.getOrCreateHandler=n,e.chainPreprocessor=t,e.addNodePreprocessor=a,e.addBindingHandlerCreator=o,e.trim=u}(t||(t={})),r.__esModule=!0,r["default"]=t},function(e,r,n){"use strict";var t=n(1),i=n(2),a=function(){function e(){}return e.uppercase=function(e){return String.prototype.toUpperCase.call(t.unwrap(e))},e.lowercase=function(e){return String.prototype.toLowerCase.call(t.unwrap(e))},e._default=function(e,r){return e=t.unwrap(e),"function"==typeof e?e:"string"==typeof e?""===i["default"].trim(e)?r:e:null==e||0==e.length?r:e},e.replace=function(e,r,n){return String.prototype.replace.call(t.unwrap(e),r,n)},e.fit=function(e,r,n,i){if(e=t.unwrap(e),!(r&&(""+e).length>r))return e;switch(n=""+(n||"..."),r-=n.length,e=""+e,i){case"left":return n+e.slice(-r);case"middle":var a=Math.ceil(r/2);return e.substr(0,a)+n+e.slice(a-r);default:return e.substr(0,r)+n}},e.json=function(e,r,n){return t.toJSON(e,n,r)},e.number=function(e){return(+t.unwrap(e)).toLocaleString()},e}();r._filters=a;var o=function(){function e(){}return e.preprocessor=function(e){if(-1===e.indexOf("|"))return e;var r=e.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|\|\||[|:]|[^\s|:"'][^|:"']*[^\s|:"']|[^\s|:"']/g);if(r&&r.length>1){r.push("|"),e=r[0];for(var n,t,t,i=!1,a=!1,o=1;t=r[o];++o)"|"===t?(i&&(":"===n&&(e+="undefined"),e+=")"),a=!0,i=!0):(a?e="ko.filters['"+t+"']("+e:i&&":"===t?(":"===n&&(e+="undefined"),e+=","):e+=t,a=!1),n=t}return e},e.enableForBinding=function(r){i["default"].addBindingPreprocessor(r,e.preprocessor)},e}();r._textFilter=o,t.filters=a,t.filters["default"]=a._default},function(e,r,n){"use strict";var t=n(1),i=n(2),a=function(){function e(){}return e.defaultGetHandler=function(e,r,n){function i(n){a[n]&&(a[n]=function(i,a){function o(){var r={};return r[e]=a(),r}var u=Array.prototype.slice.call(arguments,0);return u[1]=o,t.bindingHandlers[r][n].apply(this,u)})}var a=t.utils.extend({},this);return i("init"),i("update"),a.preprocess&&(a.preprocess=null),t.virtualElements.allowedBindings[r]&&(t.virtualElements.allowedBindings[n]=!0),a},e.addDefaultBindingPreprocessor=function(r,n){var a=t.getBindingHandler(r);if(a){var o=a.getNamespacedHandler||e.defaultGetHandler;a.getNamespacedHandler=function(){return i["default"].addBindingPreprocessor(o.apply(this,arguments),n)}}},e.preprocessor=function(r,n,i){if("{"!==r.charAt(0))return r;var a=t.expressionRewriting.parseObjectLiteral(r);t.utils.arrayForEach(a,function(r){i(n+e.namespaceDivider+r.key,r.value)})},e.enableForBinding=function(r){i["default"].addBindingPreprocessor(r,e.preprocessor)},e.addBindingHandlerCreator=function(e,r){var n=t.getBindingHandler;t.getBindingHandler=function(t){var i;return n(t)||(i=t.match(e))&&r(i,t)}},e.__init=function(){e.addBindingHandlerCreator(e.namespacedBindingMatch,function(r,n){var i=r[1],a=t.bindingHandlers[i];if(a){var o=r[2],u=a.getNamespacedHandler||e.defaultGetHandler,s=u.call(a,o,i,n);return t.bindingHandlers[n]=s,s}})},e.namespacedBindingMatch=/([^\.]+)\.(.+)/,e.namespaceDivider=".",e}();r.__esModule=!0,r["default"]=a,a.__init()},function(e,r,n){"use strict";var t=n(2),i=function(){function e(){}return e.preprocessor=function(e){return/^([$_a-z][$\w]*|.+(\.\s*[$_a-z][$\w]*|\[.+\]))$/i.test(e)?"function(_x,_y,_z){return("+e+")(_x,_y,_z);}":e},e.enableForBinding=function(r){t["default"].addBindingPreprocessor(r,e.preprocessor)},e}();r.__esModule=!0,r["default"]=i},function(e,r,n){"use strict";var t=n(2),i=function(){function e(){}return e.addPreprocessor=function(r,n,i){var a=t["default"].getOrCreateHandler(r);a._propertyPreprocessors||(t["default"].chainPreprocessor(a,"preprocess",e.propertyPreprocessor),a._propertyPreprocessors={}),t["default"].chainPreprocessor(a._propertyPreprocessors,n,i)},e.propertyPreprocessor=function(e,r,n){if("{"!==e.charAt(0))return e;var t=ko.expressionRewriting.parseObjectLiteral(e),i=[],a=this._propertyPreprocessors||{};return ko.utils.arrayForEach(t,function(e){var r=e.key,t=e.value;a[r]&&(t=a[r](t,r,n)),t&&i.push("'"+r+"':"+t)}),"{"+i.join(",")+"}"},e}();r.__esModule=!0,r["default"]=i},function(e,r,n){"use strict";var t=n(1),i=n(2),a=n(4),o=function(){function e(){}return e.makePreprocessor=function(e){return function(r){var n=r;return n&&(n=n.replace(/\s/g,"")),/^function\(.*,?\){.*}/gi.test(n)?"function("+e+"){return ("+r+")("+e+");}":"function("+e+"){return("+r+");}"}},e.enableForBinding=function(r,n){var n=Array.prototype.slice.call(arguments,1).join();i["default"].addBindingPreprocessor(r,e.makePreprocessor(n))},e.eventPreprocessor=e.makePreprocessor("$data,$event"),e}();r.__esModule=!0,r["default"]=o,t.bindingHandlers.on={getNamespacedHandler:function(e){var r=t.getBindingHandler("event"+a["default"].namespaceDivider+e);return i["default"].addBindingPreprocessor(r,o.eventPreprocessor)}}},function(e,r,n){"use strict";var t=n(1),i=n(2),a=function(){function e(){}return e.parseInterpolationMarkup=function(e,r,n){function t(e){var i=e.match(/^([\s\S]*)}}([\s\S]*?)\{\{([\s\S]*)$/);i?(t(i[1]),r(i[2]),n(i[3])):n(e)}var i=e.match(/^([\s\S]*?)\{\{([\s\S]*)}}([\s\S]*)$/);i&&(r(i[1]),t(i[2]),r(i[3]))},e.preprocessor=function(r){function n(e){e&&i.push(document.createTextNode(e))}function t(n){n&&i.push.apply(i,e.wrapExpression(n,r))}if(3===r.nodeType&&r.nodeValue&&-1!==r.nodeValue.indexOf("{{")&&"TEXTAREA"!=(r.parentNode||{}).nodeName){var i=[];if(e.parseInterpolationMarkup(r.nodeValue,n,t),i.length){if(r.parentNode){for(var a=0,o=i.length,u=r.parentNode;o>a;++a)u.insertBefore(i[a],r);u.removeChild(r)}return i}}},e.wrapExpression=function(e,r){var n,t,a=r?r.ownerDocument:document,o=!0,e=i["default"].trim(e),u=e[0],s=e[e.length-1],d=[];return"#"===u?("/"===s?n=e.slice(1,-1):(n=e.slice(1),o=!1),(t=n.match(/^([^,"'{}()\/:[\]\s]+)\s+([^\s:].*)/))&&(n=t[1]+":"+t[2])):"/"===u||(n="{"===u&&"}"===s?"html:"+i["default"].trim(e.slice(1,-1)):"text:"+i["default"].trim(e)),n&&d.push(a.createComment("ko "+n)),o&&d.push(a.createComment("/ko")),d},e.enable=function(){i["default"].addNodePreprocessor(e.preprocessor)},e}();if(r._interpolationMarkup=a,!t.virtualElements.allowedBindings.html){var o=t.bindingHandlers.html.update;t.bindingHandlers.html.update=function(e,r){if(8===e.nodeType){var n=t.unwrap(r());if(null!=n){var i=t.utils.parseHtmlFragment(""+n);t.virtualElements.setDomNodeChildren(e,i)}else t.virtualElements.emptyNode(e)}else o(e,r)},t.virtualElements.allowedBindings.html=!0}var u=function(){function e(){}return e.preprocessor=function(r){function n(e){e&&c.push('"'+e.replace(/"/g,'\\"')+'"')}function i(e){e&&(p=e,c.push("ko.unwrap("+e+")"))}if(1===r.nodeType&&r.attributes.length)for(var o=r.getAttribute(e.dataBind),u=t.utils.arrayPushAll([],r.attributes),s=u.length,d=0;s>d;++d){var l=u[d];if(l.specified&&l.name!=e.dataBind&&-1!==l.value.indexOf("{{")){var c=[],p="";if(a.parseInterpolationMarkup(l.value,n,i),c.length>1&&(p='""+'+c.join("+")),p){var f=l.name.toLowerCase(),g=e.attributeBinding(f,p,r)||e._attributeBinding(f,p,r);o?o+=","+g:o=g,r.setAttribute(e.dataBind,o),r.removeAttribute(l.name)}}}},e._attributeBinding=function(e,r,n){return t.getBindingHandler(e)?e+":"+r:"attr."+e+":"+r},e.enable=function(){i["default"].addNodePreprocessor(e.preprocessor)},e.dataBind="data-bind",e.attributeBinding=e._attributeBinding,e}();r._attributeInterpolationMarkup=u}])});