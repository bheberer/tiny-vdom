import { elem, render, app } from './framework';
/* 
TODO:
diffing / patching algorithm
*/

let { getState, setState, effect } = new app(
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
	TodoList
);

// canonical todo app
function TodoList(props) {
	let state = getState();

	effect(
		() => {
			document.title = state.filter;
		},
		{ filter: state.filter }
	);

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
							TodoListItem({ text: item.value, id: i, onclick: toggleItem }),
							elem('div', undefined, ['👍'])
					  ]
					: [TodoListItem({ text: item.value, id: i, onclick: toggleItem })]
			)
		)
	]);
}

function TodoListItem({ text, id, onclick }) {
	return elem('div', { id, onclick }, [text]);
}

render(TodoList(), '#app');
