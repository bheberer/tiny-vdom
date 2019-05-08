let currentComponent;
let currentIndex;

function Component(props, component, children) {
	this.props = props;
	this.render = component;
	this.children = children;
}

export function mount(dom, target) {
	target.parentNode.replaceChild(dom, target);
	return dom;
}

export function render(element, target) {
	let fragment = getFragment(element);
	target.parentNode.replaceChild(fragment, target);
}

export function getFragment(element) {
	let node;
	if (typeof element.type === 'function') {
		element.type = new Component(element.props, element.type, element.children);
		element.type.fragment = getFragment(element);
		node = element.type.fragment;
	} else if (element.type instanceof Component) {
		currentComponent = element.type;
		currentIndex = 0;
		element.type.fragment = getFragment(element.type.render(element.props));
		node = element.type.fragment;
	} else {
		node = document.createElement(element.type);
		if (!element.props) {
			element.props = {};
		}
		if (element.props === null) {
			element.props = {};
		}
		for (const [k, v] of Object.entries(element.props)) {
			if (k === 'style') {
				for (const [i, j] of Object.entries(element.props[k])) {
					node.style[i] = j;
				}
			} else {
				node[k] = v;
			}
		}

		element.children.forEach(child => {
			if (Array.isArray(child)) {
				child.forEach(c => {
					node.append(getFragment(c.node));
				});
			} else if (typeof child === 'object') {
				node.append(getFragment(child, node));
			} else {
				node.append(child);
			}
		});
	}
	return node;
}

export function getHookState(index) {
	let hooks = currentComponent.__hooks || (currentComponent.__hooks = []);

	if (index >= hooks.length) {
		hooks.push({});
	}

	return hooks[index];
}

export function value(initialValue) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
		hookState._value = new Proxy(
			{ value: initialValue },
			{
				get: function(obj, prop) {
					return obj[prop];
				},
				set: function(obj, prop, value) {
					obj[prop] = value;
					let element = {
						type: hookState._component,
						props: hookState._component.props,
						children: hookState._component.children
					};
					render(element, hookState._component.fragment);
					return true;
				}
			}
		);
	}

	return hookState._value;
}

export function state(initialState) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
		hookState._value = new Proxy(initialState, {
			get: function(obj, prop) {
				return obj[prop];
			},
			set: function(obj, prop, value) {
				obj[prop] = value;
				let element = {
					type: hookState._component,
					props: hookState._component.props,
					children: hookState._component.children
				};
				render(element, hookState._component.fragment);
				return true;
			}
		});
	}

  return hookState._value;
}

export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}
