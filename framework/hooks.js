import { createVDom } from './index';
import { diff } from './diff';

export let currentHook = {};

export function getHookState(index) {
	let hooks =
		currentHook.component.__hooks ||
		(currentHook.component.__hooks = {
			_list: [],
			_mount_callbacks: [],
			_destroy_callbacks: []
		});

	if (index >= hooks._list.length) {
		hooks._list.push({});
	}

	return hooks._list[index];
}

export function value(initialValue) {
	let hookState = getHookState(currentHook.index++);
	if (!hookState._component) {
		hookState._component = currentHook.component;
		hookState._value = new Proxy(
			{
				value: initialValue
			},
			{
				get: function(obj, prop) {
					return obj[prop];
				},
				set: function(obj, prop, value) {
					obj[prop] = value;
					let oldVDom = { ...hookState._component.vDom };
					let element = createVDom(hookState._component.element);
					let patch = diff(oldVDom, element);
					patch(hookState._component.fragment);
					return true;
				}
			}
		);
	}

	return hookState._value;
}

export function obj(initialState) {
	let hookState = getHookState(currentHook.index++);
	if (!hookState._component) {
		hookState._component = currentHook.component;
		hookState._value = new Proxy(initialState, {
			get: function(obj, prop) {
				return obj[prop];
			},
			set: function(obj, prop, value) {
				if (prop === 'set') {
					obj = {
						...obj,
						...value
					};
				} else {
					obj[prop] = value;
				}
				let oldVDom = { ...hookState._component.vDom };
				let element = createVDom(hookState._component.element);
				let patch = diff(oldVDom, element);
				patch(hookState._component.fragment);
				return true;
			}
		});
	}

	return hookState._value;
}

export function createContainer(fn) {
	let open = (...args) => {
		let hookState = getHookState(currentHook.index++);
		if (!hookState._component) {
			hookState._component = currentHook.component;
			let contents = fn(...args);
			currentHook.component.container = { ...contents };
			currentHook.component.containerFn = fn;
		}
		return currentHook.component.container;
	};
	let use = () => {
		let hookState = getHookState(currentHook.index++);
		if (!hookState._component) {
			hookState._component = currentHook.component;
			let parent = currentHook.component.parentComponent;
			while (parent) {
				if (parent.containerFn === fn) {
					return parent.container;
				}
				parent = parent.parentComponent;
			}
		}
	};
	return { open, use };
}

export function onMount(callback) {
	let hookState = getHookState(currentHook.index++);
	if (!hookState._component) {
		hookState._component = currentHook.component;
		hookState._value = callback;
		currentHook.component.__hooks._mount_callbacks.push(hookState);
	}
}

export function onDestroy(callback) {
	let hookState = getHookState(currentHook.index++);
	if (!hookState._component) {
		hookState._component = currentHook.component;
		hookState._value = callback;
		currentHook.component.__hooks._destroy_callbacks.push(hookState);
	}
}

export function watch(values, callback) {
	let hookState = getHookState(currentHook.index++);
	if (!hookState._component) {
		hookState._component = currentHook.component;
		hookState._value = {};
		values.forEach((val, i) => {
			hookState._value[i] = val;
		});
		let callbackResult = callback();
		hookState._value['result'] = callbackResult;
		return callback();
	}
	
	values.forEach((val, i) => {
		if (hookState._value[i] !== val) {
			let callbackResult = callback();
			hookState._value['result'] = callbackResult;
			return callback();
		}
	});

	return hookState._value['result'];
}
