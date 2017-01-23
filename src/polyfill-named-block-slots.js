const stripBom = require('strip-bom');
const PolyfillNamedBlockSlotsTransform = require('./template-transforms/polyfill-named-block-slots');
const PolyfillNamedBlockSlotsComponentTransform = require('./template-transforms/components/polyfill-named-block-slots');
const hb = require('@sclaxton/handlebars');
const syntax = require('@sclaxton/glimmer-syntax');

function isComponentTemplate(relativePath) {
  return (/components\//).test(relativePath);
}

function transformNonComponentTemplate(string) {
  var self = this;
  const transform = new PolyfillNamedBlockSlotsTransform({
  });
  return syntax.print(
    syntax.preprocess(
      transform.accept(
        hb.parse(string)
      )
    )
  );
}

function transformComponentTemplate(string) {
  const transform = new PolyfillNamedBlockSlotsComponentTransform();
  return syntax.print(
    syntax.preprocess(
      transform.accept(
        hb.parse(string)
      )
    )
  );
}

function transformTemplate(string, relativePath) {
  const normalizedString = stripBom(string);
  return transformNonComponentTemplate(normalizedString);
}

module.exports = {
  transformTemplate: transformTemplate,
  transformNonComponentTemplate: transformNonComponentTemplate,
  transformComponentTemplate: transformComponentTemplate
};
