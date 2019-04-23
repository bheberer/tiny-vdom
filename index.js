/* 
TODO:
diffing algorithm
*/

// generates a dom node w/ children and attributes
export function elem(type, props = {}, children = []) {
  let node = document.createElement(type);

  for (const [k, v] of Object.entries(props)) {
    if (k === 'style') {
      for (const [i, j] of Object.entries(props[k])) {
        node.style[i] = j;
      }
    } else {
      node[k] = v;
    }
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
function counterApp(props, prevState) {
  let state = prevState || {
    count: 0
  };

  const setState = newState => {
    state = {
      ...state,
      ...newState
    };
    render(counterApp(undefined, state), '#app');
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

// state pulled out of component to eliminate need for 'this'.
// Playing with this or with the 'prevState' pattern to keep it within the component.
let state = {
  listItems: [
    {
      checked: false,
      value: 'Clean Room'
    },
    {
      checked: false,
      value: 'Do Homework'
    },
    {
      checked: false,
      value: 'Study for test'
    }
  ],
  filter: false
};

// canonical todo app
function TodoList(props, prevState) {
  let state = prevState || {
    listItems: [
      {
        checked: false,
        value: 'Clean Room'
      },
      {
        checked: false,
        value: 'Do Homework'
      },
      {
        checked: false,
        value: 'Study for test'
      }
    ],
    filter: false
  };

  let setState = newState => {
    state = {
      ...state,
      ...newState
    };
    render(new this.__proto__.constructor(undefined, state), '#app');
  };

  let toggleFilter = e => {
    setState({ filter: event.target.checked });
  };

  let toggleItem = e => {
    let newList = state.listItems.map((item, i) =>
      i == e.target.id ? { ...item, checked: !item.checked } : item
    );
    setState({ listItems: newList });
  };

  let getFilteredItems = () =>
    state.listItems.filter(item => !(state.filter && item.checked));

  return elem('div', undefined, [
    elem('div', undefined, [
      elem('input', {
        type: 'checkbox',
        id: 'filter',
        name: 'filter',
        onclick: toggleFilter,
        checked: state.filter
      }),
      elem('label', { for: 'filter' }, ['Hide Finished'])
    ]),
    ...getFilteredItems().map((item, i) =>
      elem(
        'div',
        { style: { display: 'flex' } },
        item.checked
          ? [
              TodoListItem({ text: item.value, id: i, onclick: toggleItem }),
              elem('div', undefined, ['👍'])
            ]
          : [TodoListItem({ text: item.value, id: i, onclick: toggleItem })]
      )
    )
  ]);
}
function TodoListItem({ text, id, onclick }) {
  return elem('div', { id, onclick }, [text]);
}

render(new TodoList(), '#app');
