import { e, render, value, state } from './framework';

/* 
TODO: in order of priority
diffing / patching algorithm
batch updates within event loop
lifecycle
computed values / watch
make code not an absolute mess
fragments / find a way to circumvent
scoped css api?
*/

function useCounter(initialCount, step) {
	let count = value(0);
	let increment = () => (count.value += step);
	return { count, increment };
}

function Counter({ initialCount = 0, step = 1 }) {
	let { count, increment } = useCounter(initialCount, step);

	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={increment}>count state</button>
		</div>
	);
}

// input not a thing yet bc of no diffing alg, focus state gets destroyed
function TodoList() {
	let data = state({
		items: [
			{ text: 'study for finals', checked: false },
			{ text: 'fail finals', checked: false },
			{ text: 'clean room', checked: false }
		],
		filter: false,
		text: ''
	});

	let toggleFilter = e => {
		data.filter = e.target.checked;
	};

	let toggleItem = e => {
		data.items = data.items.map((item, i) =>
			i == e.target.id ? { ...item, checked: !item.checked } : item
		);
	};

	let getFilteredItems = () =>
		data.items.filter(item => !(data.filter && item.checked));

	return (
		<div>
			<input
				type='checkbox'
				name='filter'
				onclick={toggleFilter}
				checked={data.filter}
			/>
			<label for='filter'>Hide Finished</label>
			<ul>
				{getFilteredItems().map((item, i) => (
					<li
						style={item.checked ? { textDecoration: 'line-through' } : {}}
						onclick={toggleItem}
						id={i}
					>
						{item.text}
					</li>
				))}
			</ul>
		</div>
	);
}

/*
Thinking about css API, thinking about something like:

Counter.css = `
	button {
		...
	}
	input {
		...
	}
`
to attach styles to component instance (not even sure if that'll work)

Could also have the css function be a hook and call it within a component

SFC another obvious option but I don't want to be locked into SFCs
*/

render(<TodoList />, document.querySelector('#app'));
