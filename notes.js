/* Depends on KaTeX */

// Client ID and API key from the Developer Console
let CLIENT_ID = '146075693051-k890p7lhoh0gc19aukn9errckjarapkh.apps.googleusercontent.com';
let API_KEY = 'AIzaSyAQV5RVTyHO0UJ1vWXqwaVuwe9c7vYMSsg';

// Array of API discovery doc URLs for APIs used by the quickstart
let DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
let SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let authorizeButton;
let signoutButton;

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  authorizeButton = document.getElementById('authorize_button');
  signoutButton = document.getElementById('signout_button');
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';

    // Defined in javascript on various pages
    google_sheets_initial_call();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  // let pre = document.getElementById('content');
  // let textContent = document.createTextNode(message + '\n');
  // pre.appendChild(textContent);
  console.log(message);
}

function make_sortable(el, my_handle) {
  Sortable.create(el, {
    group: "localStorage-example",
    store: {
      /**
       * Get the order of elements. Called once during initialization.
       * @param   {Sortable}  sortable
       * @returns {Array}
       */
      get: function (sortable) {
        var order = localStorage.getItem(sortable.options.group.name);
        return order ? order.split("|") : [];
      },

      /**
       * Save the order of elements. Called onEnd (when the item is dropped).
       * @param {Sortable}  sortable
       */
      set: function (sortable) {
        var order = sortable.toArray();
        localStorage.setItem(sortable.options.group.name, order.join("|"));
      }
    },
    handle: my_handle
  });
}

let note_sheet_id = '1iBMVMUCkargJfssoeFJf-LmugebBcOtOOvXS4TDQGoY';
let todo_sheet_id = '1iBMVMUCkargJfssoeFJf-LmugebBcOtOOvXS4TDQGoY';
let note_sheet_name = "Notes";
let todo_sheet_name = "TODO";
let note_sheet_range = note_sheet_name + '!A2:C';
let todo_sheet_range = todo_sheet_name + '!A2:C';

function display_note(row, note_text) {
  // <li class="post note_post draggable_post">
  //  <div class="note_handle"> </div>
  //  <div class="note_content">
  //    An integral: $\int_0^1 x\;dx$
  //  </div>
  //  <div class="note_button">Edit</div>
  // </li>

  let li = document.createElement("li");
  li.className = "post draggable_post";

  let handle = document.createElement("div");
  handle.className = "note_handle";

  let text = document.createElement("div");
  text.className = "note_content";
  text.innerHTML = note_text;

  let button = document.createElement("button");
  button.className = "button";
  button.innerHTML = "Edit";
  button.addEventListener("click", function() {
    window.location = "edit_note.html?row=" + row;
  });

  document.getElementById("note_list").appendChild(li);
  li.appendChild(handle);
  li.appendChild(text);
  li.appendChild(button);
}

function display_todo(row, date, task) {
  let li = document.createElement("li");
  li.className = "post draggable_post";

  let handle = document.createElement("div");
  handle.className = "todo_handle";

  let text = document.createElement("div");
  text.className = "todo_content";
  text.innerHTML = task;

  let button = document.createElement("button");
  button.className = "button";
  button.innerHTML = "Edit";
  button.addEventListener("click", function() {
    window.location = "edit_todo.html?row=" + row;
  });

  let checkbox = document.createElement("div");
  checkbox.className = "todo_checkbox";
  let label = document.createElement("label");
  checkbox.appendChild(label);
  checkbox.addEventListener("click", function() {
    update_todo(row, task, "Yes");
    document.getElementById("todo_list").removeChild(li);
  });

  document.getElementById("todo_list").appendChild(li);
  li.appendChild(handle);
  li.appendChild(text);
  text.appendChild(checkbox);
  li.appendChild(button);
}

function get_google_sheet(sheet_id, sheet_range, row_handler, final_fn) {

  let response_handler = function(response) {
    let range = response.result;
    for (let i = 0; i < range.values.length; i++) {
      row_handler(i+2, range.values[i]);
    }
    final_fn();
  };

  let error_handler = function(response) {
    appendPre('Error: ' + response.result.error.message);
  };

  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: sheet_id,
    range: sheet_range,
  }).then(response_handler, error_handler);
}

function load_notes() {
  let row_handler = function(row_index, row_contents) {
    if (row_contents[1] != "Yes") {
      display_note(row_index, row_contents[2]);
    }
  };

  let final_fn = function() {
      renderMathInElement(document.getElementById("note_list"), katex_options);
      make_sortable(document.getElementById("note_list"), "note_handle");
      /* Fades list in. List must start invisible */
      document.getElementById("note_list").style.opacity = 1.0;
      document.getElementById("note_list").style.display = "block";
      document.getElementById("note_spinner").style.display = "none";
  };

  get_google_sheet(note_sheet_id, note_sheet_range, row_handler, final_fn);
}

function load_todos() {
  let row_handler = function(row_index, row_contents) {
    if (row_contents[1] != "Yes") {
      display_todo(row_index, row_contents[0], row_contents[2]);
    }
  };

  let final_fn = function() {
    renderMathInElement(document.getElementById("todo_list"), katex_options);
    make_sortable(document.getElementById("todo_list"), "todo_handle");
    /* Fades list in. List must start invisible */
    document.getElementById("todo_list").style.opacity = 1.0;
    document.getElementById("todo_list").style.display = "block";
    document.getElementById("todo_spinner").style.display = "none";
  };

  get_google_sheet(todo_sheet_id, todo_sheet_range, row_handler, final_fn);
}

function load_sheet_data() {
  load_notes();
  load_todos();
}

function generate_query_string(obj) {
  let query_string = "";
  for (let property in obj) {
    query_string = query_string.concat("&" + property
              + "=" + encodeURIComponent(obj[property]));
  }
  return query_string.substring(1);
}

function insert_new_row(sheet_id, sheet_range, values) {
  let params = {
    spreadsheetId: sheet_id,
    range: sheet_range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS"
  };

  let date = new Date().toJSON().slice(0,10).replace(/-/g, '/');
  console.log(date);

  let value_range_body = {
    majorDimension: "ROWS",
    values: [[date].concat(values)]
  };

  gapi.client.sheets.spreadsheets.values.append(params, value_range_body).then(
    function(response) {},
    function(response) {
        appendPre('Error: ' + response.result.error.message);
  });

}

function create_new_note(my_text) {
  insert_new_row(note_sheet_id, note_sheet_range, ["No", my_text]);
}

function create_new_todo(my_text) {
  insert_new_row(todo_sheet_id, todo_sheet_range, ["No", my_text]);
}

function update_sheet(sheet_id, sheet_name, row, values) {
  let last_col = String.fromCharCode(64 + values.length + 1);
    // 65 is the ASCII code for 'A'
    // + 1 because we don't include the date in the 'values' list
  let my_range = sheet_name + "!A" + row + ":" + last_col + row;
  let params = {
    spreadsheetId: sheet_id,
    range: my_range,
    valueInputOption: "USER_ENTERED"
  };

  let date = new Date().toJSON().slice(0,10).replace(/-/g, '/');
  console.log(date);

  let value_range_body = {
    range: my_range,
    majorDimension: "ROWS",
    values: [[date].concat(values)]
  };

  gapi.client.sheets.spreadsheets.values.update(params, value_range_body).then(
    function(response) {},
    function(response) {
        appendPre('Error: ' + response.result.error.message);
  });
}

function update_note(row, my_text, deleted) {
  update_sheet(note_sheet_id, note_sheet_name, row, [deleted, my_text]);
}

function update_todo(row, my_text, is_done) {
  update_sheet(todo_sheet_id, todo_sheet_name, row, [is_done, my_text]);
}

function parse_query_string() {
  let query_string = window.location.search.substring(1);
    let query = {};
    let assignments = query_string.split('&');
    for (let i = 0; i < assignments.length; i++) {
        let assignment = assignments[i].split('=');
        query[decodeURIComponent(assignment[0])] = decodeURIComponent(assignment[1] || '');
    }
    return query;
}

function load_editing_todo() {
  let vars = parse_query_string();
  let row_handler = function(row_index, row_contents) {
    if (row_index == vars.row) {
      document.getElementById("text").value = row_contents[2];
      preview_todo();
    }
  };
  let final_fn = function() {};

  get_google_sheet(todo_sheet_id, todo_sheet_range, row_handler, final_fn);
}

function load_editing_note() {
  let vars = parse_query_string();
  let row_handler = function(row_index, row_contents) {
    if (row_index == vars.row) {
      document.getElementById("text").value = row_contents[2];
      preview_note();
    }
  };
  let final_fn = function() {};

  get_google_sheet(note_sheet_id, note_sheet_range, row_handler, final_fn);
}

function delete_note() {
  let vars = parse_query_string();
  let text = document.getElementById("text").value;
  update_note(vars.row, text, "Yes");
}

function delete_todo() {
  let vars = parse_query_string();
  let text = document.getElementById("text").value;
  update_todo(vars.row, text, "Yes");
}

function save_note() {
  let vars = parse_query_string();
  console.log(vars);
  let text = document.getElementById("text").value;
  if ('row' in vars) {
    update_note(vars.row, text, "No");
  } else {
    create_new_note(text);
  }
  preview_note();
}

function save_todo() {
  let vars = parse_query_string();
  let text = document.getElementById("text").value;
  if ('row' in vars) {
    update_todo(vars.row, text, "No");
  } else {
    create_new_todo(text);
  }
  preview_todo();
}

function preview_note() {
  let text = document.getElementById("text").value;
  document.getElementById("preview").innerHTML = text;
  renderMathInElement(document.getElementById("note_list"), katex_options);
}

function preview_todo() {
  let text = document.getElementById("text").value;
  document.getElementById("preview").innerHTML = text;
  renderMathInElement(document.getElementById("todo_list"), katex_options);
}
