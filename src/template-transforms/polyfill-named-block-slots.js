const Visitor = require('@sclaxton/handlebars').Visitor;
const GlimmerSyntax = require('@sclaxton/glimmer-syntax');
const builders = require('../syntax/builders');
const utils = require('../syntax/utils');
const hb = require('@sclaxton/handlebars');

const glimmerBuilders = GlimmerSyntax.builders;

module.exports = PolyfillNamedBlockSlots;

function PolyfillNamedBlockSlots() {
  Visitor.apply(this, arguments);
  this.mutating = true;
  this.refs = {};
}

PolyfillNamedBlockSlots.prototype = Object.create(Visitor.prototype);

PolyfillNamedBlockSlots.prototype.PathExpression = function(block) {
  Visitor.prototype.PathExpression.apply(this, arguments);
  var maybeRef = block.parts[0];
  this.refs[maybeRef] = true;
};

PolyfillNamedBlockSlots.prototype.compileLambdaTemplate = function(templateString) {
  var transform = new PolyfillNamedBlockSlots();
  var compiledTemplate = transform.accept(
    hb.parse(templateString)
  );
  // we have a compiled template, and all the references.
  return {
    compiledTemplate: compiledTemplate,
    refs: transform.refs,
  };
};

PolyfillNamedBlockSlots.prototype.LambdaBlock = function(block) {
  var templateString = block.contentLines.join('');

  let data = this.compileLambdaTemplate(templateString);

  var bpMap = {};
  var hashPairs = [];
  block.blockParams.forEach(function(bp) { bpMap[bp] = true; });
  Object.keys(data.refs).forEach(function(r) {
    if (!bpMap[r]) {
      // we only want to pass in references that are NOT block params.
      // block params will be accessed via the computed property
      // in the generated .js file.
      hashPairs.push(
        glimmerBuilders.pair(r, glimmerBuilders.path(r))
      );
    }
  });

  return glimmerBuilders.sexpr('component', [glimmerBuilders.string('x-bar')], glimmerBuilders.hash(hashPairs));
};

PolyfillNamedBlockSlots.prototype.BlockStatement = function(block) {
  Visitor.prototype.BlockStatement.apply(this, arguments);

  // if this is a user-space block component
  if (block.path.original.indexOf('-') > -1) {
    const slotChain = utils.getSlotChain(block);
    const originalLoc = block.loc;
    const hashPairs = block.hash && block.hash.pairs;

    if (slotChain) {
      const slotHashPairs = utils.getNamedHasBlockHashPairs(slotChain);
      const newProgram = builders.slotCaseChainProgram(slotChain, originalLoc);
      const newHashpairs = hashPairs && hashPairs.length > 0 ? hashPairs.concat(slotHashPairs) : slotHashPairs;

      return glimmerBuilders.block(
        block.path,
        block.params,
        glimmerBuilders.hash(newHashPairs),
        newProgram,
        null,
        originalLoc
      );
    } else {
      const singletonSlotChain = utils.getSingletonAnonymousSlotChain(block);
      const newProgram = builders.slotCaseChainProgram(singletonSlotChain, originalLoc);

      return glimmerBuilders.block(
        block.path,
        block.params,
        hashPairs,
        newProgram,
        block.inverse,
        originalLoc
      );
    }
  }

  return;
};
