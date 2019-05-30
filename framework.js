let currentComponent;
let currentIndex;

function Component(props, component, children) {
	this.props = props;
	this.render = component;
	this.children = children;
	// __hooks
	// fragment
}

// mounts fragment to dom
export function render(element, target) {
	let fragment = getFragment(element);
	target.parentNode.replaceChild(fragment, target);
}

// renders dom fragment
// if it sees a function, we're seeing a component that needs to be instantiated
// if it sees a component instance, we're re-rendering a component
// otherwise its typical elements
// need to get default props to work
export function getFragment(element) {
	let node;
	if (typeof element.type === 'function') {
		element.type = new Component(element.props, element.type, element.children);
		element.type.fragment = getFragment(element);
		element.fragment = element.type.fragment;
		element.type.vDom = element;
		node = element.type.fragment;
	} else if (element.type instanceof Component) {
		currentComponent = element.type;
		currentIndex = 0;
		element.type.fragment = getFragment(element.type.render(element.props));
		element.fragment = element.type.fragment;
		node = element.type.fragment;
	} else {
		node = document.createElement(element.type);
		element.dom = node;
		if (!element.props || element.props === null) {
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
					node.append(getFragment(c));
				});
			} else if (typeof child === 'object') {
				node.append(getFragment(child));
			} else {
				node.append(document.createTextNode(child));
			}
		});
	}
	return node;
}

function diff(oldElement, newElement) {
	if (
		oldElement == null ||
		newElement == null ||
		oldElement.type !== newElement.type
	) {
		let fragment = oldElement.type.fragment;
		fragment.parentNode.replaceChild(fragment, render(newElement));
	} else {
		if (
			typeof oldElement.type === 'function' &&
			typeof newElement.type === 'function'
		) {
			let updatedComponent = newElement.type(oldElement.props);
		}
	}
}

export function getHookState(index) {
	let hooks =
		currentComponent.__hooks ||
		(currentComponent.__hooks = { _list: [], _mount_callbacks: [] });

	if (index >= hooks._list.length) {
		hooks._list.push({});
	}

	return hooks._list[index];
}

export function value(initialValue) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
		hookState._value = new Proxy(
			{
				value: initialValue
			},
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

export function obj(initialState) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
		hookState._value = new Proxy(initialState, {
			get: function(obj, prop) {
				return obj[prop];
			},
			set: function(obj, prop, value) {
				if (prop === 'set') {
					obj = {
						...obj,
						...value
					};
				} else {
					obj[prop] = value;
				}
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

export function onMount(callback) {
	let hookState = getHookState(currentIndex++);
	hookState._value = callback;
	currentComponent.__hooks._mount_callbacks.push(hookState);
}

export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}

export function createContainer({ state, methods }) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
		let _state = obj(state);
		currentComponent.container = { state: _state, ...methods(_state) };
	}
	return currentComponent.container;
}

export function createContainerTest(fn) {
	let openContainer = (...args) => {
		let hookState = getHookState(currentIndex++);
		if (!hookState._component) {
			hookState._component = currentComponent;
			let contents = fn(...args);
			currentComponent.container = { ...contents };
		}
		return currentComponent.container;
	};
	let useContainer = () => {
		let hookState = getHookState(currentIndex++);
		if (!hookState._component) {
			hookState._component = currentComponent;
		}
	};
	return { openContainer };
}

// export function useContainer({ data, methods }) {
// 	for (const [k, v] of Object.entries(data)) {
// 		data[k] = typeof v === 'object' ? state(v) : value(v);
// 	}
// 	return {
// 		...data,
// 		...methods(data)
// 	};
// }

export function useContainer({ data, methods }) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
	}
}

export function compose(...containers) {
	let state = {},
		methods = {};
	containers.forEach((container, i) => {
		for (const [k, v] of Object.entries(container.state || {})) {
			state[k] = v;
		}
		methods[i] = container.methods;
	});
	return {
		state,
		methods: state => {
			let result = {};
			for (const [k, v] of Object.entries(methods)) {
				result = { ...result, ...v(state) };
			}
			return result;
		}
	};
}

/*
createContainer creates an association with that particular state container and the component
useContainer subscribes a child component to that container
any updates to said container will update the component that the container was created in
*/

// make containers accept props (can make them optionally a function)
// propogate containers down to children
