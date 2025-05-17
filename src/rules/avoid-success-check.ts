// eslint-rules/no-direct-success-check.ts
import { TSESTree } from '@typescript-eslint/utils';
import { RuleModule } from '@typescript-eslint/utils/dist/ts-eslint';
import { Type, TypeChecker, type Node } from 'typescript';

/** For some reason if this enum gets imported it has issues with `fs` */
const UniqueESSymbol = 8192;

type Docs = { description: string };
const rule: RuleModule<'avoidSuccessCheck', []> = {
  defaultOptions: [],
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct truthy checks on result success values',
      recommended: 'error', // typed wrong?
    } as Docs,
    messages: {
      avoidSuccessCheck:
        'Success has not been narrowed down yet. Check `Failure` to narrow it down instead.',
    },
    schema: [],
  },
  create(context) {
    const parserServices = context.sourceCode.parserServices;
    if (!parserServices) {
      throw new Error(
        'Cannot execute rule no-direct-success-check - parserServices missing',
      );
    }
    const checker = parserServices.program?.getTypeChecker();
    if (!checker) {
      throw new Error(
        'Cannot execute rule no-direct-success-check - checker missing',
      );
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap!.get(node.test);

        if (expressionContainsNone(tsNode, checker)) {
          context.report({
            node: node.test,
            messageId: 'avoidSuccessCheck',
          });
        }

        // if (typeContainsNoneSymbol(type, checker)) {
        //   context.report({ node, messageId: 'avoidSuccessCheck' });
        // }
      },
    };
  },
};
function typeContainsNoneSymbol(
  type: Type,
  checker: TypeChecker,
  visited: Set<Type> = new Set(),
): boolean {
  function visit(type: Type): boolean {
    if (visited.has(type)) {
      return false;
    }
    visited.add(type);

    // Check for `typeof None`
    if (type.flags & UniqueESSymbol) {
      const symbol = type.getSymbol();
      if (symbol?.getName() === 'None') {
        return true;
      }
    }

    // Recurse union/intersection members
    if (type.isUnionOrIntersection()) {
      return type.types.some(visit);
    }

    // Recurse type arguments (e.g., generics like Option<T>)
    const typeArgs = type.aliasTypeArguments ?? [];
    if (typeArgs.length > 0 && typeArgs.some(visit)) {
      return true;
    }

    // Recurse properties' types (for type literals, interfaces, etc.)
    const props = type.getProperties();
    for (const prop of props) {
      const declaration = prop.valueDeclaration ?? prop.declarations?.[0];
      if (!declaration) {
        continue;
      }
      const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
      if (visit(propType)) {
        return true;
      }
    }

    return false;
  }

  return visit(type);
}

function expressionContainsNone(node: Node, checker: TypeChecker): boolean {
  const visitedTypes = new Set<Type>();
  let found = false;

  function visit(node: Node) {
    if (found) return;

    const type = checker.getTypeAtLocation(node);
    if (typeContainsNoneSymbol(type, checker, visitedTypes)) {
      found = true;
      return;
    }

    node.forEachChild(visit);
  }

  visit(node);
  return found;
}

export default rule;
