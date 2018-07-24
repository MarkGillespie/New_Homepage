/* Depends on KaTeX */

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

function display_note(note) {
	// <li class="post note_post draggable_post">
	// 	<div class="note_handle"> </div>
	// 	<div class="note_content">
	// 		An integral: $\int_0^1 x\;dx$
	// 	</div>
	// 	<div class="note_button">Edit</div>
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

function display_todo(todo) {
	if (todo.done == 0) {
		let li = document.createElement("li");
		li.className = "post draggable_post";

		let handle = document.createElement("div");
		handle.className = "todo_handle";

		let text = document.createElement("div");
		text.className = "todo_content";
		text.innerHTML = todo.text;

		let button = document.createElement("button");
		button.className = "button";
		button.innerHTML = "Edit";
		button.addEventListener("click", function() {
			window.location = "edit_todo.html?id=" + todo.id;
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
	load_data("todo_list", "todo_list", ".todo_handle", display_todo);
}

function load_from_server() {
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


/* Depends on notes.js */

function time_ago(utc /* time in milliseconds */){
	let now = new Date();
	let then = new Date(utc);

	let elapsed_minutes = (now - then) / 6e4;

	let time_num, time_word;

	if (elapsed_minutes < 60) {
		time_num = Math.floor(elapsed_minutes);
		time_word = "minute";
	} else if (elapsed_minutes < 60 * 24) {
		time_num = Math.floor(elapsed_minutes / 60);
		time_word = "hour";
	} else if (elapsed_minutes < 60 * 24 * 7) {
		time_num = Math.floor(elapsed_minutes / (60 * 24));
		time_word = "day";
	} else {
		/* For months and years, I don't want to be as precise, so 
		 * I just subtract the current one from the past one to get the
		 * time elapsed */
		let months = now.getMonth() - then.getMonth();
		let years = now.getYear() - then.getYear();
		if (years < 1) {
			time_num = months;
			time_word = "month";
		} else {
			time_num = years;
			time_word = "year";
		}
	}

	if (time_num > 1) {
		time_word += "s";
	}

	return time_num + " " + time_word + " ago";
}

//**************************************************************************************
//
// HACKERNEWS
//
//**************************************************************************************

 // "by" : "dhouston",
 //  "descendants" : 71,
 //  "id" : 8863,
 //  "kids" : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],
 //  "score" : 111,
 //  "time" : 1175714200,
 //  "title" : "My YC app: Dropbox - Throw away your USB drive",
 //  "type" : "story",
 //  "url" : "http://www.getdropbox.com/u/2/screencast.html"

function display_hn_post(post) {
	let wrapper = document.createElement("div");
	wrapper.className = "post hackernews_post";

	let title = document.createElement("div");
	title.innerHTML = post.title;
	title.className = "title";

	let post_link = document.createElement("a");
	post_link.href = post.url;
	post_link.className = "no_underline";

	let details = document.createElement("div");
	let when = time_ago(post.time * 1000);
	// details.innerHTML = post.score + " points by " + post.by + " " + hours + " hours ago | " + post.descendants + " comments";
	details.innerHTML = "posted " + when +" | " + post.descendants + " comments";
	details.className = "details";

	let comment_link = document.createElement("a");
	comment_link.href = "https://news.ycombinator.com/item?id=" + post.id;
	comment_link.className = "no_underline";

	document.getElementById("hackernews_posts").appendChild(wrapper);
	wrapper.appendChild(post_link);
	wrapper.appendChild(comment_link);
	post_link.appendChild(title);
	comment_link.appendChild(details);
}

function load_and_display_hn_post(post_index) {
	let post_url = "https://hacker-news.firebaseio.com/v0/item/" + post_index + ".json";
	let disp = function(err, post) {
		if (err !== null) {
			alert('Something went wrong: ' + err);
		} else {
			display_hn_post(post);
		}
	}
	getJSON(post_url, {callback:disp});
}

function load_hackernews(n_posts) {
	let process_posts = function(err, posts) {
		if (err !== null) {
			alert('Something went wrong: ' + err);
		} else {
			for (let post in posts.slice(0, n_posts)) {
				load_and_display_hn_post(posts[post]);
			}
			document.getElementById("hackernews_posts").style.opacity = 1.0;
		}
	}

	// https://github.com/HackerNews/API
	getJSON("https://hacker-news.firebaseio.com/v0/topstories.json", {callback:process_posts});
}

//**************************************************************************************
//
// Reddit
//
//**************************************************************************************

function display_reddit_post(post, subreddit) {
	let wrapper = document.createElement("div");
	wrapper.className = "post reddit_post";

	let title = document.createElement("div");
	title.innerHTML = post.title;
	title.className = "title";

	let post_link = document.createElement("a");
	post_link.href = post.url;
	post_link.className = "no_underline";

	let details = document.createElement("div");
	let when = time_ago(post.created_utc * 1000);
	details.innerHTML = "submitted " + when + " | " + post.num_comments + " comments";
	details.className = "details";

	let comment_link = document.createElement("a");
	comment_link.href = post.permalink;
	comment_link.className = "no_underline";

	document.getElementById(subreddit + "_posts").appendChild(wrapper);
	wrapper.appendChild(post_link);
	wrapper.appendChild(comment_link);
	post_link.appendChild(title);
	comment_link.appendChild(details);
}

function load_subreddit(subreddit, n_posts){
	let process_posts = function(err, posts) {
		if (err !== null) {
			alert('Something went wrong: ' + err);
		} else {
			for (let post in posts.data.children) {
				display_reddit_post(posts.data.children[post].data, subreddit);
			}
			document.getElementById(subreddit + "_posts").style.opacity = 1.0;
		}
	}

	getJSON("http://www.reddit.com/r/" + subreddit + "/.json?limit=" + n_posts, {callback:process_posts});
}

function load_posts() {
	load_hackernews(10);
	load_subreddit("AskReddit", 10);
}

function getBackground(){
	let background_data = g_backgrounds[Math.floor(Math.random() * g_backgrounds.length)];
	let background = "url(\"" +background_data["url"] +"\")";

	let downloadingImage = new Image();
	downloadingImage.src = background_data["url"];

	downloadingImage.onload = function(){
		document.body.style.backgroundImage = background;
		let overlay = document.getElementById("overlay");
		overlay.style.opacity = 0;
	};
}