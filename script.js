"use strict";

Vue.createApp({
  data() {
    return {
      state: [],
      stateRendered: [],
      newTodoDescription: "",
      todoFilter: "filterAll",
    };
  },
  methods: {
    addTodo() {
      // take todo description (value of #todo-input) and create new todo with it
      // in API
      const newTodo = { description: this.newTodoDescription, done: false };
      let double = false;
      // no button action if input is empty
      if (this.newTodoDescription === "") {
        console.log("No valid Todo");
        return;
      } else {
        console.log("Valid Todo");
        this.state.forEach((todo) => {
          console.log(todo.description);
          console.log(this.newTodoDescription);
          // check for doubles
          if (
            newTodo.description.toString().toLowerCase() ===
            todo.description.toString().toLowerCase()
          ) {
            double = true;
            console.log("Todo already exists");
            return;
          }
        });
        console.log(double);
        this.newTodoDescription = "";
        if (!double) {
          fetch("http://localhost:4730/todos", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(newTodo),
          })
            .then((res) => res.json())
            .then((newTodoFromApi) => {
              this.state.push(newTodoFromApi);
              this.syncStorage(this.state);
              this.filterTodos();
            });

          console.log("its new!");
        }
      }
      this.syncStorage(this.state);
    },

    updateTodo() {
      console.log(event.target.id);
      console.log();
      let todoIndex = 0;
      let i = 0;

      for (let i = 0; i < this.state.length; i++) {
        if (event.target.id === this.state[i].id) {
          todoIndex = i;
          console.log(i);
          console.log(this.state[i].id);
          console.log(this.state[i]);
        }
      }
      const todo = this.state[i];
      console.log(this.state[i]);
      fetch("http://localhost:4730/todos/" + event.target.id, {
        method: "PUT",
        headers: { "content-type": "application/JSON" },
        body: JSON.stringify(todo),
      })
        .then((res) => res.json())
        .then((updatedTodo) => {
          this.syncStorage(this.state);
          this.filterTodos();
          // save state to local storage
        });
    },

    filterTodos() {
      let tempState = [];
      if (this.todoFilter === "" || this.todoFilter === "filterAll") {
        this.state.forEach((todo) => {
          tempState.push(todo);
        });
      } else if (this.todoFilter === "filterOpen") {
        this.state.forEach((todo) => {
          if (!todo.done) {
            tempState.push(todo);
          }
        });
      } else if (this.todoFilter === "filterDone") {
        this.state.forEach((todo) => {
          if (todo.done) {
            tempState.push(todo);
          }
        });
      }
      console.log(tempState);
      this.stateRendered = tempState;
      console.log(this.stateRendered);

      // render todos according to radio button status
    },

    removeTodos() {
      for (let todo of this.state) {
        if (todo.done === true) {
          const todoID = todo.id;
          fetch("http://localhost:4730/todos/" + todoID, {
            method: "DELETE",
          })
            .then((res) => res.json())
            .then(() => {
              const todoIndex = this.state.indexOf(todo);
              this.state.splice(todoIndex, 1);
              this.syncStorage(this.state);
              this.filterTodos();
            });
        }
      }
    },

    syncStorage(state) {
      const jsonState = JSON.stringify(state);
      localStorage.setItem("storageState", jsonState);
    },
  },
  computed: {
    /*
    alertNoTodoDescription() {
      return alert("Please enter a description for your Todo");
    },
    alertTodoDouble() {
      return alert("This Todo already exists");
    },
    */
  },

  created() {
    fetch("http://localhost:4730/todos")
      .then((res) => res.json())
      .then((todosArrayApi) => {
        this.state = todosArrayApi;
        this.stateRendered = todosArrayApi;
        console.log(this.state);
        this.syncStorage(this.state);
      });
  },
}).mount("#app");

/*



//-------------------------------------------------------------|| initialization / declaration of variables ||-------------------------
const textInput = document.querySelector(".text-todo-input");
const buttonAddTodo = document.querySelector(".button-add-todo");
const buttonRemoveTodo = document.querySelector(".button-remove-done-todos");
const checkboxContainer = document.querySelector(".todo-selection-container");
const checkboxAll = document.querySelector(".check-all-todos");
const checkboxOpen = document.querySelector(".check-open-todos");
const checkboxDone = document.querySelector(".check-done-todos");
const todoList = document.querySelector(".todo-list");
const btnSwitchLanguage = document.querySelector(".btn-switch-language");
const labelAllTodos = document.querySelector(".label-all-todos");
const labelOpenTodos = document.querySelector(".label-open-todos");
const labelDoneTodos = document.querySelector(".label-done-todos");

const state = [];
let language = "en";
let filteredTodos;

// -------------------------------------------------------|| execution of functions ||------------------------------------------

// load state
window.addEventListener("load", (event) => {
  loadStateFromApi();
  checkboxAll.checked = true;
});

// event listener for Add-todo button
buttonAddTodo.addEventListener("click", function (event) {
  const newTodo = { description: textInput.value.trim(), done: false };
  let double = false;
  // no button action if input is empty
  if (textInput.value.trim() === "") {
    alertNoTodoDescription();
  } else {
    state.forEach((todo) => {
      // check for doubles
      if (
        newTodo.description.toString().toLowerCase() ===
        todo.description.toString().toLowerCase()
      ) {
        double = true;
        alertTodoDouble();
        textInput.value = "";
      }
    });
    // post new Todo to API & state, overwrite localstorage with new state
    if (double === false) {
      fetch("http://localhost:4730/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newTodo),
      })
        .then((res) => res.json())
        .then((newTodoFromApi) => {
          state.push(newTodoFromApi);
          saveState();
          sortTodos();
          renderTodos();
        });
    }
  }
});

// render todo list according to checkbox state
checkboxContainer.addEventListener("change", function (event) {
  sortTodos();
  renderTodos();
});

// remove done todos if button is clicked
buttonRemoveTodo.addEventListener("click", function (event) {
  removeTodos();
});

//---------------------------------------------------------------|| functions for base functionality of the app ||-----------------------------------------------------

// gets resource items from API, loads items into state & local storage, sorts storage entries and renders them
function loadStateFromApi() {
  fetch("http://localhost:4730/todos")
    .then((res) => res.json())
    .then((todosArrayApi) => {
      for (let todo of todosArrayApi) {
        state.push(todo);
      }
      saveState();
      sortTodos();
      renderTodos();
    });
}

// save state to storage
function saveState() {
  const jsonState = JSON.stringify(state);
  localStorage.setItem("storageState", jsonState);
}

// sort todos according to current checkbox state
function sortTodos() {
  if (checkboxAll.checked) {
    filteredTodos = state.filter((todo) => {
      return todo;
    });
    return filteredTodos;
  }
  if (checkboxOpen.checked) {
    filteredTodos = state.filter((todo) => !todo.done);
    return filteredTodos;
  }
  if (checkboxDone.checked) {
    filteredTodos = state.filter((todo) => todo.done);
    return filteredTodos;
  }
  if (!checkboxAll.checked && !checkboxDone.checked && !checkboxOpen.checked) {
    filteredTodos = state.filter((todo) => {
      return todo;
    });

    return filteredTodos;
  }
}

// renders todos in todo list
function renderTodos() {
  // empty redered list
  todoList.innerText = "";
  // render todo list
  filteredTodos.forEach((todo) => {
    // create new li with checkbox & description
    const newTodoLi = document.createElement("li");
    const newCheckbox = document.createElement("input");
    const newLabel = document.createElement("label");
    const newTodoText = document.createTextNode(todo.description);
    newLabel.setAttribute("for", todo.description);
    newCheckbox.setAttribute("id", todo.description);

    // render checkbox state
    newCheckbox.type = "checkbox";
    newCheckbox.checked = todo.done;
    if (todo.done === true) {
      newTodoLi.classList.toggle("done-todo");
    }

    // adds event listener to checkbox of new todo and toggle done-status if checkbox is clicked
    addListenerToTodoCheckbox(todo, newTodoLi, newCheckbox);

    // assign description of todo as name to checkbox element
    newCheckbox.name = todo.description;
    // attach new li to todo-ul
    newTodoLi.append(newCheckbox, newLabel);
    newLabel.appendChild(newTodoText);
    todoList.appendChild(newTodoLi);
  });
  // empty text input
  textInput.value = "";
}

// filters todo list and removes done todos from API resource & state, saves state to local storage and renders state
function removeTodos() {
  for (let todo of state) {
    if (todo.done === true) {
      const todoID = todo.id;
      fetch("http://localhost:4730/todos/" + todoID, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(() => {
          const todoIndex = state.indexOf(todo);
          state.splice(todoIndex, 1);
          saveState();
          sortTodos();
          renderTodos();
        });
    }
  }
}

// add event listener to checkbox and toggle done-status if checkbox is clicked
function addListenerToTodoCheckbox(todo, newTodoLi, newCheckbox) {
  newCheckbox.addEventListener("change", function (event) {
    // set todo done status according to checkbox status
    todo.done = event.target.checked;
    // add strike-through-text class for done todo / remove for open todo
    newTodoLi.classList.toggle("done-todo");
    // alter todo state of todo in API resource
    fetch("http://localhost:4730/todos/" + todo.id, {
      method: "PUT",
      headers: { "content-type": "application/JSON" },
      body: JSON.stringify(todo),
    })
      .then((res) => res.json())
      .then((updatedTodo) => {
        // save state to local storage
        saveState();
      });
  });
}

// alert for no description for new todo
function alertNoTodoDescription() {
  if (language === "en") {
    alert("Please enter a description for your Todo");
  }
  if (language === "de") {
    alert("Bitte gib eine Beschreibung deines Todos ein");
  }
}

// alert if todo already exists
function alertTodoDouble() {
  if (language === "en") {
    alert("This Todo already exists");
  }
  if (language === "de") {
    alert("Dieses Todo gibt es schon");
  }
}

// -------------------------------------------------------------|| language toggle----------------------------------------------------------

// event listener for language switch button
btnSwitchLanguage.addEventListener("click", function (event) {
  ToggleLanguageState();
  changeLanguage();
  renderTodos();
});

// toggle language
function ToggleLanguageState() {
  btnSwitchLanguage.classList.toggle("btn-language-german");
  if (btnSwitchLanguage.classList.contains("btn-language-german")) {
    language = "de";
  }
  if (!btnSwitchLanguage.classList.contains("btn-language-german")) {
    language = "en";
  }
}

// change language
function changeLanguage() {
  if (language === "en") {
    language = "en";
    btnSwitchLanguage.innerText = "DE";
    buttonAddTodo.innerText = "Add Todo";
    buttonRemoveTodo.innerText = "Remove done Todos";
    labelAllTodos.innerText = "All";
    labelOpenTodos.innerText = "Open";
    labelDoneTodos.innerText = "Done";
    textInput.setAttribute("placeholder", " What needs to be done?");
  } else if (language === "de") {
    language = "de";
    btnSwitchLanguage.innerText = "EN";
    buttonAddTodo.innerText = "Neues Todo";
    buttonRemoveTodo.innerText = "Lösche erledigte Todos";
    labelAllTodos.innerText = "Alle";
    labelOpenTodos.innerText = "Offene";
    labelDoneTodos.innerText = "Erledigte";
    textInput.setAttribute("placeholder", " Was ist zu erledigen?");
  }
}

/*
// set language class according to state
function setLanguageClass() {
  if (language === "de") {
    btnSwitchLanguage.classList.add("btn-language-german");
  }
}
*/
