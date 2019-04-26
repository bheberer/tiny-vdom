import { elem, render, app, Component, ReactiveComponent } from './framework';
/* 
TODO:
diffing / patching algorithm
getting effects working w/ the new component model
test whole thing with nested stateful components
*/

let Counter = new ReactiveComponent({ count: 0 }, (props, state) => {
	return elem('div', {}, [
		elem('button', { onclick: () => (state.count -= 1) }, ['-']),
		state.count,
		elem('button', { onclick: () => (state.count += 1) }, ['+'])
	]);
});

let TodoListReactive = new ReactiveComponent(
	{
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
	(props, state) => {
		let toggleFilter = e => {
			state.filter = event.target.checked;
		};

		let toggleItem = e => {
			let newList = state.listItems.map((item, i) =>
				i == e.target.id ? { ...item, checked: !item.checked } : item
			);
			state.listItems = newList;
		};

		let getFilteredItems = () =>
			state.listItems.filter(item => !(state.filter && item.checked));

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
								TodoListItemReactive({
									text: item.value,
									id: i,
									onclick: toggleItem
								}),
								elem('div', undefined, ['👍'])
						  ]
						: [
								TodoListItemReactive({
									text: item.value,
									id: i,
									onclick: toggleItem
								})
						  ]
				)
			)
		]);
	}
);

function TodoListItemReactive({ text, id, onclick }) {
	return elem('div', { id, onclick }, [text]);
}

render(TodoListReactive(), '#app');
