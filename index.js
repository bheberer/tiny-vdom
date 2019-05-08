import { e, render, value, state } from './framework';

/* 
TODO:
diffing / patching algorithm
lifecycle
global state access (context)
computed values
prevent automatic rerender on inputs / find a way to maintain focus and mouse state between renders (pretty sure this will be fine when i implement diffing)
batch updates in the same block
use textnodes
optimize generally
*/


function useCounter(initialCount) {
	let count = value(0);
	let increment = () => count.value++;
	return { count, increment };
}

function Counter() {
	let count = value(5);
	let increment = () => count.value++;
	let countState = state({ count: 0 });
	let incrementState = () => countState.count++;
	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={increment}>count</button>
			<input type='number' value={countState.count} />
			<button onclick={incrementState}>count state</button>
			{}
		</div>
	);
}

function CounterCustom() {
	let { count, increment } = useCounter(0);
	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={increment}>count</button>
		</div>
	);
}

function CounterTest() {
	let { count, increment } = useCounter(0);
	return (
		<div>
			<input type='number' value={count.value} />
			<button onclick={increment}>count</button>
		</div>
	);
}

function CounterApp() {
	return (
		<div>
			<CounterCustom id={1} />
			<CounterTest id={2} />
		</div>
	);
}

render(<CounterApp />, document.querySelector('#app'));
