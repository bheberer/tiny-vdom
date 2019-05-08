import {
	render,
	Component,
	e,
	mount,
	ComponentInternals,
	renderNova,
	value,
	state
} from './framework';

/* 
TODO:
diffing / patching algorithm
lifecycle
global state access
prevent automatic rerender on inputs / find a way to maintain focus and mouse state between renders (pretty sure this will be fine when i implement diffing)
allow state object to be reset
use proxies instead of getters / setters
batch updates in the same block
use textnodes
*/

// mount(render(<CounterApp />), document.querySelector('#app'));

// have child function components that take in 'state' reference the nearest ancestor state

// let synth = new Tone.FMSynth().toMaster();
// let pitchInterpolater = new Tone.CtrlInterpolate([40, 2000]);
// let volumeInterpolater = new Tone.CtrlInterpolate([5, -20]);

// maybe components should be purely function and just recieve everything in an object like this
/*
object could be like:
{
	state,
	props,
	onInit,
	onMount,
	onUpdate,
	onDestroy,
	ref,
	global,
	style
}
*/

function CounterMult() {
	return (
		<div>
			<CounterNova />
			<CounterNova />
		</div>
	);
}

function CounterReactiveNova() {
	let countState = state({ count: 0 });
	let count = value(5);
	let incrementState = () => countState.count++;
	let increment = () => count.value++;
	return (
		<div>
			<input type='number' value={countState.count} />
			<button onclick={incrementState}>count state</button>
			<input type='number' value={count.value} />
			<button onclick={increment}>count</button>
		</div>
	);
}

function CounterAppHooks() {
	return (
		<div>
			<CounterReactiveNova id={1} />
			<CounterReactiveNova id={2} />
		</div>
	);
}

mount(renderNova(<CounterAppHooks />), document.querySelector('#app'));
