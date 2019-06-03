export let currentComponent;
export let currentIndex;
export let currentHook = {};

export function getHookState(index) {
	let hooks =
		currentComponent.__hooks ||
		(currentComponent.__hooks = { _list: [], _mount_callbacks: [] });

	if (index >= hooks._list.length) {
		hooks._list.push({});
	}

	return hooks._list[index];
}

export function value(initialValue) {
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
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
					let oldVDom = hookState._component.vDom;
					let element = createVDom(hookState._component.element);
					console.log(oldVDom, element);
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
	let hookState = getHookState(currentIndex++);
	if (!hookState._component) {
		hookState._component = currentComponent;
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

export function onMount(callback) {
	let hookState = getHookState(currentIndex++);
	hookState._value = callback;
	currentComponent.__hooks._mount_callbacks.push(hookState);
}
