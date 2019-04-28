import { elem, render, app, Component, e } from './framework';
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

// Components of this style might have to be on the table because I may have to call new Component during render in order to get refs.
// the problem with that is calling new Component on each render
// maybe have a separate object controlling ref internals? (would happen every time a component is a component or a component utilizes lifecyle)
// let Counter = props => ({
// 	state: { count: 0 },
// 	render: state => (
// 		<div id={props.id}>
// 			<button onclick={() => (state.count -= 1)}>-</button>
// 			{state.count}
// 			<button onclick={() => (state.count += 1)}>+</button>
// 		</div>
// 	)
// });

let CounterApp = () => (
	<div>
		<CounterComp id='first' />
		<CounterComp id='second' />
	</div>
);

render(<Counter />, document.querySelector('#app'));