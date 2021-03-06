import closureType from 'closure-type';
import dispatcher from '../app_dispatcher';
import constants from '../constants/todo_constants';

var TODO_DEFAULTS = {
  completed: false
};

export default closureType(function todoActions(self, api, initArgs) {
  initArgs(function(persistence) {
    self.persistence = persistence;
  })();

  closureType.extend(api, {
    clearCompleted(todos) {
      var completed = Object.keys(todos)
        .map(id => todos[id])
        .filter(todo => todo.completed);

      Promise.all(completed.map(todo => self.persistence.remove(todo)))
        .then(() => {
          dispatcher.dispatch({
            type: constants.TODO_REMOVE,
            todos: completed
          });
        });
    },

    create(todo) {
      copyDefaults(todo);
      self.persistence.create(todo).then(todo => {
        dispatcher.dispatch({
          type: constants.TODO_CREATE,
          todos: [todo]
        });
      });
    },

    loadAll() {
      self.persistence.index().then(todos => {
        dispatcher.dispatch({
          type: constants.TODO_CREATE,
          todos
        });
      });
    },

    remove(todo) {
      self.persistence.remove(todo).then(() => {
        dispatcher.dispatch({
          type: constants.TODO_REMOVE,
          todos: [todo]
        });
      });
    },

    update(todo, updates) {
      closureType.extend(todo, updates);
      self.persistence.update(todo).then(todo => {
        dispatcher.dispatch({
          type: constants.TODO_UPDATE,
          todo
        });
      });
    }
  });
});

function copyDefaults(todo) {
  for (var prop in TODO_DEFAULTS) {
    if (!todo.hasOwnProperty(prop)) {
      todo[prop] = TODO_DEFAULTS[prop];
    }
  }
}
