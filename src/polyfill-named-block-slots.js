const stripBom = require('strip-bom');
const PolyfillNamedBlockSlotsTransform = require('./template-transforms/polyfill-named-block-slots');
const PolyfillNamedBlockSlotsComponentTransform = require('./template-transforms/components/polyfill-named-block-slots');
const hb = require('@sclaxton/handlebars');
const syntax = require('@sclaxton/glimmer-syntax');

function transformTemplate(string) {
  const normalizedString = stripBom(string);
  const transform = new PolyfillNamedBlockSlotsTransform();

  let templateString = syntax.print(
    syntax.preprocess(
      transform.accept(
        hb.parse(normalizedString)
      )
    )
  );

  return {
    templateString: templateString,
    lambdaTemplates: transform.lambdaTemplates,
  };
}

module.exports = {
  transformTemplate: transformTemplate
};
