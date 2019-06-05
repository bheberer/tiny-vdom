import { obj, watch } from './framework/hooks';
import { e } from './framework/index'

export default function TodoList() {
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
	};

	let onTextChange = e => {
		data.text = e.target.value;
	};

	let toggleItem = e => {
		data.items = data.items.map((item, i) =>
			i == e.target.id ? { ...item, checked: !item.checked } : item
		);
	};

	let filteredItems = watch([data.filter, data.items], () => {
		return data.items.filter(item => !(data.filter && item.checked));
	});

	return (
		<div>
			<input type='text' oninput={onTextChange} value={data.text} />
			<button onclick={addTodo}>Add Todo</button>
			<ul>
				{filteredItems.map((item, i) => (
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

export function TodoListBind() {
	let data = obj({
		items: [{ text: 'clean room', checked: false }],
		filter: false,
		text: ''
	});

	let addTodo = e => {
		data.items = [...data.items, { text: data.text, checked: false }];
	};

	let toggleItem = e => {
		data.items = data.items.map((item, i) =>
			i == e.target.id ? { ...item, checked: !item.checked } : item
		);
	};

	let filteredItems = watch([data.filter, data.items], () => {
		return data.items.filter(item => !(data.filter && item.checked));
	});

	return (
		<div>
			<input type='text' value={bind(data, 'text')} />
			<button onclick={addTodo}>Add Todo</button>
			<ul>
				{filteredItems.map((item, i) => (
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
        checked={bind(data, 'filter')}
			/>
			<label for='filter'>Hide Finished</label>
		</div>
	);
}
