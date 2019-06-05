import { Component, getFragment } from './index';

export function diff(oldElement, newElement) {
	// console.log(oldElement, newElement)
	if (newElement === undefined) {
		return node => {
			node.remove();
			return undefined;
		};
	}

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

	if (
		oldElement.type !== newElement.type ||
		oldElement.type.render !== newElement.type.render
	) {
		if (oldElement.type instanceof Component) {
			oldElement.type.__hooks._destroy_callbacks.forEach(hookState =>
				hookState._value()
			);
		}

		return node => {
			node.replaceWith(getFragment(newElement));
			return node;
		};
	}

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
			if (k === 'style') {
				node.style = {};
				for (const [i, j] of Object.entries(v)) {
					node.style[i] = j;
				}
			} else {
				node[k] = v;
			}
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

const zip = (xs, ys) => {
	const zipped = [];
	for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
		zipped.push([xs[i], ys[i]]);
	}
	return zipped;
};

function diffChildren(oldChildren, newChildren) {
	// console.log(oldChildren, newChildren)
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
		// parent.childNodes.forEach((child, i) => {
		// 	patches[i](child);
		// });
		for (const [patch, child] of zip(patches, parent.childNodes)) {
			patch(child);
		}
		for (let patch of additionalPatches) {
			patch(parent);
		}
		return parent;
	};
}
