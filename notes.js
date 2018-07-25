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
    load_todos();
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

/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
function listMajors() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1iBMVMUCkargJfssoeFJf-LmugebBcOtOOvXS4TDQGoY',
    range: 'TODO!A2:C',
  }).then(function(response) {
    let range = response.result;
    if (range.values.length > 0) {
      for (i = 0; i < range.values.length; i++) {
        let row = range.values[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        appendPre(row[0] + ', ' + row[2]);
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}


// https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
function getJSON(url, options) {
  let message = "";
  let callback = function(status, response) {};
  if ('message' in options) {
    message = options.message;
  }
  if ('callback' in options) {
    callback = options.callback;
  }

  let xhr = new XMLHttpRequest();
  xhr.open('GET', url + "?" + message, true);
  xhr.responseType = 'json';
  xhr.onload = function() {
    let status = xhr.status;
    if (status === 200) {
      callback(null, xhr.response);
    } else {
      callback(status, xhr.response);
    }
  };
  xhr.send();
}

function sendPOST(url, options) {
  let message = "";
  let callback = function(status, response) {};
  if ('message' in options) {
    message = options.message;
  }
  if ('callback' in options) {
    callback = options.callback;
  }

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.status === 200 && this.readyState == XMLHttpRequest.DONE) {
      callback(null, xhr.response);
    } else {
      callback(xhr.status, xhr.response);
    }
  };
  xhr.send(message);
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

let todo_sheet_id = '1iBMVMUCkargJfssoeFJf-LmugebBcOtOOvXS4TDQGoY';
let todo_sheet_range = 'TODO!A2:D';

function display_note(note) {
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
  text.innerHTML = note.text;

  let button = document.createElement("button");
  button.className = "button";
  button.innerHTML = "Edit";
  button.addEventListener("click", function() {
    window.location = "edit_note.html?id=" + note.id;
  });

  document.getElementById("note_list").appendChild(li);
  li.appendChild(handle);
  li.appendChild(text);
  li.appendChild(button);
}

function display_todo(id, date, task) {
  if (todo.done == 0) {
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
      window.location = "edit_todo.html?id=" + id;
    });

    let checkbox = document.createElement("div");
    checkbox.className = "todo_checkbox";
    let label = document.createElement("label");
    checkbox.appendChild(label);
    checkbox.addEventListener("click", function() {
      add_todo(todo.text, todo.id, "TRUE");
      document.getElementById("todo_list").removeChild(li);
    });

    document.getElementById("todo_list").appendChild(li);
    li.appendChild(handle);
    li.appendChild(text);
    text.appendChild(checkbox);
    li.appendChild(button);
  }
}

function load_data(table_name, div_name, handle_name, display) {
  let process_notes = function(err, notes) {
    if (err !== null) {
      alert("Something went wrong: " + err);
    } else {
      for (let note in notes) {
        display(notes[note]);
      }
      renderMathInElement(document.getElementById(div_name), katex_options);

      make_sortable(document.getElementById(div_name), handle_name);

      /* list must start invisible */
      document.getElementById(div_name).style.opacity = 1.0;
    }
  };

  getJSON("get_notes.php", {
    callback:process_notes,
    message:generate_query_string({table:table_name})
  });
}

/* Sortable needs to run after page load for some reason.
 * So I call load_notes in the html page. */
function load_notes() {
  load_data("notes_list", "note_list", ".note_handle", display_note);
}

function load_todos() {
  console.log('loading_todos');
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: todo_sheet_id,
    range: todo_sheet_range,
  }).then(function(response) {
    let range = response.result;
    if (range.values.length > 0) {
      for (i = 0; i < range.values.length; i++) {
        let row = range.values[i];
        if(row[2] != "Yes") {
          display_todo(row[0], row[1], row[3]);
        }
      }
    } else {
      appendPre('No data found.');
    }
  }, function(response) {
    appendPre('Error: ' + response.result.error.message);
  });
}

function load_from_server() {
    console.log('loading_from_server');
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

function add_data(query) {
  console.log(query);
  sendPOST("add_note.php", {message:generate_query_string(query)});
}

function add_todo(my_text, my_id, is_done) {
  my_id = my_id || -1;
  is_done = is_done || "FALSE";
  add_data({table:"todo_list", text:my_text, id:my_id, done:is_done});
}

function add_note(my_text, my_id) {
  my_id = my_id || -1;
  add_data({table:"notes_list", text:my_text, id:my_id});
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

function load_editing_data(table_name, preview) {
  let vars = parse_query_string();
  if ('id' in vars) {
    let process_notes = function(err, notes) {
      if (err !== null) {
        alert("Something went wrong: " + err);
      } else {
        for (let note in notes) {
          if (notes[note].id == vars.id) {
            document.getElementById("text").value = notes[note].text;
            preview();
          }
        }
      }
    }

    getJSON("get_notes.php", {
      callback:process_notes,
      message: generate_query_string({table:table_name})
    });
  }
}

function load_editing_note() {
  load_editing_data("notes_list", preview_note);
}

function load_editing_todo() {
  load_editing_data("todo_list", preview_todo);
}

function delete_data(table_name) {
  let vars = parse_query_string();
  if ('id' in vars) {
    let query = {table:table_name, id: vars.id, delete: "true"};
    sendPOST("add_note.php", {message:generate_query_string(query)});
  }
  window.location = "index.html";
}

function delete_note() {
  delete_data("notes_list");
}

function save_note() {
  let vars = parse_query_string();
  let text = document.getElementById("text").value;
  if ('id' in vars) {
    add_note(text, vars.id);
  } else {
    add_note(text);
  }
  preview_note();
}

function save_todo() {
  let vars = parse_query_string();
  let text = document.getElementById("text").value;
  if ('id' in vars) {
    add_todo(text, vars.id);
  } else {
    add_todo(text);
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
