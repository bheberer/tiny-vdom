import { Component } from './index';

export function diff(oldElement, newElement) {
	if (typeof oldElement === 'string' || typeof newElement === 'string') {
		if (oldElement !== newElement) {
			return node => {
				let newFragment = getFragment(newElement);
				node.replaceWith(newFragment);
				return newFragment;
			};
		} else {
			return node => node;
		}
	}

	if (Array.isArray(oldElement) || Array.isArray(newElement)) {
		let patch = diffChildren(oldElement, newElement);
		return node => {
			patch(node);
			return node;
		};
	}

	if (
		oldElement == null ||
		newElement == null ||
		oldElement.type !== newElement.type
	) {
		// this is probably where I would want to be running onMount + onDestroy if the elements are components
		console.log('yo')
		let fragment = oldElement.type.fragment;
		fragment.parentNode.replaceChild(fragment, render(newElement));
	}

	console.log(oldElement, newElement)

	let patchProps = diffProps(
		oldElement.type instanceof Component
			? oldElement.children[0].props
			: oldElement.props,
		newElement.type instanceof Component
			? newElement.children[0].props
			: newElement.props
	);
	let patchChildren = diffChildren(
		oldElement.type instanceof Component
			? oldElement.children[0].children
			: oldElement.children,
		newElement.type instanceof Component
			? newElement.children[0].children
			: newElement.children
	);

	return node => {
		patchProps && patchProps(node);
		patchChildren(node);
		return node;
	};
}

function diffProps(oldProps, newProps) {
	let patches = [];

	for (let [k, v] of Object.entries(newProps === null ? {} : newProps)) {
		patches.push(node => {
			node[k] = v;
			return node;
		});
	}

	for (let [k, v] of Object.entries(oldProps)) {
		if (!(k in newProps)) {
			patches.push(node => {
				node.removeAttribute(k, v);
				return node;
			});
		}
	}

	return node => {
		for (let patch of patches) {
			patch(node);
		}
		return node;
	};
}

// function diffProps(oldProps, newProps) {
// 	let patches = [];

// 	for (let [k, v] of Object.entries(newProps === null ? {} : newProps)) {
// 		if ((k in oldProps && oldProps[k] !== v) || !(k in oldProps)) {
// 			patches.push(node => {
// 				node[k] = v;
// 				return node;
// 			});
// 		}
// 	}

// 	for (let [k, v] of Object.entries(oldProps)) {
// 		if (!(k in newProps)) {
// 			patches.push(node => {
// 				node.removeAttribute(k, v);
// 				return node;
// 			});
// 		}
// 	}

// 	return node => {
// 		for (let patch of patches) {
// 			patch(node);
// 		}
// 		return node;
// 	};
// }

// theres a value in newProps that is in oldProps and they're the same so do nothing
// theres a value in newProps that is in oldProps and they're different so add patch
// theres a value in newProps that isn't in oldProps so add patch
// theres a value in oldProps that isn't in newProps

// the problem is that when we diff we plug in the div and its looking for three children when the component itself only has one child
function diffChildren(oldChildren, newChildren) {
	let patches = [];
	oldChildren.forEach((child, i) => {
		patches.push(diff(child, newChildren[i]));
	});
	let additionalPatches = [];
	for (let additionalChild of newChildren.slice(oldChildren.length)) {
		additionalPatches.push(node => {
			node.appendChild(getFragment(additionalChild));
			return node;
		});
	}
	return parent => {
		parent.childNodes.forEach((child, i) => {
			patches[i](child);
		});
		for (let patch of additionalPatches) {
			patch(parent);
		}
		return parent;
	};
}
