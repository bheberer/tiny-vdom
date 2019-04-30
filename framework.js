export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}

export function mount(dom, target) {
	target.parentNode.replaceChild(dom, target);
	return dom;
}

function diff(oldTree, newTree) {
	if (oldTree.nodeName !== newTree.nodeName) {
		return () => render(newTree);
	}
}

function generateState(initialState) {
	this.state = { data: { ...initialState } };
	Object.keys(initialState).forEach(key => {
		Object.defineProperty(this.state, key, {
			get: () => {
				return this.state.data[key];
			},
			set: newValue => {
				let oldTree = this.render();
				this.state.data[key] = newValue;
				let newTree = this.render();
				this.ref = mount(render(this.render(), this.state), this.ref);
			}
		});
	});
}

export function ComponentInstance(props, config, component) {
	this.props = props || {};
	this.onMount = config.onMount;
	this.onUpdate = config.onUpdate;
	this.onDestroy = config.onDestroy;
	config.state && generateState.bind(this)(config.state);
	this.render = () => {
		return component(this.props, this.state);
	};
}

export function Component(config, component) {
	return props => {
		return new ComponentInstance(props, config, component);
	};
}

export function render(element, state) {
	let node;
	if (typeof element.type === 'function') {
		node = render(element.type(element.props, state), state);
	} else if (element instanceof ComponentInstance) {
		element.ref = render(element.render(), element.state);
		node = element.ref;
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
					node.append(render(c, state));
				});
			} else if (typeof child === 'object') {
				node.append(render(child, state));
			} else {
				node.append(child);
			}
		});
	}

	return node;
}
