// Press ctrl+space for code completion
export default function transformer(file, api) {
  const j = api.jscodeshift

  function tranformArrtoObj(elements) {
    const reducerNames = elements.reduce((acc, el) => {
      const reducer = el.properties.find(prop => prop.key.name === 'type').value
        .value
      return [...acc, reducer]
    }, [])

    const obj = reducerNames.map((name, index) =>
      j.property(
        'init',
        j.identifier(name),
        j.objectExpression(elements[index].properties)
      )
    )
    const prop = j.property(
      'init',
      j.identifier('transformations'),
      j.objectExpression(obj)
    )

    return prop
  }

  return j(file.source)
    .find(j.Property)
    .filter(path => {
      return (
        path.node.key.name === 'transformations' &&
        path.parentPath.parentPath.parentPath.parentPath.node.callee.name ===
          'createModule' &&
        path.node.value.type === 'ArrayExpression'
      )
      //
    })
    .forEach(path => {
      const elements = path.node.value.elements
      const buildAst = tranformArrtoObj(elements)
      j(path).replaceWith(buildAst)
    })
    .toSource({
      quote: 'single',
      trailingComma: {
        objects: true,
        arrays: true,
        parameters: false,
      },
    })
}
