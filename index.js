/* 
TODO:
diffing algorithm
*/

// generates a dom node w/ children and attributes 
export function elem(type, props = {}, children = []) {
  let node = document.createElement(type);

  for (const [k, v] of Object.entries(props)) {
    node[k] = v;
  }

  children.forEach(child => {
    node.append(child);
  });

  return node;
}

// renders generated elements to a dom target. Simple right now, no diffing, just replaces the entire tree.
export function render(element, target) {
  let targetNode = document.querySelector(target);
  while (targetNode.firstChild) {
    targetNode.removeChild(targetNode.firstChild);
  }
  targetNode.append(element);
  return targetNode;
}

// basic stateful counter application
function counterApp({ count }) {
  let state = {
    count
  };

  const setState = newState => {
    state = {
      ...state,
      ...newState
    };
    render(counterApp(state), '#app');
  };

  const decrementHandler = () => {
    setState({ count: state.count - 1 });
  };

  const incrementHandler = () => {
    setState({ count: state.count + 1 });
  };

  return elem('div', undefined, [
    elem(
      'button',
      {
        onclick: incrementHandler
      },
      ['+']
    ),
    elem('p', undefined, [state.count]),
    elem(
      'button',
      {
        onclick: decrementHandler
      },
      ['-']
    )
  ]);
}

render(counterApp({ count: 0 }), '#app');
