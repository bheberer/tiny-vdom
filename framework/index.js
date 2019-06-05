import { diff } from './diff';
import { currentHook } from './hooks';

export function Component(props, component, children) {
	this.props = props;
	this.render = component;
	this.children = children;
	// __hooks
	// fragment
}

// mounts fragment to dom
export function render(element, target) {
	// let fragment = getFragment(createVDom(element));
	let patch = diff({}, createVDom(element));
	patch(target);
	// target.parentNode.replaceChild(fragment, target);
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
		currentHook.component = element.type;
		currentHook.index = 0;

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

export function getFragment(vDom) {
	let node;
	if (vDom.type instanceof Component) {
		vDom.type.__hooks._mount_callbacks.forEach(hookState => hookState._value());
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
		// vDom.children.forEach(child => {
		// 	if (Array.isArray(child)) {
		// 		child.forEach(c => {
		// 			node.append(getFragment(c));
		// 		});
		// 	} else if (typeof child === 'object') {
		// 		node.append(getFragment(child));
		// 	} else {
		// 		node.append(getFragment(child));
		// 	}
		// });

		vDom.children.forEach(child => {
			node.append(getFragment(child));
		});
	}

	return node;
}

export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}
