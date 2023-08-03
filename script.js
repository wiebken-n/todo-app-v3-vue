"use strict";

Vue.createApp({
  data() {
    return {
      state: [],
      stateRendered: [],
      newTodoDescription: "",
      todoFilter: "filterAll",
      english: true,
    };
  },

  methods: {
    changeTodoStyle(todoDoneState) {
      return {
        class: {
          "done-todo": todoDoneState,
        },
      };
    },

    addTodo() {
      const newTodo = { description: this.newTodoDescription, done: false };
      let double = false;
      if (
        this.newTodoDescription === "" ||
        this.newTodoDescription.length < 5
      ) {
        alert("Please enter a description for your Todo");
        return;
      } else {
        this.state.forEach((todo) => {
          if (
            newTodo.description.toString().toLowerCase() ===
            todo.description.toString().toLowerCase()
          ) {
            double = true;
            return;
          }
        });
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
        }
      }
      this.syncStorage(this.state);
    },

    updateTodo() {
      let todoIndex = 0;
      let i = 0;
      for (let i = 0; i < this.state.length; i++) {
        if (event.target.id === this.state[i].id) {
          todoIndex = i;
        }
      }
      const todo = this.state[i];
      fetch("http://localhost:4730/todos/" + event.target.id, {
        method: "PUT",
        headers: { "content-type": "application/JSON" },
        body: JSON.stringify(todo),
      })
        .then((res) => res.json())
        .then((updatedTodo) => {
          this.syncStorage(this.state);
          this.filterTodos();
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
      this.stateRendered = tempState;
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

    changeLanguage() {
      this.english = !this.english;
      if (this.english) {
        document.querySelector(".btn-switch-language").innerText = "DE";
        document.querySelector(".button-add-todo").innerText = "Add Todo";
        document.querySelector(".button-remove-done-todos").innerText =
          "Remove done Todos";
        document.querySelector(".label-all-todos").innerText = "All";
        document.querySelector(".label-all-todos").innerText = "Open";
        document.querySelector(".label-all-todos").innerText = "Done";
        document
          .querySelector(".text-todo-input")
          .setAttribute("placeholder", " What needs to be done?");
      } else if (!this.english) {
        document.querySelector(".btn-switch-language").innerText = "EN";
        document.querySelector(".button-add-todo").innerText = "Neues Todo";
        document.querySelector(".button-remove-done-todos").innerText =
          "Lösche erledigte Todos";
        document.querySelector(".label-all-todos").innerText = "Alle";
        document.querySelector(".label-all-todos").innerText = "Offene";
        document.querySelector(".label-all-todos").innerText = "Erledigte";
        document
          .querySelector(".text-todo-input")
          .setAttribute("placeholder", " Was ist zu erledigen?");
      }
    },
  },

  created() {
    fetch("http://localhost:4730/todos")
      .then((res) => res.json())
      .then((todosArrayApi) => {
        this.state = todosArrayApi;
        this.stateRendered = todosArrayApi;
        this.syncStorage(this.state);
      });
  },
}).mount("#app");
