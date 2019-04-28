export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}

export function render(element) {
	let node;
	if (typeof element.type === 'function') {
		node = render(element.type(element.props));
		return node;
	} else if (element.type instanceof Component) {
		let internals = element.type.render(element.props);
		internals.setRef(render(internals.render()));
		node = internals.ref;
		return node;
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
					node.append(c);
				});
			} else if (typeof child === 'object') {
				node.append(render(child, node));
			} else {
				node.append(child);
			}
		});
	}

	return node;
}

export function mount(dom, target) {
	console.log(dom);
	target.parentNode.replaceChild(dom, target);
	return dom;
}

export function ComponentInternals(props, initialState, component) {
	let generateState = () => {
		this.state = { data: { ...initialState } };
		Object.keys(initialState).forEach(key => {
			Object.defineProperty(this.state, key, {
				get: () => {
					return this.state.data[key];
				},
				set: newValue => {
					this.state.data[key] = newValue;
					this.ref = mount(render(this.render()), this.ref);
				}
			});
		});
	};

	this.ref = this.ref || {};

	this.setRef = ref => {
		this.ref = ref;
	};

	generateState();
	this.props = props || {};

	this.render = () => {
		return component(this.props, this.state);
	};
}

export function Component(initialState, component) {
	this.render = props => {
		return new ComponentInternals(props, initialState, component);
	};
}
