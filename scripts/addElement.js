const createInput = document.getElementById("create_input");
const editInput = document.getElementById("edit_input");
const emptyErrorText = document.getElementById("empty_error_msg");
const todoList = document.getElementById("todo_list");

const todos = [];

const addElement = () => {
  const inputValue = createInput.value.trim();
  if (inputValue === "") {
    createInput.focus();
    emptyErrorText.innerHTML = "Todo cannot be empty!";
  } else {
    const nodeStr = `<p>${inputValue}</p>
          <div>
            <button class="edit_btn">Edit</button>
            <button class="delete_btn">Delete</button>
        </div>`;
    const li = document.createElement("li");
    li.setAttribute("class", "todo_item");
    li.innerHTML = nodeStr;
    todos.push({ id: `${todos.length}`, text: inputValue });
    todoList.appendChild(li);
    createInput.value = "";
  }
};
