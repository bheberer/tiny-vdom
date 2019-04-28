import { render, Component, e, mount } from './framework';
/* 
TODO:
diffing / patching algorithm
going to do lifecycle
currently, render is just going to strings, set it to render to  anode
test whole thing with nested stateful components
update elem + render to work with jsx
 - elem should do just that, create elems. actually, change 'elem' to 'e'
*/

let TodoList = new Component(
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

		return (
			<div>
				<input
					type='checkbox'
					name='filter'
					onclick={toggleFilter}
					checked={state.filter}
				/>
				<label for='filter'>Hide Finished</label>
				<ul>
					{getFilteredItems().map((item, i) => (
						<li
							style={item.checked ? { textDecoration: 'line-through' } : {}}
							onclick={toggleItem}
							id={i}
						>
							{item.value}
						</li>
					))}
				</ul>
			</div>
		);
	}
);

let TodoListItem = ({ contents, id, onclick, checked }) => (
	<li
		style={checked ? { textDecoration: 'line-through' } : {}}
		onclick={onclick}
		id={id}
	>
		{contents}
	</li>
);

let Counter = new Component({ count: 0 }, (props, state) => (
	<div>
		<button onclick={() => (state.count -= 1)}>-</button>
		{state.count}
		<button onclick={() => (state.count += 1)}>+</button>
	</div>
));

// maybe the route is Component -> Comp-Ref

let CounterComp = props => {
	return new Component(
		{ count: 0 },
		(props, state) => (
			<div id={props.id}>
				<button onclick={() => (state.count -= 1)}>-</button>
				{state.count}
				<button onclick={() => (state.count += 1)}>+</button>
			</div>
		),
		'#' + props.id
	)(props);
};

let CounterApp = () => (
	<div>
		<Counter id='first' />
		<Counter id='second' />
	</div>
);

mount(render(<CounterApp />, document.querySelector('#app')), document.querySelector('#app'));