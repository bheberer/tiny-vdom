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

export function app(state, component) {
	this.state = this.state || state;

	return {
		getState: () => this.state,
		setState: newState => {
			this.state = {
				...this.state,
				...newState
			};
			render(component(undefined, this.state), '#app');
		},
		effect: (func, deps) => {
			if (this.deps) {
				for (const [k, v] of Object.entries(this.deps)) {
					if (deps[k] !== this.deps[k]) {
						this.deps = {
							...deps
						};
						return func();
					}
				}
				return;
			} else {
				this.deps = deps;
				return func();
			}
		}
	};
}