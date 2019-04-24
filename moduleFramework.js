const framework = (function() {
	let state = {},
		deps = {},
		currComponent;
	return {
		elem(type, props = {}, children = []) {
			return {
				type,
				props,
				children
			};
		},
		render(component) {
			currComponent = component;

			if (component.render) {
				state[currComponent.name] = component.initialState;
				component = component.render(state[currComponent.name]);
				console.log(component);
			}
			let node = document.createElement(component.type);
			for (const [k, v] of Object.entries(component.props)) {
				if (k === 'style') {
					for (const [i, j] of Object.entries(component.props[k])) {
						node.style[i] = j;
					}
				} else {
					node[k] = v;
				}
			}
			component.children.forEach(child => {
				if (typeof child !== 'object' && typeof child !== 'function') {
					node.append(child);
				} else {
					node.append(render(child));
				}
			});

			return node;
		},
		mount(element, target) {
			let targetNode = document.querySelector(target);
			while (targetNode.firstChild) {
				targetNode.removeChild(targetNode.firstChild);
			}
			targetNode.append(element);
			return targetNode;
		},
		setState(newState) {
			state[currComponent.name] = {
				...state[currComponent.name],
				...newState
			};
			render(currComponent);
		},
		setInitState(initState) {
			state[currComponent.name] = state[currComponent.name] || initState;
		}
	};
})();
let { elem, setState, render, mount } = framework;
function TodoList(props) {
	let toggleFilter = e => {
		setState({ filter: event.target.checked });
	};
	let toggleItem = e => {
		let newList = state.listItems.map((item, i) =>
			i == e.target.id ? { ...item, checked: !item.checked } : item
		);
		setState({ listItems: newList });
	};
	let getFilteredItems = () => state.listItems.filter(item => !(state.filter && item.checked));
	return {
		effects: [
			(() => {
				document.title = state.filter;
			},
			[state.filter])
		],
		initialState: {
			listItems: [
				{
					checked: false,
					value: 'Clean Room'
				},
				{
					checked: false,
					value: 'Do Homework'
				},
				{
					checked: false,
					value: 'Study for test'
				}
			],
			filter: false
		},
		render(state) {
			return elem('div', undefined, [
				elem('div', undefined, [
					elem('input', {
						type: 'checkbox',
						id: 'filter',
						name: 'filter',
						onclick: toggleFilter,
						checked: state.filter
					}),
					elem('label', { for: 'filter' }, ['Hide Finished'])
				]),
				...getFilteredItems().map((item, i) =>
					elem(
						'div',
						{ style: { display: 'flex' } },
						item.checked
							? [
									TodoListItem({
										text: item.value,
										id: i,
										onclick: toggleItem
									}),
									elem('div', undefined, ['👍'])
							  ]
							: [TodoListItem({ text: item.value, id: i, onclick: toggleItem })]
					)
				)
			]);
		}
	};
}
function TodoListItem({ text, id, onclick }) {
	return {
		render(state) {
			return elem('div', { id, onclick }, [text]);
		}
	};
}
mount(render(TodoList()), '#app');
