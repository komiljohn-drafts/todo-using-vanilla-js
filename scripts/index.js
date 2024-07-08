const mainInput = document.getElementById("main_input");
const categoryInput = document.getElementById("category_input");
const todoErrorText = document.getElementById("todo_error_msg");
const todoList = document.getElementById("todo_list");
const categoryList = document.getElementById("category_list");
const mainTitle = document.querySelector(".main_title");
const addButton = document.querySelector(".add_btn");
const todosWrapper = document.querySelector(".todos");
const categorySaveButton = document.querySelector(".category_save_button");

const STORAGE_KEY_TODOS = "todos";

const getStoredTodos = () => JSON.parse(localStorage.getItem(STORAGE_KEY_TODOS));

let todos = getStoredTodos() ?? [];
let activeTodo = todos.find((i) => i.isActive);

const updateStoredTodos = () => localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));

// rendering categories and todos after the page is loaded
window.addEventListener("DOMContentLoaded", () => {
  updateCount();
  if (todos.length) {
    todosWrapper.style.display = "block";
  }

  todos.forEach((category) => {
    const li = document.createElement("li");
    li.onclick = () => handleCategorySelect(li);
    li.setAttribute("data-id", category.id);
    li.setAttribute("active", category.isActive);
    li.innerHTML = getCategoryNode(category.text);
    const categoryDeleteButton = li.querySelector(".category_delete_button");
    categoryDeleteButton.addEventListener("click", handleCategoryDelete);
    categoryList.appendChild(li);
  });

  if (activeTodo) {
    mainTitle.value = activeTodo.text;
    activeTodo?.items.forEach((todo) => {
      const li = document.createElement("li");
      li.setAttribute("class", "todo_item");
      li.setAttribute("data-id", todo.id);
      li.innerHTML = getTodoNode(todo.text);
      todoList.appendChild(li);
      if (todo.completed) {
        li.setAttribute("completed", true);
        li.querySelector("input[type=checkbox]").setAttribute("checked", true);
      }
    });
  }
});

// removing empty input error if input is not empty
mainInput.addEventListener("input", (e) => {
  if (e.target.value.trim().length) {
    todoErrorText.innerHTML = "";
  }
});
categoryInput.addEventListener("input", (e) => {
  if (e.target.value.trim().length) {
    const categoryErrorMsg = document.getElementById("category_error_msg");
    categoryErrorMsg.innerHTML = "";
  }
});

// categories logic
const handleCategoryAdd = () => {
  const value = categoryInput.value;
  if (!value.trim().length) {
    const categoryErrorMsg = document.getElementById("category_error_msg");
    categoryErrorMsg.innerHTML = "Please, enter some text";
    return;
  }

  const randomId = getRandomId();
  const li = document.createElement("li");
  li.onclick = () => handleCategorySelect(li);
  li.setAttribute("data-id", randomId);
  li.setAttribute("active", true);
  li.innerHTML = getCategoryNode(value.trim());
  const categoryDeleteButton = li.querySelector(".category_delete_button");
  categoryDeleteButton.addEventListener("click", handleCategoryDelete);
  const categoryNodes = categoryList.childNodes;
  categoryNodes.forEach((c) => {
    c.setAttribute("active", false);
  });
  categoryList.appendChild(li);
  mainTitle.value = value;
  todosWrapper.style.display = "block";
  categoryInput.value = "";
  todoList.innerHTML = "";

  activeTodo = { id: randomId, text: value.trim(), items: [], isActive: true };
  todos = [...todos.map((i) => ({ ...i, isActive: false })), activeTodo];
  updateStoredTodos();
  updateCount();
};

const handleCategoryDelete = (e) => {
  e.stopPropagation();
  const parentElement = e.target.parentElement;
  const id = parentElement.getAttribute("data-id");
  categoryList.removeChild(parentElement);
  todosWrapper.style.display = "none";

  todos = todos.filter((i) => i.id !== id);
  updateStoredTodos();
};

const handleCategorySelect = (e) => {
  const id = e.getAttribute("data-id");
  const categoryNodes = categoryList.childNodes;
  categoryNodes.forEach((c) => {
    c.setAttribute("active", c.getAttribute("data-id") === id);
  });
  todosWrapper.style.display = "block";
  mainTitle.value = e.querySelector("p").innerHTML;
  todoList.innerHTML = "";

  activeTodo = todos.find((i) => i.id === id);
  activeTodo?.items.forEach((todo) => {
    const li = document.createElement("li");
    li.setAttribute("class", "todo_item");
    li.setAttribute("data-id", todo.id);
    li.innerHTML = getTodoNode(todo.text);
    todoList.appendChild(li);
    if (todo.completed) {
      li.setAttribute("completed", true);
      li.querySelector("input[type=checkbox]").setAttribute("checked", true);
    }
  });
  todos = todos.map((i) => ({ ...i, isActive: i.id === id }));
  updateStoredTodos();
  updateCount();
};

const handleCategoryEdit = (e) => {
  categorySaveButton.removeAttribute("hidden");
  e.innerHTML = "Cancel";
  e.onclick = () => handleCategoryEditCancel(e);
  mainTitle.disabled = false;
  mainTitle.focus();
};

const handleCategoryEditCancel = (e) => {
  e.innerHTML = "Edit";
  categorySaveButton.hidden = true;
  mainTitle.disabled = true;
  mainTitle.value = activeTodo.text;
  e.onclick = () => handleCategoryEdit(e);
};

const handleCategorySave = (e) => {
  const categoryEditButton = document.querySelector(".category_edit_button");
  categoryEditButton.innerHTML = "Edit";
  categoryEditButton.onclick = () => handleCategoryEdit(categoryEditButton);
  e.hidden = true;
  mainTitle.disabled = true;
  const activeCategoryNode = categoryList.querySelector("li[active=true]");
  activeCategoryNode.innerHTML = mainTitle.value;

  todos = todos.map((i) => (i.id === activeTodo.id ? { ...i, text: mainTitle.value } : i));
  updateStoredTodos();
};

function getCategoryNode(text) {
  return `
    <p class="category_text">${text}</p>
    <button class="category_delete_button">Delete</button>
  `;
}

// to-do logic
const addTodo = () => {
  const inputValue = mainInput.value.trim();
  if (inputValue === "") {
    mainInput.focus();
    todoErrorText.innerHTML = "Please, enter some text";
    return;
  }
  const randomId = getRandomId();
  const li = document.createElement("li");
  li.setAttribute("class", "todo_item");
  li.setAttribute("data-id", randomId);
  li.innerHTML = getTodoNode(inputValue);
  todoList.appendChild(li);
  mainInput.value = "";
  const newTodo = { id: randomId, text: inputValue };
  // debugger;
  activeTodo.items.push(newTodo);
  todos = todos.map((i) => (i.id === activeTodo.id ? activeTodo : i));
  updateStoredTodos();
  updateCount();
};

const updateMainFn = (e) => {
  const parentElement = e.parentElement.parentElement;
  const parentId = parentElement.getAttribute("data-id");
  const addButtonImg = addButton.getElementsByTagName("img")[0];
  addButtonImg.setAttribute("src", "/assets/icons/edit.svg");
  const todo = activeTodo.items.find((i) => i.id === parentId);
  mainInput.value = todo.text;
  mainInput.focus();
  const todoNodes = todoList.childNodes;
  todoNodes.forEach((i) => {
    if (i.getAttribute("data-id") === parentId) {
      i.setAttribute("editing", true);
      i.querySelector(".actions .edit_btn").innerHTML = "Cancel";
      i.querySelector(".actions .edit_btn").setAttribute("onclick", "cancelEditing()");
    } else {
      i.removeAttribute("editing");
      i.querySelector(".actions .edit_btn").innerHTML = "Edit";
      i.querySelector(".actions .edit_btn").setAttribute("onclick", "updateMainFn(this)");
    }
  });
  addButton.onclick = () => editTodo();
};

const editTodo = () => {
  const editingNodeP = document.querySelector(".todo_item[editing] p");
  editingNodeP.innerHTML = mainInput.value;
  const editingNode = document.querySelector(".todo_item[editing]");
  const id = editingNode.getAttribute("data-id");
  // returning default main button styles and method
  const addButtonImg = addButton.getElementsByTagName("img")[0];
  addButtonImg.setAttribute("src", "/assets/icons/plus.svg");
  addButton.setAttribute("onclick", "addTodo()");

  todos = todos.map((i) =>
    i.id === activeTodo.id
      ? { ...i, items: activeTodo.items.map((j) => (j.id === id ? { ...j, text: mainInput.value } : j)) }
      : i
  );
  updateStoredTodos();
  cancelEditing();
  mainInput.value = "";
};

const handleCompleted = (e) => {
  const node = e.parentElement.parentElement;
  const nodeId = node.getAttribute("data-id");
  node.setAttribute("completed", e.checked);
  const isEditing = node.getAttribute("editing");
  if (isEditing) cancelEditing();
  activeTodo = {
    ...activeTodo,
    items: activeTodo.items.map((j) => (j.id === nodeId ? { ...j, completed: e.checked } : j)),
  };
  todos = todos.map((i) => (i.id === activeTodo.id ? activeTodo : i));
  updateStoredTodos();
  updateCount();
};

const deleteTodo = (e) => {
  const parentElement = e.parentElement.parentElement;
  const id = parentElement.getAttribute("data-id");
  const editingNode = document.querySelector(".todo_item[editing]");
  const editingNodeId = editingNode?.getAttribute("data-id");
  const todoNodes = [...todoList.getElementsByTagName("li")];
  if (todoNodes.some((i) => i.getAttribute("editing")) && editingNodeId === id) {
    cancelEditing();
  }
  todoList.removeChild(e.parentElement.parentElement);

  activeTodo = { ...activeTodo, items: activeTodo.items.filter((j) => j.id !== id) };
  todos = todos.map((i) => (i.id === activeTodo.id ? activeTodo : i));
  updateStoredTodos();
  updateCount();
};

function cancelEditing() {
  addButton.setAttribute("onclick", "addTodo()");
  const addButtonImg = addButton.getElementsByTagName("img")[0];
  addButtonImg.setAttribute("src", "/assets/icons/plus.svg");
  mainInput.value = "";
  const editingNode = document.querySelector("li[editing]");
  editingNode.removeAttribute("editing");
  editingNode.querySelector(".actions .edit_btn").innerHTML = "Edit";
  editingNode.querySelector(".actions .edit_btn").setAttribute("onclick", "updateMainFn(this)");
}

function getTodoNode(text) {
  return `
    <div style="display:flex">
      <input type="checkbox" onclick="handleCompleted(this)" />
      <p>${text}</p>
    </div>
    <div class="actions">
      <button onclick="updateMainFn(this)" class="edit_btn">Edit</button>
      <button onclick="deleteTodo(this)" class="delete_btn">Delete</button>
    </div>`;
}

function updateCount() {
  const countNode = document.querySelector(".count");
  countNode.innerHTML = `${activeTodo?.items?.filter((i) => i.completed)?.length ?? 0}/${
    activeTodo?.items?.length ?? 0
  }`;
}

function getRandomId() {
  return `${Math.round(Math.random() * 10 ** 12)}`;
}
