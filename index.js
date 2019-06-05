import { e, render, createVDom } from './framework/index';
import {
	value,
	obj,
	createContainer,
	onMount,
	onDestroy
} from './framework/hooks';
import TemperatureConverter from './7guis/TemperatureConverter';
import TodoList from './Todo';
import FlightBooker from './7guis/FlightBooker';

/* 
TODO: in order of priority
diffing / patching algorithm
	- optimizing keyed lists
batch updates within event loop
get 'set' tp work because I still think it's cool
lifecycle
	- onMount *
	- onDestroy *
	- onUpdate
lol tests
watch *
make code not an absolute mess
default props dont work
fragments / find a way to circumvent
linkedState to get rid of the annoying value + onchange / oninput?
scoped css api?
*/

console.log(
	createVDom(
		<div>
			<p><div /></p>
		</div>
	)
);

function CounterNoMount() {
	let count = value(0);
	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={() => count.value++}>increment</button>
		</div>
	);
}

function CounterMount() {
	let count = value(0);
	onMount(() => {
		console.log('oh shit');
	});
	onDestroy(() => {
		console.log('boom');
	});
	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={() => count.value++}>increment</button>
		</div>
	);
}

function PokemonList() {
	let items = value([]);
	onMount(() => {
		fetch('https://pokeapi.co/api/v2/pokemon/')
			.then(res => res.json())
			.then(res => {
				items.value = res.results;
			});
	});
	return (
		<div>
			{items.value.length === 0
				? 'Loading...'
				: items.value.map(item => <p>{item.name}</p>)}
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
	let val = value(true);
	onMount(() => {
		console.log('hi');
	});
	return (
		<div>
			<button onclick={() => (val.value = !val.value)}>switch</button>
			{val.value ? <CounterMount /> : <CounterNoMount />}
		</div>
	);
}
render(<TodoList />, document.querySelector('#app'));
