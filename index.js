import {
	e,
	render,
	value,
	obj,
	createContainer,
	createVDom
} from './framework/index';

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

let counter = (initialCount, step) => {
	let count = value(initialCount);
	let increment = () => count.value++;
	return { count, increment };
};

let ressetableCounter = (initialCount, step) => {
	let { count, increment } = counter(initialCount, step);
	let reset = () => (count.value = 0);
	return { reset, count, increment };
};

let CounterContainer = createContainer(ressetableCounter);

function Counter({ initialCount, step }) {
	let { count } = CounterContainer.open(initialCount, step);
	return (
		<div>
			<input type='number' value={count.value} />
			<IncrementButton />
			<ResetButton />
		</div>
	);
}

function IncrementButton() {
	let { increment } = CounterContainer.use();
	return <button onclick={increment}>+</button>;
}

function ResetButton() {
	let { reset } = CounterContainer.use();
	return <button onclick={reset}>reset</button>;
}

// input not a thing yet bc of no diffing alg, focus state gets destroyed
function TodoList() {
	let data = obj({
		items: [{ text: 'clean room', checked: false }],
		filter: false,
		text: ''
	});

	let toggleFilter = e => {
		data.filter = e.target.checked;
	};

	let addTodo = e => {
		data.items = [...data.items, { text: data.text, checked: false }];
		// data.items.push({ text: data.text, checked: false });
	};

	// console.log(data.items)

	let onTextChange = e => {
		data.text = e.target.value;
	};

	let toggleItem = e => {
		data.items = data.items.map((item, i) =>
			i == e.target.id ? { ...item, checked: !item.checked } : item
		);
	};

	let getFilteredItems = () =>
		data.items.filter(item => !(data.filter && item.checked));

	// console.log(getFilteredItems())

	return (
		<div>
			<input type='text' oninput={onTextChange} value={data.text} />
			<button onclick={addTodo}>Add Todo</button>
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
			<input
				type='checkbox'
				name='filter'
				onclick={toggleFilter}
				checked={data.filter}
			/>
			<label for='filter'>Hide Finished</label>
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

function App() {
	return (
		<div>
			<Counter initialCount={0} step={1} />
			<TodoList />
		</div>
	);
}
render(<App />, document.querySelector('#app'));
