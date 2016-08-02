import { createElement } from 'react';
import ReactDOMFactories from 'react/lib/ReactDOMFactories';

let _componentMap = null;

export default class ReactJsonSchema {

  parseSchema(schema) {
    let element = null;
    let elements = null;
    if (Array.isArray(schema)) {
      elements = this.parseSubSchemas(schema);
    } else {
      element = this.createComponent(schema);
    }
    return element || elements;
  }

  parseSubSchemas(subSchemas = []) {
    const Components = [];
    let index = 0;
    for (const subSchema of subSchemas) {
      subSchema.key = index;
      Components.push(this.parseSchema(subSchema));
      index++;
    }
    return Components;
  }

  createComponent(schema) {
    const { component, children, text, ...rest} = schema;
    const Component = this.resolveComponent(schema);
    const Children = typeof text !== 'undefined' ? text : this.resolveComponentChildren(schema);
    return createElement(Component, rest, Children);
  }

  resolveComponent(schema) {
    let Component = null;
    if (schema.hasOwnProperty('component')) {
      if (schema.component === Object(schema.component)) {
        Component = schema.component;
      } else if (_componentMap && _componentMap[schema.component]) {
        Component = _componentMap[schema.component];
      } else if (ReactDOMFactories.hasOwnProperty(schema.component)) {
        Component = schema.component;
      }
    } else {
      throw new Error('ReactJsonSchema could not resolve a component due to a missing component attribute in the schema.');
    }
    return Component;
  }

  resolveComponentChildren(schema) {
    return (schema.hasOwnProperty('children')) ?
      this.parseSchema(schema.children) : [];
  }

  getComponentMap() {
    return _componentMap;
  }

  setComponentMap(componentMap) {
    _componentMap = componentMap;
  }
}
