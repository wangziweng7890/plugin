export function dep(props, required = []) {
  return Object.keys(props).map((key) => {
    const prop = props[key]
    const type = prop.type
    return {
      name: key,
      type: type === 'array' ? `array[${prop.items.type}]` : type,
      required: required?.includes(key),
      description: prop.description,
      title: prop.title,
      enum: prop.enum || [],
      children:
        type === 'object'
          ? dep(prop.properties || {}, prop.required)
          : type === 'array'
            ? dep(prop.items.properties || {}, prop.required)
            : null,
    }
  })
}
