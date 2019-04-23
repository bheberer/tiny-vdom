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
function counterApp() {
  this.state = {
    count: 0
  };

  const setState = newState => {
    this.state = {
      ...this.state,
      ...newState
    };
    console.log(this);
    render(this.render(), '#app');
  };

  const decrementHandler = () => {
    setState({ count: this.state.count - 1 });
  };

  const incrementHandler = () => {
    setState({ count: this.state.count + 1 });
  };

  this.render = function() {
    return elem('div', undefined, [
      elem(
        'button',
        {
          onclick: incrementHandler
        },
        ['+']
      ),
      elem('p', undefined, [this.state.count]),
      elem(
        'button',
        {
          onclick: decrementHandler
        },
        ['-']
      )
    ]);
  };
}

// Canonical todo app
function TodoList(props) {
  this.state = {
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
    this.state = {
      ...this.state,
      ...newState
    };
    render(this.render(), '#app');
  };

  let toggleFilter = e => {
    setState({ filter: event.target.checked });
  };

  let toggleItem = e => {
    let newList = this.state.listItems.map((item, i) =>
      i == e.target.id ? { ...item, checked: !item.checked } : item
    );
    setState({ listItems: newList });
  };

  let getFilteredItems = () =>
    this.state.listItems.filter(item => !(this.state.filter && item.checked));

  this.render = function() {
    return elem('div', undefined, [
      elem('div', undefined, [
        elem('input', {
          type: 'checkbox',
          id: 'filter',
          name: 'filter',
          onclick: toggleFilter,
          checked: this.state.filter
        }),
        elem('label', { for: 'filter' }, ['Hide Finished'])
      ]),
      ...getFilteredItems().map((item, i) =>
        TodoListItem({ text: item.value, id: i, onclick: toggleItem })
      )
    ]);
  };
}

function TodoListItem({ text, id, onclick }) {
  return elem('div', { id, onclick }, [text]);
}

// render(new counterApp().render(), '#app');
render(new TodoList().render(), '#app');
