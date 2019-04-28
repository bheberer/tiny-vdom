// generates a dom node w/ children and attributes
export function elem(type, props = {}, ...children) {
	if (typeof type === 'function') {
		return type(props);
	}
	let node = document.createElement(type);
	if (props === null) {
		props = {};
	}

	for (const [k, v] of Object.entries(props)) {
		if (k === 'style') {
			for (const [i, j] of Object.entries(props[k])) {
				node.style[i] = j;
			}
		} else {
			node[k] = v;
		}
	}

	children.forEach(child => {
		if (Array.isArray(child)) {
			child.forEach(c => {
				node.append(c);
			});
		} else {
			node.append(child);
		}
	});

	return node;
}

export function e(type, props = {}, ...children) {
	return {
		type,
		props,
		children
	};
}

export function r(element, target) {
	let node;
	if (typeof element.type === 'function') {
		if (element.type(props).state) {
			new Component(element.type(props).state);
		}
		node = r(element.type(props));
	} else {
		node = document.createElement(type);

		for (const [k, v] of Object.entries(props)) {
			if (k === 'style') {
				for (const [i, j] of Object.entries(props[k])) {
					node.style[i] = j;
				}
			} else {
				node[k] = v;
			}
		}

		children.forEach(child => {
			if (Array.isArray(child)) {
				child.forEach(c => {
					node.append(c);
				});
			} else {
				node.append(child);
			}
		});
	}

	return node;
}

// // renders generated elements to a dom target. Simple right now, no diffing, just replaces the entire tree.
export function render(element, target) {
	console.log(target);
	while (target.firstChild) {
		target.removeChild(target.firstChild);
	}
	target.append(element);
	return target;
}

function diff(oldTree, newTree) {
	console.log(oldTree, newTree);
}

export function app(state, component) {
	this.state = this.state || state;
	this.deps = this.deps || {};

	return {
		getState: () => this.state,
		setState: newState => {
			this.tree = this.tree || component();
			this.state = {
				...this.state,
				...newState
			};
			let newTree = component(undefined, this.state);
			diff(this.tree, newTree);
			render(component(undefined, this.state), '#app');
		},
		effect: (func, deps) => {
			if (this.deps) {
				for (const [k, v] of Object.entries(this.deps)) {
					if (deps[k] !== this.deps[k]) {
						this.deps = deps;
						return func();
					}
				}
				return;
			} else {
				this.deps = deps;
				return func();
			}
		},
		render: (component, target) => {
			let targetNode = document.querySelector(target);
			while (targetNode.firstChild) {
				targetNode.removeChild(targetNode.firstChild);
			}
			targetNode.append(element);
			return targetNode;
		}
	};
}

export function ComponentTest(component) {
	// this.state = this.state || state;
	this.deps = this.deps || {};

	let getState = initialState => {
		this.state = this.state || initialState;
		return this.state;
	};
	let setState = newState => {
		this.tree = this.tree || component(props, getState, setState, effect);
		this.state = {
			...this.state,
			...newState
		};
		let newTree = component(props, getState, setState, effect);
		diff(this.tree, newTree);
		render(component(props, getState, setState, effect), '#app');
	};
	let effect = (func, deps) => {
		if (this.deps) {
			for (const [k, v] of Object.entries(this.deps)) {
				if (deps[k] !== this.deps[k]) {
					this.deps = deps;
					return func();
				}
			}
			return;
		} else {
			this.deps = deps;
			return func();
		}
	};

	return function(props) {
		return component(props, getState, setState, effect);
	};
}

export function Component(initialState, component, ref) {
	let generateState = () => {
		this.state = { data: { ...initialState } };
		Object.keys(initialState).forEach(key => {
			Object.defineProperty(this.state, key, {
				get: () => {
					return this.state.data[key];
				},
				set: newValue => {
					this.state.data[key] = newValue;
					render(
						component(this.props, this.state, effect),
						document.querySelector(this.ref)
					);
				}
			});
		});
	};
	this.ref = ref;

	this.deps = this.deps || {};
	generateState();

	let effect = (func, deps) => {
		if (this.deps) {
			for (const [k, v] of Object.entries(this.deps)) {
				if (deps[k] !== this.deps[k]) {
					this.deps = deps;
					return func();
				}
			}
			return;
		} else {
			this.deps = deps;
			return func();
		}
	};

	return props => {
		this.props = props || {};
		return component(this.props, this.state, effect);
	};
}

// function ComponentRef(component) {
// 	this.ref = ()
// }

// export function Component(initialState, component) {
// 	let internals =
// 	return props => {

// 	}
// }
