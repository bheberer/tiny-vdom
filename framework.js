/*
Things that I want out of this framework
- powerful, but easy to use + get started with
- good runtime performance by using annoted dom comparison
- composable logic / lifecyle
- reactivity
- way to do component scoped styles
- built in global state management + context
- fragments
*/

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

// function generateState(initialState) {
// 	this.state = { data: { ...initialState } };
// 	Object.keys(initialState).forEach(key => {
// 		Object.defineProperty(this.state, key, {
// 			get: () => {
// 				return this.state.data[key];
// 			},
// 			set: newValue => {
// 				// let oldTree = this.render();
// 				console.log(newValue);
// 				if (!newValue) return;
// 				this.state.data[key] = newValue;
// 				// let newTree = this.render();
// 				this.ref = mount(render(this.render(), this.state), this.ref);
// 			}
// 		});
// 	});
// }

// export function ComponentInstance(props, config, component) {
// 	this.props = props || {};
// 	this.onMount = config.onMount;
// 	this.onUpdate = config.onUpdate;
// 	this.onDestroy = config.onDestroy;
// 	// this.state = config.state
// 	// 	? new Proxy(config.state, stateHandler(this.ref, this.render, this.state))
// 	// 	: {};
// 	config.state && generateState.bind(this)(config.state);
// 	this.render = () => {
// 		return component(this.props, this.state);
// 	};
// }

// export function Component(config, component) {
// 	return props => {
// 		return new ComponentInstance(props, config, component);
// 	};
// }

// export function render(element, state) {
// 	let node;
// 	if (typeof element.type === 'function') {
// 		node = render(element.type(element.props, state), state);
// 	} else if (element instanceof ComponentInstance) {
// 		element.ref = render(element.render(), element.state);
// 		node = element.ref;
// 	} else {
// 		node = document.createElement(element.type);
// 		if (!element.props) {
// 			element.props = {};
// 		}
// 		if (element.props === null) {
// 			element.props = {};
// 		}
// 		for (const [k, v] of Object.entries(element.props)) {
// 			if (k === 'style') {
// 				for (const [i, j] of Object.entries(element.props[k])) {
// 					node.style[i] = j;
// 				}
// 			} else {
// 				node[k] = v;
// 			}
// 		}

// 		element.children.forEach(child => {
// 			if (Array.isArray(child)) {
// 				child.forEach(c => {
// 					node.append(render(c, state));
// 				});
// 			} else if (typeof child === 'object') {
// 				node.append(render(child, state));
// 			} else {
// 				node.append(child);
// 			}
// 		});
// 	}

// 	return node;
// }

// Trying new reactive shit
class ComponentNovaTest {
	constructor(props, component) {
		this.props = props;
		this.render = component;

		this.current_component = this;

		this.reactive_values = [];
		this.reactive_states = [];
		this.computed_values = [];

		this.on_mount = [];
		this.on_destroy = [];
		this.on_update = [];
	}
}

let getCurrentComponent = () => {
	return this.current_component;
};

let current_component;

let values = [],
	currentValue = 0;

let states = [],
	currentState = 0;

export let value = initialValue => {
	values[currentValue] =
		values[currentValue] ||
		new Proxy(
			{ value: initialValue },
			{
				get: function(obj, prop) {
					return obj[prop];
				},
				set: function(obj, prop, value) {
					obj[prop] = value;
					let currFragment = current_component.fragment;
					current_component.fragment = mount(
						renderNova(current_component),
						currFragment
					);
					return true;
				}
			}
		);
	return values[currentValue++];
};

export let state = initialState => {
	states[currentState] =
		states[currentState] ||
		new Proxy(initialState, {
			get: function(obj, prop) {
				return obj[prop];
			},
			set: function(obj, prop, value) {
				obj[prop] = value;
				let currFragment = current_component.fragment;
				current_component.fragment = mount(
					renderNova(current_component),
					currFragment
				);
				return true;
			},
			deleteProperty: function(obj, prop) {
				if (prop in obj) {
					delete obj[prop];
				}
			}
		});
	return states[currentState++];
};

// render queue
let q = [];

let defer =
	typeof Promise == 'function'
		? Promise.prototype.then.bind(Promise.resolve())
		: setTimeout;

function enqueueRender(c) {
	defer(process);
}

function process() {
	let p;
	while ((p = q.pop())) {
		p.forceUpdate(false);
	}
}

export function renderNova(element) {
	let node;
	if (typeof element.type === 'function') {
		// // let component = new ComponentNovaTest(element.props, element.type);
		// current_component = new ComponentNovaTest(element.props, element.type);
		// current_component.fragment = renderNova(current_component.render());
		// currentValue = 0;
		// currentState = 0;
		// node = current_component.fragment;
		let component = new ComponentNovaTest(element.props, element.type);
		current_component = component;
		component.fragment = renderNova(current_component.render());
		currentValue = 0;
		currentState = 0;
		values = []
		node = component.fragment;
	} else if (element instanceof ComponentNovaTest) {
		current_component = element;
		element.fragment = renderNova(element.render());
		currentValue = 0;
		currentState = 0;
		node = element.fragment;
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
					node.append(renderNova(c));
				});
			} else if (typeof child === 'object') {
				node.append(renderNova(child));
			} else {
				node.append(child);
			}
		});
	}

	return node;
}
