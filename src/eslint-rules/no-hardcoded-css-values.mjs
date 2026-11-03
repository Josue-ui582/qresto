const hexColorPattern = /#[\da-f]{3,8}(?![\da-f])/i;
const pixelSizePattern = /(?<![A-Za-z0-9.-])\d+(?:\.\d+)?px(?=$|[\W_])/i;
const colorAttributes = new Set(['fill', 'stroke', 'stopColor', 'color']);

function inspect(context, node, value) {
  if (hexColorPattern.test(value)) {
    context.report({ node, message: 'Use a design-system color token instead of a hardcoded hex color.' });
  }
  if (pixelSizePattern.test(value)) {
    context.report({ node, message: 'Use rem or a design-system token instead of a hardcoded pixel size.' });
  }
}

function inspectStyleObject(context, node) {
  if (node.type !== 'ObjectExpression') return;

  for (const property of node.properties) {
    if (property.type !== 'Property') continue;
    const value = property.value;
    if (value.type === 'Literal' && typeof value.value === 'string') {
      inspect(context, value, value.value);
    }
    if (value.type === 'TemplateLiteral') {
      for (const quasi of value.quasis) {
        inspect(context, quasi, quasi.value.raw);
      }
    }
  }
}

const noHardcodedCssValues = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded hex colors and pixel sizes in UI styling.',
    },
    schema: [],
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const attributeName = node.name.name;
        const value = node.value;

        if (attributeName === 'style' && value?.type === 'JSXExpressionContainer') {
          inspectStyleObject(context, value.expression);
          return;
        }

        if (attributeName !== 'className' && !colorAttributes.has(attributeName)) return;
        if (value?.type === 'Literal' && typeof value.value === 'string') {
          inspect(context, value, value.value);
        }
        if (value?.type === 'JSXExpressionContainer') {
          const expression = value.expression;
          if (expression.type === 'TemplateLiteral') {
            for (const quasi of expression.quasis) {
              inspect(context, quasi, quasi.value.raw);
            }
          }
          if (expression.type === 'Literal' && typeof expression.value === 'string') {
            inspect(context, expression, expression.value);
          }
        }
      },
    };
  },
};

export default noHardcodedCssValues;
