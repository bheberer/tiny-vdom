// generates a dom node w/ children and attributes
export function elem(type, props = {}, children = []) {
	let node = document.createElement(type);

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
		node.append(child);
	});

	return node;
}

// // renders generated elements to a dom target. Simple right now, no diffing, just replaces the entire tree.
export function render(element, target) {
	let targetNode = document.querySelector(target);
	while (targetNode.firstChild) {
		targetNode.removeChild(targetNode.firstChild);
	}
	targetNode.append(element);
	return targetNode;
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

export function Component(component) {
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
		console.log(getState);
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

export function ReactiveComponent(initialState, component) {
	let generateState = () => {
		this.state = { data: { ...initialState } };
		Object.keys(initialState).forEach(key => {
			Object.defineProperty(this.state, key, {
				get: () => {
					return this.state.data[key];
				},
				set: (newValue) => {
					this.state.data[key] = newValue;
					render(component(this.props, this.state, effect), '#app');
				}
			});
		});
	};

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
