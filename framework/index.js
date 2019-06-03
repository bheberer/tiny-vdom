import { diff } from './diff';

let currentComponent;
let currentIndex;

export function Component(props, component, children) {
	this.props = props;
	this.render = component;
	this.children = children;
	// __hooks
	// fragment
}

// mounts fragment to dom
export function render(element, target) {
	let fragment = getFragment(createVDom(element));
	target.parentNode.replaceChild(fragment, target);
}

export function createVDom(element, lastComponent) {
	if (typeof element === 'string') {
		return element;
	}

	if (!element.props || element.props === null) {
		element.props = {};
	}

	if (typeof element.type === 'function') {
		element.type = new Component(element.props, element.type, element.children);
		element.type.parentComponent = lastComponent;
		element.type.element = element;
		element.type.vDom = element;

		createVDom(element, element.type);
	} else if (element.type instanceof Component) {
		currentComponent = element.type;
		currentIndex = 0;

		let children = element.type.render(element.props);
		element.type.children = [children];
		element.type.vDom.children = [children];
		element.children = [children];
		lastComponent = element.type;
		let vDomChildren = [];
		element.children.forEach(child => {
			if (Array.isArray(child)) {
				child.forEach(c => vDomChildren.push(createVDom(c, lastComponent)));
			} else {
				vDomChildren.push(createVDom(child, lastComponent));
			}
		});
		element.children = vDomChildren;
	} else if (Array.isArray(element)) {
		element.forEach(child => {
			createVDom(child, lastComponent);
		});
	} else {
		let vDomChildren = [];
		element.children.forEach(child => {
			if (Array.isArray(child)) {
				child.forEach(c => vDomChildren.push(createVDom(c, lastComponent)));
			} else {
				vDomChildren.push(createVDom(child, lastComponent));
			}
		});
		element.children = vDomChildren;
	}

	return element;
}

function getFragment(vDom) {
	let node;
	if (vDom.type instanceof Component) {
		let fragment = getFragment(vDom.children[0]);
		vDom.type.fragment = fragment;
		node = fragment;
	} else if (typeof vDom === 'string') {
		node = document.createTextNode(vDom);
	} else {
		node = document.createElement(vDom.type);

		for (const [k, v] of Object.entries(vDom.props)) {
			if (k === 'style') {
				for (const [i, j] of Object.entries(vDom.props[k])) {
					node.style[i] = j;
				}
			} else {
				node[k] = v;
			}
		}

		// this can still get cleaned up i think
		vDom.children.forEach(child => {
			if (Array.isArray(child)) {
				child.forEach(c => {
					node.append(getFragment(c));
				});
			} else if (typeof child === 'object') {
				node.append(getFragment(child));
			} else {
				node.append(getFragment(child));
			}
		});
	}

	return node;
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
					let element = createVDom(hookState._component.element);
					let patch = diff(hookState._component.vDom, element);
					patch(hookState._component.fragment);
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
				let element = createVDom(hookState._component.element);
				console.log(hookState._component.vDom);
				return true;
				let patch = diff(hookState._component.vDom, element);
				patch(hookState._component.fragment);
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

export function createContainer(fn) {
	let open = (...args) => {
		let hookState = getHookState(currentIndex++);
		if (!hookState._component) {
			hookState._component = currentComponent;
			let contents = fn(...args);
			currentComponent.container = { ...contents };
			currentComponent.containerFn = fn;
		}
		return currentComponent.container;
	};
	let use = () => {
		let hookState = getHookState(currentIndex++);
		if (!hookState._component) {
			hookState._component = currentComponent;
			let parent = currentComponent.parentComponent;
			while (parent) {
				if (parent.containerFn === fn) {
					return parent.container;
				}
				parent = parent.parentComponent;
			}
		}
	};
	return { open, use };
}

/*
createContainer creates an association with that particular state container and the component
useContainer subscribes a child component to that container
any updates to said container will update the component that the container was created in
*/

// make containers accept props (can make them optionally a function)
// propogate containers down to children
