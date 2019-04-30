import { render, Component, e, mount, ComponentInternals } from './framework';
/* 
TODO:
diffing / patching algorithm
lifecycle
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
						<TodoListItem
							contents={item.value}
							id={i}
							onclick={toggleItem}
							checked={item.checked}
						/>
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

let Incrementer = (props, state) => (
	<button onclick={() => (state.count += 1)}>+</button>
);

let Counter = Component(
	{
		state: { count: 0 }
	},
	(props, state) => (
		<div>
			<button onclick={() => (state.count -= 1)}>-</button>
			{state.count}
			<Incrementer />
		</div>
	)
);

let CounterApp = () => (
	<div>
		<Counter />
		<Counter />
	</div>
);

function counter(step, state) {
	let increment = () => (state.count += step);
	let decrement = () => (state.count -= step);
	return { increment, decrement };
}

mount(render(<CounterApp />), document.querySelector('#app'));

// have child function components that take in 'state' reference the nearest ancestor state
